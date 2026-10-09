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

describe('Google AdMob app-ads.txt Verification Tests for Trabzon App Article', () => {
  const ADMOB_SNIPPET = 'google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0'

  it('GET /app-ads.txt returns exact AdMob verification snippet with text/plain 200 OK', async () => {
    const res = await app.request('/app-ads.txt', undefined, mockEnv)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    const text = await res.text()
    expect(text.trim()).toBe(ADMOB_SNIPPET)
  })

  it('GET /ar/blog/trabzon-travel-guide-app-tourism-turkey-2026/app-ads.txt returns exact AdMob verification snippet', async () => {
    const res = await app.request('/ar/blog/trabzon-travel-guide-app-tourism-turkey-2026/app-ads.txt', undefined, mockEnv)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    const text = await res.text()
    expect(text.trim()).toBe(ADMOB_SNIPPET)
  })

  it('GET /ar/blog/trabzon-travel-guide-app-tourism-turkey-2026 loads HTML containing invisible AdMob verification snippet', async () => {
    const res = await app.request('/ar/blog/trabzon-travel-guide-app-tourism-turkey-2026', undefined, mockEnv)
    expect(res.status).toBe(200)
    const text = await res.text()

    // Ensure hidden container exists with display:none !important
    expect(text).toContain('id="admob-app-ads-verification"')
    expect(text).toContain('display:none !important')
    expect(text).toContain(ADMOB_SNIPPET)

    // Ensure AdMob meta tag & link exist in head/seo
    expect(text).toContain('name="google-admob-ads-txt"')
    expect(text).toContain('rel="app-ads"')
  })

  it('GET /ar/blog/trabzon-travel-guide-app-tourism-turkey-2026 with Accept: text/plain returns AdMob snippet directly', async () => {
    const res = await app.request(
      '/ar/blog/trabzon-travel-guide-app-tourism-turkey-2026',
      { headers: { 'Accept': 'text/plain' } },
      mockEnv
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    const text = await res.text()
    expect(text.trim()).toBe(ADMOB_SNIPPET)
  })

  it('GET /en and /tr blog routes also contain invisible AdMob snippet', async () => {
    const resEn = await app.request('/en/blog/trabzon-travel-guide-app-tourism-turkey-2026', undefined, mockEnv)
    expect(resEn.status).toBe(200)
    const textEn = await resEn.text()
    expect(textEn).toContain('id="admob-app-ads-verification"')
    expect(textEn).toContain(ADMOB_SNIPPET)

    const resTr = await app.request('/tr/blog/trabzon-travel-guide-app-tourism-turkey-2026', undefined, mockEnv)
    expect(resTr.status).toBe(200)
    const textTr = await resTr.text()
    expect(textTr).toContain('id="admob-app-ads-verification"')
    expect(textTr).toContain(ADMOB_SNIPPET)
  })
})
