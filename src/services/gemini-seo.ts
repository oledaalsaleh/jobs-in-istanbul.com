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
  title_tr: string;
  title_ru: string;
  title_fa: string;
  title_ur: string;
  description_ar: string;
  description_en: string;
  description_tr: string;
  description_ru: string;
  description_fa: string;
  description_ur: string;
}

export async function optimizeSeoWithGemini(
  apiKey: string,
  pageTitle: string,
  pageDescription: string,
  locale: 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur',
  retries: number = 3,
  delayMs: number = 3500
): Promise<OptimizedSeoData> {
  const prompt = `
You are an expert bilingual recruiter, professional translator, and SEO specialist for the Middle East and Turkish job markets.
Analyze the following webpage job posting title and description, and perform the following tasks:
1. Extract exactly 5 high-ranking, highly searched SEO keywords for Istanbul job search engines.
2. Draft an optimized meta description under 160 characters designed for high click-through rates.
3. Polishing and Translation: Polishing the text for grammar, layout formatting, and spelling errors, and translating it to provide high-quality localized output in Arabic, English, Turkish, Russian, Persian (Farsi), and Urdu:
   - "title_ar": Corrected and polished title in Arabic. If the input is in another language, translate it to Arabic.
   - "title_en": Corrected and polished title in English. If the input is in another language, translate it to English.
   - "title_tr": Corrected and polished title in Turkish. If the input is in another language, translate it to Turkish.
   - "title_ru": Corrected and polished title in Russian. If the input is in another language, translate it to Russian.
   - "title_fa": Corrected and polished title in Persian (Farsi). If the input is in another language, translate it to Persian (Farsi).
   - "title_ur": Corrected and polished title in Urdu. If the input is in another language, translate it to Urdu.
   - "description_ar": Corrected, clean HTML-formatted description in Arabic (paragraphs separated by <p> tags). If the input is in another language, translate it to Arabic.
   - "description_en": Corrected, clean HTML-formatted description in English (paragraphs separated by <p> tags). If the input is in another language, translate it to English.
   - "description_tr": Corrected, clean HTML-formatted description in Turkish (paragraphs separated by <p> tags). If the input is in another language, translate it to Turkish.
   - "description_ru": Corrected, clean HTML-formatted description in Russian (paragraphs separated by <p> tags). If the input is in another language, translate it to Russian.
   - "description_fa": Corrected, clean HTML-formatted description in Persian (Farsi) (paragraphs separated by <p> tags). If the input is in another language, translate it to Persian (Farsi).
   - "description_ur": Corrected, clean HTML-formatted description in Urdu (paragraphs separated by <p> tags). If the input is in another language, translate it to Urdu.
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
  "title_tr": "Turkish title...",
  "title_ru": "Russian title...",
  "title_fa": "Persian title...",
  "title_ur": "Urdu title...",
  "description_ar": "<p>Arabic description paragraph 1</p><p>...</p>",
  "description_en": "<p>English description paragraph 1</p><p>...</p>",
  "description_tr": "<p>Turkish description paragraph 1</p><p>...</p>",
  "description_ru": "<p>Russian description paragraph 1</p><p>...</p>",
  "description_fa": "<p>Persian description paragraph 1</p><p>...</p>",
  "description_ur": "<p>Urdu description paragraph 1</p><p>...</p>",
  "correctedTitle": "Polished input title",
  "correctedDesc": "Polished input description"
}
`;

  const models = ['gemini-2.5-flash', 'gemini-3.5-flash'];
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const modelToUse = models[(attempt - 1) % models.length];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;
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
          }],
          generationConfig: {
            temperature: 0.2,
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        }),
        signal: AbortSignal.timeout(25000)
      });

      if (!res.ok) {
        if ((res.status === 429 || res.status === 503) && attempt < retries) {
          console.warn(`[GEMINI SEO] ${res.status} status from ${modelToUse}. Retrying in ${currentDelay}ms (Attempt ${attempt}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay *= 1.5;
          continue;
        }
        throw new Error(`Gemini API (${modelToUse}) returned status ${res.status}`);
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
        title_tr: parsed.title_tr || pageTitle,
        title_ru: parsed.title_ru || pageTitle,
        title_fa: parsed.title_fa || pageTitle,
        title_ur: parsed.title_ur || pageTitle,
        description_ar: parsed.description_ar || pageDescription,
        description_en: parsed.description_en || pageDescription,
        description_tr: parsed.description_tr || pageDescription,
        description_ru: parsed.description_ru || pageDescription,
        description_fa: parsed.description_fa || pageDescription,
        description_ur: parsed.description_ur || pageDescription
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
      : (locale === 'tr'
        ? ['istanbul iş ilanları', 'istanbul iş fırsatları', 'türkiyede çalışmak', 'istanbulda iş bulmak', 'gurbetçi iş ilanları']
        : (locale === 'fa'
          ? ['کار در استانبول', 'استخدام ترکیه', 'فرصت های شغلی استانبول', 'کار در ترکیه برای ایرانیان', 'بازار کار ترکیه']
          : (locale === 'ur'
            ? ['استنبول میں نوکریاں', 'ترکی میں روزگار', 'استنبول جاب بورڈ', 'نوکریاں ترکی', 'ملازمت ترکی']
            : (locale === 'ru'
              ? ['работа в стамбуле', 'вакансии в турции', 'поиск работы в стамбуле', 'работа для русских', 'разрешение на работу в турции']
              : ['jobs in istanbul', 'istanbul vacancies', 'work in turkey', 'employment istanbul', 'turkey job listings'])))),
    seoDescription: pageDescription.substring(0, 150).replace(/<[^>]*>/g, '').trim(),
    correctedTitle: pageTitle,
    correctedDesc: pageDescription,
    title_ar: pageTitle,
    title_en: pageTitle,
    title_tr: pageTitle,
    title_ru: pageTitle,
    title_fa: pageTitle,
    title_ur: pageTitle,
    description_ar: fallbackDescHtml,
    description_en: fallbackDescHtml,
    description_tr: fallbackDescHtml,
    description_ru: fallbackDescHtml,
    description_fa: fallbackDescHtml,
    description_ur: fallbackDescHtml
  };
}
