import { Hono } from 'hono';
import { runScraper } from '../services/scraper';
import { runTelegramScraper } from '../services/telegram-scraper';
import { optimizeSeoWithGemini } from '../services/gemini-seo';
import { runCurrencyScraper } from '../services/currency-scraper';
import { runGoldScraper } from '../services/gold-scraper';

export const scraperRouter = new Hono();

// Secure admin endpoint to manually trigger a scrape cycle
scraperRouter.post('/api/admin/trigger-scrape', async (c) => {
  const env: any = c.env;
  
  // Basic security check: ensure an Admin API Key is provided via JWT_SECRET Bearer token
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${env.JWT_SECRET}`) {
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

// Secure admin endpoint to manually trigger a currency scrape cycle
scraperRouter.post('/api/admin/trigger-currency-scrape', async (c) => {
  const env: any = c.env;
  
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${env.JWT_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('[API] Triggering manual currency scraper...');
    const prices = await runCurrencyScraper({ DB: env.DB, GEMINI_API_KEY: env.GEMINI_API_KEY });
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
scraperRouter.post('/api/admin/trigger-gold-scrape', async (c) => {
  const env: any = c.env;
  
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${env.JWT_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    console.log('[API] Triggering manual gold scraper...');
    const metals = await runGoldScraper({ DB: env.DB, GEMINI_API_KEY: env.GEMINI_API_KEY });
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
scraperRouter.post('/api/admin/optimize-all-jobs-seo', async (c) => {
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

