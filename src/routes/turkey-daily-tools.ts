import { Hono } from 'hono'
import { renderLayout } from './public'
import { generateMetaTags } from '../utils/seo-helper'

export const turkeyDailyToolsRouter = new Hono()

type PrimaryLoc = 'ar' | 'en' | 'tr'
const ALL_LOCALES = ['ar', 'en', 'tr', 'ru', 'fa', 'ur'] as const

function normalizeLocale(raw: string | undefined): { locale: 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur'; lang: PrimaryLoc; isRtl: boolean } {
  const loc = (ALL_LOCALES.includes(raw as any) ? raw : 'ar') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur'
  const lang: PrimaryLoc = loc === 'ar' || loc === 'tr' ? loc : 'en'
  return { locale: loc, lang, isRtl: loc === 'ar' || loc === 'fa' || loc === 'ur' }
}

function buildToolSchemas(lang: PrimaryLoc, slug: string, name: string, description: string, faqs: Array<{ q: string; a: string }>) {
  const url = `https://jobs-in-istanbul.com/${lang}/${slug}`
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    inLanguage: lang,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
    description,
    publisher: { '@id': 'https://jobs-in-istanbul.com/#organization' }
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'ar' ? 'الرئيسية' : lang === 'tr' ? 'Anasayfa' : 'Home', item: `https://jobs-in-istanbul.com/${lang}` },
      { '@type': 'ListItem', position: 2, name, item: url }
    ]
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }
  return `
  <script type="application/ld+json">${JSON.stringify(appSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`
}

function renderFaqAndLinks(lang: PrimaryLoc, faqs: Array<{ q: string; a: string }>, relatedLinks: Array<{ href: string; label: string }>) {
  const faqTitle = lang === 'ar' ? 'الأسئلة الشائعة والدليل العملي 2026' : lang === 'tr' ? 'Sıkça Sorulan Sorular ve 2026 Rehberi' : 'Frequently Asked Questions (2026 Guide)'
  const relTitle = lang === 'ar' ? 'أدوات وروابط مفيدة في إسطنبول' : lang === 'tr' ? 'İstanbul İçin Faydalı Araçlar' : 'More Useful Istanbul Tools'
  return `
    <section class="glass-card" style="padding: 28px; border-radius: 18px; margin-top: 28px; border: 1px solid var(--border);">
      <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-heading); margin: 0 0 18px 0;">${faqTitle}</h2>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${faqs.map(f => `
          <details style="background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;" open>
            <summary style="font-weight: 800; color: var(--text-heading); cursor: pointer; font-size: 0.98rem;">${f.q}</summary>
            <p style="margin: 10px 0 0 0; color: var(--text-body); line-height: 1.75; font-size: 0.94rem;">${f.a}</p>
          </details>
        `).join('')}
      </div>
    </section>

    <section class="glass-card" style="padding: 22px 26px; border-radius: 18px; margin-top: 22px; border: 1px solid var(--border);">
      <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-heading); margin: 0 0 14px 0;">${relTitle}</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        ${relatedLinks.map(l => `<a href="${l.href}" style="padding: 8px 15px; border-radius: 999px; background: var(--bg-subtle); border: 1px solid var(--border); color: var(--primary); font-weight: 700; font-size: 0.86rem; text-decoration: none;">${l.label}</a>`).join('')}
      </div>
    </section>
  `
}

// ============================================================================
// 5. OFFICIAL DIYANET PRAYER TIMES FOR 12 MAJOR TURKISH CITIES (KV + SOLAR FALLBACK)
// ============================================================================
interface PrayerCity {
  key: string
  apiName: string
  ar: string
  tr: string
  en: string
  lat: number
  lon: number
}

const TURKEY_PRAYER_CITIES: PrayerCity[] = [
  { key: 'istanbul', apiName: 'Istanbul', ar: 'إسطنبول', tr: 'İstanbul', en: 'Istanbul', lat: 41.0082, lon: 28.9784 },
  { key: 'ankara', apiName: 'Ankara', ar: 'أنقرة', tr: 'Ankara', en: 'Ankara', lat: 39.9334, lon: 32.8597 },
  { key: 'izmir', apiName: 'Izmir', ar: 'إزمير', tr: 'İzmir', en: 'Izmir', lat: 38.4237, lon: 27.1428 },
  { key: 'bursa', apiName: 'Bursa', ar: 'بورصة', tr: 'Bursa', en: 'Bursa', lat: 40.1885, lon: 29.0610 },
  { key: 'antalya', apiName: 'Antalya', ar: 'أنطاليا', tr: 'Antalya', en: 'Antalya', lat: 36.8969, lon: 30.7133 },
  { key: 'trabzon', apiName: 'Trabzon', ar: 'طرابزون', tr: 'Trabzon', en: 'Trabzon', lat: 41.0027, lon: 39.7168 },
  { key: 'gaziantep', apiName: 'Gaziantep', ar: 'غازي عنتاب', tr: 'Gaziantep', en: 'Gaziantep', lat: 37.0662, lon: 37.3833 },
  { key: 'konya', apiName: 'Konya', ar: 'قونيا', tr: 'Konya', en: 'Konya', lat: 37.8746, lon: 32.4932 },
  { key: 'mersin', apiName: 'Mersin', ar: 'مرسين', tr: 'Mersin', en: 'Mersin', lat: 36.8121, lon: 34.6415 },
  { key: 'adana', apiName: 'Adana', ar: 'أضنة', tr: 'Adana', en: 'Adana', lat: 37.0000, lon: 35.3213 },
  { key: 'kayseri', apiName: 'Kayseri', ar: 'قيصري', tr: 'Kayseri', en: 'Kayseri', lat: 38.7312, lon: 35.4787 },
  { key: 'sakarya', apiName: 'Sakarya', ar: 'سكاريا', tr: 'Sakarya', en: 'Sakarya', lat: 40.7569, lon: 30.3783 }
]

interface PrayerTimingsPayload {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
  hijriDate: string
  source: 'diyanet-api' | 'solar-diyanet'
}

function formatHourMin(hoursFloat: number): string {
  const normalized = ((hoursFloat % 24) + 24) % 24
  const totalMinutes = Math.round(normalized * 60) % (24 * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Pure astronomical Diyanet-compatible fallback (Fajr 18°, Isha 17°, Turkey UTC+3 + Temkin margins)
 * Guarantees instant, seasonally accurate timings even offline or if upstream API times out.
 */
function computeSolarDiyanetFallback(lat: number, lon: number, trDate: Date): PrayerTimingsPayload {
  const startOfYear = Date.UTC(trDate.getUTCFullYear(), 0, 0)
  const dayOfYear = Math.floor((trDate.getTime() - startOfYear) / 86400000)
  const deg2rad = Math.PI / 180
  const rad2deg = 180 / Math.PI

  // Solar declination & equation of time (NOAA approximation)
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1)
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma)
  const eqTimeMin = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma))

  const tz = 3 // Europe/Istanbul is permanently UTC+3
  const solarNoon = 12 + tz - lon / 15 - eqTimeMin / 60
  const latRad = lat * deg2rad

  const hourAngleForAlt = (altDeg: number): number => {
    const cosH = (Math.sin(altDeg * deg2rad) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl))
    const clamped = Math.max(-0.999, Math.min(0.999, cosH))
    return (Math.acos(clamped) * rad2deg) / 15
  }

  const fajrH = hourAngleForAlt(-18)
  const sunriseH = hourAngleForAlt(-0.833)
  const ishaH = hourAngleForAlt(-17)
  const asrAltRad = Math.atan(1 / (1 + Math.tan(Math.abs(latRad - decl))))
  const asrH = hourAngleForAlt(asrAltRad * rad2deg)

  // Apply Diyanet Temkin adjustments (Dhuhr +5m, Maghrib +7m, Sunrise -6m)
  const fajr = solarNoon - fajrH - 2 / 60
  const sunrise = solarNoon - sunriseH - 6 / 60
  const dhuhr = solarNoon + 5 / 60
  const asr = solarNoon + asrH + 4 / 60
  const maghrib = solarNoon + sunriseH + 7 / 60
  const isha = solarNoon + ishaH + 2 / 60

  return {
    Fajr: formatHourMin(fajr),
    Sunrise: formatHourMin(sunrise),
    Dhuhr: formatHourMin(dhuhr),
    Asr: formatHourMin(asr),
    Maghrib: formatHourMin(maghrib),
    Isha: formatHourMin(isha),
    hijriDate: '',
    source: 'solar-diyanet'
  }
}

async function getPrayerTimingsForCity(city: PrayerCity, env: any): Promise<{ timings: PrayerTimingsPayload; isoDate: string; ddmmyyyy: string; trDayOfWeek: number }> {
  const trNow = new Date(Date.now() + 3 * 3600 * 1000)
  const yyyy = trNow.getUTCFullYear()
  const mm = String(trNow.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(trNow.getUTCDate()).padStart(2, '0')
  const isoDate = `${yyyy}-${mm}-${dd}`
  const ddmmyyyy = `${dd}-${mm}-${yyyy}`
  const trDayOfWeek = trNow.getUTCDay() // 5 = Friday

  const kvKey = `kv_prayer_v1_${city.key}_${isoDate}`
  const cacheKv = env?.CACHE_KV
  try {
    if (cacheKv) {
      const cached = await cacheKv.get(kvKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.Fajr && parsed?.Maghrib) {
          return { timings: parsed, isoDate, ddmmyyyy, trDayOfWeek }
        }
      }
    }
  } catch { /* ignore KV error */ }

  const isVitest = typeof process !== 'undefined' && Boolean((process as any)?.env?.VITEST)
  if (!isVitest) {
    try {
      const apiUrl = `https://api.aladhan.com/v1/timingsByCity/${ddmmyyyy}?city=${encodeURIComponent(city.apiName)}&country=Turkey&method=13`
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(2500), headers: { Accept: 'application/json' } })
      if (res.ok) {
        const json: any = await res.json()
        const t = json?.data?.timings
        const h = json?.data?.date?.hijri
        if (t?.Fajr && t?.Sunrise && t?.Dhuhr && t?.Asr && t?.Maghrib && t?.Isha) {
          const cleanTime = (v: string) => String(v).split(' ')[0].trim()
          const hijriStr = h ? `${h.day} ${h.month?.ar || h.month?.en || ''} ${h.year}` : ''
          const payload: PrayerTimingsPayload = {
            Fajr: cleanTime(t.Fajr),
            Sunrise: cleanTime(t.Sunrise),
            Dhuhr: cleanTime(t.Dhuhr),
            Asr: cleanTime(t.Asr),
            Maghrib: cleanTime(t.Maghrib),
            Isha: cleanTime(t.Isha),
            hijriDate: hijriStr,
            source: 'diyanet-api'
          }
          if (cacheKv) {
            cacheKv.put(kvKey, JSON.stringify(payload), { expirationTtl: 21600 }).catch(() => {})
          }
          return { timings: payload, isoDate, ddmmyyyy, trDayOfWeek }
        }
      }
    } catch { /* fall back seamlessly to solar calculator */ }
  }

  return { timings: computeSolarDiyanetFallback(city.lat, city.lon, trNow), isoDate, ddmmyyyy, trDayOfWeek }
}

// Turkish alias -> canonical route
turkeyDailyToolsRouter.get('/:locale/namaz-vakitleri', (c) => {
  const { locale } = normalizeLocale(c.req.param('locale'))
  const qs = c.req.query('city') ? `?city=${encodeURIComponent(c.req.query('city') || '')}` : ''
  return c.redirect(`/${locale}/prayer-times${qs}`, 301)
})

turkeyDailyToolsRouter.get('/:locale/prayer-times', async (c) => {
  const { locale, lang, isRtl } = normalizeLocale(c.req.param('locale'))
  if (!ALL_LOCALES.includes(c.req.param('locale') as any)) return c.redirect('/ar/prayer-times', 301)

  const requestedCity = (c.req.query('city') || 'istanbul').toLowerCase().trim()
  const city = TURKEY_PRAYER_CITIES.find(ct => ct.key === requestedCity) || TURKEY_PRAYER_CITIES[0]
  const { timings, isoDate, trDayOfWeek } = await getPrayerTimingsForCity(city, c.env)
  const cityLabel = city[lang]

  const copy = {
    ar: {
      title: `مواقيت الصلاة في ${city.ar} اليوم 2026 | أوقات الأذان بتوقيت الديانة التركية`,
      desc: `مواقيت الصلاة والأذان في ${city.ar} وتركيا اليوم حسب رئاسة الشؤون الدينية التركية (Diyanet): الفجر ${timings.Fajr}، الظهر ${timings.Dhuhr}، العصر ${timings.Asr}، المغرب ${timings.Maghrib}، العشاء ${timings.Isha} مع عداد تنازلي مباشر.`,
      keywords: `مواقيت الصلاة في اسطنبول اليوم 2026, اوقات الصلاة في ${city.ar}, موعد اذان الفجر في اسطنبول, اذان المغرب اسطنبول اليوم, مواقيت الصلاة الديانة التركية diyanet, اوقات الصلاة في تركيا`,
      h1: `مواقيت الصلاة في ${city.ar} اليوم — بتوقيت الديانة التركية (Diyanet)`,
      sub: 'أوقات الأذان الدقيقة حسب رئاسة الشؤون الدينية التركية مع عداد تنازلي حي للصلاة القادمة بتوقيت إسطنبول (UTC+3)، وتبديل فوري بين 12 مدينة تركية رئيسية.',
      nextLabel: 'الوقت المتبقي على أذان',
      cityPickerLabel: 'اختر المدينة التركية:',
      fridayNote: 'اليوم الجمعة: صلاة الجمعة في مساجد تركيا تُقام عند وقت أذان الظهر الموضح أدناه.',
      sourceBadge: timings.source === 'diyanet-api' ? 'محدّث تلقائياً — رئاسة الشؤون الدينية (Diyanet)' : 'حساب فلكي معتمد وفق معيار الديانة التركية (UTC+3)',
      quranTitle: 'تطبيق القرآن الكريم كاملاً بدون إنترنت',
      quranDesc: 'اقرأ واستمع للقرآن الكريم وتابع أذكارك اليومية في تركيا بدون الحاجة للإنترنت — تطبيقنا المجاني على متجر Google Play.',
      quranBtn: 'تحميل مجاني من Google Play',
      allAppsBtn: 'جميع تطبيقاتنا',
      names: { Fajr: 'الإمساك / الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' }
    },
    tr: {
      title: `${city.tr} Namaz Vakitleri Bugün 2026 | Diyanet Ezan Saatleri ve Geri Sayım`,
      desc: `${city.tr} için bugünkü Diyanet namaz vakitleri: İmsak ${timings.Fajr}, Güneş ${timings.Sunrise}, Öğle ${timings.Dhuhr}, İkindi ${timings.Asr}, Akşam ${timings.Maghrib}, Yatsı ${timings.Isha}. Canlı iftar/ezan geri sayımı.`,
      keywords: `istanbul namaz vakitleri 2026, ${city.tr.toLowerCase()} namaz vakitleri bugün, diyanet ezan saatleri, akşam ezanı saat kaçta, imsak vakti, cuma namazı saati`,
      h1: `${city.tr} Namaz Vakitleri Bugün — Diyanet İşleri Takvimi`,
      sub: 'Diyanet İşleri Başkanlığı hesaplama yöntemine göre güncel ezan vakitleri, canlı sonraki vakit geri sayımı ve Türkiye’nin 12 büyük şehri arasında tek tıkla geçiş.',
      nextLabel: 'Sonraki Vakte Kalan Süre:',
      cityPickerLabel: 'Şehir Seçin:',
      fridayNote: 'Hayırlı Cumalar: Cuma namazı Türkiye genelinde aşağıda yer alan Öğle ezanı vaktinde kılınmaktadır.',
      sourceBadge: timings.source === 'diyanet-api' ? 'Canlı Diyanet Hesaplama Yöntemi (Method 13)' : 'Diyanet Astronomik Hesaplama (UTC+3)',
      quranTitle: 'İnternetsiz Kur’an-ı Kerim Mobil Uygulaması',
      quranDesc: 'Türkiye’de internet bağlantısı olmadan Kur’an-ı Kerim okuyup dinleyebileceğiniz ücretsiz Android uygulamamızı Google Play’den indirin.',
      quranBtn: 'Google Play’den İndir',
      allAppsBtn: 'Tüm Uygulamalarımız',
      names: { Fajr: 'İmsak', Sunrise: 'Güneş', Dhuhr: 'Öğle', Asr: 'İkindi', Maghrib: 'Akşam', Isha: 'Yatsı' }
    },
    en: {
      title: `${city.en} Prayer Times Today 2026 | Official Turkey Diyanet Salah Schedule`,
      desc: `Today's Diyanet prayer times in ${city.en}, Turkey: Fajr ${timings.Fajr}, Sunrise ${timings.Sunrise}, Dhuhr ${timings.Dhuhr}, Asr ${timings.Asr}, Maghrib ${timings.Maghrib}, Isha ${timings.Isha} with live next-adhan countdown.`,
      keywords: `istanbul prayer times today 2026, ${city.en.toLowerCase()} prayer times diyanet, fajr maghrib time turkey, namaz times istanbul, salah schedule turkey`,
      h1: `${city.en} Prayer Times Today — Official Diyanet Method`,
      sub: 'Accurate Turkey Diyanet (Presidency of Religious Affairs) prayer times with a live Istanbul (UTC+3) countdown to the next Adhan across 12 major Turkish cities.',
      nextLabel: 'Time Until Next Adhan:',
      cityPickerLabel: 'Switch Turkish City:',
      fridayNote: 'Jumu’ah Mubarak: Friday congregational prayer in Turkish mosques begins at the Dhuhr time shown below.',
      sourceBadge: timings.source === 'diyanet-api' ? 'Live Diyanet Calculation (Method 13)' : 'Diyanet Astronomical Calculation (UTC+3)',
      quranTitle: 'Free Offline Holy Quran Android App',
      quranDesc: 'Read and listen to the complete Holy Quran offline while commuting in Istanbul or traveling across Turkey.',
      quranBtn: 'Get Free on Google Play',
      allAppsBtn: 'View All Apps',
      names: { Fajr: 'Fajr / Imsak', Sunrise: 'Sunrise', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' }
    }
  }[lang]

  const faqs = lang === 'ar' ? [
    { q: 'هل مواقيت الصلاة هنا مطابقة لتوقيت رئاسة الشؤون الدينية التركية (Diyanet)؟', a: 'نعم، نعتمد معيار رئاسة الشؤون الدينية التركية الرسمي (Method 13) بتوقيت تركيا الدائم (UTC+3) مع مراعاة دقائق التمكين المعتمدة في المساجد التركية.' },
    { q: 'ما هو التوقيت الرسمي المعتمد في إسطنبول وتركيا على مدار العام؟', a: 'تعتمد تركيا التوقيت الصيفي الدائم (UTC+3) طوال السنة دون تغيير للتوقيت الشتوي، ولذلك يحسب العداد التنازلي لدينا الوقت مباشرة حسب توقيت إسطنبول بغض النظر عن جهازك.' },
    { q: 'متى تُقام صلاة الجمعة في مساجد إسطنبول وتركيا؟', a: 'يُرفع أذان الجمعة وتبدأ الخطبة والصلاة مباشرة في وقت أذان الظهر (Öğle) المذكور في الجدول، وتستغرق عادةً نحو 25 إلى 35 دقيقة.' }
  ] : lang === 'tr' ? [
    { q: 'Bu sayfadaki namaz vakitleri Diyanet İşleri Başkanlığı ile uyumlu mu?', a: 'Evet. Vakitler Diyanet İşleri Başkanlığı hesaplama metoduna (Method 13) ve Türkiye saati (UTC+3) temkin kurallarına göre sunulur.' },
    { q: 'İstanbul ve diğer 11 şehir arasında nasıl geçiş yapabilirim?', a: 'Yukarıdaki şehir butonlarından İstanbul, Ankara, İzmir, Bursa, Antalya, Trabzon, Gaziantep, Konya, Mersin, Adana, Kayseri veya Sakarya’yı tek tıkla seçebilirsiniz.' },
    { q: 'Cuma namazı saat kaçta kılınır?', a: 'Türkiye genelinde Cuma namazı ezanı ve hutbesi tablodaki Öğle namazı vaktinde başlar.' }
  ] : [
    { q: 'Do these prayer times match Turkey’s official Diyanet mosques?', a: 'Yes. Timings follow the Presidency of Religious Affairs of Turkey (Diyanet — Method 13) in fixed Turkey Time (TRT, UTC+3).' },
    { q: 'Does Turkey change clocks for Daylight Saving Time?', a: 'No. Turkey stays on UTC+3 permanently all year round, so the live countdown always computes against Istanbul local time.' },
    { q: 'What time is Friday (Jumu’ah) prayer in Istanbul mosques?', a: 'Jumu’ah prayer starts right at the Dhuhr time listed above in all Diyanet mosques across Turkey.' }
  ]

  const metaTags = generateMetaTags(locale, 'insights', {
    slug: 'prayer-times',
    title: copy.title,
    description: copy.desc,
    seoKeywords: copy.keywords,
    availableLocales: ['ar', 'en', 'tr']
  })
  const seoHtml = metaTags + buildToolSchemas(lang, 'prayer-times', copy.h1, copy.desc, faqs)

  const prayerItems = [
    { key: 'Fajr', icon: 'fa-cloud-moon', time: timings.Fajr, color: '#3b82f6' },
    { key: 'Sunrise', icon: 'fa-sun', time: timings.Sunrise, color: '#f59e0b' },
    { key: 'Dhuhr', icon: 'fa-sun', time: timings.Dhuhr, color: '#eab308' },
    { key: 'Asr', icon: 'fa-cloud-sun', time: timings.Asr, color: '#f97316' },
    { key: 'Maghrib', icon: 'fa-moon', time: timings.Maghrib, color: '#e11d48' },
    { key: 'Isha', icon: 'fa-star-and-crescent', time: timings.Isha, color: '#6366f1' }
  ] as const

  const bodyHtml = `
    <style>
      .pr-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
      @media (max-width: 960px) { .pr-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 560px) { .pr-grid { grid-template-columns: repeat(2, 1fr); } }
      .pr-card { background: var(--bg-site); border: 1.5px solid var(--border); border-radius: 16px; padding: 20px 14px; text-align: center; transition: transform 0.2s, border-color 0.2s; }
      .pr-card.is-next { border-color: #10b981; background: linear-gradient(180deg, rgba(16,185,129,0.12), var(--bg-site)); transform: translateY(-2px); box-shadow: 0 10px 24px rgba(16,185,129,0.14); }
      .pr-city-btn { padding: 8px 14px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg-subtle); color: var(--text-heading); font-weight: 700; font-size: 0.86rem; text-decoration: none; transition: all 0.15s; }
      .pr-city-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
    </style>

    <div class="container" style="max-width: 1140px; padding: 34px 20px 72px; direction: ${isRtl ? 'rtl' : 'ltr'};">
      <div style="background: linear-gradient(135deg, #064e3b 0%, #0f766e 55%, #047857 100%); color: #fff; padding: 32px 28px; border-radius: 22px; margin-bottom: 24px;">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;margin-bottom:14px;">
          <span style="background:rgba(255,255,255,0.16);padding:5px 12px;border-radius:999px;font-size:0.8rem;font-weight:700;"><i class="fa-solid fa-mosque"></i> ${copy.sourceBadge}</span>
          <span style="font-size:0.86rem;font-weight:700;color:#d1fae5;"><i class="fa-regular fa-calendar"></i> ${isoDate}${timings.hijriDate ? ` • ${timings.hijriDate}` : ''} • TRT (UTC+3)</span>
        </div>
        <h1 style="margin: 0 0 10px 0; font-size: clamp(1.45rem, 3vw, 2.05rem); font-weight: 900; color: #fff;">${copy.h1}</h1>
        <p style="margin: 0 0 20px 0; color: #d1fae5; max-width: 820px; line-height: 1.7; font-size: 0.96rem;">${copy.sub}</p>

        <div id="prayer-countdown-box" style="background:rgba(0,0,0,0.22);border:1px solid rgba(255,255,255,0.2);border-radius:16px;padding:18px 22px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
          <div>
            <div style="font-size:0.86rem;color:#a7f3d0;font-weight:700;">${copy.nextLabel} <strong id="pr-next-name" style="color:#fff;">--</strong></div>
            <div style="font-size:0.82rem;color:#d1fae5;margin-top:4px;">${cityLabel} • <span id="pr-live-clock">--:--:--</span></div>
          </div>
          <div id="pr-countdown-timer" style="font-size:clamp(1.7rem,4vw,2.4rem);font-weight:900;font-variant-numeric:tabular-nums;letter-spacing:1px;color:#fff;">--:--:--</div>
        </div>
      </div>

      ${trDayOfWeek === 5 ? `<div style="background:#ecfdf5;border:1px solid #6ee7b7;color:#065f46;padding:14px 18px;border-radius:14px;margin-bottom:20px;font-weight:700;font-size:0.92rem;"><i class="fa-solid fa-star-and-crescent"></i> ${copy.fridayNote}</div>` : ''}

      <div class="glass-card" style="padding: 18px 22px; border-radius: 18px; border: 1px solid var(--border); margin-bottom: 22px;">
        <div style="font-weight:800;font-size:0.9rem;color:var(--text-heading);margin-bottom:12px;"><i class="fa-solid fa-location-dot" style="color:var(--primary);"></i> ${copy.cityPickerLabel}</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${TURKEY_PRAYER_CITIES.map(ct => `<a href="/${locale}/prayer-times${ct.key === 'istanbul' ? '' : `?city=${ct.key}`}" class="pr-city-btn${ct.key === city.key ? ' active' : ''}">${ct[lang]}</a>`).join('')}
        </div>
      </div>

      <div class="pr-grid" id="prayer-cards-grid">
        ${prayerItems.map(item => `
          <div class="pr-card" data-prayer-key="${item.key}" data-prayer-time="${item.time}">
            <div style="width:42px;height:42px;border-radius:12px;margin:0 auto 10px;background:${item.color}1a;color:${item.color};display:flex;align-items:center;justify-content:center;font-size:1.15rem;">
              <i class="fa-solid ${item.icon}"></i>
            </div>
            <div style="font-size:0.88rem;font-weight:800;color:var(--text-muted);margin-bottom:6px;">${copy.names[item.key]}</div>
            <div style="font-size:1.55rem;font-weight:900;color:var(--text-heading);font-variant-numeric:tabular-nums;">${item.time}</div>
          </div>
        `).join('')}
      </div>

      <div class="glass-card" style="margin-top:24px;padding:22px 26px;border-radius:18px;border:1px solid var(--border);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;background:linear-gradient(135deg, rgba(16,185,129,0.08), var(--bg-site));">
        <div style="max-width:660px;">
          <div style="font-weight:900;font-size:1.08rem;color:var(--text-heading);margin-bottom:6px;"><i class="fa-solid fa-book-quran" style="color:#059669;"></i> ${copy.quranTitle}</div>
          <p style="margin:0;font-size:0.92rem;color:var(--text-body);line-height:1.65;">${copy.quranDesc}</p>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <a href="https://play.google.com/store/apps/details?id=com.quran.karim.kamel.bidon.net.murtal.tilaat.smart" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding:11px 18px;border-radius:10px;text-decoration:none;font-weight:800;font-size:0.88rem;"><i class="fa-brands fa-google-play"></i> ${copy.quranBtn}</a>
          <a href="/${locale}/apps" style="padding:11px 16px;border-radius:10px;border:1.5px solid var(--border);color:var(--text-heading);text-decoration:none;font-weight:700;font-size:0.88rem;">${copy.allAppsBtn}</a>
        </div>
      </div>

      ${renderFaqAndLinks(lang, faqs, [
        { href: `/${locale}/turkey-holidays`, label: lang === 'ar' ? 'العطل الرسمية في تركيا 2026' : lang === 'tr' ? '2026 Resmi Tatiller' : 'Turkey Public Holidays 2026' },
        { href: `/${locale}/nobetci-eczane`, label: lang === 'ar' ? 'الصيدليات المناوبة في إسطنبول' : lang === 'tr' ? 'İstanbul Nöbetçi Eczaneler' : 'Istanbul Duty Pharmacies' },
        { href: `/${locale}/currency-prices`, label: lang === 'ar' ? 'أسعار العملات اليوم' : lang === 'tr' ? 'Güncel Döviz Kurları' : 'Live Currency Rates' },
        { href: `/${locale}/istanbul-guide-directory`, label: lang === 'ar' ? 'الرموز البريدية وأرقام الطوارئ' : lang === 'tr' ? 'İstanbul Posta Kodları' : 'Istanbul Postal Codes & Hotlines' }
      ])}
    </div>

    <script>
      (function() {
        const prayers = ${JSON.stringify(prayerItems.map(p => ({ key: p.key, name: copy.names[p.key], time: p.time })))};
        function parseMin(hhmm) {
          const parts = String(hhmm).split(':');
          return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
        }
        function tickPrayerCountdown() {
          const trNow = new Date(Date.now() + 3 * 3600 * 1000);
          const hh = trNow.getUTCHours();
          const mm = trNow.getUTCMinutes();
          const ss = trNow.getUTCSeconds();
          const nowSec = hh * 3600 + mm * 60 + ss;
          const clockEl = document.getElementById('pr-live-clock');
          if (clockEl) {
            clockEl.textContent = String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
          }
          let next = prayers[0];
          let diffSec = (parseMin(prayers[0].time) * 60 + 86400) - nowSec;
          for (let i = 0; i < prayers.length; i++) {
            const pSec = parseMin(prayers[i].time) * 60;
            if (pSec > nowSec) {
              next = prayers[i];
              diffSec = pSec - nowSec;
              break;
            }
          }
          const dh = Math.floor(diffSec / 3600);
          const dm = Math.floor((diffSec % 3600) / 60);
          const ds = diffSec % 60;
          const nameEl = document.getElementById('pr-next-name');
          const timerEl = document.getElementById('pr-countdown-timer');
          if (nameEl) nameEl.textContent = next.name + ' (' + next.time + ')';
          if (timerEl) timerEl.textContent = String(dh).padStart(2,'0') + ':' + String(dm).padStart(2,'0') + ':' + String(ds).padStart(2,'0');
          document.querySelectorAll('.pr-card').forEach(function(card) {
            card.classList.toggle('is-next', card.getAttribute('data-prayer-key') === next.key);
          });
        }
        tickPrayerCountdown();
        setInterval(tickPrayerCountdown, 1000);
      })();
    </script>
  `
  c.header('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600')
  c.header('CDN-Cache-Control', 'public, max-age=1800, stale-while-revalidate=3600')
  return c.html(renderLayout(c, copy.title, bodyHtml, locale, seoHtml))
})

// ============================================================================
// 6. TURKEY 2026-2027 OFFICIAL HOLIDAYS, MEB SCHOOLS & HOLIDAY OVERTIME CALCULATOR
// ============================================================================
interface HolidayEntry {
  year: 2026 | 2027 | 'meb'
  dateIso: string
  dateEndIso?: string
  days: string
  ar: string
  tr: string
  en: string
  noteAr: string
  noteTr: string
  noteEn: string
}

const TURKEY_HOLIDAYS_DATA: HolidayEntry[] = [
  // 2026 Official Public Holidays (Türkiye 2429 Sayılı Kanun)
  { year: 2026, dateIso: '2026-01-01', days: '1', ar: 'رأس السنة الميلادية', tr: 'Yılbaşı', en: 'New Year’s Day', noteAr: 'الخميس — البنوك والدوائر الحكومية مغلقة', noteTr: 'Perşembe — Resmi tatil (1 gün)', noteEn: 'Thursday — Banks & govt offices closed' },
  { year: 2026, dateIso: '2026-03-19', dateEndIso: '2026-03-22', days: '3.5', ar: 'عيد الفطر المبارك (Ramazan Bayramı)', tr: 'Ramazan Bayramı (Arefe + 3 Gün)', en: 'Eid al-Fitr (Ramazan Bayramı)', noteAr: 'الوقفة نصف يوم الخميس + الجمعة إلى الأحد', noteTr: '19 Mart Perşembe yarım gün + 20-22 Mart', noteEn: 'Half-day Thu Mar 19 + Fri–Sun Mar 20–22' },
  { year: 2026, dateIso: '2026-04-23', days: '1', ar: 'عيد السيادة الوطنية والطفل', tr: 'Ulusal Egemenlik ve Çocuk Bayramı', en: 'National Sovereignty & Children’s Day', noteAr: 'الخميس — عطلة رسمية كاملة', noteTr: 'Perşembe — Resmi tatil (1 gün)', noteEn: 'Thursday — Official public holiday' },
  { year: 2026, dateIso: '2026-05-01', days: '1', ar: 'عيد العمال والتضامن', tr: 'Emek ve Dayanışma Günü', en: 'Labor & Solidarity Day', noteAr: 'الجمعة — عطلة نهاية أسبوع طويلة (3 أيام)', noteTr: 'Cuma — Hafta sonuyla 3 gün tatil', noteEn: 'Friday — 3-day long weekend' },
  { year: 2026, dateIso: '2026-05-19', days: '1', ar: 'ذكرى أتاتورك وعيد الشباب والرياضة', tr: 'Atatürk’ü Anma, Gençlik ve Spor Bayramı', en: 'Commemoration of Atatürk, Youth & Sports Day', noteAr: 'الثلاثاء — فرصة لجسر إجازة الاثنين', noteTr: 'Salı — Pazartesi izinle 4 gün fırsat', noteEn: 'Tuesday — Bridge-leave opportunity' },
  { year: 2026, dateIso: '2026-05-26', dateEndIso: '2026-05-30', days: '4.5', ar: 'عيد الأضحى المبارك (Kurban Bayramı)', tr: 'Kurban Bayramı (Arefe + 4 Gün)', en: 'Eid al-Adha (Kurban Bayramı)', noteAr: 'الوقفة نصف يوم الثلاثاء 26 مايو + 4 أيام', noteTr: '26 Mayıs Salı Arefe (yarım) + 27-30 Mayıs', noteEn: 'Half-day Tue May 26 + Wed–Sat May 27–30' },
  { year: 2026, dateIso: '2026-07-15', days: '1', ar: 'يوم الديمقراطية والوحدة الوطنية', tr: 'Demokrasi ve Milli Birlik Günü', en: 'Democracy & National Unity Day', noteAr: 'الأربعاء — عطلة رسمية', noteTr: 'Çarşamba — Resmi tatil (1 gün)', noteEn: 'Wednesday — Official public holiday' },
  { year: 2026, dateIso: '2026-08-30', days: '1', ar: 'عيد النصر التركي', tr: 'Zafer Bayramı', en: 'Victory Day', noteAr: 'الأحد — عطلة رسمية وطنية', noteTr: 'Pazar — Resmi tatil', noteEn: 'Sunday — National holiday' },
  { year: 2026, dateIso: '2026-10-28', dateEndIso: '2026-10-29', days: '1.5', ar: 'عيد الجمهورية التركية', tr: 'Cumhuriyet Bayramı (28 Ekim Yarım + 29 Ekim)', en: 'Republic Day (28 Oct Half + 29 Oct)', noteAr: 'الأربعاء نصف يوم بعد 13:00 + الخميس كامل', noteTr: '28 Ekim 13:00 sonrası yarım + 29 Ekim Perşembe', noteEn: 'Half-day Wed from 13:00 + Full Thu Oct 29' },

  // 2027 Official Public Holidays
  { year: 2027, dateIso: '2027-01-01', days: '1', ar: 'رأس السنة الميلادية 2027', tr: 'Yılbaşı 2027', en: 'New Year’s Day 2027', noteAr: 'الجمعة — عطلة نهاية أسبوع طويلة', noteTr: 'Cuma — Hafta sonuyla 3 gün', noteEn: 'Friday — 3-day weekend' },
  { year: 2027, dateIso: '2027-03-08', dateEndIso: '2027-03-11', days: '3.5', ar: 'عيد الفطر المبارك 2027', tr: 'Ramazan Bayramı 2027 (Arefe + 3 Gün)', en: 'Eid al-Fitr 2027', noteAr: 'الإثنين نصف يوم + الثلاثاء إلى الخميس', noteTr: '8 Mart Arefe (yarım) + 9-11 Mart', noteEn: 'Half-day Mon Mar 8 + Tue–Thu Mar 9–11' },
  { year: 2027, dateIso: '2027-04-23', days: '1', ar: 'عيد السيادة الوطنية والطفل 2027', tr: 'Ulusal Egemenlik ve Çocuk Bayramı', en: 'National Sovereignty & Children’s Day', noteAr: 'الجمعة — عطلة 3 أيام مع نهاية الأسبوع', noteTr: 'Cuma — 3 günlük hafta sonu', noteEn: 'Friday — 3-day long weekend' },
  { year: 2027, dateIso: '2027-05-01', days: '1', ar: 'عيد العمال والتضامن 2027', tr: 'Emek ve Dayanışma Günü', en: 'Labor & Solidarity Day', noteAr: 'السبت — عطلة رسمية', noteTr: 'Cumartesi — Resmi tatil', noteEn: 'Saturday — Public holiday' },
  { year: 2027, dateIso: '2027-05-15', dateEndIso: '2027-05-19', days: '4.5', ar: 'عيد الأضحى 2027 + عيد الشباب 19 مايو', tr: 'Kurban Bayramı + 19 Mayıs Gençlik Bayramı', en: 'Eid al-Adha + Youth & Sports Day', noteAr: 'تزامن عيد الأضحى مع 19 مايو (15–19 مايو)', noteTr: '15 Mayıs Arefe + 16-19 Mayıs (19 Mayıs ile birleşiyor)', noteEn: 'Eid al-Adha overlaps with May 19 Youth Day' },
  { year: 2027, dateIso: '2027-07-15', days: '1', ar: 'يوم الديمقراطية والوحدة الوطنية 2027', tr: 'Demokrasi ve Milli Birlik Günü', en: 'Democracy & National Unity Day', noteAr: 'الخميس — عطلة رسمية', noteTr: 'Perşembe — Resmi tatil', noteEn: 'Thursday — Official holiday' },
  { year: 2027, dateIso: '2027-08-30', days: '1', ar: 'عيد النصر التركي 2027', tr: 'Zafer Bayramı', en: 'Victory Day', noteAr: 'الإثنين — عطلة 3 أيام متصلة', noteTr: 'Pazartesi — 3 günlük hafta sonu', noteEn: 'Monday — 3-day long weekend' },
  { year: 2027, dateIso: '2027-10-28', dateEndIso: '2027-10-29', days: '1.5', ar: 'عيد الجمهورية التركية 2027', tr: 'Cumhuriyet Bayramı 2027', en: 'Republic Day 2027', noteAr: 'الخميس نصف يوم + الجمعة كاملة (3.5 أيام)', noteTr: '28 Ekim yarım + 29 Ekim Cuma', noteEn: 'Half-day Thu + Full Fri Oct 29' },

  // MEB School Breaks 2026-2027
  { year: 'meb', dateIso: '2026-09-07', days: '—', ar: 'بداية العام الدراسي التركي (MEB 2026–2027)', tr: '2026-2027 Eğitim Öğretim Yılı Başlangıcı', en: 'MEB 2026–2027 School Year Opening', noteAr: 'بداية الفصل الدراسي الأول في مدارس تركيا', noteTr: '1. Dönem ders zili çalar', noteEn: 'First semester begins across Turkish schools' },
  { year: 'meb', dateIso: '2026-11-09', dateEndIso: '2026-11-13', days: '5', ar: 'العطلة النصفية الأولى للمدارس (1. Ara Tatil)', tr: '1. Dönem Ara Tatili (Kasım)', en: 'First Mid-Term School Break (November)', noteAr: 'أسبوع عطلة للمدارس الابتدائية والإعدادية والثانوية', noteTr: 'İlkokul, ortaokul ve liseler için 1 hafta ara tatil', noteEn: 'One-week autumn school break' },
  { year: 'meb', dateIso: '2027-01-18', dateEndIso: '2027-01-29', days: '14', ar: 'عطلة نصف السنة المدرسية (Sömestr / 15 Tatil)', tr: 'Yarıyıl Tatili (15 Tatil / Sömestr)', en: 'Winter Semester Break (Sömestr)', noteAr: 'عطلة الشتاء لمدة أسبوعين لجميع صفوف MEB', noteTr: '2 haftalık yarıyıl tatili', noteEn: 'Two-week mid-year winter school holiday' },
  { year: 'meb', dateIso: '2027-03-29', dateEndIso: '2027-04-02', days: '5', ar: 'العطلة النصفية الثانية للمدارس (2. Ara Tatil)', tr: '2. Dönem Ara Tatili (Bahar)', en: 'Second Mid-Term School Break (Spring)', noteAr: 'عطلة الربيع المدرسية لوزارة التربية التركية', noteTr: 'Bahar dönemi 1 haftalık ara tatil', noteEn: 'One-week spring school break' },
  { year: 'meb', dateIso: '2027-06-18', days: '—', ar: 'نهاية العام الدراسي وبداية العطلة الصيفية', tr: 'Karne Günü ve Yaz Tatili Başlangıcı', en: 'Last Day of School & Summer Break Start', noteAr: 'توزيع الشهادات (Karne) وبدء عطلة الصيف', noteTr: 'Karnelerin dağıtılması ve yaz tatili', noteEn: 'Report cards & start of summer holidays' }
]

turkeyDailyToolsRouter.get('/:locale/resmi-tatiller', (c) => {
  const { locale } = normalizeLocale(c.req.param('locale'))
  return c.redirect(`/${locale}/turkey-holidays`, 301)
})

turkeyDailyToolsRouter.get('/:locale/turkey-holidays', (c) => {
  const { locale, lang, isRtl } = normalizeLocale(c.req.param('locale'))
  if (!ALL_LOCALES.includes(c.req.param('locale') as any)) return c.redirect('/ar/turkey-holidays', 301)

  const copy = {
    ar: {
      title: 'العطل الرسمية في تركيا 2026 و 2027 | جدول الإجازات وحاسبة أجر العمل في العطلة',
      desc: 'تقويم العطل الرسمية في تركيا 2026–2027 وإجازات المدارس (MEB) مع عداد تنازلي للعيد القادم وحاسبة أجر العمل في العطل الرسمية (+100%) وفق قانون العمل التركي المادة 47.',
      keywords: 'العطل الرسمية في تركيا 2026, اجازات تركيا 2027, عطلة المدارس في تركيا meb, حاسبة اجر العمل في العطلة الرسمية تركيا, قانون العمل التركي المادة 47, هل البنوك مفتوحة اليوم في تركيا',
      h1: 'تقويم العطل الرسمية في تركيا 2026–2027 وحاسبة أجر العمل في العطل',
      sub: 'اعرف متى العطلة الرسمية القادمة في تركيا، مواعيد إغلاق البنوك والدوائر الحكومية، إجازات المدارس التركية (MEB)، واحسب فوراً الأجر الإضافي المستحق لك إذا عملت في يوم عطلة رسمية (+100%).',
      nextHolidayTitle: 'العطلة الرسمية القادمة في تركيا',
      calcTitle: 'حاسبة أجر العمل في العطلة الرسمية (قانون العمل المادة 47)',
      calcSub: 'وفق المادة 47 من قانون العمل التركي رقم 4857، إذا عمل الموظف في يوم عطلة رسمية يستحق أجراً إضافياً كاملاً (+100% فوق راتبه الشهري) عن كل يوم عطلة يعمل فيه.',
      salaryLabel: 'راتبك الشهري (صافي أو إجمالي بالليرة TL)',
      fullDaysLabel: 'عدد أيام العطل الرسمية الكاملة التي عملت بها',
      halfDayLabel: 'هل عملت بعد الساعة 13:00 في يوم الوقفة (Arefe / 28 Ekim)؟ (+0.5 يوم)',
      otHoursLabel: 'ساعات عمل إضافية أخرى (Fazla Mesai — بمعدل 1.5x)',
      resDaily: 'أجرك اليومي الأساسي (الراتب ÷ 30)',
      resHolidayExtra: 'الأجر الإضافي المستحق للعطل الرسمية (+100%)',
      resOtExtra: 'أجر الساعات الإضافية (1.5x)',
      resTotalExtra: 'إجمالي المبلغ الإضافي المستحق فوق الراتب',
      tab2026: 'عطل 2026 الرسمية (15.5 يوم)',
      tab2027: 'عطل 2027 الرسمية (15.5 يوم)',
      tabMeb: 'إجازات المدارس التركية (MEB)'
    },
    tr: {
      title: '2026 ve 2027 Resmi Tatiller Takvimi | MEB Okul Tatilleri ve Bayram Mesaisi Hesaplama',
      desc: '2026-2027 Türkiye resmi tatil günleri, MEB okul ara tatilleri, sonraki tatile geri sayım ve 4857 sayılı İş Kanunu Madde 47 resmi tatil çalışma ücreti hesaplayıcı.',
      keywords: '2026 resmi tatiller, 2027 resmi tatil takvimi, meb okul tatilleri 2026 2027, resmi tatilde çalışma ücreti hesaplama, iş kanunu madde 47 bayram mesaisi',
      h1: '2026–2027 Türkiye Resmi Tatiller, MEB Takvimi ve Bayram Mesaisi Hesaplayıcı',
      sub: 'Bir sonraki resmi tatile kaç gün kaldığını canlı takip edin; 2026-2027 resmi tatilleri ve MEB okul tatillerini inceleyin; resmi tatilde çalıştığınız günler için ek ücretinizi hesaplayın.',
      nextHolidayTitle: 'Sıradaki Resmi Tatil',
      calcTitle: 'Resmi Tatilde Çalışma Ücreti Hesaplayıcı (İş Kanunu Md. 47)',
      calcSub: '4857 sayılı İş Kanunu Madde 47 gereğince ulusal bayram ve genel tatil günlerinde çalışan işçiye, aylık maaşına ek olarak çalıştığı her gün için 1 günlük tam yevmiye (+%100) daha ödenir.',
      salaryLabel: 'Aylık Maaşınız (TL)',
      fullDaysLabel: 'Çalışılan Tam Resmi Tatil Günü Sayısı',
      halfDayLabel: 'Arefe / 28 Ekim 13:00 sonrası çalışıldı (+0.5 gün)',
      otHoursLabel: 'Ek Fazla Mesai Saati (1.5x saatlik ücret)',
      resDaily: 'Günlük Yevmiye (Maaş ÷ 30)',
      resHolidayExtra: 'Resmi Tatil Ek Ücreti (+%100)',
      resOtExtra: 'Fazla Mesai Ücreti (1.5x)',
      resTotalExtra: 'Maaşınıza Eklenecek Toplam Ek Tutar',
      tab2026: '2026 Resmi Tatiller',
      tab2027: '2027 Resmi Tatiller',
      tabMeb: 'MEB Okul Tatilleri'
    },
    en: {
      title: 'Turkey Public Holidays 2026 & 2027 | Official Calendar, MEB Schools & Holiday Pay Calculator',
      desc: 'Complete 2026–2027 Turkey official public holidays calendar, MEB school breaks, live next-holiday countdown, and Labor Law Article 47 holiday overtime pay (+100%) calculator.',
      keywords: 'turkey public holidays 2026, turkey official holidays 2027, meb school holidays turkey, holiday overtime pay calculator turkey, turkish labor law article 47',
      h1: 'Turkey Public Holidays 2026–2027 & Legal Holiday Overtime Pay Calculator',
      sub: 'Track the next official holiday in Turkey, check when banks, Notaries, and Göç İdaresi close, view MEB school dates, and calculate your legally mandated +100% holiday work pay.',
      nextHolidayTitle: 'Next Official Public Holiday in Turkey',
      calcTitle: 'Official Holiday Work Pay Calculator (Labor Law Art. 47)',
      calcSub: 'Under Turkish Labor Law No. 4857 (Article 47), working on an official public holiday entitles you to +100% extra daily pay on top of your regular monthly salary for each holiday day worked.',
      salaryLabel: 'Monthly Salary (TRY)',
      fullDaysLabel: 'Full Official Holiday Days Worked',
      halfDayLabel: 'Worked after 13:00 on Holiday Eve (Arefe / Oct 28)? (+0.5 day)',
      otHoursLabel: 'Additional Overtime Hours (1.5x hourly rate)',
      resDaily: 'Base Daily Rate (Salary ÷ 30)',
      resHolidayExtra: 'Extra Official Holiday Pay (+100%)',
      resOtExtra: 'Extra Overtime Hours Pay (1.5x)',
      resTotalExtra: 'Total Extra Pay Owed Above Monthly Salary',
      tab2026: '2026 Public Holidays',
      tab2027: '2027 Public Holidays',
      tabMeb: 'MEB School Calendar'
    }
  }[lang]

  const faqs = lang === 'ar' ? [
    { q: 'كم يبلغ أجر العمل في أيام العطل الرسمية في تركيا قانونياً؟', a: 'بحسب المادة 47 من قانون العمل التركي رقم 4857، إذا لم يعمل الموظف في العطلة الرسمية يتقاضى راتبه كاملاً، وإذا عمل فيها يستحق أجراً يومياً إضافياً كاملاً (+100%) عن كل يوم عطلة عمل به (أي إجمالي ضعف الأجر اليومي).' },
    { q: 'هل تعمل البنوك ودائرة الهجرة (Göç İdaresi) والكاتب بالعدل في العطل الرسمية؟', a: 'تغلق جميع البنوك، دوائر الهجرة، البلديات، البريد (PTT)، والمدارس الحكومية في العطل الرسمية. أما في أيام الوقفة (Arefe و28 أكتوبر) فتعمل نصف دوام فقط حتى الساعة 13:00 ظهراً.' },
    { q: 'هل إجازات المدارس (MEB) تُعد عطلة رسمية للموظفين في القطاع الخاص؟', a: 'لا، العطل النصفية (Ara Tatil) وعطلة منتصف العام (Sömestr) خاصة بالطلاب والمدارس فقط، بينما يستمر عمل الشركات والبنوك والدوائر الرسمية بشكل طبيعي خلالها.' }
  ] : lang === 'tr' ? [
    { q: 'Resmi tatilde çalışan işçi ne kadar ek ücret alır?', a: '4857 sayılı İş Kanunu Madde 47 uyarınca, resmi tatilde çalışan işçiye normal aylık ücretine ek olarak çalıştığı her tatil günü için bir tam günlük ücret (+%100) daha ödenir.' },
    { q: 'Arefe günü ve 28 Ekim saat kaçta resmi tatil başlar?', a: 'Ramazan ve Kurban Bayramı arefeleri ile 28 Ekim günü saat 13:00 itibarıyla resmi tatil başlar. 13:00 sonrası çalışma yarım gün resmi tatil mesaisi (0.5 yevmiye) doğurur.' },
    { q: 'Resmi tatillerde bankalar, noterler ve devlet daireleri açık mı?', a: 'Hayır; bankalar, noterler (nöbetçi noterler hariç), PTT şubeleri, Göç İdaresi ve tüm kamu kurumları resmi tatillerde kapalıdır.' }
  ] : [
    { q: 'How is working on a Turkish public holiday paid by law?', a: 'Under Article 47 of Turkish Labor Law No. 4857, employees who work on a national or religious public holiday must receive an additional 100% of their daily wage for each holiday day worked (on top of their regular monthly salary).' },
    { q: 'Are banks, Notaries, and Göç İdaresi closed on public holidays?', a: 'Yes. All Turkish banks, immigration offices (Göç İdaresi), tax offices, municipalities, and PTT branches close on official public holidays, and close at 13:00 on half-day eves (Arefe and Oct 28).' },
    { q: 'How many official public holidays does Turkey have per year?', a: 'Turkey observes 15.5 official public holiday days annually across New Year’s Day, National Sovereignty Day, Labor Day, Youth Day, Democracy Day, Victory Day, Republic Day, Eid al-Fitr, and Eid al-Adha.' }
  ]

  const metaTags = generateMetaTags(locale, 'insights', {
    slug: 'turkey-holidays',
    title: copy.title,
    description: copy.desc,
    seoKeywords: copy.keywords,
    availableLocales: ['ar', 'en', 'tr']
  })
  const seoHtml = metaTags + buildToolSchemas(lang, 'turkey-holidays', copy.h1, copy.desc, faqs)

  const bodyHtml = `
    <style>
      .hol-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
      @media (max-width: 880px) { .hol-grid { grid-template-columns: 1fr; } }
      .hol-input { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-site); color: var(--text-heading); font-size: 0.96rem; font-weight: 700; }
      .hol-tab { padding: 10px 18px; border-radius: 999px; border: 1.5px solid var(--border); background: var(--bg-subtle); color: var(--text-heading); font-weight: 800; font-size: 0.88rem; cursor: pointer; }
      .hol-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }
      .hol-table { width: 100%; border-collapse: collapse; }
      .hol-table th, .hol-table td { padding: 13px 14px; border-bottom: 1px solid var(--border); text-align: ${isRtl ? 'right' : 'left'}; font-size: 0.92rem; }
      .hol-table th { background: var(--bg-subtle); color: var(--text-heading); font-weight: 800; }
    </style>

    <div class="container" style="max-width: 1180px; padding: 34px 20px 72px; direction: ${isRtl ? 'rtl' : 'ltr'};">
      <div style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 55%, #b91c1c 100%); color: #fff; padding: 32px 28px; border-radius: 22px; margin-bottom: 24px;">
        <h1 style="margin: 0 0 10px 0; font-size: clamp(1.45rem, 3vw, 2.05rem); font-weight: 900; color: #fff;">${copy.h1}</h1>
        <p style="margin: 0 0 20px 0; color: #fee2e2; max-width: 840px; line-height: 1.7; font-size: 0.96rem;">${copy.sub}</p>

        <div style="background:rgba(0,0,0,0.22);border:1px solid rgba(255,255,255,0.2);border-radius:16px;padding:18px 22px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;">
          <div>
            <div style="font-size:0.84rem;color:#fecaca;font-weight:700;"><i class="fa-solid fa-calendar-check"></i> ${copy.nextHolidayTitle}</div>
            <div id="hol-next-name" style="font-size:1.25rem;font-weight:900;color:#fff;margin-top:4px;">--</div>
            <div id="hol-next-date" style="font-size:0.86rem;color:#fee2e2;margin-top:2px;">--</div>
          </div>
          <div style="text-align:center;background:rgba(255,255,255,0.14);padding:12px 20px;border-radius:14px;">
            <div id="hol-next-days" style="font-size:2rem;font-weight:900;line-height:1;">--</div>
            <div style="font-size:0.78rem;font-weight:700;color:#fee2e2;margin-top:4px;">${lang === 'ar' ? 'يوم متبقي' : lang === 'tr' ? 'Gün Kaldı' : 'Days Left'}</div>
          </div>
        </div>
      </div>

      <section class="glass-card" style="padding: 26px; border-radius: 18px; border: 1px solid var(--border); margin-bottom: 26px;">
        <h2 style="margin: 0 0 8px 0; font-size: 1.25rem; font-weight: 900; color: var(--text-heading);"><i class="fa-solid fa-calculator" style="color:var(--primary);"></i> ${copy.calcTitle}</h2>
        <p style="margin: 0 0 20px 0; font-size: 0.92rem; color: var(--text-muted); line-height: 1.65;">${copy.calcSub}</p>

        <div class="hol-grid">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div>
              <label for="hol-salary" style="display:block;font-weight:800;font-size:0.88rem;color:var(--text-heading);margin-bottom:6px;">${copy.salaryLabel}</label>
              <input id="hol-salary" type="number" class="hol-input" value="35000" min="1000" step="500" oninput="calcHolidayPay()">
            </div>
            <div>
              <label for="hol-days" style="display:block;font-weight:800;font-size:0.88rem;color:var(--text-heading);margin-bottom:6px;">${copy.fullDaysLabel}</label>
              <input id="hol-days" type="number" class="hol-input" value="2" min="0" max="15" step="1" oninput="calcHolidayPay()">
            </div>
            <label style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;background:var(--bg-subtle);border:1px solid var(--border);cursor:pointer;font-weight:700;font-size:0.88rem;color:var(--text-heading);">
              <input id="hol-half" type="checkbox" style="width:18px;height:18px;" onchange="calcHolidayPay()">
              <span>${copy.halfDayLabel}</span>
            </label>
            <div>
              <label for="hol-ot" style="display:block;font-weight:800;font-size:0.88rem;color:var(--text-heading);margin-bottom:6px;">${copy.otHoursLabel}</label>
              <input id="hol-ot" type="number" class="hol-input" value="0" min="0" max="120" step="1" oninput="calcHolidayPay()">
            </div>
          </div>

          <div style="background:var(--bg-subtle);border:1.5px solid var(--border);border-radius:16px;padding:22px;display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--border);">
              <span style="font-size:0.9rem;color:var(--text-body);font-weight:700;">${copy.resDaily}</span>
              <strong id="hol-out-daily" style="font-size:1.1rem;color:var(--text-heading);">--</strong>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--border);">
              <span style="font-size:0.9rem;color:var(--text-body);font-weight:700;">${copy.resHolidayExtra}</span>
              <strong id="hol-out-holiday" style="font-size:1.15rem;color:#059669;">--</strong>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--border);">
              <span style="font-size:0.9rem;color:var(--text-body);font-weight:700;">${copy.resOtExtra}</span>
              <strong id="hol-out-ot" style="font-size:1.1rem;color:#2563eb;">--</strong>
            </div>
            <div style="background:linear-gradient(135deg,#059669,#047857);color:#fff;padding:18px;border-radius:14px;text-align:center;">
              <div style="font-size:0.84rem;color:#d1fae5;font-weight:700;margin-bottom:4px;">${copy.resTotalExtra}</div>
              <div id="hol-out-total" style="font-size:1.85rem;font-weight:900;">--</div>
            </div>
          </div>
        </div>
      </section>

      <section class="glass-card" style="padding: 24px; border-radius: 18px; border: 1px solid var(--border);">
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;">
          <button type="button" class="hol-tab active" data-tab="2026" onclick="switchHolidayTab('2026', this)">${copy.tab2026}</button>
          <button type="button" class="hol-tab" data-tab="2027" onclick="switchHolidayTab('2027', this)">${copy.tab2027}</button>
          <button type="button" class="hol-tab" data-tab="meb" onclick="switchHolidayTab('meb', this)">${copy.tabMeb}</button>
        </div>

        <div style="overflow-x:auto;">
          <table class="hol-table">
            <thead>
              <tr>
                <th>${lang === 'ar' ? 'المناسبة / العطلة' : lang === 'tr' ? 'Tatil Adı' : 'Holiday / Break'}</th>
                <th>${lang === 'ar' ? 'التاريخ' : lang === 'tr' ? 'Tarih' : 'Date'}</th>
                <th>${lang === 'ar' ? 'المدة' : lang === 'tr' ? 'Süre' : 'Days'}</th>
                <th>${lang === 'ar' ? 'ملاحظات الدوام والبنوك' : lang === 'tr' ? 'Gün ve Notlar' : 'Day & Notes'}</th>
              </tr>
            </thead>
            <tbody id="hol-table-body">
              ${TURKEY_HOLIDAYS_DATA.map(h => `
                <tr class="hol-row" data-year="${h.year}" style="${h.year === 2026 ? '' : 'display:none;'}">
                  <td style="font-weight:800;color:var(--text-heading);">${h[lang]}</td>
                  <td style="font-weight:700;color:var(--primary);white-space:nowrap;">${h.dateIso}${h.dateEndIso ? ` → ${h.dateEndIso}` : ''}</td>
                  <td><span style="padding:3px 10px;border-radius:999px;background:var(--bg-subtle);border:1px solid var(--border);font-weight:800;font-size:0.82rem;">${h.days}</span></td>
                  <td style="color:var(--text-body);">${lang === 'ar' ? h.noteAr : lang === 'tr' ? h.noteTr : h.noteEn}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      ${renderFaqAndLinks(lang, faqs, [
        { href: `/${locale}/salary-calculator-2026`, label: lang === 'ar' ? 'حاسبة الراتب الصافي والإجمالي 2026' : lang === 'tr' ? '2026 Netten Brüte Maaş' : '2026 Salary Calculator' },
        { href: `/${locale}/kidem-tazminati-hesaplama`, label: lang === 'ar' ? 'حاسبة تعويض نهاية الخدمة' : lang === 'tr' ? 'Kıdem Tazminatı Hesaplama' : 'Severance Pay Calculator' },
        { href: `/${locale}/dilekce-generator`, label: lang === 'ar' ? 'مولّد خطاب الإجازة والاستقالة PDF' : lang === 'tr' ? 'Resmi Dilekçe Oluşturucu' : 'Official Turkish Dilekçe Studio' },
        { href: `/${locale}/prayer-times`, label: lang === 'ar' ? 'مواقيت الصلاة في تركيا اليوم' : lang === 'tr' ? 'Diyanet Namaz Vakitleri' : 'Turkey Prayer Times' }
      ])}
    </div>

    <script>
      const PUBLIC_HOLIDAYS = ${JSON.stringify(TURKEY_HOLIDAYS_DATA.filter(h => h.year !== 'meb').map(h => ({ date: h.dateIso, end: h.dateEndIso || h.dateIso, name: h[lang], days: h.days })))};
      function fmtTL(n) { return Math.round(n).toLocaleString('tr-TR') + ' TL'; }
      function calcHolidayPay() {
        const salary = Math.max(0, parseFloat(document.getElementById('hol-salary').value) || 0);
        const fullDays = Math.max(0, parseFloat(document.getElementById('hol-days').value) || 0);
        const halfDay = document.getElementById('hol-half').checked ? 0.5 : 0;
        const otHours = Math.max(0, parseFloat(document.getElementById('hol-ot').value) || 0);
        const daily = salary / 30;
        const hourly = salary / 225;
        const holidayExtra = daily * (fullDays + halfDay);
        const otExtra = hourly * 1.5 * otHours;
        const total = holidayExtra + otExtra;
        document.getElementById('hol-out-daily').textContent = fmtTL(daily);
        document.getElementById('hol-out-holiday').textContent = fmtTL(holidayExtra);
        document.getElementById('hol-out-ot').textContent = fmtTL(otExtra);
        document.getElementById('hol-out-total').textContent = fmtTL(total);
      }
      function switchHolidayTab(tab, btn) {
        document.querySelectorAll('.hol-tab').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        document.querySelectorAll('.hol-row').forEach(r => {
          r.style.display = r.getAttribute('data-year') === String(tab) ? '' : 'none';
        });
      }
      function updateNextHoliday() {
        const trNow = new Date(Date.now() + 3 * 3600 * 1000);
        const todayIso = trNow.toISOString().slice(0, 10);
        const upcoming = PUBLIC_HOLIDAYS.find(h => h.end >= todayIso) || PUBLIC_HOLIDAYS[PUBLIC_HOLIDAYS.length - 1];
        if (!upcoming) return;
        const startMs = Date.parse(upcoming.date + 'T00:00:00Z');
        const todayMs = Date.parse(todayIso + 'T00:00:00Z');
        const diffDays = Math.max(0, Math.round((startMs - todayMs) / 86400000));
        document.getElementById('hol-next-name').textContent = upcoming.name;
        document.getElementById('hol-next-date').textContent = upcoming.date + (upcoming.end !== upcoming.date ? ' → ' + upcoming.end : '') + ' (' + upcoming.days + ')';
        document.getElementById('hol-next-days').textContent = String(diffDays);
      }
      document.addEventListener('DOMContentLoaded', function() {
        calcHolidayPay();
        updateNextHoliday();
      });
    </script>
  `
  c.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400')
  c.header('CDN-Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  return c.html(renderLayout(c, copy.title, bodyHtml, locale, seoHtml))
})

// ============================================================================
// 7. ISTANBUL 39 DISTRICTS POSTAL CODES (POSTA KODU) & TURKEY EMERGENCY HOTLINES
// ============================================================================
interface IstanbulDistrictDirectoryItem {
  slug: string // Exact match with ISTANBUL_DISTRICTS in public.ts
  tr: string
  ar: string
  en: string
  side: 'eu' | 'as'
  postalCode: string
  neighborhoods: string
  transit: string
}

const ISTANBUL_39_DIRECTORY: IstanbulDistrictDirectoryItem[] = [
  { slug: 'adalar', tr: 'Adalar', ar: 'جزر الأمراء', en: 'Adalar (Princes’ Islands)', side: 'as', postalCode: '34970', neighborhoods: 'Büyükada, Heybeliada, Burgazada, Kınalıada', transit: 'Şehir Hatları Ferry' },
  { slug: 'arnavutkoy', tr: 'Arnavutköy', ar: 'أرناؤوط كوي', en: 'Arnavutköy', side: 'eu', postalCode: '34275', neighborhoods: 'Hadımköy, Taşoluk, Bolluca, Istanbul Airport (IST)', transit: 'M11 Airport Metro, İETT' },
  { slug: 'atasehir', tr: 'Ataşehir', ar: 'أتاشهير', en: 'Ataşehir', side: 'as', postalCode: '34750', neighborhoods: 'Batı Ataşehir, İçerenköy, Kayışdağı, Küçükbakkalköy', transit: 'M8 Metro, M4 Kozyatağı' },
  { slug: 'avcilar', tr: 'Avcılar', ar: 'أفجلار', en: 'Avcılar', side: 'eu', postalCode: '34310', neighborhoods: 'Cihangir, Ambarlı, Denizköşkler, Firuzköy, Parseller', transit: 'Metrobüs (Avcılar / İÜC)' },
  { slug: 'bagcilar', tr: 'Bağcılar', ar: 'باغجيلار', en: 'Bağcılar', side: 'eu', postalCode: '34200', neighborhoods: 'Güneşli, Kirazlı, Mahmutbey, Meydan, Yüzyıl', transit: 'M1B, M3, M7, T1 Tram' },
  { slug: 'bahcelievler', tr: 'Bahçelievler', ar: 'باهتشلي إيفلر', en: 'Bahçelievler', side: 'eu', postalCode: '34180', neighborhoods: 'Şirinevler, Yenibosna, Soğanlı, Yayla, Kocasinan', transit: 'M1A, M9, Metrobüs' },
  { slug: 'bakirkoy', tr: 'Bakırköy', ar: 'باكركوي', en: 'Bakırköy', side: 'eu', postalCode: '34140', neighborhoods: 'Florya, Ataköy, Yeşilköy, Zuhuratbaba, Kartaltepe', transit: 'Marmaray, M3, M9, İDO' },
  { slug: 'basaksehir', tr: 'Başakşehir', ar: 'باشاك شهير', en: 'Başakşehir', side: 'eu', postalCode: '34480', neighborhoods: 'Kayaşehir, Bahçeşehir, Başak, İkitelli OSB, Ziya Gökalp', transit: 'M3 Metro, M9 Olimpiyat' },
  { slug: 'bayrampase', tr: 'Bayrampaşa', ar: 'بايرام باشا', en: 'Bayrampaşa', side: 'eu', postalCode: '34040', neighborhoods: 'Kocatepe, Yıldırım, Muratpaşa, Terazidere, Otogar', transit: 'M1A / M1B, T4 Tram' },
  { slug: 'besiktas', tr: 'Beşiktaş', ar: 'بشيكتاش', en: 'Beşiktaş', side: 'eu', postalCode: '34353', neighborhoods: 'Levent, Etiler, Ortaköy, Bebek, Gayrettepe, Yıldız', transit: 'M2, M7, Metrobüs, Ferry' },
  { slug: 'beykoz', tr: 'Beykoz', ar: 'بيكوز', en: 'Beykoz', side: 'as', postalCode: '34820', neighborhoods: 'Kavacık, Kanlıca, Acarkent, Paşabahçe, Çubuklu', transit: 'Ferry, İETT Express' },
  { slug: 'beylikduzu', tr: 'Beylikdüzü', ar: 'بيليك دوزو', en: 'Beylikdüzü', side: 'eu', postalCode: '34520', neighborhoods: 'Adnan Kahveci, Barış, Büyükşehir, Yakuplu, Gürpınar', transit: 'Metrobüs (Beylikdüzü)' },
  { slug: 'beyoglu', tr: 'Beyoğlu', ar: 'بي أوغلو (تقسيم)', en: 'Beyoğlu (Taksim)', side: 'eu', postalCode: '34430', neighborhoods: 'Taksim, Karaköy, Galata, Cihangir, İstiklal, Kasımpaşa', transit: 'M2 Metro, T1, T2, F1/F2' },
  { slug: 'buyukcekmece', tr: 'Büyükçekmece', ar: 'بويوك تشكمجة', en: 'Büyükçekmece', side: 'eu', postalCode: '34500', neighborhoods: 'Mimaroba, Sinanoba, Kumburgaz, Alkent, Tepecik', transit: 'Metrobüs (TÜYAP), İETT' },
  { slug: 'catalca', tr: 'Çatalca', ar: 'تشاتالجا', en: 'Çatalca', side: 'eu', postalCode: '34540', neighborhoods: 'Ferhatpaşa, Kaleiçi, Çakıl, Subaşı', transit: 'İETT Intercity Buses' },
  { slug: 'cekmekoy', tr: 'Çekmeköy', ar: 'تشيكمه كوي', en: 'Çekmeköy', side: 'as', postalCode: '34782', neighborhoods: 'Mimar Sinan, Taşdelen, Madenler, Alemdağ', transit: 'M5 Üsküdar–Samandıra Metro' },
  { slug: 'esenler', tr: 'Esenler', ar: 'إيسنلر', en: 'Esenler', side: 'eu', postalCode: '34220', neighborhoods: 'Dörtyol, Atışalanı, Tuna, Menderes, Tekstilkent', transit: 'M1B, M7 Metro' },
  { slug: 'esenyurt', tr: 'Esenyurt', ar: 'إسنيورت', en: 'Esenyurt', side: 'eu', postalCode: '34510', neighborhoods: 'Cumhuriyet, Mehterçeşme, Kıraç, Pınar, Yeşilkent, Meydan', transit: 'Metrobüs (Haramidere/Beylikdüzü)' },
  { slug: 'eyupsultan', tr: 'Eyüpsultan', ar: 'أيوب سلطان', en: 'Eyüpsultan', side: 'eu', postalCode: '34050', neighborhoods: 'Göktürk, Kemerburgaz, Alibeyköy, Rami, Yeşilpınar', transit: 'T5 Tram, M7, M11, Cable Car' },
  { slug: 'fatih', tr: 'Fatih', ar: 'الفاتح', en: 'Fatih', side: 'eu', postalCode: '34080', neighborhoods: 'Aksaray, Yusufpaşa, Fındıkzade, Laleli, Sultanahmet, Balat, Eminönü', transit: 'T1 Tram, M1, M2, Marmaray' },
  { slug: 'gaziosmanpasa', tr: 'Gaziosmanpaşa', ar: 'غازي عثمان باشا', en: 'Gaziosmanpaşa', side: 'eu', postalCode: '34245', neighborhoods: 'Karadeniz, Küçükköy, Merkez, Yıldıztabya, Barbaros', transit: 'T4 Tram, M7 Metro' },
  { slug: 'gungoren', tr: 'Güngören', ar: 'غونغورين', en: 'Güngören', side: 'eu', postalCode: '34160', neighborhoods: 'Merter, Haznedar, Güneştepe, Tozkoparan, Kale Center', transit: 'T1 Tram, M1A, Metrobüs' },
  { slug: 'kadikoy', tr: 'Kadıköy', ar: 'كاديكوي', en: 'Kadıköy', side: 'as', postalCode: '34710', neighborhoods: 'Moda, Bağdat Caddesi, Bostancı, Göztepe, Fikirtepe, Kozyatağı', transit: 'M4, M8, Marmaray, Metrobüs, Ferry' },
  { slug: 'kagithane', tr: 'Kağıthane', ar: 'كاغد خانة', en: 'Kağıthane', side: 'eu', postalCode: '34406', neighborhoods: 'Çağlayan, Gültepe, Seyrantepe, Hamidiye, Merkez, Sanayi', transit: 'M7, M11 Airport Metro' },
  { slug: 'kartal', tr: 'Kartal', ar: 'كارتال', en: 'Kartal', side: 'as', postalCode: '34860', neighborhoods: 'Soğanlık, Cevizli, Yakacık, Uğur Mumcu, Kordonboyu', transit: 'M4 Metro, Marmaray' },
  { slug: 'kucukcekmece', tr: 'Küçükçekmece', ar: 'كوتشوك تشكمجة', en: 'Küçükçekmece', side: 'eu', postalCode: '34290', neighborhoods: 'Halkalı, Sefaköy, Atakent, Cennet, Kanarya, İnönü', transit: 'Marmaray, Metrobüs, M9' },
  { slug: 'maltepe', tr: 'Maltepe', ar: 'مالتبة', en: 'Maltepe', side: 'as', postalCode: '34840', neighborhoods: 'Küçükyalı, İdealtepe, Cevizli, Altayçeşme, Zümrütevler', transit: 'M4 Metro, Marmaray' },
  { slug: 'pendik', tr: 'Pendik', ar: 'بينديك', en: 'Pendik', side: 'as', postalCode: '34890', neighborhoods: 'Kurtköy, Sabiha Gökçen (SAW), Kaynarca, Batı, Yenişehir', transit: 'M4 Airport Metro, Marmaray, YHT' },
  { slug: 'sancaktepe', tr: 'Sancaktepe', ar: 'سانجاك تبه', en: 'Sancaktepe', side: 'as', postalCode: '34785', neighborhoods: 'Sarıgazi, Samandıra, Yenidoğan, Abdurrahmangazi', transit: 'M5 Metro (Samandıra)' },
  { slug: 'sariyer', tr: 'Sarıyer', ar: 'ساريير (مسلك)', en: 'Sarıyer (Maslak)', side: 'eu', postalCode: '34450', neighborhoods: 'Maslak, İstinye, Tarabya, Zekeriyaköy, Emirgan, Ayazağa', transit: 'M2 Metro (Hacıosman/İTÜ)' },
  { slug: 'silivri', tr: 'Silivri', ar: 'سيليفري', en: 'Silivri', side: 'eu', postalCode: '34570', neighborhoods: 'Selimpaşa, Mimar Sinan, Piri Mehmet Paşa, Gümüşyaka', transit: 'İETT 303 / Silivri Bus' },
  { slug: 'sultanbeyli', tr: 'Sultanbeyli', ar: 'سلطان بيلي', en: 'Sultanbeyli', side: 'as', postalCode: '34920', neighborhoods: 'Abdurrahmangazi, Fatih, Mehmet Akif, Hasanpaşa', transit: 'TEM Express Buses' },
  { slug: 'sultangazi', tr: 'Sultangazi', ar: 'سلطان غازي', en: 'Sultangazi', side: 'eu', postalCode: '34260', neighborhoods: 'Cebeci, 50. Yıl, Esentepe, İsmetpaşa, Gazi', transit: 'T4 Topkapı–Mescid-i Selam Tram' },
  { slug: 'sile', tr: 'Şile', ar: 'شيله', en: 'Şile', side: 'as', postalCode: '34980', neighborhoods: 'Ağva, Balibey, Çavuş, Kumbaba', transit: 'İETT 139 / 139A' },
  { slug: 'sisli', tr: 'Şişli', ar: 'شيشلي', en: 'Şişli', side: 'eu', postalCode: '34360', neighborhoods: 'Mecidiyeköy, Nişantaşı, Osmanbey, Bomonti, Fulya, Esentepe', transit: 'M2, M7, Metrobüs' },
  { slug: 'tuzla', tr: 'Tuzla', ar: 'توزلا', en: 'Tuzla', side: 'as', postalCode: '34940', neighborhoods: 'İçmeler, Aydınlı, Yayla, Postane, Tuzla OSB', transit: 'Marmaray (Tuzla / İçmeler)' },
  { slug: 'umraniye', tr: 'Ümraniye', ar: 'عمرانية', en: 'Ümraniye', side: 'as', postalCode: '34760', neighborhoods: 'Çarşı, Çakmak, Şerifali, Dudullu OSB, Yamanevler, Tepeüstü', transit: 'M5, M8 Metro' },
  { slug: 'uskudar', tr: 'Üsküdar', ar: 'أوسكودار', en: 'Üsküdar', side: 'as', postalCode: '34660', neighborhoods: 'Altunizade, Çengelköy, Kuzguncuk, Acıbadem, Beylerbeyi', transit: 'Marmaray, M5, Metrobüs, Ferry' },
  { slug: 'zeytinburnu', tr: 'Zeytinburnu', ar: 'زيتون بورنو', en: 'Zeytinburnu', side: 'eu', postalCode: '34020', neighborhoods: 'Cevizlibağ, Merter, Kazlıçeşme, Beştelsiz, Gökalp, Sümer', transit: 'M1A, T1 Tram, Marmaray, Metrobüs' }
]

const TURKEY_HOTLINES = [
  { num: '112', color: '#dc2626', ar: 'الطوارئ الموحدة (إسعاف، شرطة، إطفاء، كوارث)', tr: 'Tek Acil Çağrı (Ambulans, Polis, İtfaiye, AFAD)', en: 'Unified Emergency (Ambulance, Police, Fire, AFAD)', badgeAr: 'مجاني 24/7', badgeTr: 'Ücretsiz 7/24', badgeEn: 'Free 24/7' },
  { num: '157', color: '#0284c7', ar: 'مركز يمر YİMER (الهجرة والأجانب — يدعم العربية)', tr: 'YİMER (Yabancılar İletişim Merkezi — 7 Dil)', en: 'YİMER Foreigners & Immigration Center (Arabic/EN)', badgeAr: 'يدعم العربية 24/7', badgeTr: 'Arapça / İngilizce', badgeEn: 'Arabic & English' },
  { num: '170', color: '#059669', ar: 'ALO 170 وزارة العمل والضمان (SGK وشكاوى الرواتب)', tr: 'ALO 170 Çalışma Bakanlığı & SGK İhbar Hattı', en: 'ALO 170 Ministry of Labor & SGK Helpline', badgeAr: 'حقوق العمال', badgeTr: 'İşçi Hakları', badgeEn: 'Labor & SGK' },
  { num: '182', color: '#7c3aed', ar: 'MHRS حجز مواعيد المشافي الحكومية التركية', tr: 'MHRS Merkezi Hekim Randevu Sistemi', en: 'MHRS Public Hospital Appointment Hotline', badgeAr: 'مواعيد طبية', badgeTr: 'Hastane Randevu', badgeEn: 'Medical Booking' },
  { num: '153', color: '#2563eb', ar: 'الخط الأبيض بلدية إسطنبول (كرت إسطنبول، المواصلات)', tr: 'İBB Çözüm Merkezi 153 (Ulaşım & İstanbulkart)', en: 'IBB Istanbul Municipality (Transit & Services)', badgeAr: 'بلدية إسطنبول', badgeTr: 'İBB 7/24', badgeEn: 'Istanbul City' },
  { num: '199', color: '#0f766e', ar: 'مديرية النفوس وتثبيت العنوان والمواعيد', tr: 'ALO 199 Nüfus ve Vatandaşlık İşleri', en: 'ALO 199 Civil Registry & Address Registration', badgeAr: 'تثبيت عنوان', badgeTr: 'Adres / Kimlik', badgeEn: 'Address & ID' },
  { num: '187', color: '#ea580c', ar: 'طوارئ الغاز الطبيعي (İGDAŞ) في حال تسرب غاز', tr: 'ALO 187 Doğalgaz Acil Arıza (İGDAŞ)', en: 'ALO 187 Natural Gas Leak Emergency (İGDAŞ)', badgeAr: 'تسرب غاز', badgeTr: 'Gaz Acil', badgeEn: 'Gas Emergency' },
  { num: '185', color: '#0369a1', ar: 'أعطال المياه والصرف الصحي إسطنبول (İSKİ)', tr: 'ALO 185 İSKİ Su ve Kanalizasyon Arıza', en: 'ALO 185 İSKİ Water & Sewage Faults', badgeAr: 'أعطال مياه', badgeTr: 'İSKİ Su', badgeEn: 'Water Service' },
  { num: '186', color: '#ca8a04', ar: 'أعطال الكهرباء في إسطنبول (BEDAŞ / AYEDAŞ)', tr: 'ALO 186 Elektrik Arıza Hattı', en: 'ALO 186 Electricity Outage Hotline', badgeAr: 'أعطال كهرباء', badgeTr: 'Elektrik', badgeEn: 'Power Outage' },
  { num: '175', color: '#4f46e5', ar: 'حماية المستهلك (شكاوى الأسعار والتسوق)', tr: 'ALO 175 Tüketici Danışma Hattı', en: 'ALO 175 Consumer Protection Hotline', badgeAr: 'حماية مستهلك', badgeTr: 'Tüketici', badgeEn: 'Consumer Rights' }
]

turkeyDailyToolsRouter.get('/:locale/istanbul-posta-kodu', (c) => {
  const { locale } = normalizeLocale(c.req.param('locale'))
  return c.redirect(`/${locale}/istanbul-guide-directory`, 301)
})

turkeyDailyToolsRouter.get('/:locale/istanbul-guide-directory', (c) => {
  const { locale, lang, isRtl } = normalizeLocale(c.req.param('locale'))
  if (!ALL_LOCALES.includes(c.req.param('locale') as any)) return c.redirect('/ar/istanbul-guide-directory', 301)

  const copy = {
    ar: {
      title: 'الرمز البريدي لأحياء إسطنبول الـ 39 وأرقام الطوارئ في تركيا 2026 (Posta Kodu)',
      desc: 'دليل الرموز البريدية الرسمي (Posta Kodu) لجميع مناطق إسطنبول الـ 39 (الفاتح، إسنيورت، باشاك شهير، شيشلي، بيليك دوزو، كاديكوي...) مع زر نسخ فوري، روابط الوظائف، وأرقام الطوارئ والخدمات العربية في تركيا (112، 157 YİMER، 170).',
      keywords: 'الرمز البريدي اسطنبول, الرمز البريدي الفاتح اسنيورت باشاك شهير, posta kodu istanbul 2026, ارقام الطوارئ في تركيا بالعربي, رقم يمر 157, رقم وزارة العمل 170, دليل أحياء إسطنبول الـ 39',
      h1: 'دليل الرموز البريدية لأحياء إسطنبول الـ 39 وأرقام الطوارئ الرسمية في تركيا',
      sub: 'ابحث فوراً بالاسم العربي أو التركي أو بالحي أو الرمز البريدي للعثور على الـ Posta Kodu الدقيق وخطوط المواصلات والوظائف القريبة، وتصفح أرقام الطوارئ والخدمات الرسمية بنقرة اتصال مباشرة.',
      searchPlaceholder: 'ابحث باسم المنطقة أو الحي أو الرمز (مثال: الفاتح، إسنيورت، Taksim، 34080)...',
      allBtn: 'الكل (39 منطقة)',
      euBtn: 'الجانب الأوروبي (25)',
      asBtn: 'الجانب الآسيوي (14)',
      copyCode: 'نسخ الرمز',
      jobsBtn: 'وظائف المنطقة',
      hotlinesTitle: 'أرقام الطوارئ والخدمات الحكومية في تركيا (مع دعم العربية)',
      hotlinesSub: 'اضغط على أي رقم للاتصال المباشر من هاتفك المحمول — جميع الأرقام رسمية ومعتمدة في عموم تركيا.',
      callNow: 'اتصال مباشر',
      copiedAlert: 'تم نسخ الرمز البريدي:'
    },
    tr: {
      title: 'İstanbul 39 İlçe Posta Kodları 2026 ve Türkiye Acil Telefon Numaraları Rehberi',
      desc: 'İstanbul Avrupa ve Anadolu yakası 39 ilçenin tamamı için güncel 5 haneli PTT posta kodları, ulaşım hatları, ilçe iş ilanları ve 112, YİMER 157, ALO 170 resmi acil hatları.',
      keywords: 'istanbul posta kodları 2026, istanbul 39 ilçe posta kodu, fatih esenyurt başakşehir kadıköy posta kodu, türkiye acil telefon numaraları 112, alo 170, yimer 157',
      h1: 'İstanbul 39 İlçe Posta Kodları ve Türkiye Resmi Acil Numaralar Rehberi',
      sub: 'İlçe, semt veya posta kodu yazarak İstanbul’un 39 ilçesinin 5 haneli PTT posta kodunu, raylı sistem hatlarını ve o ilçedeki iş ilanlarını anında bulun.',
      searchPlaceholder: 'İlçe, semt veya posta kodu ara (örn: Fatih, Kadıköy, Maslak, 34480)...',
      allBtn: 'Tümü (39 İlçe)',
      euBtn: 'Avrupa Yakası (25)',
      asBtn: 'Anadolu Yakası (14)',
      copyCode: 'Kodu Kopyala',
      jobsBtn: 'İlçe İş İlanları',
      hotlinesTitle: 'Türkiye Resmi Acil ve Kamu İletişim Hatları',
      hotlinesSub: 'Mobilde tek dokunuşla arama yapabilirsiniz — tüm numaralar Türkiye Cumhuriyeti resmi hatlarıdır.',
      callNow: 'Hemen Ara',
      copiedAlert: 'Posta kodu kopyalandı:'
    },
    en: {
      title: 'Istanbul All 39 Districts Postal Codes (Posta Kodu) & Turkey Emergency Numbers 2026',
      desc: 'Instant search for official 5-digit PTT postal codes across all 39 European & Anatolian Istanbul districts, transit lines, district job links, plus Turkey emergency hotlines (112, YİMER 157, ALO 170).',
      keywords: 'istanbul postal codes 2026, istanbul zip code finder, fatih esenyurt sisli kadikoy postal code, turkey emergency numbers 112, yimer 157 english, alo 170 labor hotline',
      h1: 'Istanbul 39 Districts Postal Code Finder (Posta Kodu) & Turkey Hotlines',
      sub: 'Search by district, neighborhood (Taksim, Maslak, Aksaray, Kayaşehir), or 5-digit zip code to copy official Istanbul postal codes, check Metro/Metrobus access, and tap official Turkish emergency hotlines.',
      searchPlaceholder: 'Search district, neighborhood, or zip code (e.g. Fatih, Sisli, Taksim, 34080)...',
      allBtn: 'All 39 Districts',
      euBtn: 'European Side (25)',
      asBtn: 'Anatolian Side (14)',
      copyCode: 'Copy Zip',
      jobsBtn: 'District Jobs',
      hotlinesTitle: 'Official Turkey Emergency & Support Hotlines',
      hotlinesSub: 'Tap any hotline number to dial directly from your phone — official national services across Türkiye.',
      callNow: 'Call Now',
      copiedAlert: 'Copied postal code:'
    }
  }[lang]

  const faqs = lang === 'ar' ? [
    { q: 'ما هو الرمز البريدي العام لمدينة إسطنبول؟', a: 'تبدأ جميع الرموز البريدية في ولاية إسطنبول بالرقم 34 (رقم لوحة الولاية)، ويستخدم الرمز 34000 كرمز عام للمدينة، لكن عند التسوق الإلكتروني أو تثبيت العنوان أو معاملات البنك يُفضل إدخال الرمز البريدي الدقيق لمنطقتك (مثل 34080 للفاتح أو 34510 لإسنيورت أو 34480 لباشاك شهير).' },
    { q: 'كيف أتواصل مع دائرة الهجرة أو وزارة العمل التركية باللغة العربية؟', a: 'لجميع استفسارات الإقامة والكملك والمواعيد اتصل على مركز YİMER على الرقم 157 (يدعم اللغة العربية على مدار الساعة). ولشكاوى الرواتب المتأخرة أو عدم تسجيل الضمان الاجتماعي (SGK) اتصل على ALO 170.' },
    { q: 'هل توجد أرقام منفصلة للشرطة والإسعاف والإطفاء في تركيا؟', a: 'تم توحيد جميع خطوط الطوارئ في تركيا تحت الرقم الواحد المجاني 112 (الشرطة 155، الإسعاف 112، الإطفاء 110، الدرك 156، والكوارث AFAD كلها تُحوَّل فوراً عبر 112).' }
  ] : lang === 'tr' ? [
    { q: 'İstanbul’un genel posta kodu nedir?', a: 'İstanbul ilinin tüm posta kodları plaka kodu olan 34 ile başlar (genel kod 34000). Kargo, e-ticaret, banka ve resmi adres bildirimlerinde yukarıdaki tablodan ilçenize ait 5 haneli kodu kullanmanız önerilir.' },
    { q: 'Polis, ambulans ve itfaiye için hangi numara aranır?', a: 'Türkiye genelinde Polis, Jandarma, Ambulans, İtfaiye ve AFAD acil çağrılarının tamamı tek numara olan 112 Acil Çağrı Merkezi’nde birleştirilmiştir.' },
    { q: 'İşveren maaşımı ödemezse veya sigortasız çalıştırırsa nereyi aramalıyım?', a: 'Çalışma ve Sosyal Güvenlik İletişim Merkezi ALO 170 hattını 7/24 arayarak ücretsiz ihbar ve şikayet kaydı oluşturabilirsiniz.' }
  ] : [
    { q: 'What is Istanbul’s zip / postal code format?', a: 'Every Istanbul postal code is 5 digits starting with 34 (Istanbul’s province code). While 34000 is the citywide fallback, online shopping, couriers, banks, and residence forms work best with your exact district postal code from the table above.' },
    { q: 'Is there an English or Arabic immigration helpline in Turkey?', a: 'Yes — dial 157 (YİMER, Foreigners Communication Center) 24/7 for free multilingual support in English, Arabic, Turkish, Russian, Persian, and German regarding residence permits and official procedures.' },
    { q: 'What is the single emergency phone number in Turkey?', a: 'Dial 112 anywhere in Turkey for Ambulance, Police, Fire Brigade, Gendarmerie, and AFAD disaster response.' }
  ]

  const metaTags = generateMetaTags(locale, 'insights', {
    slug: 'istanbul-guide-directory',
    title: copy.title,
    description: copy.desc,
    seoKeywords: copy.keywords,
    availableLocales: ['ar', 'en', 'tr']
  })
  const seoHtml = metaTags + buildToolSchemas(lang, 'istanbul-guide-directory', copy.h1, copy.desc, faqs)

  const bodyHtml = `
    <style>
      .pk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      @media (max-width: 980px) { .pk-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 620px) { .pk-grid { grid-template-columns: 1fr; } }
      .pk-card { background: var(--bg-site); border: 1.5px solid var(--border); border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
      .pk-filter-btn { padding: 9px 16px; border-radius: 999px; border: 1.5px solid var(--border); background: var(--bg-subtle); color: var(--text-heading); font-weight: 800; font-size: 0.85rem; cursor: pointer; }
      .pk-filter-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
      .hot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
      @media (max-width: 720px) { .hot-grid { grid-template-columns: 1fr; } }
    </style>

    <div class="container" style="max-width: 1200px; padding: 34px 20px 72px; direction: ${isRtl ? 'rtl' : 'ltr'};">
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 55%, #1d4ed8 100%); color: #fff; padding: 32px 28px; border-radius: 22px; margin-bottom: 24px;">
        <h1 style="margin: 0 0 10px 0; font-size: clamp(1.45rem, 3vw, 2.05rem); font-weight: 900; color: #fff;">${copy.h1}</h1>
        <p style="margin: 0; color: #e0e7ff; max-width: 840px; line-height: 1.7; font-size: 0.96rem;">${copy.sub}</p>
      </div>

      <section class="glass-card" style="padding: 22px; border-radius: 18px; border: 1px solid var(--border); margin-bottom: 24px;">
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <input id="pk-search" type="search" placeholder="${copy.searchPlaceholder}" oninput="filterPostalCodes()" style="flex:1;min-width:260px;padding:12px 16px;border:1.5px solid var(--border);border-radius:12px;background:var(--bg-site);color:var(--text-heading);font-size:0.95rem;font-weight:600;">
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <button type="button" class="pk-filter-btn active" data-side="all" onclick="setPostalSide('all', this)">${copy.allBtn}</button>
            <button type="button" class="pk-filter-btn" data-side="eu" onclick="setPostalSide('eu', this)">${copy.euBtn}</button>
            <button type="button" class="pk-filter-btn" data-side="as" onclick="setPostalSide('as', this)">${copy.asBtn}</button>
          </div>
        </div>
        <div id="pk-count-bar" style="font-size:0.86rem;font-weight:700;color:var(--text-muted);margin-bottom:14px;">39 / 39</div>

        <div class="pk-grid" id="pk-cards-grid">
          ${ISTANBUL_39_DIRECTORY.map(d => {
            const sideBadge = d.side === 'eu'
              ? (lang === 'ar' ? 'أوروبي' : lang === 'tr' ? 'Avrupa' : 'Europe')
              : (lang === 'ar' ? 'آسيوي' : lang === 'tr' ? 'Anadolu' : 'Asia')
            const sideBg = d.side === 'eu' ? '#dbeafe' : '#fef3c7'
            const sideColor = d.side === 'eu' ? '#1e40af' : '#92400e'
            const searchBlob = `${d.tr} ${d.ar} ${d.en} ${d.postalCode} ${d.neighborhoods} ${d.transit}`.toLowerCase()
            return `
              <article class="pk-card" data-side="${d.side}" data-search="${searchBlob.replace(/"/g, '&quot;')}">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
                    <div>
                      <h2 style="margin:0;font-size:1.05rem;font-weight:900;color:var(--text-heading);">${lang === 'ar' ? `${d.ar} (${d.tr})` : lang === 'tr' ? d.tr : `${d.en}`}</h2>
                      <span style="display:inline-block;margin-top:4px;padding:2px 9px;border-radius:999px;font-size:0.74rem;font-weight:800;background:${sideBg};color:${sideColor};">${sideBadge}</span>
                    </div>
                    <span style="font-size:1.2rem;font-weight:900;color:var(--primary);background:var(--bg-subtle);border:1px solid var(--border);padding:4px 11px;border-radius:10px;font-variant-numeric:tabular-nums;">${d.postalCode}</span>
                  </div>
                  <div style="font-size:0.82rem;color:var(--text-body);line-height:1.55;margin-bottom:6px;"><i class="fa-solid fa-map-pin" style="color:var(--text-muted);"></i> ${d.neighborhoods}</div>
                  <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600;"><i class="fa-solid fa-train-subway" style="color:#059669;"></i> ${d.transit}</div>
                </div>
                <div style="display:flex;gap:8px;padding-top:10px;border-top:1px solid var(--border);">
                  <button type="button" onclick="copyZipCode('${d.postalCode}')" style="flex:1;padding:7px 10px;border-radius:9px;border:1px solid var(--border);background:var(--bg-subtle);color:var(--text-heading);font-weight:700;font-size:0.8rem;cursor:pointer;"><i class="fa-regular fa-copy"></i> ${copy.copyCode}</button>
                  <a href="/${locale}/district/${d.slug}" style="flex:1;padding:7px 10px;border-radius:9px;background:var(--primary);color:#fff;font-weight:700;font-size:0.8rem;text-decoration:none;text-align:center;"><i class="fa-solid fa-briefcase"></i> ${copy.jobsBtn}</a>
                </div>
              </article>
            `
          }).join('')}
        </div>
      </section>

      <section class="glass-card" style="padding: 26px; border-radius: 18px; border: 1px solid var(--border);">
        <h2 style="margin: 0 0 8px 0; font-size: 1.3rem; font-weight: 900; color: var(--text-heading);"><i class="fa-solid fa-phone-volume" style="color:#dc2626;"></i> ${copy.hotlinesTitle}</h2>
        <p style="margin: 0 0 20px 0; font-size: 0.92rem; color: var(--text-muted);">${copy.hotlinesSub}</p>
        <div class="hot-grid">
          ${TURKEY_HOTLINES.map(h => `
            <div style="background:var(--bg-site);border:1.5px solid var(--border);border-radius:14px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:14px;">
              <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
                  <span style="font-size:1.35rem;font-weight:900;color:${h.color};font-variant-numeric:tabular-nums;">${h.num}</span>
                  <span style="padding:2px 9px;border-radius:999px;font-size:0.74rem;font-weight:800;background:${h.color}18;color:${h.color};">${lang === 'ar' ? h.badgeAr : lang === 'tr' ? h.badgeTr : h.badgeEn}</span>
                </div>
                <div style="font-size:0.88rem;font-weight:700;color:var(--text-heading);line-height:1.5;">${h[lang]}</div>
              </div>
              <a href="tel:${h.num}" style="flex-shrink:0;padding:9px 14px;border-radius:10px;background:${h.color};color:#fff;font-weight:800;font-size:0.82rem;text-decoration:none;white-space:nowrap;"><i class="fa-solid fa-phone"></i> ${copy.callNow}</a>
            </div>
          `).join('')}
        </div>
      </section>

      ${renderFaqAndLinks(lang, faqs, [
        { href: `/${locale}/istanbulkart-calculator`, label: lang === 'ar' ? 'حاسبة كرت إسطنبول والمواصلات 2026' : lang === 'tr' ? 'İstanbulkart Maliyet Hesaplama' : 'Istanbulkart Fare Calculator' },
        { href: `/${locale}/ikamet-calculator`, label: lang === 'ar' ? 'حاسبة تكاليف الإقامة في تركيا' : lang === 'tr' ? 'İkamet İzni Maliyet Hesaplama' : 'Residence Permit Calculator' },
        { href: `/${locale}/nobetci-eczane`, label: lang === 'ar' ? 'الصيدليات المناوبة في إسطنبول' : lang === 'tr' ? 'İstanbul Nöbetçi Eczaneler' : 'Istanbul Duty Pharmacies' },
        { href: `/${locale}/imei-calculator`, label: lang === 'ar' ? 'حاسبة تتريك الهاتف IMEI 2026' : lang === 'tr' ? 'IMEI Kayıt ve 120 Gün Hesaplama' : 'Turkey IMEI & 120-Day Tracker' }
      ])}
    </div>

    <div id="pk-toast" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:10px 20px;border-radius:999px;font-weight:800;font-size:0.88rem;display:none;z-index:9999;box-shadow:0 10px 25px rgba(0,0,0,0.25);"></div>

    <script>
      let activePostalSide = 'all';
      function setPostalSide(side, btn) {
        activePostalSide = side;
        document.querySelectorAll('.pk-filter-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        filterPostalCodes();
      }
      function filterPostalCodes() {
        const q = (document.getElementById('pk-search').value || '').trim().toLowerCase();
        let shown = 0;
        document.querySelectorAll('.pk-card').forEach(card => {
          const sideOk = activePostalSide === 'all' || card.getAttribute('data-side') === activePostalSide;
          const textOk = !q || (card.getAttribute('data-search') || '').includes(q);
          const visible = sideOk && textOk;
          card.style.display = visible ? '' : 'none';
          if (visible) shown++;
        });
        const bar = document.getElementById('pk-count-bar');
        if (bar) bar.textContent = shown + ' / 39';
      }
      function copyZipCode(code) {
        const msg = ${JSON.stringify(copy.copiedAlert)} + ' ' + code;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).catch(() => {});
        }
        const t = document.getElementById('pk-toast');
        if (t) {
          t.textContent = msg;
          t.style.display = 'block';
          clearTimeout(window.__pkTimer);
          window.__pkTimer = setTimeout(() => { t.style.display = 'none'; }, 2200);
        }
      }
    </script>
  `
  c.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400')
  c.header('CDN-Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  return c.html(renderLayout(c, copy.title, bodyHtml, locale, seoHtml))
})
