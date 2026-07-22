import { Hono } from 'hono'
import { FAVICON_BASE64 } from '../utils/logo-base64'
import { ISTANBUL_DISTRICTS } from './public'

export const seoRouter = new Hono()

// robots.txt handler
seoRouter.get('/robots.txt', (c) => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /login
Disallow: /register
Disallow: /install

Sitemap: https://jobs-in-istanbul.com/sitemap.xml
`;
  return c.text(robots)
})

// sitemap.xml handler (Sitemap Index)
seoRouter.get('/sitemap.xml', (c) => {
  const siteUrl = 'https://jobs-in-istanbul.com';
  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap-static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-jobs.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-blog.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-districts.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  });
})

// sitemap-static.xml handler (Static pages and Category queries)
seoRouter.get('/sitemap-static.xml', async (c) => {
  const db = (c.env as any).DB;
  const siteUrl = 'https://jobs-in-istanbul.com';
  const now = new Date().toISOString().split('T')[0];

  // Fetch all categories
  const catRows = await db.prepare(
    `SELECT slug FROM documents WHERE type_id = 'categories' AND status = 'published' AND is_published = 1`
  ).all();

  const categories = catRows.results || [];

  // Static routes
  const staticRoutes = [
    { ar: '/ar', en: '/en', tr: '/tr', ru: '/ru', fa: '/fa', ur: '/ur' },
    { ar: '/ar/submit-job', en: '/en/submit-job', tr: '/tr/submit-job', ru: '/ru/submit-job', fa: '/fa/submit-job', ur: '/ur/submit-job' },
    { ar: '/ar/blog', en: '/en/blog', tr: '/tr/blog', ru: '/ru/blog', fa: '/fa/blog', ur: '/ur/blog' },
    { ar: '/ar/currency-prices', en: '/en/currency-prices', tr: '/tr/currency-prices', ru: '/ru/currency-prices', fa: '/fa/currency-prices', ur: '/ur/currency-prices' },
    { ar: '/ar/gold-prices', en: '/en/gold-prices', tr: '/tr/gold-prices', ru: '/ru/gold-prices', fa: '/fa/gold-prices', ur: '/ur/gold-prices' },
    { ar: '/ar/cv-optimizer', en: '/en/cv-optimizer', tr: '/tr/cv-optimizer', ru: '/ru/cv-optimizer', fa: '/fa/cv-optimizer', ur: '/ur/cv-optimizer' },
    { ar: '/ar/salary-calculator', en: '/en/salary-calculator', tr: '/tr/salary-calculator', ru: '/ru/salary-calculator', fa: '/fa/salary-calculator', ur: '/ur/salary-calculator' },
    { ar: '/ar/resume-builder', en: '/en/resume-builder', tr: '/tr/resume-builder', ru: '/ru/resume-builder', fa: '/fa/resume-builder', ur: '/ur/resume-builder' },
    { ar: '/ar/cover-letter-generator', en: '/en/cover-letter-generator', tr: '/tr/cover-letter-generator', ru: '/ru/cover-letter-generator', fa: '/fa/cover-letter-generator', ur: '/ur/cover-letter-generator' },
    { ar: '/ar/work-permit-calculator', en: '/en/work-permit-calculator', tr: '/tr/work-permit-calculator', ru: '/ru/work-permit-calculator', fa: '/fa/work-permit-calculator', ur: '/ur/work-permit-calculator' },
    { ar: '/ar/turkish-test', en: '/en/turkish-test', tr: '/tr/turkish-test', ru: '/ru/turkish-test', fa: '/fa/turkish-test', ur: '/ur/turkish-test' },
    { ar: '/ar/interview-prep', en: '/en/interview-prep', tr: '/tr/interview-prep', ru: '/ru/interview-prep', fa: '/fa/interview-prep', ur: '/ur/interview-prep' },
    { ar: '/ar/ats-scanner', en: '/en/ats-scanner', tr: '/tr/ats-scanner', ru: '/ru/ats-scanner', fa: '/fa/ats-scanner', ur: '/ur/ats-scanner' },
    { ar: '/ar/workplace-quiz', en: '/en/workplace-quiz', tr: '/tr/workplace-quiz', ru: '/ru/workplace-quiz', fa: '/fa/workplace-quiz', ur: '/ur/workplace-quiz' },
    { ar: '/ar/insights', en: '/en/insights', tr: '/tr/insights', ru: '/ru/insights', fa: '/fa/insights', ur: '/ur/insights' },
    { ar: '/ar/about', en: '/en/about', tr: '/tr/about', ru: '/ru/about', fa: '/fa/about', ur: '/ur/about' },
    { ar: '/ar/contact', en: '/en/contact', tr: '/tr/contact', ru: '/ru/contact', fa: '/fa/contact', ur: '/ur/contact' },
    { ar: '/ar/privacy', en: '/en/privacy', tr: '/tr/privacy', ru: '/ru/privacy', fa: '/fa/privacy', ur: '/ur/privacy' },
    { ar: '/ar/terms', en: '/en/terms', tr: '/tr/terms', ru: '/ru/terms', fa: '/fa/terms', ur: '/ur/terms' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // 1. Static pages
  for (const route of staticRoutes) {
    for (const loc of ['ar', 'en', 'tr', 'ru', 'fa', 'ur'] as const) {
      xml += `
  <url>
    <loc>${siteUrl}${route[loc]}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${siteUrl}${route.ar}" />
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${route.en}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${siteUrl}${route.tr}" />
    <xhtml:link rel="alternate" hreflang="ru" href="${siteUrl}${route.ru}" />
    <xhtml:link rel="alternate" hreflang="fa" href="${siteUrl}${route.fa}" />
    <xhtml:link rel="alternate" hreflang="ur" href="${siteUrl}${route.ur}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${route.en}" />
  </url>`;
    }
  }

  // 2. Categories
  for (const cat of categories) {
    const arUrl = `${siteUrl}/ar?category=${cat.slug}`;
    const enUrl = `${siteUrl}/en?category=${cat.slug}`;
    const trUrl = `${siteUrl}/tr?category=${cat.slug}`;
    const ruUrl = `${siteUrl}/ru?category=${cat.slug}`;
    const faUrl = `${siteUrl}/fa?category=${cat.slug}`;
    const urUrl = `${siteUrl}/ur?category=${cat.slug}`;
    for (const [, url] of [['ar', arUrl], ['en', enUrl], ['tr', trUrl], ['ru', ruUrl], ['fa', faUrl], ['ur', urUrl]] as const) {
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${trUrl}" />
    <xhtml:link rel="alternate" hreflang="ru" href="${ruUrl}" />
    <xhtml:link rel="alternate" hreflang="fa" href="${faUrl}" />
    <xhtml:link rel="alternate" hreflang="ur" href="${urUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/en?category=${cat.slug}" />
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})

// sitemap-jobs.xml handler (Job posts)
seoRouter.get('/sitemap-jobs.xml', async (c) => {
  const db = (c.env as any).DB;
  const siteUrl = 'https://jobs-in-istanbul.com';

  // Fetch all published jobs
  const jobRows = await db.prepare(
    `SELECT slug, updated_at FROM documents WHERE type_id = 'jobs' AND status = 'published' AND is_published = 1`
  ).all();

  const jobs = jobRows.results || [];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // 3. Jobs
  for (const job of jobs) {
    const jobDate = new Date(job.updated_at).toISOString().split('T')[0];
    const arUrl = `${siteUrl}/ar/jobs/${job.slug}`;
    const enUrl = `${siteUrl}/en/jobs/${job.slug}`;
    const trUrl = `${siteUrl}/tr/jobs/${job.slug}`;
    const ruUrl = `${siteUrl}/ru/jobs/${job.slug}`;
    const faUrl = `${siteUrl}/fa/jobs/${job.slug}`;
    const urUrl = `${siteUrl}/ur/jobs/${job.slug}`;
    for (const url of [arUrl, enUrl, trUrl, ruUrl, faUrl, urUrl]) {
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${jobDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${trUrl}" />
    <xhtml:link rel="alternate" hreflang="ru" href="${ruUrl}" />
    <xhtml:link rel="alternate" hreflang="fa" href="${faUrl}" />
    <xhtml:link rel="alternate" hreflang="ur" href="${urUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  });
})

// sitemap-blog.xml handler (Blog posts)
seoRouter.get('/sitemap-blog.xml', async (c) => {
  const db = (c.env as any).DB;
  const siteUrl = 'https://jobs-in-istanbul.com';
  const now = new Date().toISOString().split('T')[0];

  // Fetch all blog posts
  let blogs: any[] = [];
  try {
    const blogRows = await db.prepare(
      `SELECT slug, updated_at FROM documents WHERE type_id = 'blog_post' AND status = 'published' AND is_published = 1`
    ).all();
    blogs = blogRows.results || [];
  } catch (err) {
    console.error('Sitemap: Failed to query blog posts:', err);
  }

  // 4. Blog Posts
  const staticBlogSlugs = [
    'nursing-jobs-in-istanbul-for-arabs-2026-guide',
    'working-in-turkey-for-arab-women-2026-guide',
    'jobs-in-turkey-for-egyptians-2026-guide',
    'work-permit-turkey-syrians-arabs-2026-guide',
    'sgk-health-insurance-turkey-workers',
    'open-bank-account-turkey-foreigners',
    'best-dental-implants-clinic-turkey',
    'turkey-work-permit-residency-laws',
    'optimize-resume-to-pass-ats-systems',
    'avoid-istanbul-traffic-and-transportation-tips',
    'turkey-minimum-wage-employer-cost-2026',
    'jobs-in-istanbul-vacancies-weekly-update-july-2026'
  ];
  const allBlogSlugs = Array.from(new Set([
    ...staticBlogSlugs,
    ...blogs.map(b => b.slug)
  ]));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  for (const slug of allBlogSlugs) {
    const dbBlog = blogs.find(b => b.slug === slug);
    const blogDate = dbBlog && dbBlog.updated_at
      ? new Date(dbBlog.updated_at).toISOString().split('T')[0]
      : now;
    const arUrl = `${siteUrl}/ar/blog/${slug}`;
    const enUrl = `${siteUrl}/en/blog/${slug}`;
    const trUrl = `${siteUrl}/tr/blog/${slug}`;
    const ruUrl = `${siteUrl}/ru/blog/${slug}`;
    const faUrl = `${siteUrl}/fa/blog/${slug}`;
    const urUrl = `${siteUrl}/ur/blog/${slug}`;
    for (const url of [arUrl, enUrl, trUrl, ruUrl, faUrl, urUrl]) {
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${blogDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${trUrl}" />
    <xhtml:link rel="alternate" hreflang="ru" href="${ruUrl}" />
    <xhtml:link rel="alternate" hreflang="fa" href="${faUrl}" />
    <xhtml:link rel="alternate" hreflang="ur" href="${urUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})

// rss.xml handler
seoRouter.get('/rss.xml', async (c) => {
  const db = (c.env as any).DB;
  const siteUrl = 'https://jobs-in-istanbul.com';

  const jobRows = await db.prepare(
    `SELECT j.id, j.slug, j.data, j.published_at
     FROM documents j
     WHERE j.type_id = 'jobs' AND j.status = 'published' AND j.is_published = 1
     ORDER BY j.published_at DESC LIMIT 30`
  ).all();

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Istanbul Jobs | فرص عمل في إسطنبول</title>
  <link>${siteUrl}/ar</link>
  <description>Latest job opportunities in Istanbul metropolitan area / أحدث الوظائف الشاغرة وفرص العمل في إسطنبول</description>
  <language>ar</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />`;

  for (const row of jobRows.results || []) {
    const job = JSON.parse(row.data);
    const pubDate = new Date(row.published_at).toUTCString();

    rss += `
  <item>
    <title><![CDATA[${job.title_ar} | ${job.title_en}]]></title>
    <link>${siteUrl}/ar/jobs/${row.slug}</link>
    <guid>${siteUrl}/ar/jobs/${row.slug}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[${job.description_ar}]]></description>
  </item>`;
  }

  rss += `
</channel>
</rss>`;

  return c.body(rss, 200, {
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  })
})

// Google Search Console HTML Verification File handler (Regex matching google[code].html)
seoRouter.get('/:filename{google[0-9a-zA-Z]+\\.html}', (c) => {
  const filename = c.req.param('filename');
  const code = filename.substring(6, filename.length - 5);
  return c.text(`google-site-verification: google${code}.html`, 200, {
    'Content-Type': 'text/html; charset=utf-8'
  });
})

// PWA manifest.json handler
seoRouter.get('/manifest.json', (c) => {
  const manifest = {
    name: 'Jobs in Istanbul | فرص عمل في إسطنبول',
    short_name: 'Jobs in Istanbul',
    description: 'Premium Job Board for Istanbul - المنصة الرائدة لربط الكفاءات بأفضل فرص العمل في إسطنبول',
    start_url: '/ar',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#007bff',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        type: 'image/png',
        sizes: '192x192',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'any maskable'
      }
    ]
  };
  return c.json(manifest, 200, {
    'Cache-Control': 'public, max-age=86400'
  });
})

// PWA Service Worker handler
seoRouter.get('/sw.js', (c) => {
  const swCode = `const CACHE_NAME = 'jobs-istanbul-cache-v1';
const ASSETS_TO_CACHE = [
  '/css/theme.css',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  if (
    ASSETS_TO_CACHE.includes(url.pathname) || 
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});`;
  return c.body(swCode, 200, {
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'public, max-age=3600'
  });
})

// PWA Icons handler
const serveIcon = async (c: any) => {
  const env: any = c.env;
  try {
    const bucket = env.MEDIA_BUCKET;
    if (bucket) {
      const path = c.req.path.slice(1); // e.g. "icon-192.png"
      let object = await bucket.get(`public/images/${path}`);
      if (!object) {
        object = await bucket.get('public/images/logo.png');
      }

      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Content-Type', 'image/png');
        headers.set('Cache-Control', 'public, max-age=86400');
        return c.body(object.body, 200, Object.fromEntries(headers.entries()));
      }
    }
  } catch (err: any) {
    console.error('Failed to load PWA icon from R2, using fallback:', err);
  }

  // Fallback to built-in logo
  const logoBuffer = Buffer.from(FAVICON_BASE64, 'base64');
  return c.body(logoBuffer, 200, {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=86400'
  });
};

seoRouter.get('/icon-192.png', serveIcon);
seoRouter.get('/icon-512.png', serveIcon);

// sitemap-districts.xml handler (Programmatic District SEO)
seoRouter.get('/sitemap-districts.xml', (c) => {
  const siteUrl = 'https://jobs-in-istanbul.com';
  const now = new Date().toISOString().split('T')[0];
  const locales = ['ar', 'en', 'tr', 'ru', 'fa', 'ur'] as const;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  for (const dist of ISTANBUL_DISTRICTS) {
    const slug = dist.en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    for (const loc of locales) {
      xml += `
  <url>
    <loc>${siteUrl}/${loc}/district/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${siteUrl}/ar/district/${slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/district/${slug}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${siteUrl}/tr/district/${slug}" />
    <xhtml:link rel="alternate" hreflang="ru" href="${siteUrl}/ru/district/${slug}" />
    <xhtml:link rel="alternate" hreflang="fa" href="${siteUrl}/fa/district/${slug}" />
    <xhtml:link rel="alternate" hreflang="ur" href="${siteUrl}/ur/district/${slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/en/district/${slug}" />
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
});

// IndexNow key verification endpoint (matches any [key].txt)
seoRouter.get('/:key{[a-zA-Z0-9_-]+\\.txt}', (c) => {
  const keyParam = c.req.param('key').replace('.txt', '');
  const envKey = (c.env as any).INDEXNOW_KEY || 'jobs-istanbul-indexnow-2026-key';
  
  if (keyParam === envKey || keyParam.startsWith('jobs-istanbul-indexnow')) {
    return c.text(envKey, 200, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
  }

  return c.text('Not Found', 404);
});


