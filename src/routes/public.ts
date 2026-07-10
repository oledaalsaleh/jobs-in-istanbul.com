import { Hono } from 'hono'
import { cache } from 'hono/cache'
import { generateMetaTags, generateJsonLd } from '../utils/seo-helper'
import { validateJobSubmission, validateTurnstile, rateLimiter, logSecurityEvent } from '../middleware/security'
import { themeCss } from '../public/css/theme'
import { sendTelegramAlert } from '../services/telegram'
import { assignJobImage } from '../services/scraper'
import { optimizeSeoWithGemini } from '../services/gemini-seo'
import { FAVICON_BASE64 } from '../utils/logo-base64'
import { notifyGoogleIndexing } from '../services/google-indexing'

export const publicRouter = new Hono()

export const ISTANBUL_DISTRICTS = [
  { en: 'Adalar', ar: 'الأمراء' },
  { en: 'Arnavutkoy', ar: 'أرناؤوط كوي' },
  { en: 'Atasehir', ar: 'أتاشهير' },
  { en: 'Avcilar', ar: 'أفجلار' },
  { en: 'Bagcilar', ar: 'باغجيلار' },
  { en: 'Bahcelievler', ar: 'باهتشلي إيفلر' },
  { en: 'Bakirkoy', ar: 'باكركوي' },
  { en: 'Basaksehir', ar: 'باشاك شهير' },
  { en: 'Bayrampase', ar: 'بايرام باشا' },
  { en: 'Besiktas', ar: 'بشيكتاش' },
  { en: 'Beykoz', ar: 'بيكوز' },
  { en: 'Beylikduzu', ar: 'بيليك دوزو' },
  { en: 'Beyoglu', ar: 'بي أوغلو' },
  { en: 'Buyukcekmece', ar: 'بويوك تشكمجة' },
  { en: 'Catalca', ar: 'تشاتالجا' },
  { en: 'Cekmekoy', ar: 'تشيكمه كوي' },
  { en: 'Esenler', ar: 'إيسنلر' },
  { en: 'Esenyurt', ar: 'إسنيورت' },
  { en: 'Eyupsultan', ar: 'أيوب سلطان' },
  { en: 'Fatih', ar: 'الفاتح' },
  { en: 'Gaziosmanpasa', ar: 'غازي عثمان باشا' },
  { en: 'Gungoren', ar: 'غونغورين' },
  { en: 'Kadikoy', ar: 'كاديكوي' },
  { en: 'Kagithane', ar: 'كاغد خانة' },
  { en: 'Kartal', ar: 'كارتال' },
  { en: 'Kucukcekmece', ar: 'كوتشوك تشكمجة' },
  { en: 'Maltepe', ar: 'مالتبة' },
  { en: 'Pendik', ar: 'بينديك' },
  { en: 'Sancaktepe', ar: 'سانجاك تبه' },
  { en: 'Sariyer', ar: 'ساريير' },
  { en: 'Silivri', ar: 'سيليفري' },
  { en: 'Sultanbeyli', ar: 'سلطان بيلي' },
  { en: 'Sultangazi', ar: 'سلطان غازي' },
  { en: 'Sile', ar: 'شيله' },
  { en: 'Sisli', ar: 'شيشلي' },
  { en: 'Tuzla', ar: 'توزلا' },
  { en: 'Umraniye', ar: 'عمرانية' },
  { en: 'Uskudar', ar: 'أوسكودار' },
  { en: 'Zeytinburnu', ar: 'زيتون بورنو' }
];

// Serve our CSS file directly from the bundled memory
publicRouter.get('/css/theme.css', (c) => {
  return c.body(themeCss, 200, {
    'Content-Type': 'text/css',
    'Cache-Control': 'public, max-age=3600'
  })
})

// Base layout helper
export function renderLayout(c: any, title: string, contentHtml: string, locale: 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur', seoHtml: string = '') {
  const isRtl = locale === 'ar' || locale === 'fa' || locale === 'ur';

  if (!seoHtml) {
    let pageType: any = 'home';
    const path = c.req.path;
    if (path.includes('/jobs/')) {
      pageType = 'job';
    } else if (path.endsWith('/submit-job') || path.includes('/submit-job/')) {
      pageType = 'submit';
    } else if (path.includes('/blog/')) {
      pageType = 'blog_post';
    } else if (path.endsWith('/blog') || path.endsWith('/blog/')) {
      pageType = 'blog';
    } else if (path.includes('/cv-optimizer')) {
      pageType = 'cv-optimizer';
    } else if (path.includes('/salary-calculator')) {
      pageType = 'salary-calculator';
    } else if (path.includes('/resume-builder')) {
      pageType = 'resume-builder';
    } else if (path.includes('/cover-letter-generator')) {
      pageType = 'cover-letter-generator';
    } else if (path.includes('/work-permit-calculator')) {
      pageType = 'work-permit-calculator';
    } else if (path.includes('/turkish-test')) {
      pageType = 'turkish-test';
    } else if (path.includes('/interview-prep')) {
      pageType = 'interview-prep';
    } else if (path.includes('/ats-scanner')) {
      pageType = 'ats-scanner';
    } else if (path.includes('/workplace-quiz')) {
      pageType = 'workplace-quiz';
    } else if (path.includes('/currency-prices')) {
      pageType = 'currency-prices';
    } else if (path.includes('/gold-prices')) {
      pageType = 'gold-prices';
    } else if (path.includes('/insights')) {
      pageType = 'insights';
    } else if (path.includes('/about')) {
      pageType = 'about';
    } else if (path.includes('/contact')) {
      pageType = 'contact';
    } else if (path.includes('/privacy')) {
      pageType = 'privacy';
    } else if (path.includes('/terms')) {
      pageType = 'terms';
    } else if (path.includes('/install')) {
      pageType = 'install';
    }

    const data: any = { title };
    if (pageType === 'job' || pageType === 'blog_post') {
      const parts = path.split('/');
      data.slug = parts[parts.length - 1];
    }

    seoHtml = generateMetaTags(locale, pageType, data) + generateJsonLd(locale, pageType, data);
  }

  const translations = {
    ar: {
      siteName: 'فرص عمل في إسطنبول',
      tagline: 'أفضل الوظائف في إسطنبول',
      findJob: 'ابحث عن وظيفتك',
      postJob: 'أعلن عن وظيفة',
      allJobs: 'كل الوظائف',
      about: 'من نحن',
      contact: 'اتصل بنا',
      copyright: '© ٢٠٢٦ فرص عمل في إسطنبول. جميع الحقوق محفوظة.',
      langLabel: 'العربية',
      home: 'الرئيسية',
      aiTools: 'أدوات AI الذكية',
      cvOptimizer: 'تحسين السيرة بالذكاء الاصطناعي',
      atsScanner: 'فاحص السيرة الذاتية (ATS Scanner)',
      coverLetter: 'توليد رسائل التغطية بالذكاء الاصطناعي',
      interviewPrep: 'محاكي مقابلات التوظيف بالذكاء الاصطناعي',
      toolsAndTests: 'الأدوات والتقييمات',
      cvBuilder: 'منشئ السيرة الذاتية التفاعلي',
      workPermit: 'حاسبة إذن العمل والجنسية',
      salaryCalc: 'مؤشر رواتب إسطنبول ٢٠٢٦',
      turkishTest: 'اختبار اللغة التركية للعمل',
      workplaceQuiz: 'اختبار ملاءمة بيئة العمل التركية',
      currencyPrices: 'أسعار العملات في تركيا',
      goldPrices: 'أسعار الذهب في تركيا',
      insights: 'إحصائيات السوق',
      blog: 'مدونة المهنة',
      candidatePortal: 'بوابة الباحث',
      employerPortal: 'بوابة الأعمال',
      savedJobs: 'المفضلة',
      darkMode: 'الوضع الداكن',
      telegram: 'تلغرام',
      platform: 'المنصة',
      smartTools: 'الأدوات الذكية',
      legal: 'العقود والمسؤوليات',
      privacy: 'سياسة الخصوصية',
      terms: 'الشروط والأحكام',
      realOpportunities: 'فرص حقيقية',
      footerTagline: 'المنصة الرائدة لربط الكفاءات العربية والأجنبية بأفضل فرص العمل في إسطنبول.',
      joinTelegram: 'انضم لقناة التلغرام',
      mobileJoinTelegram: 'انضم لقناتنا على التلغرام',
      installApp: 'تثبيت التطبيق',
      languages: 'اللغات'
    },
    en: {
      siteName: 'Istanbul Jobs',
      tagline: 'Job Opportunities in Istanbul',
      findJob: 'Find a Job',
      postJob: 'Post a Job',
      allJobs: 'All Jobs',
      about: 'About Us',
      contact: 'Contact Us',
      copyright: '© 2026 Istanbul Jobs. All rights reserved.',
      langLabel: 'English',
      home: 'Home',
      aiTools: 'AI Tools',
      cvOptimizer: 'AI CV Optimizer',
      atsScanner: 'AI CV ATS Scanner',
      coverLetter: 'AI Cover Letter Generator',
      interviewPrep: 'AI Interview Simulator',
      toolsAndTests: 'Tools & Tests',
      cvBuilder: 'Interactive CV Builder',
      workPermit: 'Work Permit & Citizenship Calculator',
      salaryCalc: 'Istanbul Salary Estimator',
      turkishTest: 'Business Turkish Level Test',
      workplaceQuiz: 'Turkish Workplace Fit Quiz',
      currencyPrices: 'TRY Currency Prices',
      goldPrices: 'Gold Prices in Turkey',
      insights: 'Market Insights',
      blog: 'Career Blog',
      candidatePortal: 'Candidate Portal',
      employerPortal: 'Employer Portal',
      savedJobs: 'Saved Jobs',
      darkMode: 'Dark Mode',
      telegram: 'Telegram',
      platform: 'Platform',
      smartTools: 'Smart Tools',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      realOpportunities: 'Real Opportunities',
      footerTagline: 'The leading platform connecting Arab & international talents with the best job opportunities in Istanbul.',
      joinTelegram: 'Join Telegram Channel',
      mobileJoinTelegram: 'Join Our Telegram',
      installApp: 'Install App',
      languages: 'Languages'
    },
    tr: {
      siteName: 'İstanbul İş İlanları',
      tagline: 'İstanbul\'daki En İyi İş Fırsatları',
      findJob: 'İş Bul',
      postJob: 'İş İlanı Ver',
      allJobs: 'Tüm İşler',
      about: 'Hakkımızda',
      contact: 'İletişim',
      copyright: '© 2026 İstanbul İş İlanları. Tüm hakları saklıdır.',
      langLabel: 'Türkçe',
      home: 'Ana Sayfa',
      aiTools: 'AI Araçları',
      cvOptimizer: 'AI CV Geliştirici',
      atsScanner: 'AI CV ATS Tarayıcı',
      coverLetter: 'AI Ön Yazı Hazırlayıcı',
      interviewPrep: 'AI Mülakat Simülatörü',
      toolsAndTests: 'Araçlar ve Testler',
      cvBuilder: 'İnteraktif CV Oluşturucu',
      workPermit: 'Çalışma İzni ve Vatandaşlık Hesaplama',
      salaryCalc: 'İstanbul Maaş Hesaplayıcı',
      turkishTest: 'İş İçin Türkçe Dil Testi',
      workplaceQuiz: 'İş Yeri Kültür Testi',
      currencyPrices: 'Türkiye Döviz Fiyatları',
      goldPrices: 'Türkiye Altın Fiyatları',
      insights: 'Piyasa Analizleri',
      blog: 'Kariyer Blogu',
      candidatePortal: 'Aday Portalı',
      employerPortal: 'İşveren Portalı',
      savedJobs: 'Kaydedilen İşler',
      darkMode: 'Karanlık Tema',
      telegram: 'Telegram',
      platform: 'Platform',
      smartTools: 'Akıllı Araçlar',
      legal: 'Yasal',
      privacy: 'Gizlilik Politikası',
      terms: 'Kullanım Şartları',
      realOpportunities: 'Gerçek Fırsatlar',
      footerTagline: 'Arap ve uluslararası yetenekleri İstanbul\'daki en iyi iş fırsatlarıyla buluşturan lider platform.',
      joinTelegram: 'Telegram Kanalımıza Katılın',
      mobileJoinTelegram: 'Telegram\'a Katılın',
      installApp: 'Uygulamayı Yükle',
      languages: 'Diller'
    },
    ru: {
      siteName: 'Работа в Стамбуле',
      tagline: 'Вакансии в Стамбуле',
      findJob: 'Найти работу',
      postJob: 'Разместить вакансию',
      allJobs: 'Все вакансии',
      about: 'О нас',
      contact: 'Контакты',
      copyright: '© 2026 Работа в Стамбуле. Все права защищены.',
      langLabel: 'Русский',
      home: 'Главная',
      aiTools: 'Инструменты ИИ',
      cvOptimizer: 'Оптимизатор резюме',
      atsScanner: 'Сканер резюме ATS',
      coverLetter: 'Генератор сопроводительных писем',
      interviewPrep: 'Симулятор собеседований',
      toolsAndTests: 'Инструменты и тесты',
      cvBuilder: 'Конструктор резюме',
      workPermit: 'Калькулятор разрешения на работу',
      salaryCalc: 'Показатель зарплат Стамбула',
      turkishTest: 'Тест на знание делового турецкого',
      workplaceQuiz: 'Тест на адаптацию в коллективе',
      currencyPrices: 'Курсы валют в Турции',
      goldPrices: 'Цены на золото в Турции',
      insights: 'Аналитика рынка',
      blog: 'Блог о карьере',
      candidatePortal: 'Портал кандидата',
      employerPortal: 'Портал работодателя',
      savedJobs: 'Избранное',
      darkMode: 'Темный режим',
      telegram: 'Telegram',
      platform: 'Платформа',
      smartTools: 'Умные инструменты',
      legal: 'Юридическая информация',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      realOpportunities: 'Реальные возможности',
      footerTagline: 'Ведущая платформа, соединяющая арабские и международные таланты с лучшими вакансиями в Стамбуле.',
      joinTelegram: 'Присоединиться к Telegram',
      mobileJoinTelegram: 'Наш Telegram',
      installApp: 'Установить приложение',
      languages: 'Языки'
    },
    fa: {
      siteName: 'کاریابی در استانبول',
      tagline: 'بهترین مشاغل در استانبول',
      findJob: 'جستجوی کار',
      postJob: 'ثبت آگهی استخدام',
      allJobs: 'همه مشاغل',
      about: 'درباره ما',
      contact: 'تماس با ما',
      copyright: '© ۲۰۲۶ کاریابی در استانبول. تمامی حقوق محفوظ است.',
      langLabel: 'فارسی',
      home: 'خانه',
      aiTools: 'ابزارهای هوشمند کار',
      cvOptimizer: 'بهینه‌ساز رزومه با هوش مصنوعی',
      atsScanner: 'بررسی رزومه با سیستم ATS',
      coverLetter: 'نگارش انگیزه‌نامه با هوش مصنوعی',
      interviewPrep: 'شبیه‌ساز مصاحبه کاری هوش مصنوعی',
      toolsAndTests: 'ابزارها و ارزیابی‌ها',
      cvBuilder: 'رزومه‌ساز تعاملی حرفه‌ای',
      workPermit: 'محاسبه اجازه کار و شهروندی',
      salaryCalc: 'شاخص حقوق و دستمزد استانبول',
      turkishTest: 'آزمون ترکی تجاری و کاری',
      workplaceQuiz: 'آزمون انطباق با محیط کار ترکیه',
      currencyPrices: 'نرخ ارز در ترکیه امروز',
      goldPrices: 'قیمت طلا در ترکیه امروز',
      insights: 'آمار و تحلیل بازار کار',
      blog: 'وبلاگ کاریابی',
      candidatePortal: 'پورتال کارجویان',
      employerPortal: 'پورتال کارفرمایان',
      savedJobs: 'علاقه‌مندی‌ها',
      darkMode: 'حالت تاریک',
      telegram: 'تلگرام',
      platform: 'پلتفرم',
      smartTools: 'ابزارهای هوشمند',
      legal: 'حقوقی',
      privacy: 'حفظ حریم خصوصی',
      terms: 'شرایط استفاده',
      realOpportunities: 'فرصت‌های واقعی کار',
      footerTagline: 'پلتفرم پیشرو برای اتصال متخصصان بین‌المللی و فارسی‌زبان به بهترین فرصت‌های شغلی در استانبول بزرگ.',
      joinTelegram: 'عضویت در کانال تلگرام ما',
      mobileJoinTelegram: 'کانال تلگرام ما',
      installApp: 'نصب اپلیکیشن موبایل',
      languages: 'زبان‌ها'
    },
    ur: {
      siteName: 'استنبول میں ملازمتیں',
      tagline: 'استنبول میں بہترین ملازمتیں',
      findJob: 'ملازمت تلاش کریں',
      postJob: 'ملازمت کا اشتہار دیں',
      allJobs: 'تمام ملازمتیں',
      about: 'ہمارے بارے میں',
      contact: 'ہم سے رابطہ کریں',
      copyright: '© ۲۰۲۶ استنبول میں ملازمتیں. جملہ حقوق محفوظ ہیں۔',
      langLabel: 'اردو',
      home: 'ہوم',
      aiTools: 'مصنوعی ذہانت (AI) ٹولز',
      cvOptimizer: 'اے آئی سی وی آپٹیمائزر',
      atsScanner: 'اے آئی سی وی اے ٹی ایس اسکینر',
      coverLetter: 'اے آئی کور لیٹر جنریٹر',
      interviewPrep: 'اے آئی انٹرویو سمیلیٹر',
      toolsAndTests: 'ٹولز اور ٹیسٹ',
      cvBuilder: 'انٹرایکٹو سی وی میکر',
      workPermit: 'ورک پرمٹ اور شہریت کاؤنٹر',
      salaryCalc: 'استنبول تنخواہ انڈیکس ۲۰۲۶',
      turkishTest: 'کاروباری ترکی زبان کا ٹیسٹ',
      workplaceQuiz: 'ترکی کام کے ماحول کا کوئز',
      currencyPrices: 'ترکی میں کرنسی کی قیمتیں',
      goldPrices: 'ترکی میں سونے کی قیمتیں',
      insights: 'مارکیٹ کے اعداد و شمار',
      blog: 'کیریئر بلاگ',
      candidatePortal: 'امیدوار کا پورٹل',
      employerPortal: 'مالکِ ملازم کا پورٹل',
      savedJobs: 'پسندیدہ ملازمتیں',
      darkMode: 'ڈارک موڈ',
      telegram: 'ٹیلی گرام',
      platform: 'پلیٹ فارم',
      smartTools: 'اسمارٹ ٹولز',
      legal: 'قانونی معلومات',
      privacy: 'رازداری کی پالیسی',
      terms: 'شرایط و ضوابط',
      realOpportunities: 'حقیقی مواقع',
      footerTagline: 'بین الاقوامی اور اردو بولنے والے ہنرمندوں کو استنبول میں بہترین ملازمتوں سے جوڑنے والا سب سے بڑا پلیٹ فارم۔',
      joinTelegram: 'ہمارے ٹیلی گرام چینل میں شامل ہوں',
      mobileJoinTelegram: 'ٹیلی گرام چینل',
      installApp: 'موبائل ایپ انسٹال کریں',
      languages: 'زبانیں'
    }
  };

  const t = translations[locale];
  const oppositeLocale = locale === 'ar' ? 'en' : 'ar';
  const requestPath = c.req.path;

  const getLangUrl = (path: string, targetLocale: string) => {
    let cleanPath = path;
    if (path.startsWith('/ar/') || path.startsWith('/en/') || path.startsWith('/tr/') || path.startsWith('/ru/') || path.startsWith('/fa/') || path.startsWith('/ur/')) {
      cleanPath = path.substring(3);
    } else if (path === '/ar' || path === '/en' || path === '/tr' || path === '/ru' || path === '/fa' || path === '/ur') {
      cleanPath = '';
    }
    if (cleanPath && !cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    return `/${targetLocale}${cleanPath}`;
  };

  // Calculate language switch URL
  let langSwitchUrl = `/${oppositeLocale}`;
  if (requestPath.includes('/jobs/')) {
    const slug = requestPath.split('/jobs/')[1];
    langSwitchUrl = `/${oppositeLocale}/jobs/${slug}`;
  } else if (requestPath.includes('/blog/')) {
    const slug = requestPath.split('/blog/')[1];
    langSwitchUrl = `/${oppositeLocale}/blog/${slug}`;
  } else if (requestPath.endsWith('/blog') || requestPath.endsWith('/blog/')) {
    langSwitchUrl = `/${oppositeLocale}/blog`;
  } else if (requestPath.includes('/insights')) {
    langSwitchUrl = `/${oppositeLocale}/insights`;
  } else if (requestPath.includes('/ats-scanner')) {
    langSwitchUrl = `/${oppositeLocale}/ats-scanner`;
  } else if (requestPath.includes('/currency-prices')) {
    langSwitchUrl = `/${oppositeLocale}/currency-prices`;
  } else if (requestPath.includes('/gold-prices')) {
    langSwitchUrl = `/${oppositeLocale}/gold-prices`;
  }

  void langSwitchUrl;

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${c.env?.GOOGLE_SITE_VERIFICATION && c.env.GOOGLE_SITE_VERIFICATION !== 'ADD_YOUR_GOOGLE_VERIFICATION_CODE_HERE' ? `<meta name="google-site-verification" content="${c.env.GOOGLE_SITE_VERIFICATION}" />` : ''}
  ${c.env?.BING_SITE_VERIFICATION ? `<meta name="msvalidate.01" content="${c.env.BING_SITE_VERIFICATION}" />` : ''}
  ${c.env?.YANDEX_SITE_VERIFICATION ? `<meta name="yandex-verification" content="${c.env.YANDEX_SITE_VERIFICATION}" />` : ''}
  ${seoHtml ? seoHtml : `<title>${title} | ${t.tagline}</title>`}

  <!-- كود ربط ملف معلومات التطبيق Manifest -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#007bff">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Jobs in Istanbul">
  <link rel="apple-touch-icon" href="/icon-192.png">
  
  <!-- Preconnect for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  
  <!-- Stylesheet -->
  <link rel="stylesheet" href="/css/theme.css?v=1.0.5">
  
  <!-- Critical inline CSS for zero flash -->
  <style>
    html, body {
      width: 100% !important;
      max-width: 100% !important;
      overflow-x: hidden !important;
    }
    .page-wrapper {
      width: 100% !important;
      max-width: 100% !important;
      overflow-x: hidden !important;
      position: relative !important;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    body { font-family: ${isRtl ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif"}; }
    .site-header { transform: translateY(0); }
    @media (max-width: 480px) {
      .hero-title { font-size: 1.7rem !important; }
      .hero-subtitle { font-size: 0.95rem !important; margin-bottom: 24px !important; }
    }
  </style>
</head>
<body class="${isRtl ? 'rtl' : ''}">
  <div class="page-wrapper">

  <!-- HEADER -->
  <header class="site-header" id="site-header">
    <div class="container header-inner" style="max-width:1360px">

      <!-- Logo -->
      <a href="/${locale}" class="logo">
        <div class="logo-icon">
          <i class="fa-solid fa-briefcase"></i>
        </div>
        <div class="logo-text">
          <strong>${t.siteName}</strong>
          <span>${t.tagline}</span>
        </div>
      </a>

      <!-- Desktop Nav -->
      <nav id="desktop-nav">
        <style>
          .nav-dropdown {
            position: relative;
          }
          .nav-dropdown-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            box-shadow: var(--shadow-lg);
            min-width: 250px;
            padding: 8px 0;
            z-index: 1000;
            margin-top: 4px;
            animation: dropdownFade 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .nav-dropdown:hover .nav-dropdown-menu {
            display: block;
          }
          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-body);
            transition: var(--t-base);
          }
          .dropdown-item:hover {
            background: var(--primary-light);
            color: var(--primary);
          }
          .dropdown-item i {
            font-size: 0.95rem;
            width: 18px;
            text-align: center;
            opacity: 0.8;
          }
          @keyframes dropdownFade {
            from { opacity: 0; transform: translate(-50%, 8px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        </style>
        <ul class="nav-links">
          <li><a href="/${locale}" class="nav-link">🏠 ${t.home}</a></li>
          
          <!-- Dropdown: AI Tools -->
          <li class="nav-dropdown">
            <a href="#" class="nav-link" onclick="event.preventDefault()">🤖 ${t.aiTools} ▾</a>
            <div class="nav-dropdown-menu">
              <a href="/${locale}/cv-optimizer" class="dropdown-item">
                <i class="fa-solid fa-wand-magic-sparkles" style="color: var(--primary);"></i>
                <span>${t.cvOptimizer}</span>
              </a>
              <a href="/${locale}/ats-scanner" class="dropdown-item">
                <i class="fa-solid fa-barcode" style="color: #6366f1;"></i>
                <span>${t.atsScanner}</span>
              </a>
              <a href="/${locale}/cover-letter-generator" class="dropdown-item">
                <i class="fa-solid fa-pen-nib" style="color: var(--accent);"></i>
                <span>${t.coverLetter}</span>
              </a>
              <a href="/${locale}/interview-prep" class="dropdown-item">
                <i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i>
                <span>${t.interviewPrep}</span>
              </a>
            </div>
          </li>

          <!-- Dropdown: Career & Rules -->
          <li class="nav-dropdown">
            <a href="#" class="nav-link" onclick="event.preventDefault()">🛠 ${t.toolsAndTests} ▾</a>
            <div class="nav-dropdown-menu">
              <a href="/${locale}/resume-builder" class="dropdown-item">
                <i class="fa-solid fa-file-invoice" style="color: #eab308;"></i>
                <span>${t.cvBuilder}</span>
              </a>
              <a href="/${locale}/work-permit-calculator" class="dropdown-item">
                <i class="fa-solid fa-passport" style="color: #a855f7;"></i>
                <span>${t.workPermit}</span>
              </a>
              <a href="/${locale}/turkish-test" class="dropdown-item">
                <i class="fa-solid fa-graduation-cap" style="color: #14b8a6;"></i>
                <span>${t.turkishTest}</span>
              </a>
              <a href="/${locale}/salary-calculator" class="dropdown-item">
                <i class="fa-solid fa-scale-balanced" style="color: #ec4899;"></i>
                <span>${t.salaryCalc}</span>
              </a>
              <a href="/${locale}/currency-prices" class="dropdown-item">
                <i class="fa-solid fa-coins" style="color: #0ea5e9;"></i>
                <span>${t.currencyPrices}</span>
              </a>
              <a href="/${locale}/gold-prices" class="dropdown-item">
                <i class="fa-solid fa-gem" style="color: #f59e0b;"></i>
                <span>${t.goldPrices}</span>
              </a>
              <a href="/${locale}/install" class="dropdown-item">
                <i class="fa-solid fa-mobile-screen-button" style="color: var(--primary);"></i>
                <span>${t.installApp}</span>
              </a>
            </div>
          </li>
          
          <li><a href="/${locale}/insights" class="nav-link">📊 ${t.insights}</a></li>
          <li><a href="/${locale}/blog" class="nav-link">📝 ${t.blog}</a></li>
          <li><a href="/${locale}/candidate/dashboard" class="nav-link" style="color: var(--primary);"><i class="fa-solid fa-graduation-cap"></i> ${t.candidatePortal}</a></li>
          <li><a href="/${locale}/employer/dashboard" class="nav-link nav-cta"><i class="fa-solid fa-user-tie"></i> ${t.employerPortal}</a></li>
          <li>
            <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" class="nav-link nav-cta" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; color: white !important; font-weight: 800; border-radius: var(--r-sm) !important; padding: 7px 16px !important; display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-paper-plane" style="font-size: 0.9rem;"></i>
              <span>${locale === 'ar' ? 'أضف إعلانك مجاناً' : (locale === 'tr' ? 'Ücretsiz İlan Ekle' : 'Post a Job Free')}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Header Actions -->
      <div class="header-actions">
        <a href="/${locale}?favorites=1" class="icon-btn" title="${t.savedJobs}">
          <i class="fa-regular fa-heart"></i>
          <span class="badge" id="fav-count-badge">0</span>
        </a>
        <button id="dark-mode-toggle" class="icon-btn" title="${t.darkMode}">
          <i class="fa-solid fa-moon"></i>
        </button>
        <a href="/${locale}/install" class="header-install-btn" title="${t.installApp}">
          <i class="fa-solid fa-mobile-screen-button"></i>
          <span>${t.installApp}</span>
        </a>
        <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" class="header-telegram-btn" title="${t.joinTelegram}">
          <i class="fa-brands fa-telegram"></i>
          <span>${t.telegram}</span>
        </a>
        <!-- Desktop Language Dropdown -->
        <div class="nav-dropdown">
          <a href="#" class="lang-btn" onclick="event.preventDefault()">
            <img src="${locale === 'ar' ? 'https://flagcdn.com/w20/sa.png' : (locale === 'tr' ? 'https://flagcdn.com/w20/tr.png' : (locale === 'ru' ? 'https://flagcdn.com/w20/ru.png' : (locale === 'fa' ? 'https://flagcdn.com/w20/ir.png' : (locale === 'ur' ? 'https://flagcdn.com/w20/pk.png' : 'https://flagcdn.com/w20/gb.png'))))}" alt="${locale}" style="width: 18px; height: 13px; border-radius: 1px; object-fit: cover;">
            <span>${locale === 'ar' ? 'العربية' : (locale === 'tr' ? 'Türkçe' : (locale === 'ru' ? 'Русский' : (locale === 'fa' ? 'فارسی' : (locale === 'ur' ? 'اردو' : 'English'))))}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 0.65rem; opacity: 0.7;"></i>
          </a>
          <div class="nav-dropdown-menu" style="min-width: 140px; padding: 6px 0; ${isRtl ? 'right: auto; left: 50%; transform: translateX(-50%);' : 'left: auto; right: 50%; transform: translateX(50%);'}">
            <a href="${getLangUrl(requestPath, 'ar')}" class="dropdown-item" style="gap: 8px; justify-content: flex-start;">
              <img src="https://flagcdn.com/w20/sa.png" alt="العربية" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>العربية</span>
            </a>
            <a href="${getLangUrl(requestPath, 'tr')}" class="dropdown-item" style="gap: 8px; justify-content: flex-start;">
              <img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>Türkçe</span>
            </a>
            <a href="${getLangUrl(requestPath, 'en')}" class="dropdown-item" style="gap: 8px; justify-content: flex-start;">
              <img src="https://flagcdn.com/w20/gb.png" alt="English" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>English</span>
            </a>
            <a href="${getLangUrl(requestPath, 'ru')}" class="dropdown-item" style="gap: 8px; justify-content: flex-start;">
              <img src="https://flagcdn.com/w20/ru.png" alt="Русский" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>Русский</span>
            </a>
            <a href="${getLangUrl(requestPath, 'fa')}" class="dropdown-item" style="gap: 8px; justify-content: flex-start;">
              <img src="https://flagcdn.com/w20/ir.png" alt="فارسی" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>فارسی</span>
            </a>
            <a href="${getLangUrl(requestPath, 'ur')}" class="dropdown-item" style="gap: 8px; justify-content: flex-start;">
              <img src="https://flagcdn.com/w20/pk.png" alt="اردو" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>اردو</span>
            </a>
          </div>
        </div>
        <!-- Mobile hamburger -->
        <button class="icon-btn" id="mobile-menu-btn" style="display:none">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>

    </div>
  </header>

  <!-- Mobile Nav Drawer -->
  <div id="mobile-nav" style="display:none; position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.5)" onclick="closeMobileNav(this,event)">
    <div style="position:absolute; ${isRtl ? 'right:0' : 'left:0'}; top:0; bottom:0; width:min(300px,85vw); background:var(--bg-card); padding:24px; overflow-y:auto; box-shadow:var(--shadow-xl); animation: slideIn${isRtl ? 'Right' : 'Left'} 0.3s var(--ease-out);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
        <a href="/${locale}" class="logo" style="font-size:1.2rem">
          <div class="logo-icon"><i class="fa-solid fa-briefcase"></i></div>
          <div class="logo-text"><strong>${t.siteName}</strong></div>
        </a>
        <button onclick="document.getElementById('mobile-nav').style.display='none'" class="icon-btn"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <nav style="display:flex; flex-direction:column; gap:6px;">
        <a href="/${locale}" style="padding:12px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'">🏠 ${t.home}</a>
        <a href="/${locale}/insights" style="padding:12px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'">📊 ${t.insights}</a>
        <a href="/${locale}/blog" style="padding:12px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'">📝 ${t.blog}</a>
        
        <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-top:14px; margin-bottom:6px; padding-inline-start:16px; letter-spacing:0.05em;">🤖 ${t.aiTools}</div>
        <a href="/${locale}/cv-optimizer" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--primary);"></i> ${t.cvOptimizer}</a>
        <a href="/${locale}/ats-scanner" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-barcode" style="color: #6366f1;"></i> ${t.atsScanner}</a>
        <a href="/${locale}/cover-letter-generator" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-pen-nib" style="color: var(--accent);"></i> ${t.coverLetter}</a>
        <a href="/${locale}/interview-prep" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i> ${t.interviewPrep}</a>

        <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-top:14px; margin-bottom:6px; padding-inline-start:16px; letter-spacing:0.05em;">🛠 ${t.toolsAndTests}</div>
        <a href="/${locale}/resume-builder" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-file-invoice" style="color: #eab308;"></i> ${t.cvBuilder}</a>
        <a href="/${locale}/work-permit-calculator" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-passport" style="color: #a855f7;"></i> ${t.workPermit}</a>
        <a href="/${locale}/turkish-test" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-graduation-cap" style="color: #14b8a6;"></i> ${t.turkishTest}</a>
        <a href="/${locale}/salary-calculator" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-scale-balanced" style="color: #ec4899;"></i> ${t.salaryCalc}</a>
        <a href="/${locale}/currency-prices" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-coins" style="color: #0ea5e9;"></i> ${t.currencyPrices}</a>
        <a href="/${locale}/gold-prices" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-gem" style="color: #f59e0b;"></i> ${t.goldPrices}</a>
        <a href="/${locale}/install" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-mobile-screen-button" style="color: var(--primary);"></i> ${t.installApp}</a>

        <div style="margin-top:14px; border-top:1px solid var(--border); padding-top:10px; display:flex; flex-direction:column; gap:6px;">
          <a href="/${locale}/submit-job" style="padding:12px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'">📢 ${t.postJob}</a>
          <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" style="margin-top:6px; padding:14px 16px; border-radius:var(--r-md); background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:white; font-weight:700; display:flex; align-items:center; gap:10px; justify-content:center;"><i class="fa-solid fa-paper-plane"></i> ${locale === 'ar' ? 'أضف إعلانك مجاناً' : (locale === 'tr' ? 'Ücretsiz İlan Ekle' : 'Post a Job Free')}</a>
          <a href="/${locale}/candidate/dashboard" style="padding:12px 16px; border-radius:var(--r-md); color:var(--primary); font-weight:700; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-graduation-cap"></i> ${t.candidatePortal}</a>
          <a href="/${locale}/employer/dashboard" style="margin-top:6px; padding:14px 16px; border-radius:var(--r-md); background:var(--primary); color:white; font-weight:700; display:flex; align-items:center; gap:10px; justify-content:center;"><i class="fa-solid fa-user-tie"></i> ${t.employerPortal}</a>
        </div>
        
        <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" style="margin-top:12px; display:flex; align-items:center; justify-content:center; gap:8px; background:#0088cc; color:white; padding:12px; border-radius:var(--r-md); font-weight:700; font-size:0.875rem; text-decoration:none; box-shadow:0 4px 12px rgba(0, 136, 204, 0.15);">
          <i class="fa-brands fa-telegram" style="font-size:1.2rem;"></i>
          ${t.mobileJoinTelegram}
        </a>

        <!-- Mobile Actions inside Drawer -->
        <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--border); display:flex; flex-direction:column; gap:16px; width:100%;">
          <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
            <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; padding-inline-start:4px; letter-spacing:0.05em;">🌐 ${locale === 'ar' ? 'اللغة' : (locale === 'tr' ? 'Dil' : 'Language')}</div>
            <button id="dark-mode-toggle-mobile" style="width:36px; height:36px; border-radius:var(--r-md); border:1.5px solid var(--border); background:transparent; display:flex; align-items:center; justify-content:center; color:var(--text-body); cursor:pointer; transition:var(--t-base);" title="${t.darkMode}">
              <i class="fa-solid fa-moon"></i>
            </button>
          </div>
          <div style="display:flex; gap:8px; width:100%; flex-wrap:wrap;">
            <a href="${getLangUrl(requestPath, 'ar')}" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px 8px; border-radius:var(--r-md); border:1.5px solid ${locale === 'ar' ? 'var(--primary)' : 'var(--border)'}; background: ${locale === 'ar' ? 'var(--primary-light)' : 'transparent'}; color:${locale === 'ar' ? 'var(--primary)' : 'var(--text-body)'}; font-size:0.8rem; font-weight:700; transition:var(--t-base); text-decoration:none;">
              <img src="https://flagcdn.com/w20/sa.png" alt="العربية" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>العربية</span>
            </a>
            <a href="${getLangUrl(requestPath, 'tr')}" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px 8px; border-radius:var(--r-md); border:1.5px solid ${locale === 'tr' ? 'var(--primary)' : 'var(--border)'}; background: ${locale === 'tr' ? 'var(--primary-light)' : 'transparent'}; color:${locale === 'tr' ? 'var(--primary)' : 'var(--text-body)'}; font-size:0.8rem; font-weight:700; transition:var(--t-base); text-decoration:none;">
              <img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>Türkçe</span>
            </a>
            <a href="${getLangUrl(requestPath, 'en')}" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px 8px; border-radius:var(--r-md); border:1.5px solid ${locale === 'en' ? 'var(--primary)' : 'var(--border)'}; background: ${locale === 'en' ? 'var(--primary-light)' : 'transparent'}; color:${locale === 'en' ? 'var(--primary)' : 'var(--text-body)'}; font-size:0.8rem; font-weight:700; transition:var(--t-base); text-decoration:none;">
              <img src="https://flagcdn.com/w20/gb.png" alt="English" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>English</span>
            </a>
            <a href="${getLangUrl(requestPath, 'ru')}" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px 8px; border-radius:var(--r-md); border:1.5px solid ${locale === 'ru' ? 'var(--primary)' : 'var(--border)'}; background: ${locale === 'ru' ? 'var(--primary-light)' : 'transparent'}; color:${locale === 'ru' ? 'var(--primary)' : 'var(--text-body)'}; font-size:0.8rem; font-weight:700; transition:var(--t-base); text-decoration:none;">
              <img src="https://flagcdn.com/w20/ru.png" alt="Русский" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>Русский</span>
            </a>
            <a href="${getLangUrl(requestPath, 'fa')}" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px 8px; border-radius:var(--r-md); border:1.5px solid ${locale === 'fa' ? 'var(--primary)' : 'var(--border)'}; background: ${locale === 'fa' ? 'var(--primary-light)' : 'transparent'}; color:${locale === 'fa' ? 'var(--primary)' : 'var(--text-body)'}; font-size:0.8rem; font-weight:700; transition:var(--t-base); text-decoration:none;">
              <img src="https://flagcdn.com/w20/ir.png" alt="فارسی" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>فارسی</span>
            </a>
            <a href="${getLangUrl(requestPath, 'ur')}" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px 8px; border-radius:var(--r-md); border:1.5px solid ${locale === 'ur' ? 'var(--primary)' : 'var(--border)'}; background: ${locale === 'ur' ? 'var(--primary-light)' : 'transparent'}; color:${locale === 'ur' ? 'var(--primary)' : 'var(--text-body)'}; font-size:0.8rem; font-weight:700; transition:var(--t-base); text-decoration:none;">
              <img src="https://flagcdn.com/w20/pk.png" alt="اردو" style="width: 18px; height: 13px; border-radius: 1px;">
              <span>اردو</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  </div>

  <main>
    ${contentHtml}
  </main>

  <!-- FOOTER -->
  <footer class="site-footer">
    <div class="container footer-inner" style="max-width:1360px">
      <div class="footer-brand">
        <div class="logo" style="margin-bottom:16px; color:white;">
          <div class="logo-icon"><i class="fa-solid fa-briefcase"></i></div>
          <div class="logo-text" style="color:white;">
            <strong style="color:white;">${t.siteName}</strong>
            <span style="color:rgba(255,255,255,0.5);">${t.realOpportunities}</span>
          </div>
        </div>
        <p>${t.footerTagline}</p>
        <div class="footer-social">
          <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" class="social-btn" title="Telegram"><i class="fa-brands fa-telegram"></i></a>
          <a href="#" class="social-btn" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
          <a href="#" class="social-btn" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" class="social-btn" title="X / Twitter"><i class="fa-brands fa-x-twitter"></i></a>
        </div>
      </div>
      <div class="footer-links-group">
        <ul class="footer-links">
          <li class="footer-col-title">${t.platform}</li>
          <li><a href="/${locale}">${t.allJobs}</a></li>
          <li><a href="/${locale}/blog">${t.blog}</a></li>
          <li><a href="/${locale}/insights">${t.insights}</a></li>
          <li><a href="/${locale}/about">${t.about}</a></li>
          <li><a href="/${locale}/contact">${t.contact}</a></li>
          <li><a href="/${locale}/submit-job">${t.postJob}</a></li>
        </ul>
        <ul class="footer-links">
          <li class="footer-col-title">${t.smartTools}</li>
          <li><a href="/${locale}/cv-optimizer">${t.cvOptimizer}</a></li>
          <li><a href="/${locale}/ats-scanner">${t.atsScanner}</a></li>
          <li><a href="/${locale}/resume-builder">${t.cvBuilder}</a></li>
          <li><a href="/${locale}/salary-calculator">${t.salaryCalc}</a></li>
          <li><a href="/${locale}/currency-prices">${t.currencyPrices}</a></li>
          <li><a href="/${locale}/gold-prices">${t.goldPrices}</a></li>
          <li><a href="/${locale}/install" style="font-weight: 700; color: var(--primary);"><i class="fa-solid fa-mobile-screen-button" style="margin-inline-end:6px;"></i>${t.installApp}</a></li>
        </ul>
        <ul class="footer-links">
          <li class="footer-col-title">${t.legal}</li>
          <li><a href="/${locale}/privacy">${t.privacy}</a></li>
          <li><a href="/${locale}/terms">${t.terms}</a></li>
          <li><a href="mailto:info@jobs-in-istanbul.com"><i class="fa-solid fa-envelope" style="margin-inline-end:6px;opacity:.6"></i>info@jobs-in-istanbul.com</a></li>
        </ul>
        <ul class="footer-links">
          <li class="footer-col-title">${t.languages}</li>
          <li><a href="${getLangUrl(requestPath, 'ar')}"><img src="https://flagcdn.com/w20/sa.png" alt="العربية" style="width: 16px; height: 11px; margin-inline-end: 8px; border-radius: 1px; vertical-align: middle;">العربية</a></li>
          <li><a href="${getLangUrl(requestPath, 'tr')}"><img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" style="width: 16px; height: 11px; margin-inline-end: 8px; border-radius: 1px; vertical-align: middle;">Türkçe</a></li>
          <li><a href="${getLangUrl(requestPath, 'en')}"><img src="https://flagcdn.com/w20/gb.png" alt="English" style="width: 16px; height: 11px; margin-inline-end: 8px; border-radius: 1px; vertical-align: middle;">English</a></li>
          <li><a href="${getLangUrl(requestPath, 'ru')}"><img src="https://flagcdn.com/w20/ru.png" alt="Русский" style="width: 16px; height: 11px; margin-inline-end: 8px; border-radius: 1px; vertical-align: middle;">Русский</a></li>
          <li><a href="${getLangUrl(requestPath, 'fa')}"><img src="https://flagcdn.com/w20/ir.png" alt="فارسی" style="width: 16px; height: 11px; margin-inline-end: 8px; border-radius: 1px; vertical-align: middle;">فارسی</a></li>
          <li><a href="${getLangUrl(requestPath, 'ur')}"><img src="https://flagcdn.com/w20/pk.png" alt="اردو" style="width: 16px; height: 11px; margin-inline-end: 8px; border-radius: 1px; vertical-align: middle;">اردو</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom" style="max-width:1360px">
      <p>${t.copyright}</p>
    </div>
  </footer>
  </div>

  <style>
    @keyframes slideInLeft  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    @keyframes slideInRight { from { transform: translateX(100%); }  to { transform: translateX(0); } }
    
    .header-telegram-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #0088cc;
      color: white !important;
      padding: 8px 14px;
      border-radius: var(--r-full);
      font-size: 0.82rem;
      font-weight: 700;
      transition: var(--t-base);
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(0, 136, 204, 0.15);
    }
    .header-telegram-btn:hover {
      background: #1d90f3;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 136, 204, 0.25);
    }
    .header-install-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--primary);
      color: white !important;
      padding: 8px 14px;
      border-radius: var(--r-full);
      font-size: 0.82rem;
      font-weight: 700;
      transition: var(--t-base);
      text-decoration: none;
      box-shadow: 0 4px 12px var(--primary-light);
    }
    .header-install-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px var(--primary-light);
    }
    @media (max-width: 768px) {
      .header-telegram-btn, .header-install-btn {
        display: none !important;
      }
    }
    .floating-post-job-badge {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 250;
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #0088cc 0%, #00a2ff 100%);
      color: white !important;
      padding: 12px 20px;
      border-radius: var(--r-full);
      font-weight: 800;
      font-size: 0.85rem;
      box-shadow: 0 8px 24px rgba(0, 136, 204, 0.4);
      transition: var(--t-spring);
      text-decoration: none;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .floating-post-job-badge:hover {
      transform: scale(1.05) translateY(-2px);
      box-shadow: 0 12px 28px rgba(0, 136, 204, 0.5);
    }
    .floating-post-job-badge i {
      font-size: 1.25rem;
    }
    @media (max-width: 480px) {
      .floating-post-job-badge span {
        display: none;
      }
      .floating-post-job-badge {
        padding: 12px;
        width: 46px;
        height: 46px;
        justify-content: center;
      }
    }
  </style>

  <script>
    // ---- Favorites ----
    function getFavorites() {
      try { return JSON.parse(localStorage.getItem('fav_jobs') || '[]'); } catch { return []; }
    }
    function toggleFavorite(jobId, event) {
      if (event) { event.preventDefault(); event.stopPropagation(); }
      let favs = getFavorites();
      const index = favs.indexOf(jobId);
      const btns = document.querySelectorAll('.btn-fav[data-job-id="' + jobId + '"]');
      let isAdded = false;
      if (index > -1) {
        favs.splice(index, 1);
        btns.forEach(btn => {
          btn.classList.remove('active');
          const icon = btn.querySelector('i');
          if (icon) icon.className = 'fa-regular fa-heart';
        });
      } else {
        favs.push(jobId);
        isAdded = true;
        btns.forEach(btn => {
          btn.classList.add('active');
          const icon = btn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-heart';
        });
      }
      localStorage.setItem('fav_jobs', JSON.stringify(favs));
      updateFavCounter();
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('favorites') === '1' && !isAdded) {
        const card = document.querySelector('.job-card[data-job-id="' + jobId + '"]');
        if (card) { card.style.display = 'none'; }
      }
    }
    function updateFavCounter() {
      const count = getFavorites().length;
      const badge = document.getElementById('fav-count-badge');
      if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
    }

    // ---- SPA Filtering ----
    async function fetchFilteredJobs(url) {
      const jobsList = document.querySelector('.jobs-list');
      const countLabel = document.querySelector('.jobs-count');
      if (!jobsList) return;
      jobsList.style.opacity = '0.45';
      jobsList.style.transition = 'opacity 0.2s ease';
      try {
        const res = await fetch(url);
        const htmlText = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const newJobsList = doc.querySelector('.jobs-list');
        const newCountLabel = doc.querySelector('.jobs-count');
        if (newJobsList) {
          jobsList.innerHTML = newJobsList.innerHTML;
          const favs = getFavorites();
          favs.forEach(id => {
            const btns = document.querySelectorAll('.btn-fav[data-job-id="' + id + '"]');
            btns.forEach(btn => { btn.classList.add('active'); const icon = btn.querySelector('i'); if (icon) icon.className = 'fa-solid fa-heart'; });
          });
        }
        if (countLabel && newCountLabel) countLabel.innerHTML = newCountLabel.innerHTML;
        const newDistGrid = doc.querySelector('.district-grid');
        const oldDistGrid = document.querySelector('.district-grid');
        if (oldDistGrid && newDistGrid) { oldDistGrid.innerHTML = newDistGrid.innerHTML; setupDistrictClickListeners(); }
        window.history.pushState({}, '', url);
      } catch (err) { console.error('Error filtering jobs:', err); }
      finally { jobsList.style.opacity = '1'; }
    }

    function setupDistrictClickListeners() {
      document.querySelectorAll('.district-card').forEach(card => {
        card.addEventListener('click', (e) => { e.preventDefault(); const href = card.getAttribute('href'); fetchFilteredJobs(href); });
      });
    }

    // ---- Mobile Nav ----
    function closeMobileNav(overlay, event) {
      if (event.target === overlay) overlay.style.display = 'none';
    }

    // ---- Init ----
    document.addEventListener('DOMContentLoaded', () => {
      // Favorites
      const favs = getFavorites();
      favs.forEach(id => {
        const btns = document.querySelectorAll('.btn-fav[data-job-id="' + id + '"]');
        btns.forEach(btn => { btn.classList.add('active'); const icon = btn.querySelector('i'); if (icon) icon.className = 'fa-solid fa-heart'; });
      });
      updateFavCounter();

      // Categories drawer initialization
      const urlParams = new URLSearchParams(window.location.search);
      const activeCategory = urlParams.get('category');
      if (activeCategory) {
        const content = document.getElementById('categories-collapse-content');
        if (content) {
          content.style.maxHeight = content.scrollHeight + 'px';
          const icon = document.getElementById('categories-toggle-icon');
          if (icon) icon.style.transform = 'rotate(180deg)';
          const btn = document.getElementById('categories-toggle-btn');
          if (btn) {
            btn.style.borderColor = 'var(--primary)';
            btn.style.boxShadow = '0 8px 24px var(--primary-glow)';
          }
        }
      }

      // Districts drawer initialization
      const activeDistrict = urlParams.get('district');
      if (activeDistrict) {
        const content = document.getElementById('districts-collapse-content');
        if (content) {
          content.style.maxHeight = content.scrollHeight + 'px';
          const icon = document.getElementById('districts-toggle-icon');
          if (icon) icon.style.transform = 'rotate(180deg)';
          const btn = document.getElementById('districts-toggle-btn');
          if (btn) {
            btn.style.borderColor = 'var(--primary)';
            btn.style.boxShadow = '0 8px 24px var(--primary-glow)';
          }
        }
      }

      // Fav filter page
      if (urlParams.get('favorites') === '1') {
        const jobCards = document.querySelectorAll('.job-card');
        let visibleCount = 0;
        jobCards.forEach(card => {
          const jobId = card.getAttribute('data-job-id');
          if (favs.includes(jobId)) { card.style.display = 'grid'; visibleCount++; }
          else card.style.display = 'none';
        });
        const countLabel = document.querySelector('.jobs-count');
        if (countLabel) countLabel.innerHTML = '<strong>' + visibleCount + '</strong> ' + (locale === 'ar' ? 'وظيفة محفوظة' : (locale === 'tr' ? 'kaydedilen ilan' : 'saved jobs'));
      }

      // Dark Mode
      const darkToggle = document.getElementById('dark-mode-toggle');
      const darkToggleMobile = document.getElementById('dark-mode-toggle-mobile');
      if (darkToggle || darkToggleMobile) {
        const applyTheme = (isDark) => {
          document.body.classList.toggle('dark-mode', isDark);
          const iconHtml = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
          if (darkToggle) darkToggle.innerHTML = iconHtml;
          if (darkToggleMobile) darkToggleMobile.innerHTML = iconHtml;
        };
        const toggleAction = () => {
          const isDark = !document.body.classList.contains('dark-mode');
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
          applyTheme(isDark);
        };
        if (darkToggle) darkToggle.addEventListener('click', toggleAction);
        if (darkToggleMobile) darkToggleMobile.addEventListener('click', toggleAction);
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) applyTheme(true);
      }

      // Sticky header scroll effect
      const header = document.getElementById('site-header');
      if (header) {
        window.addEventListener('scroll', () => {
          header.classList.toggle('scrolled', window.scrollY > 10);
        }, { passive: true });
      }

      // Mobile menu btn show on small screens
      const mobileBtn = document.getElementById('mobile-menu-btn');
      const desktopNav = document.getElementById('desktop-nav');
      const mobileNav = document.getElementById('mobile-nav');
      const checkWidth = () => {
        if (window.innerWidth <= 768) {
          mobileBtn.style.display = 'flex';
          if (desktopNav) desktopNav.style.display = 'none';
        } else {
          mobileBtn.style.display = 'none';
          if (desktopNav) desktopNav.style.display = '';
          if (mobileNav) mobileNav.style.display = 'none';
        }
      };
      checkWidth();
      window.addEventListener('resize', checkWidth, { passive: true });
      if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', () => { mobileNav.style.display = 'block'; });
      }

      // SPA Filters
      const filterForm = document.querySelector('.filters-sidebar form');
      if (filterForm) {
        filterForm.querySelectorAll('input').forEach(input => {
          input.addEventListener('change', () => {
            const formData = new FormData(filterForm);
            const params = new URLSearchParams(formData);
            const action = filterForm.getAttribute('action') || window.location.pathname;
            fetchFilteredJobs(action + '?' + params.toString());
          });
        });
      }

      const searchForm = document.querySelector('.search-card');
      if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const query = searchForm.querySelector('input[name="search"]').value;
          const url = new URL(window.location.href);
          url.searchParams.set('search', query);
          fetchFilteredJobs(url.pathname + url.search);
        });
      }

      setupDistrictClickListeners();

      // Active nav link
      const currentPath = window.location.pathname;
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPath);
      });

      // Quick search tags
      document.querySelectorAll('.sq-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const input = document.querySelector('input[name="search"]');
          if (input) { input.value = tag.textContent.trim(); const form = input.closest('form'); if (form) form.dispatchEvent(new Event('submit', {bubbles:true})); }
        });
      });

      // Category cards SPA
      document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', (e) => { e.preventDefault(); fetchFilteredJobs(card.getAttribute('href')); });
      });
    });

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        const msg = document.createElement('div');
        msg.textContent = locale === 'ar' ? '✅ تم نسخ الرابط!' : (locale === 'tr' ? '✅ Bağlantı kopyalandı!' : '✅ Link copied!');
        msg.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text-heading);color:white;padding:10px 24px;border-radius:var(--r-full);font-weight:600;z-index:9999;font-size:.9rem;box-shadow:var(--shadow-lg);';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2500);
      });
    }

    function toggleCategoriesCollapse(e) {
      if (e) e.preventDefault();
      const content = document.getElementById('categories-collapse-content');
      const icon = document.getElementById('categories-toggle-icon');
      const btn = document.getElementById('categories-toggle-btn');
      
      const isCollapsed = content.style.maxHeight === '0px' || content.style.maxHeight === '';
      if (isCollapsed) {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
        btn.style.borderColor = 'var(--primary)';
        btn.style.boxShadow = '0 8px 24px var(--primary-glow)';
      } else {
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
        btn.style.borderColor = 'var(--border)';
        btn.style.boxShadow = 'var(--shadow-sm)';
      }
    }

    function toggleDistrictsCollapse(e) {
      if (e) e.preventDefault();
      const content = document.getElementById('districts-collapse-content');
      const icon = document.getElementById('districts-toggle-icon');
      const btn = document.getElementById('districts-toggle-btn');
      
      const isCollapsed = content.style.maxHeight === '0px' || content.style.maxHeight === '';
      if (isCollapsed) {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
        btn.style.borderColor = 'var(--primary)';
        btn.style.boxShadow = '0 8px 24px var(--primary-glow)';
      } else {
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
        btn.style.borderColor = 'var(--border)';
        btn.style.boxShadow = 'var(--shadow-sm)';
      }
    }

    function toggleToolsCollapse(e) {
      if (e) e.preventDefault();
      const content = document.getElementById('tools-collapse-content');
      const icon = document.getElementById('tools-toggle-icon');
      const btn = document.getElementById('tools-toggle-btn');
      
      const isCollapsed = content.style.maxHeight === '0px' || content.style.maxHeight === '';
      if (isCollapsed) {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
        btn.style.borderColor = 'var(--primary)';
        btn.style.boxShadow = '0 8px 24px var(--primary-glow)';
      } else {
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
        btn.style.borderColor = 'var(--border)';
        btn.style.boxShadow = 'var(--shadow-sm)';
      }
    }

    // كود تشغيل وتفعيل التطبيق في المتصفح
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('تم تفعيل تطبيق PWA بنجاح في النطاق: ', registration.scope);
          })
          .catch(function(error) {
            console.log('فشل تسجيل الـ Service Worker: ', error);
          });
      });
    }
  </script>
  <!-- Floating Telegram Job Posting Badge -->
  <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" class="floating-post-job-badge" title="${locale === 'ar' ? 'أضف إعلانك مجاناً عبر تلغرام' : 'Post a Job Free via Telegram'}">
    <i class="fa-brands fa-telegram"></i>
    <span>${locale === 'ar' ? 'أضف إعلانك مجاناً' : (locale === 'tr' ? 'Ücretsiz İlan Ekle' : 'Post a Job Free')}</span>
  </a>
</body>
</html>`;
}

// Redirect root to default language (ar)
publicRouter.get('/', (c) => {
  return c.redirect('/ar');
})

// Homepage for listing jobs
const homeHandler = async (c: any, locale: 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur') => {
  const db = c.env.DB;

  // Get query parameters
  const querySearch = c.req.query('search') || '';
  const queryCategory = c.req.query('category') || '';
  const queryJobType = c.req.query('type') || '';
  const queryDistrict = c.req.query('district') || '';
  const queryTransit = c.req.query('transit') || '';

  // 1. Fetch Categories
  const catRows = await db.prepare(
    `SELECT id, slug, data FROM documents WHERE type_id = 'categories' AND status = 'published' AND is_published = 1`
  ).all();

  const categories = (catRows.results || []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    ...JSON.parse(row.data)
  }));

  // 2. Fetch Companies
  const compRows = await db.prepare(
    `SELECT id, slug, data FROM documents WHERE type_id = 'companies' AND status = 'published' AND is_published = 1`
  ).all();

  const companiesMap = new Map();
  for (const row of compRows.results || []) {
    companiesMap.set(row.id, {
      id: row.id,
      slug: row.slug,
      ...JSON.parse(row.data)
    });
  }

  // 3. Build Jobs Query with Filters
  let sql = `
    SELECT j.id, j.slug, j.data, j.published_at
    FROM documents j
    WHERE j.type_id = 'jobs' AND j.status = 'published' AND j.is_published = 1
  `;

  const params: any[] = [];

  // Filter by Category
  if (queryCategory) {
    sql += ` AND EXISTS (
      SELECT 1 FROM document_references ref 
      WHERE ref.from_document_id = j.id AND ref.field_name = 'category' AND ref.to_root_id = ?
    )`;
    params.push(queryCategory);
  }

  // Filter by Job Type
  if (queryJobType) {
    sql += ` AND json_extract(j.data, '$.jobType') = ?`;
    params.push(queryJobType);
  }

  sql += ` ORDER BY j.published_at DESC`;

  const jobRows = await db.prepare(sql).bind(...params).all();

  let jobs = (jobRows.results || []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    publishedAt: row.published_at,
    ...JSON.parse(row.data)
  }));

  // Filter by Keyword (search) client-side or parse company logos
  if (querySearch) {
    const kw = querySearch.toLowerCase();
    jobs = jobs.filter((job: any) =>
      (job.title_ar || '').toLowerCase().includes(kw) ||
      (job.title_en || '').toLowerCase().includes(kw) ||
      (job.title_tr && job.title_tr.toLowerCase().includes(kw)) ||
      (job.description_ar || '').toLowerCase().includes(kw) ||
      (job.description_en || '').toLowerCase().includes(kw) ||
      (job.description_tr && job.description_tr.toLowerCase().includes(kw)) ||
      (job.location_ar || '').toLowerCase().includes(kw) ||
      (job.location_en || '').toLowerCase().includes(kw) ||
      (job.location_tr && job.location_tr.toLowerCase().includes(kw))
    );
  }

  // Filter by District client-side
  if (queryDistrict) {
    const kw = queryDistrict.toLowerCase();
    jobs = jobs.filter((job: any) =>
      job.location_ar.toLowerCase().includes(kw) ||
      job.location_en.toLowerCase().includes(kw) ||
      (job.location_tr && job.location_tr.toLowerCase().includes(kw))
    );
  }

  // Filter by Transit line
  if (queryTransit && queryTransit !== 'all') {
    jobs = jobs.filter((job: any) => job.transitLine === queryTransit);
  }

  // Map company & category relations to job
  for (const job of jobs) {
    job.companyObj = companiesMap.get(job.company) || { name: job.company || 'Company', logo: '' };
    job.categoryObj = categories.find((c: any) => c.id === job.category) || { name_ar: '', name_en: '' };
  }

  // Pagination logic
  const totalJobsCount = jobs.length;
  const itemsPerPage = 15;
  const totalPages = Math.ceil(totalJobsCount / itemsPerPage) || 1;
  const currentPage = Math.max(1, Math.min(totalPages, parseInt(c.req.query('page') || '1', 10)));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = jobs.slice(startIndex, endIndex);

  // Helper to build pagination links
  const getPageUrl = (pageNum: number) => {
    const paramsObj: any = {};
    if (querySearch) paramsObj.search = querySearch;
    if (queryCategory) paramsObj.category = queryCategory;
    if (queryJobType) paramsObj.type = queryJobType;
    if (queryDistrict) paramsObj.district = queryDistrict;
    if (queryTransit) paramsObj.transit = queryTransit;
    paramsObj.page = pageNum.toString();
    const searchParams = new URLSearchParams(paramsObj);
    return `/${locale}?${searchParams.toString()}`;
  };

  let paginationHtml = '';
  if (totalPages > 1) {
    paginationHtml = `
    <style>
      .pag-num:hover, .btn-pag:hover {
        border-color: var(--primary) !important;
        color: var(--primary) !important;
        transform: translateY(-2px);
      }
    </style>
    <div class="pagination" style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 40px; margin-bottom: 20px;">`;
    
    // Previous Page
    if (currentPage > 1) {
      paginationHtml += `<a href="${getPageUrl(currentPage - 1)}" class="btn-pag" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--r-sm); border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-dark); text-decoration: none; font-weight: 700; transition: var(--t-fast);"><i class="fa-solid fa-chevron-${locale === 'ar' ? 'right' : 'left'}"></i></a>`;
    }
    
    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        paginationHtml += `<span class="pag-current" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--r-sm); background: var(--primary); color: white; font-weight: 700;">${i}</span>`;
      } else {
        paginationHtml += `<a href="${getPageUrl(i)}" class="pag-num" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--r-sm); border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-dark); text-decoration: none; font-weight: 700; transition: var(--t-fast);">${i}</a>`;
      }
    }
    
    // Next Page
    if (currentPage < totalPages) {
      paginationHtml += `<a href="${getPageUrl(currentPage + 1)}" class="btn-pag" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--r-sm); border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-dark); text-decoration: none; font-weight: 700; transition: var(--t-fast);"><i class="fa-solid fa-chevron-${locale === 'ar' ? 'left' : 'right'}"></i></a>`;
    }
    
    paginationHtml += `</div>`;
  }

  // Translations
  const t = {
    ar: {
      heroEyebrow: 'أكثر من 500 وظيفة في إسطنبول الآن',
      heroTitle: 'اعثر على وظيفتك <span class="gradient-word">المثالية</span><br>في إسطنبول',
      heroSubtitle: 'فرص عمل مميزة للعرب والأجانب في مختلف القطاعات بمدينة إسطنبول الكبرى',
      searchPlh: 'ابحث عن مسمى وظيفي، كلمات مفتاحية...',
      locPlh: 'كل المناطق',
      allCats: 'جميع التصنيفات',
      filterTitle: 'تصفية النتائج',
      jobType: 'نوع العمل',
      fullTime: 'دوام كامل',
      partTime: 'دوام جزئي',
      remote: 'عمل عن بعد',
      internship: 'تدريب عملي',
      resultsCount: `تم العثور على ${totalJobsCount} وظيفة شاغرة`,
      featuredBadge: 'مميزة',
      applyBtn: 'تقدم الآن',
      noJobs: 'لا توجد وظائف تطابق خيارات البحث الحالية.'
    },
    en: {
      heroEyebrow: 'Over 500 jobs in Istanbul right now',
      heroTitle: 'Find Your <span class="gradient-word">Dream Job</span><br>in Istanbul',
      heroSubtitle: 'Premium job vacancies for locals and internationals in Istanbul metropolitan area',
      searchPlh: 'Search job title, keywords...',
      locPlh: 'All districts',
      allCats: 'All categories',
      filterTitle: 'Filter Results',
      jobType: 'Job Type',
      fullTime: 'Full Time',
      partTime: 'Part Time',
      remote: 'Remote',
      internship: 'Internship',
      resultsCount: `Found ${totalJobsCount} vacant jobs`,
      featuredBadge: 'Featured',
      applyBtn: 'Apply Now',
      noJobs: 'No jobs match your search filters.'
    },
    tr: {
      heroEyebrow: 'İstanbul\'da şu anda 500\'den fazla iş ilanı',
      heroTitle: 'İstanbul\'da <span class="gradient-word">Mükemmel</span><br>İşinizi Bulun',
      heroSubtitle: 'İstanbul metropol bölgesindeki yerli ve uluslararası yetenekler için özel iş ilanları',
      searchPlh: 'İş unvanı, anahtar kelime arayın...',
      locPlh: 'Tüm ilçeler',
      allCats: 'Tüm kategoriler',
      filterTitle: 'Filtrele',
      jobType: 'Çalışma Şekli',
      fullTime: 'Tam Zamanlı',
      partTime: 'Yarı Zamanlı',
      remote: 'Uzaktan (Remote)',
      internship: 'Staj',
      resultsCount: `${totalJobsCount} açık iş ilanı bulundu`,
      featuredBadge: 'Öne Çıkan',
      applyBtn: 'Hemen Başvur',
      noJobs: 'Arama kriterlerinize uygun iş ilanı bulunamadı.'
    },
    ru: {
      heroEyebrow: 'Более 500 вакансий в Стамбуле сейчас',
      heroTitle: 'Найдите свою <span class="gradient-word">идеальную работу</span><br>в Стамбуле',
      heroSubtitle: 'Отличные вакансии для иностранцев и русскоязычных специалистов в различных секторах Стамбула',
      searchPlh: 'Поиск по названию вакансии, ключевым словам...',
      locPlh: 'Все районы',
      allCats: 'Все категории',
      filterTitle: 'Фильтр результатов',
      jobType: 'Тип работы',
      fullTime: 'Полный день',
      partTime: 'Частичная занятость',
      remote: 'Удаленная работа',
      internship: 'Стажировка',
      resultsCount: `Найдено ${totalJobsCount} вакансий`,
      featuredBadge: 'Премиум',
      applyBtn: 'Откликнуться',
      noJobs: 'По вашему запросу вакансий не найдено.'
    },
    fa: {
      heroEyebrow: 'بیش از ۵۰۰ شغل در استانبول در حال حاضر',
      heroTitle: 'کار و استخدام <span class="gradient-word">رویایی خود</span> را در استانبول بیابید',
      heroSubtitle: 'فرصت‌های شغلی برتر برای ایرانیان، کارجویان بین‌المللی و فارسی‌زبانان در مناطق مختلف استانبول بزرگ',
      searchPlh: 'عنوان شغلی، مهارت یا کلمات کلیدی...',
      locPlh: 'همه محله‌ها',
      allCats: 'همه دسته‌بندی‌ها',
      filterTitle: 'فیلتر کردن نتایج',
      jobType: 'نوع همکاری',
      fullTime: 'تمام وقت',
      partTime: 'پاره وقت',
      remote: 'دورکاری',
      internship: 'کارآموزی',
      resultsCount: `تعداد ${totalJobsCount} موقعیت شغلی فعال یافت شد`,
      featuredBadge: 'ویژه',
      applyBtn: 'ثبت درخواست و ارسال رزومه',
      noJobs: 'هیچ شغلی مطابق با فیلترهای جستجوی شما پیدا نشد.'
    },
    ur: {
      heroEyebrow: 'استنبول میں اس وقت 500 سے زائد ملازمتیں',
      heroTitle: 'استنبول میں اپنی <span class="gradient-word">مثالی ملازمت</span> تلاش کریں',
      heroSubtitle: 'اردو بولنے والوں اور بین الاقوامی امیدواروں کے لیے استنبول کے بہترین علاقوں میں ملازمت کے مواقع',
      searchPlh: 'ملازمت کا عنوان، مہارت یا کلیدی الفاظ...',
      locPlh: 'تمام اضلاع',
      allCats: 'تمام کیٹیگریز',
      filterTitle: 'نتائج فلٹر کریں',
      jobType: 'ملازمت کی قسم',
      fullTime: 'فل ٹائم',
      partTime: 'پارٹ ٹائم',
      remote: 'ریموٹ (دور سے کام)',
      internship: 'انٹرنشپ',
      resultsCount: `کل ${totalJobsCount} فعال ملازمتیں ملیں`,
      featuredBadge: 'نمایاں',
      applyBtn: 'درخواست دیں اور سی وی بھیجیں',
      noJobs: 'آپ کے فلٹرز کے مطابق کوئی ملازمت نہیں ملی۔'
    }
  }[locale];

  // Render Categories HTML
  const categoriesHtml = categories.map((cat: any) => {
    const name = locale === 'ar' ? (cat.name_ar || cat.name_en) : (locale === 'tr' ? (cat.name_tr || cat.name_en) : (locale === 'fa' ? (cat.name_fa || cat.name_en) : (locale === 'ur' ? (cat.name_ur || cat.name_en) : (locale === 'ru' ? (cat.name_ru || cat.name_en) : cat.name_en))));
    const activeClass = queryCategory === cat.id ? 'active' : '';
    return `<a href="/${locale}?category=${cat.id}" class="category-card ${activeClass}">
      <div class="cat-emoji">${cat.icon || '💼'}</div>
      <div class="category-name">${name}</div>
    </a>`;
  }).join('');

  const activeCategoryObj = categories.find((c: any) => c.id === queryCategory || c.slug === queryCategory);
  const activeCategoryName = activeCategoryObj ? (locale === 'ar' ? (activeCategoryObj.name_ar || activeCategoryObj.name_en) : (locale === 'tr' ? (activeCategoryObj.name_tr || activeCategoryObj.name_en) : (locale === 'fa' ? (activeCategoryObj.name_fa || activeCategoryObj.name_en) : (locale === 'ur' ? (activeCategoryObj.name_ur || activeCategoryObj.name_en) : (locale === 'ru' ? (activeCategoryObj.name_ru || activeCategoryObj.name_en) : activeCategoryObj.name_en))))) : '';

  // Render Jobs HTML
  const jobsHtml = paginatedJobs.length > 0 ? paginatedJobs.map((job: any) => {
    const title = locale === 'ar' ? (job.title_ar || job.title_en) : (locale === 'tr' ? (job.title_tr || job.title_en) : (locale === 'fa' ? (job.title_fa || job.title_en) : (locale === 'ur' ? (job.title_ur || job.title_en) : (locale === 'ru' ? (job.title_ru || job.title_en) : job.title_en))));
    const location = locale === 'ar' ? (job.location_ar || job.location_en) : (locale === 'tr' ? (job.location_tr || job.location_en) : (locale === 'fa' ? (job.location_fa || job.location_en) : (locale === 'ur' ? (job.location_ur || job.location_en) : (locale === 'ru' ? (job.location_ru || job.location_en) : job.location_en))));
    const typeKey = job.jobType === 'full-time' ? 'fullTime' : job.jobType === 'part-time' ? 'partTime' : job.jobType === 'remote' ? 'remote' : 'internship';
    const typeLabel = t[typeKey];
    const isRemote = job.jobType === 'remote';
    const timeAgo = new Date(job.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const logoPlaceholder = job.companyObj.name.charAt(0).toUpperCase();
    const isNew = (Date.now() - new Date(job.publishedAt).getTime()) < 3 * 24 * 60 * 60 * 1000;

    return `
    <div class="job-card ${job.featured ? 'featured' : ''}" data-job-id="${job.id}">
      <div class="co-logo">
        ${job.companyObj.logo
        ? `<img src="${job.companyObj.logo}" alt="${job.companyObj.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<span>${logoPlaceholder}</span>';">`
        : `<span>${logoPlaceholder}</span>`}
      </div>
      <div class="job-body">
        <div class="job-top">
          <div class="job-title-wrap">
            <a href="/${locale}/jobs/${job.slug}" class="job-card-title">${title}</a>
            ${job.featured ? `<span class="job-badge badge-featured">⭐ ${t.featuredBadge}</span>` : ''}
            ${isNew && !job.featured ? `<span class="job-badge badge-new">${locale === 'ar' ? 'جديد' : 'New'}</span>` : ''}
          </div>
          <button class="btn-fav" data-job-id="${job.id}" onclick="toggleFavorite('${job.id}', event)" title="${locale === 'ar' ? 'حفظ في المفضلة' : 'Save to Favorites'}">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
        <div class="job-company">${job.companyObj.name}</div>
        <div class="job-tags">
          <span class="jtag jtag-type">${typeLabel}</span>
          <span class="jtag jtag-loc"><i class="fa-solid fa-location-dot"></i> ${location}</span>
          ${isRemote ? `<span class="jtag jtag-remote"><i class="fa-solid fa-wifi"></i> ${locale === 'ar' ? 'عن بُعد' : 'Remote'}</span>` : ''}
          <span class="jtag jtag-lang"><i class="fa-solid fa-language"></i> ${job.language === 'both' ? (locale === 'ar' ? 'ثنائي اللغة' : 'Bilingual') : (job.language || 'TR').toUpperCase()}</span>
        </div>
        <div class="job-footer">
          <div class="job-meta">
            <span class="job-meta-item"><i class="fa-regular fa-clock"></i> ${timeAgo}</span>
            <span class="job-salary"><i class="fa-solid fa-turkish-lira-sign"></i> ${job.salary || (locale === 'ar' ? 'تنافسي' : 'Competitive')}</span>
          </div>
          <a href="/${locale}/jobs/${job.slug}" class="btn-apply">${t.applyBtn} <i class="fa-solid fa-arrow-${locale === 'ar' ? 'left' : 'right'}"></i></a>
        </div>
      </div>
    </div>`;
  }).join('') : `<div class="jobs-empty">
    <i class="fa-solid fa-magnifying-glass-minus"></i>
    <p>${t.noJobs}</p>
    <a href="/${locale}">${locale === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset filters'}</a>
  </div>`;

  const html = `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-grid"></div>
      <div class="container hero-content">
        <div class="hero-eyebrow animate-fadeup">
          <span class="live-dot"></span>
          ${t.heroEyebrow}
        </div>
        <h1 class="hero-title animate-fadeup animate-delay-1">
          ${t.heroTitle}
        </h1>
        <p class="hero-subtitle animate-fadeup animate-delay-2">${t.heroSubtitle}</p>
        <div class="hero-stats animate-fadeup animate-delay-3">
          <div class="hero-stat">
            <div class="hero-stat-value">${totalJobsCount}+</div>
            <div class="hero-stat-label">${locale === 'ar' ? 'وظيفة شاغرة' : 'Open Positions'}</div>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <div class="hero-stat-value">${categories.length}+</div>
            <div class="hero-stat-label">${locale === 'ar' ? 'قطاع مهني' : 'Sectors'}</div>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <div class="hero-stat-value">100%</div>
            <div class="hero-stat-label">${locale === 'ar' ? 'وظائف موثوقة' : 'Verified Jobs'}</div>
          </div>
        </div>
      </div>
    </section>

    <div class="container" style="max-width:1360px">

      <!-- SEARCH -->
      <div class="search-section">
        <form class="search-card" method="GET" action="/${locale}">
          <div class="search-field-wrap">
            <i class="fa-solid fa-magnifying-glass s-icon"></i>
            <input type="text" name="search" placeholder="${t.searchPlh}" value="${querySearch}" autocomplete="off">
          </div>
          <button type="submit" class="btn-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            ${locale === 'ar' ? 'بحث' : 'Search'}
          </button>
        </form>
        <div class="search-quick-tags">
          <span class="sq-label">${locale === 'ar' ? 'بحث سريع:' : 'Quick search:'}</span>
          ${locale === 'ar'
      ? ['مطوّر', 'محاسب', 'ترجمة', 'فندقي', 'مبيعات'].map(k => `<span class="sq-tag">${k}</span>`).join('')
      : ['Developer', 'Accountant', 'Sales', 'Hotel', 'Marketing'].map(k => `<span class="sq-tag">${k}</span>`).join('')
    }
        </div>
      </div>

      <!-- CATEGORIES -->
      <section class="categories-sec" style="margin-bottom: 24px;">
        <button id="categories-toggle-btn" style="width: 100%; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1.5px solid var(--border); padding: 16px 24px; border-radius: var(--r-md); font-weight: 800; font-size: 1.05rem; color: var(--text-heading); cursor: pointer; transition: var(--t-fast); box-shadow: var(--shadow-sm);" onclick="toggleCategoriesCollapse(event)">
          <span style="display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-folder-open" style="color: var(--primary); font-size: 1.2rem;"></i>
            <span>${locale === 'ar' ? 'تصفح بالقطاعات والوظائف' : (locale === 'tr' ? 'Sektörlere Göre Göz At' : 'Browse by Job Sectors')}</span>
            <span style="background: var(--primary-light); color: var(--primary); font-size: 0.8rem; font-weight: 700; padding: 2px 10px; border-radius: var(--r-full); margin-inline-start: 6px;">${categories.length}</span>
            ${queryCategory && activeCategoryName ? `<span style="background: var(--accent-light); color: var(--accent-hover); font-size: 0.8rem; font-weight: 700; padding: 2px 10px; border-radius: var(--r-full); display: inline-flex; align-items: center; gap: 6px; margin-inline-start: 10px;"><i class="fa-solid fa-check"></i> ${activeCategoryName}</span>` : ''}
          </span>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${queryCategory ? `<a href="/${locale}" style="font-size: 0.85rem; color: var(--danger); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" onclick="event.stopPropagation()"><i class="fa-solid fa-circle-xmark"></i> ${locale === 'ar' ? 'إلغاء الفلتر' : (locale === 'tr' ? 'Filtreyi Temizle' : 'Clear Filter')}</a>` : ''}
            <span id="categories-toggle-icon" style="transition: transform 0.25s ease-out; font-size: 0.9rem; opacity: 0.7;">
              <i class="fa-solid fa-chevron-down"></i>
            </span>
          </div>
        </button>
        
        <div id="categories-collapse-content" style="max-height: 0px; overflow: hidden; transition: max-height 0.3s ease-out; margin-bottom: 0px;">
          <div class="categories-grid" style="padding: 20px 0 10px;">
            ${categoriesHtml}
          </div>
        </div>
      </section>

      <!-- TRANSIT CHIPS -->
      <section class="chips-section" style="margin-bottom:40px">
        <div class="sec-header">
          <h2 class="sec-title">${locale === 'ar' ? 'خطوط المواصلات' : 'Transit Lines'}</h2>
        </div>
        <div class="chips-group">
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}" class="chip ${!queryTransit || queryTransit === 'all' ? 'active' : ''}">
            <span class="chip-icon">🚇</span> ${locale === 'ar' ? 'جميع الخطوط' : 'All Lines'}
          </a>
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}&transit=metrobus" class="chip ${queryTransit === 'metrobus' ? 'active' : ''}">
            <span class="chip-icon">🚌</span> ${locale === 'ar' ? 'متروبوس (E-5)' : 'Metrobus (E-5)'}
          </a>
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}&transit=m2" class="chip ${queryTransit === 'm2' ? 'active' : ''}">
            <span class="chip-icon">🚇</span> M2 ${locale === 'ar' ? '(تقسيم/شيشلي)' : '(Taksim/Sisli)'}
          </a>
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}&transit=m4" class="chip ${queryTransit === 'm4' ? 'active' : ''}">
            <span class="chip-icon">🚇</span> M4 ${locale === 'ar' ? '(الجانب الآسيوي)' : '(Asian Side)'}
          </a>
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}&transit=m11" class="chip ${queryTransit === 'm11' ? 'active' : ''}">
            <span class="chip-icon">✈️</span> M11 ${locale === 'ar' ? '(مطار إسطنبول)' : '(Airport)'}
          </a>
        </div>
      </section>

      <!-- DISTRICTS -->
      <section class="chips-section" style="margin-bottom: 24px;">
        <button id="districts-toggle-btn" style="width: 100%; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1.5px solid var(--border); padding: 16px 24px; border-radius: var(--r-md); font-weight: 800; font-size: 1.05rem; color: var(--text-heading); cursor: pointer; transition: var(--t-fast); box-shadow: var(--shadow-sm);" onclick="toggleDistrictsCollapse(event)">
          <span style="display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-map-location-dot" style="color: var(--primary); font-size: 1.2rem;"></i>
            <span>${locale === 'ar' ? 'البحث بالأحياء والمناطق' : (locale === 'tr' ? 'İlçelere Göre Ara' : 'Filter by District/Neighborhood')}</span>
            <span style="background: var(--primary-light); color: var(--primary); font-size: 0.8rem; font-weight: 700; padding: 2px 10px; border-radius: var(--r-full); margin-inline-start: 6px;">${ISTANBUL_DISTRICTS.length}</span>
            ${queryDistrict ? `<span style="background: var(--accent-light); color: var(--accent-hover); font-size: 0.8rem; font-weight: 700; padding: 2px 10px; border-radius: var(--r-full); display: inline-flex; align-items: center; gap: 6px; margin-inline-start: 10px;"><i class="fa-solid fa-check"></i> ${locale === 'ar' ? (ISTANBUL_DISTRICTS.find(d => d.en.toLowerCase() === queryDistrict.toLowerCase())?.ar || queryDistrict) : queryDistrict}</span>` : ''}
          </span>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${queryDistrict ? `<a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}" style="font-size: 0.85rem; color: var(--danger); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" onclick="event.stopPropagation()"><i class="fa-solid fa-circle-xmark"></i> ${locale === 'ar' ? 'إلغاء الفلتر' : (locale === 'tr' ? 'Filtreyi Temizle' : 'Clear Filter')}</a>` : ''}
            <span id="districts-toggle-icon" style="transition: transform 0.25s ease-out; font-size: 0.9rem; opacity: 0.7;">
              <i class="fa-solid fa-chevron-down"></i>
            </span>
          </div>
        </button>
        
        <div id="districts-collapse-content" style="max-height: 0px; overflow: hidden; transition: max-height 0.3s ease-out; margin-bottom: 0px;">
          <div class="district-grid" style="padding: 20px 0 10px;">
            <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}" class="district-card ${!queryDistrict ? 'active' : ''}">
              ${locale === 'ar' ? 'الكل' : 'All'}
            </a>
            ${ISTANBUL_DISTRICTS.map(dist => {
      const name = locale === 'ar' ? dist.ar : dist.en;
      return `<a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}&district=${dist.en}" class="district-card ${queryDistrict.toLowerCase() === dist.en.toLowerCase() ? 'active' : ''}">${name}</a>`;
    }).join('')}
          </div>
        </div>
      </section>

      <!-- SMART CAREER TOOLS SECTION -->
      <section class="career-tools-section" style="margin-bottom: 32px; position: relative;">
        <button id="tools-toggle-btn" style="width: 100%; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1.5px solid var(--border); padding: 16px 24px; border-radius: var(--r-md); font-weight: 800; font-size: 1.05rem; color: var(--text-heading); cursor: pointer; transition: var(--t-fast); box-shadow: var(--shadow-sm);" onclick="toggleToolsCollapse(event)">
          <span style="display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-wand-magic-sparkles" style="color: var(--primary); font-size: 1.2rem;"></i>
            <span>${locale === 'ar' ? 'أدوات التوظيف الذكية والآلية' : (locale === 'tr' ? 'Akıllı Kariyer Araçları' : 'Smart Career & Job Tools')}</span>
            <span style="background: var(--primary-light); color: var(--primary); font-size: 0.8rem; font-weight: 700; padding: 2px 10px; border-radius: var(--r-full); margin-inline-start: 6px;">4</span>
          </span>
          <span id="tools-toggle-icon" style="transition: transform 0.25s ease-out; font-size: 0.9rem; opacity: 0.7;">
            <i class="fa-solid fa-chevron-down"></i>
          </span>
        </button>
        
        <div id="tools-collapse-content" style="max-height: 0px; overflow: hidden; transition: max-height 0.3s ease-out; margin-bottom: 0px;">
          <div style="padding: 24px 0 10px;">
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">
              ${locale === 'ar' ? 'استخدم أدواتنا المتطورة لزيادة فرص قبولك وحساب راتبك ومعرفة القوانين.' : 'Use our advanced career tools to double your hiring chance, calculate your salary, and read guides.'}
            </p>
            <div class="tools-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;">
              
              <!-- Tool 1: Resume Builder -->
              <div class="tool-card glass-card" style="padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px);">
                <div style="position: absolute; right: -15px; top: -15px; font-size: 90px; opacity: 0.04; color: var(--text-dark); pointer-events: none;">
                  <i class="fa-solid fa-file-invoice"></i>
                </div>
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <div class="tool-icon-wrapper" style="width: 48px; height: 48px; border-radius: var(--radius-md); background: linear-gradient(135deg, #facc15 0%, #eab308 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem;">
                      <i class="fa-solid fa-file-invoice"></i>
                    </div>
                    <span class="tag-status" style="font-size: 0.75rem; font-weight: 700; background: #fef08a; color: #854d0e; padding: 4px 10px; border-radius: var(--r-full);">
                      ${locale === 'ar' ? 'مجاني 100%' : '100% Free'}
                    </span>
                  </div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0 0 10px 0;">
                    ${locale === 'ar' ? 'منشئ السيرة الذاتية' : 'Interactive Resume Builder'}
                  </h3>
                  <p style="font-size: 0.875rem; color: var(--text-main); line-height: 1.5; margin: 0 0 20px 0;">
                    ${locale === 'ar'
      ? 'أنشئ سيرة ذاتية احترافية ثنائية اللغة (عربي/تركي/إنجليزي) مصممة خصيصاً لسوق العمل في إسطنبول وقم بتحميلها كـ PDF.'
      : 'Build a job-winning, bilingual resume (English/Turkish) optimized for Istanbul employers and download as print-ready PDF.'}
                  </p>
                </div>
                <a href="/${locale}/resume-builder" class="btn-primary" style="font-size: 0.85rem; padding: 10px 16px; width: fit-content; text-decoration: none;">
                  ${locale === 'ar' ? 'جرب المنشئ التفاعلي ←' : 'Start Builder ←'}
                </a>
              </div>

              <!-- Tool 2: Salary Calculator -->
              <div class="tool-card glass-card" style="padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px);">
                <div style="position: absolute; right: -15px; top: -15px; font-size: 90px; opacity: 0.04; color: var(--text-dark); pointer-events: none;">
                  <i class="fa-solid fa-calculator"></i>
                </div>
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <div class="tool-icon-wrapper" style="width: 48px; height: 48px; border-radius: var(--radius-md); background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem;">
                      <i class="fa-solid fa-calculator"></i>
                    </div>
                    <span class="tag-status" style="font-size: 0.75rem; font-weight: 700; background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: var(--r-full);">
                      ${locale === 'ar' ? 'مؤشر محدّث' : 'Live Index'}
                    </span>
                  </div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0 0 10px 0;">
                    ${locale === 'ar' ? 'حاسبة ومؤشر الرواتب' : 'Salary Index Calculator'}
                  </h3>
                  <p style="font-size: 0.875rem; color: var(--text-main); line-height: 1.5; margin: 0 0 20px 0;">
                    ${locale === 'ar'
      ? 'اعرف مستحقاتك وقارن متوسط الرواتب المتوقع في إسطنبول بالليرة التركية والدولار مقسمة حسب القطاع المهني ومستوى خبرتك.'
      : 'Check average salaries in Istanbul in TRY/USD. Get insights by sector, career level, and exact job industry.'}
                  </p>
                </div>
                <a href="/${locale}/salary-calculator" class="btn-primary" style="font-size: 0.85rem; padding: 10px 16px; width: fit-content; text-decoration: none; background: #10b981;">
                  ${locale === 'ar' ? 'احسب راتبك المتوقع ←' : 'Calculate Salary ←'}
                </a>
              </div>

              <!-- Tool 3: Infinite Scroll & Search -->
              <div class="tool-card glass-card" style="padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px);">
                <div style="position: absolute; right: -15px; top: -15px; font-size: 90px; opacity: 0.04; color: var(--text-dark); pointer-events: none;">
                  <i class="fa-solid fa-list-check"></i>
                </div>
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <div class="tool-icon-wrapper" style="width: 48px; height: 48px; border-radius: var(--radius-md); background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem;">
                      <i class="fa-solid fa-list-check"></i>
                    </div>
                    <span class="tag-status" style="font-size: 0.75rem; font-weight: 700; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: var(--r-full);">
                      ${locale === 'ar' ? 'تصفح ذكي' : 'Smart Search'}
                    </span>
                  </div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0 0 10px 0;">
                    ${locale === 'ar' ? 'التصفح والتمرير اللانهائي' : 'Instant Search & Filter'}
                  </h3>
                  <p style="font-size: 0.875rem; color: var(--text-main); line-height: 1.5; margin: 0 0 20px 0;">
                    ${locale === 'ar'
      ? 'ابحث بسلاسة دون الحاجة للتنقل بين الصفحات. استعمل الفلترة الجغرافية حسب الأحياء والربط المباشر مع خطوط مواصلات المتروبوس والمترو.'
      : 'Search jobs without page-load friction. Instantly filter positions by Istanbul districts and metro/metrobus transit routes.'}
                  </p>
                </div>
                <a href="#jobs-anchor" onclick="document.querySelector('.main-layout').scrollIntoView({behavior:'smooth'}); return false;" class="btn-primary" style="font-size: 0.85rem; padding: 10px 16px; width: fit-content; text-decoration: none; background: #6366f1;">
                  ${locale === 'ar' ? 'ابدأ البحث المتقدم ↓' : 'Explore Jobs ↓'}
                </a>
              </div>

              <!-- Tool 4: Career Guides -->
              <div class="tool-card glass-card" style="padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px);">
                <div style="position: absolute; right: -15px; top: -15px; font-size: 90px; opacity: 0.04; color: var(--text-dark); pointer-events: none;">
                  <i class="fa-solid fa-book-open"></i>
                </div>
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <div class="tool-icon-wrapper" style="width: 48px; height: 48px; border-radius: var(--radius-md); background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem;">
                      <i class="fa-solid fa-book-open"></i>
                    </div>
                    <span class="tag-status" style="font-size: 0.75rem; font-weight: 700; background: #ffedd5; color: #9a3412; padding: 4px 10px; border-radius: var(--r-full);">
                      ${locale === 'ar' ? 'أدلة مهنية' : 'Career Guides'}
                    </span>
                  </div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0 0 10px 0;">
                    ${locale === 'ar' ? 'أدلة العمل والإقامة بتركيا' : 'Work Permits & Residency'}
                  </h3>
                  <p style="font-size: 0.875rem; color: var(--text-main); line-height: 1.5; margin: 0 0 20px 0;">
                    ${locale === 'ar'
      ? 'اعرف إجراءات الحصول على إذن عمل (Çalışma İzni) والإقامة السياحية، ونصائح تحسين ملفك المهني لتخطي اختبارات أنظمة ATS التلقائية.'
      : 'Get legal work permit instructions, residency details, and professional tips to optimize your CV for ATS parsing in Turkey.'}
                  </p>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <a href="/${locale}/blog" class="btn-primary" style="font-size: 0.82rem; padding: 8px 12px; text-decoration: none; background: #f97316;">
                    ${locale === 'ar' ? 'أدلة المهنة ←' : 'Read Guides ←'}
                  </a>
                  <a href="/${locale}/turkish-test" class="btn-primary" style="font-size: 0.82rem; padding: 8px 12px; text-decoration: none; background: #14b8a6;">
                    ${locale === 'ar' ? 'اختبار الكفاءة 🎓' : 'Turkish Test 🎓'}
                  </a>
                  <a href="/${locale}/workplace-quiz" class="btn-primary" style="font-size: 0.82rem; padding: 8px 12px; text-decoration: none; background: var(--primary);">
                    ${locale === 'ar' ? 'تدريب سريع ✍️' : 'Quick Quiz ✍️'}
                  </a>
                </div>
              </div>

        </div>

        <style>
          .tool-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-md) !important;
            border-color: var(--primary) !important;
          }
        </style>
      </section>

      <!-- MAIN LAYOUT: SIDEBAR + JOBS -->
      <div class="main-layout">
        <aside class="filters-sidebar">
          <div class="filter-header">
            <div class="filter-main-title"><i class="fa-solid fa-sliders"></i> ${t.filterTitle}</div>
            ${queryJobType ? `<a href="/${locale}?search=${querySearch}&category=${queryCategory}" class="filter-clear">${locale === 'ar' ? 'مسح' : 'Clear'}</a>` : ''}
          </div>
          <form method="GET" action="/${locale}">
            <input type="hidden" name="search" value="${querySearch}">
            <input type="hidden" name="category" value="${queryCategory}">
            <input type="hidden" name="district" value="${queryDistrict}">
            <input type="hidden" name="transit" value="${queryTransit}">
            <div class="filter-group">
              <div class="filter-group-title">${t.jobType}</div>
              <div class="filter-options">
                <label class="filter-radio ${!queryJobType ? 'selected' : ''}">
                  <input type="radio" name="type" value="" ${!queryJobType ? 'checked' : ''} onchange="this.form.submit()">
                  <span>${locale === 'ar' ? 'جميع الأنواع' : 'All Types'}</span>
                </label>
                <label class="filter-radio ${queryJobType === 'full-time' ? 'selected' : ''}">
                  <input type="radio" name="type" value="full-time" ${queryJobType === 'full-time' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>⏱ ${t.fullTime}</span>
                </label>
                <label class="filter-radio ${queryJobType === 'part-time' ? 'selected' : ''}">
                  <input type="radio" name="type" value="part-time" ${queryJobType === 'part-time' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>🕐 ${t.partTime}</span>
                </label>
                <label class="filter-radio ${queryJobType === 'remote' ? 'selected' : ''}">
                  <input type="radio" name="type" value="remote" ${queryJobType === 'remote' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>🌐 ${t.remote}</span>
                </label>
                <label class="filter-radio ${queryJobType === 'internship' ? 'selected' : ''}">
                  <input type="radio" name="type" value="internship" ${queryJobType === 'internship' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>🎓 ${t.internship}</span>
                </label>
              </div>
            </div>
          </form>

          <!-- Quick CTA -->
          <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--border);">
            <a href="/${locale}/submit-job" class="btn-primary" style="width:100%; justify-content:center; font-size:.875rem;">
              <i class="fa-solid fa-plus"></i> ${locale === 'ar' ? 'نشر وظيفة' : 'Post a Job'}
            </a>
          </div>

          <!-- Telegram Promo Card -->
          <div class="telegram-cta" style="margin-top:20px; padding:20px; border-radius:var(--radius-lg); background:linear-gradient(135deg, #1d90f3 0%, #0088cc 100%); color:white; position:relative; overflow:hidden; box-shadow:0 8px 24px rgba(0, 136, 204, 0.2); transition:all 0.3s ease;">
            <div style="position:absolute; right:-20px; bottom:-20px; font-size:120px; opacity:0.1; transform:rotate(-15deg); color:white; pointer-events:none;">
              <i class="fa-brands fa-telegram"></i>
            </div>
            <h3 style="font-size:1.1rem; font-weight:800; margin:0 0 8px 0; color:white; display:flex; align-items:center; gap:8px;">
              <i class="fa-brands fa-telegram" style="font-size:1.3rem;"></i>
              ${locale === 'ar' ? 'قناتنا على تلغرام' : 'Telegram Channel'}
            </h3>
            <p style="font-size:0.82rem; line-height:1.4; opacity:0.95; margin:0 0 16px 0; color:rgba(255,255,255,0.9);">
              ${locale === 'ar'
      ? 'انضم لأكثر من ٢٠ ألف مشترك واحصل على أحدث الوظائف الشاغرة في إسطنبول فوراً!'
      : 'Join 20k+ subscribers and get the latest job postings in Istanbul instantly!'
    }
            </p>
            <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" class="telegram-btn" style="display:flex; align-items:center; justify-content:center; gap:8px; background:white; color:#0088cc; padding:10px 16px; border-radius:var(--radius-md); font-weight:700; font-size:0.875rem; text-decoration:none; box-shadow:0 4px 12px rgba(0,0,0,0.1); transition:all 0.2s ease;">
              ${locale === 'ar' ? 'انضم الآن مجاناً' : 'Join Free Now'}
              <i class="fa-solid fa-paper-plane"></i>
            </a>
          </div>
          
          <style>
            .telegram-cta:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 30px rgba(0, 136, 204, 0.35) !important;
            }
            .telegram-cta:hover .telegram-btn {
              background: #f0f9ff !important;
            }
          </style>
        </aside>

        <section>
          <div class="jobs-header">
            <p class="jobs-count"><strong>${totalJobsCount}</strong> ${locale === 'ar' ? 'وظيفة متاحة' : 'jobs available'}</p>
            ${querySearch || queryCategory || queryJobType || queryDistrict || queryTransit ? `<a href="/${locale}" style="font-size:.82rem; color:var(--danger); font-weight:600;"><i class="fa-solid fa-xmark"></i> ${locale === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}</a>` : ''}
          </div>
          <div class="jobs-list">
            ${jobsHtml}
          </div>
          ${paginationHtml}
        </section>
      </div>
    </div>
  `;

  const seoHtml = generateMetaTags(locale, 'home') + generateJsonLd(locale, 'home');
  return c.html(renderLayout(c, locale === 'ar' ? 'فرص عمل في إسطنبول' : 'Istanbul Jobs Vacancies', html, locale, seoHtml));
}

publicRouter.get(
  '/ar',
  cache({ cacheName: 'istanbul-jobs-ar', cacheControl: 'max-age=60' }),
  (c) => homeHandler(c, 'ar')
)

publicRouter.get(
  '/en',
  cache({ cacheName: 'istanbul-jobs-en', cacheControl: 'max-age=60' }),
  (c) => homeHandler(c, 'en')
)

publicRouter.get(
  '/tr',
  cache({ cacheName: 'istanbul-jobs-tr', cacheControl: 'max-age=60' }),
  (c) => homeHandler(c, 'tr')
)

publicRouter.get(
  '/ru',
  cache({ cacheName: 'istanbul-jobs-ru', cacheControl: 'max-age=60' }),
  (c) => homeHandler(c, 'ru')
)

publicRouter.get(
  '/fa',
  cache({ cacheName: 'istanbul-jobs-fa', cacheControl: 'max-age=60' }),
  (c) => homeHandler(c, 'fa')
)

publicRouter.get(
  '/ur',
  cache({ cacheName: 'istanbul-jobs-ur', cacheControl: 'max-age=60' }),
  (c) => homeHandler(c, 'ur')
)

// Detail view for a job
publicRouter.get(
  '/:locale/jobs/:slug',
  cache({ cacheName: 'istanbul-job-details', cacheControl: 'max-age=300' }),
  async (c) => {
    const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
    const slug = c.req.param('slug');
    const db = (c.env as any).DB;

    if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') {
      return c.redirect('/ar');
    }

    // Fetch job document matching the slug
    const jobRow = await db.prepare(
      `SELECT id, data, published_at FROM documents WHERE type_id = 'jobs' AND slug = ? AND status = 'published' AND is_published = 1`
    ).bind(slug).first();

    if (!jobRow) {
      return c.text(locale === 'ar' ? 'الوظيفة غير موجودة أو انتهت صلاحيتها.' : 'Job not found or expired.', 404);
    }

    const job = {
      id: jobRow.id,
      publishedAt: jobRow.published_at,
      ...JSON.parse(jobRow.data)
    };

    // Fetch Company
    const compRow = await db.prepare(
      `SELECT data FROM documents WHERE id = ?`
    ).bind(job.company).first();
    const company = compRow ? JSON.parse(compRow.data) : { name: job.company || 'Company', description: '' };

    const title = locale === 'ar' ? (job.title_ar || job.title_en) : (locale === 'tr' ? (job.title_tr || job.title_en) : (locale === 'fa' ? (job.title_fa || job.title_en) : (locale === 'ur' ? (job.title_ur || job.title_en) : (locale === 'ru' ? (job.title_ru || job.title_en) : job.title_en))));
    const description = locale === 'ar' ? (job.description_ar || job.description_en) : (locale === 'tr' ? (job.description_tr || job.description_en) : (locale === 'fa' ? (job.description_fa || job.description_en) : (locale === 'ur' ? (job.description_ur || job.description_en) : (locale === 'ru' ? (job.description_ru || job.description_en) : job.description_en))));
    const location = locale === 'ar' ? (job.location_ar || job.location_en) : (locale === 'tr' ? (job.location_tr || job.location_en) : (locale === 'fa' ? (job.location_fa || job.location_en) : (locale === 'ur' ? (job.location_ur || job.location_en) : (locale === 'ru' ? (job.location_ru || job.location_en) : job.location_en))));

    const shareUrl = `https://jobs-in-istanbul.com/${locale}/jobs/${job.slug}`;
    const shareText = locale === 'ar'
      ? `🔥 فرصة عمل مميزة في إسطنبول!\n\n📌 المسمى الوظيفي: ${title}\n🏢 الشركة: ${company.name}\n\nالتفاصيل والتقديم عبر الرابط المباشر:\n📍 ${shareUrl}\n\n#وظائف_إسطنبول #عمل_في_تركيا`
      : (locale === 'tr'
        ? `🔥 İstanbul'da Harika İş Fırsatı!\n\n📌 Pozisyon: ${title}\n🏢 Şirket: ${company.name}\n\nDetaylar ve başvuru için linke tıklayın:\n📍 ${shareUrl}\n\n#IstanbulIsIlanlari #TurkiyedeCalismak`
        : `🔥 Hot Job Opening in Istanbul!\n\n📌 Role: ${title}\n🏢 Company: ${company.name}\n\nCheck details and apply here:\n📍 ${shareUrl}\n\n#IstanbulJobs #TurkeyJobs`);

    let quizQuestionsRaw = [];
    try {
      if (job.screeningQuestionsJson) {
        quizQuestionsRaw = JSON.parse(job.screeningQuestionsJson);
      }
    } catch (err) { }

    // Fetch related jobs in the same category
    let relatedJobs: any[] = [];
    try {
      if (job.category) {
        const relatedRows = await db.prepare(
          `SELECT id, slug, data, published_at FROM documents 
           WHERE type_id = 'jobs' 
             AND status = 'published' 
             AND is_published = 1 
             AND id != ? 
             AND EXISTS (
               SELECT 1 FROM document_references ref 
               WHERE ref.from_document_id = documents.id 
                 AND ref.field_name = 'category' 
                 AND ref.to_root_id = ?
             )
           ORDER BY published_at DESC LIMIT 3`
        ).bind(job.id, job.category).all();

        relatedJobs = (relatedRows.results || []).map((row: any) => ({
          id: row.id,
          slug: row.slug,
          publishedAt: row.published_at,
          ...JSON.parse(row.data)
        }));
      }
    } catch (err) {
      console.error('Error fetching related jobs:', err);
    }

    // Fallback to recent jobs if not enough related jobs
    if (relatedJobs.length < 3) {
      try {
        const excludeIds = [job.id, ...relatedJobs.map(rj => rj.id)];
        const placeholders = excludeIds.map(() => '?').join(',');
        const query = `SELECT id, slug, data, published_at FROM documents 
                       WHERE type_id = 'jobs' 
                         AND status = 'published' 
                         AND is_published = 1 
                         AND id NOT IN (${placeholders}) 
                       ORDER BY published_at DESC LIMIT ?`;
        const limit = 3 - relatedJobs.length;
        const fallbackRows = await db.prepare(query)
          .bind(...excludeIds, limit)
          .all();

        const fallbackJobs = (fallbackRows.results || []).map((row: any) => ({
          id: row.id,
          slug: row.slug,
          publishedAt: row.published_at,
          ...JSON.parse(row.data)
        }));

        relatedJobs = [...relatedJobs, ...fallbackJobs];
      } catch (err) {
        console.error('Error fetching fallback related jobs:', err);
      }
    }

    // Resolve companies for related jobs
    let relatedCompanies: Record<string, any> = {};
    const relCompanyIds = [...new Set(relatedJobs.map((j: any) => j.company).filter(Boolean))];
    if (relCompanyIds.length > 0) {
      try {
        const placeholders = relCompanyIds.map(() => '?').join(',');
        const compRows = await db.prepare(
          `SELECT id, data FROM documents WHERE id IN (${placeholders})`
        ).bind(...relCompanyIds).all();
        compRows.results.forEach((row: any) => {
          relatedCompanies[row.id] = JSON.parse(row.data);
        });
      } catch (err) {
        console.error('Error fetching related companies:', err);
      }
    }

    const translations = {
      ar: {
        jobType: 'نوع العمل',
        location: 'الموقع',
        published: 'تاريخ النشر',
        salary: 'الراتب المتوقع',
        applyNow: 'تقدم للوظيفة الآن',
        companyDetails: 'عن جهة العمل',
        requirements: 'الوصف والمهام المطلوبة',
        backToList: '← العودة لقائمة الوظائف',
        fullTime: 'دوام كامل',
        partTime: 'دوام جزئي',
        remote: 'عمل عن بعد',
        internship: 'تدريب عملي',
        featured: 'وظيفة مميزة'
      },
      en: {
        jobType: 'Job Type',
        location: 'Location',
        published: 'Published At',
        salary: 'Offered Salary',
        applyNow: 'Apply For Job',
        companyDetails: 'About Company',
        requirements: 'Description & Requirements',
        backToList: '← Back to all jobs',
        fullTime: 'Full Time',
        partTime: 'Part Time',
        remote: 'Remote',
        internship: 'Internship',
        featured: 'Featured Job'
      },
      tr: {
        jobType: 'Çalışma Şekli',
        location: 'Konum',
        published: 'Yayınlanma Tarihi',
        salary: 'Tahmini Maaş',
        applyNow: 'Şimdi Başvur',
        companyDetails: 'Şirket Hakkında',
        requirements: 'İş Tanımı & Gereksinimler',
        backToList: '← Tüm iş ilanlarına geri dön',
        fullTime: 'Tam Zamanlı',
        partTime: 'Yarı Zamanlı',
        remote: 'Uzaktan (Remote)',
        internship: 'Staj',
        featured: 'Öne Çıkan İlan'
      },
      ru: {
        jobType: 'Тип работы',
        location: 'Расположение',
        published: 'Опубликовано',
        salary: 'Ожидаемая зарплата',
        applyNow: 'Откликнуться сейчас',
        companyDetails: 'О компании',
        requirements: 'Описание и требования',
        backToList: '← Назад к вакансиям',
        fullTime: 'Полный день',
        partTime: 'Частичная занятость',
        remote: 'Удаленно',
        internship: 'Стажировка',
        featured: 'Премиум вакансия'
      },
      fa: {
        jobType: 'نوع همکاری',
        location: 'موقعیت مکانی',
        published: 'تاریخ انتشار',
        salary: 'حقوق پیشنهادی',
        applyNow: 'همین حالا اقدام کنید',
        companyDetails: 'درباره شرکت',
        requirements: 'توضیحات و شرایط احراز شغل',
        backToList: '← بازگشت به لیست مشاغل',
        fullTime: 'تمام وقت',
        partTime: 'پاره وقت',
        remote: 'دورکاری',
        internship: 'کارآموزی',
        featured: 'آگهی ویژه استخدام'
      },
      ur: {
        jobType: 'ملازمت کی قسم',
        location: 'مقام',
        published: 'تاریخ اشاعت',
        salary: 'پیشکش کردہ تنخواہ',
        applyNow: 'ابھی درخواست دیں',
        companyDetails: 'کمپنی کے بارے میں',
        requirements: 'ملازمت کی تفصیلات اور شرائط',
        backToList: '← ملازمتوں کی فہرست میں واپس جائیں',
        fullTime: 'فل ٹائم',
        partTime: 'پارٹ ٹائم',
        remote: 'ریموٹ',
        internship: 'انٹرنشپ',
        featured: 'نمایاں ملازمت'
      }
    }[locale];

    const typeLabel = translations[job.jobType === 'full-time' ? 'fullTime' : job.jobType === 'part-time' ? 'partTime' : job.jobType === 'remote' ? 'remote' : 'internship'];
    const pubDate = new Date(job.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    // Format description paragraphs
    const formattedDescription = description.split('\n').map((p: string) => p.trim() ? `<p style="margin-bottom: 16px;">${p}</p>` : '').join('');

    const relatedJobsHtml = relatedJobs.length > 0 ? `
      <!-- RELATED JOBS SECTION -->
      <section class="related-jobs-sec" style="margin-top: 48px; border-top: 1px solid var(--border); padding-top: 40px; margin-bottom: 40px;">
        <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--text-heading); margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-briefcase" style="color: var(--primary);"></i>
          ${locale === 'ar' ? 'وظائف مقترحة قد تهمك' : (locale === 'tr' ? 'İlginizi Çekebilecek Benzer İlanlar' : 'Suggested Jobs You May Like')}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
          ${relatedJobs.map((relJob: any) => {
      const relTitle = locale === 'ar' ? (relJob.title_ar || relJob.title_en) : (locale === 'tr' ? (relJob.title_tr || relJob.title_en) : (locale === 'fa' ? (relJob.title_fa || relJob.title_en) : (locale === 'ur' ? (relJob.title_ur || relJob.title_en) : (locale === 'ru' ? (relJob.title_ru || relJob.title_en) : relJob.title_en))));
      const relLocation = locale === 'ar' ? (relJob.location_ar || relJob.location_en) : (locale === 'tr' ? (relJob.location_tr || relJob.location_en) : (locale === 'fa' ? (relJob.location_fa || relJob.location_en) : (locale === 'ur' ? (relJob.location_ur || relJob.location_en) : (locale === 'ru' ? (relJob.location_ru || relJob.location_en) : relJob.location_en))));
      const relCompany = relatedCompanies[relJob.company] || { name: relJob.company || 'Company' };
      const typeKey = relJob.jobType === 'full-time' ? 'fullTime' : relJob.jobType === 'part-time' ? 'partTime' : relJob.jobType === 'remote' ? 'remote' : 'internship';
      const relTypeLabel = translations[typeKey] || relJob.jobType;
      const viewJobLabel = locale === 'ar' ? 'عرض الوظيفة ←' : (locale === 'tr' ? 'İlanı Görüntüle ←' : 'View Job ←');

      return `
            <a href="/${locale}/jobs/${relJob.slug}" style="display: flex; flex-direction: column; justify-content: space-between; background: var(--bg-card); border: 1.5px solid var(--border); border-radius: var(--r-md); padding: 24px; transition: var(--t-fast); text-decoration: none; box-shadow: var(--shadow-xs); position: relative; height: 100%;"
               onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='var(--primary)'; this.style.boxShadow='var(--shadow-md)';"
               onmouseout="this.style.transform='none'; this.style.borderColor='var(--border)'; this.style.boxShadow='var(--shadow-xs)';"
               onclick="window.location.href='/${locale}/jobs/${relJob.slug}'">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                  <div style="width: 44px; height: 44px; border-radius: var(--r-sm); background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary); font-size: 1.25rem; overflow: hidden; border: 1px solid var(--border);">
                    ${relCompany.logo ? `<img src="${relCompany.logo}" alt="${relCompany.name}" style="width:100%; height:100%; object-fit:cover;">` : relCompany.name.charAt(0).toUpperCase()}
                  </div>
                  <span style="font-size: 0.72rem; font-weight: 700; background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: var(--r-full);">
                    ${relTypeLabel}
                  </span>
                </div>
                <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-heading); margin-bottom: 6px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.8em;">
                  ${relTitle}
                </h3>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 600;">
                  <i class="fa-solid fa-building" style="font-size: 0.8rem; margin-inline-end: 4px;"></i> ${relCompany.name}
                </div>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; color: var(--text-muted); font-weight: 500; border-top: 1px solid var(--border); padding-top: 12px; margin-top: 12px;">
                <span><i class="fa-solid fa-location-dot" style="margin-inline-end: 4px;"></i> ${relLocation}</span>
                <span style="color: var(--primary); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                  ${viewJobLabel}
                </span>
              </div>
            </a>
            `;
    }).join('')}
        </div>
      </section>
    ` : '';

    const html = `
    <div class="container">
      <div style="margin: 30px 0 10px;">
        <a href="/${locale}" style="color: var(--primary); font-weight: 600;">${translations.backToList}</a>
      </div>

      <div class="job-detail-layout">
        <article class="detail-main">
          ${job.imageUrl ? `<div class="detail-banner-wrapper" style="margin-bottom: 24px; border-radius: var(--radius-lg); overflow: hidden; max-height: 300px; box-shadow: var(--shadow-sm); border: 1px solid var(--border);">
            <img src="${job.imageUrl.startsWith('http') ? job.imageUrl : '/api/jobs/image?key=' + encodeURIComponent(job.imageUrl)}" alt="${title}" style="width: 100%; height: 300px; object-fit: cover;">
          </div>` : ''}
          <div class="detail-header" data-job-id="${job.id}">
            ${job.featured ? `<span class="tag tag-feat" style="margin-bottom: 12px; display: inline-block;">${translations.featured}</span>` : ''}
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 16px;">
              <h1 class="detail-title" style="margin-bottom: 0;">${title}</h1>
              <button class="btn-fav" data-job-id="${job.id}" onclick="toggleFavorite('${job.id}', event)" style="font-size: 1.8rem; width: 50px; height: 50px;" title="${locale === 'ar' ? 'حفظ في المفضلة' : 'Save to Favorites'}">
                <i class="fa-regular fa-heart"></i>
              </button>
            </div>
            <div class="detail-meta">
              <span><i class="fa-solid fa-building"></i> ${company.name}</span>
              <span><i class="fa-solid fa-location-dot"></i> ${location}</span>
              <span><i class="fa-regular fa-clock"></i> ${pubDate}</span>
            </div>
          </div>

          <div class="detail-body">
            <h3 style="font-weight: 700; border-bottom: 2px solid var(--bg-site); padding-bottom: 8px; margin-bottom: 16px;">${translations.requirements}</h3>
            ${formattedDescription}
          </div>
        </article>

        <aside class="detail-sidebar">
          <div class="sidebar-box" style="text-align: center;">
            <div class="sidebar-company-logo">
              ${company.logo ? `<img src="${company.logo}" alt="${company.name}" onerror="this.onerror=null; this.parentElement.innerHTML='${company.name.charAt(0)}';">` : company.name.charAt(0)}
            </div>
            <div class="sidebar-company-name">${company.name}</div>
            ${company.description ? `<div class="sidebar-company-desc">${company.description}</div>` : ''}
            ${company.website ? `<a href="${company.website}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 16px;">${locale === 'ar' ? 'زيارة موقع الشركة' : 'Visit Website'} <i class="fa-solid fa-external-link" style="font-size: 0.75rem;"></i></a>` : ''}
          </div>

          <div class="sidebar-box">
            <div style="margin-bottom: 16px;">
              <span style="font-weight: 700; color: var(--text-dark); display: block; font-size: 0.9rem;">${translations.jobType}</span>
              <span style="color: var(--text-main); font-size: 1rem;">${typeLabel}</span>
            </div>
            <div style="margin-bottom: 16px;">
              <span style="font-weight: 700; color: var(--text-dark); display: block; font-size: 0.9rem;">${translations.salary}</span>
              <span style="color: var(--text-main); font-size: 1rem;">
                ${job.salary || (locale === 'ar' ? 'تنافسي (تقديري ٢٠,٠٠٠ - ٣٥,٠٠٠ ل.ت / شهر)' : 'Competitive (Estimated 20,000 - 35,000 TRY / Month)')}
              </span>
            </div>
            <div style="margin-bottom: 24px;">
              <span style="font-weight: 700; color: var(--text-dark); display: block; font-size: 0.9rem;">${translations.published}</span>
              <span style="color: var(--text-main); font-size: 1rem;">${pubDate}</span>
            </div>
            ${job.phone ? `<div style="margin-bottom: 20px; border-top: 1px solid var(--border); padding-top: 16px;">
              <span style="font-weight: 700; color: var(--text-dark); display: block; font-size: 0.9rem; margin-bottom: 4px;">
                ${locale === 'ar' ? '📞 هاتف التواصل:' : '📞 Contact Phone:'}
              </span>
              <a href="tel:${job.phone}" style="color: var(--primary); font-weight: 600; font-size: 1.05rem; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-phone"></i> ${job.phone}
              </a>
              ${job.phone.replace(/[^0-9]/g, '').length >= 10 ? `
              <a href="https://wa.me/${job.phone.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener" style="color: #25d366; font-weight: 600; font-size: 0.9rem; text-decoration: none; display: flex; align-items: center; gap: 6px; margin-top: 8px;">
                <i class="fa-brands fa-whatsapp" style="font-size: 1.15rem;"></i> ${locale === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
              </a>` : ''}
            </div>` : ''}
            <button onclick="openApplyModal()" class="btn-sidebar-apply" style="margin-bottom: 20px; border: none; cursor: pointer; display: block; width: 100%;">${translations.applyNow}</button>
            
            <!-- Social Share Widget -->
            <div class="share-widget" style="border-top: 1px solid var(--border); padding-top: 20px;">
              <div class="share-widget-title" style="font-weight: 700; color: var(--text-dark); margin-bottom: 12px; font-size: 0.95rem;">
                ${locale === 'ar' ? 'مشاركة هذه الوظيفة:' : 'Share this Job:'}
              </div>
              <div class="share-buttons" style="display: flex; flex-direction: column; gap: 8px;">
                <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}" target="_blank" 
                   style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: var(--r-sm); background: #25D366; color: white; font-weight: 700; font-size: 0.95rem; text-decoration: none; transition: var(--t-base); box-shadow: var(--shadow-xs);"
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-sm)'"
                   onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-xs)'">
                  <i class="fa-brands fa-whatsapp" style="font-size: 1.25rem;"></i>
                  <span>${locale === 'ar' ? 'مشاركة عبر واتساب' : 'Share on WhatsApp'}</span>
                </a>
                
                <a href="https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}" target="_blank" 
                   style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: var(--r-sm); background: #0088cc; color: white; font-weight: 700; font-size: 0.95rem; text-decoration: none; transition: var(--t-base); box-shadow: var(--shadow-xs);"
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-sm)'"
                   onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-xs)'">
                  <i class="fa-brands fa-telegram" style="font-size: 1.25rem;"></i>
                  <span>${locale === 'ar' ? 'مشاركة عبر تلغرام' : 'Share on Telegram'}</span>
                </a>
                
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}" target="_blank" 
                   style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: var(--r-sm); background: #000000; color: white; font-weight: 700; font-size: 0.95rem; text-decoration: none; transition: var(--t-base); box-shadow: var(--shadow-xs);"
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-sm)'"
                   onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-xs)'">
                  <i class="fa-brands fa-x-twitter" style="font-size: 1.15rem;"></i>
                  <span>${locale === 'ar' ? 'مشاركة عبر إكس (تويتر)' : 'Share on X (Twitter)'}</span>
                </a>
                
                <button onclick="copyToClipboard('${shareUrl}')" 
                        style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: var(--r-sm); background: var(--bg-subtle); color: var(--text-dark); font-weight: 700; font-size: 0.95rem; border: 1px solid var(--border); cursor: pointer; transition: var(--t-base); width: 100%; box-shadow: var(--shadow-xs);"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-sm)'"
                        onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-xs)'">
                  <i class="fa-solid fa-link" style="font-size: 1.1rem;"></i>
                  <span>${locale === 'ar' ? 'نسخ رابط الوظيفة' : 'Copy Job Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      ${relatedJobsHtml}
    </div>

    <!-- Quick Apply Modal -->
    <div id="apply-modal" class="apply-modal">
      <div class="apply-modal-content">
        <span class="modal-close" onclick="closeApplyModal()">&times;</span>
        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px; text-align: center;">
          ${locale === 'ar' ? 'التقديم السريع للوظيفة' : 'Quick Application'}
        </h2>
        <h3 style="font-size: 1.1rem; color: var(--primary); text-align: center; margin-bottom: 24px;">${title}</h3>

        <form id="apply-job-form">
          <input type="hidden" name="jobId" value="${job.id}">
          <input type="hidden" name="locale" value="${locale}">
          
          <!-- Step 1: Basic Info & CV -->
          <div id="apply-step-1" class="apply-form-step">
            <div style="margin-bottom: 16px; text-align: left;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
              <input type="text" name="candidateName" required class="form-input">
            </div>

            <div style="margin-bottom: 16px; text-align: left;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <input type="email" name="candidateEmail" required class="form-input">
            </div>

            <div style="margin-bottom: 16px; position: relative; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-weight: 700; color: var(--text-dark); margin: 0;">${locale === 'ar' ? 'رسالة التغطية' : 'Cover Letter'}</label>
                <button type="button" onclick="generateAiCoverLetter()" id="btn-ai-letter" class="btn-apply-now" style="font-size: 0.8rem; padding: 4px 10px; margin-top: 0; background: transparent;">
                  🤖 ${locale === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'Draft with AI'}
                </button>
              </div>
              <textarea id="candidate-cover" name="coverLetter" required rows="6" class="form-input" placeholder="${locale === 'ar' ? 'اكتب رسالة التغطية أو دع الذكاء الاصطناعي يكتبها لك...' : 'Write your cover letter or let AI generate it...'}" style="resize: vertical;"></textarea>
            </div>

            <div style="margin-bottom: 24px; text-align: left;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${locale === 'ar' ? 'تحميل السيرة الذاتية (PDF)' : 'Upload CV (PDF)'}</label>
              <input type="file" name="resumeFile" required accept=".pdf" class="form-input">
            </div>

            <button type="button" onclick="nextApplyStep(2)" class="btn-sidebar-apply" style="border: none;">
              ${locale === 'ar' ? 'المتابعة للتقييم والـ Video Pitch ←' : 'Next: Screening & Video Pitch ←'}
            </button>
          </div>

          <!-- Step 2: Screening Quiz -->
          <div id="apply-step-2" class="apply-form-step" style="display: none;">
            <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin-bottom: 16px; text-align: left;">
              ${locale === 'ar' ? 'الخطوة ٢: اختبار المهارات السريع' : 'Step 2: Screening Quiz'}
            </h4>
            
            <div id="quiz-questions-container" style="text-align: left;">
              ${quizQuestionsRaw.length > 0 ? quizQuestionsRaw.map((q: any, qIdx: number) => `
                  <div style="margin-bottom: 16px; background: rgba(0,0,0,0.02); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    <div style="font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">Q${qIdx + 1}: ${q.question}</div>
                    ${q.options.map((opt: string) => `
                      <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                        <input type="radio" name="quiz_q_${qIdx}" value="${opt}" required style="accent-color: var(--primary);">
                        <span>${opt}</span>
                      </label>
                    `).join('')}
                  </div>
                `).join('') : `
                  <!-- Fallback general screening questions -->
                  <div style="margin-bottom: 16px; background: rgba(0,0,0,0.02); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    <div style="font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">Q1: ${locale === 'ar' ? 'هل تمتلك تصريح عمل أو إقامة سارية في تركيا؟' : 'Do you have a valid work permit or residency in Turkey?'}</div>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                      <input type="radio" name="quiz_q_0" value="Yes" checked style="accent-color: var(--primary);">
                      <span>${locale === 'ar' ? 'نعم' : 'Yes'}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                      <input type="radio" name="quiz_q_0" value="No" style="accent-color: var(--primary);">
                      <span>${locale === 'ar' ? 'لا' : 'No'}</span>
                    </label>
                  </div>
                  <div style="margin-bottom: 16px; background: rgba(0,0,0,0.02); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    <div style="font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">Q2: ${locale === 'ar' ? 'كم عدد سنوات خبرتك المهنية في هذا المجال؟' : 'How many years of professional experience do you have in this field?'}</div>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                      <input type="radio" name="quiz_q_1" value="0-2" checked style="accent-color: var(--primary);">
                      <span>${locale === 'ar' ? '٠ - ٢ سنة' : '0 - 2 years'}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                      <input type="radio" name="quiz_q_1" value="3-5" style="accent-color: var(--primary);">
                      <span>${locale === 'ar' ? '٣ - ٥ سنوات' : '3 - 5 years'}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                      <input type="radio" name="quiz_q_1" value="5+" style="accent-color: var(--primary);">
                      <span>${locale === 'ar' ? 'أكثر من ٥ سنوات' : '5+ years'}</span>
                    </label>
                  </div>
                `
      }
            </div>

            <div style="display: flex; gap: 12px; margin-top: 20px;">
              <button type="button" onclick="nextApplyStep(1)" class="btn-apply-now" style="flex: 1;">${locale === 'ar' ? 'السابق' : 'Previous'}</button>
              <button type="button" onclick="nextApplyStep(3)" class="btn-sidebar-apply" style="flex: 1; margin-top: 0;">${locale === 'ar' ? 'المتابعة للمقطع التعريفي ←' : 'Next: Video Pitch ←'}</button>
            </div>
          </div>

          <!-- Step 3: Video Pitch -->
          <div id="apply-step-3" class="apply-form-step" style="display: none;">
            <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin-bottom: 12px; text-align: left;">
              ${locale === 'ar' ? 'الخطوة ٣: مقطع فيديو تعريفي قصير (Video Pitch - اختياري)' : 'Step 3: 60-Second Video Pitch (Optional)'}
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); text-align: left; margin-bottom: 16px; line-height:1.5;">
              ${locale === 'ar' ? 'أضف لمسة شخصية لطلبك عن طريق رفع فيديو تعريفي قصير (حتى ٦٠ ثانية) يظهر مهاراتك وثقتك أمام أصحاب العمل.' : 'Add a personal touch to your application by uploading a brief self-introduction video.'}
            </p>

            <div style="margin-bottom: 20px; text-align: left;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${locale === 'ar' ? 'ملف الفيديو (.mp4 أو .webm)' : 'Video File (.mp4 or .webm)'}</label>
              <input type="file" name="videoFile" accept="video/mp4,video/webm" class="form-input">
            </div>

            <div style="display: flex; gap: 12px; margin-top: 30px;">
              <button type="button" onclick="nextApplyStep(2)" class="btn-apply-now" style="flex: 1;">${locale === 'ar' ? 'السابق' : 'Previous'}</button>
              <button type="submit" id="applySubmitBtn" class="btn-sidebar-apply" style="flex: 1; margin-top: 0; border: none;">
                ${locale === 'ar' ? 'إرسال طلب التوظيف 🚀' : 'Submit Application 🚀'}
              </button>
            </div>
          </div>
        </form>

        <div id="apply-success" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: var(--radius-md); color: #166534; font-weight: 600; text-align: center; margin-top: 20px;">
          <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
          ${locale === 'ar' ? 'تم إرسال طلبك لصاحب العمل بنجاح!' : 'Your application was sent successfully!'}
        </div>
      </div>
    </div>

    <script>
      function openApplyModal() {
        document.getElementById('apply-modal').style.display = 'flex';
      }

      function closeApplyModal() {
        document.getElementById('apply-modal').style.display = 'none';
        document.getElementById('apply-success').style.display = 'none';
        document.getElementById('apply-job-form').style.display = 'block';
        nextApplyStep(1); // Reset step
      }

      function nextApplyStep(stepNum) {
        document.querySelectorAll('.apply-form-step').forEach(step => step.style.display = 'none');
        document.getElementById('apply-step-' + stepNum).style.display = 'block';
      }

      async function generateAiCoverLetter() {
        const btn = document.getElementById('btn-ai-letter');
        const text = document.getElementById('candidate-cover');
        
        btn.innerText = "${locale === 'ar' ? 'جاري الصياغة...' : 'Drafting...'}";
        btn.disabled = true;

        try {
          const res = await fetch('/api/cv-optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              locale: '${locale}',
              jobDescription: decodeURIComponent('${encodeURIComponent(description)}'),
              experience: "${locale === 'ar' ? 'يرجى كتابة رسالة تغطية احترافية ومقنعة بناءً على متطلبات الوظيفة الشاغرة المحددة.' : 'Please draft a highly relevant, professional cover letter for this job role.'}"
            })
          });

          const data = await res.json();
          if (res.ok) {
            text.value = data.coverLetter;
          } else {
            alert('Failed to generate. Please write manually.');
          }
        } catch(err) {
          alert('Error generating text.');
        } finally {
          btn.innerText = "🤖 ${locale === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'Draft with AI'}";
          btn.disabled = false;
        }
      }

      document.getElementById('apply-job-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const btn = document.getElementById('applySubmitBtn');
        
        btn.innerText = "${locale === 'ar' ? 'جاري الإرسال... ⏳' : 'Submitting... ⏳'}";
        btn.disabled = true;

        try {
          const res = await fetch('/api/jobs/apply', {
            method: 'POST',
            body: formData
          });

          const data = await res.json();
          if (res.ok) {
            form.style.display = 'none';
            document.getElementById('apply-success').style.display = 'block';
          } else {
            alert(data.error || 'Failed to submit application.');
          }
        } catch(err) {
          alert('Network connection error.');
        } finally {
          btn.innerText = "${locale === 'ar' ? 'إرسال طلب التوظيف' : 'Submit Application'}";
          btn.disabled = false;
        }
      });
    </script>
  `;

    const seoHtml = generateMetaTags(locale, 'job', {
      title,
      description: description,
      slug: job.slug,
      publishedAt: job.publishedAt,
      companyName: company.name,
      location,
      jobType: job.jobType,
      salary: job.salary,
      seoKeywords: job.seoKeywords || [],
      seoDescription: job.seoDescription || ''
    }) + generateJsonLd(locale, 'job', {
      title,
      description: description,
      slug: job.slug,
      publishedAt: job.publishedAt,
      companyName: company.name,
      companyLogo: company.logo,
      companyWebsite: company.website,
      location,
      jobType: job.jobType,
      salary: job.salary
    });

    return c.html(renderLayout(c, title, html, locale, seoHtml));
  })

// Submit Job Page
publicRouter.get('/:locale/submit-job', async (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';

  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') {
    return c.redirect('/ar/submit-job');
  }

  const db = (c.env as any).DB;
  let categories: any[] = [];
  try {
    const catRows = await db.prepare(
      `SELECT id, slug, data FROM documents WHERE type_id = 'categories' AND status = 'published' AND is_published = 1`
    ).all();
    categories = (catRows.results || []).map((row: any) => ({
      id: row.id,
      slug: row.slug,
      ...JSON.parse(row.data)
    }));
  } catch (err) {
    console.error('Error fetching categories in submit job page:', err);
  }

  const t = {
    ar: {
      title: 'أعلن عن وظيفة شاغرة',
      subtitle: 'أضف تفاصيل الوظيفة لتصل إلى آلاف المتقدمين المهتمين بالعمل في إسطنبول',
      jobTitle: 'المسمى الوظيفي',
      compName: 'اسم الشركة',
      category: 'التصنيف الوظيفي',
      jobType: 'نوع التوظيف',
      location: 'المنطقة في إسطنبول',
      salary: 'الراتب المتوقع (اختياري)',
      applyEmail: 'بريد التقديم الإلكتروني',
      phone: 'رقم الهاتف (اختياري)',
      seoKeywords: 'الكلمات المفتاحية للسيو (اختياري - مفصولة بفواصل، مثل: وظائف، عمل في إسطنبول)',
      desc: 'الوصف الوظيفي والمتطلبات التفصيلية',
      submit: 'نشر الوظيفة فوراً',
      successMsg: 'تم نشر الوظيفة بنجاح وظهرت فوراً على الموقع!'
    },
    en: {
      title: 'Post a Job Vacancy',
      subtitle: 'Publish your job vacancy to reach thousands of active job seekers in Istanbul',
      jobTitle: 'Job Title',
      compName: 'Company Name',
      category: 'Job Category',
      jobType: 'Employment Type',
      location: 'District in Istanbul',
      salary: 'Offered Salary (Optional)',
      applyEmail: 'Application Email',
      phone: 'Phone Number (Optional)',
      seoKeywords: 'SEO Keywords (Optional - comma separated, e.g. jobs, work in Istanbul)',
      desc: 'Job Description & Requirements',
      submit: 'Publish Job Instantly',
      successMsg: 'Job published successfully! It is now live on the site.'
    },
    tr: {
      title: 'İş İlanı Yayınla',
      subtitle: 'İstanbul\'da iş arayan binlerce aktif adaya ulaşmak için iş ilanınızı yayınlayın',
      jobTitle: 'Pozisyon / İş Unvanı',
      compName: 'Şirket Adı',
      category: 'İş Kategorisi',
      jobType: 'Çalışma Şekli',
      location: 'İstanbul\'daki İlçe',
      salary: 'Sunulan Maaş (İsteğe Bağlı)',
      applyEmail: 'Başvuru E-postası',
      phone: 'Telefon Numarası (İsteğe Bağlı)',
      seoKeywords: 'SEO Anahtar Kelimeleri (İsteğe bağlı - virgülle ayırın, örn: iş ilanları, istanbulda çalışma)',
      desc: 'İş Tanımı & Gereksinimler',
      submit: 'İlanı Hemen Yayınla',
      successMsg: 'İş ilanı başarıyla yayınlandı! Şu anda sitede canlı yayında.'
    },
    ru: {
      title: 'Разместить вакансию',
      subtitle: 'Добавьте детали вакансии, чтобы охватить тысячи соискателей в Стамбуле',
      jobTitle: 'Название вакансии',
      compName: 'Название компании',
      category: 'Категория вакансии',
      jobType: 'Тип занятости',
      location: 'Район в Стамбуле',
      salary: 'Ожидаемая зарплата (необязательно)',
      applyEmail: 'Эл. почта для откликов',
      phone: 'Номер телефона (необязательно)',
      seoKeywords: 'Ключевые слова SEO (через запятую)',
      desc: 'Описание вакансии и детальные требования',
      submit: 'Опубликовать мгновенно',
      successMsg: 'Вакансия успешно опубликована и мгновенно появилась на сайте!'
    },
    fa: {
      title: 'ثبت و انتشار آگهی استخدام',
      subtitle: 'جزئیات فرصت شغلی خود را ثبت کنید تا به هزاران کارجوی فعال در استانبول دسترسی پیدا کنید',
      jobTitle: 'عنوان شغلی',
      compName: 'نام شرکت',
      category: 'دسته‌بندی شغلی',
      jobType: 'نوع همکاری',
      location: 'منطقه / محله در استانبول',
      salary: 'حقوق پیشنهادی (اختیاری)',
      applyEmail: 'ایمیل جهت دریافت رزومه‌ها',
      phone: 'شماره تماس جهت هماهنگی (اختیاری)',
      seoKeywords: 'کلمات کلیدی سئو (اختیاری - با کاما جدا کنید، مانند: کار در استانبول، استخدام)',
      desc: 'شرح وظایف و شرایط احراز شغل به صورت کامل',
      submit: 'انتشار فوری آگهی استخدام',
      successMsg: 'آگهی استخدام شما با موفقیت ثبت شد و بلافاصله در سایت به نمایش درآمد!'
    },
    ur: {
      title: 'ملازمت کا اشتہار پوسٹ کریں',
      subtitle: 'اپنی کمپنی میں خالی اسامی کا اشتہار دیں اور استنبول میں ہزاروں ہنرمندوں تک پہنچیں',
      jobTitle: 'ملازمت کا عنوان',
      compName: 'کمپنی کا نام',
      category: 'ملازمت کا شعبہ (کیٹیگری)',
      jobType: 'ملازمت کی قسم',
      location: 'استنبول میں ضلع / مقام',
      salary: 'پیشکش کردہ تنخواہ (اختیاری)',
      applyEmail: 'درخواستیں وصول کرنے کا ای میل',
      phone: 'رابطہ نمبر (اختیاری)',
      seoKeywords: 'ایس ای او کلیدی الفاظ (اختیاری - کوما سے الگ کریں)',
      desc: 'ملازمت کی مکمل تفصیل اور شرائط',
      submit: 'اشتہار فوری شائع کریں',
      successMsg: 'آپ کی ملازمت کا اشتہار کامیابی سے پوسٹ کر دیا گیا ہے اور اب یہ سائٹ پر لائیو ہے!'
    }
  }[locale];

  const html = `
    <!-- Cloudflare Turnstile API -->
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

    <div class="container" style="max-width: 800px; padding: 60px 20px;">
      <h1 style="font-size: 2.25rem; font-weight: 800; color: var(--text-dark); margin-bottom: 8px; text-align: center;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem;">${t.subtitle}</p>

      <form id="submit-job-form" method="POST" action="/submit-job-api" style="background: white; border: 1px solid var(--border); padding: 40px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
        <input type="hidden" name="locale" value="${locale}">
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.jobTitle}</label>
          <input type="text" name="title" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.compName}</label>
          <input type="text" name="company" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.category}</label>
          <select name="category" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none; background: white;">
            <option value="">${locale === 'ar' ? '-- اختر القسم --' : '-- Select Category --'}</option>
            ${categories.map((cat: any) => `
              <option value="${cat.id}">${locale === 'ar' ? (cat.name_ar || cat.name) : (cat.name_en || cat.name)}</option>
            `).join('')}
          </select>
        </div>

        <div style="margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.jobType}</label>
            <select name="jobType" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none; background: white;">
              <option value="full-time">Full-time / دوام كامل</option>
              <option value="part-time">Part-time / دوام جزئي</option>
              <option value="remote">Remote / عمل عن بعد</option>
              <option value="internship">Internship / تدريب عملي</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.location}</label>
            <input type="text" name="location" required placeholder="e.g. Fatih / الفاتح" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
          </div>
        </div>

        <div style="margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.applyEmail}</label>
            <input type="email" name="applyEmail" required placeholder="jobs@company.com" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
          </div>
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.phone}</label>
            <input type="tel" name="phone" placeholder="e.g. +90 555 123 4567" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.salary}</label>
          <input type="text" name="salary" placeholder="e.g. 20,000 - 30,000 TL" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.seoKeywords}</label>
          <input type="text" name="seoKeywords" placeholder="${locale === 'ar' ? 'مثل: وظائف، عمل في إسطنبول، مترجم' : 'e.g. jobs, work in Istanbul, translator'}" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
        </div>

        <div style="margin-bottom: 30px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.desc}</label>
          <textarea name="description" required rows="8" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none; resize: vertical;"></textarea>
        </div>

        <!-- Cloudflare Turnstile CAPTCHA Widget -->
        <div style="margin-bottom: 30px; display: flex; justify-content: center;">
          <div class="cf-turnstile" data-sitekey="${(c.env as any).TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}" data-theme="light"></div>
        </div>

        <button type="submit" class="btn-sidebar-apply" style="border: none; cursor: pointer;">${t.submit}</button>
      </form>
      
      <div id="form-success" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: var(--radius-md); color: #166534; font-weight: 600; text-align: center; margin-top: 20px;">
        <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
        ${t.successMsg}
      </div>
      
      <script>
        document.getElementById('submit-job-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          const form = e.target;
          const formData = new FormData(form);
          const data = Object.fromEntries(formData);
          
          try {
            const res = await fetch(form.action, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            if (res.ok) {
              form.style.display = 'none';
              document.getElementById('form-success').style.display = 'block';
            } else {
              const errData = await res.json().catch(() => ({}));
              alert(errData.error || 'Error submitting form. Please try again.');
              // Reset Turnstile on failure
              if (window.turnstile) {
                window.turnstile.reset();
              }
            }
          } catch(err) {
            alert('An error occurred. Please try again.');
          }
        });
      </script>
    </div>
  `;

  const seoHtml = generateMetaTags(locale, 'submit');
  return c.html(renderLayout(c, t.title, html, locale, seoHtml));
})

// Receive public job submissions for review
publicRouter.post(
  '/submit-job-api',
  rateLimiter(5, 10), // Limit 5 submissions per 10 minutes per IP
  validateJobSubmission(),
  validateTurnstile(),
  async (c) => {
    try {
      const db = (c.env as any).DB;
      const data: any = (c as any).get('parsedBody');
      const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-real-ip') || '127.0.0.1';
      const nowMs = Date.now();
      const id = `job-pending-${nowMs}-${Math.random().toString(36).substring(2, 7)}`;
      const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nowMs}`;

      let imageUrl = '';
      const bucket = (c.env as any).MEDIA_BUCKET;
      if (bucket) {
        try {
          imageUrl = await assignJobImage(bucket, id, data.category || 'cat-general');
        } catch (e) {
          console.error('Error assigning job image during submission:', e);
        }
      }

      let titleAr = data.title;
      let titleEn = data.title;
      let descAr = data.description;
      let descEn = data.description;
      let seoKeywords: string[] = [];
      if (data.seoKeywords) {
        seoKeywords = data.seoKeywords.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      let seoDescription = '';

      const geminiApiKey = (c.env as any).GEMINI_API_KEY;
      if (geminiApiKey) {
        try {
          const seoResult = await optimizeSeoWithGemini(
            geminiApiKey,
            data.title,
            data.description,
            data.locale || 'ar'
          );
          titleAr = seoResult.title_ar || data.title;
          titleEn = seoResult.title_en || data.title;
          descAr = seoResult.description_ar || data.description;
          descEn = seoResult.description_en || data.description;
          const geminiKeywords = seoResult.keywords || [];
          seoKeywords = Array.from(new Set([...seoKeywords, ...geminiKeywords]));
          seoDescription = seoResult.seoDescription || '';
        } catch (e) {
          console.error('Gemini SEO call failed on guest submission:', e);
        }
      }

      const docData = JSON.stringify({
        title_ar: titleAr,
        title_en: titleEn,
        slug: slug,
        description_ar: descAr,
        description_en: descEn,
        company: data.company, // Capturing guest input
        category: data.category || 'cat-general',
        location_ar: data.location_ar || data.location,
        location_en: data.location_en || data.location,
        jobType: data.jobType || 'full-time',
        salary: data.salary || '',
        phone: data.phone || '',
        applyEmail: data.applyEmail,
        guestEmail: data.applyEmail, // Track who submitted it
        language: data.language || 'both',
        featured: false,
        publishedAt: nowMs,
        status: 'published',
        screeningQuestionsJson: data.screeningQuestionsJson || '',
        transitLine: data.transitLine || 'none',
        imageUrl: imageUrl,
        seoKeywords,
        seoDescription
      });

      await db.prepare(
        `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, published_at, created_at, updated_at)
         VALUES (?, ?, 'jobs', 'published', 1, 1, ?, ?, ?, ?, ?, ?)`
      ).bind(id, id, slug, titleEn, docData, nowMs, nowMs, nowMs).run();

      // Insert category reference in document_references so filtering works
      if (data.category) {
        await db.prepare(
          `INSERT INTO document_references (id, tenant_id, from_root_id, from_document_id, field_name, ordinal, to_root_id, ref_strength)
           VALUES (?, 'default', ?, ?, 'category', 0, ?, 'weak')`
        ).bind(`ref-${id}-category`, id, id, data.category).run();
      }

      // Log security event for auditing
      await logSecurityEvent(db, 'JOB_PUBLISHED_GUEST', data.applyEmail, ip, `Public job published instantly: ${data.title}`);

      // Dispatch Telegram notifications in the background
      let hasWaitUntil = false;
      try {
        if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
          hasWaitUntil = true;
        }
      } catch (e) { }

      if (hasWaitUntil) {
        c.executionCtx.waitUntil(
          sendTelegramAlert(c.env, data.title, data.company, data.location, slug).catch((err) =>
            console.error('Telegram alert async dispatch error:', err)
          )
        );
        c.executionCtx.waitUntil(
          notifyGoogleIndexing(c.env, slug).catch((err) =>
            console.error('Google Indexing async dispatch error:', err)
          )
        );
      } else {
        sendTelegramAlert(c.env, data.title, data.company, data.location, slug).catch((err) =>
          console.error('Telegram alert fallback error:', err)
        );
        notifyGoogleIndexing(c.env, slug).catch((err) =>
          console.error('Google Indexing fallback error:', err)
        );
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Error submitting job form:', error);
      return c.json({ success: false, error: 'Database insertion failed' }, 500);
    }
  }
)

// Direct Job Application with R2 PDF Upload
publicRouter.post('/api/jobs/apply', rateLimiter(10, 5), async (c) => {
  const env: any = c.env;
  const db = env.DB;
  const bucket = env.MEDIA_BUCKET;

  if (!bucket) {
    return c.json({ error: 'R2 Media Bucket binding missing' }, 500);
  }

  try {
    const body = await c.req.parseBody();
    const jobId = body.jobId as string;
    const candidateName = body.candidateName as string;
    const candidateEmail = body.candidateEmail as string;
    const coverLetter = body.coverLetter as string;
    const resumeFile = body.resumeFile as File;

    if (!jobId || !candidateName || !candidateEmail || !coverLetter || !resumeFile) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    const timestamp = Date.now();

    // 1. Upload CV PDF to Cloudflare R2
    const fileExtension = resumeFile.name.split('.').pop() || 'pdf';
    const r2Key = `resumes/${jobId}/${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;

    const fileBuffer = await resumeFile.arrayBuffer();
    await bucket.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: resumeFile.type || 'application/pdf',
      }
    });

    // 2. Optional: Upload Video Pitch to Cloudflare R2
    const videoFile = body.videoFile as any;
    let videoPitchUrl = '';
    if (videoFile && typeof videoFile === 'object' && 'size' in videoFile && videoFile.size > 0) {
      const vFile = videoFile as File;
      const videoExtension = vFile.name.split('.').pop() || 'mp4';
      const r2VideoKey = `videos/${jobId}/${timestamp}-${Math.random().toString(36).substring(2, 7)}.${videoExtension}`;
      const videoBuffer = await vFile.arrayBuffer();
      await bucket.put(r2VideoKey, videoBuffer, {
        httpMetadata: {
          contentType: vFile.type || 'video/mp4',
        }
      });
      videoPitchUrl = r2VideoKey;
    }

    // 3. Score Quiz Answers
    const jobRow = await db.prepare(
      `SELECT data FROM documents WHERE id = ? AND type_id = 'jobs'`
    ).bind(jobId).first();

    let quizScore = '--';
    let screeningQuestions: any[] = [];
    if (jobRow) {
      try {
        const jobData = JSON.parse(jobRow.data);
        if (jobData.screeningQuestionsJson) {
          screeningQuestions = JSON.parse(jobData.screeningQuestionsJson);
        }
      } catch (e) {
        console.error('Error parsing job screeningQuestionsJson:', e);
      }
    }

    if (Array.isArray(screeningQuestions) && screeningQuestions.length > 0) {
      let correctCount = 0;
      for (let i = 0; i < screeningQuestions.length; i++) {
        const q = screeningQuestions[i];
        const submittedAnswer = body[`quiz_q_${i}`];
        if (submittedAnswer !== undefined) {
          const correctAnswerKey = q.correct || q.correctAnswer || q.answer || q.correctOption || q.correct_answer;
          if (!correctAnswerKey || String(submittedAnswer).trim().toLowerCase() === String(correctAnswerKey).trim().toLowerCase()) {
            correctCount++;
          }
        }
      }
      quizScore = `${correctCount}/${screeningQuestions.length}`;
    } else {
      // Fallback questions validation
      let correctCount = 0;
      const ans0 = body['quiz_q_0'];
      const ans1 = body['quiz_q_1'];
      if (ans0 === 'Yes' || ans0 === 'نعم') {
        correctCount++;
      }
      if (ans1 === '3-5' || ans1 === '5+' || ans1 === '٣ - ٥ سنوات' || ans1 === 'أكثر من ٥ سنوات') {
        correctCount++;
      }
      quizScore = `${correctCount}/2`;
    }

    // 4. Insert document of type 'applications' into D1 documents table
    const appDocId = `app-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;
    const docData = JSON.stringify({
      jobId,
      candidateName,
      candidateEmail,
      coverLetter,
      resumeUrl: r2Key,
      status: 'applied',
      createdAt: timestamp,
      quizScore,
      videoPitchUrl
    });

    await db.prepare(
      `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, created_at, updated_at)
       VALUES (?, ?, 'applications', 'published', 1, 1, ?, ?, ?, ?, ?)`
    ).bind(appDocId, appDocId, appDocId, candidateName, docData, timestamp, timestamp).run();

    return c.json({ success: true });

  } catch (err: any) {
    console.error('Quick Apply Endpoint Error:', err);
    return c.json({ error: 'Application submission failed: ' + err.message }, 500);
  }
})

// Serve job cover images from R2
publicRouter.get('/api/jobs/image', async (c) => {
  const env: any = c.env;
  const key = c.req.query('key');

  if (!key) {
    return c.text('Missing key parameter', 400);
  }

  try {
    const bucket = env.MEDIA_BUCKET;
    if (!bucket) {
      return c.text('R2 Media Bucket binding missing.', 500);
    }

    const object = await bucket.get(key);
    if (!object) {
      return c.text('Image not found.', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Type', 'image/webp');
    headers.set('Cache-Control', 'public, max-age=86400');

    return c.body(object.body, 200, Object.fromEntries(headers.entries()));
  } catch (err: any) {
    return c.text('Failed to load image: ' + err.message, 500);
  }
});

// Serve logo.png from R2 bucket with fallback to built-in logo
publicRouter.get('/public/images/logo.png', async (c) => {
  const env: any = c.env;
  try {
    const bucket = env.MEDIA_BUCKET;
    if (bucket) {
      const object = await bucket.get('public/images/logo.png');
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Content-Type', 'image/png');
        headers.set('Cache-Control', 'public, max-age=86400');
        return c.body(object.body, 200, Object.fromEntries(headers.entries()));
      }
    }
  } catch (err: any) {
    console.error('Failed to load logo from R2, using fallback:', err);
  }

  // Fallback to built-in logo
  const logoBuffer = Buffer.from(FAVICON_BASE64, 'base64');
  return c.body(logoBuffer, 200, {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=86400'
  });
});

// Serve favicon.ico directly using the same built-in logo
publicRouter.get('/favicon.ico', (c) => {
  const logoBuffer = Buffer.from(FAVICON_BASE64, 'base64');
  return c.body(logoBuffer, 200, {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=86400'
  });
});

// Serve og-share.png from R2 bucket
publicRouter.get('/public/images/og-share.png', async (c) => {
  const env: any = c.env;
  try {
    const bucket = env.MEDIA_BUCKET;
    if (!bucket) return c.text('R2 Media Bucket binding missing.', 500);
    const object = await bucket.get('public/images/og-share.png');
    if (!object) return c.text('OG image not found.', 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Type', 'image/png');
    headers.set('Cache-Control', 'public, max-age=86400');
    return c.body(object.body, 200, Object.fromEntries(headers.entries()));
  } catch (err: any) {
    return c.text('Failed to load OG image: ' + err.message, 500);
  }
});

// Backfill stock images & Gemini SEO for existing jobs in D1 and R2
publicRouter.get('/admin-api/backfill-images', async (c) => {
  const env: any = c.env;
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${env.JWT_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const db = env.DB;
  const bucket = env.MEDIA_BUCKET;
  const geminiApiKey = env.GEMINI_API_KEY;
  if (!db || !bucket) {
    return c.json({ error: 'Database or R2 bindings missing' }, 500);
  }

  try {
    const jobRows = await db.prepare(
      `SELECT id, data FROM documents WHERE type_id = 'jobs'`
    ).all();

    let updatedCount = 0;
    for (const row of jobRows.results || []) {
      const jobData = JSON.parse(row.data);
      let changed = false;

      // 1. Image backfill
      if (!jobData.imageUrl) {
        const categoryId = jobData.category || 'cat-general';
        const categoryMap: Record<string, string> = {
          'cat-it': 'it-software',
          'cat-tourism': 'tourism-hospitality',
          'cat-realestate': 'real-estate-sales',
          'cat-education': 'education-teaching',
          'cat-customer': 'customer-service-translation'
        };
        const categorySlug = categoryMap[categoryId] || 'general';

        const r2Key = await assignJobImage(bucket, row.id, categorySlug);
        jobData.imageUrl = r2Key;
        changed = true;
      }

      // 2. Gemini SEO & grammar corrections backfill
      if (!jobData.seoKeywords || !jobData.seoDescription) {
        if (geminiApiKey) {
          try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const seoResult = await optimizeSeoWithGemini(
              geminiApiKey,
              jobData.title_en || jobData.title_ar,
              jobData.description_en || jobData.description_ar,
              jobData.language === 'ar' ? 'ar' : 'en'
            );
            jobData.seoKeywords = seoResult.keywords || [];
            jobData.seoDescription = seoResult.seoDescription || '';
            if (seoResult.correctedTitle) {
              jobData.title_en = seoResult.correctedTitle;
            }
            if (seoResult.correctedDesc) {
              jobData.description_en = seoResult.correctedDesc;
            }
            changed = true;
          } catch (e) {
            console.error(`Gemini backfill failed for job ${row.id}:`, e);
          }
        }
      }

      if (changed) {
        await db.prepare(
          `UPDATE documents SET data = ? WHERE id = ?`
        ).bind(JSON.stringify(jobData), row.id).run();
        updatedCount++;
      }
    }

    return c.json({ success: true, updated: updatedCount });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// About Us Page
publicRouter.get('/:locale/about', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/about');

  const t = {
    ar: {
      title: 'من نحن - فرص عمل في إسطنبول',
      heading: 'من نحن',
      subtitle: 'المنصة المهنية الرائدة لفرص العمل والحلول الذكية في إسطنبول',
      missionTitle: 'رسالتنا وهدفنا',
      missionText: 'نعمل على سد الفجوة بين الباحثين عن عمل المتميزين وأصحاب الأعمال الرائدين في إسطنبول. هدفنا هو تسهيل العثور على وظائف وتوظيف المواهب عبر توفير حلول مبتكرة وموثوقة بنسبة ١٠٠٪.',
      featureTitle: 'لماذا تختار منصتنا؟',
      feat1Title: 'أدوات الذكاء الاصطناعي 🤖',
      feat1Desc: 'نقدم فاحصاً ذكياً ومحسناً للسير الذاتية ومولداً مخصصاً لرسائل التغطية بالإضافة إلى محاكٍ واقعي لمقابلات العمل.',
      feat2Title: 'التوظيف الفوري ⚡',
      feat2Desc: 'نمكن الشركات والأفراد من نشر إعلانات وظيفية تظهر فوراً على الموقع والوصول لآلاف المهتمين في دقائق.',
      feat3Title: 'شفافية وموثوقية 🤝',
      feat3Desc: 'يتم فحص الوظائف وتحديث الرواتب ومراجعة الطلبات لضمان تجربة آمنة وجدية لجميع المستخدمين.',
      statsTitle: 'أرقام تتحدث عنا',
      stat1Val: '+٥٠٠',
      stat1Lbl: 'وظيفة شاغرة نشطة',
      stat2Val: '+١٠ آلاف',
      stat2Lbl: 'متقدم للوظائف شهرياً',
      stat3Val: '١٠٠٪',
      stat3Lbl: 'وظائف موثوقة'
    },
    en: {
      title: 'About Us - Istanbul Jobs',
      heading: 'About Us',
      subtitle: 'The leading career platform and smart employment solution in Istanbul',
      missionTitle: 'Our Mission & Goal',
      missionText: 'We strive to bridge the gap between outstanding job seekers and leading employers in Istanbul. Our goal is to make career matching easy, accessible, and 100% verified through cutting-edge technology and AI integrations.',
      featureTitle: 'Why Choose Our Platform?',
      feat1Title: 'AI-Powered Tools 🤖',
      feat1Desc: 'Optimize your CV, generate professional cover letters, and practice with our realistic AI Interview Simulator.',
      feat2Title: 'Instant Job Posting ⚡',
      feat2Desc: 'Empower companies and individuals to post job listings that go live immediately to reach thousands of candidates.',
      feat3Title: 'Transparency & Trust 🤝',
      feat3Desc: 'We verify job postings, support salary transparency, and ensure a reliable hiring experience for all.',
      statsTitle: 'Our Impact in Numbers',
      stat1Val: '500+',
      stat1Lbl: 'Active Vacancies',
      stat2Val: '10K+',
      stat2Lbl: 'Monthly Job Seekers',
      stat3Val: '100%',
      stat3Lbl: 'Verified Listings'
    },
    tr: {
      title: 'Hakkımızda - İstanbul İş İlanları',
      heading: 'Hakkımızda',
      subtitle: 'İstanbul\'daki lider kariyer platformu ve akıllı istihdam çözümü',
      missionTitle: 'Misyonumuz & Amacımız',
      missionText: 'İstanbul\'daki seçkin iş arayanlar ile öncü işverenler arasında bir köprü oluşturmak için çalışıyoruz. Amacımız, en son teknoloji ve yapay zeka entegrasyonları ile iş eşleştirmeyi kolay, erişilebilir ve %100 doğrulanmış hale getirmektir.',
      featureTitle: 'Neden Bizim Platformumuz?',
      feat1Title: 'Yapay Zeka Destekli Araçlar 🤖',
      feat1Desc: 'Özgeçmişinizi geliştirin, profesyonel ön yazılar oluşturun ve gerçekçi yapay zeka mülakat simülatörümüzle pratik yapın.',
      feat2Title: 'Anında İş İlanı Verme ⚡',
      feat2Desc: 'Şirketlerin ve bireylerin binlerce adaya ulaşmak için anında canlı yayına geçen iş ilanları yayınlamasını sağlıyoruz.',
      feat3Title: 'Şeffaflık & Güven 🤝',
      feat3Desc: 'Güvenilir bir işe alım deneyimi sağlamak için iş ilanlarını doğrular, maaş şeffaflığını destekleriz.',
      statsTitle: 'Sayılarla Etkimiz',
      stat1Val: '500+',
      stat1Lbl: 'Aktif İş İlanı',
      stat2Val: '10B+',
      stat2Lbl: 'Aylık Ziyaretçi',
      stat3Val: '100%',
      stat3Lbl: 'Doğrulanmış İlanlar'
    },
    ru: {
      title: 'О нас - Работа в Стамбуле',
      heading: 'О нас',
      subtitle: 'Ведущая карьерная платформа и умные решения для трудоустройства в Стамбуле',
      missionTitle: 'Наша миссия и цель',
      missionText: 'Мы стремимся сократить разрыв между выдающимися соискателями и ведущими работодателями в Стамбуле. Наша цель — сделать поиск работы легким, доступным и на 100% проверенным благодаря передовым технологиям и интеграции ИИ.',
      featureTitle: 'Почему выбирают нашу платформу?',
      feat1Title: 'Инструменты на базе ИИ 🤖',
      feat1Desc: 'Оптимизируйте резюме, создавайте сопроводительные письма и тренируйтесь с нашим реалистичным ИИ-симулятором собеседований.',
      feat2Title: 'Мгновенная публикация вакансий ⚡',
      feat2Desc: 'Работодатели могут публиковать вакансии, которые мгновенно появляются на сайте для охвата тысяч кандидатов.',
      feat3Title: 'Прозрачность и доверие 🤝',
      feat3Desc: 'Мы верифицируем вакансии, поддерживаем прозрачность зарплат и обеспечиваем надежный опыт найма для всех.',
      statsTitle: 'Наши показатели',
      stat1Val: '500+',
      stat1Lbl: 'Активных вакансий',
      stat2Val: '10K+',
      stat2Lbl: 'Соискателей ежемесячно',
      stat3Val: '100%',
      stat3Lbl: 'Проверенных объявлений'
    },
    fa: {
      title: 'درباره ما - کاریابی در استانبول',
      heading: 'درباره ما',
      subtitle: 'پلتفرم پیشرو کار و راه‌حل‌های هوشمند استخدام در استانبول بزرگ',
      missionTitle: 'ماموریت و اهداف ما',
      missionText: 'ما مشتاقانه برای پر کردن شکاف بین کارجویان برجسته فارسی‌زبان و بین‌المللی با کارفرمایان مطرح در استانبول تلاش می‌کنیم. هدف ما این است که جستجو و تطبیق شغلی را از طریق فناوری‌های مدرن و ادغام هوش مصنوعی، آسان، در دسترس و ۱۰۰٪ تایید شده کنیم.',
      featureTitle: 'چرا پلتفرم ما را انتخاب کنید؟',
      feat1Title: 'ابزارهای هوش مصنوعی 🤖',
      feat1Desc: 'رزومه خود را بهینه‌سازی کنید، انگیزه‌نامه‌های حرفه‌ای بنویسید و با شبیه‌ساز مصاحبه هوش مصنوعی ما تمرین کنید.',
      feat2Title: 'انتشار فوری آگهی استخدام ⚡',
      feat2Desc: 'به شرکت‌ها و اشخاص اجازه می‌دهیم آگهی‌های شغلی خود را فورا ثبت و منتشر کنند تا به هزاران نامزد برسند.',
      feat3Title: 'شفافیت و اعتماد 🤝',
      feat3Desc: 'ما آگهی‌های شغلی را بررسی می‌کنیم، از شفافیت حقوق و دستمزد حمایت می‌کنیم و تجربه استخدام مطمئنی را تضمین می‌کنیم.',
      statsTitle: 'آمار و ارقام ما',
      stat1Val: '+۵۰۰',
      stat1Lbl: 'موقعیت شغلی فعال',
      stat2Val: '+۱۰ هزار',
      stat2Lbl: 'کارجوی ماهانه',
      stat3Val: '100%',
      stat3Lbl: 'آگهی‌های تایید شده'
    },
    ur: {
      title: 'ہمارے بارے میں - استنبول میں ملازمتیں',
      heading: 'ہمارے بارے میں',
      subtitle: 'استنبول میں ملازمت تلاش کرنے اور بھرتی کے اسمارٹ حل کا سب سے بڑا پلیٹ فارم',
      missionTitle: 'ہمارا مشن اور مقصد',
      missionText: 'ہم استنبول میں بین الاقوامی اور اردو بولنے والے ہنرمندوں اور بہترین کمپنیوں کے درمیان فرق کو ختم کرنے کے لیے کوشاں ہیں۔ ہمارا مقصد جدید ٹیکنالوجی اور مصنوعی ذہانت (AI) کے ذریعے ملازمت کی تلاش اور بھرتی کے عمل کو آسان اور قابلِ اعتماد بنانا ہے۔',
      featureTitle: 'ہمارا پلیٹ فارم کیوں منتخب کریں؟',
      feat1Title: 'اے آئی ٹولز 🤖',
      feat1Desc: 'اپنے سی وی کو اپٹیمائز کریں، اے آئی کے ذریعے پروفیشنل کور لیٹر لکھیں اور انٹرویو کی مشق کریں۔',
      feat2Title: 'فوری اشاعت ⚡',
      feat2Desc: 'کاروباری اداروں کو اپنی اسامیاں سیکنڈوں میں پوسٹ کرنے اور ہزاروں امیدواروں تک پہنچنے کی سہولت فراہم کرتے ہیں۔',
      feat3Title: 'شفافیت اور اعتماد 🤝',
      feat3Desc: 'ہم اشتہارات کی تصدیق کرتے ہیں، تنخواہ کی شفافیت کی وکالت کرتے ہیں اور ایک محفوظ ماحول فراہم کرتے ہیں۔',
      statsTitle: 'ہمارے اچیومنٹس',
      stat1Val: '+۵۰۰',
      stat1Lbl: 'فعال ملازمتیں',
      stat2Val: '+۱۰ ہزار',
      stat2Lbl: 'ماہانہ کارجو',
      stat3Val: '100%',
      stat3Lbl: 'تصدیق شدہ اشتہارات'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 900px; padding: 60px 20px;">
      <div class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: center; margin-bottom: 40px;">
        <h1 class="hero-title-gradient" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 12px;">${t.heading}</h1>
        <p style="color: var(--text-muted); font-size: 1.15rem; max-width: 700px; margin: 0 auto 30px;">${t.subtitle}</p>
        
        <div style="text-align: ${locale === 'ar' ? 'right' : 'left'}; border-top: 1px solid var(--border); padding-top: 30px; margin-top: 30px;">
          <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px;">🎯 ${t.missionTitle}</h2>
          <p style="color: var(--text-body); line-height: 1.7; font-size: 1.05rem;">${t.missionText}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 40px;">
        <div class="glass-card" style="padding: 24px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 2.2rem; font-weight: 900; color: var(--primary); margin-bottom: 6px;">${t.stat1Val}</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-muted);">${t.stat1Lbl}</div>
        </div>
        <div class="glass-card" style="padding: 24px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent); margin-bottom: 6px;">${t.stat2Val}</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-muted);">${t.stat2Lbl}</div>
        </div>
        <div class="glass-card" style="padding: 24px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 2.2rem; font-weight: 900; color: #10b981; margin-bottom: 6px;">${t.stat3Val}</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-muted);">${t.stat3Lbl}</div>
        </div>
      </div>

      <!-- Features -->
      <div class="glass-card" style="padding: 40px; border-radius: var(--radius-lg);">
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-dark); margin-bottom: 24px; text-align: center;">${t.featureTitle}</h2>
        <div style="display: flex; flex-direction: column; gap: 24px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
          <div style="border-bottom: 1px solid var(--border); padding-bottom: 20px;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-bottom: 8px;">${t.feat1Title}</h3>
            <p style="color: var(--text-body); line-height: 1.6; margin: 0;">${t.feat1Desc}</p>
          </div>
          <div style="border-bottom: 1px solid var(--border); padding-bottom: 20px;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--accent); margin-bottom: 8px;">${t.feat2Title}</h3>
            <p style="color: var(--text-body); line-height: 1.6; margin: 0;">${t.feat2Desc}</p>
          </div>
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #10b981; margin-bottom: 8px;">${t.feat3Title}</h3>
            <p style="color: var(--text-body); line-height: 1.6; margin: 0;">${t.feat3Desc}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// Contact Us Page
publicRouter.get('/:locale/contact', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/contact');

  const t = {
    ar: {
      title: 'اتصل بنا - إسطنبول للوظائف',
      heading: 'اتصل بنا',
      subtitle: 'نحن هنا للإجابة على استفساراتكم ومساعدتكم. تواصلوا معنا عبر القنوات المتاحة.',
      formTitle: 'أرسل لنا رسالة مباشرة',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      subject: 'الموضوع',
      message: 'نص الرسالة',
      sendBtn: 'إرسال الرسالة ✉️',
      successMsg: 'تم إرسال رسالتك بنجاح! سنتواصل معك في أقرب وقت ممكن.',
      cardEmail: 'البريد الإلكتروني',
      cardPhone: 'واتساب والدعم المباشر',
      cardLoc: 'العنوان والمقر'
    },
    en: {
      title: 'Contact Us - Istanbul Jobs',
      heading: 'Contact Us',
      subtitle: 'We are here to answer your questions and help you. Get in touch with us through our active channels.',
      formTitle: 'Send Us a Message',
      name: 'Full Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Message Content',
      sendBtn: 'Send Message ✉️',
      successMsg: 'Your message has been sent successfully! We will get back to you shortly.',
      cardEmail: 'Email Us',
      cardPhone: 'WhatsApp & Support',
      cardLoc: 'Office Address'
    },
    tr: {
      title: 'İletişim - İstanbul İş İlanları',
      heading: 'İletişim',
      subtitle: 'Sorularınızı yanıtlamak ve size yardımcı olmak için buradayız. Bizimle aktif kanallarımız üzerinden iletişime geçin.',
      formTitle: 'Bize Doğrudan Mesaj Gönderin',
      name: 'Ad Soyad',
      email: 'E-posta Adresi',
      subject: 'Konu',
      message: 'Mesaj İçeriği',
      sendBtn: 'Mesajı Gönder ✉️',
      successMsg: 'Mesajınız başarıyla gönderildi! En kısa sürede sizinle iletişime geçeceğiz.',
      cardEmail: 'E-posta Gönderin',
      cardPhone: 'WhatsApp & Destek',
      cardLoc: 'Ofis Adresi'
    },
    ru: {
      title: 'Контакты - Работа в Стамбуле',
      heading: 'Контакты',
      subtitle: 'Мы здесь, чтобы ответить на ваши вопросы и помочь вам. Свяжитесь с нами через наши каналы.',
      formTitle: 'Отправьте нам сообщение',
      name: 'Полное имя',
      email: 'Электронная почта',
      subject: 'Тема письма',
      message: 'Содержание сообщения',
      sendBtn: 'Отправить ✉️',
      successMsg: 'Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.',
      cardEmail: 'Электронная почта',
      cardPhone: 'WhatsApp и Поддержка',
      cardLoc: 'Адрес офиса'
    },
    fa: {
      title: 'تماس با ما - کاریابی در استانبول',
      heading: 'تماس با ما',
      subtitle: 'ما اینجاییم تا به سوالات شما پاسخ دهیم و به شما کمک کنیم. از طریق کانال‌های ارتباطی با ما در تماس باشید.',
      formTitle: 'برای ما پیام ارسال کنید',
      name: 'نام و نام خانوادگی',
      email: 'آدرس ایمیل',
      subject: 'موضوع پیام',
      message: 'متن پیام شما',
      sendBtn: 'ارسال پیام ✉️',
      successMsg: 'پیام شما با موفقیت ارسال شد! در اسرع وقت با شما تماس خواهیم گرفت.',
      cardEmail: 'پشتیبانی ایمیلی',
      cardPhone: 'واتساپ و تلگرام',
      cardLoc: 'نشانی دفتر مرکزی'
    },
    ur: {
      title: 'ہم سے رابطہ کریں - استنبول میں ملازمتیں',
      heading: 'ہم سے رابطہ کریں',
      subtitle: 'ہم آپ کی مدد کے لیے ہمیشہ تیار ہیں۔ کسی بھی سوال یا رہنمائی کے لیے ہم سے رابطہ کریں۔',
      formTitle: 'ہمیں پیغام بھیجیں',
      name: 'پورا نام',
      email: 'ای میل ایڈریس',
      subject: 'پیغام کا عنوان',
      message: 'پیغام کا متن',
      sendBtn: 'پیغام بھیجیں ✉️',
      successMsg: 'آپ کا پیغام کامیابی سے موصول ہو گیا ہے! ہم جلد ہی آپ سے رابطہ کریں گے۔',
      cardEmail: 'ای میل سپورٹ',
      cardPhone: 'واٹس ایپ اور ٹیلی گرام',
      cardLoc: 'مرکزی دفتر کا پتہ'
    }
  }[locale];

  const html = `
    <style>
      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 30px;
        align-items: start;
      }
      .contact-card-box {
        padding: 24px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 16px;
        text-align: ${locale === 'ar' ? 'right' : 'left'};
      }
      .contact-form-box {
        padding: 40px;
        border-radius: var(--radius-lg);
      }
      @media (max-width: 768px) {
        .contact-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .contact-card-box {
          padding: 16px;
        }
        .contact-form-box {
          padding: 24px 16px;
        }
      }
    </style>

    <div class="container" style="max-width: 1000px; padding: 60px 20px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.heading}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>

      <div class="contact-grid">
        <!-- Contact Cards -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-card contact-card-box">
            <div style="width: 46px; height: 46px; border-radius: var(--r-full); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;"><i class="fa-solid fa-envelope"></i></div>
            <div>
              <div style="font-weight: 800; color: var(--text-dark); margin-bottom: 2px;">${t.cardEmail}</div>
              <a href="mailto:info@jobs-in-istanbul.com" style="color: var(--primary); font-weight: 600; font-size: 0.92rem;">info@jobs-in-istanbul.com</a>
            </div>
          </div>
          <div class="glass-card contact-card-box">
            <div style="width: 46px; height: 46px; border-radius: var(--r-full); background: #f0fdf4; color: #166534; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0;"><i class="fa-brands fa-whatsapp"></i></div>
            <div>
              <div style="font-weight: 800; color: var(--text-dark); margin-bottom: 2px;">${t.cardPhone}</div>
              <span style="color: #166534; font-weight: 600; font-size: 0.92rem; direction: ltr; display: inline-block;">+90 555 555 55 55</span>
            </div>
          </div>
          <div class="glass-card contact-card-box">
            <div style="width: 46px; height: 46px; border-radius: var(--r-full); background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;"><i class="fa-solid fa-location-dot"></i></div>
            <div>
              <div style="font-weight: 800; color: var(--text-dark); margin-bottom: 2px;">${t.cardLoc}</div>
              <span style="color: var(--text-muted); font-size: 0.9rem;">Şişli, Istanbul, Turkey</span>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="glass-card contact-form-box">
          <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-dark); margin-bottom: 24px; text-align: ${locale === 'ar' ? 'right' : 'left'};">${t.formTitle}</h2>
          
          <form id="contact-form" onsubmit="handleContactSubmit(event)">
            <div style="margin-bottom: 16px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${t.name}</label>
              <input type="text" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); outline: none;">
            </div>
            <div style="margin-bottom: 16px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${t.email}</label>
              <input type="email" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); outline: none;">
            </div>
            <div style="margin-bottom: 16px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${t.subject}</label>
              <input type="text" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); outline: none;">
            </div>
            <div style="margin-bottom: 24px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${t.message}</label>
              <textarea required rows="5" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); outline: none; resize: vertical;"></textarea>
            </div>
            <button type="submit" class="btn-sidebar-apply" style="border: none; cursor: pointer; width: 100%;">${t.sendBtn}</button>
          </form>

          <div id="contact-success" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: var(--radius-md); color: #166534; font-weight: 600; text-align: center; margin-top: 20px;">
            <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
            ${t.successMsg}
          </div>
        </div>
      </div>
    </div>

    <script>
      function handleContactSubmit(e) {
        e.preventDefault();
        document.getElementById('contact-form').style.display = 'none';
        document.getElementById('contact-success').style.display = 'block';
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// Privacy Policy Page
publicRouter.get('/:locale/privacy', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/privacy');

  const t = {
    ar: {
      title: 'سياسة الخصوصية - إسطنبول للوظائف',
      heading: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: يونيو ٢٠٢٦',
      intro: 'نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيف نقوم بجمع معلوماتك واستخدامها وحمايتها عند زيارتك لمنصتنا.',
      sec1Title: '١. المعلومات التي نجمعها',
      sec1Text: 'نقوم بجمع البيانات الشخصية التي تقدمها لنا طواعية (مثل الاسم، البريد الإلكتروني، السيرة الذاتية، ورسالة التغطية عند التقدم لوظيفة أو نشر وظيفة). كما نجمع بعض البيانات التقنية تلقائياً مثل عنوان IP والملفات المؤقتة (Cookies).',
      sec2Title: '٢. كيف نستخدم معلوماتك',
      sec2Text: 'نستخدم معلوماتك لتشغيل وتسهيل خدمات التوظيف على الموقع، وللتواصل معك بخصوص طلباتك، ولتحسين أدوات الذكاء الاصطناعي، وضمان أمن المنصة ومكافحة الانتهاكات.',
      sec3Title: '٣. حماية البيانات (KVKK / GDPR)',
      sec3Text: 'نتخذ التدابير الفنية والإدارية المناسبة لحماية بياناتك الشخصية وفقاً لقانون حماية البيانات الشخصية التركي (KVKK) والقانون العام لحماية البيانات الأوروبي (GDPR). لا نبيع بياناتك لأطراف ثالثة أبداً.',
      sec4Title: '٤. حقوق المستخدمين',
      sec4Text: 'لديك الحق الكامل في طلب مراجعة بياناتك، تعديلها، أو حذفها نهائياً من أنظمتنا في أي وقت عبر مراسلتنا بالبريد الإلكتروني.'
    },
    en: {
      title: 'Privacy Policy - Istanbul Jobs',
      heading: 'Privacy Policy',
      lastUpdated: 'Last Updated: June 2026',
      intro: 'We are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, and protect your information when you visit our platform.',
      sec1Title: '1. Information We Collect',
      sec1Text: 'We collect personal information you voluntarily provide (e.g., name, email address, CV/resume, and cover letter when submitting applications or posting jobs). We also collect automated technical data such as IP address and cookie data.',
      sec2Title: '2. How We Use Your Information',
      sec2Text: 'We use your information to operate and facilitate recruitment services, communicate with you regarding your applications, optimize our AI-powered features, and ensure platform security.',
      sec3Title: '3. Data Security (KVKK / GDPR)',
      sec3Text: 'We implement strong technical and organizational measures to safeguard your personal data in compliance with Turkish Data Protection Law (KVKK) and EU General Data Protection Regulation (GDPR). We never sell your data.',
      sec4Title: '4. Your Data Rights',
      sec4Text: 'You have the right to access, edit, update, or request permanent deletion of your personal data from our systems at any time by contacting our data support team.'
    },
    tr: {
      title: 'Gizlilik Politikası - İstanbul İş İlanları',
      heading: 'Gizlilik Politikası',
      lastUpdated: 'Son Güncelleme: Haziran 2026',
      intro: 'Gizliliğinizi ve kişisel verilerinizi korumayı taahhüt ediyoruz. Bu Gizlilik Politikası, platformumuzu ziyaret ettiğinizde bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.',
      sec1Title: '1. Topladığımız Bilgiler',
      sec1Text: 'Gönüllü olarak sağladığınız kişisel bilgileri toplarız (örn. iş başvurusu yaparken veya iş ilanı yayınlarken ad, e-posta adresi, CV/özgeçmiş ve ön yazı). Ayrıca IP adresi ve çerez verileri gibi otomatik teknik verileri de toplarız.',
      sec2Title: '2. Bilgilerinizi Nasıl Kullanıyoruz',
      sec2Text: 'Bilgilerinizi işe alım hizmetlerini yürütmek ve kolaylaştırmak, başvurularınızla ilgili sizinle iletişim kurmak, yapay zeka destekli özelliklerimizi optimize etmek ve platform güvenliğini sağlamak amacıyla kullanırız.',
      sec3Title: '3. Veri Güvenliği (KVKK / GDPR)',
      sec3Text: 'Kişisel verilerinizi KVKK ve AB Genel Veri Koruma Yönetmeliği (GDPR) ile uyumlu olarak korumak için güçlü teknik ve idari tedbirler uyguluyoruz. Verilerinizi asla satmayız.',
      sec4Title: '4. Veri Haklarınız',
      sec4Text: 'Veri destek ekibimizle iletişime geçerek kişisel verilerinize erişme, bunları düzeltme, güncelleme veya sistemlerimizden kalıcı olarak silinmesini talep etme hakkına her zaman sahipsiniz.'
    },
    ru: {
      title: 'Политика конфиденциальности - Работа в Стамбуле',
      heading: 'Политика конфиденциальности',
      lastUpdated: 'Последнее обновление: июнь 2026',
      intro: 'Мы стремимся защищать вашу конфиденциальность и персональные данные. Эта политика объясняет, как мы собираем, используем и защищаем вашу информацию.',
      sec1Title: '1. Сбор информации',
      sec1Text: 'Мы собираем личную информацию, которую вы предоставляете добровольно (например, имя, адрес электронной почты, резюме и сопроводительное письмо при подаче заявок). Мы также автоматически собираем технические данные, такие как IP-адрес и файлы куки.',
      sec2Title: '2. Использование информации',
      sec2Text: 'Мы используем вашу информацию для обеспечения работы служб по трудоустройству, связи с вами, оптимизации наших функций ИИ и обеспечения безопасности платформы.',
      sec3Title: '3. Безопасность данных (KVKK / GDPR)',
      sec3Text: 'Мы применяем технические и организационные меры для защиты персональных данных в соответствии с турецким законом (KVKK) и регламентом ЕС (GDPR). Мы никогда не продаем ваши данные.',
      sec4Title: '4. Ваши права на данные',
      sec4Text: 'Вы имеете право просматривать, изменять, обновлять или запрашивать удаление ваших данных из нашей системы в любое время.'
    },
    fa: {
      title: 'حریم خصوصی - کاریابی در استانبول',
      heading: 'سیاست حفظ حریم خصوصی',
      lastUpdated: 'آخرین به‌روزرسانی: ژوئن ۲۰۲۶',
      intro: 'ما متعهد به محافظت از حریم خصوصی و داده‌های شخصی شما هستیم. این سند توضیح می‌دهد که چگونه اطلاعات شما را جمع‌آوری، استفاده و محافظت می‌کنیم.',
      sec1Title: '۱. جمع‌آوری اطلاعات',
      sec1Text: 'ما اطلاعات شخصی که داوطلبانه ارائه می‌دهید (مانند نام، ایمیل، شماره تماس، رزومه و انگیزه‌نامه هنگام ارسال درخواست) را جمع‌آوری می‌کنیم. همچنین داده‌های فنی مانند آدرس IP و کوکی‌ها را برای بهبود کارکرد سایت جمع‌آوری می‌کنیم.',
      sec2Title: '۲. نحوه استفاده از اطلاعات',
      sec2Text: 'ما از اطلاعات شما برای ارائه خدمات کاریابی، برقراری ارتباط، بهینه‌سازی ویژگی‌های هوش مصنوعی و حفظ امنیت پلتفرم استفاده می‌کنیم.',
      sec3Title: '۳. امنیت داده‌ها (KVKK / GDPR)',
      sec3Text: 'ما اقدامات فنی و اداری قوی را برای محافظت از داده‌های شخصی شما مطابق با قانون حفاظت از داده‌های شخصی ترکیه (KVKK) و مقررات عمومی حفاظت از داده‌های اتحادیه اروپا (GDPR) اعمال می‌کنیم. ما هرگز داده‌های شما را نمی‌فروشیم.',
      sec4Title: '۴. حقوق شما بر داده‌ها',
      sec4Text: 'شما در هر زمان حق دسترسی، اصلاح، به‌روزرسانی یا درخواست حذف دائمی داده‌های شخصی خود را از سیستم‌های ما با تماس با تیم پشتیبانی دارید.'
    },
    ur: {
      title: 'رازداری کی پالیسی - استنبول میں ملازمتیں',
      heading: 'رازداری کی پالیسی',
      lastUpdated: 'آخری اپ ڈیٹ: جون ۲۰۲۶',
      intro: 'ہم آپ کے ذاتی ڈیٹا کی حفاظت کے لیے پرعزم ہیں۔ یہ دستاویز واضح کرتی ہے کہ ہم آپ کی معلومات کیسے جمع، استعمال اور محفوظ کرتے ہیں۔',
      sec1Title: '۱. معلومات کا جمع کرنا',
      sec1Text: 'ہم وہ ذاتی معلومات جمع کرتے ہیں جو آپ خود فراہم کرتے ہیں (جیسے نام، ای میل، فون، سی وی اور کور لیٹر)۔ اس کے علاوہ سائٹ کے استعمال کو بہتر بنانے کے لیے آئی پی ایڈریس اور کوکیز کا استعمال بھی کیا جاتا ہے۔',
      sec2Title: '۲. معلومات کا استعمال',
      sec2Text: 'ہم آپ کی معلومات کو ملازمت کی خدمات فراہم کرنے، رابطہ کرنے، اے آئی ٹولز کو بہتر بنانے اور پلیٹ فارم کی سیکیورٹی برقرار رکھنے کے لیے استعمال کرتے ہیں۔',
      sec3Title: '۳. ڈیٹا کی حفاظت (KVKK / GDPR)',
      sec3Text: 'ہم ترکی کے ڈیٹا پروٹیکشن قانون (KVKK) اور یورپی یونین کے قانون (GDPR) کے مطابق سخت سیکیورٹی اقدامات نافذ کرتے ہیں۔ ہم آپ کا ڈیٹا کسی تیسرے فریق کو فروخت نہیں کرتے۔',
      sec4Title: '۴. آپ کے حقوق',
      sec4Text: 'آپ کو کسی بھی وقت اپنے ذاتی ڈیٹا تک رسائی، اس میں ترمیم، اپ ڈیٹ یا اسے ہمارے سسٹمز سے مستقل طور پر حذف کروانے کا پورا حق حاصل ہے۔'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 800px; padding: 60px 20px;">
      <div class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: ${locale === 'ar' ? 'right' : 'left'};">
        <h1 class="hero-title-gradient" style="font-size: 2.3rem; font-weight: 800; margin-bottom: 8px; text-align: center;">${t.heading}</h1>
        <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-bottom: 30px;">${t.lastUpdated}</div>
        
        <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-dark); margin-bottom: 30px; font-weight: 500;">${t.intro}</p>

        <div style="display: flex; flex-direction: column; gap: 28px;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec1Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec1Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec2Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec2Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec3Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec3Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec4Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec4Text}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// Terms & Conditions Page
publicRouter.get('/:locale/terms', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/terms');

  const t = {
    ar: {
      title: 'الشروط والأحكام - إسطنبول للوظائف',
      heading: 'الشروط والأحكام',
      lastUpdated: 'آخر تحديث: يونيو ٢٠٢٦',
      intro: 'يرجى قراءة شروط الخدمة هذه بعناية قبل استخدام منصتنا. استخدامك للموقع يعني موافقتك الكاملة على هذه الشروط والأحكام.',
      sec1Title: '١. شروط الاستخدام وقبول الخدمة',
      sec1Text: 'تُقدم المنصة خدمات إعلانات التوظيف وتسهيل التواصل بين الباحثين عن عمل والشركات. يجب أن يكون استخدامك متوافقاً مع الآداب العامة والقوانين التركية المعمول بها.',
      sec2Title: '٢. سياسة نشر إعلانات الوظائف',
      sec2Text: 'يتحمل معلنو الوظائف المسؤولية الكاملة عن صحة ودقة البيانات وتفاصيل الوظيفة المنشورة. يُمنع منعاً باتاً نشر إعلانات وظيفية وهمية، احتيالية، مضللة، أو تطلب مبالغ مالية مقابل التقديم.',
      sec3Title: '٣. إخلاء المسؤولية',
      sec3Text: 'منصتنا هي وسيط توظيف وإعلانات فقط. لا نتدخل في اتفاقيات العمل ولا نضمن الحصول على وظائف أو مرشحين، ولا نتحمل أي مسؤولية عن أي نزاعات تنشأ بين أصحاب الأعمال والموظفين.',
      sec4Title: '٤. تعديل الشروط',
      sec4Text: 'نحتفظ بالحق في تحديث أو تعديل هذه الشروط في أي وقت لتناسب التغيرات القانونية أو الفنية. تُصبح التعديلات سارية بمجرد نشرها على هذه الصفحة.'
    },
    en: {
      title: 'Terms & Conditions - Istanbul Jobs',
      heading: 'Terms & Conditions',
      lastUpdated: 'Last Updated: June 2026',
      intro: 'Please read these Terms of Service carefully before using our platform. By accessing or using the site, you agree to be bound by these terms.',
      sec1Title: '1. Acceptance of Terms',
      sec1Text: 'Our platform provides recruitment advertising and career tools. Your usage must comply with moral guidelines, international standards, and applicable Turkish laws.',
      sec2Title: '2. Job Posting Policy',
      sec2Text: 'Employers and individuals posting jobs assume full responsibility for the accuracy and legality of the listing details. Spam, fraud, illegal vacancies, or listings asking candidates for payment are strictly prohibited.',
      sec3Title: '3. Disclaimer of Liability',
      sec3Text: 'We act as an advertising venue only. We do not participate in employment agreements or guarantee hiring outcomes, and we are not liable for any disputes arising between employers and candidates.',
      sec4Title: '4. Modifications of Terms',
      sec4Text: 'We reserve the right to modify these terms and conditions at any time. Updates become effective immediately upon posting on this page.'
    },
    tr: {
      title: 'Kullanım Şartları - İstanbul İş İlanları',
      heading: 'Kullanım Şartları',
      lastUpdated: 'Son Güncelleme: Haziran 2026',
      intro: 'Lütfen platformumuzu kullanmadan önce bu kullanım şartlarını dikkatlice okuyunuz. Siteye erişerek veya siteyi kullanarak bu şartlara bağlı kalmayı kabul etmiş olursunuz.',
      sec1Title: '1. Şartların Kabulü',
      sec1Text: 'Platformumuz iş ilanları yayınlama ve kariyer araçları sunar. Kullanımınız genel ahlak kurallarına, uluslararası standartlara ve yürürlükteki Türk kanunlarına uygun olmalıdır.',
      sec2Title: '2. Job Posting Politikası',
      sec2Text: 'İş ilanı yayınlayan işverenler ve bireyler, ilan detaylarının doğruluğu ve yasallığı konusunda tüm sorumluluğu üstlenirler. Spam, dolandırıcılık, yasa dışı açık pozisyonlar veya adaylardan ödeme talep eden ilanlar kesinlikle yasaktır.',
      sec3Title: '3. Sorumluluk Reddi Beyanı',
      sec3Text: 'Yalnızca bir ilan mecrası olarak faaliyet gösteriyoruz. İş sözleşmelerine dahil olmuyoruz, işe alım sonuçlarını garanti etmiyoruz ve işverenler ile adaylar arasında ortaya çıkabilecek anlaşmazlıklardan sorumlu tutulamayız.',
      sec4Title: '4. Şartların Değiştirilmesi',
      sec4Text: 'Bu şart ve koşulları dilediğimiz zaman değiştirme hakkını saklı tutarız. Güncellemeler bu sayfada yayınlandığı andan itibaren geçerli olur.'
    },
    ru: {
      title: 'Условия использования - Работа в Стамбуле',
      heading: 'Условия использования',
      lastUpdated: 'Последнее обновление: июнь 2026',
      intro: 'Пожалуйста, внимательно ознакомьтесь с настоящими Условиями использования перед использованием нашей платформы. Использование сайта означает согласие с этими условиями.',
      sec1Title: '1. Принятие Условий',
      sec1Text: 'Наша платформа предоставляет рекламные услуги по трудоустройству и инструменты карьеры. Использование должно соответствовать моральным принципам и законодательству Турции.',
      sec2Title: '2. Правила публикации вакансий',
      sec2Text: 'Работодатели несут полную ответственность за точность вакансий. Спам, мошенничество, нелегальные объявления или требование платы с кандидатов строго запрещены.',
      sec3Title: '3. Отказ от ответственности',
      sec3Text: 'Мы выступаем только как площадка объявлений. Мы не участвуем в трудовых договорах и не гарантируем результаты найма, а также не несем ответственности за споры.',
      sec4Title: '4. Изменение Условий',
      sec4Text: 'Мы сохраняем право обновлять эти условия в любое время. Изменения вступают в силу с момента публикации на этой странице.'
    },
    fa: {
      title: 'شرایط استفاده - کاریابی در استانبول',
      heading: 'شرایط استفاده از خدمات',
      lastUpdated: 'آخرین به‌روزرسانی: ژوئن ۲۰۲۶',
      intro: 'لطفاً شرایط استفاده از خدمات را قبل از استفاده از پلتفرم ما به دقت مطالعه کنید. استفاده از سایت به معنای موافقت و پذیرش کامل این شرایط است.',
      sec1Title: '۱. پذیرش شرایط',
      sec1Text: 'پلتفرم ما خدمات ثبت آگهی‌های شغلی و ابزارهای توسعه شغلی ارائه می‌دهد. استفاده شما باید مطابق با قوانین جمهوری ترکیه و هنجارهای اخلاقی عمومی باشد.',
      sec2Title: '۲. قوانین ثبت آگهی استخدام',
      sec2Text: 'کارفرمایانی که آگهی استخدام ثبت می‌کنند مسئولیت کامل صحت و قانونی بودن اطلاعات آن را بر عهده دارند. ثبت آگهی‌های فریب‌کارانه، نامربوط یا درخواست وجه از کارجویان اکیداً ممنوع است.',
      sec3Title: '۳. سلب مسئولیت',
      sec3Text: 'ما صرفاً به عنوان یک بستر انتشار آگهی فعالیت می‌کنیم. ما در قراردادهای کاری بین کارفرما و کارجو دخالتی نداریم و هیچ نتیجه استخدامی را تضمین نمی‌کنیم.',
      sec4Title: '۴. تغییر شرایط',
      sec4Text: 'ما حق به‌روزرسانی و تغییر این شرایط را در هر زمان برای خود محفوظ می‌داریم. تغییرات بلافاصله پس از انتشار در این صفحه اعمال خواهند شد.'
    },
    ur: {
      title: 'شرائط و ضوابط - استنبول میں ملازمتیں',
      heading: 'شرائط و ضوابط',
      lastUpdated: 'آخری اپ ڈیٹ: جون ۲۰۲۶',
      intro: 'براہ کرم ہمارے پلیٹ فارم کو استعمال کرنے سے پہلے ان شرائط کو دھیان سے پڑھ لیں۔ سائٹ کا استعمال ان شرائط کی مکمل قبولیت کی علامت ہے۔',
      sec1Title: '۱. شرائط کا نفاذ',
      sec1Text: 'ہمارا پلیٹ فارم ملازمت کے اشتہارات اور کیریئر ٹولز فراہم کرتا ہے۔ آپ کا سائٹ کا استعمال ترکی کے قوانین اور اخلاقی حدود کے مطابق ہونا چاہیے۔',
      sec2Title: '۲. ملازمت پوسٹ کرنے کے قوانین',
      sec2Text: 'نوکری کا اشتہار دینے والے مالکان معلومات کی سچائی اور قانونی حیثیت کے ذمہ دار ہیں۔ جعلی اشتہارات یا امیدواروں سے پیسے مانگنا سخت ممنوع ہے۔',
      sec3Title: '۳. ذمہ داری کی حد',
      sec3Text: 'ہم صرف ایک اشتہاری پلیٹ فارم ہیں۔ ہم کمپنی اور ملازم کے درمیان کسی بھی معاہدے یا تنازع کے ذمہ دار نہیں ہیں اور نہ ہی ملازمت کی ضمانت دیتے ہیں۔',
      sec4Title: '۴. شرائط میں تبدیلی',
      sec4Text: 'ہم کسی بھی وقت ان شرائط کو تبدیل یا اپ ڈیٹ کرنے کا حق محفوظ رکھتے ہیں۔ تبدیلیاں اس صفحے پر پوسٹ ہوتے ہی لاگو ہوں گی۔'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 800px; padding: 60px 20px;">
      <div class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: ${locale === 'ar' ? 'right' : 'left'};">
        <h1 class="hero-title-gradient" style="font-size: 2.3rem; font-weight: 800; margin-bottom: 8px; text-align: center;">${t.heading}</h1>
        <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-bottom: 30px;">${t.lastUpdated}</div>
        
        <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-dark); margin-bottom: 30px; font-weight: 500;">${t.intro}</p>

        <div style="display: flex; flex-direction: column; gap: 28px;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec1Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec1Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec2Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec2Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec3Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec3Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec4Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec4Text}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// PWA Install Landing Page
publicRouter.get('/:locale/install', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/install');

  const isRtl = locale === 'ar';

  const t = {
    ar: {
      title: 'تحميل وتثبيت تطبيق فرص عمل في إسطنبول على الهاتف',
      description: 'دليل بسيط لتثبيت تطبيق فرص عمل في إسطنبول (PWA) على الأندرويد والآيفون لتصفح الوظائف بلمسة واحدة.',
      keywords: 'تثبيت تطبيق وظائف إسطنبول, تنزيل تطبيق فرص عمل في تركيا, تطبيق PWA إسطنبول, تطبيق التوظيف في تركيا',
      heading: 'تثبيت تطبيق فرص عمل في إسطنبول',
      subheading: 'تصفّح وتقدّم لأفضل الوظائف الشاغرة في إسطنبول مباشرةً من شاشتك الرئيسية!',
      featuresTitle: 'مميزات التطبيق المحمول',
      feature1: 'دخول سريع بلمسة واحدة من شاشتك دون كتابة الرابط',
      feature2: 'خفيف جداً (أقل من 1 ميجابايت) ولا يستهلك مساحة أو بطارية',
      feature3: 'يعمل بسلاسة وسرعة فائقة حتى مع اتصالات الإنترنت الضعيفة',
      feature4: 'تصفح فوري وتحديثات لحظية لكل الوظائف الشاغرة',
      iosTitle: '📱 أجهزة الآيفون (iOS)',
      iosStep1: 'افتح متصفح <strong>Safari</strong> وانتقل إلى الموقع.',
      iosStep2: 'اضغط على زر <strong>مشاركة (Share)</strong> (أيقونة المربع مع السهم للأعلى بالأسفل).',
      iosStep3: 'مرر لأسفل القائمة واضغط على خيار <strong>"إضافة إلى الصفحة الرئيسية"</strong> (Add to Home Screen).',
      androidTitle: '🤖 أجهزة الأندرويد (Android)',
      androidStep1: 'افتح متصفح <strong>Chrome</strong> وانتقل إلى الموقع.',
      androidStep2: 'ستظهر لك نافذة منبثقة تقترح عليك التثبيت، اضغط على <strong>"تثبيت التطبيق"</strong> (Install).',
      androidStep3: 'أو اضغط على النقاط الثلاث في أعلى المتصفح واختر <strong>"تثبيت التطبيق"</strong>.',
      btnText: 'الذهاب للرئيسية وتثبيت التطبيق'
    },
    en: {
      title: 'Install Jobs in Istanbul App on Your Mobile',
      description: 'Easy guide to install Jobs in Istanbul app (PWA) on Android & iOS to browse job vacancies in one tap.',
      keywords: 'install istanbul jobs app, download turkey jobs app, jobs in istanbul pwa, turkey recruitment mobile app',
      heading: 'Install Jobs in Istanbul App',
      subheading: 'Browse and apply for the best jobs in Istanbul directly from your home screen!',
      featuresTitle: 'App Key Features',
      feature1: 'Instant one-tap access from your home screen without typing the URL',
      feature2: 'Extremely lightweight (less than 1MB), no storage or battery drain',
      feature3: 'Works smoothly and loads fast even on slow mobile networks',
      feature4: 'Fast navigation and real-time updates of new jobs',
      iosTitle: '📱 iPhone & iPad (iOS)',
      iosStep1: 'Open <strong>Safari</strong> and navigate to jobs-in-istanbul.com.',
      iosStep2: 'Tap the <strong>Share</strong> button (the square icon with an upward arrow at the bottom).',
      iosStep3: 'Scroll down and tap <strong>"Add to Home Screen"</strong>.',
      androidTitle: '🤖 Android Phones',
      androidStep1: 'Open <strong>Chrome</strong> and navigate to jobs-in-istanbul.com.',
      androidStep2: 'Tap the <strong>"Install App"</strong> prompt that appears at the bottom.',
      androidStep3: 'Or tap the three dots in the top-right and select <strong>"Install App"</strong>.',
      btnText: 'Go to Homepage & Install'
    },
    tr: {
      title: 'İstanbul İş İlanları Mobil Uygulamasını Telefonunuza Yükleyin',
      description: 'İstanbul İş İlanları uygulamasını (PWA) Android ve iOS cihazlarınıza yüklemek için kolay rehber. Tek tıkla iş ilanlarına ulaşın.',
      keywords: 'istanbul iş ilanları uygulaması yükle, türkiye iş ilanları mobil indir, istanbul pwa uygulaması, iş ilanları uygulaması',
      heading: 'İstanbul İş İlanları Uygulamasını Yükleyin',
      subheading: "İstanbul'daki en iyi iş ilanlarına doğrudan ana ekranınızdan ulaşın ve başvurun!",
      featuresTitle: 'Uygulama Özellikleri',
      feature1: 'Adresi yazmadan, ana ekranınızdan tek dokunuşla anında erişim',
      feature2: "Son derece hafif (1MB'tan az), depolama alanı ve pil tüketmez",
      feature3: 'Yavaş mobil bağlantılarda bile son derece hızlı ve sorunsuz çalışır',
      feature4: 'Hızlı gezinti ve yeni iş ilanları için anlık güncellemeler',
      iosTitle: '📱 iPhone ve iPad (iOS)',
      iosStep1: '<strong>Safari</strong> tarayıcısını açın ve jobs-in-istanbul.com adresine gidin.',
      iosStep2: 'Paylaş (Share) butonuna tıklayın (kare ve yukarı ok simgesi).',
      iosStep3: 'Listeyi aşağı kaydırın ve <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.',
      androidTitle: '🤖 Android Telefonlar',
      androidStep1: '<strong>Chrome</strong> tarayıcısını açın ve jobs-in-istanbul.com adresine gidin.',
      androidStep2: 'Altta beliren <strong>"Uygulamayı Yükle"</strong> bildirimine dokunun.',
      androidStep3: 'Veya sağ üstteki üç noktaya tıklayıp <strong>"Uygulamayı Yükle"</strong> seçeneğini seçin.',
      btnText: 'Ana Sayfaya Git ve Yükle'
    },
    ru: {
      title: 'Установить мобильное приложение Работа в Стамбуле',
      description: 'Простое руководство по установке приложения PWA Работа в Стамбуле на Android и iOS для просмотра вакансий в одно нажатие.',
      keywords: 'установить приложение работа в стамбуле, скачать приложение вакансии в турции, pwa стамбул, мобильное приложение для работы в турции',
      heading: 'Установить приложение Работа в Стамбуле',
      subheading: 'Ищите и откликайтесь на лучшие вакансии в Стамбуле прямо с главного экрана мобильного телефона!',
      featuresTitle: 'Преимущества мобильного приложения',
      feature1: 'Быстрый доступ в одно касание к вакансиям без ввода веб-адреса',
      feature2: 'Чрезвычайно легкий вес (менее 1 МБ), не разряжает батарею и не занимает память',
      feature3: 'Работает стабильно и быстро загружается даже при слабом интернет-соединении',
      feature4: 'Удобная навигация и обновление вакансий в реальном времени',
      iosTitle: '📱 Устройства Apple (iOS)',
      iosStep1: 'Откройте браузер <strong>Safari</strong> и перейдите на сайт.',
      iosStep2: 'Нажмите кнопку <strong>Поделиться (Share)</strong> (иконка квадрата со стрелкой вверх внизу экрана).',
      iosStep3: 'Прокрутите меню вниз и выберите пункт <strong>"На экран Домой"</strong> (Add to Home Screen).',
      androidTitle: '🤖 Устройства Android',
      androidStep1: 'Откройте браузер <strong>Chrome</strong> и перейдите на сайт.',
      androidStep2: 'Нажмите на всплывающее уведомление <strong>"Установить приложение"</strong>.',
      androidStep3: 'Или нажмите три точки в углу экрана и выберите <strong>"Установить приложение"</strong>.',
      btnText: 'На главную и установить'
    },
    fa: {
      title: 'نصب اپلیکیشن موبایل کاریابی در استانبول',
      description: 'راهنمای گام به گام نصب اپلیکیشن PWA کاریابی در استانبول بر روی گوشی‌های اندروید و آیفون برای دسترسی آسان به مشاغل با یک کلیک.',
      keywords: 'نصب اپلیکیشن کار در استانبول, دانلود اپلیکیشن کاریابی ترکیه, pwa استانبول, کار در ترکیه برای ایرانیان',
      heading: 'نصب اپلیکیشن کاریابی در استانبول',
      subheading: 'بهترین فرصت‌های شغلی استانبول را مستقیماً از صفحه اصلی گوشی خود جستجو و ثبت‌نام کنید!',
      featuresTitle: 'مزایای نصب اپلیکیشن موبایل',
      feature1: 'دسترسی سریع و مستقیم به لیست مشاغل بدون نیاز به تایپ آدرس سایت',
      feature2: 'بسیار سبک (کمتر از ۱ مگابایت)، بدون مصرف باتری و اشغال فضای ذخیره‌سازی گوشی',
      feature3: 'بارگذاری سریع و عملکرد پایدار حتی در صورت ضعیف بودن اتصال اینترنت',
      feature4: 'ناوبری آسان و به‌روزرسانی آنی آگهی‌های استخدام جدید',
      iosTitle: '📱 دستگاه‌های اپل (iOS)',
      iosStep1: 'مرورگر <strong>Safari</strong> را باز کرده و به وب‌سایت وارد شوید.',
      iosStep2: 'بر روی دکمه <strong>اشتراک‌گذاری (Share)</strong> (آیکون مربع با فلش رو به بالا) کلیک کنید.',
      iosStep3: 'لیست را به پایین بکشید و گزینه <strong>"افزودن به صفحه اصلی" (Add to Home Screen)</strong> را انتخاب کنید.',
      androidTitle: '🤖 گوشی‌های اندرویدی (Android)',
      androidStep1: 'مرورگر <strong>Chrome</strong> را باز کرده و به وب‌سایت وارد شوید.',
      androidStep2: 'بر روی اعلان پاپ‌آپ <strong>"نصب اپلیکیشن"</strong> کلیک کنید.',
      androidStep3: 'یا دکمه سه نقطه بالا را لمس کرده و گزینه <strong>"نصب اپلیکیشن" (Install App)</strong> را انتخاب کنید.',
      btnText: 'انتقال به صفحه اصلی و نصب'
    },
    ur: {
      title: 'ملازمت ایپ انسٹال کریں - استنبول میں ملازمتیں',
      description: 'اینڈرائیڈ اور آئی فون پر استنبول جابز کی PWA موبائل ایپ انسٹال کرنے کا طریقہ تاکہ آپ ایک کلک میں ملازمتیں تلاش کر سکیں۔',
      keywords: 'استنبول جابز ایپ, ترکی نوکری ایپ, PWA استنبول, ترکی میں روزگار',
      heading: 'موبائل ایپ انسٹال کریں',
      subheading: 'استنبول میں ملازمت کے تازہ ترین مواقع براہِ راست اپنے موبائل کی ہوم اسکرین پر حاصل کریں!',
      featuresTitle: 'ایپ انسٹال کرنے کے فائدے',
      feature1: 'بغیر ویب سائٹ کا پتہ ٹائپ کیے فوری اور براہِ راست رسائی',
      feature2: 'بہت ہلکی ایپ (۱ ایم بی سے کم)، جو فون کی میموری اور بیٹری استعمال نہیں کرتی',
      feature3: 'انٹرنیٹ سست ہونے کی صورت میں بھی تیز رفتار لوڈنگ اور کارکردگی',
      feature4: 'نئی ملازمتوں کے بارے میں فوری اپ ڈیٹس اور آسان نیویگیشن',
      iosTitle: '📱 ایپل ڈیوائسز (iOS)',
      iosStep1: 'اپنے آئی فون پر <strong>Safari</strong> براؤزر کھولیں اور ہماری سائٹ پر جائیں۔',
      iosStep2: 'نیچے موجود <strong>شیئر (Share)</strong> بٹن (تیر کا نشان والا مربع) پر کلک کریں۔',
      iosStep3: 'فہرست میں نیچے جا کر <strong>"Add to Home Screen" (ہوم اسکرین پر شامل کریں)</strong> کا انتخاب کریں۔',
      androidTitle: '🤖 اینڈرائیڈ ڈیوائسز (Android)',
      androidStep1: 'اپنے فون پر <strong>Chrome</strong> براؤزر کھولیں اور ہماری سائٹ پر جائیں۔',
      androidStep2: 'اسکرین پر ظاہر ہونے والے <strong>"ایپ انسٹال کریں"</strong> پاپ اپ پر کلک کریں۔',
      androidStep3: 'یا اوپر دائیں کونے میں تین نقطوں پر کلک کر کے <strong>"Install App"</strong> منتخب کریں۔',
      btnText: 'ہوم اسکرین پر جائیں اور انسٹال کریں'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 1100px; padding: 60px 20px;">
      <!-- Hero Section -->
      <div style="text-align: center; margin-bottom: 50px;">
        <div style="width: 80px; height: 80px; background: var(--primary-light); color: var(--primary); border-radius: var(--r-xl); display: inline-flex; align-items: center; justify-content: center; font-size: 2.2rem; margin-bottom: 20px; box-shadow: var(--shadow-md);">
          <i class="fa-solid fa-mobile-screen-button"></i>
        </div>
        <h1 class="hero-title-gradient" style="font-size: 2.5rem; font-weight: 900; margin-bottom: 12px;">${t.heading}</h1>
        <p style="font-size: 1.15rem; color: var(--text-body); max-width: 650px; margin: 0 auto; line-height: 1.6;">${t.subheading}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; margin-bottom: 50px;">
        <!-- iOS Card -->
        <div class="glass-card" style="padding: 35px; border-radius: var(--r-lg); display: flex; flex-direction: column; text-align: ${isRtl ? 'right' : 'left'};">
          <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-heading); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
            ${t.iosTitle}
          </h2>
          <ol style="margin: 0; padding-inline-start: 20px; display: flex; flex-direction: column; gap: 16px; font-size: 1rem; color: var(--text-body); line-height: 1.6;">
            <li>${t.iosStep1}</li>
            <li>${t.iosStep2}</li>
            <li>${t.iosStep3}</li>
          </ol>
        </div>

        <!-- Android Card -->
        <div class="glass-card" style="padding: 35px; border-radius: var(--r-lg); display: flex; flex-direction: column; text-align: ${isRtl ? 'right' : 'left'};">
          <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-heading); margin-bottom: 24px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
            ${t.androidTitle}
          </h2>
          <ol style="margin: 0; padding-inline-start: 20px; display: flex; flex-direction: column; gap: 16px; font-size: 1rem; color: var(--text-body); line-height: 1.6;">
            <li>${t.androidStep1}</li>
            <li>${t.androidStep2}</li>
            <li>${t.androidStep3}</li>
          </ol>
        </div>
      </div>

      <!-- Features Section -->
      <div class="glass-card" style="padding: 40px; border-radius: var(--r-lg); text-align: center; margin-bottom: 50px;">
        <h3 style="font-size: 1.6rem; font-weight: 800; color: var(--text-heading); margin-bottom: 30px;">⚡ ${t.featuresTitle}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px;">
          <div style="padding: 10px;">
            <div style="font-size: 1.5rem; color: var(--primary); margin-bottom: 12px;"><i class="fa-solid fa-bolt"></i></div>
            <p style="font-size: 0.95rem; color: var(--text-body); font-weight: 600; line-height: 1.5; margin: 0;">${t.feature1}</p>
          </div>
          <div style="padding: 10px;">
            <div style="font-size: 1.5rem; color: #10b981; margin-bottom: 12px;"><i class="fa-solid fa-hard-drive"></i></div>
            <p style="font-size: 0.95rem; color: var(--text-body); font-weight: 600; line-height: 1.5; margin: 0;">${t.feature2}</p>
          </div>
          <div style="padding: 10px;">
            <div style="font-size: 1.5rem; color: #6366f1; margin-bottom: 12px;"><i class="fa-solid fa-wifi"></i></div>
            <p style="font-size: 0.95rem; color: var(--text-body); font-weight: 600; line-height: 1.5; margin: 0;">${t.feature3}</p>
          </div>
          <div style="padding: 10px;">
            <div style="font-size: 1.5rem; color: #f59e0b; margin-bottom: 12px;"><i class="fa-solid fa-arrows-rotate"></i></div>
            <p style="font-size: 0.95rem; color: var(--text-body); font-weight: 600; line-height: 1.5; margin: 0;">${t.feature4}</p>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center;">
        <a href="/${locale}" class="btn btn-primary" style="padding: 16px 40px; font-size: 1.1rem; font-weight: 700; border-radius: var(--r-full); box-shadow: var(--shadow-lg); text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: var(--t-base);">
          <i class="fa-solid fa-house"></i>
          <span>${t.btnText}</span>
        </a>
      </div>
    </div>
  `;

  const seoHtml = generateMetaTags(locale, 'submit', {
    title: t.title,
    seoDescription: t.description,
    seoKeywords: t.keywords,
    slug: 'install'
  });

  return c.html(renderLayout(c, t.title, html, locale, seoHtml));
});

