import { Hono } from 'hono'
import { renderLayout } from './public'
import { generateMetaTags, generateJsonLd } from '../utils/seo-helper'

export const careerBlogRouter = new Hono()

// Fallback hardcoded seeded articles if the database is empty
const seededArticles = {
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
        <p>يمتد خط المتروبوس على طول الطريق السريع E-5 من الجانب الآسيوي (Söğütlüçeşme) إلى أقصى الجانب الأوروبي (Beylikdüzü). يملك هذا الخط ممراً خاصاً معزولاً عن السيارات، مما يجعله الوسيلة الأسرع لتجاوز زحمة السير. الحصول على وظيفة قريبة من المتروبوس يوفر عليك وقتاً هائلاً.</p>

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

          <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200" alt="حساب تكلفة الموظفين والضرائب في تركيا" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

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
          
          <p>يتم تحويل هذه المبالغ المقتطعة شهرياً إلى الدولة لضمان الرعاية الصحية وحقوق التقاعد وتأمين البطالة للموظف المسجل قانونياً.</p>

          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200" alt="اجتماع تخطيط تكاليف الموارد البشرية والرواتب" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

          <h2>ثالثاً: تكلفة الحد الأدنى للأجور الفعلية على صاحب العمل (المشغل)</h2>
          <p>بالنسبة لأرباب العمل والمستثمرين في تركيا، لا تقتصر التكلفة على الراتب الصافي أو الإجمالي فقط. تفرض القوانين التركية على صاحب العمل دفع مساهمات إضافية في التأمينات والبطالة تضاف فوق الراتب الإجمالي للموظف. وهنا يظهر الفارق الفعلي للتكلفة بناءً على مدى التزام الشركة وخصم الحوافز:</p>

          <h3>1. التكلفة القياسية (بدون حوافز أو تخفيضات):</h3>
          <ul>
            <li><strong>الأجر الإجمالي للموظف:</strong> 33,030.00 ليرة تركية.</li>
            <li><strong>حصة صاحب العمل في الضمان الاجتماعي (20.5%):</strong> 6,771.15 ليرة تركية.</li>
            <li><strong>حصة صاحب العمل في تأمين البطالة (2%):</strong> 660.60 ليرة تركية.</li>
            <li><strong>إجمالي التكلفة القياسية لصاحب العمل:</strong> 40,461.75 ليرة تركية.</li>
          </ul>

          <h3>2. التكلفة المخفضة (مع الاستفادة من خصم الـ 5% التشجيعي):</h3>
          <p>تمنح مؤسسة الضمان الاجتماعي التركية خصماً قدره 5% من حصة صاحب العمل للشركات التي تقوم بدفع أقساط التأمين بانتظام ولا تملك ديوناً سابقة للدولة. تصبح الحسبة كالتالي:</p>
          <ul>
            <li><strong>الأجر الإجمالي للموظف:</strong> 33,030.00 ليرة تركية.</li>
            <li><strong>حصة صاحب العمل في الضمان الاجتماعي بعد الخصم (15.5%):</strong> 5,119.65 ليرة تركية.</li>
            <li><strong>حصة صاحب العمل في تأمين البطالة (2%):</strong> 660.60 ليرة تركية.</li>
            <li><strong>إجمالي التكلفة مع الحافز لصاحب العمل:</strong> 38,810.25 ليرة تركية.</li>
          </ul>

          <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200" alt="تأثير تكلفة الأجور على قطاعات التصنيع والنسيج في تركيا" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

          <h2>خامساً: إقامة العمل للأجانب في تركيا وعلاقتها بالحد الأدنى للأجور</h2>
          <p>أحد أكثر الجوانب أهمية للشركات التي توظف كفاءات عربية وأجنبية في إسطنبول هو قانون <strong>وزارة العمل التركية</strong> بشأن الحد الأدنى للأجور اللازم لمنح أو تجديد إقامة العمل (Çalışma İzni). لا تسمح القوانين بدفع الحد الأدنى للأجور الأساسي لجميع التخصصات الأجنبية، بل تفرض مضاعفات محددة بناءً على المسمى الوظيفي المسجل كالتالي:</p>
          <ul>
            <li><strong>المدراء التنفيذيون وأصحاب الشركات:</strong> يجب ألا يقل راتبهم عن 6.5 أضعاف الحد الأدنى للأجور الإجمالي (حوالي 214,695 ليرة تركية).</li>
            <li><strong>مدراء الأقسام، المهندسون، والأطباء:</strong> يجب ألا يقل راتبهم عن 4 أضعاف الحد الأدنى للأجور الإجمالي (حوالي 132,120 ليرة تركية).</li>
            <li><strong>الموظفون التقنيون والمترجمون وخبراء التسويق والمبيعات:</strong> يجب ألا يقل راتبهم عن 1.5 ضعف الحد الأدنى للأجور الإجمالي (حوالي 49,545 ليرة تركية).</li>
            <li><strong>العمالة العادية (الخدمات المنزلي والنسيج والعمالة اليدوية):</strong> الحد الأدنى للأجور الأساسي (33,030.00 ليرة إجمالي).</li>
          </ul>

          <img src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200" alt="العملات والتدفقات النقدية في تركيا" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

          <h2>سادساً: أسئلة شائعة حول الرواتب وتكاليف العمل في تركيا 2026</h2>
          
          <div class="faq-section" style="background: var(--bg-card); padding: 20px; border-radius: 8px; border: 1px solid var(--border); margin-top: 30px;">
            <h4 style="margin-top: 0; color: var(--primary);">1. ما هو صافي الحد الأدنى للأجور الذي يستلمه العامل شهرياً في تركيا 2026؟</h4>
            <p>يستلم العامل صافي راتب قدره 28,075.50 ليرة تركية بعد خصم حصته في التأمين والبطالة.</p>
            
            <h4 style="color: var(--primary);">2. كم تبلغ التكلفة الإجمالية لتوظيف عامل بالحد الأدنى للأجور على صاحب العمل؟</h4>
            <p>تبلغ التكلفة 38,810.25 ليرة تركية شهرياً للشركات الملتزمة التي تستحق خصم الضمان الاجتماعي الـ 5%، وتصل إلى 40,461.75 ليرة تركية للشركات غير المستوفية للشروط.</p>
            
            <h4 style="color: var(--primary);">3. هل هناك إعفاءات ضريبية على الحد الأدنى للأجور في تركيا؟</h4>
            <p>نعم، تواصل القوانين التركية إعفاء رواتب الحد الأدنى للأجور من ضريبة الدخل وضريبة الدمغة (Stamp Tax)، لتقليل العبء المالي الإجمالي على العمال وأرباب العمل.</p>
            
            <h4 style="color: var(--primary);">4. كيف يمكن للشركات تخفيض تكاليف الموظفين بطرق قانونية؟</h4>
            <p>عن طريق الاستفادة من برامج دعم التوظيف وحوافز الضمان الاجتماعي المتنوعة (مثل دعم توظيف الشباب والنساء الجدد)، ودفع الأقساط بانتظام لتجنب الغرامات المالية والاستفادة من خصم الـ 5%.</p>
          </div>
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
        
        <h3>1. Core Conditions for a Work Permit:</h3>
        <ul>
          <li><strong>Employer Sponsorship:</strong> Individuals cannot apply independently; the sponsoring local business must file the application on behalf of the candidate.</li>
          <li><strong>Local Worker Ratio:</strong> The Ministry of Labor requires employing 5 Turkish citizens for every 1 foreign employee.</li>
          <li><strong>Minimum Wage Caps:</strong> Foreign employees must be paid minimum wage multipliers based on their role (e.g. 6.5x minimum wage for top executives, 1.5x for technical developers).</li>
        </ul>

        <h3>2. British Nationals Post-Brexit:</h3>
        <p>Since Brexit, British citizens are treated as third-country nationals. They must obtain a formal work visa from Turkish embassies in the UK prior to arrival or transition a valid tourist residence permit locally once a signed contract is initiated with an Istanbul firm.</p>
      `
    },
    {
      title: 'How to Optimize Your Resume to Pass Modern ATS Software',
      slug: 'optimize-resume-to-pass-ats-systems',
      summary: 'Learn key optimization techniques to formatting your CV to pass automated Applicant Tracking Systems used by major employers in Istanbul.',
      publishedAt: '2026-06-18',
      content: `
        <p>Over 75% of large firms in Istanbul utilize <strong>Applicant Tracking Systems (ATS)</strong> to filter out irrelevant candidates. If your CV is not formatted correctly, it may be rejected before a human recruiter ever sees it.</p>
        
        <h3>1. Leverage Keywords Smartly:</h3>
        <p>ATS search algorithms look for words that match the job description. Read job descriptions carefully, list critical skills (e.g. TypeScript, Project Management, SEO), and include them textually in your CV.</p>

        <h3>2. Plain Formatting & Fonts:</h3>
        <ul>
          <li>Avoid tables, graphic bars, or text boxes. Systems cannot index them.</li>
          <li>Use standard fonts such as Arial, Calibri, or Roboto.</li>
          <li>Always save the CV as a <strong>PDF</strong> or <strong>DOCX</strong> file.</li>
        </ul>
      `
    },
    {
      title: 'Commuting Tips: Avoid Traffic Struggles in Istanbul',
      slug: 'avoid-istanbul-traffic-and-transportation-tips',
      summary: 'Why proximity to Metro or Metrobus transit lines is the most critical factor when accepting a job offer in Istanbul. Practical advice.',
      publishedAt: '2026-06-15',
      content: `
        <p>Istanbul is beautiful, but its traffic can be notorious. Taking a job located far from transport links can easily result in spending 3 to 4 hours daily inside buses or cars.</p>
        
        <h3>1. The Metrobüs Backbone:</h3>
        <p>The Metrobüs transit lane operates on a dedicated lane along the E-5 highway from Beylikdüzü on the European side to Söğütlüçeشme on the Asian side. It bypasses all general traffic and runs 24/7.</p>

        <h3>2. Primary Metro Lines:</h3>
        <ul>
          <li><strong>M2 Line:</strong> Connects Yenikapı to Hacıosman, passing through business districts: Şişli (Mecidiyeköy), Levent, and Maslak.</li>
          <li><strong>M4 Line:</strong> Traverses the Asian side connecting Kadıköy to Kartal/Sabiha Gökçen.</li>
        </ul>
      `
    },
    {
      title: 'Turkey Minimum Wage & Employer Cost 2026: Complete Guide',
      slug: 'turkey-minimum-wage-employer-cost-2026',
      summary: 'A detailed breakdown of Turkey\'s gross and net minimum wage for 2026, real employer cost calculations with SGK incentives, and business budgeting implications.',
      publishedAt: '2026-06-25',
      content: `
        <div class="article-rich-text">
          <img src="https://images.unsplash.com/photo-1625225230517-7426c1be750c?q=80&w=1200" alt="Turkey Minimum Wage 2026" style="width: 100%; height: auto; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--shadow-md);">
          
          <p>The declaration of the <strong>minimum wage in Turkey for 2026</strong> is a key economic factor for both local businesses and foreign professionals. It forms the benchmark for corporate operational budgeting and salary structures. This guide outlines the exact gross and net minimum wages, mandatory SGK payroll deductions, real employer cost calculations, and available government incentives.</p>

          <h2>1. Gross vs Net Minimum Wage in Turkey (2026)</h2>
          <p>For the calendar year 2026, the official minimum wage parameters in Turkey are established as:</p>
          <ul>
            <li><strong>Gross Minimum Wage (Brüt Ücret):</strong> 33,030.00 TRY per month.</li>
            <li><strong>Net Minimum Wage (Net Ücret):</strong> 28,075.50 TRY per month.</li>
          </ul>

          <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200" alt="Accounting & Calculations" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

          <h2>2. Employee Payroll Deductions Breakdown</h2>
          <p>The delta between the gross and net wage consists of mandatory social security and unemployment insurance deductions withheld directly from the employee\'s salary:</p>
          <ul>
            <li><strong>Employee SGK Premium Share (14%):</strong> 4,624.20 TRY.</li>
            <li><strong>Employee Unemployment Insurance Share (1%):</strong> 330.30 TRY.</li>
            <li><strong>Total Employee Deductions (15%):</strong> 4,954.50 TRY.</li>
          </ul>

          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200" alt="Budget Planning Meeting" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

          <h2>3. Real Cost of Minimum Wage for the Employer</h2>
          <p>For businesses in Istanbul, the total financial cost of a minimum wage worker exceeds the gross wage. Employers must contribute additional premiums, which vary based on compliance and incentives:</p>
          
          <h3>Scenario A: Standard Cost (Without incentives/discounts)</h3>
          <ul>
            <li><strong>Gross Salary:</strong> 33,030.00 TRY.</li>
            <li><strong>Employer SGK Contribution (20.5%):</strong> 6,771.15 TRY.</li>
            <li><strong>Employer Unemployment Contribution (2%):</strong> 660.60 TRY.</li>
            <li><strong>Total Standard Cost:</strong> 40,461.75 TRY.</li>
          </ul>

          <h3>Scenario B: Discounted Cost (With the 5% SGK compliance incentive)</h3>
          <p>Compliant employers with no outstanding debts to SGK receive a 5% discount on the employer share, lowering it to 15.5%:</p>
          <ul>
            <li><strong>Gross Salary:</strong> 33,030.00 TRY.</li>
            <li><strong>Employer SGK Contribution after discount (15.5%):</strong> 5,119.65 TRY.</li>
            <li><strong>Employer Unemployment Contribution (2%):</strong> 660.60 TRY.</li>
            <li><strong>Total Discounted Cost:</strong> 38,810.25 TRY.</li>
          </ul>

          <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200" alt="Industrial Manufacturing in Turkey" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

          <h2>4. Work Permit Multipliers for Foreign Employees</h2>
          <p>For international recruits in Istanbul, the Turkish Ministry of Labor mandates multiples of the gross minimum wage depending on the job function to qualify for a work permit (Çalışma İzni):</p>
          <ul>
            <li><strong>Executives & C-Level:</strong> 6.5x gross minimum wage (approx. 214,695 TRY).</li>
            <li><strong>Department Managers & Engineers:</strong> 4x gross minimum wage (approx. 132,120 TRY).</li>
            <li><strong>Technical Staff, Sales, & Translators:</strong> 1.5x gross minimum wage (approx. 49,545 TRY).</li>
            <li><strong>Standard Labor:</strong> 1x gross minimum wage (33,030 TRY).</li>
          </ul>

          <img src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200" alt="Financial Charts and Turkey Currency" style="width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: var(--shadow-md);">

          <h2>5. Frequently Asked Questions (FAQ)</h2>
          <h3>What is the net minimum wage in Turkey for 2026?</h3>
          <p>The net salary received by the employee is 28,075.50 TRY per month.</p>
          
          <h3>Are minimum wage earnings subject to income tax?</h3>
          <p>No, Turkey continues to exempt minimum wage earnings from both income tax and stamp duty to ease the tax burden on labor.</p>
          
          <h3>How does the 5% SGK incentive benefit employers?</h3>
          <p>It reduces the total monthly cost per worker from 40,461.75 TRY to 38,810.25 TRY, saving 1,651.50 TRY per employee for compliant businesses.</p>
        </div>
      `
    }
  ]
};

// Blog List View
careerBlogRouter.get('/:locale/blog', async (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/blog');

  const db = (c.env as any).DB;
  let articles = seededArticles[locale];

  try {
    // Attempt to query additional documents from database
    const rows = await db.prepare(
      `SELECT data, published_at FROM documents WHERE type_id = 'blog_post' AND status = 'published' AND is_published = 1 ORDER BY published_at DESC`
    ).all();
    
    if (rows.results && rows.results.length > 0) {
      const dbArticles = rows.results.map((row: any) => {
        const parsed = JSON.parse(row.data);
        return {
          title: parsed.title,
          slug: parsed.slug,
          summary: parsed.content ? parsed.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...' : '',
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
    }
  }[locale];

  const listHtml = articles.map(art => {
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
  const locale = c.req.param('locale') as 'ar' | 'en';
  const slug = c.req.param('slug');
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/blog');

  const db = (c.env as any).DB;
  let article = seededArticles[locale].find(art => art.slug === slug);

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
    return c.text(locale === 'ar' ? 'المقالة غير موجودة.' : 'Article not found.', 404);
  }

  const html = `
    <div class="container" style="max-width: 800px; padding: 60px 20px; margin-bottom: 100px;">
      <div style="margin-bottom: 24px;">
        <a href="/${locale}/blog" style="color: var(--primary); font-weight: 700;">${locale === 'ar' ? '← العودة للمدونة' : '← Back to Blog'}</a>
      </div>

      <article class="glass-card" style="padding: 40px; border-radius: var(--radius-xl);">
        <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 12px;"><i class="fa-regular fa-calendar"></i> ${locale === 'ar' ? 'تم النشر في:' : 'Published At:'} ${article.publishedAt}</span>
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
