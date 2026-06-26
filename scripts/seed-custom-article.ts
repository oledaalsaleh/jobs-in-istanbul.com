import { getPlatformProxy } from 'wrangler'

const args = process.argv.slice(2);
const isRemote = args.includes('--remote') || args.includes('-r');

const articleTitle = 'إذن العمل في تركيا 2026: دليل شامل — الشروط، الرسوم، التقديم عبر e-Devlet';
const articleSlug = 'work-permit-turkey-2026';

const articleContent = `
<div class="article-rich-text">
  <img src="https://images.unsplash.com/photo-1527838832700-50592524df7e?q=80&w=1200" alt="إذن العمل في تركيا 2026" style="width: 100%; height: auto; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--shadow-md);">

  <p>يعتبر <strong>إذن العمل في تركيا (Çalışma İzni)</strong> لعام 2026 الركيزة الأساسية لكل مقيم أجنبي يسعى إلى تقنين وضعه القانوني والاستقرار المهني في واحدة من أكثر دول المنطقة ديناميكية اقتصاديًا. إن الحصول على تصريح العمل ليس مجرد إجراء روتيني، بل هو وثيقة تمنح صاحبها حق الإقامة القانونية وتضمن له الاستفادة من خدمات الضمان الاجتماعي والتأمين الصحي الكامل، فضلاً عن حمايته من الغرامات المالية المرتفعة أو خطر الترحيل المخالف للقوانين.</p>

  <p>شهد عام 2026 إدخال جملة من التحديثات التنظيمية والقوانين التشجيعية التي تهدف إلى تبسيط بيئة الاستثمار في تركيا وجذب الكفاءات المهنية العالية، لا سيما في مجالات التكنولوجيا والاتصالات والتصدير. يهدف هذا الدليل الشامل والمفصل إلى استعراض القوانين الجديدة، والرسوم الرسمية المحدثة، وخطوات التقديم خطوة بخطوة عبر البوابات الحكومية الرسمية، بالإضافة إلى تفصيل أوضاع الفئات المختلفة مثل حاملي بطاقات الحماية المؤقتة (الكملك).</p>

  <h2>القانون الجديد لمنح تصاريح العمل للأجانب لعام 2026</h2>
  <p>في إطار خطة التنمية الاقتصادية الحكومية لعام 2026، أجرت وزارة العمل والضمان الاجتماعي التركية (CSGB) تعديلات جوهرية على معايير تقييم طلبات إذن العمل للأجانب. يركز القانون الجديد بشكل أساسي على الانتقال من النظام البيروقراطي التقليدي إلى <strong>نظام النقاط والمعايير التسهيلية</strong> لدعم رواد الأعمال وأصحاب المشاريع والشركات الناشئة.</p>

  <img src="https://images.unsplash.com/photo-1542841791-1927f00a4bab?q=80&w=1200" alt="قوانين العمل التركية الجديدة لعام 2026" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

  <p>أبرز التسهيلات المضمنة في قانون عام 2026 تشمل تقليل فترات معالجة الطلبات؛ حيث يتم البت في الطلبات المستوفية للشروط إلكترونياً خلال مدة لا تتجاوز 15 يوم عمل. كما تم تقديم استثناءات وتسهيلات خاصة للشركات العاملة في قطاع التكنولوجيا والذكاء الاصطناعي والخدمات البرمجية، حيث سمحت القوانين لهذه الشركات بتوظيف مهندسين وخبراء أجانب بشروط مخففة للغاية مقارنة بالقطاعات التقليدية الأخرى، إيماناً من الدولة بأهمية التحول الرقمي ودوره في رفد الاقتصاد المحلي.</p>

  <h2>شرط توظيف 5 موظفين أتراك مقابل كل موظف أجنبي والاستثناءات الجديدة للشركات</h2>
  <p>يعد شرط توظيف <strong>5 مواطنين أترك مقابل كل موظف أجنبي واحد (5:1 Ratio)</strong> أحد أشهر العقبات التاريخية التي واجهت الشركات الصغيرة وأصحاب المشاريع الخدمية في تركيا. ومع ذلك، حمل قانون العمل لعام 2026 مرونة غير مسبوقة واستثناءات واضحة تهدف إلى تنشيط الاستثمارات الأجنبية المباشرة.</p>

  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200" alt="فريق عمل مشترك في إسطنبول" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

  <p>بموجب اللائحة الجديدة، يتم استثناء الحالات والشركات التالية من شرط الـ 5 أتراك بشكل كامل أو جزئي:</p>
  <ul>
    <li><strong>الشركات البرمجية والتقنية الناشئة (Startups):</strong> تُعفى الشركات المسجلة لدى حاضنات الأعمال الرسمية أو الحاصلة على دعم تكنولوجي من شرط توظيف الأتراك خلال أول عامين من تأسيسها لتمكينها من بناء نواة فريق العمل الفني.</li>
    <li><strong>شركات التجارة الخارجية والتصدير:</strong> الشركات التي تحقق حجم تصدير سنوي لا يقل عن 150 ألف دولار أمريكي يُسمح لها بتوظيف موظف أجنبي واحد كخبير مبيعات أو تسويق دون تطبيق شرط الـ 5 أتراك عليه.</li>
    <li><strong>حجم رأس المال الأجنبي:</strong> إذا تجاوز رأس مال الشركة المدفوع حداً معيناً (يتم تحديثه دورياً) وتم استثمار مبالغ كبيرة في الأصول الثابتة، تمنح الوزارة تسهيلات خاصة وتخفيض النسبة المطلوبة.</li>
    <li><strong>الخبراء والاستشاريون ذوو المهارات النادرة:</strong> في حال إثبات أن التخصص الفني أو المهني للعامل الأجنبي غير متوفر في سوق العمل المحلي، تملك الوزارة الصلاحية لاستثنائه مباشرة بعد تقديم التقارير الفنية الداعمة للطلب.</li>
  </ul>

  <h2>كم تبلغ رسوم إقامة العمل لعام 2026؟</h2>
  <p>تُعد الرسوم المالية الرسمية من أهم الجوانب التي يبحث عنها أصحاب العمل والموظفون لتخطيط التكاليف السنوية. تماشياً مع معدلات إعادة التقييم السنوية المفروضة من قبل وزارة الخزانة والمالية التركية، تم تحديد رسوم استخراج إذن العمل لعام 2026 على النحو التالي:</p>

  <ul>
    <li><strong>رسوم تصريح العمل لمدة سنة واحدة (Çalışma İذن Harcı):</strong> تبلغ حوالي <strong>10,571 ليرة تركية</strong>.</li>
    <li><strong>رسوم كرت تصريح العمل (Değerli Kağıt Bedeli):</strong> تبلغ حوالي <strong>950 ليرة تركية</strong> (تُدفع كقيمة ورقة مطبوعة لكرت الإقامة الخاص بالعمل).</li>
    <li><strong>رسوم تصريح العمل لمدة سنتين:</strong> تبلغ حوالي <strong>21,142 ليرة تركية</strong>.</li>
    <li><strong>رسوم تصريح العمل لمدة ثلاث سنوات:</strong> تبلغ حوالي <strong>31,713 ليرة تركية</strong>.</li>
    <li><strong>رسوم تصريح العمل غير المحدود (الشركاء المستثمرون القدامى أو الإقامة الطويلة):</strong> تبلغ حوالي <strong>52,855 ليرة تركية</strong>.</li>
  </ul>
  <p>يجب التنويه إلى أن هذه الرسوم يتم دفعها إلكترونياً عبر البنوك المتعاقدة مع وزارة العمل والمالية (مثل Ziraat Bank أو VakıfBank) باستخدام رقم الطلب المخصص فور الحصول على الموافقة المبدئية، ويُحظر دفعها نقداً أو عبر وسطاء غير رسميين لتفادي الوقوع في عمليات الاحتيال.</p>

  <h2>الوثائق المطلوبة للتقديم عبر بوابة e-Devlet</h2>
  <p>تتم عملية التقديم على إذن العمل في تركيا إلكترونياً بالكامل من خلال بوابة وزارة العمل المدمجة مع النظام الحكومي الموحد <strong>e-Devlet</strong> (بوابة الخدمات الإلكترونية للدولة التركية). يتطلب التقديم رفع حزمة متكاملة من المستندات والوثائق الرسمية من طرفي العلاقة التعاقدية (العامل وصاحب العمل).</p>

  <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200" alt="التقديم على إذن العمل إلكترونياً عبر e-Devlet" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

  <h3>المستندات المطلوبة من الموظف الأجنبي:</h3>
  <ol>
    <li>نسخة من جواز السفر ساري المفعول لمدة لا تقل عن 6 أشهر (مترجم ومصدق لدى كاتب العدل النوتر).</li>
    <li>نسخة من إقامة السياحة أو إقامة الطالب السارية (بشرط ألا تقل صلاحيتها المتبقية عن 6 أشهر عند تقديم الطلب لأول مرة من داخل تركيا).</li>
    <li>شهادة التخرج أو المؤهل الأكاديمي (مترجمة ومصدقة، وفي حال المهن التخصصية كالطب أو الهندسة يجب إرفاق شهادة المعادلة Denkbelgesi).</li>
    <li>صورة شخصية بيومترية حديثة بخلفية بيضاء تم التقاطها خلال آخر 6 أشهر.</li>
    <li>عقد العمل الموقع بين الموظف وصاحب العمل باللغتين التركية والعربية موضحاً فيه المسمى الوظيفي والراتب.</li>
  </ol>

  <h3>المستندات المطلوبة من الشركة (صاحب العمل):</h3>
  <ol>
    <li>اللوحة الضريبية الحالية للشركة (Vergi Levhası).</li>
    <li>الجريدة الرسمية للسجل التجاري التركي (Ticaret Sicil Gazetesi) توضح هيكلية رأس المال والشركاء.</li>
    <li>شهادة الفعالية التجارية الحديثة الصادرة عن غرفة التجارة التابعة لها الشركة (Oda Faaliyet Belgesi).</li>
    <li>بيان الميزانية العمومية والحسابات الختامية للسنة المالية السابقة مصدقة من مستشار مالي معتمد (SMMM).</li>
    <li>دائرة التوقيع المعتمدة للمدير المسؤول عن الشركة (İmza Sirküleri).</li>
  </ol>

  <h2>وضع حاملي بطاقة الحماية المؤقتة (الكملك) عند استخراج إذن العمل</h2>
  <p>يحظى ملف السوريين الخاضعين لقانون <strong>الحماية المؤقتة (Geçici Koruma)</strong> والحاملين لبطاقة الكملك برعاية وتدابير تنظيمية خاصة من قبل وزارة العمل التركية لتسهيل دمجهم القانوني في سوق العمل وحماية الشركات المحلية.</p>

  <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1200" alt="دمج السوريين وحاملي الكملك في سوق العمل التركي" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

  <p>أهم القواعد والاشتراطات الخاصة بحاملي بطاقة الحماية المؤقتة تشمل:</p>
  <ul>
    <li><strong>شرط الإقامة الجغرافية:</strong> لا يمكن إصدار إذن العمل لحامل الكملك إلا في الولاية أو المدينة التي تم استخراج بطاقة الحماية المؤقتة منها والمسجل فيها عنوان سكنه رسمياً. على سبيل المثال، الكملك الصادر من غازي عنتاب لا يسمح باستخراج إذن عمل للعمل في إسطنبول إلا بعد نقل قيد الكملك رسمياً بموافقة إدارة الهجرة.</li>
    <li><strong>مدة التسجيل الدنيا:</strong> يشترط القانون أن يكون المتقدم بالطلب حاملاً لبطاقة الحماية المؤقتة لفترة لا تقل عن 6 أشهر قبل تاريخ التقديم على إذن العمل.</li>
    <li><strong>الإعفاء من الحصة النسبية المحددة:</strong> تُعفى الشركات التي توظف السوريين تحت الحماية المؤقتة في بعض المهن الزراعية أو اليدوية من شرط تعيين 5 موظفين أترك، في حين يخضع التوظيف في القطاعات التجارية والخدمية لنسبة مرنة تعتمد على الكفاءة والتنسيق مع إدارة الهجرة ومكتب العمل التركي (İŞKUR).</li>
  </ul>

  <h2>خلاصة وتوصيات ختامية لأصحاب العمل والعمال</h2>
  <p>إن تنظيم العلاقة التعاقدية والحصول على إذن العمل القانوني في تركيا لعام 2026 هو الضمانة الحقيقية لحفظ حقوق الطرفين وتفادي التعرض للغرامات المالية الضخمة التي تفرضها مفتشية وزارة العمل على العمالة غير المرخصة والتي قد تؤدي لإغلاق الشركة وترحيل العامل. ننصح دائماً بالاستعانة بمستشار مالي معتمد (Mali Müşavir) ذي خبرة في ملفات توظيف الأجانب لضمان إعداد الملف المالي والضريبي للشركة ورفعه عبر بوابة e-Devlet بطريقة سليمة وتلافي أي تأخير أو رفض للطلب.</p>
</div>
`;

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log(`⏳ Connecting to Wrangler platform proxy (Environment: ${isRemote ? 'production' : 'local'})...`);
  const { env, dispose } = await getPlatformProxy({
    environment: isRemote ? 'production' : undefined
  });

  if (!env?.DB) {
    console.error('❌ Error: DB binding not found. Make sure wrangler.toml is configured.');
    process.exit(1);
  }

  console.log('✓ Connected to DB.');

  try {
    const articleId = `blog-post-seed-2026`;
    const nowMs = Date.now();

    const dataObj = {
      title: articleTitle,
      slug: articleSlug,
      content: articleContent
    };

    // 1. Generate seed-article.sql file
    const sqlContent = `INSERT OR REPLACE INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, published_at, created_at, updated_at)
VALUES (
  '${articleId}',
  '${articleId}',
  'blog_post',
  'published',
  1,
  1,
  '${articleSlug}',
  '${articleTitle.replace(/'/g, "''")}',
  '${JSON.stringify(dataObj).replace(/'/g, "''")}',
  1782000000000,
  1782000000000,
  1782000000000
);`;

    const sqlPath = path.join(__dirname, 'seed-article.sql');
    fs.writeFileSync(sqlPath, sqlContent, 'utf8');
    console.log(`✓ SQL seed file written to ${sqlPath}`);

    // 2. Fallback local proxy check/insert
    console.log('⏳ Checking if the article already exists in local platform proxy D1 database...');
    const existing = await env.DB.prepare(
      `SELECT id FROM documents WHERE type_id = 'blog_post' AND slug = ?`
    ).bind(articleSlug).first();

    if (existing) {
      console.log('⏳ Article already exists in local DB. Updating it...');
      await env.DB.prepare(
        `UPDATE documents SET title = ?, data = ?, updated_at = ? WHERE slug = ? AND type_id = 'blog_post'`
      ).bind(articleTitle, JSON.stringify(dataObj), nowMs, articleSlug).run();
      console.log('✓ Article updated successfully in local DB!');
    } else {
      console.log('⏳ Inserting new article into local DB...');
      await env.DB.prepare(
        `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, published_at, created_at, updated_at)
         VALUES (?, ?, 'blog_post', 'published', 1, 1, ?, ?, ?, ?, ?, ?)`
      ).bind(articleId, articleId, articleSlug, articleTitle, JSON.stringify(dataObj), nowMs, nowMs, nowMs).run();
      console.log('✓ Article inserted successfully in local DB!');
    }

  } catch (err: any) {
    console.error('❌ Failed to seed custom article:', err.message);
  } finally {
    await dispose();
    console.log('🎉 Execution complete!');
  }
}

run();
