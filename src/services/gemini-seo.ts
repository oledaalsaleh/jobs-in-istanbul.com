/**
 * Google Gemini API integration for automated SEO optimization and site auto-fixing
 */

export interface OptimizedSeoData {
  keywords: string[];
  seoDescription: string;
  correctedTitle: string; // Fallback for backward compatibility
  correctedDesc: string; // Fallback for backward compatibility
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
}

export async function optimizeSeoWithGemini(
  apiKey: string,
  pageTitle: string,
  pageDescription: string,
  locale: 'ar' | 'en',
  retries: number = 3,
  delayMs: number = 3500
): Promise<OptimizedSeoData> {
  const prompt = `
You are an expert bilingual recruiter, professional translator, and SEO specialist for the Middle East and Turkish job markets.
Analyze the following webpage job posting title and description, and perform the following tasks:
1. Extract exactly 5 high-ranking, highly searched SEO keywords for Istanbul job search engines.
2. Draft an optimized meta description under 160 characters designed for high click-through rates.
3. Polishing and Translation: Polishing the text for grammar, layout formatting, and spelling errors, and translating it to provide high-quality localized output in BOTH Arabic and English:
   - "title_ar": Corrected and polished title in Arabic. If the input is in English, translate it to Arabic.
   - "title_en": Corrected and polished title in English. If the input is in Arabic, translate it to English.
   - "description_ar": Corrected, clean HTML-formatted description in Arabic (paragraphs separated by <p> tags). If the input is in English, translate it to Arabic.
   - "description_en": Corrected, clean HTML-formatted description in English (paragraphs separated by <p> tags). If the input is in Arabic, translate it to English.
   - "correctedTitle": Polished title in the input language (matching the Locale).
   - "correctedDesc": Polished description in the input language (matching the Locale).

Job Title: "${pageTitle}"
Job Description: "${pageDescription}"
Locale: "${locale}" (represents the language of the job posting)

Return ONLY a valid JSON object matching the following structure. Do not wrap it in markdown code blocks, do not write comments, do not add intros or outros:
{
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "seoDescription": "SEO-friendly meta description...",
  "title_ar": "Arabic title...",
  "title_en": "English title...",
  "description_ar": "<p>Arabic description paragraph 1</p><p>...</p>",
  "description_en": "<p>English description paragraph 1</p><p>...</p>",
  "correctedTitle": "Polished input title",
  "correctedDesc": "Polished input description"
}
`;

  let currentDelay = delayMs;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          console.warn(`[GEMINI SEO] 429 rate limit hit. Retrying in ${currentDelay}ms (Attempt ${attempt}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay *= 2;
          continue;
        }
        throw new Error(`Gemini API returned status ${res.status}`);
      }

      const data: any = await res.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Strip markdown code block markers if returned by Gemini
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        text = text.substring(startIdx, endIdx + 1);
      }

      const parsed = JSON.parse(text);
      return {
        keywords: parsed.keywords || [],
        seoDescription: parsed.seoDescription || '',
        correctedTitle: parsed.correctedTitle || parsed.title_en || pageTitle,
        correctedDesc: parsed.correctedDesc || parsed.description_en || pageDescription,
        title_ar: parsed.title_ar || pageTitle,
        title_en: parsed.title_en || pageTitle,
        description_ar: parsed.description_ar || pageDescription,
        description_en: parsed.description_en || pageDescription
      };
    } catch (err: any) {
      if (attempt === retries) {
        console.error('Gemini SEO optimization error after retries:', err);
      } else {
        console.warn(`[GEMINI SEO] Attempt ${attempt} failed: ${err.message}. Retrying in ${currentDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= 2;
      }
    }
  }

  // Fallback values on API failure
  const fallbackDescHtml = pageDescription.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
  return {
    keywords: locale === 'ar' 
      ? ['فرص عمل في اسطنبول', 'وظائف تركيا', 'شغل في تركيا', 'توظيف إسطنبول', 'عمل للعرب في تركيا']
      : ['jobs in istanbul', 'istanbul vacancies', 'work in turkey', 'employment istanbul', 'turkey job listings'],
    seoDescription: pageDescription.substring(0, 150).replace(/<[^>]*>/g, '').trim(),
    correctedTitle: pageTitle,
    correctedDesc: pageDescription,
    title_ar: pageTitle,
    title_en: pageTitle,
    description_ar: fallbackDescHtml,
    description_en: fallbackDescHtml
  };
}
