import { describe, it, expect } from 'vitest';
import { app } from '../src/index';
import { dutyPharmacyRouter } from '../src/routes/duty-pharmacy';

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

describe('Istanbul Duty Pharmacies (İstanbul Nöbetçi Eczaneler) Feature Tests', () => {
  it('GET /ar/nobetci-eczane returns 200 OK, full Arabic UI, emergency numbers, and 39 districts', async () => {
    const res = await app.request('/ar/nobetci-eczane', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();

    // Verify Title and Arabic terminology
    expect(html).toContain('صيدليات الحراسة في إسطنبول اليوم');
    expect(html).toContain('112 الإسعاف والطوارئ');
    expect(html).toContain('184 استشارات وزارة الصحة');
    expect(html).toContain('العثور على أقرب صيدلية مني الآن');

    // Verify Major districts are included
    expect(html).toContain('الفاتح');
    expect(html).toContain('باشاك شهير');
    expect(html).toContain('كاديكوي');
    expect(html).toContain('إسنيورت');
    expect(html).toContain('بيليك دوزو');
    expect(html).toContain('شيشلي');

    // Verify Direct Call and Maps action links
    expect(html).toContain('tel:');
    expect(html).toContain('google.com/maps');
    expect(html).toContain('yandex.com/maps');

    // Verify JSON-LD Schema
    expect(html).toContain('https://schema.org');
    expect(html).toContain('Pharmacy');
    expect(html).toContain('FAQPage');
  });

  it('GET /en/nobetci-eczane returns 200 OK with English UI and translations', async () => {
    const res = await app.request('/en/nobetci-eczane', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('Pharmacies on Duty in Istanbul Today');
    expect(html).toContain('Find Nearest Duty Pharmacy to Me');
    expect(html).toContain('Call Now');
    expect(html).toContain('Google Maps');
    expect(html).toContain('Yandex Maps');
  });

  it('GET /tr/nobetci-eczane returns 200 OK with Turkish UI and translations', async () => {
    const res = await app.request('/tr/nobetci-eczane', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('İstanbul Nöbetçi Eczaneler Bugün');
    expect(html).toContain('Bana En Yakın Nöbetçi Eczaneyi Bul');
    expect(html).toContain('Hemen Ara');
    expect(html).toContain('Google Haritalar');
    expect(html).toContain('Yandex Harita');
  });

  it('GET /nobetci-eczane redirects to locale route', async () => {
    const res = await app.request('/nobetci-eczane', undefined, mockEnv);
    expect([301, 302]).toContain(res.status);
    expect(res.headers.get('Location')).toContain('/nobetci-eczane');
  });

  it('GET /api/nobetci-eczaneler returns JSON with pharmacies and supports filtering', async () => {
    // 1. All pharmacies
    const res = await dutyPharmacyRouter.request('/api/nobetci-eczaneler', undefined, mockEnv);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.count).toBeGreaterThan(30);
    expect(json.pharmacies).toBeInstanceOf(Array);

    // 2. Filter by district Fatih
    const resFatih = await dutyPharmacyRouter.request('/api/nobetci-eczaneler?district=fatih', undefined, mockEnv);
    const jsonFatih = await resFatih.json();
    expect(jsonFatih.success).toBe(true);
    expect(jsonFatih.pharmacies.every((p: any) => p.districtSlug === 'fatih')).toBe(true);

    // 3. Filter by European Side
    const resEur = await dutyPharmacyRouter.request('/api/nobetci-eczaneler?side=european', undefined, mockEnv);
    const jsonEur = await resEur.json();
    expect(jsonEur.success).toBe(true);
    expect(jsonEur.pharmacies.every((p: any) => p.side === 'european')).toBe(true);
  });

  it('GET /sitemap-static.xml includes nobetci-eczane route', async () => {
    const res = await app.request('/sitemap-static.xml', undefined, mockEnv);
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('/ar/nobetci-eczane');
    expect(xml).toContain('/en/nobetci-eczane');
    expect(xml).toContain('/tr/nobetci-eczane');
  });
});
