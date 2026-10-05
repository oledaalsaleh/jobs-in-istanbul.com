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

describe('Remote Work & Freelancing in Turkey 2026 Article & SEO Tests', () => {
  it('GET /ar/blog/remote-work-turkey-freelance-company-tax-2026 loads Arabic article with 200 OK, full content, and 5 images', async () => {
    const res = await app.request('/ar/blog/remote-work-turkey-freelance-company-tax-2026', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()

    // Title & key concepts
    expect(text).toContain('دليل العمل عن بعد والفريلانس من تركيا 2026')
    expect(text).toContain('فتح شركة شخصية')
    expect(text).toContain('Şahıs Şirketi')
    expect(text).toContain('89/13')
    expect(text).toContain('العمل الحر والضرائب')

    // Verify all 5 real images are present
    expect(text).toContain('photo-1522202176988-66273c2fd55f')
    expect(text).toContain('photo-1450133064473-71024230f91b')
    expect(text).toContain('photo-1554224155-6726b3ff858f')
    expect(text).toContain('photo-1563986768609-322da13575f3')
    expect(text).toContain('photo-1497366216548-37526070297c')

    // Verify FAQ schema and structure
    expect(text).toContain('application/ld+json')
    expect(text).toContain('Mali Müşavir')
  })

  it('GET /en/blog/remote-work-turkey-freelance-company-tax-2026 loads English article with 200 OK', async () => {
    const res = await app.request('/en/blog/remote-work-turkey-freelance-company-tax-2026', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Remote Work & Freelancing in Turkey 2026')
    expect(text).toContain('Sole Proprietorship')
    expect(text).toContain('Freelance & Taxes')
  })

  it('GET /tr/blog/remote-work-turkey-freelance-company-tax-2026 loads Turkish article with 200 OK', async () => {
    const res = await app.request('/tr/blog/remote-work-turkey-freelance-company-tax-2026', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain("Türkiye'de Uzaktan Çalışma ve Freelance Rehberi 2026")
    expect(text).toContain('Şahıs Şirketi')
    expect(text).toContain('Freelance ve Vergi')
  })

  it('GET /sitemap-blog.xml contains the remote work article URLs', async () => {
    const res = await app.request('/sitemap-blog.xml', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('/ar/blog/remote-work-turkey-freelance-company-tax-2026')
    expect(text).toContain('/en/blog/remote-work-turkey-freelance-company-tax-2026')
    expect(text).toContain('/tr/blog/remote-work-turkey-freelance-company-tax-2026')
  })
})
