/**
 * Autonomous Search Engine Indexing & Multi-Channel Broadcast Service
 * 
 * Automatically sends newly published jobs to:
 * 1. Google Indexing API (JobPosting URL_UPDATED)
 * 2. IndexNow Protocol (Bing, Yandex, Seznam, Naver)
 * 3. Search Engine Sitemap Pings (Google & Bing)
 * 4. Sitemap Cache Purge (forces immediate live sitemap update)
 * 5. Firebase Cloud Messaging (FCM Push Notifications to Mobile App)
 */

import { notifyGoogleIndexing } from './google-indexing';
import { notifyIndexNow } from './indexnow';
import { sendFcmJobNotification } from './fcm';

export interface JobIndexingPayload {
  id?: string;
  slug: string;
  title?: string;
  companyName?: string;
  location?: string;
}

export interface AutoIndexResult {
  slug: string;
  urls: string[];
  google: boolean;
  indexNow: boolean;
  sitemapPing: { google: boolean; bing: boolean };
  cacheInvalidated: boolean;
  fcm: boolean;
}

const SUPPORTED_LOCALES = ['ar', 'en', 'tr', 'ru', 'fa', 'ur'];
const SITE_URL = 'https://jobs-in-istanbul.com';

/**
 * Generate full localized URLs for a job slug across all site locales
 */
export function getJobLocalizedUrls(slug: string): string[] {
  return SUPPORTED_LOCALES.map(loc => `${SITE_URL}/${loc}/jobs/${slug}`);
}

/**
 * Ping search engines to re-crawl the XML sitemaps
 */
export async function pingSearchEngineSitemaps(): Promise<{ google: boolean; bing: boolean }> {
  const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap-jobs.xml`);
  const results = { google: false, bing: false };

  try {
    const googlePingUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;
    const resGoogle = await fetch(googlePingUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobsInIstanbulBot/1.0)' },
      signal: AbortSignal.timeout(5000)
    }).catch(() => null);
    results.google = resGoogle ? resGoogle.status < 400 : false;
  } catch (e) {
    console.warn('[SITEMAP PING] Google ping error:', e);
  }

  try {
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${sitemapUrl}`;
    const resBing = await fetch(bingPingUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobsInIstanbulBot/1.0)' },
      signal: AbortSignal.timeout(5000)
    }).catch(() => null);
    results.bing = resBing ? resBing.status < 400 : false;
  } catch (e) {
    console.warn('[SITEMAP PING] Bing ping error:', e);
  }

  console.log(`[SITEMAP PING] Google: ${results.google ? 'OK' : 'Failed/Skipped'} | Bing: ${results.bing ? 'OK' : 'Failed/Skipped'}`);
  return results;
}

/**
 * Purge sitemap cache in KV to guarantee immediate crawl readiness
 */
export async function invalidateSitemapCache(env: any): Promise<boolean> {
  if (!env?.CACHE_KV) return false;
  try {
    await Promise.allSettled([
      env.CACHE_KV.delete('kv_sitemap_jobs_xml'),
      env.CACHE_KV.delete('kv_sitemap_index_xml')
    ]);
    console.log('[SITEMAP CACHE] Successfully invalidated sitemap KV cache.');
    return true;
  } catch (err) {
    console.warn('[SITEMAP CACHE] Error invalidating cache:', err);
    return false;
  }
}

/**
 * Central orchestrator: Autonomously index and broadcast a published job
 */
export async function autoIndexAndNotifyJob(
  env: any,
  job: JobIndexingPayload
): Promise<AutoIndexResult> {
  const urls = getJobLocalizedUrls(job.slug);
  console.log(`[AUTO-INDEXING] Starting autonomous indexing for job: "${job.slug}" (${urls.length} URLs)`);

  // 1. Google Indexing API
  let googleSuccess = false;
  try {
    googleSuccess = await notifyGoogleIndexing(env, job.slug);
  } catch (gErr) {
    console.error('[AUTO-INDEXING] Google Indexing API error:', gErr);
  }

  // 2. IndexNow Protocol (Bing, Yandex, Seznam, Naver)
  let indexNowSuccess = false;
  try {
    indexNowSuccess = await notifyIndexNow(env, urls);
  } catch (inErr) {
    console.error('[AUTO-INDEXING] IndexNow error:', inErr);
  }

  // 3. Search Engine Sitemap Pings
  const sitemapPing = await pingSearchEngineSitemaps().catch(() => ({ google: false, bing: false }));

  // 4. Invalidate Sitemap Cache in KV
  const cacheInvalidated = await invalidateSitemapCache(env);

  // 5. Firebase Cloud Messaging (FCM Mobile Push)
  let fcmSuccess = false;
  if (job.title) {
    try {
      const fcmPayload: any = {
        title: job.title,
        slug: job.slug
      };
      if (job.id) fcmPayload.id = job.id;
      if (job.companyName) fcmPayload.companyName = job.companyName;
      if (job.location) fcmPayload.location = job.location;

      const fcmRes = await sendFcmJobNotification(env, fcmPayload);
      fcmSuccess = fcmRes.success;
    } catch (fcmErr) {
      console.warn('[AUTO-INDEXING] FCM push notification skipped:', fcmErr);
    }
  }

  // 6. Record indexing timestamp in KV if available
  if (env?.CACHE_KV) {
    env.CACHE_KV.put(`kv_indexed_${job.slug}`, Date.now().toString(), { expirationTtl: 604800 }).catch(() => {});
  }

  const result: AutoIndexResult = {
    slug: job.slug,
    urls,
    google: googleSuccess,
    indexNow: indexNowSuccess,
    sitemapPing,
    cacheInvalidated,
    fcm: fcmSuccess
  };

  console.log(`[AUTO-INDEXING COMPLETE] Job "${job.slug}": Google=${googleSuccess}, IndexNow=${indexNowSuccess}, Sitemaps=${sitemapPing.google || sitemapPing.bing}, FCM=${fcmSuccess}`);
  return result;
}

/**
 * Autonomous Catch-Up Indexer:
 * Finds recently published jobs in D1 that may not have been indexed yet,
 * and sends them to Google and IndexNow in bulk.
 */
export async function autoIndexUnindexedJobs(env: any, limit: number = 10): Promise<{ processed: number; indexed: number }> {
  if (!env?.DB) {
    return { processed: 0, indexed: 0 };
  }

  try {
    console.log(`[AUTO-INDEX CATCHUP] Checking for unindexed jobs in D1 (limit ${limit})...`);
    const rows = await env.DB.prepare(
      `SELECT id, slug, title, data, published_at, created_at 
       FROM documents 
       WHERE type_id = 'jobs' AND status = 'published' AND is_published = 1 AND deleted_at IS NULL 
       ORDER BY created_at DESC 
       LIMIT ?`
    ).bind(limit).all();

    const jobs = rows?.results || [];
    if (jobs.length === 0) {
      return { processed: 0, indexed: 0 };
    }

    let indexedCount = 0;
    const allUrlsToIndex: string[] = [];

    for (const row of jobs) {
      const slug = row.slug as string;
      if (!slug) continue;

      // Check if already indexed recently in KV
      if (env?.CACHE_KV) {
        const isIndexed = await env.CACHE_KV.get(`kv_indexed_${slug}`).catch(() => null);
        if (isIndexed) {
          continue; // Already indexed
        }
      }


      // Add all localized URLs to batch
      const jobUrls = getJobLocalizedUrls(slug);
      allUrlsToIndex.push(...jobUrls);

      // Trigger Google Indexing API for each slug
      await notifyGoogleIndexing(env, slug).catch(() => {});

      // Mark as indexed in KV (7 days TTL)
      if (env?.CACHE_KV) {
        await env.CACHE_KV.put(`kv_indexed_${slug}`, Date.now().toString(), { expirationTtl: 604800 }).catch(() => {});
      }

      indexedCount++;
    }

    // Submit all accumulated URLs to IndexNow in one batch request
    if (allUrlsToIndex.length > 0) {
      await notifyIndexNow(env, allUrlsToIndex).catch(() => {});
      await pingSearchEngineSitemaps().catch(() => {});
      await invalidateSitemapCache(env).catch(() => {});
      console.log(`[AUTO-INDEX CATCHUP] Successfully batch-submitted ${allUrlsToIndex.length} URLs for ${indexedCount} jobs.`);
    } else {
      console.log('[AUTO-INDEX CATCHUP] All recent jobs are already indexed.');
    }

    return { processed: jobs.length, indexed: indexedCount };
  } catch (error) {
    console.error('[AUTO-INDEX CATCHUP ERROR]:', error);
    return { processed: 0, indexed: 0 };
  }
}
