import { getPlatformProxy } from 'wrangler'
import { cleanHtml, saveJobToDb, analyzeJobWithAI } from '../src/services/scraper'

// Parse CLI arguments
const args = process.argv.slice(2);
const isRemote = args.includes('--remote') || args.includes('-r');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 300; // Large limit by default to scrape all jobs

// Monthly plain text sitemaps representing "from two months ago until now" (assuming current date is June 26, 2026)
const SITEMAP_MONTHS = ['2026-06', '2026-05', '2026-04'];

async function fetchSitemapUrls(month: string): Promise<string[]> {
  const url = `https://jobsintr.net/jobs-${month}.txt`;
  console.log(`⏳ Fetching sitemap for ${month} from: ${url}`);
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/plain, */*'
  };

  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      throw new Error(`Failed to fetch sitemap: ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    // Split by whitespace/newlines and clean URLs
    const urls = text
      .split(/\s+/)
      .map(u => u.trim())
      .filter(u => u.startsWith('http://') || u.startsWith('https://'));
    
    console.log(`✓ Found ${urls.length} URLs in ${month} sitemap.`);
    return urls;
  } catch (err: any) {
    console.error(`❌ Error fetching sitemap for ${month}:`, err.message);
    return [];
  }
}

/**
 * Call Gemini to analyze job details (reliable fallback/upgrade for local environment)
 */
async function analyzeJobWithGemini(apiKey: string, rawText: string): Promise<any> {
  const prompt = `
You are an expert recruiter and data classifier for job postings in Istanbul.
Analyze the provided job advertisement text and extract key details into a clean JSON structure in BOTH Arabic and English.
Return ONLY a valid JSON object. Do not wrap it in markdown code blocks, do not write comments, do not add intros or outros.

CRITICAL JSON RULES:
1. Do NOT use literal newlines inside JSON string values. Escape them as \\n if needed, or keep everything in one line.
2. Do NOT use double quotes inside string fields (like description or title). If you need quotes inside the values, use single quotes (e.g. 'quote' instead of \"quote\").
3. Make sure all commas and curly braces are perfectly balanced.

JSON structure:
{
  "title_ar": "اسم الوظيفة بالعربية (مختصر وجذاب)",
  "title_en": "Job title in English (short and attractive)",
  "description_ar": "تفاصيل ومسؤوليات وشروط الوظيفة بالتفصيل واللغة العربية (استخدم علامات اقتباس مفردة '' بدلا من علامات اقتباس مزدوجة \"\")",
  "description_en": "Detailed description, responsibilities, and requirements in English (use single quotes '' instead of double quotes \"\")",
  "company_name": "Name of the hiring company (e.g. Acme Corp)",
  "category_slug": "Map to one of these EXACT categories based on content: 'it-software', 'tourism-hospitality', 'real-estate-sales', 'education-teaching', 'customer-service-translation', 'general'",
  "location_ar": "المنطقة أو الحي في إسطنبول باللغة العربية (مثل: الفاتح, شيشلي, اسنيورت, باشاك شهير)",
  "location_en": "District/neighborhood in Istanbul in English (e.g. Fatih, Sisli, Esenyurt, Basaksehir)",
  "jobType": "Map to one of: 'full-time', 'part-time', 'remote', 'internship'",
  "salary": "Salary range if specified (e.g. 20,000 - 30,000 TL), otherwise leave empty string",
  "applyLink": "URL link to apply, or empty string",
  "applyEmail": "Email address to apply, or empty string",
  "language": "Required language: 'ar' (only Arabic), 'en' (only English), or 'both' (bilingual/both)"
}
`;

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
    // 1. Gather all URLs from monthly sitemaps
    let allCandidateUrls: { url: string; month: string }[] = [];
    for (const month of SITEMAP_MONTHS) {
      const urls = await fetchSitemapUrls(month);
      allCandidateUrls.push(...urls.map(url => ({ url, month })));
    }

    // Deduplicate URLs in memory
    const uniqueCandidatesMap = new Map<string, string>();
    for (const item of allCandidateUrls) {
      // Normalize URL (strip trailing slash)
      let normalized = item.url;
      if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
      uniqueCandidatesMap.set(normalized, item.month);
    }

    const uniqueCandidates = Array.from(uniqueCandidatesMap.entries()).map(([url, month]) => ({ url, month }));
    console.log(`📊 Total unique candidate URLs found: ${uniqueCandidates.length}`);

    // 2. Fetch existing scraped URLs from DB to filter them out
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

    const unscrapedCandidates = uniqueCandidates.filter(item => !scrapedUrlsSet.has(item.url));
    console.log(`🧹 Filtered out ${uniqueCandidates.length - unscrapedCandidates.length} already scraped jobs.`);
    console.log(`🚀 ${unscrapedCandidates.length} new jobs to process.`);

    if (unscrapedCandidates.length === 0) {
      console.log('🎉 No new jobs to scrape!');
      return;
    }

    // Apply limit if specified
    const targetCandidates = unscrapedCandidates.slice(0, limit);
    console.log(`Processing up to ${targetCandidates.length} new jobs in this run (Limit: ${limit}).`);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    };

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (let i = 0; i < targetCandidates.length; i++) {
      const { url, month } = targetCandidates[i];
      console.log(`\n👉 [${i + 1}/${targetCandidates.length}] Processing URL: ${url} (Sitemap: ${month})`);

      try {
        const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const cleanedText = cleanHtml(html);

        if (cleanedText.length < 150) {
          throw new Error('Retrieved content is too short or blocked.');
        }

        // Relative date check for older jobs (specifically April 2026 sitemap)
        // If the job is from April and displays "3 months ago" or older relative to June 26, it is before April 26
        if (month === '2026-04') {
          const olderDateRegex = /منذ\s+(3|٣|4|٤|5|٥|6|٦|7|٧|8|٨|9|٩|[0-9]{2})\s+أشهر|منذ\s+(عام|سنة|سنتين)/i;
          if (olderDateRegex.test(cleanedText)) {
            console.log(`⏭️ [SKIP] Job is older than 2 months (Relative date check detected older post).`);
            skipCount++;
            continue;
          }
        }

        console.log(`🤖 Parsing content (${cleanedText.length} chars)...`);
        const jobJson = await analyzeJob(env, cleanedText);

        console.log(`💾 Saving to D1: "${jobJson.title_en}" (Company: ${jobJson.company_name})`);
        const { jobId, slug } = await saveJobToDb(
          env.DB,
          { bucket: env.MEDIA_BUCKET, geminiApiKey: env.GEMINI_API_KEY },
          jobJson,
          url
        );

        console.log(`✅ Success! Saved as ID: ${jobId} / Slug: ${slug}`);
        successCount++;

        // Add a polite timeout between requests (e.g., 3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (err: any) {
        console.error(`❌ Failed to process ${url}:`, err.message);
        failCount++;
      }
    }

    console.log('\n======================================');
    console.log('🏁 Scraper Run Complete!');
    console.log(`   - Success: ${successCount}`);
    console.log(`   - Skipped: ${skipCount}`);
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
