import { Hono } from 'hono';
import { runScraper } from '../services/scraper';

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
    const result = await runScraper({ DB: env.DB, AI: env.AI }, limit);
    return c.json({
      success: true,
      ...result
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
