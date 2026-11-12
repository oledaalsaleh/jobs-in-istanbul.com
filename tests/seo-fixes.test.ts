import { describe, expect, test } from 'vitest';
import { app } from '../src/index';
import { getJobNativeLocales } from '../src/utils/job-validity';
import { extractIstanbulDistrict, extractSalaryFromText } from '../src/utils/seo-helper';

const createMockEnv = (publishedAt: number = Date.now() - 2 * 86400000, companyWebsite = '') => ({
  DB: {
    prepare: (sql: string) => ({
      bind: (...args: any[]) => ({
        all: async () => {
          if (sql.includes("type_id = 'categories'") || sql.includes('categories')) {
            return {
              results: [
                { id: 'cat-it', slug: 'it-software', data: JSON.stringify({ name_ar: 'برمجة', name_en: 'IT', icon: '💻' }) }
              ]
            };
          }
          if (sql.includes("type_id = 'companies'")) {
            return {
              results: [
                { id: 'comp-ist-tech', slug: 'ist-tech', data: JSON.stringify({ name: 'Istanbul Tech', logo: '', website: companyWebsite }) }
              ]
            };
          }
          return { results: [] };
        },
        first: async () => {
          if (sql.includes("type_id = 'jobs'") && sql.includes('slug = ?')) {
            if (args[0] === 'non-existent-slug-999') {
              return null;
            }
            return {
              id: 'job-seo-1',
              published_at: publishedAt,
              data: JSON.stringify({
                title_ar: 'مطور ويب',
                title_en: 'Web Developer',
                description_ar: 'وصف الوظيفة التفصيلي هنا.',
                description_en: 'Detailed job description here.',
                company: 'comp-ist-tech',
                category: 'cat-it',
                jobType: 'full-time',
                salary: '35,000 TL',
                location_ar: 'شيشلي، إسطنبول',
                location_en: 'Sisli, Istanbul',
                slug: 'web-developer'
              })
            };
          }
          if (sql.includes("type_id = 'companies'") && sql.includes('slug = ?')) {
            if (args[0] === 'ist-tech') {
              return {
                id: 'comp-ist-tech',
                slug: 'ist-tech',
                data: JSON.stringify({
                  name: 'Istanbul Tech',
                  logo: '/uploads/logo.png',
                  website: companyWebsite,
                  description: 'Leading software house in Istanbul.'
                })
              };
            }
            return null;
          }
          if (sql.includes('documents WHERE id = ?')) {
            return {
              data: JSON.stringify({
                name: 'Istanbul Tech',
                logo: '/uploads/logo.png',
                website: companyWebsite,
                description: 'Leading software house in Istanbul.'
              })
            };
          }
          return null;
        },
        run: async () => ({})
      }),
      all: async () => {
        if (sql.includes("type_id = 'companies'")) {
          return {
            results: [
              {
                id: 'comp-ist-tech',
                slug: 'ist-tech',
                data: JSON.stringify({
                  name: 'Istanbul Tech',
                  logo: '/uploads/logo.png',
                  website: companyWebsite,
                  description: 'Leading software house in Istanbul.'
                })
              }
            ]
          };
        }
        return { results: [] };
      },
      first: async () => ({ total: 5, n: 5 }),
      run: async () => ({})
    })
  },
  CACHE_KV: {
    get: async () => null,
    put: async () => {},
    delete: async () => {}
  }
});

describe('Technical SEO & Google Jobs Compliance Tests', () => {
  test('www host redirects with 301 to canonical apex domain', async () => {
    const res = await app.request('https://www.jobs-in-istanbul.com/ar/jobs-for-arabs', {}, createMockEnv());
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe('https://jobs-in-istanbul.com/ar/jobs-for-arabs');
  });

  test('trailing slashes on public routes redirect with 301 to non-trailing-slash URL', async () => {
    const resAr = await app.request('https://jobs-in-istanbul.com/ar/', {}, createMockEnv());
    expect(resAr.status).toBe(301);
    expect(resAr.headers.get('Location')).toBe('https://jobs-in-istanbul.com/ar');

    const resBlog = await app.request('https://jobs-in-istanbul.com/ar/blog/', {}, createMockEnv());
    expect(resBlog.status).toBe(301);
    expect(resBlog.headers.get('Location')).toBe('https://jobs-in-istanbul.com/ar/blog');
  });

  test('specialized landing pages emit self-referencing canonicals for primary locales and canonicalize secondary locales to English', async () => {
    const env = createMockEnv();
    const resAr = await app.request('https://jobs-in-istanbul.com/ar/jobs-for-arabs', {}, env);
    expect(resAr.status).toBe(200);
    const htmlAr = await resAr.text();
    expect(htmlAr).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/ar/jobs-for-arabs">');
    expect(htmlAr).toContain('hreflang="ar" href="https://jobs-in-istanbul.com/ar/jobs-for-arabs"');
    expect(htmlAr).toContain('hreflang="en" href="https://jobs-in-istanbul.com/en/jobs-for-arabs"');
    expect(htmlAr).toContain('hreflang="tr" href="https://jobs-in-istanbul.com/tr/jobs-for-arabs"');
    expect(htmlAr).not.toContain('hreflang="ru" href="https://jobs-in-istanbul.com/ru/jobs-for-arabs"');

    const resRu = await app.request('https://jobs-in-istanbul.com/ru/jobs-for-arabs', {}, env);
    expect(resRu.status).toBe(200);
    const htmlRu = await resRu.text();
    expect(htmlRu).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/en/jobs-for-arabs">');
  });

  test('company profile pages emit self-referencing canonicals and mark unknown companies noindex', async () => {
    const env = createMockEnv();
    const resKnown = await app.request('https://jobs-in-istanbul.com/ar/companies/ist-tech', {}, env);
    expect(resKnown.status).toBe(200);
    const htmlKnown = await resKnown.text();
    expect(htmlKnown).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/ar/companies/ist-tech">');
    expect(htmlKnown).toContain('<meta name="robots" content="index, follow">');

    const resUnknown = await app.request('https://jobs-in-istanbul.com/ar/companies/non-existent-co', {}, env);
    expect(resUnknown.status).toBe(200);
    const htmlUnknown = await resUnknown.text();
    expect(htmlUnknown).toContain('<meta name="robots" content="noindex, follow">');
  });

  test('active job detail page sets validThrough to 30 days, includes identifier, and omits self-referential sameAs', async () => {
    const publishedAt = Date.now() - 3 * 86400000;
    const env = createMockEnv(publishedAt, '');
    const res = await app.request('https://jobs-in-istanbul.com/ar/jobs/web-developer', {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();

    expect(html).toContain('"@type":"JobPosting"');
    expect(html).toContain('"@type":"PropertyValue"');
    expect(html).not.toContain('"sameAs":"https://jobs-in-istanbul.com"');

    const expectedValidThrough = new Date(publishedAt + 30 * 86400000).toISOString().slice(0, 10);
    expect(html).toContain(`"validThrough":"${expectedValidThrough}`);
  });

  test('expired job detail page (>30 days old) sets noindex, displays closed banner, and omits JobPosting JSON-LD', async () => {
    const expiredPublishedAt = Date.now() - 45 * 86400000;
    const env = createMockEnv(expiredPublishedAt, '');
    const res = await app.request('https://jobs-in-istanbul.com/ar/jobs/web-developer', {}, env);
    expect(res.status).toBe(200);
    const html = await res.text();

    expect(html).toContain('<meta name="robots" content="noindex, follow">');
    expect(html).toContain('انتهى التقديم على هذه الوظيفة');
    expect(html).not.toContain('"@type":"JobPosting"');
  });

  test('getJobNativeLocales ignores English copies, including HTML-wrapped ones', () => {
    const enDesc = 'Due to our long experience in spa tourism, we offer a job opportunity with a salary up to 50,000 TL.';
    const native = getJobNativeLocales({
      title_en: 'Salesperson', title_tr: 'Salesperson', title_ru: 'Salesperson', title_ar: 'موظف مبيعات',
      description_en: enDesc,
      description_tr: `<p>${enDesc}</p>`,          // HTML-wrapped English copy -> not native
      description_ru: `  ${enDesc.replace(/ /g, '  ')} `, // re-spaced English copy -> not native
      description_ar: 'نظراً لخبرتنا الطويلة في سياحة السبا نقدم فرصة عمل.',
      description_fa: 'به دلیل تجربه طولانی ما در گردشگری اسپا، فرصت شغلی ارائه می‌دهیم.'
    });
    expect(native.sort()).toEqual(['ar', 'en', 'fa']);
  });

  test('untranslated job locales canonicalize to English and do not duplicate the JobPosting', async () => {
    const env = createMockEnv(Date.now() - 2 * 86400000, '');
    // Mock job only has ar + en content: tr/ru/fa/ur would be English copies
    const resTr = await app.request('https://jobs-in-istanbul.com/tr/jobs/web-developer', {}, env);
    expect(resTr.status).toBe(200);
    const htmlTr = await resTr.text();
    expect(htmlTr).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/en/jobs/web-developer">');
    expect(htmlTr).not.toContain('"@type":"JobPosting"');

    const resAr = await app.request('https://jobs-in-istanbul.com/ar/jobs/web-developer', {}, env);
    const htmlAr = await resAr.text();
    expect(htmlAr).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/ar/jobs/web-developer">');
    expect(htmlAr).toContain('"@type":"JobPosting"');
    expect(htmlAr).toContain('hreflang="ar" href="https://jobs-in-istanbul.com/ar/jobs/web-developer"');
    expect(htmlAr).toContain('hreflang="en" href="https://jobs-in-istanbul.com/en/jobs/web-developer"');
    expect(htmlAr).not.toContain('hreflang="tr" href="https://jobs-in-istanbul.com/tr/jobs/web-developer"');
    // Meta description is the localized (Arabic) excerpt, not the English SEO blurb
    expect(htmlAr).toContain('<meta name="description" content="وصف الوظيفة التفصيلي هنا.">');
  });

  test('home page publishes a single stable brand entity for Google site names', async () => {
    const res = await app.request('https://jobs-in-istanbul.com/ar', {}, createMockEnv());
    const html = await res.text();
    expect(html).toContain('"@id":"https://jobs-in-istanbul.com/#organization"');
    expect(html).toContain('"@type":"WebSite","@id":"https://jobs-in-istanbul.com/#website","name":"Jobs in Istanbul"');
    expect(html).toContain('https://t.me/jobsistanbul');
    expect(html).not.toContain('facebook.com/istanbuljobs');
  });

  test('/sitemap-static.xml includes /apps and 2026 tools while omitting untranslated secondary locales', async () => {
    const res = await app.request('https://jobs-in-istanbul.com/sitemap-static.xml', {}, createMockEnv());
    expect(res.status).toBe(200);
    const xml = await res.text();

    expect(xml).toContain('https://jobs-in-istanbul.com/ar/apps');
    expect(xml).toContain('https://jobs-in-istanbul.com/ar/kidem-tazminati-hesaplama');
    expect(xml).toContain('https://jobs-in-istanbul.com/ar/jobs-for-arabs');
    expect(xml).not.toContain('https://jobs-in-istanbul.com/ru/jobs-for-arabs');
    expect(xml).not.toContain('https://jobs-in-istanbul.com/fa/apps');
    expect(xml).not.toContain('https://jobs-in-istanbul.com/ur/privacy');
  });

  test('/css/layout.css serves externalized layout CSS with immutable cache headers when versioned', async () => {
    const res = await app.request('https://jobs-in-istanbul.com/css/layout.css?v=test', {}, createMockEnv());
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/css');
    expect(res.headers.get('Cache-Control')).toContain('immutable');
    const css = await res.text();
    expect(css).toContain('.site-header');
    expect(css).toContain('.job-card');
  });

  test('job detail and apps showcase pages omit unverified badges, fake benefit pills, and fabricated AggregateRating', async () => {
    const resJob = await app.request('https://jobs-in-istanbul.com/ar/jobs/web-developer', {}, createMockEnv());
    expect(resJob.status).toBe(200);
    const jobHtml = await resJob.text();
    expect(jobHtml).not.toContain('جهة عمل موثقة');
    expect(jobHtml).not.toContain('مزايا مذكورة في الإعلان:');
    expect(jobHtml).not.toContain('<span>سكن</span>');
    expect(jobHtml).not.toContain('<span>مواصلات</span>');
    expect(jobHtml).not.toContain('<span>وجبات</span>');

    const resApps = await app.request('https://jobs-in-istanbul.com/ar/apps', {}, createMockEnv());
    expect(resApps.status).toBe(200);
    const appsHtml = await resApps.text();
    expect(appsHtml).not.toContain('"AggregateRating"');
    expect(appsHtml).not.toContain('"ratingValue":"5.0"');
  });

  test('JobPosting JSON-LD extracts specific Istanbul district, postal code, and salary from posting text', async () => {
    expect(extractIstanbulDistrict('شيشلي، إسطنبول', 'مطور ويب', '')).toEqual({
      locality: 'شيشلي، إسطنبول',
      postalCode: '34360'
    });
    expect(extractIstanbulDistrict('Istanbul', 'مطلوب محاسب في الفاتح', '')).toEqual({
      locality: 'Fatih, Istanbul',
      postalCode: '34090'
    });
    expect(extractSalaryFromText('', 'مطلوب موظف مبيعات', 'الراتب الشهري 28,500 ليرة تركية مع حوافز')).toBe('28,500 TRY');

    const resJob = await app.request('https://jobs-in-istanbul.com/ar/jobs/web-developer', {}, createMockEnv());
    const jobHtml = await resJob.text();
    expect(jobHtml).toContain('"addressLocality":"شيشلي، إسطنبول"');
    expect(jobHtml).toContain('"postalCode":"34360"');
    expect(jobHtml).toContain('"value":35000');
  });

  test('cannibalizing blog slugs redirect with 301 and are excluded from /sitemap-blog.xml along with external canonicals', async () => {
    const env = createMockEnv();
    const resDup1 = await app.request('https://jobs-in-istanbul.com/ar/blog/istanbul-cost-of-living-2026', {}, env);
    expect(resDup1.status).toBe(301);
    expect(resDup1.headers.get('Location')).toBe('/ar/blog/cost-of-living-istanbul-2026-guide');

    const resDup2 = await app.request('https://jobs-in-istanbul.com/ar/blog/work-permit-turkey-2026', {}, env);
    expect(resDup2.status).toBe(301);
    expect(resDup2.headers.get('Location')).toBe('/ar/blog/turkey-work-permit-guide-2026');

    const resSitemap = await app.request('https://jobs-in-istanbul.com/sitemap-blog.xml', {}, env);
    expect(resSitemap.status).toBe(200);
    const sitemapXml = await resSitemap.text();
    expect(sitemapXml).toContain('cost-of-living-istanbul-2026-guide');
    expect(sitemapXml).not.toContain('best-dental-implants-clinic-turkey');
    expect(sitemapXml).not.toContain('istanbul-cost-of-living-2026');
    expect(sitemapXml).not.toContain('jobs-in-istanbul-mobile-app-guide-2026');
    expect(sitemapXml).not.toContain('kuran-i-kerim-namaz-vakitleri-uygulamasi-indir');
  });

  test('Phase 3: compressed logo-96.png serves <35 KB PNG and homepage links specialized hubs & companies directory', async () => {
    const env = createMockEnv();
    const resLogo = await app.request('https://jobs-in-istanbul.com/public/images/logo-96.png', {}, env);
    expect(resLogo.status).toBe(200);
    expect(resLogo.headers.get('Content-Type')).toBe('image/png');
    expect(resLogo.headers.get('Cache-Control')).toContain('immutable');
    const logoBytes = new Uint8Array(await resLogo.arrayBuffer());
    expect(logoBytes.byteLength).toBeGreaterThan(5000);
    expect(logoBytes.byteLength).toBeLessThan(35000);

    const resHome = await app.request('https://jobs-in-istanbul.com/ar', {}, env);
    expect(resHome.status).toBe(200);
    const homeHtml = await resHome.text();
    expect(homeHtml).toContain('/public/images/logo-96.png');
    expect(homeHtml).toContain('/ar/jobs-for-arabs');
    expect(homeHtml).toContain('/ar/medical-tourism-jobs');
    expect(homeHtml).toContain('/ar/companies');
  });

  test('Phase 3: homepage ad-hoc search/filter URLs emit noindex,follow while clean pages stay indexable', async () => {
    const env = createMockEnv();
    const resSearch = await app.request('https://jobs-in-istanbul.com/ar?search=developer', {}, env);
    expect(resSearch.status).toBe(200);
    const searchHtml = await resSearch.text();
    expect(searchHtml).toContain('<meta name="robots" content="noindex, follow">');

    const resDistFilter = await app.request('https://jobs-in-istanbul.com/ar?district=Fatih', {}, env);
    expect(resDistFilter.status).toBe(200);
    const distFilterHtml = await resDistFilter.text();
    expect(distFilterHtml).toContain('<meta name="robots" content="noindex, follow">');
  });

  test('Phase 3: companies directory (/ar/companies) renders 200 OK with self-referencing canonical and appears in /sitemap-static.xml', async () => {
    const env = createMockEnv();
    const resCompAr = await app.request('https://jobs-in-istanbul.com/ar/companies', {}, env);
    expect(resCompAr.status).toBe(200);
    const compArHtml = await resCompAr.text();
    expect(compArHtml).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/ar/companies">');
    expect(compArHtml).toContain('<meta name="robots" content="index, follow">');
    expect(compArHtml).toContain('Istanbul Tech');

    const resCompRu = await app.request('https://jobs-in-istanbul.com/ru/companies', {}, env);
    expect(resCompRu.status).toBe(200);
    const compRuHtml = await resCompRu.text();
    expect(compRuHtml).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/en/companies">');

    const resSitemap = await app.request('https://jobs-in-istanbul.com/sitemap-static.xml', {}, env);
    const sitemapXml = await resSitemap.text();
    expect(sitemapXml).toContain('https://jobs-in-istanbul.com/ar/companies');
    expect(sitemapXml).not.toContain('https://jobs-in-istanbul.com/ru/companies');
  });

  test('Phase 3: missing job, missing blog article, and unknown localized routes return branded HTML 404 with noindex,nofollow', async () => {
    const env = createMockEnv();

    const resMissingJob = await app.request('https://jobs-in-istanbul.com/ar/jobs/non-existent-slug-999', {}, env);
    expect(resMissingJob.status).toBe(404);
    expect(resMissingJob.headers.get('Content-Type')).toContain('text/html');
    const missingJobHtml = await resMissingJob.text();
    expect(missingJobHtml).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(missingJobHtml).toContain('404');

    const resMissingBlog = await app.request('https://jobs-in-istanbul.com/ar/blog/non-existent-article-999', {}, env);
    expect(resMissingBlog.status).toBe(404);
    expect(resMissingBlog.headers.get('Content-Type')).toContain('text/html');
    const missingBlogHtml = await resMissingBlog.text();
    expect(missingBlogHtml).toContain('<meta name="robots" content="noindex, nofollow">');

    const resUnknownPage = await app.request('https://jobs-in-istanbul.com/ar/unknown-section-xyz', {}, env);
    expect(resUnknownPage.status).toBe(404);
    expect(resUnknownPage.headers.get('Content-Type')).toContain('text/html');
    const unknownPageHtml = await resUnknownPage.text();
    expect(unknownPageHtml).toContain('<meta name="robots" content="noindex, nofollow">');

    // API 404s remain JSON
    const resUnknownApi = await app.request('https://jobs-in-istanbul.com/api/unknown-endpoint-xyz', {}, env);
    expect(resUnknownApi.status).toBe(404);
    expect(resUnknownApi.headers.get('Content-Type')).toContain('application/json');
  });
});
