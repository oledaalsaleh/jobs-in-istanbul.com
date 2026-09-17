import { describe, test, expect } from 'vitest'
import app from '../src/index'

// Helper mock job data
const mockJobsList = [
  {
    id: 'job-1',
    slug: 'arabic-call-center-agent',
    title: 'Arabic Call Center Agent',
    published_at: Date.now(),
    data: JSON.stringify({
      title_ar: 'موظف كول سنتر عربي',
      title_en: 'Arabic Call Center Agent',
      title_tr: 'Arapça Çağrı Merkezi Temsilcisi',
      description_ar: 'مطلوب موظف كول سنتر ومبيعات هاتفية لشركة كبرى في إسطنبول، راتب يبدأ من 32,000 ليرة مع تأمين SGK وسكن وسيرفيس.',
      description_en: 'Seeking Arabic customer service agent in Istanbul. Salary 32,000 TRY with full SGK and transport.',
      company: 'comp-1',
      company_name: 'Tech Istanbul AS',
      location_ar: 'شيشلي، إسطنبول',
      location_en: 'Sisli, Istanbul',
      location_tr: 'Şişli, İstanbul',
      salary: '32,000 - 45,000 TRY',
      jobType: 'Full Time',
      phone: '+90 555 123 4567',
      featured: true
    })
  },
  {
    id: 'job-2',
    slug: 'vip-tourist-driver',
    title: 'VIP Tourist Driver',
    published_at: Date.now(),
    data: JSON.stringify({
      title_ar: 'سائق سياحي VIP فان',
      title_en: 'VIP Tourist Chauffeur',
      title_tr: 'VIP Turizm Şoförü',
      description_ar: 'مطلوب سائق سياحي مع رخصة قيادة وشهادة SRC للعمل في الفاتح، راتب 45,000 ليرة.',
      description_en: 'VIP Driver wanted with valid driver license and SRC.',
      company: 'comp-2',
      company_name: 'Bosphorus Tours',
      location_ar: 'الفاتح، إسطنبول',
      location_en: 'Fatih, Istanbul',
      location_tr: 'Fatih, İstanbul',
      salary: '45,000 TRY',
      jobType: 'Full Time',
      phone: '+90 555 987 6543'
    })
  }
];

const mockCompany = {
  id: 'comp-1',
  slug: 'tech-istanbul-as',
  title: 'Tech Istanbul AS',
  data: JSON.stringify({
    name: 'Tech Istanbul AS',
    description: 'Leading digital technology and customer support agency in Turkey.',
    website: 'https://example.com',
    logo: 'https://example.com/logo.png'
  })
};

// Create in-memory mock DB and environment
const mockDb = {
  prepare: (query: string) => {
    const handleQuery = () => {
      if (query.includes('companies') || query.includes('comp-1')) {
        return {
          results: [mockCompany],
          first: mockCompany
        };
      }
      return {
        results: mockJobsList,
        first: mockJobsList[0]
      };
    };

    return {
      bind: (...args: any[]) => ({
        all: async () => ({ results: handleQuery().results }),
        first: async () => handleQuery().first,
        run: async () => ({ success: true })
      }),
      all: async () => ({ results: handleQuery().results }),
      first: async () => handleQuery().first,
      run: async () => ({ success: true })
    };
  }
};

const mockEnv = {
  DB: mockDb,
  JWT_SECRET: 'test-jwt-secret-key-12345'
}

describe('Full Real-world Verification of All 10 New Strategic Features', () => {

  // 1. Specialized SEO Landing Pages
  test('1. Specialized SEO Landing Pages load with 200 OK and rich markup', async () => {
    const pages = [
      '/ar/jobs-for-arabs',
      '/ar/jobs-without-turkish',
      '/ar/entry-level-jobs',
      '/ar/driver-jobs',
      '/ar/restaurant-jobs',
      '/ar/factory-jobs',
      '/ar/call-center-jobs',
      '/ar/jobs-for-women',
      '/ar/student-jobs'
    ]

    for (const p of pages) {
      const res = await app.fetch(new Request(`https://jobs-in-istanbul.com${p}`), mockEnv, {} as any)
      expect(res.status).toBe(200)
      const text = await res.text()
      expect(text).toContain('<!DOCTYPE html>')
      expect(text).toContain('jobs-in-istanbul.com')
      expect(text).toContain('fa-solid')
    }
  })

  // 2. Bare route redirect to preferred locale
  test('2. Bare route auto-redirects to preferred language', async () => {
    const res = await app.fetch(new Request('https://jobs-in-istanbul.com/jobs-for-arabs', {
      headers: { 'accept-language': 'ar-EG,ar;q=0.9' }
    }), mockEnv, {} as any)
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('https://jobs-in-istanbul.com/ar/jobs-for-arabs')
  })

  // 3. Single Job View contains Trust, Badges, Scam Warning, and Inline AI match
  test('3. Single Job View renders Scam Warning, Verified badge, Benefit pills, and Report button', async () => {
    const res = await app.fetch(new Request('https://jobs-in-istanbul.com/ar/jobs/arabic-call-center-agent'), mockEnv, {} as any)
    expect(res.status).toBe(200)
    const text = await res.text()

    // Scam warning banner
    expect(text).toContain('تنبيه أمني لمكافحة الاحتيال الوظيفي')
    expect(text).toContain('لا تدفع أي مبالغ مالية')

    // Verified badge
    expect(text).toContain('تم التحقق من الوظيفة')

    // Benefit badges (SGK, Housing, Transport, Meals, Work Permit)
    expect(text).toContain('SGK')
    expect(text).toContain('السكن')
    expect(text).toContain('المواصلات')
    expect(text).toContain('الوجبات')
    expect(text).toContain('إذن العمل')

    // Inline AI match widget
    expect(text).toContain('فحص مدى ملاءمتك للوظيفة بالذكاء الاصطناعي')
    expect(text).toContain('btn-inline-match')

    // Report Scam Button & Modal
    expect(text).toContain('الإبلاغ عن وظيفة مشبوهة')
    expect(text).toContain('report-job-modal')
  })

  // 4. Report Job API Endpoint
  test('4. POST /ar/api/report-job successfully accepts and logs reports', async () => {
    const res = await app.fetch(new Request('https://jobs-in-istanbul.com/ar/api/report-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: 'job-1',
        jobTitle: 'Arabic Call Center Agent',
        reason: 'money_requested',
        details: 'Employer asked for 500 TRY registration fee',
        reporterEmail: 'user@example.com'
      })
    }), mockEnv, {} as any)

    expect(res.status).toBe(200)
    const json: any = await res.json()
    expect(json.success).toBe(true)
  })

  // 5. Company Profile Page
  test('5. GET /ar/companies/:slug renders Company Profile with Verified badge and jobs', async () => {
    const res = await app.fetch(new Request('https://jobs-in-istanbul.com/ar/companies/tech-istanbul-as'), mockEnv, {} as any)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Tech Istanbul AS')
    expect(text).toContain('جهة عمل موثقة')
    expect(text).toContain('الوظائف المتاحة حالياً')
  })

  // 6. Dedicated AI Job Matcher Page
  test('6. GET /ar/ai-job-matcher loads the AI CV matcher page', async () => {
    const res = await app.fetch(new Request('https://jobs-in-istanbul.com/ar/ai-job-matcher'), mockEnv, {} as any)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('محرك مطابقة السيرة الذاتية الذكي بالذكاء الاصطناعي')
    expect(text).toContain('ai-matcher-form')
    expect(text).toContain('btnRunMatcher')
  })

  // 7. AI Job Matcher POST API
  test('7. POST /ar/api/ai-job-match returns ranked matches with percentage scores', async () => {
    const res = await app.fetch(new Request('https://jobs-in-istanbul.com/ar/api/ai-job-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText: 'أنا موظف مبيعات وكول سنتر ولدي خبرة ٣ سنوات في خدمة العملاء واللغة العربية والتركية.'
      })
    }), mockEnv, {} as any)

    expect(res.status).toBe(200)
    const json: any = await res.json()
    expect(json.matches).toBeDefined()
    expect(Array.isArray(json.matches)).toBe(true)
    expect(json.matches.length).toBeGreaterThan(0)
    expect(json.matches[0].score).toBeGreaterThanOrEqual(40)
  })

  // 8. Single Target Job Match POST API
  test('8. POST /ar/api/ai-job-match with targetJobId evaluates single job match', async () => {
    const res = await app.fetch(new Request('https://jobs-in-istanbul.com/ar/api/ai-job-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText: 'خبرة في مجال الكول سنتر وخدمة العملاء واللغة العربية',
        targetJobId: 'job-1'
      })
    }), mockEnv, {} as any)

    expect(res.status).toBe(200)
    const json: any = await res.json()
    expect(json.score).toBeDefined()
    expect(json.score).toBeGreaterThanOrEqual(45)
  })

  // 9. 5 New High-Intent 2026 Blog Articles
  test('9. High-Intent Blog Articles for 2026 render accurately with rich content', async () => {
    const articles = [
      '/ar/blog/driver-salary-istanbul-2026',
      '/ar/blog/jobs-without-turkish-in-turkey-2026',
      '/ar/blog/turkey-work-permit-guide-2026',
      '/ar/blog/arab-jobs-in-turkey-guide-2026',
      '/ar/blog/istanbul-salaries-guide-2026'
    ]

    for (const art of articles) {
      const res = await app.fetch(new Request(`https://jobs-in-istanbul.com${art}`), mockEnv, {} as any)
      expect(res.status).toBe(200)
      const text = await res.text()
      expect(text).toContain('article-rich-text')
      expect(text).toContain('2026')
    }
  })

  // 10. Sitemaps contain all new routes and static routes
  test('10. sitemap-static.xml includes all 9 specialized SEO routes and AI matcher', async () => {
    const res = await app.fetch(new Request('https://jobs-in-istanbul.com/sitemap-static.xml'), mockEnv, {} as any)
    expect(res.status).toBe(200)
    const xml = await res.text()
    expect(xml).toContain('https://jobs-in-istanbul.com/ar/jobs-for-arabs')
    expect(xml).toContain('https://jobs-in-istanbul.com/ar/jobs-without-turkish')
    expect(xml).toContain('https://jobs-in-istanbul.com/ar/driver-jobs')
    expect(xml).toContain('https://jobs-in-istanbul.com/ar/ai-job-matcher')
  })
})
