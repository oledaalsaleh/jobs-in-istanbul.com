import { expect, test, describe } from 'vitest'
import { app } from '../src/index'

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

  test('GET /robots.txt serves indexing instructions', async () => {
    const res = await app.request('/robots.txt', {}, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('User-agent:')
    expect(text).toContain('Sitemap:')
  })

  test('GET /sitemap.xml serves sitemap structure', async () => {
    const res = await app.request('/sitemap.xml', {}, mockEnv)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('xml')
    const text = await res.text()
    expect(text).toContain('<urlset')
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
})
