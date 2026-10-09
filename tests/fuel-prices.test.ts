import { describe, it, expect } from 'vitest';
import { app } from '../src/index';
import { fuelPricesRouter } from '../src/routes/fuel-prices';
import { mobileApiRouter } from '../src/routes/mobile-api';

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

describe('Istanbul Fuel Prices Today 2026 (İstanbul Akaryakıt Fiyatları) Tests', () => {
  it('GET /ar/akaryakit-fiyatlari loads Arabic page with 200 OK, live prices, smart alert, and courier calculator', async () => {
    const res = await app.request('/ar/akaryakit-fiyatlari', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();

    // Verify Title & Terminology
    expect(html).toContain('أسعار البنزين والديزل والمحروقات اليوم في إسطنبول');
    expect(html).toContain('الجانب الأوروبي (Avrupa)');
    expect(html).toContain('الجانب الآسيوي (Anadolu)');
    expect(html).toContain('بنزين 95 أوكتان');
    expect(html).toContain('ديزل / مازوت');
    expect(html).toContain('غاز السيارات');

    // Verify Smart Alert Banner
    expect(html).toContain('مؤشر مراقبة أسعار الوقود والتعديلات القادمة');
    expect(html).toContain('سعر نفط برنت');
    expect(html).toContain('سعر صرف USD/TRY');

    // Verify Courier & Vehicle Calculator
    expect(html).toContain('حاسبة تكلفة الوقود والمشوار للموتوكوري والسيارات');
    expect(html).toContain('سكوتر توصيل طلبات (Motokurye)');
    expect(html).toContain('تكلفة الكيلومتر الواحد');
    expect(html).toContain('التكلفة الشهرية');

    // Verify Station Comparison & History
    expect(html).toContain('مقارنة أسعار المحروقات بين كبرى الشركات في إسطنبول');
    expect(html).toContain('Petrol Ofisi');
    expect(html).toContain('Shell');
    expect(html).toContain('سجل آخر التعديلات الرسمية على أسعار الوقود');

    // Verify Schema.org
    expect(html).toContain('https://schema.org');
    expect(html).toContain('WebApplication');
    expect(html).toContain('FAQPage');
  });

  it('GET /tr/akaryakit-fiyatlari loads Turkish version with 200 OK', async () => {
    const res = await app.request('/tr/akaryakit-fiyatlari', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('İstanbul Akaryakıt Fiyatları Bugün (Benzin, Motorin, LPG)');
    expect(html).toContain('Avrupa Yakası');
    expect(html).toContain('Anadolu Yakası');
    expect(html).toContain('Kurşunsuz Benzin 95');
    expect(html).toContain('Motorin (Dizel)');
    expect(html).toContain('Otogaz (LPG)');
    expect(html).toContain('Motokurye ve Araç Yakıt Tüketim Hesaplama Aracı');
  });

  it('GET /en/akaryakit-fiyatlari loads English version with 200 OK', async () => {
    const res = await app.request('/en/akaryakit-fiyatlari', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('Istanbul Fuel Prices Today (Petrol, Diesel, LPG)');
    expect(html).toContain('European Side (Avrupa)');
    expect(html).toContain('Asian Side (Anadolu)');
    expect(html).toContain('Unleaded Petrol 95');
    expect(html).toContain('Diesel (Motorin)');
    expect(html).toContain('Autogas (LPG)');
    expect(html).toContain('Delivery Courier & Vehicle Fuel Trip Cost Calculator');
  });

  it('GET /akaryakit-fiyatlari redirects to localized route', async () => {
    const res = await app.request('/akaryakit-fiyatlari', undefined, mockEnv);
    expect([301, 302]).toContain(res.status);
    expect(res.headers.get('Location')).toContain('/akaryakit-fiyatlari');
  });

  it('GET /api/akaryakit-fiyatlari returns structured JSON data', async () => {
    const res = await mobileApiRouter.request('/api/akaryakit-fiyatlari', undefined, mockEnv);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.currency).toBe('TRY');
    expect(json.prices.benzin95).toBeGreaterThan(30);
    expect(json.prices.motorin).toBeGreaterThan(30);
    expect(json.prices.lpg).toBeGreaterThan(15);
    expect(json.bothSides.avrupa).toBeDefined();
    expect(json.bothSides.anadolu).toBeDefined();
    expect(json.alert).toBeDefined();
    expect(json.history).toBeInstanceOf(Array);
  });

  it('GET /api/v1/akaryakit-fiyatlari?side=anadolu returns Asian side prices', async () => {
    const res = await mobileApiRouter.request('/api/v1/akaryakit-fiyatlari?side=anadolu', undefined, mockEnv);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.side).toBe('anadolu');
    expect(json.prices.side).toBe('anadolu');
  });

  it('GET /sitemap-static.xml includes akaryakit-fiyatlari route', async () => {
    const res = await app.request('/sitemap-static.xml', undefined, mockEnv);
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('/ar/akaryakit-fiyatlari');
    expect(xml).toContain('/en/akaryakit-fiyatlari');
    expect(xml).toContain('/tr/akaryakit-fiyatlari');
  });
});
