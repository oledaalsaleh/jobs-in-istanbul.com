import * as fs from 'node:fs';
import * as path from 'node:path';
import { getPlatformProxy } from 'wrangler';

async function main() {
  const isRemote = process.argv.includes('--remote') || process.argv.includes('-r');
  console.log(`Connecting to platform proxy (Remote: ${isRemote})...`);
  const { env, dispose } = await getPlatformProxy({
    environment: isRemote ? 'production' : undefined
  });

  const sqlPath = path.join(process.cwd(), 'seed_production.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('seed_production.sql not found');
    await dispose();
    return;
  }

  const content = fs.readFileSync(sqlPath, 'utf8');
  const urls = new Set<string>();
  const regex = /"sourceUrl":"([^"]+)"/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    let url = m[1].replace(/\\/g, '');
    urls.add(url);
  }

  console.log(`Extracted ${urls.size} unique sourceUrls from seed_production.sql`);

  if (env.CACHE_KV) {
    const list = Array.from(urls);
    console.log(`Saving ${list.length} URLs to CACHE_KV key 'kv_scraped_urls'...`);
    await env.CACHE_KV.put('kv_scraped_urls', JSON.stringify(list), { expirationTtl: 86400 * 30 }); // 30 days
    console.log('Successfully saved to CACHE_KV!');
  } else {
    console.warn('CACHE_KV binding not found!');
  }

  await dispose();
}

main().catch(console.error);
