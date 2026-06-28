import { getPlatformProxy } from 'wrangler';
import { runGoldScraper } from '../src/services/gold-scraper';

const isRemote = process.argv.includes('--remote') || process.argv.includes('-r');

async function main() {
  console.log(`⏳ Connecting to Wrangler platform proxy (Environment: ${isRemote ? 'production' : 'local'})...`);
  const { env, dispose } = await getPlatformProxy({
    environment: isRemote ? 'production' : undefined
  });

  try {
    console.log('✓ Connected to DB.');
    console.log('⏳ Running gold scraper...');
    const metals = await runGoldScraper(env);
    console.log(`✓ Gold prices (${metals.length} items) successfully seeded/updated in D1 DB!`);
  } catch (err) {
    console.error('❌ Error during gold seeding:', err);
  } finally {
    await dispose();
    console.log('🎉 Execution complete!');
  }
}

main();
