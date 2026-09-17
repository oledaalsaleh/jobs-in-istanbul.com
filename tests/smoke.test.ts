import { expect, test, describe } from 'vitest'
import { app } from '../src/index'
import { sign } from 'hono/jwt'


// Mock Cloudflare D1 Database binding
const mockDb = {
  prepare: (sql: string) => {
    return {
      bind: (...args: any[]) => {
        return {
          all: async () => {
            // Return minimal mock categories for homepage
            if (sql.includes("categories")) {
              return {
                results: [
                  { id: 'cat-it', slug: 'it-software', data: JSON.stringify({ name_ar: 'برمجة', name_en: 'IT', icon: '💻' }) }
                ]
              };
            }
            // Return minimal mock companies
            if (sql.includes("companies")) {
              return {
                results: [
                  { id: 'comp-ist-tech', slug: 'ist-tech', data: JSON.stringify({ name: 'Istanbul Tech', logo: '' }) }
                ]
              };
            }
            // Return empty jobs array
            return { results: [] };
          },
          first: async () => {
            if (sql.includes("jobs")) {
              return {
                id: 'job-123',
                published_at: 1719324000000,
                data: JSON.stringify({
                  title_ar: 'مهندس برمجيات',
                  title_en: 'Software Engineer',
                  description_ar: 'وصف الوظيفة بالعربية\nتفاصيل إضافية.',
                  description_en: 'Job description in English\nAdditional details.',
                  company: 'comp-ist-tech',
                  category: 'cat-it',
                  jobType: 'remote',
                  salary: '20,000 - 30,000 TL',
                  phone: '+90 555 123 4567',
                  location_ar: 'إسطنبول',
                  location_en: 'Istanbul',
                  slug: 'software-engineer',
                  screeningQuestionsJson: JSON.stringify([
                    { question: 'Do you know TypeScript?', options: ['Yes', 'No'], correct: 'Yes' }
                  ])
                })
              };
            }
            if (sql.includes("documents WHERE id = ?")) {
              return {
                data: JSON.stringify({
                  name: 'Istanbul Tech',
                  logo: '/uploads/logo.png',
                  website: 'https://istanbultech.com',
                  description: 'A great tech company.'
                })
              };
            }
            return null;
          },
          run: async () => ({})
        };
      },
      all: async () => {
        // Return minimal mock categories/companies/jobs
        if (sql.includes("categories")) {
          return {
            results: [
              { id: 'cat-it', slug: 'it-software', data: JSON.stringify({ name_ar: 'برمجة', name_en: 'IT', icon: '💻' }) }
            ]
          };
        }
        if (sql.includes("companies")) {
          return {
            results: [
              { id: 'comp-ist-tech', slug: 'ist-tech', data: JSON.stringify({ name: 'Istanbul Tech', logo: '' }) }
            ]
          };
        }
        return { results: [] };
      },
      first: async () => {
        if (sql.includes("jobs")) {
          return {
            id: 'job-123',
            published_at: 1719324000000,
            data: JSON.stringify({
              title_en: 'Software Engineer',
              screeningQuestionsJson: JSON.stringify([
                { question: 'Do you know TypeScript?', options: ['Yes', 'No'], correct: 'Yes' }
              ])
            })
          };
        }
        return null;
      },
      run: async () => ({})
    };
  }
};

describe('Istanbul Jobs Portal Smoke Tests', () => {
  const mockEnv = {
    DB: mockDb,
    CACHE_KV: {
      get: async () => null,
      put: async () => {}
    },
    MEDIA_BUCKET: {
      put: async (key: string, value: any, options: any) => ({}),
      get: async (key: string) => null
    }
  };

  test('GET /ar loads successfully with Arabic text', async () => {
    const res = await app.request('/ar', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('إسطنبول')
  })

  test('GET /en loads successfully with English text', async () => {
    const res = await app.request('/en', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Istanbul')
  })

  test('GET /tr loads successfully with Turkish text', async () => {
    const res = await app.request('/tr', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('İstanbul')
  })

  test('GET /ru loads successfully with Russian text', async () => {
    const res = await app.request('/ru', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Стамбуле')
  })

  test('GET /fa loads successfully with Persian text', async () => {
    const res = await app.request('/fa', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('استانبول')
  })

  test('GET /ur loads successfully with Urdu text', async () => {
    const res = await app.request('/ur', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('استنبول')
  })

  test('GET /robots.txt serves indexing instructions', async () => {
    const res = await app.request('/robots.txt', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('User-agent:')
    expect(text).toContain('Sitemap:')
  })

  test('GET /app-ads.txt serves IAB compliant app-ads record', async () => {
    const res = await app.request('/app-ads.txt', {}, mockEnv)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/plain')
    const text = await res.text()
    expect(text).toContain('google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0')
  })

  test('GET /ads.txt serves web ads record', async () => {
    const res = await app.request('/ads.txt', {}, mockEnv)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/plain')
    const text = await res.text()
    expect(text).toContain('google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0')
  })


  test('GET /sitemap.xml serves sitemap index structure', async () => {
    const res = await app.request('/sitemap.xml', {}, mockEnv)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('xml')
    const text = await res.text()
    expect(text).toContain('<sitemapindex')

    const resStatic = await app.request('/sitemap-static.xml', {}, mockEnv)
    expect(resStatic.status).toBe(200)
    const textStatic = await resStatic.text()
    expect(textStatic).toContain('<urlset')
  })

  test('GET /ar/cv-optimizer loads AI cv-optimizer page', async () => {
    const res = await app.request('/ar/cv-optimizer', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('تحسين السيرة الذاتية')
  })

  test('GET /ar/salary-calculator loads salary calculator page', async () => {
    const res = await app.request('/ar/salary-calculator', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('حاسبة ومؤشر الرواتب')
  })

  test('GET /ar/resume-builder loads resume builder page', async () => {
    const res = await app.request('/ar/resume-builder', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('منشئ السيرة الذاتية')
  })

  test('GET /ar/workplace-quiz loads workplace quiz page', async () => {
    const res = await app.request('/ar/workplace-quiz', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('اختبار لغة العمل التركية')
  })

  test('GET /ar/work-permit-eligibility loads work permit eligibility page', async () => {
    const res = await app.request('/ar/work-permit-eligibility', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('إذن العمل في تركيا 2026')
  })

  test('GET /ar/investor-calculator loads investor calculator page', async () => {
    const res = await app.request('/ar/investor-calculator', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('تأسيس الشركات وتوظيف الأجانب')
  })

  test('GET /ar/salary-calculator-2026 loads salary calculator 2026 page', async () => {
    const res = await app.request('/ar/salary-calculator-2026', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('حاسبة صافي الأجور')
  })

  test('GET /ar/blog/jobs-in-istanbul-vacancies-weekly-update-july-2026 loads weekly update blog', async () => {
    const res = await app.request('/ar/blog/jobs-in-istanbul-vacancies-weekly-update-july-2026', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('وظائف شاغرة في اسطنبول هذا الأسبوع')
  })

  test('GET /ar/blog/job-opportunities-istanbul-monthly-guide-2026 loads monthly guide blog', async () => {
    const res = await app.request('/ar/blog/job-opportunities-istanbul-monthly-guide-2026', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('فرص عمل في اسطنبول')
  })

  test('GET /en/blog/turkey-minimum-wage-employer-cost-2026 loads with canonical, hreflang, and FAQPage schema', async () => {
    const res = await app.request('/en/blog/turkey-minimum-wage-employer-cost-2026', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('Turkey Minimum Wage')
    expect(text).toContain('28,075.50')
    expect(text).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/en/blog/turkey-minimum-wage-employer-cost-2026">')
    expect(text).toContain('hreflang="ar"')
    expect(text).toContain('hreflang="tr"')
    expect(text).toContain('"@type":"FAQPage"')
  })

  test('GET /ar/currency-prices loads currency prices page', async () => {
    const res = await app.request('/ar/currency-prices', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('أسعار العملات في تركيا اليوم')
  })

  test('GET /sitemap-static.xml includes new 2026 tools', async () => {
    const res = await app.request('/sitemap-static.xml', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('/ar/salary-calculator-2026')
    expect(text).toContain('/ar/investor-calculator')
    expect(text).toContain('/ar/work-permit-eligibility')
  })

  test('GET /currency-prices redirects based on accept-language', async () => {
    const res = await app.request('/currency-prices', {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' }
    }, mockEnv)
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('/en/currency-prices')
  })

  test('GET /ar/gold-prices loads gold prices page', async () => {
    const res = await app.request('/ar/gold-prices', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('أسعار الذهب في تركيا اليوم')
  })

  test('GET /gold-prices redirects based on accept-language', async () => {
    const res = await app.request('/gold-prices', {
      headers: { 'Accept-Language': 'tr-TR,tr;q=0.9' }
    }, mockEnv)
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('/tr/gold-prices')
  })

  test('GET /ar/employer/login loads employer login page', async () => {
    const res = await app.request('/ar/employer/login', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('بوابة أصحاب العمل')
  })

  test('POST /api/jobs/apply submits application successfully with R2 uploads and quiz scoring', async () => {
    const formData = new FormData();
    formData.append('jobId', 'job-123');
    formData.append('candidateName', 'John Doe');
    formData.append('candidateEmail', 'john@example.com');
    formData.append('coverLetter', 'This is my cover letter.');
    formData.append('resumeFile', new File(['pdf contents'], 'resume.pdf', { type: 'application/pdf' }));
    formData.append('quiz_q_0', 'Yes'); // custom quiz question answer
    formData.append('videoFile', new File(['video contents'], 'pitch.mp4', { type: 'video/mp4' }));

    const res = await app.request('/api/jobs/apply', {
      method: 'POST',
      body: formData
    }, mockEnv)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  test('POST /submit-job-api from employer portal with local-authorized bypass', async () => {
    const payload = {
      title: 'Software Engineer',
      title_en: 'Software Engineer',
      title_ar: 'مهندس برمجيات',
      company: 'Test Company',
      jobType: 'full-time',
      location: 'Sisli',
      location_en: 'Sisli',
      location_ar: 'شيشلي',
      applyEmail: 'employer@example.com',
      description: 'Job description text that is long enough.',
      description_en: 'Job description text that is long enough.',
      description_ar: 'وصف وظيفة طويل بما فيه الكفاية.',
      category: 'cat-it',
      language: 'both',
      transitLine: 'none',
      screeningQuestionsJson: '',
      'cf-turnstile-response': 'local-authorized'
    };

    const jwtSecret = 'change-me-in-production-secure-key';
    const cookieToken = await sign({
      email: 'employer@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600
    }, jwtSecret, 'HS256');

    const envWithTurnstile = {
      ...mockEnv,
      TURNSTILE_SECRET_KEY: 'some-secret-key',
      JWT_SECRET: jwtSecret
    };

    const res = await app.request('/submit-job-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `employer_jwt=${cookieToken}`
      },
      body: JSON.stringify(payload)
    }, envWithTurnstile);

    const json = await res.json();
    console.log('SUBMIT JOB RESPONSE:', json);
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  }, 15000)

  test('GET /ar/jobs/software-engineer renders JobPosting schema and localized detail content', async () => {
    const res = await app.request('/ar/jobs/software-engineer', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()

    // 1. Verify general content is localized in Arabic
    expect(text).toContain('مهندس برمجيات')
    expect(text).toContain('شغل في تركيا للعرب') // from seo-helper meta keywords default

    // 2. Verify JobPosting schema is present and matches Arabic localized details
    expect(text).toContain('"@type":"JobPosting"')
    expect(text).toContain('"title":"مهندس برمجيات"')
    expect(text).toContain('"description":"<p>وصف الوظيفة بالعربية</p><p>تفاصيل إضافية.</p>"')
    
    // 3. Verify company logo and website are correctly included
    expect(text).toContain('"logo":"https://jobs-in-istanbul.com/uploads/logo.png"')
    expect(text).toContain('"sameAs":"https://istanbultech.com"')

    // 4. Verify remote job properties are set
    expect(text).toContain('"jobLocationType":"TELECOMMUTE"')
    expect(text).toContain('"applicantLocationRequirements":{"@type":"Area","name":"Turkey"}')

    // 5. Verify baseSalary parsing
    expect(text).toContain('"baseSalary":{"@type":"MonetaryAmount","currency":"TRY","value":{"@type":"QuantitativeValue","minValue":20000,"maxValue":30000,"unitText":"MONTH"}}')

    // 6. Verify phone number and WhatsApp contact link rendering
    expect(text).toContain('href="tel:+90 555 123 4567"')
    expect(text).toContain('href="https://wa.me/905551234567"')
  })

  test('GET /en/jobs/software-engineer renders JobPosting schema with English localization', async () => {
    const res = await app.request('/en/jobs/software-engineer', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()

    // 1. Verify general content is localized in English
    expect(text).toContain('Software Engineer')
    expect(text).not.toContain('وصف الوظيفة بالعربية') // English page must not have Arabic description in schema/meta

    // 2. Verify JobPosting schema matches English localized details
    expect(text).toContain('"title":"Software Engineer"')
    expect(text).toContain('"description":"<p>Job description in English</p><p>Additional details.</p>"')
  })

  describe('Career Blog SEO Smoke Tests', () => {
    test('GET /ar/blog loads successfully with SEO metadata', async () => {
      const res = await app.request('/ar/blog', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()

      expect(text).toContain('مدونة المهنة - إسطنبول')
      expect(text).toContain('<title>مدونة المهنة - إسطنبول | نصائح التوظيف وإقامة العمل في تركيا</title>')
      expect(text).toContain('name="description" content="دليلك المهني الشامل ونواصح التوظيف في إسطنبول')
      expect(text).toContain('href="https://jobs-in-istanbul.com/ar/blog"')
      expect(text).toContain('hreflang="en" href="https://jobs-in-istanbul.com/en/blog"')
      expect(text).toContain('"@type":"BreadcrumbList"')
    })

    test('GET /en/blog loads successfully with English SEO metadata', async () => {
      const res = await app.request('/en/blog', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()

      expect(text).toContain('Career Blog - Istanbul')
      expect(text).toContain('<title>Career Blog - Istanbul | Work Permits & Commuting Tips</title>')
      expect(text).toContain('name="description" content="Your ultimate guide to working in Istanbul')
    })

    test('GET /ar/blog/turkey-work-permit-residency-laws renders BlogPosting schema and canonical links', async () => {
      const res = await app.request('/ar/blog/turkey-work-permit-residency-laws', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()

      // Content verification
      expect(text).toContain('قوانين إقامة العمل في تركيا للأجانب والبريطانيين')
      
      // SEO tags verification
      expect(text).toContain('<title>قوانين إقامة العمل في تركيا للأجانب والبريطانيين ٢٠٢٦ | مدونة المهنة إسطنبول</title>')
      expect(text).toContain('href="https://jobs-in-istanbul.com/ar/blog/turkey-work-permit-residency-laws"')
      expect(text).toContain('hreflang="en" href="https://jobs-in-istanbul.com/en/blog/turkey-work-permit-residency-laws"')
      expect(text).toContain('hreflang="x-default" href="https://jobs-in-istanbul.com/en/blog/turkey-work-permit-residency-laws"')

      // Structured data verification
      expect(text).toContain('"@type":"BlogPosting"')
      expect(text).toContain('"headline":"قوانين إقامة العمل في تركيا للأجانب والبريطانيين ٢٠٢٦"')
      expect(text).toContain('"@type":"BreadcrumbList"')
      expect(text).toContain('"position":2,"name":"المدونة"')
    })

    test('GET /ar/blog/it-jobs-istanbul-foreigners-guide renders BlogPosting schema and content successfully', async () => {
      const res = await app.request('/ar/blog/it-jobs-istanbul-foreigners-guide', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()

      // Content verification
      expect(text).toContain('وظائف تكنولوجيا المعلومات والبرمجة في إسطنبول')
      expect(text).toContain('Trendyol')
      expect(text).toContain('Insider')
      expect(text).toContain('تصريح العمل للمبرمجين في تركيا')

      // SEO tags verification
      expect(text).toContain('<title>وظائف تكنولوجيا المعلومات والبرمجة في إسطنبول: الشركات التي توظف أجانب والمؤهلات المطلوبة | مدونة المهنة إسطنبول</title>')
      expect(text).toContain('href="https://jobs-in-istanbul.com/ar/blog/it-jobs-istanbul-foreigners-guide"')

      // Structured data verification
      expect(text).toContain('"@type":"BlogPosting"')
      expect(text).toContain('"headline":"وظائف تكنولوجيا المعلومات والبرمجة في إسطنبول: الشركات التي توظف أجانب والمؤهلات المطلوبة"')
    })

    test('GET /ar/blog/best-residential-areas-istanbul-near-business-centers renders BlogPosting schema and content successfully', async () => {
      const res = await app.request('/ar/blog/best-residential-areas-istanbul-near-business-centers', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()

      // Content verification
      expect(text).toContain('أفضل مناطق السكن في إسطنبول')
      expect(text).toContain('مسلك')
      expect(text).toContain('ليفنت')
      expect(text).toContain('شيشلي')
      expect(text).toContain('التأمين الصحي للأجانب في تركيا')

      // SEO tags verification
      expect(text).toContain('<title>أفضل مناطق السكن في إسطنبول القريبة من مراكز الأعمال: دليل السكن والرعاية الصحية للمغتربين | مدونة المهنة إسطنبول</title>')
      expect(text).toContain('href="https://jobs-in-istanbul.com/ar/blog/best-residential-areas-istanbul-near-business-centers"')

      // Structured data verification
      expect(text).toContain('"@type":"BlogPosting"')
      expect(text).toContain('"headline":"أفضل مناطق السكن في إسطنبول القريبة من مراكز الأعمال: دليل السكن والرعاية الصحية للمغتربين"')
    })

    test('GET /ar/blog/how-to-write-cv-for-turkish-companies renders BlogPosting schema and content successfully', async () => {
      const res = await app.request('/ar/blog/how-to-write-cv-for-turkish-companies', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()

      // Content verification
      expect(text).toContain('كيف تكتب سيرة ذاتية')
      expect(text).toContain('Kariyer.net')
      expect(text).toContain('LinkedIn')
      expect(text).toContain('نظام الفرز الآلي للسيرة الذاتية ATS')

      // SEO tags verification
      expect(text).toContain('<title>كيف تكتب سيرة ذاتية (CV) تقبلها الشركات التركية؟ دليل كتابة وتنسيق السيرة الذاتية لعام 2026 | مدونة المهنة إسطنبول</title>')
      expect(text).toContain('href="https://jobs-in-istanbul.com/ar/blog/how-to-write-cv-for-turkish-companies"')

      // Structured data verification
      expect(text).toContain('"@type":"BlogPosting"')
      expect(text).toContain('"headline":"كيف تكتب سيرة ذاتية (CV) تقبلها الشركات التركية؟ دليل كتابة وتنسيق السيرة الذاتية لعام 2026"')
    })

    test('GET /ar/blog/difference-tourist-residency-work-permit-turkey renders BlogPosting schema and content successfully', async () => {
      const res = await app.request('/ar/blog/difference-tourist-residency-work-permit-turkey', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()

      // Content verification
      expect(text).toContain('الفرق بين الإقامة السياحية وإقامة العمل في تركيا')
      expect(text).toContain('تحويل الإقامة السياحية إلى إقامة عمل')
      expect(text).toContain('الحد الأدنى للأجور')

      // SEO tags verification
      expect(text).toContain('<title>الفرق بين الإقامة السياحية وإقامة العمل في تركيا: الميزات، العيوب، وتحويل نوع الإقامة لعام 2026 | مدونة المهنة إسطنبول</title>')
      expect(text).toContain('href="https://jobs-in-istanbul.com/ar/blog/difference-tourist-residency-work-permit-turkey"')

      // Structured data verification
      expect(text).toContain('"@type":"BlogPosting"')
      expect(text).toContain('"headline":"الفرق بين الإقامة السياحية وإقامة العمل في تركيا: الميزات، العيوب، وتحويل نوع الإقامة لعام 2026"')
    })

    test('GET /en/blog/turkey-work-permit-residency-laws renders English blog post metadata', async () => {
      const res = await app.request('/en/blog/turkey-work-permit-residency-laws', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()

      expect(text).toContain('Work Residency & Permit Regulations in Turkey for Foreigners')
      expect(text).toContain('<title>Work Residency & Permit Regulations in Turkey for Foreigners (2026) | Istanbul Career Blog</title>')
      expect(text).toContain('href="https://jobs-in-istanbul.com/en/blog/turkey-work-permit-residency-laws"')
    })

    test('GET /sitemap.xml renders valid sitemapindex and /sitemap-blog.xml contains blog posts', async () => {
      const resIndex = await app.request('/sitemap.xml', {}, mockEnv)
      expect(resIndex.status).toBe(200)
      const textIndex = await resIndex.text()
      expect(textIndex).toContain('<sitemapindex')
      expect(textIndex).toContain('sitemap-blog.xml')
      expect(textIndex).toContain('sitemap-districts.xml')

      const resBlog = await app.request('/sitemap-blog.xml', {}, mockEnv)
      expect(resBlog.status).toBe(200)
      const textBlog = await resBlog.text()
      expect(textBlog).toContain('<loc>https://jobs-in-istanbul.com/ar/blog/turkey-work-permit-residency-laws</loc>')
      expect(textBlog).toContain('<loc>https://jobs-in-istanbul.com/en/blog/turkey-work-permit-residency-laws</loc>')
    })

    test('GET /sitemap-districts.xml and /ar/district/fatih render Programmatic District SEO content', async () => {
      const resDistXml = await app.request('/sitemap-districts.xml', {}, mockEnv)
      expect(resDistXml.status).toBe(200)
      const textDistXml = await resDistXml.text()
      expect(textDistXml).toContain('<loc>https://jobs-in-istanbul.com/ar/district/fatih</loc>')

      const resFatih = await app.request('/ar/district/fatih', {}, mockEnv)
      expect(resFatih.status).toBe(200)
      const textFatih = await resFatih.text()
      expect(textFatih).toContain('فرص عمل ووظائف في الفاتح إسطنبول')
      expect(textFatih).toContain('"@type":"ItemList"')
      expect(textFatih).toContain('"@type":"FAQPage"')
    })

    test('GET /ar/salary-calculator-2026 renders correct canonical tag and title', async () => {
      const res = await app.request('/ar/salary-calculator-2026', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()
      expect(text).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/ar/salary-calculator-2026">')
      expect(text).toContain('حاسبة صافي الأجور وضرائب SGK التفاعلية 2026')
    })

    test('GET /ar/investor-calculator renders correct canonical tag and title', async () => {
      const res = await app.request('/ar/investor-calculator', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()
      expect(text).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/ar/investor-calculator">')
      expect(text).toContain('حاسبة تكاليف تأسيس الشركات وتوظيف الأجانب للمستثمرين 2026')
    })

    test('GET /ar/work-permit-eligibility renders correct canonical tag and title', async () => {
      const res = await app.request('/ar/work-permit-eligibility', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()
      expect(text).toContain('<link rel="canonical" href="https://jobs-in-istanbul.com/ar/work-permit-eligibility">')
      expect(text).toContain('حاسبة واختبار أهلية إذن العمل في تركيا 2026')
    })

    test('GET /ru/privacy renders English Privacy Policy tab active by default', async () => {
      const res = await app.request('/ru/privacy', {}, mockEnv)
      expect(res.status).toBe(200)
      const text = await res.text()
      expect(text).toContain('id="en-tab" class="privacy-content-section" style="display: block;')
    })
  })
})
