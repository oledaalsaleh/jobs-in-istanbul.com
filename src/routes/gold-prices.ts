import { Hono } from 'hono'
import { renderLayout } from './public'
import { runGoldScraper } from '../services/gold-scraper'
import { safeQuery } from '../utils/db-helper'

export const goldPricesRouter = new Hono()

// Fallback gold prices in case D1 and KV caches aren't seeded yet (Updated 2026 accurate spot baselines)
const fallbackGold = [
  { id: '1', name: 'جرام الذهب عيار 24', unit: 'جرام', buy: 6571.45, sell: 6572.24, karat: '24', lastUpdate: '1791197103' },
  { id: '12', name: 'جرام الذهب عيار 22', unit: 'جرام', buy: 6023.83, sell: 6024.55, karat: '22', lastUpdate: '1791197103' },
  { id: '11', name: 'جرام الذهب عيار 21', unit: 'جرام', buy: 5750.02, sell: 5750.71, karat: '21', lastUpdate: '1791197103' },
  { id: '2', name: 'جرام الذهب عيار 18', unit: 'جرام', buy: 4804.66, sell: 4809.24, karat: '18', lastUpdate: '1791197103' },
  { id: '3', name: 'جرام الذهب عيار 14', unit: 'جرام', buy: 3751.58, sell: 3755.16, karat: '14', lastUpdate: '1791197103' },
  { id: '4', name: 'اونصة الذهب', unit: 'اونصة', buy: 204427.27, sell: 204451.85, karat: null, lastUpdate: '1791197103' },
  { id: '5', name: 'الليرة الذهب', unit: 'ليرة', buy: 42123.05, sell: 42953.79, karat: '24', lastUpdate: '1791197103' },
  { id: '7', name: 'نصف ليرة ذهب', unit: 'نصف ليرة', buy: 20995.71, sell: 21542.77, karat: '24', lastUpdate: '1791197103' },
  { id: '8', name: 'ربع ليرة ذهب', unit: 'ربع ليرة', buy: 10530.76, sell: 10771.39, karat: '24', lastUpdate: '1791197103' },
  { id: '6', name: 'جرام الفضة', unit: 'جرام', buy: 97.42, sell: 97.50, karat: null, lastUpdate: '1791197103' }
];

const fallbackAdvice = {
  ar: 'تشهد أسعار الذهب تذبذباً اليوم بناءً على تحركات أونصة الذهب عالمياً وسعر صرف الليرة التركية مقابل الدولار. للمستثمرين على المدى المتوسط والطويل، يظل الذهب وسيلة ممتازة لحفظ القيمة والادخار من التضخم، ويُنصح دائماً بالشراء التدريجي.',
  en: 'Gold prices are fluctuating today following global spot rate changes and the USD/TRY exchange rate. For medium-to-long term investors, gold remains an excellent store of value against inflation; gradual accumulation is recommended.',
  tr: 'Altın fiyatları, küresel spot altın hareketleri ve USD/TRY kurundaki değişimlere bağlı olarak bugün dalgalanma gösteriyor. Orta ve uzun vadeli yatırımcılar için altın, enflasyona karşı mükemmel bir değer koruma aracı olmaya devam etmektedir; kademeli birikim önerilir.',
  ru: 'Цены на золото сегодня колеблются в зависимости от мировых котировок и курса турецкой лиры к доллару. Для долгосрочных инвесторов золото остается отличным средством сбережения от инفляции.'
};

goldPricesRouter.post('/admin-api/refresh-gold-prices', async (c) => {
  try {
    const metals = await runGoldScraper(c.env);
    return c.json({ success: true, count: metals.length, metals });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

goldPricesRouter.get('/admin-api/refresh-gold-prices', async (c) => {
  try {
    const metals = await runGoldScraper(c.env);
    return c.json({ success: true, count: metals.length, metals });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

goldPricesRouter.get('/gold-prices', (c) => {
  const acceptLang = c.req.header('accept-language') || '';
  if (acceptLang.toLowerCase().startsWith('ur')) {
    return c.redirect('/ur/gold-prices');
  }
  if (acceptLang.toLowerCase().startsWith('fa')) {
    return c.redirect('/fa/gold-prices');
  }
  if (acceptLang.toLowerCase().startsWith('ru')) {
    return c.redirect('/ru/gold-prices');
  }
  if (acceptLang.toLowerCase().startsWith('tr')) {
    return c.redirect('/tr/gold-prices');
  }
  if (acceptLang.toLowerCase().startsWith('en')) {
    return c.redirect('/en/gold-prices');
  }
  return c.redirect('/ar/gold-prices');
});

goldPricesRouter.get('/:locale/gold-prices', async (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/gold-prices');

  const db = (c.env as any).DB;
  let metals = fallbackGold;
  let advice = fallbackAdvice;
  let lastUpdateStr = '';
  let kvUpdatedTimestamp = 0;

  // 1. Try CACHE_KV first
  const envAny = c.env as any;
  if (envAny?.CACHE_KV) {
    try {
      const kvData: any = await envAny.CACHE_KV.get('kv_gold_prices', 'json');
      if (kvData && Array.isArray(kvData.metals) && kvData.metals.length > 0) {
        metals = kvData.metals;
        advice = kvData.advice || fallbackAdvice;
        kvUpdatedTimestamp = kvData.updatedAt || 0;
        lastUpdateStr = new Date(kvUpdatedTimestamp || Date.now()).toLocaleString(locale === 'ar' || locale === 'fa' || locale === 'ur' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : (locale === 'ru' ? 'ru-RU' : 'en-US')));
      }
    } catch (e) {}
  }

  // 2. Try DB if KV had no data
  if (metals === fallbackGold && db) {
    try {
      const cached = await safeQuery(() => db.prepare(
        `SELECT data FROM documents WHERE type_id = 'site_settings' AND id = 'gold-prices-cache'`
      ).first(), 1, 50);

      if (cached?.data) {
        const parsed = JSON.parse(cached.data);
        if (parsed.metals && Array.isArray(parsed.metals) && parsed.metals.length > 0) {
          metals = parsed.metals;
          advice = parsed.advice || fallbackAdvice;
          kvUpdatedTimestamp = parsed.updatedAt || 0;
          lastUpdateStr = new Date(parsed.updatedAt).toLocaleString(locale === 'ar' || locale === 'fa' || locale === 'ur' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : (locale === 'ru' ? 'ru-RU' : 'en-US')));
        }
      }
    } catch (err) {
      console.warn('Failed to load cached gold prices from DB, using fallback.', err);
    }
  }

  // 3. Autonomous Auto-Revalidation:
  // If cache is stale (> 10 minutes) or completely empty, update automatically!
  const isStale = !kvUpdatedTimestamp || (Date.now() - kvUpdatedTimestamp > 10 * 60 * 1000);
  if (isStale) {
    if (metals === fallbackGold) {
      try {
        const fresh = await runGoldScraper(c.env);
        if (fresh && fresh.length > 0) {
          metals = fresh;
          lastUpdateStr = new Date().toLocaleString(locale === 'ar' || locale === 'fa' || locale === 'ur' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : (locale === 'ru' ? 'ru-RU' : 'en-US')));
        }
      } catch (scrapeErr) {
        console.warn('[GOLD AUTO SCRAPE SYNC ERROR]', scrapeErr);
      }
    } else {
      try {
        if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
          c.executionCtx.waitUntil(runGoldScraper(c.env).catch(e => console.warn('[GOLD AUTO SCRAPE BG ERROR]', e)));
        }
      } catch (bgErr) {}
    }
  }

  if (!lastUpdateStr) {
    lastUpdateStr = new Date().toLocaleString(locale === 'ar' || locale === 'fa' || locale === 'ur' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : (locale === 'ru' ? 'ru-RU' : 'en-US')));
  }

  const localizedGoldName = (id: string, defaultName: string) => {
    const map: Record<string, Record<string, string>> = {
      ar: {
        '1': 'جرام الذهب عيار 24',
        '12': 'جرام الذهب عيار 22',
        '11': 'جرام الذهب عيار 21',
        '2': 'جرام الذهب عيار 18',
        '3': 'جرام الذهب عيار 14',
        '4': 'أونصة الذهب',
        '5': 'الليرة الذهب',
        '7': 'نصف ليرة ذهب',
        '8': 'ربع ليرة ذهب',
        '6': 'جرام الفضة'
      },
      en: {
        '1': '24K Gold Gram',
        '12': '22K Gold Gram',
        '11': '21K Gold Gram',
        '2': '18K Gold Gram',
        '3': '14K Gold Gram',
        '4': 'Gold Ounce',
        '5': 'Gold Lira (Tam)',
        '7': 'Half Gold Lira',
        '8': 'Quarter Gold Lira',
        '6': 'Silver Gram'
      },
      tr: {
        '1': '24 Ayar Altın Gramı',
        '12': '22 Ayar Altın Gramı',
        '11': '21 Ayar Altın Gramı',
        '2': '18 Ayar Altın Gramı',
        '3': '14 Ayar Altın Gramı',
        '4': 'Ons Altın',
        '5': 'Tam Altın',
        '7': 'Yarım Altın',
        '8': 'Çeyrek Altın',
        '6': 'Gümüş Gramı'
      },
      ru: {
        '1': 'грамм золота 24 карата',
        '12': 'грамм золота 22 карата',
        '11': 'грамм золота 21 карат',
        '2': 'грамм золота 18 карат',
        '3': 'грамм золота 14 карат',
        '4': 'Унция золота',
        '5': 'Золотая лира',
        '7': 'Половина лиры',
        '8': 'Четверть лиры',
        '6': 'Грамм серебра'
      },
      fa: {
        '1': 'هر گرم طلای ۲۴ عیار',
        '12': 'هر گرم طلای ۲۲ عیار',
        '11': 'هر گرم طلای ۲۱ عیار',
        '2': 'هر گرم طلای ۱۸ عیار',
        '3': 'هر گرم طلای ۱۴ عیار',
        '4': 'هر اونس طلا',
        '5': 'لیره طلا',
        '7': 'نیم لیره طلا',
        '8': 'ربع لیره طلا',
        '6': 'هر گرم نقره'
      },
      ur: {
        '1': '24 قیراط سونا فی گرام',
        '12': '22 قیراط سونا فی گرام',
        '11': '21 قیراط سونا فی گرام',
        '2': '18 قیراط سونا فی گرام',
        '3': '14 قیراط سونا فی گرام',
        '4': 'سونے کا اونس',
        '5': 'ترک گولڈ لیرا',
        '7': 'نصف گولڈ لیرا',
        '8': 'چوتھائی گولڈ لیرا',
        '6': 'چاندی فی گرام'
      }
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
      converterTitle: 'حاسبة قيمة الذهب',
      weightLabel: 'الوزن / الكمية:',
      typeLabel: 'العيار / النوع:',
      modeLabel: 'نوع العملية:',
      modeBuy: 'شراء الذهب (سعر الشراء)',
      modeSell: 'بيع الذهب (سعر البيع)',
      resultLabel: 'القيمة الإجمالية التقريبية:',
      aiTitle: 'تحليل وتوصيات الذكاء الاصطناعي اليوم (Gemini AI)',
      textDescription: 'تُستخلص هذه الأسعار تلقائياً على مدار الساعة من أسواق الصاغة التركية لتوفر للمغتربين والمهنيين والمستثمرين مؤشرات دقيقة لإدارة مدخراتهم.',
      liveBadge: 'مباشر: تحديث تلقائي لحظي للأسعار',
      btnRefresh: 'تحديث الآن'
    },
    en: {
      title: 'Gold Prices in Turkey Today',
      subtitle: 'Real-time gold rate tracker in Turkish Lira (TRY) for all karats, including smart weight calculator and Gemini AI financial advisory.',
      lastUpdate: 'Last Update:',
      colGoldType: 'Gold Karat / Type',
      colBuy: 'Buy (TRY)',
      colSell: 'Sell (TRY)',
      converterTitle: 'Gold Value Calculator',
      weightLabel: 'Weight / Quantity:',
      typeLabel: 'Type / Karat:',
      modeLabel: 'Transaction Type:',
      modeBuy: 'Buy Gold (Buying Rate)',
      modeSell: 'Sell Gold (Selling Rate)',
      resultLabel: 'Estimated Total Value:',
      aiTitle: 'Gemini AI Market Analysis & Advisory Today',
      textDescription: 'These gold rates are compiled automatically throughout the day from official Turkish jewelry markets to assist with your saving and investment estimates.',
      liveBadge: 'Live: Real-Time Auto-Updating Rates',
      btnRefresh: 'Refresh'
    },
    tr: {
      title: 'Türkiye Altın Fiyatları Bugün',
      subtitle: 'Tüm ayarlar için Türk Lirası (TRY) cinsinden canlı altın fiyatı takipçisi, interaktif ağırlık hesaplayıcı ve Gemini AI finansal tavsiyeleri.',
      lastUpdate: 'Son Güncelleme:',
      colGoldType: 'Altın Ayarı / Türü',
      colBuy: 'Alış (TRY)',
      colSell: 'Satış (TRY)',
      converterTitle: 'Altın Değer Hesaplayıcı',
      weightLabel: 'Ağırlık / Miktar:',
      typeLabel: 'Ayar / Tür:',
      modeLabel: 'İşlem Türü:',
      modeBuy: 'Altın Alış (Alış Fiyatı)',
      modeSell: 'Altın Satış (Satış Fiyatı)',
      resultLabel: 'Tahmini Toplam Değer:',
      aiTitle: 'Gemini AI Günlük Altın Piyasası Analiz ve Tavsiyeleri',
      textDescription: 'Bu altın fiyatları, tasarruf ve yatırım tahminlerinize yardımcı olmak amacıyla gün boyunca resmi Türkiye kuyumcular piyasasından otomatik olarak derlenir.',
      liveBadge: 'Canlı: Sürekli Otomatik Güncelleme',
      btnRefresh: 'Şimdi Yenile'
    },
    ru: {
      title: 'Цены на золото в Турции сегодня',
      subtitle: 'Отслеживание цен на золото в реальном времени в турецких лирах (TRY) для всех каратов, включая калькулятор веса и финансовый анализ Gemini AI.',
      lastUpdate: 'Последнее обновление:',
      colGoldType: 'Карат / Тип золота',
      colBuy: 'Покупка (TRY)',
      colSell: 'Продажа (TRY)',
      converterTitle: 'Калькулятор стоимости золота',
      weightLabel: 'Вес / Количество:',
      typeLabel: 'Тип / Карат:',
      modeLabel: 'Тип операции:',
      modeBuy: 'Покупка золота (курс покупки)',
      modeSell: 'Продажа золота (курс продажи)',
      resultLabel: 'Оценочная общая стоимость:',
      aiTitle: 'Анализ рынка и рекомендации Gemini AI',
      textDescription: 'Эти курсы золота автоматически собираются в течение дня с ювелирных рынков Турции для планирования ваших сбережений.',
      liveBadge: 'В прямом эфире: Автообновление цен',
      btnRefresh: 'Обновить'
    },
    fa: {
      title: 'قیمت طلا در ترکیه امروز',
      subtitle: 'پیگیری لحظه‌ای قیمت طلا به لیره ترکیه (TRY) برای انواع عیارها به همراه ماشین حساب محاسبه ارزش و تحلیل بازار با هوش مصنوعی Gemini.',
      lastUpdate: 'آخرین به‌روزرسانی:',
      colGoldType: 'عیار / نوع طلا',
      colBuy: 'خرید (TRY)',
      colSell: 'فروش (TRY)',
      converterTitle: 'ماشین حساب محاسبه قیمت طلا',
      weightLabel: 'وزن / مقدار طلا:',
      typeLabel: 'عیار / نوع طلا:',
      modeLabel: 'نوع تراکنش:',
      modeBuy: 'خرید طلا از ما (نرخ خرید)',
      modeSell: 'فروش طلا به ما (نرخ فروش)',
      resultLabel: 'ارزش کل تقریبی:',
      aiTitle: 'تحلیل روزانه بازار و توصیه‌های هوش مصنوعی Gemini',
      textDescription: 'این نرخ‌های طلا به صورت خودکار در طول روز از بازار صنف طلافروشان ترکیه جهت برنامه‌ریزی پس‌انداز و سرمایه‌گذاری شما گردآوری می‌شود.',
      liveBadge: 'زنده: به‌روزرسانی خودکار لحظه‌ای',
      btnRefresh: 'به‌روزرسانی اکنون'
    },
    ur: {
      title: 'ترکی میں سونے کی قیمتیں آج',
      subtitle: 'ترک لیرا (TRY) میں سونے کی لائیو قیمتیں، کیلکولیٹر اور اے آئی جیمنی مارکیٹ تجزیہ رپورٹ۔',
      lastUpdate: 'آخری اپ ڈیٹ:',
      colGoldType: 'قیراط / سونے کی قسم',
      colBuy: 'خرید (TRY)',
      colSell: 'فروخت (TRY)',
      converterTitle: 'سونا قیمت کیلکولیٹر',
      weightLabel: 'وزن / سونے کی مقدار:',
      typeLabel: 'قیراط / سونے کی قسم:',
      modeLabel: 'سودے کی قسم:',
      modeBuy: 'ہم سے سونا خریدیں (خرید ریٹ)',
      modeSell: 'ہمیں سونا فروخت کریں (فروخت ریٹ)',
      resultLabel: 'تقریبی کل قیمت:',
      aiTitle: 'اے آئی جیمنی سونے کی مارکیٹ کی رپورٹ',
      textDescription: 'یہ قیمتیں استنبول کے بازارِ صرافہ سے براہِ راست حاصل کی جاتی ہیں تاکہ آپ سرمایہ کاری کی منصوبہ بندی کر سکیں۔',
      liveBadge: 'لائیو: ریئل ٹائم خودکار اپ ڈیٹ',
      btnRefresh: 'تازہ کریں'
    }
  }[locale];

  // Generate gold select options
  const selectOptions = metals.map(m => `<option value="${m.id}">${localizedGoldName(m.id, m.name)}</option>`).join('');

  const getKaratBadge = (id: string) => {
    const styleMap: Record<string, { bg: string, text: string, label: string }> = {
      '1': { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', text: '#fff', label: '24K' },
      '12': { bg: 'linear-gradient(135deg, #fbbf24, #ca8a04)', text: '#fff', label: '22K' },
      '11': { bg: 'linear-gradient(135deg, #facc15, #a16207)', text: '#fff', label: '21K' },
      '2': { bg: 'linear-gradient(135deg, #edc0a6, #c27a51)', text: '#fff', label: '18K' },
      '3': { bg: 'linear-gradient(135deg, #9ca3af, #4b5563)', text: '#fff', label: '14K' },
      '4': { bg: 'linear-gradient(135deg, #cbd5e1, #64748b)', text: '#fff', label: 'OZ' },
      '5': { bg: 'linear-gradient(135deg, #fcd34d, #b45309)', text: '#fff', label: 'TAM' },
      '7': { bg: 'linear-gradient(135deg, #fef08a, #854d0e)', text: '#fff', label: 'YARIM' },
      '8': { bg: 'linear-gradient(135deg, #fef9c3, #713f12)', text: '#713f12', label: 'CEYREK' },
      '6': { bg: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', text: '#1e293b', label: 'SILVER' }
    };
    const item = styleMap[id] || { bg: '#e2e8f0', text: '#1e293b', label: 'ALTIN' };
    return `<span class="gold-badge" style="background: ${item.bg}; color: ${item.text}; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 800; text-transform: uppercase;">${item.label}</span>`;
  };

  // Extract popular metrics for highlights (24K, 21K, Ounce)
  const popularMetals = metals.filter(m => ['1', '11', '4'].includes(m.id));
  const highlightsHtml = popularMetals.map(m => {
    const isOz = m.id === '4';
    const buyPrice = m.buy.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const sellPrice = m.sell.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const titleText = localizedGoldName(m.id, m.name);

    return `
      <div class="highlight-card">
        <div class="highlight-glow-bar"></div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getKaratBadge(m.id)}
            <span style="font-weight: 800; color: var(--text-dark); font-size: 1.05rem;">${titleText}</span>
          </div>
          <div style="margin-top: 8px; display: flex; gap: 16px;">
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600; display: block;">${locale === 'ar' || locale === 'fa' || locale === 'ur' ? (locale === 'ar' ? 'شراء' : (locale === 'fa' ? 'خرید' : 'خرید')) : (locale === 'tr' ? 'Alış' : 'Buy')}</span>
              <span class="highlight-price-val" data-highlight-id="${m.id}" data-highlight-type="buy" style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark);">${buyPrice} ₺</span>
            </div>
            <div style="border-left: 1px solid var(--border); padding-left: 16px; padding-right: 16px;">
              <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600; display: block;">${locale === 'ar' || locale === 'fa' || locale === 'ur' ? (locale === 'ar' ? 'بيع' : (locale === 'fa' ? 'فروش' : 'فروخت')) : (locale === 'tr' ? 'Satış' : 'Sell')}</span>
              <span class="highlight-price-val" data-highlight-id="${m.id}" data-highlight-type="sell" style="font-size: 1.25rem; font-weight: 800; color: #b45309;">${sellPrice} ₺</span>
            </div>
          </div>
        </div>
        <div style="font-size: 2rem; color: #fbbf24; filter: drop-shadow(0 2px 4px rgba(217, 119, 6, 0.15));">
          <i class="${isOz ? 'fa-solid fa-coins' : 'fa-solid fa-cubes'}"></i>
        </div>
      </div>
    `;
  }).join('');

  const html = `
    <style>
      @keyframes livePulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
      }
      .live-indicator-dot {
        width: 10px;
        height: 10px;
        background-color: #10b981;
        border-radius: 50%;
        display: inline-block;
        animation: livePulse 2s infinite;
      }
      .live-status-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: var(--radius-md);
        padding: 12px 20px;
        margin: 20px auto 0;
        max-width: 1160px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .live-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 800;
        font-size: 0.92rem;
        color: #065f46;
      }
      .live-meta {
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 0.86rem;
        color: var(--text-muted);
      }
      .gold-refresh-btn {
        background: white;
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 6px 14px;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-dark);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }
      .gold-refresh-btn:hover {
        background: #fffbeb;
        border-color: #fbbf24;
        color: #b45309;
        transform: translateY(-1px);
      }
      @keyframes priceFlashAnim {
        0% { background-color: rgba(251, 191, 36, 0.45); }
        100% { background-color: transparent; }
      }
      .price-flash {
        animation: priceFlashAnim 1.4s ease-out;
        border-radius: 4px;
      }
      .gold-highlights {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        max-width: 1200px;
        margin: 24px auto 10px;
        padding: 0 20px;
      }
      .highlight-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 24px;
        box-shadow: var(--shadow-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        transition: var(--transition);
      }
      .highlight-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg), 0 10px 30px -10px rgba(217, 119, 6, 0.15);
        border-color: #fbbf24;
      }
      .highlight-glow-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #fbbf24, #d97706);
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      }
      .gold-grid {
        display: grid;
        grid-template-columns: 1.8fr 1.2fr;
        gap: 30px;
        max-width: 1200px;
        margin: 20px auto 100px;
        padding: 0 20px;
      }
      @media (max-width: 900px) {
        .gold-grid {
          grid-template-columns: 1fr;
        }
      }
      .gold-table-container {
        display: block;
      }
      @media (max-width: 600px) {
        .gold-table-container {
          display: none;
        }
      }
      .gold-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        text-align: right;
      }
      .gold-table th {
        padding: 16px 20px;
        font-weight: 800;
        color: var(--text-dark);
        border-bottom: 2px solid var(--border);
        font-size: 0.9rem;
        background: #f8fafc;
      }
      .gold-table th:first-child {
        border-top-left-radius: 12px;
      }
      .gold-table th:last-child {
        border-top-right-radius: 12px;
      }
      .gold-table td {
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
        font-size: 0.95rem;
        color: var(--text-dark);
        font-weight: 700;
        transition: var(--transition);
      }
      .gold-row:hover td {
        background: var(--primary-light);
      }
      .gold-mobile-cards {
        display: none;
        flex-direction: column;
        gap: 16px;
      }
      @media (max-width: 600px) {
        .gold-mobile-cards {
          display: flex;
        }
      }
      .mobile-gold-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 18px;
        box-shadow: var(--shadow-sm);
        transition: var(--transition);
      }
      .mobile-gold-card:hover {
        border-color: #fbbf24;
      }
      .mobile-gold-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        border-bottom: 1px solid var(--border);
        padding-bottom: 8px;
      }
      .mobile-gold-price-box {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .price-slot {
        background: #f8fafc;
        border: 1px solid var(--border);
        padding: 10px;
        border-radius: var(--radius-sm);
        text-align: center;
      }
      .price-slot.sell {
        background: #fffbeb;
        border-color: #fde68a;
      }
      .price-slot-title {
        font-size: 0.72rem;
        color: var(--text-muted);
        font-weight: 600;
        margin-bottom: 4px;
        display: block;
      }
      .price-slot-value {
        font-size: 1rem;
        font-weight: 800;
        color: var(--text-dark);
      }
      .price-slot.sell .price-slot-value {
        color: #b45309;
      }
      .calc-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 30px;
        box-shadow: var(--shadow-md);
        border-top: 4px solid #fbbf24;
        position: relative;
        overflow: hidden;
      }
      .calc-input {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        background: var(--bg-site);
        color: var(--text-dark);
        font-weight: 700;
        font-size: 1rem;
        transition: var(--transition);
      }
      .calc-input:focus {
        border-color: #fbbf24;
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.15);
      }
      .calc-presets {
        display: flex;
        gap: 8px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .preset-btn {
        background: var(--bg-site);
        border: 1px solid var(--border);
        color: var(--text-dark);
        font-size: 0.78rem;
        font-weight: 700;
        padding: 6px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: var(--transition);
      }
      .preset-btn:hover {
        background: #fffbeb;
        border-color: #fbbf24;
        color: #b45309;
      }
      .calc-result-box {
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(180, 83, 9, 0.05) 100%);
        border: 1px solid rgba(251, 191, 36, 0.20);
        padding: 20px;
        border-radius: var(--radius-md);
        text-align: center;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
      }
      .ai-advice-box {
        background: linear-gradient(135deg, rgba(20, 184, 166, 0.07) 0%, rgba(99, 102, 241, 0.07) 100%);
        border: 1px solid rgba(20, 184, 166, 0.15);
        padding: 24px;
        border-radius: var(--radius-lg);
        margin-bottom: 20px;
      }
    </style>

    <div class="container" style="padding: 40px 20px 0;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.3rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 16px; font-size: 1.05rem; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.6;">${t.subtitle}</p>
      
      <!-- Live Status & Auto-Updating Bar -->
      <div class="live-status-container">
        <div class="live-pill">
          <span class="live-indicator-dot"></span>
          <span id="live-indicator-text">${t.liveBadge}</span>
        </div>
        <div class="live-meta">
          <span id="gold-last-updated-text"><i class="fa-regular fa-clock"></i> ${t.lastUpdate} ${lastUpdateStr}</span>
          <button type="button" id="gold-refresh-btn" class="gold-refresh-btn" onclick="triggerManualGoldRefresh()" title="${t.btnRefresh}">
            <i class="fa-solid fa-arrows-rotate" id="refresh-icon"></i> <span>${t.btnRefresh}</span>
          </button>
        </div>
      </div>

      <!-- Key Highlight Rates -->
      <div class="gold-highlights">
        ${highlightsHtml}
      </div>

      <!-- AI Advice Widget -->
      <div class="ai-advice-box" style="max-width: 1160px; margin-left: auto; margin-right: auto; margin-top: 20px;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-robot" style="color: #0d9488;"></i> ${t.aiTitle}
        </h3>
        <p style="color: var(--text-main); font-size: 0.96rem; line-height: 1.7; margin: 0;">${locale === 'ar' ? advice.ar : advice.en}</p>
      </div>

      <div class="gold-grid">
        
        <!-- Table Column -->
        <div class="glass-card" style="padding: 24px; border-radius: var(--radius-lg);">
          
          <!-- Desktop View Table -->
          <div class="gold-table-container">
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
                  const buyPrice = m.buy.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  const sellPrice = m.sell.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  return `
                    <tr class="gold-row">
                      <td style="display: flex; align-items: center; gap: 12px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
                        <div style="font-size: 1.15rem; color: #d97706; display: flex; align-items: center;"><i class="${m.id === '4' || m.id === '5' ? 'fa-solid fa-coins' : 'fa-solid fa-cubes'}"></i></div>
                        <div>
                          <div style="font-weight: 800; color: var(--text-dark); display: flex; align-items: center; gap: 8px;">
                            <span>${localizedGoldName(m.id, m.name)}</span>
                            ${getKaratBadge(m.id)}
                          </div>
                          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">${m.unit}</div>
                        </div>
                      </td>
                      <td data-gold-id="${m.id}" data-gold-type="buy" style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark);">${buyPrice} ₺</td>
                      <td data-gold-id="${m.id}" data-gold-type="sell" style="font-size: 1.05rem; font-weight: 800; color: #b45309;">${sellPrice} ₺</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile View Cards -->
          <div class="gold-mobile-cards">
            ${metals.map(m => {
              const buyPrice = m.buy.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              const sellPrice = m.sell.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              return `
                <div class="mobile-gold-card">
                  <div class="mobile-gold-card-header" style="direction: ${locale === 'ar' ? 'rtl' : 'ltr'};">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <i class="${m.id === '4' || m.id === '5' ? 'fa-solid fa-coins' : 'fa-solid fa-cubes'}" style="color: #d97706; font-size: 1.05rem;"></i>
                      <span style="font-weight: 800; color: var(--text-dark); font-size: 0.95rem;">${localizedGoldName(m.id, m.name)}</span>
                    </div>
                    ${getKaratBadge(m.id)}
                  </div>
                  <div class="mobile-gold-price-box" style="direction: ${locale === 'ar' ? 'rtl' : 'ltr'};">
                    <div class="price-slot">
                      <span class="price-slot-title">${locale === 'ar' ? 'شراء' : (locale === 'tr' ? 'Alış' : 'Buy')}</span>
                      <span class="price-slot-value" data-gold-id="${m.id}" data-gold-type="buy">${buyPrice} ₺</span>
                    </div>
                    <div class="price-slot sell">
                      <span class="price-slot-title">${locale === 'ar' ? 'بيع' : (locale === 'tr' ? 'Satış' : 'Sell')}</span>
                      <span class="price-slot-value" data-gold-id="${m.id}" data-gold-type="sell">${sellPrice} ₺</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 25px; line-height: 1.6; text-align: center;">${t.textDescription}</p>
        </div>

        <!-- Calculator Column -->
        <div style="display: flex; flex-direction: column; gap: 30px;">
          <div class="calc-card">
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin: 0 0 24px 0; border-bottom: 1px solid var(--border); padding-bottom: 15px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <i class="fa-solid fa-calculator" style="color: #d97706;"></i>
              <span>${t.converterTitle}</span>
            </h3>
            
            <form id="gold-calc-form" onsubmit="event.preventDefault(); calculateGold();" style="direction: ${locale === 'ar' ? 'rtl' : 'ltr'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.weightLabel}</label>
                <input type="number" id="gold-weight" value="10" min="0.01" step="any" class="calc-input" oninput="calculateGold()">
                
                <!-- Quick Preset Weight Buttons -->
                <div class="calc-presets">
                  <button type="button" class="preset-btn" onclick="setWeight(1)">1 ${locale === 'ar' ? 'جرام' : 'g'}</button>
                  <button type="button" class="preset-btn" onclick="setWeight(5)">5 ${locale === 'ar' ? 'جرام' : 'g'}</button>
                  <button type="button" class="preset-btn" onclick="setWeight(10)">10 ${locale === 'ar' ? 'جرام' : 'g'}</button>
                  <button type="button" class="preset-btn" onclick="setWeight(50)">50 ${locale === 'ar' ? 'جرام' : 'g'}</button>
                  <button type="button" class="preset-btn" onclick="setWeight(100)">100 ${locale === 'ar' ? 'جرام' : 'g'}</button>
                </div>
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

              <div class="calc-result-box">
                <div style="font-size: 0.88rem; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">${t.resultLabel}</div>
                <div id="gold-calc-result" style="font-size: 2.1rem; font-weight: 900; color: #b45309; word-break: break-all;">--</div>
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
      const locale = '${locale}';
      let isUpdating = false;

      function setWeight(val) {
        document.getElementById('gold-weight').value = val;
        calculateGold();
      }

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

        const formatter = new Intl.NumberFormat(locale === 'ar' || locale === 'fa' || locale === 'ur' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : (locale === 'ru' ? 'ru-RU' : 'en-US')), {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        });

        document.getElementById('gold-calc-result').textContent = formatter.format(total) + ' TRY';
      }

      async function triggerManualGoldRefresh() {
        await fetchLiveRates(true);
      }

      async function fetchLiveRates(force) {
        if (isUpdating) return;
        isUpdating = true;
        const icon = document.getElementById('refresh-icon');
        if (icon) icon.classList.add('fa-spin');

        try {
          const url = '/api/gold' + (force ? '?refresh=1&t=' : '?t=') + Date.now();
          const res = await fetch(url);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          if (data && data.success && Array.isArray(data.metals) && data.metals.length > 0) {
            updateGoldUi(data.metals, data.updatedAt);
          }
        } catch (err) {
          console.warn('[Auto-update] gold rate fetch error:', err);
        } finally {
          isUpdating = false;
          if (icon) icon.classList.remove('fa-spin');
        }
      }

      function updateGoldUi(metalsList, timestamp) {
        const formatter = new Intl.NumberFormat(locale === 'ar' || locale === 'fa' || locale === 'ur' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : (locale === 'ru' ? 'ru-RU' : 'en-US')), {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        });

        metalsList.forEach(m => {
          goldRates[m.id] = { buy: m.buy, sell: m.sell, name: m.name };

          const buyText = formatter.format(m.buy) + ' ₺';
          const sellText = formatter.format(m.sell) + ' ₺';

          document.querySelectorAll('[data-gold-id="' + m.id + '"]').forEach(el => {
            const type = el.getAttribute('data-gold-type');
            const targetText = type === 'buy' ? buyText : sellText;
            if (el.textContent.trim() !== targetText) {
              el.textContent = targetText;
              el.classList.add('price-flash');
              setTimeout(() => el.classList.remove('price-flash'), 1400);
            }
          });

          document.querySelectorAll('[data-highlight-id="' + m.id + '"]').forEach(el => {
            const type = el.getAttribute('data-highlight-type');
            const targetText = type === 'buy' ? buyText : sellText;
            if (el.textContent.trim() !== targetText) {
              el.textContent = targetText;
              el.classList.add('price-flash');
              setTimeout(() => el.classList.remove('price-flash'), 1400);
            }
          });
        });

        if (timestamp) {
          const dateObj = new Date(timestamp);
          const dateStr = dateObj.toLocaleString(locale === 'ar' || locale === 'fa' || locale === 'ur' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : (locale === 'ru' ? 'ru-RU' : 'en-US')));
          const el = document.getElementById('gold-last-updated-text');
          if (el) el.innerHTML = '<i class="fa-regular fa-clock"></i> ' + '${t.lastUpdate} ' + dateStr;
        }

        calculateGold();
      }

      document.addEventListener('DOMContentLoaded', () => {
        calculateGold();

        // Autonomous Live Polling every 60 seconds
        setInterval(() => {
          fetchLiveRates(false);
        }, 60000);

        // Auto-refresh when visitor switches back to this tab
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            fetchLiveRates(false);
          }
        });
      });
    </script>
  `;

  const seoTitle = locale === 'ar'
    ? 'أسعار الذهب في تركيا اليوم | عيار 24 و 21 والليرة الذهب بالليرة التركية'
    : (locale === 'tr' ? 'Bugün Türkiye Altın Fiyatları | Canlı Altın Ayarları ve Fiyatları' : 'Gold Prices in Turkey Today | Live Gold Karat & Lira Rates');

  c.header('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
  return c.html(renderLayout(c, seoTitle, html, locale));
});
