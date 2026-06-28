import { getPlatformProxy } from 'wrangler'
import { sendTelegramAlert } from '../src/services/telegram'

// Parse CLI arguments
const args = process.argv.slice(2);
const isRemote = args.includes('--remote') || args.includes('-r');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 10; // Default limit of 10 to avoid spamming/rate-limiting

async function run() {
  console.log(`⏳ Connecting to Wrangler platform proxy (Environment: ${isRemote ? 'production' : 'local'})...`);
  const { env, dispose } = await getPlatformProxy({
    environment: isRemote ? 'production' : undefined
  });

  if (!env?.DB) {
    console.error('❌ Error: DB binding not found. Make sure wrangler.toml is configured.');
    process.exit(1);
  }

  console.log('✓ Connected to DB.');

  try {
    // 1. Fetch unpublished jobs
    // We check where type_id = 'jobs' and json_extract(metadata, '$.telegramPublished') is null or not true
    console.log('⏳ Fetching unpublished jobs from D1 database...');
    const unpublishedJobs = await env.DB.prepare(
      `SELECT id, slug, data, metadata FROM documents 
       WHERE type_id = 'jobs' 
         AND (json_extract(metadata, '$.telegramPublished') IS NULL 
              OR json_extract(metadata, '$.telegramPublished') != 1)`
    ).all();

    const jobs = unpublishedJobs.results || [];
    console.log(`📊 Found ${jobs.length} unpublished jobs in DB.`);

    if (jobs.length === 0) {
      console.log('🎉 No unpublished jobs found!');
      return;
    }

    const targetJobs = jobs.slice(0, limit);
    console.log(`🚀 Publishing up to ${targetJobs.length} jobs to Telegram channel (Limit: ${limit})...`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < targetJobs.length; i++) {
      const job = targetJobs[i];
      let jobData: any;
      try {
        jobData = JSON.parse(job.data);
      } catch (e) {
        console.error(`❌ Failed to parse data for job ID ${job.id}`);
        failCount++;
        continue;
      }

      const title = jobData.title_ar || jobData.title_en || 'وظيفة شاغرة';
      const company = jobData.company_name || 'شركة غير محددة';
      const location = jobData.location_ar || jobData.location_en || 'إسطنبول';
      const slug = job.slug;

      console.log(`👉 [${i+1}/${targetJobs.length}] Sending Telegram alert for: "${title}" (Slug: ${slug})...`);
      
      if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHANNEL_ID) {
        try {
          await sendTelegramAlert(env, title, company, location, slug);
          
          // Update metadata in DB
          let currentMeta: any = {};
          try {
            currentMeta = JSON.parse(job.metadata || '{}');
          } catch (e) {}
          
          currentMeta.telegramPublished = true;
          currentMeta.telegramPublishedAt = Date.now();

          await env.DB.prepare(
            `UPDATE documents SET metadata = ? WHERE id = ?`
          ).bind(JSON.stringify(currentMeta), job.id).run();

          console.log(`✅ Success! Marked as published in DB.`);
          successCount++;
        } catch (err: any) {
          console.error(`❌ Failed to send Telegram alert: ${err.message}`);
          failCount++;
        }
      } else {
        console.warn('⚠️ Telegram credentials (TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID) not configured in environment variables.');
        failCount++;
      }

      // Wait 5 seconds between messages to comply with Telegram rate limits
      if (i < targetJobs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('\n======================================');
    console.log('🏁 Telegram Publishing Run Complete!');
    console.log(`   - Success: ${successCount}`);
    console.log(`   - Failed: ${failCount}`);
    console.log('======================================');

  } catch (error: any) {
    console.error('❌ Fatal error during publishing execution:', error);
  } finally {
    await dispose();
    console.log('🎉 Execution complete!');
  }
}

run();
