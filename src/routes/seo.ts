import { Hono } from 'hono'

export const seoRouter = new Hono()

// robots.txt handler
seoRouter.get('/robots.txt', (c) => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

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
    { ar: '/ar', en: '/en' },
    { ar: '/ar/submit-job', en: '/en/submit-job' },
    { ar: '/ar/blog', en: '/en/blog' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // 1. Static pages
  for (const route of staticRoutes) {
    xml += `
  <url>
    <loc>${siteUrl}${route.ar}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${siteUrl}${route.ar}" />
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${route.en}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${route.ar}" />
  </url>
  <url>
    <loc>${siteUrl}${route.en}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${siteUrl}${route.ar}" />
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}${route.en}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${route.ar}" />
  </url>`;
  }

  // 2. Categories
  for (const cat of categories) {
    const arUrl = `${siteUrl}/ar?category=${cat.slug}`;
    const enUrl = `${siteUrl}/en?category=${cat.slug}`;
    xml += `
  <url>
    <loc>${arUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
  </url>`;
  }

  // 3. Jobs
  for (const job of jobs) {
    const jobDate = new Date(job.updated_at).toISOString().split('T')[0];
    const arUrl = `${siteUrl}/ar/jobs/${job.slug}`;
    const enUrl = `${siteUrl}/en/jobs/${job.slug}`;
    xml += `
  <url>
    <loc>${arUrl}</loc>
    <lastmod>${jobDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${arUrl}" />
  </url>
  <url>
    <loc>${enUrl}</loc>
    <lastmod>${jobDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${arUrl}" />
  </url>`;
  }

  // 4. Blog Posts
  const staticBlogSlugs = [
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
    xml += `
  <url>
    <loc>${arUrl}</loc>
    <lastmod>${blogDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${arUrl}" />
  </url>
  <url>
    <loc>${enUrl}</loc>
    <lastmod>${blogDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${arUrl}" />
  </url>`;
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
