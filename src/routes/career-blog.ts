import { Hono } from 'hono'
import { renderLayout } from './public'
import { generateMetaTags, generateJsonLd } from '../utils/seo-helper'

export const careerBlogRouter = new Hono()

// Fallback hardcoded seeded articles if the database is empty
const seededArticles: Record<string, any[]> = {
  ar: [
    {
      title: 'قوانين إقامة العمل في تركيا للأجانب والبريطانيين ٢٠٢٦',
      slug: 'turkey-work-permit-residency-laws',
      summary: 'دليلك الشامل حول القوانين والتعليمات الجديدة للحصول على إقامة عمل في إسطنبول، وتفاصيل تعديل القوانين للمواطنين البريطانيين والأجانب.',
      publishedAt: '2026-06-20',
      content: `
        <p>يعتبر الحصول على إقامة العمل (Çalışma İzni) في تركيا خطوة بالغة الأهمية لأي مواطن أجنبي يرغب في العمل بشكل قانوني وتجنب الغرامات أو الترحيل. وقد شهدت القوانين والتشريعات في السنوات الأخيرة تعديلات تنظيمية تهدف إلى تنظيم سوق العمل المحلي وضمان حقوق العمال الأجانب وأصحاب العمل على حد سواء.</p>
        
        <h3>١. الشروط الأساسية للحصول على إقامة العمل:</h3>
        <ul>
          <li><strong>وجود صاحب عمل تركي:</strong> لا يمكن للفرد التقديم مباشرة بنفسه، بل يجب أن تقوم الشركة أصحاب العمل بتقديم الطلب نيابة عن الموظف.</li>
          <li><strong>شرط العمالة المحلية:</strong> تشترط وزارة العمل التركية تعيين 5 مواطنين أترك مقابل كل موظف أجنبي واحد في الشركة.</li>
          <li><strong>الحد الأدنى للأجور:</strong> تفرض القوانين حداً أدنى للراتب المدفوع للأجنبي يختلف حسب التخصص (مثلاً: 6.5 أضعاف الحد الأدنى للأجور للمدراء التنفيذيين، و 1.5 ضعف للموظفين التقنيين أو المهندسين).</li>
        </ul>

        <h3>٢. وضع المواطنين البريطانيين بعد خروج بريطانيا من الاتحاد الأوروبي (Brexit):</h3>
        <p>منذ خروج المملكة المتحدة من الاتحاد الأوروبي، يتم معاملة المواطنين البريطانيين بموجب القوانين العامة المطبقة على الرعايا الأجانب من الدول الثالثة. هذا يعني وجوب استصدار فيزا عمل رسمية عبر القنصليات التركية في بريطانيا قبل الدخول، أو تحويل إقامة السياحة السارية مباشرة داخل تركيا إلى إقامة عمل عند توقيع عقد مع شركة محلية.</p>

        <h3>٣. نصائح هامة للمتقدمين:</h3>
        <p>تأكد دائماً من أن جواز سفرك سارٍ لمدة لا تقل عن 6 أشهر عند تقديم الطلب، وقم بتصديق وترجمة شهاداتك الأكاديمية رسمياً (مع ختم الأبوستيل Apostille إذا تطلب الأمر) لتسريع إجراءات الموافقة لدى وزارة العمل في أنقرة.</p>
      `
    },
    {
      title: 'كيف تعدل سيرتك الذاتية لتتخطى أنظمة الفرز الذكية (ATS)؟',
      slug: 'optimize-resume-to-pass-ats-systems',
      summary: 'تعرف على أفضل النصائح لتعديل وتنسيق سيرتك الذاتية لتتوافق مع خوارزميات الفرز الآلية التي تستخدمها كبرى الشركات في إسطنبول.',
      publishedAt: '2026-06-18',
      content: `
        <p>تستخدم اليوم أكثر من 75% من الشركات الكبرى في إسطنبول وتركيا نظاماً إلكترونياً يُعرف بـ <strong>Applicant Tracking System (ATS)</strong> لفرز وتصنيف مئات طلبات التوظيف الواردة يومياً. إذا لم تكن سيرتك الذاتية مهيأة للتعامل مع هذا النظام، فقد يتم استبعادك تلقائياً دون أن يقرأها أي إنسان.</p>
        
        <h3>١. استخدم الكلمات المفتاحية الذكية:</h3>
        <p>تقوم أنظمة ATS بالبحث عن مصطلحات محددة مذكورة في الوصف الوظيفي. قم بقراءة الإعلان بدقة واستخرج الكلمات الأساسية (مثل: TypeScript, Project Management, SEO) وتأكد من تضمينها نصاً في سيرتك الذاتية في قسم المهارات أو الخبرات.</p>

        <h3>٢. التنسيق البسيط والنظيف:</h3>
        <ul>
          <li>تجنب استخدام الجداول، الأشكال المعقدة، الرسوم البيانية، أو الأيقونات. الأنظمة الآلية لا تستطيع قراءتها وقد تفسرها كنصوص فارغة.</li>
          <li>استخدم خطوطاً قياسية واضحة مثل Arial, Calibri, Roboto.</li>
          <li>احفظ الملف دائماً بصيغة <strong>PDF</strong> أو <strong>DOCX</strong> وتجنب استخدام صيغ الصور (PNG, JPG).</li>
        </ul>

        <h3>٣. هيكلة واضحة للأقسام:</h3>
        <p>استخدم عناوين الأقسام التقليدية بدلاً من المبتكرة. على سبيل المثال، اكتب "Work Experience" بدلاً من "My Professional Journey" ليفهم النظام مباشرة تصنيف النص المكتوب تحتها.</p>
      `
    },
    {
      title: 'نصائح هامة لاختيار موقع العمل وتجنب أزمة المواصلات في إسطنبول',
      slug: 'avoid-istanbul-traffic-and-transportation-tips',
      summary: 'لماذا يُعد القرب من خط المتروبوس أو المترو المعيار الأهم عند قبول عرض وظيفي في إسطنبول؟ نصائح وتوجيهات عملية للباحثين عن عمل.',
      publishedAt: '2026-06-15',
      content: `
        <p>تشتهر مدينة إسطنبول بجمالها وعراقتها، ولكنها تشتهر أيضاً بزحامها المروري الخانق. إذا قبلت عرضاً وظيفياً يقع على مسافة بعيدة من سكنك دون وسيلة مواصلات سريعة، فقد تقضي ما بين ٣ إلى ٤ ساعات يومياً في المواصلات العامة فقط!</p>
        
        <h3>١. العمود الفقري للنقل: المتروبوس (Metrobüs)</h3>
        <p>يمتد خط المتروبوس على طول الطريق السريع E-5 من الجانب الآسيوي (Söğütlüçeşme) إلى أقصى الجانب الأوروبي (Beylikdüzü). يملك this الخط ممراً خاصاً معزولاً عن السيارات، مما يجعله الوسيلة الأسرع لتجاوز زحمة السير. الحصول على وظيفة قريبة من المتروبوس يوفر عليك وقتاً هائلاً.</p>

        <h3>٢. خطوط المترو الرئيسية:</h3>
        <ul>
          <li><strong>خط M2:</strong> يربط بين حجي عثمان ويني كابي، ويمر بمناطق الأعمال الرئيسية مثل ششلي (Mecidiyeköy)، ليفنت (Levent)، ومسلك (Maslak).</li>
          <li><strong>خط M4:</strong> يخدم الجانب الآسيوي ويمر بكاديكوي وكارتال.</li>
        </ul>

        <h3>٣. نصيحة ذهبية:</h3>
        <p>عند التفاوض على العمل، اسأل دائماً عما إذا كانت الشركة تقدم <strong>بدل مواصلات (Yol Ücreti)</strong> أو كرت مواصلات إسطنبول كارت (İstanbulkart)، وحاول تصفية خياراتك في مناطق مترابطة بخطوط حديدية لتضمن توازناً صحياً بين حياتك المهنية والشخصية.</p>
      `
    },
    {
      title: 'الحد الأدنى للأجور وتكلفة صاحب العمل في تركيا 2026: حسابات تفصيلية ودليل شامل',
      slug: 'turkey-minimum-wage-employer-cost-2026',
      summary: 'تعرف بالتفصيل على الحد الأدنى للأجور في تركيا لعام 2026 للعمال وأصحاب العمل. تحليل شامل للحسابات الصافية والإجمالية، والخصومات، والتكاليف الفعلية المترتبة على الشركات مع الحوافز.',
      publishedAt: '2026-06-25',
      content: `
        <div class="article-rich-text">
          <img src="https://images.unsplash.com/photo-1625225230517-7426c1be750c?q=80&w=1200" alt="الحد الأدنى للأجور في تركيا 2026" style="width: 100%; height: auto; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--shadow-md);">
          
          <p>يعد الإعلان عن <strong>الحد الأدنى للأجور في تركيا لعام 2026</strong> حدثاً اقتصادياً محورياً يترقبه ملايين العمال والموظفين، لاسيما الكفاءات العربية والأجنبية المقيمة في إسطنبول، كما يمثل ركيزة أساسية لأرباب العمل والشركات الصغيرة والمتوسطة (SMEs) عند تخطيط الميزانيات السنوية وحساب تكاليف التشغيل. يهدف هذا الدليل الشامل والمهني إلى تفصيل هيكلة الرواتب الجديدة، والخصومات القانونية المترتبة على العامل، وحساب التكلفة الفعلية الشاملة على صاحب العمل مع استعراض الحوافز الحكومية المتوفرة.</p>

          <h2>أولاً: أرقام الحد الأدنى للأجور في تركيا 2026 بالتفصيل</h2>
          <p>مع بداية عام 2026، حددت السلطات التركية المعايير الرسمية للأجور على النحو التالي:</p>
          <ul>
            <li><strong>الحد الأدنى للأجر الإجمالي (Brüt Asgari Ücret):</strong> 33,030.00 ليرة تركية.</li>
            <li><strong>الحد الأدنى للأجر الصافي (Net Asgari Ücret):</strong> 28,075.50 ليرة تركية.</li>
          </ul>
          <p>يمثل الأجر الصافي المبلغ الفعلي الذي يدخل الحساب المصرفي للموظف في نهاية كل شهر بعد اقتطاع حصته من التأمينات والضرائب، وهو ما يعتمد عليه الفرد لتغطية نفقات المعيشة والإيجار والمواصلات في مدن كبرى مثل إسطنبول.</p>

          <h2>ثانياً: جدول الخصومات والاقتطاعات القانونية من راتب الموظف</h2>
          <p>لفهم كيفية تحول الراتب من الإجمالي (33,030.00 ليرة) إلى الصافي (28,075.50 ليرة)، يجب الاطلاع على الخصومات الرسمية التي يتم اقتطاعها مباشرة من راتب العامل لصالح مؤسسة الضمان الاجتماعي التركية (SGK):</p>
          
          <table class="table-custom" style="width: 100%; border-collapse: collapse; margin-bottom: 24px; text-align: start; font-size: 0.95rem;">
            <thead>
              <tr style="background: var(--bg-subtle); border-bottom: 2px solid var(--border);">
                <th style="padding: 12px; font-weight: 700;">بند الخصم القانوني</th>
                <th style="padding: 12px; font-weight: 700;">النسبة المئوية</th>
                <th style="padding: 12px; font-weight: 700;">القيمة بالليرة التركية (TRY)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 12px;">قسط الضمان الاجتماعي للعامل (SGK İşçi Payı)</td>
                <td style="padding: 12px;">14%</td>
                <td style="padding: 12px;">4,624.20 ليرة تركية</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 12px;">قسط تأمين البطالة للعامل (İşsizlik Sigortası İşçi Payı)</td>
                <td style="padding: 12px;">1%</td>
                <td style="padding: 12px;">330.30 ليرة تركية</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border); font-weight: 700; background: var(--bg-card);">
                <td style="padding: 12px;">إجمالي الاقتطاعات من راتب الموظف</td>
                <td style="padding: 12px;">15%</td>
                <td style="padding: 12px;">4,954.50 ليرة تركية</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    }
  ],
  en: [
    {
      title: 'Work Residency & Permit Regulations in Turkey for Foreigners (2026)',
      slug: 'turkey-work-permit-residency-laws',
      summary: 'A comprehensive guide to the latest rules and procedures for obtaining a work permit in Istanbul, including specific insights for British nationals.',
      publishedAt: '2026-06-20',
      content: `
        <p>Obtaining a work permit (Çalışma İzni) in Turkey is essential for any foreign national wishing to work legally and avoid fines or deportation. Recent changes in local labor laws have aimed to organize labor force demographics and protect rights for both employers and employees.</p>
      `
    },
    {
      title: 'How to Optimize Your Resume to Pass Modern ATS Software',
      slug: 'optimize-resume-to-pass-ats-systems',
      summary: 'Learn key optimization techniques to formatting your CV to pass automated Applicant Tracking Systems used by major employers in Istanbul.',
      publishedAt: '2026-06-18',
      content: `
        <p>Over 75% of large firms in Istanbul utilize <strong>Applicant Tracking Systems (ATS)</strong> to filter out irrelevant candidates.</p>
      `
    },
    {
      title: 'Commuting Tips: Avoid Traffic Struggles in Istanbul',
      slug: 'avoid-istanbul-traffic-and-transportation-tips',
      summary: 'Why proximity to Metro or Metrobus transit lines is the most critical factor when accepting a job offer in Istanbul. Practical advice.',
      publishedAt: '2026-06-15',
      content: `
        <p>Istanbul is beautiful, but its traffic can be notorious.</p>
      `
    },
    {
      title: 'Turkey Minimum Wage & Employer Cost 2026: Complete Guide',
      slug: 'turkey-minimum-wage-employer-cost-2026',
      summary: 'A detailed breakdown of Turkey\'s gross and net minimum wage for 2026, real employer cost calculations with SGK incentives, and business budgeting implications.',
      publishedAt: '2026-06-25',
      content: `
        <div class="article-rich-text">
          <p>The declaration of the <strong>minimum wage in Turkey for 2026</strong> is a key economic factor.</p>
        </div>
      `
    }
  ],
  tr: [
    {
      title: 'Yabancılar İçin Türkiye Çalışma İzni ve İkamet Yönetmeliği (2026)',
      slug: 'turkey-work-permit-residency-laws',
      summary: 'İstanbul\'da çalışma izni almanın en son kuralları ve prosedürleri hakkında kapsamlı bir rehber.',
      publishedAt: '2026-06-20',
      content: `
        <p>Türkiye\'de çalışma izni (Çalışma İzni) almak yasal olarak çalışmak için hayati önem taşır.</p>
      `
    },
    {
      title: 'Modern ATS Yazılımlarını Geçmek İçin Özgeçmişinizi Nasıl Optimize Edersiniz?',
      slug: 'optimize-resume-to-pass-ats-systems',
      summary: 'İstanbul\'daki büyük işverenler tarafından kullanılan otomatik Aday Takip Sistemlerini (ATS) geçmek için CV biçimlendirme tekniklerini öğrenin.',
      publishedAt: '2026-06-18',
      content: `
        <p>Özgeçmişinizi ATS sistemlerine uyumlu hale getirmek için ipuçları.</p>
      `
    },
    {
      title: 'Ulaşım İpuçları: İstanbul\'da Trafik Çilesinden Kaçınma Yolları',
      slug: 'avoid-istanbul-traffic-and-transportation-tips',
      summary: 'İstanbul\'da bir iş teklifini kabul ederken Metro veya Metrobüs hatlarına yakınlığın neden en kritik faktör olduğunu öğrenin.',
      publishedAt: '2026-06-15',
      content: `
        <p>Metrobüs ve Metro hatlarının yakınında çalışmanın avantajları.</p>
      `
    },
    {
      title: 'Türkiye Asgari Ücret ve İşveren Maliyeti 2026: Kapsamlı Rehber',
      slug: 'turkey-minimum-wage-employer-cost-2026',
      summary: 'Türkiye\'nin 2026 yılı brüt ve net asgari ücretinin detaylı analizi, SGK teşvikleriyle gerçek işveren maliyeti hesaplamaları.',
      publishedAt: '2026-06-25',
      content: `
        <div class="article-rich-text">
          <p>2026 yılı asgari ücret ve işveren maliyetleri rehberi.</p>
        </div>
      `
    }
  ]
};;

// Blog List View
careerBlogRouter.get('/:locale/blog', async (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr') return c.redirect('/ar/blog');

  const db = (c.env as any).DB;
  let articles: any[] = seededArticles[locale] || [];

  try {
    // Attempt to query additional documents from database
    const rows = await db.prepare(
      `SELECT data, published_at FROM documents WHERE type_id = 'blog_post' AND status = 'published' AND is_published = 1 ORDER BY published_at DESC`
    ).all();
    
    if (rows.results && rows.results.length > 0) {
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

  const t = {
    ar: {
      title: 'مدونة المهنة - إسطنبول',
      subtitle: 'مقالات ونصائح مهنية تهمك حول إقامة العمل، السيرة الذاتية، والنقل والمواصلات في إسطنبول.',
      readMore: 'اقرأ المزيد ←',
      pubDate: 'تاريخ النشر:'
    },
    en: {
      title: 'Career Blog - Istanbul',
      subtitle: 'Insights and career advice on work permits, CV optimizations, and transportation guides in Istanbul.',
      readMore: 'Read More ←',
      pubDate: 'Published:'
    },
    tr: {
      title: 'Kariyer Blogu - İstanbul',
      subtitle: 'İstanbul\'da çalışma izinleri, CV optimizasyonu ve ulaşım rehberi hakkında ipuçları ve kariyer tavsiyeleri.',
      readMore: 'Devamını Oku ←',
      pubDate: 'Yayınlanma Tarihi:'
    }
  }[locale];

  const listHtml = articles.map((art: any) => {
    return `
      <article class="glass-card" style="padding: 24px; border-radius: var(--radius-lg); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 8px;"><i class="fa-regular fa-calendar"></i> ${t.pubDate} ${art.publishedAt}</span>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px; line-height: 1.4;">${art.title}</h2>
          <p style="color: var(--text-main); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;">${art.summary}</p>
        </div>
        <a href="/${locale}/blog/${art.slug}" class="btn-apply-now" style="width: fit-content; margin-top: auto;">${t.readMore}</a>
      </article>
    `;
  }).join('');

  const html = `
    <div class="container" style="padding: 60px 20px; margin-bottom: 100px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 50px; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px;">
        ${listHtml}
      </div>
    </div>
  `;

  const seoHtml = generateMetaTags(locale, 'blog') + generateJsonLd(locale, 'blog');
  return c.html(renderLayout(c, t.title, html, locale, seoHtml));
})

// Blog Detail View
careerBlogRouter.get('/:locale/blog/:slug', async (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr';
  const slug = c.req.param('slug');
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr') return c.redirect('/ar/blog');

  const db = (c.env as any).DB;
  let article = (seededArticles[locale] || []).find((art: any) => art.slug === slug);

  try {
    if (!article) {
      const dbRow = await db.prepare(
        `SELECT data, published_at FROM documents WHERE type_id = 'blog_post' AND slug = ? AND status = 'published' AND is_published = 1`
      ).bind(slug).first();
      
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
    console.error('Failed to look up DB article:', err);
  }

  if (!article) {
    return c.text(locale === 'ar' ? 'المقالة غير موجودة.' : (locale === 'tr' ? 'Yazı bulunamadı.' : 'Article not found.'), 404);
  }

  const html = `
    <div class="container" style="max-width: 800px; padding: 60px 20px; margin-bottom: 100px;">
      <div style="margin-bottom: 24px;">
        <a href="/${locale}/blog" style="color: var(--primary); font-weight: 700;">${locale === 'ar' ? '← العودة للمدونة' : (locale === 'tr' ? '← Bloga Geri Dön' : '← Back to Blog')}</a>
      </div>

      <article class="glass-card" style="padding: 40px; border-radius: var(--radius-xl);">
        <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 12px;"><i class="fa-regular fa-calendar"></i> ${locale === 'ar' ? 'تم النشر في:' : (locale === 'tr' ? 'Yayınlanma Tarihi:' : 'Published At:')} ${article.publishedAt}</span>
        <h1 style="font-size: 2.25rem; font-weight: 800; color: var(--text-dark); margin-bottom: 30px; line-height: 1.3;">${article.title}</h1>
        
        <div class="detail-body" style="font-size: 1.1rem; line-height: 1.8; color: var(--text-dark);">
          ${article.content}
        </div>
      </article>
    </div>
  `;

  const cleanSummary = article.summary || article.content.substring(0, 160).replace(/<[^>]*>/g, '');
  const seoHtml = generateMetaTags(locale, 'blog_post', {
    title: article.title,
    description: cleanSummary,
    slug: article.slug,
    publishedAt: new Date(article.publishedAt).getTime(),
  }) + generateJsonLd(locale, 'blog_post', {
    title: article.title,
    description: cleanSummary,
    slug: article.slug,
    publishedAt: new Date(article.publishedAt).getTime(),
  });

  return c.html(renderLayout(c, article.title, html, locale, seoHtml));
})
