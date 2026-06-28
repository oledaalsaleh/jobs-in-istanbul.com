export async function runGoldScraper(env: any) {
  console.log('⏳ Running gold scraper...');
  const res = await fetch('https://www.adwhit.com/ar/goldPrices/TL', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch adwhit gold prices: ${res.statusText}`);
  }

  const html = await res.text();
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

  if (!nextDataMatch) {
    throw new Error('Could not find __NEXT_DATA__ script block in adwhit HTML');
  }

  const data = JSON.parse(nextDataMatch[1]);
  const metals = data.props?.pageProps?.data?.metals;

  if (!metals || !Array.isArray(metals)) {
    throw new Error('metals data not found in next.js state object');
  }

  console.log(`✓ Parsed ${metals.length} gold items from Adwhit.`);

  // Prepare gold prices array
  const goldItems = metals.map((m: any) => ({
    id: m.id,
    name: m.name,
    unit: m.unit || 'جرام',
    buy: parseFloat(m.last_b),
    sell: parseFloat(m.last_s),
    karat: m.density || null,
    lastUpdate: m.last_update
  }));

  // Generate Gemini AI Advice if API key is present
  let adviceAr = 'أسواق الذهب في تركيا تشهد تذبذبات متأثرة بأسعار الأونصة العالمية وحركة سعر صرف الليرة التركية. للمدخرين على المدى الطويل، يُعتبر الذهب ملاذاً آمناً ويُنصح بالشراء التدريجي عند التراجعات وتفادي المضاربة السريعة.';
  let adviceEn = 'The gold market in Turkey is experiencing fluctuations influenced by global spot gold prices and the USD/TRY exchange rate. For long-term savers, gold remains a safe haven; gradual purchasing during dips is recommended while avoiding short-term speculation.';

  const apiKey = env.GEMINI_API_KEY;
  if (apiKey) {
    console.log('🤖 Generating AI financial advice via Gemini...');
    try {
      const goldListStr = goldItems.map(g => `${g.name}: Buy ${g.buy} TRY, Sell ${g.sell} TRY`).join('\n');
      const prompt = `
You are an expert financial analyst specializing in gold markets and the Turkish economy.
Analyze the following gold prices in Turkey today (prices in Turkish Lira TRY):
${goldListStr}

Provide a brief, professional financial advice / market summary in Arabic (around 80 words) and English (around 80 words) for buyers and savers in Turkey today, indicating whether it's a good time to buy gold, hold, or sell, based on standard market intuition. Keep it realistic.

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
            console.log('✓ AI Advice generated successfully.');
          }
        }
      }
    } catch (err) {
      console.warn('Failed to generate AI advice with Gemini, using fallback advice.', err);
    }
  }

  const docId = 'gold-prices-cache';
  const slug = 'gold-prices';
  const title = 'أسعار الذهب في تركيا';
  const nowMs = Date.now();

  const dataObj = {
    title,
    slug,
    metals: goldItems,
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

  console.log('✓ Successfully stored gold prices and advice in DB.');
  return goldItems;
}
