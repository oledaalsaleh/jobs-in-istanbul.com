import { Hono } from 'hono'
import { renderLayout } from './public'


export const goldPricesRouter = new Hono()

// Fallback gold prices in case D1 cache isn't seeded yet
const fallbackGold = [
  { id: '1', name: 'جرام الذهب عيار 24', unit: 'جرام', buy: 3129.21, sell: 3130.13, karat: '24', lastUpdate: '1782507602' },
  { id: '12', name: 'جرام الذهب عيار 22', unit: 'جرام', buy: 2868.45, sell: 2870.21, karat: '22', lastUpdate: '1782507602' },
  { id: '11', name: 'جرام الذهب عيار 21', unit: 'جرام', buy: 2738.05, sell: 2739.86, karat: '21', lastUpdate: '1782507602' },
  { id: '2', name: 'جرام الذهب عيار 18', unit: 'جرام', buy: 2346.91, sell: 2348.33, karat: '18', lastUpdate: '1782507602' },
  { id: '3', name: 'جرام الذهب عيار 14', unit: 'جرام', buy: 1825.21, sell: 1826.94, karat: '14', lastUpdate: '1782507602' },
  { id: '4', name: 'اونصة الذهب', unit: 'اونصة', buy: 97321.43, sell: 97365.12, karat: null, lastUpdate: '1782507602' },
  { id: '5', name: 'الليرة الذهب', unit: 'ليرة', buy: 20450.00, sell: 20600.00, karat: null, lastUpdate: '1782507602' }
];

const fallbackAdvice = {
  ar: 'تشهد أسعار الذهب تذبذباً اليوم بناءً على تحركات أونصة الذهب عالمياً وسعر صرف الليرة التركية مقابل الدولار. للمستثمرين على المدى المتوسط والطويل، يظل الذهب وسيلة ممتازة لحفظ القيمة والادخار من التضخم، ويُنصح دائماً بالشراء التدريجي.',
  en: 'Gold prices are fluctuating today following global spot rate changes and the USD/TRY exchange rate. For medium-to-long term investors, gold remains an excellent store of value against inflation; gradual accumulation is recommended.',
  tr: 'Altın fiyatları, küresel spot altın hareketleri ve USD/TRY kurundaki değişimlere bağlı olarak bugün dalgalanma gösteriyor. Orta ve uzun vadeli yatırımcılar için altın, enflasyona karşı mükemmel bir değer koruma aracı olmaya devam etmektedir; kademeli birikim önerilir.'
};

goldPricesRouter.get('/gold-prices', (c) => {
  const acceptLang = c.req.header('accept-language') || '';
  if (acceptLang.toLowerCase().startsWith('tr')) {
    return c.redirect('/tr/gold-prices');
  }
  if (acceptLang.toLowerCase().startsWith('en')) {
    return c.redirect('/en/gold-prices');
  }
  return c.redirect('/ar/gold-prices');
})

goldPricesRouter.get('/:locale/gold-prices', async (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr') return c.redirect('/ar/gold-prices');

  const db = (c.env as any).DB;
  let metals = fallbackGold;
  let advice = fallbackAdvice;
  let lastUpdateStr = '';

  try {
    const cached = await db.prepare(
      `SELECT data FROM documents WHERE type_id = 'site_settings' AND id = 'gold-prices-cache'`
    ).first();

    if (cached) {
      const parsed = JSON.parse(cached.data);
      if (parsed.metals && Array.isArray(parsed.metals) && parsed.metals.length > 0) {
        metals = parsed.metals;
        advice = parsed.advice || fallbackAdvice;
        lastUpdateStr = new Date(parsed.updatedAt).toLocaleString(locale === 'ar' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : 'en-US'));
      }
    }
  } catch (err) {
    console.warn('Failed to load cached gold prices from DB, using fallback.', err);
  }

  if (!lastUpdateStr) {
    lastUpdateStr = new Date().toLocaleString(locale === 'ar' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : 'en-US'));
  }

  const localizedGoldName = (id: string, defaultName: string) => {
    const map: Record<string, Record<string, string>> = {
      ar: { '1': 'جرام الذهب عيار 24', '12': 'جرام الذهب عيار 22', '11': 'جرام الذهب عيار 21', '2': 'جرام الذهب عيار 18', '3': 'جرام الذهب عيار 14', '4': 'أونصة الذهب', '5': 'الليرة الذهب' },
      en: { '1': '24K Gold Gram', '12': '22K Gold Gram', '11': '21K Gold Gram', '2': '18K Gold Gram', '3': '14K Gold Gram', '4': 'Gold Ounce', '5': 'Gold Lira' },
      tr: { '1': '24 Ayar Altın Gramı', '12': '22 Ayar Altın Gramı', '11': '21 Ayar Altın Gramı', '2': '18 Ayar Altın Gramı', '3': '14 Ayar Altın Gramı', '4': 'Ons Altın', '5': 'Altın Lira' }
    };
    return map[locale]?.[id] || defaultName;
  };

  const t = {
    ar: {
      title: 'أسعار الذهب في تركيا اليوم',
      subtitle: 'دليل أسعار الذهب الفورية المباشرة بالليرة التركية والدولار لجميع العيارات، مع حاسبة ذكية وتحليل الذكاء الاصطناعي.',
      lastUpdate: 'آخر تحديث:',
      colGoldType: 'النوع عيار الذهب',
      colBuy: 'شراء (TRY)',
      colSell: 'بيع (TRY)',
      converterTitle: '🧮 حاسبة قيمة الذهب',
      weightLabel: 'الوزن / الكمية:',
      typeLabel: 'العيار / النوع:',
      modeLabel: 'نوع العملية:',
      modeBuy: 'شراء الذهب (سعر الشراء)',
      modeSell: 'بيع الذهب (سعر البيع)',
      resultLabel: 'القيمة الإجمالية التقريبية:',
      aiTitle: '🤖 تحليل وتوصيات الذكاء الاصطناعي اليوم (Gemini AI)',
      textDescription: 'تُستخلص هذه الأسعار تلقائياً على مدار الساعة من أسواق الصاغة التركية لتوفر للمغتربين والمهنيين والمستثمرين مؤشرات دقيقة لإدارة مدخراتهم.'
    },
    en: {
      title: 'Gold Prices in Turkey Today',
      subtitle: 'Real-time gold rate tracker in Turkish Lira (TRY) for all karats, including smart weight calculator and Gemini AI financial advisory.',
      lastUpdate: 'Last Update:',
      colGoldType: 'Gold Karat / Type',
      colBuy: 'Buy (TRY)',
      colSell: 'Sell (TRY)',
      converterTitle: '🧮 Gold Value Calculator',
      weightLabel: 'Weight / Quantity:',
      typeLabel: 'Type / Karat:',
      modeLabel: 'Transaction Type:',
      modeBuy: 'Buy Gold (Buying Rate)',
      modeSell: 'Sell Gold (Selling Rate)',
      resultLabel: 'Estimated Total Value:',
      aiTitle: '🤖 Gemini AI Market Analysis & Advisory Today',
      textDescription: 'These gold rates are compiled automatically throughout the day from official Turkish jewelry markets to assist with your saving and investment estimates.'
    },
    tr: {
      title: 'Türkiye Altın Fiyatları Bugün',
      subtitle: 'Tüm ayarlar için Türk Lirası (TRY) cinsinden canlı altın fiyatı takipçisi, interaktif ağırlık hesaplayıcı ve Gemini AI finansal tavsiyeleri.',
      lastUpdate: 'Son Güncelleme:',
      colGoldType: 'Altın Ayarı / Türü',
      colBuy: 'Alış (TRY)',
      colSell: 'Satış (TRY)',
      converterTitle: '🧮 Altın Değer Hesaplayıcı',
      weightLabel: 'Ağırlık / Miktar:',
      typeLabel: 'Ayar / Tür:',
      modeLabel: 'İşlem Türü:',
      modeBuy: 'Altın Alış (Alış Fiyatı)',
      modeSell: 'Altın Satış (Satış Fiyatı)',
      resultLabel: 'Tahmini Toplam Değer:',
      aiTitle: '🤖 Gemini AI Günlük Altın Piyasası Analiz ve Tavsiyeleri',
      textDescription: 'Bu altın fiyatları, tasarruf ve yatırım tahminlerinize yardımcı olmak amacıyla gün boyunca resmi Türkiye kuyumcular piyasasından otomatik olarak derlenir.'
    }
  }[locale];

  // Generate gold select options
  const selectOptions = metals.map(m => `<option value="${m.id}">${localizedGoldName(m.id, m.name)}</option>`).join('');

  const html = `
    <style>
      .gold-grid {
        display: grid;
        grid-template-columns: 1.8fr 1.2fr;
        gap: 30px;
        max-width: 1200px;
        margin: 40px auto 100px;
        padding: 0 20px;
      }
      @media (max-width: 900px) {
        .gold-grid {
          grid-template-columns: 1fr;
        }
      }
      .gold-table {
        width: 100%;
        border-collapse: collapse;
        text-align: right;
      }
      .gold-table th {
        padding: 14px 16px;
        font-weight: 800;
        color: var(--text-dark);
        border-bottom: 2px solid var(--border);
        font-size: 0.95rem;
      }
      .gold-table td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        font-size: 0.92rem;
        color: var(--text-main);
        font-weight: 600;
      }
      .gold-row:hover {
        background: var(--bg-subtle);
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
      <div class="ai-advice-box max-width: 1200px; margin-left: auto; margin-right: auto; max-width: 1160px;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-robot" style="color: #0d9488;"></i> ${t.aiTitle}
        </h3>
        <p style="color: var(--text-main); font-size: 0.96rem; line-height: 1.7; margin: 0;">${locale === 'ar' ? advice.ar : advice.en}</p>
      </div>

      <div class="gold-grid">
        
        <!-- Table Column -->
        <div class="glass-card" style="padding: 24px; border-radius: var(--radius-lg); overflow-x: auto;">
          <table class="gold-table" style="direction: ${locale === 'ar' ? 'rtl' : 'ltr'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
            <thead>
              <tr>
                <th style="text-align: ${locale === 'ar' ? 'right' : 'left'};">${t.colGoldType}</th>
                <th style="text-align: ${locale === 'ar' ? 'right' : 'left'};">${t.colBuy}</th>
                <th style="text-align: ${locale === 'ar' ? 'right' : 'left'};">${t.colSell}</th>
              </tr>
            </thead>
            <tbody>
              ${metals.map(m => {
                return `
                  <tr class="gold-row">
                    <td style="display: flex; align-items: center; gap: 10px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
                      <i class="fa-solid fa-cubes" style="color: #d97706; font-size: 1.1rem;"></i>
                      <div>
                        <div style="font-weight: 800; color: var(--text-dark);">${localizedGoldName(m.id, m.name)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${m.unit}</div>
                      </div>
                    </td>
                    <td>${m.buy.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
                    <td>${m.sell.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
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
            
            <form id="gold-calc-form" onsubmit="event.preventDefault(); calculateGold();">
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.weightLabel}</label>
                <input type="number" id="gold-weight" value="10" min="0.01" step="any" class="calc-input" oninput="calculateGold()">
              </div>

              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.typeLabel}</label>
                <select id="gold-type" class="calc-input" onchange="calculateGold()">
                  ${selectOptions}
                </select>
              </div>

              <div style="margin-bottom: 24px;">
                <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.modeLabel}</label>
                <select id="gold-mode" class="calc-input" onchange="calculateGold()">
                  <option value="buy" selected>${t.modeBuy}</option>
                  <option value="sell">${t.modeSell}</option>
                </select>
              </div>

              <div style="background: rgba(0,0,0,0.02); border: 1px solid var(--border); padding: 20px; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 0.88rem; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">${t.resultLabel}</div>
                <div id="gold-calc-result" style="font-size: 2rem; font-weight: 900; color: #b45309; word-break: break-all;">--</div>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>

    <script>
      const goldRates = ${JSON.stringify(metals.reduce((acc: any, cur) => {
        acc[cur.id] = { buy: cur.buy, sell: cur.sell, name: cur.name };
        return acc;
      }, {}))};

      function calculateGold() {
        const weight = parseFloat(document.getElementById('gold-weight').value) || 0;
        const typeId = document.getElementById('gold-type').value;
        const mode = document.getElementById('gold-mode').value;

        if (weight <= 0 || !goldRates[typeId]) {
          document.getElementById('gold-calc-result').textContent = '--';
          return;
        }

        const rateObj = goldRates[typeId];
        const activePrice = mode === 'buy' ? rateObj.buy : rateObj.sell;
        const total = weight * activePrice;

        const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : 'en-US'), {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        });

        document.getElementById('gold-calc-result').textContent = formatter.format(total) + ' TRY';
      }

      document.addEventListener('DOMContentLoaded', () => {
        calculateGold();
      });
    </script>
  `;

  const seoTitle = locale === 'ar' 
    ? 'أسعار الذهب في تركيا اليوم | عيار 24 و 21 والليرة الذهب بالليرة التركية'
    : (locale === 'tr' ? 'Bugün Türkiye Altın Fiyatları | Canlı Altın Ayarları ve Fiyatları' : 'Gold Prices in Turkey Today | Live Gold Karat & Lira Rates');

  return c.html(renderLayout(c, seoTitle, html, locale));
});
