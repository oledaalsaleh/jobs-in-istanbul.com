import { expect, test, describe } from 'vitest'
import app from '../src/index'

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
          first: async () => null,
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
})
