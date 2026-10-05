import { describe, test, expect } from 'vitest';
import worker, { app } from '../src/index';

const mockEnv = {
  ENVIRONMENT: 'production',
  JWT_SECRET: 'test-secret',
  CACHE_KV: {
    data: new Map<string, string>(),
    async get(key: string, format?: string) {
      const val = this.data.get(key);
      if (!val) return null;
      if (format === 'json') return JSON.parse(val);
      return val;
    },
    async put(key: string, val: string) {
      this.data.set(key, val);
    }
  },
  DB: {
    prepare: () => {
      const queryObj = {
        first: async () => null,
        all: async () => ({ results: [] }),
        run: async () => ({ success: true })
      };
      return {
        ...queryObj,
        bind: () => queryObj
      };
    }
  }
};

describe('Gold Prices Automatic Live Updates & API Verification', () => {
  test('1. GET /ar/gold-prices renders live status badge and auto-update elements', async () => {
    const res = await app.request('/ar/gold-prices', {}, mockEnv);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('live-indicator-dot');
    expect(html).toContain('gold-refresh-btn');
    expect(html).toContain('data-gold-id');
    expect(html).toContain('fetchLiveRates');
    expect(html).toContain('setInterval');
  });

  test('2. GET /en/gold-prices and /tr/gold-prices render correctly in English and Turkish', async () => {
    const resEn = await app.request('/en/gold-prices', {}, mockEnv);
    expect(resEn.status).toBe(200);
    const htmlEn = await resEn.text();
    expect(htmlEn).toContain('Gold Prices in Turkey Today');
    expect(htmlEn).toContain('Live: Real-Time Auto-Updating Rates');

    const resTr = await app.request('/tr/gold-prices', {}, mockEnv);
    expect(resTr.status).toBe(200);
    const htmlTr = await resTr.text();
    expect(htmlTr).toContain('Türkiye Altın Fiyatları Bugün');
    expect(htmlTr).toContain('Canlı: Sürekli Otomatik Güncelleme');
  });

  test('3. GET /api/gold returns live JSON rate data with proper structure', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/gold');
    const res = await worker.fetch(req, mockEnv, { waitUntil: () => {} });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.metals)).toBe(true);
    expect(json.metals.length).toBeGreaterThan(0);
    expect(json.metals.some((m: any) => m.id === '1')).toBe(true); // 24K Gram
  });

  test('4. GET /api/gold?refresh=1 triggers on-demand live revalidation', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/gold?refresh=1');
    const res = await worker.fetch(req, mockEnv, { waitUntil: () => {} });
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.metals.length).toBeGreaterThan(0);
  });
});
