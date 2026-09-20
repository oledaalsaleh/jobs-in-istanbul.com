import type { D1Database } from '@cloudflare/workers-types';
import { optimizeSeoWithGemini } from './gemini-seo';
import { sendTelegramAlert } from './telegram';
import { autoIndexAndNotifyJob } from './auto-indexing';

export interface ScrapedJobData {
  title_ar: string;
  title_en: string;
  title_tr: string;
  description_ar: string;
  description_en: string;
  description_tr: string;
  company_name: string;
  category_slug: string;
  location_ar: string;
  location_en: string;
  location_tr: string;
  jobType: 'full-time' | 'part-time' | 'remote' | 'internship';
  salary: string;
  applyLink: string;
  applyEmail: string;
  phone?: string;
  language: 'ar' | 'en' | 'both';
}

/**
 * Clean HTML helper to extract text content for AI processing
 */
export function cleanHtml(html: string): string {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '');

  // Strip all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Normalize whitespaces
  text = text.replace(/\s+/g, ' ').trim();

  // Return first 6000 characters to keep it well within context window and save tokens
  return text.substring(0, 6000);
}

/**
 * Extract Job URLs matching /jobs/ or /job/ from HTML content
 */
export function extractJobUrls(html: string): string[] {
  const urls: string[] = [];
  // Regex to match jobsintr.net job posting URL structures
  const regex = /href=["'](https:\/\/jobsintr\.net\/jobs\/[a-zA-Z0-9_-]+(?:\/)?|https:\/\/jobsintr\.net\/job\/[a-zA-Z0-9_-]+(?:\/)?|\/jobs\/[a-zA-Z0-9_-]+(?:\/)?|\/job\/[a-zA-Z0-9_-]+(?:\/)?)/g;

  let match;
  while ((match = regex.exec(html)) !== null) {
    let matchedUrl = match[1];

    // Resolve relative URLs
    if (matchedUrl.startsWith('/')) {
      matchedUrl = `https://jobsintr.net${matchedUrl}`;
    }

    // Normalize trailing slash
    if (matchedUrl.endsWith('/')) {
      matchedUrl = matchedUrl.slice(0, -1);
    }

    // Skip listing pages
    if (
      matchedUrl === 'https://jobsintr.net/jobs' ||
      matchedUrl === 'https://jobsintr.net/job' ||
      matchedUrl.includes('wp-json')
    ) {
      continue;
    }

    urls.push(matchedUrl);
  }

  // Deduplicate URLs
  return [...new Set(urls)];
}

/**
 * Fetch list of job URLs from sitemaps and lists
 */
export async function getJobsList(): Promise<string[]> {
  const sources = [
    'https://jobsintr.net/',
    'https://jobsintr.net/jobs/',
    'https://jobsintr.net/wp-sitemap-posts-post-1.xml'
  ];

  // Dynamically add the text sitemaps for the current month and the previous month
  const date = new Date();
  date.setDate(1); // Avoid month transition bugs (e.g. 31st of month)
  for (let i = 0; i < 2; i++) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    sources.push(`https://jobsintr.net/jobs-${year}-${month}.txt`);
    date.setMonth(date.getMonth() - 1);
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3'
  };

  const allUrls: string[] = [];
  const tasks: Promise<void>[] = [];

  // 1. Crawl jobsintr.net sources in parallel
  for (const source of sources) {
    tasks.push((async () => {
      try {
        const response = await fetch(source, { headers, signal: AbortSignal.timeout(6000) });
        if (!response.ok) return;
        const content = await response.text();

        if (source.endsWith('.txt')) {
          const urls = content
            .split(/\s+/)
            .map(u => u.trim())
            .filter(u => u.startsWith('http://') || u.startsWith('https://'));
          allUrls.push(...urls);
        } else {
          const urls = extractJobUrls(content);
          allUrls.push(...urls);
        }
      } catch (e) {
        // Skip failed source
      }
    })());
  }

  // 2. Crawl findjoobs.com
  tasks.push((async () => {
    try {
      const source = 'https://findjoobs.com/job-locations/istanbul/';
      const response = await fetch(source, { headers, signal: AbortSignal.timeout(6000) });
      if (response.ok) {
        const html = await response.text();
        const regex = /href=["'](https:\/\/findjoobs\.com\/jobs\/[a-zA-Z0-9_-]+\/?)/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
          let matchedUrl = match[1];
          if (matchedUrl.endsWith('/')) {
            matchedUrl = matchedUrl.slice(0, -1);
          }
          allUrls.push(matchedUrl);
        }
      }
    } catch (e) {}
  })());

  // 3. Crawl adwhit.com
  tasks.push((async () => {
    try {
      const source = 'https://www.adwhit.com/ar/jobs';
      const response = await fetch(source, { headers, signal: AbortSignal.timeout(6000) });
      if (response.ok) {
        const html = await response.text();
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextDataMatch) {
          const nextData = JSON.parse(nextDataMatch[1]);
          const jobs = nextData?.props?.pageProps?.data?.jobs || [];
          for (const job of jobs) {
            if (job.url) {
              allUrls.push(`https://www.adwhit.com/ar/jobs/${job.url}`);
            }
          }
        }
      }
    } catch (e) {}
  })());

  // 4. Crawl salamjobs.com (recent postings from first 2 pages)
  const salamSources = [
    'https://salamjobs.com/search?country_id=1&city_id=4&page=1',
    'https://salamjobs.com/search?country_id=1&city_id=4&page=2'
  ];
  for (const source of salamSources) {
    tasks.push((async () => {
      try {
        const response = await fetch(source, { headers, signal: AbortSignal.timeout(6000) });
        if (response.ok) {
          const html = await response.text();
          const articleRegex = /<article class="sj-card[^"]*">([\s\S]*?)<\/article>/gi;
          let match;
          while ((match = articleRegex.exec(html)) !== null) {
            const content = match[1];
            const linkRegex = /href="(https:\/\/salamjobs\.com\/jobs\/[^"]+)"/i;
            const linkMatch = content.match(linkRegex);
            if (linkMatch) {
              allUrls.push(linkMatch[1].trim());
            }
          }
        }
      } catch (e) {}
    })());
  }

  await Promise.allSettled(tasks);

  return [...new Set(allUrls)];
}

/**
 * Clean literal control characters (like newlines and tabs) inside JSON string values
 */
export function cleanJsonString(str: string): string {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (inString) {
      if (escaped) {
        result += char;
        escaped = false;
      } else if (char === '\\') {
        result += char;
        escaped = true;
      } else if (char === '"') {
        result += char;
        inString = false;
      } else if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        // Skip carriage return
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result += char;
    }
  }
  return result;
}

/**
 * Calls Cloudflare Workers AI to parse raw job details into structured JSON
 */
export async function analyzeJobWithAI(ai: any, rawText: string): Promise<ScrapedJobData> {
  const aiPrompt = `
You are an expert recruiter and data classifier for job postings in Istanbul.
Analyze the provided job advertisement text and extract key details into a clean JSON structure in Arabic, English, and Turkish.
Return ONLY a valid JSON object. Do not wrap it in markdown code blocks, do not write comments, do not add intros or outros.

CRITICAL JSON RULES:
1. Do NOT use literal newlines inside JSON string values. Escape them as \\n if needed, or keep everything in one line.
2. Do NOT use double quotes inside string fields (like description or title). If you need quotes inside the values, use single quotes (e.g. 'quote' instead of \"quote\").
3. Make sure all commas and curly braces are perfectly balanced.

JSON structure:
{
  "title_ar": "اسم الوظيفة بالعربية (مختصر وجذاب)",
  "title_en": "Job title in English (short and attractive)",
  "title_tr": "Job title in Turkish (short and attractive)",
  "description_ar": "تفاصيل ومسؤوليات وشروط الوظيفة بالتفصيل واللغة العربية (استخدم علامات اقتباس مفردة '' بدلا من علامات اقتباس مزدوجة \"\")",
  "description_en": "Detailed description, responsibilities, and requirements in English (use single quotes '' instead of double quotes \"\")",
  "description_tr": "Detailed description, responsibilities, and requirements in Turkish (use single quotes '' instead of double quotes \"\")",
  "company_name": "Name of the hiring company (e.g. Acme Corp)",
  "category_slug": "Map to one of these EXACT categories based on content: 'it-software', 'tourism-hospitality', 'real-estate-sales', 'education-teaching', 'customer-service-translation', 'marketing-advertising', 'accounting-finance', 'healthcare-medical', 'engineering-construction', 'design-creative-arts', 'admin-human-resources', 'logistics-transportation', 'beauty-salon', 'general-others'",
  "location_ar": "المنطقة أو الحي في إسطنبول باللغة العربية (مثل: الفاتح, شيشلي, اسنيورت, باشاك شهير)",
  "location_en": "District/neighborhood in Istanbul in English (e.g. Fatih, Sisli, Esenyurt, Basaksehir)",
  "location_tr": "District/neighborhood in Istanbul in Turkish (e.g. Fatih, Şişli, Esenyurt, Başakşehir)",
  "jobType": "Map to one of: 'full-time', 'part-time', 'remote', 'internship'",
  "salary": "Salary range if specified (e.g. 20,000 - 30,000 TL), otherwise leave empty string",
  "applyLink": "URL link to apply, or empty string",
  "applyEmail": "Email address to apply, or empty string",
  "phone": "Phone number or WhatsApp contact if specified in the text (e.g. +90 555 123 4567), otherwise empty string",
  "language": "Required language: 'ar' (only Arabic), 'en' (only English), or 'both' (bilingual/both)"
}
`;

  const aiResponse: any = await ai.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
    messages: [
      { role: 'system', content: aiPrompt },
      { role: 'user', content: rawText }
    ],
    max_tokens: 1800
  });

  console.log(`[AI RESPONSE DEBUG] Raw aiResponse structure:`, JSON.stringify(aiResponse));

  let responseText = '';
  if (typeof aiResponse === 'string') {
    responseText = aiResponse;
  } else if (aiResponse && typeof aiResponse === 'object') {
    if (typeof aiResponse.response === 'string') {
      responseText = aiResponse.response;
    } else if (typeof aiResponse.result === 'string') {
      responseText = aiResponse.result;
    } else if (aiResponse.result && typeof aiResponse.result === 'object' && typeof aiResponse.result.text === 'string') {
      responseText = aiResponse.result.text;
    } else if (aiResponse.response && typeof aiResponse.response === 'object' && typeof aiResponse.response.text === 'string') {
      responseText = aiResponse.response.text;
    } else {
      responseText = JSON.stringify(aiResponse);
    }
  }

  if (!responseText) {
    throw new Error('AI returned an empty response.');
  }

  // Strip markdown code block markers
  responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

  // Try to find the first '{' and last '}' if AI returned extra text
  const startIdx = responseText.indexOf('{');
  const endIdx = responseText.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1) {
    responseText = responseText.substring(startIdx, endIdx + 1);
  }

  const cleanedResponseText = cleanJsonString(responseText);

  try {
    return JSON.parse(cleanedResponseText) as ScrapedJobData;
  } catch (err: any) {
    console.error('[AI PARSE ERROR] Failed to parse response text:', responseText);
    console.error('[AI PARSE ERROR] Cleaned text was:', cleanedResponseText);
    throw new Error(`JSON parse error: ${err.message}`);
  }
}

/**
 * Calls Google Gemini 2.5 Flash / 3.5 Flash to parse raw job details into structured JSON
 */
export async function analyzeJobWithGemini(apiKey: string, rawText: string, retries = 2): Promise<ScrapedJobData> {
  const prompt = `
You are an expert recruiter and data classifier for job postings in Istanbul.
Analyze the provided job advertisement text and extract key details into a clean JSON structure in Arabic, English, and Turkish.
Return ONLY a valid JSON object. Do not wrap it in markdown code blocks, do not write comments, do not add intros or outros.

CRITICAL JSON RULES:
1. Do NOT use literal newlines inside JSON string values. Escape them as \\n if needed, or keep everything in one line.
2. Do NOT use double quotes inside string fields. Use single quotes if needed.
3. Make sure all commas and curly braces are perfectly balanced.

JSON structure:
{
  "title_ar": "اسم الوظيفة بالعربية (مختصر وجذاب)",
  "title_en": "Job title in English (short and attractive)",
  "title_tr": "Job title in Turkish (short and attractive)",
  "description_ar": "تفاصيل ومسؤوليات وشروط الوظيفة بالتفصيل واللغة العربية منسقة بفقرات <p>",
  "description_en": "Detailed description, responsibilities, and requirements in English formatted with <p> tags",
  "description_tr": "Detailed description, responsibilities, and requirements in Turkish formatted with <p> tags",
  "company_name": "Name of the hiring company (e.g. Acme Corp)",
  "category_slug": "Map to one of these EXACT categories based on content: 'it-software', 'tourism-hospitality', 'real-estate-sales', 'education-teaching', 'customer-service-translation', 'marketing-advertising', 'accounting-finance', 'healthcare-medical', 'engineering-construction', 'design-creative-arts', 'admin-human-resources', 'logistics-transportation', 'beauty-salon', 'general-others'",
  "location_ar": "المنطقة أو الحي في إسطنبول باللغة العربية (مثل: الفاتح, شيشلي, اسنيورت, باشاك شهير)",
  "location_en": "District/neighborhood in Istanbul in English (e.g. Fatih, Sisli, Esenyurt, Basaksehir)",
  "location_tr": "District/neighborhood in Istanbul in Turkish (e.g. Fatih, Şişli, Esenyurt, Başakşehir)",
  "jobType": "Map to one of: 'full-time', 'part-time', 'remote', 'internship'",
  "salary": "Salary range if specified (e.g. 20,000 - 30,000 TL), otherwise leave empty string",
  "applyLink": "URL link to apply, or empty string",
  "applyEmail": "Email address to apply, or empty string",
  "phone": "Phone number or WhatsApp contact if specified in the text (e.g. +90 555 123 4567), otherwise empty string",
  "language": "Required language: 'ar' (only Arabic), 'en' (only English), or 'both' (bilingual/both)"
}

Job text:
${rawText}
`;

  const models = ['gemini-2.5-flash', 'gemini-3.5-flash'];
  for (let attempt = 1; attempt <= retries; attempt++) {
    const modelToUse = models[(attempt - 1) % models.length];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(`Gemini API returned status ${res.status} (Unauthorized/Forbidden). Fast-failing to Workers AI.`);
        }
        throw new Error(`Gemini API (${modelToUse}) returned status ${res.status}`);
      }

      const data: any = await res.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        text = text.substring(startIdx, endIdx + 1);
      }

      const cleaned = cleanJsonString(text);
      return JSON.parse(cleaned) as ScrapedJobData;
    } catch (e: any) {
      if (attempt === retries || e.message?.includes('401') || e.message?.includes('403')) {
        console.warn(`[GEMINI AI] Gemini failed (${e.message}). Fast-failing to Workers AI.`);
        throw e;
      }
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw new Error('Gemini parsing failed after retries');
}

/**
 * Unified job analysis: uses Gemini 2.5 Flash if available, otherwise Workers AI
 */
export async function analyzeJobUnified(
  env: { AI?: any; GEMINI_API_KEY?: string },
  rawText: string
): Promise<ScrapedJobData> {
  if (env.GEMINI_API_KEY) {
    try {
      return await analyzeJobWithGemini(env.GEMINI_API_KEY, rawText);
    } catch (geminiErr: any) {
      console.warn(`[SCRAPER] Gemini parsing failed: ${geminiErr.message}. Falling back to Workers AI...`);
    }
  }

  if (env.AI) {
    return await analyzeJobWithAI(env.AI, rawText);
  }

  throw new Error('Neither GEMINI_API_KEY nor Workers AI binding is available.');
}

/**
 * Check if job is already scraped
 */
export async function isJobAlreadyScraped(db: D1Database, sourceUrl: string): Promise<boolean> {
  const result = await db.prepare(
    `SELECT id FROM documents WHERE type_id = 'jobs' AND json_extract(data, '$.sourceUrl') = ?`
  ).bind(sourceUrl).first();
  return !!result;
}

/**
 * Resolves category slug to category document ID
 */
export function resolveCategory(slug: string): string {
  const mapping: Record<string, string> = {
    'it-software': 'cat-it',
    'tourism-hospitality': 'cat-tourism',
    'real-estate-sales': 'cat-realestate',
    'education-teaching': 'cat-education',
    'customer-service-translation': 'cat-customer',
    'marketing-advertising': 'cat-marketing',
    'accounting-finance': 'cat-finance',
    'healthcare-medical': 'cat-healthcare',
    'engineering-construction': 'cat-engineering',
    'design-creative-arts': 'cat-design',
    'admin-human-resources': 'cat-admin',
    'logistics-transportation': 'cat-logistics',
    'beauty-salon': 'cat-salon',
    'general-others': 'cat-general'
  };
  return mapping[slug] || 'cat-general';
}

/**
 * Decodes Cloudflare email protection hex strings
 */
export function decodeCfEmail(encoded: string): string {
  try {
    let email = '';
    const r = parseInt(encoded.substring(0, 2), 16);
    for (let n = 2; n < encoded.length; n += 2) {
      const c = parseInt(encoded.substring(n, 2), 16) ^ r;
      email += String.fromCharCode(c);
    }
    return email;
  } catch (e) {
    return '';
  }
}

/**
 * Replaces Cloudflare-obfuscated email links and content in HTML with plain text
 */
export function decodeCloudflareEmails(html: string): string {
  // 1. Replace data-cfemail="xxx" elements
  const cfEmailRegex = /class="__cf_email__"\s+data-cfemail="([a-f0-9]+)"/gi;
  let decodedHtml = html.replace(cfEmailRegex, (_, hex) => {
    const decoded = decodeCfEmail(hex);
    return `href="mailto:${decoded}">${decoded}</a>`;
  });

  // 2. Replace href="/cdn-cgi/l/email-protection#xxx"
  const cfHrefRegex = /href="\/cdn-cgi\/l\/email-protection#([a-f0-9]+)"/gi;
  decodedHtml = decodedHtml.replace(cfHrefRegex, (_, hex) => {
    const decoded = decodeCfEmail(hex);
    return `href="mailto:${decoded}"`;
  });

  return decodedHtml;
}

/**
 * Resolves or creates a company document, returning its ID
 */
export async function getOrCreateCompany(db: D1Database, companyName: string): Promise<string> {
  const cleanName = (companyName || '').trim() || 'Unspecified Company';
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  let existing: { id: string } | null = null;
  try {
    existing = await db.prepare(
      `SELECT id FROM documents WHERE type_id = 'companies' AND slug = ?`
    ).bind(slug).first<{ id: string }>();
  } catch (d1Err: any) {
    console.warn('[COMPANY] D1 select warning:', d1Err.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  // Create new company document
  const companyId = `comp-scraped-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const nowMs = Date.now();
  const docData = JSON.stringify({
    name: cleanName,
    slug: slug,
    logo: '',
    website: '',
    industry: 'Unspecified',
    description: 'Automatically created company from scraped jobs.'
  });

  try {
    await db.prepare(
      `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, created_at, updated_at)
       VALUES (?, ?, 'companies', 'published', 1, 1, ?, ?, ?, ?, ?)`
    ).bind(companyId, companyId, slug, cleanName, docData, nowMs, nowMs).run();
  } catch (d1Err: any) {
    console.warn('[COMPANY] D1 insert warning:', d1Err.message);
  }

  return companyId;
}

/**
 * Automatically fetches a category-specific WebP stock image and uploads it to R2
 */
export async function assignJobImage(bucket: any, jobId: string, categorySlug: string): Promise<string> {
  const imagesMap: Record<string, string[]> = {
    'it-software': [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=85&fm=webp'
    ],
    'tourism-hospitality': [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=85&fm=webp'
    ],
    'real-estate-sales': [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=85&fm=webp'
    ],
    'education-teaching': [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=85&fm=webp'
    ],
    'customer-service-translation': [
      'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1521791136368-1a46827d0412?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=85&fm=webp'
    ],
    'general': [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=85&fm=webp',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=85&fm=webp'
    ]
  };

  const urls = imagesMap[categorySlug] || imagesMap['general'];
  const selectedUrl = urls[Math.floor(Math.random() * urls.length)];

  try {
    console.log(`[IMAGE FETCH] Fetching stock image from: ${selectedUrl}`);
    const res = await fetch(selectedUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status}`);
    }
    const buffer = await res.arrayBuffer();
    const r2Key = `jobs/${jobId}/cover.webp`;

    await bucket.put(r2Key, buffer, {
      httpMetadata: {
        contentType: 'image/webp'
      }
    });

    return r2Key;
  } catch (err) {
    console.error(`assignJobImage error for ${categorySlug}:`, err);
    return selectedUrl;
  }
}

/**
 * Save job to D1 database
 */
export async function saveJobToDb(
  db: D1Database,
  bucketOrJobData: any,
  jobDataOrSourceUrl: any,
  sourceUrlOrUndefined?: string
): Promise<{ jobId: string; slug: string }> {
  let bucket: any = null;
  let geminiApiKey: string = '';
  let jobData: ScrapedJobData;
  let sourceUrl: string;

  if (sourceUrlOrUndefined !== undefined) {
    if (bucketOrJobData && typeof bucketOrJobData === 'object' && 'bucket' in bucketOrJobData) {
      bucket = bucketOrJobData.bucket;
      geminiApiKey = bucketOrJobData.geminiApiKey || '';
    } else {
      bucket = bucketOrJobData;
    }
    jobData = jobDataOrSourceUrl as ScrapedJobData;
    sourceUrl = sourceUrlOrUndefined;
  } else {
    jobData = bucketOrJobData as ScrapedJobData;
    sourceUrl = jobDataOrSourceUrl as string;
  }

  const rawData = jobData as any;
  const title_en = ((rawData.title_en || rawData.titleEn || rawData.title || 'Job Listing') as string).trim();

  console.log(`[SAVE JOB] Starting saveJobToDb for title: "${title_en}"`);

  const companyName = ((rawData.company_name || rawData.companyName || rawData.company || '') as string).trim() || 'Unspecified Company';
  console.log(`[SAVE JOB] Resolving company: "${companyName}"`);
  const companyId = await getOrCreateCompany(db, companyName);
  console.log(`[SAVE JOB] Company resolved to ID: ${companyId}`);

  const categorySlug = ((rawData.category_slug || rawData.categorySlug || rawData.category || 'general') as string).trim();
  const categoryId = resolveCategory(categorySlug);

  const nowMs = Date.now();
  const jobId = `job-scraped-${nowMs}-${Math.random().toString(36).substring(2, 7)}`;

  // Reused title_en from above
  const title_ar = ((rawData.title_ar || rawData.titleAr || title_en || 'وظيفة شاغرة') as string).trim();

  // Create job slug from title_en
  const titleSlug = title_en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = `${titleSlug || 'job'}-${nowMs}`;

  let imageUrl = '';
  if (bucket) {
    console.log(`[SAVE JOB] Bucket exists, assigning job image for category: ${categorySlug}`);
    imageUrl = await assignJobImage(bucket, jobId, categorySlug);
    console.log(`[SAVE JOB] Assigned image URL/key: ${imageUrl}`);
  }

  const description_en = rawData.description_en || rawData.descriptionEn || rawData.description || '';
  const description_ar = rawData.description_ar || rawData.descriptionAr || description_en || '';
  const description_tr = rawData.description_tr || rawData.descriptionTr || description_en || '';

  const location_en = ((rawData.location_en || rawData.locationEn || rawData.location || 'Istanbul') as string).trim();
  const location_ar = ((rawData.location_ar || rawData.locationAr || location_en || 'إسطنبول') as string).trim();
  const location_tr = ((rawData.location_tr || rawData.locationTr || location_en || 'İstanbul') as string).trim();

  const jobType = ((rawData.jobType || rawData.job_type || 'full-time') as string).trim();
  const salary = ((rawData.salary || '') as string).trim();
  const applyLink = ((rawData.applyLink || rawData.apply_link || sourceUrl || '') as string).trim();
  const applyEmail = ((rawData.applyEmail || rawData.apply_email || '') as string).trim();
  const phone = ((rawData.phone || rawData.phone_number || rawData.whatsapp || '') as string).trim();
  const language = ((rawData.language || 'both') as string).trim();

  // Gemini SEO optimization & auto-fixing
  let seoKeywords: string[] = [];
  let seoDescription = '';
  let finalTitleEn = title_en;
  let finalDescEn = description_en;
  let finalTitleTr = rawData.title_tr || rawData.titleTr || title_en;
  let finalDescTr = description_tr;
  let finalTitleRu = title_en;
  let finalDescRu = description_en;
  let finalTitleFa = title_en;
  let finalDescFa = description_en;
  let finalTitleUr = title_en;
  let finalDescUr = description_en;

  if (geminiApiKey) {
    try {
      console.log(`[SAVE JOB] Requesting Gemini SEO optimization (locale: ${language === 'ar' ? 'ar' : 'en'})...`);
      const seoResult = await optimizeSeoWithGemini(
        geminiApiKey,
        title_en,
        description_en,
        language === 'ar' ? 'ar' : 'en'
      );
      console.log('[SAVE JOB] Gemini SEO optimization returned successfully!');
      seoKeywords = seoResult.keywords || [];
      seoDescription = seoResult.seoDescription || '';
      if (seoResult.correctedTitle) {
        finalTitleEn = seoResult.correctedTitle;
      }
      if (seoResult.correctedDesc) {
        finalDescEn = seoResult.correctedDesc;
      }
      if (seoResult.title_tr) {
        finalTitleTr = seoResult.title_tr;
      }
      if (seoResult.description_tr) {
        finalDescTr = seoResult.description_tr;
      }
      if (seoResult.title_ru) {
        finalTitleRu = seoResult.title_ru;
      }
      if (seoResult.description_ru) {
        finalDescRu = seoResult.description_ru;
      }
      if (seoResult.title_fa) {
        finalTitleFa = seoResult.title_fa;
      }
      if (seoResult.description_fa) {
        finalDescFa = seoResult.description_fa;
      }
      if (seoResult.title_ur) {
        finalTitleUr = seoResult.title_ur;
      }
      if (seoResult.description_ur) {
        finalDescUr = seoResult.description_ur;
      }
    } catch (e) {
      console.error('Gemini SEO auto-optimization failed:', e);
    }
  }

  const docData = JSON.stringify({
    title_ar,
    title_en: finalTitleEn,
    title_tr: finalTitleTr,
    title_ru: finalTitleRu,
    title_fa: finalTitleFa,
    title_ur: finalTitleUr,
    slug,
    description_ar,
    description_en: finalDescEn,
    description_tr: finalDescTr,
    description_ru: finalDescRu,
    description_fa: finalDescFa,
    description_ur: finalDescUr,
    company: companyId,
    category: categoryId,
    location_ar,
    location_en,
    location_tr,
    jobType,
    salary,
    phone,
    applyLink,
    applyEmail,
    language,
    featured: false,
    publishedAt: nowMs,
    status: 'published',
    sourceUrl,
    imageUrl,
    seoKeywords,
    seoDescription
  });

  // 1. Insert job document
  console.log('[SAVE JOB] Inserting job document into DB...');
  await db.prepare(
    `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, published_at, created_at, updated_at)
     VALUES (?, ?, 'jobs', 'published', 1, 1, ?, ?, ?, ?, ?, ?)`
  ).bind(jobId, jobId, slug, finalTitleEn, docData, nowMs, nowMs, nowMs).run().catch((d1Err: any) => {
    console.warn('[SAVE JOB] D1 insert warning:', d1Err.message);
  });

  // 2. Insert relations to document_references table
  // Link to company
  console.log('[SAVE JOB] Inserting company reference into DB...');
  await db.prepare(
    `INSERT INTO document_references (id, tenant_id, from_root_id, from_document_id, field_name, ordinal, to_root_id, ref_strength)
     VALUES (?, 'default', ?, ?, 'company', 0, ?, 'weak')`
  ).bind(`ref-${jobId}-company`, jobId, jobId, companyId).run().catch(() => {});

  // Link to category
  console.log('[SAVE JOB] Inserting category reference into DB...');
  await db.prepare(
    `INSERT INTO document_references (id, tenant_id, from_root_id, from_document_id, field_name, ordinal, to_root_id, ref_strength)
     VALUES (?, 'default', ?, ?, 'category', 0, ?, 'weak')`
  ).bind(`ref-${jobId}-category`, jobId, jobId, categoryId).run().catch(() => {});

  console.log('[SAVE JOB] Job saved successfully to DB!');
  return { jobId, slug };
}

/**
 * Scraper coordinator function
 */
export async function runScraper(
  env: {
    DB: D1Database;
    AI: any;
    CACHE_KV?: any;
    MEDIA_BUCKET?: any;
    GEMINI_API_KEY?: string;
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_CHANNEL_ID?: string;
  },
  limit: number = 5
): Promise<{ scraped: number; processed: number; errors: number; details: string[] }> {
  const details: string[] = [];
  let scrapedCount = 0;
  let errorCount = 0;
  let processedCount = 0;

  try {
    details.push('Starting crawl for jobsintr.net links...');
    const urls = await getJobsList();
    details.push(`Found ${urls.length} candidate URLs.`);

    // 1. Fetch all existing job sourceUrls: Check CACHE_KV first to avoid D1 read quota exhaustion
    let scrapedUrls = new Set<string>();
    if (env.CACHE_KV) {
      try {
        const cached = await env.CACHE_KV.get('kv_scraped_urls', 'json');
        if (Array.isArray(cached) && cached.length > 0) {
          scrapedUrls = new Set(cached);
          details.push(`Loaded ${scrapedUrls.size} existing job URLs from CACHE_KV.`);
        }
      } catch (kvErr) {
        console.warn('[SCRAPER] KV read error for scraped URLs:', kvErr);
      }
    }

    if (scrapedUrls.size === 0 && env.DB) {
      try {
        const scrapedRows = await env.DB.prepare(
          `SELECT json_extract(data, '$.sourceUrl') as sourceUrl FROM documents WHERE type_id = 'jobs'`
        ).all();
        scrapedUrls = new Set(
          (scrapedRows.results || [])
            .map((r: any) => r.sourceUrl)
            .filter(Boolean)
        );
        details.push(`Loaded ${scrapedUrls.size} existing job URLs from D1 Database.`);
        if (env.CACHE_KV && scrapedUrls.size > 0) {
          await env.CACHE_KV.put('kv_scraped_urls', JSON.stringify([...scrapedUrls]), { expirationTtl: 86400 }).catch(() => {});
        }
      } catch (d1Err: any) {
        console.warn('[SCRAPER] D1 query warning (possible daily read limit):', d1Err.message);
        details.push(`[WARN] D1 query skipped (${d1Err.message}). Continuing with empty or partial cache.`);
      }
    }

    // 2. Filter out already scraped URLs
    const unscrapedUrls = urls.filter(url => !scrapedUrls.has(url));
    details.push(`Filtered out ${urls.length - unscrapedUrls.length} already scraped URLs. ${unscrapedUrls.length} unscraped URLs remain.`);

    // 3. Keep it limited to avoid rate limits or execution timeout on worker (especially in cron)
    const targetUrls = unscrapedUrls.slice(0, limit);
    details.push(`Processing up to ${targetUrls.length} new URLs in this run...`);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    };

    for (const url of targetUrls) {
      try {
        processedCount++;
        details.push(`[FETCH] Crawling job details from: ${url}`);
        const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }

        const html = await response.text();
        // Decode Cloudflare email protection in HTML
        const decodedHtml = decodeCloudflareEmails(html);

        // Extract phone number from buttons if any
        let phoneFromHtml = '';
        const telRegex = /href="tel:([^"]+)"/i;
        const telMatch = decodedHtml.match(telRegex);
        if (telMatch) {
          phoneFromHtml = decodeURIComponent(telMatch[1]).trim();
        } else {
          const waRegex = /phone=([^&"]+)/i;
          const waMatch = decodedHtml.match(waRegex);
          if (waMatch) {
            let num = decodeURIComponent(waMatch[1]).trim();
            if (!num.startsWith('+') && num.length > 5) {
              if (num.startsWith('90') || num.startsWith('96')) {
                num = '+' + num;
              }
            }
            phoneFromHtml = num;
          }
        }

        const cleanedText = cleanHtml(decodedHtml);

        if (cleanedText.length < 150) {
          throw new Error('Retrieved content is too short or blocked.');
        }

        details.push(`[AI] Analyzing text with AI (${cleanedText.length} chars)...`);
        const jobJson = await analyzeJobUnified(env, cleanedText);

        // Inject phone from HTML buttons if not detected by AI
        if (!jobJson.phone && phoneFromHtml) {
          jobJson.phone = phoneFromHtml;
        }

        details.push(`[SAVE] Saving job: "${jobJson.title_en}" (Company: ${jobJson.company_name})`);
        const { jobId, slug } = await saveJobToDb(
          env.DB,
          { bucket: env.MEDIA_BUCKET, geminiApiKey: env.GEMINI_API_KEY },
          jobJson,
          url
        );

        details.push(`[SUCCESS] Inserted job ID ${jobId} successfully.`);
        scrapedCount++;

        // Keep CACHE_KV updated with newly scraped URL
        scrapedUrls.add(url);
        if (env.CACHE_KV) {
          env.CACHE_KV.put('kv_scraped_urls', JSON.stringify([...scrapedUrls]), { expirationTtl: 86400 }).catch(() => {});
        }

        // Auto-publish to Telegram if configured
        let telegramPublished = false;
        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHANNEL_ID) {
          try {
            console.log(`[TELEGRAM] Publishing scraped job to Telegram channel: ${env.TELEGRAM_CHANNEL_ID}`);
            await sendTelegramAlert(
              env,
              jobJson.title_ar || jobJson.title_en,
              jobJson.company_name,
              jobJson.location_ar || jobJson.location_en,
              slug
            );
            telegramPublished = true;
            details.push(`[TELEGRAM] Successfully published job "${jobJson.title_en}" to Telegram.`);
          } catch (tgErr: any) {
            console.error('[TELEGRAM ERROR] Failed to send Telegram alert for scraped job:', tgErr);
            details.push(`[TELEGRAM ERROR] Failed to publish "${jobJson.title_en}" to Telegram: ${tgErr.message}`);
          }
        }

        // Autonomous Search Engine Indexing (Google Indexing API, IndexNow Bing/Yandex, Sitemap Ping)
        try {
          await autoIndexAndNotifyJob(env, {
            id: jobId,
            title: jobJson.title_ar || jobJson.title_en || 'وظيفة شاغرة جديدة في إسطنبول',
            companyName: jobJson.company_name,
            location: jobJson.location_ar || jobJson.location_en,
            slug
          });
          details.push(`[AUTO-INDEX] Broadcast to Google Indexing API & IndexNow for "${slug}".`);
        } catch (autoIndexErr) {
          console.warn('[AUTO-INDEX ERROR]', autoIndexErr);
        }

        // If published, update metadata in D1
        if (telegramPublished) {
          try {
            const metaJson = JSON.stringify({ telegramPublished: true, telegramPublishedAt: Date.now() });
            await env.DB.prepare(
              `UPDATE documents SET metadata = ? WHERE id = ?`
            ).bind(metaJson, jobId).run();
          } catch (metaErr) {
            console.error('Failed to update job metadata:', metaErr);
          }
        }

        // Wait 3 seconds between jobs to avoid Gemini API rate limit (429)
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (err: any) {
        console.error(`Error processing job URL ${url}:`, err);
        details.push(`[ERROR] Failed processing ${url}: ${err.message}`);
        errorCount++;
      }
    }

  } catch (err: any) {
    console.error('Fatal error in runScraper:', err);
    details.push(`[FATAL] Scraper run crashed: ${err.message}`);
  }

  return {
    scraped: scrapedCount,
    processed: processedCount,
    errors: errorCount,
    details
  };
}
