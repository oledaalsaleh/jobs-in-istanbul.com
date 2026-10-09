import { describe, it, expect } from 'vitest';
import { app } from '../src/index';

const mockDb = {
  prepare: (sql: string) => ({
    bind: (..._args: any[]) => ({
      all: async () => ({ results: [] }),
      first: async () => null,
      run: async () => ({})
    }),
    all: async () => ({ results: [] }),
    first: async () => null,
    run: async () => ({})
  })
};

const mockEnv = {
  DB: mockDb,
  JWT_SECRET: 'test-secret',
  ENVIRONMENT: 'development'
};

describe('Most In-Demand Jobs in Turkey 2026 Article & Multi-Language SEO Tests', () => {
  it('GET /ar/blog/most-in-demand-jobs-turkey-2026 loads Arabic article with 200 OK, 8 images, and 2000+ words', async () => {
    const res = await app.request('/ar/blog/most-in-demand-jobs-turkey-2026', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();

    // Verify Title & Key Content
    expect(html).toContain('المهن الأكثر طلباً في تركيا 2026');
    expect(html).toContain('تكنولوجيا المعلومات والبرمجيات');
    expect(html).toContain('السياحة العلاجية والخدمات الطبية');
    expect(html).toContain('المهن المحظورة على الأجانب في تركيا');
    expect(html).toContain('شرط توظيف 5 مواطنين أتراك');

    // Verify 8 distinct images are embedded in the article
    const images = [
      'photo-1486406146926-c627a92ad1ab',
      'photo-1498050108023-c5249f4df085',
      'photo-1581091226825-a6a2a5aee158',
      'photo-1519494026892-80bbd2d6fd0d',
      'photo-1566073771259-6a8506099945',
      'photo-1534536281715-e28d76689b4d',
      'photo-1586528116311-ad8dd3c8310d',
      'photo-1450133064473-71024230f91b'
    ];

    for (const img of images) {
      expect(html).toContain(img);
    }

    // Verify Word Count exceeds 2000 words
    const strippedText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const arabicWords = strippedText.split(' ').filter(word => /[\u0600-\u06FF]/.test(word));
    expect(arabicWords.length).toBeGreaterThanOrEqual(2000);

    // Verify SEO Schema markup
    expect(html).toContain('application/ld+json');
    expect(html).toContain('most-in-demand-jobs-turkey-2026');
    expect(html).toContain('FAQPage');
  });

  it('GET /en/blog/most-in-demand-jobs-turkey-2026 loads English article with 200 OK', async () => {
    const res = await app.request('/en/blog/most-in-demand-jobs-turkey-2026', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('Most In-Demand Jobs in Turkey 2026');
    expect(html).toContain('Information Technology & Software Engineering');
    expect(html).toContain('Reserved Professions Prohibited for Foreigners');
  });

  it('GET /tr/blog/most-in-demand-jobs-turkey-2026 loads Turkish article with 200 OK', async () => {
    const res = await app.request('/tr/blog/most-in-demand-jobs-turkey-2026', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('En Çok Talep Gören Meslekler 2026');
    expect(html).toContain('Bilişim ve Yazılım Teknolojileri');
    expect(html).toContain('Yabancılara Kanunen Yasaklı Meslekler');
  });

  it('GET /sitemap-blog.xml includes the new most-in-demand-jobs-turkey-2026 article', async () => {
    const res = await app.request('/sitemap-blog.xml', undefined, mockEnv);
    expect(res.status).toBe(200);

    const xml = await res.text();
    expect(xml).toContain('https://jobs-in-istanbul.com/ar/blog/most-in-demand-jobs-turkey-2026');
    expect(xml).toContain('https://jobs-in-istanbul.com/en/blog/most-in-demand-jobs-turkey-2026');
    expect(xml).toContain('https://jobs-in-istanbul.com/tr/blog/most-in-demand-jobs-turkey-2026');
  });
});
