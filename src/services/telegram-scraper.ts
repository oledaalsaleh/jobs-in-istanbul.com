import type { D1Database } from '@cloudflare/workers-types';
import { analyzeJobUnified, saveJobToDb, cleanHtml } from './scraper';
import { sendTelegramAlert } from './telegram';
import { sendFcmJobNotification } from './fcm';

/**
 * Scrapes job postings from the public Telegram channel preview https://t.me/s/jobsintr
 */
export async function runTelegramScraper(
  env: { 
    DB: D1Database; 
    AI: any; 
    CACHE_KV?: any;
    MEDIA_BUCKET?: any; 
    GEMINI_API_KEY?: string;
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_CHANNEL_ID?: string;
  },
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

    // 1. Fetch all existing job sourceUrls (check CACHE_KV first)
    let scrapedUrls = new Set<string>();
    let processedTgIds = new Set<string>();

    if (env.CACHE_KV) {
      try {
        const cachedUrls = await env.CACHE_KV.get('kv_scraped_urls', 'json');
        if (Array.isArray(cachedUrls) && cachedUrls.length > 0) {
          scrapedUrls = new Set(cachedUrls);
        }
        const cachedTgIds = await env.CACHE_KV.get('kv_processed_tg_ids', 'json');
        if (Array.isArray(cachedTgIds) && cachedTgIds.length > 0) {
          processedTgIds = new Set(cachedTgIds);
        }
      } catch (kvErr) {
        console.warn('[TG SCRAPER] KV cache read error:', kvErr);
      }
    }

    if (scrapedUrls.size === 0 && env.DB) {
      try {
        const scrapedJobsResult = await env.DB.prepare(
          `SELECT json_extract(data, '$.sourceUrl') as sourceUrl FROM documents WHERE type_id = 'jobs'`
        ).all();
        scrapedUrls = new Set((scrapedJobsResult.results || []).map((r: any) => r.sourceUrl).filter(Boolean));
        if (env.CACHE_KV && scrapedUrls.size > 0) {
          await env.CACHE_KV.put('kv_scraped_urls', JSON.stringify([...scrapedUrls]), { expirationTtl: 86400 }).catch(() => {});
        }
      } catch (d1Err: any) {
        console.warn('[TG SCRAPER] D1 query warning for jobs:', d1Err.message);
      }
    }

    if (processedTgIds.size === 0 && env.DB) {
      try {
        const processedTgResult = await env.DB.prepare(
          `SELECT id FROM documents WHERE type_id = 'scraped_telegram_posts'`
        ).all();
        processedTgIds = new Set((processedTgResult.results || []).map((r: any) => r.id));
        if (env.CACHE_KV && processedTgIds.size > 0) {
          await env.CACHE_KV.put('kv_processed_tg_ids', JSON.stringify([...processedTgIds]), { expirationTtl: 86400 }).catch(() => {});
        }
      } catch (d1Err: any) {
        console.warn('[TG SCRAPER] D1 query warning for processed tg posts:', d1Err.message);
      }
    }

    // 3. Filter candidates in-memory first
    const unscrapedCandidates = candidates.filter(item => {
      const telegramPostUrl = `https://t.me/jobsintr/${item.postId}`;
      const tgId = `tg-${item.postId}`;

      if (scrapedUrls.has(telegramPostUrl) || processedTgIds.has(tgId)) {
        return false;
      }

      // Check embedded link
      const linkRegex = /href=["'](https:\/\/jobsintr\.net\/jobs\/[a-zA-Z0-9_-]+(?:\/)?|https:\/\/jobsintr\.net\/job\/[a-zA-Z0-9_-]+(?:\/)?)/i;
      const linkMatch = item.rawHtmlMessage.match(linkRegex);
      if (linkMatch) {
        let websiteJobUrl = linkMatch[1];
        if (websiteJobUrl.endsWith('/')) {
          websiteJobUrl = websiteJobUrl.slice(0, -1);
        }
        if (scrapedUrls.has(websiteJobUrl)) {
          return false;
        }
      }

      return true;
    });

    details.push(`Filtered out ${candidates.length - unscrapedCandidates.length} already processed/scraped Telegram posts. ${unscrapedCandidates.length} unscraped remain.`);

    // Process the latest 'limit' messages
    const targetCandidates = unscrapedCandidates.slice(-limit);
    details.push(`Processing up to ${targetCandidates.length} target candidates...`);

    for (const item of targetCandidates) {
      const telegramPostUrl = `https://t.me/jobsintr/${item.postId}`;
      processedCount++;

      try {
        const linkRegex = /href=["'](https:\/\/jobsintr\.net\/jobs\/[a-zA-Z0-9_-]+(?:\/)?|https:\/\/jobsintr\.net\/job\/[a-zA-Z0-9_-]+(?:\/)?)/i;
        const linkMatch = item.rawHtmlMessage.match(linkRegex);

        if (linkMatch) {
          let websiteJobUrl = linkMatch[1];
          // Normalize trailing slash
          if (websiteJobUrl.endsWith('/')) {
            websiteJobUrl = websiteJobUrl.slice(0, -1);
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

          details.push(`[AI] Parsing website job with AI: ${websiteJobUrl}`);
          const jobJson = await analyzeJobUnified(env, cleanedWebText);

          // Save the job using website job URL as sourceUrl
          const { jobId, slug } = await saveJobToDb(
            env.DB,
            { bucket: env.MEDIA_BUCKET, geminiApiKey: env.GEMINI_API_KEY },
            jobJson,
            websiteJobUrl
          );

          // Auto-publish to Telegram if configured
          if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHANNEL_ID) {
            try {
              console.log(`[TELEGRAM] Publishing scraped website job to Telegram channel: ${env.TELEGRAM_CHANNEL_ID}`);
              await sendTelegramAlert(
                env,
                jobJson.title_ar || jobJson.title_en,
                jobJson.company_name,
                jobJson.location_ar || jobJson.location_en,
                slug
              );
              details.push(`[TELEGRAM] Successfully published job "${jobJson.title_en}" to Telegram.`);
            } catch (tgErr: any) {
              console.error('[TELEGRAM ERROR] Failed to send Telegram alert for scraped website job:', tgErr);
              details.push(`[TELEGRAM ERROR] Failed to publish "${jobJson.title_en}" to Telegram: ${tgErr.message}`);
            }
          }

          // Push Notification to Android App via FCM
          try {
            await sendFcmJobNotification(env, {
              id: jobId,
              title: jobJson.title_ar || jobJson.title_en || 'وظيفة شاغرة جديدة في إسطنبول',
              companyName: jobJson.company_name,
              location: jobJson.location_ar || jobJson.location_en,
              slug
            });
          } catch (fcmErr) {
            console.warn('[FCM PUSH ERROR]', fcmErr);
          }

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

          // Keep CACHE_KV updated
          scrapedUrls.add(websiteJobUrl);
          processedTgIds.add(`tg-${item.postId}`);
          if (env.CACHE_KV) {
            env.CACHE_KV.put('kv_scraped_urls', JSON.stringify([...scrapedUrls]), { expirationTtl: 86400 }).catch(() => {});
            env.CACHE_KV.put('kv_processed_tg_ids', JSON.stringify([...processedTgIds]), { expirationTtl: 86400 }).catch(() => {});
          }
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

          details.push(`[AI] Parsing standalone Telegram post with AI: ${telegramPostUrl}`);
          const jobJson = await analyzeJobUnified(env, cleanMessageText);

          // Save using Telegram post URL as sourceUrl
          const { jobId, slug } = await saveJobToDb(
            env.DB,
            { bucket: env.MEDIA_BUCKET, geminiApiKey: env.GEMINI_API_KEY },
            jobJson,
            telegramPostUrl
          );

          // Auto-publish to Telegram if configured
          if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHANNEL_ID) {
            try {
              console.log(`[TELEGRAM] Publishing scraped standalone job to Telegram channel: ${env.TELEGRAM_CHANNEL_ID}`);
              await sendTelegramAlert(
                env,
                jobJson.title_ar || jobJson.title_en,
                jobJson.company_name,
                jobJson.location_ar || jobJson.location_en,
                slug
              );
              details.push(`[TELEGRAM] Successfully published job "${jobJson.title_en}" to Telegram.`);
            } catch (tgErr: any) {
              console.error('[TELEGRAM ERROR] Failed to send Telegram alert for scraped standalone job:', tgErr);
              details.push(`[TELEGRAM ERROR] Failed to publish "${jobJson.title_en}" to Telegram: ${tgErr.message}`);
            }
          }

          // Push Notification to Android App via FCM
          try {
            await sendFcmJobNotification(env, {
              id: jobId,
              title: jobJson.title_ar || jobJson.title_en || 'وظيفة شاغرة جديدة في إسطنبول',
              companyName: jobJson.company_name,
              location: jobJson.location_ar || jobJson.location_en,
              slug
            });
          } catch (fcmErr) {
            console.warn('[FCM PUSH ERROR]', fcmErr);
          }

          // Mark Telegram post as processed
          await env.DB.prepare(
            `INSERT INTO documents (id, root_id, type_id, status, is_published, slug, title, data, created_at, updated_at)
             VALUES (?, ?, 'scraped_telegram_posts', 'published', 1, ?, ?, ?, ?, ?)`
          ).bind(
            `tg-${item.postId}`,
            `tg-${item.postId}`,
            `tg-${item.postId}`,
            `Telegram Post ${item.postId}`,
            JSON.stringify({ telegramPostUrl, jobId }),
            Date.now(),
            Date.now()
          ).run().catch(() => {});

          details.push(`[SUCCESS] Saved job ID ${jobId} from standalone Telegram post.`);
          scrapedCount++;

          // Keep CACHE_KV updated
          scrapedUrls.add(telegramPostUrl);
          processedTgIds.add(`tg-${item.postId}`);
          if (env.CACHE_KV) {
            env.CACHE_KV.put('kv_scraped_urls', JSON.stringify([...scrapedUrls]), { expirationTtl: 86400 }).catch(() => {});
            env.CACHE_KV.put('kv_processed_tg_ids', JSON.stringify([...processedTgIds]), { expirationTtl: 86400 }).catch(() => {});
          }
        }

        // Wait 3 seconds between jobs to avoid Gemini API rate limit (429)
        await new Promise(resolve => setTimeout(resolve, 3000));

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
