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

describe('Diya Holy Quran Android App Article & Multi-Language SEO Verification', () => {
  it('GET /ar/blog/quran-karim-app-offline-features-download loads Arabic article with 200 OK and Diya Quran branding', async () => {
    const res = await app.request('/ar/blog/quran-karim-app-offline-features-download', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('ضياء القرآن الكريم')
    expect(text).toContain('القرآن الكريم كامل بدون نت')
    expect(text).toContain('com.quran.karim.kamel.bidon.net.murtal.tilaat.smart')
    expect(text).toContain('https://play.google.com/store/apps/details?id=com.quran.karim.kamel.bidon.net.murtal.tilaat.smart')
    expect(text).toContain('/public/images/quran-app/00_App_Icon_3D_Logo.jpg')
    expect(text).toContain('مواقيت الصلاة')
    expect(text).toContain('تطبيقات إسلامية')
  })

  it('GET /en/blog/quran-karim-app-offline-features-download loads English article with 200 OK and Diya Quran branding', async () => {
    const res = await app.request('/en/blog/quran-karim-app-offline-features-download', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Diya Holy Quran Complete Offline')
    expect(text).toContain('play.google.com')
    expect(text).toContain('Islamic Apps')
  })

  it('GET /tr/blog/kuran-i-kerim-namaz-vakitleri-uygulamasi-indir loads Turkish article with 200 OK and Ziya Kuran branding', async () => {
    const res = await app.request('/tr/blog/kuran-i-kerim-namaz-vakitleri-uygulamasi-indir', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Ziya Kuran-ı Kerim')
    expect(text).toContain('play.google.com')
    expect(text).toContain('İslami Uygulamalar')
  })

  it('GET /tr/blog/quran-karim-app-offline-features-download loads Turkish article with 200 OK on universal slug', async () => {
    const res = await app.request('/tr/blog/quran-karim-app-offline-features-download', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Ziya Kuran-ı Kerim')
  })

  it('GET /ur/blog/quran-karim-app-offline-features-download loads Urdu article with 200 OK', async () => {
    const res = await app.request('/ur/blog/quran-karim-app-offline-features-download', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('ضیاء القرآن الکریم بغیر انٹرنیٹ')
    expect(text).toContain('play.google.com')
    expect(text).toContain('اسلامی ایپس')
  })

  it('GET /id/blog/quran-karim-app-offline-features-download loads Indonesian article with 200 OK', async () => {
    const res = await app.request('/id/blog/quran-karim-app-offline-features-download', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Dhiya Al-Quran Al-Karim Offline')
    expect(text).toContain('play.google.com')
    expect(text).toContain('Aplikasi Islami')
  })

  it('GET /fr/blog/quran-karim-app-offline-features-download loads French article with 200 OK', async () => {
    const res = await app.request('/fr/blog/quran-karim-app-offline-features-download', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Diya Le Saint Coran')
    expect(text).toContain('play.google.com')
    expect(text).toContain('Applications islamiques')
  })

  it('GET /ru/blog/quran-karim-app-offline-features-download loads Russian article with 200 OK', async () => {
    const res = await app.request('/ru/blog/quran-karim-app-offline-features-download', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Дия аль-Коран')
    expect(text).toContain('play.google.com')
    expect(text).toContain('Исламские приложения')
  })

  it('GET /fa/blog/quran-karim-app-offline-features-download loads Persian article with 200 OK', async () => {
    const res = await app.request('/fa/blog/quran-karim-app-offline-features-download', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('ضیاء قرآن کریم بدون اینترنت')
    expect(text).toContain('play.google.com')
    expect(text).toContain('اپلیکیشن‌های اسلامی')
  })

  it('GET /bn/blog/quran-karim-app-offline-features-download loads Bengali article with 200 OK', async () => {
    const res = await app.request('/bn/blog/quran-karim-app-offline-features-download', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('দিয়া আল-কুরআনুল কারীম')
    expect(text).toContain('play.google.com')
    expect(text).toContain('ইসলামিক অ্যাপস')
  })

  it('GET /de/blog/quran-karim-app-offline-features-download loads German article with 200 OK', async () => {
    const res = await app.request('/de/blog/quran-karim-app-offline-features-download', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Diya Heiliger Koran')
    expect(text).toContain('play.google.com')
    expect(text).toContain('Islamische Apps')
  })

  it('GET /ar/blog lists the new Diya Quran article on the blog index', async () => {
    const res = await app.request('/ar/blog', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('quran-karim-app-offline-features-download')
    expect(text).toContain('ضياء القرآن الكريم')
  })

  it('GET /sitemap-blog.xml includes all 10 language article hreflang URLs', async () => {
    const res = await app.request('/sitemap-blog.xml', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('/ar/blog/quran-karim-app-offline-features-download')
    expect(text).toContain('/en/blog/quran-karim-app-offline-features-download')
    expect(text).toContain('/tr/blog/quran-karim-app-offline-features-download')
    expect(text).toContain('/ur/blog/quran-karim-app-offline-features-download')
    expect(text).toContain('/id/blog/quran-karim-app-offline-features-download')
    expect(text).toContain('/fr/blog/quran-karim-app-offline-features-download')
    expect(text).toContain('/ru/blog/quran-karim-app-offline-features-download')
    expect(text).toContain('/fa/blog/quran-karim-app-offline-features-download')
    expect(text).toContain('/bn/blog/quran-karim-app-offline-features-download')
    expect(text).toContain('/de/blog/quran-karim-app-offline-features-download')
    expect(text).toContain('hreflang="id"')
    expect(text).toContain('hreflang="fr"')
    expect(text).toContain('hreflang="bn"')
    expect(text).toContain('hreflang="de"')
  })

  it('serves app-ads.txt on /app-ads.txt, /blog/app-ads.txt, and /ar/blog/app-ads.txt', async () => {
    const paths = ['/app-ads.txt', '/blog/app-ads.txt', '/ar/blog/app-ads.txt']
    for (const p of paths) {
      const res = await app.request(p, undefined, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()
      expect(text).toContain('google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0')
    }
  })
})
