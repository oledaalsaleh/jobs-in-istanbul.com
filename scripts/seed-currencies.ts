import { getPlatformProxy } from 'wrangler';
import { runCurrencyScraper } from '../src/services/currency-scraper';

const isRemote = process.argv.includes('--remote') || process.argv.includes('-r');

async function main() {
  console.log(`⏳ Connecting to Wrangler platform proxy (Environment: ${isRemote ? 'production' : 'local'})...`);
  const { env, dispose } = await getPlatformProxy({
    environment: isRemote ? 'production' : undefined
  });

  try {
    console.log('✓ Connected to DB.');
    console.log('⏳ Running currency scraper...');
    const prices = await runCurrencyScraper(env);
    console.log(`✓ Currency prices (${prices.length} items) successfully seeded/updated in D1 DB!`);
  } catch (err) {
    console.error('❌ Error during currency seeding:', err);
  } finally {
    await dispose();
    console.log('🎉 Execution complete!');
  }
}

main();
