import { describe, it, expect } from 'vitest';
import { app } from '../src/index';

const mockDb = {
  prepare: (_sql: string) => ({
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
  ENVIRONMENT: 'development',
  CACHE_KV: {
    get: async () => null,
    put: async () => {}
  }
};

describe('Google Play Developer Apps Showcase Tests', () => {
  it('GET /apps redirects to localized /ar/apps by default', async () => {
    const res = await app.request('/apps', undefined, mockEnv);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/ar/apps');
  });

  it('GET /ar/apps returns 200 OK with all 4 Google Play apps and developer profile', async () => {
    const res = await app.request('/ar/apps', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();

    // Verify Developer Store URL
    expect(html).toContain('https://play.google.com/store/apps/dev?id=6308543008922541479');

    // Verify all 4 package IDs
    expect(html).toContain('com.jobsistanbul.app');
    expect(html).toContain('com.trabzon.turkey.travel.guide');
    expect(html).toContain('com.aktuel.bim.a101.sok');
    expect(html).toContain('com.quran.karim.kamel.bidon.net.murtal.tilaat.smart');

    // Verify Arabic app titles
    expect(html).toContain('وظائف تركيا وإسطنبول');
    expect(html).toContain('دليل تركيا السياحي بدون نت');
    expect(html).toContain('عروض بيم A101 و ŞOK');
    expect(html).toContain('ضياء القرآن الكريم بدون إنترنت');

    // Verify QR code modal and Google Play protect
    expect(html).toContain('qr-modal');
    expect(html).toContain('Google Play Protect');

    // Verify JSON-LD Schema
    expect(html).toContain('SoftwareApplication');
    expect(html).toContain('MindMeld Apps 2026');
  });

  it('GET /en/apps returns 200 OK with English titles and features', async () => {
    const res = await app.request('/en/apps', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('Turkey & Istanbul Jobs');
    expect(html).toContain('Turkey Travel Guide Offline');
    expect(html).toContain('Aktüel: BİM, A101 & ŞOK Deals');
    expect(html).toContain('Diya Al-Quran - Holy Quran Offline');
    expect(html).toContain('Verified Google Play Developer Account');
  });

  it('GET /tr/apps returns 200 OK with Turkish titles and features', async () => {
    const res = await app.request('/tr/apps', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('Türkiye & İstanbul İş İlanları');
    expect(html).toContain('İnternetsiz Türkiye Gezi Rehberi');
    expect(html).toContain('Aktüel: BİM, A101, ŞOK İndirimleri');
    expect(html).toContain('Diya Kur\'an-ı Kerim İnternetsiz');
    expect(html).toContain('Doğrulanmış Resmi Google Play Geliştiricisi');
  });

  it('GET /ar homepage contains the Official Apps Ecosystem section and navigation links', async () => {
    const res = await app.request('/ar', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('home-apps-ecosystem');
    expect(html).toContain('/ar/apps');
    expect(html).toContain('https://play.google.com/store/apps/dev?id=6308543008922541479');
  });

  it('GET /ar homepage contains the permanent Google Display style job ad banner in drawer and sidebar', async () => {
    const res = await app.request('/ar', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();

    // Verify presence of ad boxes
    expect(html).toContain('permanent-job-ad-box');
    expect(html).toContain('ad-variant-drawer');
    expect(html).toContain('ad-variant-sidebar');

    // Verify targeted 150K opportunity promo poster image
    expect(html).toContain('/public/images/istanbul-app/featured_job_promo_150k.jpg');

    // Verify click-through link to Google Play app
    expect(html).toContain('https://play.google.com/store/apps/details?id=com.jobsistanbul.app');

    // Verify Google Ad badges and tags
    expect(html).toContain('إعلان ممول');
    expect(html).toContain('فرصة عمل براتب 150,000 ليرة تركية');
    expect(html).toContain('اضغط هنا للتقديم');
  });

  it('GET /public/images/istanbul-app/featured_job_promo_150k.jpg returns 200 OK with JPEG image buffer', async () => {
    const res = await app.request('/public/images/istanbul-app/featured_job_promo_150k.jpg', undefined, mockEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/jpeg');
    expect(res.headers.get('Cache-Control')).toContain('immutable');

    const buffer = await res.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(100000);
  });
});
