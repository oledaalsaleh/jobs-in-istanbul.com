import { getPlatformProxy } from 'wrangler'
import { cleanHtml, saveJobToDb, analyzeJobWithAI, decodeCloudflareEmails } from '../src/services/scraper'
import { sendTelegramAlert } from '../src/services/telegram'

// Parse CLI arguments
const args = process.argv.slice(2);
const isRemote = args.includes('--remote') || args.includes('-r');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 300; // Large limit by default to scrape all jobs within month
const bypassDate = args.includes('--all') || args.includes('-a');

/**
 * Check if the Arabic relative date string represents a time older than one month
 */
function isOlderThanOneMonth(dateText: string): boolean {
  const text = dateText.trim();
  // If it contains "شهرين" (two months), "أشهر" (months - meaning 3 or more), "سنة" (year), "عام" (year)
  if (text.includes('شهرين') || text.includes('أشهر') || text.includes('سنة') || text.includes('عام')) {
    return true;
  }
  // Check if it specifies month count >= 2 (e.g. "منذ 2 شهر" or similar, although uncommon)
  const match = text.match(/منذ\s+(\d+)\s+شهر/);
  if (match) {
    const months = parseInt(match[1], 10);
    if (months >= 2) return true;
  }
  return false;
}

interface SearchJobItem {
  url: string;
  title: string;
  dateText: string;
}

/**
 * Extract job items (url, title, dateText) from a search page HTML
 */
function extractJobItemsFromSearch(html: string): SearchJobItem[] {
  const items: SearchJobItem[] = [];
  const articleRegex = /<article class="sj-card[^"]*">([\s\S]*?)<\/article>/gi;
  let match;

  while ((match = articleRegex.exec(html)) !== null) {
    const content = match[1];
    
    // Extract URL and Title
    const linkRegex = /<a\s+[^>]*href="(https:\/\/salamjobs\.com\/jobs\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
    const linkMatch = content.match(linkRegex);
    if (!linkMatch) continue;

    const url = linkMatch[1];
    const title = linkMatch[2].replace(/<[^>]+>/g, '').trim();

    // Extract Date Text
    const dateRegex = /class="[^"]*text-slate-500[^"]*"[^>]*>([\s\S]*?)<\/p>/i;
    const dateMatch = content.match(dateRegex);
    const dateText = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    items.push({ url, title, dateText });
  }

  return items;
}

/**
 * Extract phone number from href="tel:..." or whatsapp link
 */
function extractPhoneFromHtml(html: string): string {
  // Extract tel: link
  const telRegex = /href="tel:([^"]+)"/i;
  const telMatch = html.match(telRegex);
  if (telMatch) {
    return decodeURIComponent(telMatch[1]).trim();
  }
  
  // Extract whatsapp phone number (e.g. phone=+90...)
  const waRegex = /phone=([^&"]+)/i;
  const waMatch = html.match(waRegex);
  if (waMatch) {
    let num = decodeURIComponent(waMatch[1]).trim();
    if (!num.startsWith('+') && num.length > 5) {
      if (num.startsWith('90') || num.startsWith('96')) {
        num = '+' + num;
      }
    }
    return num;
  }
  return '';
}

/**
 * Call Gemini to analyze job details (with retry & backoff logic)
 */
async function analyzeJobWithGemini(apiKey: string, rawText: string, retries = 3, delayMs = 5000): Promise<any> {
  const prompt = `
You are an expert recruiter and data classifier for job postings in Istanbul.
Analyze the provided job advertisement text and extract key details into a clean JSON structure in Arabic, English, and Turkish.
Return ONLY a valid JSON object. Do not wrap it in markdown code blocks, do not write comments, do not add intros or outros.

CRITICAL JSON RULES:
1. Do NOT use literal newlines inside JSON string values. Escape them as \\n if needed, or keep everything in one line.
2. Do NOT use double quotes inside string fields (like description or title). If you need quotes inside the values, use single quotes (e.g. 'quote' instead of \"quote\").
3. Make sure all commas and curly braces are perfectly balanced.

JSON structure:
{
  "title_ar": "اسم الوظيفة بالعربية (مختصر وجذاب)",
  "title_en": "Job title in English (short and attractive)",
  "title_tr": "Job title in Turkish (short and attractive)",
  "description_ar": "تفاصيل ومسؤوليات وشروط الوظيفة بالتفصيل واللغة العربية (استخدم علامات اقتباس مفردة '' بدلا من علامات اقتباس مزدوجة \"\")",
  "description_en": "Detailed description, responsibilities, and requirements in English (use single quotes '' instead of double quotes \"\")",
  "description_tr": "Detailed description, responsibilities, and requirements in Turkish (use single quotes '' instead of double quotes \"\")",
  "company_name": "Name of the hiring company (e.g. Acme Corp)",
  "category_slug": "Map to one of these EXACT categories based on content: 'it-software', 'tourism-hospitality', 'real-estate-sales', 'education-teaching', 'customer-service-translation', 'marketing-advertising', 'accounting-finance', 'healthcare-medical', 'engineering-construction', 'design-creative-arts', 'admin-human-resources', 'logistics-transportation', 'beauty-salon', 'general-others'",
  "location_ar": "المنطقة أو الحي في إسطنبول باللغة العربية (مثل: الفاتح, شيشلي, اسنيورت, باشاك شهير)",
  "location_en": "District/neighborhood in Istanbul in English (e.g. Fatih, Sisli, Esenyurt, Basaksehir)",
  "location_tr": "District/neighborhood in Istanbul in Turkish (e.g. Fatih, Şişli, Esenyurt, Başakşehir)",
  "jobType": "Map to one of: 'full-time', 'part-time', 'remote', 'internship'",
  "salary": "Salary range if specified (e.g. 20,000 - 30,000 TL), otherwise leave empty string",
  "applyLink": "URL link to apply, or empty string",
  "applyEmail": "Email address to apply, or empty string",
  "phone": "Phone number or WhatsApp contact if specified in the text (e.g. +90 555 123 4567), otherwise empty string",
  "language": "Required language: 'ar' (only Arabic), 'en' (only English), or 'both' (bilingual/both)"
}
`;

  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt}\n\nJob text:\n${rawText}` }] }]
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          console.warn(`⚠️ [GEMINI] 429 rate limit hit. Retrying in ${currentDelay}ms (Attempt ${attempt}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay *= 2;
          continue;
        }
        throw new Error(`Gemini API returned status ${res.status} ${res.statusText}`);
      }

      const data: any = await res.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        text = text.substring(startIdx, endIdx + 1);
      }

      return JSON.parse(text);
    } catch (err: any) {
      if (attempt === retries) {
        throw err;
      }
      console.warn(`⚠️ [GEMINI] Attempt ${attempt} failed: ${err.message}. Retrying in ${currentDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= 2;
    }
  }
}

async function analyzeJob(env: any, rawText: string): Promise<any> {
  if (env.GEMINI_API_KEY) {
    try {
      return await analyzeJobWithGemini(env.GEMINI_API_KEY, rawText);
    } catch (e: any) {
      console.warn(`⚠️ Gemini parsing failed: ${e.message}. Trying Workers AI...`);
    }
  }

  if (env.AI) {
    return await analyzeJobWithAI(env.AI, rawText);
  }

  throw new Error('Neither GEMINI_API_KEY nor Workers AI binding is available.');
}

async function run() {
  console.log(`⏳ Connecting to Wrangler platform proxy (Environment: ${isRemote ? 'production' : 'local'})...`);
  const { env, dispose } = await getPlatformProxy({
    environment: isRemote ? 'production' : undefined
  });

  if (!env?.DB) {
    console.error('❌ Error: DB binding not found. Make sure wrangler.toml is configured.');
    process.exit(1);
  }

  console.log('✓ Connected to DB.');

  try {
    // 1. Gather all job URLs page-by-page from SalamJobs
    const uniqueCandidatesMap = new Map<string, string>();
    let page = 1;
    let hasMore = true;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    };

    console.log('⏳ Gathering candidate URLs from SalamJobs...');
    while (hasMore && page <= 30) {
      const searchUrl = `https://salamjobs.com/search?country_id=1&city_id=4&page=${page}`;
      console.log(`👉 Fetching search page ${page}: ${searchUrl}`);
      
      const res = await fetch(searchUrl, { headers, signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        console.error(`❌ Failed to fetch search page ${page}: ${res.status}`);
        break;
      }
      
      const html = await res.text();
      const jobItems = extractJobItemsFromSearch(html);
      
      if (jobItems.length === 0) {
        console.log(`ℹ️ No jobs found on page ${page}. Stopping pagination.`);
        break;
      }

      let olderCount = 0;
      for (const item of jobItems) {
        const isOlder = isOlderThanOneMonth(item.dateText);
        if (isOlder && !bypassDate) {
          olderCount++;
          console.log(`  - Pinned or older job skipped: "${item.title}" (${item.dateText})`);
        } else {
          uniqueCandidatesMap.set(item.url, item.dateText);
        }
      }

      // If all jobs on the page are older than 1 month, we can stop fetching further pages
      if (olderCount === jobItems.length && !bypassDate) {
        console.log(`🛑 Stopping pagination: all jobs on page ${page} are older than 1 month.`);
        hasMore = false;
      } else {
        page++;
      }

      // Add a small pause to respect the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const uniqueCandidates = Array.from(uniqueCandidatesMap.entries()).map(([url, dateText]) => ({ url, dateText }));
    console.log(`📊 Total unique candidate URLs found: ${uniqueCandidates.length}`);

    if (uniqueCandidates.length === 0) {
      console.log('🎉 No candidate jobs found!');
      return;
    }

    // 2. Filter out already scraped URLs
    console.log('⏳ Fetching already scraped jobs from D1...');
    const existingRows = await env.DB.prepare(
      `SELECT json_extract(data, '$.sourceUrl') as sourceUrl FROM documents WHERE type_id = 'jobs'`
    ).all();
    const scrapedUrlsSet = new Set(
      existingRows.results
        .map((r: any) => r.sourceUrl)
        .filter(Boolean)
        .map((url: string) => url.endsWith('/') ? url.slice(0, -1) : url)
    );

    const unscrapedCandidates = uniqueCandidates.filter(item => {
      let normalized = item.url;
      if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
      return !scrapedUrlsSet.has(normalized);
    });

    console.log(`🧹 Filtered out ${uniqueCandidates.length - unscrapedCandidates.length} already scraped jobs.`);
    console.log(`🚀 ${unscrapedCandidates.length} new jobs to process.`);

    if (unscrapedCandidates.length === 0) {
      console.log('🎉 No new jobs to scrape!');
      return;
    }

    // Apply limit if specified
    const targetCandidates = unscrapedCandidates.slice(0, limit);
    console.log(`Processing up to ${targetCandidates.length} new jobs in this run (Limit: ${limit}).`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < targetCandidates.length; i++) {
      const { url, dateText } = targetCandidates[i];
      console.log(`\n👉 [${i + 1}/${targetCandidates.length}] Processing URL: ${url} (Posted: ${dateText})`);

      try {
        const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status} ${response.statusText}`);
        }

        const rawHtml = await response.text();
        
        // Decode Cloudflare email protection in HTML
        const decodedHtml = decodeCloudflareEmails(rawHtml);
        
        // Extract phone contact from buttons
        const phoneFromHtml = extractPhoneFromHtml(decodedHtml);
        if (phoneFromHtml) {
          console.log(`📞 Extracted contact phone from buttons: ${phoneFromHtml}`);
        }

        const cleanedText = cleanHtml(decodedHtml);
        if (cleanedText.length < 150) {
          throw new Error('Retrieved content is too short or blocked.');
        }

        console.log(`🤖 Parsing content (${cleanedText.length} chars)...`);
        const jobJson = await analyzeJob(env, cleanedText);

        // Inject phone from HTML buttons if not detected by AI
        if (!jobJson.phone && phoneFromHtml) {
          jobJson.phone = phoneFromHtml;
        }

        console.log(`💾 Saving to D1: "${jobJson.title_en}" (Company: ${jobJson.company_name})`);
        const { jobId, slug } = await saveJobToDb(
          env.DB,
          { bucket: env.MEDIA_BUCKET, geminiApiKey: env.GEMINI_API_KEY },
          jobJson,
          url
        );

        console.log(`✅ Success! Saved as ID: ${jobId} / Slug: ${slug}`);
        successCount++;

        // Auto-publish to Telegram if configured
        let telegramPublished = false;
        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHANNEL_ID) {
          try {
            console.log(`[TELEGRAM] Publishing scraped job to Telegram channel: ${env.TELEGRAM_CHANNEL_ID}`);
            await sendTelegramAlert(
              env,
              jobJson.title_ar || jobJson.title_en,
              jobJson.company_name,
              jobJson.location_ar || jobJson.location_en,
              slug
            );
            telegramPublished = true;
          } catch (tgErr: any) {
            console.error('[TELEGRAM ERROR] Failed to send Telegram alert for scraped job:', tgErr);
          }
        }

        // If published, update metadata in D1
        if (telegramPublished) {
          try {
            const metaJson = JSON.stringify({ telegramPublished: true, telegramPublishedAt: Date.now() });
            await env.DB.prepare(
              `UPDATE documents SET metadata = ? WHERE id = ?`
            ).bind(metaJson, jobId).run();
          } catch (metaErr) {
            console.error('Failed to update job metadata:', metaErr);
          }
        }

        // Timeout between requests to prevent API rate limits (10 seconds is super safe for 15 RPM limits)
        await new Promise(resolve => setTimeout(resolve, 8000));

      } catch (err: any) {
        console.error(`❌ Failed to process ${url}:`, err.message);
        failCount++;
      }
    }

    console.log('\n======================================');
    console.log('🏁 SalamJobs Scraper Run Complete!');
    console.log(`   - Success: ${successCount}`);
    console.log(`   - Failed: ${failCount}`);
    console.log('======================================');

  } catch (error: any) {
    console.error('❌ Fatal error during scraper execution:', error);
  } finally {
    await dispose();
    console.log('🎉 Execution complete!');
  }
}

run();
