import { describe, expect, test } from 'vitest'
import worker, { app } from '../src/index'
import { ISTANBUL_DISTRICTS } from '../src/routes/public'

const mockEnv: any = {
  DB: {
    prepare: () => ({
      bind: () => ({
        all: async () => ({ results: [] }),
        first: async () => null
      }),
      all: async () => ({ results: [] }),
      first: async () => null
    })
  },
  CACHE_KV: {
    get: async () => null,
    put: async () => {}
  }
}

const SEVEN_TOOLS = [
  { slug: 'dilekce-generator', ids: ['dlk-type', 'dilekce-print-area', 'dilekce-translation'] },
  { slug: 'istanbulkart-calculator', ids: ['ik-card', 'ik-mode', 'ik-mavi', 'ik-verdict-box'] },
  { slug: 'ikamet-calculator', ids: ['ikm-type', 'ikm-age', 'ikm-total', 'ikm-usd'] },
  { slug: 'imei-calculator', ids: ['imei-date', 'imei-fee', 'imei-sim1-end', 'imei-compare-box'] },
  { slug: 'prayer-times', ids: ['prayer-countdown-box', 'pr-countdown-timer', 'prayer-cards-grid'] },
  { slug: 'turkey-holidays', ids: ['hol-salary', 'hol-days', 'hol-out-total', 'hol-next-days'] },
  { slug: 'istanbul-guide-directory', ids: ['pk-search', 'pk-cards-grid', 'pk-count-bar'] }
] as const

describe('7 New High-Traffic Turkey & Istanbul Daily Tools Suite', () => {
  for (const tool of SEVEN_TOOLS) {
    for (const locale of ['ar', 'tr', 'en'] as const) {
      test(`GET /${locale}/${tool.slug} returns 200 with canonical, hreflang, schemas & interactive UI`, async () => {
        const res = await app.request(`/${locale}/${tool.slug}`, { method: 'GET' }, mockEnv)
        expect(res.status).toBe(200)
        const html = await res.text()

        expect(html).toContain(`<link rel="canonical" href="https://jobs-in-istanbul.com/${locale}/${tool.slug}">`)
        expect(html).toContain(`<link rel="alternate" hreflang="ar" href="https://jobs-in-istanbul.com/ar/${tool.slug}">`)
        expect(html).toContain(`<link rel="alternate" hreflang="tr" href="https://jobs-in-istanbul.com/tr/${tool.slug}">`)
        expect(html).toContain(`<link rel="alternate" hreflang="en" href="https://jobs-in-istanbul.com/en/${tool.slug}">`)
        expect(html).toContain(`<link rel="alternate" hreflang="x-default" href="https://jobs-in-istanbul.com/en/${tool.slug}">`)
        expect(html).toContain('<meta name="robots" content="index, follow">')
        expect(html).toContain('"@type":"WebApplication"')
        expect(html).toContain('"@type":"BreadcrumbList"')
        expect(html).toContain('"@type":"FAQPage"')

        for (const id of tool.ids) {
          expect(html).toContain(`id="${id}"`)
        }
      })
    }

    test(`Secondary locale /ru/${tool.slug} returns 200 and canonicalizes to /en/${tool.slug}`, async () => {
      const res = await app.request(`/ru/${tool.slug}`, { method: 'GET' }, mockEnv)
      expect(res.status).toBe(200)
      const html = await res.text()
      expect(html).toContain(`<link rel="canonical" href="https://jobs-in-istanbul.com/en/${tool.slug}">`)
    })
  }

  test('Prayer Times supports city switching (?city=ankara, ?city=trabzon) while keeping clean canonical', async () => {
    const resAnkara = await app.request('/ar/prayer-times?city=ankara', { method: 'GET' }, mockEnv)
    expect(resAnkara.status).toBe(200)
    const htmlAnkara = await resAnkara.text()
    expect(htmlAnkara).toContain('أنقرة')
    expect(htmlAnkara).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/ar/prayer-times">')
    expect(htmlAnkara).toMatch(/\b\d{2}:\d{2}\b/)

    const resTrabzon = await app.request('/tr/prayer-times?city=trabzon', { method: 'GET' }, mockEnv)
    expect(resTrabzon.status).toBe(200)
    const htmlTrabzon = await resTrabzon.text()
    expect(htmlTrabzon).toContain('Trabzon')
    expect(htmlTrabzon).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/tr/prayer-times">')
  })

  test('Istanbul Postal Codes directory renders all 39 districts with valid ISTANBUL_DISTRICTS slugs & hotlines', async () => {
    const res = await app.request('/ar/istanbul-guide-directory', { method: 'GET' }, mockEnv)
    expect(res.status).toBe(200)
    const html = await res.text()

    const validSlugs = new Set(ISTANBUL_DISTRICTS.map(d => d.en.toLowerCase().replace(/[^a-z0-9]+/g, '-')))
    const linkMatches = [...html.matchAll(/href="\/ar\/district\/([a-z0-9-]+)"/g)].map(m => m[1])
    expect(linkMatches.length).toBe(39)
    for (const slug of linkMatches) {
      expect(validSlugs.has(slug)).toBe(true)
    }

    // Key postal codes & emergency hotlines
    expect(html).toContain('34080') // Fatih
    expect(html).toContain('34510') // Esenyurt
    expect(html).toContain('34480') // Basaksehir
    expect(html).toContain('34710') // Kadikoy
    expect(html).toContain('href="tel:112"')
    expect(html).toContain('href="tel:157"')
    expect(html).toContain('href="tel:170"')
  })

  test('Turkish SEO aliases return 301 permanent redirects to canonical tools', async () => {
    const aliases: Array<[string, string]> = [
      ['/tr/namaz-vakitleri', '/tr/prayer-times'],
      ['/ar/namaz-vakitleri?city=bursa', '/ar/prayer-times?city=bursa'],
      ['/tr/resmi-tatiller', '/tr/turkey-holidays'],
      ['/tr/istanbul-posta-kodu', '/tr/istanbul-guide-directory']
    ]
    for (const [from, to] of aliases) {
      const res = await app.request(from, { method: 'GET' }, mockEnv)
      expect(res.status).toBe(301)
      expect(res.headers.get('location')).toBe(to)
    }
  })

  test('Bare non-localized tool routes redirect 302 via Worker fetch based on Accept-Language', async () => {
    for (const tool of SEVEN_TOOLS) {
      const req = new Request(`https://jobs-in-istanbul.com/${tool.slug}`, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'tr-TR,tr;q=0.9' }
      })
      const res = await worker.fetch(req, mockEnv, {} as any)
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe(`https://jobs-in-istanbul.com/tr/${tool.slug}`)
    }
  })

  test('All 7 tools are published in /sitemap-static.xml (ar/en/tr only), /llms.txt, and /ar/sitemap', async () => {
    const smRes = await app.request('/sitemap-static.xml', { method: 'GET' }, mockEnv)
    expect(smRes.status).toBe(200)
    const smXml = await smRes.text()

    const llmsRes = await app.request('/llms.txt', { method: 'GET' }, mockEnv)
    expect(llmsRes.status).toBe(200)
    const llmsTxt = await llmsRes.text()

    const htmlSmRes = await app.request('/ar/sitemap', { method: 'GET' }, mockEnv)
    expect(htmlSmRes.status).toBe(200)
    const htmlSm = await htmlSmRes.text()

    for (const tool of SEVEN_TOOLS) {
      expect(smXml).toContain(`<loc>https://jobs-in-istanbul.com/ar/${tool.slug}</loc>`)
      expect(smXml).toContain(`<loc>https://jobs-in-istanbul.com/en/${tool.slug}</loc>`)
      expect(smXml).toContain(`<loc>https://jobs-in-istanbul.com/tr/${tool.slug}</loc>`)
      expect(smXml).not.toContain(`<loc>https://jobs-in-istanbul.com/ru/${tool.slug}</loc>`)
      expect(llmsTxt).toContain(`https://jobs-in-istanbul.com/ar/${tool.slug}`)
      expect(htmlSm).toContain(`href="/ar/${tool.slug}"`)
    }
  })
})
