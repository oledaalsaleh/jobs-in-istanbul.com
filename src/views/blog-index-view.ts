/**
 * Professional magazine-style Career Blog index view (/:locale/blog).
 *
 * Layout: immersive hero (search + stats) -> category filter chips ->
 * featured story + editor's picks -> free tools strip -> latest articles grid
 * (with sponsored jobs row, client-side search/filter and progressive "load more")
 * -> Telegram / app CTA. Includes Blog + BlogPosting JSON-LD.
 *
 * All articles are server-rendered (crawlable); JS only enhances filtering/paging.
 */

export interface BlogIndexCard {
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  image: string;
  readingTime: string;
  category: { name: string; color: string };
}

export interface BlogIndexOptions {
  locale: string;
  cards: BlogIndexCard[];
  t: { title: string; subtitle: string; readMore: string; featured: string };
  adLabels: {
    sectionTitle: string;
    badge: string;
    browseAll: string;
    apply: string;
    roles: Array<{ title: string; company: string; type: string; salary: string }>;
  };
}

const SITE_URL = 'https://jobs-in-istanbul.com';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.jobsistanbul.app';
const PAGE_SIZE = 9;
const PICKS_COUNT = 3;

const UI: Record<string, any> = {
  ar: {
    eyebrow: 'الدليل المهني للعرب والأجانب في تركيا',
    search: 'ابحث في المقالات: إقامة العمل، الرواتب، السكن...',
    searchBtn: 'بحث',
    all: 'كل المقالات',
    statArticles: 'مقال متخصص',
    statCategories: 'تصنيف',
    statLangs: 'لغات',
    statUpdated: 'محدّث لعام 2026',
    picks: 'اختيارات المحرر',
    latest: 'أحدث المقالات',
    latestSub: 'أدلة عملية ومحدثة تساعدك على العمل والعيش في إسطنبول',
    articles: 'مقال',
    empty: 'لا توجد مقالات مطابقة لبحثك',
    emptyHint: 'جرّب كلمة أخرى أو اختر تصنيفاً مختلفاً',
    reset: 'عرض كل المقالات',
    more: 'عرض المزيد من المقالات',
    author: 'فريق تحرير فرص عمل في إسطنبول',
    toolsTitle: 'أدوات مجانية تكمّل قراءتك',
    sponsored: 'إعلان',
    ctaTitle: 'لا تفوّت أي وظيفة أو دليل جديد',
    ctaSub: 'انضم إلى قناتنا على تلغرام لتصلك الوظائف الجديدة والأدلة المهنية فور نشرها، أو حمّل التطبيق الرسمي.',
    ctaTg: 'انضم لقناة التلغرام',
    ctaApp: 'حمّل التطبيق',
    tools: [
      { href: 'kidem-tazminati-hesaplama', icon: 'fa-scale-balanced', color: '#059669', title: 'حاسبة تعويض نهاية الخدمة', sub: 'Kıdem & İhbar 2026' },
      { href: 'salary-calculator-2026', icon: 'fa-calculator', color: '#ec4899', title: 'حاسبة صافي الراتب', sub: 'ضرائب و SGK 2026' },
      { href: 'work-permit-eligibility', icon: 'fa-passport', color: '#2563eb', title: 'أهلية إذن العمل', sub: 'اختبار فوري مجاني' },
      { href: 'kira-artis-orani', icon: 'fa-house-circle-check', color: '#f59e0b', title: 'حاسبة زيادة الإيجار', sub: 'وفق مؤشر TÜİK' }
    ]
  },
  en: {
    eyebrow: 'The career guide for expats & foreigners in Turkey',
    search: 'Search articles: work permits, salaries, housing...',
    searchBtn: 'Search',
    all: 'All articles',
    statArticles: 'expert articles',
    statCategories: 'categories',
    statLangs: 'languages',
    statUpdated: 'Updated for 2026',
    picks: "Editor's picks",
    latest: 'Latest articles',
    latestSub: 'Practical, up-to-date guides for working and living in Istanbul',
    articles: 'articles',
    empty: 'No articles match your search',
    emptyHint: 'Try another keyword or pick a different category',
    reset: 'Show all articles',
    more: 'Load more articles',
    author: 'Jobs in Istanbul Editorial',
    toolsTitle: 'Free tools to go with your reading',
    sponsored: 'Sponsored',
    ctaTitle: 'Never miss a new job or guide',
    ctaSub: 'Join our Telegram channel to get new jobs and career guides the moment they are published, or install the official app.',
    ctaTg: 'Join Telegram',
    ctaApp: 'Get the app',
    tools: [
      { href: 'kidem-tazminati-hesaplama', icon: 'fa-scale-balanced', color: '#059669', title: 'Severance pay calculator', sub: 'Kıdem & İhbar 2026' },
      { href: 'salary-calculator-2026', icon: 'fa-calculator', color: '#ec4899', title: 'Net salary calculator', sub: 'Tax & SGK 2026' },
      { href: 'work-permit-eligibility', icon: 'fa-passport', color: '#2563eb', title: 'Work permit eligibility', sub: 'Free instant check' },
      { href: 'kira-artis-orani', icon: 'fa-house-circle-check', color: '#f59e0b', title: 'Rent increase calculator', sub: 'Official TÜİK rate' }
    ]
  },
  tr: {
    eyebrow: 'Türkiye\'deki yabancılar için kariyer rehberi',
    search: 'Makalelerde ara: çalışma izni, maaşlar, konut...',
    searchBtn: 'Ara',
    all: 'Tüm yazılar',
    statArticles: 'uzman makale',
    statCategories: 'kategori',
    statLangs: 'dil',
    statUpdated: '2026 için güncel',
    picks: 'Editörün seçimleri',
    latest: 'En yeni yazılar',
    latestSub: 'İstanbul\'da çalışmak ve yaşamak için pratik ve güncel rehberler',
    articles: 'yazı',
    empty: 'Aramanızla eşleşen yazı bulunamadı',
    emptyHint: 'Başka bir kelime deneyin veya farklı bir kategori seçin',
    reset: 'Tüm yazıları göster',
    more: 'Daha fazla yazı yükle',
    author: 'İstanbul İş İlanları Editörü',
    toolsTitle: 'Okumanızı tamamlayan ücretsiz araçlar',
    sponsored: 'Sponsorlu',
    ctaTitle: 'Yeni ilan ve rehberleri kaçırmayın',
    ctaSub: 'Yeni iş ilanları ve kariyer rehberleri yayınlandığı anda size ulaşsın diye Telegram kanalımıza katılın veya resmi uygulamayı indirin.',
    ctaTg: 'Telegram\'a katıl',
    ctaApp: 'Uygulamayı indir',
    tools: [
      { href: 'kidem-tazminati-hesaplama', icon: 'fa-scale-balanced', color: '#059669', title: 'Kıdem tazminatı hesaplama', sub: 'Kıdem & İhbar 2026' },
      { href: 'salary-calculator-2026', icon: 'fa-calculator', color: '#ec4899', title: 'Net maaş hesaplama', sub: 'Vergi & SGK 2026' },
      { href: 'work-permit-eligibility', icon: 'fa-passport', color: '#2563eb', title: 'Çalışma izni uygunluğu', sub: 'Ücretsiz anında test' },
      { href: 'kira-artis-orani', icon: 'fa-house-circle-check', color: '#f59e0b', title: 'Kira artış oranı', sub: 'Resmi TÜİK oranı' }
    ]
  },
  ru: {
    eyebrow: 'Карьерный гид для иностранцев в Турции',
    search: 'Поиск: разрешение на работу, зарплаты, жильё...',
    searchBtn: 'Найти',
    all: 'Все статьи',
    statArticles: 'статей',
    statCategories: 'категорий',
    statLangs: 'языков',
    statUpdated: 'Актуально на 2026',
    picks: 'Выбор редакции',
    latest: 'Новые статьи',
    latestSub: 'Практичные и актуальные гиды по работе и жизни в Стамбуле',
    articles: 'статей',
    empty: 'Статьи по вашему запросу не найдены',
    emptyHint: 'Попробуйте другое слово или выберите другую категорию',
    reset: 'Показать все статьи',
    more: 'Показать ещё',
    author: 'Редакция Jobs in Istanbul',
    toolsTitle: 'Бесплатные инструменты',
    sponsored: 'Реклама',
    ctaTitle: 'Не пропустите новые вакансии и гиды',
    ctaSub: 'Подпишитесь на наш Telegram-канал или установите официальное приложение.',
    ctaTg: 'Telegram-канал',
    ctaApp: 'Скачать приложение'
  },
  fa: {
    eyebrow: 'راهنمای شغلی خارجی‌ها در ترکیه',
    search: 'جستجو در مقالات: اجازه کار، حقوق، مسکن...',
    searchBtn: 'جستجو',
    all: 'همه مقالات',
    statArticles: 'مقاله تخصصی',
    statCategories: 'دسته‌بندی',
    statLangs: 'زبان',
    statUpdated: 'به‌روز برای ۲۰۲۶',
    picks: 'انتخاب سردبیر',
    latest: 'جدیدترین مقالات',
    latestSub: 'راهنماهای کاربردی و به‌روز برای کار و زندگی در استانبول',
    articles: 'مقاله',
    empty: 'مقاله‌ای مطابق جستجوی شما یافت نشد',
    emptyHint: 'کلمه دیگری را امتحان کنید یا دسته دیگری انتخاب کنید',
    reset: 'نمایش همه مقالات',
    more: 'نمایش مقالات بیشتر',
    author: 'تحریریه کاریابی در استانبول',
    toolsTitle: 'ابزارهای رایگان',
    sponsored: 'تبلیغ',
    ctaTitle: 'هیچ شغل یا راهنمای جدیدی را از دست ندهید',
    ctaSub: 'به کانال تلگرام ما بپیوندید یا اپلیکیشن رسمی را نصب کنید.',
    ctaTg: 'کانال تلگرام',
    ctaApp: 'دانلود اپلیکیشن'
  },
  ur: {
    eyebrow: 'ترکی میں غیر ملکیوں کے لیے کیریئر گائیڈ',
    search: 'مضامین تلاش کریں: ورک پرمٹ، تنخواہ، رہائش...',
    searchBtn: 'تلاش',
    all: 'تمام مضامین',
    statArticles: 'ماہرانہ مضامین',
    statCategories: 'زمرے',
    statLangs: 'زبانیں',
    statUpdated: '2026 کے لیے تازہ',
    picks: 'مدیر کا انتخاب',
    latest: 'تازہ ترین مضامین',
    latestSub: 'استنبول میں کام اور رہائش کے لیے عملی اور تازہ رہنمائی',
    articles: 'مضامین',
    empty: 'آپ کی تلاش سے کوئی مضمون نہیں ملا',
    emptyHint: 'کوئی اور لفظ آزمائیں یا دوسرا زمرہ منتخب کریں',
    reset: 'تمام مضامین دکھائیں',
    more: 'مزید مضامین دکھائیں',
    author: 'استنبول جابز ادارتی ٹیم',
    toolsTitle: 'مفت ٹولز',
    sponsored: 'اشتہار',
    ctaTitle: 'کوئی نئی نوکری یا گائیڈ نہ چھوڑیں',
    ctaSub: 'ہمارے ٹیلی گرام چینل میں شامل ہوں یا آفیشل ایپ انسٹال کریں۔',
    ctaTg: 'ٹیلی گرام چینل',
    ctaApp: 'ایپ ڈاؤن لوڈ کریں'
  }
};

const DATE_LOCALES: Record<string, string> = {
  ar: 'ar-EG-u-nu-latn',
  en: 'en-GB',
  tr: 'tr-TR',
  ru: 'ru-RU',
  fa: 'fa-IR',
  ur: 'ur-PK',
  id: 'id-ID',
  fr: 'fr-FR',
  bn: 'bn-BD',
  de: 'de-DE'
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value: string, locale: string): string {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat(DATE_LOCALES[locale] || 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  } catch {
    return value;
  }
}

function toIsoDate(value: string): string {
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}

export function renderBlogIndex(opts: BlogIndexOptions): string {
  const { locale, cards, t, adLabels } = opts;
  const isRtl = locale === 'ar' || locale === 'fa' || locale === 'ur';
  const ui = { ...UI.en, ...(UI[locale] || {}) };
  // Non-ar/en/tr locales share English tool links if they have no localized set
  const tools: any[] = (UI[locale] && UI[locale].tools) || UI.en.tools;
  const arrow = isRtl ? 'fa-arrow-left' : 'fa-arrow-right';
  const readMore = String(t.readMore || '').replace(/\s*[←→]\s*$/, '');

  // Category registry (stable keys, sorted by frequency)
  const catMap = new Map<string, { key: string; name: string; color: string; count: number }>();
  for (const card of cards) {
    const existing = catMap.get(card.category.name);
    if (existing) existing.count++;
    else catMap.set(card.category.name, { key: 'c' + catMap.size, name: card.category.name, color: card.category.color, count: 1 });
  }
  const categories = [...catMap.values()].sort((a, b) => b.count - a.count);
  const catKey = (name: string) => catMap.get(name)?.key || 'c0';

  const featured = cards[0];
  const picks = cards.slice(1, 1 + PICKS_COUNT);
  const topCount = 1 + picks.length;

  // ---------- Hero ----------
  const heroHtml = `
    <section class="bx-hero">
      <div class="bx-hero-inner">
        <span class="bx-eyebrow"><span class="bx-pulse"></span>${esc(ui.eyebrow)}</span>
        <h1 class="bx-title">${esc(t.title)}</h1>
        <p class="bx-subtitle">${esc(t.subtitle)}</p>
        <form class="bx-search" role="search" onsubmit="return false;">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input id="bx-search" type="search" autocomplete="off" placeholder="${esc(ui.search)}" aria-label="${esc(ui.search)}">
          <button type="submit" id="bx-search-btn"><i class="fa-solid fa-magnifying-glass"></i><span>${esc(ui.searchBtn)}</span></button>
        </form>
        <div class="bx-stats">
          <span class="bx-stat"><i class="fa-solid fa-book-open"></i><b>${cards.length}</b> ${esc(ui.statArticles)}</span>
          <span class="bx-stat"><i class="fa-solid fa-layer-group"></i><b>${categories.length}</b> ${esc(ui.statCategories)}</span>
          <span class="bx-stat"><i class="fa-solid fa-language"></i><b>6</b> ${esc(ui.statLangs)}</span>
          <span class="bx-stat"><i class="fa-solid fa-circle-check"></i>${esc(ui.statUpdated)}</span>
        </div>
      </div>
    </section>`;

  // ---------- Category chips ----------
  const chipsHtml = `
    <nav class="bx-chips" aria-label="${esc(ui.all)}">
      <button type="button" class="bx-chip is-active" data-cat="all" aria-pressed="true"><i class="fa-solid fa-border-all"></i>${esc(ui.all)}<small>${cards.length}</small></button>
      ${categories.map(cat => `
      <button type="button" class="bx-chip" data-cat="${cat.key}" aria-pressed="false" style="--c:${esc(cat.color)}"><span class="bx-dot"></span>${esc(cat.name)}<small>${cat.count}</small></button>`).join('')}
    </nav>`;

  // ---------- Featured + Editor's picks ----------
  const featuredHtml = featured ? `
    <section class="bx-featured" id="bx-featured">
      <a class="bx-feat" href="/${locale}/blog/${esc(featured.slug)}">
        <img src="${esc(featured.image)}" alt="${esc(featured.title)}" width="1200" height="720" fetchpriority="high" decoding="async">
        <div class="bx-feat-body">
          <div class="bx-feat-tags">
            <span class="bx-tag bx-tag-ghost"><i class="fa-solid fa-star"></i>${esc(t.featured)}</span>
            <span class="bx-tag" style="--c:${esc(featured.category.color)}">${esc(featured.category.name)}</span>
          </div>
          <h2>${esc(featured.title)}</h2>
          <p>${esc(featured.summary)}</p>
          <div class="bx-meta">
            <span><i class="fa-regular fa-calendar"></i><time datetime="${toIsoDate(featured.publishedAt)}">${esc(formatDate(featured.publishedAt, locale))}</time></span>
            <span><i class="fa-regular fa-clock"></i>${esc(featured.readingTime)}</span>
            <span class="bx-feat-cta">${esc(readMore)} <i class="fa-solid ${arrow}"></i></span>
          </div>
        </div>
      </a>
      ${picks.length ? `
      <aside class="bx-picks">
        <div class="bx-picks-head"><i class="fa-solid fa-fire-flame-curved"></i>${esc(ui.picks)}</div>
        ${picks.map((p, i) => `
        <a class="bx-pick" href="/${locale}/blog/${esc(p.slug)}" style="--c:${esc(p.category.color)}">
          <span class="bx-pick-img"><img src="${esc(p.image)}" alt="${esc(p.title)}" width="192" height="152" loading="lazy" decoding="async"><span class="bx-pick-num">${i + 1}</span></span>
          <span class="bx-pick-body">
            <span class="bx-pick-cat">${esc(p.category.name)}</span>
            <h3>${esc(p.title)}</h3>
            <span class="bx-meta"><span><i class="fa-regular fa-clock"></i>${esc(p.readingTime)}</span></span>
          </span>
        </a>`).join('')}
      </aside>` : ''}
    </section>`
    : '';

  // ---------- Free tools strip ----------
  const toolsHtml = `
    <section class="bx-tools-wrap" id="bx-tools">
      <div class="bx-tools-title"><i class="fa-solid fa-toolbox"></i>${esc(ui.toolsTitle)}</div>
      <div class="bx-tools">
        ${tools.map(tool => `
        <a class="bx-tool" href="/${locale}/${tool.href}" style="--c:${tool.color}">
          <span class="bx-tool-ico"><i class="fa-solid ${tool.icon}"></i></span>
          <span><b>${esc(tool.title)}</b><small>${esc(tool.sub)}</small></span>
        </a>`).join('')}
      </div>
    </section>`;

  // ---------- Sponsored jobs row (inline in grid) ----------
  const adHtml = `
    <div class="bx-inline-ad">
      <div class="bx-ad-head">
        <div class="bx-ad-title">
          <span class="bx-live"><span class="bx-pulse"></span>${esc(adLabels.badge)}</span>
          <h3>${esc(adLabels.sectionTitle)}</h3>
        </div>
        <a class="bx-ad-all" href="/${locale}#jobs-anchor">${esc(adLabels.browseAll)} <i class="fa-solid ${arrow}"></i></a>
      </div>
      <div class="bx-ad-row">
        ${adLabels.roles.map(role => `
        <a class="bx-ad-item" href="/${locale}#jobs-anchor">
          <span class="bx-ad-top"><span class="bx-ad-company"><i class="fa-solid fa-building"></i>${esc(role.company)}</span><span class="bx-ad-salary">${esc(role.salary)}</span></span>
          <b>${esc(role.title)}</b>
          <span class="bx-ad-type"><i class="fa-solid fa-briefcase"></i>${esc(role.type)}</span>
          <span class="bx-ad-apply">${esc(adLabels.apply)} <i class="fa-solid ${arrow}"></i></span>
        </a>`).join('')}
      </div>
    </div>`;

  // ---------- Article cards ----------
  // Grid contains ALL articles. The first `topCount` (already shown in the featured
  // block) are marked .bx-dup and only revealed while searching/filtering.
  let visibleIndex = 0;
  const cardsHtml = cards.map((card, idx) => {
    const isDup = idx < topCount;
    let hidden = isDup;
    if (!isDup) {
      visibleIndex++;
      hidden = visibleIndex > PAGE_SIZE;
    }
    const searchText = `${card.title} ${card.summary} ${card.category.name}`;
    const cardHtml = `
      <article class="bx-card${isDup ? ' bx-dup' : ''}" data-cat="${catKey(card.category.name)}" data-search="${esc(searchText)}" style="--c:${esc(card.category.color)}"${hidden ? ' hidden' : ''}>
        <a class="bx-card-media" href="/${locale}/blog/${esc(card.slug)}" tabindex="-1" aria-hidden="true">
          <img src="${esc(card.image)}" alt="${esc(card.title)}" width="640" height="400" loading="lazy" decoding="async">
          <span class="bx-tag">${esc(card.category.name)}</span>
        </a>
        <div class="bx-card-body">
          <div class="bx-meta">
            <span><i class="fa-regular fa-calendar"></i><time datetime="${toIsoDate(card.publishedAt)}">${esc(formatDate(card.publishedAt, locale))}</time></span>
            <span><i class="fa-regular fa-clock"></i>${esc(card.readingTime)}</span>
          </div>
          <h3 class="bx-card-title"><a href="/${locale}/blog/${esc(card.slug)}">${esc(card.title)}</a></h3>
          <p class="bx-card-summary">${esc(card.summary)}</p>
          <div class="bx-card-foot">
            <span class="bx-author"><img src="/public/images/logo.png" alt="" width="28" height="28" loading="lazy"><span>${esc(ui.author)}</span></span>
            <a class="bx-read" href="/${locale}/blog/${esc(card.slug)}" aria-label="${esc(readMore)}: ${esc(card.title)}">${esc(readMore)} <i class="fa-solid ${arrow}"></i></a>
          </div>
        </div>
      </article>`;
    // Insert the sponsored row after the 6th regular card
    return (!isDup && visibleIndex === 6) ? cardHtml + adHtml : cardHtml;
  }).join('');

  const regularCount = Math.max(0, cards.length - topCount);
  const adInGrid = regularCount >= 6;

  const gridHtml = `
    <section class="bx-latest" id="bx-latest">
      <div class="bx-sec-head">
        <div>
          <h2>${esc(ui.latest)}</h2>
          <p>${esc(ui.latestSub)}</p>
        </div>
        <span class="bx-count"><b id="bx-count">${cards.length}</b> ${esc(ui.articles)}</span>
      </div>
      <div class="bx-grid">
        ${cardsHtml}
        ${adInGrid ? '' : adHtml}
      </div>
      <div class="bx-empty" id="bx-empty" hidden>
        <i class="fa-regular fa-folder-open"></i>
        <h3>${esc(ui.empty)}</h3>
        <p>${esc(ui.emptyHint)}</p>
        <button type="button" class="bx-more" id="bx-reset"><i class="fa-solid fa-rotate-left"></i>${esc(ui.reset)}</button>
      </div>
      <div class="bx-more-wrap"${regularCount > PAGE_SIZE ? '' : ' hidden'}>
        <button type="button" class="bx-more" id="bx-more"><i class="fa-solid fa-plus"></i>${esc(ui.more)}</button>
      </div>
    </section>`;

  // ---------- CTA ----------
  const ctaHtml = `
    <section class="bx-cta">
      <div>
        <h2>${esc(ui.ctaTitle)}</h2>
        <p>${esc(ui.ctaSub)}</p>
      </div>
      <div class="bx-cta-actions">
        <a class="bx-btn bx-btn-tg" href="https://t.me/jobsistanbul" target="_blank" rel="noopener"><i class="fa-brands fa-telegram"></i>${esc(ui.ctaTg)}</a>
        <a class="bx-btn bx-btn-play" href="${PLAY_URL}" target="_blank" rel="noopener"><i class="fa-brands fa-google-play"></i>${esc(ui.ctaApp)}</a>
      </div>
    </section>`;

  // ---------- JSON-LD (Blog + BlogPosting list) ----------
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: t.title,
    description: t.subtitle,
    url: `${SITE_URL}/${locale}/blog`,
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: 'Jobs in Istanbul',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/public/images/logo.png` }
    },
    blogPost: cards.slice(0, 20).map(card => ({
      '@type': 'BlogPosting',
      headline: card.title,
      url: `${SITE_URL}/${locale}/blog/${card.slug}`,
      image: card.image,
      datePublished: toIsoDate(card.publishedAt) || undefined,
      articleSection: card.category.name,
      author: { '@type': 'Organization', name: 'Jobs in Istanbul' }
    }))
  };
  const jsonLdHtml = `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;

  return `
    ${BLOG_INDEX_STYLES}
    <noscript><style>.bx-card[hidden]:not(.bx-dup){display:flex!important}.bx-more-wrap,.bx-search button{display:none!important}</style></noscript>
    <div class="bx-root" id="bx-root" style="--arrow-shift:${isRtl ? '-4px' : '4px'}">
      ${heroHtml}
      <div class="bx-wrap">
        ${chipsHtml}
        ${featuredHtml}
        ${toolsHtml}
        ${gridHtml}
        ${ctaHtml}
      </div>
    </div>
    ${jsonLdHtml}
    <script>${blogIndexScript(PAGE_SIZE)}</script>
  `;
}

function blogIndexScript(pageSize: number): string {
  // Plain ES5 (no template literals) so it is safe inside the server template.
  return `
(function () {
  var root = document.getElementById('bx-root');
  if (!root) return;
  var PAGE = ${pageSize};
  var cards = Array.prototype.slice.call(root.querySelectorAll('.bx-card'));
  var chips = Array.prototype.slice.call(root.querySelectorAll('.bx-chip'));
  var input = document.getElementById('bx-search');
  var searchBtn = document.getElementById('bx-search-btn');
  var featured = document.getElementById('bx-featured');
  var tools = document.getElementById('bx-tools');
  var ad = root.querySelector('.bx-inline-ad');
  var empty = document.getElementById('bx-empty');
  var moreBtn = document.getElementById('bx-more');
  var resetBtn = document.getElementById('bx-reset');
  var countEl = document.getElementById('bx-count');
  var latest = document.getElementById('bx-latest');
  var total = cards.length;
  var limit = PAGE, activeCat = 'all', query = '', timer = null;

  function norm(s) {
    s = String(s || '').toLowerCase();
    if (s.normalize) s = s.normalize('NFKD');
    return s.replace(/[\\u0300-\\u036f\\u064B-\\u065F\\u0670]/g, '').replace(/[\\u0623\\u0625\\u0622]/g, '\\u0627').replace(/\\u0629/g, '\\u0647').replace(/\\u0649/g, '\\u064A');
  }
  var index = cards.map(function (c) { return norm(c.getAttribute('data-search')); });

  function apply() {
    var filtering = activeCat !== 'all' || query.length > 0;
    var matched = 0;
    cards.forEach(function (card, i) {
      var isDup = card.classList.contains('bx-dup');
      var ok = (activeCat === 'all' || card.getAttribute('data-cat') === activeCat) &&
               (!query || index[i].indexOf(query) !== -1);
      if (!filtering && isDup) ok = false;
      if (ok) matched++;
      card.hidden = !(ok && (filtering || matched <= limit));
    });
    if (featured) featured.hidden = filtering;
    if (tools) tools.hidden = filtering;
    if (ad) ad.hidden = filtering;
    if (empty) empty.hidden = matched !== 0;
    if (moreBtn) moreBtn.parentNode.hidden = filtering || matched <= limit;
    if (countEl) countEl.textContent = filtering ? matched : total;
  }

  function setCat(cat) {
    activeCat = cat;
    chips.forEach(function (chip) {
      var on = chip.getAttribute('data-cat') === cat;
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    limit = PAGE;
    apply();
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      setCat(chip.getAttribute('data-cat'));
      if (activeCat !== 'all' && latest) latest.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (input) {
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { query = norm(input.value.trim()); limit = PAGE; apply(); }, 120);
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', function () {
      query = norm(input ? input.value.trim() : '');
      apply();
      if (latest) latest.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  if (moreBtn) moreBtn.addEventListener('click', function () { limit += PAGE; apply(); });
  if (resetBtn) resetBtn.addEventListener('click', function () {
    if (input) input.value = '';
    query = '';
    setCat('all');
  });

  try {
    var q = new URLSearchParams(window.location.search).get('q');
    if (q && input) { input.value = q; query = norm(q.trim()); }
  } catch (e) {}
  apply();
})();`;
}

const BLOG_INDEX_STYLES = `
<style>
  .bx-root [hidden]{display:none!important}
  .bx-root{--bx-radius:24px}
  /* ---------- Hero ---------- */
  .bx-hero{position:relative;overflow:hidden;color:#fff;padding:72px 0 108px;
    background:
      radial-gradient(1100px 420px at 85% -10%,rgba(59,130,246,.38),transparent 60%),
      radial-gradient(900px 380px at 5% 115%,rgba(245,158,11,.20),transparent 60%),
      linear-gradient(135deg,#0a1122 0%,#0f1d3a 55%,#14306a 100%)}
  .bx-hero::after{content:'';position:absolute;inset:0;pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);
    background-size:44px 44px;-webkit-mask-image:radial-gradient(ellipse at center,#000 25%,transparent 72%);mask-image:radial-gradient(ellipse at center,#000 25%,transparent 72%)}
  .bx-hero-inner{position:relative;z-index:1;max-width:880px;margin:0 auto;padding:0 20px;text-align:center}
  .bx-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:7px 15px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);font-size:.8rem;font-weight:700;color:#d6e4ff;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
  .bx-pulse{width:8px;height:8px;border-radius:50%;background:#34d399;display:inline-block;animation:bxPulse 2s infinite}
  @keyframes bxPulse{0%{box-shadow:0 0 0 0 rgba(52,211,153,.6)}70%{box-shadow:0 0 0 8px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
  .bx-title{font-size:clamp(1.9rem,4.6vw,3.15rem);font-weight:900;line-height:1.25;margin:18px 0 14px;color:#fff;letter-spacing:-.01em;text-shadow:0 2px 24px rgba(0,0,0,.25)}
  .bx-subtitle{max-width:680px;margin:0 auto;color:rgba(226,232,240,.85);font-size:clamp(.95rem,1.6vw,1.12rem);line-height:1.8}
  .bx-search{margin:30px auto 0;max-width:660px;display:flex;align-items:center;gap:8px;background:#fff;border-radius:999px;padding:6px;box-shadow:0 22px 50px -12px rgba(0,0,0,.5)}
  .bx-search > i{color:#64748b;padding-inline-start:16px}
  .bx-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:1rem;color:#0f172a;padding:12px 4px}
  .bx-search input::-webkit-search-cancel-button{cursor:pointer}
  .bx-search button{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font:inherit;font-weight:800;padding:12px 24px;cursor:pointer;transition:var(--t-base)}
  .bx-search button:hover{filter:brightness(1.08);box-shadow:0 8px 20px rgba(37,99,235,.45)}
  body.dark-mode .bx-search{background:#0f172a;border:1px solid rgba(255,255,255,.12)}
  body.dark-mode .bx-search input{color:#f1f5f9}
  .bx-stats{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:26px}
  .bx-stat{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);font-size:.84rem;color:#cbd5e1}
  .bx-stat i{color:#93c5fd}
  .bx-stat b{color:#fff;font-size:1rem}

  /* ---------- Wrapper & chips ---------- */
  .bx-wrap{position:relative;z-index:2;max-width:1260px;margin:-58px auto 0;padding:0 20px 90px}
  .bx-chips{display:flex;gap:8px;overflow-x:auto;padding:12px;margin-bottom:36px;background:var(--bg-card);border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow-lg);scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .bx-chips::-webkit-scrollbar{display:none}
  .bx-chip{flex-shrink:0;display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;border:1px solid var(--border);background:var(--bg-subtle);color:var(--text-body);font:inherit;font-size:.86rem;font-weight:700;cursor:pointer;white-space:nowrap;transition:var(--t-base)}
  .bx-chip .bx-dot{width:8px;height:8px;border-radius:50%;background:var(--c,#6366f1)}
  .bx-chip small{font-size:.72rem;font-weight:800;opacity:.75;background:var(--bg-card);padding:1px 8px;border-radius:999px}
  .bx-chip:hover{border-color:var(--c,var(--primary));color:var(--c,var(--primary))}
  .bx-chip.is-active{background:var(--text-heading);border-color:var(--text-heading);color:var(--bg-card)}
  .bx-chip.is-active small{background:rgba(127,127,127,.25);color:inherit}
  .bx-chip:focus-visible,.bx-more:focus-visible,.bx-search button:focus-visible{outline:3px solid var(--primary-glow);outline-offset:2px}

  /* ---------- Featured ---------- */
  .bx-featured{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);gap:24px;margin-bottom:44px}
  .bx-feat{position:relative;isolation:isolate;display:block;min-height:470px;border-radius:var(--bx-radius);overflow:hidden;background:#0f172a;box-shadow:var(--shadow-lg);text-decoration:none}
  .bx-feat img{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;transition:transform .9s var(--ease-out)}
  .bx-feat::before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(2,6,23,0) 20%,rgba(2,6,23,.55) 52%,rgba(2,6,23,.94) 100%)}
  .bx-feat:hover img{transform:scale(1.05)}
  .bx-feat-body{position:absolute;inset-inline:0;bottom:0;padding:34px;color:#fff}
  .bx-feat-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
  .bx-feat h2{margin:0 0 10px;color:#fff;font-size:clamp(1.35rem,2.6vw,2.05rem);font-weight:900;line-height:1.4}
  .bx-feat p{margin:0 0 16px;color:rgba(255,255,255,.84);font-size:.98rem;line-height:1.75;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .bx-feat .bx-meta{color:rgba(255,255,255,.78)}
  .bx-feat-cta{margin-inline-start:auto;display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:999px;background:#fff;color:#0f172a;font-weight:800;font-size:.85rem;transition:var(--t-base)}
  .bx-feat:hover .bx-feat-cta{background:var(--accent);color:#111827}
  .bx-tag{display:inline-flex;align-items:center;gap:6px;width:fit-content;padding:5px 12px;border-radius:999px;background:var(--c,#2563eb);color:#fff;font-size:.74rem;font-weight:800;line-height:1.3}
  .bx-tag-ghost{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.24);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
  .bx-tag-ghost i{color:#fcd34d}

  .bx-picks{display:flex;flex-direction:column;padding:22px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--bx-radius);box-shadow:var(--shadow-sm)}
  .bx-picks-head{display:flex;align-items:center;gap:10px;margin-bottom:6px;color:var(--text-heading);font-size:1.08rem;font-weight:900}
  .bx-picks-head i{color:#f97316}
  .bx-pick{display:grid;grid-template-columns:104px minmax(0,1fr);align-items:center;gap:14px;padding:15px 0;border-top:1px dashed var(--border);text-decoration:none}
  .bx-picks-head + .bx-pick{border-top:0}
  .bx-pick-img{position:relative;display:block;width:104px;height:82px;border-radius:14px;overflow:hidden;background:var(--bg-subtle)}
  .bx-pick-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s var(--ease-out)}
  .bx-pick:hover .bx-pick-img img{transform:scale(1.08)}
  .bx-pick-num{position:absolute;top:6px;inset-inline-start:6px;width:24px;height:24px;display:grid;place-items:center;border-radius:8px;background:rgba(15,23,42,.78);color:#fff;font-size:.75rem;font-weight:900}
  .bx-pick-body{display:flex;flex-direction:column;min-width:0}
  .bx-pick-cat{color:var(--c);font-size:.74rem;font-weight:800}
  .bx-pick h3{margin:4px 0 6px;color:var(--text-heading);font-size:.95rem;font-weight:800;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s}
  .bx-pick:hover h3{color:var(--primary)}
  .bx-pick .bx-meta{font-size:.75rem}

  /* ---------- Tools ---------- */
  .bx-tools-wrap{margin-bottom:52px}
  .bx-tools-title{display:flex;align-items:center;gap:10px;margin-bottom:14px;color:var(--text-heading);font-size:1.02rem;font-weight:900}
  .bx-tools-title i{color:#0ea5e9}
  .bx-tools{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
  .bx-tool{display:flex;align-items:center;gap:14px;padding:18px;border-radius:18px;background:var(--bg-card);border:1px solid var(--border);text-decoration:none;transition:var(--t-base)}
  .bx-tool:hover{transform:translateY(-3px);border-color:var(--c);box-shadow:var(--shadow-md)}
  .bx-tool-ico{flex-shrink:0;display:grid;place-items:center;width:48px;height:48px;border-radius:14px;color:var(--c);font-size:1.15rem;background:color-mix(in srgb,var(--c) 14%,transparent)}
  .bx-tool b{display:block;color:var(--text-heading);font-size:.92rem;font-weight:800;line-height:1.4}
  .bx-tool small{color:var(--text-muted);font-size:.76rem}

  /* ---------- Grid ---------- */
  .bx-sec-head{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:24px;scroll-margin-top:90px}
  .bx-latest{scroll-margin-top:90px}
  .bx-sec-head h2{display:flex;align-items:center;gap:12px;margin:0;color:var(--text-heading);font-size:1.65rem;font-weight:900}
  .bx-sec-head h2::before{content:'';width:6px;height:28px;border-radius:6px;background:linear-gradient(180deg,var(--primary),var(--accent))}
  .bx-sec-head p{margin:6px 0 0;color:var(--text-muted);font-size:.93rem}
  .bx-count{padding:7px 14px;border-radius:999px;background:var(--bg-subtle);border:1px solid var(--border);color:var(--text-muted);font-size:.85rem;font-weight:700}
  .bx-count b{color:var(--text-heading)}
  .bx-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px}
  .bx-card{display:flex;flex-direction:column;background:var(--bg-card);border:1px solid var(--border);border-radius:22px;overflow:hidden;box-shadow:var(--shadow-xs);transition:transform .35s var(--ease-out),box-shadow .35s var(--ease-out),border-color .35s}
  .bx-card:hover{transform:translateY(-6px);box-shadow:var(--shadow-card-hover);border-color:color-mix(in srgb,var(--c,#2563eb) 40%,var(--border))}
  .bx-card-media{position:relative;display:block;aspect-ratio:16/10;overflow:hidden;background:var(--bg-subtle)}
  .bx-card-media img{width:100%;height:100%;object-fit:cover;transition:transform .7s var(--ease-out)}
  .bx-card:hover .bx-card-media img{transform:scale(1.06)}
  .bx-card-media .bx-tag{position:absolute;top:14px;inset-inline-start:14px;box-shadow:0 6px 16px rgba(0,0,0,.25)}
  .bx-card-body{display:flex;flex-direction:column;flex:1;padding:20px 22px 22px}
  .bx-meta{display:flex;align-items:center;flex-wrap:wrap;gap:8px 16px;color:var(--text-muted);font-size:.8rem}
  .bx-meta i{margin-inline-end:6px;opacity:.85}
  .bx-card-title{margin:12px 0 8px;font-size:1.12rem;font-weight:800;line-height:1.55}
  .bx-card-title a{color:var(--text-heading);text-decoration:none;transition:color .2s}
  .bx-card:hover .bx-card-title a{color:var(--primary)}
  .bx-card-summary{margin:0 0 18px;color:var(--text-muted);font-size:.9rem;line-height:1.8;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .bx-card-foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:16px;border-top:1px solid var(--border)}
  .bx-author{display:flex;align-items:center;gap:8px;min-width:0;color:var(--text-body);font-size:.77rem;font-weight:700}
  .bx-author img{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--bg-subtle);object-fit:cover}
  .bx-author span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bx-read{display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-size:.83rem;font-weight:800;text-decoration:none;white-space:nowrap}
  .bx-read i{transition:transform .25s var(--ease-out)}
  .bx-card:hover .bx-read i{transform:translateX(var(--arrow-shift))}

  /* ---------- Sponsored row ---------- */
  .bx-inline-ad{grid-column:1/-1;padding:26px;border-radius:22px;border:1px solid var(--border);background:linear-gradient(135deg,var(--bg-card) 0%,var(--bg-subtle) 100%);box-shadow:var(--shadow-sm)}
  .bx-ad-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px}
  .bx-ad-title{display:flex;align-items:center;flex-wrap:wrap;gap:10px}
  .bx-ad-title h3{margin:0;color:var(--text-heading);font-size:1.15rem;font-weight:900}
  .bx-live{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;background:rgba(16,185,129,.12);color:#059669;font-size:.74rem;font-weight:800}
  .bx-ad-all{display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-size:.85rem;font-weight:800;text-decoration:none}
  .bx-ad-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
  .bx-ad-item{display:flex;flex-direction:column;gap:8px;padding:18px;border-radius:16px;background:var(--bg-card);border:1px solid var(--border);text-decoration:none;transition:var(--t-base)}
  .bx-ad-item:hover{transform:translateY(-3px);border-color:var(--primary);box-shadow:var(--shadow-md)}
  .bx-ad-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .bx-ad-company{display:inline-flex;align-items:center;gap:6px;color:var(--text-muted);font-size:.8rem;font-weight:700}
  .bx-ad-salary{padding:2px 9px;border-radius:999px;background:var(--success-light);color:var(--success);font-size:.72rem;font-weight:800;white-space:nowrap}
  .bx-ad-item b{color:var(--text-heading);font-size:.98rem;line-height:1.5}
  .bx-ad-type{display:inline-flex;align-items:center;gap:6px;color:var(--text-muted);font-size:.78rem}
  .bx-ad-apply{margin-top:auto;display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-size:.82rem;font-weight:800}

  /* ---------- Empty / more ---------- */
  .bx-empty{margin-top:8px;padding:56px 20px;text-align:center;border:2px dashed var(--border);border-radius:22px;color:var(--text-muted)}
  .bx-empty > i{font-size:2.4rem;color:var(--border-strong)}
  .bx-empty h3{margin:12px 0 6px;color:var(--text-heading);font-size:1.15rem;font-weight:800}
  .bx-empty p{margin:0 0 18px}
  .bx-more-wrap{margin-top:38px;text-align:center}
  .bx-more{display:inline-flex;align-items:center;gap:10px;padding:14px 28px;border-radius:999px;border:1.5px solid var(--border-strong);background:var(--bg-card);color:var(--text-heading);font:inherit;font-weight:800;cursor:pointer;transition:var(--t-base)}
  .bx-more:hover{border-color:var(--primary);color:var(--primary);box-shadow:var(--shadow-md);transform:translateY(-2px)}

  /* ---------- CTA ---------- */
  .bx-cta{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);align-items:center;gap:24px;margin-top:64px;padding:44px;border-radius:28px;color:#fff;
    background:radial-gradient(600px 260px at 0% 0%,rgba(56,189,248,.28),transparent 60%),linear-gradient(135deg,#0a1122,#1e3a8a)}
  .bx-cta h2{margin:0 0 10px;color:#fff;font-size:1.7rem;font-weight:900}
  .bx-cta p{margin:0;color:rgba(255,255,255,.82);line-height:1.8}
  .bx-cta-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:12px}
  .bx-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;border-radius:14px;font-size:.92rem;font-weight:800;text-decoration:none;transition:var(--t-base)}
  .bx-btn-tg{background:#229ED9;color:#fff!important}
  .bx-btn-play{background:#fff;color:#0f172a!important}
  .bx-btn:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(0,0,0,.28)}

  /* ---------- Responsive ---------- */
  @media (max-width:1100px){
    .bx-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    .bx-featured{grid-template-columns:1fr}
    .bx-tools{grid-template-columns:repeat(2,minmax(0,1fr))}
    .bx-ad-row{grid-template-columns:1fr}
  }
  @media (max-width:640px){
    .bx-hero{padding:44px 0 88px}
    .bx-search button span{display:none}
    .bx-search button{padding:12px 16px}
    .bx-stat{font-size:.76rem;padding:6px 10px}
    .bx-wrap{padding:0 14px 70px}
    .bx-grid{grid-template-columns:1fr;gap:18px}
    .bx-feat{min-height:400px}
    .bx-feat-body{padding:22px}
    .bx-feat-cta{display:none}
    .bx-tools{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .bx-tool{flex-direction:column;align-items:flex-start;gap:10px;padding:14px}
    .bx-tool-ico{width:40px;height:40px;font-size:1rem}
    .bx-tool b{font-size:.85rem}
    .bx-sec-head h2{font-size:1.35rem}
    .bx-inline-ad{padding:18px}
    .bx-cta{grid-template-columns:1fr;padding:28px;margin-top:48px}
    .bx-cta-actions{justify-content:stretch}
    .bx-btn{flex:1}
  }
  @media (prefers-reduced-motion:reduce){
    .bx-root *,.bx-root *::before,.bx-root *::after{transition:none!important;animation:none!important}
  }
</style>`;
