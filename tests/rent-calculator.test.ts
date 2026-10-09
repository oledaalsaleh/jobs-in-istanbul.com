import { describe, it, expect } from 'vitest';
import { app } from '../src/index';
import { rentCalculatorRouter } from '../src/routes/rent-calculator';
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

describe('Turkey Legal Rent Increase Calculator 2026 (Kira Artış Oranı TÜFE) Tests', () => {
  it('GET /ar/kira-artis-orani loads Arabic page with 200 OK, calculator, legal rules, and table', async () => {
    const res = await app.request('/ar/kira-artis-orani', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();

    // Verify Title & Terminology
    expect(html).toContain('حاسبة ومؤشر نسبة زيادة الإيجار القانونية في تركيا 2026');
    expect(html).toContain('قيمة الإيجار الشهري الحالي');
    expect(html).toContain('شهر تجديد العقد');
    expect(html).toContain('مسكن / شقة سكنية (Konut)');
    expect(html).toContain('محل تجاري / مكتب (İşyeri)');

    // Verify Legal Articles (TBK)
    expect(html).toContain('إلغاء سقف الـ 25% والالتزام بمعدل التضخم (TÜFE)');
    expect(html).toContain('قاعدة الـ 5 سنوات ودعوى تحديد الإيجار (Kira Tespit Davası)');
    expect(html).toContain('حماية التجديد التلقائي لـ 10 سنوات (10 Yıllık Uzama)');
    expect(html).toContain('شروط صحة تعهد الإخلاء (Tahliye Taahhütnamesi)');

    // Verify Historical Rates Table
    expect(html).toContain('الجدول الرسمي لنسب زيادة الإيجار الشهرية في تركيا');
    expect(html).toContain('أكتوبر 2026');
    expect(html).toContain('TÜİK');

    // Verify Schema.org
    expect(html).toContain('https://schema.org');
    expect(html).toContain('WebApplication');
    expect(html).toContain('FAQPage');
  });

  it('GET /en/kira-artis-orani loads English version with 200 OK', async () => {
    const res = await app.request('/en/kira-artis-orani', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('Turkey Legal Rent Increase Calculator 2026');
    expect(html).toContain('Current Monthly Rent (TRY ₺)');
    expect(html).toContain('Removal of the 25% Cap & Return to TÜFE Inflation');
    expect(html).toContain('The 5-Year Rule and Rent Determination Lawsuit');
  });

  it('GET /tr/kira-artis-orani loads Turkish version with 200 OK', async () => {
    const res = await app.request('/tr/kira-artis-orani', undefined, mockEnv);
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain('Kira Artış Oranı Hesaplama 2026 (TÜİK TÜFE)');
    expect(html).toContain('Mevcut Aylık Kira Bedeli');
    expect(html).toContain('Yeni Kira Bedelinizi Hesaplayın');
    expect(html).toContain('Türk Borçlar Kanunu (TBK) Kapsamında Kiracı Hakları');
  });

  it('GET /kira-artis-orani redirects to locale route', async () => {
    const res = await app.request('/kira-artis-orani', undefined, mockEnv);
    expect([301, 302]).toContain(res.status);
    expect(res.headers.get('Location')).toContain('/kira-artis-orani');
  });

  it('GET /api/kira-artis-orani calculates new rent accurately', async () => {
    // 25,000 TRY rent with October 2026 (48.15%)
    const res = await rentCalculatorRouter.request('/api/kira-artis-orani?rent=25000&month=2026-10', undefined, mockEnv);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.currentRent).toBe(25000);
    expect(json.ratePercentage).toBe(48.15);
    expect(json.increaseAmount).toBe(12037.5);
    expect(json.newMonthlyRent).toBe(37037.5);
    expect(json.ratesTable).toBeInstanceOf(Array);
  });

  it('GET /api/v1/kira-artis-orani in mobileApiRouter returns structured calculation', async () => {
    const res = await mobileApiRouter.request('/api/v1/kira-artis-orani?rent=30000&month=2026-10&tenure=2', undefined, mockEnv);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.currentRent).toBe(30000);
    expect(json.ratePercentage).toBe(48.15);
    expect(json.increaseAmount).toBe(14445);
    expect(json.newMonthlyRent).toBe(44445);
    expect(json.legalCapStrictlyApplies).toBe(true);
  });

  it('GET /sitemap-static.xml includes kira-artis-orani route', async () => {
    const res = await app.request('/sitemap-static.xml', undefined, mockEnv);
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('/ar/kira-artis-orani');
    expect(xml).toContain('/en/kira-artis-orani');
    expect(xml).toContain('/tr/kira-artis-orani');
  });
});
