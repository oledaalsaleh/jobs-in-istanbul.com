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

// Register collections BEFORE creating the app
// This ensures they are synced to the database on startup
registerCollections([
  blogPostsCollection,
  categoriesCollection,
  companiesCollection,
  jobsCollection,
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

// Import routers
import { publicRouter } from './routes/public'
import { seoRouter } from './routes/seo'

// Mount routes
app.route('/', publicRouter)
app.route('/', seoRouter)

// Export the application
export default app
