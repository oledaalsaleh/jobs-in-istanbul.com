import { Hono } from 'hono'
import { renderLayout } from './public'
import { hreflangLinks, ogImageTags, ogLocale, getNativeLocales, canonicalLocaleFor, DEFAULT_OG_IMAGE } from '../utils/seo-links'

export const severanceCalculatorRouter = new Hono()

export interface SeveranceCeilingPeriod {
  period: { ar: string; en: string; tr: string };
  startDate: string;
  endDate: string;
  ceilingTry: number;
  minWageGrossTry: number;
  minWageNetTry: number;
  status: 'active' | 'historical';
}

// Official Turkish Ministry of Treasury & Finance Severance Pay Ceilings (Kıdem Tazminatı Tavanı)
export const OFFICIAL_KIDEM_CEILINGS: SeveranceCeilingPeriod[] = [
  {
    period: {
      ar: 'النصف الثاني 2026 (يوليو – ديسمبر 2026)',
      en: 'H2 2026 (July – December 2026)',
      tr: '2026 İkinci Yarı (Temmuz – Aralık 2026)'
    },
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    ceilingTry: 64948.77,
    minWageGrossTry: 33030.00,
    minWageNetTry: 28075.50,
    status: 'active'
  },
  {
    period: {
      ar: 'النصف الأول 2026 (يناير – يونيو 2026)',
      en: 'H1 2026 (January – June 2026)',
      tr: '2026 Birinci Yarı (Ocak – Haziran 2026)'
    },
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    ceilingTry: 53919.68,
    minWageGrossTry: 33030.00,
    minWageNetTry: 28075.50,
    status: 'historical'
  },
  {
    period: {
      ar: 'النصف الثاني 2025 (يوليو – ديسمبر 2025)',
      en: 'H2 2025 (July – December 2025)',
      tr: '2025 İkinci Yarı (Temmuz – Aralık 2025)'
    },
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    ceilingTry: 43809.96,
    minWageGrossTry: 26005.50,
    minWageNetTry: 22104.67,
    status: 'historical'
  },
  {
    period: {
      ar: 'النصف الأول 2025 (يناير – يونيو 2025)',
      en: 'H1 2025 (January – June 2025)',
      tr: '2025 Birinci Yarı (Ocak – Haziran 2025)'
    },
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    ceilingTry: 35058.58,
    minWageGrossTry: 26005.50,
    minWageNetTry: 22104.67,
    status: 'historical'
  }
];

export const ACTIVE_KIDEM_CEILING_2026 = 64948.77;
export const MIN_WAGE_GROSS_2026 = 33030.00;
export const MIN_WAGE_NET_2026 = 28075.50;
export const STAMP_TAX_RATE = 0.00759; // binde 7,59 Damga Vergisi
export const IHBAR_INCOME_TAX_RATE = 0.15; // 15% Gelir Vergisi base bracket

export interface SeveranceCalculationInput {
  startDate?: string;
  endDate?: string;
  salary?: number;
  salaryType?: 'gross' | 'net';
  foodAllowance?: number;
  transportAllowance?: number;
  bonusMonthly?: number;
  unusedLeaveDays?: number;
  reason?: 'employer_dismissal' | 'just_cause_resignation' | 'retirement_military_marriage' | 'voluntary_resignation';
}

export function calculateSeverancePackage(input: SeveranceCalculationInput) {
  const startStr = input.startDate || '2023-01-01';
  const endStr = input.endDate || '2026-10-01';
  const start = new Date(startStr);
  const end = new Date(endStr);

  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const years = Math.floor(totalDays / 365);
  const remainingDaysAfterYears = totalDays % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;

  const rawSalary = Math.max(0, Number(input.salary) || MIN_WAGE_GROSS_2026);
  const salaryType = input.salaryType === 'net' ? 'net' : 'gross';
  // Convert Net to Gross using standard 2026 Turkish payroll ratio (Net = 85% of Gross at minimum wage/base bracket)
  const baseGrossSalary = salaryType === 'net' ? +(rawSalary / 0.85).toFixed(2) : rawSalary;

  const food = Math.max(0, Number(input.foodAllowance) || 0);
  const transport = Math.max(0, Number(input.transportAllowance) || 0);
  const bonus = Math.max(0, Number(input.bonusMonthly) || 0);

  // Giydirilmiş Brüt Ücret (Dressed Gross Wage)
  const dressedGrossSalary = +(baseGrossSalary + food + transport + bonus).toFixed(2);

  const reason = input.reason || 'employer_dismissal';
  const hasOneYearTenure = totalDays >= 365;

  const eligibleForKidem = hasOneYearTenure && reason !== 'voluntary_resignation';
  const eligibleForIhbar = reason === 'employer_dismissal';

  // 1. Kıdem Tazminatı Calculation
  const cappedKidemBase = Math.min(dressedGrossSalary, ACTIVE_KIDEM_CEILING_2026);
  const isCeilingApplied = dressedGrossSalary > ACTIVE_KIDEM_CEILING_2026;

  const rawPotentialKidemGross = hasOneYearTenure
    ? +((years * cappedKidemBase) + (months * (cappedKidemBase / 12)) + (days * (cappedKidemBase / 365))).toFixed(2)
    : 0;

  const grossKidem = eligibleForKidem ? rawPotentialKidemGross : 0;
  const kidemStampTax = +(grossKidem * STAMP_TAX_RATE).toFixed(2);
  const netKidem = +(grossKidem - kidemStampTax).toFixed(2);

  // 2. İhbar Tazminatı (Notice Pay - İş Kanunu Madde 17)
  let noticeWeeks = 2;
  if (totalDays >= 1095) {
    noticeWeeks = 8; // 3+ years -> 8 weeks (56 days)
  } else if (totalDays >= 548) {
    noticeWeeks = 6; // 1.5 to 3 years -> 6 weeks (42 days)
  } else if (totalDays >= 180) {
    noticeWeeks = 4; // 6 months to 1.5 years -> 4 weeks (28 days)
  } else {
    noticeWeeks = 2; // < 6 months -> 2 weeks (14 days)
  }
  const noticeDays = noticeWeeks * 7;

  const grossIhbar = eligibleForIhbar ? +((dressedGrossSalary / 30) * noticeDays).toFixed(2) : 0;
  const ihbarIncomeTax = +(grossIhbar * IHBAR_INCOME_TAX_RATE).toFixed(2);
  const ihbarStampTax = +(grossIhbar * STAMP_TAX_RATE).toFixed(2);
  const netIhbar = +(grossIhbar - ihbarIncomeTax - ihbarStampTax).toFixed(2);

  // 3. Unused Annual Leave Pay (Yıllık İzin Ücreti - İş Kanunu Madde 53 & 59)
  let statutoryTotalLeaveDays = 0;
  for (let y = 1; y <= years; y++) {
    if (y <= 5) statutoryTotalLeaveDays += 14;
    else if (y < 15) statutoryTotalLeaveDays += 20;
    else statutoryTotalLeaveDays += 26;
  }

  const unusedLeaveDays = input.unusedLeaveDays !== undefined
    ? Math.max(0, Number(input.unusedLeaveDays))
    : 0;

  const grossLeavePay = +((baseGrossSalary / 30) * unusedLeaveDays).toFixed(2);
  const leaveDeductions = +(grossLeavePay * (0.15 + 0.1275 + STAMP_TAX_RATE)).toFixed(2);
  const netLeavePay = +(grossLeavePay - leaveDeductions).toFixed(2);

  const totalGrossPayout = +(grossKidem + grossIhbar + grossLeavePay).toFixed(2);
  const totalTaxesAndDeductions = +((totalGrossPayout) - (netKidem + netIhbar + netLeavePay)).toFixed(2);
  const totalNetPayout = +(netKidem + netIhbar + netLeavePay).toFixed(2);

  return {
    success: true,
    currency: 'TRY',
    tenure: {
      startDate: startStr,
      endDate: endStr,
      years,
      months,
      days,
      totalDays,
      hasOneYearTenure
    },
    wage: {
      inputSalary: rawSalary,
      salaryType,
      baseGrossSalary,
      foodAllowance: food,
      transportAllowance: transport,
      bonusMonthly: bonus,
      dressedGrossSalary,
      kidemCeiling2026: ACTIVE_KIDEM_CEILING_2026,
      cappedKidemBase,
      isCeilingApplied
    },
    kidem: {
      eligible: eligibleForKidem,
      gross: grossKidem,
      stampTax: kidemStampTax,
      net: netKidem,
      potentialNetIfEligible: +(rawPotentialKidemGross * (1 - STAMP_TAX_RATE)).toFixed(2)
    },
    ihbar: {
      eligible: eligibleForIhbar,
      noticeWeeks,
      noticeDays,
      gross: grossIhbar,
      incomeTax: ihbarIncomeTax,
      stampTax: ihbarStampTax,
      net: netIhbar
    },
    annualLeave: {
      statutoryTotalEntitlementDays: statutoryTotalLeaveDays,
      unusedLeaveDays,
      gross: grossLeavePay,
      deductions: leaveDeductions,
      net: netLeavePay
    },
    summary: {
      reason,
      totalGrossPayout,
      totalTaxesAndDeductions,
      totalNetPayout
    },
    ceilingsTable: OFFICIAL_KIDEM_CEILINGS
  };
}

// Bare route & alias redirects
severanceCalculatorRouter.get('/kidem-tazminati-hesaplama', (c) => {
  const acceptLang = (c.req.header('accept-language') || '').toLowerCase();
  if (acceptLang.startsWith('tr')) return c.redirect('/tr/kidem-tazminati-hesaplama');
  if (acceptLang.startsWith('en')) return c.redirect('/en/kidem-tazminati-hesaplama');
  if (acceptLang.startsWith('ru')) return c.redirect('/ru/kidem-tazminati-hesaplama');
  if (acceptLang.startsWith('fa')) return c.redirect('/fa/kidem-tazminati-hesaplama');
  if (acceptLang.startsWith('ur')) return c.redirect('/ur/kidem-tazminati-hesaplama');
  return c.redirect('/ar/kidem-tazminati-hesaplama');
});

severanceCalculatorRouter.get('/severance-calculator', (c) => c.redirect('/en/kidem-tazminati-hesaplama'));
severanceCalculatorRouter.get('/:locale/severance-calculator', (c) => {
  const locale = c.req.param('locale');
  return c.redirect(`/${locale}/kidem-tazminati-hesaplama`);
});

// Public REST API endpoint
const handleApiSeverance = (c: any) => {
  const result = calculateSeverancePackage({
    startDate: c.req.query('start') || '2023-01-01',
    endDate: c.req.query('end') || '2026-10-01',
    salary: parseFloat(c.req.query('salary') || String(MIN_WAGE_GROSS_2026)),
    salaryType: (c.req.query('type') === 'net' ? 'net' : 'gross'),
    foodAllowance: parseFloat(c.req.query('food') || '0'),
    transportAllowance: parseFloat(c.req.query('transport') || '0'),
    bonusMonthly: parseFloat(c.req.query('bonus') || '0'),
    unusedLeaveDays: parseFloat(c.req.query('leaveDays') || '14'),
    reason: (c.req.query('reason') as any) || 'employer_dismissal'
  });
  c.header('Cache-Control', 'public, max-age=1800, s-maxage=3600');
  return c.json(result);
};

severanceCalculatorRouter.get('/api/kidem-tazminati', handleApiSeverance);
severanceCalculatorRouter.get('/api/severance-calculator', handleApiSeverance);

// Main Multilingual Calculator Page
severanceCalculatorRouter.get('/:locale/kidem-tazminati-hesaplama', async (c) => {
  const rawLocale = c.req.param('locale');
  const validLocales = ['ar', 'en', 'tr', 'ru', 'fa', 'ur'];
  if (!validLocales.includes(rawLocale)) {
    return c.redirect('/ar/kidem-tazminati-hesaplama');
  }
  const locale = rawLocale as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  const isRtl = locale === 'ar' || locale === 'fa' || locale === 'ur';

  const i18n: Record<string, any> = {
    ar: {
      badge: 'قانون العمل التركي رقم 4857 • تحديث السقف الرسمي 2026',
      title: 'حاسبة تعويض نهاية الخدمة والفصل من العمل في تركيا 2026 (Kıdem & İhbar Tazminatı)',
      subtitle: 'احسب بدقة مستحقاتك القانونية الكاملة عند انتهاء العمل أو الفصل أو الاستقالة في تركيا لعام 2026: تعويض الأقدمية (Kıdem Tazminatı)، تعويض مهلة الإشعار (İhbar Tazminatı)، وبدل أيام الإجازات السنوية غير المستخدمة (Yıllık İzin Ücreti).',
    metaTitle: 'حاسبة تعويض نهاية الخدمة في تركيا 2026 | Kıdem Tazminatı',
    metaDesc: 'احسب تعويض الأقدمية (Kıdem) ومهلة الإشعار (İhbar) وبدل الإجازات غير المستخدمة في تركيا لعام 2026 وفق السقف الرسمي 64,948.77 ليرة.',
      ceilingCardTitle: 'سقف تعويض نهاية الخدمة الرسمي لعام 2026',
      ceilingCardSub: 'السقف الأعلى المعتمد لاحتساب كل سنة خدمة (يوليو – ديسمبر 2026)',
      minWageLabel: 'الحد الأدنى للأجور 2026 (إجمالي / صافي)',
      stampTaxLabel: 'ضريبة الدمغة الوحيدة المقتطعة (Damga Vergisi)',
      calcHeader: 'أدخل بيانات عملك وراتبك لحساب مستحقاتك فوراً',
      startDateLabel: 'تاريخ بدء العمل (İşe Giriş Tarihi)',
      endDateLabel: 'تاريخ انتهاء العمل (İşten Çıkış Tarihi)',
      reasonLabel: 'سبب انتهاء عقد العمل (Fesih Nedeni)',
      reasonDismissal: 'فصل من قبل صاحب العمل دون سبب تأديبي (يستحق Kıdem + İhbar)',
      reasonJustCause: 'استقالة العامل لسبب محق: تأخر رواتب / عدم دفع SGK (يستحق Kıdem)',
      reasonRetirement: 'التقاعد / الخدمة العسكرية / الزواج للنساء خلال سنة (يستحق Kıdem)',
      reasonVoluntary: 'استقالة طوعية عادية برغبة العامل (يستحق بدل الإجازات فقط)',
      salaryTypeLabel: 'نوع الراتب المدخل',
      grossOption: 'الراتب الإجمالي (Brüt Maaş)',
      netOption: 'الراتب الصافي (Net Maaş - تحويل تلقائي)',
      salaryAmountLabel: 'قيمة الراتب الشهري (بالليرة التركية ₺)',
      minWagePresetBtn: 'استخدام الحد الأدنى للأجور 2026 (33,030 ₺ إجمالي)',
      foodLabel: 'بدل الطعام الشهري المنتظم (Yemek Yardımı ₺)',
      transportLabel: 'بدل المواصلات الشهري المنتظم (Yol Yardımı ₺)',
      bonusLabel: 'المتوسط الشهري للمكافآت الثابتة (İkramiye / Prim ₺)',
      leaveDaysLabel: 'عدد أيام الإجازات السنوية غير المستخدمة (Kullanılmayan İzin Günü)',
      autoLeaveBtn: 'حساب الرصيد القانوني تلقائياً',
      resultsTitle: 'تفصيل مستحقاتك القانونية الصافية لعام 2026',
      tenureBadgeLabel: 'إجمالي مدة الخدمة الفعلية:',
      yearsUnit: 'سنة',
      monthsUnit: 'شهر',
      daysUnit: 'يوم',
      dressedGrossLabel: 'الراتب الإجمالي الشامل للبدلات (Giydirilmiş Brüt)',
      kidemTitle: '1. صافي تعويض نهاية الخدمة (Net Kıdem Tazminatı)',
      kidemGrossLabel: 'الإجمالي قبل الضريبة:',
      kidemTaxLabel: 'ضريبة الدمغة (0.759%):',
      ihbarTitle: '2. صافي تعويض مهلة الإشعار (Net İhbar Tazminatı)',
      ihbarWeeksLabel: 'مهلة الإشعار القانونية:',
      ihbarGrossLabel: 'الإجمالي قبل الضرائب:',
      ihbarTaxLabel: 'ضريبة الدخل (15%) + الدمغة:',
      leaveTitle: '3. صافي بدل الإجازات السنوية (Net Yıllık İzin Ücreti)',
      leaveGrossLabel: 'إجمالي بدل الإجازات:',
      leaveTaxLabel: 'اقتطاعات SGK والضرائب:',
      totalNetTitle: 'إجمالي المستحقات الصافية الواجب استلامها (Toplam Net Alacak)',
      totalGrossSub: 'الإجمالي قبل الاقتطاعات:',
      ceilingNotice: 'ملاحظة: تجاوز راتبك الإجمالي سقف تعويض الأقدمية الرسمي لعام 2026 (64,948.77 ₺)، لذلك تم احتساب تعويض الأقدمية على أساس السقف القانوني الأعلى.',
      notEligibleKidemMsg: 'تنبيه قانوني: لاستحقاق تعويض نهاية الخدمة (Kıdem)، يشترط إكمال سنة واحدة على الأقل (365 يوماً) وأن لا تكون الاستقالة طوعية بدون سبب محق.',
      printBtn: 'طباعة التقرير القانوني (PDF)',
      whatsappBtn: 'مشاركة النتيجة عبر واتساب',
      tableSectionTitle: 'الجدول الرسمي لسقف تعويض نهاية الخدمة في تركيا (Kıdem Tazminatı Tavanı 2025 - 2026)',
      colPeriod: 'الفترة المالية',
      colCeiling: 'سقف تعويض نهاية الخدمة (Kıdem Tavanı)',
      colMinGross: 'الحد الأدنى الإجمالي (Brüt Asgari)',
      colMinNet: 'الحد الأدنى الصافي (Net Asgari)',
      legalGuideTitle: 'الدليل القانوني الشامل لمستحقات نهاية الخدمة في تركيا 2026 (قانون العمل رقم 4857)',
      rule1Title: 'شروط استحقاق تعويض الأقدمية (Kıdem Tazminatı Şartları)',
      rule1Desc: 'يستحق العامل في تركيا تعويض نهاية الخدمة (راتب 30 يوماً إجمالياً عن كل سنة عمل كاملة) بشرطين أساسيين: أولاً، أن يكون قد عمل لدى نفس صاحب العمل لمدة سنة كاملة على الأقل (365 يوماً). ثانياً، أن ينتهي العقد بسبب الفصل من صاحب العمل (دون ارتكاب العامل مخالفة مخلة بالشرف وفق المادة 25/2)، أو استقالة العامل لسبب محق (المادة 24)، أو التقاعد، أو الخدمة العسكرية، أو الزواج للسيدات خلال سنة من تاريخ العقد.',
      rule2Title: 'متى يحق للعامل الاستقالة وأخذ كامل التعويض؟ (Haklı Nedenle Fesih - Madde 24)',
      rule2Desc: 'يحق للموظف الأجنبي أو التركي فسخ عقد العمل فوراً عبر كاتب العدل (Noter İhtarname) والمطالبة بكامل تعويض نهاية الخدمة إذا: تأخر صاحب العمل عن دفع الرواتب أو العمل الإضافي (Mesai)، أو سجل الراتب في التأمينات (SGK) بأقل من الراتب الحقيقي المستلم باليد، أو لم يمنح العامل إجازاته الرسمية، أو تعرض العامل لمضايقات نفسية (Mobbing) أو خطر صحي في العمل.',
      rule3Title: 'جدول مهل الإشعار القانونية (İhbar Süreleri - Madde 17)',
      rule3Desc: 'إذا أراد صاحب العمل إنهاء عقد الموظف (أو أراد الموظف الاستقالة)، يجب إخطار الطرف الآخر مسبقاً: أسبوعان (14 يوماً) لمن عمل أقل من 6 أشهر، 4 أسابيع (28 يوماً) لمن عمل من 6 أشهر إلى سنة ونصف، 6 أسابيع (42 يوماً) لمن عمل من سنة ونصف إلى 3 سنوات، و8 أسابيع (56 يوماً) لمن عمل أكثر من 3 سنوات. وفي حال الفصل الفوري، يدفع صاحب العمل أجر هذه الأسابيع نقداً كتعويض إشعار.',
      rule4Title: 'حساب الراتب الشامل للبدلات (Giydirilmiş Brüt Ücret)',
      rule4Desc: 'لا يُحسب تعويض نهاية الخدمة والإشعار على الراتب الأساسي فقط، بل يُضاف إليه كل مبلغ نقدي أو عيني منتظم يحصل عليه العامل شهرياً مثل: بدل الطعام (Yemek)، بدل المواصلات (Yol)، بدل السكن أو الفواتير، والمتوسط الشهري للمكافآت السنوية الثابتة.',
      faqTitle: 'الأسئلة الشائعة حول تعويض نهاية الخدمة والفصل في تركيا 2026',
      faqs: [
        {
          question: 'كم يبلغ سقف تعويض نهاية الخدمة (Kıdem Tazminatı Tavanı) في تركيا لعام 2026؟',
          answer: 'يبلغ السقف الأعلى الرسمي لتعويض نهاية الخدمة في تركيا للنصف الثاني من عام 2026 (من 1 يوليو حتى 31 ديسمبر 2026) مبلغ 64,948.77 ليرة تركية عن كل سنة خدمة، بينما يبلغ الحد الأدنى لتعويض السنة الواحدة 33,030.00 ليرة تركية إجمالياً (27,824.80 ليرة صافي بعد خصم ضريبة الدمغة).'
        },
        {
          question: 'هل يستحق الموظف الأجنبي في تركيا تعويض نهاية الخدمة (Kıdem Tazminatı)؟',
          answer: 'نعم، يتمتع الموظف الأجنبي الحاصل على إذن عمل في تركيا بنفس حقوق المواطن التركي تماماً بموجب قانون العمل التركي رقم 4857، ويستحق تعويض الأقدمية والإشعار وبدل الإجازات السنوية عند انتهاء العقد.'
        },
        {
          question: 'ماذا يحدث لرصيد الإجازات السنوية إذا استقال الموظف بمحض إرادته؟',
          answer: 'حتى لو استقال الموظف بمحض إرادته دون سبب محق وخسر تعويض الأقدمية، فإنه يستحق بقوة القانون (المادة 59) استلام البدل النقدي لجميع أيام إجازاته السنوية المتراكمة غير المستخدمة في آخر يوم عمل.'
        },
        {
          question: 'ما هي الضرائب التي تُخصم من تعويض نهاية الخدمة وتعويض الإشعار؟',
          answer: 'تعويض نهاية الخدمة (Kıdem Tazminatı) معفى تماماً من ضريبة الدخل واقتطاعات SGK، ولا يُخصم منه سوى ضريبة الدمغة (Damga Vergisi) بنسبة 0.759% فقط. أما تعويض الإشعار (İhbar Tazminatı) فيُخصم منه ضريبة الدخل (تبدأ من 15%) بالإضافة إلى ضريبة الدمغة (0.759%).'
        }
      ]
    },
    en: {
      badge: 'Turkish Labor Law No. 4857 • Official 2026 Ceiling Updated',
      title: 'Turkey Severance & Notice Pay Calculator 2026 (Kıdem & İhbar Tazminatı)',
      subtitle: 'Accurately calculate your legal termination entitlements in Turkey for 2026: Severance Pay (Kıdem Tazminatı), Notice Pay (İhbar Tazminatı), and Unused Annual Leave Pay (Yıllık İzin Ücreti) with net tax deductions.',
    metaTitle: 'Turkey Severance Pay Calculator 2026 | Kıdem & İhbar',
    metaDesc: 'Calculate severance pay (Kıdem), notice pay (İhbar) and unused leave pay in Turkey for 2026, using the official ceiling of 64,948.77 TL.',
      ceilingCardTitle: 'Official 2026 Severance Pay Ceiling',
      ceilingCardSub: 'Maximum gross base per year of service (July – December 2026)',
      minWageLabel: '2026 Minimum Wage (Gross / Net)',
      stampTaxLabel: 'Only Tax on Severance (Stamp Tax)',
      calcHeader: 'Enter Your Employment & Salary Details for Instant Calculation',
      startDateLabel: 'Employment Start Date (İşe Giriş Tarihi)',
      endDateLabel: 'Employment End Date (İşten Çıkış Tarihi)',
      reasonLabel: 'Reason for Termination (Fesih Nedeni)',
      reasonDismissal: 'Dismissed by Employer without misconduct (Eligible for Kıdem + İhbar)',
      reasonJustCause: 'Employee Resignation for Just Cause: unpaid wages / underreported SGK (Kıdem)',
      reasonRetirement: 'Retirement / Military Service / Marriage within 1 year (Kıdem)',
      reasonVoluntary: 'Standard Voluntary Resignation by Employee (Unused Leave Pay only)',
      salaryTypeLabel: 'Salary Input Type',
      grossOption: 'Gross Salary (Brüt Maaş)',
      netOption: 'Net Salary (Net Maaş - Auto Convert)',
      salaryAmountLabel: 'Monthly Salary Amount (TRY ₺)',
      minWagePresetBtn: 'Use 2026 Minimum Wage (33,030 ₺ Gross)',
      foodLabel: 'Monthly Regular Food Allowance (Yemek Yardımı ₺)',
      transportLabel: 'Monthly Regular Transport Allowance (Yol Yardımı ₺)',
      bonusLabel: 'Monthly Average of Regular Bonuses (İkramiye / Prim ₺)',
      leaveDaysLabel: 'Unused Annual Leave Days (Kullanılmayan İzin Günü)',
      autoLeaveBtn: 'Auto-Calculate Statutory Leave',
      resultsTitle: 'Your 2026 Net Legal Entitlements Breakdown',
      tenureBadgeLabel: 'Total Continuous Service:',
      yearsUnit: 'Years',
      monthsUnit: 'Months',
      daysUnit: 'Days',
      dressedGrossLabel: 'Dressed Gross Salary (Giydirilmiş Brüt)',
      kidemTitle: '1. Net Severance Pay (Net Kıdem Tazminatı)',
      kidemGrossLabel: 'Gross Severance:',
      kidemTaxLabel: 'Stamp Tax (0.759%):',
      ihbarTitle: '2. Net Notice Pay (Net İhbar Tazminatı)',
      ihbarWeeksLabel: 'Statutory Notice Period:',
      ihbarGrossLabel: 'Gross Notice Pay:',
      ihbarTaxLabel: 'Income Tax (15%) + Stamp Tax:',
      leaveTitle: '3. Net Unused Annual Leave Pay (Net Yıllık İzin Ücreti)',
      leaveGrossLabel: 'Gross Leave Pay:',
      leaveTaxLabel: 'SGK & Tax Deductions:',
      totalNetTitle: 'Total Net Payout You Should Receive (Toplam Net Alacak)',
      totalGrossSub: 'Total Gross Before Taxes:',
      ceilingNotice: 'Note: Your dressed gross salary exceeds the official 2026 severance ceiling (64,948.77 ₺). Severance pay is capped at the statutory ceiling per year.',
      notEligibleKidemMsg: 'Legal Notice: Severance pay (Kıdem) requires at least 1 full year (365 days) of service and a qualifying termination reason.',
      printBtn: 'Print Legal Summary (PDF)',
      whatsappBtn: 'Share Calculation on WhatsApp',
      tableSectionTitle: 'Official Turkey Severance Pay Ceiling Table (Kıdem Tazminatı Tavanı 2025 - 2026)',
      colPeriod: 'Fiscal Period',
      colCeiling: 'Severance Ceiling (Kıdem Tavanı)',
      colMinGross: 'Gross Minimum Wage (Brüt Asgari)',
      colMinNet: 'Net Minimum Wage (Net Asgari)',
      legalGuideTitle: 'Complete Legal Guide to Severance & Notice Pay in Turkey 2026 (Labor Law No. 4857)',
      rule1Title: 'Severance Pay Eligibility Requirements (Kıdem Tazminatı Şartları)',
      rule1Desc: 'Employees in Turkey are entitled to 30 days of dressed gross salary for each full year of service if they have worked at least 1 full year (365 days) for the same employer and the contract ends via employer dismissal (outside Art. 25/II misconduct), employee resignation for just cause (Art. 24), retirement, military service, or marriage within 1 year.',
      rule2Title: 'Resignation for Just Cause (Haklı Nedenle Fesih - Madde 24)',
      rule2Desc: 'Both expat and Turkish employees can terminate their contract immediately via a Notary Notice (Noter İhtarname) and claim full severance pay if the employer delays salary/overtime payments, reports lower salary to SGK than actual pay, denies statutory leave, or subjects the worker to mobbing.',
      rule3Title: 'Statutory Notice Periods (İhbar Süreleri - Madde 17)',
      rule3Desc: 'Statutory notice periods depend on tenure: 2 weeks (14 days) for under 6 months, 4 weeks (28 days) for 6 months to 1.5 years, 6 weeks (42 days) for 1.5 to 3 years, and 8 weeks (56 days) for over 3 years of service.',
      rule4Title: 'Dressed Gross Salary (Giydirilmiş Brüt Ücret)',
      rule4Desc: 'Severance and notice pay are calculated not just on base salary, but on "Dressed Gross Wage" which includes regular monthly food allowances, transport allowances, housing support, and recurring bonuses.',
      faqTitle: 'Frequently Asked Questions: Severance & Termination Pay in Turkey 2026',
      faqs: [
        {
          question: 'What is the official Severance Pay Ceiling (Kıdem Tazminatı Tavanı) in Turkey for 2026?',
          answer: 'For the second half of 2026 (July 1 – December 31, 2026), the official severance pay ceiling in Turkey is 64,948.77 TRY per year of service, while the minimum severance per year is 33,030.00 TRY gross.'
        },
        {
          question: 'Are foreign workers in Turkey entitled to Severance Pay (Kıdem Tazminatı)?',
          answer: 'Yes. Foreign employees working under a valid work permit in Turkey have the exact same severance, notice, and annual leave pay rights as Turkish citizens under Labor Law No. 4857.'
        },
        {
          question: 'Do I get paid for unused annual leave if I resign voluntarily?',
          answer: 'Yes. Under Article 59 of the Turkish Labor Law, all accumulated unused annual leave days must be paid out in cash upon contract termination, regardless of whether you resigned voluntarily or were dismissed.'
        },
        {
          question: 'What taxes are deducted from Kıdem and İhbar Tazminatı?',
          answer: 'Severance pay (Kıdem Tazminatı) is exempt from income tax and SGK premiums; only Stamp Tax (Damga Vergisi) of 0.759% is deducted. Notice pay (İhbar Tazminatı) is subject to both Income Tax (starting at 15%) and Stamp Tax (0.759%).'
        }
      ]
    },
    tr: {
      badge: '4857 Sayılı İş Kanunu • 2026 Resmi Kıdem Tavanı Güncel',
      title: 'Kıdem ve İhbar Tazminatı Hesaplama 2026 (Yıllık İzin Ücreti Dahil)',
      subtitle: '2026 yılı güncel kıdem tavanı (64.948,77 TL) ve vergi dilimlerine göre; işe giriş-çıkış tarihiniz, giydirilmiş brüt maaşınız ve yan haklarınızla Net Kıdem Tazminatı, İhbar Tazminatı ve Kullanılmayan Yıllık İzin Ücretinizi anında hesaplayın.',
    metaTitle: 'Kıdem ve İhbar Tazminatı Hesaplama 2026',
    metaDesc: '2026 kıdem tavanı (64.948,77 TL) ile kıdem tazminatı, ihbar tazminatı ve kullanılmayan yıllık izin ücretinizi net ve brüt olarak hesaplayın.',
      ceilingCardTitle: '2026 Resmi Kıdem Tazminatı Tavanı',
      ceilingCardSub: 'Her bir tam çalışma yılı için ödenebilecek üst sınır (Temmuz – Aralık 2026)',
      minWageLabel: '2026 Asgari Ücret (Brüt / Net)',
      stampTaxLabel: 'Kıdem Tazminatı Damga Vergisi Kesintisi',
      calcHeader: 'Çalışma Süresi ve Maaş Bilgilerinizi Girerek Hemen Hesaplayın',
      startDateLabel: 'İşe Giriş Tarihi',
      endDateLabel: 'İşten Çıkış Tarihi',
      reasonLabel: 'İşten Ayrılış / Fesih Nedeni',
      reasonDismissal: 'İşveren Tarafından Haksız / Geçerli Fesih (Kıdem + İhbar Hak Eder)',
      reasonJustCause: 'İşçinin Haklı Nedenle Feshi - Madde 24: Maaş/SGK Eksikliği (Kıdem Hak Eder)',
      reasonRetirement: 'Emeklilik / Askerlik / Evlilik Nedeniyle Fesih (Kıdem Hak Eder)',
      reasonVoluntary: 'İstifa - Haklı Neden Olmaksızın Kendi İsteğiyle (Sadece Yıllık İzin Ücreti)',
      salaryTypeLabel: 'Maaş Giriş Türü',
      grossOption: 'Brüt Maaş (Aylık Brüt)',
      netOption: 'Net Maaş (Otomatik Brüte Çevir)',
      salaryAmountLabel: 'Aylık Maaş Tutarı (TL ₺)',
      minWagePresetBtn: '2026 Asgari Ücreti Uygula (33.030 ₺ Brüt)',
      foodLabel: 'Aylık Düzenli Yemek Yardımı (TL ₺)',
      transportLabel: 'Aylık Düzenli Yol / Ulaşım Yardımı (TL ₺)',
      bonusLabel: 'Aylık Düzenli İkramiye / Prim Ortalaması (TL ₺)',
      leaveDaysLabel: 'Kullanılmayan Yıllık İzin Gün Sayısı',
      autoLeaveBtn: 'Yasal İzin Hakkını Otomatik Hesapla',
      resultsTitle: '2026 Yılı Net Tazminat ve Alacak Hesaplama Sonucu',
      tenureBadgeLabel: 'Toplam Fiili Hizmet Süresi:',
      yearsUnit: 'Yıl',
      monthsUnit: 'Ay',
      daysUnit: 'Gün',
      dressedGrossLabel: 'Giydirilmiş Brüt Ücret',
      kidemTitle: '1. Net Kıdem Tazminatı Tutarı',
      kidemGrossLabel: 'Brüt Kıdem Tazminatı:',
      kidemTaxLabel: 'Damga Vergisi (%0,759):',
      ihbarTitle: '2. Net İhbar Tazminatı Tutarı',
      ihbarWeeksLabel: 'Yasal İhbar Süresi:',
      ihbarGrossLabel: 'Brüt İhbar Tazminatı:',
      ihbarTaxLabel: 'Gelir Vergisi (%15) + Damga Vergisi:',
      leaveTitle: '3. Net Kullanılmayan Yıllık İzin Ücreti',
      leaveGrossLabel: 'Brüt Yıllık İzin Ücreti:',
      leaveTaxLabel: 'SGK ve Vergi Kesintileri:',
      totalNetTitle: 'Ele Geçecek Toplam Net Tazminat ve Alacak',
      totalGrossSub: 'Toplam Brüt Alacak:',
      ceilingNotice: 'Bilgi: Giydirilmiş brüt ücretiniz 2026 yılı resmi kıdem tazminatı tavanını (64.948,77 TL) aştığı için kıdem tazminatı yasal tavan üzerinden hesaplanmıştır.',
      notEligibleKidemMsg: 'Yasal Uyarı: Kıdem tazminatı hak kazanabilmek için en az 1 tam yıl (365 gün) çalışmış olmak ve haklı bir fesih nedeninin bulunması gerekir.',
      printBtn: 'Hesaplama Tablosunu Yazdır (PDF)',
      whatsappBtn: 'Sonucu WhatsApp ile Paylaş',
      tableSectionTitle: 'Yıllara Göre Resmi Kıdem Tazminatı Tavanı Tablosu (2025 - 2026)',
      colPeriod: 'Dönem',
      colCeiling: 'Kıdem Tazminatı Tavanı',
      colMinGross: 'Brüt Asgari Ücret',
      colMinNet: 'Net Asgari Ücret',
      legalGuideTitle: '4857 Sayılı İş Kanunu Kapsamında Kıdem ve İhbar Tazminatı Rehberi 2026',
      rule1Title: 'Kıdem Tazminatı Alma Şartları Nelerdir?',
      rule1Desc: 'İşçinin aynı işverene bağlı olarak en az 1 tam yıl (365 gün) çalışmış olması ve iş sözleşmesinin işveren tarafından iyi niyet ve ahlak kurallarına aykırılık (Madde 25/II) dışında feshedilmesi, işçinin haklı nedenle feshi (Madde 24), askerlik, emeklilik (15 yıl 3600 gün) veya kadın işçinin evlenmesi (1 yıl içinde) nedeniyle sona ermesi gerekir.',
      rule2Title: 'İşçinin Haklı Nedenle İstifası (İş Kanunu Madde 24)',
      rule2Desc: 'Maaş veya fazla mesai ücretlerinin zamanında ödenmemesi, SGK primlerinin gerçek maaş üzerinden yatırılmaması (elden ödeme), resmi tatil veya yıllık izin kullandırılmaması ya da mobbing uygulanması halinde işçi noterden ihtarname çekerek kıdem tazminatını alarak derhal ayrılabilir.',
      rule3Title: 'İhbar Süreleri ve İhbar Tazminatı (İş Kanunu Madde 17)',
      rule3Desc: 'Çalışma süresi 6 aydan az olanlar için 2 hafta (14 gün), 6 ay - 1,5 yıl arası için 4 hafta (28 gün), 1,5 yıl - 3 yıl arası için 6 hafta (42 gün), 3 yıldan fazla çalışanlar için 8 hafta (56 gün) ihbar süresi uygulanır.',
      rule4Title: 'Giydirilmiş Brüt Ücret Nasıl Hesaplanır?',
      rule4Desc: 'Kıdem ve ihbar tazminatına esas ücret; çıplak brüt maaşa ek olarak işçiye düzenli ödenen yemek parası, yol yardımı, düzenli ikramiye ve yakacak/konut yardımlarının aylık brüt tutarlarının eklenmesiyle bulunur.',
      faqTitle: 'Kıdem ve İhbar Tazminatı Hakkında Sıkça Sorulan Sorular (2026)',
      faqs: [
        {
          question: '2026 yılı kıdem tazminatı tavanı ne kadar oldu?',
          answer: '2026 yılının ikinci yarısı (1 Temmuz – 31 Aralık 2026) için geçerli resmi kıdem tazminatı tavanı 64.948,77 TL olarak uygulanmaktadır. En düşük 1 yıllık brüt kıdem tazminatı ise 33.030,00 TL’dir.'
        },
        {
          question: 'Kendi isteğiyle istifa eden işçi yıllık izin ücretini alabilir mi?',
          answer: 'Evet. İşçi haklı bir neden olmaksızın kendi isteğiyle istifa etse dahi, içeride birikmiş ve kullanmadığı tüm yıllık izin günlerinin ücretini son maaşı üzerinden nakit olarak alma hakkına sahiptir.'
        },
        {
          question: 'Kıdem ve ihbar tazminatından hangi vergiler kesilir?',
          answer: 'Kıdem tazminatından gelir vergisi ve SGK primi kesilmez; yalnızca binde 7,59 (%0,759) oranında Damga Vergisi kesilir. İhbar tazminatından ise hem Gelir Vergisi (%15’ten başlayan dilim) hem de Damga Vergisi (%0,759) kesilir.'
        },
        {
          question: 'SGK primi asgari ücretten gösterilen ancak elden maaş alan işçi ne yapabilir?',
          answer: 'SGK priminin gerçek ücretten eksik yatırılması İş Kanunu Madde 24/II-e uyarınca işçi için doğrudan haklı fesih sebebidir. İşçi gerçek ücretini tanık, banka dekontu veya mesajlarla ispatlayarak gerçek maaşı üzerinden kıdem tazminatı talep edebilir.'
        }
      ]
    }
  };

  const t = i18n[locale] || i18n.en;
  const defaultCalc = calculateSeverancePackage({
    startDate: '2023-01-01',
    endDate: '2026-10-01',
    salary: MIN_WAGE_GROSS_2026,
    salaryType: 'gross',
    foodAllowance: 4500,
    transportAllowance: 2500,
    bonusMonthly: 0,
    unusedLeaveDays: 14,
    reason: 'employer_dismissal'
  });

  const siteUrl = 'https://jobs-in-istanbul.com';
  // Body content exists in ar/en/tr only; ru/fa/ur render English and canonicalize to /en
  const nativeLocales = getNativeLocales('kidem-tazminati-hesaplama');
  const canonicalUrl = `${siteUrl}/${canonicalLocaleFor(locale, nativeLocales)}/kidem-tazminati-hesaplama`;

  const schemaJsonLd = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: t.title,
      description: t.subtitle,
      url: canonicalUrl,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TRY'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: t.faqs.map((f: any) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer
        }
      }))
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale === 'ar' ? 'الرئيسية' : (locale === 'tr' ? 'Ana Sayfa' : 'Home'),
          item: `${siteUrl}/${locale}`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t.title,
          item: canonicalUrl
        }
      ]
    }
  ]);

  const seoHead = `
    <title>${t.metaTitle || t.title}</title>
    <meta name="description" content="${t.metaDesc || t.subtitle}">
    <link rel="canonical" href="${canonicalUrl}">
    ${hreflangLinks('/kidem-tazminati-hesaplama', nativeLocales)}
    <meta property="og:title" content="${t.metaTitle || t.title}">
    <meta property="og:description" content="${t.metaDesc || t.subtitle}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${ogLocale(locale)}">
    ${ogImageTags(DEFAULT_OG_IMAGE, t.metaTitle || t.title)}
    <script type="application/ld+json">${schemaJsonLd}</script>
  `;

  const fmtTry = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';

  const contentHtml = `
    <section style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%); color: white; padding: 54px 0 46px; position: relative; overflow: hidden;">
      <div class="container" style="max-width: 1180px; position: relative; z-index: 2;">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.45); color: #fcd34d; padding: 6px 16px; border-radius: 999px; font-size: 0.82rem; font-weight: 800; margin-bottom: 16px;">
          <i class="fa-solid fa-scale-balanced"></i>
          <span>${t.badge}</span>
        </div>
        <h1 style="font-size: clamp(1.75rem, 3.6vw, 2.65rem); font-weight: 900; line-height: 1.25; margin-bottom: 14px; color: #ffffff;">
          ${t.title}
        </h1>
        <p style="font-size: 1.05rem; color: rgba(255,255,255,0.84); max-width: 860px; line-height: 1.7; margin-bottom: 28px;">
          ${t.subtitle}
        </p>

        <!-- Key 2026 Benchmarks Strip -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
          <div style="background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 18px 20px;">
            <div style="font-size: 0.8rem; color: #fcd34d; font-weight: 700; margin-bottom: 4px;">${t.ceilingCardTitle}</div>
            <div style="font-size: 1.65rem; font-weight: 900; color: #ffffff;">64,948.77 ₺</div>
            <div style="font-size: 0.76rem; color: rgba(255,255,255,0.68); margin-top: 4px;">${t.ceilingCardSub}</div>
          </div>
          <div style="background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 18px 20px;">
            <div style="font-size: 0.8rem; color: #38bdf8; font-weight: 700; margin-bottom: 4px;">${t.minWageLabel}</div>
            <div style="font-size: 1.45rem; font-weight: 900; color: #ffffff;">33,030.00 ₺ <span style="font-size: 0.9rem; font-weight: 600; color: #93c5fd;">/ 28,075.50 ₺</span></div>
            <div style="font-size: 0.76rem; color: rgba(255,255,255,0.68); margin-top: 4px;">Asgari Ücret 2026 (Brüt / Net)</div>
          </div>
          <div style="background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 18px 20px;">
            <div style="font-size: 0.8rem; color: #4ade80; font-weight: 700; margin-bottom: 4px;">${t.stampTaxLabel}</div>
            <div style="font-size: 1.65rem; font-weight: 900; color: #ffffff;">0.759%</div>
            <div style="font-size: 0.76rem; color: rgba(255,255,255,0.68); margin-top: 4px;">Binde 7,59 (Gelir Vergisinden Muaf)</div>
          </div>
        </div>
      </div>
    </section>

    <section class="container" style="max-width: 1180px; padding: 40px 16px 70px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 28px; align-items: start;">
        
        <!-- Left Column: Interactive Input Form -->
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 28px; box-shadow: var(--shadow-md);">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-heading); margin-bottom: 22px; display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-calculator" style="color: #6366f1;"></i>
            <span>${t.calcHeader}</span>
          </h2>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
            <div>
              <label for="sev-start" style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">${t.startDateLabel}</label>
              <input type="date" id="sev-start" value="2023-01-01" style="width: 100%; padding: 11px 12px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-body); color: var(--text-heading); font-weight: 600;">
            </div>
            <div>
              <label for="sev-end" style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">${t.endDateLabel}</label>
              <input type="date" id="sev-end" value="2026-10-01" style="width: 100%; padding: 11px 12px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-body); color: var(--text-heading); font-weight: 600;">
            </div>
          </div>

          <div style="margin-bottom: 18px;">
            <label for="sev-reason" style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">${t.reasonLabel}</label>
            <select id="sev-reason" style="width: 100%; padding: 11px 12px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-body); color: var(--text-heading); font-weight: 600;">
              <option value="employer_dismissal" selected>${t.reasonDismissal}</option>
              <option value="just_cause_resignation">${t.reasonJustCause}</option>
              <option value="retirement_military_marriage">${t.reasonRetirement}</option>
              <option value="voluntary_resignation">${t.reasonVoluntary}</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 14px; margin-bottom: 10px;">
            <div>
              <label for="sev-salary-type" style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">${t.salaryTypeLabel}</label>
              <select id="sev-salary-type" style="width: 100%; padding: 11px 12px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-body); color: var(--text-heading); font-weight: 600;">
                <option value="gross" selected>${t.grossOption}</option>
                <option value="net">${t.netOption}</option>
              </select>
            </div>
            <div>
              <label for="sev-salary" style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">${t.salaryAmountLabel}</label>
              <input type="number" id="sev-salary" value="33030" min="0" step="500" style="width: 100%; padding: 11px 12px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-body); color: var(--text-heading); font-weight: 800; font-size: 1rem;">
            </div>
          </div>

          <div style="margin-bottom: 18px;">
            <button type="button" id="btn-min-wage" style="background: var(--bg-subtle); border: 1px dashed #6366f1; color: #6366f1; padding: 7px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; width: 100%;">
              <i class="fa-solid fa-wand-magic-sparkles"></i> ${t.minWagePresetBtn}
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
            <div>
              <label for="sev-food" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">${t.foodLabel}</label>
              <input type="number" id="sev-food" value="4500" min="0" step="250" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-body); color: var(--text-heading); font-weight: 600;">
            </div>
            <div>
              <label for="sev-transport" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">${t.transportLabel}</label>
              <input type="number" id="sev-transport" value="2500" min="0" step="250" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-body); color: var(--text-heading); font-weight: 600;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 10px;">
            <div>
              <label for="sev-bonus" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">${t.bonusLabel}</label>
              <input type="number" id="sev-bonus" value="0" min="0" step="500" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-body); color: var(--text-heading); font-weight: 600;">
            </div>
            <div>
              <label for="sev-leave-days" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-heading); margin-bottom: 6px;">${t.leaveDaysLabel}</label>
              <input type="number" id="sev-leave-days" value="14" min="0" max="365" step="1" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-body); color: var(--text-heading); font-weight: 700;">
            </div>
          </div>
          <div style="text-align: end;">
            <button type="button" id="btn-auto-leave" style="background: transparent; border: none; color: var(--primary); font-size: 0.78rem; font-weight: 700; cursor: pointer; text-decoration: underline;">
              ${t.autoLeaveBtn}
            </button>
          </div>
        </div>

        <!-- Right Column: Live Legal Breakdown Card -->
        <div id="sev-results-card" style="background: var(--bg-card); border: 2px solid #6366f1; border-radius: 20px; padding: 28px; box-shadow: var(--shadow-lg);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--border);">
            <h2 style="font-size: 1.2rem; font-weight: 900; color: var(--text-heading); margin: 0;">${t.resultsTitle}</h2>
            <span id="out-tenure-badge" style="background: rgba(99, 102, 241, 0.12); color: #6366f1; padding: 5px 12px; border-radius: 999px; font-size: 0.82rem; font-weight: 800;">
              ${t.tenureBadgeLabel} ${defaultCalc.tenure.years} ${t.yearsUnit} ${defaultCalc.tenure.months} ${t.monthsUnit} ${defaultCalc.tenure.days} ${t.daysUnit}
            </span>
          </div>

          <div style="background: var(--bg-subtle); border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.86rem; font-weight: 700; color: var(--text-muted);">${t.dressedGrossLabel}:</span>
            <strong id="out-dressed-gross" style="font-size: 1.08rem; font-weight: 900; color: var(--text-heading);">${fmtTry(defaultCalc.wage.dressedGrossSalary)}</strong>
          </div>

          <div id="out-ceiling-alert" style="display: none; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4); color: #b45309; padding: 10px 14px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; margin-bottom: 14px;">
            <i class="fa-solid fa-circle-info"></i> ${t.ceilingNotice}
          </div>

          <div id="out-ineligible-alert" style="display: none; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.35); color: #dc2626; padding: 10px 14px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; margin-bottom: 14px;">
            <i class="fa-solid fa-triangle-exclamation"></i> ${t.notEligibleKidemMsg}
          </div>

          <!-- 1. Kıdem Tazminatı Box -->
          <div style="border: 1px solid var(--border); border-radius: 14px; padding: 16px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 0.96rem; color: var(--text-heading);">${t.kidemTitle}</strong>
              <span id="out-kidem-net" style="font-size: 1.25rem; font-weight: 900; color: #10b981;">${fmtTry(defaultCalc.kidem.net)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
              <span>${t.kidemGrossLabel} <b id="out-kidem-gross">${fmtTry(defaultCalc.kidem.gross)}</b></span>
              <span>${t.kidemTaxLabel} <b id="out-kidem-tax" style="color: #ef4444;">-${fmtTry(defaultCalc.kidem.stampTax)}</b></span>
            </div>
          </div>

          <!-- 2. İhbar Tazminatı Box -->
          <div style="border: 1px solid var(--border); border-radius: 14px; padding: 16px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 0.96rem; color: var(--text-heading);">${t.ihbarTitle}</strong>
              <span id="out-ihbar-net" style="font-size: 1.25rem; font-weight: 900; color: #0284c7;">${fmtTry(defaultCalc.ihbar.net)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); flex-wrap: wrap; gap: 6px;">
              <span>${t.ihbarWeeksLabel} <b id="out-ihbar-weeks">${defaultCalc.ihbar.noticeWeeks} (${defaultCalc.ihbar.noticeDays} ${t.daysUnit})</b></span>
              <span>${t.ihbarGrossLabel} <b id="out-ihbar-gross">${fmtTry(defaultCalc.ihbar.gross)}</b></span>
              <span>${t.ihbarTaxLabel} <b id="out-ihbar-tax" style="color: #ef4444;">-${fmtTry(defaultCalc.ihbar.incomeTax + defaultCalc.ihbar.stampTax)}</b></span>
            </div>
          </div>

          <!-- 3. Unused Leave Box -->
          <div style="border: 1px solid var(--border); border-radius: 14px; padding: 16px; margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 0.96rem; color: var(--text-heading);">${t.leaveTitle}</strong>
              <span id="out-leave-net" style="font-size: 1.25rem; font-weight: 900; color: #8b5cf6;">${fmtTry(defaultCalc.annualLeave.net)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
              <span>${t.leaveGrossLabel} <b id="out-leave-gross">${fmtTry(defaultCalc.annualLeave.gross)}</b></span>
              <span>${t.leaveTaxLabel} <b id="out-leave-tax" style="color: #ef4444;">-${fmtTry(defaultCalc.annualLeave.deductions)}</b></span>
            </div>
          </div>

          <!-- Total Net Payout Highlight -->
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 18px; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.25);">
            <div style="font-size: 0.85rem; font-weight: 700; opacity: 0.92; margin-bottom: 6px;">${t.totalNetTitle}</div>
            <div id="out-total-net" style="font-size: 2.15rem; font-weight: 900; letter-spacing: 0.5px;">${fmtTry(defaultCalc.summary.totalNetPayout)}</div>
            <div style="font-size: 0.8rem; opacity: 0.85; margin-top: 6px;">
              ${t.totalGrossSub} <strong id="out-total-gross">${fmtTry(defaultCalc.summary.totalGrossPayout)}</strong>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <button type="button" onclick="window.print()" style="background: var(--bg-subtle); color: var(--text-heading); border: 1.5px solid var(--border); padding: 11px 14px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <i class="fa-solid fa-print"></i> ${t.printBtn}
            </button>
            <button type="button" id="btn-share-wa" style="background: #25d366; color: white; border: none; padding: 11px 14px; border-radius: 10px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <i class="fa-brands fa-whatsapp" style="font-size: 1.1rem;"></i> ${t.whatsappBtn}
            </button>
          </div>
        </div>
      </div>

      <!-- Historical Ceiling Table -->
      <div style="margin-top: 50px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 28px; box-shadow: var(--shadow-sm); overflow-x: auto;">
        <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-heading); margin-bottom: 18px;">
          <i class="fa-solid fa-table-list" style="color: #6366f1; margin-inline-end: 8px;"></i>
          ${t.tableSectionTitle}
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.92rem;">
          <thead>
            <tr style="background: var(--bg-subtle); text-align: ${isRtl ? 'right' : 'left'};">
              <th style="padding: 13px 14px; border-bottom: 2px solid var(--border);">${t.colPeriod}</th>
              <th style="padding: 13px 14px; border-bottom: 2px solid var(--border);">${t.colCeiling}</th>
              <th style="padding: 13px 14px; border-bottom: 2px solid var(--border);">${t.colMinGross}</th>
              <th style="padding: 13px 14px; border-bottom: 2px solid var(--border);">${t.colMinNet}</th>
            </tr>
          </thead>
          <tbody>
            ${OFFICIAL_KIDEM_CEILINGS.map(row => `
              <tr style="border-bottom: 1px solid var(--border); ${row.status === 'active' ? 'background: rgba(16, 185, 129, 0.06); font-weight: 700;' : ''}">
                <td style="padding: 13px 14px;">${row.period[locale === 'tr' ? 'tr' : (locale === 'ar' ? 'ar' : 'en')]}</td>
                <td style="padding: 13px 14px; color: #059669; font-weight: 800;">${fmtTry(row.ceilingTry)}</td>
                <td style="padding: 13px 14px;">${fmtTry(row.minWageGrossTry)}</td>
                <td style="padding: 13px 14px;">${fmtTry(row.minWageNetTry)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Legal Guide Section (İş Kanunu 4857) -->
      <div style="margin-top: 48px;">
        <h2 style="font-size: 1.5rem; font-weight: 900; color: var(--text-heading); margin-bottom: 24px;">
          <i class="fa-solid fa-gavel" style="color: #f59e0b; margin-inline-end: 8px;"></i>
          ${t.legalGuideTitle}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 22px;">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-heading); margin-bottom: 10px;">${t.rule1Title}</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; margin: 0;">${t.rule1Desc}</p>
          </div>
          <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 22px;">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-heading); margin-bottom: 10px;">${t.rule2Title}</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; margin: 0;">${t.rule2Desc}</p>
          </div>
          <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 22px;">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-heading); margin-bottom: 10px;">${t.rule3Title}</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; margin: 0;">${t.rule3Desc}</p>
          </div>
          <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 22px;">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-heading); margin-bottom: 10px;">${t.rule4Title}</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; margin: 0;">${t.rule4Desc}</p>
          </div>
        </div>
      </div>

      <!-- Rich FAQ Accordion -->
      <div style="margin-top: 48px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 28px;">
        <h2 style="font-size: 1.4rem; font-weight: 900; color: var(--text-heading); margin-bottom: 20px;">
          <i class="fa-solid fa-circle-question" style="color: #6366f1; margin-inline-end: 8px;"></i>
          ${t.faqTitle}
        </h2>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${t.faqs.map((faq: any, idx: number) => `
            <details ${idx === 0 ? 'open' : ''} style="border: 1px solid var(--border); border-radius: 12px; padding: 14px 18px; background: var(--bg-subtle);">
              <summary style="font-weight: 800; font-size: 0.98rem; color: var(--text-heading); cursor: pointer;">${faq.question}</summary>
              <p style="margin: 10px 0 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.7;">${faq.answer}</p>
            </details>
          `).join('')}
        </div>
      </div>
    </section>

    <script>
      (function() {
        const KIDEM_CEILING = 64948.77;
        const STAMP_TAX = 0.00759;
        const IHBAR_TAX = 0.15;

        const elStart = document.getElementById('sev-start');
        const elEnd = document.getElementById('sev-end');
        const elReason = document.getElementById('sev-reason');
        const elSalaryType = document.getElementById('sev-salary-type');
        const elSalary = document.getElementById('sev-salary');
        const elFood = document.getElementById('sev-food');
        const elTransport = document.getElementById('sev-transport');
        const elBonus = document.getElementById('sev-bonus');
        const elLeaveDays = document.getElementById('sev-leave-days');

        const fmt = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';

        function compute() {
          const start = new Date(elStart.value || '2023-01-01');
          const end = new Date(elEnd.value || '2026-10-01');
          const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
          const years = Math.floor(totalDays / 365);
          const rem = totalDays % 365;
          const months = Math.floor(rem / 30);
          const days = rem % 30;

          const rawSalary = Math.max(0, parseFloat(elSalary.value) || 0);
          const baseGross = elSalaryType.value === 'net' ? (rawSalary / 0.85) : rawSalary;
          const food = Math.max(0, parseFloat(elFood.value) || 0);
          const transport = Math.max(0, parseFloat(elTransport.value) || 0);
          const bonus = Math.max(0, parseFloat(elBonus.value) || 0);
          const dressedGross = baseGross + food + transport + bonus;

          const reason = elReason.value;
          const hasOneYear = totalDays >= 365;
          const eligibleKidem = hasOneYear && reason !== 'voluntary_resignation';
          const eligibleIhbar = reason === 'employer_dismissal';

          const cappedBase = Math.min(dressedGross, KIDEM_CEILING);
          const grossKidem = eligibleKidem ? ((years * cappedBase) + (months * (cappedBase / 12)) + (days * (cappedBase / 365))) : 0;
          const taxKidem = grossKidem * STAMP_TAX;
          const netKidem = grossKidem - taxKidem;

          let noticeWeeks = 2;
          if (totalDays >= 1095) noticeWeeks = 8;
          else if (totalDays >= 548) noticeWeeks = 6;
          else if (totalDays >= 180) noticeWeeks = 4;
          const noticeDays = noticeWeeks * 7;

          const grossIhbar = eligibleIhbar ? ((dressedGross / 30) * noticeDays) : 0;
          const taxIhbar = grossIhbar * (IHBAR_TAX + STAMP_TAX);
          const netIhbar = grossIhbar - taxIhbar;

          const leaveDays = Math.max(0, parseFloat(elLeaveDays.value) || 0);
          const grossLeave = (baseGross / 30) * leaveDays;
          const taxLeave = grossLeave * (0.15 + 0.1275 + STAMP_TAX);
          const netLeave = grossLeave - taxLeave;

          const totalGross = grossKidem + grossIhbar + grossLeave;
          const totalNet = netKidem + netIhbar + netLeave;

          document.getElementById('out-tenure-badge').textContent =
            '${t.tenureBadgeLabel} ' + years + ' ${t.yearsUnit} ' + months + ' ${t.monthsUnit} ' + days + ' ${t.daysUnit}';
          document.getElementById('out-dressed-gross').textContent = fmt(dressedGross);

          document.getElementById('out-ceiling-alert').style.display = (dressedGross > KIDEM_CEILING && eligibleKidem) ? 'block' : 'none';
          document.getElementById('out-ineligible-alert').style.display = (!eligibleKidem) ? 'block' : 'none';

          document.getElementById('out-kidem-net').textContent = fmt(netKidem);
          document.getElementById('out-kidem-gross').textContent = fmt(grossKidem);
          document.getElementById('out-kidem-tax').textContent = '-' + fmt(taxKidem);

          document.getElementById('out-ihbar-net').textContent = fmt(netIhbar);
          document.getElementById('out-ihbar-weeks').textContent = noticeWeeks + ' (' + noticeDays + ' ${t.daysUnit})';
          document.getElementById('out-ihbar-gross').textContent = fmt(grossIhbar);
          document.getElementById('out-ihbar-tax').textContent = '-' + fmt(taxIhbar);

          document.getElementById('out-leave-net').textContent = fmt(netLeave);
          document.getElementById('out-leave-gross').textContent = fmt(grossLeave);
          document.getElementById('out-leave-tax').textContent = '-' + fmt(taxLeave);

          document.getElementById('out-total-net').textContent = fmt(totalNet);
          document.getElementById('out-total-gross').textContent = fmt(totalGross);
        }

        [elStart, elEnd, elReason, elSalaryType, elSalary, elFood, elTransport, elBonus, elLeaveDays].forEach(el => {
          if (el) el.addEventListener('input', compute);
          if (el) el.addEventListener('change', compute);
        });

        document.getElementById('btn-min-wage')?.addEventListener('click', function() {
          elSalaryType.value = 'gross';
          elSalary.value = '33030';
          compute();
        });

        document.getElementById('btn-auto-leave')?.addEventListener('click', function() {
          const start = new Date(elStart.value || '2023-01-01');
          const end = new Date(elEnd.value || '2026-10-01');
          const years = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (86400000 * 365)));
          let total = 0;
          for (let y = 1; y <= years; y++) {
            if (y <= 5) total += 14;
            else if (y < 15) total += 20;
            else total += 26;
          }
          elLeaveDays.value = String(total);
          compute();
        });

        document.getElementById('btn-share-wa')?.addEventListener('click', function() {
          const totalNet = document.getElementById('out-total-net')?.textContent || '';
          const text = encodeURIComponent('${t.title}: ' + totalNet + ' - ' + window.location.href);
          window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
        });

        compute();
      })();
    </script>
  `;

  c.header('Cache-Control', 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400');
  return c.html(renderLayout(c, t.title, contentHtml, locale, seoHead));
});
