import type { D1Database } from '@cloudflare/workers-types';
import { analyzeJobWithAI, saveJobToDb, isJobAlreadyScraped, cleanHtml } from './scraper';

/**
 * Scrapes job postings from the public Telegram channel preview https://t.me/s/jobsintr
 */
export async function runTelegramScraper(
  env: { DB: D1Database; AI: any; MEDIA_BUCKET?: any; GEMINI_API_KEY?: string },
  limit: number = 5
): Promise<{ scraped: number; processed: number; errors: number; details: string[] }> {
  const details: string[] = [];
  let scrapedCount = 0;
  let errorCount = 0;
  let processedCount = 0;

  try {
    details.push('Starting Telegram scraper for t.me/s/jobsintr...');
    const url = 'https://t.me/s/jobsintr';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3'
    };

    const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      throw new Error(`Telegram request failed with status: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse posts from HTML
    // tgme_widget_message js-widget_message with data-post="jobsintr/(\d+)"
    const messageRegex = /<div class="tgme_widget_message[^>]+data-post="jobsintr\/(\d+)"[\s\S]*?<div class="tgme_widget_message_text[^>]+>([\s\S]*?)<\/div>/g;
    
    const candidates: { postId: string; text: string; rawHtmlMessage: string }[] = [];
    let match;
    while ((match = messageRegex.exec(html)) !== null) {
      candidates.push({
        postId: match[1],
        text: match[2],
        rawHtmlMessage: match[0]
      });
    }

    details.push(`Parsed ${candidates.length} posts from Telegram HTML.`);

    if (candidates.length === 0) {
      details.push('No messages found in the Telegram preview HTML.');
      return { scraped: 0, processed: 0, errors: 0, details };
    }

    // Process the latest 'limit' messages
    const targetCandidates = candidates.slice(-limit);
    details.push(`Processing up to ${targetCandidates.length} target candidates...`);

    for (const item of targetCandidates) {
      const telegramPostUrl = `https://t.me/jobsintr/${item.postId}`;
      processedCount++;

      try {
        // 1. Check if the Telegram post itself is already scraped in D1
        const isTelegramScraped = await isJobAlreadyScraped(env.DB, telegramPostUrl);
        
        // 2. Check if already processed as an embedded link in the past (using special document type placeholder)
        const isPostProcessedBefore = await env.DB.prepare(
          `SELECT id FROM documents WHERE type_id = 'scraped_telegram_posts' AND id = ?`
        ).bind(`tg-${item.postId}`).first();

        if (isTelegramScraped || isPostProcessedBefore) {
          details.push(`[SKIP] Telegram post ${item.postId} already scraped or processed before.`);
          continue;
        }

        // 3. Check if there is a jobsintr.net link in the message text
        // e.g. href="https://jobsintr.net/jobs/some-slug" or href="https://jobsintr.net/job/some-slug"
        const linkRegex = /href=["'](https:\/\/jobsintr\.net\/jobs\/[a-zA-Z0-9_-]+(?:\/)?|https:\/\/jobsintr\.net\/job\/[a-zA-Z0-9_-]+(?:\/)?)/i;
        const linkMatch = item.rawHtmlMessage.match(linkRegex);

        if (linkMatch) {
          let websiteJobUrl = linkMatch[1];
          // Normalize trailing slash
          if (websiteJobUrl.endsWith('/')) {
            websiteJobUrl = websiteJobUrl.slice(0, -1);
          }

          // Check if this website job URL is already scraped
          const isWebsiteJobScraped = await isJobAlreadyScraped(env.DB, websiteJobUrl);
          if (isWebsiteJobScraped) {
            details.push(`[SKIP] Embedded website job URL already scraped: ${websiteJobUrl}`);
            
            // Mark the Telegram post as processed so we don't fetch its website URL again
            await env.DB.prepare(
              `INSERT INTO documents (id, root_id, type_id, status, is_published, slug, title, data, created_at, updated_at)
               VALUES (?, ?, 'scraped_telegram_posts', 'published', 1, ?, ?, ?, ?, ?)`
            ).bind(
              `tg-${item.postId}`,
              `tg-${item.postId}`,
              `tg-${item.postId}`,
              `Telegram Post ${item.postId}`,
              JSON.stringify({ telegramPostUrl, websiteJobUrl }),
              Date.now(),
              Date.now()
            ).run().catch(() => {});
            
            continue;
          }

          // Fetch and parse the website job
          details.push(`[FETCH WEBSITE] Fetching details from website link: ${websiteJobUrl}`);
          const webRes = await fetch(websiteJobUrl, { headers, signal: AbortSignal.timeout(10000) });
          if (!webRes.ok) {
            throw new Error(`Failed to fetch website job page: ${webRes.status}`);
          }
          const webHtml = await webRes.text();
          const cleanedWebText = cleanHtml(webHtml);

          if (cleanedWebText.length < 150) {
            throw new Error('Website job page content too short or blocked.');
          }

          details.push(`[AI] Parsing website job: ${websiteJobUrl}`);
          const jobJson = await analyzeJobWithAI(env.AI, cleanedWebText);

          // Save the job using website job URL as sourceUrl
          const jobId = await saveJobToDb(
            env.DB,
            { bucket: env.MEDIA_BUCKET, geminiApiKey: env.GEMINI_API_KEY },
            jobJson,
            websiteJobUrl
          );

          // Mark Telegram post as processed
          await env.DB.prepare(
            `INSERT INTO documents (id, root_id, type_id, status, is_published, slug, title, data, created_at, updated_at)
             VALUES (?, ?, 'scraped_telegram_posts', 'published', 1, ?, ?, ?, ?, ?)`
          ).bind(
            `tg-${item.postId}`,
            `tg-${item.postId}`,
            `tg-${item.postId}`,
            `Telegram Post ${item.postId}`,
            JSON.stringify({ telegramPostUrl, websiteJobUrl, jobId }),
            Date.now(),
            Date.now()
          ).run().catch(() => {});

          details.push(`[SUCCESS] Saved job ID ${jobId} from website link.`);
          scrapedCount++;
        } else {
          // Standalone Telegram post (does not link to jobsintr.net)
          // Clean HTML tags from the Telegram post text
          let cleanMessageText = item.text
            .replace(/<br\s*\/?>/gi, '\n') // Keep line breaks
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (cleanMessageText.length < 100) {
            details.push(`[SKIP] Standalone Telegram post text too short (${cleanMessageText.length} chars): ${telegramPostUrl}`);
            continue;
          }

          details.push(`[AI] Parsing standalone Telegram post: ${telegramPostUrl}`);
          const jobJson = await analyzeJobWithAI(env.AI, cleanMessageText);

          // Save using Telegram post URL as sourceUrl
          const jobId = await saveJobToDb(
            env.DB,
            { bucket: env.MEDIA_BUCKET, geminiApiKey: env.GEMINI_API_KEY },
            jobJson,
            telegramPostUrl
          );

          details.push(`[SUCCESS] Saved job ID ${jobId} from standalone Telegram post.`);
          scrapedCount++;
        }

      } catch (err: any) {
        console.error(`Error processing Telegram post ${item.postId}:`, err);
        details.push(`[ERROR] Failed processing post ${item.postId}: ${err.message}`);
        errorCount++;
      }
    }

  } catch (err: any) {
    console.error('Fatal error in runTelegramScraper:', err);
    details.push(`[FATAL] Telegram scraper crashed: ${err.message}`);
  }

  return {
    scraped: scrapedCount,
    processed: processedCount,
    errors: errorCount,
    details
  };
}
