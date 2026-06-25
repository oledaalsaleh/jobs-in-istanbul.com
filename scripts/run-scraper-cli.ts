import { getPlatformProxy } from 'wrangler'
import { runScraper } from '../src/services/scraper'
import { runTelegramScraper } from '../src/services/telegram-scraper'

async function run() {
  console.log('⏳ Connecting to Cloudflare platform proxy...');
  const { env, dispose } = await getPlatformProxy()

  if (!env?.DB) {
    console.error('❌ Error: DB binding not found. Make sure wrangler.toml is configured.');
    process.exit(1);
  }

  const limit = 15; // Scrape up to 15 job postings in this run
  console.log(`⏳ Starting Scraper Cycle (limit: ${limit} posts)...`);
  
  try {
    console.log('🚀 Running Web Scraper (jobsintr.net)...');
    const webResult = await runScraper(
      { 
        DB: env.DB, 
        AI: env.AI, 
        MEDIA_BUCKET: env.MEDIA_BUCKET, 
        GEMINI_API_KEY: env.GEMINI_API_KEY 
      }, 
      limit
    );
    console.log('✓ Web Scraper Completed!');
    console.log(`  Scraped: ${webResult.scraped}/${webResult.processed} pages.`);
    console.log(`  Errors: ${webResult.errors}`);
    console.log('  Details:', webResult.details);
    
    console.log('🚀 Running Telegram Scraper (@jobsintr)...');
    const tgResult = await runTelegramScraper(
      { 
        DB: env.DB, 
        AI: env.AI, 
        MEDIA_BUCKET: env.MEDIA_BUCKET, 
        GEMINI_API_KEY: env.GEMINI_API_KEY 
      }, 
      limit
    );
    console.log('✓ Telegram Scraper Completed!');
    console.log(`  Scraped: ${tgResult.scraped}/${tgResult.processed} posts.`);
    console.log(`  Errors: ${tgResult.errors}`);
    console.log('  Details:', tgResult.details);
    
  } catch (error: any) {
    console.error('❌ Fatal error during scraper execution:', error);
  } finally {
    await dispose();
    console.log('🎉 Execution complete!');
  }
}

run();
