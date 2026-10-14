import { describe, it, expect } from 'vitest';
import { app } from '../src/index';

const mockDb = {
  prepare: (sql: string) => ({
    bind: (...args: any[]) => ({
      all: async () => ({ results: [] }),
      first: async () => null,
      run: async () => ({})
    }),
    all: async () => ({ results: [] }),
    first: async () => null
  })
};

const mockEnv = {
  DB: mockDb,
  CACHE_KV: {
    get: async () => null,
    put: async () => {},
    delete: async () => {}
  },
  MEDIA_BUCKET: {
    put: async (key: string, value: any, options: any) => ({}),
    get: async (key: string) => null
  }
};

describe('In-Feed Google Play Travel Guide Native Ad Feature Tests', () => {
  it('GET /ar renders in-feed native sponsored ad card with Arabic translations', async () => {
    const res = await app.request('/ar', {}, mockEnv);
    expect(res.status).toBe(200);
    const html = await res.text();

    expect(html).toContain('native-ad-feed-card');
    expect(html).toContain('data-ad-unit="google-play-turkey-guide"');
    expect(html).toContain('دليل تركيا السياحي بدون نت');
    expect(html).toContain('https://play.google.com/store/apps/details?id=com.trabzon.turkey.travel.guide');
    expect(html).toContain('تثبيت من Google Play');
    expect(html).toContain('مجاني 100%');
    expect(html).toContain('Offline');
    expect(html).toContain('/public/images/turkey-guide-app.png');
  });

  it('GET /en renders in-feed native sponsored ad card with English translations', async () => {
    const res = await app.request('/en', {}, mockEnv);
    expect(res.status).toBe(200);
    const html = await res.text();

    expect(html).toContain('native-ad-feed-card');
    expect(html).toContain('Turkey Travel Guide Offline');
    expect(html).toContain('Install on Google Play');
    expect(html).toContain('100% Free');
    expect(html).toContain('Sponsored');
  });

  it('GET /tr renders in-feed native sponsored ad card with Turkish translations', async () => {
    const res = await app.request('/tr', {}, mockEnv);
    expect(res.status).toBe(200);
    const html = await res.text();

    expect(html).toContain('native-ad-feed-card');
    expect(html).toContain('İnternetsiz Türkiye Gezi Rehberi');
    expect(html).toContain('Hemen Ücretsiz Yükle');
    expect(html).toContain('%100 Ücretsiz');
    expect(html).toContain('Sponsorlu');
  });

  it('GET /public/images/turkey-guide-app.png serves valid PNG image with immutable cache', async () => {
    const res = await app.request('/public/images/turkey-guide-app.png', {}, mockEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect(res.headers.get('cache-control')).toContain('immutable');

    const buf = await res.arrayBuffer();
    expect(buf.byteLength).toBeGreaterThan(1000);
  });

  it('GET /images/turkey-guide-app.png alias serves valid PNG image', async () => {
    const res = await app.request('/images/turkey-guide-app.png', {}, mockEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
  });
});
