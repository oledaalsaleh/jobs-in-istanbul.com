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
import { runScraper } from './services/scraper'
import { runTelegramScraper } from './services/telegram-scraper'
import { optimizeSeoWithGemini } from './services/gemini-seo'

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

// Export the application for both HTTP requests (fetch) and Cron triggers (scheduled)
export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '') {
      return Response.redirect(`${url.origin}/ar`, 302);
    }
    return app.fetch(request, env, ctx);
  },
  async scheduled(_event: any, env: any, ctx: any) {
    ctx.waitUntil((async () => {
      try {
        console.log('[CRON SCRAPER] Starting sequential execution...');

        // 1. Run Web Scraper
        const webResult = await runScraper(
          { 
            DB: env.DB, 
            AI: env.AI, 
            MEDIA_BUCKET: env.MEDIA_BUCKET, 
            GEMINI_API_KEY: env.GEMINI_API_KEY,
            TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
            TELEGRAM_CHANNEL_ID: env.TELEGRAM_CHANNEL_ID
          },
          8
        );
        console.log(`[CRON SCRAPER] Web Scraper Success: Scraped ${webResult.scraped}/${webResult.processed} listings. Errors: ${webResult.errors}`);

        // 2. Brief pause to avoid API overlap
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 3. Run Telegram Scraper
        const tgResult = await runTelegramScraper(
          { 
            DB: env.DB, 
            AI: env.AI, 
            MEDIA_BUCKET: env.MEDIA_BUCKET, 
            GEMINI_API_KEY: env.GEMINI_API_KEY,
            TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
            TELEGRAM_CHANNEL_ID: env.TELEGRAM_CHANNEL_ID
          },
          8
        );
        console.log(`[CRON SCRAPER] TG Scraper Success: Scraped ${tgResult.scraped}/${tgResult.processed} listings. Errors: ${tgResult.errors}`);

        // 4. Run Auto SEO Optimizer for unoptimized jobs
        if (env.GEMINI_API_KEY) {
          console.log('[CRON SEO] Running Auto SEO Optimizer...');
          try {
            const db = env.DB;
            const jobsResult = await db.prepare(
              `SELECT id, slug, data FROM documents WHERE type_id = 'jobs' AND is_published = 1 AND deleted_at IS NULL`
            ).all();
            
            const jobs = jobsResult.results || [];
            let optimizedCount = 0;
            
            for (const row of jobs) {
              if (optimizedCount >= 5) break; // limit to 5 per cron run to respect Gemini rate limits
              
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
              
              if (hasKeywords && hasDescription) {
                continue;
              }
              
              const title = jobData.title_en || jobData.title_ar || 'Job Title';
              const desc = jobData.description_en || jobData.description_ar || 'Job Description';
              const locale = jobData.language === 'ar' ? 'ar' : 'en';
              
              // Call Gemini
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
                description_ar: seoResult.description_ar || jobData.description_ar || desc,
                description_en: seoResult.description_en || jobData.description_en || desc,
                seoKeywords: seoResult.keywords || [],
                seoDescription: seoResult.seoDescription || ''
              };
              
              await db.prepare(
                `UPDATE documents SET data = ?, title = ?, updated_at = ? WHERE id = ?`
              ).bind(JSON.stringify(updatedData), seoResult.title_en || jobData.title_en || title, Date.now(), row.id).run();
              
              optimizedCount++;
              // Brief pause between Gemini API calls
              await new Promise(r => setTimeout(r, 1000));
            }
            console.log(`[CRON SEO] Auto SEO Optimizer Success: Optimized ${optimizedCount} listings.`);
          } catch (seoErr) {
            console.error('[CRON SEO] Auto SEO Optimizer execution error:', seoErr);
          }
        }

      } catch (err) {
        console.error('[CRON SCRAPER] Sequential execution error:', err);
      }
    })());
  }
}

