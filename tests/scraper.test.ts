import { expect, test, describe } from 'vitest';
import { cleanHtml, extractJobUrls, isJobAlreadyScraped, getOrCreateCompany, saveJobToDb } from '../src/services/scraper';

describe('Scraper Service Utilities', () => {
  
  test('cleanHtml strips scripts, styles, forms, and HTML tags', () => {
    const rawHtml = `
      <html>
        <head>
          <style>body { color: red; }</style>
          <script>console.log("hello");</script>
        </head>
        <body>
          <nav><a href="/">Home</a></nav>
          <main>
            <h1>مطلوب موظف مبيعات</h1>
            <p>We are looking for a sales agent in Istanbul.</p>
          </main>
          <form><input type="text" /></form>
          <footer>Footer info</footer>
        </body>
      </html>
    `;
    const cleaned = cleanHtml(rawHtml);
    expect(cleaned).toContain('مطلوب موظف مبيعات');
    expect(cleaned).toContain('We are looking for a sales agent in Istanbul.');
    expect(cleaned).not.toContain('color: red');
    expect(cleaned).not.toContain('console.log');
    expect(cleaned).not.toContain('Home');
    expect(cleaned).not.toContain('Footer info');
  });

  test('extractJobUrls extracts valid job links and ignores duplicates and main paths', () => {
    const rawHtml = `
      <div>
        <a href="https://jobsintr.net/jobs/software-developer-intern">Job 1</a>
        <a href="/jobs/sales-consultant">Job 2</a>
        <a href="https://jobsintr.net/jobs/">All Jobs</a>
        <a href="https://jobsintr.net/jobs/software-developer-intern">Duplicate Job 1</a>
        <a href="https://jobsintr.net/wp-json/wp/v2/posts">API Link</a>
      </div>
    `;
    const urls = extractJobUrls(rawHtml);
    expect(urls).toContain('https://jobsintr.net/jobs/software-developer-intern');
    expect(urls).toContain('https://jobsintr.net/jobs/sales-consultant');
    expect(urls).not.toContain('https://jobsintr.net/jobs');
    expect(urls).not.toContain('https://jobsintr.net/wp-json/wp/v2/posts');
    expect(urls.length).toBe(2);
  });

  test('isJobAlreadyScraped returns correct boolean based on DB query', async () => {
    let queriedUrl = '';
    const mockDb = {
      prepare: (sql: string) => ({
        bind: (url: string) => {
          queriedUrl = url;
          return {
            first: async () => {
              if (url === 'https://jobsintr.net/jobs/exist') {
                return { id: 'job-1' };
              }
              return null;
            }
          };
        }
      })
    } as any;

    const exists = await isJobAlreadyScraped(mockDb, 'https://jobsintr.net/jobs/exist');
    const notExists = await isJobAlreadyScraped(mockDb, 'https://jobsintr.net/jobs/not-exist');

    expect(exists).toBe(true);
    expect(notExists).toBe(false);
    expect(queriedUrl).toBe('https://jobsintr.net/jobs/not-exist');
  });

  test('getOrCreateCompany returns existing ID or creates new one', async () => {
    let inserted = false;
    const mockDb = {
      prepare: (sql: string) => {
        if (sql.includes('SELECT')) {
          return {
            bind: (slug: string) => ({
              first: async () => {
                if (slug === 'existing-tech') {
                  return { id: 'comp-existing' };
                }
                return null;
              }
            })
          };
        }
        if (sql.includes('INSERT')) {
          return {
            bind: (...args: any[]) => ({
              run: async () => {
                inserted = true;
                return {};
              }
            })
          };
        }
        return {} as any;
      }
    } as any;

    const existingId = await getOrCreateCompany(mockDb, 'Existing Tech');
    expect(existingId).toBe('comp-existing');
    expect(inserted).toBe(false);

    const newId = await getOrCreateCompany(mockDb, 'New Startup');
    expect(newId).toContain('comp-scraped-');
    expect(inserted).toBe(true);
  });

  test('saveJobToDb inserts job document and references', async () => {
    const insertCalls: string[] = [];
    const mockDb = {
      prepare: (sql: string) => {
        if (sql.includes('SELECT')) {
          return {
            bind: (slug: string) => ({
              first: async () => ({ id: 'comp-123' })
            })
          };
        }
        return {
          bind: (...args: any[]) => ({
            run: async () => {
              insertCalls.push(sql);
              return {};
            }
          })
        };
      }
    } as any;

    const dummyJob = {
      title_ar: 'مبرمج',
      title_en: 'Programmer',
      description_ar: 'تفاصيل',
      description_en: 'Details',
      company_name: 'Existing Tech',
      category_slug: 'it-software',
      location_ar: 'الفاتح',
      location_en: 'Fatih',
      jobType: 'full-time' as const,
      salary: '20,000 TL',
      applyLink: 'https://jobsintr.net/jobs/programmer',
      applyEmail: 'hr@example.com',
      language: 'both' as const
    };

    const jobId = await saveJobToDb(mockDb, dummyJob, 'https://jobsintr.net/jobs/programmer');
    expect(jobId).toContain('job-scraped-');
    // Expect 3 SQL operations: 1 insert into documents (job), 2 inserts into document_references (company & category)
    expect(insertCalls.length).toBe(3);
    expect(insertCalls[0]).toContain('INSERT INTO documents');
    expect(insertCalls[1]).toContain('INSERT INTO document_references');
    expect(insertCalls[2]).toContain('INSERT INTO document_references');
  });

});
