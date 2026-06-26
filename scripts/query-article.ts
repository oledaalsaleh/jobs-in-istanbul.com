import { getPlatformProxy } from 'wrangler'

const args = process.argv.slice(2);
const isRemote = args.includes('--remote') || args.includes('-r');
const slug = 'work-permit-turkey-2026';

async function run() {
  console.log(`⏳ Connecting to Wrangler platform proxy (Environment: ${isRemote ? 'production' : 'local'})...`);
  const { env, dispose } = await getPlatformProxy({
    environment: isRemote ? 'production' : undefined
  });

  if (!env?.DB) {
    console.error('❌ Error: DB binding not found.');
    process.exit(1);
  }

  try {
    const row = await env.DB.prepare(
      `SELECT id, type_id, status, is_published, slug, title, data FROM documents WHERE slug = ?`
    ).bind(slug).first();

    if (row) {
      console.log('✓ Found row:', {
        id: row.id,
        type_id: row.type_id,
        status: row.status,
        is_published: row.is_published,
        slug: row.slug,
        title: row.title,
        dataSnippet: typeof row.data === 'string' ? row.data.substring(0, 100) : JSON.stringify(row.data).substring(0, 100)
      });
    } else {
      console.log('❌ No row found for slug:', slug);
    }
  } catch (err: any) {
    console.error('❌ Error querying DB:', err.message);
  } finally {
    await dispose();
  }
}

run();
