import { describe, expect, test } from 'vitest';
import { app } from '../src/index';

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
      all: async () => ({ results: [] }),
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
});
