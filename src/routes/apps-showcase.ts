import { Hono } from 'hono';
import { renderLayout } from './public';

export const appsShowcaseRouter = new Hono();

export const GOOGLE_PLAY_DEV_URL = 'https://play.google.com/store/apps/dev?id=6308543008922541479';

export interface AppShowcaseItem {
  id: string;
  packageId: string;
  category: 'jobs' | 'travel' | 'shopping' | 'islamic';
  icon: string;
  playStoreUrl: string;
  rating: string;
  reviewsCount: string;
  downloads: string;
  badge: {
    ar: string;
    en: string;
    tr: string;
  };
  title: {
    ar: string;
    en: string;
    tr: string;
  };
  subtitle: {
    ar: string;
    en: string;
    tr: string;
  };
  description: {
    ar: string;
    en: string;
    tr: string;
  };
  features: {
    ar: string[];
    en: string[];
    tr: string[];
  };
  tags: {
    ar: string[];
    en: string[];
    tr: string[];
  };
  screenshots: string[];
  articleSlug?: string;
}

export const APPS_DATA: AppShowcaseItem[] = [
  {
    id: 'jobs-istanbul',
    packageId: 'com.jobsistanbul.app',
    category: 'jobs',
    icon: 'https://play-lh.googleusercontent.com/cncHf5ZsgFZ3ufzi278St6Y_0NuT46X4MYzgbsxR31-a2bfE_ufiJBu_-MS_MsQ5Z_Yl3qc47jTGxf5Z2HUR7Q=w240-h480',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.jobsistanbul.app',
    rating: '5.0',
    reviewsCount: '500+',
    downloads: '10,000+',
    badge: {
      ar: 'التطبيق الرسمي للمنصة ⭐',
      en: 'Official Flagship App ⭐',
      tr: 'Resmi Portal Uygulaması ⭐'
    },
    title: {
      ar: 'وظائف تركيا وإسطنبول',
      en: 'Turkey & Istanbul Jobs',
      tr: 'Türkiye & İstanbul İş İlanları'
    },
    subtitle: {
      ar: 'بوابتك اليومية الأولى لأحدث فرص العمل في إسطنبول وتركيا',
      en: 'The leading gateway to job opportunities across Istanbul & Turkey',
      tr: 'İstanbul ve Türkiye genelinde en yeni iş fırsatları platformu'
    },
    description: {
      ar: 'التطبيق الرسمي الأسرع والأشمل لفرص العمل والتوظيف في إسطنبول وعموم تركيا. يتيح لك البحث عن آلاف الوظائف اليومية، الفلترة حسب الأحياء والمتروبوس والمترو، التقديم المباشر، استخراج نماذج طلبات Dilekçe الرسمية، ومتابعة أسعار العملات والذهب الحية.',
      en: 'The premier mobile platform connecting job seekers with leading employers across Istanbul and Turkey. Filter by districts and transit lines, apply in one tap, generate official Dilekçe documents, and track live exchange rates.',
      tr: 'İstanbul ve tüm Türkiye’deki en yeni iş ilanlarını tek dokunuşla keşfedin. İlçe ve metrobüs duraklarına göre filtreleme, tek tıkla başvuru, resmi Dilekçe oluşturucu ve anlık döviz kurları takibi.'
    },
    features: {
      ar: [
        'إشعارات فورية بكل وظيفة شاغرة جديدة تناسب تخصصك',
        'فلترة جغرافية ذكية حسب أحياء إسطنبول ومحطات المتروبوس',
        'مولد نماذج الطلبات الرسمية (Dilekçe) وتصديرها بصيغة PDF',
        'متابعة حية لأسعار صرف الليرة التركية والذهب وأدوات الرواتب'
      ],
      en: [
        'Instant push alerts for newly posted vacancies matching your profile',
        'Smart geographic filtering by Istanbul districts & Metrobus stations',
        'Official Turkish Dilekçe generator with print-ready PDF export',
        'Live Turkish Lira exchange rates, gold prices, and salary benchmarks'
      ],
      tr: [
        'Uzmanlığınıza uygun yeni iş ilanları için anlık bildirimler',
        'İstanbul ilçeleri ve metrobüs duraklarına göre akıllı filtreleme',
        'Resmi Dilekçe şablonları oluşturma ve anında PDF indirme',
        'Canlı döviz kurları, altın fiyatları ve maaş hesaplama araçları'
      ]
    },
    tags: {
      ar: ['وظائف إسطنبول', 'عمل في تركيا', 'سيرة ذاتية', 'إذن عمل'],
      en: ['Istanbul Jobs', 'Careers in Turkey', 'Resume Builder', 'Work Permit'],
      tr: ['İstanbul İş İlanları', 'Kariyer', 'Özgeçmiş', 'Çalışma İzni']
    },
    screenshots: [
      '/public/images/istanbul-app/01_jobs_istanbul_app_hero_mockup.jpg',
      '/public/images/istanbul-app/02_job_search_filters_opportunities.jpg',
      '/public/images/istanbul-app/03_istanbul_industrial_zones_osb_map.jpg',
      '/public/images/istanbul-app/06_live_currency_gold_prices_dashboard.jpg'
    ],
    articleSlug: 'install'
  },
  {
    id: 'trabzon-turkey-guide',
    packageId: 'com.trabzon.turkey.travel.guide',
    category: 'travel',
    icon: 'https://play-lh.googleusercontent.com/a0oo3fGEydn_MFhagwEWQVZK9SFCennjy3L2wrsAlMrFZHWKsg5CoBX7aJJv7wTOD-PkYkfwKZ4Ds34aa1AXPW0=w240-h480',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.trabzon.turkey.travel.guide',
    rating: '5.0',
    reviewsCount: '1.2k+',
    downloads: '25,000+',
    badge: {
      ar: 'يعمل 100% بدون إنترنت 📴',
      en: '100% Offline Guide 📴',
      tr: '%100 Çevrimdışı Çalışır 📴'
    },
    title: {
      ar: 'دليل تركيا السياحي بدون نت',
      en: 'Turkey Travel Guide Offline',
      tr: 'İnternetsiz Türkiye Gezi Rehberi'
    },
    subtitle: {
      ar: 'دليلك السياحي الشامل لإسطنبول، طرابزون، الشمال وعموم تركيا',
      en: 'Complete offline pocket guide for Istanbul, Trabzon & all Turkey',
      tr: 'Trabzon, Karadeniz ve İstanbul için kapsamlı seyahat rehberi'
    },
    description: {
      ar: 'رفيقك الأمثل في السفر والسياحة لاستكشاف طرابزون، أوزنجول، آيدر، الشمال التركي، إسطنبول، كابادوكيا وبورصة. يعمل بالكامل دون الحاجة لأي اتصال إنترنت أو باقة تجوال، مع خرائط GPS تفاعلية، إحداثيات دقيقة للأماكن السياحية، وجداول رحلات يومية منسقة بعناية.',
      en: 'Your complete offline travel companion for exploring Trabzon, Uzungöl, Ayder Plateau, Istanbul, Cappadocia, and Bursa. Zero mobile data needed! Includes offline GPS coordinates, verified points of interest, daily itineraries, and local insider tips.',
      tr: 'Trabzon, Uzungöl, Ayder, Karadeniz yaylaları, İstanbul ve Kapadokya seyahatiniz için internet gerektirmeyen en kapsamlı rehber. Çevrimdışı GPS haritaları, koordinatlar, hazır gezi rotaları ve mekan tavsiyeleri.'
    },
    features: {
      ar: [
        'يعمل 100% بدون اتصال إنترنت مع ميزة التوجيه الصوتي وتحديد المواقع',
        'إحداثيات جغرافية دقيقة بنقرة واحدة لفتحها في خرائط Google وMaps.me',
        'برامج وجداول سياحية يومية جاهزة ومجربة للعوائل والشباب',
        'دليل كامل لأجمل الشلالات، البحيرات، المرتفعات، المطاعم والأسواق'
      ],
      en: [
        '100% functional without cellular connection or mobile data roaming',
        'One-tap GPS coordinates launchable directly in Google Maps & Maps.me',
        'Pre-planned daily tour schedules optimized for families & travelers',
        'Comprehensive index of lakes, waterfalls, plateaus, and restaurants'
      ],
      tr: [
        'Hücresel veri veya internet olmadan %100 çevrimdışı GPS kullanımı',
        'Google Haritalar ve Maps.me ile uyumlu tek dokunuşla koordinat açma',
        'Aileler ve gezginler için denenmiş, hazır günlük gezi planları',
        'Göller, şelaleler, yaylalar, yöresel restoranlar ve tarihi mekanlar'
      ]
    },
    tags: {
      ar: ['سياحة تركيا', 'دليل طرابزون', 'أوزنجول بدون نت', 'خرائط GPS'],
      en: ['Turkey Travel', 'Trabzon Guide', 'Offline Maps', 'GPS Tourism'],
      tr: ['Türkiye Gezi', 'Trabzon Rehberi', 'İnternetsiz Harita', 'Karadeniz']
    },
    screenshots: [
      '/public/images/trabzon-app/01_trabzon_app_hero_mockup.jpg',
      '/public/images/trabzon-app/02_uzungol_lake_real_view.jpg',
      '/public/images/trabzon-app/03_sumela_monastery_cliff_real.jpg',
      '/public/images/trabzon-app/04_ayder_plateau_waterfalls_real.jpg'
    ],
    articleSlug: 'blog/turkey-travel-guide-offline-app-android'
  },
  {
    id: 'aktuel-supermarket-deals',
    packageId: 'com.aktuel.bim.a101.sok',
    category: 'shopping',
    icon: 'https://play-lh.googleusercontent.com/SCJlCWjQ979y8qDWUu_6_Fd5tQhBNa6cGoxOzVZm4SUZR_tEoxqUbqQcKR4_ADs9TjmUv3sjvsevsAiIiHEN8vA=w240-h480',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.aktuel.bim.a101.sok',
    rating: '5.0',
    reviewsCount: '800+',
    downloads: '15,000+',
    badge: {
      ar: 'أحدث التخفيضات أسبوعياً 🛒',
      en: 'Weekly Store Deals 🛒',
      tr: 'Güncel İndirimler 🛒'
    },
    title: {
      ar: 'Aktüel: عروض بيم A101 و ŞOK',
      en: 'Aktüel: BİM, A101 & ŞOK Deals',
      tr: 'Aktüel: BİM, A101, ŞOK İndirimleri'
    },
    subtitle: {
      ar: 'كتالوجات وبروشورات التخفيضات الأسبوعية لأشهر المتاجر في تركيا',
      en: 'Weekly discount flyers & catalogs for all major Turkish supermarkets',
      tr: 'BİM, A101, ŞOK ve marketlerin haftalık indirim katalogları'
    },
    description: {
      ar: 'تطبيق التوفير الذكي الأول لمتابعة كتالوجات وبروشورات التخفيضات الأسبوعية لأشهر المتاجر والماركت في تركيا (BİM، A101، ŞOK، Migros، CarrefourSA). تصفح العروض بدقة فائقة HD، واطلع على المنتجات قبل نزولها للأسواق لتوفير ميزانية أسرتك.',
      en: 'Your ultimate shopping savings companion in Turkey. Follow weekly discount catalogs and flyers for top retail supermarkets including BİM, A101, ŞOK, Migros, and CarrefourSA. High-resolution zoomable pages with instant alerts before deals sell out.',
      tr: 'BİM, A101, ŞOK, Migros ve Türkiye’deki tüm zincir marketlerin haftalık aktüel ürün katalogları ve indirim broşürleri tek bir uygulamada. Yüksek çözünürlüklü HD sayfalar ve indirim günü hatırlatıcı bildirimler.'
    },
    features: {
      ar: [
        'تحديث فوري لبروشورات الماركت فور صدورها رسمياً وقبل بدء العروض',
        'تقنية تكبير فائق الدقة (Ultra HD Zoom) لقراءة الأسعار وتفاصيل المنتجات',
        'تنبيهات ذكية تذكرك بيوم نزول التخفيضات كي لا تفوتك السلع النادرة',
        'حجم فائق الصغر وخفيف جداً على ذاكرة الهاتف وبطاريته'
      ],
      en: [
        'Instant updates with upcoming flyers published before store launch dates',
        'Ultra-HD zoom rendering to easily inspect fine price prints & specifications',
        'Smart alert reminders on campaign launch days to catch limited items',
        'Extremely lightweight, zero lag, and minimal battery consumption'
      ],
      tr: [
        'Resmi olarak yayınlanan haftalık broşürlerin anında güncellenmesi',
        'Ultra HD net yakınlaştırma ile küçük fiyat ve ürün detaylarını inceleme',
        'İndirim sabahı fırsatları kaçırmamanız için akıllı hatırlatıcılar',
        'Telefon belleğini yormayan son derece hafif ve hızlı yapı'
      ]
    },
    tags: {
      ar: ['عروض بيم', 'تخفيضات A101', 'عروض شوك ŞOK', 'توفير الميزانية'],
      en: ['BİM Deals', 'A101 Discounts', 'ŞOK Catalog', 'Turkey Shopping'],
      tr: ['BİM Aktüel', 'A101 İndirim', 'ŞOK Broşür', 'Market Kampanyaları']
    },
    screenshots: [
      '/public/images/aktuel-app/01_aktuel_supermarket_app_hero.jpg',
      '/public/images/aktuel-app/02_bim_weekly_catalog_deals.jpg',
      '/public/images/aktuel-app/03_a101_aldin_aldin_electronics.jpg',
      '/public/images/aktuel-app/04_sok_market_fresh_groceries.jpg'
    ]
  },
  {
    id: 'diya-al-quran',
    packageId: 'com.quran.karim.kamel.bidon.net.murtal.tilaat.smart',
    category: 'islamic',
    icon: 'https://play-lh.googleusercontent.com/IfWtdWTOPQo3GSK4ipturd4W50ekNd8aVMJ1myX2W2ItASr8GPy_jipvCpz-96gWDS_Vv_Nck0pw8Gk_IhPu=w240-h480',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.quran.karim.kamel.bidon.net.murtal.tilaat.smart',
    rating: '5.0',
    reviewsCount: '2.5k+',
    downloads: '50,000+',
    badge: {
      ar: 'كامل بدون إنترنت 📖',
      en: 'Complete Offline 📖',
      tr: 'Tamamı İnternetsiz 📖'
    },
    title: {
      ar: 'ضياء القرآن الكريم بدون إنترنت',
      en: 'Diya Al-Quran - Holy Quran Offline',
      tr: 'Diya Kur\'an-ı Kerim İnternetsiz'
    },
    subtitle: {
      ar: 'المصحف الشريف كاملاً، تلاوات خاشعة، مواقيت الصلاة، وحصن المسلم',
      en: 'Full Holy Quran with recitations, prayer times, Qibla & supplications',
      tr: 'Sesli tilavetler, Diyanet namaz vakitleri, Kıble pusulası ve dualar'
    },
    description: {
      ar: 'تطبيق إسلامي شامل ومتقن يضم المصحف الشريف كاملاً بالرسم العثماني بجودة فائقة بدون إنترنت، مع تلاوات صوتية خاشعة لأشهر القراء، مواقيت الصلاة الدقيقة، اتجاه القبلة 3D، أذكار حصن المسلم، وتفسير الآيات والسبحة الإلكترونية.',
      en: 'A comprehensive, spiritual Islamic application featuring the complete Holy Quran in pristine Madinah script, offline recitations by renowned reciters, accurate geographic prayer times, 3D Qibla compass, and daily Hisn Al-Muslim Azkar.',
      tr: 'Medine hattı yüksek çözünürlüklü Mushaf sayfaları, ünlü karilerden sesli tilavetler, konuma göre doğru ezan vakitleri, 3D Kıble pusulası, Cevşen ve Hisnü’l Müslim duaları içeren hepsi bir arada İslami uygulama.'
    },
    features: {
      ar: [
        'المصحف الشريف كاملاً بدون نت بالرسم العثماني مع خط واضح ومريح للعين',
        'تلاوات صوتية خاشعة لأشهر قراء العالم الإسلامي قابلة للتشغيل أوفلاين',
        'مواقيت الصلاة الدقيقة والأذان حسب موقعك الجغرافي مع بوصلة القبلة 3D',
        'حصن المسلم كاملاً، أذكار الصباح والمساء، والسبحة الإلكترونية الذكية'
      ],
      en: [
        'Complete Holy Quran in authentic Uthmani script with eye-friendly reading mode',
        'Soulful recitations by world-famous Qaris with offline playback support',
        'Precise geolocation prayer times, Athan notifications, and 3D Qibla compass',
        'Hisn Al-Muslim fortress supplications, morning/evening Azkar, and digital Tasbih'
      ],
      tr: [
        'Gözü yormayan net Medine Mushaf hattıyla %100 internetsiz Kur\'an okuma',
        'Dünyaca ünlü hafızlardan çevrimdışı dinlenebilen yüksek kaliteli sesli tilavetler',
        'Konuma duyarlı hassas ezan vakitleri ve 3 boyutlu Kabe Kıble pusulası',
        'Hisnü\'l Müslim duaları, sabah-akşam zikirleri ve akıllı zikirmatik'
      ]
    },
    tags: {
      ar: ['القرآن الكريم', 'أوقات الصلاة', 'حصن المسلم', 'اتجاه القبلة'],
      en: ['Holy Quran', 'Prayer Times', 'Qibla Direction', 'Azkar'],
      tr: ['Kuranı Kerim', 'Namaz Vakitleri', 'Kıble Pusulası', 'Dualar ve Zikir']
    },
    screenshots: [
      '/public/images/quran-app/00_App_Icon_3D_Logo.jpg',
      '/public/images/quran-app/01_Home_Dashboard.jpg',
      '/public/images/quran-app/02_Quran_Mushaf_Reading.jpg',
      '/public/images/quran-app/03_Prayer_Times_Schedule.jpg'
    ],
    articleSlug: 'blog/quran-karim-kamel-offline-app-android'
  }
];

// Root redirect for /apps
appsShowcaseRouter.get('/apps', (c) => {
  const acceptLang = (c.req.header('accept-language') || '').toLowerCase();
  let loc = 'ar';
  if (acceptLang.startsWith('tr')) loc = 'tr';
  else if (acceptLang.startsWith('en')) loc = 'en';
  return c.redirect(`/${loc}/apps`);
});

appsShowcaseRouter.get('/our-apps', (c) => c.redirect('/apps'));
appsShowcaseRouter.get('/mobile-apps', (c) => c.redirect('/apps'));

// Multi-language Route for Apps Showcase
appsShowcaseRouter.get('/:locale/apps', (c) => {
  const rawLocale = c.req.param('locale');
  const locale: 'ar' | 'en' | 'tr' = (rawLocale === 'tr' || rawLocale === 'en') ? rawLocale : 'ar';
  const isRtl = locale === 'ar';

  const t = {
    ar: {
      pageTitle: 'تطبيقاتنا الذكية على Google Play | منظومة خدمات تركيا وإسطنبول',
      metaDesc: 'تصفح وحمل باقة تطبيقاتنا الذكية المعتمدة على متجر Google Play: تطبيق وظائف إسطنبول، دليل تركيا السياحي بدون نت، عروض بيم A101 و ŞOK، وضياء القرآن الكريم.',
      devBadge: 'حساب مطور رسمي موثق على Google Play',
      heroTitle: 'تطبيقاتنا الذكية لمنظومة إسطنبول وتركيا',
      heroSubtitle: 'حلول برمجية متطورة صُممت خصيصاً لتيسير حياة المقيمين، السياح، والباحثين عن عمل في تركيا. سرعة، أمان، وعمل بدون إنترنت.',
      devButton: 'زيارة متجرنا في Google Play',
      statsApps: 'تطبيقات معتمدة',
      statsRating: 'متوسط التقييم 5.0 ⭐',
      statsDownloads: 'أكثر من 100 ألف تحميل',
      statsFree: 'مجانية 100% وبدون إعلانات مزعجة',
      filterAll: 'جميع التطبيقات',
      filterJobs: 'وظائف وأعمال',
      filterTravel: 'سياحة وسفر',
      filterShopping: 'تسوق وتوفير',
      filterIslamic: 'إسلاميات وقرآن',
      downloadBtn: 'تثبيت من Google Play',
      qrBtn: 'رمز QR للموبايل',
      reviewBtn: 'تفاصيل ومراجعة التطبيق',
      verifiedProtect: 'تم الفحص بواسطة Google Play Protect',
      whyTitle: 'لماذا يفضل مئات الآلاف استخدام تطبيقاتنا؟',
      why1Title: 'عمل بدون إنترنت (Offline First)',
      why1Desc: 'تطبيقاتنا تعمل بكفاءة حتى عند انقطاع الإنترنت أو أثناء تجوالك في الطبيعة والكهوف وخطوط المترو.',
      why2Title: 'حماية وأمان وخصوصية تامة',
      why2Desc: 'جميع تطبيقاتنا مطابقة لأعلى معايير الأمان المعتمدة في متجر Google Play ولا تطلب أي صلاحيات غير ضرورية.',
      why3Title: 'تحديثات دورية وسرعة فائقة',
      why3Desc: 'فريقنا التقني يحدّث المحتوى وقواعد البيانات والكتالوجات والوظائف يومياً لضمان أدق المعلومات.',
      why4Title: 'مجانية 100% للجميع',
      why4Desc: 'نؤمن بتمكين المستخدم العربي والأجنبي في تركيا بأقوى الأدوات الخدمية المتاحة مجاناً بالكامل.',
      qrModalTitle: 'مسح رمز QR للتحميل السريع',
      qrModalSub: 'وجّه كاميرا هاتفك المحمول نحو الرمز أدناه ليتم نقلك مباشرة إلى صفحة التطبيق في متجر Google Play:',
      close: 'إغلاق'
    },
    en: {
      pageTitle: 'Our Mobile Apps on Google Play | Istanbul & Turkey Ecosystem',
      metaDesc: 'Discover and download our top-rated official Android apps on Google Play: Jobs in Istanbul, Turkey Travel Guide Offline, Aktüel Supermarket Deals, and Diya Al-Quran.',
      devBadge: 'Verified Google Play Developer Account',
      heroTitle: 'Smart Mobile Apps for Life in Turkey & Istanbul',
      heroSubtitle: 'High-performance Android applications built to empower expats, tourists, and job seekers in Turkey. Fast, reliable, and privacy-focused.',
      devButton: 'Visit Google Play Developer Store',
      statsApps: 'Verified Apps',
      statsRating: '5.0 ⭐ Rating Average',
      statsDownloads: '100K+ Total Installs',
      statsFree: '100% Free & Secure',
      filterAll: 'All Apps',
      filterJobs: 'Jobs & Career',
      filterTravel: 'Travel & Tourism',
      filterShopping: 'Shopping & Deals',
      filterIslamic: 'Islamic & Quran',
      downloadBtn: 'Install on Google Play',
      qrBtn: 'Mobile QR Code',
      reviewBtn: 'Read Complete Review',
      verifiedProtect: 'Verified by Google Play Protect',
      whyTitle: 'Why Do Thousands of Users Love Our Apps?',
      why1Title: 'Offline-First Architecture',
      why1Desc: 'Built to run flawlessly even without mobile data or in remote natural spots and transit tunnels.',
      why2Title: 'Strict Privacy & Zero Bloat',
      why2Desc: 'Compliant with Google Play Protect standards with minimum footprint and no intrusive permissions.',
      why3Title: 'Daily Updates & Peak Speed',
      why3Desc: 'Continuous real-time database updates ensuring you always have accurate job leads, catalogs, and guides.',
      why4Title: '100% Free For Everyone',
      why4Desc: 'We believe in empowering the expat and local community with world-class digital tools at zero cost.',
      qrModalTitle: 'Scan QR Code for Instant Install',
      qrModalSub: 'Point your smartphone camera at the QR code below to open directly in Google Play Store:',
      close: 'Close'
    },
    tr: {
      pageTitle: 'Google Play’deki Resmi Mobil Uygulamalarımız | İstanbul & Türkiye',
      metaDesc: 'Google Play’deki resmi ve onaylı mobil uygulamalarımızı indirin: İstanbul İş İlanları, İnternetsiz Türkiye Gezi Rehberi, Aktüel Ürün Katalogları ve Diya Kur\'an-ı Kerim.',
      devBadge: 'Doğrulanmış Resmi Google Play Geliştiricisi',
      heroTitle: 'İstanbul ve Türkiye İçin Akıllı Mobil Uygulamalarımız',
      heroSubtitle: 'Türkiye’de yaşayanlar, turistler ve iş arayanlar için özel geliştirilmiş güvenilir, hızlı ve internetsiz mobil çözümler.',
      devButton: 'Google Play Mağazamızı Ziyaret Edin',
      statsApps: 'Resmi Uygulama',
      statsRating: '5.0 ⭐ Puan Ortalaması',
      statsDownloads: '100.000+ İndirme',
      statsFree: '%100 Ücretsiz & Güvenli',
      filterAll: 'Tüm Uygulamalar',
      filterJobs: 'İş & Kariyer',
      filterTravel: 'Seyahat & Gezi',
      filterShopping: 'Alışveriş & İndirim',
      filterIslamic: 'İslami & Kur\'an',
      downloadBtn: 'Google Play\'den İndir',
      qrBtn: 'Mobil QR Kodu',
      reviewBtn: 'Uygulama İncelemesi',
      verifiedProtect: 'Google Play Protect ile Güvenli',
      whyTitle: 'Neden Yüz Binlerce Kullanıcı Uygulamalarımızı Tercih Ediyor?',
      why1Title: 'Çevrimdışı Çalışma Desteği',
      why1Desc: 'İnternet bağlantınız olmasa dahi doğada, metroda ve seyahatte kesintisiz kullanım kolaylığı.',
      why2Title: 'Tam Gizlilik ve Güvenlik',
      why2Desc: 'Google Play Protect standartlarına tam uyumlu, gereksiz izin istemeyen güvenli yazılımlar.',
      why3Title: 'Sürekli Güncelleme ve Yüksek Hız',
      why3Desc: 'En doğru iş fırsatları, aktüel kataloglar ve seyahat rotaları için günlük güncellenen veritabanı.',
      why4Title: '%100 Ücretsiz Hizmet',
      why4Desc: 'Türkiye’deki tüm kullanıcılarımız için modern dijital araçları tamamen ücretsiz sunuyoruz.',
      qrModalTitle: 'Hızlı İndirme İçin QR Kodu Tarayın',
      qrModalSub: 'Telefonunuzun kamerasını aşağıdaki QR koduna doğrultarak Google Play sayfasını açabilirsiniz:',
      close: 'Kapat'
    }
  }[locale];

  // Render App Cards HTML
  const appCardsHtml = APPS_DATA.map((app) => {
    const title = app.title[locale];
    const subtitle = app.subtitle[locale];
    const desc = app.description[locale];
    const badgeText = app.badge[locale];
    const features = app.features[locale];
    const tags = app.tags[locale];
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(app.playStoreUrl)}`;

    return `
      <article class="app-card" data-category="${app.category}" id="app-${app.id}">
        <div class="app-card-header">
          <div class="app-icon-container">
            <img src="${app.icon}" alt="${title}" class="app-icon" loading="lazy" width="96" height="96">
            <div class="app-verified-badge" title="${t.verifiedProtect}">
              <i class="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div class="app-meta">
            <div class="app-top-row">
              <span class="app-badge">${badgeText}</span>
              <div class="app-rating">
                <span class="stars"><i class="fa-solid fa-star"></i> 5.0</span>
                <span class="reviews-count">(${app.reviewsCount})</span>
              </div>
            </div>
            <h2 class="app-title">${title}</h2>
            <p class="app-subtitle">${subtitle}</p>
            <div class="app-tag-list">
              ${tags.map(tag => `<span class="app-chip"><i class="fa-solid fa-tag"></i> ${tag}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="app-card-body">
          <p class="app-description">${desc}</p>
          
          <div class="app-features-box">
            <h3 class="features-heading"><i class="fa-solid fa-wand-magic-sparkles"></i> ${locale === 'ar' ? 'أبرز مميزات التطبيق:' : (locale === 'tr' ? 'Öne Çıkan Özellikler:' : 'Key Highlights:')}</h3>
            <ul class="features-list">
              ${features.map(f => `<li><i class="fa-solid fa-circle-check feature-icon"></i> <span>${f}</span></li>`).join('')}
            </ul>
          </div>

          <!-- Screenshots Preview Strip -->
          <div class="screenshots-strip">
            ${app.screenshots.map((s, idx) => `
              <div class="screenshot-thumb" onclick="openLightbox('${s}', '${title}')">
                <img src="${s}" alt="${title} Preview ${idx + 1}" loading="lazy" onerror="this.parentElement.style.display='none'">
                <div class="screenshot-overlay"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="app-card-footer">
          <div class="app-footer-left">
            <div class="app-install-stats">
              <span class="stat-num"><i class="fa-brands fa-google-play"></i> ${app.downloads}</span>
              <span class="stat-label">${locale === 'ar' ? 'تثبيت موثوق' : (locale === 'tr' ? 'İndirme' : 'Downloads')}</span>
            </div>
          </div>
          <div class="app-actions">
            <button class="btn-qr" onclick="openQrModal('${title}', '${app.icon}', '${qrCodeUrl}', '${app.playStoreUrl}')" title="${t.qrBtn}">
              <i class="fa-solid fa-qrcode"></i>
              <span>${t.qrBtn}</span>
            </button>
            <a href="${app.playStoreUrl}" target="_blank" rel="noopener" class="btn-download" title="${t.downloadBtn}">
              <svg viewBox="0 0 512 512" width="22" height="22" aria-hidden="true" style="flex-shrink:0;">
                <path fill="#410599" d="M32.5 17.5C30.2 19.9 29 23.3 29 27.6v456.8c0 4.3 1.2 7.7 3.5 10.1l1.3 1.2L290.4 239v-6L33.8 16.3l-1.3 1.2z"/>
                <path fill="#F44336" d="M376.6 325.2l-86.2-86.2V233l86.2-86.2 1.3.7 102.2 58.1c2.9 1.7 4.9 4.8 4.9 8.4s-2 6.7-4.9 8.4l-102.2 58.1-1.3.7z"/>
                <path fill="#FFC107" d="M377.9 324.5L290.4 237 33.8 493.6c3.1 3.3 8.3 4.2 13 1.5l331.1-170.6"/>
                <path fill="#00E676" d="M377.9 187.5L46.8 16.9c-4.7-2.7-9.9-1.8-13 1.5L290.4 255l87.5-67.5z"/>
              </svg>
              <span>${t.downloadBtn}</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // JSON-LD Structured Data for Apps Portfolio
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': APPS_DATA.map((app, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'SoftwareApplication',
        'name': app.title[locale],
        'operatingSystem': 'Android',
        'applicationCategory': app.category === 'jobs' ? 'BusinessApplication' : (app.category === 'travel' ? 'TravelApplication' : (app.category === 'shopping' ? 'ShoppingApplication' : 'LifestyleApplication')),
        'installUrl': app.playStoreUrl,
        'image': app.icon,
        'description': app.description[locale],
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '5.0',
          'ratingCount': app.reviewsCount.replace('+', ''),
          'bestRating': '5',
          'worstRating': '1'
        },
        'author': {
          '@type': 'Organization',
          'name': 'MindMeld Apps 2026',
          'url': GOOGLE_PLAY_DEV_URL
        }
      }
    }))
  });

  const contentHtml = `
    <!-- APPS SHOWCASE HERO -->
    <section class="apps-hero">
      <div class="apps-hero-bg"></div>
      <div class="container" style="max-width: 1280px; position: relative; z-index: 2;">
        <div class="apps-hero-badge animate-fadeup">
          <i class="fa-brands fa-google-play"></i>
          <span>${t.devBadge}</span>
        </div>
        
        <h1 class="apps-hero-title animate-fadeup animate-delay-1">
          ${t.heroTitle}
        </h1>
        
        <p class="apps-hero-subtitle animate-fadeup animate-delay-2">
          ${t.heroSubtitle}
        </p>

        <div class="apps-hero-cta animate-fadeup animate-delay-3">
          <a href="${GOOGLE_PLAY_DEV_URL}" target="_blank" rel="noopener" class="btn-hero-store">
            <svg viewBox="0 0 512 512" width="22" height="22" aria-hidden="true" style="flex-shrink:0;">
              <path fill="#410599" d="M32.5 17.5C30.2 19.9 29 23.3 29 27.6v456.8c0 4.3 1.2 7.7 3.5 10.1l1.3 1.2L290.4 239v-6L33.8 16.3l-1.3 1.2z"/>
              <path fill="#F44336" d="M376.6 325.2l-86.2-86.2V233l86.2-86.2 1.3.7 102.2 58.1c2.9 1.7 4.9 4.8 4.9 8.4s-2 6.7-4.9 8.4l-102.2 58.1-1.3.7z"/>
              <path fill="#FFC107" d="M377.9 324.5L290.4 237 33.8 493.6c3.1 3.3 8.3 4.2 13 1.5l331.1-170.6"/>
              <path fill="#00E676" d="M377.9 187.5L46.8 16.9c-4.7-2.7-9.9-1.8-13 1.5L290.4 255l87.5-67.5z"/>
            </svg>
            <span>${t.devButton}</span>
            <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.85rem; opacity: 0.8;"></i>
          </a>
        </div>

        <!-- STATS BAR -->
        <div class="apps-stats-bar animate-fadeup animate-delay-3">
          <div class="app-stat-item">
            <div class="stat-value">4</div>
            <div class="stat-label">${t.statsApps}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="app-stat-item">
            <div class="stat-value">5.0 ⭐</div>
            <div class="stat-label">${t.statsRating}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="app-stat-item">
            <div class="stat-value">100K+</div>
            <div class="stat-label">${t.statsDownloads}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="app-stat-item">
            <div class="stat-value">100%</div>
            <div class="stat-label">${t.statsFree}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- APPS DIRECTORY SECTION -->
    <section class="apps-main-section">
      <div class="container" style="max-width: 1280px;">
        
        <!-- FILTER BAR -->
        <div class="apps-filter-bar">
          <div class="filter-pills">
            <button class="filter-pill active" onclick="filterApps('all', this)"><i class="fa-solid fa-border-all"></i> ${t.filterAll}</button>
            <button class="filter-pill" onclick="filterApps('jobs', this)"><i class="fa-solid fa-briefcase"></i> ${t.filterJobs}</button>
            <button class="filter-pill" onclick="filterApps('travel', this)"><i class="fa-solid fa-map-location-dot"></i> ${t.filterTravel}</button>
            <button class="filter-pill" onclick="filterApps('shopping', this)"><i class="fa-solid fa-cart-shopping"></i> ${t.filterShopping}</button>
            <button class="filter-pill" onclick="filterApps('islamic', this)"><i class="fa-solid fa-moon"></i> ${t.filterIslamic}</button>
          </div>
          <div class="filter-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="app-search-input" placeholder="${locale === 'ar' ? 'بحث في مميزات التطبيقات...' : (locale === 'tr' ? 'Uygulama veya özellik ara...' : 'Search apps & features...')}" onkeyup="searchApps(this.value)">
          </div>
        </div>

        <!-- APP CARDS GRID -->
        <div class="apps-grid" id="apps-grid">
          ${appCardsHtml}
        </div>

        <!-- WHY OUR APPS SECTION -->
        <div class="apps-why-section">
          <div class="why-header">
            <span class="why-eyebrow"><i class="fa-solid fa-shield-halved"></i> Google Play Certified</span>
            <h2 class="why-title">${t.whyTitle}</h2>
          </div>
          <div class="why-grid">
            <div class="why-card">
              <div class="why-icon" style="background: rgba(14, 165, 233, 0.12); color: #0284c7;"><i class="fa-solid fa-wifi-slash"></i></div>
              <h3>${t.why1Title}</h3>
              <p>${t.why1Desc}</p>
            </div>
            <div class="why-card">
              <div class="why-icon" style="background: rgba(16, 185, 129, 0.12); color: #059669;"><i class="fa-solid fa-lock"></i></div>
              <h3>${t.why2Title}</h3>
              <p>${t.why2Desc}</p>
            </div>
            <div class="why-card">
              <div class="why-icon" style="background: rgba(245, 158, 11, 0.12); color: #d97706;"><i class="fa-solid fa-bolt"></i></div>
              <h3>${t.why3Title}</h3>
              <p>${t.why3Desc}</p>
            </div>
            <div class="why-card">
              <div class="why-icon" style="background: rgba(99, 102, 241, 0.12); color: #6366f1;"><i class="fa-solid fa-gift"></i></div>
              <h3>${t.why4Title}</h3>
              <p>${t.why4Desc}</p>
            </div>
          </div>
        </div>

        <!-- GOOGLE PLAY DEV PROMO BANNER -->
        <div class="dev-store-banner">
          <div class="dev-banner-content">
            <div class="dev-badge-row">
              <span class="dev-mini-tag"><i class="fa-brands fa-google-play"></i> MindMeld Apps 2026</span>
              <span class="dev-mini-tag" style="background: rgba(16, 185, 129, 0.2); color: #10b981;"><i class="fa-solid fa-certificate"></i> Verified Developer</span>
            </div>
            <h2>${locale === 'ar' ? 'تابع جديد تطبيقاتنا وتحديثاتنا على متجر Google Play الرسمي' : (locale === 'tr' ? 'Resmi Google Play Mağazamızda Tüm Uygulamalarımızı Keşfedin' : 'Explore All Our Android Apps on Official Google Play Store')}</h2>
            <p>${locale === 'ar' ? 'نعمل باستمرار على تطوير تطبيقات خدمية تهدف لتيسير حياة المجتمع وتلبية متطلبات المقيمين والسياح في تركيا.' : (locale === 'tr' ? 'Türkiye’deki kullanıcılarımıza en kaliteli, modern ve pratik yazılım çözümlerini sunmak için sürekli üretiyoruz.' : 'We continuously engineer high-utility mobile apps to enrich the daily workflow of residents, visitors, and professionals in Turkey.')}</p>
          </div>
          <div class="dev-banner-cta">
            <a href="${GOOGLE_PLAY_DEV_URL}" target="_blank" rel="noopener" class="btn-dev-cta">
              <i class="fa-brands fa-google-play"></i>
              <span>${locale === 'ar' ? 'فتح متجر التطبيقات الآن' : (locale === 'tr' ? 'Geliştirici Profilini Aç' : 'Open Developer Profile')}</span>
            </a>
          </div>
        </div>

      </div>
    </section>

    <!-- QR CODE MODAL -->
    <div id="qr-modal" class="qr-modal-backdrop" onclick="closeQrModal(event)">
      <div class="qr-modal-card" onclick="event.stopPropagation()">
        <button class="qr-close-btn" onclick="document.getElementById('qr-modal').classList.remove('active')"><i class="fa-solid fa-xmark"></i></button>
        <div class="qr-modal-header">
          <img id="qr-app-icon" src="" alt="App Icon" class="qr-app-icon" width="60" height="60">
          <div>
            <h3 id="qr-app-title" class="qr-app-title"></h3>
            <span class="qr-verified-text"><i class="fa-solid fa-circle-check"></i> ${t.verifiedProtect}</span>
          </div>
        </div>
        <p class="qr-instructions">${t.qrModalSub}</p>
        <div class="qr-image-wrapper">
          <img id="qr-code-img" src="" alt="Google Play QR Code" width="220" height="220">
        </div>
        <div class="qr-modal-actions">
          <a id="qr-direct-link" href="" target="_blank" rel="noopener" class="btn-qr-direct">
            <i class="fa-brands fa-google-play"></i>
            <span>${locale === 'ar' ? 'فتح الرابط في متصفحك' : (locale === 'tr' ? 'Bağlantıyı Aç' : 'Open Direct Link')}</span>
          </a>
          <button class="btn-qr-close" onclick="document.getElementById('qr-modal').classList.remove('active')">${t.close}</button>
        </div>
      </div>
    </div>

    <!-- LIGHTBOX MODAL -->
    <div id="lightbox-modal" class="lightbox-backdrop" onclick="closeLightbox()">
      <div class="lightbox-content" onclick="event.stopPropagation()">
        <button class="lightbox-close" onclick="closeLightbox()"><i class="fa-solid fa-xmark"></i></button>
        <img id="lightbox-img" src="" alt="Screenshot Full Preview">
        <div id="lightbox-caption" class="lightbox-caption"></div>
      </div>
    </div>

    <!-- PAGE SPECIFIC STYLING -->
    <style>
      .apps-hero {
        position: relative;
        padding: 64px 20px 50px;
        background: linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%);
        color: #ffffff;
        text-align: center;
        overflow: hidden;
      }
      .apps-hero-bg {
        position: absolute;
        inset: 0;
        background-image: 
          radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.22) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.18) 0%, transparent 40%);
        pointer-events: none;
      }
      .apps-hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.22);
        padding: 6px 16px;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 700;
        color: #38bdf8;
        backdrop-filter: blur(12px);
        margin-bottom: 20px;
      }
      .apps-hero-title {
        font-size: clamp(2rem, 5vw, 3.2rem);
        font-weight: 900;
        line-height: 1.25;
        margin: 0 auto 18px;
        max-width: 900px;
        background: linear-gradient(135deg, #ffffff 30%, #cbd5e1 70%, #93c5fd 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .apps-hero-subtitle {
        font-size: clamp(1rem, 2.5vw, 1.2rem);
        line-height: 1.65;
        color: #94a3b8;
        max-width: 780px;
        margin: 0 auto 30px;
      }
      .apps-hero-cta {
        display: flex;
        justify-content: center;
        margin-bottom: 40px;
      }
      .btn-hero-store {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        background: #000000;
        color: #ffffff !important;
        border: 1.5px solid rgba(255, 255, 255, 0.3);
        padding: 14px 28px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 1.05rem;
        text-decoration: none;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        transition: all 0.25s ease;
      }
      .btn-hero-store:hover {
        transform: translateY(-3px);
        border-color: #38bdf8;
        box-shadow: 0 14px 30px rgba(56, 189, 248, 0.3);
      }
      .apps-stats-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;
        flex-wrap: wrap;
        padding: 16px 28px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        max-width: 820px;
        margin: 0 auto;
        backdrop-filter: blur(10px);
      }
      .app-stat-item {
        text-align: center;
      }
      .app-stat-item .stat-value {
        font-size: 1.45rem;
        font-weight: 900;
        color: #38bdf8;
      }
      .app-stat-item .stat-label {
        font-size: 0.78rem;
        color: #cbd5e1;
        font-weight: 600;
      }
      .stat-divider {
        width: 1px;
        height: 36px;
        background: rgba(255, 255, 255, 0.15);
      }

      /* Main section */
      .apps-main-section {
        padding: 48px 20px 80px;
        background: var(--bg-body);
      }

      /* Filter Bar */
      .apps-filter-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 36px;
        background: var(--bg-card);
        padding: 14px 18px;
        border-radius: 14px;
        border: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
      }
      .filter-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .filter-pill {
        border: 1px solid var(--border);
        background: var(--bg-site);
        color: var(--text-body);
        padding: 8px 16px;
        border-radius: 9999px;
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .filter-pill:hover,
      .filter-pill.active {
        background: var(--primary);
        color: #ffffff;
        border-color: var(--primary);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
      }
      .filter-search {
        position: relative;
        flex: 1;
        min-width: 240px;
        max-width: 340px;
      }
      .filter-search i {
        position: absolute;
        ${isRtl ? 'right: 14px' : 'left: 14px'};
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        font-size: 0.9rem;
      }
      .filter-search input {
        width: 100%;
        padding: 9px 16px;
        ${isRtl ? 'padding-right: 38px;' : 'padding-left: 38px;'};
        border-radius: 10px;
        border: 1.5px solid var(--border);
        background: var(--bg-site);
        color: var(--text-heading);
        font-size: 0.88rem;
        font-weight: 600;
        outline: none;
        transition: border-color 0.2s;
      }
      .filter-search input:focus {
        border-color: var(--primary);
      }

      /* App Grid */
      .apps-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
        gap: 28px;
        margin-bottom: 56px;
      }
      @media (max-width: 480px) {
        .apps-grid {
          grid-template-columns: 1fr;
        }
      }

      /* App Card */
      .app-card {
        background: var(--bg-card);
        border: 1.5px solid var(--border);
        border-radius: 20px;
        padding: 26px;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        overflow: hidden;
      }
      .app-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
        border-color: var(--primary);
      }
      .app-card-header {
        display: flex;
        gap: 18px;
        align-items: flex-start;
        margin-bottom: 20px;
      }
      .app-icon-container {
        position: relative;
        flex-shrink: 0;
      }
      .app-icon {
        width: 88px;
        height: 88px;
        border-radius: 20px;
        object-fit: cover;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.3);
        background: var(--bg-site);
        transition: transform 0.25s ease;
      }
      .app-card:hover .app-icon {
        transform: scale(1.04) rotate(1deg);
      }
      .app-verified-badge {
        position: absolute;
        bottom: -4px;
        ${isRtl ? 'left: -4px;' : 'right: -4px;'};
        background: #ffffff;
        color: #10b981;
        border-radius: 50%;
        font-size: 1.15rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }
      .app-meta {
        flex: 1;
        min-width: 0;
      }
      .app-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }
      .app-badge {
        font-size: 0.72rem;
        font-weight: 800;
        background: rgba(37, 99, 235, 0.1);
        color: var(--primary);
        padding: 3px 10px;
        border-radius: 9999px;
        display: inline-block;
      }
      .app-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
        font-weight: 800;
        color: #f59e0b;
      }
      .reviews-count {
        color: var(--text-muted);
        font-size: 0.72rem;
        font-weight: 600;
      }
      .app-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-heading);
        margin: 0 0 4px;
        line-height: 1.3;
      }
      .app-subtitle {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin: 0 0 10px;
        line-height: 1.4;
      }
      .app-tag-list {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .app-chip {
        font-size: 0.7rem;
        font-weight: 600;
        background: var(--bg-subtle);
        color: var(--text-muted);
        padding: 2px 8px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      /* Card Body */
      .app-card-body {
        margin-bottom: 22px;
      }
      .app-description {
        font-size: 0.88rem;
        line-height: 1.6;
        color: var(--text-body);
        margin-bottom: 16px;
      }
      .app-features-box {
        background: var(--bg-subtle);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px 16px;
        margin-bottom: 16px;
      }
      .features-heading {
        font-size: 0.82rem;
        font-weight: 800;
        color: var(--text-heading);
        margin: 0 0 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .features-heading i {
        color: #f59e0b;
      }
      .features-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .features-list li {
        font-size: 0.82rem;
        line-height: 1.45;
        color: var(--text-body);
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .feature-icon {
        color: #10b981;
        font-size: 0.85rem;
        margin-top: 3px;
        flex-shrink: 0;
      }

      /* Screenshots Strip */
      .screenshots-strip {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding: 6px 2px;
        scrollbar-width: thin;
      }
      .screenshot-thumb {
        position: relative;
        flex-shrink: 0;
        width: 80px;
        height: 130px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--border);
        cursor: pointer;
        box-shadow: var(--shadow-sm);
        transition: transform 0.2s;
      }
      .screenshot-thumb:hover {
        transform: scale(1.05);
      }
      .screenshot-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .screenshot-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .screenshot-thumb:hover .screenshot-overlay {
        opacity: 1;
      }

      /* Card Footer */
      .app-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-top: 18px;
        border-top: 1px solid var(--border);
        flex-wrap: wrap;
      }
      .app-install-stats {
        display: flex;
        flex-direction: column;
      }
      .stat-num {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--text-heading);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .stat-num i {
        color: #10b981;
      }
      .stat-label {
        font-size: 0.72rem;
        color: var(--text-muted);
      }
      .app-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .btn-qr {
        background: var(--bg-subtle);
        border: 1.5px solid var(--border);
        color: var(--text-heading);
        padding: 9px 14px;
        border-radius: 10px;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }
      .btn-qr:hover {
        border-color: var(--primary);
        color: var(--primary);
        background: var(--primary-light);
      }
      .btn-download {
        background: #000000;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 9px 16px;
        border-radius: 10px;
        font-size: 0.88rem;
        font-weight: 800;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }
      .btn-download:hover {
        transform: translateY(-2px);
        background: #1e293b;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
      }

      /* Why Section */
      .apps-why-section {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 40px 32px;
        margin-bottom: 50px;
        box-shadow: var(--shadow-sm);
      }
      .why-header {
        text-align: center;
        margin-bottom: 36px;
      }
      .why-eyebrow {
        font-size: 0.82rem;
        font-weight: 800;
        color: #10b981;
        text-transform: uppercase;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
      }
      .why-title {
        font-size: clamp(1.4rem, 3.5vw, 1.9rem);
        font-weight: 900;
        color: var(--text-heading);
        margin: 0;
      }
      .why-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 24px;
      }
      .why-card {
        padding: 24px;
        border-radius: 16px;
        background: var(--bg-subtle);
        border: 1px solid var(--border);
        transition: transform 0.2s ease;
      }
      .why-card:hover {
        transform: translateY(-4px);
      }
      .why-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        margin-bottom: 16px;
      }
      .why-card h3 {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-heading);
        margin: 0 0 8px;
      }
      .why-card p {
        font-size: 0.88rem;
        color: var(--text-muted);
        line-height: 1.55;
        margin: 0;
      }

      /* Developer Store Promo Banner */
      .dev-store-banner {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e1b4b 100%);
        color: #ffffff;
        border-radius: 24px;
        padding: 44px 36px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
        box-shadow: 0 16px 40px rgba(2, 132, 199, 0.25);
        flex-wrap: wrap;
      }
      .dev-banner-content {
        flex: 1;
        min-width: 280px;
      }
      .dev-badge-row {
        display: flex;
        gap: 8px;
        margin-bottom: 14px;
        flex-wrap: wrap;
      }
      .dev-mini-tag {
        font-size: 0.78rem;
        font-weight: 800;
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
        padding: 4px 12px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .dev-banner-content h2 {
        font-size: clamp(1.4rem, 3.5vw, 1.9rem);
        font-weight: 900;
        color: #ffffff;
        margin: 0 0 10px;
        line-height: 1.3;
      }
      .dev-banner-content p {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.6;
        margin: 0;
        max-width: 680px;
      }
      .btn-dev-cta {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: #ffffff;
        color: #0369a1 !important;
        padding: 14px 28px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 1rem;
        text-decoration: none;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      .btn-dev-cta:hover {
        transform: translateY(-3px);
        background: #f0f9ff;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
      }

      /* QR Modal */
      .qr-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        padding: 20px;
      }
      .qr-modal-backdrop.active {
        display: flex;
        animation: modalFade 0.2s ease-out;
      }
      .qr-modal-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 32px;
        max-width: 420px;
        width: 100%;
        position: relative;
        text-align: center;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
      }
      .qr-close-btn {
        position: absolute;
        top: 18px;
        ${isRtl ? 'left: 18px;' : 'right: 18px;'};
        background: var(--bg-subtle);
        border: 1px solid var(--border);
        color: var(--text-body);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
      }
      .qr-modal-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 14px;
        text-align: ${isRtl ? 'right' : 'left'};
      }
      .qr-app-icon {
        border-radius: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .qr-app-title {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--text-heading);
        margin: 0 0 2px;
      }
      .qr-verified-text {
        font-size: 0.72rem;
        color: #10b981;
        font-weight: 700;
      }
      .qr-instructions {
        font-size: 0.85rem;
        color: var(--text-muted);
        line-height: 1.5;
        margin: 0 0 20px;
      }
      .qr-image-wrapper {
        background: #ffffff;
        padding: 14px;
        border-radius: 16px;
        border: 2px dashed #cbd5e1;
        display: inline-block;
        margin-bottom: 24px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }
      .qr-image-wrapper img {
        display: block;
        border-radius: 8px;
      }
      .qr-modal-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .btn-qr-direct {
        background: #000000;
        color: #ffffff !important;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.9rem;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .btn-qr-close {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-body);
        padding: 10px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
      }

      /* Lightbox */
      .lightbox-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.9);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        padding: 20px;
      }
      .lightbox-backdrop.active {
        display: flex;
      }
      .lightbox-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        text-align: center;
      }
      .lightbox-content img {
        max-width: 100%;
        max-height: 82vh;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      }
      .lightbox-caption {
        color: #ffffff;
        margin-top: 14px;
        font-weight: 700;
        font-size: 1rem;
      }
      .lightbox-close {
        position: absolute;
        top: -46px;
        right: 0;
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        border: none;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        font-size: 1.1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      @keyframes modalFade {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    </style>

    <!-- CLIENT LOGIC -->
    <script>
      function filterApps(category, btn) {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        
        const cards = document.querySelectorAll('.app-card');
        cards.forEach(card => {
          if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      }

      function searchApps(query) {
        const q = (query || '').toLowerCase().trim();
        const cards = document.querySelectorAll('.app-card');
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          if (text.includes(q)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      }

      function openQrModal(title, icon, qrUrl, playUrl) {
        document.getElementById('qr-app-title').textContent = title;
        document.getElementById('qr-app-icon').src = icon;
        document.getElementById('qr-code-img').src = qrUrl;
        document.getElementById('qr-direct-link').href = playUrl;
        document.getElementById('qr-modal').classList.add('active');
      }

      function closeQrModal(e) {
        if (e.target.id === 'qr-modal') {
          document.getElementById('qr-modal').classList.remove('active');
        }
      }

      function openLightbox(imgUrl, caption) {
        document.getElementById('lightbox-img').src = imgUrl;
        document.getElementById('lightbox-caption').textContent = caption;
        document.getElementById('lightbox-modal').classList.add('active');
      }

      function closeLightbox() {
        document.getElementById('lightbox-modal').classList.remove('active');
      }

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          document.getElementById('qr-modal')?.classList.remove('active');
          document.getElementById('lightbox-modal')?.classList.remove('active');
        }
      });
    </script>
  `;

  const seoMetaTags = `
    <title>${t.pageTitle}</title>
    <meta name="description" content="${t.metaDesc}">
    <link rel="canonical" href="https://jobs-in-istanbul.com/${locale}/apps">
    <link rel="alternate" hreflang="ar" href="https://jobs-in-istanbul.com/ar/apps">
    <link rel="alternate" hreflang="en" href="https://jobs-in-istanbul.com/en/apps">
    <link rel="alternate" hreflang="tr" href="https://jobs-in-istanbul.com/tr/apps">
    <link rel="alternate" hreflang="x-default" href="https://jobs-in-istanbul.com/en/apps">
    <meta property="og:title" content="${t.pageTitle}">
    <meta property="og:description" content="${t.metaDesc}">
    <meta property="og:url" content="https://jobs-in-istanbul.com/${locale}/apps">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://jobs-in-istanbul.com/public/images/og-share.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${t.pageTitle}">
    <meta name="twitter:description" content="${t.metaDesc}">
    <script type="application/ld+json">${jsonLd}</script>
  `;

  c.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400');
  return c.html(renderLayout(c, t.pageTitle, contentHtml, locale, seoMetaTags));
});
