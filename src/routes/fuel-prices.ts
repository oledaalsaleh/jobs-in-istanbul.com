import { Hono } from 'hono';
import { renderLayout } from './public';
import { getCachedOrFallbackFuelPrices, runFuelScraper } from '../services/fuel-scraper';

export const fuelPricesRouter = new Hono();

// Aliases & Language Redirection
fuelPricesRouter.get('/akaryakit-fiyatlari', (c) => {
  const acceptLang = (c.req.header('accept-language') || '').toLowerCase();
  if (acceptLang.startsWith('tr')) return c.redirect('/tr/akaryakit-fiyatlari');
  if (acceptLang.startsWith('en')) return c.redirect('/en/akaryakit-fiyatlari');
  return c.redirect('/ar/akaryakit-fiyatlari');
});

fuelPricesRouter.get('/fuel-prices', (c) => {
  const acceptLang = (c.req.header('accept-language') || '').toLowerCase();
  if (acceptLang.startsWith('tr')) return c.redirect('/tr/akaryakit-fiyatlari');
  if (acceptLang.startsWith('en')) return c.redirect('/en/akaryakit-fiyatlari');
  return c.redirect('/ar/akaryakit-fiyatlari');
});

fuelPricesRouter.get('/:locale/fuel-prices', (c) => {
  const locale = c.req.param('locale');
  return c.redirect(`/${locale}/akaryakit-fiyatlari`);
});

// Admin / Manual Refresh endpoint
fuelPricesRouter.get('/admin-api/refresh-fuel-prices', async (c) => {
  try {
    const data = await runFuelScraper(c.env);
    return c.json({ success: true, updatedAt: data.updatedAt, data });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Main Page: /:locale/akaryakit-fiyatlari
fuelPricesRouter.get('/:locale/akaryakit-fiyatlari', async (c) => {
  const locale = (c.req.param('locale') || 'ar') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') {
    return c.redirect('/ar/akaryakit-fiyatlari');
  }

  const isRtl = locale === 'ar' || locale === 'fa' || locale === 'ur';
  const dataset = await getCachedOrFallbackFuelPrices(c.env);

  // Translations dictionary
  const t = {
    ar: {
      metaTitle: 'أسعار البنزين والديزل والمحروقات اليوم في إسطنبول 2026 | تحديث مباشر وتنبيه الزيادة والتخفيض',
      metaDesc: 'تعرف على أسعار الوقود في إسطنبول اليوم للجانبين الأوروبي والآسيوي: بنزين 95، ديزل (مازوت)، وغاز السيارات LPG. شريط تنبيهات ذكي لتوقعات التخفيض والزيادة مع حاسبة تكلفة المشوار للموتوكوري والسيارات.',
      heroBadge: 'تحديث أسعار المحروقات اليومي المباشر 2026',
      heroTitle: 'أسعار البنزين والديزل والمحروقات اليوم في إسطنبول',
      heroSubtitle: 'تحديث لحظي لأسعار بنزين 95 (Benzin)، الديزل (Motorin)، وغاز السيارات (LPG) للجانبين الأوروبي والآسيوي، مع مؤشر التنبيه الذكي للزيادة والتخفيض القادم وحاسبة تكلفة الوقود.',
      lastUpdatedText: 'آخر تحديث رسمي:',
      sideAvrupa: 'الجانب الأوروبي (Avrupa)',
      sideAnadolu: 'الجانب الآسيوي (Anadolu)',
      fuelBenzinTitle: 'بنزين 95 أوكتان',
      fuelBenzinSub: 'Kurşunsuz Benzin 95',
      fuelMotorinTitle: 'ديزل / مازوت',
      fuelMotorinSub: 'Motorin (Dizel)',
      fuelLpgTitle: 'غاز السيارات',
      fuelLpgSub: 'Otogaz (LPG)',
      fuelPremiumTitle: 'ديزل ممتاز',
      fuelPremiumSub: 'Motorin Ultra / V-Power',
      perLiter: 'ليرة / لتر',
      alertBoxHeader: 'مؤشر مراقبة أسعار الوقود والتعديلات القادمة (Zam / İndirim)',
      brentOilLabel: 'سعر نفط برنت عالمياً:',
      usdTryLabel: 'سعر صرف USD/TRY:',
      expectedStatusLabel: 'حالة التعديل المتوقع:',
      stationsTitle: 'مقارنة أسعار المحروقات بين كبرى الشركات في إسطنبول',
      stationColBrand: 'الشركة / المحطة',
      stationColBenzin: 'بنزين 95 (₺)',
      stationColMotorin: 'ديزل (₺)',
      stationColLpg: 'غاز LPG (₺)',
      calcTitle: '🛵 حاسبة تكلفة الوقود والمشوار للموتوكوري والسيارات',
      calcSubtitle: 'احسب بدقة التكلفة الفعلية لمشاويرك اليومية والشهرية بناءً على أسعار اليوم ونوع مركبتك.',
      vehicleTypeLabel: 'اختر نوع المركبة أو نمط الاستهلاك:',
      presetScooter: '🛵 سكوتر توصيل طلبات (Motokurye) - 3.2 لتر/100كم',
      presetMotor: '🏍️ دراجة نارية متوسطة - 4.5 لتر/100كم',
      presetCarBenzin: '🚗 سيارة بنزين ركوب - 7.0 لتر/100كم',
      presetTaxiDiesel: '🚕 تاكسي أو سيارة ديزل - 5.8 لتر/100كم',
      presetVan: '🚚 فان بضائع أو دوبلو - 7.5 لتر/100كم',
      presetCarLpg: '🚖 سيارة تعمل بغاز LPG - 9.2 لتر/100كم',
      presetCustom: '⚙️ استهلاك مخصص (Custom)',
      distanceLabel: 'المسافة المقطوعة (كم):',
      fuelSelectLabel: 'نوع الوقود:',
      calcSideLabel: 'الجانب المفضل للتعبئة:',
      resKmCost: 'تكلفة الكيلومتر الواحد',
      resTripCost: 'تكلفة المسافة المحددة',
      resWeeklyCost: 'التكلفة الأسبوعية (6 أيام)',
      resMonthlyCost: 'التكلفة الشهرية (30 يوماً)',
      resLitersNeeded: 'كمية الوقود المستهلكة',
      historyTitle: 'سجل آخر التعديلات الرسمية على أسعار الوقود (Zam & İndirim)',
      histColDate: 'التاريخ',
      histColFuel: 'نوع الوقود',
      histColType: 'نوع التعديل',
      histColAmount: 'مقدار التعديل',
      histColNewPrice: 'السعر بعد التعديل',
      histColNotes: 'البيان الرسمي',
      badgeZam: 'زيادة (Zam)',
      badgeIndirim: 'تخفيض (İndirim)',
      guideTitle: 'دليل أصحاب السيارات وسائقي التوصيل (Motokurye) في إسطنبول',
      guide1Title: '1. خصم فواتير الوقود ضريبياً لموظفي التوصيل (Şahıs Şirketi)',
      guide1Body: 'إذا كنت تعمل كموتوكوري مستقلاً (Esnaf Kurye) عبر شركة فردية، يمكنك خصم كامل ضريبة القيمة المضافة (KDV) لمصروفات البنزين وتخفيض الوعاء الضريبي لأرباحك السنوية بشرط إصدار فاتورة رسمية بالرقم الضريبي (Vergi No).',
      guide2Title: '2. منظومة التعرف التلقائي على المركبات (TTS)',
      guide2Body: 'تتيح شركات الوقود الكبرى في إسطنبول كـ Petrol Ofisi و Shell و Opet رقاقة ذكية للسيارات تتيح التزود التلقائي بالوقود دون الحاجة للدفع النقدي أو النزول من المركبة، مع الحصول على تقارير تفصيلية وخصومات أسطول.',
      guide3Title: '3. العلامة الوطنية (Ulusal Marker) وحماية المستهلك',
      guide3Body: 'تخضع جميع محطات الوقود في إسطنبول لرقابة صارمة من هيئة تنظيم سوق الطاقة التركية (EPDK) لضمان مطابقة الوقود للمواصفات القياسية وحماية المحركات من الوقود المغشوش، مع تخصيص خط الشكاوى المباشر 189.',
      faqTitle: 'الأسئلة الشائعة حول أسعار الوقود في تركيا',
      faq1Q: 'لماذا تختلف أسعار الوقود بين الجانب الأوروبي والآسيوي في إسطنبول؟',
      faq1A: 'يعود الفارق الطفيف (بضعة قروش) إلى تكاليف النقل اللوجستي وتوزيع المصافي ورسوم عبور الجسور بين شطري المدينة.',
      faq2Q: 'متى يتم تطبيق الزيادة أو التخفيض على أسعار المحروقات؟',
      faq2A: 'تدخل أسعار الوقود الجديدة حيز التنفيذ عادة في منتصف الليل (الساعة 00:01) بعد إعلان رسمي من نقابة محطات الطاقة EPGİS وهيئة EPDK.',
      faq3Q: 'كيف يتم تسعير الوقود رسمياً في تركيا؟',
      faq3A: 'يتم احتساب السعر وفق صيغة تعتمد على متوسط أسعار منتجات التكرير في سوق البحر الأبيض المتوسط (جنوة/إيطاليا)، وسعر صرف الليرة التركية مقابل الدولار الأمريكي، مضافاً إليها ضرائب ÖTV و KDV.'
    },
    tr: {
      metaTitle: 'İstanbul Akaryakıt Fiyatları Bugün 2026 | Benzin, Motorin, LPG Fiyatı ve Zam/İndirim Uyarısı',
      metaDesc: 'İstanbul güncel akaryakıt fiyatları: Benzin 95, Motorin (Dizel) ve LPG Otogaz litre fiyatı bugün kaç TL? Avrupa ve Anadolu yakası güncel pompa fiyatları, akaryakıt zam/indirim bildirimleri ve motokurye yakıt hesaplama.',
      heroBadge: 'Güncel Akaryakıt Pompa Fiyatları 2026',
      heroTitle: 'İstanbul Akaryakıt Fiyatları Bugün (Benzin, Motorin, LPG)',
      heroSubtitle: 'İstanbul Avrupa ve Anadolu yakası için güncel Kurşunsuz Benzin 95, Motorin (Mazot) ve Otogaz (LPG) litre fiyatları, anlık zam/indirim takip bildirimi ve kurye yakıt hesaplama aracı.',
      lastUpdatedText: 'Son Resmi Güncelleme:',
      sideAvrupa: 'Avrupa Yakası',
      sideAnadolu: 'Anadolu Yakası',
      fuelBenzinTitle: 'Kurşunsuz Benzin 95',
      fuelBenzinSub: 'Benzin 95 Oktan',
      fuelMotorinTitle: 'Motorin (Dizel)',
      fuelMotorinSub: 'Mazot Pompa Fiyatı',
      fuelLpgTitle: 'Otogaz (LPG)',
      fuelLpgSub: 'Araç Gaz Fiyatı',
      fuelPremiumTitle: 'Katkılı Motorin',
      fuelPremiumSub: 'Ultra / V-Power Diesel',
      perLiter: 'TL / Litre',
      alertBoxHeader: 'Akaryakıt Fiyat Takibi ve Zam / İndirim Bildirimi',
      brentOilLabel: 'Brent Petrol Varil:',
      usdTryLabel: 'Dolar Kuru (USD/TRY):',
      expectedStatusLabel: 'Beklenen Fiyat Değişimi:',
      stationsTitle: 'İstanbul Dağıtıcı Şirketlere Göre Akaryakıt Fiyat Karşılaştırması',
      stationColBrand: 'Dağıtıcı Firma',
      stationColBenzin: 'Benzin 95 (₺)',
      stationColMotorin: 'Motorin (₺)',
      stationColLpg: 'LPG Otogaz (₺)',
      calcTitle: '🛵 Motokurye ve Araç Yakıt Tüketim Hesaplama Aracı',
      calcSubtitle: 'Aracınızın motor tipine ve günlük yapacağınız kilometreye göre güncel yakıt maliyetinizi anında hesaplayın.',
      vehicleTypeLabel: 'Araç Tipini Seçiniz:',
      presetScooter: '🛵 Motokurye Scooter - 3.2 L / 100 km',
      presetMotor: '🏍️ Standart Motosiklet - 4.5 L / 100 km',
      presetCarBenzin: '🚗 Benzinli Binek Otomobil - 7.0 L / 100 km',
      presetTaxiDiesel: '🚕 Ticari Taksi / Dizel Sedan - 5.8 L / 100 km',
      presetVan: '🚚 Ticari Van / Doblo Kurye - 7.5 L / 100 km',
      presetCarLpg: '🚖 LPG\'li Otomobil - 9.2 L / 100 km',
      presetCustom: '⚙️ Özel Tüketim (Manuel Giriş)',
      distanceLabel: 'Yapılacak Yol (Kilometre):',
      fuelSelectLabel: 'Kullanılan Yakıt:',
      calcSideLabel: 'Yakıt Alınacak Yaka:',
      resKmCost: 'Kilometre Başına Maliyet',
      resTripCost: 'Seçilen Mesafe Maliyeti',
      resWeeklyCost: 'Haftalık Maliyet (6 Gün)',
      resMonthlyCost: 'Aylık Toplam Maliyet (30 Gün)',
      resLitersNeeded: 'Tüketilecek Yakıt Miktarı',
      historyTitle: 'Son Akaryakıt Zam ve İndirim Geçmişi Tablosu',
      histColDate: 'Tarih',
      histColFuel: 'Yakıt Türü',
      histColType: 'İşlem',
      histColAmount: 'Miktar',
      histColNewPrice: 'Yeni Pompa Fiyatı',
      histColNotes: 'Açıklama',
      badgeZam: 'Zam Yapıldı',
      badgeIndirim: 'İndirim Yapıldı',
      guideTitle: 'İstanbul\'da Araç Sahipleri ve Motokuryeler İçin Akaryakıt Rehberi',
      guide1Title: '1. Esnaf Kuryeler İçin Akaryakıt Giderini Vergiden Düşme',
      guide1Body: 'Şahıs şirketi olan motokuryeler, iş amacıyla kullandıkları motosikletin benzin fişlerini Vergi No belirterek muhasebeleştirebilir ve KDV ile gelir vergisinden yasal olarak tasarruf sağlayabilir.',
      guide2Title: '2. Taşıt Tanıma Sistemi (TTS) Avantajları',
      guide2Body: 'Petrol Ofisi, Shell ve Opet gibi ana dağıtıcıların sunduğu TTS sistemleri ile araçtan inmeden temassız dolum yapılabilir ve kurumsal indirimlerden yararlanılabilir.',
      guide3Title: '3. Ulusal Marker ve EPDK Tüketici Güvencesi',
      guide3Body: 'EPDK denetimindeki akaryakıt istasyonlarında satılan tüm ürünlerde kaçak yakıtı önleyen Ulusal Marker bulunur; araç sahipleri ALO 189 üzerinden bildirim yapabilir.',
      faqTitle: 'İstanbul Akaryakıt Fiyatları Hakkında Sıkça Sorulan Sorular',
      faq1Q: 'Avrupa ve Anadolu yakası akaryakıt fiyatları neden farklıdır?',
      faq1A: 'Rafineri mesafesi, lojistik nakliye maliyetleri ve köprü geçiş masrafları nedeniyle iki yaka arasında birkaç kuruşluk fiyat farkı oluşabilmektedir.',
      faq2Q: 'Akaryakıt zammı veya indirimi saat kaçta geçerli olur?',
      faq2A: 'EPGİS ve EPDK tarafından onaylanan fiyat değişiklikleri kural olarak gece 00:01 itibarıyla pompa fiyatlarına yansıtılır.',
      faq3Q: 'Türkiye\'de akaryakıt fiyatı nasıl hesaplanır?',
      faq3A: 'Cenova Akdeniz piyasasındaki işlenmiş petrol fiyatları ve USD/TRY kuru baz alınarak, üzerine ÖTV ve KDV eklenmesiyle belirlenir.'
    },
    en: {
      metaTitle: 'Istanbul Fuel Prices Today 2026 | Petrol, Diesel, LPG Pump Rates & Fuel Alert',
      metaDesc: 'Today\'s official fuel prices in Istanbul for European and Asian sides: Unleaded Petrol 95, Diesel (Motorin), and LPG Autogas per liter. Live fuel alert tracker and courier trip fuel cost calculator.',
      heroBadge: 'Live Istanbul Fuel Pump Prices 2026',
      heroTitle: 'Istanbul Fuel Prices Today (Petrol, Diesel, LPG)',
      heroSubtitle: 'Real-time retail fuel prices across Istanbul European and Asian sides for Unleaded Petrol 95, Diesel (Motorin), and Autogas (LPG) with smart price change alert tracker and courier cost calculator.',
      lastUpdatedText: 'Last Official Update:',
      sideAvrupa: 'European Side (Avrupa)',
      sideAnadolu: 'Asian Side (Anadolu)',
      fuelBenzinTitle: 'Unleaded Petrol 95',
      fuelBenzinSub: 'Kurşunsuz Benzin 95',
      fuelMotorinTitle: 'Diesel (Motorin)',
      fuelMotorinSub: 'Automotive Gasoil',
      fuelLpgTitle: 'Autogas (LPG)',
      fuelLpgSub: 'Liquefied Petroleum Gas',
      fuelPremiumTitle: 'Premium Diesel',
      fuelPremiumSub: 'V-Power / Ultra Diesel',
      perLiter: 'TRY / Liter',
      alertBoxHeader: 'Fuel Market Monitoring & Upcoming Price Change Alert',
      brentOilLabel: 'Global Brent Crude:',
      usdTryLabel: 'USD/TRY Exchange Rate:',
      expectedStatusLabel: 'Expected Price Outlook:',
      stationsTitle: 'Fuel Price Comparison Across Major Distributors in Istanbul',
      stationColBrand: 'Distributor Brand',
      stationColBenzin: 'Petrol 95 (₺)',
      stationColMotorin: 'Diesel (₺)',
      stationColLpg: 'LPG Autogas (₺)',
      calcTitle: '🛵 Delivery Courier & Vehicle Fuel Trip Cost Calculator',
      calcSubtitle: 'Accurately calculate your daily, weekly, and monthly fuel expenses based on today\'s pump prices and vehicle consumption.',
      vehicleTypeLabel: 'Select Vehicle Type:',
      presetScooter: '🛵 Delivery Scooter (Motokurye) - 3.2 L / 100 km',
      presetMotor: '🏍️ Standard Motorcycle - 4.5 L / 100 km',
      presetCarBenzin: '🚗 Petrol Passenger Car - 7.0 L / 100 km',
      presetTaxiDiesel: '🚕 Taxi / Diesel Sedan - 5.8 L / 100 km',
      presetVan: '🚚 Commercial Van / Courier Doblo - 7.5 L / 100 km',
      presetCarLpg: '🚖 LPG Vehicle - 9.2 L / 100 km',
      presetCustom: '⚙️ Custom Consumption (Manual)',
      distanceLabel: 'Distance to Travel (km):',
      fuelSelectLabel: 'Fuel Type:',
      calcSideLabel: 'Fueling Location Side:',
      resKmCost: 'Cost per 1 KM',
      resTripCost: 'Selected Trip Cost',
      resWeeklyCost: 'Weekly Cost (6 Days)',
      resMonthlyCost: 'Monthly Total Cost (30 Days)',
      resLitersNeeded: 'Estimated Fuel Consumed',
      historyTitle: 'Recent Official Price Adjustments Log (Price Hikes & Cuts)',
      histColDate: 'Date',
      histColFuel: 'Fuel Type',
      histColType: 'Change',
      histColAmount: 'Amount',
      histColNewPrice: 'Price After Change',
      histColNotes: 'Official Announcement',
      badgeZam: 'Price Increase',
      badgeIndirim: 'Price Cut',
      guideTitle: 'Istanbul Driver & Delivery Courier Fuel Guide',
      guide1Title: '1. Fuel Tax Deductions for Delivery Couriers (Esnaf Kurye)',
      guide1Body: 'Sole proprietorship couriers can deduct 100% of VAT (KDV) and include fuel receipts as business expenses to lower yearly income tax liabilities in Turkey.',
      guide2Title: '2. Vehicle Recognition Systems (Taşıt Tanıma Sistemi - TTS)',
      guide2Body: 'Major providers like Petrol Ofisi, Shell, and Opet provide RFID tags allowing automatic contactless refueling without cash and fleet billing advantages.',
      guide3Title: '3. National Marker & Regulatory EPDK Consumer Protection',
      guide3Body: 'All retail fuel sold in Istanbul contains a chemical National Marker monitored by EPDK ensuring engine safety against adulterated fuels.',
      faqTitle: 'Frequently Asked Questions About Fuel Prices in Istanbul',
      faq1Q: 'Why are fuel prices slightly different between European and Asian Istanbul?',
      faq1A: 'Minor differences (a few kuruş) stem from refinery transport logistics, supply depot locations, and bridge transit tolls.',
      faq2Q: 'At what time do fuel price increases or reductions take effect?',
      faq2A: 'Officially published adjustments generally take effect at midnight (00:01 AM) at pump dispensers.',
      faq3Q: 'How are retail fuel prices calculated in Turkey?',
      faq3A: 'Prices are derived from Genoa/Mediterranean refined petroleum averages converted via USD/TRY, plus national ÖTV and KDV excise taxes.'
    },
    ru: {
      metaTitle: 'Цены на бензин и дизель в Стамбуле сегодня 2026',
      metaDesc: 'Актуальные цены на топливо в Стамбуле: бензин 95, дизель и автогаз LPG. Калькулятор расхода топлива.',
      heroBadge: 'Цены на топливо 2026',
      heroTitle: 'Цены на бензин и дизель в Стамбуле сегодня',
      heroSubtitle: 'Цены на бензин 95, дизель и газ LPG для европейской и азиатской сторон Стамбула.',
      lastUpdatedText: 'Обновлено:',
      sideAvrupa: 'Европейская сторона',
      sideAnadolu: 'Азиатская сторона',
      fuelBenzinTitle: 'Бензин 95',
      fuelBenzinSub: 'Kurşunsuz 95',
      fuelMotorinTitle: 'Дизель (Motorin)',
      fuelMotorinSub: 'Дизельное топливо',
      fuelLpgTitle: 'Автогаз (LPG)',
      fuelLpgSub: 'Сжиженный газ',
      fuelPremiumTitle: 'Премиум дизель',
      fuelPremiumSub: 'Ultra / V-Power',
      perLiter: 'TL / Литр',
      alertBoxHeader: 'Мониторинг цен на топливо и предупреждения',
      brentOilLabel: 'Нефть Brent:',
      usdTryLabel: 'Курс USD/TRY:',
      expectedStatusLabel: 'Ожидаемые изменения:',
      stationsTitle: 'Сравнение цен на заправках Стамбула',
      stationColBrand: 'АЗС',
      stationColBenzin: 'Бензин 95',
      stationColMotorin: 'Дизель',
      stationColLpg: 'Газ LPG',
      calcTitle: 'Калькулятор стоимости топлива',
      calcSubtitle: 'Рассчитайте ежедневные и месячные расходы на топливо.',
      vehicleTypeLabel: 'Тип транспорта:',
      presetScooter: '🛵 Скутер курьера - 3.2 л/100км',
      presetMotor: '🏍️ Мотоцикл - 4.5 л/100км',
      presetCarBenzin: '🚗 Бензиновый авто - 7.0 л/100км',
      presetTaxiDiesel: '🚕 Такси/дизель - 5.8 л/100км',
      presetVan: '🚚 Фургон - 7.5 л/100км',
      presetCarLpg: '🚖 Авто на газу - 9.2 л/100км',
      presetCustom: '⚙️ Свой расход',
      distanceLabel: 'Расстояние (км):',
      fuelSelectLabel: 'Вид топлива:',
      calcSideLabel: 'Сторона города:',
      resKmCost: 'Стоимость за 1 км',
      resTripCost: 'Стоимость поездки',
      resWeeklyCost: 'За неделю (6 дней)',
      resMonthlyCost: 'За месяц (30 дней)',
      resLitersNeeded: 'Расход топлива',
      historyTitle: 'История изменений цен',
      histColDate: 'Дата',
      histColFuel: 'Топливо',
      histColType: 'Тип',
      histColAmount: 'Сумма',
      histColNewPrice: 'Новая цена',
      histColNotes: 'Примечание',
      badgeZam: 'Повышение',
      badgeIndirim: 'Снижение',
      guideTitle: 'Советы для водителей и курьеров',
      guide1Title: '1. Списание топлива для курьеров',
      guide1Body: 'Индивидуальные курьеры могут списывать расходы на топливо при наличии налогового номера.',
      guide2Title: '2. Система распознавания авто (TTS)',
      guide2Body: 'Автоматическая бесконтактная заправка со скидками.',
      guide3Title: '3. Контроль качества топлива (EPDK)',
      guide3Body: 'Национальный маркер защищает двигатели от некачественного топлива.',
      faqTitle: 'Частые вопросы о топливе в Турции',
      faq1Q: 'Почему цены на европейской и азиатской стороне отличаются?',
      faq1A: 'Из-за логистических расходов на доставку и плату за мосты.',
      faq2Q: 'В какое время меняются цены?',
      faq2A: 'Изменения вступают в силу в полночь (00:01).',
      faq3Q: 'Как формируется цена на топливо?',
      faq3A: 'На основе средиземноморских котировок, курса лиры и налогов.'
    },
    fa: {
      metaTitle: 'قیمت بنزین و گازوئیل امروز در استانبول ۲۰۲۶',
      metaDesc: 'قیمت روز سوخت در استانبول: بنزین، دیزل و گاز LPG به همراه ماشین حساب هزینه سوخت برای رانندگان و پیک‌ها.',
      heroBadge: 'قیمت روز سوخت استانبول ۲۰۲۶',
      heroTitle: 'قیمت بنزین و گازوئیل امروز در استانبول',
      heroSubtitle: 'قیمت لحظه‌ای بنزین ۹۵، گازوئیل و گاز خودرو برای بخش اروپایی و آسیایی استانبول.',
      lastUpdatedText: 'آخرین به‌روزرسانی:',
      sideAvrupa: 'بخش اروپایی',
      sideAnadolu: 'بخش آسیایی',
      fuelBenzinTitle: 'بنزین ۹۵',
      fuelBenzinSub: 'Kurşunsuz 95',
      fuelMotorinTitle: 'گازوئیل (Motorin)',
      fuelMotorinSub: 'دیزل',
      fuelLpgTitle: 'گاز خودرو (LPG)',
      fuelLpgSub: 'Otogaz',
      fuelPremiumTitle: 'دیزل سوپر',
      fuelPremiumSub: 'Ultra Diesel',
      perLiter: 'لیر / لیتر',
      alertBoxHeader: 'هشدار هوشمند تغییرات قیمت سوخت',
      brentOilLabel: 'نفت برنت:',
      usdTryLabel: 'نرخ دلار:',
      expectedStatusLabel: 'وضعیت پیش‌بینی:',
      stationsTitle: 'مقایسه قیمت پمپ بنزین‌های استانبول',
      stationColBrand: 'جایگاه',
      stationColBenzin: 'بنزین',
      stationColMotorin: 'دیزل',
      stationColLpg: 'گاز LPG',
      calcTitle: 'محاسبه‌گر هزینه سوخت پیک و خودرو',
      calcSubtitle: 'هزینه روزانه و ماهانه سوخت را بر اساس مسافت طی شده محاسبه کنید.',
      vehicleTypeLabel: 'نوع وسیله نقلیه:',
      presetScooter: '🛵 اسکوتر پیک - ۳.۲ لیتر/۱۰۰کم',
      presetMotor: '🏍️ موتور سیکلت - ۴.۵ لیتر/۱۰۰کم',
      presetCarBenzin: '🚗 خودرو بنزینی - ۷.۰ لیتر/۱۰۰کم',
      presetTaxiDiesel: '🚕 تاکسی دیزل - ۵.۸ لیتر/۱۰۰کم',
      presetVan: '🚚 ون باری - ۷.۵ لیتر/۱۰۰کم',
      presetCarLpg: '🚖 خودرو گازسوز - ۹.۲ لیتر/۱۰۰کم',
      presetCustom: '⚙️ مصرف سفارشی',
      distanceLabel: 'مسافت (کیلومتر):',
      fuelSelectLabel: 'نوع سوخت:',
      calcSideLabel: 'بخش شهر:',
      resKmCost: 'هزینه هر کیلومتر',
      resTripCost: 'هزینه مسافت',
      resWeeklyCost: 'هزینه هفتگی (۶ روز)',
      resMonthlyCost: 'هزینه ماهانه (۳۰ روز)',
      resLitersNeeded: 'میزان سوخت مصرفی',
      historyTitle: 'تاریخچه تغییرات قیمت سوخت',
      histColDate: 'تاریخ',
      histColFuel: 'سوخت',
      histColType: 'نوع',
      histColAmount: 'مقدار',
      histColNewPrice: 'قیمت جدید',
      histColNotes: 'توضیحات',
      badgeZam: 'افزایش قیمت',
      badgeIndirim: 'کاهش قیمت',
      guideTitle: 'راهنمای سوخت برای رانندگان در استانبول',
      guide1Title: '۱. کسر مالیاتی هزینه بنزین پیک‌ها',
      guide1Body: 'پیک‌های دارای شرکت شخصی می‌توانند فاکتورهای بنزین را از مالیات کسر کنند.',
      guide2Title: '۲. سیستم شناسایی خودکار خودرو (TTS)',
      guide2Body: 'سوخت‌گیری خودکار و بدون کارت در جایگاه‌ها با تخفیف.',
      guide3Title: '۳. استاندارد ملی سوخت (EPDK)',
      guide3Body: 'نشانگر ملی برای جلوگیری از سوخت نامرغوب در ترکیه.',
      faqTitle: 'سوالات متداول قیمت سوخت در ترکیه',
      faq1Q: 'چرا قیمت در دو بخش اروپایی و آسیایی فرق دارد؟',
      faq1A: 'به دلیل هزینه‌های حمل‌ونقل و عوارض پل‌ها.',
      faq2Q: 'تغییرات قیمت چه ساعتی اعمال می‌شود؟',
      faq2A: 'معمولاً از ساعت ۰۰:۰۱ بامداد.',
      faq3Q: 'قیمت سوخت چگونه تعیین می‌شود؟',
      faq3A: 'بر اساس قیمت جهانی نفت، نرخ دلار و مالیات‌های دولتی.'
    },
    ur: {
      metaTitle: 'استنبول میں پیٹرول اور ڈیزل کی قیمتیں آج 2026',
      metaDesc: 'استنبول میں آج پیٹرول، ڈیزل اور ایل پی جی کی قیمتیں اور ایندھن کا کیلکولیٹر۔',
      heroBadge: 'ایندھن کی قیمتیں 2026',
      heroTitle: 'استنبول میں پیٹرول اور ڈیزل کی قیمتیں آج',
      heroSubtitle: 'یورپی اور ایشیائی جانب پیٹرول، ڈیزل اور ایل پی جی کی روزانہ تازہ ترین قیمتیں۔',
      lastUpdatedText: 'آخری اپ ڈیٹ:',
      sideAvrupa: 'یورپی حصہ',
      sideAnadolu: 'ایشیائی حصہ',
      fuelBenzinTitle: 'پیٹرول 95',
      fuelBenzinSub: 'Kurşunsuz 95',
      fuelMotorinTitle: 'ڈیزل (Motorin)',
      fuelMotorinSub: 'ڈیزل آئل',
      fuelLpgTitle: 'ایل پی جی گیس',
      fuelLpgSub: 'Otogaz',
      fuelPremiumTitle: 'پریمیم ڈیزل',
      fuelPremiumSub: 'Ultra Diesel',
      perLiter: 'لیرا / لیٹر',
      alertBoxHeader: 'ایندھن کی قیمتوں میں کمی اور اضافے کا الرٹ',
      brentOilLabel: 'برینٹ خام تیل:',
      usdTryLabel: 'ڈالر ریٹ:',
      expectedStatusLabel: 'توقع کی کیفیت:',
      stationsTitle: 'استنبول کے پیٹرول پمپس کا موازنہ',
      stationColBrand: 'کمپنی',
      stationColBenzin: 'پیٹرول 95',
      stationColMotorin: 'ڈیزل',
      stationColLpg: 'ایل پی جی',
      calcTitle: 'ایندھن لاگت کا کیلکولیٹر',
      calcSubtitle: 'اپنے سفر یا ڈلیوری کے ایندھن کی لاگت معلوم کریں۔',
      vehicleTypeLabel: 'گاڑی کی قسم:',
      presetScooter: '🛵 ڈلیوری سکوٹر - 3.2 لیٹر/100 کلومیٹر',
      presetMotor: '🏍️ موٹر سائیکل - 4.5 لیٹر/100 کلومیٹر',
      presetCarBenzin: '🚗 پیٹرول کار - 7.0 لیٹر/100 کلومیٹر',
      presetTaxiDiesel: '🚕 ٹیکسی/ڈیزل - 5.8 لیٹر/100 کلومیٹر',
      presetVan: '🚚 کمرشل وین - 7.5 لیٹر/100 کلومیٹر',
      presetCarLpg: '🚖 گیس والی کار - 9.2 لیٹر/100 کلومیٹر',
      presetCustom: '⚙️ حسب ضرورت',
      distanceLabel: 'فاصلہ (کلومیٹر):',
      fuelSelectLabel: 'ایندھن کی قسم:',
      calcSideLabel: 'شہر کا رخ:',
      resKmCost: 'فی کلومیٹر لاگت',
      resTripCost: 'سفر کی لاگت',
      resWeeklyCost: 'ہفتہ وار خرچ',
      resMonthlyCost: 'ماہانہ خرچ',
      resLitersNeeded: 'مطلوبہ ایندھن',
      historyTitle: 'حالیہ قیمتوں میں تبدیلی کی تاریخ',
      histColDate: 'تاریخ',
      histColFuel: 'ایندھن',
      histColType: 'نوعیت',
      histColAmount: 'مقدار',
      histColNewPrice: 'نئی قیمت',
      histColNotes: 'تفصیلات',
      badgeZam: 'اضافہ',
      badgeIndirim: 'کمی',
      guideTitle: 'استنبول میں ڈرائیورز اور کوریئرز کی رہنمائی',
      guide1Title: '1. ایندھن پر ٹیکس چھوٹ',
      guide1Body: 'انفرادی کمپنی رکھنے والے رائیڈرز پیٹرول کے بلوں پر ٹیکس چھوٹ حاصل کر سکتے ہیں۔',
      guide2Title: '2. گاڑی کی خودکار شناخت کا نظام',
      guide2Body: 'بغیر نقد ادائیگی کے پمپس سے ایندھن بھروانے کا نظام۔',
      guide3Title: '3. ایندھن کا معیار اور تحفظ',
      guide3Body: 'ترکی کے توانائی ادارے کی جانب سے ایندھن کے معیار کی سخت نگرانی۔',
      faqTitle: 'اکثر پوچھے گئے سوالات',
      faq1Q: 'دونوں اطراف کی قیمتوں میں فرق کیوں ہوتا ہے؟',
      faq1A: 'ٹرانسپورٹ اور پل کے اخراجات کی وجہ سے معمولی فرق ہوتا ہے۔',
      faq2Q: 'نئی قیمتیں کب نافذ ہوتی ہیں؟',
      faq2A: 'عام طور پر رات 12 بج کر 1 منٹ پر۔',
      faq3Q: 'قیمتیں کیسے طے کی جاتی ہیں؟',
      faq3A: 'عالمی منڈی میں تیل کی قیمت اور ڈالر کی شرح کے مطابق۔'
    }
  }[locale] || {
    metaTitle: 'Istanbul Fuel Prices Today 2026',
    metaDesc: 'Today fuel prices in Istanbul: Petrol, Diesel, LPG.',
    heroBadge: 'Fuel Prices Today',
    heroTitle: 'Istanbul Fuel Prices Today',
    heroSubtitle: 'Retail fuel prices in Istanbul.',
    lastUpdatedText: 'Updated:',
    sideAvrupa: 'European Side',
    sideAnadolu: 'Asian Side',
    fuelBenzinTitle: 'Petrol 95',
    fuelBenzinSub: 'Unleaded',
    fuelMotorinTitle: 'Diesel',
    fuelMotorinSub: 'Motorin',
    fuelLpgTitle: 'Autogas',
    fuelLpgSub: 'LPG',
    fuelPremiumTitle: 'Premium Diesel',
    fuelPremiumSub: 'Ultra Diesel',
    perLiter: 'TRY / L',
    alertBoxHeader: 'Fuel Market Monitoring',
    brentOilLabel: 'Brent Oil:',
    usdTryLabel: 'USD/TRY:',
    expectedStatusLabel: 'Status:',
    stationsTitle: 'Station Comparison',
    stationColBrand: 'Station',
    stationColBenzin: 'Petrol',
    stationColMotorin: 'Diesel',
    stationColLpg: 'LPG',
    calcTitle: 'Fuel Calculator',
    calcSubtitle: 'Calculate trip fuel costs.',
    vehicleTypeLabel: 'Vehicle Type:',
    presetScooter: 'Scooter (3.2 L/100km)',
    presetMotor: 'Motorcycle (4.5 L/100km)',
    presetCarBenzin: 'Petrol Car (7.0 L/100km)',
    presetTaxiDiesel: 'Taxi/Diesel (5.8 L/100km)',
    presetVan: 'Van (7.5 L/100km)',
    presetCarLpg: 'LPG Car (9.2 L/100km)',
    presetCustom: 'Custom',
    distanceLabel: 'Distance (km):',
    fuelSelectLabel: 'Fuel:',
    calcSideLabel: 'Side:',
    resKmCost: 'Cost per KM',
    resTripCost: 'Trip Cost',
    resWeeklyCost: 'Weekly Cost',
    resMonthlyCost: 'Monthly Cost',
    resLitersNeeded: 'Liters',
    historyTitle: 'Price Changes Log',
    histColDate: 'Date',
    histColFuel: 'Fuel',
    histColType: 'Type',
    histColAmount: 'Amount',
    histColNewPrice: 'New Price',
    histColNotes: 'Notes',
    badgeZam: 'Increase',
    badgeIndirim: 'Cut',
    guideTitle: 'Fuel Guide',
    guide1Title: 'Tax Deductions',
    guide1Body: 'Couriers can deduct fuel VAT.',
    guide2Title: 'TTS System',
    guide2Body: 'Automated fleet refueling.',
    guide3Title: 'Quality Standard',
    guide3Body: 'Regulated by EPDK.',
    faqTitle: 'FAQ',
    faq1Q: 'Why different prices?',
    faq1A: 'Logistics costs between sides.',
    faq2Q: 'When does it change?',
    faq2A: 'At midnight 00:01.',
    faq3Q: 'How is it calculated?',
    faq3A: 'Brent crude, exchange rate and taxes.'
  };

  // Structured Data Schema for Google Search
  const schemaWebApplication = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': t.heroTitle,
    'description': t.metaDesc,
    'url': `https://jobs-in-istanbul.com/${locale}/akaryakit-fiyatlari`,
    'applicationCategory': 'UtilitiesApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'TRY'
    }
  };

  const schemaFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': t.faq1Q,
        'acceptedAnswer': { '@type': 'Answer', 'text': t.faq1A }
      },
      {
        '@type': 'Question',
        'name': t.faq2Q,
        'acceptedAnswer': { '@type': 'Answer', 'text': t.faq2A }
      },
      {
        '@type': 'Question',
        'name': t.faq3Q,
        'acceptedAnswer': { '@type': 'Answer', 'text': t.faq3A }
      }
    ]
  };

  const seoMetaTags = `
    <title>${t.metaTitle}</title>
    <meta name="description" content="${t.metaDesc}">
    <link rel="canonical" href="https://jobs-in-istanbul.com/${locale}/akaryakit-fiyatlari">
    <link rel="alternate" hreflang="ar" href="https://jobs-in-istanbul.com/ar/akaryakit-fiyatlari">
    <link rel="alternate" hreflang="tr" href="https://jobs-in-istanbul.com/tr/akaryakit-fiyatlari">
    <link rel="alternate" hreflang="en" href="https://jobs-in-istanbul.com/en/akaryakit-fiyatlari">
    <link rel="alternate" hreflang="x-default" href="https://jobs-in-istanbul.com/ar/akaryakit-fiyatlari">
    <meta property="og:title" content="${t.metaTitle}">
    <meta property="og:description" content="${t.metaDesc}">
    <meta property="og:url" content="https://jobs-in-istanbul.com/${locale}/akaryakit-fiyatlari">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://jobs-in-istanbul.com/images/fuel-prices-og.png">
    <script type="application/ld+json">${JSON.stringify(schemaWebApplication)}</script>
    <script type="application/ld+json">${JSON.stringify(schemaFAQ)}</script>
  `;

  const updatedDateFormatted = new Date(dataset.updatedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : (locale === 'tr' ? 'tr-TR' : 'en-US'), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const alertTitle = dataset.alert.title[locale as 'ar' | 'en' | 'tr'] || dataset.alert.title.ar;
  const alertMsg = dataset.alert.message[locale as 'ar' | 'en' | 'tr'] || dataset.alert.message.ar;

  const html = `
    <style>
      .fuel-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 32px 16px 64px;
        color: #1e293b;
      }
      .fuel-hero {
        text-align: center;
        margin-bottom: 32px;
      }
      .fuel-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #fff7ed;
        color: #ea580c;
        border: 1px solid #ffedd5;
        padding: 6px 16px;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 700;
        margin-bottom: 14px;
      }
      .fuel-hero h1 {
        font-size: 2.2rem;
        font-weight: 900;
        color: #0f172a;
        margin-bottom: 12px;
        line-height: 1.25;
      }
      .fuel-hero p {
        font-size: 1.05rem;
        color: #64748b;
        max-width: 820px;
        margin: 0 auto 20px;
        line-height: 1.6;
      }
      .live-pulse {
        display: inline-block;
        width: 10px;
        height: 10px;
        background: #22c55e;
        border-radius: 50%;
        box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
        animation: pulseAnimation 2s infinite;
      }
      @keyframes pulseAnimation {
        0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
        100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      }

      /* Smart Alert Banner */
      .fuel-alert-box {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border: 1.5px solid #93c5fd;
        border-radius: 16px;
        padding: 20px 24px;
        margin-bottom: 32px;
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
      }
      .fuel-alert-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 12px;
      }
      .fuel-alert-title {
        font-size: 1.05rem;
        font-weight: 800;
        color: #1e40af;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fuel-alert-metrics {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 0.82rem;
        font-weight: 700;
        color: #1e3a8a;
      }
      .fuel-alert-metrics span {
        background: white;
        padding: 4px 10px;
        border-radius: 8px;
        border: 1px solid #bfdbfe;
      }
      .fuel-alert-msg {
        font-size: 0.95rem;
        color: #1e3a8a;
        line-height: 1.6;
        margin: 0;
      }

      /* Side Selector Tabs */
      .side-tabs {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-bottom: 28px;
      }
      .side-btn {
        padding: 12px 28px;
        border-radius: 12px;
        border: 2px solid #e2e8f0;
        background: white;
        color: #475569;
        font-weight: 800;
        font-size: 0.98rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .side-btn.active {
        background: #ea580c;
        border-color: #ea580c;
        color: white;
        box-shadow: 0 4px 14px rgba(234, 88, 12, 0.25);
      }

      /* Core Fuel Cards */
      .fuel-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
      }
      .fuel-card {
        background: white;
        border: 1.5px solid #e2e8f0;
        border-radius: 20px;
        padding: 24px;
        position: relative;
        overflow: hidden;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      }
      .fuel-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 24px rgba(0,0,0,0.08);
      }
      .fuel-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
      }
      .fuel-card.benzin::before { background: linear-gradient(90deg, #ef4444, #f97316); }
      .fuel-card.motorin::before { background: linear-gradient(90deg, #3b82f6, #06b6d4); }
      .fuel-card.lpg::before { background: linear-gradient(90deg, #10b981, #84cc16); }
      .fuel-card.premium::before { background: linear-gradient(90deg, #8b5cf6, #ec4899); }

      .fuel-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .fuel-card-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }
      .fuel-card.benzin .fuel-card-icon { background: #fef2f2; color: #ef4444; }
      .fuel-card.motorin .fuel-card-icon { background: #eff6ff; color: #3b82f6; }
      .fuel-card.lpg .fuel-card-icon { background: #f0fdf4; color: #10b981; }
      .fuel-card.premium .fuel-card-icon { background: #faf5ff; color: #8b5cf6; }

      .fuel-card-name {
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 2px;
      }
      .fuel-card-sub {
        font-size: 0.78rem;
        color: #64748b;
        font-weight: 600;
      }
      .fuel-price-val {
        font-size: 2.3rem;
        font-weight: 900;
        color: #0f172a;
        margin: 14px 0 4px;
        font-family: monospace, sans-serif;
        letter-spacing: -0.5px;
      }
      .fuel-price-unit {
        font-size: 0.85rem;
        color: #64748b;
        font-weight: 700;
      }

      /* Station Table */
      .section-box {
        background: white;
        border: 1.5px solid #e2e8f0;
        border-radius: 20px;
        padding: 28px;
        margin-bottom: 40px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.02);
      }
      .section-header {
        margin-bottom: 20px;
      }
      .section-title {
        font-size: 1.4rem;
        font-weight: 800;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .table-wrapper {
        overflow-x: auto;
      }
      .custom-table {
        width: 100%;
        border-collapse: collapse;
        text-align: ${isRtl ? 'right' : 'left'};
      }
      .custom-table th {
        background: #f8fafc;
        padding: 14px 16px;
        font-size: 0.85rem;
        font-weight: 800;
        color: #475569;
        border-bottom: 2px solid #e2e8f0;
        white-space: nowrap;
      }
      .custom-table td {
        padding: 14px 16px;
        font-size: 0.95rem;
        color: #1e293b;
        border-bottom: 1px solid #f1f5f9;
        font-weight: 600;
      }
      .custom-table tr:hover td {
        background: #f8fafc;
      }

      /* Calculator Box */
      .calc-wrapper {
        background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
        border: 2px solid #fdba74;
        border-radius: 20px;
        padding: 32px;
        margin-bottom: 40px;
      }
      .calc-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;
      }
      @media (max-width: 840px) {
        .calc-grid { grid-template-columns: 1fr; }
      }
      .form-group {
        margin-bottom: 18px;
      }
      .form-label {
        display: block;
        font-size: 0.9rem;
        font-weight: 800;
        color: #9a3412;
        margin-bottom: 8px;
      }
      .form-select, .form-input {
        width: 100%;
        padding: 12px 16px;
        border-radius: 12px;
        border: 1.5px solid #fdba74;
        background: white;
        font-size: 0.95rem;
        font-weight: 600;
        color: #1e293b;
        outline: none;
        transition: border-color 0.2s;
      }
      .form-select:focus, .form-input:focus {
        border-color: #ea580c;
      }
      .calc-results-card {
        background: white;
        border-radius: 16px;
        padding: 24px;
        border: 1.5px solid #fdba74;
        box-shadow: 0 4px 16px rgba(234, 88, 12, 0.08);
      }
      .calc-stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .calc-stat-row:last-child {
        border-bottom: none;
      }
      .calc-stat-label {
        font-size: 0.9rem;
        color: #64748b;
        font-weight: 600;
      }
      .calc-stat-val {
        font-size: 1.25rem;
        font-weight: 800;
        color: #ea580c;
        font-family: monospace, sans-serif;
      }
      .calc-stat-val.primary-highlight {
        font-size: 1.6rem;
        color: #c2410c;
      }

      /* Badges */
      .badge-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.78rem;
        font-weight: 800;
      }
      .badge-zam {
        background: #fee2e2;
        color: #b91c1c;
      }
      .badge-indirim {
        background: #dcfce7;
        color: #15803d;
      }

      /* Guide & FAQ */
      .guide-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .guide-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 20px;
      }
      .guide-card h3 {
        font-size: 1.05rem;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 8px;
      }
      .guide-card p {
        font-size: 0.88rem;
        color: #475569;
        line-height: 1.6;
        margin: 0;
      }

      .faq-item {
        border-bottom: 1px solid #e2e8f0;
        padding: 16px 0;
      }
      .faq-item:last-child { border-bottom: none; }
      .faq-question {
        font-size: 1.05rem;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 8px;
      }
      .faq-answer {
        font-size: 0.92rem;
        color: #475569;
        line-height: 1.6;
        margin: 0;
      }
    </style>

    <div class="fuel-container">
      <!-- HERO -->
      <div class="fuel-hero">
        <div class="fuel-badge">
          <span class="live-pulse"></span>
          <span>${t.heroBadge}</span>
        </div>
        <h1>${t.heroTitle}</h1>
        <p>${t.heroSubtitle}</p>
        <div style="font-size: 0.85rem; color: #64748b; font-weight: 700;">
          <i class="fa-regular fa-clock" style="margin-inline-end: 4px;"></i>
          ${t.lastUpdatedText} <strong>${updatedDateFormatted}</strong>
        </div>
      </div>

      <!-- SMART ALERT BANNER (Zam / İndirim Uyarısı) -->
      <div class="fuel-alert-box">
        <div style="font-size: 0.78rem; font-weight: 800; color: #3b82f6; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">
          <i class="fa-solid fa-chart-line" style="margin-inline-end: 4px;"></i>
          ${t.alertBoxHeader}
        </div>
        <div class="fuel-alert-top">
          <div class="fuel-alert-title">
            <i class="fa-solid fa-bell" style="color: #2563eb;"></i>
            <span>${alertTitle}</span>
          </div>
          <div class="fuel-alert-metrics">
            <span>${t.brentOilLabel} $${dataset.alert.brentOilPriceUsd}</span>
            <span>${t.usdTryLabel} ${dataset.alert.usdTryRate} ₺</span>
          </div>
        </div>
        <p class="fuel-alert-msg">${alertMsg}</p>
      </div>

      <!-- SIDE TABS (Avrupa vs Anadolu) -->
      <div class="side-tabs">
        <button id="btn-avrupa" class="side-btn active" onclick="switchSide('avrupa')">
          <i class="fa-solid fa-bridge"></i>
          <span>${t.sideAvrupa}</span>
        </button>
        <button id="btn-anadolu" class="side-btn" onclick="switchSide('anadolu')">
          <i class="fa-solid fa-mosque"></i>
          <span>${t.sideAnadolu}</span>
        </button>
      </div>

      <!-- CORE FUEL CARDS -->
      <div class="fuel-cards-grid">
        <!-- Benzin 95 -->
        <div class="fuel-card benzin">
          <div class="fuel-card-header">
            <div>
              <div class="fuel-card-name">${t.fuelBenzinTitle}</div>
              <div class="fuel-card-sub">${t.fuelBenzinSub}</div>
            </div>
            <div class="fuel-card-icon">
              <i class="fa-solid fa-gas-pump"></i>
            </div>
          </div>
          <div class="fuel-price-val" id="price-benzin">${dataset.avrupa.benzin95.toFixed(2)} ₺</div>
          <div class="fuel-price-unit">${t.perLiter}</div>
        </div>

        <!-- Motorin / Dizel -->
        <div class="fuel-card motorin">
          <div class="fuel-card-header">
            <div>
              <div class="fuel-card-name">${t.fuelMotorinTitle}</div>
              <div class="fuel-card-sub">${t.fuelMotorinSub}</div>
            </div>
            <div class="fuel-card-icon">
              <i class="fa-solid fa-truck-pickup"></i>
            </div>
          </div>
          <div class="fuel-price-val" id="price-motorin">${dataset.avrupa.motorin.toFixed(2)} ₺</div>
          <div class="fuel-price-unit">${t.perLiter}</div>
        </div>

        <!-- Otogaz / LPG -->
        <div class="fuel-card lpg">
          <div class="fuel-card-header">
            <div>
              <div class="fuel-card-name">${t.fuelLpgTitle}</div>
              <div class="fuel-card-sub">${t.fuelLpgSub}</div>
            </div>
            <div class="fuel-card-icon">
              <i class="fa-solid fa-fire-flame-simple"></i>
            </div>
          </div>
          <div class="fuel-price-val" id="price-lpg">${dataset.avrupa.lpg.toFixed(2)} ₺</div>
          <div class="fuel-price-unit">${t.perLiter}</div>
        </div>

        <!-- Premium Diesel -->
        <div class="fuel-card premium">
          <div class="fuel-card-header">
            <div>
              <div class="fuel-card-name">${t.fuelPremiumTitle}</div>
              <div class="fuel-card-sub">${t.fuelPremiumSub}</div>
            </div>
            <div class="fuel-card-icon">
              <i class="fa-solid fa-gauge-high"></i>
            </div>
          </div>
          <div class="fuel-price-val" id="price-premium">${dataset.avrupa.motorinPremium.toFixed(2)} ₺</div>
          <div class="fuel-price-unit">${t.perLiter}</div>
        </div>
      </div>

      <!-- TRIP & COURIER FUEL COST CALCULATOR -->
      <div class="calc-wrapper">
        <div class="section-header">
          <h2 class="section-title" style="color: #9a3412;">
            <i class="fa-solid fa-calculator" style="color: #ea580c;"></i>
            <span>${t.calcTitle}</span>
          </h2>
          <p style="color: #c2410c; margin-top: 4px; font-weight: 600;">${t.calcSubtitle}</p>
        </div>

        <div class="calc-grid">
          <div>
            <div class="form-group">
              <label class="form-label">${t.vehicleTypeLabel}</label>
              <select id="calc-preset" class="form-select">
                <option value="3.2" data-fuel="benzin">${t.presetScooter}</option>
                <option value="4.5" data-fuel="benzin">${t.presetMotor}</option>
                <option value="7.0" data-fuel="benzin" selected>${t.presetCarBenzin}</option>
                <option value="5.8" data-fuel="motorin">${t.presetTaxiDiesel}</option>
                <option value="7.5" data-fuel="motorin">${t.presetVan}</option>
                <option value="9.2" data-fuel="lpg">${t.presetCarLpg}</option>
                <option value="custom" data-fuel="benzin">${t.presetCustom}</option>
              </select>
            </div>

            <div class="form-group" id="custom-consumption-group" style="display: none;">
              <label class="form-label">الاستهلاك لكل 100 كم (لتر / 100km):</label>
              <input type="number" id="custom-consumption-val" class="form-input" value="7.0" step="0.1" min="1" max="30">
            </div>

            <div class="form-group">
              <label class="form-label">${t.fuelSelectLabel}</label>
              <select id="calc-fuel-type" class="form-select">
                <option value="benzin">${t.fuelBenzinTitle}</option>
                <option value="motorin">${t.fuelMotorinTitle}</option>
                <option value="lpg">${t.fuelLpgTitle}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${t.distanceLabel} (<span id="distance-display-val">100</span> km)</label>
              <input type="range" id="calc-distance-range" min="5" max="500" value="100" step="5" style="width: 100%; accent-color: #ea580c; cursor: pointer; margin-bottom: 8px;">
              <input type="number" id="calc-distance-num" class="form-input" value="100" min="1" max="2000">
            </div>
          </div>

          <div class="calc-results-card">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 16px; border-bottom: 2px solid #fed7aa; padding-bottom: 10px;">
              <i class="fa-solid fa-receipt" style="color: #ea580c; margin-inline-end: 6px;"></i>
              نتيجة الحساب التقديرية
            </h3>

            <div class="calc-stat-row">
              <span class="calc-stat-label">${t.resKmCost}</span>
              <span class="calc-stat-val" id="res-km-cost">3.05 ₺</span>
            </div>

            <div class="calc-stat-row">
              <span class="calc-stat-label">${t.resTripCost}</span>
              <span class="calc-stat-val primary-highlight" id="res-trip-cost">304.57 ₺</span>
            </div>

            <div class="calc-stat-row">
              <span class="calc-stat-label">${t.resWeeklyCost}</span>
              <span class="calc-stat-val" id="res-weekly-cost">1,827.42 ₺</span>
            </div>

            <div class="calc-stat-row">
              <span class="calc-stat-label">${t.resMonthlyCost}</span>
              <span class="calc-stat-val" id="res-monthly-cost">9,137.10 ₺</span>
            </div>

            <div class="calc-stat-row">
              <span class="calc-stat-label">${t.resLitersNeeded}</span>
              <span class="calc-stat-val" id="res-liters" style="color: #475569;">7.00 L</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MAJOR BRANDS COMPARISON TABLE -->
      <div class="section-box">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fa-solid fa-building-flag" style="color: #ea580c;"></i>
            <span>${t.stationsTitle}</span>
          </h2>
        </div>

        <div class="table-wrapper">
          <table class="custom-table" id="stations-table">
            <thead>
              <tr>
                <th>${t.stationColBrand}</th>
                <th>${t.stationColBenzin}</th>
                <th>${t.stationColMotorin}</th>
                <th>${t.stationColLpg}</th>
              </tr>
            </thead>
            <tbody id="stations-tbody">
              ${dataset.avrupa.stations.map(s => `
                <tr>
                  <td><strong>${s.name}</strong></td>
                  <td>${s.benzin.toFixed(2)} ₺</td>
                  <td>${s.motorin.toFixed(2)} ₺</td>
                  <td>${s.lpg.toFixed(2)} ₺</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECENT PRICE CHANGES HISTORY TABLE (Zam / İndirim Geçmişi) -->
      <div class="section-box">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fa-solid fa-clock-rotate-left" style="color: #3b82f6;"></i>
            <span>${t.historyTitle}</span>
          </h2>
        </div>

        <div class="table-wrapper">
          <table class="custom-table">
            <thead>
              <tr>
                <th>${t.histColDate}</th>
                <th>${t.histColFuel}</th>
                <th>${t.histColType}</th>
                <th>${t.histColAmount}</th>
                <th>${t.histColNewPrice}</th>
                <th>${t.histColNotes}</th>
              </tr>
            </thead>
            <tbody>
              ${dataset.history.map(h => `
                <tr>
                  <td>${h.date}</td>
                  <td><strong>${h.fuelTypeName[locale as 'ar' | 'en' | 'tr'] || h.fuelTypeName.ar}</strong></td>
                  <td>
                    <span class="badge-chip ${h.changeType === 'zam' ? 'badge-zam' : 'badge-indirim'}">
                      <i class="fa-solid ${h.changeType === 'zam' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
                      ${h.changeType === 'zam' ? t.badgeZam : t.badgeIndirim}
                    </span>
                  </td>
                  <td style="color: ${h.changeType === 'zam' ? '#b91c1c' : '#15803d'}; font-weight: 800;">
                    ${h.changeType === 'zam' ? '+' : '-'}${h.amount.toFixed(2)} ₺
                  </td>
                  <td><strong>${h.priceAfterChange.toFixed(2)} ₺</strong></td>
                  <td>${h.note[locale as 'ar' | 'en' | 'tr'] || h.note.ar}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- DRIVER & COURIER GUIDE -->
      <div class="section-box">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fa-solid fa-book-open-reader" style="color: #10b981;"></i>
            <span>${t.guideTitle}</span>
          </h2>
        </div>

        <div class="guide-grid">
          <div class="guide-card">
            <h3>${t.guide1Title}</h3>
            <p>${t.guide1Body}</p>
          </div>
          <div class="guide-card">
            <h3>${t.guide2Title}</h3>
            <p>${t.guide2Body}</p>
          </div>
          <div class="guide-card">
            <h3>${t.guide3Title}</h3>
            <p>${t.guide3Body}</p>
          </div>
        </div>
      </div>

      <!-- FAQ SECTION -->
      <div class="section-box">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fa-solid fa-circle-question" style="color: #6366f1;"></i>
            <span>${t.faqTitle}</span>
          </h2>
        </div>

        <div class="faq-item">
          <div class="faq-question">${t.faq1Q}</div>
          <div class="faq-answer">${t.faq1A}</div>
        </div>
        <div class="faq-item">
          <div class="faq-question">${t.faq2Q}</div>
          <div class="faq-answer">${t.faq2A}</div>
        </div>
        <div class="faq-item">
          <div class="faq-question">${t.faq3Q}</div>
          <div class="faq-answer">${t.faq3A}</div>
        </div>
      </div>
    </div>

    <!-- CLIENT LOGIC -->
    <script>
      (function() {
        const rawDataset = ${JSON.stringify(dataset)};
        let currentSide = 'avrupa';

        const btnAvrupa = document.getElementById('btn-avrupa');
        const btnAnadolu = document.getElementById('btn-anadolu');
        const priceBenzinEl = document.getElementById('price-benzin');
        const priceMotorinEl = document.getElementById('price-motorin');
        const priceLpgEl = document.getElementById('price-lpg');
        const pricePremiumEl = document.getElementById('price-premium');
        const stationsTbody = document.getElementById('stations-tbody');

        // Calculator inputs
        const presetSelect = document.getElementById('calc-preset');
        const customGroup = document.getElementById('custom-consumption-group');
        const customInput = document.getElementById('custom-consumption-val');
        const fuelSelect = document.getElementById('calc-fuel-type');
        const distanceRange = document.getElementById('calc-distance-range');
        const distanceNum = document.getElementById('calc-distance-num');
        const distanceDisplay = document.getElementById('distance-display-val');

        // Output elements
        const resKmCost = document.getElementById('res-km-cost');
        const resTripCost = document.getElementById('res-trip-cost');
        const resWeeklyCost = document.getElementById('res-weekly-cost');
        const resMonthlyCost = document.getElementById('res-monthly-cost');
        const resLiters = document.getElementById('res-liters');

        window.switchSide = function(side) {
          currentSide = side;
          if (side === 'avrupa') {
            btnAvrupa.classList.add('active');
            btnAnadolu.classList.remove('active');
          } else {
            btnAnadolu.classList.add('active');
            btnAvrupa.classList.remove('active');
          }

          const sideData = rawDataset[side];
          priceBenzinEl.textContent = sideData.benzin95.toFixed(2) + ' ₺';
          priceMotorinEl.textContent = sideData.motorin.toFixed(2) + ' ₺';
          priceLpgEl.textContent = sideData.lpg.toFixed(2) + ' ₺';
          pricePremiumEl.textContent = sideData.motorinPremium.toFixed(2) + ' ₺';

          // Update stations table
          stationsTbody.innerHTML = sideData.stations.map(s => 
            '<tr>' +
              '<td><strong>' + s.name + '</strong></td>' +
              '<td>' + s.benzin.toFixed(2) + ' ₺</td>' +
              '<td>' + s.motorin.toFixed(2) + ' ₺</td>' +
              '<td>' + s.lpg.toFixed(2) + ' ₺</td>' +
            '</tr>'
          ).join('');

          calculateFuel();
        };

        function calculateFuel() {
          const isCustom = presetSelect.value === 'custom';
          customGroup.style.display = isCustom ? 'block' : 'none';

          let consumption = parseFloat(presetSelect.value);
          if (isCustom) {
            consumption = parseFloat(customInput.value) || 7.0;
          }

          const distance = parseFloat(distanceNum.value) || 0;
          const fuelType = fuelSelect.value;
          const sideData = rawDataset[currentSide];

          let pricePerLiter = sideData.benzin95;
          if (fuelType === 'motorin') pricePerLiter = sideData.motorin;
          if (fuelType === 'lpg') pricePerLiter = sideData.lpg;

          const litersNeeded = (distance * consumption) / 100;
          const tripCost = litersNeeded * pricePerLiter;
          const kmCost = distance > 0 ? (tripCost / distance) : 0;
          const weeklyCost = tripCost * 6;
          const monthlyCost = tripCost * 30;

          resKmCost.textContent = kmCost.toFixed(2) + ' ₺';
          resTripCost.textContent = tripCost.toFixed(2) + ' ₺';
          resWeeklyCost.textContent = weeklyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
          resMonthlyCost.textContent = monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
          resLiters.textContent = litersNeeded.toFixed(2) + ' L';
        }

        // Event listeners
        presetSelect.addEventListener('change', () => {
          const selectedOpt = presetSelect.options[presetSelect.selectedIndex];
          const autoFuel = selectedOpt.getAttribute('data-fuel');
          if (autoFuel) {
            fuelSelect.value = autoFuel;
          }
          calculateFuel();
        });

        customInput.addEventListener('input', calculateFuel);
        fuelSelect.addEventListener('change', calculateFuel);

        distanceRange.addEventListener('input', (e) => {
          distanceNum.value = e.target.value;
          distanceDisplay.textContent = e.target.value;
          calculateFuel();
        });

        distanceNum.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value) || 0;
          if (val <= 500) distanceRange.value = val;
          distanceDisplay.textContent = val;
          calculateFuel();
        });

        // Run initial calculation
        calculateFuel();
      })();
    </script>
  `;

  c.header('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600');
  return c.html(renderLayout(c, t.metaTitle, html, locale, seoMetaTags));
});
