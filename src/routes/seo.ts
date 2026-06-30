import { Hono } from 'hono'
import { FAVICON_BASE64 } from '../utils/logo-base64'

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

Sitemap: https://jobs-in-istanbul.com/sitemap.xml
`;
  return c.text(robots)
})

// sitemap.xml handler
seoRouter.get('/sitemap.xml', async (c) => {
  const db = (c.env as any).DB;
  const siteUrl = 'https://jobs-in-istanbul.com';
  const now = new Date().toISOString().split('T')[0];

  // Fetch all published jobs
  const jobRows = await db.prepare(
    `SELECT slug, updated_at FROM documents WHERE type_id = 'jobs' AND status = 'published' AND is_published = 1`
  ).all();

  const jobs = jobRows.results || [];

  // Fetch all categories
  const catRows = await db.prepare(
    `SELECT slug FROM documents WHERE type_id = 'categories' AND status = 'published' AND is_published = 1`
  ).all();

  const categories = catRows.results || [];

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

  // Static routes
  const staticRoutes = [
    { ar: '/ar', en: '/en', tr: '/tr' },
    { ar: '/ar/submit-job', en: '/en/submit-job', tr: '/tr/submit-job' },
    { ar: '/ar/blog', en: '/en/blog', tr: '/tr/blog' },
    { ar: '/ar/currency-prices', en: '/en/currency-prices', tr: '/tr/currency-prices' },
    { ar: '/ar/gold-prices', en: '/en/gold-prices', tr: '/tr/gold-prices' },
    { ar: '/ar/install', en: '/en/install', tr: '/tr/install' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // 1. Static pages
  for (const route of staticRoutes) {
    for (const loc of ['ar', 'en', 'tr'] as const) {
      xml += `
  <url>
    <loc>${siteUrl}${route[loc]}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${siteUrl}${route.ar}" />
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${route.en}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${siteUrl}${route.tr}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${route.ar}" />
  </url>`;
    }
  }

  // 2. Categories
  for (const cat of categories) {
    const arUrl = `${siteUrl}/ar?category=${cat.slug}`;
    const enUrl = `${siteUrl}/en?category=${cat.slug}`;
    const trUrl = `${siteUrl}/tr?category=${cat.slug}`;
    for (const [, url] of [['ar', arUrl], ['en', enUrl], ['tr', trUrl]] as const) {
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${trUrl}" />
  </url>`;
    }
  }

  // 3. Jobs
  for (const job of jobs) {
    const jobDate = new Date(job.updated_at).toISOString().split('T')[0];
    const arUrl = `${siteUrl}/ar/jobs/${job.slug}`;
    const enUrl = `${siteUrl}/en/jobs/${job.slug}`;
    const trUrl = `${siteUrl}/tr/jobs/${job.slug}`;
    for (const url of [arUrl, enUrl, trUrl]) {
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${jobDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${trUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${arUrl}" />
  </url>`;
    }
  }

  // 4. Blog Posts
  const staticBlogSlugs = [
    'best-dental-implants-clinic-turkey',
    'turkey-work-permit-residency-laws',
    'optimize-resume-to-pass-ats-systems',
    'avoid-istanbul-traffic-and-transportation-tips',
    'turkey-minimum-wage-employer-cost-2026'
  ];
  const allBlogSlugs = Array.from(new Set([
    ...staticBlogSlugs,
    ...blogs.map(b => b.slug)
  ]));

  for (const slug of allBlogSlugs) {
    const dbBlog = blogs.find(b => b.slug === slug);
    const blogDate = dbBlog && dbBlog.updated_at
      ? new Date(dbBlog.updated_at).toISOString().split('T')[0]
      : now;
    const arUrl = `${siteUrl}/ar/blog/${slug}`;
    const enUrl = `${siteUrl}/en/blog/${slug}`;
    const trUrl = `${siteUrl}/tr/blog/${slug}`;
    for (const url of [arUrl, enUrl, trUrl]) {
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${blogDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${trUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${arUrl}" />
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  })
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

// Google Search Console HTML Verification File handler
seoRouter.get('/google:code.html', (c) => {
  const code = c.req.param('code');
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
    start_url: '/',
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
  '/icon-192.png'
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

