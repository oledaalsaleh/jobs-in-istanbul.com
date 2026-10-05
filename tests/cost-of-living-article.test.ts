import { describe, it, expect } from 'vitest'
import { app } from '../src/index'

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
}

const mockEnv = {
  DB: mockDb,
  JWT_SECRET: 'test-secret',
  ENVIRONMENT: 'development'
}

describe('Real Cost of Living in Istanbul 2026 Article & SEO Tests', () => {
  it('GET /ar/blog/cost-of-living-istanbul-2026-guide loads Arabic article with 200 OK, full content, and 5 images', async () => {
    const res = await app.request('/ar/blog/cost-of-living-istanbul-2026-guide', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()

    // Title & key concepts
    expect(text).toContain('تكلفة المعيشة الحقيقية في إسطنبول 2026')
    expect(text).toContain('إيجار')
    expect(text).toContain('الفواتير')
    expect(text).toContain('الطعام')
    expect(text).toContain('تكاليف المعيشة والسكن')

    // Verify all 5 real images are present
    expect(text).toContain('photo-1541432901042-2d8bd64b4a9b')
    expect(text).toContain('photo-1545324418-cc1a3fa10c00')
    expect(text).toContain('photo-1542838132-92c53300491e')
    expect(text).toContain('photo-1570125909232-eb263c188f7e')
    expect(text).toContain('photo-1511632765486-a01980e01a18')

    // Verify FAQ schema and structure
    expect(text).toContain('application/ld+json')
    expect(text).toContain('İstanbulkart')
  })

  it('GET /en/blog/cost-of-living-istanbul-2026-guide loads English article with 200 OK', async () => {
    const res = await app.request('/en/blog/cost-of-living-istanbul-2026-guide', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Real Cost of Living in Istanbul 2026')
    expect(text).toContain('Detailed Budget for Rent, Bills & Food')
    expect(text).toContain('Cost of Living & Housing')
  })

  it('GET /tr/blog/cost-of-living-istanbul-2026-guide loads Turkish article with 200 OK', async () => {
    const res = await app.request('/tr/blog/cost-of-living-istanbul-2026-guide', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain("İstanbul'da Yaşam Maliyeti 2026")
    expect(text).toContain('Kira, Faturalar ve Mutfak Masrafları')
    expect(text).toContain('Yaşam Maliyeti ve Konut')
  })

  it('GET /sitemap-blog.xml contains the cost of living article URLs', async () => {
    const res = await app.request('/sitemap-blog.xml', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('/ar/blog/cost-of-living-istanbul-2026-guide')
    expect(text).toContain('/en/blog/cost-of-living-istanbul-2026-guide')
    expect(text).toContain('/tr/blog/cost-of-living-istanbul-2026-guide')
  })
})
