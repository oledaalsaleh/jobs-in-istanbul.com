import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { FALLBACK_CATEGORIES, FALLBACK_COMPANIES, FALLBACK_JOBS } from '../src/data/fallback-dataset';

async function main() {
  console.log('⏳ Seeding CACHE_KV with categories, companies, and jobs...');
  
  const tmpDir = path.join(process.cwd(), '.wrangler/tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const catsFile = path.join(tmpDir, 'cats.json');
  const compsFile = path.join(tmpDir, 'comps.json');
  const jobsFile = path.join(tmpDir, 'jobs.json');

  fs.writeFileSync(catsFile, JSON.stringify(FALLBACK_CATEGORIES), 'utf8');
  fs.writeFileSync(compsFile, JSON.stringify(FALLBACK_COMPANIES), 'utf8');
  fs.writeFileSync(jobsFile, JSON.stringify(FALLBACK_JOBS), 'utf8');

  try {
    console.log('Writing kv_categories to CACHE_KV...');
    execSync(`npx wrangler kv key put --binding CACHE_KV --remote "kv_categories" --path "${catsFile}"`, { stdio: 'inherit' });

    console.log('Writing kv_companies to CACHE_KV...');
    execSync(`npx wrangler kv key put --binding CACHE_KV --remote "kv_companies" --path "${compsFile}"`, { stdio: 'inherit' });

    console.log('Writing kv_jobs_recent to CACHE_KV...');
    execSync(`npx wrangler kv key put --binding CACHE_KV --remote "kv_jobs_recent" --path "${jobsFile}"`, { stdio: 'inherit' });

    console.log('✅ CACHE_KV successfully seeded!');
  } catch (err) {
    console.error('❌ Failed to seed CACHE_KV:', err);
  }
}

main();
