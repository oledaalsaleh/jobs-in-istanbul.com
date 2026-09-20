import { Hono } from 'hono';
import type { Context } from 'hono';
import { safeQuery } from '../utils/db-helper';
import { sendFcmNotification } from '../services/fcm';

export const mobileApiRouter = new Hono();

// Global CORS Middleware for Mobile API
mobileApiRouter.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept-Language');
  c.header('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600');

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  return await next();
});

// Fallback baselines
const fallbackCurrencyPrices = [
  { name: 'الدولار الامريكي', code: 'USD', flag: 'us', buy: 48.28, sell: 48.31, change: { '1d': '0.06' }, lastUpdate: '1788339902' },
  { name: 'اليورو', code: 'EUR', flag: 'eu', buy: 55.95, sell: 55.99, change: { '1d': '-0.05' }, lastUpdate: '1788339902' },
  { name: 'الريال السعودي', code: 'SAR', flag: 'sa', buy: 12.86, sell: 12.89, change: { '1d': '0.04' }, lastUpdate: '1788339902' },
  { name: 'الدرهم الإماراتي', code: 'AED', flag: 'ae', buy: 13.14, sell: 13.17, change: { '1d': '0.01' }, lastUpdate: '1788339902' },
  { name: 'الجنيه الإسترليني', code: 'GBP', flag: 'gb', buy: 65.25, sell: 65.35, change: { '1d': '-0.12' }, lastUpdate: '1788339902' },
  { name: 'الجنيه المصري', code: 'EGP', flag: 'eg', buy: 0.945, sell: 0.952, change: { '1d': '-0.08' }, lastUpdate: '1788339902' },
  { name: 'الدينار الكويتي', code: 'KWD', flag: 'kw', buy: 156.80, sell: 157.20, change: { '1d': '0.02' }, lastUpdate: '1788339902' },
  { name: 'الريال القطري', code: 'QAR', flag: 'qa', buy: 13.20, sell: 13.26, change: { '1d': '0.03' }, lastUpdate: '1788339902' }
];

const fallbackGoldPrices = [
  { id: '1', name: 'جرام الذهب عيار 24', unit: 'جرام', buy: 3450.5, sell: 3465.0, karat: 24, lastUpdate: '1788339902' },
  { id: '2', name: 'جرام الذهب عيار 22', unit: 'جرام', buy: 3163.0, sell: 3176.5, karat: 22, lastUpdate: '1788339902' },
  { id: '3', name: 'جرام الذهب عيار 21', unit: 'جرام', buy: 3019.2, sell: 3031.9, karat: 21, lastUpdate: '1788339902' },
  { id: '4', name: 'جرام الذهب عيار 18', unit: 'جرام', buy: 2587.8, sell: 2598.7, karat: 18, lastUpdate: '1788339902' },
  { id: '5', name: 'ربع ليرة ذهب', unit: 'قطعة', buy: 5640, sell: 5720, karat: null, lastUpdate: '1788339902' },
  { id: '6', name: 'نصف ليرة ذهب', unit: 'قطعة', buy: 11280, sell: 11440, karat: null, lastUpdate: '1788339902' },
  { id: '7', name: 'ليرة ذهب تامة', unit: 'قطعة', buy: 22560, sell: 22880, karat: null, lastUpdate: '1788339902' },
  { id: '8', name: 'أونصة الذهب (USD)', unit: 'أونصة', buy: 2915.0, sell: 2916.5, karat: null, lastUpdate: '1788339902' }
];

/**
 * Helper: Resolve localized string with fallback order:
 * Target locale -> English (en) -> Arabic (ar) -> any available
 */
function resolveLocalizedText(
  item: any,
  field: string,
  locale: string
): string {
  if (locale === 'tr') {
    return item[`${field}_tr`] || item[`${field}_en`] || item[`${field}_ar`] || item[field] || '';
  }
  if (locale === 'en') {
    return item[`${field}_en`] || item[`${field}_ar`] || item[`${field}_tr`] || item[field] || '';
  }
  // Default Arabic
  return item[`${field}_ar`] || item[`${field}_en`] || item[`${field}_tr`] || item[field] || '';
}

// ----------------------------------------------------
// 1. Currencies Handler
// ----------------------------------------------------
async function handleCurrencies(c: Context) {
  const envAny = c.env as any;
  const db = envAny?.DB;
  let prices = fallbackCurrencyPrices;
  let source = 'fallback';
  let updatedAt = Date.now();
  let advice: any = null;

  // 1. Try CACHE_KV first (Fastest response)
  if (envAny?.CACHE_KV) {
    try {
      const kvData: any = await envAny.CACHE_KV.get('kv_currency_prices', 'json');
      if (kvData && Array.isArray(kvData.prices) && kvData.prices.length > 0) {
        prices = kvData.prices;
        source = 'kv_cache';
        updatedAt = kvData.updatedAt || updatedAt;
        advice = kvData.advice;
      }
    } catch (e) {
      console.warn('[MOBILE API] KV currencies error:', e);
    }
  }

  // 2. Fallback to D1
  if (source === 'fallback' && db) {
    try {
      const cached = await safeQuery(() => db.prepare(
        `SELECT data FROM documents WHERE type_id = 'site_settings' AND id = 'currency-prices-cache'`
      ).first(), 1, 50);

      if (cached?.data) {
        const parsed = JSON.parse(cached.data);
        if (Array.isArray(parsed.prices) && parsed.prices.length > 0) {
          prices = parsed.prices;
          source = 'd1_database';
          updatedAt = parsed.updatedAt || updatedAt;
          advice = parsed.advice;
        }
      }
    } catch (dbErr) {
      console.warn('[MOBILE API] D1 currencies fallback error:', dbErr);
    }
  }

  // Map to clean structure ready for Flutter consumption
  const mappedCurrencies = prices.map((p: any) => {
    const buyVal = typeof p.buy === 'number' ? p.buy : parseFloat(p.buy || '0');
    const sellVal = typeof p.sell === 'number' ? p.sell : parseFloat(p.sell || '0');
    const midRate = sellVal > 0 ? sellVal : buyVal;

    return {
      name: p.name,
      code: (p.code || '').toUpperCase(),
      flag: p.flag || '',
      buy: buyVal,
      sell: sellVal,
      // tryPerUnit: 1 Unit (USD) = X TRY
      tryPerUnit: midRate,
      // unitPerTry: 1 TRY = X Units (needed by Flutter CurrencyRateItem: tryToCurrencyRate)
      unitPerTry: midRate > 0 ? parseFloat((1 / midRate).toFixed(6)) : 0,
      change1d: p.change?.['1d'] || '0.00',
      change7d: p.change?.['7d'] || '0.00',
      lastUpdate: p.lastUpdate || ''
    };
  });

  return c.json({
    success: true,
    source,
    base: 'TRY',
    count: mappedCurrencies.length,
    updatedAt,
    lastUpdateIso: new Date(updatedAt).toISOString(),
    currencies: mappedCurrencies,
    advice
  });
}

// ----------------------------------------------------
// 2. Gold Prices Handler
// ----------------------------------------------------
async function handleGold(c: Context) {
  const envAny = c.env as any;
  const db = envAny?.DB;
  let metals = fallbackGoldPrices;
  let source = 'fallback';
  let updatedAt = Date.now();
  let advice: any = null;

  // 1. Try CACHE_KV
  if (envAny?.CACHE_KV) {
    try {
      const kvData: any = await envAny.CACHE_KV.get('kv_gold_prices', 'json');
      if (kvData && Array.isArray(kvData.metals) && kvData.metals.length > 0) {
        metals = kvData.metals;
        source = 'kv_cache';
        updatedAt = kvData.updatedAt || updatedAt;
        advice = kvData.advice;
      }
    } catch (e) {
      console.warn('[MOBILE API] KV gold error:', e);
    }
  }

  // 2. Fallback to D1
  if (source === 'fallback' && db) {
    try {
      const cached = await safeQuery(() => db.prepare(
        `SELECT data FROM documents WHERE type_id = 'site_settings' AND id = 'gold-prices-cache'`
      ).first(), 1, 50);

      if (cached?.data) {
        const parsed = JSON.parse(cached.data);
        if (Array.isArray(parsed.metals) && parsed.metals.length > 0) {
          metals = parsed.metals;
          source = 'd1_database';
          updatedAt = parsed.updatedAt || updatedAt;
          advice = parsed.advice;
        }
      }
    } catch (dbErr) {
      console.warn('[MOBILE API] D1 gold fallback error:', dbErr);
    }
  }

  const mappedMetals = metals.map((m: any) => ({
    id: m.id || m.name,
    name: m.name,
    unit: m.unit || 'جرام',
    buy: typeof m.buy === 'number' ? m.buy : parseFloat(m.buy || '0'),
    sell: typeof m.sell === 'number' ? m.sell : parseFloat(m.sell || '0'),
    karat: m.karat || null,
    lastUpdate: m.lastUpdate || ''
  }));

  return c.json({
    success: true,
    source,
    currency: 'TRY',
    count: mappedMetals.length,
    updatedAt,
    lastUpdateIso: new Date(updatedAt).toISOString(),
    metals: mappedMetals,
    advice
  });
}

// ----------------------------------------------------
// 3. Jobs List Handler
// ----------------------------------------------------
async function handleJobs(c: Context) {
  const envAny = c.env as any;
  const db = envAny?.DB;

  const locale = (c.req.query('locale') || 'ar').toLowerCase();
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));
  const offset = (page - 1) * limit;
  const querySearch = (c.req.query('q') || '').trim().toLowerCase();
  const queryCategory = (c.req.query('category') || '').trim();

  let rawJobs: any[] = [];
  let totalCount = 0;

  // If first page with no filters, check CACHE_KV first for instant edge response
  if (page === 1 && !querySearch && !queryCategory && envAny?.CACHE_KV) {
    try {
      const kvRecent: any = await envAny.CACHE_KV.get('kv_jobs_recent', 'json');
      if (Array.isArray(kvRecent) && kvRecent.length > 0) {
        rawJobs = kvRecent.slice(0, limit);
        totalCount = kvRecent.length;
      }
    } catch (e) {}
  }

  // If not in KV, query D1
  if (rawJobs.length === 0 && db) {
    try {
      let sql = `
        SELECT j.id, j.slug, j.data, j.published_at
        FROM documents j
        WHERE j.type_id = 'jobs' AND j.status = 'published' AND j.is_published = 1
      `;
      const params: any[] = [];

      if (queryCategory) {
        sql += ` AND (
          EXISTS (
            SELECT 1 FROM document_references ref 
            WHERE ref.from_document_id = j.id AND ref.field_name = 'category' AND (ref.to_root_id = ? OR ref.to_root_id = (SELECT id FROM documents WHERE slug = ? LIMIT 1))
          ) OR json_extract(j.data, '$.category') = ?
        )`;
        params.push(queryCategory, queryCategory, queryCategory);
      }

      sql += ` ORDER BY j.published_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const jobRows = await safeQuery(() => db.prepare(sql).bind(...params).all(), 1, 50);
      if (jobRows?.results) {
        rawJobs = jobRows.results.map((row: any) => {
          let parsedData: any = {};
          try {
            parsedData = JSON.parse(row.data);
          } catch (e) {}
          return {
            id: row.id,
            slug: row.slug,
            publishedAt: row.published_at,
            ...parsedData
          };
        });
      }

      // Total count query
      const countRes = await safeQuery(() => db.prepare(
        `SELECT COUNT(*) as count FROM documents WHERE type_id = 'jobs' AND status = 'published' AND is_published = 1`
      ).first(), 1, 50);
      totalCount = (countRes?.count as number) || rawJobs.length;
    } catch (err: any) {
      console.warn('[MOBILE API] Jobs query error:', err.message);
    }
  }

  // Filter by querySearch if provided
  let filteredJobs = rawJobs;
  if (querySearch) {
    filteredJobs = rawJobs.filter((job: any) => {
      const tAr = (job.title_ar || '').toLowerCase();
      const tEn = (job.title_en || '').toLowerCase();
      const tTr = (job.title_tr || '').toLowerCase();
      const dAr = (job.description_ar || '').toLowerCase();
      const dEn = (job.description_en || '').toLowerCase();
      const dTr = (job.description_tr || '').toLowerCase();
      const comp = (job.companyName || job.company || '').toLowerCase();
      const loc = (job.location_ar || job.location_en || job.location_tr || job.location || '').toLowerCase();

      return tAr.includes(querySearch) || tEn.includes(querySearch) || tTr.includes(querySearch) ||
             dAr.includes(querySearch) || dEn.includes(querySearch) || dTr.includes(querySearch) ||
             comp.includes(querySearch) || loc.includes(querySearch);
    });
  }

  // Format jobs with proper localization fallback according to user rules
  const formattedJobs = filteredJobs.map((job: any) => {
    const title = resolveLocalizedText(job, 'title', locale);
    const description = resolveLocalizedText(job, 'description', locale);
    const locationStr = resolveLocalizedText(job, 'location', locale);
    const company = job.companyName || job.company || 'شركة في إسطنبول';
    const slug = job.slug || job.id;

    // Image URL normalization
    let imageUrl = job.imageUrl || '';
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `https://jobs-in-istanbul.com/api/jobs/image?key=${encodeURIComponent(imageUrl)}`;
    }

    return {
      id: job.id,
      slug,
      title,
      company,
      location: locationStr || 'إسطنبول، تركيا',
      jobType: job.jobType || 'full-time',
      salary: job.salary || null,
      description: description.substring(0, 250) + (description.length > 250 ? '...' : ''),
      imageUrl: imageUrl || null,
      publishedAt: job.publishedAt || Date.now(),
      webUrl: `https://jobs-in-istanbul.com/${locale}/jobs/${slug}`,
      contactPhone: job.contactPhone || null,
      contactWhatsapp: job.contactWhatsapp || null,
      contactEmail: job.contactEmail || null
    };
  });

  return c.json({
    success: true,
    page,
    limit,
    total: totalCount,
    hasMore: (offset + formattedJobs.length) < totalCount,
    locale,
    jobs: formattedJobs
  });
}

// ----------------------------------------------------
// 4. Single Job Details Handler
// ----------------------------------------------------
async function handleJobDetail(c: Context) {
  const envAny = c.env as any;
  const db = envAny?.DB;
  const idOrSlug = c.req.param('idOrSlug');
  const locale = (c.req.query('locale') || 'ar').toLowerCase();

  // 1. Check CACHE_KV first for instant zero-D1 response
  if (envAny?.CACHE_KV) {
    try {
      const kvRecent: any = await envAny.CACHE_KV.get('kv_jobs_recent', 'json');
      if (Array.isArray(kvRecent)) {
        const found = kvRecent.find((j: any) => j.id === idOrSlug || j.slug === idOrSlug);
        if (found) {
          const title = resolveLocalizedText(found, 'title', locale);
          const description = resolveLocalizedText(found, 'description', locale);
          const locationStr = resolveLocalizedText(found, 'location', locale);
          const requirements = resolveLocalizedText(found, 'requirements', locale);
          const company = found.companyName || found.company || 'شركة في إسطنبول';
          const slug = found.slug || found.id;

          let imageUrl = found.imageUrl || '';
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https://jobs-in-istanbul.com/api/jobs/image?key=${encodeURIComponent(imageUrl)}`;
          }

          return c.json({
            success: true,
            source: 'kv_cache',
            job: {
              id: found.id,
              slug,
              title,
              company,
              location: locationStr || 'إسطنبول، تركيا',
              jobType: found.jobType || 'full-time',
              salary: found.salary || null,
              description,
              requirements: requirements || null,
              skills: found.skills || [],
              imageUrl: imageUrl || null,
              publishedAt: found.publishedAt || Date.now(),
              webUrl: `https://jobs-in-istanbul.com/${locale}/jobs/${slug}`,
              contactPhone: found.contactPhone || null,
              contactWhatsapp: found.contactWhatsapp || null,
              contactEmail: found.contactEmail || null,
              sourceUrl: found.sourceUrl || null
            }
          });
        }
      }
    } catch (e) {}
  }

  if (!db) {
    return c.json({ success: false, error: 'Database binding unavailable' }, 500);
  }

  try {
    const row: any = await safeQuery(() => db.prepare(
      `SELECT id, slug, data, published_at FROM documents WHERE type_id = 'jobs' AND (id = ? OR slug = ?) AND status = 'published' AND is_published = 1 LIMIT 1`
    ).bind(idOrSlug, idOrSlug).first(), 1, 50).catch((d1Err: any) => {
      console.warn('[MOBILE API] D1 job detail query error:', d1Err.message);
      return null;
    });

    if (!row) {
      return c.json({ success: false, error: 'Job not found or temporarily unavailable' }, 404);
    }

    let jobData: any = {};
    try {
      jobData = JSON.parse(row.data);
    } catch (e) {}

    const title = resolveLocalizedText(jobData, 'title', locale);
    const description = resolveLocalizedText(jobData, 'description', locale);
    const locationStr = resolveLocalizedText(jobData, 'location', locale);
    const requirements = resolveLocalizedText(jobData, 'requirements', locale);
    const company = jobData.companyName || jobData.company || 'شركة في إسطنبول';
    const slug = row.slug || row.id;

    let imageUrl = jobData.imageUrl || '';
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `https://jobs-in-istanbul.com/api/jobs/image?key=${encodeURIComponent(imageUrl)}`;
    }

    return c.json({
      success: true,
      job: {
        id: row.id,
        slug,
        title,
        company,
        location: locationStr || 'إسطنبول، تركيا',
        jobType: jobData.jobType || 'full-time',
        salary: jobData.salary || null,
        description,
        requirements: requirements || null,
        skills: jobData.skills || [],
        imageUrl: imageUrl || null,
        publishedAt: row.published_at,
        webUrl: `https://jobs-in-istanbul.com/${locale}/jobs/${slug}`,
        contactPhone: jobData.contactPhone || null,
        contactWhatsapp: jobData.contactWhatsapp || null,
        contactEmail: jobData.contactEmail || null,
        sourceUrl: jobData.sourceUrl || null
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
}

// ----------------------------------------------------
// 5. Combined Feed Dashboard Handler
// ----------------------------------------------------
async function handleFeed(c: Context) {
  const envAny = c.env as any;
  const locale = (c.req.query('locale') || 'ar').toLowerCase();

  // 1. Get Currencies
  let currencies: any[] = fallbackCurrencyPrices;
  if (envAny?.CACHE_KV) {
    try {
      const kvData: any = await envAny.CACHE_KV.get('kv_currency_prices', 'json');
      if (kvData?.prices?.length > 0) currencies = kvData.prices;
    } catch (e) {}
  }
  const topCurrencies = currencies.slice(0, 4).map((p: any) => ({
    code: p.code,
    name: p.name,
    buy: typeof p.buy === 'number' ? p.buy : parseFloat(p.buy || '0'),
    sell: typeof p.sell === 'number' ? p.sell : parseFloat(p.sell || '0'),
    change1d: p.change?.['1d'] || '0.00'
  }));

  // 2. Get Gold
  let metals: any[] = fallbackGoldPrices;
  if (envAny?.CACHE_KV) {
    try {
      const kvData: any = await envAny.CACHE_KV.get('kv_gold_prices', 'json');
      if (kvData?.metals?.length > 0) metals = kvData.metals;
    } catch (e) {}
  }
  const topGold = metals.slice(0, 4).map((m: any) => ({
    id: m.id || m.name,
    name: m.name,
    buy: typeof m.buy === 'number' ? m.buy : parseFloat(m.buy || '0'),
    sell: typeof m.sell === 'number' ? m.sell : parseFloat(m.sell || '0')
  }));

  // 3. Get Latest 5 Jobs
  let latestJobs: any[] = [];
  if (envAny?.CACHE_KV) {
    try {
      const kvRecent: any = await envAny.CACHE_KV.get('kv_jobs_recent', 'json');
      if (Array.isArray(kvRecent) && kvRecent.length > 0) {
        latestJobs = kvRecent.slice(0, 5).map((job: any) => ({
          id: job.id,
          slug: job.slug || job.id,
          title: resolveLocalizedText(job, 'title', locale),
          company: job.companyName || job.company || 'إسطنبول',
          publishedAt: job.publishedAt || Date.now()
        }));
      }
    } catch (e) {}
  }

  return c.json({
    success: true,
    timestamp: Date.now(),
    currencies: topCurrencies,
    gold: topGold,
    latestJobs
  });
}

// ----------------------------------------------------
// 6. Push Notification Broadcast Handler
// ----------------------------------------------------
async function handleBroadcast(c: Context) {
  const envAny = c.env as any;
  const authHeader = c.req.header('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // Basic security: require matching JWT_SECRET or BETTER_AUTH_SECRET
  const validSecret = envAny?.JWT_SECRET || envAny?.BETTER_AUTH_SECRET || 'jobs-istanbul-secret';
  if (!token || token !== validSecret) {
    return c.json({ error: 'Unauthorized: Invalid secret key' }, 401);
  }

  try {
    const body = await c.req.json();
    const result = await sendFcmNotification(envAny, {
      topic: body.topic || 'turkey_jobs',
      token: body.token,
      title: body.title || 'إشعار جديد',
      body: body.body || '',
      data: body.data || {}
    });

    return c.json({ success: result.success, message: result.message || 'Notification processed' });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
}

const handleConfig = async (c: Context) => {
  return c.json({
    success: true,
    app: {
      name: 'Jobs in Istanbul',
      packageName: 'com.jobsistanbul.app',
      version: '1.0.0',
      buildNumber: 1,
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.jobsistanbul.app',
      supportedLanguages: ['ar', 'en', 'tr', 'ru', 'fa', 'ur'],
      defaultLanguage: 'ar',
      features: {
        currencyPrices: true,
        goldPrices: true,
        osbMap: true,
        dilekceGenerator: true,
        turkishVocabulary: true,
        digitalBusinessCard: true
      }
    }
  });
};

// ----------------------------------------------------
// Register Routes for /api/v1/..., /api/..., and /api/mobile/...
// ----------------------------------------------------
mobileApiRouter.get('/api/v1/currencies', handleCurrencies);
mobileApiRouter.get('/api/currencies', handleCurrencies);
mobileApiRouter.get('/api/mobile/currencies', handleCurrencies);

mobileApiRouter.get('/api/v1/gold', handleGold);
mobileApiRouter.get('/api/gold', handleGold);
mobileApiRouter.get('/api/mobile/gold', handleGold);

mobileApiRouter.get('/api/v1/jobs', handleJobs);
mobileApiRouter.get('/api/jobs', handleJobs);
mobileApiRouter.get('/api/mobile/jobs', handleJobs);

mobileApiRouter.get('/api/v1/jobs/:idOrSlug', handleJobDetail);
mobileApiRouter.get('/api/jobs/:idOrSlug', handleJobDetail);
mobileApiRouter.get('/api/mobile/jobs/:idOrSlug', handleJobDetail);

mobileApiRouter.get('/api/v1/feed', handleFeed);
mobileApiRouter.get('/api/feed', handleFeed);
mobileApiRouter.get('/api/mobile/feed', handleFeed);

mobileApiRouter.get('/api/v1/config', handleConfig);
mobileApiRouter.get('/api/config', handleConfig);
mobileApiRouter.get('/api/mobile/config', handleConfig);

mobileApiRouter.post('/api/v1/notifications/broadcast', handleBroadcast);
mobileApiRouter.post('/api/notifications/broadcast', handleBroadcast);
mobileApiRouter.post('/api/mobile/notifications/broadcast', handleBroadcast);
