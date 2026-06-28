export async function runCurrencyScraper(env: any) {
  console.log('⏳ Running currency scraper...');
  const res = await fetch('https://www.adwhit.com/ar/currencyPrices', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch adwhit currency prices: ${res.statusText}`);
  }

  const html = await res.text();
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

  if (!nextDataMatch) {
    throw new Error('Could not find __NEXT_DATA__ script block in adwhit HTML');
  }

  const data = JSON.parse(nextDataMatch[1]);
  const prices = data.props?.pageProps?.prices;

  if (!prices || !Array.isArray(prices)) {
    throw new Error('prices prop not found in next.js state object');
  }

  console.log(`✓ Parsed ${prices.length} currency prices from Adwhit.`);

  const currencyItems = prices.map((p: any) => ({
    name: p.name,
    code: p.code,
    flag: p.flag,
    buy: parseFloat(p.price_b),
    sell: parseFloat(p.price_s),
    change: p.change || { '1d': '0', '7d': '0', '30d': '0' },
    lastUpdate: p.lastUpdate
  }));

  // Generate Gemini AI Advice if API key is present
  let adviceAr = 'تستقر الليرة التركية عند مستويات معينة مقابل الدولار واليورو مع تحركات البنك المركزي التركي للتحكم في التضخم. يُنصح الأجانب والمهتمين بالصرف بمتابعة الفروقات بين أسعار الشراء والبيع والاعتماد على قنوات الصرف الرسمية.';
  let adviceEn = 'The Turkish Lira maintains stable bands against major currencies under current central bank policy tools aiming to address inflation. Exchange operators and expats are advised to monitor spreads between buy/sell rates and rely on official banking channels.';

  const apiKey = env.GEMINI_API_KEY;
  if (apiKey) {
    console.log('🤖 Generating AI financial advice via Gemini for currencies...');
    try {
      const ratesStr = currencyItems.map(c => `${c.code} (${c.name}): Buy ${c.buy} TRY, Sell ${c.sell} TRY, 1d change ${c.change?.['1d']}%`).join('\n');
      const prompt = `
You are an expert currency trader and economist specializing in the Turkish Lira and the macroeconomic environment of Turkey.
Analyze the following exchange rates in Turkey today (prices in Turkish Lira TRY):
${ratesStr}

Provide a brief, professional currency advice / market summary in Arabic (around 80 words) and English (around 80 words) for buyers, savers, and foreign expats in Turkey today. Offer insights on rate changes, trends, or exchange safety.

Return ONLY a valid JSON object matching the following structure. Do not wrap it in markdown code blocks, do not write comments, do not add intros or outros:
{
  "advice_ar": "Arabic advice content...",
  "advice_en": "English advice content..."
}
`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
        signal: AbortSignal.timeout(25000)
      });

      if (geminiRes.ok) {
        const geminiData: any = await geminiRes.json();
        let text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          const parsedAdvice = JSON.parse(text.substring(startIdx, endIdx + 1));
          if (parsedAdvice.advice_ar && parsedAdvice.advice_en) {
            adviceAr = parsedAdvice.advice_ar;
            adviceEn = parsedAdvice.advice_en;
            console.log('✓ AI Currency Advice generated successfully.');
          }
        }
      }
    } catch (err) {
      console.warn('Failed to generate AI currency advice with Gemini, using fallback advice.', err);
    }
  }

  const docId = 'currency-prices-cache';
  const slug = 'currency-prices';
  const title = 'أسعار العملات في تركيا';
  const nowMs = Date.now();

  const dataObj = {
    title,
    slug,
    prices: currencyItems,
    advice: {
      ar: adviceAr,
      en: adviceEn
    },
    updatedAt: nowMs
  };

  const existing = await env.DB.prepare(
    `SELECT id FROM documents WHERE type_id = 'site_settings' AND id = ?`
  ).bind(docId).first();

  if (existing) {
    await env.DB.prepare(
      `UPDATE documents SET title = ?, data = ?, updated_at = ? WHERE id = ? AND type_id = 'site_settings'`
    ).bind(title, JSON.stringify(dataObj), nowMs, docId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, published_at, created_at, updated_at)
       VALUES (?, ?, 'site_settings', 'published', 1, 1, ?, ?, ?, ?, ?, ?)`
    ).bind(docId, docId, slug, title, JSON.stringify(dataObj), nowMs, nowMs, nowMs).run();
  }

  console.log('✓ Successfully stored currency prices in DB.');
  return prices;
}
