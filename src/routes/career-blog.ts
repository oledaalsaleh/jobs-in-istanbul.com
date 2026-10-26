import { Hono } from 'hono'
import { renderLayout } from './public'
import { safeQuery } from '../utils/db-helper'
import { generateMetaTags, generateJsonLd } from '../utils/seo-helper'
import { seededArticles, getArticleAvailableLocales, quranAppArticleTr } from '../data/seeded-blog-articles'
export { seededArticles, getArticleAvailableLocales }

export const careerBlogRouter = new Hono()

// Serve app-ads.txt on blog routes
careerBlogRouter.get('/blog/app-ads.txt', (c) => {
  return c.text('google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0\n', 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})
careerBlogRouter.get('/:locale/blog/app-ads.txt', (c) => {
  return c.text('google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0\n', 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})
careerBlogRouter.get('/:locale/blog/:slug/app-ads.txt', (c) => {
  return c.text('google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0\n', 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})
careerBlogRouter.get('/blog/:slug/app-ads.txt', (c) => {
  return c.text('google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0\n', 200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400'
  });
})

// Redirect bare /blog to /ar/blog
careerBlogRouter.get('/blog', (c) => {
  return c.redirect('/ar/blog', 302)
})


// Helper to extract first image
function extractFirstImage(content: string, article?: any): string {
  if (article && article.image) return article.image;
  if (!content) return 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&fm=webp';
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&fm=webp';
}

// Helper to get reading time
function getReadingTime(content: string, locale: any): string {
  if (!content) return locale === 'ar' || locale === 'fa' || locale === 'ur' ? '1 منٹ مطالعہ' : (locale === 'tr' ? '1 dk okuma' : '1 min read');
  const wordsCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const min = Math.max(1, Math.round(wordsCount / 200));
  const times: Record<string, string> = {
    ar: min + ' دقائق قراءة',
    en: min + ' min read',
    tr: min + ' dk okuma',
    ru: min + ' мин чтения',
    fa: min + ' دقیقه مطالعه',
    ur: min + ' منٹ مطالعہ',
    id: min + ' mnt baca',
    fr: min + ' min de lecture',
    bn: min + ' মিনিট পড়া',
    de: min + ' Min. Lesezeit'
  };
  return times[locale] || (min + ' min read');
}

// Helper to get category
function getCategory(slug: string, locale: any): { name: string; color: string } {
  const maps: Record<string, Partial<Record<'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur' | 'id' | 'fr' | 'bn' | 'de', string>>> = {
    'trabzon-travel-guide-app-tourism-turkey-2026': {
      ar: 'سياحة ودليل المسافر',
      en: 'Travel & Tourism Guide',
      tr: 'Seyahat & Gezi Rehberi',
      ru: 'Туризм и путеводитель',
      fa: 'گردشگری و راهنمای سفر',
      ur: 'سیاحت اور سفری گائیڈ',
      id: 'Panduan Wisata',
      fr: 'Guide de voyage',
      bn: 'ভ্রমণ নির্দেশিকা',
      de: 'Reiseführer'
    },
    'jobs-in-istanbul-app-official-guide-2026': {
      ar: 'تطبيق إسطنبول الرسمي',
      en: 'Official Mobile App',
      tr: 'Resmi Mobil Uygulama',
      ru: 'Официальное приложение',
      fa: 'اپلیکیشن رسمی استانبول',
      ur: 'آفیشل موبائل ایپ',
      id: 'Aplikasi Resmi',
      fr: 'Application officielle',
      bn: 'অফিসিয়াল মোবাইল অ্যাপ',
      de: 'Offizielle App'
    },
    'sgk-health-insurance-turkey-workers': {
      ar: 'الضمان الاجتماعي',
      en: 'Social Security',
      tr: 'Sosyal Güvenlik',
      ru: 'Социальное обеспечение'
    },
    'open-bank-account-turkey-foreigners': {
      ar: 'الخدمات المالية',
      en: 'Finance',
      tr: 'Finansal Hizmetler',
      ru: 'Финансы'
    },
    'best-dental-implants-clinic-turkey': {
      ar: 'طب وصحة',
      en: 'Dentistry',
      tr: 'Diş Tedavisi',
      ru: 'Стоматология'
    },
    'turkey-work-permit-residency-laws': {
      ar: 'قوانين العمل',
      en: 'Work Permits',
      tr: 'Çalışma İzni',
      ru: 'Разрешение на работу'
    },
    'optimize-resume-to-pass-ats-systems': {
      ar: 'إرشاد مهني',
      en: 'Career Guide',
      tr: 'Kariyer Rehberi',
      ru: 'Карьерный гид'
    },
    'avoid-istanbul-traffic-and-transportation-tips': {
      ar: 'المواصلات والسكن',
      en: 'Transport & Housing',
      tr: 'Ulaşım ve Yaşam',
      ru: 'Транспорт и жилье'
    },
    'turkey-minimum-wage-employer-cost-2026': {
      ar: 'الأجور والرواتب',
      en: 'Salaries & Wages',
      tr: 'Asgari Ücret',
      ru: 'Зарплаты и оклады'
    },
    'it-jobs-istanbul-foreigners-guide': {
      ar: 'التوظيف وتكنولوجيا المعلومات',
      en: 'IT & Tech Jobs',
      tr: 'Bilişim ve Teknoloji',
      ru: 'IT и технологии'
    },
    'best-residential-areas-istanbul-near-business-centers': {
      ar: 'المواصلات والسكن',
      en: 'Transport & Housing',
      tr: 'Ulaşım ve Yaşam',
      ru: 'Транспорт и жилье'
    },
    'how-to-write-cv-for-turkish-companies': {
      ar: 'إرشاد مهني',
      en: 'Career Guide',
      tr: 'Kariyer Rehberi',
      ru: 'Карьерный гид'
    },
    'difference-tourist-residency-work-permit-turkey': {
      ar: 'قوانين العمل',
      en: 'Work Permits',
      tr: 'Çalışma İzni',
      ru: 'Разрешение на работу'
    },
    'quran-karim-app-offline-features-download': {
      ar: 'تطبيقات إسلامية',
      en: 'Islamic Apps',
      tr: 'İslami Uygulamalar',
      ru: 'Исламские приложения',
      fa: 'اپلیکیشن‌های اسلامی',
      ur: 'اسلامی ایپس',
      id: 'Aplikasi Islami',
      fr: 'Applications islamiques',
      bn: 'ইসলামিক অ্যাপস',
      de: 'Islamische Apps'
    },
    'kuran-i-kerim-namaz-vakitleri-uygulamasi-indir': {
      ar: 'تطبيقات إسلامية',
      en: 'Islamic Apps',
      tr: 'İslami Uygulamalar',
      ru: 'Исламские приложения',
      fa: 'اپلیکیشن‌های اسلامی',
      ur: 'اسلامی ایپس',
      id: 'Aplikasi Islami',
      fr: 'Applications islamiques',
      bn: 'ইসলামিক অ্যাপস',
      de: 'Islamische Apps'
    },
    'remote-work-turkey-freelance-company-tax-2026': {
      ar: 'العمل الحر والضرائب',
      en: 'Freelance & Taxes',
      tr: 'Freelance ve Vergi',
      ru: 'Фриланс и налоги'
    },
    'cost-of-living-istanbul-2026-guide': {
      ar: 'تكاليف المعيشة والسكن',
      en: 'Cost of Living & Housing',
      tr: 'Yaşam Maliyeti ve Konut',
      ru: 'Стоимость жизни и жилье'
    },
    'tourism-hotel-salaries-istanbul-2026-guide': {
      ar: 'السياحة والفنادق',
      en: 'Tourism & Hospitality',
      tr: 'Turizm ve Otelcilik',
      ru: 'Туризм и гостиницы'
    },
    'most-in-demand-jobs-turkey-2026': {
      ar: 'سوق العمل والوظائف',
      en: 'Job Market & Careers',
      tr: 'İş Piyasası ve Meslekler',
      ru: 'Рынок труда и карьеры',
      fa: 'بازار کار و مشاغل',
      ur: 'ملازمت کی منڈی',
      id: 'Pasar Kerja & Karier',
      fr: 'Marché de l\'emploi',
      bn: 'কাজের বাজার ও পেশা',
      de: 'Arbeitsmarkt & Berufe'
    }
  };

  const cat: any = maps[slug] || {
    ar: 'إرشاد مهني',
    en: 'Career Guide',
    tr: 'Kariyer Rehberi',
    fa: 'راهنمای شغلی',
    ur: 'کیریئر گائیڈ',
    id: 'Panduan Karier',
    fr: 'Guide Carrière',
    bn: 'ক্যারিয়ার গাইড',
    de: 'Karriere-Ratgeber'
  };

  const colors: Record<string, string> = {
    'tourism-hotel-salaries-istanbul-2026-guide': '#4338ca', // indigo
    'trabzon-travel-guide-app-tourism-turkey-2026': '#047857', // forest green
    'most-in-demand-jobs-turkey-2026': '#2563eb', // Royal Blue
    'cost-of-living-istanbul-2026-guide': '#059669', // emerald
    'remote-work-turkey-freelance-company-tax-2026': '#0284c7', // sky blue
    'jobs-in-istanbul-app-official-guide-2026': '#0284c7',
    'quran-karim-app-offline-features-download': '#047857', // emerald green
    'kuran-i-kerim-namaz-vakitleri-uygulamasi-indir': '#047857', // emerald green
    'sgk-health-insurance-turkey-workers': '#10b981', // emerald
    'open-bank-account-turkey-foreigners': '#3b82f6', // blue
    'best-dental-implants-clinic-turkey': '#ec4899', // pink
    'turkey-work-permit-residency-laws': '#f59e0b', // amber
    'optimize-resume-to-pass-ats-systems': '#8b5cf6', // purple
    'avoid-istanbul-traffic-and-transportation-tips': '#06b6d4', // cyan
    'turkey-minimum-wage-employer-cost-2026': '#ef4444', // red
    'it-jobs-istanbul-foreigners-guide': '#6366f1', // indigo
    'best-residential-areas-istanbul-near-business-centers': '#06b6d4', // cyan
    'how-to-write-cv-for-turkish-companies': '#8b5cf6', // purple
    'difference-tourist-residency-work-permit-turkey': '#f59e0b' // amber
  };

  return {
    name: cat[locale] || cat['en'] || 'Career Guide',
    color: colors[slug] || '#6366f1' // indigo
  };
}

// Blog List View
careerBlogRouter.get('/:locale/blog', async (c) => {
  const locale = c.req.param('locale') as any;
  if (!['ar', 'en', 'tr', 'ru', 'fa', 'ur', 'id', 'fr', 'bn', 'de'].includes(locale)) return c.redirect('/ar/blog');

  const db = (c.env as any).DB;
  let articles: any[] = (seededArticles[locale] && seededArticles[locale].length > 0)
    ? seededArticles[locale]
    : ((seededArticles['ar'] && seededArticles['ar'].length > 0) ? seededArticles['ar'] : seededArticles['en'] || []);

  try {
    const rows = await safeQuery(() => db.prepare(
      `SELECT data, published_at FROM documents WHERE type_id = 'blog_post' AND status = 'published' AND is_published = 1 ORDER BY published_at DESC LIMIT 30`
    ).all(), 1, 50);

    if (rows?.results && rows.results.length > 0) {
      const dbArticles = (rows.results || []).map((row: any) => {
        const parsed = JSON.parse(row.data);
        return {
          title: parsed.title,
          slug: parsed.slug,
          summary: parsed.content ? parsed.content.replace(/<[^>]*>/g, '').substring(0, 150).trim() + '...' : '',
          publishedAt: new Date(row.published_at).toISOString().split('T')[0],
          content: parsed.content
        };
      });
      articles = [...dbArticles, ...articles];
    }
  } catch (err) {
    console.warn('DB blog fetch failed, using fallback seed articles');
  }

  const tTable: Record<string, any> = {
    ar: {
      title: 'مدونة المهنة - إسطنبول',
      subtitle: 'مقالات ونصائح مهنية تهمك حول إقامة العمل، السيرة الذاتية، والنقل والمواصلات في إسطنبول.',
      readMore: 'اقرأ المزيد ←',
      pubDate: 'تاريخ النشر:',
      featured: 'مقال مميز'
    },
    en: {
      title: 'Career Blog - Istanbul',
      subtitle: 'Insights and career advice on work permits, CV optimizations, and transportation guides in Istanbul.',
      readMore: 'Read More ←',
      pubDate: 'Published:',
      featured: 'Featured Post'
    },
    tr: {
      title: 'Kariyer Blogu - İstanbul',
      subtitle: 'İstanbul\'da çalışma izinleri, CV optimizasyonu ve ulaşım rehberi hakkında ipuçları ve kariyer tavsiyeleri.',
      readMore: 'Devamını Oku ←',
      pubDate: 'Yayınlanma Tarihi:',
      featured: 'Öne Çıkan Yazı'
    },
    ru: {
      title: 'Блог о карьере - Стамбул',
      subtitle: 'Полезные статьи о поиске работы, разрешениях на работу и жизни экспатов в Стамбуле.',
      readMore: 'Читать дальше ←',
      pubDate: 'Дата публикации:',
      featured: 'Рекомендуемая статья'
    },
    fa: {
      title: 'وبلاگ کاریابی و زندگی در استانبول',
      subtitle: 'مقالات، راهنماها و توصیه‌های مفید برای اجازه کار، بهینه‌سازی رزومه و راهنمای حمل و نقل در استانبول.',
      readMore: 'ادامه مطلب ←',
      pubDate: 'تاریخ انتشار:',
      featured: 'مطلب ویژه'
    },
    ur: {
      title: 'کیریئر اور روزگار بلاگ - استنبول',
      subtitle: 'استنبول میں ملازمت تلاش کرنے، ورک پرمٹ اور زندگی کے بارے میں مفید رہنمائی۔',
      readMore: 'مزید پڑھیں ←',
      pubDate: 'تاریخ اشاعت:',
      featured: 'نمایاں مضمون'
    },
    id: {
      title: 'Blog Kariyer & Islami - Istanbul',
      subtitle: 'Panduan karier, izin kerja, aplikasi Islami, dan kehidupan di Istanbul.',
      readMore: 'Baca Selengkapnya ←',
      pubDate: 'Tanggal Publikasi:',
      featured: 'Artikel Pilihan'
    },
    fr: {
      title: 'Blog Carrière & Vie - Istanbul',
      subtitle: 'Conseils professionnels, permis de travail, applications islamiques et vie à Istanbul.',
      readMore: 'Lire la suite ←',
      pubDate: 'Date de publication :',
      featured: 'Article à la une'
    },
    bn: {
      title: 'ক্যারিয়ার ও ইসলামিক ব্লগ - ইস্তাম্বুল',
      subtitle: 'ইস্তাম্বুলে কর্মসংস্থান, কাজের অনুমতি, ইসলামিক অ্যাপ ও জীবনযাপন সহায়িকা।',
      readMore: 'আরও পড়ুন ←',
      pubDate: 'প্রকাশের তারিখ:',
      featured: 'বিশেষ নিবন্ধ'
    },
    de: {
      title: 'Karriere & Lifestyle Blog - Istanbul',
      subtitle: 'Karrieretipps, Arbeitserlaubnis, islamische Apps und Leben in Istanbul.',
      readMore: 'Mehr lesen ←',
      pubDate: 'Veröffentlichungsdatum:',
      featured: 'Empfohlener Beitrag'
    }
  };

  const t = tTable[locale] || tTable['en'];

  if (articles.length === 0) {
    return c.html(renderLayout(c, t.title, `<div class="container" style="padding: 100px 20px; text-align: center; color: var(--text-muted);">${locale === 'ar' ? 'لا توجد مقالات حالياً.' : 'No articles available.'}</div>`, locale, ''));
  }

  const styles = `
    <style>
      .blog-hero-card {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 32px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        overflow: hidden;
        margin-bottom: 50px;
        box-shadow: var(--shadow-sm);
        transition: transform var(--t-base), box-shadow var(--t-base);
        align-items: stretch;
      }
      .blog-hero-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }
      .blog-hero-image-wrap {
        position: relative;
        overflow: hidden;
        min-height: 350px;
        background: var(--bg-subtle);
      }
      .blog-hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--t-base);
      }
      .blog-hero-card:hover .blog-hero-image {
        transform: scale(1.03);
      }
      .blog-hero-content {
        padding: 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 30px;
      }
      
      .blog-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: var(--shadow-sm);
        transition: transform var(--t-base), box-shadow var(--t-base);
      }
      .blog-card:hover {
        transform: translateY(-6px);
        box-shadow: var(--shadow-md);
      }
      .blog-card-image-wrap {
        position: relative;
        padding-top: 56.25%; /* 16:9 Aspect Ratio */
        overflow: hidden;
        background: var(--bg-subtle);
      }
      .blog-card-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--t-base);
      }
      .blog-card:hover .blog-card-image {
        transform: scale(1.05);
      }
      .blog-card-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      
      .category-badge {
        display: inline-block;
        padding: 4px 10px;
        font-size: 0.75rem;
        font-weight: 700;
        border-radius: var(--radius-sm);
        color: #fff;
        width: fit-content;
        margin-bottom: 12px;
      }
      
      .blog-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-bottom: 12px;
      }
      
      .blog-card-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-dark);
        line-height: 1.4;
        margin-bottom: 10px;
        transition: color var(--t-base);
      }
      .blog-card:hover .blog-card-title {
        color: var(--primary);
      }

      .blog-card-summary {
        color: var(--text-muted);
        font-size: 0.9rem;
        line-height: 1.6;
        margin-bottom: 20px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      @media (max-width: 768px) {
        .blog-hero-card {
          grid-template-columns: 1fr;
        }
        .blog-hero-image-wrap {
          min-height: 220px;
        }
        .blog-hero-content {
          padding: 24px;
        }
      }
    </style>
  `;

  const featured = articles[0];
  const restOfArticles = articles.slice(1);

  const adLabelsTable: Record<string, any> = {
    ar: {
      sectionTitle: 'فرص عمل مميزة للأجانب في إسطنبول',
      badge: 'إعلانات نشطة',
      browseAll: 'تصفح جميع الوظائف المتاحة',
      apply: 'قدّم الآن',
      roles: [
        { title: 'مطور برمجيات أول (Senior Node.js Developer)', company: 'Insider', type: 'دوام كامل | هجين', salary: 'رواتب مجزية' },
        { title: 'أخصائي خدمة عملاء باللغة العربية', company: 'Teleperformance', type: 'دوام كامل | عن بعد', salary: 'تأمين + حوافز' },
        { title: 'مصمم واجهات ومجرب مستخدم (UI/UX Designer)', company: 'Trendyol', type: 'دوام كامل | موقع العمل', salary: 'مزايا متكاملة' }
      ]
    },
    en: {
      sectionTitle: 'Featured Jobs for Foreigners in Istanbul',
      badge: 'Live Ads',
      browseAll: 'Browse All Open Positions',
      apply: 'Apply Now',
      roles: [
        { title: 'Senior Node.js Developer', company: 'Insider', type: 'Full-Time | Hybrid', salary: 'Competitive' },
        { title: 'Arabic Customer Support Specialist', company: 'Teleperformance', type: 'Full-Time | Remote', salary: 'Basic + Bonus' },
        { title: 'UI/UX Product Designer', company: 'Trendyol', type: 'Full-Time | On-Site', salary: 'Full Benefits' }
      ]
    },
    tr: {
      sectionTitle: 'İstanbul\'da Yabancılar İçin Öne Çıkan İşler',
      badge: 'Aktif İlanlar',
      browseAll: 'Tüm İlanları İncele',
      apply: 'Hemen Başvur',
      roles: [
        { title: 'Senior Node.js Developer', company: 'Insider', type: 'Tam Zamanlı | Hibrit', salary: 'Dolgun Ücret' },
        { title: 'Arapça Müşteri Temsilcisi', company: 'Teleperformance', type: 'Tam Zamanlı | Uzaktan', salary: 'SGK + Prim' },
        { title: 'UI/UX Ürün Tasarımcısı', company: 'Trendyol', type: 'Tam Zamanlı | Ofiste', salary: 'Yan Haklar' }
      ]
    },
    ru: {
      sectionTitle: 'Рекомендуемые вакансии для иностранцев в Стамбуле',
      badge: 'Активные вакансии',
      browseAll: 'Все открытые вакансии',
      apply: 'Подать заявку',
      roles: [
        { title: 'Senior Node.js Developer', company: 'Insider', type: 'Полный день | Гибрид', salary: 'Конкурентная' },
        { title: 'Arabic Customer Support Specialist', company: 'Teleperformance', type: 'Полный день | Удаленно', salary: 'Оклад + Бонус' },
        { title: 'UI/UX Product Designer', company: 'Trendyol', type: 'Полный день | В офисе', salary: 'Полный соцпакет' }
      ]
    },
    fa: {
      sectionTitle: 'مشاغل پیشنهادی برای ایرانیان و فارسی‌زبانان در استانبول',
      badge: 'آگهی‌های فعال',
      browseAll: 'تصفیه و مشاهده همه مشاغل',
      apply: 'ارسال درخواست',
      roles: [
        { title: 'برنامه‌نویس ارشد Node.js', company: 'Insider', type: 'تمام وقت | هیبرید', salary: 'حقوق عالی' },
        { title: 'کارشناس پشتیبانی مشتریان (فارسی‌زبان)', company: 'Teleperformance', type: 'تمام وقت | دورکاری', salary: 'حقوق ثابت + پاداش' },
        { title: 'طراح ارشد رابط کاربری (UI/UX)', company: 'Trendyol', type: 'تمام وقت | حضوری', salary: 'مزایای کامل رفاهی' }
      ]
    },
    ur: {
      sectionTitle: 'استنبول میں اردو بولنے والوں کے لیے موزوں ملازمتیں',
      badge: 'سرگرم آسامیاں',
      browseAll: 'تمام نوکریاں دیکھیں',
      apply: 'درخواست دیں',
      roles: [
        { title: 'برنامه‌نویس ارشد Node.js', company: 'Insider', type: 'تمام وقت | ہائبرڈ', salary: 'پرکشش تنخواہ' },
        { title: 'کسٹمر سپورٹ نمائندہ (اردو بولنے والا)', company: 'Teleperformance', type: 'تمام وقت | ریموٹ', salary: 'تنخواہ + بونس' },
        { title: 'UI/UX پروڈکٹ ڈیزائنر', company: 'Trendyol', type: 'تمام وقت | آن سائٹ', salary: 'مکمل مراعات' }
      ]
    }
  };
  const adLabels = adLabelsTable[locale] || adLabelsTable['en'];

  const adHtml = `
    <div class="job-ad-container" style="margin-bottom: 50px; background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 32px; box-shadow: var(--shadow-sm); position: relative; overflow: hidden;">
      <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: var(--primary); opacity: 0.05; border-radius: 50%; filter: blur(40px);"></div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 700;">
            <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse-green 2s infinite;"></span>
            ${adLabels.badge}
          </span>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-dark); margin: 0;">${adLabels.sectionTitle}</h3>
        </div>
        <a href="/${locale}#jobs-anchor" class="btn-apply-now" style="font-size: 0.85rem; padding: 8px 18px; width: fit-content; text-decoration: none;">${adLabels.browseAll}</a>
      </div>

      <style>
        @keyframes pulse-green {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .job-ad-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .job-ad-item {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          transition: transform var(--t-base), box-shadow var(--t-base), border-color var(--t-base);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .job-ad-item:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
      </style>

      <div class="job-ad-row">
        ${adLabels.roles.map((role: any) => `
          <div class="job-ad-item">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">${role.company}</span>
                <span style="font-size: 0.75rem; background: var(--bg-subtle); border: 1px solid var(--border); padding: 2px 8px; border-radius: var(--radius-sm); color: var(--text-body);">${role.salary}</span>
              </div>
              <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-dark); margin: 0 0 10px 0; line-height: 1.4;">${role.title}</h4>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
                <i class="fa-solid fa-briefcase" style="margin-right: 4px;"></i> ${role.type}
              </div>
            </div>
            <a href="/${locale}#jobs-anchor" class="btn-apply-now" style="font-size: 0.8rem; padding: 6px 14px; text-align: center; text-decoration: none; display: block; border-radius: var(--radius-md); font-weight: 700;">${adLabels.apply}</a>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const featuredImg = extractFirstImage(featured.content, featured);
  const featuredCat = getCategory(featured.slug, locale);
  const featuredTime = getReadingTime(featured.content, locale);
  const featuredCleanSummary = featured.summary || featured.content.replace(/<[^>]*>/g, '').substring(0, 180).trim() + '...';

  const featuredHtml = `
    <div class="blog-hero-card">
      <div class="blog-hero-image-wrap">
        <img class="blog-hero-image" src="${featuredImg}" alt="${featured.title}">
      </div>
      <div class="blog-hero-content">
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.75rem; background: var(--primary); color: #fff; padding: 2px 8px; border-radius: var(--radius-sm); font-weight: 700;">${t.featured}</span>
          <span class="category-badge" style="background: ${featuredCat.color}; margin-bottom: 0;">${featuredCat.name}</span>
        </div>
        <h2 style="font-size: 1.75rem; font-weight: 800; margin-bottom: 12px; line-height: 1.3;"><a href="/${locale}/blog/${featured.slug}" style="color: var(--text-dark); transition: color var(--t-base); text-decoration: none;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-dark)'">${featured.title}</a></h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;">${featuredCleanSummary}</p>
        <div class="blog-meta" style="margin-bottom: 24px;">
          <span><i class="fa-regular fa-calendar"></i> ${featured.publishedAt}</span>
          <span><i class="fa-regular fa-clock"></i> ${featuredTime}</span>
        </div>
        <a href="/${locale}/blog/${featured.slug}" class="btn-apply-now" style="width: fit-content;">${t.readMore}</a>
      </div>
    </div>
  `;

  const listHtml = restOfArticles.map((art: any) => {
    const img = extractFirstImage(art.content, art);
    const cat = getCategory(art.slug, locale);
    const time = getReadingTime(art.content, locale);
    const cleanSummary = art.summary || art.content.replace(/<[^>]*>/g, '').substring(0, 120).trim() + '...';

    return `
      <article class="blog-card">
        <a href="/${locale}/blog/${art.slug}" class="blog-card-image-wrap">
          <img class="blog-card-image" src="${img}" alt="${art.title}">
        </a>
        <div class="blog-card-content">
          <span class="category-badge" style="background: ${cat.color};">${cat.name}</span>
          <h3 class="blog-card-title"><a href="/${locale}/blog/${art.slug}" style="color: inherit; text-decoration: none;">${art.title}</a></h3>
          <p class="blog-card-summary">${cleanSummary}</p>
          <div class="blog-meta" style="margin-top: auto; margin-bottom: 16px;">
            <span><i class="fa-regular fa-calendar"></i> ${art.publishedAt}</span>
            <span><i class="fa-regular fa-clock"></i> ${time}</span>
          </div>
          <a href="/${locale}/blog/${art.slug}" class="btn-apply-now" style="width: fit-content;">${t.readMore}</a>
        </div>
      </article>
    `;
  }).join('');

  const html = `
    ${styles}
    <div class="container" style="padding: 60px 20px; margin-bottom: 100px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 50px; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>
 
      ${featuredHtml}

      ${adHtml}

      <div class="blog-grid">
        ${listHtml}
      </div>
    </div>
  `;

  const seoHtml = generateMetaTags(locale, 'blog') + generateJsonLd(locale, 'blog');
  c.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400');
  return c.html(renderLayout(c, t.title, html, locale, seoHtml));
});

// Blog Detail View
careerBlogRouter.get('/:locale/blog/:slug', async (c) => {
  const locale = c.req.param('locale') as any;
  const slug = c.req.param('slug');
  if (!['ar', 'en', 'tr', 'ru', 'fa', 'ur', 'id', 'fr', 'bn', 'de'].includes(locale)) return c.redirect('/ar/blog');

  const isTrabzonAppArticle = slug === 'trabzon-travel-guide-app-tourism-turkey-2026';

  // Support plain text crawlers / validators fetching the article directly
  if (isTrabzonAppArticle && c.req.header('accept')?.includes('text/plain')) {
    return c.text('google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0\n', 200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    });
  }

  const db = (c.env as any).DB;
  let article = (seededArticles[locale] || []).find((art: any) => art.slug === slug);
  if (!article && slug === 'quran-karim-app-offline-features-download') {
    article = (seededArticles[locale] || []).find((art: any) => art.slug === 'kuran-i-kerim-namaz-vakitleri-uygulamasi-indir')
      || (seededArticles[locale] || [])[0];
  }
  if (!article && slug === 'kuran-i-kerim-namaz-vakitleri-uygulamasi-indir') {
    article = quranAppArticleTr;
  }
  if (!article) {
    article = (seededArticles['ar'] || []).find((art: any) => art.slug === slug)
      || (seededArticles['en'] || []).find((art: any) => art.slug === slug)
      || (seededArticles['tr'] || []).find((art: any) => art.slug === slug);
  }

  try {
    if (!article && db) {
      const dbRow = await safeQuery(() => db.prepare(
        `SELECT data, published_at FROM documents WHERE type_id = 'blog_post' AND slug = ? AND status = 'published' AND is_published = 1`
      ).bind(slug).first(), 1, 50);

      if (dbRow) {
        const parsed = JSON.parse(dbRow.data);
        article = {
          title: parsed.title,
          slug: parsed.slug,
          summary: '',
          publishedAt: new Date(dbRow.published_at).toISOString().split('T')[0],
          content: parsed.content
        };
      }
    }
  } catch (err) {
    console.warn('Failed to look up DB article:', err);
  }

  if (!article) {
    return c.text(locale === 'ar' ? 'المقالة غير موجودة.' : (locale === 'tr' ? 'Yazı bulunamadı.' : (locale === 'fa' ? 'مقاله پیدا نشد.' : 'Article not found.')), 404);
  }

  const cat = getCategory(article.slug, locale);
  const time = getReadingTime(article.content, locale);

  let allArticles: any[] = (seededArticles[locale] && seededArticles[locale].length > 0)
    ? seededArticles[locale]
    : ((seededArticles['ar'] && seededArticles['ar'].length > 0) ? seededArticles['ar'] : seededArticles['en'] || []);

  // Only query DB for additional articles if seed pool is too small (saves D1 full table scans)
  if (allArticles.length < 4 && db) {
    try {
      const rows = await safeQuery(() => db.prepare(
        `SELECT data, published_at FROM documents WHERE type_id = 'blog_post' AND status = 'published' AND is_published = 1 ORDER BY published_at DESC LIMIT 5`
      ).all(), 1, 50);

      if (rows?.results && rows.results.length > 0) {
        const dbArticles = (rows.results || []).map((row: any) => {
          const parsed = JSON.parse(row.data);
          return {
            title: parsed.title,
            slug: parsed.slug,
            summary: parsed.content ? parsed.content.replace(/<[^>]*>/g, '').substring(0, 150).trim() + '...' : '',
            publishedAt: new Date(row.published_at).toISOString().split('T')[0],
            content: parsed.content
          };
        });
        allArticles = [...dbArticles, ...allArticles];
      }
    } catch (err) {
      // ignore
    }
  }

  const otherArticles = allArticles.filter((art: any) => art.slug !== slug).slice(0, 3);

  const tLabelsTable: Record<string, any> = {
    ar: {
      back: '← العودة للمدونة',
      share: 'مشاركة المقال:',
      copySuccess: 'تم نسخ رابط المقال بنجاح!',
      suggested: 'مقالات مقترحة قد تهمك',
      readMore: 'اقرأ المزيد ←'
    },
    en: {
      back: '← Back to Blog',
      share: 'Share Article:',
      copySuccess: 'Article link copied successfully!',
      suggested: 'Suggested Articles You May Like',
      readMore: 'Read More ←'
    },
    tr: {
      back: '← Bloga Geri Dön',
      share: 'Yazıyı Paylaş:',
      copySuccess: 'Yazı bağlantısı başarıyla kopyalandı!',
      suggested: 'İlginizi Çekebilecek Diğer Yazılar',
      readMore: 'Devamını Oku ←'
    },
    ru: {
      back: '← Вернуться в блог',
      share: 'Поделиться статьей:',
      copySuccess: 'Ссылка на статью успешно скопирована!',
      suggested: 'Другие статьи, которые могут вас заинтересовать',
      readMore: 'Читать дальше ←'
    },
    fa: {
      back: '← بازگشت به وبلاگ',
      share: 'اشتراک‌گذاری مقاله:',
      copySuccess: 'لینک مقاله با موفقیت کپی شد!',
      suggested: 'مقالات پیشنهادی دیگر که ممکن است بپسندید',
      readMore: 'ادامه مطلب ←'
    },
    ur: {
      back: '← بلاگ پر واپس جائیں',
      share: 'مضمون شیئر کریں:',
      copySuccess: 'لنک کامیابی سے کاپی ہو گیا ہے!',
      suggested: 'دیگر تجویز کردہ مضامین جو آپ کو پسند آ سکتے ہیں',
      readMore: 'مزید پڑھیں ←'
    },
    id: {
      back: '← Kembali ke Blog',
      share: 'Bagikan Artikel:',
      copySuccess: 'Tautan artikel berhasil disalin!',
      suggested: 'Artikel Rekomendasi Lainnya',
      readMore: 'Baca Selengkapnya ←'
    },
    fr: {
      back: '← Retour au blog',
      share: 'Partager l\'article :',
      copySuccess: 'Lien de l\'article copié avec succès !',
      suggested: 'Articles suggérés qui pourraient vous intéresser',
      readMore: 'Lire la suite ←'
    },
    bn: {
      back: '← ব্লগে ফিরে যান',
      share: 'নিবন্ধটি শেয়ার করুন:',
      copySuccess: 'লিঙ্ক সফলভাবে কপি করা হয়েছে!',
      suggested: 'অন্যান্য প্রস্তাবিত নিবন্ধসমূহ',
      readMore: 'আরও পড়ুন ←'
    },
    de: {
      back: '← Zurück zum Blog',
      share: 'Artikel teilen:',
      copySuccess: 'Artikellink erfolgreich kopiert!',
      suggested: 'Weitere empfohlene Artikel',
      readMore: 'Mehr lesen ←'
    }
  };

  const tLabels = tLabelsTable[locale] || tLabelsTable['en'];

  const shareUrl = `https://jobs-in-istanbul.com/${locale}/blog/${article.slug}`;

  const shareButtonsHtml = `
    <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid var(--border);">
      <h4 style="margin-bottom: 16px; font-size: 1.05rem; font-weight: 700; color: var(--text-dark);">${tLabels.share}</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 12px;">
        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + shareUrl)}" target="_blank" rel="noopener" class="icon-btn" style="background: #25d366; color: #fff; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-size: 1.2rem; transition: transform var(--t-base); text-decoration: none;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
          <i class="fa-brands fa-whatsapp"></i>
        </a>
        <a href="https://telegram.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}" target="_blank" rel="noopener" class="icon-btn" style="background: #0088cc; color: #fff; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-size: 1.2rem; transition: transform var(--t-base); text-decoration: none;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
          <i class="fa-brands fa-telegram"></i>
        </a>
        <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}" target="_blank" rel="noopener" class="icon-btn" style="background: #111; color: #fff; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-size: 1.2rem; transition: transform var(--t-base); text-decoration: none;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
          <i class="fa-brands fa-x-twitter"></i>
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener" class="icon-btn" style="background: #0077b5; color: #fff; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-size: 1.2rem; transition: transform var(--t-base); text-decoration: none;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
          <i class="fa-brands fa-linkedin-in"></i>
        </a>
        <button onclick="copyShareLink()" class="icon-btn" style="background: var(--bg-subtle); color: var(--text-body); border: 1.5px solid var(--border); width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-size: 1.2rem; cursor: pointer; transition: transform var(--t-base);" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
          <i class="fa-regular fa-copy"></i>
        </button>
      </div>
    </div>

    <script>
      function copyShareLink() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
          const toast = document.getElementById('share-toast');
          if (toast) {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            setTimeout(() => {
              toast.style.opacity = '0';
              toast.style.transform = 'translateY(10px)';
            }, 3000);
          }
        }).catch(err => {
          console.error('Failed to copy link: ', err);
        });
      }
    </script>
    <div id="share-toast" style="position: fixed; bottom: 24px; right: 24px; background: #10b981; color: #fff; padding: 12px 24px; border-radius: var(--radius-md); box-shadow: var(--shadow-md); opacity: 0; transform: translateY(10px); transition: opacity var(--t-base), transform var(--t-base); pointer-events: none; z-index: 9999; font-weight: 600; font-size: 0.95rem;">
      ${tLabels.copySuccess}
    </div>
  `;

  const suggestedCardsHtml = otherArticles.map((art: any) => {
    const artContent = art.content || '';
    const img = extractFirstImage(artContent, art);
    const category = getCategory(art.slug, locale);
    const time = getReadingTime(artContent, locale);
    const cleanSummary = art.summary || (artContent ? artContent.replace(/<[^>]*>/g, '').substring(0, 100).trim() + '...' : '');

    return `
      <article class="blog-card">
        <a href="/${locale}/blog/${art.slug}" class="blog-card-image-wrap">
          <img class="blog-card-image" src="${img}" alt="${art.title}">
        </a>
        <div class="blog-card-content">
          <span class="category-badge" style="background: ${category.color};">${category.name}</span>
          <h4 class="blog-card-title"><a href="/${locale}/blog/${art.slug}" style="color: inherit; text-decoration: none;">${art.title}</a></h4>
          <p class="blog-card-summary">${cleanSummary}</p>
          <div class="blog-meta" style="margin-top: auto; margin-bottom: 12px;">
            <span><i class="fa-regular fa-calendar"></i> ${art.publishedAt}</span>
            <span><i class="fa-regular fa-clock"></i> ${time}</span>
          </div>
          <a href="/${locale}/blog/${art.slug}" class="btn-apply-now" style="width: fit-content; padding: 6px 16px; font-size: 0.85rem;">${tLabels.readMore}</a>
        </div>
      </article>
    `;
  }).join('');

  const suggestedWidgetHtml = otherArticles.length > 0 ? `
    <div style="margin-top: 60px; padding-top: 40px; border-top: 2px solid var(--border);">
      <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 24px;">${tLabels.suggested}</h3>
      <div class="blog-grid">
        ${suggestedCardsHtml}
      </div>
    </div>
  ` : '';

  const styles = `
    <style>
      .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 24px;
      }
      .blog-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: var(--shadow-sm);
        transition: transform var(--t-base), box-shadow var(--t-base);
      }
      .blog-card:hover {
        transform: translateY(-6px);
        box-shadow: var(--shadow-md);
      }
      .blog-card-image-wrap {
        position: relative;
        padding-top: 56.25%;
        overflow: hidden;
        background: var(--bg-subtle);
      }
      .blog-card-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--t-base);
      }
      .blog-card:hover .blog-card-image {
        transform: scale(1.05);
      }
      .blog-card-content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .category-badge {
        display: inline-block;
        padding: 3px 8px;
        font-size: 0.7rem;
        font-weight: 700;
        border-radius: var(--radius-sm);
        color: #fff;
        width: fit-content;
        margin-bottom: 10px;
      }
      .blog-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-bottom: 8px;
      }
      .blog-card-title {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--text-dark);
        line-height: 1.4;
        margin-bottom: 8px;
        transition: color var(--t-base);
      }
      .blog-card:hover .blog-card-title {
        color: var(--primary);
      }
      .blog-card-summary {
        color: var(--text-muted);
        font-size: 0.85rem;
        line-height: 1.5;
        margin-bottom: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    </style>
  `;

  const detailAdLabelsTable: Record<string, any> = {
    ar: {
      title: 'هل تبحث عن عمل في تركيا؟',
      desc: 'سجل في بوابة الوظائف بإسطنبول، واحصل على إشعار بالفرص المهنية الجديدة المتوافقة مع مؤهلاتك فور نشرها.',
      btnSearch: 'تصفح الوظائف المتاحة',
      btnRegister: 'سجل سيرتك الذاتية',
    },
    en: {
      title: 'Are you looking for work in Turkey?',
      desc: 'Register on the Istanbul Job Portal and get notified of new career opportunities matching your profile as soon as they are posted.',
      btnSearch: 'Browse Available Jobs',
      btnRegister: 'Upload Your CV',
    },
    tr: {
      title: 'Türkiye\'de iş mi arıyorsunuz?',
      desc: 'İstanbul İş Portalı\'na kaydolun ve profilinize uygun yeni kariyer fırsatları yayınlandığı anda bildirim alın.',
      btnSearch: 'Mevcut İşleri İncele',
      btnRegister: 'Özgeçmişini Yükle',
    },
    ru: {
      title: 'Вы ищете работу в Турции?',
      desc: 'Зарегистрируйтесь на Стамбульском портале вакансий и получайте уведомления о новых возможностях, как только они будут опубликованы.',
      btnSearch: 'Посмотреть вакансии',
      btnRegister: 'Загрузить резюме',
    },
    fa: {
      title: 'آیا به دنبال کار در ترکیه هستید؟',
      desc: 'در پورتال استخدامی استانبول ثبت‌نام کنید و به محض انتشار فرصت‌های شغلی جدید، باخبر شوید.',
      btnSearch: 'مشاهده فرصت‌های شغلی',
      btnRegister: 'ارسال رزومه',
    },
    ur: {
      title: 'کیا آپ ترکی میں نوکری تلاش کر رہے ہیں؟',
      desc: 'استنبول جاب پورٹل پر رجسٹر ہوں اور نئے کیریئر کے مواقع کی فوری اطلاع حاصل کریں۔',
      btnSearch: 'ملازمتیں دیکھیں',
      btnRegister: 'سی وی اپ لوڈ کریں',
    },
    id: {
      title: 'Apakah Anda mencari pekerjaan di Turki?',
      desc: 'Daftar di Portal Lowongan Kerja Istanbul dan dapatkan pemberitahuan lowongan baru.',
      btnSearch: 'Lihat Lowongan',
      btnRegister: 'Unggah CV',
    },
    fr: {
      title: 'Vous cherchez du travail en Turquie ?',
      desc: 'Inscrivez-vous sur le portail des emplois d\'Istanbul et recevez des alertes.',
      btnSearch: 'Voir les offres',
      btnRegister: 'Déposer votre CV',
    },
    bn: {
      title: 'আপনি কি তুরস্কে চাকরি খুঁজছেন?',
      desc: 'ইস্তাম্বুল জব পোর্টালে নিবন্ধন করুন এবং নতুন সুযোগ সম্পর্কে অবিলম্বে অবহিত হন।',
      btnSearch: 'চাকরি দেখুন',
      btnRegister: 'সিভি জমা দিন',
    },
    de: {
      title: 'Suchen Sie Arbeit in der Türkei?',
      desc: 'Registrieren Sie sich im Istanbul Jobportal und erhalten Sie Benachrichtigungen über neue Stellenangebote.',
      btnSearch: 'Jobs ansehen',
      btnRegister: 'Lebenslauf hochladen',
    }
  };
  const detailAdLabels = detailAdLabelsTable[locale] || detailAdLabelsTable['en'];

  const detailAdHtml = `
    <div class="detail-job-ad-widget" style="margin-top: 40px; margin-bottom: 40px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1.5px dashed var(--primary); border-radius: var(--radius-lg); padding: 30px; text-align: center; position: relative;">
      <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-dark); margin: 0 0 10px 0;">${detailAdLabels.title}</h3>
      <p style="font-size: 0.95rem; color: var(--text-muted); max-width: 600px; margin: 0 auto 20px auto; line-height: 1.6;">${detailAdLabels.desc}</p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <a href="/${locale}#jobs-anchor" class="btn-apply-now" style="padding: 10px 24px; font-size: 0.9rem; text-decoration: none;">${detailAdLabels.btnSearch}</a>
        <a href="/${locale}/candidate/login" class="btn-apply-now" style="padding: 10px 24px; font-size: 0.9rem; background: var(--bg-card); color: var(--text-dark); border: 1px solid var(--border); text-decoration: none;" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='var(--bg-card)'">${detailAdLabels.btnRegister}</a>
      </div>
    </div>
  `;

  const html = `
    ${styles}
    <div class="container" style="max-width: 850px; padding: 60px 20px; margin-bottom: 100px;">
      <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <a href="/${locale}/blog" style="color: var(--primary); font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 4px;">${tLabels.back}</a>
        <span class="category-badge" style="background: ${cat.color}; margin-bottom: 0;">${cat.name}</span>
      </div>

      <article class="glass-card" style="padding: 40px; border-radius: var(--radius-xl);">
        <div class="blog-meta" style="margin-bottom: 12px; font-size: 0.85rem;">
          <span><i class="fa-regular fa-calendar"></i> ${locale === 'ar' ? 'تم النشر في:' : (locale === 'tr' ? 'Yayınlanma Tarihi:' : 'Published At:')} ${article.publishedAt}</span>
          <span><i class="fa-regular fa-clock"></i> ${time}</span>
        </div>
        <h1 style="font-size: 2.25rem; font-weight: 800; color: var(--text-dark); margin-bottom: 30px; line-height: 1.3;">${article.title}</h1>
        
        <div class="detail-body" style="font-size: 1.1rem; line-height: 1.8; color: var(--text-dark);">
          ${article.content}
          ${isTrabzonAppArticle ? `
            <!-- Google AdMob app-ads.txt Verification Snippet (Invisible to users, readable by crawlers/bots) -->
            <div id="admob-app-ads-verification" style="display:none !important; visibility:hidden; opacity:0; height:0; width:0; overflow:hidden;" aria-hidden="true" data-nosnippet>
              google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0
            </div>
          ` : ''}
        </div>

        ${detailAdHtml}

        ${shareButtonsHtml}
      </article>

      ${suggestedWidgetHtml}
    </div>
  `;

  const cleanSummary = article.summary || article.content.substring(0, 160).replace(/<[^>]*>/g, '');
  const articleImg = article.image || extractFirstImage(article.content, article);
  const availableLocales = getArticleAvailableLocales(article.slug);
  const seoHtml = generateMetaTags(locale, 'blog_post', {
    title: article.title,
    description: cleanSummary,
    slug: article.slug,
    image: articleImg,
    publishedAt: new Date(article.publishedAt).getTime(),
    updatedAt: article.updatedAt ? new Date(article.updatedAt).getTime() : Date.now(),
    canonical: article.canonical || `https://jobs-in-istanbul.com/${locale}/blog/${article.slug}`,
    availableLocales,
  }) + generateJsonLd(locale, 'blog_post', {
    title: article.title,
    description: cleanSummary,
    slug: article.slug,
    image: articleImg,
    publishedAt: new Date(article.publishedAt).getTime(),
    updatedAt: article.updatedAt ? new Date(article.updatedAt).getTime() : Date.now(),
    faqs: article.faqs || [],
  });

  const appAdsMeta = isTrabzonAppArticle ? `
    <meta name="google-admob-ads-txt" content="google.com, pub-2220383290034920, DIRECT, f08c47fec0942fa0">
    <link rel="app-ads" href="/app-ads.txt">
  ` : '';

  c.header('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400');
  return c.html(renderLayout(c, article.title, html, locale, seoHtml + appAdsMeta));
});
