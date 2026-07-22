import { getPlatformProxy } from 'wrangler'
import { optimizeSeoWithGemini } from '../src/services/gemini-seo'

async function run() {
  console.log('⏳ Connecting to Cloudflare platform proxy...');
  const { env, dispose } = await getPlatformProxy();

  if (!env?.DB) {
    console.error('❌ Error: DB binding not found. Make sure wrangler.toml is configured.');
    process.exit(1);
  }

  const geminiApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error('❌ Error: GEMINI_API_KEY is not defined in wrangler.toml vars or environment.');
    await dispose();
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  let limit = 10;
  let force = false;
  let delayMs = 1000;

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.split('=')[1], 10) || 10;
    } else if (arg === '--force') {
      force = true;
    } else if (arg.startsWith('--delay=')) {
      delayMs = parseInt(arg.split('=')[1], 10) || 1000;
    }
  }

  console.log(`⏳ Starting SEO Optimization Cycle (limit: ${limit}, force: ${force}, delay: ${delayMs}ms)...`);

  try {
    const db: any = env.DB;
    const jobsResult = await db.prepare(
      `SELECT id, slug, data, published_at FROM documents WHERE type_id = 'jobs'`
    ).all();

    const jobs = jobsResult.results || [];
    let processed = 0;
    let optimized = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of jobs) {
      let jobData: any;
      try {
        jobData = JSON.parse(row.data);
      } catch (err) {
        console.error(`❌ Job ${row.id}: Failed to parse JSON data.`);
        failed++;
        continue;
      }

      // Check if we need to optimize or translate
      const hasKeywords = jobData.seoKeywords && (
        (Array.isArray(jobData.seoKeywords) && jobData.seoKeywords.length > 0) ||
        (typeof jobData.seoKeywords === 'string' && jobData.seoKeywords.trim().length > 0)
      );
      const hasDescription = jobData.seoDescription && jobData.seoDescription.trim().length > 0;
      
      const hasAllTranslations = jobData.title_ar && jobData.title_en && jobData.title_tr && jobData.title_ru && jobData.title_fa && jobData.title_ur &&
                                 jobData.description_ar && jobData.description_en && jobData.description_tr && jobData.description_ru && jobData.description_fa && jobData.description_ur;

      if (!force && hasKeywords && hasDescription && hasAllTranslations) {
        skipped++;
        continue;
      }

      if (processed >= limit) {
        continue; // Keep iterating to count skipped items
      }

      processed++;
      const title = jobData.title_en || jobData.title_ar || 'Job Title';
      const desc = jobData.description_en || jobData.description_ar || 'Job Description';
      const locale = jobData.language === 'ar' ? 'ar' : 'en';

      console.log(`🚀 [${processed}/${limit}] Optimizing & Translating Job ${row.id}: "${title}"...`);

      try {
        if (processed > 1 && delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        const seoResult = await optimizeSeoWithGemini(
          geminiApiKey as string,
          title,
          desc,
          locale
        );

        // Update the job data
        const updatedData = {
          ...jobData,
          title_ar: seoResult.title_ar || jobData.title_ar || title,
          title_en: seoResult.title_en || jobData.title_en || title,
          title_tr: seoResult.title_tr || jobData.title_tr || title,
          title_ru: seoResult.title_ru || jobData.title_ru || title,
          title_fa: seoResult.title_fa || jobData.title_fa || title,
          title_ur: seoResult.title_ur || jobData.title_ur || title,
          description_ar: seoResult.description_ar || jobData.description_ar || desc,
          description_en: seoResult.description_en || jobData.description_en || desc,
          description_tr: seoResult.description_tr || jobData.description_tr || desc,
          description_ru: seoResult.description_ru || jobData.description_ru || desc,
          description_fa: seoResult.description_fa || jobData.description_fa || desc,
          description_ur: seoResult.description_ur || jobData.description_ur || desc,
          seoKeywords: seoResult.keywords || [],
          seoDescription: seoResult.seoDescription || ''
        };

        const updatedDataJson = JSON.stringify(updatedData);
        const finalTitleEn = seoResult.title_en || jobData.title_en || title;

        await db.prepare(
          `UPDATE documents SET data = ?, title = ?, updated_at = ? WHERE id = ?`
        ).bind(updatedDataJson, finalTitleEn, Date.now(), row.id).run();

        console.log(`   ✓ Job ${row.id} optimized and translated successfully.`);
        optimized++;
      } catch (err: any) {
        console.error(`   ❌ Job ${row.id} failed:`, err.message);
        failed++;
      }
    }

    console.log('\n=========================================');
    console.log('🏁 SEO Optimization completed!');
    console.log(`   Total matched in DB: ${jobs.length}`);
    console.log(`   Attempted to process: ${processed}`);
    console.log(`   Optimized successfully: ${optimized}`);
    console.log(`   Skipped (already optimized): ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log('=========================================');

  } catch (error: any) {
    console.error('❌ Fatal error during script execution:', error);
  } finally {
    await dispose();
  }
}

run();
