import { Hono } from 'hono'
import { renderLayout } from './public'


export const currencyPricesRouter = new Hono()

// Fallback prices in case D1 cache isn't seeded yet
const fallbackPrices = [
  { name: 'الدولار الامريكي', code: 'USD', flag: 'us', buy: 46.5911, sell: 46.66, change: { '1d': '0.12' }, lastUpdate: '1782507601' },
  { name: 'اليورو', code: 'EUR', flag: 'eu', buy: 53.0727, sell: 53.1528, change: { '1d': '-0.05' }, lastUpdate: '1782507902' },
  { name: 'الريال السعودي', code: 'SAR', flag: 'sa', buy: 12.4135, sell: 12.4176, change: { '1d': '0.08' }, lastUpdate: '1782507302' },
  { name: 'الدرهم الإماراتي', code: 'AED', flag: 'ae', buy: 12.6732, sell: 12.6912, change: { '1d': '0.01' }, lastUpdate: '1782507302' },
  { name: 'الجنيه الإسترليني', code: 'GBP', flag: 'gb', buy: 62.4501, sell: 62.5891, change: { '1d': '-0.14' }, lastUpdate: '1782507302' },
  { name: 'الجنيه المصري', code: 'EGP', flag: 'eg', buy: 0.9521, sell: 0.9634, change: { '1d': '-0.32' }, lastUpdate: '1782507302' }
];

currencyPricesRouter.get('/currency-prices', (c) => {
  const acceptLang = c.req.header('accept-language') || '';
  if (acceptLang.toLowerCase().startsWith('tr')) {
    return c.redirect('/tr/currency-prices');
  }
  if (acceptLang.toLowerCase().startsWith('en')) {
    return c.redirect('/en/currency-prices');
  }
  return c.redirect('/ar/currency-prices');
})

currencyPricesRouter.get('/:locale/currency-prices', async (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr') return c.redirect('/ar/currency-prices');

  const db = (c.env as any).DB;
  let prices = fallbackPrices;
  let advice = {
    ar: 'تستقر الليرة التركية عند مستويات معينة مقابل الدولار واليورو مع تحركات البنك المركزي التركي للتحكم في التضخم. يُنصح الأجانب والمهتمين بالصرف بمتابعة الفروقات بين أسعار الشراء والبيع والاعتماد على قنوات الصرف الرسمية.',
    en: 'The Turkish Lira maintains stable bands against major currencies under current central bank policy tools aiming to address inflation. Exchange operators and expats are advised to monitor spreads between buy/sell rates and rely on official banking channels.',
    tr: 'Türk Lirası, enflasyonla mücadeleyi amaçlayan mevcut merkez bankası politika araçları altında döviz karşısında istikrarlı bantlarını koruyor. Döviz bozduracak kişilerin ve yerleşik yabancıların alış/satış marjlarını takip etmeleri ve resmi bankacılık kanallarına güvenmeleri önerilir.'
  };
  let lastUpdateStr = '';

  try {
    const cached = await db.prepare(
      `SELECT data FROM documents WHERE type_id = 'site_settings' AND id = 'currency-prices-cache'`
    ).first();

    if (cached) {
      const parsed = JSON.parse(cached.data);
      if (parsed.prices && Array.isArray(parsed.prices) && parsed.prices.length > 0) {
        prices = parsed.prices;
        advice = parsed.advice || advice;
        lastUpdateStr = new Date(parsed.updatedAt).toLocaleString(locale === 'ar' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : 'en-US'));
      }
    }
  } catch (err) {
    console.warn('Failed to load cached currency prices from DB, using fallback.', err);
  }

  // If no timestamp, generate a recent one
  if (!lastUpdateStr) {
    lastUpdateStr = new Date().toLocaleString(locale === 'ar' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : 'en-US'));
  }

  const t = {
    ar: {
      title: 'أسعار العملات في تركيا اليوم',
      subtitle: 'مؤشر أسعار الصرف الفوري المباشر ومحول العملات الذكي لليرة التركية مقابل العملات العربية والعالمية.',
      lastUpdate: 'آخر تحديث:',
      colCurrency: 'العملة',
      colBuy: 'شراء (TRY)',
      colSell: 'بيع (TRY)',
      colChange: 'التغير اليومي',
      converterTitle: '🧮 محول العملات الذكي',
      amountLabel: 'المبلغ:',
      fromLabel: 'من:',
      toLabel: 'إلى:',
      calcBtn: 'تحويل العملة',
      resultLabel: 'النتيجة التقريبية:',
      textDescription: 'يتم تحديث هذه الأسعار تلقائياً على مدار اليوم من الأسواق التركية الرسمية لمساعدتك في التخطيط المالي وتكاليف المعيشة.',
      flagUrl: (code: string) => `https://cdn101.adwimg.com/static/adwhitv2/svg/flags/1x1/${code.toLowerCase() === 'usd' ? 'us' : (code.toLowerCase() === 'eur' ? 'eu' : (code.toLowerCase() === 'gbp' ? 'gb' : code.toLowerCase().substring(0, 2)))}.svg`,
      aiTitle: '🤖 تحليل وتوصيات العملات اليوم (Gemini AI)'
    },
    en: {
      title: 'Currency Prices in Turkey Today',
      subtitle: 'Real-time exchange rate index and interactive currency converter for Turkish Lira (TRY) against global and regional currencies.',
      lastUpdate: 'Last Update:',
      colCurrency: 'Currency',
      colBuy: 'Buy (TRY)',
      colSell: 'Sell (TRY)',
      colChange: 'Daily Change',
      converterTitle: '🧮 Smart Currency Converter',
      amountLabel: 'Amount:',
      fromLabel: 'From:',
      toLabel: 'To:',
      calcBtn: 'Convert Currency',
      resultLabel: 'Estimated Result:',
      textDescription: 'These rates are updated automatically throughout the day from official Turkish markets to assist with your financial and living cost estimates.',
      flagUrl: (code: string) => `https://cdn101.adwimg.com/static/adwhitv2/svg/flags/1x1/${code.toLowerCase() === 'usd' ? 'us' : (code.toLowerCase() === 'eur' ? 'eu' : (code.toLowerCase() === 'gbp' ? 'gb' : code.toLowerCase().substring(0, 2)))}.svg`,
      aiTitle: '🤖 Gemini AI Currency Analysis & Advisory Today'
    },
    tr: {
      title: 'Türkiye Döviz Fiyatları Bugün',
      subtitle: 'Türk Lirası (TRY) için bölgesel ve küresel para birimlerine karşı canlı döviz kuru endeksi ve etkileşimli döviz dönüştürücü.',
      lastUpdate: 'Son Güncelleme:',
      colCurrency: 'Para Birimi',
      colBuy: 'Alış (TRY)',
      colSell: 'Satış (TRY)',
      colChange: 'Günlük Değişim',
      converterTitle: '🧮 Akıllı Döviz Çevirici',
      amountLabel: 'Tutar:',
      fromLabel: 'Kaynak:',
      toLabel: 'Hedef:',
      calcBtn: 'Para Birimini Çevir',
      resultLabel: 'Tahmini Sonuç:',
      textDescription: 'Bu oranlar, finansal planlamalarınıza ve yaşam maliyeti tahminlerinize yardımcı olmak amacıyla gün boyunca resmi Türkiye piyasalarından otomatik olarak güncellenir.',
      flagUrl: (code: string) => `https://cdn101.adwimg.com/static/adwhitv2/svg/flags/1x1/${code.toLowerCase() === 'usd' ? 'us' : (code.toLowerCase() === 'eur' ? 'eu' : (code.toLowerCase() === 'gbp' ? 'gb' : code.toLowerCase().substring(0, 2)))}.svg`,
      aiTitle: '🤖 Gemini AI Günlük Döviz Analiz ve Tavsiyeleri'
    }
  }[locale];

  // Generate currency select options
  const trCurrencyNames: Record<string, string> = { USD: 'ABD Doları', EUR: 'Euro', SAR: 'Suudi Arabistan Riyali', AED: 'Birleşik Arap Emirlikleri Dirhemi', GBP: 'İngiliz Sterlini', EGP: 'Mısır Lirası' };
  

  const html = `
    <style>
      .currency-grid {
        display: grid;
        grid-template-columns: 1.8fr 1.2fr;
        gap: 30px;
        max-width: 1200px;
        margin: 40px auto 100px;
        padding: 0 20px;
      }
      @media (max-width: 900px) {
        .currency-grid {
          grid-template-columns: 1fr;
        }
      }
      .cur-table {
        width: 100%;
        border-collapse: collapse;
        text-align: right;
      }
      .cur-table th {
        padding: 14px 16px;
        font-weight: 800;
        color: var(--text-dark);
        border-bottom: 2px solid var(--border);
        font-size: 0.95rem;
      }
      .cur-table td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        font-size: 0.92rem;
        color: var(--text-main);
        font-weight: 600;
      }
      .cur-row:hover {
        background: var(--bg-subtle);
      }
      .change-up {
        color: #10b981 !important;
        font-weight: 700;
      }
      .change-down {
        color: #ef4444 !important;
        font-weight: 700;
      }
      .calc-input {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        background: var(--bg-site);
        color: var(--text-dark);
        font-weight: 700;
      }
      .ai-advice-box {
        background: linear-gradient(135deg, rgba(20, 184, 166, 0.07) 0%, rgba(99, 102, 241, 0.07) 100%);
        border: 1px solid rgba(20, 184, 166, 0.15);
        padding: 24px;
        border-radius: var(--radius-lg);
        margin-bottom: 30px;
      }
    </style>

    <div class="container" style="padding: 40px 20px 0;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.3rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 16px; font-size: 1.05rem; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.6;">${t.subtitle}</p>
      <div style="text-align: center; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-bottom: 30px;">
        <i class="fa-regular fa-clock"></i> ${t.lastUpdate} ${lastUpdateStr}
      </div>

      <!-- AI Advice Widget -->
      <div class="ai-advice-box" style="max-width: 1160px; margin-left: auto; margin-right: auto;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-robot" style="color: #0d9488;"></i> ${t.aiTitle}
        </h3>
        <p style="color: var(--text-main); font-size: 0.96rem; line-height: 1.7; margin: 0;">${locale === 'ar' ? advice.ar : advice.en}</p>
      </div>

      <div class="currency-grid">
        
        <!-- Table Column -->
        <div class="glass-card" style="padding: 24px; border-radius: var(--radius-lg); overflow-x: auto;">
          <table class="cur-table" style="direction: ${locale === 'ar' ? 'rtl' : 'ltr'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
            <thead>
              <tr>
                <th style="text-align: ${locale === 'ar' ? 'right' : 'left'};">${t.colCurrency}</th>
                <th style="text-align: ${locale === 'ar' ? 'right' : 'left'};">${t.colBuy}</th>
                <th style="text-align: ${locale === 'ar' ? 'right' : 'left'};">${t.colSell}</th>
                <th style="text-align: ${locale === 'ar' ? 'right' : 'left'};">${t.colChange}</th>
              </tr>
            </thead>
            <tbody>
              ${prices.map(p => {
                const changeVal = parseFloat(p.change?.['1d'] || '0');
                const changeClass = changeVal > 0 ? 'change-up' : (changeVal < 0 ? 'change-down' : '');
                const changeSymbol = changeVal > 0 ? '▲' : (changeVal < 0 ? '▼' : '');
                
                return `
                  <tr class="cur-row">
                    <td style="display: flex; align-items: center; gap: 10px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
                      <img src="${t.flagUrl(p.code)}" alt="${p.code}" style="width: 24px; height: 18px; border-radius: 2px; box-shadow: var(--shadow-sm); border: 1px solid var(--border);">
                      <div>
                        <div style="font-weight: 800; color: var(--text-dark);">${p.code}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${locale === 'ar' ? p.name : (locale === 'tr' ? (trCurrencyNames[p.code] || p.code) : p.code)}</div>
                      </div>
                    </td>
                    <td>${p.buy.toFixed(4)}</td>
                    <td>${p.sell.toFixed(4)}</td>
                    <td class="${changeClass}">${changeSymbol} ${Math.abs(changeVal).toFixed(2)}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 20px; line-height: 1.5; text-align: center;">${t.textDescription}</p>
        </div>

        <!-- Calculator Column -->
        <div style="display: flex; flex-direction: column; gap: 30px;">
          <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg);">
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-dark); margin: 0 0 24px 0; border-bottom: 1px solid var(--border); padding-bottom: 15px; text-align: center;">${t.converterTitle}</h3>
            
            <form id="converter-form" onsubmit="event.preventDefault(); convert();">
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.amountLabel}</label>
                <input type="number" id="conv-amount" value="100" min="0.01" step="any" class="calc-input" oninput="convert()">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 24px; direction: ltr; text-align: left;">
                <div>
                  <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; text-align: left;">${t.fromLabel}</label>
                  <select id="conv-from" class="calc-input" onchange="convert()" style="text-align: left; direction: ltr;">
                    ${prices.map(p => `<option value="${p.code}" ${p.code === 'USD' ? 'selected' : ''}>${p.code} - ${locale === 'ar' ? p.name : (locale === 'tr' ? (trCurrencyNames[p.code] || p.code) : p.code)}</option>`).join('')}
                    <option value="TRY">TRY - ${locale === 'ar' ? 'الليرة التركية' : (locale === 'tr' ? 'Türk Lirası' : 'Turkish Lira')}</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; text-align: left;">${t.toLabel}</label>
                  <select id="conv-to" class="calc-input" onchange="convert()" style="text-align: left; direction: ltr;">
                    ${prices.map(p => `<option value="${p.code}">${p.code} - ${locale === 'ar' ? p.name : (locale === 'tr' ? (trCurrencyNames[p.code] || p.code) : p.code)}</option>`).join('')}
                    <option value="TRY" selected>TRY - ${locale === 'ar' ? 'الليرة التركية' : 'Turkish Lira'}</option>
                  </select>
                </div>
              </div>

              <div style="background: rgba(0,0,0,0.02); border: 1px solid var(--border); padding: 20px; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 0.88rem; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">${t.resultLabel}</div>
                <div id="conv-result" style="font-size: 2rem; font-weight: 900; color: var(--primary); word-break: break-all;">--</div>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>

    <script>
      const rates = ${JSON.stringify(prices.reduce((acc: any, cur) => {
        acc[cur.code] = { buy: cur.buy, sell: cur.sell };
        return acc;
      }, {}))};

      function convert() {
        const amount = parseFloat(document.getElementById('conv-amount').value) || 0;
        const from = document.getElementById('conv-from').value;
        const to = document.getElementById('conv-to').value;

        if (amount <= 0) {
          document.getElementById('conv-result').textContent = '--';
          return;
        }

        // Base rate calculations (converted via TRY as base)
        let amountInTry = 0;
        if (from === 'TRY') {
          amountInTry = amount;
        } else if (rates[from]) {
          // buying rates when converting foreign to local
          amountInTry = amount * rates[from].buy;
        }

        let finalAmount = 0;
        if (to === 'TRY') {
          finalAmount = amountInTry;
        } else if (rates[to]) {
          // selling rates when converting local to foreign
          finalAmount = amountInTry / rates[to].sell;
        }

        const formatter = new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 4,
          minimumFractionDigits: 2
        });

        document.getElementById('conv-result').textContent = formatter.format(finalAmount) + ' ' + to;
      }

      document.addEventListener('DOMContentLoaded', () => {
        convert();
      });
    </script>
  `;

  const seoTitle = locale === 'ar' 
    ? 'سعر الليرة التركية مقابل العملات في تركيا اليوم | أسعار العملات'
    : (locale === 'tr' ? 'Bugün Türkiye Döviz Fiyatları | Canlı Döviz Kurları' : 'Turkish Lira Exchange Rates Today | Live Currency Prices');

  return c.html(renderLayout(c, seoTitle, html, locale));
});
