import { Hono } from 'hono'
import { renderLayout } from './public'
import { 
  getCachedOrFallbackPharmacies, 
  runPharmacyScraper 
} from '../services/pharmacy-scraper'

export const dutyPharmacyRouter = new Hono()

// District name mapping in 3 languages
const DISTRICT_NAMES: Record<string, { ar: string; en: string; tr: string; side: 'european' | 'asian' }> = {
  fatih: { ar: 'الفاتح', en: 'Fatih', tr: 'Fatih', side: 'european' },
  basaksehir: { ar: 'باشاك شهير', en: 'Basaksehir', tr: 'Başakşehir', side: 'european' },
  esenyurt: { ar: 'إسنيورت', en: 'Esenyurt', tr: 'Esenyurt', side: 'european' },
  beylikduzu: { ar: 'بيليك دوزو', en: 'Beylikduzu', tr: 'Beylikdüzü', side: 'european' },
  sisli: { ar: 'شيشلي', en: 'Sisli', tr: 'Şişli', side: 'european' },
  besiktas: { ar: 'بشيكتاش', en: 'Besiktas', tr: 'Beşiktaş', side: 'european' },
  kadikoy: { ar: 'كاديكوي', en: 'Kadikoy', tr: 'Kadıköy', side: 'asian' },
  uskudar: { ar: 'أوسكودار', en: 'Uskudar', tr: 'Üsküdar', side: 'asian' },
  umraniye: { ar: 'عمرانية', en: 'Umraniye', tr: 'Ümraniye', side: 'asian' },
  atasehir: { ar: 'أتاشهير', en: 'Atasehir', tr: 'Ataşehir', side: 'asian' },
  beyoglu: { ar: 'بي أوغلو (تقسيم)', en: 'Beyoglu (Taksim)', tr: 'Beyoğlu (Taksim)', side: 'european' },
  bakirkoy: { ar: 'باكركوي', en: 'Bakirkoy', tr: 'Bakırköy', side: 'european' },
  bahcelievler: { ar: 'باهتشلي إيفلر', en: 'Bahcelievler', tr: 'Bahçelievler', side: 'european' },
  bagcilar: { ar: 'باغجيلار', en: 'Bagcilar', tr: 'Bağcılar', side: 'european' },
  kucukcekmece: { ar: 'كوتشوك تشكمجة', en: 'Kucukcekmece', tr: 'Küçükçekmece', side: 'european' },
  avcilar: { ar: 'أفجلار', en: 'Avcilar', tr: 'Avcılar', side: 'european' },
  maltepe: { ar: 'مالتبة', en: 'Maltepe', tr: 'Maltepe', side: 'asian' },
  kartal: { ar: 'كارتال', en: 'Kartal', tr: 'Kartal', side: 'asian' },
  pendik: { ar: 'بينديك', en: 'Pendik', tr: 'Pendik', side: 'asian' },
  sariyer: { ar: 'ساريير (مسلك)', en: 'Sariyer (Maslak)', tr: 'Sarıyer (Maslak)', side: 'european' },
  kagithane: { ar: 'كاغد خانة', en: 'Kagithane', tr: 'Kağıthane', side: 'european' },
  eyupsultan: { ar: 'أيوب سلطان', en: 'Eyupsultan', tr: 'Eyüpsultan', side: 'european' },
  zeytinburnu: { ar: 'زيتون بورنو', en: 'Zeytinburnu', tr: 'Zeytinburnu', side: 'european' },
  gaziosmanpasa: { ar: 'غازي عثمان باشا', en: 'Gaziosmanpasa', tr: 'Gaziosmanpaşa', side: 'european' },
  sultangazi: { ar: 'سلطان غازي', en: 'Sultangazi', tr: 'Sultangazi', side: 'european' },
  esenler: { ar: 'إيسنلر', en: 'Esenler', tr: 'Esenler', side: 'european' },
  gungoren: { ar: 'غونغورين', en: 'Gungoren', tr: 'Güngören', side: 'european' },
  bayrampase: { ar: 'بايرام باشا', en: 'Bayrampase', tr: 'Bayrampaşa', side: 'european' },
  buyukcekmece: { ar: 'بويوك تشكمجة', en: 'Buyukcekmece', tr: 'Büyükçekmece', side: 'european' },
  beykoz: { ar: 'بيكوز', en: 'Beykoz', tr: 'Beykoz', side: 'asian' },
  cekmekoy: { ar: 'تشيكمه كوي', en: 'Cekmekoy', tr: 'Çekmeköy', side: 'asian' },
  sancaktepe: { ar: 'سانجاك تبه', en: 'Sancaktepe', tr: 'Sancaktepe', side: 'asian' },
  sultanbeyli: { ar: 'سلطان بيلي', en: 'Sultanbeyli', tr: 'Sultanbeyli', side: 'asian' },
  tuzla: { ar: 'توزلا', en: 'Tuzla', tr: 'Tuzla', side: 'asian' },
  arnavutkoy: { ar: 'أرناؤوط كوي (المطار)', en: 'Arnavutkoy (Airport)', tr: 'Arnavutköy (Havalimanı)', side: 'european' },
  silivri: { ar: 'سيليفري', en: 'Silivri', tr: 'Silivri', side: 'european' },
  catalca: { ar: 'تشاتالجا', en: 'Catalca', tr: 'Çatalca', side: 'european' },
  sile: { ar: 'شيله', en: 'Sile', tr: 'Şile', side: 'asian' },
  adalar: { ar: 'جزر الأمراء', en: 'Princes Islands', tr: 'Adalar', side: 'asian' }
};

// Root and language redirection
dutyPharmacyRouter.get('/nobetci-eczane', (c) => {
  const acceptLang = c.req.header('accept-language') || '';
  if (acceptLang.toLowerCase().startsWith('tr')) return c.redirect('/tr/nobetci-eczane');
  if (acceptLang.toLowerCase().startsWith('en')) return c.redirect('/en/nobetci-eczane');
  return c.redirect('/ar/nobetci-eczane');
});

dutyPharmacyRouter.get('/pharmacies-on-duty', (c) => c.redirect('/en/nobetci-eczane'));
dutyPharmacyRouter.get('/:locale/pharmacies-on-duty', (c) => {
  const locale = c.req.param('locale');
  return c.redirect(`/${locale}/nobetci-eczane`);
});
dutyPharmacyRouter.get('/:locale/duty-pharmacies', (c) => {
  const locale = c.req.param('locale');
  return c.redirect(`/${locale}/nobetci-eczane`);
});

// Admin refresh endpoint
dutyPharmacyRouter.all('/admin-api/refresh-pharmacies', async (c) => {
  try {
    const list = await runPharmacyScraper(c.env);
    return c.json({ success: true, count: list.length, updatedAt: new Date().toISOString() });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// JSON API endpoint for AJAX and mobile integration
dutyPharmacyRouter.get('/api/nobetci-eczaneler', async (c) => {
  const dataset = await getCachedOrFallbackPharmacies(c.env);
  const district = c.req.query('district')?.toLowerCase();
  const side = c.req.query('side')?.toLowerCase();

  let list = dataset.pharmacies;
  if (district) {
    list = list.filter(p => p.districtSlug.toLowerCase() === district || p.district.toLowerCase() === district);
  }
  if (side === 'european' || side === 'asian') {
    list = list.filter(p => p.side === side);
  }

  c.header('Cache-Control', 'public, max-age=600, s-maxage=1800');
  return c.json({
    success: true,
    date: dataset.date,
    updatedAt: dataset.updatedAt,
    dutyRange: dataset.dutyRange,
    count: list.length,
    pharmacies: list
  });
});

// Main Page: /:locale/nobetci-eczane
dutyPharmacyRouter.get('/:locale/nobetci-eczane', async (c) => {
  const locale = (c.req.param('locale') || 'ar') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') {
    return c.redirect('/ar/nobetci-eczane');
  }

  const isRtl = locale === 'ar' || locale === 'fa' || locale === 'ur';
  const queryDistrict = (c.req.query('district') || '').toLowerCase();
  const dataset = await getCachedOrFallbackPharmacies(c.env);

  // Localization Dictionary
  const t = {
    ar: {
      metaTitle: 'صيدليات الحراسة في إسطنبول اليوم | دليل الصيدليات المناوبة 24 ساعة لجميع المناطق الـ 39',
      metaDesc: 'دليل صيدليات الحراسة في إسطنبول اليوم (İstanbul Nöbetçi Eczaneler). ابحث عن أقرب صيدلية مناوبة في الفاتح، باشاك شهير، كاديكوي، أسنيورت وشيشلي مع الاتصال المباشر وخرائط جوجل وياندكس.',
      heroBadge: 'محدث لحظياً ومباشر اليوم',
      heroTitle: 'صيدليات الحراسة في إسطنبول اليوم',
      heroSubtitle: 'دليل الصيدليات المناوبة ليلاً وأيام العطلات في جميع مناطق إسطنبول الـ 39 مع الاتصال المباشر والملاحة عبر خرائط جوجل وياندكس.',
      dutyStatus: 'مفتوحة الآن • مناوبة حتى 08:30 صباحاً',
      emergencyTitle: 'أرقام الطوارئ المباشرة في تركيا',
      emergency112: '112 الإسعاف والطوارئ',
      emergency184: '184 استشارات وزارة الصحة',
      emergency114: '114 مركز السموم الوطني',
      findNearestBtn: '📍 العثور على أقرب صيدلية مني الآن',
      locating: 'جاري تحديد موقعك...',
      locationDenied: 'يرجى السماح بالوصول للموقع لتحديد أقرب صيدلية إليك.',
      filterAll: 'جميع المناطق (39)',
      filterEuropean: 'الجانب الأوروبي',
      filterAsian: 'الجانب الآسيوي',
      searchPlaceholder: 'ابحث باسم الصيدلية، الشارع، أو المنطقة (مثال: الفاتح، باشاك شهير)...',
      selectDistrict: 'اختر المنطقة مباشرة:',
      allDistrictsOption: 'جميع مناطق إسطنبول (الكل)',
      callNow: 'اتصال فوري',
      googleMaps: 'خرائط جوجل',
      yandexMaps: 'ياندكس',
      copyAddress: 'نسخ العنوان',
      addressCopied: 'تم نسخ العنوان بنجاح!',
      distanceKm: 'يبعد عنك تقريباً',
      directionsLabel: 'معلم العنوان:',
      dutyHoursLabel: 'أوقات الدوام:',
      noResultsTitle: 'لم يتم العثور على صيدليات مطابقة لخيارات البحث',
      noResultsSub: 'جرب اختيار منطقة أخرى أو إعادة ضبط الفلتر لعرض جميع الصيدليات المناوبة في إسطنبول.',
      resetFilters: 'إعادة تعيين الفلاتر',
      faqTitle: 'معلومات وإرشادات شراء الدواء وصيدليات الحراسة في تركيا',
      faq1Q: 'كيف تعمل صيدليات الحراسة (Nöbetçi Eczane) في تركيا؟',
      faq1A: 'تفتح الصيدليات العادية في إسطنبول من 09:00 صباحاً حتى 19:00 مساءً من الاثنين إلى السبت وتغلق بالكامل أيام الأحد. بعد 19:00 مساءً وفي أيام الأحد والعطلات الرسمية، تتولى صيدليات الحراسة المحددة تقديم الخدمة حتى 08:30 صباح اليوم التالي.',
      faq2Q: 'هل يمكن شراء الأدوية بدون وصفة طبية (Reçete)؟',
      faq2A: 'المسكنات الخفيفة والفيتامينات تباع عادة دون وصفة. أما المضادات الحيوية والمهدئات وأدوية الأمراض المزمنة فيمنع بيعها قانونياً في تركيا دون وصفة طبية صادرة عن طبيب مرخص أو رقم وصفة إلكترونية (e-Reçete).',
      faq3Q: 'ماذا أفعل إذا لم أكن أعرف الاسم التجاري للدواء في تركيا؟',
      faq3A: 'يمكنك إظهار علبة الدواء القديمة للصيدلاني، أو تزويده بـ "الاسم العلمي / المادة الفعالة" (Etken Madde) المكتوبة بخط صغير تحت الاسم التجاري، وسيمنحك البديل المطابق تماماً والمتوفر في السوق التركي.',
      totalPharmaciesText: 'صيدلية مناوبة متاحة الآن في 39 منطقة'
    },
    en: {
      metaTitle: 'Duty Pharmacies in Istanbul Today | 24/7 On-Duty Pharmacy Directory (All 39 Districts)',
      metaDesc: 'Find pharmacies on duty in Istanbul today (İstanbul Nöbetçi Eczaneler). Quick search for open night pharmacies in Fatih, Kadikoy, Basaksehir, Sisli, Esenyurt with direct phone dial and Google/Yandex maps directions.',
      heroBadge: 'Live & Updated Today',
      heroTitle: 'Pharmacies on Duty in Istanbul Today',
      heroSubtitle: 'Complete directory of 24/7 and night on-duty pharmacies across all 39 Istanbul districts with instant call and turn-by-turn map navigation.',
      dutyStatus: 'Open Now • On Duty Until 08:30 AM',
      emergencyTitle: 'Direct Emergency Helplines in Turkey',
      emergency112: '112 Emergency & Ambulance',
      emergency184: '184 Ministry of Health Helpline',
      emergency114: '114 National Poison Center',
      findNearestBtn: '📍 Find Nearest Duty Pharmacy to Me',
      locating: 'Locating your position...',
      locationDenied: 'Please allow location access to find nearby pharmacies.',
      filterAll: 'All Districts (39)',
      filterEuropean: 'European Side',
      filterAsian: 'Asian Side',
      searchPlaceholder: 'Search by pharmacy name, street, or district (e.g. Fatih, Kadikoy)...',
      selectDistrict: 'Quick District Filter:',
      allDistrictsOption: 'All Istanbul Districts',
      callNow: 'Call Now',
      googleMaps: 'Google Maps',
      yandexMaps: 'Yandex Maps',
      copyAddress: 'Copy Address',
      addressCopied: 'Address copied to clipboard!',
      distanceKm: 'Approx distance',
      directionsLabel: 'Landmark / Directions:',
      dutyHoursLabel: 'Duty Hours:',
      noResultsTitle: 'No pharmacies matched your current filter',
      noResultsSub: 'Try clearing the search query or selecting another district to view available duty pharmacies.',
      resetFilters: 'Reset Filters',
      faqTitle: 'Essential Guide to Duty Pharmacies and Prescriptions in Turkey',
      faq1Q: 'How do duty pharmacies (Nöbetçi Eczane) operate in Turkey?',
      faq1A: 'Regular pharmacies in Istanbul operate from 09:00 to 19:00 Monday to Saturday and are closed on Sundays. Outside these hours, on weekends, and on public holidays, designated duty pharmacies remain open overnight until 08:30 AM the next morning.',
      faq2Q: 'Can I purchase prescription medicine without a prescription in Turkey?',
      faq2A: 'Basic pain relievers and vitamins are available over-the-counter. Antibiotics, narcotics, and specialized medications strictly require a valid Turkish physician prescription or electronic prescription code (e-Reçete).',
      faq3Q: 'How can I find medication if the brand name is different?',
      faq3A: 'Show the pharmacist the active pharmaceutical ingredient (Etken Madde) written beneath the brand name on your medication box, and they will provide the exact bioequivalent available in Turkey.',
      totalPharmaciesText: 'on-duty pharmacies active right now across 39 districts'
    },
    tr: {
      metaTitle: 'İstanbul Nöbetçi Eczaneler Bugün | 39 İlçe 7/24 Açık Nöbetçi Eczane Listesi ve Yol Tarifi',
      metaDesc: 'Bugün İstanbul nöbetçi eczaneler listesi. Fatih, Kadıköy, Başakşehir, Şişli, Beşiktaş, Esenyurt ve tüm 39 ilçede açık nöbetçi eczane telefonları, adresleri, Google ve Yandex Harita yol tarifi.',
      heroBadge: 'Bugün Canlı ve Güncel',
      heroTitle: 'İstanbul Nöbetçi Eczaneler Bugün',
      heroSubtitle: 'İstanbul\'un 39 ilçesinde bu gece ve tatil günlerinde açık olan nöbetçi eczanelerin tam listesi, tek tıkla arama ve harita yol tarifi.',
      dutyStatus: 'Şu Anda Açık • Sabah 08:30\'a Kadar Nöbetçi',
      emergencyTitle: 'Türkiye Acil Çağrı ve Sağlık Hatları',
      emergency112: '112 Acil Çağrı Merkezi',
      emergency184: '184 SABİM Sağlık Danışma',
      emergency114: '114 Ulusal Zehir Danışma',
      findNearestBtn: '📍 Bana En Yakın Nöbetçi Eczaneyi Bul',
      locating: 'Konumunuz alınıyor...',
      locationDenied: 'En yakın nöbetçi eczaneyi bulmak için lütfen konum izni veriniz.',
      filterAll: 'Tüm İlçeler (39)',
      filterEuropean: 'Avrupa Yakası',
      filterAsian: 'Anadolu Yakası',
      searchPlaceholder: 'Eczane adı, mahalle, cadde veya ilçe ara (örn. Fatih, Kadıköy, Başakşehir)...',
      selectDistrict: 'İlçe Seçiniz:',
      allDistrictsOption: 'Tüm İstanbul İlçeleri',
      callNow: 'Hemen Ara',
      googleMaps: 'Google Haritalar',
      yandexMaps: 'Yandex Harita',
      copyAddress: 'Adresi Kopyala',
      addressCopied: 'Adres panoya kopyalandı!',
      distanceKm: 'Yaklaşık mesafe',
      directionsLabel: 'Adres Tarifi:',
      dutyHoursLabel: 'Nöbet Saatleri:',
      noResultsTitle: 'Aradığınız kriterlere uygun nöbetçi eczane bulunamadı',
      noResultsSub: 'Filtreleri sıfırlayarak tüm ilçelerdeki açık nöbetçi eczaneleri görebilirsiniz.',
      resetFilters: 'Filtreleri Sıfırla',
      faqTitle: 'İstanbul Nöbetçi Eczane ve İlaç Temini Hakkında Sıkça Sorulan Sorular',
      faq1Q: 'İstanbul\'da nöbetçi eczaneler nasıl çalışır?',
      faq1A: 'Eczaneler hafta içi ve cumartesi günleri 09:00-19:00 saatleri arasında açıktır. Pazar günleri ve resmi tatillerde kapalıdır. Saat 19:00\'dan sonra ve tatil günlerinde nöbetçi eczaneler ertesi gün sabah 08:30\'a kadar kesintisiz hizmet verir.',
      faq2Q: 'Reçetesiz antibiyotik veya ilaç alınabilir mi?',
      faq2A: 'Türkiye\'de antibiyotikler, psikotrop ilaçlar ve raporlu kronik ilaçlar reçetesiz kesinlikle satılamaz. Basit ağrı kesiciler ve vitaminler reçetesiz temin edilebilir.',
      faq3Q: 'Yurt dışından gelen ilacımın muadilini nasıl bulurum?',
      faq3A: 'İlacınızın kutusu üzerindeki "Etken Madde" (Generic name) bilgisini eczacıya gösterdiğinizde, Türkiye\'deki birebir eşdeğer ilacı temin edebilirsiniz.',
      totalPharmaciesText: 'nöbetçi eczane 39 ilçede şu an aktif'
    },
    ru: {
      metaTitle: 'Дежурные аптеки в Стамбуле сегодня | Список круглосуточных аптек',
      metaDesc: 'Дежурные аптеки Стамбула (İstanbul Nöbetçi Eczaneler). Поиск ближайшей дежурной аптеки по всем 39 районам с номерами телефонов и маршрутами на карте.',
      heroBadge: 'Актуально сегодня',
      heroTitle: 'Дежурные аптеки в Стамбуле сегодня',
      heroSubtitle: 'Полный список дежурных ночных аптек во всех 39 районах Стамбула с прямым звонком и маршрутами Google/Yandex Maps.',
      dutyStatus: 'Открыто сейчас • Дежурит до 08:30 утра',
      emergencyTitle: 'Телефоны экстренных служб в Турции',
      emergency112: '112 Скорая помощь и спасение',
      emergency184: '184 Консультация Минздрава',
      emergency114: '114 Токсикологический центр',
      findNearestBtn: '📍 Найти ближайшую дежурную аптеку',
      locating: 'Определение местоположения...',
      locationDenied: 'Пожалуйста, разрешите доступ к геолокации.',
      filterAll: 'Все районы (39)',
      filterEuropean: 'Европейская часть',
      filterAsian: 'Азиатская часть',
      searchPlaceholder: 'Поиск по названию, улице или району...',
      selectDistrict: 'Выберите район:',
      allDistrictsOption: 'Все районы Стамбула',
      callNow: 'Позвонить',
      googleMaps: 'Google Maps',
      yandexMaps: 'Яндекс Карты',
      copyAddress: 'Скопировать адрес',
      addressCopied: 'Адрес скопирован!',
      distanceKm: 'Примерное расстояние',
      directionsLabel: 'Ориентир:',
      dutyHoursLabel: 'Часы дежурства:',
      noResultsTitle: 'Аптеки не найдены',
      noResultsSub: 'Попробуйте изменить параметры поиска.',
      resetFilters: 'Сбросить фильтры',
      faqTitle: 'Часто задаваемые вопросы о дежурных аптеках в Турции',
      faq1Q: 'Как работают дежурные аптеки в Турции?',
      faq1A: 'Обычные аптеки работают с 09:00 до 19:00, воскресенье — выходной. Дежурные аптеки работают с 19:00 до 08:30 утра следующего дня, а также круглосуточно по воскресеньям.',
      faq2Q: 'Можно ли купить лекарства без рецепта?',
      faq2A: 'Простые обезболивающие продаются без рецепта, но антибиотики строго требуют рецепта врача.',
      faq3Q: 'Как найти аналог своего лекарства?',
      faq3A: 'Назовите фармацевту международное непатентованное название (действующее вещество, Etken Madde).',
      totalPharmaciesText: 'дежурных аптек открыты прямо сейчас'
    },
    fa: {
      metaTitle: 'داروخانه‌های شبانه‌روزی استانبول امروز | لیست نوبت‌دار ۳۹ منطقه',
      metaDesc: 'داروخانه‌های کشیک و شبانه‌روزی استانبول امروز (Nöbetçi Eczane). جستجوی نزدیک‌ترین داروخانه در تمام مناطق با تماس مستقیم و نقشه.',
      heroBadge: 'به‌روزرسانی لحظه‌ای امروز',
      heroTitle: 'داروخانه‌های شبانه‌روزی استانبول امروز',
      heroSubtitle: 'راهنمای کامل داروخانه‌های نوبت‌دار و شبانه‌روزی در ۳۹ منطقه استانبول با تماس تلفنی مستقیم و مسیریابی.',
      dutyStatus: 'هم‌اکنون باز است • کشیک تا ۸:۳۰ صبح',
      emergencyTitle: 'شماره‌های اضطراری در ترکیه',
      emergency112: '۱۱۲ اورژانس و امداد',
      emergency184: '۱۸۴ مشاوره وزارت بهداشت',
      emergency114: '۱۱۴ مرکز مسمومیت',
      findNearestBtn: '📍 نزدیک‌ترین داروخانه به من را پیدا کن',
      locating: 'در حال دریافت موقعیت مکانی...',
      locationDenied: 'لطفاً دسترسی به موقعیت مکانی را فعال کنید.',
      filterAll: 'همه مناطق (۳۹)',
      filterEuropean: 'بخش اروپایی',
      filterAsian: 'بخش آسیایی',
      searchPlaceholder: 'جستجو با نام داروخانه، خیابان یا منطقه...',
      selectDistrict: 'انتخاب منطقه:',
      allDistrictsOption: 'تمام مناطق استانبول',
      callNow: 'تماس مستقیم',
      googleMaps: 'نقشه گوگل',
      yandexMaps: 'نقشه یاندکس',
      copyAddress: 'کپی آدرس',
      addressCopied: 'آدرس کپی شد!',
      distanceKm: 'فاصله تقریبی',
      directionsLabel: 'راهنمای آدرس:',
      dutyHoursLabel: 'ساعات کشیک:',
      noResultsTitle: 'داروخانه‌ای یافت نشد',
      noResultsSub: 'لطفاً فیلترها را ریست کنید.',
      resetFilters: 'تنظیم مجدد فیلترها',
      faqTitle: 'راهنمای داروخانه‌های شبانه‌روزی در ترکیه',
      faq1Q: 'داروخانه‌های کشیک ترکیه چگونه کار می‌کنند؟',
      faq1A: 'داروخانه‌های معمولی از ۹ تا ۱۹ باز هستند و یکشنبه‌ها تعطیلند. داروخانه‌های نوبت‌دار از ۱۹ تا ۸:۳۰ صبح فردا باز می‌مانند.',
      faq2Q: 'آیا خرید آنتی‌بیوتیک بدون نسخه امکان‌پذیر است؟',
      faq2A: 'خیر، آنتی‌بیوتیک‌ها در ترکیه فقط با نسخه معتبر پزشک به فروش می‌رسند.',
      faq3Q: 'چگونه معادل داروی خود را پیدا کنم؟',
      faq3A: 'نام ماده موثره داروی خود (Etken Madde) را به داروساز نشان دهید.',
      totalPharmaciesText: 'داروخانه کشیک فعال در ۳۹ منطقه'
    },
    ur: {
      metaTitle: 'استنبول میں آج کی ڈیوٹی فارمیسیز | 24 گھنٹے میڈیکل اسٹورز',
      metaDesc: 'استنبول میں ڈیوٹی فارمیسیز کی مکمل فہرست (İstanbul Nöbetçi Eczaneler)۔ تمام 39 اضلاع میں کھلی فارمیسیز، کال اور گوگل میپس نیویگیشن۔',
      heroBadge: 'آج کی تازہ ترین فہرست',
      heroTitle: 'استنبول میں آج کی ڈیوٹی فارمیسیز',
      heroSubtitle: 'استنبول کے تمام 39 اضلاع میں رات کی ڈیوٹی فارمیسیز کی مکمل فہرست مع فون کال اور نقشہ۔',
      dutyStatus: 'ابھی کھلا ہے • صبح 08:30 بجے تک ڈیوٹی',
      emergencyTitle: 'ترکی میں ایمرجنسی نمبرز',
      emergency112: '112 ایمبولینس اور ایمرجنسی',
      emergency184: '184 وزارت صحت ہیلپ لائن',
      emergency114: '114 زہر سے بچاؤ کا مرکز',
      findNearestBtn: '📍 میرے قریب ترین ڈیوٹی فارمیسی تلاش کریں',
      locating: 'مقام کا تعین کیا جا رہا ہے...',
      locationDenied: 'براہ کرم لوکیشن کی اجازت دیں۔',
      filterAll: 'تمام اضلاع (39)',
      filterEuropean: 'یورپی حصہ',
      filterAsian: 'ایشیائی حصہ',
      searchPlaceholder: 'فارمیسی کا نام، گلی یا ضلع تلاش کریں...',
      selectDistrict: 'ضلع منتخب کریں:',
      allDistrictsOption: 'تمام استنبول اضلاع',
      callNow: 'ابھی کال کریں',
      googleMaps: 'گوگل میپس',
      yandexMaps: 'Yandex نقشہ',
      copyAddress: 'پتہ کاپی کریں',
      addressCopied: 'پتہ کاپی ہو گیا!',
      distanceKm: 'تقریباً فاصلہ',
      directionsLabel: 'پتہ کی علامت:',
      dutyHoursLabel: 'ڈیوٹی کے اوقات:',
      noResultsTitle: 'کوئی فارمیسی نہیں ملی',
      noResultsSub: 'براہ کرم فیلٹرز ری سیٹ کریں۔',
      resetFilters: 'فیلٹرز دوبارہ ترتیب دیں',
      faqTitle: 'ترکی میں ڈیوٹی فارمیسیوں کے بارے میں ضروری معلومات',
      faq1Q: 'ترکی میں ڈیوٹی فارمیسیز کیسے کام کرتی ہیں؟',
      faq1A: 'عام فارمیسیز صبح 9 سے شام 7 بجے تک کھلتی ہیں۔ اس کے بعد ڈیوٹی فارمیسیز صبح 8:30 تک کھلی رہتی ہیں۔',
      faq2Q: 'کیا ڈاکٹر کے نسخے کے بغیر دوائی مل سکتی ہے؟',
      faq2A: 'اینٹی بائیوٹکس صرف ڈاکٹر کے مستند نسخے کے ساتھ ملتی ہیں۔',
      faq3Q: 'اگر برانڈ کا نام مختلف ہو تو دوائی کیسے لیں؟',
      faq3A: 'فارماسسٹ کو دوائی کا ایکٹو فارمولا (Etken Madde) دکھائیں۔',
      totalPharmaciesText: 'ڈیوٹی فارمیسیز ابھی فعال ہیں'
    }
  }[locale] || {
    metaTitle: 'Duty Pharmacies in Istanbul Today',
    metaDesc: 'Find duty pharmacies in Istanbul today.',
    heroBadge: 'Live & Updated Today',
    heroTitle: 'Pharmacies on Duty in Istanbul Today',
    heroSubtitle: 'Complete directory of duty pharmacies across Istanbul.',
    dutyStatus: 'Open Now • On Duty Until 08:30 AM',
    emergencyTitle: 'Emergency Lines',
    emergency112: '112 Emergency',
    emergency184: '184 Health Info',
    emergency114: '114 Poison Info',
    findNearestBtn: 'Find Nearest Duty Pharmacy',
    locating: 'Locating...',
    locationDenied: 'Location permission denied.',
    filterAll: 'All Districts',
    filterEuropean: 'European Side',
    filterAsian: 'Asian Side',
    searchPlaceholder: 'Search pharmacy or district...',
    selectDistrict: 'Select District:',
    allDistrictsOption: 'All Districts',
    callNow: 'Call Now',
    googleMaps: 'Google Maps',
    yandexMaps: 'Yandex Maps',
    copyAddress: 'Copy Address',
    addressCopied: 'Address Copied!',
    distanceKm: 'Approx distance',
    directionsLabel: 'Directions:',
    dutyHoursLabel: 'Hours:',
    noResultsTitle: 'No pharmacies found',
    noResultsSub: 'Try clearing filters.',
    resetFilters: 'Reset Filters',
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'How do duty pharmacies work in Turkey?',
    faq1A: 'Duty pharmacies stay open overnight and on holidays.',
    faq2Q: 'Can I get antibiotics over the counter?',
    faq2A: 'Antibiotics strictly require a doctor prescription.',
    faq3Q: 'How to find equivalent medication?',
    faq3A: 'Provide the active ingredient name.',
    totalPharmaciesText: 'on-duty pharmacies active right now'
  };

  const pharmacies = dataset.pharmacies;

  // JSON-LD Structured Data Schema for Search Engines
  const schemaOrgData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': pharmacies.slice(0, 15).map((p, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'item': {
        '@type': 'Pharmacy',
        'name': p.name,
        'telephone': p.phone,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': p.address,
          'addressLocality': p.district,
          'addressRegion': 'İstanbul',
          'addressCountry': 'TR'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': p.latitude,
          'longitude': p.longitude
        },
        'openingHours': 'Mo-Su 19:00-08:30'
      }
    }))
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
    <link rel="canonical" href="https://jobs-in-istanbul.com/${locale}/nobetci-eczane">
    <link rel="alternate" hreflang="ar" href="https://jobs-in-istanbul.com/ar/nobetci-eczane" />
    <link rel="alternate" hreflang="en" href="https://jobs-in-istanbul.com/en/nobetci-eczane" />
    <link rel="alternate" hreflang="tr" href="https://jobs-in-istanbul.com/tr/nobetci-eczane" />
    <link rel="alternate" hreflang="x-default" href="https://jobs-in-istanbul.com/ar/nobetci-eczane" />
    <meta property="og:title" content="${t.metaTitle}">
    <meta property="og:description" content="${t.metaDesc}">
    <meta property="og:url" content="https://jobs-in-istanbul.com/${locale}/nobetci-eczane">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${locale === 'ar' ? 'ar_AR' : (locale === 'tr' ? 'tr_TR' : 'en_US')}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${t.metaTitle}">
    <meta name="twitter:description" content="${t.metaDesc}">
    <script type="application/ld+json">${JSON.stringify(schemaOrgData)}</script>
    <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  `;

  const html = `
    <style>
      .pharmacy-page-wrapper {
        direction: ${isRtl ? 'rtl' : 'ltr'};
        font-family: inherit;
        color: var(--text-dark, #1e293b);
      }

      .pharmacy-hero {
        background: linear-gradient(135deg, #047857 0%, #065f46 60%, #0f172a 100%);
        color: white;
        padding: 48px 24px 40px;
        border-radius: 28px;
        margin-bottom: 32px;
        box-shadow: 0 16px 40px rgba(6, 95, 70, 0.22);
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .pharmacy-hero::after {
        content: '';
        position: absolute;
        bottom: -50px;
        ${isRtl ? 'left: -50px;' : 'right: -50px;'}
        width: 260px;
        height: 260px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(255,255,255,0) 70%);
        pointer-events: none;
      }

      .live-pulse-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.16);
        backdrop-filter: blur(8px);
        padding: 6px 16px;
        border-radius: 30px;
        font-size: 0.84rem;
        font-weight: 700;
        letter-spacing: 0.2px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        margin-bottom: 16px;
      }

      .pulse-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 10px #10b981;
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
        70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
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
        opacity: 0.92;
        max-width: 820px;
        margin-bottom: 24px;
      }

      .emergency-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 20px;
      }

      .emergency-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(239, 68, 68, 0.18);
        color: #fef2f2;
        border: 1px solid rgba(248, 113, 113, 0.4);
        padding: 8px 18px;
        border-radius: 12px;
        font-size: 0.88rem;
        font-weight: 800;
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .emergency-btn:hover {
        background: rgba(239, 68, 68, 0.35);
        color: #ffffff;
        transform: translateY(-2px);
      }

      .geo-nearest-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: #ffffff;
        color: #065f46 !important;
        font-weight: 900;
        font-size: 1rem;
        padding: 13px 26px;
        border-radius: 16px;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        transition: all 0.25s ease;
        margin-top: 8px;
      }

      .geo-nearest-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
        background: #f0fdf4;
      }

      /* Control Toolbar */
      .pharmacy-toolbar {
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--border, #e2e8f0);
        border-radius: 20px;
        padding: 24px;
        margin-bottom: 30px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
      }

      .search-box-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }

      .pharmacy-search-input {
        flex: 1;
        min-width: 260px;
        padding: 14px 20px;
        border-radius: 14px;
        border: 1.5px solid var(--border, #cbd5e1);
        font-size: 0.98rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
        background: var(--bg-input, #f8fafc);
        color: var(--text-dark, #0f172a);
      }

      .pharmacy-search-input:focus {
        border-color: #059669;
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
      }

      .side-tabs-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .side-tab-btn {
        padding: 10px 18px;
        border-radius: 12px;
        border: 1px solid var(--border, #e2e8f0);
        background: var(--bg-subtle, #f1f5f9);
        color: var(--text-muted, #475569);
        font-weight: 700;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .side-tab-btn.active, .side-tab-btn:hover {
        background: #059669;
        color: white;
        border-color: #059669;
      }

      .districts-pill-scroll {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 8px;
        scrollbar-width: thin;
      }

      .district-pill {
        white-space: nowrap;
        padding: 7px 16px;
        border-radius: 20px;
        border: 1px solid var(--border, #cbd5e1);
        background: var(--bg-card, #ffffff);
        color: var(--text-dark, #334155);
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }

      .district-pill.active, .district-pill:hover {
        background: #065f46;
        color: #ffffff;
        border-color: #065f46;
      }

      /* Pharmacies Grid */
      .pharmacies-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 24px;
        margin-bottom: 40px;
      }

      @media (max-width: 640px) {
        .pharmacies-grid {
          grid-template-columns: 1fr;
        }
      }

      .pharmacy-card {
        background: var(--bg-card, #ffffff);
        border: 1.5px solid var(--border, #e2e8f0);
        border-radius: 22px;
        padding: 24px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        transition: all 0.25s ease;
      }

      .pharmacy-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.09);
        border-color: #10b981;
      }

      .card-header-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .pharmacy-name {
        font-size: 1.3rem;
        font-weight: 900;
        color: var(--text-heading, #0f172a);
        line-height: 1.3;
      }

      .district-badge {
        font-size: 0.76rem;
        font-weight: 800;
        padding: 5px 12px;
        border-radius: 16px;
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
        white-space: nowrap;
      }

      .duty-status-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.78rem;
        font-weight: 800;
        color: #059669;
        margin-bottom: 16px;
      }

      .pharmacy-address-box {
        background: var(--bg-subtle, #f8fafc);
        border: 1px dashed var(--border, #cbd5e1);
        border-radius: 14px;
        padding: 14px 16px;
        margin-bottom: 14px;
        font-size: 0.92rem;
        line-height: 1.55;
        position: relative;
      }

      .address-text {
        font-weight: 600;
        color: var(--text-dark, #1e293b);
        margin-bottom: 6px;
      }

      .directions-tip {
        font-size: 0.8rem;
        color: #0284c7;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .copy-address-btn {
        margin-top: 8px;
        font-size: 0.74rem;
        font-weight: 800;
        color: #059669;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .distance-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 0.78rem;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 10px;
        margin-bottom: 14px;
        border: 1px solid #bfdbfe;
      }

      .card-actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 14px;
      }

      .action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 11px 16px;
        border-radius: 12px;
        font-size: 0.86rem;
        font-weight: 800;
        text-decoration: none;
        transition: all 0.2s ease;
        text-align: center;
      }

      .btn-call {
        background: #059669;
        color: #ffffff !important;
        grid-column: span 2;
        font-size: 0.96rem;
        box-shadow: 0 4px 14px rgba(5, 150, 105, 0.28);
      }

      .btn-call:hover {
        background: #047857;
        transform: translateY(-2px);
      }

      .btn-google {
        background: #ffffff;
        color: #1e293b !important;
        border: 1.5px solid #cbd5e1;
      }

      .btn-google:hover {
        border-color: #3b82f6;
        color: #2563eb !important;
        background: #f8fafc;
      }

      .btn-yandex {
        background: #ffffff;
        color: #1e293b !important;
        border: 1.5px solid #cbd5e1;
      }

      .btn-yandex:hover {
        border-color: #ef4444;
        color: #dc2626 !important;
        background: #fef2f2;
      }

      /* Guide and FAQ */
      .pharmacy-guide-section {
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--border, #e2e8f0);
        border-radius: 24px;
        padding: 36px 30px;
        margin-top: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
      }

      .guide-title {
        font-size: 1.45rem;
        font-weight: 900;
        margin-bottom: 24px;
        color: var(--text-heading, #0f172a);
      }

      .faq-card {
        border-bottom: 1px solid var(--border, #e2e8f0);
        padding: 20px 0;
      }

      .faq-card:last-child {
        border-bottom: none;
      }

      .faq-question {
        font-weight: 800;
        font-size: 1.1rem;
        margin-bottom: 8px;
        color: #047857;
      }

      .faq-answer {
        font-size: 0.95rem;
        line-height: 1.65;
        color: var(--text-dark, #334155);
      }

      /* Toast Notification */
      #toast-notice {
        position: fixed;
        bottom: 24px;
        ${isRtl ? 'left: 24px;' : 'right: 24px;'}
        background: #065f46;
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
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>

    <div class="pharmacy-page-wrapper">
      
      <!-- Hero Banner -->
      <section class="pharmacy-hero">
        <div class="live-pulse-badge">
          <span class="pulse-dot"></span>
          <span>${t.heroBadge} • ${dataset.date}</span>
        </div>
        <h1 class="hero-title">${t.heroTitle}</h1>
        <p class="hero-subtitle">${t.heroSubtitle}</p>

        <button id="btn-find-nearest" class="geo-nearest-btn">
          ${t.findNearestBtn}
        </button>

        <div class="emergency-strip">
          <a href="tel:112" class="emergency-btn">🚑 ${t.emergency112}</a>
          <a href="tel:184" class="emergency-btn">📞 ${t.emergency184}</a>
          <a href="tel:114" class="emergency-btn">🧪 ${t.emergency114}</a>
        </div>
      </section>

      <!-- Interactive Toolbar -->
      <section class="pharmacy-toolbar">
        <div class="search-box-row">
          <input 
            type="text" 
            id="pharmacy-search" 
            class="pharmacy-search-input" 
            placeholder="${t.searchPlaceholder}"
            autocomplete="off"
          />

          <div class="side-tabs-container">
            <button class="side-tab-btn active" data-side="all">${t.filterAll}</button>
            <button class="side-tab-btn" data-side="european">${t.filterEuropean}</button>
            <button class="side-tab-btn" data-side="asian">${t.filterAsian}</button>
          </div>
        </div>

        <div style="margin-bottom: 12px; font-weight: 800; font-size: 0.88rem; color: var(--text-muted);">
          ${t.selectDistrict}
        </div>

        <!-- Horizontal District Chips Scroll -->
        <div class="districts-pill-scroll" id="district-chips">
          <button class="district-pill active" data-district="all">${t.allDistrictsOption}</button>
          ${Object.entries(DISTRICT_NAMES).map(([key, val]) => `
            <button class="district-pill" data-district="${key}" data-side="${val.side}">
              ${locale === 'ar' ? val.ar : (locale === 'tr' ? val.tr : val.en)}
            </button>
          `).join('')}
        </div>
      </section>

      <!-- Active Counter -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding: 0 4px;">
        <span id="pharmacies-count-label" style="font-weight: 800; font-size: 0.95rem; color: var(--text-muted);">
          <strong id="count-number" style="color: #059669; font-size: 1.15rem;">${pharmacies.length}</strong> ${t.totalPharmaciesText}
        </span>
        <span style="font-size: 0.82rem; color: #059669; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
          <span class="pulse-dot" style="width: 8px; height: 8px;"></span> ${t.dutyStatus}
        </span>
      </div>

      <!-- Pharmacies Grid -->
      <div class="pharmacies-grid" id="pharmacies-grid">
        ${pharmacies.map(p => {
          const districtInfo = DISTRICT_NAMES[p.districtSlug.toLowerCase()] || { ar: p.district, en: p.district, tr: p.district };
          const districtDisplayName = locale === 'ar' ? districtInfo.ar : (locale === 'tr' ? districtInfo.tr : districtInfo.en);
          const directionText = p.directions ? (locale === 'ar' ? p.directions.ar : (locale === 'tr' ? p.directions.tr : p.directions.en)) : '';

          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`;
          const yandexMapsUrl = `https://yandex.com/maps/?rtext=~${p.latitude}%2C${p.longitude}&rtt=auto`;

          return `
            <article 
              class="pharmacy-card" 
              data-district="${p.districtSlug.toLowerCase()}" 
              data-side="${p.side}" 
              data-name="${p.name.toLowerCase()}" 
              data-address="${p.address.toLowerCase()}"
              data-lat="${p.latitude}"
              data-lng="${p.longitude}"
            >
              <div>
                <div class="card-header-row">
                  <h2 class="pharmacy-name">${p.name}</h2>
                  <span class="district-badge">${districtDisplayName}</span>
                </div>

                <div class="duty-status-tag">
                  <span class="pulse-dot" style="width: 7px; height: 7px;"></span>
                  <span>${t.dutyStatus}</span>
                </div>

                <div class="distance-placeholder" style="display: none;"></div>

                <div class="pharmacy-address-box">
                  <div class="address-text">${p.address}</div>
                  ${directionText ? `
                    <div class="directions-tip">
                      <span>📍 ${t.directionsLabel}</span>
                      <span>${directionText}</span>
                    </div>
                  ` : ''}
                  <button class="copy-address-btn" onclick="copyPharmacyAddress('${p.address.replace(/'/g, "\\'")}')">
                    📋 ${t.copyAddress}
                  </button>
                </div>
              </div>

              <div>
                <div class="card-actions-grid">
                  <a href="tel:${p.phoneFormatted.replace(/\s+/g, '')}" class="action-btn btn-call">
                    📞 ${t.callNow} (${p.phoneFormatted})
                  </a>
                  <a href="${googleMapsUrl}" target="_blank" rel="noopener" class="action-btn btn-google">
                    🗺️ ${t.googleMaps}
                  </a>
                  <a href="${yandexMapsUrl}" target="_blank" rel="noopener" class="action-btn btn-yandex">
                    🧭 ${t.yandexMaps}
                  </a>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>

      <!-- No Results State -->
      <div id="no-results-state" style="display: none; text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: 20px; border: 1.5px dashed var(--border); margin-bottom: 40px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🏥</div>
        <h3 style="font-size: 1.3rem; font-weight: 900; margin-bottom: 8px;">${t.noResultsTitle}</h3>
        <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 20px;">${t.noResultsSub}</p>
        <button id="btn-reset-filters" class="side-tab-btn active" style="padding: 10px 24px; border-radius: 14px;">
          ${t.resetFilters}
        </button>
      </div>

      <!-- FAQ & Patient Guide Section -->
      <section class="pharmacy-guide-section">
        <h2 class="guide-title">🩺 ${t.faqTitle}</h2>
        <div class="faq-card">
          <div class="faq-question">${t.faq1Q}</div>
          <div class="faq-answer">${t.faq1A}</div>
        </div>
        <div class="faq-card">
          <div class="faq-question">${t.faq2Q}</div>
          <div class="faq-answer">${t.faq2A}</div>
        </div>
        <div class="faq-card">
          <div class="faq-question">${t.faq3Q}</div>
          <div class="faq-answer">${t.faq3A}</div>
        </div>
      </section>

    </div>

    <!-- Toast Notification Element -->
    <div id="toast-notice">
      <span>✓</span>
      <span id="toast-message">${t.addressCopied}</span>
    </div>

    <!-- Client-Side Search, Filter & Geolocation Script -->
    <script>
      (function() {
        let activeSide = 'all';
        let activeDistrict = '${queryDistrict}' || 'all';
        let searchQuery = '';
        let userLocation = null;

        const cards = document.querySelectorAll('.pharmacy-card');
        const searchInput = document.getElementById('pharmacy-search');
        const sideBtns = document.querySelectorAll('.side-tab-btn');
        const districtPills = document.querySelectorAll('.district-pill');
        const countNumber = document.getElementById('count-number');
        const noResults = document.getElementById('no-results-state');
        const resetBtn = document.getElementById('btn-reset-filters');
        const findNearestBtn = document.getElementById('btn-find-nearest');
        const toast = document.getElementById('toast-notice');

        // Copy address helper
        window.copyPharmacyAddress = function(text) {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
              showToast('${t.addressCopied}');
            }).catch(() => fallbackCopy(text));
          } else {
            fallbackCopy(text);
          }
        };

        function fallbackCopy(text) {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast('${t.addressCopied}');
        }

        function showToast(msg) {
          if (!toast) return;
          document.getElementById('toast-message').textContent = msg;
          toast.style.display = 'flex';
          setTimeout(() => {
            toast.style.display = 'none';
          }, 2400);
        }

        function applyFilters() {
          let visibleCount = 0;
          const query = searchQuery.trim().toLowerCase();

          cards.forEach(card => {
            const cardDistrict = card.getAttribute('data-district');
            const cardSide = card.getAttribute('data-side');
            const cardName = card.getAttribute('data-name') || '';
            const cardAddress = card.getAttribute('data-address') || '';

            const sideMatch = (activeSide === 'all' || cardSide === activeSide);
            const districtMatch = (activeDistrict === 'all' || cardDistrict === activeDistrict);
            const textMatch = !query || cardName.includes(query) || cardAddress.includes(query) || cardDistrict.includes(query);

            if (sideMatch && districtMatch && textMatch) {
              card.style.display = 'flex';
              visibleCount++;
            } else {
              card.style.display = 'none';
            }
          });

          if (countNumber) countNumber.textContent = visibleCount;
          if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
          }
        }

        // Side selector
        sideBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            sideBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSide = btn.getAttribute('data-side');
            applyFilters();
          });
        });

        // District chips selector
        districtPills.forEach(pill => {
          pill.addEventListener('click', () => {
            districtPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeDistrict = pill.getAttribute('data-district');
            applyFilters();
          });
        });

        // Search input with debounce
        let debounceTimer;
        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              searchQuery = e.target.value;
              applyFilters();
            }, 120);
          });
        }

        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            activeSide = 'all';
            activeDistrict = 'all';
            searchQuery = '';
            if (searchInput) searchInput.value = '';

            sideBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-side') === 'all'));
            districtPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-district') === 'all'));
            applyFilters();
          });
        }

        // Geolocation: Find Nearest Pharmacy
        function haversineDistance(lat1, lon1, lat2, lon2) {
          const R = 6371; // km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        }

        if (findNearestBtn) {
          findNearestBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
              alert('${t.locationDenied}');
              return;
            }

            findNearestBtn.textContent = '⏳ ${t.locating}';
            findNearestBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const userLat = pos.coords.latitude;
                const userLng = pos.coords.longitude;
                findNearestBtn.textContent = '✓ ${t.findNearestBtn}';
                findNearestBtn.disabled = false;

                // Calculate distance for all cards and reorder
                const grid = document.getElementById('pharmacies-grid');
                const cardArray = Array.from(cards);

                cardArray.forEach(card => {
                  const lat = parseFloat(card.getAttribute('data-lat'));
                  const lng = parseFloat(card.getAttribute('data-lng'));
                  const dist = haversineDistance(userLat, userLng, lat, lng);
                  card.setAttribute('data-distance', dist);

                  const ph = card.querySelector('.distance-placeholder');
                  if (ph) {
                    ph.className = 'distance-badge';
                    ph.style.display = 'inline-flex';
                    ph.innerHTML = '📍 ${t.distanceKm} <strong>' + dist.toFixed(1) + ' km</strong>';
                  }
                });

                // Sort by distance ascending
                cardArray.sort((a, b) => {
                  const distA = parseFloat(a.getAttribute('data-distance') || '9999');
                  const distB = parseFloat(b.getAttribute('data-distance') || '9999');
                  return distA - distB;
                });

                cardArray.forEach(card => grid.appendChild(card));
                applyFilters();
                showToast('📍 تم ترتيب الصيدليات حسب الأقرب لموقعك');
              },
              (err) => {
                findNearestBtn.textContent = '${t.findNearestBtn}';
                findNearestBtn.disabled = false;
                alert('${t.locationDenied}');
              },
              { timeout: 10000, enableHighAccuracy: true }
            );
          });
        }

        // Apply initial district parameter if present
        if (activeDistrict !== 'all') {
          const matchingPill = document.querySelector('.district-pill[data-district="' + activeDistrict + '"]');
          if (matchingPill) {
            districtPills.forEach(p => p.classList.remove('active'));
            matchingPill.classList.add('active');
          }
          applyFilters();
        }
      })();
    </script>
  `;

  c.header('Cache-Control', 'public, max-age=300, s-maxage=1200, stale-while-revalidate=3600');
  return c.html(renderLayout(c, t.metaTitle, html, locale, seoMetaTags));
});
