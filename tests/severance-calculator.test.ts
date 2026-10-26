import { describe, it, expect } from 'vitest';
import worker, { app } from '../src/index';
import { calculateSeverancePackage, OFFICIAL_KIDEM_CEILINGS } from '../src/routes/severance-calculator';

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

describe('Turkey Severance & Notice Pay Calculator 2026 (Kıdem & İhbar Tazminatı)', () => {
  it('accurately calculates Kıdem, İhbar, and Leave Pay for employer dismissal', () => {
    const res = calculateSeverancePackage({
      startDate: '2022-01-15',
      endDate: '2026-06-15',
      salary: 35000,
      salaryType: 'gross',
      foodAllowance: 3000,
      transportAllowance: 1500,
      bonusMonthly: 1000,
      unusedLeaveDays: 14,
      reason: 'employer_dismissal'
    });

    expect(res.tenure.years).toBeGreaterThanOrEqual(4);
    expect(res.wage.baseGrossSalary).toBe(35000);
    expect(res.wage.dressedGrossSalary).toBe(40500); // 35000 + 3000 + 1500 + 1000
    expect(res.kidem.eligible).toBe(true);
    expect(res.wage.isCeilingApplied).toBe(false); // 40500 < 64948.77
    expect(res.kidem.gross).toBeGreaterThan(160000);
    expect(res.kidem.net).toBeLessThan(res.kidem.gross);
    expect(res.ihbar.eligible).toBe(true);
    expect(res.ihbar.noticeWeeks).toBe(8); // > 3 years tenure = 8 weeks notice
    expect(res.annualLeave.net).toBeGreaterThan(0);
    expect(res.summary.totalNetPayout).toBeCloseTo(res.kidem.net + res.ihbar.net + res.annualLeave.net, 1);
  });

  it('caps Kıdem calculation at the official 2026 ceiling when dressed gross exceeds ceiling', () => {
    const res = calculateSeverancePackage({
      startDate: '2021-08-01',
      endDate: '2026-08-01',
      salary: 95000,
      salaryType: 'gross',
      foodAllowance: 5000,
      transportAllowance: 5000,
      bonusMonthly: 0,
      unusedLeaveDays: 20,
      reason: 'employer_dismissal'
    });

    const h2Ceiling2026 = OFFICIAL_KIDEM_CEILINGS[0].ceilingTry; // 64948.77
    expect(res.wage.isCeilingApplied).toBe(true);
    expect(res.wage.cappedKidemBase).toBe(h2Ceiling2026);
  });

  it('disables Kıdem & İhbar on standard voluntary resignation while preserving unused leave pay', () => {
    const res = calculateSeverancePackage({
      startDate: '2023-01-01',
      endDate: '2026-03-01',
      salary: 40000,
      salaryType: 'gross',
      foodAllowance: 0,
      transportAllowance: 0,
      bonusMonthly: 0,
      unusedLeaveDays: 10,
      reason: 'voluntary_resignation'
    });

    expect(res.kidem.eligible).toBe(false);
    expect(res.kidem.net).toBe(0);
    expect(res.ihbar.eligible).toBe(false);
    expect(res.ihbar.net).toBe(0);
    expect(res.annualLeave.net).toBeGreaterThan(0);
    expect(res.summary.totalNetPayout).toBe(res.annualLeave.net);
  });

  it('renders multilingual HTML pages for ar, en, tr, ru, fa, ur with JSON-LD schema', async () => {
    for (const locale of ['ar', 'en', 'tr', 'ru', 'fa', 'ur']) {
      const res = await app.request(`/${locale}/kidem-tazminati-hesaplama`, undefined, mockEnv);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('Kıdem');
      expect(html).toContain('application/ld+json');
      expect(html).toContain('FAQPage');
    }
  });

  it('serves JSON calculation results via /api/kidem-tazminati and /api/v1/kidem-tazminati', async () => {
    const req = new Request('https://jobs-in-istanbul.com/api/v1/kidem-tazminati?start=2022-01-01&end=2026-01-01&salary=45000&type=gross&reason=employer_dismissal');
    const res = await worker.fetch(req, mockEnv, {});
    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.success).toBe(true);
    expect(json.kidem.eligible).toBe(true);
    expect(json.summary.totalNetPayout).toBeGreaterThan(0);
    expect(Array.isArray(json.ceilingsTable)).toBe(true);
  });

  it('includes /:locale/kidem-tazminati-hesaplama in /sitemap-static.xml', async () => {
    const res = await app.request('/sitemap-static.xml', undefined, mockEnv);
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('https://jobs-in-istanbul.com/ar/kidem-tazminati-hesaplama');
    expect(xml).toContain('https://jobs-in-istanbul.com/tr/kidem-tazminati-hesaplama');
    expect(xml).toContain('https://jobs-in-istanbul.com/en/kidem-tazminati-hesaplama');
  });
});
