import * as fs from 'fs';
import * as path from 'path';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.quran.karim.kamel.bidon.net.murtal.tilaat.smart';
const PACKAGE_NAME = 'com.quran.karim.kamel.bidon.net.murtal.tilaat.smart';
const APP_ADS_TXT_SNIPPET = 'google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0';

function generateHtml(cfg) {
  const align = cfg.isRtl ? 'right' : 'left';
  const dir = cfg.isRtl ? 'rtl' : 'ltr';

  const featuresHtml = cfg.features.map(f => `
        <!-- Feature -->
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column;">
          <img src="/public/images/quran-app/${f.img}" alt="${f.alt.replace(/"/g, '&quot;')}" style="width: 100%; height: 260px; object-fit: cover; background: #f1f5f9;">
          <div style="padding: 20px; flex-grow: 1;">
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--primary); margin: 0 0 8px 0;">${f.title}</h3>
            <p style="font-size: 0.92rem; color: var(--text-body); line-height: 1.6; margin: 0;">${f.desc}</p>
          </div>
        </div>`).join('\n');

  const specsRowsHtml = cfg.specs.map(s => `
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 12px;"><strong>${s.key}</strong></td>
            <td style="padding: 12px; ${s.isLink ? '' : 'color: var(--text-dark);'}">${s.isLink ? `<a href="${s.href}" target="_blank" style="color: var(--primary); font-family: monospace; font-weight: 700;">${s.val}</a>` : s.val}</td>
          </tr>`).join('\n');

  const stepsListHtml = cfg.steps.map(step => `        <li>${step}</li>`).join('\n');

  const faqsCardsHtml = cfg.faqs.map(faq => `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; margin-bottom: 14px;">
          <h4 style="margin: 0 0 8px 0; color: var(--text-dark); font-size: 1.05rem; font-weight: 700;">❓ ${faq.question}</h4>
          <p style="margin: 0; font-size: 0.95rem; color: var(--text-body); line-height: 1.6;">${faq.answer}</p>
        </div>`).join('\n');

  return `
    <div class="article-rich-text" dir="${dir}" style="text-align: ${align};">
      <!-- App Header Showcase -->
      <div style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%); border-radius: 20px; padding: 32px 24px; color: #ffffff; margin-bottom: 36px; box-shadow: 0 12px 30px rgba(4, 120, 87, 0.25); text-align: center; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -40px; right: -40px; width: 150px; height: 150px; background: rgba(255,255,255,0.08); border-radius: 50%; pointer-events: none;"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%; pointer-events: none;"></div>
        
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; margin-bottom: 20px;">
          <img src="/public/images/quran-app/00_App_Icon_3D_Logo.jpg" alt="${cfg.appName.replace(/"/g, '&quot;')}" style="width: 100px; height: 100px; border-radius: 22px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); border: 3px solid rgba(255,255,255,0.3); object-fit: cover;">
          <div>
            <span style="background: rgba(255, 255, 255, 0.2); padding: 4px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.5px; display: inline-block; margin-bottom: 8px;">✨ ${cfg.appBadgeTop}</span>
            <h2 style="color: #ffffff; font-size: 1.75rem; font-weight: 900; margin: 0 0 6px 0; line-height: 1.3;">${cfg.appHeaderTitle}</h2>
            <p style="color: rgba(255, 255, 255, 0.9); font-size: 0.95rem; margin: 0; max-width: 620px; line-height: 1.6;">${cfg.appHeaderDesc}</p>
          </div>
        </div>

        <!-- Badges & Ratings -->
        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; font-size: 0.88rem;">
          <span style="background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 12px; display: flex; align-items: center; gap: 6px;">
            <span style="color: #fbbf24;">★★★★★</span> <strong>${cfg.badges.rating}</strong>
          </span>
          <span style="background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 12px;">
            📱 <strong>${cfg.badges.android}</strong>
          </span>
          <span style="background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 12px;">
            ⚡ <strong>${cfg.badges.offline}</strong>
          </span>
          <span style="background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 12px;">
            🆓 <strong>${cfg.badges.free}</strong>
          </span>
        </div>

        <!-- Download Action -->
        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
          <a href="\${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="background: #ffffff; color: #064e3b; padding: 14px 32px; border-radius: 14px; font-weight: 800; font-size: 1.05rem; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 6px 18px rgba(0,0,0,0.2); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <svg style="width: 22px; height: 22px; fill: currentColor;" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186c-.368-.387-.61-.926-.61-1.547V3.361c0-.621.242-1.16.609-1.547zm11.238 11.238l2.583-2.583-11.83-6.83 9.247 9.413zm0 1.896l-9.247 9.413 11.83-6.83-2.583-2.583zm1.053-1.053l3.708 2.14c.833.481 1.392-.078 1.392-.078l-4.047-4.047-1.053 1.985z"/></svg>
            ${cfg.downloadBtnText}
          </a>
        </div>
      </div>

      <!-- Main Overview Banner Image -->
      <div style="margin-bottom: 32px; text-align: center;">
        <img src="/public/images/quran-app/quran-banner.png" alt="${cfg.bannerAlt.replace(/"/g, '&quot;')}" style="width: 100%; max-height: 480px; object-fit: cover; border-radius: 18px; box-shadow: var(--shadow-md);">
        <p style="font-size: 0.88rem; color: var(--text-muted); text-align: center; margin-top: 10px;">${cfg.bannerCaption}</p>
      </div>

      <p style="font-size: 1.15rem; line-height: 1.9; color: var(--text-dark);">${cfg.introParagraph}</p>

      <h2>${cfg.whyChooseHeading}</h2>
      <p>${cfg.whyChooseDesc}</p>

      <!-- Grid of Features with Real App Screenshots -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 36px 0;">
${featuresHtml}
      </div>

      <!-- Mid-Article CTA -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%); border: 2px dashed #10b981; border-radius: 16px; padding: 28px; text-align: center; margin: 40px 0;">
        <h3 style="font-size: 1.4rem; font-weight: 800; color: #064e3b; margin: 0 0 10px 0;">📥 ${cfg.midCtaHeading}</h3>
        <p style="font-size: 0.98rem; color: var(--text-body); max-width: 600px; margin: 0 auto 20px auto; line-height: 1.6;">${cfg.midCtaDesc}</p>
        <a href="\${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="background: #047857; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 1rem; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3);">
          ⭐ ${cfg.midCtaBtnText}
        </a>
      </div>

      <h2>${cfg.specsHeading}</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 0.95rem;">
        <thead>
          <tr style="background: var(--bg-subtle); text-align: ${align};">
            <th style="padding: 12px; border-bottom: 2px solid var(--border);">${cfg.isRtl ? 'المواصفة' : (cfg.locale === 'tr' ? 'Özellik' : (cfg.locale === 'de' ? 'Eigenschaft' : (cfg.locale === 'fr' ? 'Spécification' : (cfg.locale === 'ru' ? 'Характеристика' : (cfg.locale === 'id' ? 'Spesifikasi' : (cfg.locale === 'bn' ? 'বৈশিষ্ট্য' : 'Specification'))))))}</th>
            <th style="padding: 12px; border-bottom: 2px solid var(--border);">${cfg.isRtl ? 'التفاصيل' : (cfg.locale === 'tr' ? 'Detay' : (cfg.locale === 'de' ? 'Details' : (cfg.locale === 'fr' ? 'Détails' : (cfg.locale === 'ru' ? 'Описание' : (cfg.locale === 'id' ? 'Detail' : (cfg.locale === 'bn' ? 'বিবরণ' : 'Details'))))))}</th>
          </tr>
        </thead>
        <tbody>
${specsRowsHtml}
        </tbody>
      </table>

      <h2>${cfg.stepsHeading}</h2>
      <ol style="line-height: 1.9; font-size: 1.05rem;">
${stepsListHtml}
      </ol>

      <h2>${cfg.faqHeading}</h2>
      <div style="margin-top: 20px;">
${faqsCardsHtml}
      </div>

      <!-- Final Sticky CTA Box -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; border-radius: 18px; padding: 30px; text-align: center; margin-top: 40px; box-shadow: var(--shadow-lg);">
        <h3 style="color: #ffffff; font-size: 1.5rem; font-weight: 900; margin: 0 0 12px 0;">${cfg.finalCtaHeading}</h3>
        <p style="color: #94a3b8; font-size: 0.98rem; max-width: 550px; margin: 0 auto 24px auto; line-height: 1.6;">${cfg.finalCtaDesc}</p>
        <a href="\${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="background: #10b981; color: #ffffff; padding: 14px 34px; border-radius: 12px; font-weight: 800; font-size: 1.05rem; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
          📲 ${cfg.finalCtaBtnText}
        </a>
      </div>
    </div>
  `;
}

// 1. ARABIC
const arConfig = {
  locale: 'ar',
  slug: 'quran-karim-app-offline-features-download',
  title: 'تحميل تطبيق ضياء القرآن الكريم كامل بدون نت: المصحف الشريف، مواقيت الصلاة، الأذكار، وتصحيح التلاوة',
  summary: 'دليلك الشامل ومراجعة مميزات تطبيق ضياء القرآن الكريم الشامل للأندرويد بدون نت. يضم المصحف الشريف بالرسم العثماني، أصوات كبار القراء، مواقيت الصلاة والأذان، اتجاه القبلة 3D، وحصن المسلم.',
  publishedAt: '2026-09-08',
  canonical: 'https://jobs-in-istanbul.com/ar/blog/quran-karim-app-offline-features-download',
  isRtl: true,
  appName: 'ضياء القرآن الكريم بدون إنترنت',
  appBadgeTop: '✨ التطبيق الإسلامي الشامل المعتمد لعام 2026',
  appHeaderTitle: 'تطبيق ضياء القرآن الكريم كامل بدون نت — رفيقك الإيماني اليومي',
  appHeaderDesc: 'المصحف الشريف بالرسم العثماني، مواقيت الصلاة، أذكار حصن المسلم، اتجاه القبلة 3D، وتصحيح التلاوة بالذكاء الاصطناعي',
  badges: {
    rating: '4.9 / 5.0',
    android: 'Android 6.0+',
    offline: 'يعمل 100% بدون إنترنت',
    free: 'مجاني بالكامل'
  },
  downloadBtnText: 'تحميل تطبيق ضياء القرآن من Google Play مجاناً',
  bannerAlt: 'تطبيق ضياء القرآن الكريم كامل بدون نت بصوت كبار القراء مع مواقيت الصلاة وحصن المسلم',
  bannerCaption: 'تطبيق ضياء القرآن الكريم: التطبيق الإسلامي الأقوى والأشمل على أندرويد لعام 2026: تلاوة، أذكار، مواقيت صلاة، وقبلة دقيقة',
  introParagraph: 'في عالمنا اليوم المتسارع، يحتاج كل مسلم ومسلمة إلى تطبيق إسلامي متكامل يجمع بين عظمة كتاب الله ودقة العبادات وسهولة الوصول دون الاعتماد على توفر شبكة الإنترنت. يأتي تطبيق <strong>ضياء القرآن الكريم بدون إنترنت (Diya Al-Quran Kareem Offline)</strong> ليمثل نقلة نوعية وتجربة روحانية متطورة وفريدة على أجهزة أندرويد، حيث تم تصميمه بأحدث المعايير البرمجية ليوفر لك المصحف الشريف بالرسم العثماني المطابق لمصحف المدينة المنورة، وأصوات كبار القراء، ومواقيت الصلاة، والأذكار اليومية، وبوصلة القبلة الذكية في تطبيق واحد سلس ومجاني.',
  whyChooseHeading: 'لماذا يُعد تطبيق ضياء القرآن الكريم الخيار الأول للملايين؟',
  whyChooseDesc: 'يتميز تطبيق ضياء القرآن الكريم بجمعه بين التصميم العصري الأنيق وسرعة الأداء الفائقة، فضلاً عن خلوه من أي تعقيدات أو اشتراكات مدفوعة. إليك أبرز ما يجعل هذا التطبيق ضرورياً في هاتفك الذكي:',
  features: [
    {
      title: '📖 المصحف الشريف بالرسم العثماني',
      desc: 'صفحات القرآن الكريم بخط واضح ومريح للعين مطابق لمصحف المدينة المنورة، مع إمكانية تكبير الخط، والوضع الليلي المريح للقراءة، وحفظ العلامات المرجعية تلقائياً.',
      img: '02_Quran_Mushaf_Reading.jpg',
      alt: 'قراءة المصحف الشريف في تطبيق ضياء القرآن الكريم'
    },
    {
      title: '🕌 مواقيت الصلاة وتنبيهات الأذان',
      desc: 'حساب دقيق لمواقيت الصلاة في إسطنبول وجميع مدن تركيا والعالم وفقاً لطرق الحساب المعتمدة ورئاسة الشؤون الدينية، مع تنبيهات صوتية للأذان وأدعية ما بعد الصلاة.',
      img: '03_Prayer_Times_Schedule.jpg',
      alt: 'مواقيت الصلاة والأذان في تطبيق ضياء القرآن'
    },
    {
      title: '🧭 بوصلة القبلة ثلاثية الأبعاد 3D',
      desc: 'تحديد مباشر وفوري لاتجاه الكعبة المشرفة بدقة متناهية باستخدام مستشعرات البوصلة والـ GPS والواقع المعزز، أينما كنت في العالم.',
      img: '04_Qibla_Compass_3D.jpg',
      alt: 'بوصلة القبلة 3D في تطبيق ضياء القرآن الكريم'
    },
    {
      title: '🎧 الاستماع بأصوات كبار القراء',
      desc: 'تلاوات خاشعة ونقية بأصوات نخبة من مشاهير القراء (المنشاوي، عبد الباسط، العفاسي، المعيقلي، الحصري، السديس) مع ميزة التشغيل في الخلفية والتكرار لتسهيل الحفظ.',
      img: '05_Recitation_Audio_Player.jpg',
      alt: 'الاستماع لتلاوات القرآن الكريم بدون نت'
    },
    {
      title: '📿 حصن المسلم والسبحة الذكية',
      desc: 'أذكار الصباح والمساء، أذكار النوم، الرقية الشرعية، وأدعية الهم والكرب، مع سبحة رقمية ذكية مع خاصية الاهتزاز وحفظ عدد التسبيحات.',
      img: '06_Hisn_Muslim_Azkar.jpg',
      alt: 'أذكار حصن المسلم والسبحة الإلكترونية في ضياء القرآن'
    },
    {
      title: '📜 موسوعة الحديث النبوي الشريف',
      desc: 'مكتبة متكاملة تضم صحيحي البخاري ومسلم، رياض الصالحين، والأربعين النووية، مصنفة ومبوبة حسب الموضوعات مع شرح معاني الأحاديث.',
      img: '07_Hadith_Encyclopedia.jpg',
      alt: 'موسوعة الحديث الشريف وصحيح البخاري ومسلم'
    },
    {
      title: '🎯 خطة الختمة ومتابعة الورد اليومي',
      desc: 'نظام ذكي يساعدك على ختم القرآن الكريم خلال المدة التي تختارها (30 يوماً، 60 يوماً...) مع تنبيهات يومية ومؤشر تقدم تفاعلي يلهمك الاستمرار.',
      img: '09_Khatma_Plan_Tracker.jpg',
      alt: 'متابعة ختمة القرآن الكريم والورد اليومي'
    },
    {
      title: '🎨 أحكام التجويد الملون وتصحيح التلاوة',
      desc: 'تمييز بصري دقيق لأحكام التجويد (المدود، الغنن، القلقلة، الإدغام) بالألوان المعتمدة لمساعدتك على ترتيل القرآن ترتيلاً صحيحاً ومتقناً كما أُنزِل.',
      img: '15_Tajweed_Rules_Colors.jpg',
      alt: 'أحكام التجويد الملون في تطبيق ضياء القرآن'
    },
    {
      title: '📍 خريطة المساجد القريبة',
      desc: 'خاصية متقدمة تدلك على أقرب المساجد وجوامع صلاة الجمعة في موقعك الحالي مع المسافة الدقيقة وإرشادات الوصول عبر خرائط الهاتف.',
      img: '12_Nearby_Mosques_Map.jpg',
      alt: 'خريطة المساجد القريبة في تطبيق ضياء القرآن الكريم'
    }
  ],
  midCtaHeading: 'حمّل تطبيق ضياء القرآن الكريم الآن وابدأ رحلتك الإيمانية',
  midCtaDesc: 'التطبيق متوفر مجاناً على متجر Google Play ومتوافق مع كافة هواتف وأجهزة الأندرويد اللوحية دون أي شروط.',
  midCtaBtnText: 'تثبيت تطبيق ضياء القرآن مباشرة عبر Google Play',
  specsHeading: 'جدول المواصفات التقنية لتطبيق ضياء القرآن الكريم',
  specs: [
    { key: 'اسم التطبيق الرسمي', val: 'ضياء القرآن الكريم بدون إنترنت (Diya Quran)' },
    { key: 'اسم الحزمة (Package Name)', val: PACKAGE_NAME },
    { key: 'نظام التشغيل المدعوم', val: 'Android 6.0 (Marshmallow) فما فوق' },
    { key: 'التصنيف في متجر التطبيقات', val: 'كتب ومراجع / نمط حياة إسلامي (Books & Reference)' },
    { key: 'دعم القراءة بدون إنترنت', val: '✅ نعم، مدعوم بنسبة 100% أوفلاين' },
    { key: 'اللغات المدعومة', val: 'العربية، الإنجليزية، التركية، الأردية، ولغات متعددة للتفاسير' },
    { key: 'سعر التطبيق', val: 'مجاني بالكامل بدون أي رسوم خفية (100% Free)' },
    { key: 'ملف التحقق الرسمي (AdMob app-ads.txt)', val: APP_ADS_TXT_SNIPPET, isLink: true, href: '/app-ads.txt' }
  ],
  stepsHeading: 'خطوات تثبيت واستخدام تطبيق ضياء القرآن الكريم:',
  steps: [
    `انقر على زر <a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 700;">تحميل تطبيق ضياء القرآن من Google Play</a>.`,
    'اضغط على زر <strong>تثبيت (Install)</strong> وانتظر انتهاء التنزيل السريع.',
    'افتح التطبيق، وامنحه إذن الموقع الجغرافي لضبط مواقيت الصلاة واتجاه القبلة الدقيق لمدينتك تلقائياً.',
    'اختر القارئ المفضل لديك وخطة الختمة اليومية، واستمتع بتجربة إيمانية متكاملة ومباركة تنير دربك.'
  ],
  faqHeading: 'الأسئلة الشائعة حول تطبيق ضياء القرآن الكريم بدون نت (FAQ):',
  faqs: [
    {
      question: 'هل تطبيق ضياء القرآن الكريم يعمل بالكامل بدون اتصال بالإنترنت؟',
      answer: 'نعم، يتيح لك التطبيق قراءة القرآن الكريم كاملاً بالرسم العثماني، وتصفح الأذكار والأحاديث ومواقيت الصلاة واتجاه القبلة دون الحاجة لأي اتصال بالإنترنت بعد تثبيته.'
    },
    {
      question: 'كيف يختلف تطبيق ضياء القرآن الكريم عن بقية التطبيقات الإسلامية؟',
      answer: 'يتميز تطبيق ضياء القرآن الكريم بخفته العالية على الهاتف، وعدم استهلاكه للبطارية، وخلوه من الإعلانات المزعجة، واحتوائه على كل ما يحتاجه المسلم في تطبيق واحد: المصحف، التفسير، الأذكار، القبلة، الأذان، وأحكام التجويد.'
    },
    {
      question: 'هل مواقيت الصلاة في التطبيق متوافقة مع الحسابات الرسمية المعتمدة؟',
      answer: 'نعم، يدعم التطبيق جميع طرق الحساب المعتمدة عالمياً ومن بينها طريقة رئاسة الشؤون الدينية في تركيا (Diyanet)، ورابطة العالم الإسلامي، والهيئة المصرية العامة للمساحة، وأم القرى، وجامعة العلوم الإسلامية بكراتشي.'
    }
  ],
  finalCtaHeading: 'انضم إلى آلاف المستخدمين اليوم مع تطبيق ضياء القرآن',
  finalCtaDesc: 'اجعل هاتفك منارة للذكر والقرآن ورفيقك في كل لحظة. حمّل تطبيق ضياء القرآن الكريم الآن مجاناً وشاركه مع عائلتك وأحبابك واكسب أجر نشر كتاب الله.',
  finalCtaBtnText: 'تحميل تطبيق ضياء القرآن الكريم على Google Play'
};

// 2. ENGLISH
const enConfig = {
  locale: 'en',
  slug: 'quran-karim-app-offline-features-download',
  title: 'Download Diya Holy Quran Complete Offline App: Recitations, Prayer Times, Azkar & 3D Qibla',
  summary: 'Complete guide and review of Diya Holy Quran Offline Android app (ضياء القرآن الكريم). Features original Uthmani script, famous reciters audio, prayer times, 3D Qibla compass, Hisn Muslim azkar, and Khatma tracker.',
  publishedAt: '2026-09-08',
  canonical: 'https://jobs-in-istanbul.com/en/blog/quran-karim-app-offline-features-download',
  isRtl: false,
  appName: 'Diya Holy Quran Offline App',
  appBadgeTop: '✨ Top Rated Islamic App for Android 2026',
  appHeaderTitle: 'Diya Holy Quran Complete Offline — Your Daily Islamic Companion',
  appHeaderDesc: 'Uthmani Mushaf, verified prayer times, Hisn Muslim daily azkar, 3D Qibla compass, and beautiful recitations',
  badges: {
    rating: '4.9 / 5.0',
    android: 'Android 6.0+',
    offline: '100% Offline Capable',
    free: '100% Free Forever'
  },
  downloadBtnText: 'Download Diya Quran on Google Play Free',
  bannerAlt: 'Diya Holy Quran Offline Android application featuring complete Quran, audio recitations, prayer times, and Qibla compass',
  bannerCaption: 'Diya Holy Quran (ضياء القرآن الكريم): The most comprehensive Islamic app on Android for 2026: Quran reading, Azkar, prayer times, and accurate Qibla',
  introParagraph: 'For Muslims worldwide seeking a reliable, beautiful, and distraction-free Islamic experience, the <strong>Diya Holy Quran Offline App (ضياء القرآن الكريم بدون إنترنت)</strong> stands out as one of the premier applications available on Google Play. It brings together the Holy Quran in original Uthmani calligraphy, verified global prayer times, soul-stirring audio recitations from renowned Qaris, Hisn Muslim daily supplications, and an augmented reality 3D Qibla finder in one seamless app.',
  whyChooseHeading: 'Why is Diya Holy Quran the Top Choice for Millions?',
  whyChooseDesc: 'Designed with modern software architecture and elegant typography, Diya Holy Quran provides unmatched responsiveness and offline capabilities. Here is why this app is essential for your smartphone:',
  features: [
    {
      title: '📖 Original Uthmani Mushaf',
      desc: 'Crystal-clear Madinah script Quran pages with night mode, custom font sizing, automatic bookmarks, and quick surah search.',
      img: '02_Quran_Mushaf_Reading.jpg',
      alt: 'Holy Quran reading in Diya Quran App'
    },
    {
      title: '🕌 Verified Prayer Times & Athan',
      desc: 'Highly accurate prayer calculations for Istanbul, Turkey, and all global cities with customizable audio Athan reminders and post-prayer dua.',
      img: '03_Prayer_Times_Schedule.jpg',
      alt: 'Accurate prayer times and Athan in Diya Quran'
    },
    {
      title: '🧭 3D Qibla Direction Compass',
      desc: 'Instant, precise orientation towards the Holy Kaaba in Makkah using your device sensors, GPS, and augmented reality compass.',
      img: '04_Qibla_Compass_3D.jpg',
      alt: '3D Qibla direction compass in Diya Quran app'
    },
    {
      title: '🎧 Offline Audio Recitations',
      desc: 'Listen to soulful recitations by Al-Minshawi, Abdul Basit, Mishary Alafasy, Al-Muaiqly, Al-Husary, and Al-Sudais with background playback and verse repeat for memorization.',
      img: '05_Recitation_Audio_Player.jpg',
      alt: 'Quran audio recitations with famous reciters'
    },
    {
      title: '📿 Hisn Muslim & Smart Tasbih',
      desc: 'Morning and evening supplications, bedtime azkar, Ruqyah Shariah, and a digital tasbih counter with vibration feedback.',
      img: '06_Hisn_Muslim_Azkar.jpg',
      alt: 'Hisn Muslim supplications and digital tasbih'
    },
    {
      title: '📜 Hadith Encyclopedia',
      desc: 'Comprehensive collection of Sahih Al-Bukhari, Sahih Muslim, Riyad as-Salihin, and 40 Hadith Nawawi classified by Islamic topics.',
      img: '07_Hadith_Encyclopedia.jpg',
      alt: 'Hadith encyclopedia Bukhari and Muslim'
    },
    {
      title: '🎯 Khatma Plan & Daily Wird Tracker',
      desc: 'Intelligent scheduling system to help you complete the Holy Quran in 30, 60, or 90 days with daily reminders and visual progress indicators.',
      img: '09_Khatma_Plan_Tracker.jpg',
      alt: 'Khatma plan and Quran reading tracker'
    },
    {
      title: '🎨 Color-Coded Tajweed Rules',
      desc: 'Visual distinction of Tajweed rules (Madd, Ghunnah, Qalqalah, Idgham) to help you recite the Quran accurately with proper pronunciation.',
      img: '15_Tajweed_Rules_Colors.jpg',
      alt: 'Color coded tajweed rules in Diya Quran'
    },
    {
      title: '📍 Nearby Mosques Locator',
      desc: 'Locate the nearest mosques and Friday prayer congregation locations around you with walking distance and directions on maps.',
      img: '12_Nearby_Mosques_Map.jpg',
      alt: 'Nearby mosques map locator'
    }
  ],
  midCtaHeading: 'Download Diya Quran App Today on Google Play',
  midCtaDesc: 'Available completely free on Google Play for all Android smartphones and tablets. Experience the tranquility of the Holy Quran wherever you go.',
  midCtaBtnText: 'Install Diya Holy Quran Free on Google Play',
  specsHeading: 'Technical Specifications of Diya Holy Quran Android App',
  specs: [
    { key: 'Official Application Name', val: 'Diya Holy Quran Offline (ضياء القرآن الكريم بدون إنترنت)' },
    { key: 'Package Name', val: PACKAGE_NAME },
    { key: 'Supported Android Version', val: 'Android 6.0 (Marshmallow) and higher' },
    { key: 'Play Store Category', val: 'Books & Reference / Islamic Lifestyle' },
    { key: 'Offline Functionality', val: '✅ 100% Offline Supported' },
    { key: 'Supported Languages', val: 'English, Arabic, Turkish, Urdu, French, Russian, and more' },
    { key: 'Price', val: '100% Free (No hidden fees or subscriptions)' },
    { key: 'Official AdMob app-ads.txt', val: APP_ADS_TXT_SNIPPET, isLink: true, href: '/app-ads.txt' }
  ],
  stepsHeading: 'How to Download and Use Diya Holy Quran App:',
  steps: [
    `Click on the <a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 700;">Download on Google Play</a> button.`,
    'Tap <strong>Install</strong> and allow the quick setup to finish.',
    'Launch the app and grant location permission to calculate exact prayer times and Qibla direction for your city automatically.',
    'Select your favorite reciter and your daily Khatma goal, and begin your blessed daily recitation.'
  ],
  faqHeading: 'Frequently Asked Questions (FAQ):',
  faqs: [
    {
      question: 'Does Diya Holy Quran require an internet connection to read?',
      answer: 'No, the full Quranic text, Uthmani pages, daily Azkar, Hadith books, and prayer times operate 100% offline without requiring internet data.'
    },
    {
      question: 'How does Diya Quran assist in memorizing (Hifz) the Quran?',
      answer: 'The app provides custom verse repetition, page hide/reveal mode, audio playback loop by reciters, and daily progress tracking designed for students of Quran memorization.'
    },
    {
      question: 'Are prayer times calculated according to certified international Islamic authorities?',
      answer: 'Yes, it supports all major calculation conventions worldwide including Diyanet (Turkey), Muslim World League (MWL), Umm Al-Qura (Makkah), Egyptian General Authority, and ISNA.'
    }
  ],
  finalCtaHeading: 'Join Thousands of Satisfied Users Worldwide',
  finalCtaDesc: 'Transform your smartphone into a sanctuary of peace and remembrance. Download Diya Holy Quran now, share it with your family and loved ones, and reap continuous rewards.',
  finalCtaBtnText: 'Get Diya Holy Quran on Google Play'
};

// 3. TURKISH
const trConfig = {
  locale: 'tr',
  slug: 'kuran-i-kerim-namaz-vakitleri-uygulamasi-indir',
  title: 'Ziya Kuran-ı Kerim İnternetsiz İndir (Android): Ezan Vakti, 3D Kıble Pusulası, Sesli Tilavet ve Hatim Takibi',
  summary: 'Android için eksiksiz Ziya Kuran-ı Kerim uygulaması (ضياء القرآن الكريم) incelemesi. İnternetsiz Kuran okuma, Diyanet uyumlu namaz vakitleri, 3D Kıble pusulası, sesli Kuran dinleme ve hatim takip rehberi.',
  publishedAt: '2026-09-08',
  canonical: 'https://jobs-in-istanbul.com/tr/blog/kuran-i-kerim-namaz-vakitleri-uygulamasi-indir',
  isRtl: false,
  appName: 'Ziya Kuran-ı Kerim İnternetsiz',
  appBadgeTop: '✨ 2026 Yılının En Kapsamlı İslami Android Uygulaması',
  appHeaderTitle: 'Ziya Kuran-ı Kerim İnternetsiz & Ezan Vakti — Günlük Manevi Rehberiniz',
  appHeaderDesc: 'Osmanlı Hattı Mushaf, Diyanet Namaz Vakitleri, Cevşen & Dualar, 3D Kıble Pusulası ve Sesli Hatim',
  badges: {
    rating: '4.9 / 5.0',
    android: 'Android 6.0+',
    offline: 'İnternetsiz Çalışma',
    free: '%100 Ücretsiz'
  },
  downloadBtnText: 'Ziya Kuran-ı Kerim Google Play\'den Ücretsiz İndir',
  bannerAlt: 'Ziya Kuran-ı Kerim internetsiz Android Uygulaması sesli dinleme ve Diyanet namaz vakitleri',
  bannerCaption: 'Ziya Kuran-ı Kerim (ضياء القرآن الكريم): Android için en gelişmiş İslami uygulama: Kuran okuma, sesli tilavet, ezan vakti ve kıble bulucu',
  introParagraph: 'Günlük ibadetlerinizi huşu içinde yerine getirmek ve Yüce Kitabımız Kuran-ı Kerim\'i her an yanınızda taşımak için geliştirilen <strong>Ziya Kuran-ı Kerim Uygulaması (Diya Holy Quran Offline)</strong>, Android kullanıcılarına eşsiz bir manevi tecrübe sunuyor. İnternet bağlantısına ihtiyaç duymadan Medine ve Osmanlı hattı Mushaf okuyabilir, Diyanet İşleri Başkanlığı uyumlu ezan vakitlerini takip edebilir ve 3D pusula ile Kabe yönünü saniyeler içinde bulabilirsiniz.',
  whyChooseHeading: 'Ziya Kuran-ı Kerim Neden Milyonların Tercihi?',
  whyChooseDesc: 'Ziya Kuran-ı Kerim, sade ve modern arayüzü, göz yormayan sayfa tasarımı ve hızlı performansıyla öne çıkıyor. İşte bu uygulamayı telefonunuz için vazgeçilmez kılan özellikler:',
  features: [
    {
      title: '📖 Orijinal Hat ile Mushaf Okuma',
      desc: 'Medine hattı ve klasik Osmanlı hattına uygun, göz yormayan sayfa tasarımı, gece modu, ayraç kaydetme ve sure içi kelime arama.',
      img: '02_Quran_Mushaf_Reading.jpg',
      alt: 'Ziya Kuranı Kerim Mushaf okuma sayfası'
    },
    {
      title: '🕌 Diyanet Uyumlu Ezan & Namaz Vakitleri',
      desc: 'İstanbul, tüm Türkiye şehirleri ve yurt dışı için Diyanet onaylı ezan vakitleri, ezan alarmı ve namaz sonrası tesbihat duaları.',
      img: '03_Prayer_Times_Schedule.jpg',
      alt: 'Diyanet namaz vakitleri ve ezan alarmı'
    },
    {
      title: '🧭 3 Boyutlu Kıble Yönü Bulucu',
      desc: 'Telefonunuzun pusula sensörü ve GPS sistemi ile Kabe yönünü yüksek hassasiyetle anında gösteren 3D kıble pusulası.',
      img: '04_Qibla_Compass_3D.jpg',
      alt: '3D Kıble yönü pusulası'
    },
    {
      title: '🎧 Seçkin Hafızlardan Sesli Tilavet',
      desc: 'Abdülbasit Abdüssamed, Minşavi, Afasy, Gamidi gibi İslam dünyasının en seçkin hafızlarının sesinden internetsiz dinleme ve hatim desteği.',
      img: '05_Recitation_Audio_Player.jpg',
      alt: 'Sesli Kuran dinleme ve hafız tilavetleri'
    },
    {
      title: '📿 Cevşen, Günlük Dualar ve Akıllı Zikirmatik',
      desc: 'Sabah-akşam zikirleri, Kuran-ı Kerim duaları, Cevşen-i Kebir ve titreşimli dijital zikirmatik sayacı.',
      img: '06_Hisn_Muslim_Azkar.jpg',
      alt: 'Cevşen, dualar ve akıllı zikirmatik'
    },
    {
      title: '📜 Hadis-i Şerif Ansiklopedisi',
      desc: 'Sahih-i Buhari, Sahih-i Müslim ve Riyazus Salihin\'den seçme hadisler, Türkçe açıklamaları ve arama özelliği.',
      img: '07_Hadith_Encyclopedia.jpg',
      alt: 'Hadis ansiklopedisi ve Buhari Müslim'
    },
    {
      title: '🎯 Hatim Takip ve Günlük Okuma Planı',
      desc: 'Kuran-ı Kerim\'i 30, 60 veya 90 günde hatmetmenize yardımcı olan akıllı planlama ve günlük hatırlatıcı bildirimler.',
      img: '09_Khatma_Plan_Tracker.jpg',
      alt: 'Kuran hatim takip programı'
    },
    {
      title: '🎨 Renkli Tecvid Kuralları',
      desc: 'Med, ihfa, izhar, kalkale gibi tecvid kurallarının özel renklerle gösterimi ile tecvidli okumayı kolaylaştıran rehber.',
      img: '15_Tajweed_Rules_Colors.jpg',
      alt: 'Renkli tecvid kuralları Kuran'
    },
    {
      title: '📍 En Yakın Camiler Haritası',
      desc: 'Bulunduğunuz konuma en yakın camileri ve Cuma namazı mescitlerini rota ve mesafe bilgisiyle haritada gösterir.',
      img: '12_Nearby_Mosques_Map.jpg',
      alt: 'En yakın camiler haritası'
    }
  ],
  midCtaHeading: 'Ziya Kuran-ı Kerim Uygulamasını Google Play\'den Hemen Yükleyin',
  midCtaDesc: 'Android telefon ve tabletleriniz için tamamen ücretsizdir. Manevi hayatınıza her an eşlik edecek güvenilir bir rehber.',
  midCtaBtnText: 'Ziya Kuran-ı Kerim Uygulamasını Google Play\'de Gör',
  specsHeading: 'Ziya Kuran-ı Kerim Uygulaması Teknik Özellikleri',
  specs: [
    { key: 'Resmi Uygulama Adı', val: 'Ziya Kuran-ı Kerim İnternetsiz (ضياء القرآن الكريم)' },
    { key: 'Paket Adı (Package Name)', val: PACKAGE_NAME },
    { key: 'Desteklenen Android Sürümü', val: 'Android 6.0 ve üzeri' },
    { key: 'Kategori', val: 'Kitaplar ve Referans / İslami Yaşam' },
    { key: 'İnternetsiz Okuma Desteği', val: '✅ %100 Çevrimdışı (Offline) Destekli' },
    { key: 'Desteklenen Diller', val: 'Türkçe, Arapça, İngilizce, Urduca, Rusça ve dünya dilleri' },
    { key: 'Uygulama Ücreti', val: 'Tamamen Ücretsiz (%100 Free)' },
    { key: 'Doğrulama Dosyası (app-ads.txt)', val: APP_ADS_TXT_SNIPPET, isLink: true, href: '/app-ads.txt' }
  ],
  stepsHeading: 'Uygulamanın Kolay Kurulum ve Kullanım Adımları:',
  steps: [
    `<a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 700;">Google Play İndir</a> butonuna dokunun.`,
    '<strong>Yükle (Install)</strong> butonuna basarak hızlı kurulumun tamamlanmasını bekleyin.',
    'Uygulamayı açın ve bulunduğunuz şehrin ezan saatlerini ve kıble açısını otomatik belirlemesi için konum iznini onaylayın.',
    'Sevdiğiniz kârileri ve hatim hedefinizi seçerek huzurlu bir Kuran yolculuğuna başlayın.'
  ],
  faqHeading: 'Sıkça Sorulan Sorular (SSS):',
  faqs: [
    {
      question: 'Ziya Kuran-ı Kerim uygulaması gerçekten internetsiz çalışıyor mu?',
      answer: 'Evet, Kuran-ı Kerim sayfaları, mealler, günlük dualar, zikirmatik ve kıble pusulası internet kotanızı kullanmadan tamamen internetsiz çalışır.'
    },
    {
      question: 'Namaz vakitleri Diyanet İşleri Başkanlığı ile birebir uyumlu mu?',
      answer: 'Evet, uygulama Türkiye ve dünyadaki tüm şehirler için Diyanet İşleri Başkanlığı hesaplama metodunu ve resmi ezan saatlerini kullanır.'
    },
    {
      question: 'Kuran ezberi yapanlar için özel bir kolaylık var mı?',
      answer: 'Ayet ayet tekrar çalma, ayet gizleme ile kendini test etme ve sayfa dinleme özellikleri hafızlık ve ezber yapanlar için özel olarak tasarlanmıştır.'
    }
  ],
  finalCtaHeading: 'Bugün Binlerce Kullanıcıya Katılın',
  finalCtaDesc: 'Telefonunuzu manevi bir huzur kaynağına dönüştürün. Ziya Kuran-ı Kerim uygulamasını hemen indirin, sevdiklerinizle paylaşarak hayra vesile olun.',
  finalCtaBtnText: 'Ziya Kuran-ı Kerim Google Play İndir'
};

// 4. URDU
const urConfig = {
  locale: 'ur',
  slug: 'quran-karim-app-offline-features-download',
  title: 'ضیاء القرآن الکریم بغیر انٹرنیٹ ایپ ڈاؤن لوڈ: مکمل قرآن پاک، نماز کے اوقات، اذان الرٹ، مسنون دعائیں اور قبلہ رخ',
  summary: 'اینڈرائیڈ کے لیے ضیاء القرآن الکریم (Diya Quran) مکمل آف لائن ایپ کا جائزہ۔ اصل عثمانی رسم الخط، معروف قراء کرام کی تلاوت، درست نماز کے اوقات، 3D قبلہ رخ، اور حصن المسلم دعائیں۔',
  publishedAt: '2026-09-08',
  canonical: 'https://jobs-in-istanbul.com/ur/blog/quran-karim-app-offline-features-download',
  isRtl: true,
  appName: 'ضیاء القرآن الکریم بغیر انٹرنیٹ',
  appBadgeTop: '✨ ۲۰۲۶ کی سب سے بہترین جامع اسلامی اینڈرائیڈ ایپلی کیشن',
  appHeaderTitle: 'ضیاء القرآن الکریم مکمل بغیر انٹرنیٹ — آپ کا روزمرہ روحانی ساتھی',
  appHeaderDesc: 'خوبصورت عثمانی رسم الخط، نماز کے درست اوقات، اذان کے الرٹس، حصن المسلم مسنون دعائیں، اور 3D قبلہ رخ کمپاس',
  badges: {
    rating: '4.9 / 5.0',
    android: 'Android 6.0+',
    offline: '۱۰۰٪ بغیر انٹرنیٹ کے کام کرے',
    free: 'مکمل مفت'
  },
  downloadBtnText: 'گوگل پلے اسٹور سے ضیاء القرآن مفت ڈاؤن لوڈ کریں',
  bannerAlt: 'ضیاء القرآن الکریم بغیر انٹرنیٹ اینڈرائیڈ ایپلی کیشن',
  bannerCaption: 'ضیاء القرآن الکریم (Diya Holy Quran): قرآن پاک کی تلاوت، مسنون اذکار، نماز کے اوقات اور درست قبلہ رخ',
  introParagraph: 'ہر مسلمان کی دلی خواہش ہوتی ہے کہ وہ اپنے اسمارٹ فون میں ایک ایسی جامع اور پرسکون اسلامی ایپ رکھے جو بغیر انٹرنیٹ کے مکمل کام کرے۔ <strong>ضیاء القرآن الکریم بغیر انٹرنیٹ (Diya Holy Quran Offline)</strong> ایپ اینڈرائیڈ صارفین کے لیے ایک عظیم روحانی تحفہ ہے، جس میں مدینہ منورہ کے مصحف کے مطابق عثمانی رسم الخط، عالم اسلام کے مایہ ناز قراء کی تلاوت، نمازوں کے مستند اوقات اور قبلہ رخ کمپاس کو یکجا کیا گیا ہے۔',
  whyChooseHeading: 'ضیاء القرآن الکریم ایپ لاکھوں مسلمانوں کا پہلا انتخاب کیوں ہے؟',
  whyChooseDesc: 'یہ ایپ تیز رفتار، خوبصورت ڈیزائن اور کسی بھی الجھن یا اشتہارات کے بغیر بنائی گئی ہے۔ آئیے اس کی اہم خصوصیات کا جائزہ لیتے ہیں:',
  features: [
    {
      title: '📖 اصل عثمانی رسم الخط میں قرآن پاک',
      desc: 'مدینہ منورہ کے مصحف جیسا واضح اور آنکھوں کے لیے آرام دہ رسم الخط، نائٹ موڈ (ڈارک موڈ)، فونٹ بڑا کرنے اور خودکار بک مارک کی سہولت۔',
      img: '02_Quran_Mushaf_Reading.jpg',
      alt: 'ضیاء القرآن عثمانی رسم الخط تلاوت'
    },
    {
      title: '🕌 نماز کے درست اوقات اور اذان الرٹ',
      desc: 'استنبول، پاکستان، بھارت اور دنیا بھر کے تمام شہروں کے لیے نمازوں کے بالکل درست اوقات اور دلکش اذان کے الرٹس۔',
      img: '03_Prayer_Times_Schedule.jpg',
      alt: 'نماز کے اوقات اور اذان الرٹ'
    },
    {
      title: '🧭 3D قبلہ رخ کمپاس',
      desc: 'آپ کے موبائل کے جی پی ایس اور کمپاس سینسرز کے ذریعے دنیا کے کسی بھی کونے میں کعبۃ اللہ شریف کی سمت کی فوری اور 100% درست رہنمائی۔',
      img: '04_Qibla_Compass_3D.jpg',
      alt: '3D قبلہ رخ کمپاس'
    },
    {
      title: '🎧 معروف قراء کی روح پرور تلاوت',
      desc: 'قاری عبدالباسط، شیخ منشاوی، مشاری العفاسی، اور شیخ السدیس کی دلنشین تلاوتیں آف لائن سننے اور حفظ کرنے کی سہولت۔',
      img: '05_Recitation_Audio_Player.jpg',
      alt: 'قرآن مجید آڈیو تلاوت قراء کرام'
    },
    {
      title: '📿 حصن المسلم مسنون دعائیں اور ڈیجیٹل تسبیح',
      desc: 'صبح و شام کے اذکار، سونے جاگنے کی دعائیں، مسنون وظائف اور وائبریشن فیڈ بیک کے ساتھ اسمارٹ ڈیجیٹل تسبیح کاؤنٹر۔',
      img: '06_Hisn_Muslim_Azkar.jpg',
      alt: 'حصن المسلم دعائیں اور ڈیجیٹل تسبیح'
    },
    {
      title: '📜 احادیث نبویہ انسائیکلوپیڈیا',
      desc: 'صحیح البخاری، صحیح مسلم، اور ریاض الصالحین سے منتخب احادیث مبارکہ کا مستند اردو ترجمہ اور موضوعاتی فہرست۔',
      img: '07_Hadith_Encyclopedia.jpg',
      alt: 'صحیح بخاری و مسلم احادیث مبارکہ'
    },
    {
      title: '🎯 ختم قرآن اور روزانہ ورد ٹریکر',
      desc: 'ایک ماہ یا دو ماہ میں قرآن پاک مکمل تلاوت کرنے کا سائنسی ٹریکر جو روزانہ آپ کو تلاوت کا حصہ یاد دلاتا ہے۔',
      img: '09_Khatma_Plan_Tracker.jpg',
      alt: 'ختم قرآن پلانر اور روزانہ تلاوت'
    },
    {
      title: '🎨 تجوید کے رنگین قواعد',
      desc: 'حروف کے مخارج، مد، غنہ، اور قلقلہ کے قواعد رنگوں کے ساتھ تاکہ قرآن پاک کو تجوید کے ساتھ درست پڑھا جا سکے۔',
      img: '15_Tajweed_Rules_Colors.jpg',
      alt: 'رنگین تجوید کے قواعد'
    },
    {
      title: '📍 قریبی مساجد کی تلاش کا نقشہ',
      desc: 'آپ کے موجودہ مقام کے قریب ترین مساجد اور نماز جمعہ کے مقامات کی دوری اور راستے کی آسان رہنمائی۔',
      img: '12_Nearby_Mosques_Map.jpg',
      alt: 'قریبی مساجد کا نقشہ'
    }
  ],
  midCtaHeading: 'ابھی ضیاء القرآن الکریم ایپ ڈاؤن لوڈ کریں',
  midCtaDesc: 'گوگل پلے پر تمام اینڈرائیڈ اسمارٹ فونز اور ٹیبلٹس کے لیے بالکل مفت دستیاب ہے۔',
  midCtaBtnText: 'گوگل پلے سے ضیاء القرآن ایپ انسٹال کریں',
  specsHeading: 'ضیاء القرآن الکریم ایپ کی تکنیکی تفصیلات',
  specs: [
    { key: 'ایپ کا آفیشل نام', val: 'ضیاء القرآن الکریم بغیر انٹرنیٹ (Diya Holy Quran)' },
    { key: 'پیکج کا نام (Package Name)', val: PACKAGE_NAME },
    { key: 'سپورٹ شدہ اینڈرائیڈ ورژن', val: 'Android 6.0 اور اس سے نیا' },
    { key: 'پلے اسٹور کیٹیگری', val: 'کتب و حوالہ جات / اسلامی طرز زندگی (Books & Reference)' },
    { key: 'آف لائن کام کرنے کی سہولت', val: '✅ ۱۰۰٪ بغیر انٹرنیٹ کے دستیاب' },
    { key: 'زبانیں', val: 'اردو، عربی، انگریزی، ترکی، روسی، فارسی اور دیگر' },
    { key: 'قیمت', val: '۱۰۰٪ مفت (کوئی فیس یا سبسکرپشن نہیں)' },
    { key: 'آفیشل توثیقی فائل (app-ads.txt)', val: APP_ADS_TXT_SNIPPET, isLink: true, href: '/app-ads.txt' }
  ],
  stepsHeading: 'ایپ ڈاؤن لوڈ اور استعمال کرنے کا آسان طریقہ:',
  steps: [
    `<a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 700;">Google Play سے ڈاؤن لوڈ کریں</a> پر کلک کریں۔`,
    '<strong>Install</strong> کے بٹن کو دبائیں اور ایپ ڈاؤن لوڈ ہونے کا انتظار کریں۔',
    'ایپ کھولیں اور اپنے شہر کے درست نماز کے اوقات اور قبلہ رخ کے لیے لوکیشن کی اجازت دیں۔',
    'اپنے پسندیدہ قاری کی آواز منتخب کریں اور تلاوت قرآن پاک کی برکتوں سے اپنے دل کو منور کریں۔'
  ],
  faqHeading: 'اکثر پوچھے جانے والے سوالات (FAQ):',
  faqs: [
    {
      question: 'کیا ضیاء القرآن ایپ میں تلاوت سننے کے لیے انٹرنیٹ ضروری ہے؟',
      answer: 'قرآن مجید کا متن، ترجمہ، اذکار اور قبلہ نما مکمل آف لائن کام کرتے ہیں۔ آڈیو سورتیں آپ ایک بار ڈاؤن لوڈ کر کے زندگی بھر بغیر انٹرنیٹ کے سن سکتے ہیں۔'
    },
    {
      question: 'کیا نماز کے اوقات مستند اداروں کے مطابق ہیں؟',
      answer: 'جی ہاں، ایپ میں جامعہ علوم اسلامیہ بنوری ٹاؤن کراچی، ام القریٰ مکہ مکرمہ، دیانت ترکی، اور مسلم ورلڈ لیگ کے مستند حسابی فارمولے موجود ہیں۔'
    },
    {
      question: 'کیا یہ ایپ قرآن پاک حفظ کرنے میں مددگار ہے؟',
      answer: 'بالکل، اس میں آیات کو بار بار دہرانے، آیات کو چھپا کر خود کا ٹیسٹ لینے، اور روزانہ کا سبق ٹریک کرنے کے شاندار ٹولز شامل ہیں۔'
    }
  ],
  finalCtaHeading: 'آج ہی لاکھوں مطمئن صارفین میں شامل ہوں',
  finalCtaDesc: 'اپنے موبائل کو نیکیوں اور ذکر الٰہی کا ذریعہ بنائیں۔ ابھی ضیاء القرآن الکریم ایپ مفت ڈاؤن لوڈ کریں اور اپنے اہل خانہ و دوستوں کے ساتھ صدقہ جاریہ کے طور پر شیئر کریں۔',
  finalCtaBtnText: 'ضیاء القرآن ایپ Google Play سے ڈاؤن لوڈ کریں'
};

// 5. INDONESIAN
const idConfig = {
  locale: 'id',
  slug: 'quran-karim-app-offline-features-download',
  title: 'Download Aplikasi Dhiya Al-Quran Al-Karim Offline: Murottal MP3, Jadwal Sholat, Arah Kiblat 3D & Doa Harian',
  summary: 'Ulasan lengkap aplikasi Dhiya Al-Quran Al-Karim Offline Android (ضياء القرآن الكريم). Dilengkapi Mushaf Rasm Utsmani, audio murottal qari internasional, jadwal sholat & adzan, kompas kiblat 3D, dan dzikir hisnul muslim.',
  publishedAt: '2026-09-08',
  canonical: 'https://jobs-in-istanbul.com/id/blog/quran-karim-app-offline-features-download',
  isRtl: false,
  appName: 'Dhiya Al-Quran Al-Karim Offline',
  appBadgeTop: '✨ Aplikasi Islami Terlengkap & Terbaik Android 2026',
  appHeaderTitle: 'Aplikasi Dhiya Al-Quran Al-Karim Lengkap Tanpa Internet — Sahabat Ibadah Anda',
  appHeaderDesc: 'Mushaf Al-Qur\'an Rasm Utsmani Asli, Jadwal Sholat Otomatis, Dzikir Pagi Petang, Kompas Kiblat 3D, dan Audio Murottal Merdu',
  badges: {
    rating: '4.9 / 5.0',
    android: 'Android 6.0+',
    offline: '100% Bisa Tanpa Internet',
    free: '100% Gratis Selamanya'
  },
  downloadBtnText: 'Download Dhiya Al-Quran di Google Play Gratis',
  bannerAlt: 'Aplikasi Dhiya Al-Quran Al-Karim Offline Android lengkap dengan jadwal sholat dan murottal',
  bannerCaption: 'Dhiya Al-Quran Al-Karim (ضياء القرآن الكريم): Aplikasi Al-Quran offline terbaik di Android 2026: bacaan mushaf, murottal, jadwal sholat, dan kiblat akurat',
  introParagraph: 'Sebagai umat Muslim di Indonesia dan seluruh dunia, memiliki aplikasi Al-Qur\'an digital yang lengkap, ringan, dan dapat diakses tanpa koneksi internet adalah kebutuhan utama. <strong>Aplikasi Dhiya Al-Quran Al-Karim Offline (ضياء القرآن الكريم بدون إنترنت)</strong> hadir sebagai solusi ibadah harian terbaik di perangkat Android. Dirancang dengan standar mushaf standar Madinah rasm Utsmani, dilengkapi lantunan murottal dari para syaikh terkemuka, jadwal sholat akurat, dzikir pagi petang, serta penunjuk arah kiblat 3D yang presisi.',
  whyChooseHeading: 'Mengapa Dhiya Al-Quran Menjadi Pilihan Utama Jutaan Pengguna?',
  whyChooseDesc: 'Aplikasi Dhiya Al-Quran memadukan keindahan antarmuka modern, kemudahan penggunaan tanpa iklan yang mengganggu, serta performa super cepat tanpa menguras baterai ponsel Anda. Berikut fitur unggulannya:',
  features: [
    {
      title: '📖 Mushaf Rasm Utsmani Madinah',
      desc: 'Tampilan ayat suci Al-Qur\'an yang sangat jernih dan nyaman di mata, mode malam (dark mode), perbesar ukuran teks, dan penanda bacaan terakhir otomatis.',
      img: '02_Quran_Mushaf_Reading.jpg',
      alt: 'Baca Mushaf Al Quran Dhiya rasm utsmani'
    },
    {
      title: '🕌 Jadwal Sholat & Notifikasi Adzan Otomatis',
      desc: 'Waktu sholat akurat untuk seluruh kota di Indonesia dan dunia sesuai Kemenag dan otoritas resmi internasional, lengkap dengan alarm adzan merdu.',
      img: '03_Prayer_Times_Schedule.jpg',
      alt: 'Jadwal sholat dan waktu adzan akurat'
    },
    {
      title: '🧭 Kompas Arah Kiblat 3D Akurat',
      desc: 'Penunjuk arah Ka\'bah presisi tinggi menggunakan sensor kompas dan GPS di HP Anda dengan visualisasi 3D yang mudah dipahami di mana pun Anda berada.',
      img: '04_Qibla_Compass_3D.jpg',
      alt: 'Kompas arah kiblat 3D akurat'
    },
    {
      title: '🎧 Audio Murottal Merdu Qari Ternama',
      desc: 'Dengarkan lantunan suara emas Syaikh Mishary Rashid Alafasy, Abdul Basit, As-Sudais, Al-Minshawi, dan Al-Ghamidi secara offline dengan fitur pemutaran latar belakang.',
      img: '05_Recitation_Audio_Player.jpg',
      alt: 'Audio murottal Al Quran mp3 offline'
    },
    {
      title: '📿 Dzikir Pagi Petang & Tasbih Digital',
      desc: 'Kumpulan doa harian dari kitab Hisnul Muslim, dzikir pagi dan petang, doa setelah sholat, serta tasbih digital pintar bergetar.',
      img: '06_Hisn_Muslim_Azkar.jpg',
      alt: 'Dzikir pagi petang dan tasbih digital'
    },
    {
      title: '📜 Ensiklopedia Hadits Shahih',
      desc: 'Kumpulan hadits shahih Bukhari, Muslim, dan Riyadhus Shalihin berterjemah lengkap berdasarkan topik kehidupan sehari-hari.',
      img: '07_Hadith_Encyclopedia.jpg',
      alt: 'Ensiklopedia hadits shahih Bukhari Muslim'
    },
    {
      title: '🎯 Target Khatam Al-Qur\'an & Tracker Harian',
      desc: 'Sistem manajemen cerdas untuk membantu Anda menuntaskan khatam Al-Qur\'an dalam 30 hari (Ramadhan) atau target pilihan Anda dengan pengingat harian.',
      img: '09_Khatma_Plan_Tracker.jpg',
      alt: 'Program khatam Quran dan tracker bacaan'
    },
    {
      title: '🎨 Tajwid Berwarna & Koreksi Tilawah',
      desc: 'Pemberian warna khusus pada hukum tajwid (mad, dengung/ghunnah, qolqolah, idgham) memudahkan Anda membaca dengan fasih dan benar sesuai kaidah.',
      img: '15_Tajweed_Rules_Colors.jpg',
      alt: 'Hukum tajwid berwarna Al Quran'
    },
    {
      title: '📍 Peta Lokasi Masjid Terdekat',
      desc: 'Menampilkan masjid-masjid terdekat di sekitar lokasi Anda beserta estimasi jarak dan panduan navigasi untuk sholat berjamaah.',
      img: '12_Nearby_Mosques_Map.jpg',
      alt: 'Peta masjid terdekat di sekitar lokasi'
    }
  ],
  midCtaHeading: 'Download Aplikasi Dhiya Al-Quran Sekarang di Google Play',
  midCtaDesc: 'Tersedia gratis di Google Play Store untuk semua smartphone dan tablet Android tanpa syarat apa pun.',
  midCtaBtnText: 'Pasang Dhiya Al-Quran Gratis di Google Play',
  specsHeading: 'Tabel Spesifikasi Teknis Aplikasi Dhiya Al-Quran',
  specs: [
    { key: 'Nama Aplikasi Resmi', val: 'Dhiya Al-Quran Al-Karim Offline (ضياء القرآن الكريم)' },
    { key: 'Nama Paket (Package Name)', val: PACKAGE_NAME },
    { key: 'Versi Android Minimum', val: 'Android 6.0 (Marshmallow) ke atas' },
    { key: 'Kategori Toko Aplikasi', val: 'Buku & Referensi / Gaya Hidup Islami' },
    { key: 'Kemampuan Offline', val: '✅ 100% Berfungsi Tanpa Kuota Internet' },
    { key: 'Dukungan Bahasa', val: 'Bahasa Indonesia, Arab, Inggris, Turki, Urdu, dan lainnya' },
    { key: 'Harga', val: '100% Gratis (Tanpa biaya tersembunyi)' },
    { key: 'Verifikasi Resmi (app-ads.txt)', val: APP_ADS_TXT_SNIPPET, isLink: true, href: '/app-ads.txt' }
  ],
  stepsHeading: 'Langkah Mudah Mengunduh dan Memakai Aplikasi:',
  steps: [
    `Klik tombol <a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 700;">Download di Google Play</a>.`,
    'Ketuk <strong>Instal (Install)</strong> dan tunggu proses unduhan selesai dengan cepat.',
    'Buka aplikasi dan berikan izin lokasi agar jadwal sholat serta arah kiblat di kota Anda terkonfigurasi otomatis.',
    'Pilih qari favorit dan atur target membaca Anda untuk memulai hari penuh berkah.'
  ],
  faqHeading: 'Pertanyaan yang Sering Diajukan (FAQ):',
  faqs: [
    {
      question: 'Apakah aplikasi Dhiya Al-Quran benar-benar bisa digunakan tanpa kuota internet?',
      answer: 'Ya, seluruh teks Al-Qur\'an, terjemahan, doa dzikir, dan kompas kiblat sudah tersimpan di dalam aplikasi dan bekerja 100% offline.'
    },
    {
      question: 'Apakah jadwal sholat sesuai dengan standar Kementerian Agama RI (Kemenag)?',
      answer: 'Ya, aplikasi ini mendukung metode perhitungan Kemenag RI dan badan hisab rukyat terpercaya lainnya, sehingga waktu adzan sangat presisi.'
    },
    {
      question: 'Bagaimana cara mendengarkan murottal secara offline?',
      answer: 'Anda dapat mendengarkan secara streaming langsung atau mengunduh surat yang diinginkan saat ada koneksi wifi untuk didengarkan berulang kali secara offline.'
    }
  ],
  finalCtaHeading: 'Bergabunglah dengan Ribuan Pengguna Dhiya Al-Quran Hari Ini',
  finalCtaDesc: 'Jadikan ponsel pintar Anda sebagai penyejuk hati dan sumber pahala tanpa henti. Unduh Dhiya Al-Quran Al-Karim sekarang dan bagikan kepada keluarga serta sahabat.',
  finalCtaBtnText: 'Download Dhiya Al-Quran di Google Play Sekarang'
};

// 6. FRENCH
const frConfig = {
  locale: 'fr',
  slug: 'quran-karim-app-offline-features-download',
  title: 'Télécharger Diya Le Saint Coran Complet Hors Ligne (Android) : Récitations Audio, Heures de Prière, Azkar & Boussole Qibla 3D',
  summary: 'Guide complet et revue de l\'application Android Diya Le Saint Coran Hors Ligne (ضياء القرآن الكريم). Écriture Outhmani, récitation des grands qaris, horaires de prière précis, boussole Qibla 3D et invocations Hisn al-Muslim.',
  publishedAt: '2026-09-08',
  canonical: 'https://jobs-in-istanbul.com/fr/blog/quran-karim-app-offline-features-download',
  isRtl: false,
  appName: 'Diya Le Saint Coran sans Internet',
  appBadgeTop: '✨ L\'application islamique de référence pour Android en 2026',
  appHeaderTitle: 'Diya Le Saint Coran Complet Hors Ligne — Votre Compagnon Spirituel Quotidien',
  appHeaderDesc: 'Mushaf en calligraphie Outhmani, horaires de prière vérifiés, invocations de la Citadelle du Musulman et boussole Qibla 3D',
  badges: {
    rating: '4.9 / 5.0',
    android: 'Android 6.0+',
    offline: '100% Fonctionnel Hors Ligne',
    free: '100% Gratuit'
  },
  downloadBtnText: 'Télécharger Diya Coran sur Google Play Gratuitement',
  bannerAlt: 'Application Android Diya Le Saint Coran hors ligne avec audio récitation et boussole Qibla',
  bannerCaption: 'Diya Le Saint Coran (ضياء القرآن الكريم) : L\'application islamique complète sur Android en 2026 : lecture du Coran, invocations, heures de prière et Qibla',
  introParagraph: 'Pour tous les musulmans francophones à la recherche d\'une application islamique complète, élégante et sans connexion Internet, <strong>Diya Le Saint Coran Hors Ligne (ضياء القرآن الكريم بدون إنترنت)</strong> s\'impose comme l\'une des meilleures applications sur Google Play. Elle rassemble le Saint Coran dans sa calligraphie originale Outhmani, les horaires de prière calculés selon les méthodes officielles, les récitations audio des plus illustres Qaris, ainsi que les invocations quotidiennes de la Citadelle du Musulman.',
  whyChooseHeading: 'Pourquoi l\'application Diya Coran est-elle le choix de millions de fidèles ?',
  whyChooseDesc: 'Conçue avec les plus hauts standards technologiques, l\'application allie fluidité, beauté visuelle et autonomie totale sans dépendre d\'un forfait Internet. Voici ses fonctionnalités maîtresses :',
  features: [
    {
      title: '📖 Mushaf authentique en calligraphie Outhmani',
      desc: 'Pages conformes au Mushaf de Médine, écriture nette et agréable, mode nuit pour préserver les yeux, grossissement du texte et signets automatiques.',
      img: '02_Quran_Mushaf_Reading.jpg',
      alt: 'Lecture du Saint Coran en calligraphie Outhmani'
    },
    {
      title: '🕌 Horaires de prière et alertes de l\'Adhan',
      desc: 'Calcul précis des heures de prière pour Paris, Istanbul, Casablanca, Alger, Dakar et toutes les villes du monde avec notifications audios de l\'Adhan.',
      img: '03_Prayer_Times_Schedule.jpg',
      alt: 'Horaires de prière et alarme Adhan'
    },
    {
      title: '🧭 Boussole Qibla 3D ultra précise',
      desc: 'Localisation instantanée et fiable de la direction de la Sainte Kaaba à La Mecque grâce aux capteurs GPS et boussole de votre smartphone.',
      img: '04_Qibla_Compass_3D.jpg',
      alt: 'Boussole Qibla 3D en direct'
    },
    {
      title: '🎧 Récitations audio des plus grands Qaris',
      desc: 'Écoutez les voix prestigieuses d\'Al-Minshawi, Abdul Basit, Mishary Alafasy, Al-Muaiqly et Al-Sudais en lecture audio hors ligne et en arrière-plan.',
      img: '05_Recitation_Audio_Player.jpg',
      alt: 'Récitations audio du Coran mp3'
    },
    {
      title: '📿 La Citadelle du Musulman (Hisn al-Muslim) & Chapelet digital',
      desc: 'Invocations du matin et du soir, douas de protection, et chapelet électronique intelligent avec vibration tactile pour vos louanges.',
      img: '06_Hisn_Muslim_Azkar.jpg',
      alt: 'Invocations de la Citadelle du Musulman'
    },
    {
      title: '📜 Encyclopédie des Hadiths Prophétiques',
      desc: 'Accédez aux recueils authentiques de Sahih Al-Bukhari, Sahih Muslim et Riyad as-Salihin classés méthodiquement par chapitres.',
      img: '07_Hadith_Encyclopedia.jpg',
      alt: 'Hadiths authentiques Boukhari et Mouslim'
    },
    {
      title: '🎯 Suivi de la Khatma et lecture quotidienne',
      desc: 'Planifiez la lecture intégrale du Coran en 30 ou 60 jours grâce à un calendrier interactif et des rappels quotidiens stimulants.',
      img: '09_Khatma_Plan_Tracker.jpg',
      alt: 'Planificateur de Khatma du Coran'
    },
    {
      title: '🎨 Règles de Tajweed en couleurs',
      desc: 'Mise en évidence colorée des règles de Tajweed (prolongations, nasales, élisions) pour vous aider à parfaire votre prononciation coranique.',
      img: '15_Tajweed_Rules_Colors.jpg',
      alt: 'Règles de Tajweed avec code couleur'
    },
    {
      title: '📍 Localisateur des mosquées environnantes',
      desc: 'Trouvez facilement les mosquées les plus proches de votre position actuelle avec indication de distance et itinéraire guidé.',
      img: '12_Nearby_Mosques_Map.jpg',
      alt: 'Carte des mosquées les plus proches'
    }
  ],
  midCtaHeading: 'Téléchargez l\'application Diya Coran sur Google Play',
  midCtaDesc: 'Disponible gratuitement pour tous les téléphones et tablettes Android. Nourrissez votre foi au quotidien en toute sérénité.',
  midCtaBtnText: 'Installer Diya Le Saint Coran sur Google Play',
  specsHeading: 'Caractéristiques techniques de l\'application Diya Coran',
  specs: [
    { key: 'Nom Officiel de l\'Application', val: 'Diya Le Saint Coran sans Internet (ضياء القرآن الكريم)' },
    { key: 'Nom du Paquet (Package Name)', val: PACKAGE_NAME },
    { key: 'Version Android Compatible', val: 'Android 6.0 (Marshmallow) et versions ultérieures' },
    { key: 'Catégorie du Store', val: 'Livres et références / Mode de vie islamique' },
    { key: 'Fonctionnement Hors Ligne', val: '✅ 100% Fonctionnel sans Internet' },
    { key: 'Langues Prises en Charge', val: 'Français, Arabe, Anglais, Turc, Ourdou, et plus' },
    { key: 'Prix', val: '100% Gratuit (Aucun abonnement payant)' },
    { key: 'Fichier de Vérification (app-ads.txt)', val: APP_ADS_TXT_SNIPPET, isLink: true, href: '/app-ads.txt' }
  ],
  stepsHeading: 'Comment installer et débuter avec l\'application Diya Coran :',
  steps: [
    `Cliquez sur le bouton <a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 700;">Télécharger sur Google Play</a>.`,
    'Appuyez sur <strong>Installer</strong> et laissez le téléchargement rapide s\'exécuter.',
    'Ouvrez l\'application et accordez l\'accès à votre position pour configurer automatiquement les heures de prière et la direction de la Qibla.',
    'Choisissez votre récitateur préféré et votre objectif de lecture quotidien pour illuminer vos journées.'
  ],
  faqHeading: 'Foire Aux Questions (FAQ) :',
  faqs: [
    {
      question: 'L\'application fonctionne-t-elle réellement sans connexion Internet ?',
      answer: 'Oui, l\'intégralité des 114 sourates du Saint Coran, les invocations d\'Hisn al-Muslim, le chapelet et la boussole Qibla fonctionnent sans nécessiter de forfait Internet.'
    },
    {
      question: 'Les horaires de prière sont-ils conformes aux mosquées de France et du Maghreb ?',
      answer: 'Oui, l\'application prend en charge les calculs de l\'UOIF (12° et 15°), de la Ligue Islamique Mondiale, et des ministères des affaires religieuses du Maroc, d\'Algérie et de Tunisie.'
    },
    {
      question: 'L\'application propose-t-elle la traduction en français ?',
      answer: 'Oui, elle intègre la traduction française reconnue des versets pour accompagner votre lecture et méditation.'
    }
  ],
  finalCtaHeading: 'Rejoignez des milliers d\'utilisateurs à travers le monde',
  finalCtaDesc: 'Transformez votre téléphone en un havre de recueillement et de paix. Téléchargez gratuitement l\'application Diya Le Saint Coran dès maintenant et partagez-la avec vos proches.',
  finalCtaBtnText: 'Télécharger Diya Coran sur Google Play'
};

// 7. RUSSIAN
const ruConfig = {
  locale: 'ru',
  slug: 'quran-karim-app-offline-features-download',
  title: 'Скачать приложение Дия аль-Коран без интернета на Android: Священный Коран оффлайн, время намаза, Кибла 3D и аудио чтение',
  summary: 'Полный обзор исламского приложения Дия аль-Коран (ضياء القرآن الكريم) без интернета для Android. Мединский мусхаф, аудио чтение известных чтецов, расписание намаза, 3D компас Киблы и Крепость мусульманина.',
  publishedAt: '2026-09-08',
  canonical: 'https://jobs-in-istanbul.com/ru/blog/quran-karim-app-offline-features-download',
  isRtl: false,
  appName: 'Дия аль-Коран без интернета',
  appBadgeTop: '✨ Лучшее исламское приложение для Android 2026 года',
  appHeaderTitle: 'Дия аль-Коран Священный Коран без интернета — Ваш духовный спутник',
  appHeaderDesc: 'Мединский мусхаф усманическим шрифтом, точное время намаза, дуа из Крепости мусульманина, 3D компас Киблы и аудио чтение',
  badges: {
    rating: '4.9 / 5.0',
    android: 'Android 6.0+',
    offline: '100% Работает без интернета',
    free: 'Полностью бесплатно'
  },
  downloadBtnText: 'Скачать Дия аль-Коран в Google Play бесплатно',
  bannerAlt: 'Приложение Дия аль-Коран без интернета на Android с аудио чтением и временем намаза',
  bannerCaption: 'Дия аль-Коран (ضياء القرآن الكريم): Самое надежное исламское приложение на Android в 2026 году: чтение Корана, азкары, время намаза и точная Кибла',
  introParagraph: 'В современном ритме жизни каждому мусульманину необходимо надежное, красивое и функциональное исламское приложение, работающее без подключения к интернету. Приложение <strong>Дия аль-Коран без интернета (Diya Holy Quran Offline)</strong> представляет собой современный стандарт для устройств Android. Оно объединяет полный текст Священного Корана по Мединскому изданию, точное расписание намаза, душевные аудиозаписи лучших чтецов мира, дуа из сборника «Крепость мусульманина» и удобный 3D компас Киблы.',
  whyChooseHeading: 'Почему миллионы мусульман выбирают Дия аль-Коран?',
  whyChooseDesc: 'Приложение отличается высокой скоростью работы, современным дизайном, низким расходом батареи и отсутствием навязчивой рекламы. Вот ключевые преимущества:',
  features: [
    {
      title: '📖 Священный Коран усманическим шрифтом',
      desc: 'Четкие страницы оригинального Мединского издания, ночной режим для комфортного чтения в темноте, масштабирование шрифта и автосохранение закладок.',
      img: '02_Quran_Mushaf_Reading.jpg',
      alt: 'Чтение Корана оффлайн в приложении Дия'
    },
    {
      title: '🕌 Точное время намаза и азан',
      desc: 'Выверенное расписание молитв для Москвы, Казани, Грозного, Махачкалы, Стамбула, Ташкента и всех городов мира с аудио оповещениями азана.',
      img: '03_Prayer_Times_Schedule.jpg',
      alt: 'Расписание времени намаза и азан'
    },
    {
      title: '🧭 3D компас направления Киблы',
      desc: 'Точное и быстрое определение направления на Каабу в Мекке с помощью встроенных сенсоров компаса и GPS вашего смартфона.',
      img: '04_Qibla_Compass_3D.jpg',
      alt: '3D компас Киблы направление на Каабу'
    },
    {
      title: '🎧 Аудио чтение лучших чтецов мира',
      desc: 'Слушайте красивое чтение Мишари Рашида, Абдуль-Басита, аль-Миншави, аль-Хусари и ас-Судейса с функцией фонового воспроизведения и повтора аятов.',
      img: '05_Recitation_Audio_Player.jpg',
      alt: 'Аудио Коран слушать чтение чтецов'
    },
    {
      title: '📿 Крепость мусульманина и электронный тасбих',
      desc: 'Утренние и вечерние азкары, мольбы на каждый день, шариатская рукия и умный цифровой тасбих с тактильным виброоткликом.',
      img: '06_Hisn_Muslim_Azkar.jpg',
      alt: 'Крепость мусульманина дуа и тасбих'
    },
    {
      title: '📜 Энциклопедия хадисов Пророка ﷺ',
      desc: 'Сборники достоверных хадисов Сахих аль-Бухари, Сахих Муслим и Сады праведных с удобным поиском по темам.',
      img: '07_Hadith_Encyclopedia.jpg',
      alt: 'Хадисы Сахих аль Бухари и Муслим'
    },
    {
      title: '🎯 Планировщик хатма и ежедневное чтение',
      desc: 'Интеллектуальная система, помогающая прочитать весь Коран за 30 или 60 дней с напоминаниями и шкалой прогресса.',
      img: '09_Khatma_Plan_Tracker.jpg',
      alt: 'Планировщик хатма Корана'
    },
    {
      title: '🎨 Правила таджвида с цветовой разметкой',
      desc: 'Цветовое выделение правил таджвида (мадд, гунна, калькаля, идгам), позволяющее читать Коран правильно и нараспев.',
      img: '15_Tajweed_Rules_Colors.jpg',
      alt: 'Цветной таджвид правила чтения Корана'
    },
    {
      title: '📍 Карта ближайших мечетей',
      desc: 'Быстрый поиск мечетей рядом с вашим текущим местоположением с указанием точного расстояния и маршрута на карте.',
      img: '12_Nearby_Mosques_Map.jpg',
      alt: 'Ближайшие мечети на карте'
    }
  ],
  midCtaHeading: 'Установите приложение Дия аль-Коран прямо сейчас',
  midCtaDesc: 'Приложение доступно бесплатно в Google Play для всех смартфонов и планшетов на базе Android.',
  midCtaBtnText: 'Установить Дия аль-Коран в Google Play',
  specsHeading: 'Технические характеристики приложения Дия аль-Коран',
  specs: [
    { key: 'Официальное название', val: 'Дия аль-Коран без интернета (ضياء القرآن الكريم)' },
    { key: 'Имя пакета (Package Name)', val: PACKAGE_NAME },
    { key: 'Поддерживаемая версия Android', val: 'Android 6.0 (Marshmallow) и выше' },
    { key: 'Категория в Google Play', val: 'Книги и справочники / Исламский образ жизни' },
    { key: 'Оффлайн режим', val: '✅ 100% Поддержка работы без интернета' },
    { key: 'Языки приложения', val: 'Русский, Арабский, Английский, Турецкий, Урду и другие' },
    { key: 'Стоимость', val: 'Бесплатно (Без скрытых платежей и подписок)' },
    { key: 'Файл верификации (app-ads.txt)', val: APP_ADS_TXT_SNIPPET, isLink: true, href: '/app-ads.txt' }
  ],
  stepsHeading: 'Простые шаги для установки и начала использования:',
  steps: [
    `Нажмите на кнопку <a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 700;">Скачать в Google Play</a>.`,
    'Нажмите кнопку <strong>Установить</strong> и дождитесь быстрой загрузки.',
    'Откройте приложение и разрешите доступ к местоположению для автоматической настройки точного времени намаза и направления Киблы.',
    'Выберите любимого чтеца и настройте цель чтения, чтобы наполнить каждый день благодатью.'
  ],
  faqHeading: 'Часто задаваемые вопросы (FAQ):',
  faqs: [
    {
      question: 'Действительно ли текст Корана доступен полностью без интернета?',
      answer: 'Да, весь арабский текст Корана, перевод смыслов, азкары и компас Киблы встроены в приложение и доступны оффлайн в любое время.'
    },
    {
      question: 'Соответствует ли расписание намаза нормам ДУМ РФ и других муфтиятов?',
      answer: 'Да, приложение поддерживает методы расчета Всемирной исламской лиги, ДУМ РФ, ДУМК, а также турецкого Diyanet.'
    },
    {
      question: 'Помогает ли приложение заучивать Коран наизусть?',
      answer: 'Да, приложение имеет функцию многократного повторения аята, режим скрытия аятов для самопроверки и аудио зацикливание для хафизов.'
    }
  ],
  finalCtaHeading: 'Присоединяйтесь к тысячам верующих уже сегодня',
  finalCtaDesc: 'Сделайте ваш телефон источником духовного света и постоянного поминания Аллаха. Скачайте приложение Дия аль-Коран бесплатно и поделитесь им с близкими.',
  finalCtaBtnText: 'Скачать Дия аль-Коран в Google Play'
};

// 8. PERSIAN / FARSI
const faConfig = {
  locale: 'fa',
  slug: 'quran-karim-app-offline-features-download',
  title: 'دانلود برنامه ضیاء قرآن کریم کامل بدون اینترنت: تلاوت صوتی، اوقات شرعی، قبله‌نما ۳ بعدی و ادعیه روزانه',
  summary: 'بررسی جامع برنامه اندروید ضیاء قرآن کریم بدون نت (ضياء القرآن الكريم). شامل خط زیبای عثمان طه، صوت دلنشین قاریان مشهور، اوقات شرعی اذان‌گو، قبله نمای ۳ بعدی و تعقیبات نماز.',
  publishedAt: '2026-09-08',
  canonical: 'https://jobs-in-istanbul.com/fa/blog/quran-karim-app-offline-features-download',
  isRtl: true,
  appName: 'ضیاء قرآن کریم بدون اینترنت',
  appBadgeTop: '✨ جامع‌ترین اپلیکیشن اسلامی اندروید در سال ۲۰۲۶',
  appHeaderTitle: 'برنامه ضیاء قرآن کریم بدون اینترنت — همراه معنوی روزانه شما',
  appHeaderDesc: 'مصحف شریف با خط عثمان طه، اوقات شرعی دقیق، ادعیه و اذکار روزانه، قبله‌نمای ۳ بعدی و صوت قاریان برجسته',
  badges: {
    rating: '4.9 / 5.0',
    android: 'Android 6.0+',
    offline: '۱۰۰٪ فعال بدون نیاز به اینترنت',
    free: 'کاملاً رایگان'
  },
  downloadBtnText: 'دانلود رایگان برنامه ضیاء قرآن از گوگل پلی',
  bannerAlt: 'برنامه ضیاء قرآن کریم بدون اینترنت با تلاوت صوتی و اوقات شرعی',
  bannerCaption: 'برنامه ضیاء قرآن کریم (Diya Holy Quran): تلاوت قرآن، اوقات شرعی، ادعیه و قبله‌نمای دقیق',
  introParagraph: 'در دنیای پرمشغله امروز، دسترسی همیشگی به قرآن کریم و انجام منظم عبادات بدون نیاز به اینترنت، نعمتی بزرگ برای هر مسلمان است. <strong>برنامه ضیاء قرآن کریم بدون اینترنت (Diya Holy Quran Offline)</strong> تجربه‌ای ناب و معنوی را بر روی گوشی‌های اندروید به ارمغان می‌آورد. این برنامه با رعایت دقیق‌ترین استانداردهای نرم‌افزاری، متن کامل مصحف عثمان طه، تلاوت قاریان بزرگ، اوقات شرعی دقیق و قبله‌نمای هوشمند را در محیطی زیبا و رایگان فراهم کرده است.',
  whyChooseHeading: 'چرا ضیاء قرآن کریم انتخاب اول میلیون‌ها کاربر است؟',
  whyChooseDesc: 'این برنامه با طراحی مدرن، سرعت اجرای بالا و بدون تبلیغات آزاردهنده طراحی شده است. از مهم‌ترین امکانات آن می‌توان به موارد زیر اشاره کرد:',
  features: [
    {
      title: '📖 مصحف شریف با خط عثمان طه',
      desc: 'صفحات کاملاً منطبق با مصحف مدینه منوره با خط واضح و خوانا، حالت شب، امکان تغییر اندازه متن و نشانه‌گذاری خودکار آخرین آیه.',
      img: '02_Quran_Mushaf_Reading.jpg',
      alt: 'قرائت مصحف شریف در برنامه ضیاء قرآن'
    },
    {
      title: '🕌 اوقات شرعی دقیق و هشدار اذان',
      desc: 'محاسبه دقیق اوقات شرعی در استانبول، تهران، کابل و تمام شهرهای جهان با قابلیت پخش نوای اذان و دعاهای پس از نماز.',
      img: '03_Prayer_Times_Schedule.jpg',
      alt: 'اوقات شرعی و پخش اذان'
    },
    {
      title: '🧭 قبله‌نمای سه بعدی هوشمند',
      desc: 'تشخیص فوری و دقیق جهت کعبه معظمه در هر نقطه از جهان با بهره‌گیری از سنسور قطب‌نما و جی‌پی‌اس موبایل.',
      img: '04_Qibla_Compass_3D.jpg',
      alt: 'قبله نمای سه بعدی هوشمند'
    },
    {
      title: '🎧 تلاوت صوتی قاریان نامدار جهان اسلام',
      desc: 'استماع دلنشین صوت استاد عبدالباسط، منشاوی، مشاری العفاسی، معریقلی و سدیس به صورت آفلاین با پخش در پس‌زمینه.',
      img: '05_Recitation_Audio_Player.jpg',
      alt: 'تلاوت صوتی قرآن با صدای قاریان'
    },
    {
      title: '📿 ادعیه منتخب و صلوات‌شمار دیجیتال',
      desc: 'اذکار صبح و شام، دعاهای روزانه، تعقیبات نماز و ذکرشمار هوشمند دیجیتال با لرزش لمسی.',
      img: '06_Hisn_Muslim_Azkar.jpg',
      alt: 'ادعیه و صلوات شمار دیجیتال'
    },
    {
      title: '📜 دانشنامه احادیث نبوی',
      desc: 'مجموعه‌ای ارزشمند از احادیث صحیح بخاری و مسلم و ریاض الصالحین با دسته‌بندی موضوعی کاربردی.',
      img: '07_Hadith_Encyclopedia.jpg',
      alt: 'دانشنامه احادیث پیامبر اکرم'
    },
    {
      title: '🎯 برنامه ختم قرآن و ردیاب روزانه',
      desc: 'سیستم هوشمند برای ختم کامل قرآن در ۳۰ یا ۶۰ روز به همراه اعلان‌های یادآوری منظم و نمودار پیشرفت.',
      img: '09_Khatma_Plan_Tracker.jpg',
      alt: 'برنامه ختم قرآن کریم'
    },
    {
      title: '🎨 احکام تجوید رنگی',
      desc: 'تفکیک بصری و رنگی قواعد تجوید از جمله مد، غنه، قلقله و ادغام جهت تلاوت صحیح و فصیح آیات نورانی.',
      img: '15_Tajweed_Rules_Colors.jpg',
      alt: 'آموزش احکام تجوید رنگی'
    },
    {
      title: '📍 نقشه مساجد نزدیک',
      desc: 'یافتن نزدیک‌ترین مساجد به موقعیت فعلی شما به همراه فاصله دقیق و مسیریابی سریع روی نقشه.',
      img: '12_Nearby_Mosques_Map.jpg',
      alt: 'نقشه مساجد نزدیک'
    }
  ],
  midCtaHeading: 'همین حالا برنامه ضیاء قرآن را از گوگل پلی دانلود کنید',
  midCtaDesc: 'به صورت رایگان برای تمامی گوشی‌ها و تبلت‌های اندروید بدون هیچ‌گونه هزینه اضافی در دسترس است.',
  midCtaBtnText: 'نصب برنامه ضیاء قرآن از گوگل پلی',
  specsHeading: 'مشخصات فنی برنامه ضیاء قرآن کریم',
  specs: [
    { key: 'نام رسمی برنامه', val: 'ضیاء قرآن کریم بدون اینترنت (Diya Holy Quran)' },
    { key: 'نام بسته (Package Name)', val: PACKAGE_NAME },
    { key: 'اندروید مورد نیاز', val: 'Android 6.0 به بالا' },
    { key: 'دسته‌بندی در گوگل پلی', val: 'کتاب‌ها و منابع / سبک زندگی اسلامی' },
    { key: 'قابلیت استفاده آفلاین', val: '✅ ۱۰۰٪ بدون نیاز به اینترنت' },
    { key: 'زبان‌های برنامه', val: 'فارسی، عربی، انگلیسی، ترکی، اردو و غیره' },
    { key: 'قیمت برنامه', val: 'کاملاً رایگان (بدون هزینه اشتراک)' },
    { key: 'فایل تایید رسمی (app-ads.txt)', val: APP_ADS_TXT_SNIPPET, isLink: true, href: '/app-ads.txt' }
  ],
  stepsHeading: 'مراحل ساده دانلود و راه‌اندازی برنامه:',
  steps: [
    `روی دکمه <a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 700;">دانلود از گوگل پلی</a> کلیک کنید.`,
    'گزینه <strong>Install</strong> را بزنید و منتظر دانلود سریع برنامه بمانید.',
    'برنامه را باز کرده و برای تنظیم خودکار اوقات شرعی و قبله، دسترسی موقعیت مکانی را تایید کنید.',
    'قاری مورد علاقه و برنامه روزانه تلاوت خود را برگزینید و از آرامش کلام الهی بهره‌مند شوید.'
  ],
  faqHeading: 'پرسش‌های متداول (FAQ):',
  faqs: [
    {
      question: 'آیا برای خواندن قرآن به اینترنت نیاز است؟',
      answer: 'خیر، کل متن قرآن کریم، ادعیه و قبله‌نما کاملاً آفلاین هستند و بدون مصرف بسته اینترنت کار می‌کنند.'
    },
    {
      question: 'آیا اوقات شرعی با مراجع رسمی همخوانی دارد؟',
      answer: 'بله، روش‌های محاسباتی دانشگاه تهران، مجمع جهانی اسلامی و مراکز معتبر جهانی در برنامه گنجانده شده است.'
    },
    {
      question: 'آیا برنامه برای حفظ قرآن مناسب است؟',
      answer: 'بله، امکان تکرار چندباره آیات و مخفی کردن متن جهت آزمون حفظ، کمکی شایان به حفاظ محترم قرآن می‌کند.'
    }
  ],
  finalCtaHeading: 'امروز به جمع هزاران کاربر برنامه ضیاء قرآن بپیوندید',
  finalCtaDesc: 'گوشی خود را به نور قرآن و ذکر خداوند منور سازید. برنامه ضیاء قرآن کریم را هم‌اکنون دانلود کنید و برای بهره‌مندی از ثواب جاریه با عزیزان خود به اشتراک بگذارید.',
  finalCtaBtnText: 'دانلود برنامه ضیاء قرآن از گوگل پلی'
};

// 9. BENGALI
const bnConfig = {
  locale: 'bn',
  slug: 'quran-karim-app-offline-features-download',
  title: 'দিয়া আল-কুরআনুল কারীম অফলাইন অ্যাপ ডাউনলোড (Android): সম্পূর্ণ কুরআন, নামাজের সময়সূচী, কিবলা ৩ডি এবং অডিও তিলাওয়াত',
  summary: 'অ্যান্ড্রয়েডের জন্য দিয়া আল-কুরআনুল কারীম (ضياء القرآن الكريم) সম্পূর্ণ অফলাইন অ্যাপ রিভিউ। মূল উসমানী লিপি, বিখ্যাত ক্বারীগণের অডিও তিলাওয়াত, সঠিক নামাজের সময়, ৩ডি কিবলা এবং হিসনুল মুসলিম দোয়া।',
  publishedAt: '2026-09-08',
  canonical: 'https://jobs-in-istanbul.com/bn/blog/quran-karim-app-offline-features-download',
  isRtl: false,
  appName: 'দিয়া আল-কুরআনুল কারীম অফলাইন',
  appBadgeTop: '✨ ২০২৬ সালের সেরা ও সম্পূর্ণ ইসলামিক অ্যান্ড্রয়েড অ্যাপ',
  appHeaderTitle: 'দিয়া আল-কুরআনুল কারীম অফলাইন অ্যাপ — আপনার প্রতিদিনের আধ্যাত্মিক সঙ্গী',
  appHeaderDesc: 'নূরানী উসমানী হরফ, নামাজের সঠিক ওয়াক্ত ও আজানের অ্যালার্ম, হিসনুল মুসলিম দোয়া, ৩ডি কিবলা এবং সুমধুর অডিও তিলাওয়াত',
  badges: {
    rating: '4.9 / 5.0',
    android: 'Android 6.0+',
    offline: '১০০% ইন্টারনেট ছাড়া ব্যবহারযোগ্য',
    free: 'সম্পূর্ণ বিনামূল্যে'
  },
  downloadBtnText: 'গুগল প্লে থেকে দিয়া কুরআন অ্যাপটি বিনামূল্যে ডাউনলোড করুন',
  bannerAlt: 'দিয়া আল কুরআনুল কারীম অফলাইন অ্যান্ড্রয়েড অ্যাপ্লিকেশন',
  bannerCaption: 'দিয়া আল-কুরআনুল কারীম (Diya Holy Quran): পবিত্র কুরআন পাঠ, অডিও তিলাওয়াত, নামাজের সঠিক সময় এবং নির্ভুল কিবলা কম্পাস',
  introParagraph: 'প্রতিটি মুসলিমের দৈনন্দিন জীবনে এমন একটি ইসলামিক অ্যাপ প্রয়োজন যা ইন্টারনেট সংযোগ ছাড়াই সম্পূর্ণ কুরআন পাঠ এবং ইবাদতের সব সুবিধা দেয়। <strong>দিয়া আল-কুরআনুল কারীম অফলাইন অ্যাপ (ضياء القرآن الكريم بدون إنترنت)</strong> অ্যান্ড্রয়েড ব্যবহারকারীদের জন্য এনেছে এক অনন্য আধ্যাত্মিক অভিজ্ঞতা। মদিনা শরীফের মূল উসমানী হরফে কুরআন পাঠ, বিশ্ববিখ্যাত ক্বারীগণের তিলাওয়াত, নামাজের সঠিক সময়সূচী এবং ৩ডি কিবলা কম্পাস—সব মিলবে এক অ্যাপে।',
  whyChooseHeading: 'কেন দিয়া আল-কুরআনুল কারীম লাখ লাখ মুসলিমের প্রথম পছন্দ?',
  whyChooseDesc: 'আধুনিক ডিজাইন, দ্রুত গতি এবং কোনো ধরণের বিরক্তিকর বিজ্ঞাপন ছাড়াই তৈরি করা হয়েছে এই অ্যাপটি। এর প্রধান বৈশিষ্ট্যসমূহ:',
  features: [
    {
      title: '📖 মূল উসমানী হরফে পবিত্র কুরআন',
      desc: 'মদিনা শরীফের মুসহাফের অনুরূপ স্পষ্ট ও চোখের জন্য আরামদায়ক হরফ, নাইট মোড, হরফের আকার পরিবর্তন এবং অটো বুকমার্কিং সুবিধা।',
      img: '02_Quran_Mushaf_Reading.jpg',
      alt: 'পবিত্র কুরআন তিলাওয়াত দিয়া কুরআন অ্যাপ'
    },
    {
      title: '🕌 নামাজের সঠিক সময় ও আজানের অ্যালার্ম',
      desc: 'ঢাকা, ইস্তাম্বুল, মক্কা এবং বিশ্বের যেকোনো শহরের জন্য ইসলামিক ফাউন্ডেশন ও আন্তর্জাতিক নির্ভরযোগ্য পদ্ধতিতে নামাজের সঠিক সময় ও আজান।',
      img: '03_Prayer_Times_Schedule.jpg',
      alt: 'নামাজের সঠিক সময়সূচী এবং আজান'
    },
    {
      title: '🧭 ৩ডি কিবলা কম্পাস ও দিক নির্ণয়',
      desc: 'আপনার মোবাইলের কম্পাস ও জিপিএস সেন্সরের মাধ্যমে কাবা শরীফের সঠিক দিক তাৎক্ষণিকভাবে নির্ণয় করুন যেকোনো স্থানে।',
      img: '04_Qibla_Compass_3D.jpg',
      alt: '৩ডি কিবলা কম্পাস কাবা দিক'
    },
    {
      title: '🎧 বিশ্বখ্যাত ক্বারীগণের সুমধুর অডিও',
      desc: 'ক্বারী আব্দুল বাসেত, মিনশাবী, মিশারী আল-আফাসী, ও আস-সুদাইসের কণ্ঠে সুমধুর তিলাওয়াত অফলাইনে শুনুন এবং পুনরাবৃত্তি করুন।',
      img: '05_Recitation_Audio_Player.jpg',
      alt: 'অডিও তিলাওয়াত বিখ্যাত ক্বারীগণ'
    },
    {
      title: '📿 হিসনুল মুসলিম দোয়া ও ডিজিটাল তাসবীহ',
      desc: 'সকাল-সন্ধ্যার জিকির, ঘুমের দোয়া, বিপদ মুক্তির দোয়া এবং ভাইব্রেশন সুবিধা সহ স্মার্ট ডিজিটাল তাসবীহ কাউন্টার।',
      img: '06_Hisn_Muslim_Azkar.jpg',
      alt: 'হিসনুল মুসলিম প্রতিদিনের দোয়া ও তাসবীহ'
    },
    {
      title: '📜 হাদিস শরীফ বিশ্বকোষ',
      desc: 'সহীহ বুখারী, সহীহ মুসলিম এবং রিয়াযুস স্বা Planিহীন থেকে নির্বাচিত সহীহ হাদিসসমূহের সংগ্রহ ও বিষয়ভিত্তিক সার্চ।',
      img: '07_Hadith_Encyclopedia.jpg',
      alt: 'সহীহ হাদিস বিশ্বকোষ বুখারী মুসলিম'
    },
    {
      title: '🎯 খতম কুরআন ট্র্যাকার ও পড়ার রুটিন',
      desc: '৩০ বা ৬০ দিনে সম্পূর্ণ কুরআন খতম করার স্মার্ট শিডিউল প্ল্যানার যা প্রতিদিনের পড়ার অংশ মনে করিয়ে দেয়।',
      img: '09_Khatma_Plan_Tracker.jpg',
      alt: 'কুরআন খতম প্ল্যানার ও ট্র্যাকার'
    },
    {
      title: '🎨 রঙিন তাজবীদ নিয়মাবলী',
      desc: 'মদ্দ, গুন্নাহ, ক্বলক্বলাহর মতো তাজবীদ নিয়মাবলী রঙিন হরফে চিহ্নিত করা হয়েছে যাতে সহীহ ও শুদ্ধভাবে তিলাওয়াত করা যায়।',
      img: '15_Tajweed_Rules_Colors.jpg',
      alt: 'রঙিন তাজবীদ নিয়মাবলী'
    },
    {
      title: '📍 নিকটস্থ মসজিদের মানচিত্র',
      desc: 'আপনার অবস্থান থেকে সবচেয়ে কাছের মসজিদগুলোর দূরত্ব এবং ম্যাপে সঠিক রাস্তা নির্দেশনা।',
      img: '12_Nearby_Mosques_Map.jpg',
      alt: 'নিকটস্থ মসজিদের লোকেশন ম্যাপ'
    }
  ],
  midCtaHeading: 'আজই দিয়া আল-কুরআনুল কারীম অ্যাপটি গুগল প্লে থেকে ইন্সটল করুন',
  midCtaDesc: 'অ্যান্ড্রয়েড ফোন এবং ট্যাবলেটের জন্য সম্পূর্ণ বিনামূল্যে উপলব্ধ। নিজের ও পরিবারের জন্য এক অফুরন্ত কল্যাণের মাধ্যম।',
  midCtaBtnText: 'গুগল প্লে স্টোরে দিয়া কুরআন অ্যাপটি দেখুন',
  specsHeading: 'দিয়া আল-কুরআনুল কারীম অ্যাপের প্রযুক্তিগত বিবরণ',
  specs: [
    { key: 'অ্যাপের অফিশিয়াল নাম', val: 'দিয়া আল-কুরআনুল কারীম অফলাইন (Diya Holy Quran)' },
    { key: 'প্যাকেজের নাম (Package Name)', val: PACKAGE_NAME },
    { key: 'প্রয়োজনীয় অ্যান্ড্রয়েড সংস্করণ', val: 'Android 6.0 বা তার পরবর্তী' },
    { key: 'প্লে স্টোর বিভাগ', val: 'বই ও রেফারেন্স / ইসলামিক জীবনধারা' },
    { key: 'অফলাইন ব্যবহার সুবিধা', val: '✅ ১০০% ইন্টারনেট সংযোগ ছাড়া কার্যকর' },
    { key: 'সমর্থিত ভাষাসমূহ', val: 'বাংলা, আরবি, ইংরেজি, তুর্কি, উর্দু এবং অন্যান্য' },
    { key: 'মূল্য', val: 'সম্পূর্ণ বিনামূল্যে (কোনো ফি নেই)' },
    { key: 'অফিশিয়াল ভেরিফিকেশন ফাইল', val: APP_ADS_TXT_SNIPPET, isLink: true, href: '/app-ads.txt' }
  ],
  stepsHeading: 'অ্যাপটি সহজে ডাউনলোড ও ব্যবহারের নিয়মাবলী:',
  steps: [
    `<a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 700;">Google Play থেকে ডাউনলোড</a> বাটনে ক্লিক করুন।`,
    '<strong>Install</strong> বাটনে চাপ দিন এবং দ্রুত ডাউনলোড শেষ হওয়া পর্যন্ত অপেক্ষা করুন।',
    'অ্যাপটি খুলুন এবং নামাজের সময় ও কিবলার সঠিক দিকের জন্য লোকেশন পারমিশন দিন।',
    'আপনার প্রিয় ক্বারীর তিলাওয়াত নির্বাচন করুন এবং বরকতময় কুরআন পাঠ শুরু করুন।'
  ],
  faqHeading: 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ):',
  faqs: [
    {
      question: 'দিয়া কুরআন অ্যাপ কি সত্যিই সম্পূর্ণ ইন্টারনেট ছাড়া চলে?',
      answer: 'হ্যাঁ, কুরআনের মূল হরফ, দোয়া, কিবলা কম্পাস এবং নামাজের ওয়াক্ত কোনো ইন্টারনেট ডাটা ছাড়াই ১০০% অফলাইনে কাজ করে।'
    },
    {
      question: 'নামাজের সময়সূচী কি ইসলামিক ফাউন্ডেশন বাংলাদেশের সাথে মিলে?',
      answer: 'হ্যাঁ, এতে বিশ্বস্ত আন্তর্জাতিক ও স্থানীয় গণনার পদ্ধতি রয়েছে যা সঠিক নামাজের ওয়াক্ত ও আজানের সময় প্রদর্শন করে।'
    },
    {
      question: 'কুরআন হিফজ বা মুখস্থ করার ক্ষেত্রে এই অ্যাপ কীভাবে সাহায্য করে?',
      answer: 'আয়াত পুনরাবৃত্তি, আয়াত লুকিয়ে নিজেকে যাচাই করা এবং তিলাওয়াত লুপ করার বিশেষ হিফজ টুলস এতে রয়েছে।'
    }
  ],
  finalCtaHeading: 'আজই হাজার হাজার সন্তুষ্ট ব্যবহারকারীদের সাথে যুক্ত হোন',
  finalCtaDesc: 'আপনার মোবাইলকে কুরআন ও আল্লাহর জিকিরের বরকতময় উৎসে রূপান্তর করুন। আজই বিনামূল্যে ডাউনলোড করুন এবং প্রিয়জনদের সাথে সদকায়ে জারিয়া হিসেবে শেয়ার করুন।',
  finalCtaBtnText: 'দিয়া কুরআন অ্যাপটি Google Play থেকে ডাউনলোড করুন'
};

// 10. GERMAN
const deConfig = {
  locale: 'de',
  slug: 'quran-karim-app-offline-features-download',
  title: 'Diya Heiliger Koran App ohne Internet herunterladen (Android): Audio-Rezitationen, Gebetszeiten, Azkar & 3D Qibla-Kompass',
  summary: 'Umfassender Testbericht der Android-App Diya Heiliger Koran ohne Internet (ضياء القرآن الكريم). Enthält Uthmani-Kalligraphie, weltbekannte Rezitatoren, verifizierte Gebetszeiten, 3D Qibla-Kompass und Hisnul Muslim.',
  publishedAt: '2026-09-08',
  canonical: 'https://jobs-in-istanbul.com/de/blog/quran-karim-app-offline-features-download',
  isRtl: false,
  appName: 'Diya Heiliger Koran ohne Internet',
  appBadgeTop: '✨ Die führende islamische Android-App für das Jahr 2026',
  appHeaderTitle: 'Diya Heiliger Koran Komplett Offline — Ihr täglicher spiritueller Begleiter',
  appHeaderDesc: 'Uthmani Mushaf, exakte Gebetszeiten, Bittgebete aus Festung des Muslims, 3D Qibla-Kompass und wunderschöne Rezitationen',
  badges: {
    rating: '4.9 / 5.0',
    android: 'Android 6.0+',
    offline: '100% Offline nutzbar',
    free: '100% Kostenlos'
  },
  downloadBtnText: 'Diya Koran kostenlos bei Google Play herunterladen',
  bannerAlt: 'Diya Heiliger Koran Android App offline mit Audio Rezitation und Gebetszeiten',
  bannerCaption: 'Diya Heiliger Koran (ضياء القرآن الكريم): Die umfassendste islamische App auf Android 2026: Koran-Lektüre, Azkar, Gebetszeiten und Qibla-Finder',
  introParagraph: 'Für Muslime in Deutschland, Österreich, der Schweiz und weltweit, die eine verlässliche, ästhetische und werbefreie islamische App ohne Internetzwang suchen, ist die <strong>Diya Heiliger Koran App (ضياء القرآن الكريم بدون إنترنت)</strong> eine hervorragende Wahl. Die App vereint den Heiligen Koran in klarer Uthmani-Kalligraphie, verifizierte Gebetszeiten, berührende Audio-Rezitationen berühmter Qaris, Bittgebete aus Festung des Muslims (Hisnul Muslim) sowie einen 3D Qibla-Kompass in einer schnellen und intuitiven Anwendung.',
  whyChooseHeading: 'Warum ist Diya Heiliger Koran die erste Wahl für Millionen?',
  whyChooseDesc: 'Dank modernster Software-Architektur bietet die Diya Koran App maximale Geschwindigkeit, augenschonendes Design und vollständige Unabhängigkeit von Datenvolumen. Hier sind die herausragenden Funktionen:',
  features: [
    {
      title: '📖 Originaler Uthmani Mushaf',
      desc: 'Kristallklare Madinah-Koran-Seiten, augenschonender Nachtmodus, flexible Schriftgrößenanpassung und automatische Lesezeichenspeicherung.',
      img: '02_Quran_Mushaf_Reading.jpg',
      alt: 'Koran lesen in der Diya Koran App'
    },
    {
      title: '🕌 Genaue Gebetszeiten & Azan-Alarm',
      desc: 'Zuverlässige Gebetszeiten für Berlin, Wien, Zürich, Istanbul und alle Städte weltweit mit akustischen Azan-Benachrichtigungen.',
      img: '03_Prayer_Times_Schedule.jpg',
      alt: 'Genaue Gebetszeiten und Azan Alarm'
    },
    {
      title: '🧭 3D Qibla-Richtungskompass',
      desc: 'Sofortige und hochpräzise Ausrichtung zur Heiligen Kaaba in Mekka mithilfe der Kompass-Sensoren und des GPS Ihres Smartphones.',
      img: '04_Qibla_Compass_3D.jpg',
      alt: '3D Qibla Kompass zur Kaaba'
    },
    {
      title: '🎧 Audio-Rezitationen berühmter Qaris',
      desc: 'Hören Sie beseelende Rezitationen von Al-Minshawi, Abdul Basit, Mishary Alafasy, Al-Muaiqly und Al-Sudais im Offline- und Hintergrundmodus.',
      img: '05_Recitation_Audio_Player.jpg',
      alt: 'Audio Koran Rezitationen bekannter Rezitatoren'
    },
    {
      title: '📿 Festung des Muslims & Digitaler Tasbih',
      desc: 'Morgen- und Abend-Azkar, Bittgebete für den Alltag, Schutzsuren sowie ein praktischer digitaler Tasbih-Zähler mit Vibrations-Feedback.',
      img: '06_Hisn_Muslim_Azkar.jpg',
      alt: 'Festung des Muslims Bittgebete und Tasbih'
    },
    {
      title: '📜 Hadith-Enzyklopädie',
      desc: 'Sammlung authentischer Hadithe aus Sahih al-Bukhari, Sahih Muslim und Riyad as-Salihin thematisch sortiert.',
      img: '07_Hadith_Encyclopedia.jpg',
      alt: 'Hadith Enzyklopädie Buchari und Muslim'
    },
    {
      title: '🎯 Khatma-Planer & Tägliches Lesepensum',
      desc: 'Intelligentes Planungssystem, das Ihnen hilft, den Koran in 30 oder 60 Tagen vollständig zu lesen, mit täglichen Erinnerungen.',
      img: '09_Khatma_Plan_Tracker.jpg',
      alt: 'Koran Khatma Planer und Tracker'
    },
    {
      title: '🎨 Farbkodierte Tajweed-Regeln',
      desc: 'Visuelle Hervorhebung der Tajweed-Regeln (Verlängerung, Nasallaut, Qalqala, Idgham) für eine fehlerfreie und melodische Rezitation.',
      img: '15_Tajweed_Rules_Colors.jpg',
      alt: 'Farbige Tajweed Regeln im Koran'
    },
    {
      title: '📍 Moscheen in der Nähe',
      desc: 'Findet die nächstgelegenen Moscheen und Freitagsgebetsorte in Ihrer Umgebung mit Entfernungsangabe und Wegbeschreibung.',
      img: '12_Nearby_Mosques_Map.jpg',
      alt: 'Moscheen in der Nähe Finder'
    }
  ],
  midCtaHeading: 'Laden Sie die Diya Koran App jetzt bei Google Play herunter',
  midCtaDesc: 'Kostenlos im Google Play Store für alle Android-Smartphones und Tablets erhältlich.',
  midCtaBtnText: 'Diya Heiliger Koran kostenlos installieren',
  specsHeading: 'Technische Daten der Diya Heiliger Koran App',
  specs: [
    { key: 'Offizieller App-Name', val: 'Diya Heiliger Koran ohne Internet (ضياء القرآن الكريم)' },
    { key: 'Paketname (Package Name)', val: PACKAGE_NAME },
    { key: 'Unterstützte Android-Version', val: 'Android 6.0 (Marshmallow) und höher' },
    { key: 'Store-Kategorie', val: 'Bücher & Nachschlagewerke / Islamischer Lebensstil' },
    { key: 'Offline-Funktionalität', val: '✅ 100% Offline-Betrieb unterstützt' },
    { key: 'Unterstützte Sprachen', val: 'Deutsch, Arabisch, Englisch, Türkisch, Urdu und weitere' },
    { key: 'Preis', val: '100% Kostenlos (Keine Abos oder versteckten Kosten)' },
    { key: 'Offizielle Verifizierung (app-ads.txt)', val: APP_ADS_TXT_SNIPPET, isLink: true, href: '/app-ads.txt' }
  ],
  stepsHeading: 'Einfache Schritte zum Herunterladen und Starten:',
  steps: [
    `Klicken Sie auf den Button <a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 700;">Bei Google Play herunterladen</a>.`,
    'Tippen Sie auf <strong>Installieren</strong> und warten Sie auf den schnellen Download.',
    'Öffnen Sie die App und gewähren Sie die Standortberechtigung zur automatischen Ermittlung der Gebetszeiten und der Qibla-Richtung.',
    'Wählen Sie Ihren Lieblingsrezitator und beginnen Sie Ihre tägliche Lesereise voller Segen.'
  ],
  faqHeading: 'Häufig gestellte Fragen (FAQ):',
  faqs: [
    {
      question: 'Funktioniert die Diya Koran App wirklich ohne Internetverbindung?',
      answer: 'Ja, der vollständige arabische Text, die Übersetzungen, tägliche Bittgebete und der Qibla-Kompass sind fest in der App integriert und funktionieren vollständig offline.'
    },
    {
      question: 'Stimmen die Gebetszeiten mit den Moscheen in Deutschland überein?',
      answer: 'Ja, die App unterstützt alle international anerkannten Berechnungsmethoden einschließlich Diyanet (DITIB), Islamische Weltliga (MWL) und IGMG.'
    },
    {
      question: 'Eignet sich die App zum Auswendiglernen (Hifz) des Korans?',
      answer: 'Ja, mit Funktionen wie Vers-Wiederholungen, Vers-Ausblendung zur Selbstkontrolle und Audio-Schleifen ist sie ideal für Koran-Schüler.'
    }
  ],
  finalCtaHeading: 'Schließen Sie sich heute Tausenden zufriedenen Nutzern an',
  finalCtaDesc: 'Machen Sie Ihr Smartphone zu einer Quelle des Friedens und des Segens. Laden Sie Diya Heiliger Koran jetzt herunter und teilen Sie diese Wohltat mit Familie und Freunden.',
  finalCtaBtnText: 'Diya Koran bei Google Play herunterladen'
};

const allConfigs = [
  { varName: 'quranAppArticleAr', cfg: arConfig },
  { varName: 'quranAppArticleEn', cfg: enConfig },
  { varName: 'quranAppArticleTr', cfg: trConfig },
  { varName: 'quranAppArticleUr', cfg: urConfig },
  { varName: 'quranAppArticleId', cfg: idConfig },
  { varName: 'quranAppArticleFr', cfg: frConfig },
  { varName: 'quranAppArticleRu', cfg: ruConfig },
  { varName: 'quranAppArticleFa', cfg: faConfig },
  { varName: 'quranAppArticleBn', cfg: bnConfig },
  { varName: 'quranAppArticleDe', cfg: deConfig }
];

let fileContent = `/**
 * Quran Kareem Android App Article Data
 * SEO-Optimized multi-language article for Google Play App
 * Official Name: ضياء القرآن الكريم بدون إنترنت (Diya Holy Quran Offline)
 * Package: com.quran.karim.kamel.bidon.net.murtal.tilaat.smart
 */

const GOOGLE_PLAY_URL = '${GOOGLE_PLAY_URL}';

`;

for (const item of allConfigs) {
  const html = generateHtml(item.cfg);
  fileContent += `export const ${item.varName} = {
  title: ${JSON.stringify(item.cfg.title)},
  slug: ${JSON.stringify(item.cfg.slug)},
  summary: ${JSON.stringify(item.cfg.summary)},
  publishedAt: ${JSON.stringify(item.cfg.publishedAt)},
  canonical: ${JSON.stringify(item.cfg.canonical)},
  faqs: ${JSON.stringify(item.cfg.faqs, null, 4)},
  content: \`${html.replace(/`/g, '\\`')}\`
};

`;
}

const targetPath = path.resolve('src/data/quran-app-article.ts');
fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log('✓ Successfully written 10 language articles to', targetPath);
