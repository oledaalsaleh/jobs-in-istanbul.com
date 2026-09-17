/**
 * SEO & Structured Data Helpers
 *
 * Generates meta tags and Schema.org structured data (JSON-LD) for different pages.
 */

interface MetaDataInput {
  title?: string;
  description?: string;
  slug?: string;
  image?: string;
  publishedAt?: number;
  updatedAt?: number;
  companyName?: string;
  companyLogo?: string;
  companyWebsite?: string;
  industry?: string;
  salary?: string;
  location?: string;
  jobType?: string;
  seoKeywords?: string[] | string;
  seoDescription?: string;
  canonical?: string;
  robots?: string;
  faqs?: Array<{ question: string; answer: string }>;
  category?: string;
}

export function generateMetaTags(
  locale: 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur' | string,
  pageType: 'home' | 'job' | 'submit' | 'blog' | 'blog_post' |
    'cv-optimizer' | 'salary-calculator' | 'resume-builder' | 'cover-letter-generator' | 'work-permit-calculator' | 'turkish-test' | 'interview-prep' | 'ats-scanner' | 'workplace-quiz' |
    'salary-calculator-2026' | 'investor-calculator' | 'work-permit-eligibility' |
    'currency-prices' | 'gold-prices' | 'insights' |
    'about' | 'contact' | 'privacy' | 'terms' | 'install',
  data: MetaDataInput = {}
) {
  const siteUrl = 'https://jobs-in-istanbul.com';

  const defaultsTable: Record<string, any> = {
    ar: {
      title: 'وظائف في إسطنبول | وظائف لمتحدثي الإنجليزية في تركيا',
      desc: 'ابحث عن أحدث فرص العمل للوافدين والمحترفين المتحدثين باللغة الإنجليزية في إسطنبول. تقدّم للوظائف التقنية، المبيعات، والتعليم اليوم.',
    },
    en: {
      title: 'Jobs in Istanbul | English Speaking Jobs in Turkey',
      desc: 'Find the latest job opportunities for expats and English-speaking professionals in Istanbul. Apply to tech, sales, and education roles today.',
    },
    tr: {
      title: 'İstanbul İş İlanları | Türkiye\'de İngilizce ve Türkçe İş Fırsatları',
      desc: 'İstanbul\'daki yabancılar ve yerel profesyoneller için en son iş fırsatlarını bulun. Teknoloji, satış, eğitim ve diğer sektörlerdeki işlere bugün başvurun.',
    },
    ru: {
      title: 'Работа в Стамбуле | Вакансии для иностранцев и русскоязычных',
      desc: 'Найдите последние вакансии для экспатов и русскоязычных специалистов в Стамбуле. Подайте заявку на работу в сфере IT, продаж и образования сегодня.',
    },
    fa: {
      title: 'کار در استانبول | کاریابی و مشاغل در استانبول ترکیه برای فارسی زبانان',
      desc: 'جدیدترین فرصت‌های شغلی و استخدام در استانبول ترکیه برای ایرانیان و فارسی زبانان. همین امروز برای مشاغل فنی، فروش و تدریس اقدام کنید.',
    },
    ur: {
      title: 'استنبول میں ملازمتیں | اردو بولنے والوں کے لیے روزگار کے مواقع',
      desc: 'استنبول ترکی میں اردو بولنے والوں اور تارکینِ وطن کے لیے ملازمت کے تازہ ترین مواقع تلاش کریں۔ آج ہی آئی ٹی، سیلز اور تدریس کی ملازمتوں کے لیے درخواست دیں۔',
    }
  };
  const defaults = defaultsTable[locale] || defaultsTable['en'];

  let title = data.title || defaults.title;
  let desc = data.seoDescription || data.description || defaults.desc;

  if (pageType === 'job') {
    title = locale === 'tr'
      ? `${data.title} - ${data.companyName} bünyesinde İstanbul'da İş İlanı`
      : (locale === 'ar'
        ? `${data.title} - وظيفة في إسطنبول لدى ${data.companyName}`
        : (locale === 'ru'
          ? `${data.title} - Работа в Стамбуле в компании ${data.companyName}`
          : (locale === 'fa'
            ? `${data.title} - کار در استانبول در ${data.companyName}`
            : (locale === 'ur'
              ? `${data.title} - استنبول میں ملازمت پر ${data.companyName}`
              : `${data.title} - Job in Istanbul at ${data.companyName}`))));
    desc = data.seoDescription || (data.description ? data.description.substring(0, 160).replace(/<[^>]*>/g, '') : defaults.desc);
  } else if (pageType === 'submit') {
    title = locale === 'tr' ? 'İstanbul\'da İş İlanı Yayınlayın' : (locale === 'ar' ? 'أعلن عن وظيفة شاغرة في إسطنبول' : (locale === 'ru' ? 'Разместить вакансию в Стамбуле' : (locale === 'fa' ? 'ثبت آگهی استخدام در استانبول' : (locale === 'ur' ? 'استنبول میں ملازمت کا اشتہار دیں' : 'Post a Job Vacancy in Istanbul'))));
    desc = locale === 'tr'
      ? 'Şirketinizdeki açık pozisyonlar için ilan verin, İstanbul\'daki binlerce nitelikli iş arayana ulaşın.'
      : (locale === 'ar'
        ? 'أعلن عن وظيفة شاغرة في شركتك وقم بالوصول إلى آلاف الكفاءات والباحثين عن عمل في إسطنبول.'
        : (locale === 'ru'
          ? 'Разместите вакансию вашей компании и привлеките тысячи квалифицированных соискателей в Стамбуле.'
          : (locale === 'fa'
            ? 'آگهی استخدام شرکت خود را ثبت کنید و به هزاران کارجوی متخصص در استانبول دسترسی پیدا کنید.'
            : (locale === 'ur'
              ? 'اپنی کمپنی میں خالی اسامی کا اشتہار دیں اور استنبول میں ہزاروں ہنرمندوں تک پہنچیں۔'
              : 'Post a vacancy in your organization and reach thousands of skilled job seekers in Istanbul.'))));
  } else if (pageType === 'blog') {
    title = locale === 'tr'
      ? 'Kariyer Blogu - İstanbul | Çalışma İzni ve Ulaşım İpuçları'
      : (locale === 'ar'
        ? 'مدونة المهنة - إسطنبول | نصائح التوظيف وإقامة العمل في تركيا'
        : (locale === 'ru'
          ? 'Блог о карьере в Стамбуле | Разрешения на работу и транспорт'
          : (locale === 'fa'
            ? 'وبلاگ کاریابی استانبول | راهنمای اجازه کار و قوانین اقامت کاری ترکیه'
            : 'Career Blog - Istanbul | Work Permits & Commuting Tips')));
    desc = locale === 'tr'
      ? 'İstanbul\'da çalışmaya dair rehberiniz. ATS özgeçmiş optimizasyonu, çalışma izni yasaları ve ulaşım hakkında ipuçları içeren yazıları okuyun.'
      : (locale === 'ar'
        ? 'دليلك المهني الشامل ونواصح التوظيف في إسطنبول. اقرأ حول تعديل السير الذاتية لأنظمة ATS وقوانين إقامة العمل والمواصلات في إسطنبول.'
        : (locale === 'ru'
          ? 'Ваш гид по работе в Стамбуле. Читайте статьи об оптимизации резюме для ATS, законах о разрешениях на работу и транспорте.'
          : (locale === 'fa'
            ? 'راهنمای جامع شما برای کار در استانبول. مقالاتی در مورد اجازه کار در ترکیه، بهینه‌سازی رزومه برای سیستم‌های ATS و حمل و نقل بخوانید.'
            : 'Your ultimate guide to working in Istanbul. Read articles on ATS resume optimization, work permit laws, and navigating transportation.')));
  } else if (pageType === 'blog_post') {
    title = locale === 'tr'
      ? `${data.title} | İstanbul Kariyer Blogu`
      : (locale === 'ar'
        ? `${data.title} | مدونة المهنة إسطنبول`
        : (locale === 'ru'
          ? `${data.title} | Блог о карьере в Стамбуле`
          : (locale === 'fa'
            ? `${data.title} | وبلاگ کار در استانبول`
            : (locale === 'ur'
              ? `${data.title} | استنبول کیریئر بلاگ`
              : `${data.title} | Istanbul Career Blog`))));
    desc = data.description ? data.description.substring(0, 160).replace(/<[^>]*>/g, '') : defaults.desc;
  } else if (pageType === 'cv-optimizer') {
    title = data.title || {
      ar: 'مساعد الذكاء الاصطناعي لتحسين السيرة الذاتية',
      en: 'AI CV & Cover Letter Optimizer',
      tr: 'Yapay Zeka ile CV ve Ön Yazı Geliştirici',
      ru: 'ИИ-Улучшение резюме и Сопроводительное письмо',
      fa: 'بهینه‌ساز رزومه و انگیزه‌نامه با هوش مصنوعی',
      ur: 'اے آئی سي وي آپٹیمائزر اور كور لیٹر جنریٹر'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'قم بتحسين سيرتك الذاتية وكتابة رسائل التغطية (Cover Letter) بشكل احترافي ومخصص للوظيفة التي تريدها باستخدام الذكاء الاصطناعي.',
      en: 'Optimize your resume and generate customized, professional cover letters tailored to your target job using Workers AI.',
      tr: 'Workers AI kullanarak özgeçmişinizi optimize edin ve hedef işinize özel profesyonel ön yazılar oluşturun.',
      ru: 'Оптимизируйте свое резюме с помощью Workers AI и создайте профессиональные сопроводительные письма, адаптированные для вашей цели.',
      fa: 'رزومه خود را بهینه‌سازی کنید و انگیزه‌نامه‌های سفارشی و حرفه‌ای متناسب با شغل هدف خود با استفاده از هوش مصنوعی بنویسید.',
      ur: 'مصنوعی ذہانت کی مدد سے اپنے سی وی کو ملازمت کے مطابق بہتر بنائیں اور پرکشش کور لیٹر لکھیں۔'
    }[locale];
  } else if (pageType === 'salary-calculator') {
    title = data.title || {
      ar: 'حاسبة ومؤشر الرواتب في إسطنبول',
      en: 'Istanbul Salary Estimator',
      tr: 'İstanbul Maaş Hesaplama ve İndeksi',
      ru: 'Калькулятор зарплаты в Стамбуле',
      fa: 'محاسبه حقوق و دستمزد در استانبول',
      ur: 'استنبول سیلری کیلکولیٹر'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'اعرف القيمة التقديرية لراتبك المتوقع في سوق العمل في إسطنبول لعام ٢٠٢٦ بناءً على تخصصك وخبرتك ولغاتك.',
      en: 'Calculate your estimated monthly salary range in the Istanbul job market for 2026 based on field, experience, and languages.',
      tr: 'İstanbul iş hayatında alanınıza, deneyiminize ve bildiğiniz dillere göre alabileceğiniz aylık tahmini maaşı hesaplayın.',
      ru: 'Рассчитайте примерную зарплату на рынке труда в Стамбуле на 2026 год на основе вашей сферы деятельности, опыта и знания языков.',
      fa: 'حقوق تخمینی خود را در بازار کار استانبول برای سال ۲۰۲۶ بر اساس تخصص، تجربه و زبان‌های خود محاسبه کنید.',
      ur: 'اپنی فیلد، تجربہ اور زبانوں کی بنیاد پر استنبول مارکیٹ میں متوقع ماہانہ تنخواہ کا اندازہ لگائیں۔'
    }[locale];
  } else if (pageType === 'resume-builder') {
    title = data.title || {
      ar: 'منشئ السيرة الذاتية الاحترافية التفاعلي',
      en: 'Professional Interactive Resume Builder',
      tr: 'Profesyonel İnteraktif CV Hazırlama',
      ru: 'Создатель профессионального резюме',
      fa: 'رزومه‌ساز تعاملی حرفه‌ای',
      ur: 'پروفیشنل انٹرایکٹو سی وی میکر'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'اصنع سيرتك الذاتية المميزة بخطوات بسيطة، وتصفح قوالب متعددة، وقم بتنزيلها كـ PDF فوراً.',
      en: 'Create a stand-out resume in simple steps, choose templates, and export as PDF instantly.',
      tr: 'Birkaç adımda dikkat çekici bir özgeçmiş oluşturun, şablonları seçin ve anında PDF olarak indirin.',
      ru: 'Создайте выдающееся резюме за простые шаги, выберите шаблон и мгновенно экспортируйте его в PDF.',
      fa: 'رزومه حرفه‌ای خود را در چند گام ساده بسازید، قالب مورد نظر را انتخاب کنید و فورا خروجی PDF بگیرید.',
      ur: 'چند آسان مراحل میں اپنی شاندار سی وی تیار کریں، ٹیمپلیٹس کا انتخاب کریں اور فوراً پی ڈی ایف ڈاؤن لوڈ کریں۔'
    }[locale];
  } else if (pageType === 'cover-letter-generator') {
    title = data.title || {
      ar: 'مولد رسائل التغطية الذكي بالذكاء الاصطناعي',
      en: 'AI Cover Letter Generator',
      tr: 'Yapay Zeka Ön Yazı Oluşturucu',
      ru: 'ИИ-Генератор сопроводительных писем',
      fa: 'مولد انگیزه‌نامه هوشمند با هوش مصنوعی',
      ur: 'اے آئی کور لیٹر جنریٹر'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'اصنع رسالة تغطية (Cover Letter) مخصصة وجذابة لأي وظيفة تريد التقديم عليها باستخدام الذكاء الاصطناعي.',
      en: 'Draft a highly customized, compelling cover letter for any job application using edge Workers AI.',
      tr: 'Workers AI kullanarak herhangi bir iş başvurusu için özelleştirilmiş ve etkileyici bir ön yazı taslağı oluşturun.',
      ru: 'Создайте индивидуальное, убедительное сопроводительное письмо для любого отклика на вакансию с помощью ИИ.',
      fa: 'با استفاده از هوش مصنوعی، برای هر موقعیت شغلی یک انگیزه‌نامه سفارشی، جذاب و کاملاً حرفه‌ای بنویسید.',
      ur: 'مصنوعی ذہانت کی مدد سے کسی بھی نوکری کے لیے انتہائی موزوں اور پرکشش کور لیٹر خودکار طور پر تیار کریں۔'
    }[locale];
  } else if (pageType === 'work-permit-calculator') {
    title = data.title || {
      ar: 'حاسبة الأهلية لإذن العمل التركي والجنسية',
      en: 'Turkish Work Permit & Citizenship Calculator',
      tr: 'Türkiye Çalışma İzni ve Vatandaşlık Hesaplama Aracı',
      ru: 'Калькулятор разрешений на работу и гражданства Турции',
      fa: 'محاسبه‌گر اجازه کار و شهروندی ترکیه',
      ur: 'ترکی ورک پرمٹ اور شہریت کاؤنٹر'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'احسب نسبة أهليتك للحصول على إذن العمل (Çalışma İzni) أو الجنسية التركية وفقاً لأحدث القوانين واللوائح للعام ٢٠٢٦.',
      en: 'Calculate your eligibility score for a Turkish Work Permit (Çalışma İzni) or citizenship based on the latest 2026 regulations.',
      tr: 'En son 2026 yönetmeliklerine göre Türkiye Çalışma İzni (Çalışma İzni) veya vatandaşlık için uygunluk puanınızı hesaplayın.',
      ru: 'Рассчитайте свои шансы на получение разрешения на работу в Турции (Çalışma İzni) или гражданства на основе законов 2026 года.',
      fa: 'میزان صلاحیت خود را برای دریافت اجازه کار ترکیه (Çalışma İzni) یا شهروندی بر اساس آخرین قوانین سال ۲۰۲۶ ارزیابی کنید.',
      ur: 'تازہ ترین ۲۰۲۶ کے قوانین کی روشنی میں ترکی میں ورک پرمٹ أو شہریت کی اہلیت کے اسكور کا فوری حساب لگائیں۔'
    }[locale];
  } else if (pageType === 'turkish-test') {
    title = data.title || {
      ar: 'اختبار اللغة التركية المهنية للعمل',
      en: 'Business Turkish Competency Test',
      tr: 'Mesleki Türkçe Seviye Testi',
      ru: 'Тест на знание делового турецкого языка',
      fa: 'آزمون زبان ترکی تجاری و کاری',
      ur: 'کاروباری ترکی زبان کا ٹیسٹ'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'اختبر مهاراتك اللغوية وقدرتك على الفهم واستخدام المصطلحات المهنية في بيئة العمل التركية واحصل على شهادتك مجاناً.',
      en: 'Test your understanding and usage of professional Turkish terms and workplace language to earn a digital certificate.',
      tr: 'Dijital sertifika kazanmak için profesyonel Türkçe terimleri ve iş yeri dilini anlama seviyenizi test edin.',
      ru: 'Проверьте свое понимание и использование делового турецкого языка в рабочей среде и получите цифровой сертификат.',
      fa: 'میزان تسلط خود بر اصطلاحات تجاری و اداری زبان ترکی استانبولی را بسنجید و گواهی دیجیتال رایگان دریافت کنید.',
      ur: 'ترکی میں کام کے ماحول کے لیے اپنی زبان کی مہارت اور professionnelle اصطلاحات کے استعمال کا ٹیسٹ دیں اور سرٹیفکیٹ حاصل کریں۔'
    }[locale];
  } else if (pageType === 'interview-prep') {
    title = data.title || {
      ar: 'محاكي المقابلات الشخصية بالذكاء الاصطناعي',
      en: 'AI Job Interview Simulator',
      tr: 'Yapay Zeka Mülakat Simülatörü',
      ru: 'ИИ-Симулятор собеседований',
      fa: 'شبیه‌ساز مصاحبه کاری با هوش مصنوعی',
      ur: 'اے آئی جاب انٹرویو سمیلیٹر'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'اختر تخصصك ودع المساعد الذكي يطرح عليك أسئلة مقابلة العمل الحقيقية لتقييم إجاباتك وتقديم تقرير أداء متكامل.',
      en: 'Simulate live professional interviews based on job title, answer real questions, and get comprehensive performance feedback.',
      tr: 'Meslek başlığına göre canlı profesyonel mülakat simülasyonu yapın, gerçek soruları yanıtlayın ve performans geri bildirimi alın.',
      ru: 'Пройдите виртуальное собеседование на основе желаемой должности, ответьте на вопросы и получите подробный отчет.',
      fa: 'با انتخاب عنوان شغلی خود، مصاحبه‌های استخدامی واقعی را شبیه‌سازی کنید و گزارش تحلیل عملکرد از هوش مصنوعی بگیرید.',
      ur: 'اپنی مطلوبہ فیلڈ کے مطابق مصنوعی ذہانت کے ساتھ لائیو انٹرویو کی مشق کریں اور اپنی کارکردگی کی تفصیلی رپورٹ حاصل کریں۔'
    }[locale];
  } else if (pageType === 'ats-scanner') {
    title = data.title || {
      ar: '🤖 فاحص السيرة الذاتية بالذكاء الاصطناعي (ATS Scanner)',
      en: '🤖 AI CV ATS Scanner',
      tr: '🤖 Yapay Zeka CV ATS Tarayıcı',
      ru: '🤖 ИИ-Сканер резюме для ATS',
      fa: '🤖 بررسی رزومه با سیستم ATS هوش مصنوعی',
      ur: '🤖 اے آئی سی وی اے ٹی ایس اسکینر'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'ارفع سيرتك الذاتية وافحص مدى توافقها مع نظام الفرز الآلي للوظيفة المطلوبة، واحصل على نصائح لتحسينها فوراً.',
      en: 'Upload your CV and check its compatibility with the applicant tracking systems (ATS) for your target job, with instant optimization tips.',
      tr: 'Özgeçmişinizi yükleyin ve hedef işiniz için aday takip sistemleri (ATS) ile uyumluluğunu ve optimizasyon ipuçlarını kontrol edin.',
      ru: 'Загрузите резюме и проверьте его совместимость с системами отслеживания кандидатов (ATS) для желаемой вакансии.',
      fa: 'رزومه خود را بارگذاری کنید و میزان تطابق آن با سیستم‌های فیلتر خودکار استخدام (ATS) را بررسی کرده و راهکار بهینه‌سازی بگیرید.',
      ur: 'اپنا سی وی اپ لوڈ کریں اور مطلوبہ نوکری کے لیے اے تي ایس (ATS) مطابقت چیک کریں اور اصلاحات کے مشورے لیں۔'
    }[locale];
  } else if (pageType === 'workplace-quiz') {
    title = data.title || {
      ar: 'اختبار لغة العمل التركية للمغتربين',
      en: 'Turkish Workplace Language Quiz',
      tr: 'İş Yeri Kültür ve Dil Testi',
      ru: 'Тест по турецкому языку в офисе',
      fa: 'آزمون انطباق با محیط کار ترکیه',
      ur: 'ترکی کام کے ماحول کا کوئز'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'اختبر معرفتك بأهم العبارات والمصطلحات التركية المستخدمة يومياً في بيئة العمل بإسطنبول لزيادة فرص اندماجك وتجنب سوء الفهم.',
      en: 'Test your knowledge of essential Turkish phrases used daily in Istanbul office environments to boost integration and career success.',
      tr: 'İstanbul iş hayatında entegrasyonu ve kariyer başarısını artırmak için günlük olarak kullanılan temel Türkçe kalıpları test edin.',
      ru: 'Проверьте свои знания основных турецких фраз, ежедневно используемых в офисах Стамбула для лучшей адаптации.',
      fa: 'دانش خود را درباره عبارات و اصطلاحات رایج اداری و کاری زبان ترکی استانبولی محک بزنید تا راحت‌تر با همکاران ارتباط برقرار کنید.',
      ur: 'استنبول کے دفاتری ماحول میں روزمرہ استعمال ہونے والی ترکی زبان کے اہم جملوں کا ٹیسٹ لیں تاکہ کام کاج میں آسانی ہو۔'
    }[locale];
  } else if (pageType === 'salary-calculator-2026') {
    title = data.title || {
      ar: 'حاسبة صافي الأجور وضرائب SGK التفاعلية 2026 💵🇹🇷',
      en: 'Live Net-to-Gross Salary & SGK Tax Calculator 2026 💵🇹🇷',
      tr: 'Nettən Brüte Maaş ve SGK Kesintileri Hesaplama 2026 💵🇹🇷',
      ru: 'Калькулятор зарплаты от нетто к брутто и налогов SGK 2026 💵🇹🇷',
      fa: 'محاسبه‌گر حقوق خالص به ناخالص و مالیات SGK ترکیه 2026 💵🇹🇷',
      ur: 'نیٹ ٹو گراس سیلری اور SGK ٹیکس کیلکولیٹر 2026 💵🇹🇷'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'حاسبة رسمية محدثة لعام 2026 لحساب الراتب الصافي، الإجمالي، اقتطاعات الضمان الاجتماعي (SGK)، إعفاءات الحد الأدنى للأجور، وتكلفة رب العمل الإجمالية في إسطنبول.',
      en: 'Official updated 2026 Turkish payroll calculator for Net vs Gross salary, SGK social security deductions, income tax exemptions, and total employer cost in Istanbul.',
      tr: '2026 yılı güncel asgari ücret (Net 28.075 TL / Brüt 33.030 TL), SGK prim kesintileri, vergi muafiyeti ve işverene toplam maliyet hesaplama aracı.',
      ru: 'Калькулятор зарплаты в Турции на 2026 год: расчет чистой зарплаты, отчислений в социальное страхование (SGK) и полной стоимости для работодателя.',
      fa: 'ابزار رسمی محاسبه حقوق سال 2026 ترکیه (حقوق خالص، ناخالص، بیمه تامین اجتماعی SGK و هزینه کل برای کارفرما در استانبول).',
      ur: 'ترکی 2026 پے رول کیلکولیٹر: نیٹ سیلری، گراس سیلری، SGK انشورنس اور ایمپلائر کی کل لاگت کا تخمینہ۔'
    }[locale];
  } else if (pageType === 'investor-calculator') {
    title = data.title || {
      ar: 'حاسبة تكاليف تأسيس الشركات وتوظيف الأجانب للمستثمرين 2026 🏢🇹🇷',
      en: 'Investor Company Setup & Foreign Hiring Estimator 2026 🏢🇹🇷',
      tr: 'Yatırımcı Şirket Kuruluşu ve Yabancı İstihdam Maliyet Hesaplama 2026 🏢🇹🇷',
      ru: 'Калькулятор открытия компании и найма иностранцев 2026 🏢🇹🇷',
      fa: 'محاسبه‌گر هزینه‌های ثبت شرکت و استخدام اتباع خارجی 2026 🏢🇹🇷',
      ur: 'ترکی میں کمپنی رجسٹریشن اور غیر ملکی ملازمین کے اخراجات 2026 🏢🇹🇷'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'أداة حاسبة استثمارية متكاملة لحساب رسوم تأسيس شركة (Ltd / A.Ş) في تركيا، استثناءات إذن العمل الشريك، وتكاليف توظيف العمالة الأجنبية والضرائب لعام 2026.',
      en: 'Comprehensive 2026 investment calculator for company incorporation in Turkey (Ltd / A.Ş), work permit partner exemption rules, and foreign employee SGK tax budgets.',
      tr: 'Türkiye\'de şirket kuruluşu (Ltd / A.Ş), ortak çalışma izni muafiyet kuralları ve yabancı personel SGK maliyet hesaplama aracı.',
      ru: 'Расчет стоимости регистрации компании в Турции (Ltd / A.Ş), освобождения партнера от разрешения на работу и налогов SGK на 2026 год.',
      fa: 'ابزار جامع سرمایه‌گذاری برای محاسبه هزینه‌های ثبت شرکت (Ltd / A.Ş) در ترکیه، معافیت‌های اجازه کار شریک و مالیات SGK.',
      ur: 'ترکی میں کمپنی بنانے (Ltd / A.Ş)، پارٹنر ورک پرمٹ کے قواعد اور غیر ملکی ملازمین کے SGK ٹیکس کا تجزیہ کریں۔'
    }[locale];
  } else if (pageType === 'work-permit-eligibility') {
    title = data.title || {
      ar: 'حاسبة واختبار أهلية إذن العمل في تركيا 2026 🇹🇷',
      en: 'Interactive Work Permit Eligibility Wizard 2026 🇹🇷',
      tr: 'Çalışma İzni Uygunluk Değerlendirme Sihirbazı 2026 🇹🇷',
      ru: 'Интерактивный тест на разрешение на работу в Турции 2026 🇹🇷',
      fa: 'محاسبه‌گر آنلاین واجد شرایط بودن اجازه کار ترکیه 2026 🇹🇷',
      ur: 'ترکی ورک پرمٹ اہلیت کیلکولیٹر 2026 🇹🇷'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'أداة تفاعلية حاسمة لتحليل أهليتك الحصول على إذن العمل أو الإعفاء، وحساب الرسوم والحد الأدنى للأجور بدقة خلال 4 خطوات بسيطة.',
      en: 'Analyze your legal eligibility for a Turkish Work Permit or e-Devlet Exemption, calculate 2026 official fees, and view required documents in 4 steps.',
      tr: 'Türkiye çalışma izni veya e-Devlet muafiyet uygunluğunuzu analiz edin, 2026 harç ve asgari ücret katlarını 4 adımda hesaplayın.',
      ru: 'Проверьте право на получение разрешения на работу или освобождения e-Devlet, рассчитайте сборы 2026 года за 4 простых шага.',
      fa: 'تحلیل واجد شرایط بودن برای دریافت اجازه کار یا معافیت e-Devlet и محاسبه هزینه‌های رسمی 2026 در 4 مرحله.',
      ur: 'ترکی میں ورک پرمٹ یا 3 سالہ استثنیٰ کی اہلیت کا تجزیہ کریں اور 2026 کی سرکاری فیسیں معلوم کریں۔'
    }[locale];
  } else if (pageType === 'currency-prices') {
    title = data.title || {
      ar: 'أسعار العملات في تركيا اليوم | سعر الليرة التركية مقابل الدولار واليورو',
      en: 'TRY Exchange Rates Today | Dollar & Euro to Turkish Lira',
      tr: 'Bugün Canlı Döviz Kurları | Dolar ve Euro Kaç TL?',
      ru: 'Курсы валют в Турции сегодня | Доллар и Евро к Лире',
      fa: 'نرخ ارز امروز در ترکیه | قیمت دلار و یورو به لیر ترکیه',
      ur: 'ترکی میں کرنسی کی قیمتیں | ڈالر اور یورو کا لیر ریٹ'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'تحديث مباشر لأسعار العملات الأجنبية مقابل الليرة التركية اليوم. محول العملات للدولار، اليورو، والجنيه الاسترليني.',
      en: 'Live currency exchange rates in Turkey today. Convert US Dollar (USD), Euro (EUR), British Pound (GBP) to Turkish Lira (TRY).',
      tr: 'Bugün Türkiye\'deki canlı döviz kurları. ABD Doları, Euro, İngiliz Sterlini ve diğer yabancı para birimlerini Türk Lirası\'na (TL) çevirin.',
      ru: 'Актуальные курсы валют к турецкой лире на сегодня. Конвертер валют: доллар, евро, фунт стерлингов к лире.',
      fa: 'قیمت لحظه‌ای ارزهای خارجی به لیر ترکیه امروز. تبدیل دلار، یورو، پوند و سایر ارزها به لیر ترکیه (TRY).',
      ur: 'ترکی میں آج لیر کی قیمت اور غير ملكي کرنسیوں کے ایکسچینج ریٹس دیکھیں۔ ڈالر، یورو اور پاؤنڈ کا لیر کنورٹر।'
    }[locale];
  } else if (pageType === 'gold-prices') {
    title = data.title || {
      ar: 'أسعار الذهب في تركيا اليوم | عيار 24 و21 والليرة الذهب',
      en: 'Gold Prices in Turkey Today | 24K, 22K, 21K, 18K Karat Rates',
      tr: 'Canlı Altın Fiyatları Bugün | Çeyrek, Gram ve Cumhuriyet Altını',
      ru: 'Цены на золото в Турции сегодня | 24, 21 карат и золотая лира',
      fa: 'قیمت طلا امروز در ترکیه | نرخ گرم طلای ۲۴ و ۲۱ و لیره طلا',
      ur: 'ترکی میں سونے کی قیمتیں | ۲۴، ۲۲، ۲۱ اور ۱۸ قیراط سونے کا ریٹ'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'أسعار الذهب مباشر في تركيا اليوم بالليرة التركية. تصفح أسعار عيار 24، 22، 21، 18، وأسعار الليرة الذهب التركية مع حاسبة غرامات الذهب.',
      en: 'Live gold prices in Turkey today. Check gold karat rates for 24k, 22k, 21k, 18k, and Gold Lira in Turkish Lira (TRY) with converter.',
      tr: 'Bugün Türkiye\'deki canlı altın fiyatları. Gram altın, çeyrek altın, yarım altın ve cumhuriyet altını fiyatlarını anlık takip edin.',
      ru: 'Актуальные цены на золото в Турции сегодня в лирах. Цены на золото 24, 22, 21, 18 карат и турецкую золотую лиру.',
      fa: 'قیمت زنده طلا امروز در ترکیه به لیر. بررسی قیمت طلای ۱۸ عیار، ۲۱ عیار، ۲۴ عیار و لیره طلا به همراه ماشین حساب طلا.',
      ur: 'ترکی میں آج سونے کے تازہ ترین ریٹس۔ ۲۴ قیراط، ۲۲ قیراط، ۲۱ قیراط، اور گولڈ لیر کی قیمتیں لیر میں دیکھیں۔'
    }[locale];
  } else if (pageType === 'insights') {
    title = data.title || {
      ar: 'إحصائيات وتحليلات سوق العمل في إسطنبول | اتجاهات التوظيف 2026',
      en: 'Istanbul Job Market Insights & Analytics | Recruitment Trends 2026',
      tr: 'İstanbul İş Gücü Piyasası Analizi | İstihdam Verileri ve Trendler',
      ru: 'Аналитика рынка труда Стамбула | Тренды трудоустройства 2026',
      fa: 'آمار و تحلیل بازار کار استانبول | روند استخدام و مشاغل ۲۰۲۶',
      ur: 'استنبول جاب مارکیٹ کے اعداد و شمار | نوکریوں کے رجحانات ۲۰۲۶'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'نظرة شاملة على فرص العمل والرواتب والقطاعات الأكثر طلباً في إسطنبول. بيانات واقعية مبنية على الوظائف المنشورة في منصتنا.',
      en: 'A comprehensive view of job opportunities, salaries, and top hiring sectors in Istanbul based on actual job board postings data.',
      tr: 'İstanbul\'daki iş fırsatları, ortalama maaşlar ve en çok aranan sektörlere ilişkin güncel analitik veriler ve istihdam eğilimleri.',
      ru: 'Подробный обзор вакансий, средних зарплат и наиболее востребованных секторов в Стамбуле на основе реальных объявлений о работе.',
      fa: 'تحلیل جامع فرصت‌های شغلی، میانگین حقوق و تخصص‌های پرتقاضا در استانبول بر اساس داده‌های واقعی آگهی‌های شغلی پلتفرم.',
      ur: 'استنبول میں روزگار کے مواقع، تنخواہوں کی اوسط شرح اور سب سے زیادہ مقبول شعبوں کا تفصیلی تجزياتی جائزہ۔'
    }[locale];
  } else if (pageType === 'about') {
    title = data.title || {
      ar: 'من نحن | منصة فرص عمل في إسطنبول',
      en: 'About Us | Jobs in Istanbul Portal',
      tr: 'Hakkımızda | İstanbul İş İlanları Portalı',
      ru: 'О нас | Портал вакансий Работа в Стамбуле',
      fa: 'درباره ما | پلتفرم کاریابی و استخدام در استانبول',
      ur: 'ہمارے بارے میں | استنبول جابز پورٹل'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'نعمل على سد الفجوة بين الباحثين عن عمل المتميزين وأصحاب الأعمال الرائدين في إسطنبول. هدفنا هو تسهيل التوظيف عبر حلول التوظيف والذكاء الاصطناعي الذكية.',
      en: 'We strive to bridge the gap between outstanding job seekers and leading employers in Istanbul. Learn about our mission and smart recruitment technologies.',
      tr: 'İstanbul\'daki nitelikli iş arayanlar ile öncü işverenleri buluşturuyoruz. Misyonumuz ve akıllı işe alım teknolojilerimiz hakkında bilgi edinin.',
      ru: 'Мы помогаем соискателям находить отличную работу, а компаниям — квалифицированный персонал в Стамбуле. Узнайте о нашей миссии и технологиях.',
      fa: 'ما ارتباط کارجویان متخصص و کارفرمایان برجسته در استانبول را تسهیل می‌کنیم. درباره اهداف و ابزارهای هوش مصنوعی استخدام ما بیشتر بدانید.',
      ur: 'ہم استنبول میں ملازمین اور بہترین کمپنیوں کو ایک جگہ لانے کے لیے کوشاں ہیں۔ ہمارے مشن اور بھرتی کے اسمارٹ ٹولز کے بارے میں جانیں۔'
    }[locale];
  } else if (pageType === 'contact') {
    title = data.title || {
      ar: 'اتصل بنا | الدعم الفني والمساعدة في إسطنبول للوظائف',
      en: 'Contact Us | Customer Support & Feedback | Istanbul Jobs',
      tr: 'İletişim | Müşteri Desteği ve Yardım | İstanbul İş İlanları',
      ru: 'Контакты | Служба поддержки и обратная связь | Работа в Стамбуле',
      fa: 'تماس با ما | پشتیبانی و ارتباط با مدیریت کاریابی استانبول',
      ur: 'ہم سے رابطہ کریں | سپورٹ اور ہیلپ دیسک | استنبول میں ملازمتیں'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'نحن هنا للإجابة على استفساراتكم ومساعدتكم. تواصلوا معنا عبر نموذج المراسلة المباشر، البريد الإلكتروني، أو الدعم عبر الواتساب.',
      en: 'We are here to answer your questions and help you. Get in touch with us through email, form, or our official WhatsApp support.',
      tr: 'Sorularınızı yanıtlamak ve destek sunmak için buradayız. Bize e-posta, iletişim formu veya WhatsApp üzerinden ulaşabilirsiniz.',
      ru: 'Мы здесь, чтобы помочь вам и ответить на ваши вопросы. Свяжитесь с нами по электронной почте, форме или в WhatsApp.',
      fa: 'ما آماده پاسخگویی به سوالات شما هستیم. از طریق ایمیل، فرم تماس یا پشتیبانی واتس‌اپ با ما در ارتباط باشید.',
      ur: 'ہم آپ کے سوالات کا جواب دینے کے لیے حاضر ہیں۔ ای میل، فارم یا واٹس ایپ سپورٹ کے ذریعے ہم سے رابطہ کریں۔'
    }[locale];
  } else if (pageType === 'privacy') {
    title = data.title || {
      ar: 'سياسة الخصوصية | حماية بيانات المستخدمين في إسطنبول للوظائف',
      en: 'Privacy Policy | User Data Security & GDPR/KVKK Compliance',
      tr: 'Gizlilik Politikası | Veri Güvenliği ve KVKK/GDPR Uyumluluğu',
      ru: 'Политика конфиденциальности | Защита персональных данных',
      fa: 'حفظ حریم خصوصی | امنیت داده‌ها و انطباق با قوانین KVKK/GDPR',
      ur: 'رازداری کی پالیسی | ڈیٹا سیکیورٹی اور KVKK/GDPR قوانین'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيف نقوم بجمع معلوماتك وحمايتها وفقاً لقوانين KVKK وGDPR.',
      en: 'We are committed to protecting your privacy and personal data. Learn how we collect, use, and safeguard your details under KVKK and GDPR.',
      tr: 'Gizliliğinizi ve verilerinizi korumayı taahhüt ediyoruz. Verilerinizi KVKK ve GDPR kapsamında nasıl işlediğimizi okuyun.',
      ru: 'Мы серьезно относимся к безопасности ваших данных. Ознакомьтесь с политикой конфиденциальности в соответствии с KVKK и GDPR.',
      fa: 'ما متعهد به محافظت از اطلاعات شخصی شما هستیم. نحوه جمع‌آوری و نگهداری اطلاعات تحت قوانین KVKK و GDPR را مطالعه کنید.',
      ur: 'ہم آپ کے ذاتی ڈیٹا کی حفاظت کے لیے پرعزم ہیں۔ جانیں کہ ہم آپ کی معلومات کو کیسے محفوظ رکھتے ہیں۔'
    }[locale];
  } else if (pageType === 'terms') {
    title = data.title || {
      ar: 'الشروط والأحكام | اتفاقية استخدام منصة إسطنبول للوظائف',
      en: 'Terms & Conditions | Legal Agreement & Job Board Policies',
      tr: 'Kullanım Şartları | Yasal Sözleşme ve İlan Yayınlama Kuralları',
      ru: 'Условия использования | Пользовательское соглашение',
      fa: 'شرایط و ضوابط | توافق‌نامه قانونی و قوانین ثبت آگهی استخدام',
      ur: 'شرایط و ضوابط | استعمال کی شرائط اور قانونی معاہدہ'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'شروط الخدمة والاتفاقية القانونية لاستخدام منصتنا، بما يشمل سياسات نشر إعلانات الوظائف وإخلاء المسؤولية للمعلنين والباحثين.',
      en: 'Read our Terms of Service and legal agreements, including job posting policies, user responsibilities, and disclaimers.',
      tr: 'Kullanım Koşullarımızı, üye sorumluluklarını, iş ilanı politikalarını ve sorumluluk reddi beyanımızı inceleyin.',
      ru: 'Прочтите правила использования нашего сервиса, условия публикации вакансий и положения об ответственности.',
      fa: 'شرایط استفاده از خدمات ما و توافق‌نامه‌های قانونی برای انتشار آگهی‌های شغلی و مسئولیت‌های کارفرمایان و کارجویان.',
      ur: 'ہمارے پلیٹ فارم کو استعمال کرنے کے اصول، جاب پوسٹنگ پالیسیاں اور قانونی شرائط و ضوابط پڑھیں۔'
    }[locale];
  } else if (pageType === 'install') {
    title = data.title || {
      ar: 'تثبيت تطبيق فرص عمل في إسطنبول | دليل PWA السريع للهاتف',
      en: 'Install Jobs in Istanbul Mobile App | Quick PWA Guide',
      tr: 'İstanbul İş İlanları Mobil Uygulamasını Yükleyin | Kolay PWA',
      ru: 'Установить мобильное приложение Работа в Стамбуле | PWA',
      fa: 'نصب اپلیکیشن موبایل کاریابی استانبول | راهنمای سریع PWA',
      ur: 'استنبول جابز موبائل ایپ انسٹال کریں | پی ڈبلیو اے گائیڈ'
    }[locale];
    desc = data.seoDescription || data.description || {
      ar: 'دليل تثبيت تطبيق فرص عمل في إسطنبول (PWA) على الأندرويد والآيفون لتصفح الوظائف بلمسة واحدة مباشرة من شاشتك الرئيسية.',
      en: 'Easy guide to install Jobs in Istanbul app (PWA) on Android & iOS to browse job vacancies instantly from your home screen.',
      tr: 'İş ilanlarını ana ekranınızdan tek dokunuşla incelemek için İstanbul İş İlanları PWA uygulamasını Android ve iOS\'a yükleme rehberi.',
      ru: 'Инструкция по установке приложения PWA на Android и iOS для быстрого доступа к вакансиям прямо с главного экрана.',
      fa: 'راهنمای ساده نصب اپلیکیشن کاریابی استانبول (PWA) روی گوشی‌های اندروید و آیفون برای دسترسی سریع بدون نیاز به مرورگر.',
      ur: 'اینڈرائیڈ اور آئی او ایس پر استنبول جابز ایپ انسٹال کرنے کی گائیڈ تاکہ ہوم اسکرین سے نوکریاں تلاش کی جا سکیں۔'
    }[locale];
  }

  // Calculate canonical & alternate URLs based on pageType
  let canonicalUrl = data.canonical || `${siteUrl}/${locale}`;
  if (!data.canonical) {
    if (pageType === 'job' && data.slug) {
      canonicalUrl = `${siteUrl}/${locale}/jobs/${data.slug}`;
    } else if (pageType === 'blog') {
      canonicalUrl = `${siteUrl}/${locale}/blog`;
    } else if (pageType === 'blog_post' && data.slug) {
      canonicalUrl = `${siteUrl}/${locale}/blog/${data.slug}`;
    } else if (data.slug) {
      canonicalUrl = `${siteUrl}/${locale}/${data.slug}`;
    } else if (pageType === 'home' && data.category) {
      canonicalUrl = `${siteUrl}/${locale}?category=${data.category}`;
    } else if (pageType !== 'home') {
      canonicalUrl = `${siteUrl}/${locale}/${pageType}`;
    }
  }

  // Helper to build alternate URLs
  const getLocaleUrl = (loc: string) => {
    let url = `${siteUrl}/${loc}`;
    if (pageType === 'job' && data.slug) {
      url = `${siteUrl}/${loc}/jobs/${data.slug}`;
    } else if (pageType === 'blog') {
      url = `${siteUrl}/${loc}/blog`;
    } else if (pageType === 'blog_post' && data.slug) {
      url = `${siteUrl}/${loc}/blog/${data.slug}`;
    } else if (data.slug) {
      url = `${siteUrl}/${loc}/${data.slug}`;
    } else if (pageType === 'home' && data.category) {
      url = `${siteUrl}/${loc}?category=${data.category}`;
    } else if (pageType !== 'home') {
      url = `${siteUrl}/${loc}/${pageType}`;
    }
    return url;
  };

  const arUrl = getLocaleUrl('ar');
  const enUrl = getLocaleUrl('en');
  const trUrl = getLocaleUrl('tr');
  const ruUrl = getLocaleUrl('ru');
  const faUrl = getLocaleUrl('fa');
  const urUrl = getLocaleUrl('ur');

  let keywordsStr = locale === 'tr'
    ? 'istanbul iş ilanları, türkiye iş fırsatları, istanbulda iş bulmak, türkçe iş ilanları, ingilizce işler, kariyer blogu, çalışma izni türkiye'
    : (locale === 'ar'
      ? 'وظائف في إسطنبول, فرص عمل في تركيا, شغل في تركيا للعرب, وظائف شاغرة, توظيف, jobsintr, تركيا, مدونة التوظيف'
      : (locale === 'ru'
        ? 'работа в стамбуле, вакансии в турции, поиск работы в стамбуле, работа для русских, блог о карьере, разрешение на работу в турции'
        : (locale === 'fa'
          ? 'کار در استانبول, استخدام در ترکیه, کاریابی ترکیه, اقامت کاری ترکیه, کار برای ایرانیان در استانبول, وبلاگ کاریابی'
          : (locale === 'ur'
            ? 'استنبول میں ملازمتیں, ترکی میں روزگار, استنبول جاب پورٹل, ترکی ویزا, کیریئر بلاگ'
            : 'jobs in istanbul, working in turkey, employment, vacancies, istanbul jobs, career blog, work permit turkey'))));

  if (data.seoKeywords) {
    let list: string[] = [];
    if (Array.isArray(data.seoKeywords)) {
      list = data.seoKeywords;
    } else if (typeof data.seoKeywords === 'string') {
      try {
        // In case it was saved as a JSON string containing an array
        if (data.seoKeywords.trim().startsWith('[')) {
          const parsed = JSON.parse(data.seoKeywords);
          if (Array.isArray(parsed)) {
            list = parsed;
          }
        } else {
          list = data.seoKeywords.split(',').map(s => s.trim()).filter(Boolean);
        }
      } catch (err) {
        list = data.seoKeywords.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (list.length > 0) {
      keywordsStr = list.join(', ') + ', ' + keywordsStr;
    }
  }

  const ogLocales: Record<string, string> = {
    ar: 'ar_AR',
    en: 'en_US',
    tr: 'tr_TR',
    ru: 'ru_RU',
    fa: 'fa_IR',
    ur: 'ur_PK'
  };
  const ogLocaleStr = ogLocales[locale] || 'en_US';
  const robotsStr = data.robots || 'index, follow';

  return `
  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${keywordsStr}">
  <meta name="robots" content="${robotsStr}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  
  <!-- i18n Multilingual Links -->
  <link rel="alternate" hreflang="ar" href="${arUrl}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="tr" href="${trUrl}">
  <link rel="alternate" hreflang="ru" href="${ruUrl}">
  <link rel="alternate" hreflang="fa" href="${faUrl}">
  <link rel="alternate" hreflang="ur" href="${urUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${(pageType === 'job' || pageType === 'blog_post') ? 'article' : 'website'}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${data.image || `${siteUrl}/public/images/og-share.png`}">
  <meta property="og:locale" content="${ogLocaleStr}">
  ${(pageType === 'job' || pageType === 'blog_post') && data.publishedAt ? `<meta property="article:published_time" content="${new Date(data.publishedAt).toISOString()}">` : ''}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${data.image || `${siteUrl}/public/images/og-share.png`}">
  <meta name="twitter:site" content="@istanbuljobs">
  `;
}

function parseSalary(salaryStr: string) {
  if (!salaryStr) return null;
  // Remove commas, TL, TRY, and spaces
  const clean = salaryStr.replace(/,/g, '').trim();
  const matches = clean.match(/\d+/g);
  if (!matches) return null;

  if (matches.length >= 2) {
    const val1 = parseFloat(matches[0]);
    const val2 = parseFloat(matches[1]);
    return {
      "minValue": Math.min(val1, val2),
      "maxValue": Math.max(val1, val2)
    };
  } else if (matches.length === 1) {
    return {
      "value": parseFloat(matches[0])
    };
  }
  return null;
}

function getIstanbulPostalCode(locationStr?: string): string {
  if (!locationStr) return '34000';
  const loc = locationStr.toLowerCase();

  // District to Postal Code map (major districts)
  const districtMap: Record<string, string> = {
    'şişli': '34360', 'sisli': '34360',
    'kadıköy': '34710', 'kadikoy': '34710',
    'beşiktaş': '34330', 'besiktas': '34330',
    'fatih': '34090',
    'esenyurt': '34510',
    'üsküdar': '34660', 'uskudar': '34660',
    'pendik': '34890',
    'beyoğlu': '34421', 'beyoglu': '34421',
    'ataşehir': '34758', 'atasehir': '34758',
    'kağıthane': '34403', 'kagithane': '34403',
    'sarıyer': '34450', 'sariyer': '34450',
    'kartal': '34860',
    'maltepe': '34840',
    'ümraniye': '34764', 'umraniye': '34764',
    'başakşehir': '34480', 'basaksehir': '34480',
    'beylikdüzü': '34520', 'beylikduzu': '34520',
    'bakırköy': '34142', 'bakirkoy': '34142',
    'bağcılar': '34200', 'bagcilar': '34200',
    'bahçelievler': '34180', 'bahcelievler': '34180',
    'eyüp': '34050', 'eyup': '34050',
    'gaziosmanpaşa': '34245', 'gaziosmanpasa': '34245',
    'tuzla': '34947',
    'çekmeköy': '34782', 'cekmekoy': '34782',
    'beykoz': '34820',
    'sancaktepe': '34785',
    'sultangazi': '34265',
    'arnavutköy': '34275', 'arnavutkoy': '34275',
    'silivri': '34570',
    'çatalca': '34540', 'catalca': '34540',
    'شيشلي': '34360',
    'كاديكوي': '34710',
    'بشكتاش': '34330',
    'الفاتح': '34090',
    'اسنيورت': '34510',
    'اسكودار': '34660',
    'بينديك': '34890',
    'بيوغلو': '34421',
    'أتاشهير': '34758',
    'كاغيت هانة': '34403',
    'ساريير': '34450',
    'كارتال': '34860',
    'مالتيبي': '34840',
    'عمرانية': '34764',
    'باشاك شهير': '34480',
    'بيليك دوزو': '34520',
    'باقركوي': '34142',
    'باغجلار': '34200',
    'باهتشلي ايفلر': '34180',
    'أيوب': '34050',
    'غازي عثمان باشا': '34245',
    'توزلا': '34947',
    'تشيكميكوي': '34782',
    'بيكوز': '34820',
    'سنجاق تبي': '34785',
    'سلطان غازي': '34265',
    'أرناؤوط كوي': '34275'
  };

  for (const [district, zip] of Object.entries(districtMap)) {
    if (loc.includes(district)) {
      return zip;
    }
  }

  return '34000'; // Default Istanbul zip
}

function getStreetAddress(locationStr?: string): string {
  if (!locationStr) return 'Istanbul, Turkey';
  const loc = locationStr.toLowerCase();
  if (loc.includes('remote') || loc.includes('عن بعد')) {
    return 'Istanbul, Turkey';
  }
  return locationStr;
}

export function generateJsonLd(
  locale: 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur' | string,
  pageType: 'home' | 'job' | 'submit' | 'blog' | 'blog_post' |
    'cv-optimizer' | 'salary-calculator' | 'resume-builder' | 'cover-letter-generator' | 'work-permit-calculator' | 'turkish-test' | 'interview-prep' | 'ats-scanner' | 'workplace-quiz' |
    'salary-calculator-2026' | 'investor-calculator' | 'work-permit-eligibility' |
    'currency-prices' | 'gold-prices' | 'insights' |
    'about' | 'contact' | 'privacy' | 'terms' | 'install',
  data: MetaDataInput = {}
) {
  const siteUrl = 'https://jobs-in-istanbul.com';

  if (pageType === 'home') {
    const orgName = locale === 'tr' ? 'İstanbul İş İlanları' : (locale === 'ar' ? 'فرص عمل في إسطنبول' : (locale === 'fa' ? 'کاریابی استانبول' : (locale === 'ur' ? 'استنبول میں ملازمتیں' : 'Istanbul Jobs')));
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": orgName,
      "url": `${siteUrl}/${locale}`,
      "logo": `${siteUrl}/public/images/logo.png`,
      "sameAs": [
        "https://www.facebook.com/istanbuljobs",
        "https://twitter.com/istanbuljobs",
        "https://www.linkedin.com/company/istanbuljobs"
      ]
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": orgName,
      "url": `${siteUrl}/${locale}`,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/${locale}?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    return `
    <script type="application/ld+json">${JSON.stringify(orgSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>
    `;
  }

  if (pageType === 'blog') {
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'tr' ? 'Ana Sayfa' : (locale === 'ar' ? 'الرئيسية' : (locale === 'fa' ? 'خانه' : (locale === 'ur' ? 'ہوم' : 'Home'))),
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": locale === 'tr' ? 'Blog' : (locale === 'ar' ? 'المدونة' : (locale === 'fa' ? 'وبلاگ' : (locale === 'ur' ? 'بلاگ' : 'Blog'))),
          "item": `${siteUrl}/${locale}/blog`
        }
      ]
    };

    return `
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;
  }

  if (pageType === 'blog_post') {
    let publishedTime = Date.now();
    if (data.publishedAt) {
      const parsed = new Date(data.publishedAt).getTime();
      if (!isNaN(parsed)) {
        publishedTime = parsed;
      }
    }

    let modifiedTime = data.updatedAt ? new Date(data.updatedAt).getTime() : Date.now();
    if (isNaN(modifiedTime)) {
      modifiedTime = publishedTime;
    }

    const cleanDesc = data.description
      ? data.description.substring(0, 160).replace(/<[^>]*>/g, '')
      : (locale === 'ar' ? 'مقال مهني في إسطنبول' : 'Career article in Istanbul');

    const blogPostingSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": data.title,
      "description": cleanDesc,
      "image": data.image || `${siteUrl}/public/images/og-share.png`,
      "datePublished": new Date(publishedTime).toISOString(),
      "dateModified": new Date(modifiedTime).toISOString(),
      "author": {
        "@type": "Organization",
        "name": locale === 'tr' ? 'İstanbul İş İlanları' : (locale === 'ar' ? 'وظائف إسطنبول' : 'Istanbul Jobs'),
        "url": `${siteUrl}/${locale}`
      },
      "publisher": {
        "@type": "Organization",
        "name": locale === 'tr' ? 'İstanbul İş İlanları' : (locale === 'ar' ? 'فرص عمل في إسطنبول' : 'Istanbul Jobs'),
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/public/images/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${siteUrl}/${locale}/blog/${data.slug}`
      }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'tr' ? 'Ana Sayfa' : (locale === 'ar' ? 'الرئيسية' : 'Home'),
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": locale === 'tr' ? 'Blog' : (locale === 'ar' ? 'المدونة' : 'Blog'),
          "item": `${siteUrl}/${locale}/blog`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": data.title,
          "item": `${siteUrl}/${locale}/blog/${data.slug}`
        }
      ]
    };

    let faqHtml = '';
    if (data.faqs && data.faqs.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": data.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
      faqHtml = `\n    <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`;
    }

    return `
    <script type="application/ld+json">${JSON.stringify(blogPostingSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>${faqHtml}
    `;
  }

  if (pageType === 'job') {
    // Map jobType to standard Google Schema JobPosting values
    const typeLabel = data.jobType === 'full-time' ? 'FULL_TIME' : data.jobType === 'part-time' ? 'PART_TIME' : data.jobType === 'internship' ? 'INTERN' : 'FULL_TIME';

    let publishedTime = Date.now();
    if (data.publishedAt) {
      const parsed = new Date(data.publishedAt).getTime();
      if (!isNaN(parsed)) {
        publishedTime = parsed;
      }
    }

    // HTML-formatted description is highly recommended by Google
    let formattedDescription = data.description || '';
    if (formattedDescription && !formattedDescription.includes('<p>') && !formattedDescription.includes('<br>')) {
      formattedDescription = formattedDescription.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
    }

    const hiringOrg: Record<string, any> = {
      "@type": "Organization",
      "name": data.companyName || 'Confidential Company',
      "sameAs": data.companyWebsite || siteUrl
    };

    if (data.companyLogo) {
      let logoUrl = data.companyLogo;
      if (!logoUrl.startsWith('http')) {
        logoUrl = `${siteUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
      }
      hiringOrg.logo = logoUrl;
    }

    const jobLocationSchema: Record<string, any> = {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": getStreetAddress(data.location),
        "addressLocality": data.location || 'Istanbul',
        "addressRegion": 'Istanbul',
        "postalCode": getIstanbulPostalCode(data.location),
        "addressCountry": 'TR'
      }
    };

    const jobSchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": data.title,
      "description": formattedDescription,
      "datePosted": new Date(publishedTime).toISOString(),
      "validThrough": new Date(publishedTime + 180 * 24 * 60 * 60 * 1000).toISOString(),
      "employmentType": typeLabel,
      "hiringOrganization": hiringOrg,
      "jobLocation": jobLocationSchema
    };

    if (data.jobType === 'remote') {
      jobSchema.jobLocationType = "TELECOMMUTE";
      jobSchema.applicantLocationRequirements = {
        "@type": "Area",
        "name": "Turkey"
      };
    }

    let salaryObject = null;
    if (data.salary) {
      const parsedSalary = parseSalary(data.salary);
      if (parsedSalary) {
        let currency = "TRY";
        const upperSalary = data.salary.toUpperCase();
        if (upperSalary.includes('$') || upperSalary.includes('USD')) {
          currency = "USD";
        } else if (upperSalary.includes('€') || upperSalary.includes('EUR')) {
          currency = "EUR";
        }

        salaryObject = {
          "@type": "MonetaryAmount",
          "currency": currency,
          "value": {
            "@type": "QuantitativeValue",
            ...parsedSalary,
            "unitText": "MONTH"
          }
        };
      }
    }

    if (salaryObject) {
      jobSchema.baseSalary = salaryObject;
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'tr' ? 'Ana Sayfa' : (locale === 'ar' ? 'الرئيسية' : 'Home'),
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": locale === 'tr' ? 'İş İlanları' : (locale === 'ar' ? 'الوظائف' : 'Jobs'),
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": data.title,
          "item": `${siteUrl}/${locale}/jobs/${data.slug}`
        }
      ]
    };

    return `
    <script type="application/ld+json">${JSON.stringify(jobSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;
  }

  if ([
    'cv-optimizer', 'salary-calculator', 'resume-builder', 'cover-letter-generator',
    'work-permit-calculator', 'turkish-test', 'interview-prep', 'ats-scanner', 'workplace-quiz',
    'salary-calculator-2026', 'investor-calculator', 'work-permit-eligibility'
  ].includes(pageType)) {
    const toolNames = ({
      'cv-optimizer': { ar: 'مساعد الذكاء الاصطناعي لتحسين السيرة الذاتية', en: 'AI CV & Cover Letter Optimizer', tr: 'Yapay Zeka ile CV ve Ön Yazı Geliştirici' },
      'salary-calculator': { ar: 'حاسبة ومؤشر الرواتب في إسطنبول', en: 'Istanbul Salary Estimator', tr: 'İstanbul Maaş Hesaplama ve İndeksi' },
      'resume-builder': { ar: 'منشئ السيرة الذاتية الاحترافية التفاعلي', en: 'Professional Interactive Resume Builder', tr: 'Profesyonel İnteraktif CV Hazırlama' },
      'cover-letter-generator': { ar: 'مولد رسائل التغطية الذكي بالذكاء الاصطناعي', en: 'AI Cover Letter Generator', tr: 'Yapay Zeka Ön Yazı Oluşturucu' },
      'work-permit-calculator': { ar: 'حاسبة الأهلية لإذن العمل التركي والجنسية', en: 'Turkish Work Permit & Citizenship Calculator', tr: 'Türkiye Çalışma İzni ve Vatandaşlık Hesaplama Aracı' },
      'turkish-test': { ar: 'اختبار اللغة التركية المهنية للعمل', en: 'Business Turkish Competency Test', tr: 'Mesleki Türkçe Seviye Testi' },
      'interview-prep': { ar: 'محاكي المقابلات الشخصية بالذكاء الاصطناعي', en: 'AI Job Interview Simulator', tr: 'Yapay Zeka Mülakat Simülatörü' },
      'ats-scanner': { ar: 'فاحص السيرة الذاتية بالذكاء الاصطناعي (ATS Scanner)', en: 'AI CV ATS Scanner', tr: 'Yapay Zeka CV ATS Tarayıcı' },
      'workplace-quiz': { ar: 'اختبار لغة العمل التركية للمغتربين', en: 'Turkish Workplace Language Quiz', tr: 'İş Yeri Kültür ve Dil Testi' },
      'salary-calculator-2026': { ar: 'حاسبة صافي الأجور وضرائب SGK التفاعلية 2026', en: 'Live Net-to-Gross Salary & SGK Tax Calculator 2026', tr: 'Nettən Brüte Maaş ve SGK Kesintileri Hesaplama 2026' },
      'investor-calculator': { ar: 'حاسبة تكاليف تأسيس الشركات وتوظيف الأجانب للمستثمرين 2026', en: 'Investor Company Setup & Foreign Hiring Estimator 2026', tr: 'Yatırımcı Şirket Kuruluşu ve Yabancı İstihdam Maliyet Hesaplama 2026' },
      'work-permit-eligibility': { ar: 'حاسبة واختبار أهلية إذن العمل في تركيا 2026', en: 'Interactive Work Permit Eligibility Wizard 2026', tr: 'Çalışma İzni Uygunluk Değerlendirme Sihirbazı 2026' }
    } as Record<string, any>)[pageType] as Record<string, string>;

    const toolName = toolNames[locale] || toolNames['en'];

    const webAppSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": toolName,
      "url": `${siteUrl}/${locale}/${pageType}`,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires HTML5 compatible browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'tr' ? 'Ana Sayfa' : (locale === 'ar' ? 'الرئيسية' : 'Home'),
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": toolName,
          "item": `${siteUrl}/${locale}/${pageType}`
        }
      ]
    };

    return `
    <script type="application/ld+json">${JSON.stringify(webAppSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;
  }

  if ([
    'about', 'contact', 'privacy', 'terms', 'install', 'currency-prices', 'gold-prices', 'insights'
  ].includes(pageType)) {
    const pageNames = ({
      'about': { ar: 'من نحن', en: 'About Us', tr: 'Hakkımızda' },
      'contact': { ar: 'اتصل بنا', en: 'Contact Us', tr: 'İletişim' },
      'privacy': { ar: 'سياسة الخصوصية', en: 'Privacy Policy', tr: 'Gizlilik Politikası' },
      'terms': { ar: 'الشروط والأحكام', en: 'Terms & Conditions', tr: 'Kullanım Şartları' },
      'install': { ar: 'تثبيت التطبيق', en: 'Install App', tr: 'Uygulamayı Yükle' },
      'currency-prices': { ar: 'أسعار العملات', en: 'Currency Prices', tr: 'Döviz Kurları' },
      'gold-prices': { ar: 'أسعار الذهب', en: 'Gold Prices', tr: 'Altın Fiyatları' },
      'insights': { ar: 'إحصائيات وتحليلات السوق', en: 'Market Insights', tr: 'Piyasa Analizleri' }
    } as Record<string, any>)[pageType] as Record<string, string>;

    const pageName = pageNames[locale] || pageNames['en'];

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'tr' ? 'Ana Sayfa' : (locale === 'ar' ? 'الرئيسية' : 'Home'),
          "item": `${siteUrl}/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": pageName,
          "item": `${siteUrl}/${locale}/${pageType}`
        }
      ]
    };

    return `
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
    `;
  }

  return '';
}
