/**
 * My SonicJS Application
 *
 * Entry point for your SonicJS headless CMS application
 */

import { createSonicJSApp, registerCollections } from '@sonicjs-cms/core'
import type { SonicJSConfig } from '@sonicjs-cms/core'

// Import your collection configurations
// Add new collections here after creating them in src/collections/
import blogPostsCollection from './collections/blog-posts.collection'
import categoriesCollection from './collections/categories.collection'
import companiesCollection from './collections/companies.collection'
import jobsCollection from './collections/jobs.collection'
import applicationsCollection from './collections/applications.collection'

// Register collections BEFORE creating the app
// This ensures they are synced to the database on startup
registerCollections([
  blogPostsCollection,
  categoriesCollection,
  companiesCollection,
  jobsCollection,
  applicationsCollection,
])

// Application configuration
const config: SonicJSConfig = {
  name: 'Jobs in Istanbul',
  collections: {
    autoSync: true
  },
  plugins: {
    directory: './src/plugins',
    autoLoad: false  // Set to true to auto-load custom plugins
  },
  auth: {
    extendBetterAuth: (opts) => {
      opts.appName = 'Jobs in Istanbul';
      return opts;
    }
  },
  middleware: {
    beforeAuth: [
      async (c, next) => {
        if (c.req.path.startsWith('/auth/')) {
          c.header('X-Robots-Tag', 'noindex, nofollow, noarchive');
        }
        await next();
        if (c.req.path.startsWith('/auth/') && c.res) {
          c.res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
        }
      }
    ]
  }
}

// Create the application
const app = createSonicJSApp(config)

export { app }

app.onError((err, c) => {
  console.error('[Global Error Handler]', err);

  const errMsg = err.message || '';
  if (
    errMsg.includes('D1_ERROR') || 
    errMsg.includes('SQLITE_BUSY') || 
    errMsg.includes('database is locked')
  ) {
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Service Temporarily Unavailable</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 50px 20px; background: #f8fafc; color: #334155; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          h1 { color: #0f172a; margin-bottom: 12px; font-size: 1.5rem; }
          p { margin-bottom: 20px; line-height: 1.6; font-size: 1rem; }
          .btn { background: #007bff; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; cursor: pointer; border: none; box-shadow: 0 4px 12px rgba(0,123,255,0.2); transition: all 0.2s; }
          .btn:hover { background: #0056b3; transform: translateY(-1px); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>مؤقتاً غير متاح / Temporarily Offline</h1>
          <p>الموقع يمر بعملية تحديث تلقائية سريعة للوظائف الآن. يرجى إعادة المحاولة خلال ثوانٍ معدودة.</p>
          <p>The site is undergoing a quick automated update. Please refresh in a few seconds.</p>
          <button class="btn" onclick="window.location.reload()">تحديث الصفحة / Refresh</button>
        </div>
      </body>
      </html>
    `, 503, {
      'Retry-After': '5',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
  }

  return c.text('Internal Server Error', 500);
});


// Import routers
import { publicRouter } from './routes/public'
import { seoRouter } from './routes/seo'
import { adminAiRouter } from './routes/admin-ai'
import { scraperRouter } from './routes/scraper-router'
import { employerPortalRouter } from './routes/employer-portal'
import { candidatePortalRouter } from './routes/candidate-portal'
import { aiFeaturesRouter } from './routes/ai-features'
import { careerBlogRouter } from './routes/career-blog'
import { insightsRouter } from './routes/insights'
import { currencyPricesRouter } from './routes/currency-prices'
import { goldPricesRouter } from './routes/gold-prices'
import { runScraper } from './services/scraper'
import { runTelegramScraper } from './services/telegram-scraper'
import { optimizeSeoWithGemini } from './services/gemini-seo'
import { runCurrencyScraper } from './services/currency-scraper'
import { runGoldScraper } from './services/gold-scraper'

// Mount routes
app.route('/', publicRouter)
app.route('/', seoRouter)
app.route('/', adminAiRouter)
app.route('/', scraperRouter)
app.route('/', employerPortalRouter)
app.route('/', candidatePortalRouter)
app.route('/', aiFeaturesRouter)
app.route('/', careerBlogRouter)
app.route('/', insightsRouter)
app.route('/', currencyPricesRouter)
app.route('/', goldPricesRouter)

// Export the application for both HTTP requests (fetch) and Cron triggers (scheduled)
export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);

    // Serve app-ads.txt and ads.txt on root, /blog, /:locale/blog, or any subpath (Google AdMob / IAB Tech Lab verification)
    if (url.pathname === '/app-ads.txt' || url.pathname === '/ads.txt' || url.pathname.endsWith('/app-ads.txt') || url.pathname.endsWith('/ads.txt')) {
      return new Response('google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0\n', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    // Redirect /blog to /ar/blog (fix 404)
    if (url.pathname === '/blog') {
      return Response.redirect(`${url.origin}/ar/blog`, 302);
    }
    // Redirect tool & specialized landing routes without locale prefix to preferred language
    const bareRoutes = [
      '/salary-calculator-2026', '/investor-calculator', '/work-permit-eligibility', 
      '/cv-optimizer', '/workplace-quiz', '/resume-builder', '/ai-job-matcher',
      '/jobs-for-arabs', '/jobs-without-turkish', '/entry-level-jobs', '/driver-jobs',
      '/restaurant-jobs', '/factory-jobs', '/call-center-jobs', '/jobs-for-women', '/student-jobs'
    ];
    if (bareRoutes.includes(url.pathname)) {
      const acceptLang = request.headers.get('accept-language') || '';
      let targetLocale = 'ar';
      if (acceptLang.toLowerCase().startsWith('en')) targetLocale = 'en';
      else if (acceptLang.toLowerCase().startsWith('tr')) targetLocale = 'tr';
      else if (acceptLang.toLowerCase().startsWith('ru')) targetLocale = 'ru';
      else if (acceptLang.toLowerCase().startsWith('fa')) targetLocale = 'fa';
      else if (acceptLang.toLowerCase().startsWith('ur')) targetLocale = 'ur';
      return Response.redirect(`${url.origin}/${targetLocale}${url.pathname}`, 302);
    }
    // Redirect /{locale}/jobs (without slug) to /{locale} (homepage shows jobs)
    const jobsListMatch = url.pathname.match(/^\/(ar|en|tr|ru|fa|ur)\/jobs\/?$/);
    if (jobsListMatch) {
      return Response.redirect(`${url.origin}/${jobsListMatch[1]}`, 301);
    }
    if (url.pathname === '/' || url.pathname === '') {
      const acceptLang = request.headers.get('accept-language') || '';
      if (acceptLang.toLowerCase().startsWith('ur')) {
        return Response.redirect(`${url.origin}/ur`, 302);
      }
      if (acceptLang.toLowerCase().startsWith('fa')) {
        return Response.redirect(`${url.origin}/fa`, 302);
      }
      if (acceptLang.toLowerCase().startsWith('ru')) {
        return Response.redirect(`${url.origin}/ru`, 302);
      }
      if (acceptLang.toLowerCase().startsWith('tr')) {
        return Response.redirect(`${url.origin}/tr`, 302);
      }
      if (acceptLang.toLowerCase().startsWith('en')) {
        return Response.redirect(`${url.origin}/en`, 302);
      }
      return Response.redirect(`${url.origin}/ar`, 302);
    }
    return app.fetch(request, env, ctx);
  },
  async scheduled(_event: any, env: any, ctx: any) {
    ctx.waitUntil((async () => {
      console.log('[CRON] Starting robust scheduled execution cycle at', new Date().toISOString());

      // ----------------------------------------------------
      // 1. Currency Scraper (PRIORITY 1 - Fast, Essential, Writes to KV)
      // ----------------------------------------------------
      try {
        console.log('[CRON CURRENCY] Running currency scraper...');
        const currPrices = await runCurrencyScraper({
          DB: env.DB,
          CACHE_KV: env.CACHE_KV,
          GEMINI_API_KEY: env.GEMINI_API_KEY
        });
        console.log(`[CRON CURRENCY] Currency scraper finished successfully. Updated ${currPrices?.length || 0} currencies.`);
      } catch (currErr) {
        console.error('[CRON CURRENCY] Currency scraper execution error:', currErr);
      }

      // ----------------------------------------------------
      // 2. Gold Scraper (PRIORITY 2 - Fast, Essential, Writes to KV)
      // ----------------------------------------------------
      try {
        console.log('[CRON GOLD] Running gold scraper...');
        const goldMetals = await runGoldScraper({
          DB: env.DB,
          CACHE_KV: env.CACHE_KV,
          GEMINI_API_KEY: env.GEMINI_API_KEY
        });
        console.log(`[CRON GOLD] Gold scraper finished successfully. Updated ${goldMetals?.length || 0} metals.`);
      } catch (goldErr) {
        console.error('[CRON GOLD] Gold scraper execution error:', goldErr);
      }

      // ----------------------------------------------------
      // 3. Web Job Scraper (PRIORITY 3 - Safe batch limit: 3)
      // ----------------------------------------------------
      try {
        console.log('[CRON WEB SCRAPER] Running web scraper...');
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
          3
        );
        console.log(`[CRON WEB SCRAPER] Result: Scraped ${webResult.scraped}/${webResult.processed}. Errors: ${webResult.errors}`);
      } catch (webErr) {
        console.error('[CRON WEB SCRAPER] Web scraper execution error:', webErr);
      }

      // Brief pause between scrapers
      await new Promise(resolve => setTimeout(resolve, 2000));

      // ----------------------------------------------------
      // 4. Telegram Job Scraper (PRIORITY 4 - Safe batch limit: 3)
      // ----------------------------------------------------
      try {
        console.log('[CRON TELEGRAM SCRAPER] Running Telegram scraper...');
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
          3
        );
        console.log(`[CRON TELEGRAM SCRAPER] Result: Scraped ${tgResult.scraped}/${tgResult.processed}. Errors: ${tgResult.errors}`);
      } catch (tgErr) {
        console.error('[CRON TELEGRAM SCRAPER] Telegram scraper execution error:', tgErr);
      }

      // ----------------------------------------------------
      // 5. Auto SEO Optimizer (PRIORITY 5 - Safe batch limit: 2)
      // ----------------------------------------------------
      if (env.GEMINI_API_KEY && env.DB) {
        console.log('[CRON SEO] Running Auto SEO Optimizer...');
        try {
          const db = env.DB;
          const jobsResult = await db.prepare(
            `SELECT id, slug, data FROM documents WHERE type_id = 'jobs' AND is_published = 1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 10`
          ).all().catch((d1Err: any) => {
            console.warn('[CRON SEO] D1 query skipped (possible daily limit):', d1Err.message);
            return null;
          });

          const jobs = jobsResult?.results || [];
          let optimizedCount = 0;

          for (const row of jobs) {
            if (optimizedCount >= 2) break; // Limit to 2 per cron run to preserve execution time

            let jobData: any;
            try {
              jobData = JSON.parse(row.data);
            } catch (e) {
              continue;
            }

            const hasKeywords = jobData.seoKeywords && (
              (Array.isArray(jobData.seoKeywords) && jobData.seoKeywords.length > 0) ||
              (typeof jobData.seoKeywords === 'string' && jobData.seoKeywords.trim().length > 0)
            );
            const hasDescription = jobData.seoDescription && jobData.seoDescription.trim().length > 0;
            const hasAllTranslations = jobData.title_ar && jobData.title_en && jobData.title_tr && jobData.title_ru && jobData.title_fa && jobData.title_ur &&
                                       jobData.description_ar && jobData.description_en && jobData.description_tr && jobData.description_ru && jobData.description_fa && jobData.description_ur;

            if (hasKeywords && hasDescription && hasAllTranslations) {
              continue;
            }

            const title = jobData.title_en || jobData.title_ar || 'Job Title';
            const desc = jobData.description_en || jobData.description_ar || 'Job Description';
            const locale = jobData.language === 'ar' ? 'ar' : 'en';

            const seoResult = await optimizeSeoWithGemini(
              env.GEMINI_API_KEY,
              title,
              desc,
              locale
            );

            const updatedData = {
              ...jobData,
              title_ar: seoResult.title_ar || jobData.title_ar || title,
              title_en: seoResult.title_en || jobData.title_en || title,
              title_tr: seoResult.title_tr || jobData.title_tr || title,
              title_ru: seoResult.title_ru || jobData.title_ru || title,
              title_fa: seoResult.title_fa || jobData.title_fa || title,
              title_ur: seoResult.title_ur || jobData.title_ur || title,
              description_ar: seoResult.description_ar || jobData.description_ar || desc,
              description_en: seoResult.description_en || jobData.description_en || desc,
              description_tr: seoResult.description_tr || jobData.description_tr || desc,
              description_ru: seoResult.description_ru || jobData.description_ru || desc,
              description_fa: seoResult.description_fa || jobData.description_fa || desc,
              description_ur: seoResult.description_ur || jobData.description_ur || desc,
              seoKeywords: seoResult.keywords || [],
              seoDescription: seoResult.seoDescription || ''
            };

            await db.prepare(
              `UPDATE documents SET data = ?, title = ?, updated_at = ? WHERE id = ?`
            ).bind(JSON.stringify(updatedData), seoResult.title_en || jobData.title_en || title, Date.now(), row.id).run().catch((d1Err: any) => {
              console.warn('[CRON SEO] D1 update skipped:', d1Err.message);
            });

            optimizedCount++;
            await new Promise(r => setTimeout(r, 1000));
          }
          console.log(`[CRON SEO] Auto SEO Optimizer Success: Optimized ${optimizedCount} listings.`);
        } catch (seoErr) {
          console.error('[CRON SEO] Auto SEO Optimizer execution error:', seoErr);
        }
      }

      console.log('[CRON] Scheduled execution cycle finished successfully.');
    })());
  }
}

