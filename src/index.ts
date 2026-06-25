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
import { runScraper } from './services/scraper'

// Mount routes
app.route('/', publicRouter)
app.route('/', seoRouter)
app.route('/', adminAiRouter)
app.route('/', scraperRouter)
app.route('/', employerPortalRouter)
app.route('/', candidatePortalRouter)
app.route('/', aiFeaturesRouter)

// Export the application for both HTTP requests (fetch) and Cron triggers (scheduled)
export default {
  fetch: app.fetch,
  async scheduled(_event: any, env: any, ctx: any) {
    ctx.waitUntil(
      runScraper({ DB: env.DB, AI: env.AI, GEMINI_API_KEY: env.GEMINI_API_KEY }, 3)
        .then((result) => {
          console.log(`[CRON SCRAPER] Success: Scraped ${result.scraped}/${result.processed} listings. Errors: ${result.errors}`);
        })
        .catch((err) => {
          console.error('[CRON SCRAPER] Execution error:', err);
        })
    );
  }
}

