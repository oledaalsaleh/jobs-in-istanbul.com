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

describe('Tourism, Hotel & Restaurant Salaries in Istanbul 2026 Article & SEO Tests', () => {
  it('GET /ar/blog/tourism-hotel-salaries-istanbul-2026-guide loads Arabic article with 200 OK, full content, and 5 images', async () => {
    const res = await app.request('/ar/blog/tourism-hotel-salaries-istanbul-2026-guide', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()

    // Title & key concepts
    expect(text).toContain('دليل رواتب السياحة والمطاعم في إسطنبول 2026')
    expect(text).toContain('الاستقبال')
    expect(text).toContain('الإرشاد')
    expect(text).toContain('إدارة الفنادق')
    expect(text).toContain('السياحة والفنادق')
    expect(text).toContain('Lojman')

    // Verify all 5 real images are present
    expect(text).toContain('photo-1566073771259-6a8506099945')
    expect(text).toContain('photo-1582719478250-c89cae4dc85b')
    expect(text).toContain('photo-1527631746610-bca00a040d60')
    expect(text).toContain('photo-1555396273-367ea4eb4db5')
    expect(text).toContain('photo-1556740758-90de374c12ad')

    // Verify FAQ schema and structure
    expect(text).toContain('application/ld+json')
    expect(text).toContain('TUREB')
  })

  it('GET /en/blog/tourism-hotel-salaries-istanbul-2026-guide loads English article with 200 OK', async () => {
    const res = await app.request('/en/blog/tourism-hotel-salaries-istanbul-2026-guide', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Tourism, Hotel & Restaurant Salaries in Istanbul 2026')
    expect(text).toContain('Reception, Tour Guiding & Management')
    expect(text).toContain('Tourism & Hospitality')
  })

  it('GET /tr/blog/tourism-hotel-salaries-istanbul-2026-guide loads Turkish article with 200 OK', async () => {
    const res = await app.request('/tr/blog/tourism-hotel-salaries-istanbul-2026-guide', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('İstanbul Turizm, Otel ve Restoran Maaşları Rehberi 2026')
    expect(text).toContain('Resepsiyon, Rehberlik ve Yönetim')
    expect(text).toContain('Turizm ve Otelcilik')
  })

  it('GET /sitemap-blog.xml contains the tourism salaries article URLs', async () => {
    const res = await app.request('/sitemap-blog.xml', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('/ar/blog/tourism-hotel-salaries-istanbul-2026-guide')
    expect(text).toContain('/en/blog/tourism-hotel-salaries-istanbul-2026-guide')
    expect(text).toContain('/tr/blog/tourism-hotel-salaries-istanbul-2026-guide')
  })
})
