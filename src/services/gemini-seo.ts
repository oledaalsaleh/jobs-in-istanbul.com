/**
 * Google Gemini API integration for automated SEO optimization and site auto-fixing
 */

export interface OptimizedSeoData {
  keywords: string[];
  seoDescription: string;
  correctedTitle: string;
  correctedDesc: string;
}

export async function optimizeSeoWithGemini(
  apiKey: string,
  pageTitle: string,
  pageDescription: string,
  locale: 'ar' | 'en'
): Promise<OptimizedSeoData> {
  const prompt = `
You are an expert SEO specialist and professional editor for the Middle East and Turkish job markets.
Analyze the following webpage job posting title and description, and optimize them:
1. Extract exactly 5 high-ranking, highly searched SEO keywords for Istanbul job search engines.
2. Draft an optimized meta description under 160 characters designed for high click-through rates.
3. Automatically identify and correct any grammatical, translation, layout formatting, or spelling errors in BOTH the title and description to auto-fix the text content.

Job Title: "${pageTitle}"
Job Description: "${pageDescription}"
Locale: "${locale}"

Return ONLY a valid JSON object matching the following structure. Do not wrap it in markdown code blocks, do not write comments, do not add intros or outros:
{
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "seoDescription": "SEO-friendly meta description...",
  "correctedTitle": "Auto-fixed and polished title",
  "correctedDesc": "Auto-fixed and polished description with formatting errors corrected"
}
`;

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
      })
    });

    if (!res.ok) {
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

    return JSON.parse(text) as OptimizedSeoData;
  } catch (err: any) {
    console.error('Gemini SEO optimization error:', err);
    // Return safe fallback values on API failure
    return {
      keywords: locale === 'ar' 
        ? ['فرص عمل في اسطنبول', 'وظائف تركيا', 'شغل في تركيا', 'توظيف إسطنبول', 'عمل للعرب في تركيا']
        : ['jobs in istanbul', 'istanbul vacancies', 'work in turkey', 'employment istanbul', 'turkey job listings'],
      seoDescription: pageDescription.substring(0, 150).replace(/<[^>]*>/g, '').trim(),
      correctedTitle: pageTitle,
      correctedDesc: pageDescription
    };
  }
}
