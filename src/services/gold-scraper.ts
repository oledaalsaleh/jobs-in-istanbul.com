export async function runGoldScraper(env: any) {
  console.log('⏳ Running gold scraper...');
  let goldItems: any[] = [];

  // ----------------------------------------------------
  // Tier 1: Fetch from Adwhit (Turkish Retail & Grand Bazaar Gold Feed)
  // ----------------------------------------------------
  try {
    const res = await fetch('https://www.adwhit.com/ar/goldPrices/TL', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const html = await res.text();
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

      if (nextDataMatch) {
        const data = JSON.parse(nextDataMatch[1]);
        const metals = data.props?.pageProps?.data?.metals;

        if (Array.isArray(metals) && metals.length > 0) {
          goldItems = metals.map((m: any) => ({
            id: String(m.id),
            name: m.name,
            unit: m.unit || 'جرام',
            buy: parseFloat(m.last_b),
            sell: parseFloat(m.last_s),
            karat: m.density || null,
            lastUpdate: String(m.last_update || Math.floor(Date.now() / 1000))
          }));
          console.log(`✓ [Tier 1: Adwhit] Parsed ${goldItems.length} gold items.`);
        }
      }
    }
  } catch (adwhitErr: any) {
    console.warn('⚠️ [Tier 1: Adwhit] fetch failed:', adwhitErr.message);
  }

  // ----------------------------------------------------
  // Tier 2: Truncgil Turkish Financial Feed (High Reliability Backup)
  // ----------------------------------------------------
  if (goldItems.length === 0) {
    try {
      console.log('🔄 Trying Tier 2: Truncgil Gold API...');
      const tRes = await fetch('https://finans.truncgil.com/v4/today.json', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (tRes.ok) {
        const tData: any = await tRes.json();
        const gra = tData['GRA'] || tData['GRAMALTIN'];
        if (gra && typeof gra.Selling === 'number' && gra.Selling > 0) {
          const gram24Sell = gra.Selling;
          const gram24Buy = gra.Buying || (gram24Sell * 0.998);
          const gram22Sell = gram24Sell * 22 / 24;
          const gram22Buy = gram24Buy * 22 / 24;
          const gram21Sell = gram24Sell * 21 / 24;
          const gram21Buy = gram24Buy * 21 / 24;

          const a18 = tData['18AYARALTIN'];
          const gram18Sell = (a18?.Selling && a18.Selling > 0) ? a18.Selling : (gram24Sell * 18 / 24);
          const gram18Buy = (a18?.Buying && a18.Buying > 0) ? a18.Buying : (gram24Buy * 18 / 24);

          const a14 = tData['14AYARALTIN'];
          const gram14Sell = (a14?.Selling && a14.Selling > 0) ? a14.Selling : (gram24Sell * 14 / 24);
          const gram14Buy = (a14?.Buying && a14.Buying > 0) ? a14.Buying : (gram24Buy * 14 / 24);

          const tam = tData['TAMALTIN'];
          const tamSell = (tam?.Selling && tam.Selling > 0) ? tam.Selling : (gram22Sell * 7.02);
          const tamBuy = (tam?.Buying && tam.Buying > 0) ? tam.Buying : (gram22Buy * 7.02);

          const yarim = tData['YARIMALTIN'];
          const yarimSell = (yarim?.Selling && yarim.Selling > 0) ? yarim.Selling : (tamSell / 2);
          const yarimBuy = (yarim?.Buying && yarim.Buying > 0) ? yarim.Buying : (tamBuy / 2);

          const ceyrek = tData['CEYREKALTIN'];
          const ceyrekSell = (ceyrek?.Selling && ceyrek.Selling > 0) ? ceyrek.Selling : (tamSell / 4);
          const ceyrekBuy = (ceyrek?.Buying && ceyrek.Buying > 0) ? ceyrek.Buying : (tamBuy / 4);

          const ounceSell = gram24Sell * 31.1034768;
          const ounceBuy = gram24Buy * 31.1034768;

          const gumus = tData['GUMUS'];
          const gumusSell = (gumus?.Selling && gumus.Selling > 0) ? gumus.Selling : 97.45;
          const gumusBuy = (gumus?.Buying && gumus.Buying > 0) ? gumus.Buying : 97.37;

          const nowSec = String(Math.floor(Date.now() / 1000));

          goldItems = [
            { id: '1', name: 'جرام الذهب عيار 24', unit: 'جرام', buy: gram24Buy, sell: gram24Sell, karat: '24', lastUpdate: nowSec },
            { id: '12', name: 'جرام الذهب عيار 22', unit: 'جرام', buy: gram22Buy, sell: gram22Sell, karat: '22', lastUpdate: nowSec },
            { id: '11', name: 'جرام الذهب عيار 21', unit: 'جرام', buy: gram21Buy, sell: gram21Sell, karat: '21', lastUpdate: nowSec },
            { id: '2', name: 'جرام الذهب عيار 18', unit: 'جرام', buy: gram18Buy, sell: gram18Sell, karat: '18', lastUpdate: nowSec },
            { id: '3', name: 'جرام الذهب عيار 14', unit: 'جرام', buy: gram14Buy, sell: gram14Sell, karat: '14', lastUpdate: nowSec },
            { id: '4', name: 'اونصة الذهب', unit: 'اونصة', buy: ounceBuy, sell: ounceSell, karat: null, lastUpdate: nowSec },
            { id: '5', name: 'الليرة الذهب', unit: 'ليرة', buy: tamBuy, sell: tamSell, karat: '24', lastUpdate: nowSec },
            { id: '7', name: 'نصف ليرة ذهب', unit: 'نصف ليرة', buy: yarimBuy, sell: yarimSell, karat: '24', lastUpdate: nowSec },
            { id: '8', name: 'ربع ليرة ذهب', unit: 'ربع ليرة', buy: ceyrekBuy, sell: ceyrekSell, karat: '24', lastUpdate: nowSec },
            { id: '6', name: 'جرام الفضة', unit: 'جرام', buy: gumusBuy, sell: gumusSell, karat: null, lastUpdate: nowSec },
          ];
          console.log(`✓ [Tier 2: Truncgil] Parsed ${goldItems.length} gold items.`);
        }
      }
    } catch (truncErr: any) {
      console.warn('⚠️ [Tier 2: Truncgil] fetch failed:', truncErr.message);
    }
  }

  // ----------------------------------------------------
  // Tier 3: Global Spot Gold API + Open Exchange Rate
  // ----------------------------------------------------
  if (goldItems.length === 0) {
    try {
      console.log('🔄 Trying Tier 3: Spot Gold + Open ER...');
      const [goldRes, usdRes] = await Promise.all([
        fetch('https://api.gold-api.com/price/XAU', { signal: AbortSignal.timeout(6000) }),
        fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(6000) })
      ]);

      if (goldRes.ok && usdRes.ok) {
        const goldData: any = await goldRes.json();
        const usdData: any = await usdRes.json();
        const goldOunceUsd = goldData.price;
        const usdToTry = usdData.rates?.TRY;

        if (goldOunceUsd && usdToTry) {
          const goldOunceTry = goldOunceUsd * usdToTry;
          const gram24K = goldOunceTry / 31.1034768;
          const gram22K = gram24K * 22 / 24;
          const gram21K = gram24K * 21 / 24;
          const gram18K = gram24K * 18 / 24;
          const gram14K = gram24K * 14 / 24;
          const tamLira = gram22K * 7.02;
          const nowSec = String(Math.floor(Date.now() / 1000));

          goldItems = [
            { id: '1', name: 'جرام الذهب عيار 24', unit: 'جرام', buy: gram24K * 0.999, sell: gram24K * 1.001, karat: '24', lastUpdate: nowSec },
            { id: '12', name: 'جرام الذهب عيار 22', unit: 'جرام', buy: gram22K * 0.999, sell: gram22K * 1.001, karat: '22', lastUpdate: nowSec },
            { id: '11', name: 'جرام الذهب عيار 21', unit: 'جرام', buy: gram21K * 0.999, sell: gram21K * 1.001, karat: '21', lastUpdate: nowSec },
            { id: '2', name: 'جرام الذهب عيار 18', unit: 'جرام', buy: gram18K * 0.999, sell: gram18K * 1.001, karat: '18', lastUpdate: nowSec },
            { id: '3', name: 'جرام الذهب عيار 14', unit: 'جرام', buy: gram14K * 0.999, sell: gram14K * 1.001, karat: '14', lastUpdate: nowSec },
            { id: '4', name: 'اونصة الذهب', unit: 'اونصة', buy: goldOunceTry * 0.999, sell: goldOunceTry * 1.001, karat: null, lastUpdate: nowSec },
            { id: '5', name: 'الليرة الذهب', unit: 'ليرة', buy: tamLira * 0.999, sell: tamLira * 1.001, karat: '24', lastUpdate: nowSec },
            { id: '7', name: 'نصف ليرة ذهب', unit: 'نصف ليرة', buy: (tamLira / 2) * 0.999, sell: (tamLira / 2) * 1.001, karat: '24', lastUpdate: nowSec },
            { id: '8', name: 'ربع ليرة ذهب', unit: 'ربع ليرة', buy: (tamLira / 4) * 0.999, sell: (tamLira / 4) * 1.001, karat: '24', lastUpdate: nowSec },
            { id: '6', name: 'جرام الفضة', unit: 'جرام', buy: 97.37, sell: 97.45, karat: null, lastUpdate: nowSec },
          ];
          console.log(`✓ [Tier 3: Gold-API] Calculated ${goldItems.length} gold items.`);
        }
      }
    } catch (spotErr: any) {
      console.warn('⚠️ [Tier 3: Spot Gold] fetch failed:', spotErr.message);
    }
  }

  // ----------------------------------------------------
  // Tier 4: Keep existing KV Cache if all scrapers failed
  // ----------------------------------------------------
  if (goldItems.length === 0 && env.CACHE_KV) {
    try {
      const existingCache: any = await env.CACHE_KV.get('kv_gold_prices', 'json');
      if (existingCache && Array.isArray(existingCache.metals) && existingCache.metals.length > 0) {
        goldItems = existingCache.metals;
        console.log(`✓ [Tier 4: Retain KV Cache] Retained ${goldItems.length} gold items.`);
      }
    } catch (e) {}
  }

  if (goldItems.length === 0) {
    console.error('❌ All gold rate providers failed. Aborting gold scraper cycle.');
    return [];
  }

  // Generate or Reuse Gemini AI Advice (cache advice for 6 hours to optimize performance and quota)
  let adviceAr = 'أسواق الذهب في تركيا تشهد تذبذبات متأثرة بأسعار الأونصة العالمية وحركة سعر صرف الليرة التركية. للمدخرين على المدى الطويل، يُعتبر الذهب ملاذاً آمناً ويُنصح بالشراء التدريجي عند التراجعات وتفادي المضاربة السريعة.';
  let adviceEn = 'The gold market in Turkey is experiencing fluctuations influenced by global spot gold prices and the USD/TRY exchange rate. For long-term savers, gold remains a safe haven; gradual purchasing during dips is recommended while avoiding short-term speculation.';

  let shouldGenerateAi = true;
  if (env.CACHE_KV) {
    try {
      const existingCache: any = await env.CACHE_KV.get('kv_gold_prices', 'json');
      if (existingCache?.advice?.ar && existingCache?.updatedAt && (Date.now() - existingCache.updatedAt < 6 * 3600 * 1000)) {
        adviceAr = existingCache.advice.ar;
        adviceEn = existingCache.advice.en || adviceEn;
        shouldGenerateAi = false;
        console.log('✓ Reused recent AI financial advice from KV cache.');
      }
    } catch (e) {}
  }

  const apiKey = env.GEMINI_API_KEY;
  if (shouldGenerateAi && apiKey) {
    console.log('🤖 Generating fresh AI financial advice via Gemini...');
    try {
      const goldListStr = goldItems.map(g => `${g.name}: Buy ${g.buy} TRY, Sell ${g.sell} TRY`).join('\n');
      const prompt = `
You are an expert financial analyst specializing in gold markets and the Turkish economy.
Analyze the following gold prices in Turkey today (prices in Turkish Lira TRY):
${goldListStr}

Provide a brief, professional financial advice / market summary in Arabic (around 80 words) and English (around 80 words) for buyers and savers in Turkey today, indicating whether it's a good time to buy gold, hold, or sell, based on standard market intuition. Keep it realistic.

Return ONLY a valid JSON object matching the following structure:
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
        signal: AbortSignal.timeout(6000)
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

  // 1. Always save to CACHE_KV for ultra-fast, high-availability access
  if (env.CACHE_KV) {
    try {
      await env.CACHE_KV.put('kv_gold_prices', JSON.stringify(dataObj));
      console.log('✓ Successfully stored gold prices in CACHE_KV.');
    } catch (kvErr) {
      console.warn('Failed to store gold prices in CACHE_KV:', kvErr);
    }
  }

  // 2. Persist to D1 DB if available
  if (env.DB) {
    try {
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
    } catch (dbErr) {
      console.warn('Failed to persist gold prices to D1 DB (will rely on CACHE_KV):', dbErr);
    }
  }

  return goldItems;
}
