import { describe, test, expect } from 'vitest';
import app from '../src/index';

// Mock DB
const mockJob = {
  id: 'job-mobile-1',
  slug: 'flutter-developer-istanbul',
  title: 'Flutter Developer',
  published_at: Date.now(),
  data: JSON.stringify({
    title_ar: 'مطور تطبيقات فلاتر وأندرويد',
    title_en: 'Flutter & Android Developer',
    title_tr: 'Flutter ve Android Geliştirici',
    description_ar: 'مطلوب مطور فلاتر ذو خبرة للعمل في إسطنبول، راتب يبدأ من 45,000 ليرة.',
    description_en: 'Looking for experienced Flutter developer in Istanbul.',
    description_tr: 'İstanbul için deneyimli Flutter geliştiricisi aranıyor.',
    company: 'comp-101',
    companyName: 'Bosphorus Tech',
    location_ar: 'شيشلي، إسطنبول',
    location_en: 'Sisli, Istanbul',
    location_tr: 'Şişli, İstanbul',
    salary: '45,000 - 65,000 TRY',
    jobType: 'Full Time',
    contactWhatsapp: '+905551234567',
    contactPhone: '+905551234567',
    contactEmail: 'jobs@bosphorus.com'
  })
};

const mockDb = {
  prepare: (query: string) => {
    return {
      bind: (...args: any[]) => ({
        all: async () => ({ results: [mockJob] }),
        first: async () => mockJob,
        run: async () => ({ success: true })
      }),
      all: async () => ({ results: [mockJob] }),
      first: async () => mockJob,
      run: async () => ({ success: true })
    };
  }
};

const mockKv = {
  get: async (key: string, type?: string) => {
    if (key === 'kv_currency_prices') {
      return {
        updatedAt: Date.now(),
        prices: [
          { name: 'الدولار الأمريكي', code: 'USD', buy: 48.25, sell: 48.30, change: { '1d': '0.05' } },
          { name: 'اليورو', code: 'EUR', buy: 55.90, sell: 55.95, change: { '1d': '-0.02' } }
        ]
      };
    }
    if (key === 'kv_gold_prices') {
      return {
        updatedAt: Date.now(),
        metals: [
          { id: '1', name: 'جرام الذهب عيار 24', buy: 3450, sell: 3465, karat: 24 }
        ]
      };
    }
    return null;
  },
  put: async () => {}
};

const mockEnv = {
  DB: mockDb,
  CACHE_KV: mockKv,
  JWT_SECRET: 'test-mobile-jwt-secret-123',
  ENVIRONMENT: 'test'
};

describe('Mobile REST API Endpoints Verification', () => {
  test('1. GET /api/v1/currencies returns live exchange rates formatted for mobile apps', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/v1/currencies', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const res = await app.fetch(req, mockEnv, { waitUntil: () => {} });
    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.base).toBe('TRY');
    expect(Array.isArray(data.currencies)).toBe(true);
    expect(data.currencies.length).toBeGreaterThan(0);

    const usd = data.currencies.find((c: any) => c.code === 'USD');
    expect(usd).toBeDefined();
    expect(usd.buy).toBeGreaterThan(0);
    expect(usd.sell).toBeGreaterThan(0);
    expect(usd.tryPerUnit).toBeDefined();
    expect(usd.unitPerTry).toBeDefined();
  });

  test('2. GET /api/v1/gold returns live gold prices', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/v1/gold', {
      method: 'GET'
    });

    const res = await app.fetch(req, mockEnv, { waitUntil: () => {} });
    expect(res.status).toBe(200);

    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.currency).toBe('TRY');
    expect(Array.isArray(data.metals)).toBe(true);
    expect(data.metals.length).toBeGreaterThan(0);
  });

  test('3. GET /api/v1/jobs returns paginated jobs list with Arabic localization', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/v1/jobs?locale=ar&page=1&limit=10', {
      method: 'GET'
    });

    const res = await app.fetch(req, mockEnv, { waitUntil: () => {} });
    expect(res.status).toBe(200);

    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.page).toBe(1);
    expect(Array.isArray(data.jobs)).toBe(true);
    expect(data.jobs.length).toBeGreaterThan(0);

    const firstJob = data.jobs[0];
    expect(firstJob.title).toBe('مطور تطبيقات فلاتر وأندرويد');
    expect(firstJob.company).toBe('Bosphorus Tech');
    expect(firstJob.location).toBe('شيشلي، إسطنبول');
    expect(firstJob.webUrl).toContain('/ar/jobs/');
  });

  test('4. GET /api/v1/jobs with locale=tr falls back gracefully if Turkish translation is missing', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/v1/jobs?locale=tr&page=1&limit=5', {
      method: 'GET'
    });

    const res = await app.fetch(req, mockEnv, { waitUntil: () => {} });
    expect(res.status).toBe(200);

    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.jobs[0].title).toBe('Flutter ve Android Geliştirici');
  });

  test('5. GET /api/v1/jobs/:idOrSlug returns detailed job info', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/v1/jobs/flutter-developer-istanbul?locale=ar', {
      method: 'GET'
    });

    const res = await app.fetch(req, mockEnv, { waitUntil: () => {} });
    expect(res.status).toBe(200);

    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.job).toBeDefined();
    expect(data.job.slug).toBe('flutter-developer-istanbul');
    expect(data.job.contactWhatsapp).toBe('+905551234567');
  });

  test('6. GET /api/v1/feed returns combined feed of currencies, gold, and jobs in single call', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/v1/feed?locale=ar', {
      method: 'GET'
    });

    const res = await app.fetch(req, mockEnv, { waitUntil: () => {} });
    expect(res.status).toBe(200);

    const data: any = await res.json();
    expect(data.success).toBe(true);
    expect(data.currencies).toBeDefined();
    expect(data.gold).toBeDefined();
    expect(data.latestJobs).toBeDefined();
  });

  test('7. POST /api/v1/notifications/broadcast rejects unauthorized requests without token', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/v1/notifications/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'turkey_jobs',
        title: 'تجربة',
        body: 'نص الرسالة'
      })
    });

    const res = await app.fetch(req, mockEnv, { waitUntil: () => {} });
    expect(res.status).toBe(401);
  });

  test('8. POST /api/v1/notifications/broadcast accepts authorized request with valid Bearer token', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/v1/notifications/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-mobile-jwt-secret-123'
      },
      body: JSON.stringify({
        topic: 'turkey_jobs',
        title: 'وظيفة جديدة',
        body: 'تم إضافة وظيفة جديدة في إسطنبول',
        data: { screen: 'jobs' }
      })
    });

    const res = await app.fetch(req, mockEnv, { waitUntil: () => {} });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data).toHaveProperty('success');
  });
});
