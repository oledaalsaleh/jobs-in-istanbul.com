import { getPlatformProxy } from 'wrangler'
import { runScraper } from '../src/services/scraper'
import { runTelegramScraper } from '../src/services/telegram-scraper'

// Parse CLI arguments
const args = process.argv.slice(2);
const isRemote = args.includes('--remote') || args.includes('-r');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 5; // Default 5 postings

async function run() {
  console.log(`⏳ Connecting to Wrangler platform proxy (Environment: ${isRemote ? 'production' : 'local'})...`);
  const { env, dispose } = await getPlatformProxy({
    environment: isRemote ? 'production' : undefined
  });

  if (!env?.DB) {
    console.error('❌ Error: DB binding not found. Make sure wrangler.toml is configured.');
    process.exit(1);
  }

  console.log(`⏳ Starting Scraper Cycle (limit: ${limit} posts, remote: ${isRemote})...`);
  
  try {
    console.log('🚀 Running Web Scraper (jobsintr.net)...');
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
    console.log('✓ Web Scraper Completed!');
    console.log(`  Scraped: ${webResult.scraped}/${webResult.processed} pages.`);
    console.log(`  Errors: ${webResult.errors}`);
    console.log('  Details:', webResult.details);
    
    console.log('🚀 Running Telegram Scraper (@jobsintr)...');
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
