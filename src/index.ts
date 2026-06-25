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
  collections: {
    autoSync: true
  },
  plugins: {
    directory: './src/plugins',
    autoLoad: false  // Set to true to auto-load custom plugins
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
      const acceptLang = request.headers.get('Accept-Language') || '';
      const lang = acceptLang.toLowerCase().includes('en') ? 'en' : 'ar';
      return Response.redirect(`${url.origin}/${lang}`, 302);
    }
    return app.fetch(request, env, ctx);
  },
  async scheduled(_event: any, env: any, ctx: any) {
    ctx.waitUntil((async () => {
      try {
        console.log('[CRON SCRAPER] Starting sequential execution...');

        // 1. Run Web Scraper
        const webResult = await runScraper(
          { DB: env.DB, AI: env.AI, MEDIA_BUCKET: env.MEDIA_BUCKET, GEMINI_API_KEY: env.GEMINI_API_KEY },
          8
        );
        console.log(`[CRON SCRAPER] Web Scraper Success: Scraped ${webResult.scraped}/${webResult.processed} listings. Errors: ${webResult.errors}`);

        // 2. Brief pause to avoid API overlap
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 3. Run Telegram Scraper
        const tgResult = await runTelegramScraper(
          { DB: env.DB, AI: env.AI, MEDIA_BUCKET: env.MEDIA_BUCKET, GEMINI_API_KEY: env.GEMINI_API_KEY },
          8
        );
        console.log(`[CRON SCRAPER] TG Scraper Success: Scraped ${tgResult.scraped}/${tgResult.processed} listings. Errors: ${tgResult.errors}`);

      } catch (err) {
        console.error('[CRON SCRAPER] Sequential execution error:', err);
      }
    })());
  }
}

