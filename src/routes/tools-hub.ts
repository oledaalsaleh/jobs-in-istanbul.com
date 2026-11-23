import { Hono } from 'hono'
import { renderLayout } from './public'
import { generateMetaTags } from '../utils/seo-helper'

export const toolsHubRouter = new Hono()

type PrimaryLoc = 'ar' | 'en' | 'tr'
const ALL_LOCALES = ['ar', 'en', 'tr', 'ru', 'fa', 'ur'] as const

type ToolCategory = 'work' | 'living' | 'daily' | 'ai'

interface HubToolItem {
  slug: string
  category: ToolCategory
  icon: string
  accent: string
  isNew?: boolean
  ar: { title: string; desc: string; tag: string }
  tr: { title: string; desc: string; tag: string }
  en: { title: string; desc: string; tag: string }
}

export const ALL_PORTAL_TOOLS: HubToolItem[] = [
  // --- Category 1: Work, Salary & Legal ---
  {
    slug: 'dilekce-generator',
    category: 'work',
    icon: 'fa-file-signature',
    accent: '#2563eb',
    isNew: true,
    ar: { title: 'مولّد الخطابات والطلبات التركية الرسمية (Dilekçe PDF)', desc: 'أنشئ خطاب استقالة، إجازة سنوية، شهادة عمل وراتب، أو إخلاء شقة بالتركية القانونية مع ترجمة فورية وتصدير PDF.', tag: 'نماذج PDF' },
    tr: { title: 'Resmi İstifa, İzin ve Kira Dilekçesi Oluşturucu (PDF)', desc: '4857 sayılı İş Kanunu uyumlu resmi dilekçe şablonlarını saniyeler içinde oluşturun ve A4 PDF yazdırın.', tag: 'PDF Şablon' },
    en: { title: 'Official Turkish Work & Lease Letter Studio (Dilekçe)', desc: 'Create legally formatted Turkish resignation, annual leave, salary certificate & lease letters with translation & PDF.', tag: 'PDF Studio' }
  },
  {
    slug: 'salary-calculator-2026',
    category: 'work',
    icon: 'fa-calculator',
    accent: '#ec4899',
    ar: { title: 'حاسبة صافي الأجور وضرائب SGK لعام 2026', desc: 'حوّل الراتب من الإجمالي إلى الصافي (Brüt ↔ Net) بدقة وفق شرائح ضريبة الدخل والضمان التركي 2026.', tag: 'رواتب 2026' },
    tr: { title: '2026 Netten Brüte & Brütten Nete Maaş Hesaplama', desc: '2026 güncel vergi dilimleri, SGK kesintileri ve işveren maliyeti dahil anlık maaş hesaplayıcı.', tag: 'Maaş 2026' },
    en: { title: '2026 Turkey Net-to-Gross Salary & SGK Calculator', desc: 'Convert gross to net salary across 2026 Turkish income tax brackets, SGK deductions, and employer costs.', tag: '2026 Tax' }
  },
  {
    slug: 'kidem-tazminati-hesaplama',
    category: 'work',
    icon: 'fa-scale-balanced',
    accent: '#059669',
    ar: { title: 'حاسبة تعويض نهاية الخدمة وبدل الإشعار (Kıdem)', desc: 'احسب تعويض نهاية الخدمة وبدل الإشعار وفق السقف الرسمي المحدّث لقانون العمل التركي 2026.', tag: 'قانون العمل' },
    tr: { title: 'Kıdem ve İhbar Tazminatı Hesaplama 2026', desc: '2026 güncel kıdem tazminatı tavanı ve damga vergisi kesintisi ile hak ettiğiniz tazminatı hesaplayın.', tag: 'Tazminat' },
    en: { title: 'Turkish Severance & Notice Pay Calculator (Kıdem)', desc: 'Compute exact severance (Kıdem) and notice pay (İhbar) using the official 2026 legal ceiling.', tag: 'Labor Law' }
  },
  {
    slug: 'turkey-holidays',
    category: 'work',
    icon: 'fa-calendar-days',
    accent: '#dc2626',
    isNew: true,
    ar: { title: 'العطل الرسمية في تركيا 2026–2027 وحاسبة أجر العطلة', desc: 'جدول الأعياد وإجازات المدارس MEB مع عداد للعيد القادم وحاسبة أجر العمل في العطلة (+100% المادة 47).', tag: 'المادة 47' },
    tr: { title: '2026–2027 Resmi Tatiller, MEB ve Bayram Mesaisi', desc: 'Resmi tatil geri sayımı, okul ara tatilleri ve İş Kanunu Madde 47 (+%100) mesai ücreti hesaplayıcı.', tag: 'Resmi Tatil' },
    en: { title: 'Turkey Public Holidays 2026–2027 & Holiday Pay Calc', desc: 'Official Turkish public holiday calendar, MEB school breaks, countdown, and Art. 47 (+100%) overtime calculator.', tag: 'Holidays' }
  },
  {
    slug: 'work-permit-eligibility',
    category: 'work',
    icon: 'fa-clipboard-check',
    accent: '#0ea5e9',
    ar: { title: 'فاحص وحاسبة أهلية إذن العمل التركي 2026', desc: 'تحقق من أهليتك للحصول على إذن العمل في تركيا وشروط الـ 5 أتراك والحد الأدنى للرواتب للأجانب.', tag: 'إذن عمل' },
    tr: { title: 'Yabancılar İçin Çalışma İzni Uygunluk Sihirbazı 2026', desc: '5 Türk çalışan şartı, sermaye kriteri ve 2026 maaş katsayılarına göre çalışma izni uygunluğunu test edin.', tag: 'Çalışma İzni' },
    en: { title: 'Turkish Work Permit Eligibility Wizard 2026', desc: 'Check eligibility for a Turkish work permit (Çalışma İzni), salary multiples, and 5-Turkish-staff quotas.', tag: 'Work Permit' }
  },
  {
    slug: 'investor-calculator',
    category: 'work',
    icon: 'fa-building-user',
    accent: '#6366f1',
    ar: { title: 'حاسبة تأسيس الشركات وتوظيف الأجانب للمستثمرين', desc: 'قدّر تكاليف تأسيس شركة محدودة أو شخصية في إسطنبول ومصاريف المحاسب الشهري وتأمين الموظفين.', tag: 'استثمار' },
    tr: { title: 'Şirket Kuruluş ve Yabancı İstihdam Maliyet Hesaplayıcı', desc: 'Limited / Şahıs şirketi kuruluş giderleri, mali müşavir ve çalışan SGK maliyetlerini anında tahmin edin.', tag: 'Girişimci' },
    en: { title: 'Investor Company Setup & Hiring Cost Estimator', desc: 'Estimate Istanbul LLC/sole proprietorship setup costs, CPA fees, and employee SGK expenses.', tag: 'Business' }
  },
  {
    slug: 'workplace-quiz',
    category: 'work',
    icon: 'fa-graduation-cap',
    accent: '#0284c7',
    ar: { title: 'اختبار مصطلحات ولغة العمل التركية التفاعلي', desc: 'اختبر مستواك وتعلم أهم الجمل والمصطلحات التركية المستخدمة يومياً في الشركات والمقابلات.', tag: 'تعلم التركية' },
    tr: { title: 'İş Yeri Türkçesi ve Mesleki Terimler Testi', desc: 'İş hayatında ve mülakatlarda en sık kullanılan Türkçe terimleri etkileşimli quiz ile pekiştirin.', tag: 'Dil Testi' },
    en: { title: 'Workplace Turkish Vocabulary & Interview Quiz', desc: 'Practice essential Turkish workplace terms and office phrases for job interviews in Istanbul.', tag: 'Language' }
  },

  // --- Category 2: Living & Residence in Istanbul / Turkey ---
  {
    slug: 'ikamet-calculator',
    category: 'living',
    icon: 'fa-passport',
    accent: '#7c3aed',
    isNew: true,
    ar: { title: 'حاسبة تكاليف الإقامة والتأمين الصحي في تركيا 2026', desc: 'احسب رسوم الإقامة السياحية أو العائلية أو الطلابية وسعر التأمين الصحي حسب عمرك بالليرة والدولار.', tag: 'إقامة 2026' },
    tr: { title: '2026 İkamet İzni Harç ve Sağlık Sigortası Hesaplama', desc: 'Kısa dönem, aile ve öğrenci ikamet kart bedeli, harçlar ve yaş grubuna göre sigorta tutarını hesaplayın.', tag: 'İkamet' },
    en: { title: '2026 Turkey Residence Permit (İkamet) Cost Estimator', desc: 'Calculate Tourist, Family & Student Ikamet card fees, visa fees, and age-bracket health insurance in TRY & USD.', tag: 'İkamet' }
  },
  {
    slug: 'istanbulkart-calculator',
    category: 'living',
    icon: 'fa-train-subway',
    accent: '#0284c7',
    isNew: true,
    ar: { title: 'حاسبة أسعار كرت إسطنبول ومقارنة اشتراك Mavi Kart', desc: 'احسب مصروف المترو والمتروبوس ومرمراي والباص والتحويلات واكتشف كم يوفر لك الاشتراك الشهري.', tag: 'مواصلات' },
    tr: { title: '2026 İstanbulkart ve Aylık Mavi Kart Hesaplama', desc: 'Metro, otobüs, metrobüs, Marmaray ve aktarma giderlerinizi hesaplayıp Mavi Kart tasarrufunu görün.', tag: 'Ulaşım' },
    en: { title: '2026 Istanbulkart & Monthly Mavi Kart Calculator', desc: 'Compare pay-per-ride Metro, Metrobus, Marmaray & Aktarma fares vs the monthly Mavi Kart pass.', tag: 'Transit' }
  },
  {
    slug: 'imei-calculator',
    category: 'living',
    icon: 'fa-mobile-retro',
    accent: '#d97706',
    isNew: true,
    ar: { title: 'حاسبة مهلة الـ 120+120 يوم وتتريك الهاتف IMEI 2026', desc: 'اعرف تاريخ توقف الشريحتين والعدّاد التنازلي لتصفير 1 يناير وقارن التتريك بشراء هاتف محلي.', tag: 'تتريك IMEI' },
    tr: { title: 'IMEI Kayıt Ücreti ve 120+120 Gün Takip Hesaplayıcı', desc: 'Yurt dışı telefon çift SIM / eSIM kapanma tarihlerini ve 2026 IMEI kayıt avantajını anında hesaplayın.', tag: 'IMEI 2026' },
    en: { title: 'Foreign Phone 120+120 Days & IMEI Tax Calculator', desc: 'Track Dual-SIM/eSIM cutoff dates in Turkey, Jan 1 reset countdown, and IMEI tax vs local prices.', tag: 'IMEI' }
  },
  {
    slug: 'kira-artis-orani',
    category: 'living',
    icon: 'fa-house-circle-check',
    accent: '#0891b2',
    ar: { title: 'حاسبة الزيادة القانونية للإيجار في تركيا (TÜFE 2026)', desc: 'احسب الزيادة القانونية القصوى لإيجار شقتك أو مكتبك حسب معدل التضخم الرسمي الصادر عن TÜİK.', tag: 'إيجارات' },
    tr: { title: '2026 Yasal Kira Artış Oranı Hesaplama (TÜFE)', desc: 'TÜİK 12 aylık TÜFE ortalamasına göre konut ve iş yeri yasal kira zammını kuruşu kuruşuna hesaplayın.', tag: 'Kira TÜFE' },
    en: { title: 'Legal Turkey Rent Increase Calculator (TÜFE 2026)', desc: 'Calculate the maximum legal apartment or office rent increase in Turkey based on official TÜİK CPI.', tag: 'Housing' }
  },
  {
    slug: 'istanbul-guide-directory',
    category: 'living',
    icon: 'fa-envelopes-bulk',
    accent: '#4f46e5',
    isNew: true,
    ar: { title: 'الرموز البريدية لأحياء إسطنبول الـ 39 وأرقام الطوارئ', desc: 'ابحث وانسخ الرمز البريدي (Posta Kodu) لأي حي في إسطنبول مع أرقام الطوارئ العربية 112 و157 و170.', tag: '39 منطقة' },
    tr: { title: 'İstanbul 39 İlçe Posta Kodları ve Acil Numaralar', desc: 'Avrupa ve Anadolu yakası 39 ilçenin 5 haneli PTT posta kodları, ulaşım hatları ve resmi acil hatlar.', tag: 'Posta Kodu' },
    en: { title: 'Istanbul 39 Districts Postal Codes & Emergency 112', desc: 'Search & copy 5-digit PTT zip codes for all 39 Istanbul districts plus 112, YİMER 157 & ALO 170 hotlines.', tag: 'Directory' }
  },

  // --- Category 3: Live Daily Prices & Trackers ---
  {
    slug: 'prayer-times',
    category: 'daily',
    icon: 'fa-mosque',
    accent: '#059669',
    isNew: true,
    ar: { title: 'مواقيت الصلاة في إسطنبول وتركيا اليوم (الديانة)', desc: 'أوقات الأذان بتوقيت الديانة التركية لـ 12 مدينة مع عداد تنازلي مباشر للصلاة القادمة بتوقيت إسطنبول.', tag: 'تحديث حي' },
    tr: { title: 'İstanbul ve 12 İl Diyanet Namaz Vakitleri Bugün', desc: 'Diyanet hesaplama yöntemine göre günlük namaz vakitleri ve canlı sonraki vakit geri sayımı.', tag: 'Canlı Vakit' },
    en: { title: 'Official Diyanet Prayer Times for 12 Turkish Cities', desc: 'Daily Diyanet Method 13 Adhan times and live UTC+3 countdown for Istanbul, Ankara, Izmir & more.', tag: 'Live' }
  },
  {
    slug: 'currency-prices',
    category: 'daily',
    icon: 'fa-coins',
    accent: '#0284c7',
    ar: { title: 'أسعار العملات وصرف الليرة التركية لحظة بلحظة', desc: 'تابع سعر الدولار واليورو والريال مقابل الليرة التركية مع محوّل عملات فوري ومحدّث باستمرار.', tag: 'صرف حي' },
    tr: { title: 'Canlı Döviz Kurları ve TL Çevirici (USD / EUR)', desc: 'Güncel Dolar, Euro, Sterlin ve Riyal kurlarını canlı takip edin, anında TL hesaplayın.', tag: 'Canlı Kur' },
    en: { title: 'Live Turkish Lira (TRY) Currency Exchange Rates', desc: 'Real-time USD, EUR, GBP & SAR to TRY exchange rates with an instant currency converter.', tag: 'FX Live' }
  },
  {
    slug: 'gold-prices',
    category: 'daily',
    icon: 'fa-gem',
    accent: '#d97706',
    ar: { title: 'أسعار الذهب في تركيا اليوم (غرام 24، 22، 21، ربع ليرة)', desc: 'أسعار غرام الذهب والليرة الذهبية التركية بالليرة والدولار محدّثة تلقائياً حسب سوق إسطنبول.', tag: 'ذهب حي' },
    tr: { title: 'Canlı Altın Fiyatları (Gram, Çeyrek, 22 ve 24 Ayar)', desc: 'Kapalıçarşı ve serbest piyasa güncel gram, çeyrek, yarım ve tam altın alış-satış fiyatları.', tag: 'Altın' },
    en: { title: 'Live Turkey Gold Prices (Gram, Quarter, 24K & 22K)', desc: 'Real-time Istanbul gold prices per gram, quarter coin (Çeyrek), 24K, 22K, and 21K in TRY.', tag: 'Gold Live' }
  },
  {
    slug: 'akaryakit-fiyatlari',
    category: 'daily',
    icon: 'fa-gas-pump',
    accent: '#ea580c',
    ar: { title: 'أسعار الوقود والبنزين والمازوت والغاز في إسطنبول', desc: 'أسعار لتر البنزين والديزل والغاز LPG اليوم في الجانبين الأوروبي والآسيوي لإسطنبول وتركيا.', tag: 'وقود' },
    tr: { title: 'İstanbul Güncel Akaryakıt Fiyatları (Benzin, Motorin, LPG)', desc: 'Avrupa ve Anadolu yakası günlük benzin, mazot ve otogaz pompa fiyatlarını anlık kontrol edin.', tag: 'Akaryakıt' },
    en: { title: 'Istanbul & Turkey Daily Fuel Prices (Gas, Diesel, LPG)', desc: 'Updated daily gasoline, diesel, and autogas prices across European & Anatolian Istanbul.', tag: 'Fuel' }
  },
  {
    slug: 'nobetci-eczane',
    category: 'daily',
    icon: 'fa-kit-medical',
    accent: '#10b981',
    ar: { title: 'الصيدليات المناوبة اليوم في إسطنبول (24 ساعة)', desc: 'ابحث عن أقرب صيدلية مناوبة مفتوحة الآن في منطقتك بإسطنبول مع العنوان ورقم الهاتف وخرائط جوجل.', tag: 'طوارئ 24/7' },
    tr: { title: 'İstanbul Nöbetçi Eczaneler Bugün (İlçe İlçe 7/24)', desc: 'Bulunduğunuz ilçede şu an açık olan nöbetçi eczaneleri adres, telefon ve harita tarifiyle bulun.', tag: '7/24 Açık' },
    en: { title: 'Istanbul 24/7 On-Duty Pharmacies (Nöbetçi Eczane)', desc: 'Find open overnight & weekend duty pharmacies by Istanbul district with phone & map directions.', tag: '24/7 Duty' }
  },

  // --- Category 4: AI Career & Job Seeker Suite ---
  {
    slug: 'cv-optimizer',
    category: 'ai',
    icon: 'fa-wand-magic-sparkles',
    accent: '#6366f1',
    ar: { title: 'محسّن السيرة الذاتية بالذكاء الاصطناعي', desc: 'طوّر سيرتك الذاتية لتناسب سوق العمل في إسطنبول وشركات التوظيف العالمية بضغطة زر.', tag: 'AI' },
    tr: { title: 'Yapay Zeka CV Geliştirici ve Düzenleyici', desc: 'Özgeçmişinizi İstanbul ve uluslararası iş piyasası standartlarına göre yapay zeka ile güçlendirin.', tag: 'Yapay Zeka' },
    en: { title: 'AI CV & Resume Optimizer for Istanbul Jobs', desc: 'Upgrade your CV wording and impact bullet points for Istanbul employers using AI.', tag: 'AI Career' }
  },
  {
    slug: 'ats-scanner',
    category: 'ai',
    icon: 'fa-shield-halved',
    accent: '#8b5cf6',
    ar: { title: 'فاحص توافق السيرة الذاتية مع أنظمة الفرز (ATS)', desc: 'اكتشف نسبة قبول سيرتك الذاتية في أنظمة التوظيف الآلية والكلمات المفتاحية الناقصة.', tag: 'ATS فحص' },
    tr: { title: 'ATS Özgeçmiş Uyumluluk Tarayıcı', desc: 'CV’nizin insan kaynakları ATS filtrelerinden geçme skorunu ve eksik anahtar kelimeleri görün.', tag: 'ATS Skor' },
    en: { title: 'AI ATS Resume Compatibility Scanner', desc: 'Score your resume against HR applicant tracking systems and spot missing job keywords.', tag: 'ATS Check' }
  },
  {
    slug: 'resume-builder',
    category: 'ai',
    icon: 'fa-file-lines',
    accent: '#0f766e',
    ar: { title: 'منشئ السيرة الذاتية الاحترافية PDF مجاناً', desc: 'صمّم سيرة ذاتية نظيفة ومنسّقة بالعربية أو الإنجليزية أو التركية واحفظها بصيغة PDF فوراً.', tag: 'CV PDF' },
    tr: { title: 'Ücretsiz Profesyonel PDF CV Oluşturucu', desc: 'Türkçe, İngilizce veya Arapça modern özgeçmişinizi hazırlayıp anında PDF olarak indirin.', tag: 'PDF CV' },
    en: { title: 'Free Interactive PDF Resume Builder', desc: 'Build a clean, recruiter-ready resume in English, Turkish, or Arabic and export to PDF.', tag: 'PDF CV' }
  },
  {
    slug: 'cover-letter-generator',
    category: 'ai',
    icon: 'fa-envelope-open-text',
    accent: '#2563eb',
    ar: { title: 'مولّد خطابات التقديم الوظيفي (Cover Letter)', desc: 'اكتب رسالة تقديم احترافية مقنعة لمديري التوظيف تتناسب مع الوظيفة التي تتقدم لها.', tag: 'تقديم وظيفي' },
    tr: { title: 'Yapay Zeka Ön Yazı (Cover Letter) Oluşturucu', desc: 'Başvurduğunuz pozisyona özel etkileyici ve profesyonel ön yazıyı saniyeler içinde hazırlayın.', tag: 'Ön Yazı' },
    en: { title: 'AI Job Application Cover Letter Generator', desc: 'Draft tailored, persuasive cover letters matched to any Istanbul job posting in seconds.', tag: 'Cover Letter' }
  },
  {
    slug: 'interview-prep',
    category: 'ai',
    icon: 'fa-comments',
    accent: '#10b981',
    ar: { title: 'التحضير لمقابلات العمل بالذكاء الاصطناعي', desc: 'تدرّب على أشهر أسئلة مقابلات العمل في تركيا مع إجابات نموذجية ونصائح للتفاوض على الراتب.', tag: 'مقابلات' },
    tr: { title: 'Yapay Zeka İş Mülakatı Hazırlık Koçu', desc: 'Sektörünüze özel mülakat soruları, örnek cevaplar ve maaş müzakeresi ipuçlarıyla hazırlanın.', tag: 'Mülakat' },
    en: { title: 'AI Job Interview Preparation Coach', desc: 'Practice role-specific interview questions, model answers, and salary negotiation tips.', tag: 'Interview' }
  }
]

toolsHubRouter.get('/:locale/araclar', (c) => {
  const raw = c.req.param('locale')
  const loc = ALL_LOCALES.includes(raw as any) ? raw : 'tr'
  return c.redirect(`/${loc}/tools`, 301)
})

toolsHubRouter.get('/:locale/tools', (c) => {
  const rawLoc = c.req.param('locale')
  if (!ALL_LOCALES.includes(rawLoc as any)) return c.redirect('/ar/tools', 301)
  const locale = rawLoc as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur'
  const lang: PrimaryLoc = locale === 'ar' || locale === 'tr' ? locale : 'en'
  const isRtl = locale === 'ar' || locale === 'fa' || locale === 'ur'

  const copy = {
    ar: {
      title: 'مركز أدوات وحاسبات الحياة والعمل في إسطنبول وتركيا 2026 (22 أداة مجانية)',
      desc: 'جميع الأدوات والحاسبات المجانية للمقيمين والعاملين في تركيا بمكان واحد: مولّد خطابات تركية PDF، حاسبة الراتب والإقامة وكرت إسطنبول وتتريك IMEI، مواقيت الصلاة، العطل الرسمية، الرموز البريدية، وأسعار العملات والذهب.',
      keywords: 'أدوات وحاسبات تركيا 2026, حاسبة الراتب في تركيا, حاسبة الإقامة في تركيا, مولد خطابات تركية dilekçe, حاسبة كرت اسطنبول, مواقيت الصلاة اسطنبول, الرمز البريدي اسطنبول, أدوات المقيمين في تركيا',
      h1: 'مركز أدوات وحاسبات إسطنبول وتركيا 2026 (22 أداة مجانية)',
      sub: 'كل ما تحتاجه يومياً للعمل والمعيشة في تركيا في بوابة واحدة سريعة ومجانية 100% — مصنّفة بوضوح مع بحث فوري وتحديث مستمر لأرقام 2026.',
      searchPlaceholder: 'ابحث عن أداة (مثال: استقالة، إقامة، راتب، ذهب، صلاة، رمز بريدي، IMEI)...',
      allTab: 'الكل (22 أداة)',
      workTab: 'العمل والرواتب والقانون (7)',
      livingTab: 'المعيشة والإقامة في تركيا (5)',
      dailyTab: 'الأسعار والخدمات اليومية (5)',
      aiTab: 'التوظيف بالذكاء الاصطناعي (5)',
      openTool: 'فتح الأداة الآن',
      newBadge: 'جديد'
    },
    tr: {
      title: 'İstanbul ve Türkiye Akıllı Hesaplama Araçları Merkezi 2026 (22 Ücretsiz Araç)',
      desc: 'Türkiye’de iş ve günlük yaşam için 22 ücretsiz araç tek sayfada: Resmi Dilekçe PDF, 2026 Maaş, Kıdem Tazminatı, İkamet, İstanbulkart, IMEI 120 Gün, Diyanet Namaz Vakitleri, Resmi Tatiller, 39 İlçe Posta Kodu ve Canlı Kurlar.',
      keywords: 'türkiye hesaplama araçları 2026, maaş hesaplama, kıdem tazminatı, ikamet harcı, istanbulkart hesaplama, imei kayıt ücreti, diyanet namaz vakitleri, istanbul posta kodları',
      h1: 'İstanbul ve Türkiye Akıllı Araçlar Merkezi 2026 (22 Ücretsiz Araç)',
      sub: 'Çalışma hayatı, hukuk, ulaşım, resmi işlemler ve canlı piyasa takibi için geliştirdiğimiz tüm ücretsiz araçlara kategorilere göre anında ulaşın.',
      searchPlaceholder: 'Araç ara (örn: dilekçe, maaş, kıdem, ikamet, namaz, posta kodu, altın)...',
      allTab: 'Tümü (22 Araç)',
      workTab: 'İş, Maaş & Hukuk (7)',
      livingTab: 'Yaşam & İkamet (5)',
      dailyTab: 'Canlı Fiyatlar & Günlük (5)',
      aiTab: 'Yapay Zeka Kariyer (5)',
      openTool: 'Aracı Aç',
      newBadge: 'YENİ'
    },
    en: {
      title: 'Istanbul & Turkey Smart Tools & Calculators Hub 2026 (22 Free Tools)',
      desc: 'All 22 free calculators and daily utilities for living and working in Istanbul & Turkey: Turkish Dilekçe PDF Studio, 2026 Salary, Severance, İkamet, Istanbulkart, IMEI 120-Day Tracker, Diyanet Prayer Times, Holidays, 39 District Zip Codes & Live FX.',
      keywords: 'turkey calculators 2026, istanbul expat tools, turkey salary calculator, ikamet fee calculator, istanbulkart fare calculator, imei turkey tracker, diyanet prayer times, istanbul postal codes',
      h1: 'Istanbul & Turkey Smart Tools & Calculators Hub (22 Free Tools)',
      sub: 'Everything expats, residents, and professionals need daily in Istanbul & Türkiye — organized by category, updated for 2026 rules, and 100% free.',
      searchPlaceholder: 'Search tools (e.g. resignation, salary, ikamet, metro, prayer, zip code, gold)...',
      allTab: 'All Tools (22)',
      workTab: 'Work, Salary & Legal (7)',
      livingTab: 'Living & Residence (5)',
      dailyTab: 'Live Daily Trackers (5)',
      aiTab: 'AI Career Tools (5)',
      openTool: 'Open Tool',
      newBadge: 'NEW'
    }
  }[lang]

  const faqs = lang === 'ar' ? [
    { q: 'هل جميع الأدوات والحاسبات في موقع فرص عمل في إسطنبول مجانية بالكامل؟', a: 'نعم، جميع الأدوات الـ 22 مجانية 100% ولا تتطلب تسجيل حساب أو اشتراك، وتعمل مباشرة من المتصفح على الجوال والكمبيوتر.' },
    { q: 'هل الأرقام والرسوم في الحاسبات محدّثة لعام 2026؟', a: 'نعم، تم تحديث حاسبات الرواتب، تعويض نهاية الخدمة (Kıdem)، الإقامة (İkamet)، كرت إسطنبول، وتتريك IMEI، والعطل الرسمية 2026–2027 وفق أحدث اللوائح التركية، بينما تتحدث أسعار العملات والذهب والوقود ومواقيت الصلاة والصيدليات المناوبة تلقائياً.' }
  ] : lang === 'tr' ? [
    { q: 'Bu merkezdeki 22 aracın tamamı ücretsiz mi?', a: 'Evet, tüm hesaplayıcılar, resmi dilekçe şablonları ve canlı takip sayfaları üyelik gerektirmeden %100 ücretsiz olarak çalışır.' },
    { q: 'Hesaplamalar 2026 güncel mevzuatına uygun mu?', a: 'Evet; maaş, kıdem tazminatı tavanı, kira TÜFE, ikamet harçları, İstanbulkart, IMEI kayıt ve 2026–2027 resmi tatil verileri güncel rakamlara göre hazırlanmıştır.' }
  ] : [
    { q: 'Are all 22 tools in this Istanbul & Turkey hub completely free?', a: 'Yes — every calculator, PDF letter generator, and live tracker is 100% free with no sign-up required on desktop or mobile.' },
    { q: 'Are the rates and Turkish legal formulas updated for 2026?', a: 'Yes. Salary tax brackets, severance ceilings, Ikamet & IMEI fees, Istanbulkart fares, and 2026–2027 holidays reflect current 2026 figures, while FX, gold, fuel, duty pharmacies, and prayer times refresh automatically.' }
  ]

  const hubUrl = `https://jobs-in-istanbul.com/${lang}/tools`
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: copy.h1,
    description: copy.desc,
    url: hubUrl,
    inLanguage: lang,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ALL_PORTAL_TOOLS.length,
      itemListElement: ALL_PORTAL_TOOLS.map((tool, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: tool[lang].title,
        url: `https://jobs-in-istanbul.com/${lang}/${tool.slug}`
      }))
    }
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'ar' ? 'الرئيسية' : lang === 'tr' ? 'Anasayfa' : 'Home', item: `https://jobs-in-istanbul.com/${lang}` },
      { '@type': 'ListItem', position: 2, name: copy.h1, item: hubUrl }
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

  const metaTags = generateMetaTags(locale, 'insights', {
    slug: 'tools',
    title: copy.title,
    description: copy.desc,
    seoKeywords: copy.keywords,
    availableLocales: ['ar', 'en', 'tr']
  })
  const seoHtml = `${metaTags}
  <script type="application/ld+json">${JSON.stringify(collectionSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`

  const bodyHtml = `
    <style>
      .hub-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
      @media (max-width: 980px) { .hub-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 640px) { .hub-grid { grid-template-columns: 1fr; } }
      .hub-card { background: var(--bg-site); border: 1.5px solid var(--border); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; text-decoration: none; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
      .hub-card:hover { transform: translateY(-3px); border-color: var(--primary); box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08); }
      .hub-tab { padding: 10px 16px; border-radius: 999px; border: 1.5px solid var(--border); background: var(--bg-subtle); color: var(--text-heading); font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.15s; }
      .hub-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }
    </style>

    <div class="container" style="max-width: 1220px; padding: 34px 20px 72px; direction: ${isRtl ? 'rtl' : 'ltr'};">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0369a1 100%); color: #fff; padding: 36px 28px; border-radius: 22px; margin-bottom: 24px;">
        <h1 style="margin: 0 0 10px 0; font-size: clamp(1.5rem, 3.2vw, 2.2rem); font-weight: 900; color: #fff;">${copy.h1}</h1>
        <p style="margin: 0 0 22px 0; color: #dbeafe; max-width: 840px; line-height: 1.7; font-size: 0.98rem;">${copy.sub}</p>
        <input id="tools-hub-search" type="search" placeholder="${copy.searchPlaceholder}" oninput="filterToolsHub()" style="width:100%;max-width:640px;padding:13px 18px;border-radius:14px;border:2px solid rgba(255,255,255,0.22);background:rgba(255,255,255,0.96);color:#0f172a;font-size:0.96rem;font-weight:700;">
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:9px;margin-bottom:22px;align-items:center;justify-content:space-between;">
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <button type="button" class="hub-tab active" data-cat="all" onclick="setHubCat('all', this)">${copy.allTab}</button>
          <button type="button" class="hub-tab" data-cat="work" onclick="setHubCat('work', this)">${copy.workTab}</button>
          <button type="button" class="hub-tab" data-cat="living" onclick="setHubCat('living', this)">${copy.livingTab}</button>
          <button type="button" class="hub-tab" data-cat="daily" onclick="setHubCat('daily', this)">${copy.dailyTab}</button>
          <button type="button" class="hub-tab" data-cat="ai" onclick="setHubCat('ai', this)">${copy.aiTab}</button>
        </div>
        <span id="tools-hub-count" style="font-size:0.86rem;font-weight:800;color:var(--text-muted);">${ALL_PORTAL_TOOLS.length} / ${ALL_PORTAL_TOOLS.length}</span>
      </div>

      <div class="hub-grid" id="tools-hub-grid">
        ${ALL_PORTAL_TOOLS.map(tool => {
          const item = tool[lang]
          const searchBlob = `${tool.ar.title} ${tool.ar.desc} ${tool.tr.title} ${tool.tr.desc} ${tool.en.title} ${tool.en.desc} ${tool.slug}`.toLowerCase()
          return `
            <a href="/${locale}/${tool.slug}" class="hub-card" data-cat="${tool.category}" data-search="${searchBlob.replace(/"/g, '&quot;')}">
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;">
                  <div style="width:44px;height:44px;border-radius:12px;background:${tool.accent}18;color:${tool.accent};display:flex;align-items:center;justify-content:center;font-size:1.2rem;">
                    <i class="fa-solid ${tool.icon}"></i>
                  </div>
                  <div style="display:flex;gap:6px;align-items:center;">
                    ${tool.isNew ? `<span style="background:#10b981;color:#fff;font-size:0.7rem;font-weight:900;padding:3px 9px;border-radius:999px;">${copy.newBadge}</span>` : ''}
                    <span style="background:var(--bg-subtle);border:1px solid var(--border);color:var(--text-muted);font-size:0.74rem;font-weight:800;padding:3px 10px;border-radius:999px;">${item.tag}</span>
                  </div>
                </div>
                <h2 style="margin:0 0 8px 0;font-size:1.05rem;font-weight:900;color:var(--text-heading);line-height:1.45;">${item.title}</h2>
                <p style="margin:0;font-size:0.88rem;color:var(--text-body);line-height:1.65;">${item.desc}</p>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);color:${tool.accent};font-weight:800;font-size:0.86rem;">
                <span>${copy.openTool}</span>
                <i class="fa-solid ${isRtl ? 'fa-arrow-left' : 'fa-arrow-right'}"></i>
              </div>
            </a>
          `
        }).join('')}
      </div>

      <section class="glass-card" style="padding: 26px; border-radius: 18px; margin-top: 28px; border: 1px solid var(--border);">
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-heading); margin: 0 0 16px 0;">${lang === 'ar' ? 'الأسئلة الشائعة حول أدوات الموقع' : lang === 'tr' ? 'Sıkça Sorulan Sorular' : 'Frequently Asked Questions'}</h2>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${faqs.map(f => `
            <details style="background:var(--bg-subtle);border:1px solid var(--border);border-radius:12px;padding:14px 16px;" open>
              <summary style="font-weight:800;color:var(--text-heading);cursor:pointer;">${f.q}</summary>
              <p style="margin:8px 0 0 0;color:var(--text-body);line-height:1.7;font-size:0.93rem;">${f.a}</p>
            </details>
          `).join('')}
        </div>
      </section>
    </div>

    <script>
      let activeHubCat = 'all';
      function setHubCat(cat, btn) {
        activeHubCat = cat;
        document.querySelectorAll('.hub-tab').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        filterToolsHub();
      }
      function filterToolsHub() {
        const q = (document.getElementById('tools-hub-search').value || '').trim().toLowerCase();
        let shown = 0;
        document.querySelectorAll('.hub-card').forEach(card => {
          const catOk = activeHubCat === 'all' || card.getAttribute('data-cat') === activeHubCat;
          const textOk = !q || (card.getAttribute('data-search') || '').includes(q);
          const vis = catOk && textOk;
          card.style.display = vis ? '' : 'none';
          if (vis) shown++;
        });
        const el = document.getElementById('tools-hub-count');
        if (el) el.textContent = shown + ' / ${ALL_PORTAL_TOOLS.length}';
      }
    </script>
  `

  c.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400')
  c.header('CDN-Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  return c.html(renderLayout(c, copy.title, bodyHtml, locale, seoHtml))
})
