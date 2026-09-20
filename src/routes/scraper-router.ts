import { Hono } from 'hono';
import { runScraper, analyzeJobUnified, saveJobToDb, cleanHtml, decodeCloudflareEmails, type ScrapedJobData } from '../services/scraper';
import { runTelegramScraper } from '../services/telegram-scraper';
import { optimizeSeoWithGemini } from '../services/gemini-seo';
import { runCurrencyScraper } from '../services/currency-scraper';
import { runGoldScraper } from '../services/gold-scraper';
import { sendTelegramAlert } from '../services/telegram';
import { sendFcmJobNotification } from '../services/fcm';
import { rateLimiter } from '../middleware/security';

export const scraperRouter = new Hono();

// Secure admin endpoint to manually trigger a scrape cycle
scraperRouter.post('/api/admin/trigger-scrape', rateLimiter(5, 5), async (c) => {
  const env: any = c.env;
  
  // Basic security check: ensure an Admin API Key is provided via JWT_SECRET Bearer token
  const authHeader = c.req.header('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.JWT_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Get optional limit of URLs to process in this run
  const limitQuery = c.req.query('limit');
  const limit = limitQuery ? parseInt(limitQuery, 10) : 5;

  try {
    const webResult = await runScraper(
      { 
        DB: env.DB, 
        AI: env.AI, 
        CACHE_KV: env.CACHE_KV,
        MEDIA_BUCKET: env.MEDIA_BUCKET, 
        GEMINI_API_KEY: env.GEMINI_API_KEY,
        TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHANNEL_ID: env.TELEGRAM_CHANNEL_ID
      }, 
      limit
    );
    const tgResult = await runTelegramScraper(
      { 
        DB: env.DB, 
        AI: env.AI, 
        CACHE_KV: env.CACHE_KV,
        MEDIA_BUCKET: env.MEDIA_BUCKET, 
        GEMINI_API_KEY: env.GEMINI_API_KEY,
        TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHANNEL_ID: env.TELEGRAM_CHANNEL_ID
      }, 
      limit
    );
    return c.json({
      success: true,
      websiteScraper: webResult,
      telegramScraper: tgResult
    });
  } catch (error: any) {
    console.error("Scraper Endpoint Error:", error);
    return c.json({
      success: false,
      error: 'An error occurred during scraping execution.',
      details: error.message
    }, 500);
  }
});

// Unified Admin API endpoint to trigger synchronization for currencies, gold, and jobs
const handleSyncAll = async (c: any) => {
  const env: any = c.env;
  const token = (c.req.query('secret') || c.req.header('Authorization')?.replace('Bearer ', '') || '').trim();
  const validSecret = env.JWT_SECRET || env.ADMIN_SYNC_SECRET;
  if (!token || !validSecret || token !== validSecret) {
    return c.json({ error: 'Unauthorized. Valid secret required.' }, 401);
  }

  const results: any = { timestamp: new Date().toISOString() };

  // 1. Currency
  try {
    const prices = await runCurrencyScraper({
      DB: env.DB,
      CACHE_KV: env.CACHE_KV,
      GEMINI_API_KEY: env.GEMINI_API_KEY
    });
    results.currency = { success: true, count: prices?.length || 0 };
  } catch (err: any) {
    results.currency = { success: false, error: err.message };
  }

  // 2. Gold
  try {
    const metals = await runGoldScraper({
      DB: env.DB,
      CACHE_KV: env.CACHE_KV,
      GEMINI_API_KEY: env.GEMINI_API_KEY
    });
    results.gold = { success: true, count: metals?.length || 0 };
  } catch (err: any) {
    results.gold = { success: false, error: err.message };
  }

  // 3. Jobs Scrapers
  const limitQuery = c.req.query('limit');
  const limit = limitQuery ? parseInt(limitQuery, 10) : 3;

  try {
    const webResult = await runScraper(
      {
        DB: env.DB,
        AI: env.AI,
        CACHE_KV: env.CACHE_KV,
        MEDIA_BUCKET: env.MEDIA_BUCKET,
        GEMINI_API_KEY: env.GEMINI_API_KEY,
        TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHANNEL_ID: env.TELEGRAM_CHANNEL_ID
      },
      limit
    );
    results.websiteJobs = webResult;
  } catch (err: any) {
    results.websiteJobs = { success: false, error: err.message };
  }

  try {
    const tgResult = await runTelegramScraper(
      {
        DB: env.DB,
        AI: env.AI,
        CACHE_KV: env.CACHE_KV,
        MEDIA_BUCKET: env.MEDIA_BUCKET,
        GEMINI_API_KEY: env.GEMINI_API_KEY,
        TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHANNEL_ID: env.TELEGRAM_CHANNEL_ID
      },
      limit
    );
    results.telegramJobs = tgResult;
  } catch (err: any) {
    results.telegramJobs = { success: false, error: err.message };
  }

  return c.json({ success: true, syncResults: results });
};

scraperRouter.get('/admin-api/sync-all', rateLimiter(5, 5), handleSyncAll);
scraperRouter.post('/admin-api/sync-all', rateLimiter(5, 5), handleSyncAll);

// Dedicated Admin API endpoint to trigger job scraping and publishing
const handleRefreshJobs = async (c: any) => {
  const env: any = c.env;
  const token = (c.req.query('secret') || c.req.header('Authorization')?.replace('Bearer ', '') || '').trim();
  const validSecret = env.JWT_SECRET || env.ADMIN_SYNC_SECRET;
  if (!token || !validSecret || token !== validSecret) {
    return c.json({ error: 'Unauthorized. Valid secret required.' }, 401);
  }

  const limitQuery = c.req.query('limit');
  const limit = limitQuery ? parseInt(limitQuery, 10) : 2;
  const isAsync = c.req.query('async') === 'true';

  const executeScrape = async () => {
    const results: any = { timestamp: new Date().toISOString() };
    try {
      results.websiteJobs = await runScraper(
        {
          DB: env.DB,
          AI: env.AI,
          CACHE_KV: env.CACHE_KV,
          MEDIA_BUCKET: env.MEDIA_BUCKET,
          GEMINI_API_KEY: env.GEMINI_API_KEY,
          TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
          TELEGRAM_CHANNEL_ID: env.TELEGRAM_CHANNEL_ID
        },
        limit
      );
    } catch (err: any) {
      results.websiteJobs = { success: false, error: err.message };
    }

    try {
      results.telegramJobs = await runTelegramScraper(
        {
          DB: env.DB,
          AI: env.AI,
          CACHE_KV: env.CACHE_KV,
          MEDIA_BUCKET: env.MEDIA_BUCKET,
          GEMINI_API_KEY: env.GEMINI_API_KEY,
          TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
          TELEGRAM_CHANNEL_ID: env.TELEGRAM_CHANNEL_ID
        },
        limit
      );
    } catch (err: any) {
      results.telegramJobs = { success: false, error: err.message };
    }
    return results;
  };

  if (isAsync && c.executionCtx) {
    c.executionCtx.waitUntil(executeScrape());
    return c.json({
      success: true,
      message: 'Job scraping cycle started in background.',
      limit,
      async: true,
      timestamp: new Date().toISOString()
    });
  }

  const results = await executeScrape();
  return c.json({
    success: true,
    results
  });
};

scraperRouter.get('/admin-api/refresh-jobs', rateLimiter(5, 5), handleRefreshJobs);
scraperRouter.post('/admin-api/refresh-jobs', rateLimiter(5, 5), handleRefreshJobs);

// Secure admin endpoint to manually trigger a currency scrape cycle
scraperRouter.post('/api/admin/trigger-currency-scrape', rateLimiter(5, 5), async (c) => {
  const env: any = c.env;
  
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${env.JWT_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('[API] Triggering manual currency scraper...');
    const prices = await runCurrencyScraper({
      DB: env.DB,
      CACHE_KV: env.CACHE_KV,
      GEMINI_API_KEY: env.GEMINI_API_KEY
    });
    return c.json({
      success: true,
      message: 'Currency rates scraped and cached successfully.',
      count: prices.length
    });
  } catch (error: any) {
    console.error("Currency Scraper Endpoint Error:", error);
    return c.json({
      success: false,
      error: 'An error occurred during currency scraping execution.',
      details: error.message
    }, 500);
  }
});

// Secure admin endpoint to manually trigger a gold scrape cycle
scraperRouter.post('/api/admin/trigger-gold-scrape', rateLimiter(5, 5), async (c) => {
  const env: any = c.env;
  
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${env.JWT_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('[API] Triggering manual gold scraper...');
    const metals = await runGoldScraper({
      DB: env.DB,
      CACHE_KV: env.CACHE_KV,
      GEMINI_API_KEY: env.GEMINI_API_KEY
    });
    return c.json({
      success: true,
      message: 'Gold prices scraped and cached successfully.',
      count: metals.length
    });
  } catch (error: any) {
    console.error("Gold Scraper Endpoint Error:", error);
    return c.json({
      success: false,
      error: 'An error occurred during gold scraping execution.',
      details: error.message
    }, 500);
  }
});

// Secure admin endpoint to optimize all jobs using Gemini AI
scraperRouter.post('/api/admin/optimize-all-jobs-seo', rateLimiter(5, 5), async (c) => {
  const env: any = c.env;

  // Basic security check
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${env.JWT_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const geminiApiKey = env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return c.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, 500);
  }

  // Parse parameters
  const limitQuery = c.req.query('limit');
  const limit = limitQuery ? parseInt(limitQuery, 10) : 10;

  const forceQuery = c.req.query('force');
  const force = forceQuery === 'true';

  const delayQuery = c.req.query('delay');
  const delayMs = delayQuery ? parseInt(delayQuery, 10) : 1000;

  const db = env.DB;

  try {
    // Fetch all jobs
    const jobsResult = await db.prepare(
      `SELECT id, slug, data, published_at FROM documents WHERE type_id = 'jobs'`
    ).all();

    const jobs = jobsResult.results || [];
    let processed = 0;
    let optimized = 0;
    let skipped = 0;
    let failed = 0;
    const details: string[] = [];

    for (const row of jobs) {
      let jobData: any;
      try {
        jobData = JSON.parse(row.data);
      } catch (err) {
        details.push(`Job ${row.id}: failed to parse JSON data.`);
        failed++;
        continue;
      }

      // Check if we need to optimize
      const hasKeywords = jobData.seoKeywords && (
        (Array.isArray(jobData.seoKeywords) && jobData.seoKeywords.length > 0) ||
        (typeof jobData.seoKeywords === 'string' && jobData.seoKeywords.trim().length > 0)
      );
      const hasDescription = jobData.seoDescription && jobData.seoDescription.trim().length > 0;

      if (!force && hasKeywords && hasDescription) {
        skipped++;
        continue;
      }

      if (processed >= limit) {
        continue; // Don't break so we can count total skipped
      }

      processed++;
      const title = jobData.title_en || jobData.title_ar || 'Job Title';
      const desc = jobData.description_en || jobData.description_ar || 'Job Description';
      const locale = jobData.language === 'ar' ? 'ar' : 'en';

      details.push(`Optimizing Job ${row.id} (${title})...`);

      try {
        // Sleep to respect rate limits
        if (processed > 1 && delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        const seoResult = await optimizeSeoWithGemini(
          geminiApiKey,
          title,
          desc,
          locale
        );

        // Update the job data
        const updatedData = {
          ...jobData,
          title_ar: seoResult.title_ar || jobData.title_ar || title,
          title_en: seoResult.title_en || jobData.title_en || title,
          description_ar: seoResult.description_ar || jobData.description_ar || desc,
          description_en: seoResult.description_en || jobData.description_en || desc,
          seoKeywords: seoResult.keywords || [],
          seoDescription: seoResult.seoDescription || ''
        };

        const updatedDataJson = JSON.stringify(updatedData);
        const finalTitleEn = seoResult.title_en || jobData.title_en || title;

        await db.prepare(
          `UPDATE documents SET data = ?, title = ?, updated_at = ? WHERE id = ?`
        ).bind(updatedDataJson, finalTitleEn, Date.now(), row.id).run();

        details.push(`Job ${row.id} optimized successfully.`);
        optimized++;
      } catch (err: any) {
        console.error(`Error optimizing job ${row.id}:`, err);
        details.push(`Job ${row.id} failed to optimize: ${err.message}`);
        failed++;
      }
    }

    return c.json({
      success: true,
      processed,
      optimized,
      skipped,
      failed,
      details
    });

  } catch (error: any) {
    console.error("SEO Optimization Endpoint Error:", error);
    return c.json({
      success: false,
      error: 'An error occurred during SEO optimization execution.',
      details: error.message
    }, 500);
  }
});

// Helper to authenticate requests using either JWT_SECRET or GEMINI_API_KEY
function authenticateRequest(c: any): boolean {
  const env = c.env;
  const authHeader = c.req.header('Authorization') || '';
  const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, '').trim();
  const apiKeyHeader = (c.req.header('X-API-Key') || '').trim();
  const queryKey = (c.req.query('apiKey') || c.req.query('key') || '').trim();

  const candidateKey = tokenFromHeader || apiKeyHeader || queryKey;
  if (!candidateKey) return false;

  const validKeys = [env.JWT_SECRET, env.GEMINI_API_KEY].filter(Boolean);
  return validKeys.some((validKey) => candidateKey === validKey);
}

// Endpoint to automatically analyze, SEO-optimize, and publish a job via API
const handleAutoPublishJob = async (c: any) => {
  const env: any = c.env;

  let body: any = {};
  try {
    body = await c.req.json();
  } catch (e) {
    body = {};
  }

  // Verify authentication
  const providedKey = body.apiKey || body.key;
  const isAuth = authenticateRequest(c) || (providedKey && (providedKey === env.JWT_SECRET || providedKey === env.GEMINI_API_KEY));

  if (!isAuth) {
    return c.json({
      success: false,
      error: 'Unauthorized. Provide valid Authorization Bearer token, X-API-Key header, or apiKey in query/body.'
    }, 401);
  }

  try {
    let rawText = (body.text || body.rawText || body.content || '').trim();
    const sourceUrl = (body.url || body.sourceUrl || '').trim();

    // 1. If URL is provided and no text is provided, fetch and extract text from URL
    if (sourceUrl && !rawText) {
      console.log(`[AUTO-PUBLISH API] Fetching content from URL: ${sourceUrl}`);
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      };
      const res = await fetch(sourceUrl, { headers, signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        return c.json({ success: false, error: `Failed to fetch URL: HTTP ${res.status}` }, 400);
      }
      const html = await res.text();
      const decodedHtml = decodeCloudflareEmails(html);
      rawText = cleanHtml(decodedHtml);
    }

    let jobData: ScrapedJobData;

    // 2. If rawText is available, analyze and structure with Gemini
    if (rawText) {
      console.log(`[AUTO-PUBLISH API] Analyzing job text with AI (${rawText.length} chars)...`);
      jobData = await analyzeJobUnified(env, rawText);

      // Override with explicitly supplied fields if provided in body
      if (body.title) jobData.title_ar = body.title;
      if (body.company) jobData.company_name = body.company;
      if (body.location) jobData.location_ar = body.location;
      if (body.salary) jobData.salary = body.salary;
      if (body.phone) jobData.phone = body.phone;
      if (body.applyEmail) jobData.applyEmail = body.applyEmail;
      if (body.applyLink) jobData.applyLink = body.applyLink;
      if (body.category) jobData.category_slug = body.category;
      if (body.jobType) jobData.jobType = body.jobType;
    } else if (body.title && (body.description || body.desc)) {
      // 3. Directly supplied structured fields
      jobData = {
        title_ar: body.title_ar || body.title,
        title_en: body.title_en || body.title,
        title_tr: body.title_tr || body.title,
        description_ar: body.description_ar || body.description || body.desc,
        description_en: body.description_en || body.description || body.desc,
        description_tr: body.description_tr || body.description || body.desc,
        company_name: body.company || body.company_name || 'Unspecified Company',
        category_slug: body.category || body.category_slug || 'general',
        location_ar: body.location_ar || body.location || 'إسطنبول',
        location_en: body.location_en || body.location || 'Istanbul',
        location_tr: body.location_tr || body.location || 'İstanbul',
        jobType: body.jobType || 'full-time',
        salary: body.salary || '',
        applyLink: body.applyLink || sourceUrl || '',
        applyEmail: body.applyEmail || '',
        phone: body.phone || '',
        language: body.language || 'both'
      };
    } else {
      return c.json({
        success: false,
        error: 'Missing job content. Please provide either "text" (raw announcement text), "url" (job page link), or structured "title" and "description".'
      }, 400);
    }

    // 4. Save and publish to database
    console.log(`[AUTO-PUBLISH API] Saving and publishing job: "${jobData.title_en || jobData.title_ar}"`);
    const { jobId, slug } = await saveJobToDb(
      env.DB,
      { bucket: env.MEDIA_BUCKET, geminiApiKey: env.GEMINI_API_KEY },
      jobData,
      sourceUrl || `api-published-${Date.now()}`
    );

    // 5. Telegram alert if configured
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHANNEL_ID) {
      try {
        await sendTelegramAlert(
          env,
          jobData.title_ar || jobData.title_en,
          jobData.company_name,
          jobData.location_ar || jobData.location_en,
          slug
        );
      } catch (tgErr: any) {
        console.error('[AUTO-PUBLISH TELEGRAM ERROR]', tgErr.message);
      }
    }

    // Push notification to Android app
    try {
      await sendFcmJobNotification(env, {
        id: jobId,
        title: jobData.title_ar || jobData.title_en || 'وظيفة شاغرة جديدة في إسطنبول',
        companyName: jobData.company_name,
        location: jobData.location_ar || jobData.location_en,
        slug
      });
    } catch (fcmErr) {
      console.warn('[FCM AUTO-PUBLISH ERROR]', fcmErr);
    }

    const origin = new URL(c.req.url).origin;

    return c.json({
      success: true,
      message: 'Job published successfully to Istanbul Jobs portal.',
      job: {
        id: jobId,
        slug: slug,
        titles: {
          ar: jobData.title_ar,
          en: jobData.title_en,
          tr: jobData.title_tr
        },
        company: jobData.company_name,
        category: jobData.category_slug,
        location: jobData.location_ar,
        salary: jobData.salary,
        phone: jobData.phone,
        applyEmail: jobData.applyEmail,
        applyLink: jobData.applyLink,
        urls: {
          ar: `${origin}/ar/jobs/${slug}`,
          en: `${origin}/en/jobs/${slug}`,
          tr: `${origin}/tr/jobs/${slug}`
        }
      }
    }, 201);

  } catch (error: any) {
    console.error('[AUTO-PUBLISH API ERROR]:', error);
    return c.json({
      success: false,
      error: 'An error occurred while publishing the job.',
      details: error.message
    }, 500);
  }
};

// Mount auto-publish routes with strict rate-limiting
scraperRouter.post('/api/jobs/auto-publish', rateLimiter(10, 5), handleAutoPublishJob);
scraperRouter.post('/api/admin/auto-publish-job', rateLimiter(10, 5), handleAutoPublishJob);


