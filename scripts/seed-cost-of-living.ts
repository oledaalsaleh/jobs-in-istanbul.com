import { getPlatformProxy } from 'wrangler'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const args = process.argv.slice(2);
const isRemote = args.includes('--remote') || args.includes('-r');

const articleTitle = 'تكلفة المعيشة في إسطنبول 2026: الدليل المالي الشامل للمغتربين والباحثين عن عمل';
const articleSlug = 'istanbul-cost-of-living-2026';

const articleContent = `
<div class="article-rich-text">
  <img src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200" alt="تكلفة المعيشة في إسطنبول 2026" style="width: 100%; height: auto; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--shadow-md);">

  <p>تظل مدينة إسطنبول، بموقعها الجغرافي الفريد الذي يربط بين قارتين وتاريخها الضارب في القدم، وجهة رئيسية تجذب الباحثين عن عمل، والطلاب، والمستثمرين، والمغتربين من مختلف أنحاء العالم العربي والغربي. ومع ذلك، فإن الاستقرار في هذه الحاضرة الكبرى يتطلب فهماً شاملاً ودقيقاً للمتغيرات الاقتصادية الحالية. يهدف هذا الدليل الشامل لعام 2026 إلى استعراض تفاصيل <strong>تكلفة المعيشة في إسطنبول 2026</strong> بناءً على أحدث إحصاءات السوق، لمساعدتك على تخطيط ميزانيتك المالية بدقة وتجنب المفاجآت غير المتوقعة.</p>

  <p>شهدت البيئة الاقتصادية في تركيا خلال الفترة الأخيرة تحولات وتغيرات تضخمية أثرت بشكل مباشر على تكاليف الحياة اليومية والخدمات الأساسية. في حين يُعد كسب العيش بالعملة الصعبة (الدولار أو اليورو) ميزة تمنح المغتربين قوة شرائية ممتازة ومستوى معيشياً فاخراً، فإن أولئك الذين يتقاضون رواتبهم بالليرة التركية يواجهون تحديات مستمرة تتطلب إدارة حذرة للميزانية الشهرية. نستعرض في السطور التالية تفاصيل النفقات الأساسية مقسمة حسب القطاعات الرئيسية.</p>

  <h2>1. السكن والإيجارات: التكلفة الأكبر في الميزانية</h2>
  <p>يعد الإسكان بلا شك النفقة الأكبر والأكثر تأثيراً على إجمالي ميزانيتك الشهرية في إسطنبول. شهد سوق العقارات والإيجارات في عام 2026 ارتفاعاً ملحوظاً مدفوعاً بزيادة الطلب وقلة المعروض في المناطق الحيوية القريبة من خطوط المترو ومراكز الأعمال.</p>
  
  <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200" alt="شقق سكنية حديثة في إسطنبول" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

  <p>تختلف أسعار الإيجار بشكل جذري بناءً على الجغرافيا والقرب من وسط المدينة والخدمات المتوفرة:</p>
  <ul>
    <li><strong>المناطق الحيوية والراقية (شيشلي، بشكتاش، كاديكوي):</strong> تتراوح إيجارات الشقق المكونة من غرفة وصالة (1+1) غير المفروشة في هذه المناطق ما بين <strong>20,000 إلى 32,000 ليرة تركية</strong> شهرياً (~$450 - $725).</li>
    <li><strong>المناطق المتوسطة (الفاتح، بيوغلو، أتاشهير، إسكودار):</strong> تتراوح الإيجارات للشقة المتوسطة ما بين <strong>15,000 إلى 22,000 ليرة تركية</strong> شهرياً (~$340 - $500).</li>
    <li><strong>المناطق الاقتصادية والضواحي (إسنيورت، بيليك دوزو، بندك):</strong> تتوفر شقق سكنية حديثة بأسعار تبدأ من <strong>10,000 إلى 14,000 ليرة تركية</strong> شهرياً (~$225 - $315)، لكنها تتطلب وقتاً أطول للتنقل إلى مركز المدينة.</li>
  </ul>

  <h2>2. فواتير الخدمات والمرافق الأساسية</h2>
  <p>إلى جانب الإيجار، يجب حساب التكاليف الشهرية الثابتة للخدمات وتشمل الكهرباء، والمياه، والغاز الطبيعي للتدفئة (والذي يرتفع استهلاكه بشكل ملحوظ خلال أشهر الشتاء)، والإنترنت المنزلي، وباقات الهواتف المحمولة:</p>
  <ul>
    <li><strong>الكهرباء والمياه:</strong> تبلغ في المتوسط ما بين <strong>1,200 إلى 1,800 ليرة تركية</strong> شهرياً لعائلة متوسطة.</li>
    <li><strong>الغاز الطبيعي (التدفئة شتاءً):</strong> يبلغ الاستهلاك المتوسط في الشتاء حوالي <strong>1,500 إلى 2,500 ليرة تركية</strong>، بينما ينخفض في الصيف إلى أقل من 300 ليرة تركية.</li>
    <li><strong>عائدات المجمع السكني (Aidat):</strong> إذا كنت تسكن في مجمع سكني حديث يحتوي على حراسة ومسبح وصالة رياضية، فستدفع رسوماً إضافية تسمى العائدات تتراوح بين <strong>1,000 إلى 3,000 ليرة تركية</strong> شهرياً.</li>
    <li><strong>الإنترنت المنزلي وألياف الضوئية:</strong> تتراوح أسعار الاشتраكات غير المحدودة لسرعات 50-100 ميجابت بين <strong>500 إلى 800 ليرة تركية</strong> شهرياً (~$11 - $18).</li>
    <li><strong>باقة المحمول (الاتصالات والبيانات):</strong> باقة متوسطة تحتوي على 15 جيجابايت ودقائق اتصال تكلّف حوالي <strong>400 إلى 600 ليرة تركية</strong> شهرياً.</li>
  </ul>

  <h2>3. تكاليف الغذاء والبقالة وتناول الطعام في الخارج</h2>
  <p>يعتبر قطاع الأغذية في تركيا من القطاعات الغنية والمتنوعة نظراً للاعتماد الكبير على الإنتاج الزراعي المحلي. ومع ذلك، طال التضخم أسعار البقالة الأساسية بشكل ملموس في عام 2026.</p>

  <img src="https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1200" alt="طعام تركي تقليدي وبقالة" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

  <p>في المتوسط، تبلغ تكلفة البقالة الشهرية للشخص الواحد حوالي <strong>5,000 إلى 7,000 ليرة تركية</strong> شهرياً (~$115 - $160) عند الشراء من السوبر ماركت والأسواق الشعبية (البازار الأسبوعي).</p>
  
  <h3>أسعار السلع الأساسية في عام 2026 (تقديرية):</h3>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid var(--border);">
    <thead>
      <tr style="background-color: var(--bg-subtle); color: var(--text-dark);">
        <th style="padding: 12px; border: 1px solid var(--border); text-align: right;">السلعة الغذائية</th>
        <th style="padding: 12px; border: 1px solid var(--border); text-align: right;">السعر بالليرة التركية (TRY)</th>
        <th style="padding: 12px; border: 1px solid var(--border); text-align: right;">السعر التقريبي بالدولار (USD)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px; border: 1px solid var(--border);">حليب (1 لتر)</td>
        <td style="padding: 12px; border: 1px solid var(--border);">38 - 45 TRY</td>
        <td style="padding: 12px; border: 1px solid var(--border);">$0.90 - $1.00</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid var(--border);">خبز طازج (ربطة)</td>
        <td style="padding: 12px; border: 1px solid var(--border);">12 - 15 TRY</td>
        <td style="padding: 12px; border: 1px solid var(--border);">$0.30 - $0.35</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid var(--border);">بيض (30 بيضة)</td>
        <td style="padding: 12px; border: 1px solid var(--border);">110 - 140 TRY</td>
        <td style="padding: 12px; border: 1px solid var(--border);">$2.50 - $3.20</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid var(--border);">لحم بقري طازج (1 كجم)</td>
        <td style="padding: 12px; border: 1px solid var(--border);">650 - 850 TRY</td>
        <td style="padding: 12px; border: 1px solid var(--border);">$15.00 - $19.00</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid var(--border);">صدر دجاج (1 كجم)</td>
        <td style="padding: 12px; border: 1px solid var(--border);">220 - 280 TRY</td>
        <td style="padding: 12px; border: 1px solid var(--border);">$5.00 - $6.30</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid var(--border);">أرز (1 كجم)</td>
        <td style="padding: 12px; border: 1px solid var(--border);">60 - 90 TRY</td>
        <td style="padding: 12px; border: 1px solid var(--border);">$1.35 - $2.00</td>
      </tr>
    </tbody>
  </table>

  <p>أما بالنسبة للمطاعم وتناول الطعام بالخارج:</p>
  <ul>
    <li><strong>المطاعم الشعبية (اللوكانتا Esnaf Lokantası):</strong> تقدم وجبة غداء كاملة ومغذية بأسعار تتراوح بين <strong>150 إلى 250 ليرة تركية</strong> للوجبة (~$4.50 - $5.50).</li>
    <li><strong>المطاعم المتوسطة والوجبات السريعة:</strong> وجبة لشخصين في مطعم متوسط تكلّف حوالي <strong>1,200 إلى 2,000 ليرة تركية</strong> (~$27 - $45).</li>
    <li><strong>المقاهي والمشروبات:</strong> كوب من الشاي التركي يكلّف 15-30 ليرة، بينما كوب قهوة الكابتشينو أو اللاتيه في المقاهي الحديثة يكلّف حوالي 90-130 ليرة تركية.</li>
  </ul>

  <h2>4. النقل العام وتكاليف الانتقال اليومي</h2>
  <p>تمتلك إسطنبول شبكة نقل عام عملاقة ومترابطة تُعد من الأفضل عالمياً، وتشمل خطوط المترو، والترامواي، والمتروبوس السريع، وعبارات البوسفور البحرية (Şehir Hatları Vapurları)، بالإضافة إلى قطار المرمراي الذي يربط القارتين تحت قاع البحر.</p>

  <img src="https://images.unsplash.com/photo-1568454537842-d933259bb258?q=80&w=1200" alt="الترامواي الأحمر التاريخي في شارع الاستقلال بإسطنبول" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

  <p>تتم كافة عمليات الدفع بواسطة بطاقة إسطنبول الموحدة <strong>(Istanbulkart)</strong>:</p>
  <ul>
    <li><strong>التعرفة الأساسية للرحلة الواحدة:</strong> تبلغ حوالي <strong>22 إلى 25 ليرة تركية</strong> للرحلة العادية على المترو أو الحافلة.</li>
    <li><strong>اشتراك النقل الشهري غير المحدود (الكرت الأزرق - Mavi Kart):</strong> يكلّف حوالي <strong>2,300 ليرة تركية</strong> للبالغين، ويوفر تخفيضاً هائلاً للمتنقلين بشكل يومي للعمل أو الجامعة.</li>
    <li><strong>سيارات الأجرة (التاكسي):</strong> يبدأ عداد التاكسي من تعرفة فتح تقارب 30 ليرة تركية، والحد الأدنى لأي مشوار قصير هو 100 ليرة تركية. ننصح باستخدام التطبيقات الرسمية مثل (BiTaksi) لتجنب التعرض للمغالاة في الأسعار.</li>
    <li><strong>السيارات الخاصة والبنزين:</strong> تملك سيارة خاصة في إسطنبول يعد كابوساً اقتصادياً بسبب الازدحام الخانق والرسوم السنوية المرتفعة وتكلفة الوقود التي تبلغ حوالي 43-47 ليرة تركية للتر الواحد من البنزين.</li>
  </ul>

  <h2>5. الرعاية الصحية والتأمين الطبي للأجانب</h2>
  <p>تشترط القوانين التركية على أي أجنبي يرغب في الحصول على تصريح إقامة (سياحية، دراسية، أو عمل) حيازة تأمين صحي ساري المفعول داخل البلاد:</p>
  <ul>
    <li><strong>التأمين الصحي الخاص الأساسي للإقامة:</strong> تأمين بسيط يغطي الحالات الطارئة فقط، وتتراوح تكلفته السنوية بين <strong>2,000 إلى 5,000 ليرة تركية</strong> بناءً على العمر والحالة الصحية للمتقدم.</li>
    <li><strong>التأمين الطبي الشامل في المستشفيات الخاصة:</strong> يوفر رعاية طبية متكاملة في أفضل شبكات المستشفيات الخاصة، وتتراوح كلفته السنوية بين <strong>15,000 إلى 40,000 ليرة تركية</strong>.</li>
    <li><strong>التأمين الحكومي (SGK):</strong> بالنسبة للأجانب الحاصلين على إذن عمل رسمي، يتم تغطيتهم تلقائياً هم وعائلاتهم تحت مظلة الضمان الاجتماعي التركي العام، وهو ما يوفر علاجاً مجانياً بالكامل في المستشفيات الحكومية وتخفيضات تصل إلى 80% في الصيدليات.</li>
  </ul>

  <h2>6. التعليم والمدارس للأبناء</h2>
  <p>إذا كنت تنتقل إلى إسطنبول برفقة عائلتك وأطفالك، فإن مصاريف التعليم ستشكل بنداً هاماً وجوهرياً في ميزانيتك:</p>
  <ul>
    <li><strong>المدارس الحكومية التركية:</strong> مجانية بالكامل للأجانب الحاصلين على إقامات رسمية أو كملك، ويتم التدريس فيها باللغة التركية.</li>
    <li><strong>المدارس الدولية (الإنترناشونال):</strong> تدرس المناهج الأمريكية أو البريطانية باللغة الإنجليزية بالكامل. تتراوح أقساطها السنوية بين <strong>8,000 إلى 22,000 دولار أمريكي</strong> للعام الدراسي الواحد وتُدفع بالدولار أو ما يعادله.</li>
    <li><strong>المدارس الأهلية العربية:</strong> تدرس المناهج العربية (اللبنانية، اليمنية، أو الليبية) وتتراوح رسومها السنوية بين <strong>2,500 إلى 5,000 دولار أمريكي</strong> سنوياً.</li>
  </ul>

  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200" alt="مكتب ومساحة عمل تفاعلية للمغتربين والمهنيين في إسطنبول" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

  <h2>7. نصائح ذهبية ذكية لتقليل تكلفة المعيشة في إسطنبول 2026</h2>
  <p>للتمتع بحياة مستقرة ومريحة في إسطنبول دون استنزاف مدخراتك، نقترح عليك تطبيق الاستراتيجيات الاقتصادية المجربة التالية:</p>
  <ol>
    <li><strong>ابتعد عن السكن في قلب المراكز السياحية:</strong> الإيجارات في شيشلي أو الفاتح قد تكلّفك ضعف الإيجار في أحياء مريحة متصلة بالمترو مثل كارتال، أفجيلار، أو عمرانية.</li>
    <li><strong>تسوّق من أسواق الخضار الشعبية (البازار الأسبوعي):</strong> تقيم كل بلدية بازاراً شعبياً يوماً واحداً في الأسبوع لبيع الخضار والفواكه والأجبان والبيض بأسعار تقل بنسبة 40% عن محلات السوبر ماركت الكبرى مثل Migros أو Carrefour.</li>
    <li><strong>استخدم النقل العام وتجنب التاكسي:</strong> شبكة المترو والمتروبوس تغنيك تماماً عن استخدام سيارات الأجرة وتجنبك الوقوف لساعات في زحام إسطنبول الخانق.</li>
    <li><strong>استخدم أدوات التخطيط التفاعلية المتاحة:</strong> لتجنب التقديرات الخاطئة لميزانيتك، يمكنك استخدام <a href="/ar/salary-calculator">حاسبة الرواتب وتكاليف المعيشة التفاعلية في إسطنبول</a> المتوفرة مجاناً في موقعنا لمعرفة صافي مدخراتك المتوقعة بناءً على الحي السكني والراتب المقترح.</li>
    <li><strong>اختبر كفاءتك المهنية بالتركية:</strong> إن معرفة بعض الكلمات الأساسية لبيئة العمل تجنبك التعرض للمغالاة في الأسعار وتسهّل اندماجك في العمل. يمكنك تجربة <a href="/ar/workplace-quiz">اختبار لغة العمل التركية السريع</a> لتنمية مهاراتك اليومية.</li>
  </ol>

  <h2>8. الأسئلة الشائعة (FAQ) حول تكلفة المعيشة في إسطنبول 2026</h2>
  
  <h3>كم يحتاج الشخص الأعزب للعيش شهرياً في إسطنبول؟</h3>
  <p>يحتاج الشخص الأعزب في المتوسط إلى ما بين <strong>25,000 إلى 35,000 ليرة تركية</strong> شهرياً (~$550 - $800) لتغطية تكاليف الإيجار في شقة متواضعة، والفواتير، والمواصلات، والبقالة مع نمط حياة معتدل.</p>

  <h3>كم تحتاج العائلة المكونة من 4 أفراد للعيش في إسطنبول?</h3>
  <p>تحتاج العائلة المكونة من 4 أفراد إلى ميزانية تتراوح بين <strong>50,000 إلى 75,000 ليرة تركية</strong> شهرياً (~$1,100 - $1,700) لتأمين حياة مستقرة تشمل استئجار شقة 2+1 أو 3+1 في حي متوسط، وفواتير التدفئة والخدمات، وتعليم الأطفال في المدارس الحكومية، وتناول الطعام في الخارج بشكل دوري معتدل.</p>

  <h3>هل إسطنبول مدينة باهظة للطلاب الدوليين؟</h3>
  <p>مقارنة بالمدن الأوروبية الأخرى، لا تزال إسطنبول مدينة مناسبة جداً للطلاب. من خلال السكن المشترك (غرفة في شقة طلابية) والاستفادة من بطاقة النقل المخصصة للطلاب (تكلّف حوالي 250 ليرة تركية فقط شهرياً مع خصم 85%) والتأمين الصحي الطلابي المدعوم، يمكن للطالب العيش بميزانية تتراوح بين 15,000 إلى 20,000 ليرة تركية شهرياً.</p>

  <h2>خلاصة القول</h2>
  <p>تعتبر إسطنبول مدينة الفرص والتناقضات المالية الجميلة؛ حيث تتيح جودة حياة ومستويات ترفيهية تنافس كبرى مدن أوروبا بأسعار لا تزال في متناول الجميع عند إدارتها بذكاء وتخطيط مسبق. مفتاح الاستقرار الناجح في إسطنبول هو اختيار السكن المناسب جغرافياً وموازنة نفقاتك اليومية بالاستفادة من سلاسل التوريد المحلية المتاحة والتخطيط المالي الواقعي قبل السفر.</p>
</div>
`;

import { fileURLToPath as fu } from 'url'
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
    const articleId = `blog-post-istanbul-cost-of-living-2026`;
    const nowMs = Date.now();

    const dataObj = {
      title: articleTitle,
      slug: articleSlug,
      content: articleContent
    };

    // 1. Generate seed-article-col.sql file
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
  ${nowMs},
  ${nowMs},
  ${nowMs}
);`;

    const sqlPath = path.join(__dirname, 'seed-article-col.sql');
    fs.writeFileSync(sqlPath, sqlContent, 'utf8');
    console.log(`✓ SQL seed file written to ${sqlPath}`);

    // 2. Insert into database
    console.log('⏳ Checking if the article already exists in DB...');
    const existing = await env.DB.prepare(
      `SELECT id FROM documents WHERE type_id = 'blog_post' AND slug = ?`
    ).bind(articleSlug).first();

    if (existing) {
      console.log('⏳ Article already exists in DB. Updating it...');
      await env.DB.prepare(
        `UPDATE documents SET title = ?, data = ?, updated_at = ? WHERE slug = ? AND type_id = 'blog_post'`
      ).bind(articleTitle, JSON.stringify(dataObj), nowMs, articleSlug).run();
      console.log('✓ Article updated successfully in DB!');
    } else {
      console.log('⏳ Inserting new article into DB...');
      await env.DB.prepare(
        `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, published_at, created_at, updated_at)
         VALUES (?, ?, 'blog_post', 'published', 1, 1, ?, ?, ?, ?, ?, ?)`
      ).bind(articleId, articleId, articleSlug, articleTitle, JSON.stringify(dataObj), nowMs, nowMs, nowMs).run();
      console.log('✓ Article inserted successfully in DB!');
    }

  } catch (err: any) {
    console.error('❌ Failed to seed cost of living article:', err.message);
  } finally {
    await dispose();
    console.log('🎉 Execution complete!');
  }
}

run();
