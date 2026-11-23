import { Hono } from 'hono'
import { ICON_192_BASE64, LOGO_BASE64 } from '../utils/logo-base64'
import { ISTANBUL_DISTRICTS } from './public'
import { safeQuery } from '../utils/db-helper'
import { seededArticles, getArticleAvailableLocales, EXCLUDED_SITEMAP_BLOG_SLUGS } from './career-blog'
import { getFallbackJobs, getFallbackCategories } from '../data/fallback-dataset'
import { getJobFreshnessCutoffMs, getJobNativeLocales, JOB_COMPARE_CHARS } from '../utils/job-validity'
import { getNativeLocales } from '../utils/seo-links'

export const seoRouter = new Hono()

// robots.txt handler — Explicitly welcomes all Global, Regional, Mobile & AI Search Engines
seoRouter.get('/robots.txt', (c) => {
  const robots = `User-agent: Googlebot
User-agent: Googlebot-Image
User-agent: Googlebot-News
User-agent: Mediapartners-Google
User-agent: Bingbot
User-agent: MSNBot
User-agent: Slurp
User-agent: DuckDuckBot
User-agent: Yandex
User-agent: YandexBot
User-agent: YandexImages
User-agent: Applebot
User-agent: Applebot-Extended
User-agent: Bravebot
User-agent: PetalBot
User-agent: SeznamBot
User-agent: Yeti
User-agent: Baiduspider
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: GPTBot
User-agent: PerplexityBot
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: Google-Extended
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /login
Disallow: /register
Disallow: /install

User-agent: Bytespider
User-agent: AhrefsBot
User-agent: SemrushBot
User-agent: MJ12bot
User-agent: DotBot
User-agent: BLEXBot
User-agent: DataForSeoBot
User-agent: Barkrowler
User-agent: SeekportBot
User-agent: MegaIndex
User-agent: Scrapy
Disallow: /

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /login
Disallow: /register
Disallow: /install

Host: https://jobs-in-istanbul.com
Sitemap: https://jobs-in-istanbul.com/sitemap.xml
Sitemap: https://jobs-in-istanbul.com/sitemap-static.xml
Sitemap: https://jobs-in-istanbul.com/sitemap-jobs.xml
Sitemap: https://jobs-in-istanbul.com/sitemap-companies.xml
Sitemap: https://jobs-in-istanbul.com/sitemap-blog.xml
Sitemap: https://jobs-in-istanbul.com/sitemap-districts.xml
`;
  return c.text(robots, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})

// AI Search Engines Discovery Standard (ChatGPT Search, Perplexity, Claude, Gemini, Copilot)
const buildLlmsTxt = (full: boolean) => {
  const base = `# Jobs in Istanbul | فرص عمل في إسطنبول | İstanbul İş İlanları
> Official multilingual employment portal, employer directory, Turkish labor law calculator suite, and daily Istanbul utility platform serving Arabic, Turkish, and English speakers in Istanbul, Türkiye.

- Canonical Domain: https://jobs-in-istanbul.com
- Primary Languages: Arabic (\`/ar\`), English (\`/en\`), Turkish (\`/tr\`)
- Geographic Focus: Istanbul (TR-34) & Türkiye
- XML Sitemap Index: https://jobs-in-istanbul.com/sitemap.xml
- Live Jobs RSS Feed: https://jobs-in-istanbul.com/rss.xml

## Core Portals & Directories
- [Arabic Job Board](https://jobs-in-istanbul.com/ar): Daily updated job vacancies in Istanbul for Arabic speakers and expats.
- [English Job Board](https://jobs-in-istanbul.com/en): Verified Istanbul job openings for international professionals and expats.
- [Turkish Job Board](https://jobs-in-istanbul.com/tr): İstanbul Avrupa ve Anadolu yakası güncel iş ilanları.
- [Hiring Companies Directory](https://jobs-in-istanbul.com/ar/companies): Active employers hiring in Istanbul with open job counts.
- [Career & Work Permit Guides](https://jobs-in-istanbul.com/ar/blog): In-depth 2026 guides on Turkish work permits (Çalışma İzni), SGK, salaries, and cost of living.
- [HTML Sitemap Directory](https://jobs-in-istanbul.com/ar/sitemap): Complete crawlable index of all hubs, districts, and tools.

## High-Demand Specialized Job Hubs
- [Jobs for Arabic Speakers in Istanbul](https://jobs-in-istanbul.com/ar/jobs-for-arabs)
- [Jobs Without Turkish Language Requirement](https://jobs-in-istanbul.com/ar/jobs-without-turkish)
- [Medical Tourism Jobs in Istanbul](https://jobs-in-istanbul.com/ar/medical-tourism-jobs)
- [Real Estate & Sales Jobs in Istanbul](https://jobs-in-istanbul.com/ar/real-estate-jobs)
- [Call Center & Customer Support Jobs](https://jobs-in-istanbul.com/ar/call-center-jobs)
- [Tech & Software Developer Jobs](https://jobs-in-istanbul.com/ar/tech-developer-jobs)
- [Translation & Interpreting Jobs](https://jobs-in-istanbul.com/ar/translation-jobs)
- [Accounting & Finance Jobs](https://jobs-in-istanbul.com/ar/accounting-jobs)
- [Restaurant & Hospitality Jobs](https://jobs-in-istanbul.com/ar/restaurant-jobs)
- [Factory & Production Jobs](https://jobs-in-istanbul.com/ar/factory-jobs)
- [Driver & Delivery Jobs](https://jobs-in-istanbul.com/ar/driver-jobs)
- [Jobs for Women in Istanbul](https://jobs-in-istanbul.com/ar/jobs-for-women)
- [Part-Time & Student Jobs](https://jobs-in-istanbul.com/ar/student-jobs)
- [Entry-Level Jobs](https://jobs-in-istanbul.com/ar/entry-level-jobs)

## Live Daily Turkey Trackers & Official 2026 Calculators
- [Live TRY Currency Exchange Rates](https://jobs-in-istanbul.com/ar/currency-prices): Real-time USD, EUR, GBP, SAR to Turkish Lira rates.
- [Live Turkey Gold Prices](https://jobs-in-istanbul.com/ar/gold-prices): Gram, Quarter, 24K, 22K, 21K gold prices in TL.
- [Istanbul & Turkey Fuel Prices](https://jobs-in-istanbul.com/ar/akaryakit-fiyatlari): Daily gasoline, diesel, and LPG prices on European & Anatolian sides.
- [Istanbul On-Duty Pharmacies (Nöbetçi Eczane)](https://jobs-in-istanbul.com/ar/nobetci-eczane): Live 24/7 duty pharmacies by Istanbul district.
- [2026 Net-to-Gross Salary & SGK Tax Calculator](https://jobs-in-istanbul.com/ar/salary-calculator-2026)
- [Turkish Severance Pay Calculator (Kıdem Tazminatı)](https://jobs-in-istanbul.com/ar/kidem-tazminati-hesaplama)
- [Legal Rent Increase Calculator (Kira Artış Oranı TÜFE)](https://jobs-in-istanbul.com/ar/kira-artis-orani)
- [Turkish Work Permit Eligibility Wizard 2026](https://jobs-in-istanbul.com/ar/work-permit-eligibility)
- [Investor Company Setup & Foreign Hiring Estimator](https://jobs-in-istanbul.com/ar/investor-calculator)
- [Workplace Turkish Vocabulary Quiz](https://jobs-in-istanbul.com/ar/workplace-quiz)
`;
  if (!full) return base;
  return `${base}
## Major Istanbul District Job Portals
- [Fatih Jobs](https://jobs-in-istanbul.com/ar/district/fatih) | [Şişli Jobs](https://jobs-in-istanbul.com/ar/district/sisli) | [Başakşehir Jobs](https://jobs-in-istanbul.com/ar/district/basaksehir)
- [Esenyurt Jobs](https://jobs-in-istanbul.com/ar/district/esenyurt) | [Beylikdüzü Jobs](https://jobs-in-istanbul.com/ar/district/beylikduzu) | [Kadıköy Jobs](https://jobs-in-istanbul.com/ar/district/kadikoy)
- [Beşiktaş Jobs](https://jobs-in-istanbul.com/ar/district/besiktas) | [Beyoğlu / Taksim Jobs](https://jobs-in-istanbul.com/ar/district/beyoglu) | [Bağcılar Jobs](https://jobs-in-istanbul.com/ar/district/bagcilar)
- [Üsküdar Jobs](https://jobs-in-istanbul.com/ar/district/uskudar) | [Ataşehir Jobs](https://jobs-in-istanbul.com/ar/district/atasehir) | [Kağıthane Jobs](https://jobs-in-istanbul.com/ar/district/kagithane)
- [Sarıyer / Maslak Jobs](https://jobs-in-istanbul.com/ar/district/sariyer) | [Ümraniye Jobs](https://jobs-in-istanbul.com/ar/district/umraniye) | [Zeytinburnu Jobs](https://jobs-in-istanbul.com/ar/district/zeytinburnu)

## Official Mobile Applications (Google Play)
- Jobs in Istanbul Android App: https://play.google.com/store/apps/details?id=com.jobsistanbul.app
- Official Google Play Developer Portfolio: https://jobs-in-istanbul.com/ar/apps
- Official Telegram Jobs Channel: https://t.me/jobsistanbul
`;
};

seoRouter.get('/llms.txt', (c) => {
  return c.text(buildLlmsTxt(false), 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})

seoRouter.get('/llms-full.txt', (c) => {
  return c.text(buildLlmsTxt(true), 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})

// Bing Webmaster Tools XML Verification (also powers DuckDuckGo, Yahoo, Ecosia, Copilot)
seoRouter.get('/BingSiteAuth.xml', (c) => {
  const bingCode = (c.env as any)?.BING_SITE_VERIFICATION || '4430C081399901EF9B5BEAA4E9AD98A5';
  const xml = `<?xml version="1.0"?>\n<users>\n\t<user>${bingCode}</user>\n</users>`;
  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})

// OpenSearch 1.1 Autodiscovery Descriptor (Chrome, Edge, Firefox, Yandex Browser, Brave)
seoRouter.get('/opensearch.xml', (c) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>Jobs in Istanbul</ShortName>
  <Description>Search daily verified job vacancies in Istanbul, Türkiye (Arabic, Turkish, English)</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="96" height="96" type="image/png">https://jobs-in-istanbul.com/public/images/logo-96.png</Image>
  <Image width="16" height="16" type="image/x-icon">https://jobs-in-istanbul.com/favicon.ico</Image>
  <Url type="text/html" method="get" template="https://jobs-in-istanbul.com/ar?search={searchTerms}"/>
</OpenSearchDescription>`;
  return c.body(xml, 200, {
    'Content-Type': 'application/opensearchdescription+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})

// app-ads.txt handler (IAB Tech Lab specification)
seoRouter.get('/app-ads.txt', (c) => {
  const content = `google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0\n`;
  return c.text(content, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})

// ads.txt handler (web ads specification fallback)
seoRouter.get('/ads.txt', (c) => {
  const content = `google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0\n`;
  return c.text(content, 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})


// sitemap.xml handler (Sitemap Index)
seoRouter.get('/sitemap.xml', async (c) => {
  const siteUrl = 'https://jobs-in-istanbul.com';
  const now = new Date().toISOString().split('T')[0];

  // Additional job sitemap pages beyond sitemap-jobs.xml (page 1) when valid jobs exceed one page
  let extraJobPages = 0;
  const cacheKv = (c.env as any)?.CACHE_KV;
  try {
    let validJobs: number | null = null;
    if (cacheKv) {
      const cached = await cacheKv.get('kv_sitemap_valid_jobs_count');
      if (cached !== null && cached !== undefined) validJobs = parseInt(cached, 10);
    }
    if (validJobs === null || isNaN(validJobs)) {
      const db = (c.env as any)?.DB;
      const row: any = db ? await safeQuery(() => db.prepare(
        `SELECT COUNT(*) AS n FROM documents WHERE type_id = 'jobs' AND is_published = 1 AND status = 'published' AND deleted_at IS NULL AND published_at >= ?`
      ).bind(getJobFreshnessCutoffMs()).first(), 1, 50) : null;
      validJobs = Number(row?.n) || 0;
      if (cacheKv) cacheKv.put('kv_sitemap_valid_jobs_count', String(validJobs), { expirationTtl: 21600 }).catch(() => {});
    }
    extraJobPages = Math.max(0, Math.ceil(validJobs / SITEMAP_JOBS_PAGE_SIZE) - 1);
  } catch (e) {
    extraJobPages = 0;
  }
  const extraJobSitemaps = Array.from({ length: extraJobPages }, (_, i) => `
  <sitemap>
    <loc>${siteUrl}/sitemap-jobs-${i + 2}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap-static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/sitemap-jobs.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>${extraJobSitemaps}
  <sitemap>
    <loc>${siteUrl}/sitemap-companies.xml</loc>
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
  let categories: any[] = [];
  try {
    const catRows = await safeQuery(() => db.prepare(
      `SELECT slug FROM documents WHERE type_id = 'categories' AND status = 'published' AND is_published = 1`
    ).all());
    categories = catRows?.results || [];
  } catch (err) {
    console.warn('Failed to load categories for sitemap-static, using fallback:', err);
  }

  if (categories.length === 0) {
    categories = getFallbackCategories().map(c => ({ slug: c.slug }));
  }

  // Static routes
  const staticRoutes = [
    { ar: '/ar', en: '/en', tr: '/tr', ru: '/ru', fa: '/fa', ur: '/ur' },
    { ar: '/ar/submit-job', en: '/en/submit-job', tr: '/tr/submit-job', ru: '/ru/submit-job', fa: '/fa/submit-job', ur: '/ur/submit-job' },
    { ar: '/ar/blog', en: '/en/blog', tr: '/tr/blog', ru: '/ru/blog', fa: '/fa/blog', ur: '/ur/blog' },
    { ar: '/ar/currency-prices', en: '/en/currency-prices', tr: '/tr/currency-prices', ru: '/ru/currency-prices', fa: '/fa/currency-prices', ur: '/ur/currency-prices' },
    { ar: '/ar/gold-prices', en: '/en/gold-prices', tr: '/tr/gold-prices', ru: '/ru/gold-prices', fa: '/fa/gold-prices', ur: '/ur/gold-prices' },
    { ar: '/ar/nobetci-eczane', en: '/en/nobetci-eczane', tr: '/tr/nobetci-eczane', ru: '/ru/nobetci-eczane', fa: '/fa/nobetci-eczane', ur: '/ur/nobetci-eczane' },
    { ar: '/ar/kira-artis-orani', en: '/en/kira-artis-orani', tr: '/tr/kira-artis-orani', ru: '/ru/kira-artis-orani', fa: '/fa/kira-artis-orani', ur: '/ur/kira-artis-orani' },
    { ar: '/ar/akaryakit-fiyatlari', en: '/en/akaryakit-fiyatlari', tr: '/tr/akaryakit-fiyatlari', ru: '/ru/akaryakit-fiyatlari', fa: '/fa/akaryakit-fiyatlari', ur: '/ur/akaryakit-fiyatlari' },
    { ar: '/ar/kidem-tazminati-hesaplama', en: '/en/kidem-tazminati-hesaplama', tr: '/tr/kidem-tazminati-hesaplama', ru: '/ru/kidem-tazminati-hesaplama', fa: '/fa/kidem-tazminati-hesaplama', ur: '/ur/kidem-tazminati-hesaplama' },
    { ar: '/ar/cv-optimizer', en: '/en/cv-optimizer', tr: '/tr/cv-optimizer', ru: '/ru/cv-optimizer', fa: '/fa/cv-optimizer', ur: '/ur/cv-optimizer' },
    { ar: '/ar/salary-calculator', en: '/en/salary-calculator', tr: '/tr/salary-calculator', ru: '/ru/salary-calculator', fa: '/fa/salary-calculator', ur: '/ur/salary-calculator' },
    { ar: '/ar/resume-builder', en: '/en/resume-builder', tr: '/tr/resume-builder', ru: '/ru/resume-builder', fa: '/fa/resume-builder', ur: '/ur/resume-builder' },
    { ar: '/ar/cover-letter-generator', en: '/en/cover-letter-generator', tr: '/tr/cover-letter-generator', ru: '/ru/cover-letter-generator', fa: '/fa/cover-letter-generator', ur: '/ur/cover-letter-generator' },
    { ar: '/ar/work-permit-calculator', en: '/en/work-permit-calculator', tr: '/tr/work-permit-calculator', ru: '/ru/work-permit-calculator', fa: '/fa/work-permit-calculator', ur: '/ur/work-permit-calculator' },
    { ar: '/ar/turkish-test', en: '/en/turkish-test', tr: '/tr/turkish-test', ru: '/ru/turkish-test', fa: '/fa/turkish-test', ur: '/ur/turkish-test' },
    { ar: '/ar/interview-prep', en: '/en/interview-prep', tr: '/tr/interview-prep', ru: '/ru/interview-prep', fa: '/fa/interview-prep', ur: '/ur/interview-prep' },
    { ar: '/ar/ats-scanner', en: '/en/ats-scanner', tr: '/tr/ats-scanner', ru: '/ru/ats-scanner', fa: '/fa/ats-scanner', ur: '/ur/ats-scanner' },
    { ar: '/ar/workplace-quiz', en: '/en/workplace-quiz', tr: '/tr/workplace-quiz', ru: '/ru/workplace-quiz', fa: '/fa/workplace-quiz', ur: '/ur/workplace-quiz' },
    { ar: '/ar/work-permit-eligibility', en: '/en/work-permit-eligibility', tr: '/tr/work-permit-eligibility', ru: '/ru/work-permit-eligibility', fa: '/fa/work-permit-eligibility', ur: '/ur/work-permit-eligibility' },
    { ar: '/ar/investor-calculator', en: '/en/investor-calculator', tr: '/tr/investor-calculator', ru: '/ru/investor-calculator', fa: '/fa/investor-calculator', ur: '/ur/investor-calculator' },
    { ar: '/ar/salary-calculator-2026', en: '/en/salary-calculator-2026', tr: '/tr/salary-calculator-2026', ru: '/ru/salary-calculator-2026', fa: '/fa/salary-calculator-2026', ur: '/ur/salary-calculator-2026' },
    { ar: '/ar/ai-job-matcher', en: '/en/ai-job-matcher', tr: '/tr/ai-job-matcher', ru: '/ru/ai-job-matcher', fa: '/fa/ai-job-matcher', ur: '/ur/ai-job-matcher' },
    { ar: '/ar/jobs-for-arabs', en: '/en/jobs-for-arabs', tr: '/tr/jobs-for-arabs', ru: '/ru/jobs-for-arabs', fa: '/fa/jobs-for-arabs', ur: '/ur/jobs-for-arabs' },
    { ar: '/ar/jobs-without-turkish', en: '/en/jobs-without-turkish', tr: '/tr/jobs-without-turkish', ru: '/ru/jobs-without-turkish', fa: '/fa/jobs-without-turkish', ur: '/ur/jobs-without-turkish' },
    { ar: '/ar/entry-level-jobs', en: '/en/entry-level-jobs', tr: '/tr/entry-level-jobs', ru: '/ru/entry-level-jobs', fa: '/fa/entry-level-jobs', ur: '/ur/entry-level-jobs' },
    { ar: '/ar/driver-jobs', en: '/en/driver-jobs', tr: '/tr/driver-jobs', ru: '/ru/driver-jobs', fa: '/fa/driver-jobs', ur: '/ur/driver-jobs' },
    { ar: '/ar/restaurant-jobs', en: '/en/restaurant-jobs', tr: '/tr/restaurant-jobs', ru: '/ru/restaurant-jobs', fa: '/fa/restaurant-jobs', ur: '/ur/restaurant-jobs' },
    { ar: '/ar/factory-jobs', en: '/en/factory-jobs', tr: '/tr/factory-jobs', ru: '/ru/factory-jobs', fa: '/fa/factory-jobs', ur: '/ur/factory-jobs' },
    { ar: '/ar/call-center-jobs', en: '/en/call-center-jobs', tr: '/tr/call-center-jobs', ru: '/ru/call-center-jobs', fa: '/fa/call-center-jobs', ur: '/ur/call-center-jobs' },
    { ar: '/ar/jobs-for-women', en: '/en/jobs-for-women', tr: '/tr/jobs-for-women', ru: '/ru/jobs-for-women', fa: '/fa/jobs-for-women', ur: '/ur/jobs-for-women' },
    { ar: '/ar/student-jobs', en: '/en/student-jobs', tr: '/tr/student-jobs', ru: '/ru/student-jobs', fa: '/fa/student-jobs', ur: '/ur/student-jobs' },
    { ar: '/ar/medical-tourism-jobs', en: '/en/medical-tourism-jobs', tr: '/tr/medical-tourism-jobs', ru: '/ru/medical-tourism-jobs', fa: '/fa/medical-tourism-jobs', ur: '/ur/medical-tourism-jobs' },
    { ar: '/ar/real-estate-jobs', en: '/en/real-estate-jobs', tr: '/tr/real-estate-jobs', ru: '/ru/real-estate-jobs', fa: '/fa/real-estate-jobs', ur: '/ur/real-estate-jobs' },
    { ar: '/ar/tech-developer-jobs', en: '/en/tech-developer-jobs', tr: '/tr/tech-developer-jobs', ru: '/ru/tech-developer-jobs', fa: '/fa/tech-developer-jobs', ur: '/ur/tech-developer-jobs' },
    { ar: '/ar/translation-jobs', en: '/en/translation-jobs', tr: '/tr/translation-jobs', ru: '/ru/translation-jobs', fa: '/fa/translation-jobs', ur: '/ur/translation-jobs' },
    { ar: '/ar/accounting-jobs', en: '/en/accounting-jobs', tr: '/tr/accounting-jobs', ru: '/ru/accounting-jobs', fa: '/fa/accounting-jobs', ur: '/ur/accounting-jobs' },
    { ar: '/ar/jobs-in-fatih', en: '/en/jobs-in-fatih', tr: '/tr/jobs-in-fatih', ru: '/ru/jobs-in-fatih', fa: '/fa/jobs-in-fatih', ur: '/ur/jobs-in-fatih' },
    { ar: '/ar/jobs-in-basaksehir', en: '/en/jobs-in-basaksehir', tr: '/tr/jobs-in-basaksehir', ru: '/ru/jobs-in-basaksehir', fa: '/fa/jobs-in-basaksehir', ur: '/ur/jobs-in-basaksehir' },
    { ar: '/ar/jobs-in-esenyurt', en: '/en/jobs-in-esenyurt', tr: '/tr/jobs-in-esenyurt', ru: '/ru/jobs-in-esenyurt', fa: '/fa/jobs-in-esenyurt', ur: '/ur/jobs-in-esenyurt' },
    { ar: '/ar/jobs-in-sisli', en: '/en/jobs-in-sisli', tr: '/tr/jobs-in-sisli', ru: '/ru/jobs-in-sisli', fa: '/fa/jobs-in-sisli', ur: '/ur/jobs-in-sisli' },
    { ar: '/ar/jobs-in-beylikduzu', en: '/en/jobs-in-beylikduzu', tr: '/tr/jobs-in-beylikduzu', ru: '/ru/jobs-in-beylikduzu', fa: '/fa/jobs-in-beylikduzu', ur: '/ur/jobs-in-beylikduzu' },
    { ar: '/ar/jobs-in-taksim', en: '/en/jobs-in-taksim', tr: '/tr/jobs-in-taksim', ru: '/ru/jobs-in-taksim', fa: '/fa/jobs-in-taksim', ur: '/ur/jobs-in-taksim' },
    { ar: '/ar/jobs-in-kadikoy', en: '/en/jobs-in-kadikoy', tr: '/tr/jobs-in-kadikoy', ru: '/ru/jobs-in-kadikoy', fa: '/fa/jobs-in-kadikoy', ur: '/ur/jobs-in-kadikoy' },
    { ar: '/ar/insights', en: '/en/insights', tr: '/tr/insights', ru: '/ru/insights', fa: '/fa/insights', ur: '/ur/insights' },
    { ar: '/ar/companies', en: '/en/companies', tr: '/tr/companies', ru: '/ru/companies', fa: '/fa/companies', ur: '/ur/companies' },
    { ar: '/ar/sitemap', en: '/en/sitemap', tr: '/tr/sitemap', ru: '/ru/sitemap', fa: '/fa/sitemap', ur: '/ur/sitemap' },
    { ar: '/ar/apps', en: '/en/apps', tr: '/tr/apps', ru: '/ru/apps', fa: '/fa/apps', ur: '/ur/apps' },
    { ar: '/ar/about', en: '/en/about', tr: '/tr/about', ru: '/ru/about', fa: '/fa/about', ur: '/ur/about' },
    { ar: '/ar/contact', en: '/en/contact', tr: '/tr/contact', ru: '/ru/contact', fa: '/fa/contact', ur: '/ur/contact' },
    { ar: '/ar/privacy', en: '/en/privacy', tr: '/tr/privacy', ru: '/ru/privacy', fa: '/fa/privacy', ur: '/ur/privacy' },
    { ar: '/ar/terms', en: '/en/terms', tr: '/tr/terms', ru: '/ru/terms', fa: '/fa/terms', ur: '/ur/terms' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // 1. Static pages — only locales with genuine content are listed (untranslated variants canonicalize to /en)
  for (const route of staticRoutes) {
    const routePath = route.en.replace(/^\/en/, '');
    const locales = getNativeLocales(routePath) as readonly ('ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur')[];
    const alternates = locales
      .map(l => `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${siteUrl}${route[l]}" />`)
      .join('');
    for (const loc of locales) {
      xml += `
  <url>
    <loc>${siteUrl}${route[loc]}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>${alternates}
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

// sitemap-jobs.xml handler (Job posts with pagination & index optimization)
const SITEMAP_JOBS_PAGE_SIZE = 1500;

async function handleSitemapJobs(c: any, rawPage?: string) {
  const pageParam = rawPage || c.req.query('page') || '1';
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const offset = (page - 1) * SITEMAP_JOBS_PAGE_SIZE;
  // v4: only non-expired jobs, and only the locales each job is genuinely translated into
  const cacheKey = page === 1 ? 'kv_sitemap_jobs_xml_v4' : `kv_sitemap_jobs_xml_v4_p${page}`;

  const cacheKv = (c.env as any)?.CACHE_KV;
  if (cacheKv) {
    try {
      const cachedXml = await cacheKv.get(cacheKey);
      if (cachedXml) {
        return c.body(cachedXml, 200, {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400'
        });
      }
    } catch (e) {}
  }

  const db = (c.env as any).DB;
  const siteUrl = 'https://jobs-in-istanbul.com';

  // Fetch published, still-valid jobs (expired listings are excluded per Google Jobs guidelines).
  // Only short text prefixes are selected; getJobNativeLocales() decides which locales are genuine
  // translations (English copies would be duplicate job postings).
  const prefixLen = JOB_COMPARE_CHARS * 2; // headroom for HTML tags stripped before comparison
  const textCols = ['en', 'ar', 'tr', 'ru', 'fa', 'ur'].flatMap(l => [
    `substr(json_extract(data,'$.title_${l}'),1,${prefixLen}) AS title_${l}`,
    `substr(json_extract(data,'$.description_${l}'),1,${prefixLen}) AS description_${l}`
  ]).join(', ');
  let jobs: any[] = [];
  try {
    const cutoff = getJobFreshnessCutoffMs();
    const jobRows = await safeQuery(() => db.prepare(
      `SELECT slug, updated_at, published_at, substr(json_extract(data,'$.title'),1,${prefixLen}) AS title, substr(json_extract(data,'$.description'),1,${prefixLen}) AS description, ${textCols}
       FROM documents WHERE type_id = 'jobs' AND is_published = 1 AND status = 'published' AND deleted_at IS NULL AND published_at >= ?
       ORDER BY published_at DESC LIMIT ${SITEMAP_JOBS_PAGE_SIZE} OFFSET ${offset}`
    ).bind(cutoff).all());
    jobs = jobRows?.results || [];
  } catch (err) {
    console.warn('Failed to load jobs for sitemap-jobs, using fallback:', err);
  }

  if (jobs.length === 0 && page === 1) {
    jobs = getFallbackJobs().map(j => ({ ...j, updated_at: j.publishedAt || Date.now() }));
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // 3. Jobs — one <url> per genuinely localized version, with a matching hreflang cluster
  for (const job of jobs) {
    const jobDate = new Date(job.updated_at || job.published_at || Date.now()).toISOString().split('T')[0];
    const locales = getJobNativeLocales(job);
    const urlFor = (l: string) => `${siteUrl}/${l}/jobs/${job.slug}`;
    const alternates = locales.map(l => `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(l)}" />`).join('');
    for (const l of locales) {
      xml += `
  <url>
    <loc>${urlFor(l)}</loc>
    <lastmod>${jobDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('en')}" />
  </url>`;
    }
  }

  xml += `
</urlset>`;

  if (cacheKv) {
    cacheKv.put(cacheKey, xml, { expirationTtl: 21600 }).catch(() => {});
  }

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
}

seoRouter.get('/sitemap-jobs.xml', (c) => handleSitemapJobs(c));
seoRouter.get('/:filename{sitemap-jobs-[0-9]+\\.xml}', (c) => {
  const filename = c.req.param('filename') || 'sitemap-jobs-1.xml';
  const pageStr = filename.replace('sitemap-jobs-', '').replace('.xml', '');
  return handleSitemapJobs(c, pageStr);
});

// sitemap-blog.xml handler (Blog posts with accurate locale hreflang mapping)
seoRouter.get('/sitemap-blog.xml', async (c) => {
  const db = (c.env as any).DB;
  const siteUrl = 'https://jobs-in-istanbul.com';
  const now = new Date().toISOString().split('T')[0];

  // Fetch published blog posts
  let blogs: any[] = [];
  try {
    const blogRows = await safeQuery(() => db.prepare(
      `SELECT slug, updated_at FROM documents WHERE type_id = 'blog_post' AND status = 'published' AND is_published = 1 ORDER BY published_at DESC LIMIT 200`
    ).all());
    blogs = blogRows?.results || [];
  } catch (err) {
    console.error('Sitemap: Failed to query blog posts:', err);
  }

  // 4. Blog Posts
  const staticBlogSlugs = Array.from(new Set(
    Object.values(seededArticles).flatMap((articles: any[]) => articles.map(art => art.slug))
  ));
  const allBlogSlugs = Array.from(new Set([
    ...staticBlogSlugs,
    ...blogs.map(b => b.slug)
  ])).filter(slug => !EXCLUDED_SITEMAP_BLOG_SLUGS.has(slug));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  for (const slug of allBlogSlugs) {
    const dbBlog = blogs.find(b => b.slug === slug);
    const blogDate = dbBlog && dbBlog.updated_at
      ? new Date(dbBlog.updated_at).toISOString().split('T')[0]
      : now;

    const availableLocales = getArticleAvailableLocales(slug);
    const defaultLocale = availableLocales.includes('en') ? 'en' : availableLocales[0] || 'ar';
    const xDefaultUrl = `${siteUrl}/${defaultLocale}/blog/${slug}`;

    const alternateLinksXml = availableLocales
      .map(loc => `    <xhtml:link rel="alternate" hreflang="${loc}" href="${siteUrl}/${loc}/blog/${slug}" />`)
      .join('\n');

    for (const loc of availableLocales) {
      const url = `${siteUrl}/${loc}/blog/${slug}`;
      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${blogDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${alternateLinksXml}
    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />
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

// Multilingual RSS 2.0 + Google WebSub Hub Feed Handler (/rss.xml, /feed.xml, /:locale/rss.xml)
const buildRssFeed = async (c: any, feedLocale: 'ar' | 'en' | 'tr' = 'ar', selfPath: string = '/rss.xml') => {
  const db = (c.env as any)?.DB;
  const siteUrl = 'https://jobs-in-istanbul.com';
  const cutoff = getJobFreshnessCutoffMs();

  const escapeXml = (str: string) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  let jobsList: any[] = [];
  try {
    if (db) {
      const jobRows = await safeQuery(() => db.prepare(
        `SELECT j.id, j.slug, j.data, j.published_at
         FROM documents j
         WHERE j.type_id = 'jobs' AND j.status = 'published' AND j.is_published = 1 AND j.deleted_at IS NULL AND j.published_at >= ?
         ORDER BY j.published_at DESC LIMIT 35`
      ).bind(cutoff).all());
      jobsList = jobRows?.results || [];
    }
  } catch (err) {
    console.error('RSS: Failed to query jobs:', err);
  }

  if (jobsList.length === 0) {
    jobsList = getFallbackJobs().slice(0, 15).map((fj: any) => ({
      slug: fj.slug,
      published_at: fj.publishedAt || Date.now(),
      data: JSON.stringify(fj)
    }));
  }

  const channelMeta = {
    ar: {
      title: 'فرص عمل في إسطنبول | Jobs in Istanbul',
      desc: 'أحدث الوظائف الشاغرة المحدثة يومياً وأدلة العمل والإقامة في إسطنبول وتركيا.',
      lang: 'ar'
    },
    tr: {
      title: 'İstanbul İş İlanları | Jobs in Istanbul',
      desc: 'İstanbul genelinde en güncel iş ilanları, çalışma izni ve kariyer rehberleri.',
      lang: 'tr'
    },
    en: {
      title: 'Jobs in Istanbul | Daily Vacancies & Turkey Career Guides',
      desc: 'Latest verified job opportunities and work permit guides in Istanbul metropolitan area.',
      lang: 'en'
    }
  }[feedLocale];

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(channelMeta.title)}</title>
  <link>${siteUrl}/${feedLocale}</link>
  <description>${escapeXml(channelMeta.desc)}</description>
  <language>${channelMeta.lang}</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${siteUrl}${selfPath}" rel="self" type="application/rss+xml" />
  <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />`;

  for (const row of jobsList) {
    if (!row?.slug) continue;
    let job: any = {};
    try {
      job = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
    } catch (e) {
      continue;
    }
    const nativeLocales = getJobNativeLocales(job);
    const itemLocale = nativeLocales.includes(feedLocale) ? feedLocale : (nativeLocales.includes('en') ? 'en' : (nativeLocales[0] || 'ar'));
    const rawTitle = job[`title_${itemLocale}`] || job.title_en || job.title_ar || job.title_tr || job.title || 'Job Opportunity in Istanbul';
    const rawDesc = String(job[`description_${itemLocale}`] || job.description_en || job.description_ar || job.description || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500);
    const pubDate = new Date(row.published_at || Date.now()).toUTCString();
    const itemUrl = `${siteUrl}/${itemLocale}/jobs/${row.slug}`;

    rss += `
  <item>
    <title><![CDATA[${rawTitle}]]></title>
    <link>${itemUrl}</link>
    <guid isPermaLink="true">${itemUrl}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[${rawDesc || rawTitle}]]></description>
  </item>`;
  }

  // Include top 5 Career Blog guides for feed crawlers
  const blogPool = ((seededArticles as any)?.[feedLocale] || (seededArticles as any)?.en || []).slice(0, 5);
  for (const art of blogPool) {
    if (!art?.slug || EXCLUDED_SITEMAP_BLOG_SLUGS.has(art.slug)) continue;
    const artUrl = `${siteUrl}/${feedLocale}/blog/${art.slug}`;
    const artDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : new Date().toUTCString();
    const artSummary = String(art.summary || art.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 350);
    rss += `
  <item>
    <title><![CDATA[${art.title}]]></title>
    <link>${artUrl}</link>
    <guid isPermaLink="true">${artUrl}</guid>
    <pubDate>${artDate}</pubDate>
    <description><![CDATA[${artSummary}]]></description>
  </item>`;
  }

  rss += `
</channel>
</rss>`;

  return c.body(rss, 200, {
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=1800'
  });
};

seoRouter.get('/rss.xml', (c) => buildRssFeed(c, 'ar', '/rss.xml'));
seoRouter.get('/feed.xml', (c) => buildRssFeed(c, 'ar', '/feed.xml'));
seoRouter.get('/:locale{(ar|en|tr)}/rss.xml', (c) => {
  const loc = (c.req.param('locale') || 'ar') as 'ar' | 'en' | 'tr';
  return buildRssFeed(c, loc, `/${loc}/rss.xml`);
});

// Google Search Console HTML Verification File handler (Regex matching google[code].html)
seoRouter.get('/:filename{google[0-9a-zA-Z]+\\.html}', (c) => {
  const filename = c.req.param('filename');
  const code = filename.substring(6, filename.length - 5);
  return c.text(`google-site-verification: google${code}.html`, 200, {
    'Content-Type': 'text/html; charset=utf-8'
  });
})

// Yandex Webmaster HTML Verification File handler (Regex matching yandex_[code].html)
seoRouter.get('/:filename{yandex_[0-9a-zA-Z]+\\.html}', (c) => {
  const filename = c.req.param('filename');
  const code = filename.substring(7, filename.length - 5);
  return c.html(`<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>Verification: ${code}</body></html>`, 200);
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

// PWA Icons handler with R2 primary delivery, lazy buffer memoization & automatic R2 backfill
let memoIcon192Buf: Buffer | null = null;
let memoIcon512Buf: Buffer | null = null;

const serveIcon = async (c: any) => {
  const is512 = c.req.path.includes('512');
  const r2Key = is512 ? 'public/images/logo.png' : 'public/images/icon-192.png';
  const bucket = c.env?.MEDIA_BUCKET;

  if (bucket) {
    try {
      const obj = await bucket.get(r2Key);
      if (obj && obj.body) {
        return c.body(obj.body, 200, {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
      }
    } catch (e) {}
  }

  const logoBuffer = is512
    ? (memoIcon512Buf || (memoIcon512Buf = Buffer.from(LOGO_BASE64, 'base64')))
    : (memoIcon192Buf || (memoIcon192Buf = Buffer.from(ICON_192_BASE64, 'base64')));

  if (bucket) {
    try {
      c.executionCtx?.waitUntil?.(
        bucket.put(r2Key, logoBuffer, { httpMetadata: { contentType: 'image/png' } }).catch(() => {})
      );
    } catch (e) {}
  }

  return c.body(logoBuffer, 200, {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=31536000, immutable'
  });
};

seoRouter.get('/icon-192.png', serveIcon);
seoRouter.get('/icon-512.png', serveIcon);

// sitemap-companies.xml handler (Rich Verified/Described Employer Profiles ONLY — prevents thin doorway pages)
seoRouter.get('/sitemap-companies.xml', async (c) => {
  const siteUrl = 'https://jobs-in-istanbul.com';
  const now = new Date().toISOString().split('T')[0];
  const cacheKv = (c.env as any)?.CACHE_KV;
  const cacheKey = 'kv_sitemap_companies_xml_v2';

  if (cacheKv) {
    try {
      const cachedXml = await cacheKv.get(cacheKey);
      if (cachedXml) {
        return c.body(cachedXml, 200, {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400'
        });
      }
    } catch (e) {}
  }

  const db = (c.env as any)?.DB;
  let companyRows: any[] = [];
  try {
    if (db) {
      const res = await safeQuery(() => db.prepare(
        `SELECT slug, data, updated_at FROM documents WHERE type_id = 'companies' AND status = 'published' AND is_published = 1 AND slug IS NOT NULL ORDER BY updated_at DESC LIMIT 500`
      ).all());
      companyRows = (res?.results || []).filter((r: any) => {
        try {
          const parsed = typeof r.data === 'string' ? JSON.parse(r.data || '{}') : (r.data || {});
          const desc = String(parsed.description || '').trim();
          const name = String(parsed.name || '').trim();
          const isPlaceholderDesc = !desc || /^\s*automatically created company/i.test(desc);
          const isPlaceholderName = /^(?:acme(?:\s+\w+)*|adwhit|company|unknown|unspecified.*|shop\s*owner|istanbul\s+employer)$/i.test(name);
          // Only include genuinely rich company profiles (>=30 chars non-placeholder description) in sitemap
          return !isPlaceholderName && !isPlaceholderDesc && desc.length >= 30;
        } catch (e) {
          return false;
        }
      });
    }
  } catch (err) {
    console.warn('Sitemap: Failed to load companies:', err);
  }

  const locales = ['ar', 'en', 'tr'] as const;
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  const slugs = Array.from(new Set(companyRows.map((r: any) => String(r.slug || '').trim()).filter(Boolean)));
  for (const slug of slugs) {
    const row = companyRows.find((r: any) => r.slug === slug);
    const lastmod = row?.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : now;
    for (const loc of locales) {
      xml += `
  <url>
    <loc>${siteUrl}/${loc}/companies/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${siteUrl}/ar/companies/${slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/companies/${slug}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${siteUrl}/tr/companies/${slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/en/companies/${slug}" />
  </url>`;
    }
  }

  xml += `
</urlset>`;

  if (cacheKv && slugs.length > 0) {
    cacheKv.put(cacheKey, xml, { expirationTtl: 21600 }).catch(() => {});
  }

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
});

// sitemap-districts.xml handler (Programmatic District SEO — primary locales & active-job districts)
seoRouter.get('/sitemap-districts.xml', async (c) => {
  const siteUrl = 'https://jobs-in-istanbul.com';
  const now = new Date().toISOString().split('T')[0];
  const locales = ['ar', 'en', 'tr'] as const;
  const cacheKv = (c.env as any)?.CACHE_KV;
  const cacheKey = 'kv_sitemap_districts_xml_v2';

  if (cacheKv) {
    try {
      const cachedXml = await cacheKv.get(cacheKey);
      if (cachedXml) {
        return c.body(cachedXml, 200, {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400'
        });
      }
    } catch (e) {}
  }

  const db = (c.env as any)?.DB;
  let activeHaystack = '';
  let hasJobData = false;
  try {
    if (db) {
      const jobRows = await safeQuery(() => db.prepare(
        `SELECT json_extract(data,'$.location_en') AS loc_en, json_extract(data,'$.location_ar') AS loc_ar, json_extract(data,'$.title_en') AS t_en, json_extract(data,'$.title_ar') AS t_ar
         FROM documents WHERE type_id = 'jobs' AND status = 'published' AND is_published = 1 AND deleted_at IS NULL AND published_at >= ?
         ORDER BY published_at DESC LIMIT 400`
      ).bind(getJobFreshnessCutoffMs()).all());
      const rows = jobRows?.results || [];
      if (rows.length > 0) {
        hasJobData = true;
        activeHaystack = rows.map((r: any) => `${r.loc_en || ''} ${r.loc_ar || ''} ${r.t_en || ''} ${r.t_ar || ''}`).join(' ').toLowerCase();
      }
    }
  } catch (e) {}

  // Only list districts that have active open jobs (avoiding "Submitted URL marked 'noindex'"),
  // falling back to all districts when DB has no job rows (e.g. test/fresh environment).
  const activeDistricts = hasJobData
    ? ISTANBUL_DISTRICTS.filter(dist =>
        activeHaystack.includes(dist.en.toLowerCase()) ||
        activeHaystack.includes(dist.ar.toLowerCase())
      )
    : ISTANBUL_DISTRICTS;
  const districtsToEmit = activeDistricts.length > 0 ? activeDistricts : ISTANBUL_DISTRICTS;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  for (const dist of districtsToEmit) {
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
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/en/district/${slug}" />
  </url>`;
    }
  }

  xml += `
</urlset>`;

  if (cacheKv && hasJobData) {
    cacheKv.put(cacheKey, xml, { expirationTtl: 21600 }).catch(() => {});
  }

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


