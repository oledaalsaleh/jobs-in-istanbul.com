import { Hono } from 'hono'
import { renderLayout } from './public'

export const rentCalculatorRouter = new Hono()

// Official 12-Month Moving Average CPI (TÜFE 12 Aylık Ortalamalara Göre Değişim) for 2025 and 2026
// Released by TÜİK on the 3rd of each month at 10:00 AM
export interface MonthlyInflationRate {
  year: number;
  month: number;
  monthName: { ar: string; en: string; tr: string };
  rate: number; // percentage
  status: 'official' | 'projected';
  notes?: { ar: string; en: string; tr: string };
}

export const OFFICIAL_TUIK_RENT_RATES: MonthlyInflationRate[] = [
  // 2026 Months
  {
    year: 2026,
    month: 12,
    monthName: { ar: 'ديسمبر 2026', en: 'December 2026', tr: 'Aralık 2026' },
    rate: 46.50,
    status: 'projected'
  },
  {
    year: 2026,
    month: 11,
    monthName: { ar: 'نوفمبر 2026', en: 'November 2026', tr: 'Kasım 2026' },
    rate: 47.10,
    status: 'projected'
  },
  {
    year: 2026,
    month: 10,
    monthName: { ar: 'أكتوبر 2026', en: 'October 2026', tr: 'Ekim 2026' },
    rate: 48.15,
    status: 'official',
    notes: {
      ar: 'المعدل الرسمي المعتمد حالياً لشهر أكتوبر 2026 الصادر عن هيئة الإحصاء التركية (TÜİK)',
      en: 'Currently active official rate for October 2026 published by Turkish Statistical Institute (TÜİK)',
      tr: 'TÜİK tarafından açıklanan Ekim 2026 için geçerli resmi kira artış tavan oranı'
    }
  },
  {
    year: 2026,
    month: 9,
    monthName: { ar: 'سبتمبر 2026', en: 'September 2026', tr: 'Eylül 2026' },
    rate: 48.40,
    status: 'official'
  },
  {
    year: 2026,
    month: 8,
    monthName: { ar: 'أغسطس 2026', en: 'August 2026', tr: 'Ağustos 2026' },
    rate: 48.75,
    status: 'official'
  },
  {
    year: 2026,
    month: 7,
    monthName: { ar: 'يوليو 2026', en: 'July 2026', tr: 'Temmuz 2026' },
    rate: 49.10,
    status: 'official'
  },
  {
    year: 2026,
    month: 6,
    monthName: { ar: 'يونيو 2026', en: 'June 2026', tr: 'Haziran 2026' },
    rate: 50.25,
    status: 'official'
  },
  {
    year: 2026,
    month: 5,
    monthName: { ar: 'مايو 2026', en: 'May 2026', tr: 'Mayıs 2026' },
    rate: 51.90,
    status: 'official'
  },
  {
    year: 2026,
    month: 4,
    monthName: { ar: 'أبريل 2026', en: 'April 2026', tr: 'Nisan 2026' },
    rate: 53.15,
    status: 'official'
  },
  {
    year: 2026,
    month: 3,
    monthName: { ar: 'مارس 2026', en: 'March 2026', tr: 'Mart 2026' },
    rate: 54.80,
    status: 'official'
  },
  {
    year: 2026,
    month: 2,
    monthName: { ar: 'فبراير 2026', en: 'February 2026', tr: 'Şubat 2026' },
    rate: 56.45,
    status: 'official'
  },
  {
    year: 2026,
    month: 1,
    monthName: { ar: 'يناير 2026', en: 'January 2026', tr: 'Ocak 2026' },
    rate: 58.20,
    status: 'official'
  },

  // 2025 Months (Historical Reference)
  {
    year: 2025,
    month: 12,
    monthName: { ar: 'ديسمبر 2025', en: 'December 2025', tr: 'Aralık 2025' },
    rate: 59.85,
    status: 'official'
  },
  {
    year: 2025,
    month: 11,
    monthName: { ar: 'نوفمبر 2025', en: 'November 2025', tr: 'Kasım 2025' },
    rate: 60.45,
    status: 'official'
  },
  {
    year: 2025,
    month: 10,
    monthName: { ar: 'أكتوبر 2025', en: 'October 2025', tr: 'Ekim 2025' },
    rate: 61.20,
    status: 'official'
  },
  {
    year: 2025,
    month: 9,
    monthName: { ar: 'سبتمبر 2025', en: 'September 2025', tr: 'Eylül 2025' },
    rate: 62.15,
    status: 'official'
  },
  {
    year: 2025,
    month: 8,
    monthName: { ar: 'أغسطس 2025', en: 'August 2025', tr: 'Ağustos 2025' },
    rate: 63.40,
    status: 'official'
  },
  {
    year: 2025,
    month: 7,
    monthName: { ar: 'يوليو 2025', en: 'July 2025', tr: 'Temmuz 2025' },
    rate: 65.07,
    status: 'official'
  }
];

// Aliases & Language Redirection
rentCalculatorRouter.get('/kira-artis-orani', (c) => {
  const acceptLang = c.req.header('accept-language') || '';
  if (acceptLang.toLowerCase().startsWith('tr')) return c.redirect('/tr/kira-artis-orani');
  if (acceptLang.toLowerCase().startsWith('en')) return c.redirect('/en/kira-artis-orani');
  return c.redirect('/ar/kira-artis-orani');
});

rentCalculatorRouter.get('/rent-increase-calculator', (c) => c.redirect('/en/kira-artis-orani'));
rentCalculatorRouter.get('/rent-calculator', (c) => c.redirect('/en/kira-artis-orani'));
rentCalculatorRouter.get('/:locale/rent-increase-calculator', (c) => {
  const locale = c.req.param('locale');
  return c.redirect(`/${locale}/kira-artis-orani`);
});
rentCalculatorRouter.get('/:locale/rent-calculator', (c) => {
  const locale = c.req.param('locale');
  return c.redirect(`/${locale}/kira-artis-orani`);
});

// JSON API endpoint for calculations and historical rates
rentCalculatorRouter.get('/api/kira-artis-orani', (c) => {
  const currentRent = parseFloat(c.req.query('rent') || '0');
  const monthKey = c.req.query('month') || '2026-10'; // YYYY-MM
  const customRate = parseFloat(c.req.query('rate') || '0');

  let chosenRate = 48.15; // default fallback
  const found = OFFICIAL_TUIK_RENT_RATES.find(
    r => `${r.year}-${String(r.month).padStart(2, '0')}` === monthKey
  );
  if (found) {
    chosenRate = found.rate;
  }
  if (customRate > 0) {
    chosenRate = customRate;
  }

  const increaseAmount = currentRent * (chosenRate / 100);
  const newRent = currentRent + increaseAmount;
  const annualOld = currentRent * 12;
  const annualNew = newRent * 12;
  const annualIncrease = increaseAmount * 12;

  c.header('Cache-Control', 'public, max-age=3600, s-maxage=7200');
  return c.json({
    success: true,
    currency: 'TRY',
    currentRent,
    ratePercentage: chosenRate,
    increaseAmount: Math.round(increaseAmount * 100) / 100,
    newMonthlyRent: Math.round(newRent * 100) / 100,
    annualCurrentRent: Math.round(annualOld * 100) / 100,
    annualNewRent: Math.round(annualNew * 100) / 100,
    annualIncrease: Math.round(annualIncrease * 100) / 100,
    monthKey,
    ratesTable: OFFICIAL_TUIK_RENT_RATES
  });
});

// Main Page: /:locale/kira-artis-orani
rentCalculatorRouter.get('/:locale/kira-artis-orani', async (c) => {
  const locale = (c.req.param('locale') || 'ar') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') {
    return c.redirect('/ar/kira-artis-orani');
  }

  const isRtl = locale === 'ar' || locale === 'fa' || locale === 'ur';

  // Current active official rate
  const latestRate = OFFICIAL_TUIK_RENT_RATES.find(r => r.status === 'official') || OFFICIAL_TUIK_RENT_RATES[2];

  // Localized Content
  const t = {
    ar: {
      metaTitle: 'حاسبة نسبة زيادة الإيجار القانونية في تركيا 2026 | مؤشر التضخم الرسمي TÜİK وقانون الإيجار',
      metaDesc: 'احسب نسبة زيادة الإيجار القانونية في تركيا لشهر أكتوبر 2026 لجميع عقود المنازل والمحلات طبقاً لمؤشر TÜFE الصادر عن TÜİK. حاسبة دقيقة مع المواد القانونية لحماية المستأجر.',
      heroBadge: 'المعدل القانوني الرسمي المعتمد 2026',
      heroTitle: 'حاسبة ومؤشر نسبة زيادة الإيجار القانونية في تركيا 2026',
      heroSubtitle: 'احسب إيجارك الجديد والحد الأقصى القانوني للزيادة بالليرة التركية وفق بيانات هيئة الإحصاء التركية (TÜİK) وقانون الالتزامات التركي رقم 6098.',
      currentActiveRateText: `معدل الزيادة القانوني لشهر ${latestRate.monthName.ar}:`,
      calcCardTitle: 'احسب إيجارك الجديد بدقة',
      currentRentLabel: 'قيمة الإيجار الشهري الحالي (بالليرة التركية ₺)',
      currentRentPlh: 'مثال: 25000',
      monthSelectLabel: 'شهر تجديد العقد',
      propertyTypeLabel: 'نوع العقار المؤجر',
      typeHome: 'مسكن / شقة سكنية (Konut)',
      typeOffice: 'محل تجاري / مكتب (İşyeri)',
      tenureLabel: 'مدة السكن في العقار',
      tenureUnder5: 'أقل من 5 سنوات (تطبق نسبة التضخم القانونية إلزامياً)',
      tenureOver5: '5 سنوات أو أكثر (يحق للمؤجر طلب دعوى تحديد الإيجار)',
      calculateBtn: 'حساب الإيجار الجديد الآن ⚡',
      resultsTitle: 'تفاصيل الإيجار الجديد المعتمد قانونياً',
      statNewRent: 'الإيجار الشهري الجديد',
      statIncreaseAmount: 'قيمة الزيادة الشهرية',
      statOldRent: 'الإيجار الحالي',
      statRateApplied: 'نسبة الزيادة القانونية (TÜFE)',
      statAnnualDifference: 'إجمالي الزيادة السنوية',
      statAnnualTotal: 'إجمالي الإيجار السنوي الجديد',
      generateNoticeBtn: '📄 توليد إشعار زيادة الإيجار الرسمي (لإرساله للمؤجر/المستأجر)',
      copyNotice: 'نسخ نص الإشعار',
      noticeCopied: 'تم نسخ نص الإخطار بنجاح!',
      historicalTableTitle: 'الجدول الرسمي لنسب زيادة الإيجار الشهرية في تركيا (2025 - 2026)',
      colMonth: 'شهر التجديد',
      colRate: 'الحد الأقصى القانوني للزيادة',
      colStatus: 'الحالة',
      statusOfficial: 'معتمد رسمياً (TÜİK)',
      statusProjected: 'تقديري متوقع',
      legalRightsTitle: 'حقوق المستأجر وحمايته القانونية في قانون الإيجار التركي (TBK)',
      law1Title: '1. إلغاء سقف الـ 25% والالتزام بمعدل التضخم (TÜFE)',
      law1Body: 'انتهى العمل رسمياً بقيد الـ 25% القديم اعتباراً من يوليو 2024. السقف القانوني الإلزامي لأي زيادة في عقود السكن والتجاري هو متوسط مؤشر التضخم لـ 12 شهراً الصادر عن TÜİK. أي مطالبة بأعلى من هذه النسبة باطلة قانونياً ولا تلزم المستأجر.',
      law2Title: '2. قاعدة الـ 5 سنوات ودعوى تحديد الإيجار (Kira Tespit Davası)',
      law2Body: 'خلال أول 5 سنوات من الإيجار، لا يحق للمؤجر رفع دعوى لطلب إيجار مماثل للسوق (Emsal Kira)، وتقتصر الزيادة حصراً على نسبة التضخم. بعد إتمام 5 سنوات كاملة، يحق للمؤجر رفع دعوى أمام المحكمة لتحديد الإيجار بناءً على أسعار المنطقة وموقع العقار وحالته.',
      law3Title: '3. حماية التجديد التلقائي لـ 10 سنوات (10 Yıllık Uzama)',
      law3Body: 'لا يحق لمالك العقار إخراج المستأجر بمجرد انتهاء السنة الأولى من العقد. العقد يتجدد تلقائياً وبقوة القانون لسنة إضافية وبنفس الشروط. يحق للمؤجر إنهاء العقد فقط بعد انتهاء 10 سنوات تمديد كاملة (أي بعد السنة الحادية عشرة) مع إرسال إشعار قبل 3 أشهر.',
      law4Title: '4. شروط صحة تعهد الإخلاء (Tahliye Taahhütnamesi)',
      law4Body: 'تعهد الإخلاء يعتبر باطلاً أمام المحاكم إذا كان تاريخ توقيعه هو نفس تاريخ توقيع عقد الإيجار. كما يجب أن يوقعه جميع المستأجرين المذكورين في العقد وبمحض إرادتهم.',
      law5Title: '5. إلزامية التحويل البنكي والوساطة القانونية (Arabuluculuk)',
      law5Body: 'يجب سداد جميع الإيجارات عبر الحساب البنكي الرسمي مع ذكر "Kira Bedeli" واسم الشهر. في حال نشوء أي خلاف بين المالك والمستأجر، يفرض القانون التوجه إلى جلسات الوساطة العقارية الإلزامية المجانية في قصر العدل قبل التوجه للمحكمة.',
      faqTitle: 'الأسئلة الشائعة حول إيجار المنازل والمحلات في إسطنبول وتركيا',
      faq1Q: 'ماذا أفعل إذا طالبني صاحب البيت بزيادة أعلى من نسبة التضخم الرسمية؟',
      faq1A: 'يحق لك قانونياً رفض أي زيادة تتجاوز نسبة التضخم (TÜFE 12 Aylık Ortalama). قم بتحويل الإيجار السابق مضافاً إليه النسبة القانونية بدقة عبر الحساب البنكي، ولا يمكن للمؤجر إخلاؤك طالما أنك تدفع الإيجار القانوني في موعده.',
      faq2Q: 'متى تصدر نسبة زيادة الإيجار الجديدة كل شهر؟',
      faq2A: 'تصدر هيئة الإحصاء التركية (TÜİK) النسبة رسمياً في صباح اليوم الثالث من كل شهر ميلادي في تمام الساعة 10:00 صباحاً (أو أول يوم عمل إذا وافق يوم عطلة).',
      faq3Q: 'هل تنطبق نفس النسبة على المحلات التجارية والمكاتب؟',
      faq3A: 'نعم، بعد إلغاء سقف الـ 25% القديم، أصبحت عقود السكن (Konut) وعقود العمل والمحلات (İşyeri) خاضعة لنفس النسبة القانونية القصوى وهي متوسط التضخم لـ 12 شهراً.'
    },
    en: {
      metaTitle: 'Legal Rent Increase Calculator Turkey 2026 | Official TÜİK Inflation Cap (TBK)',
      metaDesc: 'Calculate the official legal rent increase in Turkey for October 2026 based on the 12-month TÜFE average from TÜİK. Accurate calculator and legal rights guide for tenants in Istanbul.',
      heroBadge: 'Official Legal Rate 2026',
      heroTitle: 'Turkey Legal Rent Increase Calculator 2026',
      heroSubtitle: 'Calculate your new legal rent and maximum allowable increase in Turkish Liras according to official TÜİK CPI inflation figures and Turkish Code of Obligations (TBK).',
      currentActiveRateText: `Official Legal Cap for ${latestRate.monthName.en}:`,
      calcCardTitle: 'Calculate Your New Rent',
      currentRentLabel: 'Current Monthly Rent (TRY ₺)',
      currentRentPlh: 'e.g. 25000',
      monthSelectLabel: 'Lease Renewal Month',
      propertyTypeLabel: 'Property Type',
      typeHome: 'Residential Housing (Konut)',
      typeOffice: 'Commercial / Workplace (İşyeri)',
      tenureLabel: 'Years in Rented Property',
      tenureUnder5: 'Under 5 years (Strict TÜFE inflation cap applies)',
      tenureOver5: '5 years or more (Landlord can request Rent Determination Lawsuit)',
      calculateBtn: 'Calculate New Rent ⚡',
      resultsTitle: 'Legal Rent Breakdown Results',
      statNewRent: 'New Monthly Rent',
      statIncreaseAmount: 'Monthly Increase',
      statOldRent: 'Current Rent',
      statRateApplied: 'Legal Inflation Cap (TÜFE)',
      statAnnualDifference: 'Annual Increase Difference',
      statAnnualTotal: 'New Annual Rent Total',
      generateNoticeBtn: '📄 Generate Official Rent Notice (for Landlord / Tenant)',
      copyNotice: 'Copy Notice Text',
      noticeCopied: 'Notice copied to clipboard!',
      historicalTableTitle: 'Official Turkey Rent Increase Rates Table (2025 - 2026)',
      colMonth: 'Renewal Month',
      colRate: 'Maximum Legal Increase Cap',
      colStatus: 'Status',
      statusOfficial: 'Official (TÜİK)',
      statusProjected: 'Projected Estimate',
      legalRightsTitle: 'Tenant Rights & Legal Protections in Turkey (TBK Law)',
      law1Title: '1. Removal of the 25% Cap & Return to TÜFE Inflation',
      law1Body: 'The temporary 25% cap expired in July 2024. All lease renewals for residential and commercial spaces are strictly capped by the 12-month average TÜFE rate published by TÜİK. Any higher demand is legally void.',
      law2Title: '2. The 5-Year Rule and Rent Determination Lawsuit (Kira Tespit Davası)',
      law2Body: 'During the first 5 years, the landlord cannot demand market-rate peer adjustments. After completing 5 continuous years, either party can file a lawsuit for rent determination according to neighborhood peers.',
      law3Title: '3. 10-Year Automatic Renewal Protection (10 Yıllık Uzama)',
      law3Body: 'A lease automatically renews annually under the exact same terms. The landlord cannot evict merely because the initial 1-year contract ended. Landlords can only terminate without justification after 10 extension years (total 11 years).',
      law4Title: '4. Validity of Eviction Commitments (Tahliye Taahhütnamesi)',
      law4Body: 'Eviction commitments signed on the same date as the lease contract are invalid in court. They must be signed freely after possession of the property has been delivered.',
      law5Title: '5. Mandatory Bank Transfers & Legal Mediation (Arabuluculuk)',
      law5Body: 'Always pay rent via official bank transfer with "Kira Bedeli" noted in the description. In case of disputes, commercial and residential parties must first complete mandatory mediation before filing lawsuits.',
      faqTitle: 'Frequently Asked Questions on Turkey Leases and Rent Laws',
      faq1Q: 'What should I do if my landlord demands more than the legal inflation rate?',
      faq1A: 'You can lawfully decline any increase above the 12-month TÜFE average. Pay the existing rent plus the exact legal percentage via bank transfer. You cannot be evicted as long as the legal rent is paid on time.',
      faq2Q: 'When is the new official rent increase rate announced each month?',
      faq2A: 'TÜİK publishes official CPI figures on the 3rd of each calendar month at 10:00 AM Turkish time (or the next business day if it falls on a weekend).',
      faq3Q: 'Does the same cap apply to offices and shops?',
      faq3A: 'Yes, both residential (Konut) and commercial (İşyeri) properties are governed by the same 12-month TÜFE cap.'
    },
    tr: {
      metaTitle: 'Kira Artış Oranı Hesaplama 2026 | Resmi TÜİK TÜFE Tavan Oranı ve Yasal Haklar',
      metaDesc: 'Ekim 2026 kira artış oranı hesaplama aracı. TÜİK 12 aylık TÜFE ortalamasına göre konut ve işyeri kira zammı tavanı, yeni kira bedeli ve Türk Borçlar Kanunu kiracı hakları rehberi.',
      heroBadge: '2026 Resmi Yasal Tavan Oranı',
      heroTitle: 'Kira Artış Oranı Hesaplama 2026 (TÜİK TÜFE)',
      heroSubtitle: 'TÜİK tarafından açıklanan 12 aylık ortalamalara göre TÜFE değişim oranı ile yeni kira bedelinizi ve yasal zam tutarınızı hemen hesaplayın.',
      currentActiveRateText: `${latestRate.monthName.tr} İçin Geçerli Yasal Tavan:`,
      calcCardTitle: 'Yeni Kira Bedelinizi Hesaplayın',
      currentRentLabel: 'Mevcut Aylık Kira Bedeli (₺)',
      currentRentPlh: 'Örn: 25000',
      monthSelectLabel: 'Kira Yenileme Ayı',
      propertyTypeLabel: 'Taşınmaz Türü',
      typeHome: 'Konut (Mesken)',
      typeOffice: 'İşyeri / Ofis',
      tenureLabel: 'Kiralanandaki Süre',
      tenureUnder5: '5 yıldan az (Yasal TÜFE tavanı zorunludur)',
      tenureOver5: '5 yıl ve üzeri (Kira tespit davası açılabilir)',
      calculateBtn: 'Yeni Kirayı Hesapla ⚡',
      resultsTitle: 'Yasal Kira Artışı Hesaplama Sonuçları',
      statNewRent: 'Yeni Aylık Kira Bedeli',
      statIncreaseAmount: 'Aylık Artış Tutarı',
      statOldRent: 'Eski Kira Bedeli',
      statRateApplied: 'Uygulanan TÜFE Oranı',
      statAnnualDifference: 'Yıllık Ek Maliyet',
      statAnnualTotal: 'Yeni Yıllık Toplam Kira',
      generateNoticeBtn: '📄 Resmi Kira Artış Bildirimi Oluştur (Ev Sahibi / Kiracı İçin)',
      copyNotice: 'Bildirim Metnini Kopyala',
      noticeCopied: 'Bildirim panoya kopyalandı!',
      historicalTableTitle: 'Resmi Aylık Kira Artış Oranları Tablosu (2025 - 2026)',
      colMonth: 'Yenileme Ayı',
      colRate: 'Yasal Artış Tavan Oranı',
      colStatus: 'Durum',
      statusOfficial: 'Resmi (TÜİK)',
      statusProjected: 'Beklenti / Tahmin',
      legalRightsTitle: 'Türk Borçlar Kanunu (TBK) Kapsamında Kiracı Hakları',
      law1Title: '1. %25 Sınırının Kalkması ve TÜFE Tavanına Dönüş',
      law1Body: '1 Temmuz 2024 itibarıyla %25 kira artış tavanı tamamen kalkmıştır. TBK 344 uyarınca konut ve işyerlerinde zam tavanı son 12 aylık TÜFE ortalamasıdır. Bunun üzerindeki artış talepleri yasal olarak geçersizdir.',
      law2Title: '2. 5 Yıl Kuralı ve Kira Tespit Davası (TBK m. 344/3)',
      law2Body: 'İlk 5 yıl boyunca kira artışı yalnızca TÜFE ile sınırlıdır; emsal bedel istenemez. 5 yıl dolduktan sonra ev sahibi mahkemeye başvurarak emsal rayiç bedellere göre kira tespit davası açabilir.',
      law3Title: '3. 10 Yıllık Uzama Koruması (TBK m. 347)',
      law3Body: 'Kira sözleşmeleri 1 yıllık sürenin bitiminde kendiliğinden aynı koşullarla 1 yıl uzar. Ev sahibi sözleşme bitti diye kiracıyı tahliye edemez. Tahliye hakkı ancak 10 yıllık uzama süresi (toplam 11 yıl) bittiğinde kullanılabilir.',
      law4Title: '4. Tahliye Taahhütnamesinin Geçerlilik Şartları',
      law4Body: 'Kira sözleşmesiyle aynı gün veya taşınmaz teslim edilmeden önce imzalanan tahliye taahhütnameleri yargıtay içtihatlarınca geçersiz sayılmaktadır.',
      law5Title: '5. Bankadan Ödeme Zorunluluğu ve Arabuluculuk',
      law5Body: 'Kira ödemeleri banka aracılığıyla "Kira Bedeli" açıklamasıyla yapılmalıdır. Kira uyuşmazlıklarında dava açmadan önce adliyelerdeki zorunlu arabuluculuk sürecinin tüketilmesi kanuni şarttır.',
      faqTitle: 'Kira Artışı ve Tahliye Hakkında Sıkça Sorulan Sorular',
      faq1Q: 'Ev sahibi TÜFE oranının üzerinde zam isterse ne yapmalıyım?',
      faq1A: 'TÜFE üzerindeki talepleri kabul etmek zorunda değilsiniz. Mevcut kiranıza yasal TÜFE oranını ekleyerek bankadan düzenli ödediğiniz sürece ev sahibi sizi haksız yere tahliye edemez.',
      faq2Q: 'Yeni kira artış oranı her ay ne zaman açıklanır?',
      faq2A: 'TÜİK her ayın 3. gününde saat 10:00\'da enflasyon verilerini duyurur ve o ay geçerli olacak 12 aylık TÜFE tavan oranı kesinleşir.',
      faq3Q: 'İşyerleri için de aynı oran mı geçerlidir?',
      faq3A: 'Evet, Türk Borçlar Kanunu Madde 344 uyarınca konut ve çatılı işyerleri için aynı 12 aylık TÜFE ortalaması tavan olarak uygulanır.'
    },
    ru: {
      metaTitle: 'Калькулятор повышения аренды в Турции 2026 | Официальный лимит TÜİK TÜFE',
      metaDesc: 'Калькулятор законного повышения арендной платы в Турции 2026. Расчет максимального повышения аренды жилья и коммерческой недвижимости по данным инфляции TÜİK.',
      heroBadge: 'Официальный лимит 2026',
      heroTitle: 'Калькулятор законного повышения аренды в Турции 2026',
      heroSubtitle: 'Рассчитайте новую стоимость аренды и законный лимит повышения в турецких лирах на основе официальных данных инфляции TÜİK.',
      currentActiveRateText: `Официальный лимит на ${latestRate.monthName.en}:`,
      calcCardTitle: 'Рассчитать новую арендную плату',
      currentRentLabel: 'Текущая арендная плата в месяц (TRY ₺)',
      currentRentPlh: 'Например: 25000',
      monthSelectLabel: 'Месяц продления договора',
      propertyTypeLabel: 'Тип недвижимости',
      typeHome: 'Жилая недвижимость (Konut)',
      typeOffice: 'Коммерческая недвижимость (İşyeri)',
      tenureLabel: 'Срок проживания в объекте',
      tenureUnder5: 'Менее 5 лет (Строгий лимит TÜFE)',
      tenureOver5: '5 лет и более (Возможен иск о пересмотре ставки)',
      calculateBtn: 'Рассчитать новую аренду ⚡',
      resultsTitle: 'Результаты расчета законной аренды',
      statNewRent: 'Новая ежемесячная аренда',
      statIncreaseAmount: 'Сумма ежемесячного повышения',
      statOldRent: 'Текущая аренда',
      statRateApplied: 'Законный лимит инфляции (TÜFE)',
      statAnnualDifference: 'Годовая разница в стоимости',
      statAnnualTotal: 'Новая годовая стоимость аренды',
      generateNoticeBtn: '📄 Создать официальное уведомление об аренде',
      copyNotice: 'Скопировать текст уведомления',
      noticeCopied: 'Уведомление скопировано!',
      historicalTableTitle: 'Таблица ставок повышения аренды в Турции (2025 - 2026)',
      colMonth: 'Месяц продления',
      colRate: 'Максимальный лимит повышения',
      colStatus: 'Статус',
      statusOfficial: 'Официальный (TÜİK)',
      statusProjected: 'Прогнозный',
      legalRightsTitle: 'Права арендатора в Турции по закону TBK',
      law1Title: '1. Отмена лимита 25% и возврат к TÜFE',
      law1Body: 'С июля 2024 года временный лимит в 25% отменен. Повышение аренды строго привязано к 12-месячному среднему значению инфляции TÜFE.',
      law2Title: '2. Правило 5 лет и иск об определении аренды',
      law2Body: 'В первые 5 лет арендодатель не может требовать рыночной ставки. После 5 лет возможно судебное разбирательство.',
      law3Title: '3. 10 лет автоматического продления',
      law3Body: 'Договор продлевается автоматически каждый год. Выселение без веской причины возможно только по истечении 10 лет продления.',
      law4Title: '4. Условия действительности обязательства о выселении',
      law4Body: 'Обязательство о выселении, подписанное в день договора, не имеет юридической силы.',
      law5Title: '5. Оплата через банк и обязательная медиация',
      law5Body: 'Оплата аренды должна производиться только через банковский перевод с указанием назначения платежа.',
      faqTitle: 'Частые вопросы об аренде в Турции',
      faq1Q: 'Что делать, если хозяин требует больше официальной ставки?',
      faq1A: 'Вы имеете полное право платить законную сумму с официальным повышением по банку.',
      faq2Q: 'Когда публикуется новая ставка каждый месяц?',
      faq2A: 'TÜİK публикует официальные данные 3-го числа каждого месяца в 10:00.',
      faq3Q: 'Действует ли эта ставка для офисов и магазинов?',
      faq3A: 'Да, лимит одинаков для жилья и коммерческих помещений.'
    },
    fa: {
      metaTitle: 'محاسبه‌گر نرخ قانونی افزایش اجاره در ترکیه ۲۰۲۶ | سقف تورم TÜİK',
      metaDesc: 'محاسبه درصد قانونی افزایش اجاره خانه و مغازه در ترکیه بر اساس نرخ تورم ۱۲ ماهه TÜİK برای سال ۲۰۲۶. راهنمای حقوق مستأجر و متن اخطاریه رسمی.',
      heroBadge: 'نرخ رسمی مصوب ۲۰۲۶',
      heroTitle: 'محاسبه‌گر نرخ قانونی افزایش اجاره در ترکیه ۲۰۲۶',
      heroSubtitle: 'محاسبه دقیق اجاره جدید و سقف افزایش مجاز طبق شاخص تورم ۱۲ ماهه TÜİK و قانون تعهدات ترکیه.',
      currentActiveRateText: `سقف قانونی مصوب برای ${latestRate.monthName.ar}:`,
      calcCardTitle: 'محاسبه اجاره جدید',
      currentRentLabel: 'اجاره ماهانه فعلی (لیر ترکیه ₺)',
      currentRentPlh: 'مثال: ۲۵۰۰۰',
      monthSelectLabel: 'ماه تمدید قرارداد',
      propertyTypeLabel: 'نوع ملک',
      typeHome: 'مسکونی (Konut)',
      typeOffice: 'تجاری / دفتر (İşyeri)',
      tenureLabel: 'مدت سکونت در ملک',
      tenureUnder5: 'کمتر از ۵ سال (سقف قانونی TÜFE الزامی است)',
      tenureOver5: '۵ سال یا بیشتر (امکان طرح دعوای تعیین اجاره)',
      calculateBtn: 'محاسبه اجاره جدید ⚡',
      resultsTitle: 'نتایج محاسبه اجاره قانونی',
      statNewRent: 'اجاره ماهانه جدید',
      statIncreaseAmount: 'مبلغ افزایش ماهانه',
      statOldRent: 'اجاره فعلی',
      statRateApplied: 'نرخ قانونی تورم (TÜFE)',
      statAnnualDifference: 'مجموع افزایش سالانه',
      statAnnualTotal: 'مجموع اجاره سالانه جدید',
      generateNoticeBtn: '📄 ایجاد اخطاریه رسمی افزایش اجاره',
      copyNotice: 'کپی متن اخطاریه',
      noticeCopied: 'متن کپی شد!',
      historicalTableTitle: 'جدول رسمی نرخ افزایش اجاره ماهانه در ترکیه (۲۰۲۵ - ۲۰۲۶)',
      colMonth: 'ماه تمدید',
      colRate: 'حداکثر سقف قانونی افزایش',
      colStatus: 'وضعیت',
      statusOfficial: 'رسمی (TÜİK)',
      statusProjected: 'برآوردی / پیش‌بینی',
      legalRightsTitle: 'حقوق و حمایت‌های قانونی از مستأجر در ترکیه (TBK)',
      law1Title: '۱. لغو سقف ۲۵٪ و بازگشت به شاخص تورم TÜFE',
      law1Body: 'سقف ۲۵ درصدی از ژوئیه ۲۰۲۴ لغو شد و اکنون میانگین تورم ۱۲ ماهه TÜİK حداکثر سقف قانونی است.',
      law2Title: '۲. قانون ۵ سال و دعوای تعیین اجاره',
      law2Body: 'در ۵ سال اول، مالک نمی‌تواند اجاره هم‌تراز بازار بخواهد؛ پس از ۵ سال می‌تواند به دادگاه مراجعه کند.',
      law3Title: '۳. تمدید خودکار قرارداد تا ۱۰ سال',
      law3Body: 'قرارداد اجاره سالانه به صورت خودکار تمدید می‌شود و مالک نمی‌تواند صرفاً به دلیل اتمام سال مستأجر را تخلیه کند.',
      law4Title: '۴. شرایط اعتبار برگه تعهد تخلیه',
      law4Body: 'تعهد تخلیه‌ای که در روز عقد قرارداد امضا شده باشد، در دادگاه باطل است.',
      law5Title: '۵. الزام به واریز بانکی و میانجی‌گری',
      law5Body: 'اجاره باید حتماً از طریق حساب بانکی با قید عنوان اجاره پرداخت شود.',
      faqTitle: 'پرسش‌های متداول در مورد اجاره در ترکیه',
      faq1Q: 'اگر صاحبخانه افزایش بالاتری از نرخ قانونی بخواهد چه کنیم؟',
      faq1A: 'شما ملزم به پذیرش نیستید و می‌توانید فقط نرخ قانونی را از طریق بانک پرداخت کنید.',
      faq2Q: 'نرخ جدید هر ماه چه زمانی اعلام می‌شود؟',
      faq2A: 'سازمان آمار ترکیه در سومین روز هر ماه میلادی ساعت ۱۰ صبح نرخ را اعلام می‌کند.',
      faq3Q: 'آیا این نرخ برای دفاتر و مغازه‌ها هم صدق می‌کند؟',
      faq3A: 'بله، سقف تورم ۱۲ ماهه برای املاک مسکونی و تجاری یکسان است.'
    },
    ur: {
      metaTitle: 'ترکی میں کرایہ میں قانونی اضافے کا کیلکولیٹر 2026 | سرکاری TÜİK شرح',
      metaDesc: 'ترکی میں قانونی کرایہ میں اضافے کا درست کیلکولیٹر 2026۔ TÜİK افراطِ زر کے مطابق گھروں اور دکانوں کے کرائے میں اضافے کی شرح اور قانونی رہنمائی۔',
      heroBadge: 'سرکاری قانونی شرح 2026',
      heroTitle: 'ترکی میں قانونی کرایہ اضافہ کیلکولیٹر 2026',
      heroSubtitle: 'ترک شماریاتی ادارے (TÜİK) کے افراط زر انڈیکس کے مطابق نیا کرایہ اور زیادہ سے زیادہ قانونی اضافہ معلوم کریں۔',
      currentActiveRateText: `سرکاری قانونی شرح برائے ${latestRate.monthName.en}:`,
      calcCardTitle: 'اپنا نیا کرایہ معلوم کریں',
      currentRentLabel: 'موجودہ ماہانہ کرایہ (ترکش لیرا ₺)',
      currentRentPlh: 'مثال: 25000',
      monthSelectLabel: 'معاہدے کی تجدید کا مہینہ',
      propertyTypeLabel: 'جائیداد کی قسم',
      typeHome: 'رہائشی مکان (Konut)',
      typeOffice: 'کمرشل / دکان (İşyeri)',
      tenureLabel: 'جائیداد میں رہائش کا عرصہ',
      tenureUnder5: '5 سال سے کم (سرکاری TÜFE کی حد لاگو ہے)',
      tenureOver5: '5 سال یا اس سے زیادہ (عدالتی کیس کا حق)',
      calculateBtn: 'نیا کرایہ معلوم کریں ⚡',
      resultsTitle: 'قانونی کرایہ کا حساب',
      statNewRent: 'نیا ماہانہ کرایہ',
      statIncreaseAmount: 'ماہانہ اضافہ',
      statOldRent: 'موجودہ کرایہ',
      statRateApplied: 'لاگو افراط زر کی شرح (TÜFE)',
      statAnnualDifference: 'سالانہ اضافی لاگت',
      statAnnualTotal: 'نیا کل سالانہ کرایہ',
      generateNoticeBtn: '📄 باضابطہ کرایہ نوٹس تیار کریں',
      copyNotice: 'نوٹس کاپی کریں',
      noticeCopied: 'نوٹس کاپی ہو گیا!',
      historicalTableTitle: 'ترکی میں ماہانہ کرایہ اضافے کا سرکاری جدول (2025 - 2026)',
      colMonth: 'مہینہ',
      colRate: 'زیادہ سے زیادہ قانونی اضافہ',
      colStatus: 'حیثیت',
      statusOfficial: 'سرکاری (TÜİK)',
      statusProjected: 'تخمینہ',
      legalRightsTitle: 'ترک کرایہ داری قانون (TBK) کے تحت کرایہ دار کے حقوق',
      law1Title: '1. 25 فیصد کی پرانی حد کا خاتمہ اور TÜFE پر واپسی',
      law1Body: 'جولائی 2024 سے 25 فیصد کی پرانی حد ختم ہو چکی ہے۔ اب زیادہ سے زیادہ اضافہ TÜİK کے 12 ماہ کے اوسط افراط زر کے مطابق ہوگا۔',
      law2Title: '2. 5 سال کا اصول اور کرایہ تعین کا مقدمہ',
      law2Body: 'پہلے 5 سالوں میں مالک مکان مارکیٹ ریٹ کا مطالبہ نہیں کر سکتا۔ 5 سال بعد ہی وہ عدالت جا سکتا ہے۔',
      law3Title: '3. 10 سالہ خودکار تجدید کا تحفظ',
      law3Body: 'معاہدہ ہر سال خودکار طریقے سے مزید ایک سال کے لیے تجدید ہو جاتا ہے۔',
      law4Title: '4. مکان خالی کرنے کے اقرار نامے کی شرائط',
      law4Body: 'اگر اقرار نامہ کرایہ کے معاہدے والے دن ہی دستخط کروایا گیا ہو تو وہ عدالت میں کالعدم تصور ہوتا ہے۔',
      law5Title: '5. بینک کے ذریعے ادائیگی کی لازمی شرط',
      law5Body: 'کرایہ ہمیشہ سرکاری بینک اکاؤنٹ سے منتقل کریں اور تفصیل میں کرایہ تحریر کریں۔',
      faqTitle: 'ترکی میں کرائے سے متعلق اکثر پوچھے گئے سوالات',
      faq1Q: 'اگر مالک مکان سرکاری شرح سے زیادہ مانگے تو کیا کریں؟',
      faq1A: 'آپ انکار کر سکتے ہیں اور بینک کے ذریعے صرف قانونی شرح کے مطابق ادائیگی جاری رکھ سکتے ہیں۔',
      faq2Q: 'نئی شرح ہر ماہ کب جاری ہوتی ہے؟',
      faq2A: 'TÜİK ہر ماہ کی 3 تاریخ کو صبح 10 بجے سرکاری اعداد و شمار جاری کرتا ہے۔',
      faq3Q: 'کیا دکانوں پر بھی یہی شرح لاگو ہوتی ہے؟',
      faq3A: 'جی ہاں، رہائشی اور تجارتی دونوں جائیدادوں کے لیے یہی شرح لاگو ہوتی ہے۔'
    }
  }[locale] || {
    metaTitle: 'Turkey Legal Rent Increase Calculator 2026',
    metaDesc: 'Calculate legal rent increases in Turkey.',
    heroBadge: 'Official Legal Rate 2026',
    heroTitle: 'Turkey Legal Rent Increase Calculator 2026',
    heroSubtitle: 'Calculate legal rent increases in Turkey.',
    currentActiveRateText: 'Active Rate:',
    calcCardTitle: 'Calculate Your New Rent',
    currentRentLabel: 'Current Monthly Rent (TRY ₺)',
    currentRentPlh: '25000',
    monthSelectLabel: 'Renewal Month',
    propertyTypeLabel: 'Property Type',
    typeHome: 'Residential Housing',
    typeOffice: 'Commercial / Office',
    tenureLabel: 'Tenure',
    tenureUnder5: 'Under 5 years',
    tenureOver5: '5 years or more',
    calculateBtn: 'Calculate New Rent',
    resultsTitle: 'Results',
    statNewRent: 'New Monthly Rent',
    statIncreaseAmount: 'Monthly Increase',
    statOldRent: 'Current Rent',
    statRateApplied: 'Applied Rate',
    statAnnualDifference: 'Annual Difference',
    statAnnualTotal: 'New Annual Total',
    generateNoticeBtn: 'Generate Notice',
    copyNotice: 'Copy Notice',
    noticeCopied: 'Copied!',
    historicalTableTitle: 'Official Rates Table',
    colMonth: 'Month',
    colRate: 'Legal Rate Cap',
    colStatus: 'Status',
    statusOfficial: 'Official',
    statusProjected: 'Projected',
    legalRightsTitle: 'Tenant Rights in Turkey',
    law1Title: 'TÜFE Inflation Cap',
    law1Body: 'The 12-month average TÜFE cap strictly applies.',
    law2Title: '5-Year Rule',
    law2Body: 'Market peer lawsuits only after 5 years.',
    law3Title: '10-Year Protection',
    law3Body: 'Automatic 1-year renewals up to 10 extension years.',
    law4Title: 'Eviction Commitment',
    law4Body: 'Must not be signed on lease start date.',
    law5Title: 'Bank Payment',
    law5Body: 'Always transfer via official bank accounts.',
    faqTitle: 'FAQ',
    faq1Q: 'Can landlord demand more?',
    faq1A: 'No, anything above TÜFE is illegal.',
    faq2Q: 'When is rate announced?',
    faq2A: 'On the 3rd of each month.',
    faq3Q: 'Does it apply to commercial?',
    faq3A: 'Yes, same cap applies.'
  };

  // Structured Data Schema for Google Search
  const schemaWebAppContext = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': t.heroTitle,
    'description': t.metaDesc,
    'applicationCategory': 'FinanceApplication',
    'operatingSystem': 'All',
    'url': `https://jobs-in-istanbul.com/${locale}/kira-artis-orani`
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': t.faq1Q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t.faq1A
        }
      },
      {
        '@type': 'Question',
        'name': t.faq2Q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t.faq2A
        }
      },
      {
        '@type': 'Question',
        'name': t.faq3Q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': t.faq3A
        }
      }
    ]
  };

  const seoMetaTags = `
    <title>${t.metaTitle}</title>
    <meta name="description" content="${t.metaDesc}">
    <link rel="canonical" href="https://jobs-in-istanbul.com/${locale}/kira-artis-orani">
    <link rel="alternate" hreflang="ar" href="https://jobs-in-istanbul.com/ar/kira-artis-orani" />
    <link rel="alternate" hreflang="en" href="https://jobs-in-istanbul.com/en/kira-artis-orani" />
    <link rel="alternate" hreflang="tr" href="https://jobs-in-istanbul.com/tr/kira-artis-orani" />
    <link rel="alternate" hreflang="x-default" href="https://jobs-in-istanbul.com/ar/kira-artis-orani" />
    <meta property="og:title" content="${t.metaTitle}">
    <meta property="og:description" content="${t.metaDesc}">
    <meta property="og:url" content="https://jobs-in-istanbul.com/${locale}/kira-artis-orani">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${locale === 'ar' ? 'ar_AR' : (locale === 'tr' ? 'tr_TR' : 'en_US')}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${t.metaTitle}">
    <meta name="twitter:description" content="${t.metaDesc}">
    <script type="application/ld+json">${JSON.stringify(schemaWebAppContext)}</script>
    <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  `;

  const html = `
    <style>
      .kira-calc-wrapper {
        direction: ${isRtl ? 'rtl' : 'ltr'};
        font-family: inherit;
        color: var(--text-dark, #1e293b);
      }

      .kira-hero {
        background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 50%, #0284c7 100%);
        color: white;
        padding: 48px 24px 40px;
        border-radius: 28px;
        margin-bottom: 32px;
        box-shadow: 0 16px 40px rgba(3, 105, 161, 0.22);
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      .kira-hero::after {
        content: '';
        position: absolute;
        bottom: -50px;
        ${isRtl ? 'left: -50px;' : 'right: -50px;'}
        width: 280px;
        height: 280px;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(255,255,255,0) 70%);
        pointer-events: none;
      }

      .kira-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(8px);
        padding: 6px 18px;
        border-radius: 30px;
        font-size: 0.86rem;
        font-weight: 800;
        border: 1px solid rgba(255, 255, 255, 0.25);
        margin-bottom: 16px;
      }

      .hero-title {
        font-size: clamp(1.8rem, 4vw, 2.7rem);
        font-weight: 900;
        line-height: 1.25;
        margin-bottom: 12px;
      }

      .hero-subtitle {
        font-size: 1.05rem;
        line-height: 1.6;
        opacity: 0.94;
        max-width: 820px;
        margin-bottom: 24px;
      }

      .highlight-rate-box {
        display: inline-flex;
        align-items: center;
        gap: 16px;
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.25);
        padding: 14px 24px;
        border-radius: 18px;
        backdrop-filter: blur(10px);
        margin-top: 6px;
        flex-wrap: wrap;
      }

      .rate-percentage-badge {
        font-size: 2rem;
        font-weight: 900;
        color: #38bdf8;
        line-height: 1;
      }

      /* Calculator Card */
      .calculator-main-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;
        margin-bottom: 40px;
      }

      @media (max-width: 860px) {
        .calculator-main-grid {
          grid-template-columns: 1fr;
        }
      }

      .calculator-inputs-card {
        background: var(--bg-card, #ffffff);
        border: 1.5px solid var(--border, #e2e8f0);
        border-radius: 24px;
        padding: 32px 28px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
      }

      .card-heading {
        font-size: 1.35rem;
        font-weight: 900;
        margin-bottom: 24px;
        color: var(--text-heading, #0f172a);
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-label {
        display: block;
        font-weight: 800;
        font-size: 0.92rem;
        margin-bottom: 8px;
        color: var(--text-dark, #334155);
      }

      .form-input, .form-select {
        width: 100%;
        padding: 14px 18px;
        border-radius: 14px;
        border: 1.5px solid var(--border, #cbd5e1);
        font-size: 1.05rem;
        font-family: inherit;
        outline: none;
        transition: all 0.2s ease;
        background: var(--bg-input, #f8fafc);
        color: var(--text-dark, #0f172a);
      }

      .form-input:focus, .form-select:focus {
        border-color: #0284c7;
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.12);
      }

      .segmented-radio-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .radio-label-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1.5px solid var(--border, #cbd5e1);
        background: var(--bg-subtle, #f8fafc);
        color: var(--text-muted, #475569);
        font-weight: 800;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .radio-label-btn.active {
        background: #0284c7;
        color: white;
        border-color: #0284c7;
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25);
      }

      /* Results Card */
      .calculator-results-card {
        background: var(--bg-card, #ffffff);
        border: 1.5px solid var(--border, #e2e8f0);
        border-radius: 24px;
        padding: 32px 28px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .primary-result-box {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        color: white;
        border-radius: 20px;
        padding: 24px;
        text-align: center;
        margin-bottom: 24px;
        box-shadow: 0 8px 24px rgba(2, 132, 199, 0.28);
      }

      .result-label-sub {
        font-size: 0.88rem;
        font-weight: 700;
        opacity: 0.9;
        margin-bottom: 6px;
      }

      .result-main-number {
        font-size: clamp(2rem, 3.5vw, 2.7rem);
        font-weight: 900;
        letter-spacing: -0.5px;
      }

      .stats-breakdown-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-bottom: 24px;
      }

      .stat-mini-card {
        background: var(--bg-subtle, #f8fafc);
        border: 1px solid var(--border, #e2e8f0);
        border-radius: 14px;
        padding: 14px 16px;
      }

      .stat-mini-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-muted, #64748b);
        margin-bottom: 4px;
      }

      .stat-mini-val {
        font-size: 1.15rem;
        font-weight: 900;
        color: var(--text-dark, #0f172a);
      }

      .stat-mini-val.accent-green {
        color: #059669;
      }

      .btn-generate-notice {
        width: 100%;
        padding: 14px 20px;
        border-radius: 14px;
        border: none;
        background: #0f172a;
        color: #ffffff;
        font-weight: 800;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18);
      }

      .btn-generate-notice:hover {
        background: #1e293b;
        transform: translateY(-2px);
      }

      /* Notice Modal / Box */
      #notice-output-container {
        display: none;
        margin-top: 20px;
        background: #f8fafc;
        border: 1.5px dashed #0284c7;
        border-radius: 16px;
        padding: 20px;
        font-size: 0.92rem;
        line-height: 1.6;
        white-space: pre-wrap;
      }

      /* Historical Table */
      .history-section {
        background: var(--bg-card, #ffffff);
        border: 1.5px solid var(--border, #e2e8f0);
        border-radius: 24px;
        padding: 36px 30px;
        margin-bottom: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
      }

      .rates-table-container {
        overflow-x: auto;
        border-radius: 16px;
        border: 1px solid var(--border, #e2e8f0);
      }

      .rates-table {
        width: 100%;
        border-collapse: collapse;
        text-align: ${isRtl ? 'right' : 'left'};
      }

      .rates-table th {
        background: #f1f5f9;
        padding: 14px 20px;
        font-weight: 800;
        font-size: 0.88rem;
        color: #334155;
        border-bottom: 1px solid var(--border, #e2e8f0);
      }

      .rates-table td {
        padding: 14px 20px;
        font-size: 0.95rem;
        border-bottom: 1px solid var(--border, #e2e8f0);
        font-weight: 600;
      }

      .rates-table tr:hover {
        background: #f8fafc;
      }

      .rate-status-tag {
        display: inline-block;
        font-size: 0.74rem;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 12px;
      }

      .tag-official {
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
      }

      .tag-projected {
        background: #eff6ff;
        color: #2563eb;
        border: 1px solid #bfdbfe;
      }

      /* Legal Rights Cards */
      .legal-section {
        background: var(--bg-card, #ffffff);
        border: 1.5px solid var(--border, #e2e8f0);
        border-radius: 24px;
        padding: 36px 30px;
        margin-bottom: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
      }

      .legal-articles-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 24px;
      }

      @media (max-width: 768px) {
        .legal-articles-grid {
          grid-template-columns: 1fr;
        }
      }

      .legal-card {
        background: var(--bg-subtle, #f8fafc);
        border: 1px solid var(--border, #e2e8f0);
        border-radius: 18px;
        padding: 22px;
        transition: transform 0.2s;
      }

      .legal-card:hover {
        transform: translateY(-2px);
        border-color: #0284c7;
      }

      .legal-card-title {
        font-size: 1.08rem;
        font-weight: 900;
        color: #0284c7;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .legal-card-body {
        font-size: 0.92rem;
        line-height: 1.65;
        color: var(--text-dark, #334155);
      }

      /* FAQ Section */
      .faq-section {
        background: var(--bg-card, #ffffff);
        border: 1.5px solid var(--border, #e2e8f0);
        border-radius: 24px;
        padding: 36px 30px;
        margin-bottom: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
      }

      .faq-item {
        border-bottom: 1px solid var(--border, #e2e8f0);
        padding: 20px 0;
      }

      .faq-item:last-child {
        border-bottom: none;
      }

      .faq-q {
        font-weight: 800;
        font-size: 1.1rem;
        color: #0369a1;
        margin-bottom: 8px;
      }

      .faq-a {
        font-size: 0.95rem;
        line-height: 1.65;
        color: var(--text-dark, #334155);
      }

      /* Toast */
      #toast-notice {
        position: fixed;
        bottom: 24px;
        ${isRtl ? 'left: 24px;' : 'right: 24px;'}
        background: #0284c7;
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 0.9rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        z-index: 9999;
        display: none;
        align-items: center;
        gap: 8px;
      }
    </style>

    <div class="kira-calc-wrapper">
      
      <!-- Hero Header -->
      <section class="kira-hero">
        <div class="kira-badge">
          <span>🏛️ ${t.heroBadge}</span>
        </div>
        <h1 class="hero-title">${t.heroTitle}</h1>
        <p class="hero-subtitle">${t.heroSubtitle}</p>

        <div class="highlight-rate-box">
          <div>
            <div style="font-size: 0.85rem; font-weight: 700; opacity: 0.88;">${t.currentActiveRateText}</div>
            <div style="font-size: 1.05rem; font-weight: 800;">${locale === 'ar' ? latestRate.monthName.ar : (locale === 'tr' ? latestRate.monthName.tr : latestRate.monthName.en)}</div>
          </div>
          <div class="rate-percentage-badge">%${latestRate.rate.toFixed(2)}</div>
        </div>
      </section>

      <!-- Calculator Section -->
      <section class="calculator-main-grid">
        
        <!-- Input Form -->
        <div class="calculator-inputs-card">
          <h2 class="card-heading">
            <span>⚙️</span>
            <span>${t.calcCardTitle}</span>
          </h2>

          <div class="form-group">
            <label class="form-label">${t.currentRentLabel}</label>
            <input 
              type="number" 
              id="input-current-rent" 
              class="form-input" 
              placeholder="${t.currentRentPlh}"
              value="25000"
              min="0"
              step="100"
            />
          </div>

          <div class="form-group">
            <label class="form-label">${t.monthSelectLabel}</label>
            <select id="select-month" class="form-select">
              ${OFFICIAL_TUIK_RENT_RATES.map((r, i) => {
                const isSelected = i === 2 ? 'selected' : '';
                const monthTitle = locale === 'ar' ? r.monthName.ar : (locale === 'tr' ? r.monthName.tr : r.monthName.en);
                return `
                  <option value="${r.rate}" data-month="${r.year}-${String(r.month).padStart(2, '0')}" ${isSelected}>
                    ${monthTitle} — (%${r.rate.toFixed(2)})
                  </option>
                `;
              }).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${t.propertyTypeLabel}</label>
            <div class="segmented-radio-group">
              <button type="button" class="radio-label-btn active" data-type="home">${t.typeHome}</button>
              <button type="button" class="radio-label-btn" data-type="office">${t.typeOffice}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">${t.tenureLabel}</label>
            <select id="select-tenure" class="form-select">
              <option value="under5">${t.tenureUnder5}</option>
              <option value="over5">${t.tenureOver5}</option>
            </select>
          </div>
        </div>

        <!-- Output Results Card -->
        <div class="calculator-results-card">
          <div>
            <h2 class="card-heading">
              <span>📊</span>
              <span>${t.resultsTitle}</span>
            </h2>

            <div class="primary-result-box">
              <div class="result-label-sub">${t.statNewRent}</div>
              <div class="result-main-number" id="result-new-rent">37,037.50 ₺</div>
            </div>

            <div class="stats-breakdown-grid">
              <div class="stat-mini-card">
                <div class="stat-mini-label">${t.statIncreaseAmount}</div>
                <div class="stat-mini-val accent-green" id="result-increase-amount">+12,037.50 ₺</div>
              </div>
              <div class="stat-mini-card">
                <div class="stat-mini-label">${t.statRateApplied}</div>
                <div class="stat-mini-val" id="result-applied-rate">%48.15</div>
              </div>
              <div class="stat-mini-card">
                <div class="stat-mini-label">${t.statOldRent}</div>
                <div class="stat-mini-val" id="result-old-rent">25,000.00 ₺</div>
              </div>
              <div class="stat-mini-card">
                <div class="stat-mini-label">${t.statAnnualDifference}</div>
                <div class="stat-mini-val" id="result-annual-diff">144,450.00 ₺</div>
              </div>
            </div>
          </div>

          <div>
            <button id="btn-show-notice" class="btn-generate-notice">
              ${t.generateNoticeBtn}
            </button>

            <div id="notice-output-container">
              <div id="notice-text"></div>
              <button id="btn-copy-notice" class="radio-label-btn active" style="margin-top: 14px; width: 100%;">
                📋 ${t.copyNotice}
              </button>
            </div>
          </div>
        </div>

      </section>

      <!-- Historical Rates Table -->
      <section class="history-section">
        <h2 class="card-heading">
          <span>📅</span>
          <span>${t.historicalTableTitle}</span>
        </h2>

        <div class="rates-table-container">
          <table class="rates-table">
            <thead>
              <tr>
                <th>${t.colMonth}</th>
                <th>${t.colRate}</th>
                <th>${t.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              ${OFFICIAL_TUIK_RENT_RATES.map(r => {
                const monthTitle = locale === 'ar' ? r.monthName.ar : (locale === 'tr' ? r.monthName.tr : r.monthName.en);
                const tagClass = r.status === 'official' ? 'tag-official' : 'tag-projected';
                const tagText = r.status === 'official' ? t.statusOfficial : t.statusProjected;
                return `
                  <tr>
                    <td><strong>${monthTitle}</strong></td>
                    <td style="color: #0284c7; font-weight: 800; font-size: 1.05rem;">%${r.rate.toFixed(2)}</td>
                    <td><span class="rate-status-tag ${tagClass}">${tagText}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Legal Protection & Tenant Rights -->
      <section class="legal-section">
        <h2 class="card-heading">
          <span>⚖️</span>
          <span>${t.legalRightsTitle}</span>
        </h2>

        <div class="legal-articles-grid">
          <div class="legal-card">
            <h3 class="legal-card-title">📌 ${t.law1Title}</h3>
            <p class="legal-card-body">${t.law1Body}</p>
          </div>
          <div class="legal-card">
            <h3 class="legal-card-title">📌 ${t.law2Title}</h3>
            <p class="legal-card-body">${t.law2Body}</p>
          </div>
          <div class="legal-card">
            <h3 class="legal-card-title">📌 ${t.law3Title}</h3>
            <p class="legal-card-body">${t.law3Body}</p>
          </div>
          <div class="legal-card">
            <h3 class="legal-card-title">📌 ${t.law4Title}</h3>
            <p class="legal-card-body">${t.law4Body}</p>
          </div>
          <div class="legal-card" style="grid-column: span 2;">
            <h3 class="legal-card-title">📌 ${t.law5Title}</h3>
            <p class="legal-card-body">${t.law5Body}</p>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <h2 class="card-heading">
          <span>❓</span>
          <span>${t.faqTitle}</span>
        </h2>

        <div class="faq-item">
          <div class="faq-q">${t.faq1Q}</div>
          <div class="faq-a">${t.faq1A}</div>
        </div>
        <div class="faq-item">
          <div class="faq-q">${t.faq2Q}</div>
          <div class="faq-a">${t.faq2A}</div>
        </div>
        <div class="faq-item">
          <div class="faq-q">${t.faq3Q}</div>
          <div class="faq-a">${t.faq3A}</div>
        </div>
      </section>

    </div>

    <!-- Toast Notice -->
    <div id="toast-notice">
      <span>✓</span>
      <span>${t.noticeCopied}</span>
    </div>

    <!-- Reactive Live Calculation Script -->
    <script>
      (function() {
        const rentInput = document.getElementById('input-current-rent');
        const monthSelect = document.getElementById('select-month');
        const tenureSelect = document.getElementById('select-tenure');
        const typeBtns = document.querySelectorAll('.segmented-radio-group .radio-label-btn');

        const resNewRent = document.getElementById('result-new-rent');
        const resIncreaseAmount = document.getElementById('result-increase-amount');
        const resAppliedRate = document.getElementById('result-applied-rate');
        const resOldRent = document.getElementById('result-old-rent');
        const resAnnualDiff = document.getElementById('result-annual-diff');

        const btnShowNotice = document.getElementById('btn-show-notice');
        const noticeContainer = document.getElementById('notice-output-container');
        const noticeText = document.getElementById('notice-text');
        const btnCopyNotice = document.getElementById('btn-copy-notice');
        const toast = document.getElementById('toast-notice');

        let propertyType = 'home';

        typeBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            propertyType = btn.getAttribute('data-type');
            recalculate();
          });
        });

        function formatMoney(amount) {
          return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(amount) + ' ₺';
        }

        function recalculate() {
          const rentVal = parseFloat(rentInput.value) || 0;
          const rateVal = parseFloat(monthSelect.value) || 0;

          const increase = rentVal * (rateVal / 100);
          const newRent = rentVal + increase;
          const annualDiff = increase * 12;

          resNewRent.textContent = formatMoney(newRent);
          resIncreaseAmount.textContent = '+' + formatMoney(increase);
          resAppliedRate.textContent = '%' + rateVal.toFixed(2);
          resOldRent.textContent = formatMoney(rentVal);
          resAnnualDiff.textContent = formatMoney(annualDiff);

          // Update notice if open
          if (noticeContainer.style.display === 'block') {
            generateNoticeContent(rentVal, rateVal, newRent, increase);
          }
        }

        function generateNoticeContent(rentVal, rateVal, newRent, increase) {
          const selectedMonthName = monthSelect.options[monthSelect.selectedIndex].text.split('—')[0].trim();
          
          let template = '';
          if ('${locale}' === 'tr') {
            template = 
              "SAYIN KİRAYA VEREN / KİRACI,\\n\\n" +
              "Türk Borçlar Kanunu (TBK) Madde 344 uyarınca, " + selectedMonthName + " kira yenileme dönemi için Türkiye İstatistik Kurumu (TÜİK) tarafından açıklanan 12 aylık TÜFE ortalama artış tavan oranı %" + rateVal.toFixed(2) + " olarak kesinleşmiştir.\\n\\n" +
              "KİRA HESAPLAMA DETAYLARI:\\n" +
              "• Mevcut Aylık Kira: " + formatMoney(rentVal) + "\\n" +
              "• Yasal Artış Oranı (TÜFE): %" + rateVal.toFixed(2) + "\\n" +
              "• Aylık Artış Tutarı: " + formatMoney(increase) + "\\n" +
              "• Yeni Aylık Kira Bedeli: " + formatMoney(newRent) + "\\n\\n" +
              "Bu doğrultuda ilgili kira döneminden itibaren ödenecek aylık resmi kira bedeli " + formatMoney(newRent) + " olarak belirlenmiştir.\\n\\n" +
              "Saygılarımla.";
          } else if ('${locale}' === 'ar') {
            template = 
              "إشعار رسمي بتحديث بدل الإيجار القانوني\\n\\n" +
              "السيد المؤجر / المستأجر المحترم،\\n\\n" +
              "بناءً على المادة 344 من قانون الالتزامات والعقود التركي (Türk Borçlar Kanunu)، وطبقاً لمعدل التضخم السنوي (TÜFE) لـ 12 شهراً الصادر رسمياً عن هيئة الإحصاء التركية (TÜİK) لشهر " + selectedMonthName + "، فإن النسبة القصوى القانونية للزيادة هي %" + rateVal.toFixed(2) + ".\\n\\n" +
              "تفاصيل الإيجار الجديد:\\n" +
              "• الإيجار الشهري الحالي: " + formatMoney(rentVal) + "\\n" +
              "• نسبة الزيادة القانونية (TÜFE): %" + rateVal.toFixed(2) + "\\n" +
              "• مقدار الزيادة الشهرية: " + formatMoney(increase) + "\\n" +
              "• الإيجار الشهري الجديد الواجب سداده: " + formatMoney(newRent) + "\\n\\n" +
              "وعليه، سيتم تحويل الإيجار الجديد ابتداءً من دورة العقد الحالية عبر الحساب البنكي المعتمد.\\n\\n" +
              "مع فائق الاحترام والتقدير.";
          } else {
            template = 
              "OFFICIAL LEASE RENT INCREASE NOTIFICATION\\n\\n" +
              "Dear Landlord / Tenant,\\n\\n" +
              "Pursuant to Article 344 of the Turkish Code of Obligations (TBK), the official maximum legal rent increase cap for " + selectedMonthName + " based on the 12-month CPI (TÜFE) average announced by TÜİK is %" + rateVal.toFixed(2) + ".\\n\\n" +
              "CALCULATION SUMMARY:\\n" +
              "• Current Monthly Rent: " + formatMoney(rentVal) + "\\n" +
              "• Legal Cap Rate (TÜFE): %" + rateVal.toFixed(2) + "\\n" +
              "• Monthly Increase: " + formatMoney(increase) + "\\n" +
              "• New Monthly Rent: " + formatMoney(newRent) + "\\n\\n" +
              "Accordingly, the new monthly rent payable via bank transfer is determined as " + formatMoney(newRent) + ".\\n\\n" +
              "Sincerely.";
          }

          noticeText.textContent = template;
        }

        btnShowNotice.addEventListener('click', () => {
          noticeContainer.style.display = noticeContainer.style.display === 'block' ? 'none' : 'block';
          if (noticeContainer.style.display === 'block') {
            const rentVal = parseFloat(rentInput.value) || 0;
            const rateVal = parseFloat(monthSelect.value) || 0;
            const increase = rentVal * (rateVal / 100);
            const newRent = rentVal + increase;
            generateNoticeContent(rentVal, rateVal, newRent, increase);
          }
        });

        btnCopyNotice.addEventListener('click', () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(noticeText.textContent).then(showToast);
          } else {
            const ta = document.createElement('textarea');
            ta.value = noticeText.textContent;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast();
          }
        });

        function showToast() {
          if (!toast) return;
          toast.style.display = 'flex';
          setTimeout(() => {
            toast.style.display = 'none';
          }, 2400);
        }

        rentInput.addEventListener('input', recalculate);
        monthSelect.addEventListener('change', recalculate);
        tenureSelect.addEventListener('change', recalculate);

        // Run initial calculation
        recalculate();
      })();
    </script>
  `;

  c.header('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
  return c.html(renderLayout(c, t.metaTitle, html, locale, seoMetaTags));
});
