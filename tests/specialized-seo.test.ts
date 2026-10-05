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

describe('Work Permit Transfer Article & 21 Specialized SEO Landing Pages Tests', () => {
  // 1. Work Permit Transfer Article Tests
  it('GET /ar/blog/work-permit-transfer-turkey-2026-guide loads Arabic article with 200 OK, 5 images, and FAQ schema', async () => {
    const res = await app.request('/ar/blog/work-permit-transfer-turkey-2026-guide', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()

    // Title & key concepts
    expect(text).toContain('نقل إذن العمل من شركة لأخرى في تركيا 2026')
    expect(text).toContain('فقدان الإقامة')
    expect(text).toContain('SGK')
    expect(text).toContain('e-İzin')
    expect(text).toContain('فترة السماح')

    // 5 real photography images verified
    expect(text).toContain('photo-1544717305-2782549b5136')
    expect(text).toContain('photo-1450133064473-71024230f91b')
    expect(text).toContain('photo-1527838832700-5059252407fa')
    expect(text).toContain('photo-1589829545856-d10d557cf95f')
    expect(text).toContain('photo-1573496359142-b8d87734a5a2')

    // Schema
    expect(text).toContain('application/ld+json')
    expect(text).toContain('FAQPage')
  })

  it('GET /en/blog/work-permit-transfer-turkey-2026-guide loads English article with 200 OK', async () => {
    const res = await app.request('/en/blog/work-permit-transfer-turkey-2026-guide', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('How to Transfer a Work Permit Between Companies in Turkey 2026')
    expect(text).toContain('Ministry of Labor')
  })

  it('GET /tr/blog/work-permit-transfer-turkey-2026-guide loads Turkish article with 200 OK', async () => {
    const res = await app.request('/tr/blog/work-permit-transfer-turkey-2026-guide', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain("Türkiye'de Şirketler Arası Çalışma İzni Transferi 2026")
    expect(text).toContain('Çalışma ve Sosyal Güvenlik Bakanlığı')
  })

  // 2. Specialized Landing Pages Tests (New & Existing)
  const sampleSpecialized = [
    'jobs-for-arabs',
    'medical-tourism-jobs',
    'real-estate-jobs',
    'tech-developer-jobs',
    'translation-jobs',
    'accounting-jobs',
    'jobs-in-fatih',
    'jobs-in-basaksehir',
    'jobs-in-esenyurt',
    'jobs-in-sisli',
    'jobs-in-beylikduzu',
    'jobs-in-taksim',
    'jobs-in-kadikoy'
  ]

  for (const pageType of sampleSpecialized) {
    it(`GET /ar/${pageType} returns 200 OK, includes FAQ accordions and FAQPage JSON-LD schema`, async () => {
      const res = await app.request(`/ar/${pageType}`, undefined, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()

      // Header & Navigation
      expect(text).toContain('الرئيسية')

      // Rich FAQ Accordion Section
      expect(text).toContain('<details')
      expect(text).toContain('<summary')
      expect(text).toContain('الأسئلة الشائعة وإرشادات العمل')

      // Google Rich Snippets JSON-LD Schemas
      expect(text).toContain('application/ld+json')
      expect(text).toContain('FAQPage')
      expect(text).toContain('BreadcrumbList')
    })
  }

  // 3. Multi-language Support for Specialized Landing Pages
  it('GET /en/medical-tourism-jobs and /tr/medical-tourism-jobs return 200 OK with correct locale content', async () => {
    const resEn = await app.request('/en/medical-tourism-jobs', undefined, mockEnv)
    expect(resEn.status).toBe(200)
    const textEn = await resEn.text()
    expect(textEn).toContain('Medical Tourism & Aesthetic Clinic Jobs in Istanbul 2026')
    expect(textEn).toContain('Frequently Asked Questions & Guide')

    const resTr = await app.request('/tr/medical-tourism-jobs', undefined, mockEnv)
    expect(resTr.status).toBe(200)
    const textTr = await resTr.text()
    expect(textTr).toContain('İstanbul Medikal Turizm ve Sağlık Turizmi İş İlanları 2026')
    expect(textTr).toContain('Sıkça Sorulan Sorular ve Rehber')
  })

  // 4. District Specialized Pages
  it('GET /ar/jobs-in-fatih loads Fatih district landing page with Aksaray & Laleli keywords', async () => {
    const res = await app.request('/ar/jobs-in-fatih', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('وظائف في منطقة الفاتح إسطنبول 2026')
    expect(text).toContain('أكسراي')
    expect(text).toContain('لالالي')
  })

  // 5. XML Sitemap includes all 21 specialized landing pages
  it('GET /sitemap-static.xml contains the new specialized landing page URLs', async () => {
    const res = await app.request('/sitemap-static.xml', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('/ar/medical-tourism-jobs')
    expect(text).toContain('/ar/real-estate-jobs')
    expect(text).toContain('/ar/tech-developer-jobs')
    expect(text).toContain('/ar/jobs-in-fatih')
    expect(text).toContain('/ar/jobs-in-kadikoy')
  })
})
