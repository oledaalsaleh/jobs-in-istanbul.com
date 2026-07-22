import { Hono } from 'hono'
import { renderLayout } from './public'
import { rateLimiter } from '../middleware/security'

export const aiFeaturesRouter = new Hono()

// CV & Cover Letter Optimizer Page
aiFeaturesRouter.get('/:locale/cv-optimizer', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/cv-optimizer');

  const t = {
    ar: {
      title: 'مساعد الذكاء الاصطناعي لتحسين السيرة الذاتية',
      subtitle: 'قم بتحسين سيرتك الذاتية وكتابة رسائل التغطية (Cover Letter) بشكل احترافي ومخصص للوظيفة التي تريدها باستخدام الذكاء الاصطناعي.',
      jobDescPlh: 'الصق متطلبات الوظيفة الشاغرة أو الوصف الوظيفي هنا...',
      expPlh: 'اكتب مهاراتك وخبراتك الأساسية أو الصق سيرتك الذاتية الحالية هنا...',
      jobDescLabel: 'الوصف الوظيفي والمسؤوليات',
      expLabel: 'خبراتك وسيرتك الذاتية الحالية',
      submitBtn: 'توليد رسالة التغطية والتحسينات 🤖',
      loading: 'جاري التحليل وصياغة الرسالة بالذكاء الاصطناعي... ⏳',
      resultsTitle: 'النتائج المقترحة بالذكاء الاصطناعي',
      coverLetterTab: 'رسالة التغطية (Cover Letter)',
      tipsTab: 'نصائح لتحسين السيرة الذاتية',
      copyBtn: 'نسخ النص',
      copied: 'تم النسخ بنجاح!'
    },
    en: {
      title: 'AI CV & Cover Letter Optimizer',
      subtitle: 'Optimize your resume and generate customized, professional cover letters tailored to your target job using Workers AI.',
      jobDescPlh: 'Paste the target job description or requirements here...',
      expPlh: 'Enter your skills, experience, or paste your current CV here...',
      jobDescLabel: 'Job Description & Requirements',
      expLabel: 'Your Experience & Current CV',
      submitBtn: 'Generate Cover Letter & Optimize 🤖',
      loading: 'Analyzing job requirements and drafting... ⏳',
      resultsTitle: 'AI Optimized Results',
      coverLetterTab: 'Cover Letter',
      tipsTab: 'Resume Optimization Tips',
      copyBtn: 'Copy to Clipboard',
      copied: 'Copied!'
    },
    tr: {
      title: 'Yapay Zeka ile CV ve Ön Yazı Geliştirici',
      subtitle: 'Workers AI kullanarak özgeçmişinizi optimize edin ve hedef işinize özel profesyonel ön yazılar oluşturun.',
      jobDescPlh: 'Hedef iş tanımını veya gereksinimlerini buraya yapıştırın...',
      expPlh: 'Becerilerinizi, deneyiminizi girin veya mevcut CV\'nizi buraya yapıştırın...',
      jobDescLabel: 'İş Tanımı ve Gereksinimler',
      expLabel: 'Deneyimleriniz ve Mevcut Özgeçmişiniz',
      submitBtn: 'Ön Yazı Oluştur ve Optimize Et 🤖',
      loading: 'İş gereksinimleri analiz ediliyor ve hazırlanıyor... ⏳',
      resultsTitle: 'Yapay Zeka Optimize Edilmiş Sonuçlar',
      coverLetterTab: 'Ön Yazı (Cover Letter)',
      tipsTab: 'Özgeçmiş İpuçları',
      copyBtn: 'Kopyala',
      copied: 'Kopyalandı!'
    },
    ru: {
      title: 'ИИ-Улучшение резюме и Сопроводительное письмо',
      subtitle: 'Оптимизируйте свое резюме с помощью Workers AI и создайте профессиональные сопроводительные письма, адаптированные для вашей цели.',
      jobDescPlh: 'Вставьте описание вакансии или требования сюда...',
      expPlh: 'Введите свои навыки, опыт или вставьте текущее резюме сюда...',
      jobDescLabel: 'Описание вакансии и требования',
      expLabel: 'Ваш опыт и текущее резюме',
      submitBtn: 'Создать сопроводительное письмо и оптимизировать 🤖',
      loading: 'Анализ требований и подготовка... ⏳',
      resultsTitle: 'Результаты оптимизации ИИ',
      coverLetterTab: 'Сопроводительное письмо',
      tipsTab: 'Советы по резюме',
      copyBtn: 'Копировать',
      copied: 'Скопировано!'
    },
    fa: {
      title: 'بهینه‌ساز رزومه و انگیزه‌نامه با هوش مصنوعی',
      subtitle: 'رزومه خود را بهینه‌سازی کنید و انگیزه‌نامه‌های سفارشی و حرفه‌ای متناسب با شغل هدف خود با استفاده از هوش مصنوعی بنویسید.',
      jobDescPlh: 'شرح وظایف یا شرایط احراز شغل مورد نظر را اینجا وارد کنید...',
      expPlh: 'مهارت‌ها، تجربیات کاری یا رزومه فعلی خود را اینجا بنویسید یا بچسبانید...',
      jobDescLabel: 'شرح موقعیت شغلی و نیازمندی‌ها',
      expLabel: 'تجربیات و رزومه فعلی شما',
      submitBtn: 'تولید انگیزه‌نامه و بهینه‌سازی 🤖',
      loading: 'در حال تحلیل نیازمندی‌ها و نگارش انگیزه‌نامه... ⏳',
      resultsTitle: 'نتایج بهینه‌سازی شده هوش مصنوعی',
      coverLetterTab: 'انگیزه‌نامه (Cover Letter)',
      tipsTab: 'نصائح بهینه‌سازی رزومه',
      copyBtn: 'کپی در حافظه',
      copied: 'کپی شد!'
    },
    ur: {
      title: 'اے آئی سی وی آپٹیمائزر اور کور لیٹر جنریٹر',
      subtitle: 'مصنوعی ذہانت کی مدد سے اپنے سی وی کو ملازمت کے مطابق بہتر بنائیں اور پرکشش کور لیٹر لکھیں۔',
      jobDescPlh: 'ملازمت کی تفصیلات یا شرائط کو یہاں درج کریں...',
      expPlh: 'اپنی مہارتیں، تجربہ یا موجودہ سی وی کا متن یہاں پیسٹ کریں...',
      jobDescLabel: 'ملازمت کی تفصیلات',
      expLabel: 'آپ کا تجربہ اور مہارتیں',
      submitBtn: 'اے آئی آپٹیمائزیشن شروع کریں 🤖',
      loading: 'تجزیہ اور تحریر جاری ہے... ⏳',
      resultsTitle: 'اے آئی کے تیار کردہ نتائج',
      coverLetterTab: 'کور لیٹر (Cover Letter)',
      tipsTab: 'سی وی کی بہتری کے مشورے',
      copyBtn: 'کاپی کریں',
      copied: 'کاپی ہو گیا!'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 900px; padding: 60px 20px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem; max-width: 700px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>

      <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg); margin-bottom: 40px;">
        <form id="optimizer-form">
          <input type="hidden" name="locale" value="${locale}">
          
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.jobDescLabel}</label>
            <textarea name="jobDescription" required placeholder="${t.jobDescPlh}" rows="6" style="width: 100%; padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); color: var(--text-dark); resize: vertical;"></textarea>
          </div>

          <div style="margin-bottom: 30px;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.expLabel}</label>
            <textarea name="experience" required placeholder="${t.expPlh}" rows="8" style="width: 100%; padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); color: var(--text-dark); resize: vertical;"></textarea>
          </div>

          <button type="submit" id="optSubmitBtn" class="btn-sidebar-apply" style="border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            ${t.submitBtn}
          </button>
        </form>
      </div>

      <!-- Results Container -->
      <div id="optimizer-results" class="glass-card" style="display: none; padding: 30px; border-radius: var(--radius-lg); animation: fadeIn 0.4s ease;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 12px;">${t.resultsTitle}</h2>
        
        <div style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
          <button class="tab-btn active" onclick="switchOptTab('cover-letter-box')" style="background: none; border: none; padding: 8px 16px; font-weight: 700; color: var(--primary); cursor: pointer; border-bottom: 2px solid var(--primary);">${t.coverLetterTab}</button>
          <button class="tab-btn" onclick="switchOptTab('tips-box')" style="background: none; border: none; padding: 8px 16px; font-weight: 700; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent;">${t.tipsTab}</button>
        </div>

        <div id="cover-letter-box" class="opt-content">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
            <button onclick="copyContent('coverLetterText')" class="btn-apply-now" style="font-size: 0.85rem; padding: 6px 16px;"><i class="fa-regular fa-copy"></i> ${t.copyBtn}</button>
          </div>
          <div id="coverLetterText" style="white-space: pre-wrap; background: var(--bg-site); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border); color: var(--text-dark); line-height: 1.8;"></div>
        </div>

        <div id="tips-box" class="opt-content" style="display: none;">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
            <button onclick="copyContent('tipsText')" class="btn-apply-now" style="font-size: 0.85rem; padding: 6px 16px;"><i class="fa-regular fa-copy"></i> ${t.copyBtn}</button>
          </div>
          <div id="tipsText" style="white-space: pre-wrap; background: var(--bg-site); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border); color: var(--text-dark); line-height: 1.8;"></div>
        </div>
      </div>
    </div>

    <script>
      document.getElementById('optimizer-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('optSubmitBtn');
        const resultsDiv = document.getElementById('optimizer-results');
        
        btn.innerText = "${t.loading}";
        btn.disabled = true;
        resultsDiv.style.display = 'none';

        try {
          const res = await fetch('/api/cv-optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              locale: form.locale.value,
              jobDescription: form.jobDescription.value,
              experience: form.experience.value
            })
          });

          const data = await res.json();
          if (res.ok) {
            document.getElementById('coverLetterText').textContent = data.coverLetter;
            document.getElementById('tipsText').textContent = data.tips;
            resultsDiv.style.display = 'block';
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
          } else {
            alert(data.error || 'Failed to optimize. Please try again.');
          }
        } catch(err) {
          alert('Network error. Please try again.');
        } finally {
          btn.innerText = "${t.submitBtn}";
          btn.disabled = false;
        }
      });

      function switchOptTab(boxId) {
        document.querySelectorAll('.opt-content').forEach(box => box.style.display = 'none');
        document.getElementById(boxId).style.display = 'block';
        
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
          tab.style.color = 'var(--text-muted)';
          tab.style.borderBottomColor = 'transparent';
        });
        
        const activeTab = event.currentTarget;
        activeTab.style.color = 'var(--primary)';
        activeTab.style.borderBottomColor = 'var(--primary)';
      }

      function copyContent(elId) {
        const text = document.getElementById(elId).textContent;
        navigator.clipboard.writeText(text).then(() => {
          alert("${t.copied}");
        });
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
})

// CV Optimizer API using Cloudflare Workers AI
aiFeaturesRouter.post('/api/cv-optimize', rateLimiter(3, 10), async (c) => {
  const env: any = c.env;
  if (!env.AI) {
    return c.json({ error: 'AI binding is not configured in this environment.' }, 500);
  }

  try {
    const { locale, jobDescription, experience } = await c.req.json();
    if (!jobDescription || !experience) {
      return c.json({ error: 'Missing description or experience' }, 400);
    }

    const aiPrompt = `
      You are an expert recruitment consultant and professional resume writer specializing in the Istanbul job market.
      Your task is to write an impressive cover letter and suggest CV optimization suggestions.
      Output ONLY a clean JSON object with two fields: "coverLetter" and "tips". Do not output markdown code blocks.
      Requirements:
      - Write the response in the language corresponding to: ${locale === 'ar' ? 'Arabic' : (locale === 'tr' ? 'Turkish' : (locale === 'ru' ? 'Russian' : (locale === 'fa' ? 'Persian (Farsi)' : (locale === 'ur' ? 'Urdu' : 'English'))))}.
      - The cover letter must be professional, persuasive, and highly tailored to the provided job description using the candidate's experience.
      - The tips must contain 3 to 5 clear, bulleted recommendations to optimize the candidate's resume keywords and structure to match the job.
      
      JSON output format:
      {
        "coverLetter": "Generated cover letter...",
        "tips": "1. Recommend keyword...\\n2. Recommend layout..."
      }
    `;

    const userMessage = `
      JOB DESCRIPTION:
      ${jobDescription}

      CANDIDATE EXPERIENCE:
      ${experience}
    `;

    const aiResponse: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
      messages: [
        { role: 'system', content: aiPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    let rawResponse = aiResponse.response;
    rawResponse = rawResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();

    const parsed = JSON.parse(rawResponse);
    return c.json({
      coverLetter: parsed.coverLetter || 'Failed to generate cover letter.',
      tips: parsed.tips || 'Failed to generate tips.'
    });

  } catch(err: any) {
    console.error('AI CV Optimizer Error:', err);
    return c.json({ error: 'Failed to process AI optimization: ' + err.message }, 500);
  }
})

// Salary Calculator Page
aiFeaturesRouter.get('/:locale/salary-calculator', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/salary-calculator');

  const t = {
    ar: {
      title: 'حاسبة ومؤشر الرواتب في إسطنبول',
      subtitle: 'اعرف القيمة التقديرية لراتبك المتوقع في سوق العمل في إسطنبول لعام ٢٠٢٦ بناءً على تخصصك وخبرتك ولغاتك.',
      category: 'القطاع أو التخصص الوظيفي',
      experience: 'مستوى الخبرة',
      languages: 'اللغات المتقنة',
      calcBtn: 'احسب الراتب المتوقع 💳',
      resultTitle: 'تقدير الراتب الشهري (بالليرة التركية - TL)',
      levelJr: 'مبتدئ (٠-٢ سنة)',
      levelMid: 'متوسط (٣-٥ سنوات)',
      levelSr: 'متقدم (+٥ سنوات)',
      langAr: 'العربية فقط',
      langEn: 'الإنجليزية فقط',
      langBoth: 'الإنجليزية والعربية/التركية',
      langAll: 'ثنائي/ثلاثي اللغة (تركي + إنجليزي + عربي)',
      salaryLow: 'الحد الأدنى',
      salaryAvg: 'المتوسط المتوقع',
      salaryHigh: 'الحد الأعلى الممكن',
      tipsTitle: '💡 نصائح للتفاوض على الرواتب في إسطنبول:',
      tipsList: [
        'احرص على توضيح لغاتك الإضافية (مثل الإنجليزية أو التركية)، فهي ترفع الراتب بنسبة تتراوح بين ١٥٪ إلى ٣٠٪.',
        'تأكد من شمول العرض لـ "التأمين الصحي الخاص" و"بدل الطعام/المواصلات" كونهما يوفران جزءاً كبيراً من التكاليف.',
        'يُفضل دائماً التفاوض على الراتب الصافي (Net) بعد الضرائب بدلاً من الإجمالي (Gross).',
        'نظراً لتقلبات التضخم، بعض الشركات الدولية تقدم رواتب مربوطة بالدولار أو اليورو أو تعديلات ربع سنوية.'
      ]
    },
    en: {
      title: 'Istanbul Salary Estimator',
      subtitle: 'Calculate your estimated monthly salary range in the Istanbul job market for 2026 based on field, experience, and languages.',
      category: 'Job Field / Sector',
      experience: 'Experience Level',
      languages: 'Languages Spoken',
      calcBtn: 'Estimate Salary 💳',
      resultTitle: 'Monthly Salary Estimate (Turkish Lira - TL)',
      levelJr: 'Junior (0-2 years)',
      levelMid: 'Mid-Level (3-5 years)',
      levelSr: 'Senior (5+ years)',
      langAr: 'Arabic Only',
      langEn: 'English Only',
      langBoth: 'English & Arabic/Turkish',
      langAll: 'Bilingual/Trilingual (Turkish + English + Arabic)',
      salaryLow: 'Minimum Base',
      salaryAvg: 'Expected Average',
      salaryHigh: 'Maximum Potential',
      tipsTitle: '💡 Salary Negotiation Tips in Istanbul:',
      tipsList: [
        'Being multilingual (English/Turkish/Arabic) is a premium skill, increasing average offers by 15% to 30%.',
        'Confirm if the offer includes private health insurance (SGK/Özel) and meal card (Sodexo/Multinet) benefits.',
        'Always negotiate the Net Salary (after taxes) rather than the Gross salary.',
        'Due to inflation dynamics, some international companies offer salary indexing or pegging to USD/EUR.'
      ]
    },
    tr: {
      title: 'İstanbul Maaş Hesaplayıcı',
      subtitle: 'Uzmanlık alanı, deneyim ve konuştuğunuz dillere göre 2026 yılı İstanbul iş piyasasındaki tahmini aylık maaş aralığınızı hesaplayın.',
      category: 'Sektör / İş Alanı',
      experience: 'Deneyim Seviyesi',
      languages: 'Konuşulan Diller',
      calcBtn: 'Maaş Tahmini Hesapla 💳',
      resultTitle: 'Aylık Tahmini Maaş (Türk Lirası - TL)',
      levelJr: 'Başlangıç (0-2 yıl)',
      levelMid: 'Orta Seviye (3-5 yıl)',
      levelSr: 'Kıdemli (5+ yıl)',
      langAr: 'Sadece Arapça',
      langEn: 'Sadece İngilizce',
      langBoth: 'İngilizce ve Arapça/Türkçe',
      langAll: 'Çok Dilli (Türkçe + İngilizce + Arapça)',
      salaryLow: 'Minimum Taban',
      salaryAvg: 'Beklenen Ortalama',
      salaryHigh: 'Maksimum Potansiyel',
      tipsTitle: '💡 İstanbul\'da Maaş Pazarlığı İpuçları:',
      tipsList: [
        'Çok dilli olmak (Türkçe/İngilizce/Arapça) büyük bir avantajdır ve ortalama teklifleri %15 ila %30 oranında artırır.',
        'Teklifin özel sağlık sigortası (SGK/Özel) ve yemek kartı (Sodexo/Multinet) gibi yan hakları içerip içermediğini kontrol edin.',
        'Maaş pazarlığını her zaman Brüt değil, Net Maaş üzerinden yapın.',
        'Enflasyon dinamikleri nedeniyle, some international companies offer USD/EUR endeksli maaş veya üç ayda bir düzenleme sunmaktadır.'
      ]
    },
    ru: {
      title: 'Калькулятор зарплат в Стамбуле',
      subtitle: 'Узнайте примерный диапазон месячной зарплаты на рынке труда Стамбула в 2026 году на основе вашей отрасли, опыта и языков.',
      category: 'Отрасль / Сфера работы',
      experience: 'Уровень опыта',
      languages: 'Языки общения',
      calcBtn: 'Рассчитать зарплату 💳',
      resultTitle: 'Оценочная месячная зарплата (в турецких лирах - TL)',
      levelJr: 'Начинающий (0-2 года)',
      levelMid: 'Средний уровень (3-5 лет)',
      levelSr: 'Старший / Kıdemli (5+ лет)',
      langAr: 'Только арабский',
      langEn: 'Только английский',
      langBoth: 'Английский и арабский/турецкий',
      langAll: 'Два или более языков (турецкий + английский + арабский)',
      salaryLow: 'Минимальный порог',
      salaryAvg: 'Среднее ожидание',
      salaryHigh: 'Максимальный потенциал',
      tipsTitle: '💡 Советы по переговорам о зарплате в Стамбуле:',
      tipsList: [
        'Знание нескольких языков (турецкий/английский/арабский) является большим преимуществом и повышает предложения на 15–30%.',
        'Проверьте, включает ли предложение социальный пакет (частная страховка SGK/Özel и проезд/питание Sodexo/Multinet).',
        'Всегда ведите переговоры о чистой зарплате (Net) после уплаты налогов, а не о брутто-зарплате.',
        'В связи с инфляцией международные компании предлагают оклады, привязанные к USD/EUR или пересматриваемые ежеквартально.'
      ]
    },
    fa: {
      title: 'تخمین‌گر حقوق و دستمزد استانبول',
      subtitle: 'محدوده حقوق ماهیانه تخمینی خود را در بازار کار استانبول برای سال ۲۰۲۶ بر اساس تخصص، سابقه کار و زبان‌های تسلط محاسبه کنید.',
      category: 'حوزه کاری / بخش شغلی',
      experience: 'سابقه و سطح مهارت',
      languages: 'زبان‌های تسلط',
      calcBtn: 'محاسبه حقوق تقریبی 💳',
      resultTitle: 'حقوق ماهیانه تقریبی (لیره ترکیه - TL)',
      levelJr: 'مبتدئ / جونیور (۰-۲ سال)',
      levelMid: 'میان‌رده / میدلول (۳-۵ سال)',
      levelSr: 'ارشد / سنیور (+۵ سال)',
      langAr: 'فقط عربی',
      langEn: 'فقط انگلیسی',
      langBoth: 'انگلیسی و عربی/ترکی',
      langAll: 'چندزبانه (ترکی + انگلیسی + عربی/فارسی)',
      salaryLow: 'حداقل حقوق پایه',
      salaryAvg: 'میانگین مورد انتظار',
      salaryHigh: 'حداکثر پتانسیل حقوق',
      tipsTitle: '💡 نکات مذاکره حقوق در استانبول:',
      tipsList: [
        'تسلط به چند زبان (انگلیسی/ترکی/فارسی) یک مزیت بزرگ است و میزان حقوق پیشنهادی را ۱۵٪ تا ۳۰٪ افزایش می‌دهد.',
        'بررسی کنید که آیا پیشنهاد کاری شامل بیمه درمانی تکمیلی (SGK/Özel) و کمک هزینه غذا/ایاب ذهاب (Sodexo) می‌شود یا خیر.',
        'همیشه در مورد حقوق خالص (Net) توافق کنید، نه حقوق ناخالص (Gross) قبل از کسر مالیات.',
        'به دلیل تورم، برخی از شرکت‌های بین‌المللی حقوق خود را به دلار/یورو پرداخت کرده یا تعدیل فصلی اعمال می‌کنند.'
      ]
    },
    ur: {
      title: 'استنبول سیلری انڈیکس اور تنخواہ کیلکولیٹر',
      subtitle: 'اپنے شعبے، تجربے اور زبانوں کی مہارت کے مطابق سال ۲۰۲۶ میں استنبول کی متوقع تنخواہ کا اندازہ لگائیں۔',
      category: 'پیشہ ورانہ شعبہ',
      experience: 'تجربہ اور مہارت کا درجہ',
      languages: 'زبانوں کی مہارت',
      calcBtn: 'متوقع تنخواہ کا حساب لگائیں 💳',
      resultTitle: 'متوقع ماہانہ تنخواہ (ترک لیرا - TL)',
      levelJr: 'جونیئر (۰-۲ سال)',
      levelMid: 'مڈ لیول (۳-۵ سال)',
      levelSr: 'سینیئر (+۵ سال)',
      langAr: 'صرف عربی',
      langEn: 'صرف انگریزی',
      langBoth: 'انگریزی اور ترکی/عربی',
      langAll: 'چند لسانی (ترکی + انگریزی + عربی/اردو)',
      salaryLow: 'کم از کم تنخواہ',
      salaryAvg: 'اوسط متوقع تنخواہ',
      salaryHigh: 'زیادہ سے زیادہ حد',
      tipsTitle: '💡 استنبول میں تنخواہ پر بات چیت کے مشورے:',
      tipsList: [
        'چند زبانوں (ترکی/انگریزی/اردو) پر عبور ایک بڑا فائدہ ہے اور تنخواہ کی پیشکش میں ۱۵٪ سے ۳۰٪ اضافہ کر سکتا ہے۔',
        'چیک کریں کہ کیا پیشکش میں سوشل پیکج (انشورنس SGK، سفری اور کھانے کا الاؤنس Sodexo) شامل ہے یا نہیں۔',
        'ہمیشہ خالص تنخواہ (Net Salary) پر بات چیت کریں، مجموعی (Gross) پر نہیں۔',
        'مہنگائی کی وجہ سے بین الاقوامی کمپنیاں تنخواہوں کو ڈالر/یورو سے منسلک کرتی ہیں یا ہر تین ماہ بعد جائزہ لیتی ہیں۔'
      ]
    }
  }[locale];

  const html = `
    <style>
      .sal-calc-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
      }
      @media (max-width: 768px) {
        .sal-calc-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
    <div class="container" style="max-width: 900px; padding: 60px 20px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem; max-width: 700px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>

      <div class="sal-calc-grid">
        <!-- Inputs Card -->
        <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg);">
          <form id="salary-form" onsubmit="calculateSalary(event)">
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.category}</label>
              <select id="sal-field" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); color: var(--text-dark);">
                <option value="software">IT & Software / البرمجة وتكنولوجيا المعلومات</option>
                <option value="marketing">Marketing & Ads / التسويق والإعلانات</option>
                <option value="translation">Translation & Content / الترجمة وكتابة المحتوى</option>
                <option value="sales">Sales & Business / المبيعات وإدارة الأعمال</option>
                <option value="support">Customer Service / خدمة العملاء والسبورت</option>
              </select>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.experience}</label>
              <select id="sal-exp" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); color: var(--text-dark);">
                <option value="jr">${t.levelJr}</option>
                <option value="mid">${t.levelMid}</option>
                <option value="sr">${t.levelSr}</option>
              </select>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.languages}</label>
              <select id="sal-lang" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); color: var(--text-dark);">
                <option value="ar">${t.langAr}</option>
                <option value="en">${t.langEn}</option>
                <option value="both">${t.langBoth}</option>
                <option value="all">${t.langAll}</option>
              </select>
            </div>

            <div style="margin-bottom: 30px;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">
                ${locale === 'ar' ? 'منطقة السكن المتوقعة لحساب التكاليف' : 'Expected Residential District'}
              </label>
              <select id="sal-district" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); color: var(--text-dark);">
                <option value="luxury">${locale === 'ar' ? 'بشكتاش، شيشلي، كاديكوي (إيجار مرتفع)' : 'Besiktas, Sisli, Kadikoy (High Rent)'}</option>
                <option value="mid">${locale === 'ar' ? 'الفاتح، بيوغلو، إسكودار (إيجار متوسط)' : 'Fatih, Beyoglu, Uskudar (Mid Rent)'}</option>
                <option value="low">${locale === 'ar' ? 'اسنيورت، بيليك دوزو، بندك (إيجار اقتصادي)' : 'Esenyurt, Beylikduzu, Pendik (Budget)'}</option>
                <option value="general">${locale === 'ar' ? 'مناطق أخرى في إسطنبول (عام)' : 'Other Districts (General)'}</option>
              </select>
            </div>

            <button type="submit" class="btn-sidebar-apply" style="border: none;">${t.calcBtn}</button>
          </form>
        </div>

        <!-- Output Visual Card -->
        <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin-bottom: 20px; text-align: center;">${t.resultTitle}</h2>
            
            <div style="text-align: center; margin-bottom: 24px;">
              <div id="sal-result-avg" style="font-size: 2.8rem; font-weight: 900; color: var(--primary); text-shadow: 0 4px 12px var(--primary-glow);">--</div>
              <span style="font-weight: 600; color: var(--text-muted); font-size: 0.9rem;">${t.salaryAvg}</span>
            </div>

            <div style="display: flex; justify-content: space-between; gap: 16px; font-weight: 600; border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 20px;">
              <div style="text-align: center; flex: 1;">
                <div id="sal-result-low" style="color: var(--text-dark); font-size: 1.1rem; font-weight: 700;">--</div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${t.salaryLow}</span>
              </div>
              <div style="text-align: center; flex: 1; border-left: 1px solid var(--border);">
                <div id="sal-result-high" style="color: var(--accent); font-size: 1.1rem; font-weight: 700;">--</div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${t.salaryHigh}</span>
              </div>
            </div>
          </div>

          <!-- Cost of Living & Savings Estimation -->
          <div style="background: rgba(0,0,0,0.02); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <h4 style="font-weight: 800; color: var(--text-dark); margin: 0 0 12px 0; font-size: 0.95rem; text-align: center;">
              ${locale === 'ar' ? '📊 التكاليف المعيشية والادخار المتوقع' : '📊 Cost of Living & Savings Estimate'}
            </h4>
            
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px; color: var(--text-main);">
              <span>${locale === 'ar' ? '🏠 إيجار السكن التقديري:' : '🏠 Estimated Rent:'}</span>
              <span id="rent-cost" style="font-weight: 700;">--</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 12px; color: var(--text-main); border-bottom: 1px dashed var(--border); padding-bottom: 8px;">
              <span>${locale === 'ar' ? '🚌 المواصلات والمعيشة الأساسية:' : '🚌 Transport & Living Essentials:'}</span>
              <span id="living-cost" style="font-weight: 700;">--</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.95rem; font-weight: 700; color: var(--text-dark);">
              <span>${locale === 'ar' ? '💰 صافي المدخرات الشهري:' : '💰 Net Monthly Savings:'}</span>
              <span id="savings-cost" style="color: var(--primary); font-size: 1.1rem;">--</span>
            </div>
            <div id="savings-status" style="margin-top: 10px; text-align: center;">
              --
            </div>
          </div>
        </div>
      </div>

      <!-- Salary Tips -->
      <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg); margin-top: 40px;">
        <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-dark); margin-bottom: 16px;">${t.tipsTitle}</h3>
        <ul style="list-style: none; padding: 0;">
          ${t.tipsList.map(tip => `<li style="margin-bottom: 12px; display: flex; gap: 10px; line-height: 1.6;"><i class="fa-solid fa-circle-check" style="color: var(--primary); margin-top: 4px; flex-shrink: 0;"></i> <span>${tip}</span></li>`).join('')}
        </ul>
      </div>
    </div>

    <script>
      // Seeded salary data structures
      const baseSalaries = {
        software: { jr: 40000, mid: 75000, sr: 130000 },
        marketing: { jr: 28000, mid: 50000, sr: 90000 },
        translation: { jr: 32000, mid: 60000, sr: 100000 },
        sales: { jr: 25000, mid: 45000, sr: 80000 },
        support: { jr: 22000, mid: 38000, sr: 65000 }
      };

      const langMultipliers = {
        ar: 1.0,
        en: 1.15,
        both: 1.25,
        all: 1.40
      };

      const districtRent = {
        luxury: 22000,
        mid: 16000,
        low: 11000,
        general: 14000
      };

      const generalLivingCost = 9500; // utilities, internet, transport (istanbulkart monthly), basic groceries

      function calculateSalary(e) {
        if(e) e.preventDefault();
        const field = document.getElementById('sal-field').value;
        const exp = document.getElementById('sal-exp').value;
        const lang = document.getElementById('sal-lang').value;
        const district = document.getElementById('sal-district').value;

        const base = baseSalaries[field][exp];
        const mult = langMultipliers[lang];
        
        const avg = Math.round(base * mult);
        const low = Math.round(avg * 0.85);
        const high = Math.round(avg * 1.25);

        const rent = districtRent[district];
        const living = generalLivingCost;
        const savings = avg - (rent + living);

        // Render with formatter
        const isAr = '${locale}' === 'ar';
        const formatter = new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
        
        document.getElementById('sal-result-avg').textContent = formatter.format(avg);
        document.getElementById('sal-result-low').textContent = formatter.format(low);
        document.getElementById('sal-result-high').textContent = formatter.format(high);

        document.getElementById('rent-cost').textContent = formatter.format(rent);
        document.getElementById('living-cost').textContent = formatter.format(living);
        
        const savingsEl = document.getElementById('savings-cost');
        savingsEl.textContent = formatter.format(savings);
        savingsEl.style.color = savings >= 0 ? 'var(--primary)' : 'var(--danger)';

        const statusEl = document.getElementById('savings-status');
        if (savings > avg * 0.25) {
          statusEl.innerHTML = isAr 
            ? '<span style="color:#166534; background:#dcfce7; padding:4px 10px; border-radius:var(--r-full); font-size:0.8rem; font-weight:700; display:inline-block;">✓ ادخار ممتاز</span>' 
            : '<span style="color:#166534; background:#dcfce7; padding:4px 10px; border-radius:var(--r-full); font-size:0.8rem; font-weight:700; display:inline-block;">✓ Excellent Savings</span>';
        } else if (savings > 0) {
          statusEl.innerHTML = isAr 
            ? '<span style="color:#854d0e; background:#fef08a; padding:4px 10px; border-radius:var(--r-full); font-size:0.8rem; font-weight:700; display:inline-block;">⚠ ميزانية مقيدة</span>' 
            : '<span style="color:#854d0e; background:#fef08a; padding:4px 10px; border-radius:var(--r-full); font-size:0.8rem; font-weight:700; display:inline-block;">⚠ Tight Budget</span>';
        } else {
          statusEl.innerHTML = isAr 
            ? '<span style="color:#991b1b; background:#fee2e2; padding:4px 10px; border-radius:var(--r-full); font-size:0.8rem; font-weight:700; display:inline-block;">✗ عجز مالي متوقع</span>' 
            : '<span style="color:#991b1b; background:#fee2e2; padding:4px 10px; border-radius:var(--r-full); font-size:0.8rem; font-weight:700; display:inline-block;">✗ Deficit Warning</span>';
        }
      }

      // Hook listeners to form controls for real-time updates
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('#salary-form select').forEach(select => {
          select.addEventListener('change', () => calculateSalary());
        });
        calculateSalary();
      });
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
})

// Resume Builder Page
aiFeaturesRouter.get('/:locale/resume-builder', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/resume-builder');

  const t = {
    ar: {
      title: 'منشئ السيرة الذاتية الاحترافية التفاعلي',
      subtitle: 'اصنع سيرتك الذاتية المميزة بخطوات بسيطة، وتصفح قوالب متعددة، وقم بتنزيلها كـ PDF فوراً.',
      personalTab: 'البيانات الشخصية',
      expTab: 'الخبرة المهنية',
      eduTab: 'التعليم والشهادات',
      skillsTab: 'المهارات والتصميم',
      fullName: 'الاسم الكامل',
      jobTitle: 'المسمى الوظيفي المستهدف',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      summary: 'الملخص المهني',
      company: 'اسم الشركة / جهة العمل',
      role: 'المسمى الوظيفي',
      dates: 'الفترة (مثال: ٢٠٢٤ - الحالي)',
      desc: 'المهام والإنجازات الرئيسية',
      school: 'الجامعة / الكلية / المدرسة',
      degree: 'الدرجة العلمية والتخصص',
      skills: 'المهارات الأساسية (افصل بينها بفاصلة)',
      languages: 'اللغات (مثال: العربية (الأم)، الإنجليزية (ممتاز))',
      printBtn: '🖨️ طباعة وحفظ كـ PDF',
      addBtn: 'إضافة بند آخر +',
      previewTitle: 'معاينة السيرة الذاتية (قياس A4)',
      loadSampleBtn: '✨ تعبئة نموذج تجريبي',
      tplLabel: 'القالب:',
      colorLabel: 'اللون الرئيسي:',
      tplMinimal: 'بسيط عصري',
      tplSidebar: 'عمود جانبي احترافي',
      tplClassic: 'تنفيذي كلاسيكي',
      stepPrev: 'السابق',
      stepNext: 'التالي'
    },
    en: {
      title: 'Professional Interactive Resume Builder',
      subtitle: 'Create a stand-out resume in simple steps, choose templates, and export as PDF instantly.',
      personalTab: 'Personal Info',
      expTab: 'Experience',
      eduTab: 'Education',
      skillsTab: 'Skills & Design',
      fullName: 'Full Name',
      jobTitle: 'Target Job Title',
      email: 'Email Address',
      phone: 'Phone Number',
      summary: 'Professional Summary',
      company: 'Company / Employer',
      role: 'Job Role / Title',
      dates: 'Dates (e.g. 2024 - Present)',
      desc: 'Achievements & responsibilities',
      school: 'University / College',
      degree: 'Degree & Field of Study',
      skills: 'Skills (comma separated)',
      languages: 'Languages (e.g. Arabic (Native), English (Fluent))',
      printBtn: '🖨️ Print & Save PDF',
      addBtn: 'Add Item +',
      previewTitle: 'A4 Live Preview',
      loadSampleBtn: '✨ Load Sample Data',
      tplLabel: 'Template:',
      colorLabel: 'Theme Color:',
      tplMinimal: 'Modern Minimal',
      tplSidebar: 'Professional Sidebar',
      tplClassic: 'Executive Classic',
      stepPrev: 'Back',
      stepNext: 'Next'
    },
    tr: {
      title: 'Profesyonel İnteraktif Özgeçmiş Oluşturucu',
      subtitle: 'Basit adımlarla öne çıkan bir özgeçmiş oluşturun, şablonları seçin ve anında PDF olarak dışa aktarın.',
      personalTab: 'Kişisel Bilgiler',
      expTab: 'Mesleki Deneyim',
      eduTab: 'Eğitim ve Sertifikalar',
      skillsTab: 'Beceriler ve Tasarım',
      fullName: 'Ad Soyad',
      jobTitle: 'Hedef İş Unvanı',
      email: 'E-posta Adresi',
      phone: 'Telefon Numarası',
      summary: 'Özet Bilgi',
      company: 'Şirket / Kurum Adı',
      role: 'İş Unvanı',
      dates: 'Tarih Aralığı (Örn: 2024 - Mevcut)',
      desc: 'Başarılar ve sorumluluklar',
      school: 'Üniversite / Okul Adı',
      degree: 'Derece ve Bölüm',
      skills: 'Beceriler (virgülle ayırın)',
      languages: 'Diller (Örn: Türkçe (Ana Dil), İngilizce (İyi))',
      printBtn: '🖨️ Yazdır ve PDF Kaydet',
      addBtn: 'Yeni Öğe Ekle +',
      previewTitle: 'A4 Canlı Önizleme',
      loadSampleBtn: '✨ Örnek Veri Doldur',
      tplLabel: 'Şablon:',
      colorLabel: 'Tema Rengi:',
      tplMinimal: 'Modern Minimal',
      tplSidebar: 'Profesyonel Yan Sütunlu',
      tplClassic: 'Yönetici Klasiği',
      stepPrev: 'Geri',
      stepNext: 'İleri'
    },
    ru: {
      title: 'Интерактивный конструктор профессиональных резюме',
      subtitle: 'Создайте выдающееся резюме за простые шаги, выберите шаблон и экспортируйте в PDF мгновенно.',
      personalTab: 'Личные данные',
      expTab: 'Опыт работы',
      eduTab: 'Образование',
      skillsTab: 'Навыки и дизайн',
      fullName: 'Полное имя',
      jobTitle: 'Целевая должность',
      email: 'Электронная почта',
      phone: 'Номер телефона',
      summary: 'Профессиональное резюме / О себе',
      company: 'Компания / Работодатель',
      role: 'Должность',
      dates: 'Период (напр. 2024 - н.в.)',
      desc: 'Обязанности и достижения',
      school: 'Университет / Школа',
      degree: 'Степень и специальность',
      skills: 'Ключевые навыки (через запятую)',
      languages: 'Языки (напр. Русский (Родной), Турецкий (Разговорный))',
      printBtn: '🖨️ Печать и экспорт в PDF',
      addBtn: 'Добавить пункт +',
      previewTitle: 'Предпросмотр резюме (размер A4)',
      loadSampleBtn: '✨ Заполнить демо-данными',
      tplLabel: 'Шаблон:',
      colorLabel: 'Основной цвет:',
      tplMinimal: 'Современный минимализм',
      tplSidebar: 'Профессиональный сайдбар',
      tplClassic: 'Классический представительский',
      stepPrev: 'Назад',
      stepNext: 'Далее'
    },
    fa: {
      title: 'رزومه‌ساز تعاملی و حرفه‌ای',
      subtitle: 'رزومه کاری خود را در چند گام ساده بسازید، قالب دلخواه را انتخاب کنید و فایل PDF آن را فوراً دانلود کنید.',
      personalTab: 'اطلاعات فردی',
      expTab: 'سوابق شغلی',
      eduTab: 'تحصیلات و دوره‌ها',
      skillsTab: 'مهارت‌ها و طراحی',
      fullName: 'نام و نام خانوادگی',
      jobTitle: 'عنوان شغلی مورد نظر',
      email: 'آدرس ایمیل',
      phone: 'شماره تماس',
      summary: 'خلاصه رزومه / درباره من',
      company: 'نام شرکت / سازمان',
      role: 'سمت شغلی',
      dates: 'دوره زمانی (مثال: ۱۴۰۲ - تاکنون)',
      desc: 'مسئولیت‌ها و دستاوردهای کلیدی',
      school: 'دانشگاه / موسسه آموزشی',
      degree: 'مقطع و رشته تحصیلی',
      skills: 'مهارت‌های تخصصی (با کاما جدا کنید)',
      languages: 'زبان‌ها (مثال: فارسی (زبان مادری)، انگلیسی (پیشرفته))',
      printBtn: '🖨️ چاپ و ذخیره به عنوان PDF',
      addBtn: 'افزودن بخش جدید +',
      previewTitle: 'پیش‌نمایش رزومه (کاغذ A4)',
      loadSampleBtn: '✨ پر کردن با اطلاعات نمونه',
      tplLabel: 'انتخاب قالب رزومه:',
      colorLabel: 'رنگ اصلی قالب:',
      tplMinimal: 'مدرن و ساده (Minimal)',
      tplSidebar: 'سایدباردار حرفه‌ای',
      tplClassic: 'کلاسیک شرکتی',
      stepPrev: 'مرحله قبلی',
      stepNext: 'مرحله بعدی'
    },
    ur: {
      title: 'انٹرایکٹو اور پروفیشنل سی وی میکر',
      subtitle: 'چند آسان مراحل میں اپنا سی وی تیار کریں، پسندیدہ ٹیمپلیٹ منتخب کریں اور پی ڈی ایف ڈاؤن لوڈ کریں۔',
      personalTab: 'ذاتی معلومات',
      expTab: 'تجربہ کار',
      eduTab: 'تعلیم و تربیت',
      skillsTab: 'مہارتیں اور ڈیزائن',
      fullName: 'پورا نام',
      jobTitle: 'مطلوبہ عہدہ / نوکری کا عنوان',
      email: 'ای میل ایڈریس',
      phone: 'فون نمبر',
      summary: 'خلاصہ / اپنے بارے میں',
      company: 'کمپنی کا نام',
      role: 'عہدہ',
      dates: 'مدت (مثال: ۲۰۲۲ - تاحال)',
      desc: 'بنیادی ذمہ داریاں اور کامیابیاں',
      school: 'ادارہ / یونیورسٹی',
      degree: 'تعلیمی ڈگری',
      skills: 'مہارتیں (کوما سے الگ کریں)',
      languages: 'زبانیں (مثال: اردو (مادری زبان)، انگریزی (اعلیٰ))',
      printBtn: '🖨️ پرنٹ کریں اور پی ڈی ایف ڈاؤن لوڈ کریں',
      addBtn: 'نیا سیکشن شامل کریں +',
      previewTitle: 'سی وی کا پیش نظارہ (A4 سائز)',
      loadSampleBtn: '✨ نمونہ ڈیٹا لوڈ کریں',
      tplLabel: 'ٹیمپلیٹ منتخب کریں:',
      colorLabel: 'بنیادی رنگ:',
      tplMinimal: 'سادہ اور جدید (Minimal)',
      tplSidebar: 'پروفیشنل سائیڈ بار',
      tplClassic: 'کلاسیک کاروباری',
      stepPrev: 'پچھلا مرحلہ',
      stepNext: 'اگلا مرحلہ'
    }
  }[locale];

  const html = `
    <style>
      .stepper-steps {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        border-bottom: 1.5px solid var(--border);
        padding-bottom: 12px;
      }
      .step-tab {
        flex: 1;
        padding: 10px 4px;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-muted);
        border: none;
        background: transparent;
        cursor: pointer;
        transition: all var(--t-base);
        text-align: center;
        border-radius: var(--radius-sm);
      }
      .step-tab:hover {
        background: var(--bg-subtle);
        color: var(--text-dark);
      }
      .step-tab.active {
        color: var(--primary);
        background: var(--primary-light);
      }
      .control-panel {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 16px 24px;
        margin-bottom: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        align-items: center;
        justify-content: space-between;
        box-shadow: var(--shadow-sm);
      }
      .color-dot {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform var(--t-base);
        display: inline-block;
      }
      .color-dot:hover {
        transform: scale(1.15);
      }
      .color-dot.active {
        border-color: var(--text-dark);
        transform: scale(1.15);
      }
      .form-step-content {
        display: none;
      }
      .form-step-content.active {
        display: block;
      }
      
      .cv-header-minimal-classic { display: block; }
      .cv-sidebar-skills { display: none; }
      .cv-header-sidebar { display: none; }
      .cv-main-skills { display: block; }
      .cv-layout-wrap { display: block; }

      .tpl-sidebar .cv-layout-wrap { display: flex; flex-direction: row; align-items: stretch; min-height: 842px; }
      .tpl-sidebar .cv-sidebar-part { width: 32%; background: #f9fafb; border-right: 1px solid var(--border); padding: 30px 20px; box-sizing: border-box; }
      .rtl .tpl-sidebar .cv-sidebar-part { border-right: none; border-left: 1px solid var(--border); }
      .tpl-sidebar .cv-main-part { width: 68%; padding: 30px 24px; box-sizing: border-box; }
      
      .tpl-sidebar .cv-header-minimal-classic { display: none; }
      .tpl-sidebar .cv-main-skills { display: none; }
      .tpl-sidebar .cv-header-sidebar { display: block; }
      .tpl-sidebar .cv-sidebar-skills { display: block; }

      .dynamic-group-box {
        background: var(--bg-subtle);
        border: 1px dashed var(--border);
        border-radius: var(--radius-md);
        padding: 16px;
        margin-bottom: 16px;
        position: relative;
      }
      .btn-delete-item {
        position: absolute;
        top: 12px;
        right: 12px;
        background: transparent;
        border: none;
        color: #ef4444;
        cursor: pointer;
        font-size: 1rem;
        transition: opacity var(--t-base);
      }
      .rtl .btn-delete-item {
        right: auto;
        left: 12px;
      }
      .btn-delete-item:hover {
        color: #dc2626;
      }
      
      @media print {
        .control-panel, .stepper-steps, .step-actions, .btn-delete-item, .btn-apply-now, label {
          display: none !important;
        }
      }
    </style>

    <div class="container" style="padding-top: 40px; padding-bottom: 80px;" id="resume-container">
      
      <!-- Top controls (Hidden in print) -->
      <div class="control-panel no-print">
        <div>
          <span style="font-weight: 700; color: var(--text-dark); margin-right: 10px; display: inline-block;">${t.tplLabel}</span>
          <div class="btn-group" style="display: inline-flex; gap: 8px;">
            <button class="btn-apply-now active" id="btn-tpl-minimal" onclick="setTemplate('minimal')" style="padding: 6px 14px; font-size: 0.85rem; background: var(--primary); color: #fff;">${t.tplMinimal}</button>
            <button class="btn-apply-now" id="btn-tpl-sidebar" onclick="setTemplate('sidebar')" style="padding: 6px 14px; font-size: 0.85rem; background: var(--bg-subtle); color: var(--text-body);">${t.tplSidebar}</button>
            <button class="btn-apply-now" id="btn-tpl-classic" onclick="setTemplate('classic')" style="padding: 6px 14px; font-size: 0.85rem; background: var(--bg-subtle); color: var(--text-body);">${t.tplClassic}</button>
          </div>
        </div>

        <div>
          <span style="font-weight: 700; color: var(--text-dark); margin-right: 10px; display: inline-block;">${t.colorLabel}</span>
          <div style="display: inline-flex; gap: 10px; align-items: center; vertical-align: middle;">
            <span class="color-dot active" style="background: #4f46e5;" onclick="setColor('indigo')" id="dot-indigo"></span>
            <span class="color-dot" style="background: #10b981;" onclick="setColor('emerald')" id="dot-emerald"></span>
            <span class="color-dot" style="background: #dc2626;" onclick="setColor('crimson')" id="dot-crimson"></span>
            <span class="color-dot" style="background: #475569;" onclick="setColor('slate')" id="dot-slate"></span>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn-apply-now" onclick="loadSampleData()" style="padding: 8px 16px; font-size: 0.85rem; background: var(--bg-subtle); color: var(--primary); border: 1px solid var(--primary);">${t.loadSampleBtn}</button>
          <button class="btn-sidebar-apply" onclick="window.print()" style="padding: 8px 20px; font-size: 0.85rem; margin-top: 0; min-width: auto; height: auto;">${t.printBtn}</button>
        </div>
      </div>

      <div class="resume-builder-layout">
        
        <!-- Left: Form inputs -->
        <div class="builder-inputs glass-card no-print" style="padding: 30px; border-radius: var(--radius-lg); height: fit-content;">
          <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--text-dark); margin-bottom: 8px;">${t.title}</h1>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px;">${t.subtitle}</p>

          <!-- Stepper Steps -->
          <div class="stepper-steps">
            <button class="step-tab active" id="tab-step-0" onclick="switchStep(0)">${t.personalTab}</button>
            <button class="step-tab" id="tab-step-1" onclick="switchStep(1)">${t.expTab}</button>
            <button class="step-tab" id="tab-step-2" onclick="switchStep(2)">${t.eduTab}</button>
            <button class="step-tab" id="tab-step-3" onclick="switchStep(3)">${t.skillsTab}</button>
          </div>

          <form id="resume-form" oninput="updateLivePreview()" onsubmit="event.preventDefault();">
            
            <!-- Step 0: Personal Info -->
            <div class="form-step-content active" id="step-0">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="font-weight:700; font-size:0.85rem; display:block; margin-bottom:6px;">${t.fullName}</label>
                  <input type="text" id="in-name" value="أحمد الخطيب" class="form-input">
                </div>
                <div>
                  <label style="font-weight:700; font-size:0.85rem; display:block; margin-bottom:6px;">${t.jobTitle}</label>
                  <input type="text" id="in-title" value="مهندس برمجيات أول" class="form-input">
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="font-weight:700; font-size:0.85rem; display:block; margin-bottom:6px;">${t.email}</label>
                  <input type="email" id="in-email" value="ahmed.alkhatib@example.com" class="form-input">
                </div>
                <div>
                  <label style="font-weight:700; font-size:0.85rem; display:block; margin-bottom:6px;">${t.phone}</label>
                  <input type="text" id="in-phone" value="+90 555 123 45 67" class="form-input">
                </div>
              </div>
              <div style="margin-bottom: 16px;">
                <label style="font-weight:700; font-size:0.85rem; display:block; margin-bottom:6px;">${t.summary}</label>
                <textarea id="in-summary" rows="4" class="form-input">مهندس برمجيات ذو خبرة تمتد لأكثر من 5 سنوات في تطوير تطبيقات الويب الآمنة والموزعة. شغوف بتحسين الأداء وبناء هياكل الحوسبة الطرفية السحابية النظيفة.</textarea>
              </div>
            </div>

            <!-- Step 1: Experience -->
            <div class="form-step-content" id="step-1">
              <div id="exp-fields-group">
                <div class="dynamic-group-box">
                  <button type="button" class="btn-delete-item" onclick="this.parentElement.remove(); updateLivePreview();"><i class="fa-regular fa-trash-can"></i></button>
                  <input type="text" class="in-exp-comp form-input" placeholder="${t.company}" value="مختبرات إسطنبول التقنية" style="margin-bottom: 8px;">
                  <input type="text" class="in-exp-role form-input" placeholder="${t.role}" value="مطور برمجيات رئيسي" style="margin-bottom: 8px;">
                  <input type="text" class="in-exp-dates form-input" placeholder="${t.dates}" value="٢٠٢٤ - الحالي" style="margin-bottom: 8px;">
                  <textarea class="in-exp-desc form-input" placeholder="${t.desc}" rows="3">قيادة تطوير وتكامل بوابات الدفع الإلكترونية ثنائية اللغة باستخدام لغة TypeScript وتقنيات Cloudflare Workers.</textarea>
                </div>
              </div>
              <button type="button" onclick="addExpField()" class="btn-apply-now" style="font-size:0.85rem; margin-bottom: 10px;">${t.addBtn}</button>
            </div>

            <!-- Step 2: Education -->
            <div class="form-step-content" id="step-2">
              <div id="edu-fields-group">
                <div class="dynamic-group-box">
                  <button type="button" class="btn-delete-item" onclick="this.parentElement.remove(); updateLivePreview();"><i class="fa-regular fa-trash-can"></i></button>
                  <input type="text" class="in-edu-school form-input" placeholder="${t.school}" value="جامعة إسطنبول التقنية" style="margin-bottom: 8px;">
                  <input type="text" class="in-edu-degree form-input" placeholder="${t.degree}" value="بكالوريوس هندسة الحاسوب" style="margin-bottom: 8px;">
                  <input type="text" class="in-edu-dates form-input" placeholder="${t.dates}" value="٢٠١٨ - ٢٠٢٢" style="margin-bottom: 8px;">
                </div>
              </div>
              <button type="button" onclick="addEduField()" class="btn-apply-now" style="font-size:0.85rem; margin-bottom: 10px;">${t.addBtn}</button>
            </div>

            <!-- Step 3: Skills & Languages -->
            <div class="form-step-content" id="step-3">
              <div style="margin-bottom: 16px;">
                <label style="font-weight:700; font-size:0.85rem; display:block; margin-bottom:6px;">${t.skills}</label>
                <input type="text" id="in-skills" value="TypeScript, JavaScript, Node.js, Cloudflare, Docker, SQL" class="form-input">
              </div>
              <div style="margin-bottom: 16px;">
                <label style="font-weight:700; font-size:0.85rem; display:block; margin-bottom:6px;">${t.languages}</label>
                <input type="text" id="in-langs" value="العربية (اللغة الأم)، الإنجليزية (ممتاز)، التركية (متوسط)" class="form-input">
              </div>
            </div>

            <!-- Stepper Navigation Actions -->
            <div class="step-actions" style="margin-top: 24px; padding-top: 20px; border-top: 1.5px solid var(--border); display: flex; justify-content: space-between;">
              <button type="button" id="btn-prev-step" onclick="prevStep()" class="btn-apply-now" style="background: var(--bg-subtle); color: var(--text-body); border: 1px solid var(--border); display: none;">${t.stepPrev}</button>
              <button type="button" id="btn-next-step" onclick="nextStep()" class="btn-sidebar-apply" style="margin-top: 0; min-width: auto; height: auto; padding: 10px 24px;">${t.stepNext}</button>
            </div>

          </form>
        </div>

        <!-- Right: Paper A4 Live Preview -->
        <div class="builder-preview">
          <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin-bottom: 16px; text-align: center;" class="preview-header-label no-print">${t.previewTitle}</h2>
          
          <div id="paper-cv" class="paper-cv-page tpl-minimal theme-indigo">
            <div class="cv-layout-wrap">
              
              <!-- Sidebar segment -->
              <div class="cv-sidebar-part">
                <div class="cv-header-sidebar">
                  <h1 class="target-cv-name" style="margin-bottom:4px; font-weight:900;"></h1>
                  <h2 class="target-cv-title" style="font-weight:700; font-size:1.05rem;"></h2>
                  <div class="cv-contact">
                    <span class="target-cv-email"></span>
                    <span class="target-cv-phone"></span>
                  </div>
                </div>

                <div class="cv-sidebar-skills">
                  <h3 class="cv-sec-title">${locale === 'ar' ? 'المهارات' : 'Skills'}</h3>
                  <div id="cv-skills-sidebar-list" style="line-height:1.6; font-size:0.85rem; font-weight:600;"></div>

                  <h3 class="cv-sec-title">${locale === 'ar' ? 'اللغات' : 'Languages'}</h3>
                  <div id="cv-langs-sidebar-list" style="line-height:1.6; font-size:0.85rem; font-weight:600;"></div>
                </div>
              </div>

              <!-- Main segment -->
              <div class="cv-main-part">
                
                <!-- Minimalist/Classic Header -->
                <div class="cv-header-minimal-classic">
                  <h1 class="target-cv-name" style="margin-bottom:4px;"></h1>
                  <h2 class="target-cv-title"></h2>
                  <div class="cv-contact">
                    <span class="target-cv-email"></span>
                    <span class="target-cv-phone"></span>
                  </div>
                </div>

                <!-- Professional Summary -->
                <div class="cv-section" style="margin-bottom: 20px;">
                  <h3 class="cv-sec-title">${locale === 'ar' ? 'الملخص المهني' : 'Professional Summary'}</h3>
                  <p id="cv-summary" style="font-size:0.88rem; line-height:1.6;"></p>
                </div>

                <!-- Work Experience -->
                <div class="cv-section" style="margin-bottom: 20px;">
                  <h3 class="cv-sec-title">${locale === 'ar' ? 'الخبرة المهنية' : 'Work Experience'}</h3>
                  <div id="cv-experience"></div>
                </div>

                <!-- Education -->
                <div class="cv-section" style="margin-bottom: 20px;">
                  <h3 class="cv-sec-title">${locale === 'ar' ? 'التعليم والشهادات' : 'Education & Qualifications'}</h3>
                  <div id="cv-education"></div>
                </div>

                <!-- Minimalist/Classic Skills & Languages footer -->
                <div class="cv-main-skills cv-section">
                  <h3 class="cv-sec-title">${locale === 'ar' ? 'المهارات واللغات' : 'Skills & Languages'}</h3>
                  <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px;">
                    <div>
                      <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-dark); margin-bottom: 4px;">${locale === 'ar' ? 'المهارات الأساسية' : 'Key Skills'}</h4>
                      <div id="cv-skills-main-list" style="line-height:1.6; font-size:0.85rem;"></div>
                    </div>
                    <div>
                      <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-dark); margin-bottom: 4px;">${locale === 'ar' ? 'اللغات' : 'Languages'}</h4>
                      <div id="cv-langs-main-list" style="line-height:1.6; font-size:0.85rem;"></div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

    <script>
      let currentStep = 0;
      const totalSteps = 4;
      let activeTemplate = 'minimal';
      let activeColor = 'indigo';

      function switchStep(stepIdx) {
        currentStep = stepIdx;
        
        for (let i = 0; i < totalSteps; i++) {
          const tab = document.getElementById('tab-step-' + i);
          const stepDiv = document.getElementById('step-' + i);
          
          if (i === stepIdx) {
            tab.classList.add('active');
            stepDiv.classList.add('active');
          } else {
            tab.classList.remove('active');
            stepDiv.classList.remove('active');
          }
        }

        const btnPrev = document.getElementById('btn-prev-step');
        const btnNext = document.getElementById('btn-next-step');
        
        btnPrev.style.display = stepIdx === 0 ? 'none' : 'block';
        btnNext.textContent = stepIdx === totalSteps - 1 ? (window.location.pathname.startsWith('/ar') ? '🖨️ طباعة' : '🖨️ Print') : '${t.stepNext}';
      }

      function nextStep() {
        if (currentStep < totalSteps - 1) {
          switchStep(currentStep + 1);
        } else {
          window.print();
        }
      }

      function prevStep() {
        if (currentStep > 0) {
          switchStep(currentStep - 1);
        }
      }

      function setTemplate(tplName) {
        activeTemplate = tplName;
        const cv = document.getElementById('paper-cv');
        
        cv.classList.remove('tpl-minimal', 'tpl-sidebar', 'tpl-classic');
        cv.classList.add('tpl-' + tplName);

        document.getElementById('btn-tpl-minimal').classList.toggle('active', tplName === 'minimal');
        document.getElementById('btn-tpl-sidebar').classList.toggle('active', tplName === 'sidebar');
        document.getElementById('btn-tpl-classic').classList.toggle('active', tplName === 'classic');

        document.getElementById('btn-tpl-minimal').style.background = tplName === 'minimal' ? 'var(--primary)' : 'var(--bg-subtle)';
        document.getElementById('btn-tpl-minimal').style.color = tplName === 'minimal' ? '#fff' : 'var(--text-body)';

        document.getElementById('btn-tpl-sidebar').style.background = tplName === 'sidebar' ? 'var(--primary)' : 'var(--bg-subtle)';
        document.getElementById('btn-tpl-sidebar').style.color = tplName === 'sidebar' ? '#fff' : 'var(--text-body)';

        document.getElementById('btn-tpl-classic').style.background = tplName === 'classic' ? 'var(--primary)' : 'var(--bg-subtle)';
        document.getElementById('btn-tpl-classic').style.color = tplName === 'classic' ? '#fff' : 'var(--text-body)';
      }

      function setColor(colorName) {
        activeColor = colorName;
        const cv = document.getElementById('paper-cv');
        
        cv.classList.remove('theme-indigo', 'theme-emerald', 'theme-crimson', 'theme-slate');
        cv.classList.add('theme-' + colorName);

        ['indigo', 'emerald', 'crimson', 'slate'].forEach(c => {
          document.getElementById('dot-' + c).classList.toggle('active', c === colorName);
        });
      }

      function addExpField(comp = '', role = '', dates = '', desc = '') {
        const group = document.getElementById('exp-fields-group');
        const box = document.createElement('div');
        box.className = 'dynamic-group-box';
        box.innerHTML = \`
          <button type="button" class="btn-delete-item" onclick="this.parentElement.remove(); updateLivePreview();"><i class="fa-regular fa-trash-can"></i></button>
          <input type="text" class="in-exp-comp form-input" placeholder="\${window.location.pathname.startsWith('/ar') ? 'الشركة / جهة العمل' : 'Company'}" value="\${comp}" style="margin-bottom: 8px;">
          <input type="text" class="in-exp-role form-input" placeholder="\${window.location.pathname.startsWith('/ar') ? 'المسمى الوظيفي' : 'Job Role'}" value="\${role}" style="margin-bottom: 8px;">
          <input type="text" class="in-exp-dates form-input" placeholder="\${window.location.pathname.startsWith('/ar') ? 'الفترة' : 'Dates'}" value="\${dates}" style="margin-bottom: 8px;">
          <textarea class="in-exp-desc form-input" placeholder="\${window.location.pathname.startsWith('/ar') ? 'الوصف والإنجازات' : 'Description'}" rows="3">\${desc}</textarea>
        \`;
        group.appendChild(box);
        updateLivePreview();
      }

      function addEduField(school = '', degree = '', dates = '') {
        const group = document.getElementById('edu-fields-group');
        const box = document.createElement('div');
        box.className = 'dynamic-group-box';
        box.innerHTML = \`
          <button type="button" class="btn-delete-item" onclick="this.parentElement.remove(); updateLivePreview();"><i class="fa-regular fa-trash-can"></i></button>
          <input type="text" class="in-edu-school form-input" placeholder="\${window.location.pathname.startsWith('/ar') ? 'الجامعة / المدرسة' : 'University'}" value="\${school}" style="margin-bottom: 8px;">
          <input type="text" class="in-edu-degree form-input" placeholder="\${window.location.pathname.startsWith('/ar') ? 'الدرجة والتخصص' : 'Degree & Field'}" value="\${degree}" style="margin-bottom: 8px;">
          <input type="text" class="in-edu-dates form-input" placeholder="\${window.location.pathname.startsWith('/ar') ? 'الفترة' : 'Dates'}" value="\${dates}" style="margin-bottom: 8px;">
        \`;
        group.appendChild(box);
        updateLivePreview();
      }

      function loadSampleData() {
        const isAr = window.location.pathname.startsWith('/ar');
        
        if (isAr) {
          document.getElementById('in-name').value = 'عمر بن عبد العزيز';
          document.getElementById('in-title').value = 'مدير مشاريع تقنية أول';
          document.getElementById('in-email').value = 'omar.project@example.com';
          document.getElementById('in-phone').value = '+90 532 987 65 43';
          document.getElementById('in-summary').value = 'مدير مشاريع معتمد (PMP) وخبير برمجيات ذو مسيرة مميزة تمتد لـ 8 سنوات في الإشراف على مشاريع التحول الرقمي وتطوير الأنظمة البنكية في أسواق الشرق الأوسط وتركيا.';
          
          document.getElementById('exp-fields-group').innerHTML = '';
          addExpField('شركة التقنية العالمية (إسطنبول)', 'مدير مشاريع تقنية', '٢٠٢٢ - الحالي', 'إدارة فريق من ١٢ مهندساً لتطوير منصة تداول وتدشين البنية الأساسية بنجاح بنسبة رضا عملاء تجاوزت ٩٥٪.');
          addExpField('بوابة الرياض للحلول الرقمية', 'مطور برمجيات أول', '٢٠١٩ - ٢٠٢٢', 'الإشراف على هندسة النظام الأساسي للموقع وتطوير خدمات الدفع وتقليص زمن استجابة الطلبات بنسبة ٣٠٪.');

          document.getElementById('edu-fields-group').innerHTML = '';
          addEduField('جامعة الشرق الأوسط التقنية (أنقرة)', 'ماجستير في إدارة الأعمال التقنية', '٢٠٢٠ - ٢٠٢٢');
          addEduField('جامعة الملك سعود', 'بكالوريوس علوم الحاسب والمعلومات', '٢٠١٤ - ٢٠١٨');

          document.getElementById('in-skills').value = 'إدارة المشاريع (PMP), Agile/Scrum, Python, Node.js, AWS, Kubernetes, حل المشكلات';
          document.getElementById('in-langs').value = 'العربية (الأم)، الإنجليزية (ممتاز)، التركية (مستوي عملي)';
        } else {
          document.getElementById('in-name').value = 'Jonathan Miller';
          document.getElementById('in-title').value = 'Senior Product Manager';
          document.getElementById('in-email').value = 'jonathan.miller@example.com';
          document.getElementById('in-phone').value = '+90 533 111 22 33';
          document.getElementById('in-summary').value = 'Analytical and results-driven Product Manager with 6+ years of experience delivering SaaS solutions, scaling digital marketplaces, and driving agile software teams.';
          
          document.getElementById('exp-fields-group').innerHTML = '';
          addExpField('Istanbul Tech Hub', 'Senior PM', '2023 - Present', 'Launched and scaled the core recruitment matching product, improving match conversion rate by 22% and driving over $1M ARR.');
          addExpField('Synergy Labs', 'Product Owner', '2020 - 2023', 'Defined and executed the product roadmap for a multi-tenant logistics portal, managing stakeholders across 4 countries.');

          document.getElementById('edu-fields-group').innerHTML = '';
          addEduField('Boğaziçi University', 'M.Sc. in Management Information Systems', '2021 - 2023');
          addEduField('University of Manchester', 'B.Sc. in Computer Science', '2016 - 2020');

          document.getElementById('in-skills').value = 'Product Roadmap, User Research, SQL, Jira, Mixpanel, A/B Testing, Stakeholder Management';
          document.getElementById('in-langs').value = 'English (Native), Spanish (Fluent), Turkish (Intermediate)';
        }
        
        updateLivePreview();
      }

      function updateLivePreview() {
        const nameVal = document.getElementById('in-name').value || '';
        const titleVal = document.getElementById('in-title').value || '';
        const emailVal = document.getElementById('in-email').value || '';
        const phoneVal = document.getElementById('in-phone').value || '';
        const summaryVal = document.getElementById('in-summary').value || '';

        document.querySelectorAll('.target-cv-name').forEach(el => el.textContent = nameVal);
        document.querySelectorAll('.target-cv-title').forEach(el => el.textContent = titleVal);
        
        document.querySelectorAll('.target-cv-email').forEach(el => {
          el.innerHTML = emailVal ? '<i class="fa-regular fa-envelope"></i> ' + emailVal : '';
        });
        document.querySelectorAll('.target-cv-phone').forEach(el => {
          el.innerHTML = phoneVal ? '<i class="fa-solid fa-phone"></i> ' + phoneVal : '';
        });

        document.getElementById('cv-summary').textContent = summaryVal;

        const expBoxes = document.querySelectorAll('#exp-fields-group .dynamic-group-box');
        let expHtml = '';
        expBoxes.forEach(box => {
          const comp = box.querySelector('.in-exp-comp').value;
          const role = box.querySelector('.in-exp-role').value;
          const dates = box.querySelector('.in-exp-dates').value;
          const desc = box.querySelector('.in-exp-desc').value;

          if (comp || role) {
            expHtml += \`
              <div class="cv-item" style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--text-dark); font-size: 0.92rem;">
                  <span>\${role} - \${comp}</span>
                  <span style="font-weight: 500; font-size: 0.85rem; color: var(--text-muted);">\${dates}</span>
                </div>
                <p style="margin-top: 4px; font-size: 0.86rem; color: #4b5563; line-height: 1.5; white-space: pre-line;">\${desc}</p>
              </div>
            \`;
          }
        });
        document.getElementById('cv-experience').innerHTML = expHtml;

        const eduBoxes = document.querySelectorAll('#edu-fields-group .dynamic-group-box');
        let eduHtml = '';
        eduBoxes.forEach(box => {
          const school = box.querySelector('.in-edu-school').value;
          const degree = box.querySelector('.in-edu-degree').value;
          const dates = box.querySelector('.in-edu-dates').value;

          if (school || degree) {
            eduHtml += \`
              <div class="cv-item" style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--text-dark); font-size: 0.92rem;">
                  <span>\${degree}</span>
                  <span style="font-weight: 500; font-size: 0.85rem; color: var(--text-muted);">\${dates}</span>
                </div>
                <div style="font-size: 0.86rem; color: #4b5563; margin-top: 2px;">\${school}</div>
              </div>
            \`;
          }
        });
        document.getElementById('cv-education').innerHTML = eduHtml;

        const skillsVal = document.getElementById('in-skills').value || '';
        const langsVal = document.getElementById('in-langs').value || '';

        const skillsHtml = skillsVal.split(',').map(s => s.trim()).filter(Boolean).map(s => 
          \`<span style="display: inline-block; background: #f3f4f6; color: #374151; padding: 3px 8px; border-radius: var(--radius-sm); font-size: 0.78rem; margin: 3px; font-weight: 500;">\${s}</span>\`
        ).join('');

        const langsHtml = langsVal.split(',').map(l => l.trim()).filter(Boolean).map(l => 
          \`<div style="font-size: 0.82rem; color: #4b5563; margin-bottom: 4px;"><i class="fa-solid fa-circle-chevron-left" style="color:var(--cv-primary); font-size:0.65rem; margin-left: 6px;"></i> \${l}</div>\`
        ).join('');

        document.getElementById('cv-skills-main-list').innerHTML = skillsHtml;
        document.getElementById('cv-skills-sidebar-list').innerHTML = skillsHtml;
        
        document.getElementById('cv-langs-main-list').innerHTML = langsHtml;
        document.getElementById('cv-langs-sidebar-list').innerHTML = langsHtml;
      }

      document.addEventListener('DOMContentLoaded', () => {
        updateLivePreview();
      });
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// AI Cover Letter Generator Page
aiFeaturesRouter.get('/:locale/cover-letter-generator', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/cover-letter-generator');

  const t = {
    ar: {
      title: 'مولد رسائل التغطية الذكي',
      subtitle: 'اصنع رسالة تغطية (Cover Letter) مخصصة وجذابة لأي وظيفة تريد التقديم عليها باستخدام الذكاء الاصطناعي.',
      lblJobTitle: 'المسمى الوظيفي المستهدف',
      lblCompany: 'اسم الشركة (اختياري)',
      lblTone: 'نبرة الخطاب',
      lblExperience: 'مهاراتك وخبراتك الأساسية',
      lblJobDesc: 'الوصف الوظيفي (اختياري)',
      plhJobTitle: 'مثال: مهندس برمجيات، محاسب مالي...',
      plhCompany: 'مثال: شركة الأغبر للشحن...',
      plhExperience: 'اكتب مهاراتك أو الصق أجزاء من سيرتك الذاتية هنا...',
      plhJobDesc: 'الصق متطلبات الوظيفة المستهدفة هنا لزيادة دقة الرسالة...',
      btnGenerate: 'توليد رسالة التغطية الاحترافية ✨',
      loading: 'جاري كتابة الرسالة بالذكاء الاصطناعي... ✍️',
      resultTitle: 'رسالة التغطية الجاهزة للنسخ',
      toneProf: 'مهني ورسمي',
      toneConf: 'واثق وحماسي',
      toneFriendly: 'ودي وشخصي',
      toneTech: 'تقني ومفصل',
      copy: 'نسخ الرسالة',
      copied: 'تم النسخ!'
    },
    en: {
      title: 'AI Cover Letter Generator',
      subtitle: 'Draft a highly customized, compelling cover letter for any job application using edge Workers AI.',
      lblJobTitle: 'Target Job Title',
      lblCompany: 'Company Name (Optional)',
      lblTone: 'Tone of Voice',
      lblExperience: 'Your Key Experience & Skills',
      lblJobDesc: 'Job Description (Optional)',
      plhJobTitle: 'e.g. Frontend Developer, Accountant...',
      plhCompany: 'e.g. Acme Corp...',
      plhExperience: 'Paste your resume bullet points or enter your skills here...',
      plhJobDesc: 'Paste the job requirements to tailor the cover letter...',
      btnGenerate: 'Draft Cover Letter ✨',
      loading: 'Drafting Cover Letter... ✍️',
      resultTitle: 'Your Generated Cover Letter',
      toneProf: 'Professional & Formal',
      toneConf: 'Confident & Passionate',
      toneFriendly: 'Friendly & Personal',
      toneTech: 'Technical & Detailed',
      copy: 'Copy to Clipboard',
      copied: 'Copied!'
    },
    tr: {
      title: 'Yapay Zeka Ön Yazı Hazırlayıcı',
      subtitle: 'Workers AI kullanarak herhangi bir iş başvurusu için son derece özelleştirilmiş, ikna edici bir ön yazı taslağı hazırlayın.',
      lblJobTitle: 'Hedef İş Unvanı',
      lblCompany: 'Şirket Adı (İsteğe Bağlı)',
      lblTone: 'Yazı Tonu',
      lblExperience: 'Temel Deneyimleriniz ve Becerileriniz',
      lblJobDesc: 'İş Tanımı (İsteğe Bağlı)',
      plhJobTitle: 'Örn: Ön Yüz Geliştirici, Muhasebeci...',
      plhCompany: 'Örn: Acme A.Ş...',
      plhExperience: 'Özgeçmiş maddelerinizi yapıştırın veya mharatlarınızı buraya girin...',
      plhJobDesc: 'Ön yazıyı uyarlamak için iş gereksinimlerini yapıştırın...',
      btnGenerate: 'Ön Yazı Taslağı Oluştur ✨',
      loading: 'Ön Yazı Hazırlanıyor... ✍️',
      resultTitle: 'Oluşturulan Ön Yazınız',
      toneProf: 'Profesyonel ve Resmi',
      toneConf: 'Kendinden Emin ve Tutkulu',
      toneFriendly: 'Samimi ve Kişisel',
      toneTech: 'Teknik ve Detaylı',
      copy: 'Kopyala',
      copied: 'Kopyalandı!'
    },
    ru: {
      title: 'ИИ-Генератор сопроводительных писем',
      subtitle: 'Создайте сопроводительное письмо для любой вакансии с помощью ИИ за секунды.',
      lblJobTitle: 'Целевая должность',
      lblCompany: 'Название компании (необязательно)',
      lblTone: 'Тон письма',
      lblExperience: 'Ваши ключевые навыки и опыт',
      lblJobDesc: 'Описание вакансии (необязательно)',
      plhJobTitle: 'Напр: Frontend-разработчик, Бухгалтер...',
      plhCompany: 'Напр: Acme Corp...',
      plhExperience: 'Вставьте пункты вашего резюме или навыки сюда...',
      plhJobDesc: 'Вставьте описание вакансии для адаптации письма под требования...',
      btnGenerate: 'Создать сопроводительное письмо ✨',
      loading: 'Письмо генерируется... ✍️',
      resultTitle: 'Созданное сопроводительное письмо',
      toneProf: 'Профессиональный и официальный',
      toneConf: 'Уверенный и страстный',
      toneFriendly: 'Дружелюбный и личный',
      toneTech: 'Технический и детальный',
      copy: 'Копировать',
      copied: 'Скопировано!'
    },
    fa: {
      title: 'نگارش انگیزه‌نامه با هوش مصنوعی',
      subtitle: 'با استفاده از هوش مصنوعی، انگیزه‌نامه‌های استخدامی متقاعدکننده و حرفه‌ای متناسب با شغل هدف خود ایجاد کنید.',
      lblJobTitle: 'عنوان شغلی مورد نظر',
      lblCompany: 'نام شرکت / سازمان',
      lblTone: 'لحن نگارش انگیزه‌نامه',
      lblExperience: 'خلاصه سوابق و مهارت‌های شما',
      lblJobDesc: 'نیازمندی‌ها یا شرح وظایف شغل هدف',
      plhJobTitle: 'مثال: کارشناس ارشد دیجیتال مارکتینگ',
      plhCompany: 'مثال: Trendyol Group',
      plhExperience: 'خلاصه کوتاهی از سوابق تحصیلی، کاری و توانمندی‌های برجسته خود را بنویسید...',
      plhJobDesc: 'متن شرح وظایف آگهی استخدامی را اینجا بچسبانید تا هوش مصنوعی بر اساس آن بنویسد...',
      btnGenerate: 'تولید و نگارش انگیزه‌نامه ✨',
      loading: 'در حال نگارش انگیزه‌نامه توسط هوش مصنوعی... ⏳',
      resultTitle: 'انگیزه‌نامه تولید شده توسط هوش مصنوعی',
      toneProf: 'رسمی و اداری (Professional)',
      toneConf: 'پرانرژی و بااعتماد به نفس',
      toneFriendly: 'صمیمی و شخصی',
      toneTech: 'فنی و با جزئیات کامل',
      copy: 'کپی در حافظه',
      copied: 'کپی شد!'
    },
    ur: {
      title: 'اے آئی کور لیٹر جنریٹر (انگیزه نامه)',
      subtitle: 'مصنوعی ذہانت کی مدد سے اپنی پسندیدہ نوکری اور اپنی صلاحیتوں کے مطابق بہترین کور لیٹر تیار کریں۔',
      lblJobTitle: 'مطلوبہ نوکری کا عنوان',
      lblCompany: 'کمپنی کا نام',
      lblTone: 'تحریر کا انداز (لہجہ)',
      lblExperience: 'آپ کے تجربے اور مہارتوں کا خلاصہ',
      lblJobDesc: 'نوکری کے اشتہار کی تفصیلات',
      plhJobTitle: 'مثال: سینئر ڈیجیٹل مارکیٹنگ مینیجر',
      plhCompany: 'مثال: Trendyol Group',
      plhExperience: 'اپنی تعلیم، تجربہ اور اہم مہارتوں کے بارے میں ایک مختصر پیراگراف لکھیں...',
      plhJobDesc: 'ملازمت کے اشتہار میں دی گئی تفصیلات یا شرائط کو یہاں پیسٹ کریں...',
      btnGenerate: 'کور لیٹر تیار کریں ✨',
      loading: 'اے آئی کور لیٹر لکھ رہا ہے... ⏳',
      resultTitle: 'تیار کردہ کور لیٹر',
      toneProf: 'رسمی اور کاروباری (Professional)',
      toneConf: 'پُر اعتماد اور پرجوش',
      toneFriendly: 'دوستانہ اور ذاتی',
      toneTech: 'تکنیکی اور تفصیلی',
      copy: 'کاپی کریں',
      copied: 'کاپی ہو گیا!'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 900px; padding: 60px 20px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem; max-width: 700px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>

      <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg); margin-bottom: 40px;">
        <form id="cl-generator-form">
          <input type="hidden" name="locale" value="${locale}">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblJobTitle}</label>
              <input type="text" name="jobTitle" required placeholder="${t.plhJobTitle}" class="form-input">
            </div>
            <div>
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblCompany}</label>
              <input type="text" name="company" placeholder="${t.plhCompany}" class="form-input">
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblTone}</label>
            <select name="tone" class="form-input" style="background: var(--bg-site);">
              <option value="professional">${t.toneProf}</option>
              <option value="confident">${t.toneConf}</option>
              <option value="friendly">${t.toneFriendly}</option>
              <option value="technical">${t.toneTech}</option>
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblExperience}</label>
            <textarea name="experience" required placeholder="${t.plhExperience}" rows="5" class="form-input" style="resize: vertical;"></textarea>
          </div>

          <div style="margin-bottom: 30px;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblJobDesc}</label>
            <textarea name="jobDesc" placeholder="${t.plhJobDesc}" rows="4" class="form-input" style="resize: vertical;"></textarea>
          </div>

          <button type="submit" id="clSubmitBtn" class="btn-sidebar-apply" style="border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            ${t.btnGenerate}
          </button>
        </form>
      </div>

      <!-- Results Container -->
      <div id="cl-results" class="glass-card" style="display: none; padding: 30px; border-radius: var(--radius-lg); animation: fadeIn 0.4s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--border); padding-bottom: 12px;">
          <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-dark); margin: 0;">${t.resultTitle}</h2>
          <button onclick="copyCLContent()" class="btn-apply-now" style="font-size: 0.85rem; padding: 6px 16px;"><i class="fa-regular fa-copy"></i> <span id="clCopyText">${t.copy}</span></button>
        </div>
        <div id="clResultText" style="white-space: pre-wrap; background: var(--bg-site); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border); color: var(--text-dark); line-height: 1.8; font-size: 1rem;"></div>
      </div>
    </div>

    <script>
      document.getElementById('cl-generator-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('clSubmitBtn');
        const resultsDiv = document.getElementById('cl-results');
        const resultBox = document.getElementById('clResultText');
        
        btn.innerText = "${t.loading}";
        btn.disabled = true;
        resultsDiv.style.display = 'none';

        try {
          const res = await fetch('/api/cover-letter-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobTitle: form.jobTitle.value,
              company: form.company.value,
              tone: form.tone.value,
              experience: form.experience.value,
              jobDesc: form.jobDesc.value,
              locale: "${locale}"
            })
          });

          const data = await res.json();
          if (res.ok) {
            resultBox.textContent = data.coverLetter;
            resultsDiv.style.display = 'block';
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
          } else {
            alert(data.error || 'Failed to generate Cover Letter');
          }
        } catch(err) {
          alert('Network error occurred.');
        } finally {
          btn.innerText = "${t.btnGenerate}";
          btn.disabled = false;
        }
      });

      function copyCLContent() {
        const text = document.getElementById('clResultText').textContent;
        navigator.clipboard.writeText(text);
        const copyBtnText = document.getElementById('clCopyText');
        copyBtnText.innerText = "${t.copied}";
        setTimeout(() => { copyBtnText.innerText = "${t.copy}"; }, 2000);
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// API endpoint for Cover Letter generation
aiFeaturesRouter.post('/api/cover-letter-generate', rateLimiter(3, 10), async (c) => {
  const env: any = c.env;
  if (!env.AI) return c.json({ error: 'AI binding missing' }, 500);

  const { jobTitle, company, tone, experience, jobDesc, locale } = await c.req.json();
  if (!jobTitle || !experience) return c.json({ error: 'Missing parameters' }, 400);

  const toneInstruction = {
    professional: 'professional, formal, polite and corporate',
    confident: 'highly confident, energetic, bold and passionate',
    friendly: 'warm, welcoming, conversational, and direct',
    technical: 'highly technical, detail-oriented, focusing heavily on tools, metrics and hard skills'
  }[tone as string] || 'professional';

  const systemPrompt = `
You are an expert HR copywriter and professional CV designer in Turkey.
Draft a highly tailored and optimized Cover Letter for a candidate applying for the position: "${jobTitle}" at "${company || 'the target company'}".
The cover letter should be written in ${locale === 'ar' ? 'Arabic' : (locale === 'tr' ? 'Turkish' : (locale === 'fa' ? 'Persian (Farsi)' : (locale === 'ur' ? 'Urdu' : 'English')))}.
The tone of voice must be ${toneInstruction}.
Do NOT output any markdown tags (like code blocks), conversational intros, or notes. Output ONLY the drafted cover letter text.
Use placeholders like [Name], [Phone] at the header/footer of the letter for the user to fill in.
`;

  const userPrompt = `
CANDIDATE EXPERIENCE:
${experience}

TARGET JOB DESCRIPTION / DETAILS:
${jobDesc || 'No details provided'}
`;

  try {
    const aiResponse: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500
    });

    let rawResponse = '';
    if (typeof aiResponse === 'string') {
      rawResponse = aiResponse;
    } else if (aiResponse && aiResponse.response) {
      rawResponse = aiResponse.response;
    } else if (aiResponse && aiResponse.result) {
      rawResponse = aiResponse.result;
    } else {
      rawResponse = JSON.stringify(aiResponse);
    }

    return c.json({ coverLetter: rawResponse.trim() });
  } catch(err: any) {
    return c.json({ error: 'AI drafting failed: ' + err.message }, 500);
  }
});

// Work Permit Eligibility Calculator Page
aiFeaturesRouter.get('/:locale/work-permit-calculator', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/work-permit-calculator');

  const t = {
    ar: {
      title: 'حاسبة الأهلية لإذن العمل التركي والجنسية',
      subtitle: 'احسب نسبة أهليتك للحصول على إذن العمل (Çalışma İzni) أو الجنسية التركية وفقاً لأحدث القوانين واللوائح للعام ٢٠٢٦.',
      step1: 'الإقامة والجنسية',
      step2: 'التعليم والخبرة',
      step3: 'الشركة والراتب',
      btnNext: 'التالي ➔',
      btnPrev: 'السابق ⬅',
      btnCalculate: 'حساب نسبة الأهلية 📊',
      lblResidency: 'الإقامة الحالية في تركيا',
      resTourist: 'إقامة سياحية (أكثر من ٦ أشهر)',
      resStudent: 'إقامة طالب',
      resWork: 'إذن عمل حالي (تجديد)',
      resNone: 'لا يوجد إقامة حالياً (خارج تركيا / فيزا سياحية قصيرة)',
      lblEdu: 'أعلى مؤهل دراسي',
      eduHighSchool: 'ثانوية عامة أو أقل',
      eduBachelor: 'بكالوريوس / إجازة جامعية',
      eduMaster: 'ماجستير',
      eduPhD: 'دكتوراه',
      lblEmployeeRatio: 'عدد الموظفين الأتراك في الشركة المستضيفة',
      ratioHint: 'ملاحظة: يشترط القانون التركي توظيف ٥ موظفين أتراك مقابل كل موظف أجنبي.',
      lblSalaryRatio: 'الراتب المعروض (الليرة التركية - TL)',
      lblCategory: 'المسمى الوظيفي المستهدف',
      catNormal: 'وظيفة مكتبية / مبيعات / عامة',
      catEngineer: 'مهندس / مبرمج / تقني',
      catManager: 'مدير فرع / رئيس قسم',
      catExecutive: 'مدير تنفيذي / وظيفة قيادية العليا',
      resultTitle: 'تقرير الأهلية والخطوات المقترحة 📋',
      eligibilityScore: 'نسبة أهليتك لتقديم الطلب:',
      lawNotice: 'تنبيه: هذه الحاسبة تقدم تقديراً تقريبياً استناداً إلى قانون العمل التركي رقم 6735 وتعديلاته لعام 2026. لا تعتبر مستنداً قانونياً رسمياً.',
      scoreHigh: 'أهلية مرتفعة جداً! شروطك تطابق القوانين التركية تماماً للتقديم.',
      scoreMid: 'أهلية متوسطة. يرجى التأكد من استكمال شروط الرواتب ونسب الموظفين الأتراك قبل التقديم.',
      scoreLow: 'أهلية منخفضة. شروطك الحالية لا تطابق المعايير الأساسية (مثلاً: نسبة الموظفين الأتراك أو الحد الأدنى للإقامة). نقترح مراجعة مستشار قانوني.'
    },
    en: {
      title: 'Turkish Work Permit & Citizenship Calculator',
      subtitle: 'Calculate your eligibility score for a Turkish Work Permit (Çalışma İzni) or citizenship based on the latest 2026 regulations.',
      step1: 'Visa & Residency',
      step2: 'Education & Field',
      step3: 'Company & Salary',
      btnNext: 'Next ➔',
      btnPrev: '⬅ Back',
      btnCalculate: 'Calculate Eligibility 📊',
      lblResidency: 'Current Residence Status in Turkey',
      resTourist: 'Tourist Residence Permit (Valid for 6+ months)',
      resStudent: 'Student Residence Permit',
      resWork: 'Current Work Permit (Renewal)',
      resNone: 'No active residence permit (Outside Turkey / Short-term Visa)',
      lblEdu: 'Highest Educational Level',
      eduHighSchool: 'High School or below',
      eduBachelor: 'Bachelor\'s Degree',
      eduMaster: 'Master\'s Degree',
      eduPhD: 'PhD / Doctorate',
      lblEmployeeRatio: 'Number of Turkish Employees in the Company',
      ratioHint: 'Note: Turkish law requires 5 Turkish citizens employed for every 1 foreigner.',
      lblSalaryRatio: 'Offered Salary (Gross/Net in TL)',
      lblCategory: 'Target Job Category',
      catNormal: 'General Office / Sales / Hospitality',
      catEngineer: 'Engineer / IT / Specialized Tech',
      catManager: 'Manager / Branch Head',
      catExecutive: 'Executive / General Manager / C-Level',
      resultTitle: 'Eligibility Report & Action Plan 📋',
      eligibilityScore: 'Your Application Eligibility Score:',
      lawNotice: 'Disclaimer: This estimator calculations are based on Turkish Labor Law No. 6735 and its 2026 updates. It does not constitute official legal advice.',
      scoreHigh: 'Excellent eligibility! Your credentials fully align with Turkish labor laws for submission.',
      scoreMid: 'Moderate eligibility. Double-check the offered salary ratio and Turkish employee counts before submitting.',
      scoreLow: 'Low eligibility. Your current profile does not meet the legal threshold. We recommend consulting a licensed Turkish legal advisor.'
    },
    tr: {
      title: 'Çalışma İzni ve Vatandaşlık Hesaplayıcı',
      subtitle: 'En son 2026 düzenlemelerine göre çalışma izni (Çalışma İzni) veya vatandaşlık için uygunluk puanınızı hesaplayın.',
      step1: 'Vize ve İkamet',
      step2: 'Eğitim ve Alan',
      step3: 'Şirket ve Maaş',
      btnNext: 'İleri ➔',
      btnPrev: '⬅ Geri',
      btnCalculate: 'Uygunluk Hesapla 📊',
      lblResidency: 'Türkiye\'deki Mevcut İkamet Durumu',
      resTourist: 'Turistik İkamet İzni (6+ ay geçerli)',
      resStudent: 'Öğrenci İkamet İzni',
      resWork: 'Mevcut Çalışma İzni (Yenileme)',
      resNone: 'Aktif ikamet izni yok (Türkiye Dışında / Kısa Süreli Vize)',
      lblEdu: 'En Yüksek Eğitim Seviyesi',
      eduHighSchool: 'Lise veya altı',
      eduBachelor: 'Lisans Derecesi',
      eduMaster: 'Yüksek Lisans Derecesi',
      eduPhD: 'Doktora',
      lblEmployeeRatio: 'Şirketteki Türk Çalışan Sayısı',
      ratioHint: 'Not: Türk kanunları, çalıştırılan her 1 yabancı için 5 Türk vatandaşının istihdam edilmesini şart koşar.',
      lblSalaryRatio: 'Teklif Edilen Maaş (TL cinsinden Brüt/Net)',
      lblCategory: 'Hedef İş Kategorisi',
      catNormal: 'Genel Ofis / Satış / Hizmet',
      catEngineer: 'Mühendis / IT / Özel Teknoloji',
      catManager: 'Müdür / Şube Müdürü',
      catExecutive: 'Yönetici / Genel Müdür / C-Level',
      resultTitle: 'Uygunluk Raporu ve Eylem Planı 📋',
      eligibilityScore: 'Başvuru Uygunluk Puanınız:',
      lawNotice: 'Yasal Uyarı: Bu hesaplayıcı sonuçları, 6735 sayılı Türk İş Kanunu ve 2026 güncellemelerine dayanmaktadır. Resmi yasal tavsiye niteliği taşımaz.',
      scoreHigh: 'Mükemmel uygunluk! Nitelikleriniz, başvuru için Türk iş kanunlarıyla tamamen uyumludur.',
      scoreMid: 'Orta seviye uygunluk. Başvurmadan önce teklif edilen maaş oranını ve Türk çalışan sayılarını kontrol edin.',
      scoreLow: 'Düşük uygunluk. Mevcut profiliniz yasal eşiği karşılamıyor. Ruhsatlı bir Türk hukuk danışmanına başvurmanızı öneririz.'
    },
    ru: {
      title: 'Калькулятор разрешения на работу в Турции',
      subtitle: 'Рассчитайте шансы на получение разрешения на работу (Çalışma İzni) или гражданства на основе правил 2026 года.',
      step1: 'Виза и проживание',
      step2: 'Образование и сфера',
      step3: 'Компания и зарплата',
      btnNext: 'Далее ➔',
      btnPrev: '⬅ Назад',
      btnCalculate: 'Рассчитать шансы 📊',
      lblResidency: 'Текущий статус проживания в Турции',
      resTourist: 'Туристический ВНЖ (действителен 6+ месяцев)',
      resStudent: 'Студенческий ВНЖ',
      resWork: 'Текущее разрешение на работу (продление)',
      resNone: 'Нет активного ВНЖ (За пределами Турции / Краткосрочная виза)',
      lblEdu: 'Наивысший уровень образования',
      eduHighSchool: 'Средняя школа или ниже',
      eduBachelor: 'Бакалавриат',
      eduMaster: 'Магистратура',
      eduPhD: 'Докторантура / PhD',
      lblEmployeeRatio: 'Количество турецких сотрудников в компании',
      ratioHint: 'Примечание: По закону на 1 иностранного сотрудника должно быть трудоустроено 5 граждан Турции.',
      lblSalaryRatio: 'Предлагаемая зарплата (брутто/нетто в лирах - TL)',
      lblCategory: 'Целевая категория работы',
      catNormal: 'Общий офис / Продажи / Гостеприимство',
      catEngineer: 'Инженер / IT / Специализированные технологии',
      catManager: 'Менеджер / Руководитель филиала',
      catExecutive: 'Директор / Генеральный директор / C-Level',
      resultTitle: 'Отчет об оценке шансов 📋',
      eligibilityScore: 'Ваш балл соответствия требованиям:',
      lawNotice: 'Отказ от ответственности: Расчеты основаны на Трудовом кодексе Турции № 6735 и обновлениях 2026 года. Не является официальной юридической консультацией.',
      scoreHigh: 'Отличное соответствие! Ваши данные полностью соответствуют турецкому законодательству для подачи заявки.',
      scoreMid: 'Среднее соответствие. Перед подачей перепроверьте размер предлагаемой зарплаты и количество турецких сотрудников.',
      scoreLow: 'Низкое соответствие. Ваш текущий профиль не соответствует установленным требованиям. Мы рекомендуем проконсультироваться с юристом.'
    },
    fa: {
      title: 'حاسبه‌گر امتیاز اجازه کار و شهروندی ترکیه',
      subtitle: 'امتیاز و واجد شرایط بودن خود را برای اخذ مجوز کار (Çalışma İzni) یا شهروندی ترکیه طبق آخرین قوانین ۲۰۲۶ محاسبه کنید.',
      step1: 'اقامت و ویزا',
      step2: 'تحصیلات و تخصص',
      step3: 'شرکت و حقوق پیشنهادی',
      btnNext: 'مرحله بعدی ➔',
      btnPrev: '⬅ مرحله قبلی',
      btnCalculate: 'محاسبه امتیاز و شرایط قانونی 📊',
      lblResidency: 'وضعیت اقامت فعلی شما در ترکیه',
      resTourist: 'اقامت توریستی (دارای اعتبار بیش از ۶ ماه)',
      resStudent: 'اقامت دانشجویی',
      resWork: 'اقامت کاری فعال (تمدید اجازه کار)',
      resNone: 'بدون اقامت فعال (درخواست از سفارت خارج از ترکیه)',
      lblEdu: 'آخرین مدرک تحصیلی شما',
      eduHighSchool: 'دیپلم یا پایین‌تر',
      eduBachelor: 'مدرک کارشناسی (لیسانس)',
      eduMaster: 'مدرک کارشناسی ارشد (فوق لیسانس)',
      eduPhD: 'مدرک دکترا (PhD)',
      lblEmployeeRatio: 'تعداد کارمندان ترک در شرکت هدف',
      ratioHint: 'نکته قانونی: قانون کار ترکیه استخدام ۵ کارمند ترک به ازای هر کارمند خارجی را الزامی می‌داند.',
      lblSalaryRatio: 'حقوق پیشنهادی ناخالص (لیره ترکیه - TL)',
      lblCategory: 'حوزه کاری شغل هدف',
      catNormal: 'امور دفتری / فروش / گردشگری و خدمات عمومی',
      catEngineer: 'مهندسی / برنامه نویس / متخصصین فنی IT',
      catManager: 'مدیر بخش / مدیر شعبه',
      catExecutive: 'مدیریت ارشد / C-Level / مدیر عامل',
      resultTitle: 'گزارش ارزیابی و نقشه راه اقدامات قانونی 📋',
      eligibilityScore: 'امتیاز نهایی شرایط شما:',
      lawNotice: 'سلب مسئولیت: این محاسبات بر اساس قانون استخدام ۶۷۳۵ ترکیه انجام شده و مشاوره حقوقی رسمی و دولتی محسوب نمی‌شود.',
      scoreHigh: 'شرایط شما عالی است! وضعیت رزومه، حقوق پیشنهادی و شرکت با تمام ضوابط اجازه کار ترکیه همخوانی دارد.',
      scoreMid: 'شرایط متوسط. شانس قبولی وجود دارد اما نسبت نیروهای ترک و حقوق پیشنهادی را مجدداً بسنجید.',
      scoreLow: 'شرایط ضعیف. معیارهای فعلی شما با حداقل الزامات وزارت کار ترکیه همخوانی ندارد. مشاوره با وکیل توصیه می‌شود.'
    },
    ur: {
      title: 'ترکی ورک پرمٹ اور شہریت اہلیت کیلکولیٹر',
      subtitle: 'سال ۲۰۲۶ کے تازہ ترین قوانین کے مطابق ورک پرمٹ (Çalışma İzni) یا ترک شہریت حاصل کرنے کا اہلیت اسکور جانیں۔',
      step1: 'ویزہ اور رہائش',
      step2: 'تعلیم اور شعبہ',
      step3: 'کمپنی اور تنخواہ',
      btnNext: 'اگلا مرحلہ ➔',
      btnPrev: '⬅ پچھلا مرحلہ',
      btnCalculate: 'اہلیت کا حساب لگائیں 📊',
      lblResidency: 'ترکی میں آپ کی موجودہ رہائشی حیثیت',
      resTourist: 'ٹورسٹ رہائشی اجازت نامہ (۶ ماہ سے زیادہ کی میعاد)',
      resStudent: 'اسٹوڈنٹ رہائشی اجازت نامہ',
      resWork: 'فعال ورک پرمٹ (تجدید کے لیے)',
      resNone: 'کوئی فعال اجازت نامہ نہیں (ترکی سے باہر سے درخواست)',
      lblEdu: 'آپ کی تعلیمی سطح',
      eduHighSchool: 'میٹرک/انٹرمیڈیٹ یا اس سے کم',
      eduBachelor: 'بیچلرز ڈگری (Graduation)',
      eduMaster: 'ماسٹرز ڈگری',
      eduPhD: 'پی ایچ ڈی / ڈاکٹر آف فلاسفی',
      lblEmployeeRatio: 'کمپنی میں ترک ملازمین کی تعداد',
      ratioHint: 'قانونی اصول: ترکی کا قانون ۱ غیر ملکی ملازم کے بدلے ۵ ترک شہریوں کو ملازمت دینے کا تقاضا کرتا ہے۔',
      lblSalaryRatio: 'پیشکش کردہ مجموعی تنخواہ (ترک لیرا - TL)',
      lblCategory: 'نوکری کی کیٹیگری',
      catNormal: 'عام دفتر / سیلز / سروسز اور ہاسپیٹلٹی',
      catEngineer: 'انجینئرنگ / آئی ٹی / تکنیکی ماہرین',
      catManager: 'برانچ مینیجر / سیکشن مینیجر',
      catExecutive: 'اعلیٰ انتظامیہ / سی ای او / جنرل مینیجر',
      resultTitle: 'اہلیت کی رپورٹ اور قانونی روڈ میپ 📋',
      eligibilityScore: 'آپ کی اہلیت کا اسکور:',
      lawNotice: 'دستبرداری: یہ حسابات ترکی کے قانون نمبر ۶۷۳۵ کے مطابق ہیں اور یہ سرکاری قانونی مشورہ تصور نہیں کیا جائے گا۔',
      scoreHigh: 'بہترین اہلیت! آپ کی اسامی، تنخواہ اور تعلیمی اسناد ترکی کے قوانین کے عین مطابق ہیں۔',
      scoreMid: 'درمیانی اہلیت۔ کامیابی کا امکان ہے لیکن تنخواہ یا ملازمین کے تناسب کو دوبارہ چیک کر لیں۔',
      scoreLow: 'کمزور اہلیت۔ آپ کا پروفائل ترکی کے قوانین کے کم از کم تقاضوں کو پورا نہیں کرتا۔ ماہر قانون سے مشورہ لیں۔'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 800px; padding: 60px 20px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem; max-width: 700px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>

      <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg); margin-bottom: 40px; position: relative;">
        
        <!-- Steps Progress Bar -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 1.5px solid var(--border); padding-bottom: 16px;">
          <div id="step-tab-1" style="font-weight: 700; color: var(--primary); font-size: 0.95rem;">1. ${t.step1}</div>
          <div id="step-tab-2" style="font-weight: 700; color: var(--text-muted); font-size: 0.95rem;">2. ${t.step2}</div>
          <div id="step-tab-3" style="font-weight: 700; color: var(--text-muted); font-size: 0.95rem;">3. ${t.step3}</div>
        </div>

        <form id="calculator-form" onsubmit="evaluateEligibility(event)">
          <!-- STEP 1 -->
          <div id="calc-step-1" class="calc-step">
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblResidency}</label>
              <select id="calc-residency" class="form-input" style="background: var(--bg-site);">
                <option value="tourist">${t.resTourist}</option>
                <option value="student">${t.resStudent}</option>
                <option value="work">${t.resWork}</option>
                <option value="none">${t.resNone}</option>
              </select>
            </div>
            <button type="button" onclick="nextStep(2)" class="btn-sidebar-apply" style="display: inline-block; width: auto; padding: 12px 30px; float: ${locale === 'ar' ? 'left' : 'right'};">${t.btnNext}</button>
            <div style="clear: both;"></div>
          </div>

          <!-- STEP 2 -->
          <div id="calc-step-2" class="calc-step" style="display: none;">
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblEdu}</label>
              <select id="calc-edu" class="form-input" style="background: var(--bg-site);">
                <option value="highschool">${t.eduHighSchool}</option>
                <option value="bachelor" selected>${t.eduBachelor}</option>
                <option value="master">${t.eduMaster}</option>
                <option value="phd">${t.eduPhD}</option>
              </select>
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 30px;">
              <button type="button" onclick="nextStep(1)" class="btn-apply-now" style="flex: 1; padding: 12px;">${t.btnPrev}</button>
              <button type="button" onclick="nextStep(3)" class="btn-sidebar-apply" style="flex: 2; border: none; padding: 12px;">${t.btnNext}</button>
            </div>
          </div>

          <!-- STEP 3 -->
          <div id="calc-step-3" class="calc-step" style="display: none;">
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblCategory}</label>
              <select id="calc-category" class="form-input" style="background: var(--bg-site);">
                <option value="normal">${t.catNormal}</option>
                <option value="engineer">${t.catEngineer}</option>
                <option value="manager">${t.catManager}</option>
                <option value="executive">${t.catExecutive}</option>
              </select>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblEmployeeRatio}</label>
              <input type="number" id="calc-employees" value="5" min="0" class="form-input" required>
              <span style="display: block; font-size: 0.8rem; color: var(--text-muted); margin-top: 6px;">${t.ratioHint}</span>
            </div>

            <div style="margin-bottom: 30px;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblSalaryRatio}</label>
              <input type="number" id="calc-salary" value="23000" min="0" class="form-input" required>
            </div>

            <div style="display: flex; gap: 12px;">
              <button type="button" onclick="nextStep(2)" class="btn-apply-now" style="flex: 1; padding: 12px;">${t.btnPrev}</button>
              <button type="submit" class="btn-sidebar-apply" style="flex: 2; border: none; padding: 12px;">${t.btnCalculate}</button>
            </div>
          </div>
        </form>
      </div>

      <!-- Results Container -->
      <div id="calc-results" class="glass-card" style="display: none; padding: 30px; border-radius: var(--radius-lg); animation: fadeIn 0.4s ease;">
        <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-dark); margin-bottom: 20px; border-bottom: 2px solid var(--border); padding-bottom: 12px;">${t.resultTitle}</h3>
        
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
          <div id="calc-result-dial" style="width: 100px; height: 100px; border-radius: 50%; border: 8px solid var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; color: var(--primary);">--</div>
          <div>
            <div style="font-weight: 700; color: var(--text-dark); font-size: 1.1rem; margin-bottom: 6px;">${t.eligibilityScore}</div>
            <p id="calc-result-summary" style="font-size: 0.95rem; margin: 0; font-weight: 600;"></p>
          </div>
        </div>

        <div id="calc-result-roadmap" style="background: var(--bg-site); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border); color: var(--text-dark); font-size: 0.95rem; line-height: 1.7; margin-bottom: 24px;">
        </div>

        <div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; border-top: 1px solid var(--border); padding-top: 16px;">
          ${t.lawNotice}
        </div>
      </div>
    </div>

    <script>
      function nextStep(step) {
        document.querySelectorAll('.calc-step').forEach(el => el.style.display = 'none');
        document.getElementById('calc-step-' + step).style.display = 'block';

        for (let i = 1; i <= 3; i++) {
          const tab = document.getElementById('step-tab-' + i);
          if (i === step) {
            tab.style.color = 'var(--primary)';
            tab.style.borderBottom = 'none';
          } else {
            tab.style.color = 'var(--text-muted)';
          }
        }
      }

      function evaluateEligibility(e) {
        e.preventDefault();
        
        const residency = document.getElementById('calc-residency').value;
        const edu = document.getElementById('calc-edu').value;
        const category = document.getElementById('calc-category').value;
        const employees = parseInt(document.getElementById('calc-employees').value, 10);
        const salary = parseInt(document.getElementById('calc-salary').value, 10);

        let score = 100;
        let reasons = [];

        if (residency === 'none') {
          score -= 30;
          reasons.push("${locale === 'ar' ? '⚠️ يجب تقديم المعاملة من السفارة التركية في بلدك لعدم وجود إقامة سياحية سارية في تركيا لأكثر من 6 أشهر.' : '⚠️ Application must be submitted via the Turkish Consulate in your home country because you do not have a tourist residency valid for 6+ months inside Turkey.'}");
        } else if (residency === 'student') {
          score -= 10;
          reasons.push("${locale === 'ar' ? '⚠️ إقامة الطالب تسمح بالعمل الجزئي فقط في بعض التخصصات وتتطلب موافقة خاصة.' : '⚠️ Student residency permit allows part-time work in restricted fields and requires special approval.'}");
        }

        if (employees < 5) {
          score -= 40;
          reasons.push("${locale === 'ar' ? '❌ تشترط وزارة العمل توظيف 5 موظفين أتراك مقابل كل موظف أجنبي، والشركة الحالية لا تستوفي الشروط.' : '❌ Ministry of Labor requires 5 Turkish employees for every 1 foreign worker. The target company does not meet this ratio.'}");
        }

        const minWage = 22000;
        let salaryRatioRequired = 1.0;
        if (category === 'engineer') salaryRatioRequired = 3.0;
        if (category === 'manager') salaryRatioRequired = 4.0;
        if (category === 'executive') salaryRatioRequired = 6.5;

        const targetSalary = minWage * salaryRatioRequired;
        if (salary < targetSalary) {
          score -= 25;
          const fmtTarget = new Intl.NumberFormat().format(targetSalary);
          reasons.push("${locale === 'ar' ? '❌ الراتب غير كافٍ. بموجب القانون التركي، المسمى الوظيفي المحدد يتطلب حداً أدنى للراتب قدره ' : '❌ Insufficient salary. Under Turkish law, this job title requires a minimum salary of '}" + fmtTarget + " TL.");
        }

        score = Math.max(10, score);
        
        const dial = document.getElementById('calc-result-dial');
        dial.textContent = score + '%';
        const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
        dial.style.borderColor = color;
        dial.style.color = color;

        const summary = document.getElementById('calc-result-summary');
        if (score >= 80) {
          summary.textContent = "${t.scoreHigh}";
          summary.style.color = '#10b981';
        } else if (score >= 50) {
          summary.textContent = "${t.scoreMid}";
          summary.style.color = '#f59e0b';
        } else {
          summary.textContent = "${t.scoreLow}";
          summary.style.color = '#ef4444';
        }

        let roadmapHtml = '<h4 style="margin-top:0; font-weight:800; border-bottom:1px solid var(--border); padding-bottom:8px;">' + 
          ( "${locale === 'ar' ? 'خارطة طريق تقديم المعاملة:' : 'Application Roadmap:'}" ) + '</h4><ul style="padding-right: 20px; padding-left: 20px; margin: 10px 0;">';
        
        if (reasons.length > 0) {
          reasons.forEach(r => {
            roadmapHtml += '<li style="margin-bottom:8px; color: var(--text-dark);">' + r + '</li>';
          });
        } else {
          roadmapHtml += '<li style="margin-bottom:8px; color:#10b981;">✓ ' + 
            ( "${locale === 'ar' ? 'جميع شروط المعاملة مستوفاة وجاهز للتقديم!' : 'All standard legal requirements are satisfied!'}" ) + '</li>';
        }

        roadmapHtml += '</ul><div style="margin-top:16px; font-weight:700;">' + 
          ( "${locale === 'ar' ? 'الوثائق المطلوبة منك:' : 'Documents required from you:'}" ) + '</div>' +
          '<ul style="margin:6px 0; padding-right:20px; padding-left:20px; font-size:0.88rem;">' +
          '<li>' + ( "${locale === 'ar' ? 'نسخة جواز السفر (مترجم ومصدق نوتير)' : 'Passport copy (translated & notarized)'}" ) + '</li>' +
          '<li>' + ( "${locale === 'ar' ? 'نسخة إقامة سياحية سارية المفعول (إذا كان التقديم داخلياً)' : 'Active Tourist residency card copy (if inside Turkey)'}" ) + '</li>' +
          '<li>' + ( "${locale === 'ar' ? 'الشهادة الدراسية (مترجمة ومصدقة)' : 'Educational diploma (translated & notarized)'}" ) + '</li>' +
          '<li>' + ( "${locale === 'ar' ? 'عقد العمل المبرم وموقع مع الشركة' : 'Signed Employment contract with the company'}" ) + '</li>' +
          '</ul>';

        document.getElementById('calc-result-roadmap').innerHTML = roadmapHtml;
        
        const results = document.getElementById('calc-results');
        results.style.display = 'block';
        results.scrollIntoView({ behavior: 'smooth' });
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// Business Turkish Level Test Page
aiFeaturesRouter.get('/:locale/turkish-test', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/turkish-test');

  const t = {
    ar: {
      title: 'اختبار اللغة التركية المهنية للعمل',
      subtitle: 'اختبر مهاراتك اللغوية وقدرتك على الفهم واستخدام المصطلحات المهنية في بيئة العمل التركية واحصل على شهادتك مجاناً.',
      btnStart: 'ابدأ الاختبار الآن ⚡',
      btnSubmit: 'عرض النتيجة والشهادة 📊',
      scoreText: 'درجتك النهائية في الاختبار:',
      certTitle: 'وثيقة كفاءة اللغة التركية المهنية',
      certAward: 'ممنوحة للباحث عن عمل كشهادة تفوق بمعدل كفاءة:',
      certSignature: 'لجنة الفحص والتقييم الإلكتروني',
      certSeal: 'ختم معتمد للموقع',
      lblQuestion: 'السؤال',
      q1: 'إذا قال لك زميلك في العمل "Kolay gelsin" فما هو الرد الأنسب والمألوف في بيئة العمل؟',
      q1_a: 'Teşekkür ederim, sana da (شكراً لك، ولك أيضاً)',
      q1_b: 'Rica ederim (على الرحب والسعة)',
      q1_c: 'Görüşürüz (أراك لاحقاً)',
      q2: 'ماذا تعني عبارة "Fatura kesmek" في المعاملات المالية والمحاسبية التركية؟',
      q2_a: 'إصدار/قطع فاتورة مالية للعميل',
      q2_b: 'إلغاء فاتورة قديمة',
      q2_c: 'خصم من الفاتورة',
      q3: 'إذا أردت تقديم طلب استقالة رسمية للشركة التي تعمل بها، ما المسمى الصحيح لهذه الرسالة بالتركية؟',
      q3_a: 'İstifa dilekçesi (رسالة استقالة)',
      q3_b: 'İzin formu (نموذج إجازة)',
      q3_c: 'İş sözleşmesi (عقد عمل)',
      q4: 'ما هو المعنى الصحيح لمصطلح "Mesafe" أو "Mesai saati" في ساعات العمل التركية؟',
      q4_a: 'ساعات العمل الرسمية أو العمل الإضافي (Fazla Mesai)',
      q4_b: 'المسافة الجغرافية بين مكان السكن والعمل',
      q4_c: 'أوقات الراحة والغداء خلال اليوم',
      q5: 'ماذا تقول باللغة التركية لزميل أو صاحب عمل توفي له أحد أقاربه؟',
      q5_a: 'Başınız sağ olsun (عظم الله أجركم)',
      q5_b: 'Kolay gelsin (كان الله في عونكم)',
      q5_c: 'Geçmiş olsun (حمد لله على السلامة)'
    },
    en: {
      title: 'Business Turkish Competency Test',
      subtitle: 'Test your understanding and usage of professional Turkish terms and workplace language to earn a digital certificate.',
      btnStart: 'Start Competency Test ⚡',
      btnSubmit: 'Show Result & Certificate 📊',
      scoreText: 'Your Final Test Score:',
      certTitle: 'Business Turkish Competency Certificate',
      certAward: 'Awarded to the candidate for exhibiting professional vocabulary skills with score:',
      certSignature: 'Istanbul Job Board Assessment Board',
      certSeal: 'Verified Badge',
      lblQuestion: 'Question',
      q1: 'If your coworker says "Kolay gelsin" (May it be easy for you), what is the most appropriate response?',
      q1_a: 'Teşekkür ederim, sana da (Thank you, to you too)',
      q1_b: 'Rica ederim (You are welcome)',
      q1_c: 'Görüşürüz (See you)',
      q2: 'What does the financial term "Fatura kesmek" mean in Turkish business transactions?',
      q2_a: 'To issue/cut an invoice for a client',
      q2_b: 'To cancel a billing statement',
      q2_c: 'To apply a discount',
      q3: 'If you want to formally resign from your current job, what is the document called?',
      q3_a: 'İstifa dilekçesi (Resignation petition)',
      q3_b: 'İzin formu (Leave form)',
      q3_c: 'İş sözleşmesi (Employment contract)',
      q4: 'What is the correct definition of "Mesai" or "Fazla Mesai" in Turkish companies?',
      q4_a: 'Working hours or overtime work',
      q4_b: 'Distance/commute between home and office',
      q4_c: 'Lunch breaks and pauses',
      q5: 'What is the correct phrase to say to a coworker who has lost a family member?',
      q5_a: 'Başınız sağ olsun (My condolences)',
      q5_b: 'Kolay gelsin (May it be easy)',
      q5_c: 'Geçmiş olsun (Get well soon)'
    },
    tr: {
      title: 'İş Türkiyesi Yeterlilik Testi',
      subtitle: 'Dijital sertifika kazanmak için profesyonel Türkçe terimleri ve iş yeri dilini anlama ve kullanma düzeyinizi test edin.',
      btnStart: 'Yeterlilik Testini Başlat ⚡',
      btnSubmit: 'Sonucu ve Sertifikayı Göster 📊',
      scoreText: 'Final Test Puanınız:',
      certTitle: 'İş Türkiyesi Yeterlilik Sertifikası',
      certAward: 'Adayın profesyonel kelime bilgisini başarıyla sergilediği için verilen üstünlük sertifikası. Puan:',
      certSignature: 'İstanbul İş Portalı Değerlendirme Kurulu',
      certSeal: 'Onaylı Rozet',
      lblQuestion: 'Soru',
      q1: 'İş arkadaşınız size "Kolay gelsin" derse, en uygun ve yaygın yanıt ne olmalıdır?',
      q1_a: 'Teşekkür ederim, sana da (Teşekkürler, sana da)',
      q1_b: 'Rica ederim',
      q1_c: 'Görüşürüz',
      q2: 'Finansal işlemlerde "Fatura kesmek" ne anlama gelir?',
      q2_a: 'Müşteri için mali fatura düzenlemek',
      q2_b: 'Eski bir faturayı iptal etmek',
      q2_c: 'Faturada indirim uygulamak',
      q3: 'Mevcut işinizden resmi olarak istifa etmek istiyorsanız, bu dilekçeye ne ad verilir?',
      q3_a: 'İstifa dilekçesi',
      q3_b: 'İzin formu',
      q3_c: 'İş sözleşmesi',
      q4: 'Türkiye\'deki şirketlerde "Mesai" veya "Fazla Mesai" terimlerinin doğru tanımı nedir?',
      q4_a: 'Normal çalışma saatleri veya ek çalışma saatleri',
      q4_b: 'Ev ile ofis arasındaki coğrafi mesafe',
      q4_c: 'Gün içindeki yemek ve dinlenme araları',
      q5: 'Yakınını kaybeden bir iş arkadaşınıza başsağlığı dilemek için ne dersiniz?',
      q5_a: 'Başınız sağ olsun',
      q5_b: 'Kolay gelsin',
      q5_c: 'Geçmiş olsun'
    },
    ru: {
      title: 'Тест на знание делового турецкого языка',
      subtitle: 'Проверьте понимание профессиональных терминов и рабочего сленга в Турции для получения цифрового сертификата.',
      btnStart: 'Начать тест ⚡',
      btnSubmit: 'Показать результат и сертификат 📊',
      scoreText: 'Ваш итоговый балл:',
      certTitle: 'Сертификат владения деловым турецким языком',
      certAward: 'Выдан кандидату за демонстрацию профессиональных языковых навыков с оценкой:',
      certSignature: 'Комитет по оценке Стамбульского портала вакансий',
      certSeal: 'Подтвержденный статус',
      lblQuestion: 'Вопрос',
      q1: 'Если коллега говорит вам "Kolay gelsin" (пусть будет легко), какой ответ наиболее уместен?',
      q1_a: 'Teşekkür ederim, sana da (Спасибо, и тебе)',
      q1_b: 'Rica ederim (Пожалуйста)',
      q1_c: 'Görüşürüz (До встречи)',
      q2: 'Что означает финансовый термин "Fatura kesmek" в турецких бизнес-операциях?',
      q2_a: 'Выставить/выписать счет клиенту',
      q2_b: 'Аннулировать счет',
      q2_c: 'Сделать скидку по счету',
      q3: 'Как называется документ, если вы хотите официально уволиться с текущей работы?',
      q3_a: 'İstifa dilekçesi (Заявление об увольнении)',
      q3_b: 'İzin formu (Бланк отпуска)',
      q3_c: 'İş sözleşmesi (Трудовой договор)',
      q4: 'Каково правильное определение терминов "Mesai" или "Fazla Mesai" в турецких компаниях?',
      q4_a: 'Рабочее время или сверхурочная работа',
      q4_b: 'Расстояние между домом и офисом',
      q4_c: 'Обеденный перерыв и паузы',
      q5: 'Что правильно сказать коллеге или работодателю, у которого умер близкий родственник?',
      q5_a: 'Başınız sağ olsun (Примите соболезнования)',
      q5_b: 'Kolay gelsin (Пусть будет легко)',
      q5_c: 'Geçmiş olsun (Поправляйтесь)'
    },
    fa: {
      title: 'آزمون سنجش سطح زبان ترکی تجاری و کاری',
      subtitle: 'مهارت‌های زبانی، درک مطلب و استفاده خود از اصطلاحات حرفه‌ای را در محیط کار ترکی بسنجید و گواهی‌نامه رایگان دریافت کنید.',
      btnStart: 'شروع آزمون ⚡',
      btnSubmit: 'مشاهده نتیجه و دریافت گواهی‌نامه 📊',
      scoreText: 'امتیاز نهایی شما در آزمون:',
      certTitle: 'گواهی‌نامه شایستگی زبان ترکی تجاری',
      certAward: 'اعطا شده به کارجو به عنوان تاییدیه تسلط بر زبان ترکی تجاری با نمره:',
      certSignature: 'کمیته ارزیابی و آزمون الکترونیکی',
      certSeal: 'مُهر رسمی پلتفرم',
      lblQuestion: 'سوال',
      q1: 'اگر همکار شما بگوید "Kolay gelsin" (خدا قوت)، مناسب‌ترین پاسخ چیست؟',
      q1_a: 'Teşekkür ederim, sana da (ممنون، برای شما هم همینطور)',
      q1_b: 'Rica ederim (خواهش می‌کنم)',
      q1_c: 'Görüşürüz (به امید دیدار)',
      q2: 'معنی اصطلاح "Mesai" در فرهنگ سازمانی ترکیه چیست？',
      q2_a: 'ساعت کاری موظف یا اضافه‌کاری',
      q2_b: 'تایم استراحت و ناهار',
      q2_c: 'مرخصی سالانه استحقاقی',
      q3: 'کدام سند باید برای استعفای رسمی به کارفرما ارائه شود؟',
      q3_a: 'İstifa dilekçesi (نامه استعفا)',
      q3_b: 'İzin formu (برگه مرخصی)',
      q3_c: 'Sağlık raporu (گزارش پزشکی)',
      q4: 'کدام عبارت برای ابراز تسلیت به یک همکار در محیط کار استفاده می‌شود؟',
      q4_a: 'Başınız sağ olsun (سرِ سلامت باد / تسلیت می‌گویم)',
      q4_b: 'Geçmiş olsun (بلا دور باشد)',
      q4_c: 'Hayırlı olsun (مبارک باشد)',
      q5: 'معنی اصطلاح "Fatura kesmek" در کسب‌وکار چیست؟',
      q5_a: 'صدور فاکتور رسمی برای مشتری',
      q5_b: 'لغو یا ابطال تراکنش',
      q5_c: 'درخواست تخفیف در خدمات'
    },
    ur: {
      title: 'کاروباری ترکی زبان کا اہلیتی ٹیسٹ',
      subtitle: 'ترکی کے کاروباری ماحول میں استعمال ہونے والی بنیادی اصطلاحات اور زبان پر اپنی گرفت کا امتحان لیں اور مفت سرٹیفکیٹ حاصل کریں۔',
      btnStart: 'ٹیسٹ شروع کریں ⚡',
      btnSubmit: 'نتیجہ اور سرٹیفکیٹ دیکھیں 📊',
      scoreText: 'آپ کا حتمی اسکور:',
      certTitle: 'کاروباری ترکی زبان کی اہلیت کا سرٹیفکیٹ',
      certAward: 'امیدوار کو ترکی زبان کے پیشہ ورانہ استعمال پر مکمل مہارت رکھنے پر دیا جاتا ہے، با اسکور:',
      certSignature: 'الیکٹرانک تشخیصی کمیٹی',
      certSeal: 'پلیٹ فارم کی آفیشل مہر',
      lblQuestion: 'سوال',
      q1: 'اگر کام کی جگہ پر کوئی ساتھی آپ سے "Kolay gelsin" (خدا کرے آسانی ہو) کہے، تو بہترین جواب کیا ہوگا؟',
      q1_a: 'Teşekkür ederim, sana da (شکریہ، آپ کے لیے بھی)',
      q1_b: 'Rica ederim (کوئی بات نہیں)',
      q1_c: 'Görüşürüz (دوبارہ ملیں گے)',
      q2: 'ترک کاروباری کلچر میں لفظ "Mesai" کا کیا مطلب ہے؟',
      q2_a: 'کام کے اوقات یا اوور ٹائم',
      q2_b: 'کھانے کا وقفہ',
      q2_c: 'سالانہ چھٹیاں',
      q3: 'ملازمت سے استعفیٰ دینے کے لیے آجر کو کونسی دستاویز پیش کی جانی چاہیے؟',
      q3_a: 'İstifa dilekçesi (استعفیٰ نامہ)',
      q3_b: 'İzin formu (چھٹی کا فارم)',
      q3_c: 'Sağlık raporu (طبی رپورٹ)',
      q4: 'کسی ساتھی کے ہاں انتقال ہونے پر تعزیت کے لیے کونسی ترکی اصطلاح استعمال ہوتی ہے؟',
      q4_a: 'Başınız sağ olsun (اللہ صبر دے / تعزیت پیش کرتے ہیں)',
      q4_b: 'Geçmiş olsun (اللہ صحت دے)',
      q4_c: 'Hayırlı olsun (مبارک ہو)',
      q5: 'کاروبار میں اصطلاح "Fatura kesmek" کا کیا مطلب ہے؟',
      q5_a: 'گاہک کو باقاعدہ انوائس یا بل جاری کرنا',
      q5_b: 'لین دین منسوخ کرنا',
      q5_c: 'رعایت کی درخواست کرنا'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 800px; padding: 60px 20px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem; max-width: 700px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>

      <!-- Start View -->
      <div id="test-start-view" class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: center;">
        <i class="fa-solid fa-language" style="font-size: 4rem; color: var(--primary); margin-bottom: 20px; filter: drop-shadow(0 4px 10px var(--primary-glow));"></i>
        <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px;">${locale === 'ar' ? 'هل لغتك التركية جاهزة لبيئة العمل؟' : 'Is your Turkish workplace-ready?'}</h3>
        <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 30px; max-width: 500px; margin-left:auto; margin-right:auto;">
          ${locale === 'ar' ? 'يتكون هذا الاختبار من 5 أسئلة تغطي أهم المواقف والمصطلحات اللازمة للنجاح وتفادي الأخطاء في الشركات التركية.' : 'This short test consists of 5 questions covering essential situational terms needed to succeed in Turkish offices.'}
        </p>
        <button type="button" onclick="startTest()" class="btn-sidebar-apply" style="border:none; width:auto; padding:14px 40px;">${t.btnStart}</button>
      </div>

      <!-- Quiz Form View -->
      <div id="test-quiz-view" class="glass-card" style="display:none; padding: 30px; border-radius: var(--radius-lg);">
        <form id="quiz-form" onsubmit="calculateScore(event)">
          <div style="margin-bottom: 30px; border-bottom: 1px solid var(--border); padding-bottom: 20px;">
            <label style="display:block; font-weight:700; color:var(--text-dark); margin-bottom:8px;">${locale === 'ar' ? 'الاسم الكامل للشهادة' : 'Full Name for Certificate'}</label>
            <input type="text" id="candidate-name" required placeholder="${locale === 'ar' ? 'اكتب اسمك الثلاثي...' : 'John Doe'}" class="form-input" style="max-width:400px;">
          </div>

          <!-- Q1 -->
          <div class="quiz-question-card" style="margin-bottom: 24px;">
            <div style="font-weight:700; color:var(--primary); margin-bottom:8px;">${t.lblQuestion} 1:</div>
            <p style="font-weight:700; color:var(--text-dark); margin-bottom:12px;">${t.q1}</p>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q1" value="a" required> <span>${t.q1_a}</span></label>
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q1" value="b"> <span>${t.q1_b}</span></label>
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q1" value="c"> <span>${t.q1_c}</span></label>
            </div>
          </div>

          <!-- Q2 -->
          <div class="quiz-question-card" style="margin-bottom: 24px;">
            <div style="font-weight:700; color:var(--primary); margin-bottom:8px;">${t.lblQuestion} 2:</div>
            <p style="font-weight:700; color:var(--text-dark); margin-bottom:12px;">${t.q2}</p>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q2" value="a" required> <span>${t.q2_a}</span></label>
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q2" value="b"> <span>${t.q2_b}</span></label>
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q2" value="c"> <span>${t.q2_c}</span></label>
            </div>
          </div>

          <!-- Q3 -->
          <div class="quiz-question-card" style="margin-bottom: 24px;">
            <div style="font-weight:700; color:var(--primary); margin-bottom:8px;">${t.lblQuestion} 3:</div>
            <p style="font-weight:700; color:var(--text-dark); margin-bottom:12px;">${t.q3}</p>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q3" value="a" required> <span>${t.q3_a}</span></label>
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q3" value="b"> <span>${t.q3_b}</span></label>
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q3" value="c"> <span>${t.q3_c}</span></label>
            </div>
          </div>

          <!-- Q4 -->
          <div class="quiz-question-card" style="margin-bottom: 24px;">
            <div style="font-weight:700; color:var(--primary); margin-bottom:8px;">${t.lblQuestion} 4:</div>
            <p style="font-weight:700; color:var(--text-dark); margin-bottom:12px;">${t.q4}</p>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q4" value="a" required> <span>${t.q4_a}</span></label>
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q4" value="b"> <span>${t.q4_b}</span></label>
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q4" value="c"> <span>${t.q4_c}</span></label>
            </div>
          </div>

          <!-- Q5 -->
          <div class="quiz-question-card" style="margin-bottom: 30px;">
            <div style="font-weight:700; color:var(--primary); margin-bottom:8px;">${t.lblQuestion} 5:</div>
            <p style="font-weight:700; color:var(--text-dark); margin-bottom:12px;">${t.q5}</p>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q5" value="a" required> <span>${t.q5_a}</span></label>
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q5" value="b"> <span>${t.q5_b}</span></label>
              <label class="form-input" style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="radio" name="q5" value="c"> <span>${t.q5_c}</span></label>
            </div>
          </div>

          <button type="submit" class="btn-sidebar-apply" style="border:none;">${t.btnSubmit}</button>
        </form>
      </div>

      <!-- Result/Certificate View -->
      <div id="test-result-view" style="display:none; text-align:center;">
        <div class="glass-card" style="padding: 24px; border-radius: var(--radius-lg); margin-bottom: 30px; display:inline-block;">
          <h4 style="margin:0 0 10px; color:var(--text-muted);">${t.scoreText}</h4>
          <div id="quiz-final-score" style="font-size: 3rem; font-weight:900; color:var(--primary);">--</div>
        </div>

        <div id="certificate-container" style="background:#fff; border: 15px double var(--primary); padding: 40px; position:relative; box-shadow: var(--shadow-xl); max-width:700px; margin:0 auto 30px; color:#1e293b; font-family:'Plus Jakarta Sans', sans-serif; text-align:center;">
          <div style="border: 2px solid var(--accent); padding: 20px;">
            <i class="fa-solid fa-graduation-cap" style="font-size: 2.5rem; color:var(--primary); margin-bottom:15px;"></i>
            <h2 style="font-family:'Cairo', sans-serif; font-size: 1.8rem; font-weight:900; color:var(--primary); margin:0 0 8px;">${t.certTitle}</h2>
            <div style="font-size: 0.85rem; letter-spacing: 0.05em; color:var(--text-muted); margin-bottom:30px;">ISTANBUL JOBS NETWORK ASSESSMENT</div>
            
            <p style="font-size: 1.1rem; font-style:italic; margin-bottom:12px; color:#475569;">${locale === 'ar' ? 'تشهد إدارة المنصة بأن الباحث عن عمل:' : 'This is to certify that:'}</p>
            <h1 id="cert-candidate-name" style="font-size: 2.2rem; font-weight:800; color:var(--text-dark); margin:0 0 20px; border-bottom: 2px dashed var(--border); display:inline-block; padding:0 20px 6px;">--</h1>
            
            <p style="font-size: 1rem; margin-bottom:24px; color:#475569;">${t.certAward} <strong id="cert-score-label" style="color:var(--primary); font-size:1.15rem;">--</strong></p>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:50px; font-size:0.85rem; color:#64748b;">
              <div style="text-align:left;">
                <div style="border-top:1.5px solid #cbd5e1; padding-top:6px; font-weight:700;">${t.certSignature}</div>
                <div style="font-size:0.75rem;">jobs-in-istanbul.com</div>
              </div>
              <div style="width: 80px; height: 80px; border-radius: 50%; border: 3px dashed var(--accent); display:flex; align-items:center; justify-content:center; color:var(--accent); font-weight:900; font-size:0.8rem; transform:rotate(-15deg);">
                ${t.certSeal}
              </div>
              <div style="text-align:right;">
                <div id="cert-date" style="font-weight:700;">--</div>
                <div style="font-size:0.75rem;">DATE ISSUED</div>
              </div>
            </div>
          </div>
        </div>

        <button onclick="window.print()" class="btn-sidebar-apply" style="width:auto; padding:12px 30px; border:none;"><i class="fa-solid fa-print"></i> ${locale === 'ar' ? 'طباعة وحفظ الشهادة PDF 🖨️' : 'Print & Save Certificate 🖨️'}</button>
      </div>
    </div>

    <script>
      function startTest() {
        document.getElementById('test-start-view').style.display = 'none';
        document.getElementById('test-quiz-view').style.display = 'block';
      }

      function calculateScore(e) {
        e.preventDefault();
        const form = e.target;
        const name = document.getElementById('candidate-name').value.trim();
        
        const answers = { q1: 'a', q2: 'a', q3: 'a', q4: 'a', q5: 'a' };
        let correct = 0;
        for (let i = 1; i <= 5; i++) {
          if (form.elements['q' + i].value === answers['q' + i]) correct++;
        }

        const percentage = Math.round((correct / 5) * 100);
        document.getElementById('test-quiz-view').style.display = 'none';
        document.getElementById('test-result-view').style.display = 'block';
        document.getElementById('quiz-final-score').textContent = percentage + '%';
        document.getElementById('cert-candidate-name').textContent = name || 'User';
        
        let level = 'A2 - Elementary';
        if (percentage >= 100) level = 'C1 - Advanced (كفاءة مهنية عالية)';
        else if (percentage >= 80) level = 'B2 - Intermediate (مستوى عملي جيد)';
        else if (percentage >= 60) level = 'B1 - Basic Work Turkish (أساسي للعمل)';
        
        document.getElementById('cert-score-label').textContent = percentage + '% (' + level + ')';
        document.getElementById('cert-date').textContent = new Date().toLocaleDateString();
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// AI Interview Simulator Page
aiFeaturesRouter.get('/:locale/interview-prep', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/interview-prep');

  const t = {
    ar: {
      title: 'محاكي المقابلات الشخصية بالذكاء الاصطناعي',
      subtitle: 'اختر تخصصك ودع المساعد الذكي يطرح عليك أسئلة مقابلة العمل الحقيقية لتقييم إجاباتك وتقديم تقرير أداء متكامل.',
      btnStart: 'بدء المقابلة التجريبية 🎙️',
      btnSubmit: 'تقديم الإجابة والتقييم ➔',
      btnEvaluate: 'الحصول على التقرير النهائي 📊',
      lblRole: 'المسمى الوظيفي المستهدف للمقابلة',
      lblLevel: 'مستوى الخبرة المطلوبة',
      levelJr: 'مبتدئ / خريج جديد',
      levelMid: 'متوسط الخبرة',
      levelSr: 'متقدم / خبير',
      plhRole: 'مثال: مهندس شبكات، سكرتير تنفيذي، مسؤول مبيعات...',
      loadingQuestions: 'جاري إنشاء أسئلة المقابلة المناسبة لتخصصك بالـ AI... ⏳',
      loadingEvaluate: 'جاري مراجعة وتقييم إجاباتك بالذكاء الاصطناعي... ⏳',
      lblQuestion: 'السؤال',
      lblAnswer: 'إجابتك المقترحة',
      plhAnswer: 'اكتب إجابتك هنا بأكبر قدر من التفاصيل والوضوح المهني...',
      feedbackTitle: 'تقرير تقييم المقابلة بالذكاء الاصطناعي 📋',
      scoreText: 'التقييم العام للمقابلة:',
      tipsTitle: 'نقاط القوة ونصائح التحسين:',
      restartBtn: 'إجراء مقابلة جديدة 🔄'
    },
    en: {
      title: 'AI Job Interview Simulator',
      subtitle: 'Simulate live professional interviews based on job title, answer real questions, and get comprehensive performance feedback.',
      btnStart: 'Start Mock Interview 🎙️',
      btnSubmit: 'Submit Answer ➔',
      btnEvaluate: 'Evaluate Performance 📊',
      lblRole: 'Target Job Role',
      lblLevel: 'Experience Level',
      levelJr: 'Entry-Level / Junior',
      levelMid: 'Mid-Level',
      levelSr: 'Senior / Expert',
      plhRole: 'e.g. Sales Account Manager, Accountant, Full-Stack Developer...',
      loadingQuestions: 'AI is generating tailored interview questions... ⏳',
      loadingEvaluate: 'AI is reviewing and scoring your answers... ⏳',
      lblQuestion: 'Question',
      lblAnswer: 'Your Answer',
      plhAnswer: 'Type your detailed answer here...',
      feedbackTitle: 'AI Interview Assessment Report 📋',
      scoreText: 'Overall Interview Score:',
      tipsTitle: 'Strengths & Areas of Improvement:',
      restartBtn: 'Start Another Interview 🔄'
    },
    tr: {
      title: 'Yapay Zeka Mülakat Simülatörü',
      subtitle: 'Uzmanlık alanınızı seçin ve yapay zeka asistanının size gerçek mülakat soruları sormasına izin verin, cevaplarınızı değerlendirin ve detaylı rapor alın.',
      btnStart: 'Mülakatı Başlat 🎙️',
      btnSubmit: 'Cevabı Gönder ➔',
      btnEvaluate: 'Değerlendirme Raporunu Al 📊',
      lblRole: 'Hedef İş Unvanı / Rolü',
      lblLevel: 'Deneyim Seviyesi',
      levelJr: 'Giriş Seviyesi / Yeni Mezun',
      levelMid: 'Orta Seviye',
      levelSr: 'Kıdemli / Uzman',
      plhRole: 'Örn: Ağ Mühendisi, Yönetici Sekreteri, Satış Sorumlusu...',
      loadingQuestions: 'AI, uzmanlık alanınıza göre mülakat soruları hazırlıyor... ⏳',
      loadingEvaluate: 'AI, cevaplarınızı inceliyor ve puanlıyor... ⏳',
      lblQuestion: 'Soru',
      lblAnswer: 'Cevabınız',
      plhAnswer: 'Cevabınızı buraya detaylı ve net bir şekilde yazın...',
      feedbackTitle: 'Yapay Zeka Mülakat Değerlendirme Raporu 📋',
      scoreText: 'Genel Mülakat Skoru:',
      tipsTitle: 'Güçlü Yönler ve Geliştirilmesi Gereken Alanlar:',
      restartBtn: 'Yeni Mülakat Başlat 🔄'
    },
    ru: {
      title: 'Симулятор собеседований с ИИ',
      subtitle: 'Симулируйте реальные собеседования на основе желаемой должности, отвечайте на вопросы и получайте комплексную оценку с помощью ИИ.',
      btnStart: 'Начать собеседование 🎙️',
      btnSubmit: 'Отправить ответ ➔',
      btnEvaluate: 'Получить отчет об оценке 📊',
      lblRole: 'Желаемая должность / Роль',
      lblLevel: 'Уровень опыта',
      levelJr: 'Начальный уровень / Выпускник',
      levelMid: 'Средний уровень',
      levelSr: 'Старший / Эксперт',
      plhRole: 'Напр: Frontend-разработчик, Бухгалтер, Администратор...',
      loadingQuestions: 'ИИ создает персонализированные вопросы для собеседования... ⏳',
      loadingEvaluate: 'ИИ анализирует и оценивает ваши ответы... ⏳',
      lblQuestion: 'Вопрос',
      lblAnswer: 'Ваш ответ',
      plhAnswer: 'Подробно напишите свой ответ здесь...',
      feedbackTitle: 'Отчет об оценке собеседования с ИИ 📋',
      scoreText: 'Общая оценка собеседования:',
      tipsTitle: 'Сильные стороны и области для улучшения:',
      restartBtn: 'Начать новое собеседование 🔄'
    },
    fa: {
      title: 'شبیه‌ساز مصاحبه کاری هوش مصنوعی',
      subtitle: 'شبیه‌سازی مصاحبه‌های استخدامی واقعی بر اساس شغل هدف شما. به سوالات پاسخ دهید و ارزیابی جامع هوش مصنوعی را دریافت کنید.',
      btnStart: 'شروع مصاحبه 🎙️',
      btnSubmit: 'ارسال پاسخ ➔',
      btnEvaluate: 'دریافت گزارش ارزیابی 📊',
      lblRole: 'موقعیت شغلی هدف',
      lblLevel: 'سطح سابقه کار',
      levelJr: 'مبتدی / تازه فارغ‌التحصیل',
      levelMid: 'میان‌رده',
      levelSr: 'ارشد / سنیور',
      plhRole: 'مثال: برنامه‌نویس وب, حسابدار, کارشناس فروش...',
      loadingQuestions: 'هوش مصنوعی در حال طراحی سوالات اختصاصی مصاحبه شماست... ⏳',
      loadingEvaluate: 'هوش مصنوعی در حال تحلیل و تصحیح پاسخ‌های شماست... ⏳',
      lblQuestion: 'سوال مصاحبه',
      lblAnswer: 'پاسخ شما',
      plhAnswer: 'پاسخ کامل خود را اینجا بنویسید...',
      feedbackTitle: 'گزارش ارزیابی مصاحبه هوش مصنوعی 📋',
      scoreText: 'امتیاز نهایی مصاحبه:',
      tipsTitle: 'نقاط قوت و زمینه‌های شایسته بهبود:',
      restartBtn: 'شروع مجدد مصاحبه 🔄'
    },
    ur: {
      title: 'اے آئی انٹرویو سمیلیٹر اور پریکٹس ٹول',
      subtitle: 'اپنی پسندیدہ نوکری کے لیے فرضی انٹرویو دیں۔ اپنے جوابات ریکارڈ یا ٹائپ کریں اور فوری تجزیہ حاصل کریں۔',
      btnStart: 'انٹرویو شروع کریں 🎙️',
      btnSubmit: 'جواب جمع کریں ➔',
      btnEvaluate: 'اہلیت کی رپورٹ حاصل کریں 📊',
      lblRole: 'مطلوبہ نوکری کا عنوان',
      lblLevel: 'تجربہ کا درجہ',
      levelJr: 'جونیئر / نئے فارغ التحصیل',
      levelMid: 'مڈ لیول (درمیانہ)',
      levelSr: 'سینیئر (اعلیٰ)',
      plhRole: 'مثال: ویب ڈیزائنر، ہیومن ریسورس مینیجر، اکاؤنٹنٹ...',
      loadingQuestions: 'اے آئی آپ کے عہدے کے مطابق انٹرویو سوالات تیار کر رہا ہے... ⏳',
      loadingEvaluate: 'اے آئی آپ کے جوابات کا تجزیہ کر رہا ہے... ⏳',
      lblQuestion: 'انٹرویو کا سوال',
      lblAnswer: 'آپ کا جواب',
      plhAnswer: 'اپنا مکمل جواب یہاں ٹائپ کریں...',
      feedbackTitle: 'اے آئی انٹرویو تشخیصی رپورٹ 📋',
      scoreText: 'انٹرویو کا حتمی اسکور:',
      tipsTitle: 'خوبیاں اور بہتری کے پہلو:',
      restartBtn: 'انٹرویو دوبارہ شروع کریں 🔄'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 800px; padding: 60px 20px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem; max-width: 700px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>

      <!-- SETUP VIEW -->
      <div id="interview-setup-view" class="glass-card" style="padding: 30px; border-radius: var(--radius-lg);">
        <form id="setup-form" onsubmit="generateQuestions(event)">
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblRole}</label>
            <input type="text" id="int-role" required placeholder="${t.plhRole}" class="form-input">
          </div>

          <div style="margin-bottom: 30px;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblLevel}</label>
            <select id="int-level" class="form-input" style="background: var(--bg-site);">
              <option value="junior">${t.levelJr}</option>
              <option value="mid">${t.levelMid}</option>
              <option value="senior">${t.levelSr}</option>
            </select>
          </div>

          <button type="submit" id="startBtn" class="btn-sidebar-apply" style="border: none;">
            ${t.btnStart}
          </button>
        </form>
      </div>

      <!-- INTERVIEW IN PROGRESS VIEW -->
      <div id="interview-play-view" class="glass-card" style="display: none; padding: 30px; border-radius: var(--radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 24px;">
          <h4 style="margin: 0; color: var(--primary); font-weight: 800;" id="q-counter">Question 1 of 3</h4>
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);" id="q-role-tag">Frontend Developer</span>
        </div>

        <div style="margin-bottom: 24px;">
          <p id="question-text" style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); line-height: 1.6;"></p>
        </div>

        <form id="answer-form" onsubmit="submitAnswer(event)">
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.lblAnswer}</label>
            <textarea id="answer-text" required placeholder="${t.plhAnswer}" rows="6" class="form-input"></textarea>
          </div>
          <button type="submit" id="playBtn" class="btn-sidebar-apply" style="border: none;">
            ${t.btnSubmit}
          </button>
        </form>
      </div>

      <!-- RESULTS EVALUATION VIEW -->
      <div id="interview-feedback-view" class="glass-card" style="display: none; padding: 30px; border-radius: var(--radius-lg); animation: fadeIn 0.4s ease;">
        <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-dark); margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 12px;">${t.feedbackTitle}</h3>
        
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
          <div id="eval-score" style="width: 100px; height: 100px; border-radius: 50%; border: 8px solid var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; color: var(--primary);">--</div>
          <div>
            <div style="font-weight: 700; color: var(--text-dark); font-size: 1.1rem; margin-bottom: 6px;">${t.scoreText}</div>
            <p style="font-size: 0.95rem; margin: 0; color: var(--text-muted);">${locale === 'ar' ? 'مراجعة شاملة لجميع إجاباتك بالتفصيل أدناه.' : 'Detailed evaluation of your answers follows below.'}</p>
          </div>
        </div>

        <div style="font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.tipsTitle}</div>
        <div id="eval-feedback" style="white-space: pre-wrap; background: var(--bg-site); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border); color: var(--text-dark); line-height: 1.7; margin-bottom: 30px; font-size: 0.95rem;"></div>

        <button onclick="restartInterview()" class="btn-apply-now" style="width: 100%; padding: 12px; font-weight: 700;">${t.restartBtn}</button>
      </div>
    </div>

    <script>
      let interviewQuestions = [];
      let candidateAnswers = [];
      let currentQIndex = 0;

      async function generateQuestions(e) {
        e.preventDefault();
        const role = document.getElementById('int-role').value.trim();
        const level = document.getElementById('int-level').value;
        const btn = document.getElementById('startBtn');

        btn.innerText = "${t.loadingQuestions}";
        btn.disabled = true;

        try {
          const res = await fetch('/api/interview-simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'generate',
              role,
              level,
              locale: "${locale}"
            })
          });

          const data = await res.json();
          if (res.ok && data.questions) {
            interviewQuestions = data.questions;
            candidateAnswers = [];
            currentQIndex = 0;
            
            document.getElementById('interview-setup-view').style.display = 'none';
            document.getElementById('q-role-tag').textContent = role + ' (' + level + ')';
            
            showQuestion();
            document.getElementById('interview-play-view').style.display = 'block';
          } else {
            alert(data.error || 'Failed to generate questions.');
          }
        } catch(err) {
          alert('Network error occurred.');
        } finally {
          btn.innerText = "${t.btnStart}";
          btn.disabled = false;
        }
      }

      function showQuestion() {
        document.getElementById('q-counter').textContent = 
          ( "${locale === 'ar' ? 'السؤال ' : 'Question '}" ) + (currentQIndex + 1) + " / 3";
        document.getElementById('question-text').textContent = interviewQuestions[currentQIndex];
        document.getElementById('answer-text').value = '';
        
        const btn = document.getElementById('playBtn');
        if (currentQIndex === 2) {
          btn.innerText = "${t.btnEvaluate}";
        } else {
          btn.innerText = "${t.btnSubmit}";
        }
      }

      async function submitAnswer(e) {
        e.preventDefault();
        const answer = document.getElementById('answer-text').value.trim();
        candidateAnswers.push(answer);

        if (currentQIndex < 2) {
          currentQIndex++;
          showQuestion();
        } else {
          await evaluateInterview();
        }
      }

      async function evaluateInterview() {
        const playBtn = document.getElementById('playBtn');
        playBtn.innerText = "${t.loadingEvaluate}";
        playBtn.disabled = true;

        const role = document.getElementById('int-role').value.trim();
        const level = document.getElementById('int-level').value;

        try {
          const res = await fetch('/api/interview-simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'evaluate',
              role,
              level,
              questions: interviewQuestions,
              answers: candidateAnswers,
              locale: "${locale}"
            })
          });

          const data = await res.json();
          if (res.ok) {
            document.getElementById('interview-play-view').style.display = 'none';
            
            const dial = document.getElementById('eval-score');
            dial.textContent = data.score + '%';
            const color = data.score >= 80 ? '#10b981' : data.score >= 50 ? '#f59e0b' : '#ef4444';
            dial.style.borderColor = color;
            dial.style.color = color;

            document.getElementById('eval-feedback').textContent = data.feedback;
            document.getElementById('interview-feedback-view').style.display = 'block';
            document.getElementById('interview-feedback-view').scrollIntoView({ behavior: 'smooth' });
          } else {
            alert(data.error || 'Evaluation failed.');
          }
        } catch(err) {
          alert('Network error occurred.');
        } finally {
          playBtn.innerText = "${t.btnEvaluate}";
          playBtn.disabled = false;
        }
      }

      function restartInterview() {
        document.getElementById('interview-feedback-view').style.display = 'none';
        document.getElementById('interview-setup-view').style.display = 'block';
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// API endpoint for AI Interview Simulator
aiFeaturesRouter.post('/api/interview-simulate', rateLimiter(3, 10), async (c) => {
  const env: any = c.env;
  if (!env.AI) return c.json({ error: 'AI binding missing' }, 500);

  const { action, role, level, questions, answers, locale } = await c.req.json();
  if (!role) return c.json({ error: 'Role is required' }, 400);

  if (action === 'generate') {
    const systemPrompt = `
You are an expert interviewer recruiting candidates in Istanbul.
Write exactly 3 distinct, highly realistic interview questions for a candidate applying for the position: "${role}" at the level: "${level}".
The questions must be written in ${locale === 'ar' ? 'Arabic' : (locale === 'tr' ? 'Turkish' : (locale === 'ru' ? 'Russian' : (locale === 'fa' ? 'Persian (Farsi)' : (locale === 'ur' ? 'Urdu' : 'English'))))}.
Format the output as a simple array or list of questions. One question per line.
Do NOT write conversational intros, code blocks, or notes. Print ONLY the 3 questions.
`;

    try {
      const aiResponse: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Generate 3 questions.' }],
        max_tokens: 500
      });

      let rawText = '';
      if (typeof aiResponse === 'string') {
        rawText = aiResponse;
      } else if (aiResponse && aiResponse.response) {
        rawText = aiResponse.response;
      } else if (aiResponse && aiResponse.result) {
        rawText = aiResponse.result;
      } else {
        rawText = JSON.stringify(aiResponse);
      }

      const qList = rawText.split('\n')
        .map(q => q.trim().replace(/^(\d+[\.\)\-]\s*)/, '')) 
        .filter(q => q.length > 10);

      const fallbacks = {
        ar: [
          `تحدث عن خبرتك السابقة في مجال "${role}" وكيف تؤهلك لهذه الوظيفة؟`,
          `ما هو أصعب تحدي تقني واجهته في عملك السابق كـ "${role}" وكيف تعاملت معه؟`,
          `لماذا ترغب في الانضمام للعمل في مدينة إسطنبول؟`
        ],
        fa: [
          `درباره تجربه قبلی خود در نقش "${role}" و اینکه چگونه شما را برای این موقعیت آماده کرده است، توضیح دهید.`,
          `سخت‌ترین چالش فنی که به عنوان "${role}" با آن مواجه شدید چه بود و چگونه آن را حل کردید؟`,
          `چرا می‌خواهید در استانبول کار کنید و به تیم ما بپیوندید؟`
        ],
        ur: [
          `اپنے گذشتہ تجربہ کے بارے میں بتائیں جو آپ کو عہدہ "${role}" کے لیے اہل بناتا ہے۔`,
          `بطور "${role}" آپ کو پیش آنے والا سب سے مشکل تکنیکی چیلنج کیا تھا اور آپ نے اسے کیسے حل کیا؟`,
          `آپ استنبول میں کام کرنے اور ہماری ٹیم میں شامل ہونے کے خواہشمند کیوں ہیں؟`
        ],
        en: [
          `Tell me about your previous experience in "${role}" and how it qualifies you for this position.`,
          `What was the most challenging technical problem you faced as a "${role}" and how did you resolve it?`,
          `Why do you want to work in Istanbul and join our team?`
        ]
      }[locale === 'ar' ? 'ar' : (locale === 'fa' ? 'fa' : (locale === 'ur' ? 'ur' : 'en'))];

      const finalQuestions = qList.length >= 3 ? qList.slice(0, 3) : fallbacks;

      return c.json({ questions: finalQuestions });
    } catch(err: any) {
      return c.json({ error: 'AI question generation failed: ' + err.message }, 500);
    }

  } else if (action === 'evaluate') {
    if (!Array.isArray(questions) || !Array.isArray(answers) || questions.length === 0 || answers.length === 0) {
      return c.json({ error: 'Missing questions/answers arrays' }, 400);
    }

    let qaText = '';
    for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
      qaText += `Question ${i+1}: ${questions[i]}\nAnswer ${i+1}: ${answers[i]}\n\n`;
    }

    const systemPrompt = `
You are an expert recruiter and technical assessor.
Evaluate the candidate's answers to the interview questions for the role: "${role}" at the level: "${level}".
The evaluation must be written in ${locale === 'ar' ? 'Arabic' : (locale === 'tr' ? 'Turkish' : (locale === 'ru' ? 'Russian' : (locale === 'fa' ? 'Persian (Farsi)' : (locale === 'ur' ? 'Urdu' : 'English'))))}.
You MUST output a JSON object containing two fields:
{
  "score": 85,
  "feedback": "Write a detailed review, pointing out strengths, terminology improvements, and specific tips for development."
}
Do NOT wrap the JSON in markdown code blocks, do not write comments, do not add intros or outros. Print ONLY valid JSON.
`;

    try {
      const aiResponse: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: qaText }],
        max_tokens: 1200
      });

      let rawText = '';
      if (typeof aiResponse === 'string') {
        rawText = aiResponse;
      } else if (aiResponse && aiResponse.response) {
        rawText = aiResponse.response;
      } else if (aiResponse && aiResponse.result) {
        rawText = aiResponse.result;
      } else {
        rawText = JSON.stringify(aiResponse);
      }

      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const startIdx = rawText.indexOf('{');
      const endIdx = rawText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        rawText = rawText.substring(startIdx, endIdx + 1);
      }

      try {
        const parsed = JSON.parse(rawText);
        return c.json({
          score: parsed.score || 70,
          feedback: parsed.feedback || 'Assessment completed successfully.'
        });
      } catch (parseErr) {
        return c.json({
          score: 75,
          feedback: rawText
        });
      }

    } catch(err: any) {
      return c.json({ error: 'AI evaluation failed: ' + err.message }, 500);
    }
  }

  return c.json({ error: 'Invalid action' }, 400);
});

// ─── AI CV ATS Scanner API ───────────────────────────────────────────────
aiFeaturesRouter.post('/api/candidate/ats-scan', rateLimiter(5, 10), async (c) => {
  const env: any = c.env;
  const db = env.DB;
  const geminiApiKey = env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return c.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, 500);
  }

  try {
    const { jobId, cvText } = await c.req.json();
    if (!jobId || !cvText) {
      return c.json({ error: 'Missing jobId or cvText in request.' }, 400);
    }

    // Fetch the job document
    const jobRow = await db.prepare(
      `SELECT data FROM documents WHERE type_id = 'jobs' AND id = ? AND is_published = 1`
    ).bind(jobId).first();

    if (!jobRow) {
      return c.json({ error: 'Job listing not found or inactive.' }, 404);
    }

    const jobData = JSON.parse(jobRow.data || '{}');
    const jobTitle = jobData.title_en || jobData.title_ar || 'Job Title';
    const jobDescription = jobData.description_en || jobData.description_ar || 'Job Description';
    const jobKeywords = jobData.seoKeywords || [];

    const prompt = `
You are an expert ATS (Applicant Tracking System) recruiter and bilingual CV optimization specialist for the Middle East and Turkish job markets.
Compare the following Candidate Resume/CV with the Job Posting details (Title, Description, and Keywords).
Perform the following tasks:
1. Calculate a compatibility match score from 0 to 100%. Be realistic and objective based on how well the candidate's skills and experience match the job description.
2. Identify a list of "matchingKeywords": keywords present in both the CV and the job description/keywords.
3. Identify a list of "missingKeywords": critical keywords, skills, or tools present in the job description/keywords but missing from the candidate's CV.
4. Provide 3-4 highly actionable "recommendations" on how the candidate can optimize their CV specifically for this job.

Job Title: "${jobTitle}"
Job Description: "${jobDescription}"
Job Keywords: "${Array.isArray(jobKeywords) ? jobKeywords.join(', ') : jobKeywords}"

Candidate CV Text:
"${cvText}"

Return ONLY a valid JSON object matching the following structure. Do not wrap it in markdown code blocks, do not write comments, do not add intros or outros:
{
  "score": 85,
  "matchingKeywords": ["Keyword1", "Keyword2", ...],
  "missingKeywords": ["Keyword3", "Keyword4", ...],
  "recommendations": [
    "Recommendation 1...",
    "Recommendation 2...",
    "Recommendation 3..."
  ]
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data: any = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      text = text.substring(startIdx, endIdx + 1);
    }

    const parsed = JSON.parse(text);
    return c.json({
      success: true,
      score: parsed.score || 0,
      matchingKeywords: parsed.matchingKeywords || [],
      missingKeywords: parsed.missingKeywords || [],
      recommendations: parsed.recommendations || []
    });

  } catch (err: any) {
    console.error('ATS Scan API Error:', err);
    return c.json({ 
      success: false, 
      error: 'An error occurred during CV ATS scanning: ' + err.message 
    }, 500);
  }
});

// ─── AI CV ATS Scanner UI Page ───────────────────────────────────────────
aiFeaturesRouter.get('/:locale/ats-scanner', async (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/ats-scanner');
  const db = (c as any).env.DB;

  const t = {
    ar: {
      title: '🤖 فاحص السيرة الذاتية بالذكاء الاصطناعي (ATS Scanner)',
      subtitle: 'ارفع سيرتك الذاتية وافحص مدى توافقها مع نظام الفرز الآلي للوظيفة المطلوبة، واحصل على نصائح لتحسينها فوراً.',
      selectJob: 'اختر الوظيفة المستهدفة للتحليل',
      selectPlh: '-- اختر الوظيفة من القائمة --',
      uploadTitle: 'ارفع سيرتك الذاتية (ملف PDF)',
      uploadDesc: 'اسحب وأسقط ملف الـ PDF الخاص بسيرتك الذاتية هنا، أو انقر للاختيار من جهازك',
      pasteLabel: 'أو الصق نص السيرة الذاتية مباشرة هنا',
      pastePlh: 'الصق نص سيرتك الذاتية بالكامل هنا...',
      submitBtn: 'ابدأ فحص السيرة الذاتية ⚡',
      loading: 'جاري استخراج النص وتحليله بالذكاء الاصطناعي... ⏳',
      resultsTitle: '📊 تقرير توافق السيرة الذاتية (ATS Report)',
      scoreLabel: 'نسبة التوافق',
      matchingTitle: '✅ كلمات مفتاحية متطابقة (في سيرتك الذاتية والوظيفة)',
      missingTitle: '❌ كلمات مفتاحية مفقودة (نوصي بإضافتها)',
      recTitle: '💡 نصائح الذكاء الاصطناعي لتحسين السيرة الذاتية',
      noJobs: 'لا توجد وظائف متاحة حالياً للفحص.'
    },
    en: {
      title: '🤖 AI CV ATS Scanner',
      subtitle: 'Upload your CV and check its compatibility with the applicant tracking systems (ATS) for your target job, with instant optimization tips.',
      selectJob: 'Select Target Job Vacancy',
      selectPlh: '-- Choose a job from the list --',
      uploadTitle: 'Upload Your CV (PDF File)',
      uploadDesc: 'Drag & drop your PDF resume here, or click to browse files',
      pasteLabel: 'Or paste your CV text directly below',
      pastePlh: 'Paste your full CV text content here...',
      submitBtn: 'Analyze Compatibility ⚡',
      loading: 'Extracting text and analyzing with AI... ⏳',
      resultsTitle: '📊 ATS Compatibility Report',
      scoreLabel: 'Compatibility Score',
      matchingTitle: '✅ Matching Keywords (Present in your CV)',
      missingTitle: '❌ Missing Keywords (Recommended to add)',
      recTitle: '💡 AI CV Optimization Tips & Recommendations',
      noJobs: 'No job listings available for analysis.'
    },
    tr: {
      title: '🤖 Yapay Zeka Özgeçmiş ATS Tarayıcı',
      subtitle: 'Özgeçmişinizi yükleyin ve hedef iş için başvuru takip sistemleri (ATS) ile uyumluluğunu kontrol edin ve anında optimizasyon ipuçları alın.',
      selectJob: 'Hedef İş İlanını Seçin',
      selectPlh: '-- Listeden bir iş seçin --',
      uploadTitle: 'Özgeçmişinizi Yükleyin (PDF Dosyası)',
      uploadDesc: 'Özgeçmişinizi (PDF) sürükleyip buraya bırakın veya dosyalara göz atmak için tıklayın',
      pasteLabel: 'Veya özgeçmiş metninizi doğrudan aşağıya yapıştırın',
      pastePlh: 'Özgeçmişinizin tüm metin içeriğini buraya yapıştırın...',
      submitBtn: 'Uyumluluğu Analiz Et ⚡',
      loading: 'Metin çıkarılıyor ve AI ile analiz ediliyor... ⏳',
      resultsTitle: '📊 ATS Uyumluluk Raporu',
      scoreLabel: 'Uyumluluk Skoru',
      matchingTitle: '✅ Eşleşen Anahtar Kelimeler (Özgeçmişinizde var)',
      missingTitle: '❌ Eksik Anahtar Kelimeler (Eklenmesi önerilir)',
      recTitle: '💡 Yapay Zeka Özgeçmiş İpuçları ve Önerileri',
      noJobs: 'Analiz için uygun iş ilanı bulunmamaktadır.'
    },
    ru: {
      title: '🤖 Сканер резюме ИИ ATS',
      subtitle: 'Загрузите свое резюме и проверьте его совместимость с системами отслеживания кандидатов (ATS) для желаемой работы, с мгновенными советами по оптимизации.',
      selectJob: 'Выберите целевую вакансию',
      selectPlh: '-- Выберите работу из списка --',
      uploadTitle: 'Загрузите ваше резюме (PDF-файл)',
      uploadDesc: 'Перетащите сюда файл резюме (PDF) или нажмите для обзора файлов',
      pasteLabel: 'Или вставьте текст резюме напрямую ниже',
      pastePlh: 'Вставьте полный текстовый контент вашего резюме здесь...',
      submitBtn: 'Анализировать совместимость ⚡',
      loading: 'Извлечение текста и анализ с помощью ИИ... ⏳',
      resultsTitle: '📊 Отчет о совместимости ATS',
      scoreLabel: 'Оценка совместимости',
      matchingTitle: '✅ Соответствующие ключевые слова (Есть в вашем резюме)',
      missingTitle: '❌ Отсутствующие ключевые слова (Рекомендуется добавить)',
      recTitle: '💡 Советы ИИ по оптимизации резюме',
      noJobs: 'Нет доступных вакансий для анализа.'
    },
    fa: {
      title: '🤖 اسکنر رزومه با سیستم ATS',
      subtitle: 'رزومه خود را بارگذاری کنید و میزان همخوانی آن با سیستم‌های فیلترینگ استخدامی (ATS) را بر اساس آگهی شغلی مورد نظرتان بسنجید.',
      selectJob: 'انتخاب آگهی شغلی هدف',
      selectPlh: '-- یک شغل را از لیست انتخاب کنید --',
      uploadTitle: 'بارگذاری رزومه (فایل PDF)',
      uploadDesc: 'فایل رزومه (PDF) خود را به اینجا بکشید یا برای انتخاب کلیک کنید',
      pasteLabel: 'یا متن رزومه خود را مستقیماً در زیر بچسبانید',
      pastePlh: 'متن کامل رزومه خود را اینجا وارد کنید...',
      submitBtn: 'سنجش سازگاری با سیستم ATS ⚡',
      loading: 'در حال استخراج متن رزومه و تحلیل با هوش مصنوعی... ⏳',
      resultsTitle: '📊 گزارش تحلیل سازگاری ATS',
      scoreLabel: 'امتیاز سازگاری رزومه',
      matchingTitle: '✅ کلمات کلیدی موجود (در رزومه شما یافت شد)',
      missingTitle: '❌ کلمات کلیدی غایب (پیشنهاد می‌شود اضافه شوند)',
      recTitle: '💡 توصیه‌های هوش مصنوعی برای بهینه‌سازی رزومه',
      noJobs: 'هیچ آگهی شغلی برای تحلیل در دسترس نیست.'
    },
    ur: {
      title: '🤖 اے آئی سی وی اے ٹی ایس اسکینر',
      subtitle: 'اپنا سی وی اپ لوڈ کریں اور منتخب کردہ نوکری کے اشتہار کے مطابق اس کی اے ٹی ایس (ATS) ہم آہنگی کی شرح جانیں۔',
      selectJob: 'مطلوبہ نوکری کا انتخاب کریں',
      selectPlh: '-- فہرست میں سے نوکری منتخب کریں --',
      uploadTitle: 'سی وی اپ لوڈ کریں (PDF فارمیٹ)',
      uploadDesc: 'سی وی فائل (PDF) کو یہاں ڈریگ کریں یا منتخب کرنے کے لیے کلیک کریں',
      pasteLabel: 'یا اپنے سی وی کا متن نیچے پیسٹ کریں',
      pastePlh: 'اپنے سی وی کا مکمل متن یہاں درج کریں...',
      submitBtn: 'اے ٹی ایس اسکور چیک کریں ⚡',
      loading: 'متن کا تجزیہ اور مطابقت کی جانچ جاری ہے... ⏳',
      resultsTitle: '📊 اے ٹی ایس مطابقت رپورٹ',
      scoreLabel: 'سی وی مطابقت اسکور',
      matchingTitle: '✅ موجودہ کلیدی الفاظ (سی وی میں پائے گئے)',
      missingTitle: '❌ غیر موجود کلیدی الفاظ (شامل کرنے کا مشورہ دیا جاتا ہے)',
      recTitle: '💡 سی وی کی بہتری کے لیے اے آئی کی تجاویز',
      noJobs: 'تجزیہ کے لیے کوئی ملازمت دستیاب نہیں ہے۔'
    }
  }[locale];

  // Fetch all active jobs for the dropdown
  let jobs: any[] = [];
  try {
    const jobRows = await db.prepare(
      `SELECT id, slug, data FROM documents WHERE type_id = 'jobs' AND is_published = 1 AND deleted_at IS NULL ORDER BY created_at DESC`
    ).all();
    jobs = (jobRows.results || []).map((row: any) => {
      const data = JSON.parse(row.data || '{}');
      return {
        id: row.id,
        title: locale === 'ar' ? (data.title_ar || data.title_en) : (data.title_en || data.title_ar)
      };
    });
  } catch (err) {
    console.error('Error fetching jobs for ATS:', err);
  }

  const preselectedJobId = c.req.query('jobId') || '';

  const html = `
    <!-- PDF.js CDN for client-side parsing -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>

    <div class="container" style="max-width: 960px; padding: 60px 20px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.3rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem; max-width: 750px; margin-left: auto; margin-right: auto; line-height:1.6;">${t.subtitle}</p>

      <div class="glass-card" style="padding: 35px; border-radius: var(--radius-lg); margin-bottom: 40px; border:1px solid var(--border)">
        <form id="ats-form">
          <!-- Job Selection -->
          <div style="margin-bottom: 24px; text-align: left;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.selectJob}</label>
            ${jobs.length > 0 ? `
              <select id="job-select" name="jobId" required style="width: 100%; padding: 14px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-card); color: var(--text-dark); font-weight: 600; font-size: 0.95rem; cursor:pointer;">
                <option value="">${t.selectPlh}</option>
                ${jobs.map(j => `<option value="${j.id}" ${j.id === preselectedJobId ? 'selected' : ''}>${j.title}</option>`).join('')}
              </select>
            ` : `<p style="color:var(--danger)">${t.noJobs}</p>`}
          </div>

          <!-- Drag and Drop Box -->
          <div style="margin-bottom: 24px; text-align: left;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.uploadTitle}</label>
            <div id="drop-zone" style="border: 2px dashed var(--primary); border-radius: var(--radius-md); padding: 30px; text-align: center; background: rgba(99,102,241,0.02); cursor: pointer; transition: all 0.2s ease;">
              <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 12px;"></i>
              <div style="font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${t.uploadDesc}</div>
              <input type="file" id="file-input" accept=".pdf" style="display: none;">
              <div id="file-status" style="font-size: 0.85rem; color: var(--primary); font-weight: 700; margin-top: 8px; display: none;"></div>
            </div>
          </div>

          <!-- Textarea (Fallback) -->
          <div style="margin-bottom: 30px; text-align: left;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.pasteLabel}</label>
            <textarea id="cv-text" name="cvText" placeholder="${t.pastePlh}" rows="8" style="width: 100%; padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-card); color: var(--text-dark); resize: vertical; line-height: 1.6;"></textarea>
          </div>

          <button type="submit" id="atsSubmitBtn" class="btn-sidebar-apply" style="border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;" ${jobs.length === 0 ? 'disabled' : ''}>
            ${t.submitBtn}
          </button>
        </form>
      </div>

      <!-- Results Container -->
      <div id="ats-results" class="glass-card" style="display: none; padding: 35px; border-radius: var(--radius-lg); border:1px solid var(--border); animation: fadeIn 0.4s ease;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 28px; border-bottom: 2px solid var(--border); padding-bottom: 12px; text-align: left;">${t.resultsTitle}</h2>
        
        <!-- Score and Gauge -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 40px; margin-bottom: 35px; flex-wrap: wrap;">
          <div style="position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
            <svg style="transform: rotate(-90deg); width: 140px; height: 140px;">
              <circle cx="70" cy="70" r="60" stroke="var(--border)" stroke-width="12" fill="transparent" />
              <circle id="score-circle" cx="70" cy="70" r="60" stroke="var(--primary)" stroke-width="12" fill="transparent" 
                stroke-dasharray="377" stroke-dashoffset="377" style="transition: stroke-dashoffset 1s ease-out;" />
            </svg>
            <div style="position: absolute; display: flex; flex-direction: column; align-items: center;">
              <span id="score-text" style="font-size: 2.2rem; font-weight: 900; color: var(--text-dark); line-height: 1;">0%</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-top: 4px;">${t.scoreLabel}</span>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px;">
          <!-- Matching Keywords -->
          <div style="background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.2); padding: 20px; border-radius: var(--radius-md); text-align: left;">
            <h4 style="font-weight: 800; color: #10b981; margin-bottom: 14px; font-size: 0.95rem;">${t.matchingTitle}</h4>
            <div id="matching-keywords-container" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
          </div>

          <!-- Missing Keywords -->
          <div style="background: rgba(239, 68, 68, 0.03); border: 1px solid rgba(239, 68, 68, 0.2); padding: 20px; border-radius: var(--radius-md); text-align: left;">
            <h4 style="font-weight: 800; color: #ef4444; margin-bottom: 14px; font-size: 0.95rem;">${t.missingTitle}</h4>
            <div id="missing-keywords-container" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
          </div>
        </div>

        <!-- AI Recommendations -->
        <div style="background: rgba(99, 102, 241, 0.03); border: 1px solid rgba(99, 102, 241, 0.15); padding: 24px; border-radius: var(--radius-md); text-align: left;">
          <h4 style="font-weight: 800; color: var(--primary); margin-bottom: 16px; font-size: 1rem; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> ${t.recTitle}</h4>
          <ul id="recommendations-container" style="padding-inline-start: 20px; margin: 0; line-height: 1.8; color: var(--text-dark); display: flex; flex-direction: column; gap: 10px; font-size: 0.92rem;"></ul>
        </div>
      </div>
    </div>

    <script>
      const dropZone = document.getElementById('drop-zone');
      const fileInput = document.getElementById('file-input');
      const fileStatus = document.getElementById('file-status');
      const cvTextarea = document.getElementById('cv-text');
      const form = document.getElementById('ats-form');
      const btn = document.getElementById('atsSubmitBtn');
      const resultsDiv = document.getElementById('ats-results');

      // Click to choose file
      dropZone.addEventListener('click', () => fileInput.click());

      // File drag/drop
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.background = 'rgba(99,102,241,0.06)';
        dropZone.style.borderColor = 'var(--primary-dark)';
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.style.background = 'rgba(99,102,241,0.02)';
        dropZone.style.borderColor = 'var(--primary)';
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = 'rgba(99,102,241,0.02)';
        dropZone.style.borderColor = 'var(--primary)';
        if (e.dataTransfer.files.length > 0) {
          handleFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          handleFile(e.target.files[0]);
        }
      });

      async function handleFile(file) {
        if (file.type !== 'application/pdf') {
          alert("${locale === 'ar' ? 'يرجى تحميل ملف PDF فقط' : 'Please upload a PDF file only'}");
          return;
        }

        fileStatus.innerText = "📄 " + file.name + " (" + Math.round(file.size / 1024) + " KB)";
        fileStatus.style.display = 'block';

        // Extract PDF text
        try {
          const text = await extractTextFromPdf(file);
          cvTextarea.value = text;
        } catch (err) {
          console.error(err);
          alert("${locale === 'ar' ? 'حدث خطأ أثناء استخراج النص من الملف. يمكنك لصق السيرة الذاتية يدوياً.' : 'Failed to extract text from PDF. You can still paste it manually.'}");
        }
      }

      async function extractTextFromPdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          text += pageText + '\\n';
        }
        return text;
      }

      // Submit form
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const jobId = document.getElementById('job-select').value;
        const cvText = cvTextarea.value.trim();

        if (!jobId || !cvText) {
          alert("${locale === 'ar' ? 'الرجاء اختيار وظيفة وكتابة أو رفع سيرة ذاتية' : 'Please select a job and provide CV content'}");
          return;
        }

        btn.innerText = "${t.loading}";
        btn.disabled = true;

        try {
          const res = await fetch('/api/candidate/ats-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, cvText })
          });

          const data = await res.json();
          if (res.ok && data.success) {
            // Display score gauge
            const circle = document.getElementById('score-circle');
            const scoreText = document.getElementById('score-text');
            const score = data.score || 0;
            
            // stroke-dasharray = 2 * PI * r = 2 * 3.14159 * 60 = 377
            const offset = 377 - (377 * score) / 100;
            circle.style.strokeDashoffset = offset;
            
            // Animate score number
            let curr = 0;
            const interval = setInterval(() => {
              if (curr >= score) {
                scoreText.innerText = score + '%';
                clearInterval(interval);
              } else {
                curr++;
                scoreText.innerText = curr + '%';
              }
            }, 10);

            // Keywords matching
            const matchContainer = document.getElementById('matching-keywords-container');
            matchContainer.innerHTML = data.matchingKeywords.length > 0 
              ? data.matchingKeywords.map(k => \`<span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 700; border: 1px solid rgba(16,185,129,0.15)">\${k}</span>\`).join('')
              : '<span style="color:var(--text-muted);font-size:0.8rem">None</span>';

            // Keywords missing
            const missContainer = document.getElementById('missing-keywords-container');
            missContainer.innerHTML = data.missingKeywords.length > 0 
              ? data.missingKeywords.map(k => \`<span style="background: rgba(239,68,68,0.1); color: #ef4444; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 700; border: 1px solid rgba(239,68,68,0.15)">\${k}</span>\`).join('')
              : '<span style="color:var(--text-muted);font-size:0.8rem">None</span>';

            // Recommendations
            const recContainer = document.getElementById('recommendations-container');
            recContainer.innerHTML = data.recommendations.map(r => \`<li>\${r}</li>\`).join('');

            // Show results section
            resultsDiv.style.display = 'block';
            resultsDiv.scrollIntoView({ behavior: 'smooth' });

          } else {
            alert(data.error || "${locale === 'ar' ? 'فشل فحص السيرة ذاتية.' : 'Analysis failed.'}");
          }
        } catch (err) {
          console.error(err);
          alert("${locale === 'ar' ? 'فشل الاتصال بالخادم.' : 'Connection error.'}");
        } finally {
          btn.innerText = "${t.submitBtn}";
          btn.disabled = false;
        }
      });
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// Turkish Workplace Language Quiz Page
aiFeaturesRouter.get('/:locale/workplace-quiz', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/workplace-quiz');

  const t = {
    ar: {
      title: 'اختبار لغة العمل التركية للمغتربين',
      subtitle: 'اختبر معرفتك بأهم العبارات والمصطلحات التركية المستخدمة يومياً في بيئة العمل بإسطنبول لزيادة فرص اندماجك وتجنب سوء الفهم.',
      startBtn: 'ابدأ الاختبار الآن ✍️',
      nextBtn: 'السؤال التالي ←',
      finishBtn: 'عرض النتيجة النهائية 🏆',
      restartBtn: 'إعادة المحاولة 🔄',
      scoreTitle: 'نتيجتك النهائية:',
      rankLabel: 'مستواك في مكاتب إسطنبول:',
      rankG: 'خبير مكاتب إسطنبول (Guru) 🏆',
      rankM: 'موظف محترف (Mid-Level) 💼',
      rankJ: 'متدرب مكتب (Intern) 📁',
      rankN: 'مبتدئ تماماً (Novice) 🚶‍♂️',
      correct: 'إجابة صحيحة! 🎉',
      incorrect: 'إجابة خاطئة! ❌ الإجابة الصحيحة هي: '
    },
    en: {
      title: 'Turkish Workplace Language Quiz',
      subtitle: 'Test your knowledge of essential Turkish phrases used daily in Istanbul office environments to boost integration and career success.',
      startBtn: 'Start the Quiz ✍️',
      nextBtn: 'Next Question ←',
      finishBtn: 'View Final Score 🏆',
      restartBtn: 'Try Again 🔄',
      scoreTitle: 'Your Final Score:',
      rankLabel: 'Your Office Rank:',
      rankG: 'Istanbul Office Guru 🏆',
      rankM: 'Professional Employee 💼',
      rankJ: 'Office Intern 📁',
      rankN: 'Absolute Novice 🚶‍♂️',
      correct: 'Correct Answer! 🎉',
      incorrect: 'Incorrect! The correct answer is: '
    },
    tr: {
      title: 'İş Yeri Kültür ve Dil Testi',
      subtitle: 'Uyumunuzu artırmak ve olası yanlış anlaşılmaları önlemek için İstanbul iş hayatında günlük olarak kullanılan temel Türkçe kalıpları test edin.',
      startBtn: 'Testi Başlat ✍️',
      nextBtn: 'Sıradaki Soru ←',
      finishBtn: 'Sonucu Gör 🏆',
      restartBtn: 'Yeniden Dene 🔄',
      scoreTitle: 'Final Skorunuz:',
      rankLabel: 'Ofis Dereceniz:',
      rankG: 'İstanbul Ofis Gurusu 🏆',
      rankM: 'Profesyonel Çalışan 💼',
      rankJ: 'Ofis Stajyeri 📁',
      rankN: 'Yeni Başlayan 🚶‍♂️',
      correct: 'Doğru Cevap! 🎉',
      incorrect: 'Yanlış Cevap! ❌ Doğru Cevap: '
    },
    ru: {
      title: 'Тест на знание культуры турецкого офиса',
      subtitle: 'Проверьте свои знания повседневных турецких фраз и корпоративной культуры для успешной интеграции и предотвращения недоразумений.',
      startBtn: 'Начать тест ✍️',
      nextBtn: 'Следующий вопрос ←',
      finishBtn: 'Показать результат 🏆',
      restartBtn: 'Попробовать снова 🔄',
      scoreTitle: 'Ваш итоговый балл:',
      rankLabel: 'Ваш статус в офисе:',
      rankG: 'Гуру офиса в Стамбуле 🏆',
      rankM: 'Профессиональный сотрудник 💼',
      rankJ: 'Офисный стажер 📁',
      rankN: 'Новичок 🚶‍♂️',
      correct: 'Верно! 🎉',
      incorrect: 'Неверно! Правильный ответ: '
    },
    fa: {
      title: 'آزمون اصطلاحات کاری ترکی و آداب معاشرت اداری',
      subtitle: 'دانش خود را از عبارات پرکاربرد ترکی در محیط کار و فرهنگ سازمانی شرکت‌های ترکی بسنجید.',
      startBtn: 'شروع آزمون ✍️',
      nextBtn: 'سوال بعدی ←',
      finishBtn: 'مشاهده نتیجه نهایی 🏆',
      restartBtn: 'تلاش مجدد 🔄',
      scoreTitle: 'امتیاز نهایی شما:',
      rankLabel: 'سطح شما در محیط کار:',
      rankG: 'استاد فرهنگ کار ترکیه 🏆',
      rankM: 'کارمند حرفه‌ای و باسابقه 💼',
      rankJ: 'کارآموز تازه وارد 📁',
      rankN: 'تازه‌کار و بدون تجربه 🚶‍♂️',
      correct: 'پاسخ صحیح! 🎉',
      incorrect: 'پاسخ اشتباه! پاسخ صحیح این بود: '
    },
    ur: {
      title: 'ترک دفتری آداب اور زبان کا کوئز',
      subtitle: 'ترکی کے کاروباری ماحول، دفتری کلچر اور روزمرہ کے دفتری جملوں کے بارے میں اپنی معلومات کی جانچ کریں۔',
      startBtn: 'کوئز شروع کریں ✍️',
      nextBtn: 'اگلا سوال ←',
      finishBtn: 'حتمی نتیجہ دیکھیں 🏆',
      restartBtn: 'دوبارہ کوشش کریں 🔄',
      scoreTitle: 'آپ کا حتمی اسکور:',
      rankLabel: 'دفتری ماحول میں آپ کی سطح:',
      rankG: 'ترکی دفتری کلچر کا ماہر 🏆',
      rankM: 'تجربہ کار اور باصلاحیت ملازم 💼',
      rankJ: 'اوفس انٹرن (نوزائیدہ ملازم) 📁',
      rankN: 'بالکل اناڑی / نیا 🚶‍♂️',
      correct: 'درست جواب! 🎉',
      incorrect: 'غلط جواب! درست جواب یہ تھا: '
    }
  }[locale];

  const questions = [
    {
      q: locale === 'ar' ? 'ماذا تعني عبارة "Kolay gelsin" ومتى تستخدم في بيئة العمل؟' : 'What does "Kolay gelsin" mean and when is it used?',
      options: locale === 'ar' 
        ? ['تمني وجبة شهية للزملاء', 'تمني التيسير والسهولة في العمل الحالي للزميل', 'وداع الزملاء في نهاية الدوام', 'تحية الصباح الباكر']
        : ['Wishing a good meal to coworkers', 'Wishing someone ease in their current work', 'Saying goodbye at the end of the shift', 'Early morning greeting'],
      correct: 1,
      explain: locale === 'ar' ? 'تقال لمن يعمل لتمني التيسير له في عمله (مثال: عند المرور بزميل يكتب تقريراً أو ينظف المكتب).' : 'Said to someone working to wish them ease in their task (e.g. passing a colleague writing a report).'
    },
    {
      q: locale === 'ar' ? 'ما هو الرد المناسب عندما يقول لك زميلك في العمل "Geçmiş olsun" بسبب مرضك؟' : 'What is the correct response when a colleague says "Geçmiş olsun" to you?',
      options: locale === 'ar'
        ? ['Sağ ol / Teşekkür ederim (شكراً لك)', 'Kolay gelsin (سهل الله عملك)', 'Rica ederim (على الرحب والسعة)', 'Afiyet olsun (بالعافية)']
        : ['Sağ ol / Teşekkür ederim (Thank you)', 'Kolay gelsin (Ease in your work)', 'Rica ederim (You are welcome)', 'Afiyet olsun (Bon appetit)'],
      correct: 0,
      explain: locale === 'ar' ? 'يعني التعبير "أتمنى أن يزول عنك هذا المرض/البلاء"، والرد الصحيح هو الشكر.' : 'The expression means "May it pass/Get well soon", and the correct response is gratitude.'
    },
    {
      q: locale === 'ar' ? 'أي من العبارات التالية تقال للزميل الذي يتناول طعام الغداء؟' : 'Which phrase is used to wish a coworker a good meal?',
      options: locale === 'ar'
        ? ['Kolay gelsin', 'Afiyet olsun', 'Eline sağlık', 'Geçmiş olsun']
        : ['Kolay gelsin', 'Afiyet olsun', 'Eline sağlık', 'Geçmiş olsun'],
      correct: 1,
      explain: locale === 'ar' ? 'تعني "بالهناء والشفاء" أو "بالعافية" وتستخدم لتمني هضم هنيء للطعام.' : 'Means "Bon appetit" or "Enjoy your meal".'
    },
    {
      q: locale === 'ar' ? 'كيف تثني على زميلك الذي أنجز مهمة يدوية أو عملية صعبة بمجهوده؟' : 'How do you praise a colleague who completed a hands-on task or cooked/built something?',
      options: locale === 'ar'
        ? ['Çok yaşa', 'Geçmiş olsun', 'Eline sağlık', 'Kolay gelsin']
        : ['Çok yaşa', 'Geçmiş olsun', 'Eline sağlık', 'Kolay gelsin'],
      correct: 2,
      explain: locale === 'ar' ? 'تعني "تسلم يداك" وتقال تقديراً لأي عمل تم القيام به يدوياً وبمجهود شخصي.' : 'Means "Health to your hands" and is said in appreciation of hands-on work.'
    },
    {
      q: locale === 'ar' ? 'عند دخولك المكتب صباحاً لبدء يوم عمل جديد، ما هي التحية الرسمية المعتادة؟' : 'What is the most standard greeting when entering the office in the morning?',
      options: locale === 'ar'
        ? ['Günaydın / İyi çalışmalar', 'Görüşürüz', 'Başarılar', 'Hoş bulduk']
        : ['Günaydın / İyi çalışmalar', 'Görüşürüz', 'Başarılar', 'Hoş bulduk'],
      correct: 0,
      explain: locale === 'ar' ? 'تعني "صباح الخير / أتمنى لكم عملاً جيداً وسهلاً".' : 'Means "Good morning / Have a good working day".'
    }
  ];

  void questions;

  const html = `
    <style>
      .quiz-container {
        max-width: 650px;
        margin: 60px auto 100px;
        padding: 20px;
      }
      .option-card {
        padding: 16px 20px;
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        background: var(--bg-site);
        color: var(--text-dark);
        margin-bottom: 12px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .option-card:hover {
        background: var(--bg-subtle);
        border-color: var(--primary);
      }
      .option-card.correct {
        background: #dcfce7 !important;
        border-color: #22c55e !important;
        color: #166534 !important;
      }
      .option-card.correct span {
        color: #166534 !important;
      }
      .option-card.incorrect {
        background: #fee2e2 !important;
        border-color: #ef4444 !important;
        color: #991b1b !important;
      }
      .option-card.incorrect span {
        color: #991b1b !important;
      }
      .progress-bar-fill {
        height: 6px;
        background: var(--primary);
        border-radius: var(--r-full);
        transition: width 0.3s ease;
      }
    </style>

    <div class="quiz-container">
      <div id="quiz-intro" class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: center;">
        <div style="font-size: 3.5rem; margin-bottom: 20px;">🇹🇷</div>
        <h1 class="hero-title-gradient" style="margin-bottom: 12px; font-size: 2.2rem; font-weight: 800;">${t.title}</h1>
        <p style="color: var(--text-muted); font-size: 1.05rem; margin-bottom: 30px; line-height: 1.6;">${t.subtitle}</p>
        <button onclick="startQuiz()" class="btn-sidebar-apply" style="border: none; max-width: 250px; margin: 0 auto;">${t.startBtn}</button>
      </div>

      <div id="quiz-play" class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); display: none;">
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">
          <span id="question-index">Question 1 of 5</span>
          <span id="score-tracker">Score: 0</span>
        </div>
        <div style="width: 100%; height: 6px; background: var(--border); border-radius: var(--r-full); margin-bottom: 30px;">
          <div id="progress-fill" class="progress-bar-fill" style="width: 20%;"></div>
        </div>

        <h3 id="question-text" style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin-bottom: 24px; line-height: 1.5;">--</h3>

        <div id="options-container"></div>

        <div id="feedback-box" style="display: none; padding: 16px; border-radius: var(--radius-md); margin-top: 20px; font-size: 0.9rem; line-height: 1.6;"></div>

        <button id="next-btn" onclick="nextQuestion()" class="btn-sidebar-apply" style="border: none; margin-top: 30px; display: none;">${t.nextBtn}</button>
      </div>

      <div id="quiz-result" class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: center; display: none;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🏆</div>
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-dark); margin-bottom: 24px;">${locale === 'ar' ? 'اكتمل الاختبار!' : 'Quiz Completed!'}</h2>
        
        <div style="margin-bottom: 30px;">
          <span style="font-size: 1.1rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 8px;">${t.scoreTitle}</span>
          <span id="final-score" style="font-size: 3.5rem; font-weight: 900; color: var(--primary);">4 / 5</span>
        </div>

        <div style="margin-bottom: 40px; background: rgba(0,0,0,0.02); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border);">
          <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 6px;">${t.rankLabel}</span>
          <div id="final-rank" style="font-size: 1.3rem; font-weight: 800; color: var(--text-dark);">--</div>
        </div>

        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <button onclick="restartQuiz()" class="btn-sidebar-apply" style="border: none; background: var(--bg-subtle); color: var(--text-dark); max-width: 200px; margin: 0;">${t.restartBtn}</button>
          <a href="/${locale}" class="btn-sidebar-apply" style="border: none; max-width: 200px; margin: 0; text-decoration: none; display: flex; align-items: center; justify-content: center;">
            ${locale === 'ar' ? 'تصفح الوظائف 💼' : 'Browse Jobs 💼'}
          </a>
        </div>
      </div>

      <!-- Turkish Workplace Vocabulary Cheat Sheet -->
      <div class="glass-card" style="margin-top: 40px; padding: 40px; border-radius: var(--radius-lg); text-align: ${locale === 'ar' ? 'right' : 'left'};">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
          📖 ${locale === 'ar' ? 'قاموس مصطلحات العمل التركية اليومية' : 'Essential Turkish Workplace Vocabulary'}
        </h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 24px; line-height: 1.5;">
          ${locale === 'ar' 
            ? 'إليك قائمة بأهم المفردات والعبارات الأكثر استخداماً في المكاتب والشركات التركية مع معانيها باللغتين العربية والإنجليزية لتبدأ يومك بثقة:' 
            : 'Here is a curated list of the most common terms and phrases used in Turkish office environments with their English and Arabic translations to help you get started:'}
        </p>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">Kolay gelsin</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: سهل الله عملك / طاب يومك (تقال لشخص يعمل)</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: May it come easy (said to someone working)</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">İyi çalışmalar</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: أتمنى لك عملاً موفقاً (تحية رسمية للزملاء)</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: Have a good work / Good day at work</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">Eline sağlık</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: تسلم يداك (تقال لمن صنع أو أنجز شيئاً يدوياً)</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: Health to your hands (said in appreciation of labor)</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">Afiyet olsun</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: بالهناء والشفاء / بالعافية (تمني وجبة هنيئة)</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: Enjoy your meal / Bon appetit</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">Geçmiş olsun</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: سلامتك / أتمنى لك الشفاء العاجل (للمريض أو المصاب)</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: Get well soon / May it pass</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">Görüşmek üzere</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: إلى اللقاء / أراك لاحقاً</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: See you soon / Goodbye</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">Rica ederim</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: على الرحب والسعة / العفو (رد على الشكر)</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: You are welcome / Not at all</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">Toplantı</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: اجتماع عمل</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: Business Meeting</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">Müşteri</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: عميل / زبون</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: Client / Customer</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">Maaş</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: راتب شهري</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: Salary</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; gap: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: var(--primary-light); color: var(--primary); font-weight: 800; padding: 4px 10px; border-radius: var(--r-sm); font-size: 0.9rem; font-family: sans-serif;">İzin</span>
            </div>
            <div style="font-size: 0.88rem; color: var(--text-dark); display: flex; flex-direction: column; gap: 2px; align-items: ${locale === 'ar' ? 'flex-start' : 'flex-end'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <span style="font-weight: 600;">العربية: إجازة / إذن غياب</span>
              <span style="color: var(--text-muted); font-size: 0.8rem;">English: Leave / Permit</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <script>
      const questions = ${JSON.stringify(questions)};
      let currentIdx = 0;
      let score = 0;
      let answered = false;

      function startQuiz() {
        document.getElementById('quiz-intro').style.display = 'none';
        document.getElementById('quiz-play').style.display = 'block';
        showQuestion();
      }

      function showQuestion() {
        answered = false;
        const qData = questions[currentIdx];
        
        document.getElementById('question-index').textContent = \`${locale === 'ar' ? 'السؤال' : 'Question'} \${currentIdx + 1} ${locale === 'ar' ? 'من' : 'of'} 5\`;
        document.getElementById('score-tracker').textContent = \`Score: \${score}\`;
        document.getElementById('progress-fill').style.width = \`\${(currentIdx + 1) * 20}%\`;

        document.getElementById('question-text').textContent = qData.q;

        const optContainer = document.getElementById('options-container');
        optContainer.innerHTML = '';
        
        qData.options.forEach((opt, idx) => {
          const card = document.createElement('div');
          card.className = 'option-card';
          card.innerHTML = \`<span>\${String.fromCharCode(65 + idx)})</span> <span>\${opt}</span>\`;
          card.onclick = () => selectOption(idx, card);
          optContainer.appendChild(card);
        });

        document.getElementById('feedback-box').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
      }

      function selectOption(selectedIdx, cardEl) {
        if (answered) return;
        answered = true;
        
        const qData = questions[currentIdx];
        const isCorrect = selectedIdx === qData.correct;
        const optCards = document.querySelectorAll('.option-card');

        if (isCorrect) {
          score++;
          cardEl.classList.add('correct');
          showFeedback(true, qData.explain);
        } else {
          cardEl.classList.add('incorrect');
          optCards[qData.correct].classList.add('correct');
          showFeedback(false, qData.explain, qData.options[qData.correct]);
        }

        const nextBtn = document.getElementById('next-btn');
        if (currentIdx === questions.length - 1) {
          nextBtn.textContent = "${t.finishBtn}";
        } else {
          nextBtn.textContent = "${t.nextBtn}";
        }
        nextBtn.style.display = 'block';
      }

      function showFeedback(isCorrect, explanation, correctOpt) {
        const box = document.getElementById('feedback-box');
        if (isCorrect) {
          box.style.background = '#f0fdf4';
          box.style.border = '1px solid #bbf7d0';
          box.style.color = '#166534';
          box.innerHTML = \`<strong>${t.correct}</strong><br>\${explanation}\`;
        } else {
          box.style.background = '#fef2f2';
          box.style.border = '1px solid #fca5a5';
          box.style.color = '#991b1b';
          box.innerHTML = \`<strong>${t.incorrect} "\${correctOpt}"</strong><br>\${explanation}\`;
        }
        box.style.display = 'block';
      }

      function nextQuestion() {
        if (currentIdx < questions.length - 1) {
          currentIdx++;
          showQuestion();
        } else {
          showResults();
        }
      }

      function showResults() {
        document.getElementById('quiz-play').style.display = 'none';
        document.getElementById('quiz-result').style.display = 'block';

        document.getElementById('final-score').textContent = \`\${score} / 5\`;
        
        let rankText = '';
        if (score === 5) {
          rankText = "${t.rankG}";
        } else if (score >= 3) {
          rankText = "${t.rankM}";
        } else if (score >= 1) {
          rankText = "${t.rankJ}";
        } else {
          rankText = "${t.rankN}";
        }
        document.getElementById('final-rank').textContent = rankText;
      }

      function restartQuiz() {
        currentIdx = 0;
        score = 0;
        document.getElementById('quiz-result').style.display = 'none';
        document.getElementById('quiz-play').style.display = 'block';
        showQuestion();
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// Interactive Work Permit Eligibility Wizard 2026
aiFeaturesRouter.get('/:locale/work-permit-eligibility', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') {
    return c.redirect('/ar/work-permit-eligibility');
  }

  const dict: Record<string, any> = {
    ar: {
      title: 'حاسبة واختبار أهلية إذن العمل في تركيا 2026 🇹🇷',
      subtitle: 'أداة تفاعلية حاسمة لتحليل أهليتك الحصول على إذن العمل أو الإعفاء، وحساب الرسوم والحد الأدنى للأجور بدقة خلال 4 خطوات بسيطة.',
      step1: '1. الجنسية والوضع القانوني',
      step2: '2. نوع وملاحية الإقامة',
      step3: '3. المهنة والدرجة العلمية',
      step4: '4. حالة الشركة الكفيلة',
      prevBtn: 'السابق',
      nextBtn: 'التالي ←',
      submitBtn: 'عرض التقرير وحساب الأهلية 🎯',
      restartBtn: 'إعادة الاختبار 🔄',
      q1Title: 'ما هي جنسيتك ووضعك القانوني الحالي في تركيا؟',
      q1Syrian: 'سوريا (حامل بطاقة الحماية المؤقتة - الكيمليك 99)',
      q1Egyptian: 'مصر / العراق / اليمن / فلسطين / الأردن / المغرب العربي',
      q1OtherArab: 'جنسية عربية أو أجنبية أخرى بإقامة نظامية',
      q1Overseas: 'خارج تركيا (التقديم عبر السفارة التركية بالخارج)',
      q2Title: 'ما هو نوع بطاقة الإقامة الحالية والمدة المتبقية بها؟',
      q2Tourist6: 'إقامة سياحية أو عقارية (متبقي 6 أشهر أو أكثر)',
      q2TouristLess: 'إقامة سياحية (متبقي أقل من 6 أشهر)',
      q2Kimlik: 'بطاقة حماية مؤقتة (كيمليك 99 نشطة بنفس ولاية العمل)',
      q2KimlikDiff: 'بطاقة حماية مؤقتة في ولاية أخرى غير ولاية الشركة',
      q2None: 'لا أملك بطاقة إقامة حالياً في تركيا',
      q3Title: 'ما هو مجال عملك أو مسمى الوظيفة المستهدفة؟',
      q3Tech: 'مهندس / مبرمج / تكنولوجيا المعلومات / مدير مشروع',
      q3Teacher: 'مدرس / محاضر أكاديمي / معلم لغات',
      q3Medical: 'طبيب / ممرض / كادر صحي تخصصي',
      q3CallCenter: 'خدمة عملاء / مبيعات / مراكز اتصال (Call Center)',
      q3Services: 'عمالة فنية / خدمات عامة / رعاية منزلية',
      q3Investor: 'مستثمر / تأسيس شركة خاصة',
      q4Title: 'ما هي حالة الشركة أو المؤسسة الموظِّفة؟',
      q4Ratio5: 'الشركة تعين 5 عمال أتراك مسجلين مقابل كل أجنبي',
      q4RatioLess: 'الشركة لا تملك 5 أتراك حالياً (أو شركة ناشئة)',
      q4NewCo: 'أرغب في تأسيس شركتي الخاصة (رأس مال 500 ألف ليرة)',
      q4NotSure: 'غير متأكد من حالة الشركة الكفيلة',
      resultTitle: 'نتيجة تحليل الأهلية والتقرير القانوني 2026',
      eligibleTitle: '🟢 مؤهل رسمياً للحصول على تصريح العمل / الإعفاء',
      condTitle: '🟡 مؤهل بشروط مشروطة (يتطلب استيفاء معايير إضافية)',
      ineligibleTitle: '🔴 غير مؤهل حالياً (يتطلب تعديل الوضع أو التقديم من الخارج)',
      feeHeader: 'الرسوم والحد الأدنى للأجور المطلوب لعام 2026:',
      docsHeader: 'الأوراق والمستندات المطلوبة للتقديم:',
      warningHeader: '⚠️ نقاط هامة لتجنب الرفض:',
      ctaJobs: 'تصفح الوظائف التي تقدم إذناً للعمل ←',
      ctaGuide: 'قراءة دليل إذن العمل الشامل 2026 📖',
      ctaAts: 'افحص سيرتك الذاتية بفاحص ATS 🤖'
    },
    en: {
      title: 'Interactive Work Permit Eligibility Wizard 2026 🇹🇷',
      subtitle: 'Analyze your legal eligibility for a Turkish Work Permit or e-Devlet Exemption, calculate 2026 official fees, and view required documents in 4 steps.',
      step1: '1. Nationality & Status',
      step2: '2. Residency & Validity',
      step3: '3. Occupation & Degree',
      step4: '4. Sponsoring Company',
      prevBtn: 'Previous',
      nextBtn: 'Next Step →',
      submitBtn: 'Calculate Eligibility & View Report 🎯',
      restartBtn: 'Restart Assessment 🔄',
      q1Title: 'What is your nationality and current legal status in Turkey?',
      q1Syrian: 'Syrian National (Temporary Protection Kimlik 99 holder)',
      q1Egyptian: 'Egyptian / Iraqi / Yemeni / Palestinian / Jordanian / Maghreb',
      q1OtherArab: 'Other Arab or International Expat with valid residency',
      q1Overseas: 'Outside Turkey (Applying via Turkish Embassy overseas)',
      q2Title: 'What type of residency card do you hold and its remaining validity?',
      q2Tourist6: 'Tourist or Real Estate Residency (6+ months validity remaining)',
      q2TouristLess: 'Tourist Residency (Less than 6 months validity remaining)',
      q2Kimlik: 'Active Temporary Protection Kimlik 99 (Same province as job)',
      q2KimlikDiff: 'Kimlik 99 registered in a different province than company',
      q2None: 'No Turkish residency card currently held',
      q3Title: 'What is your field of work or target job title?',
      q3Tech: 'Software Engineer / IT Specialist / Project Manager',
      q3Teacher: 'Teacher / Academic Lecturer / Language Instructor',
      q3Medical: 'Doctor / Nurse / Healthcare Professional',
      q3CallCenter: 'Customer Support / Sales / Call Center Agent',
      q3Services: 'Skilled Technician / General Services / Home Care',
      q3Investor: 'Investor / Setting Up a Private Company',
      q4Title: 'What is the status of your sponsoring company in Turkey?',
      q4Ratio5: 'Company employs 5+ registered Turkish citizens per foreign worker',
      q4RatioLess: 'Company currently has fewer than 5 Turkish employees',
      q4NewCo: 'Planning to establish a new company (500k TRY capital)',
      q4NotSure: 'Not sure about the sponsoring company\'s status',
      resultTitle: 'Eligibility Analysis & 2026 Legal Report',
      eligibleTitle: '🟢 Officially Eligible for Work Permit / Exemption',
      condTitle: '🟡 Conditionally Eligible (Requires Fulfilling Extra Criteria)',
      ineligibleTitle: '🔴 Currently Ineligible (Action Required Before Filing)',
      feeHeader: '2026 Official Fees & Salary Requirements:',
      docsHeader: 'Required Application Documents:',
      warningHeader: '⚠️ Key Warning to Avoid Rejection:',
      ctaJobs: 'Browse Work Permit-Sponsored Jobs ←',
      ctaGuide: 'Read Full 2026 Work Permit Guide 📖',
      ctaAts: 'Optimize Resume with ATS Scanner 🤖'
    },
    tr: {
      title: 'Çalışma İzni Uygunluk Değerlendirme Sihirbazı 2026 🇹🇷',
      subtitle: 'Türkiye çalışma izni veya e-Devlet muafiyet uygunluğunuzu analiz edin, 2026 harç ve asgari ücret katlarını 4 adımda hesaplayın.',
      step1: '1. Uyruk ve Yasal Durum',
      step2: '2. İkamet Türü ve Süresi',
      step3: '3. Meslek ve Eğitim',
      step4: '4. Sponsor Şirket Durumu',
      prevBtn: 'Önceki',
      nextBtn: 'Sonraki Adım →',
      submitBtn: 'Uygunluğu Hesapla ve Raporla 🎯',
      restartBtn: 'Yeniden Başlat 🔄',
      q1Title: 'Türkiye\'deki uyruğunuz ve mevcut yasal durumunuz nedir?',
      q1Syrian: 'Suriye Uyruklu (Geçici Koruma 99 Kimlik Sahibi)',
      q1Egyptian: 'Mısır / Irak / Yemen / Filistin / Ürdün / Mağrip',
      q1OtherArab: 'Diğer Yabancı Ülke Vatandaşı (Geçerli İkametli)',
      q1Overseas: 'Türkiye Dışında (Yurt Dışı Elçilik Başvurusu)',
      q2Title: 'Mevcut ikamet kartınızın türü ve kalan geçerlilik süresi nedir?',
      q2Tourist6: 'Turistik veya Taşınmaz İkameti (6 ay veya daha fazla geçerli)',
      q2TouristLess: 'Turistik İkamet (6 aydan az geçerlilik kalmış)',
      q2Kimlik: 'Geçici Koruma Kimliği (Şirket ile aynı ilde kayıtlı)',
      q2KimlikDiff: 'Farklı bir ilde kayıtlı Geçici Koruma Kimliği',
      q2None: 'Şu an Türkiye ikamet kartım yok',
      q3Title: 'Mesleğiniz veya hedeflediğiniz pozisyon nedir?',
      q3Tech: 'Yazılım Mühendisi / IT Uzmanı / Proje Yöneticisi',
      q3Teacher: 'Öğretmen / Akademisyen / Dil Eğitmeni',
      q3Medical: 'Doktor / Hemşire / Sağlık Personeli',
      q3CallCenter: 'Müşteri Hizmetleri / Satış / Çağrı Merkezi',
      q3Services: 'Vasıflı Tekniker / Genel Hizmetler / Evde Bakım',
      q3Investor: 'Yatırımcı / Kendi Şirketini Kurma',
      q4Title: 'Sponsor olan şirketin mevcut durumu nedir?',
      q4Ratio5: 'Şirket her yabancı için 5 Türk vatandaşı çalıştırıyor',
      q4RatioLess: 'Şirkette henüz 5 Türk çalışan yok',
      q4NewCo: 'Kendi şirketimi kuracağım (500 Bin TL sermaye)',
      q4NotSure: 'Sponsor şirketin durumundan emin değilim',
      resultTitle: 'Uygunluk Analizi ve 2026 Yasal Raporu',
      eligibleTitle: '🟢 Çalışma İzni / Muafiyeti İçin Resmen Uygun',
      condTitle: '🟡 Koşullu Uygun (Ek Şartların Sağlanması Gerekli)',
      ineligibleTitle: '🔴 Şu An Uygun Değil (Ön Hazırlık Veya Yurt Dışı Başvurusu Gerekli)',
      feeHeader: '2026 Resmi Harçlar ve Maaş Katları:',
      docsHeader: 'Gerekli Başvuru Evrakları:',
      warningHeader: '⚠️ Reddi Önlemek İçin Kritik Uyarılar:',
      ctaJobs: 'İzin Sponsorlu İş İlanlarını İncele ←',
      ctaGuide: '2026 Çalışma İzni Rehberini Oku 📖',
      ctaAts: 'CV\'ni ATS İle Ücretsiz Tara 🤖'
    },
    ru: {
      title: 'Интерактивный тест на разрешение на работу в Турции 2026 🇹🇷',
      subtitle: 'Проверьте право на получение разрешения на работу или освобождения e-Devlet, рассчитайте сборы 2026 года за 4 простых шага.',
      step1: '1. Гражданство и статус',
      step2: '2. Вид на жительство',
      step3: '3. Профессия',
      step4: '4. Статус компании',
      prevBtn: 'Назад',
      nextBtn: 'Далее →',
      submitBtn: 'Рассчитать и показать отчет 🎯',
      restartBtn: 'Пройти снова 🔄',
      q1Title: 'Какое у вас гражданство и текущий статус в Турции?',
      q1Syrian: 'Гражданин Сирии (Временная защита, Кимлик 99)',
      q1Egyptian: 'Египет / Ирак / Йемен / Палестина / Иордания',
      q1OtherArab: 'Другое гражданство с действующим ВНЖ',
      q1Overseas: 'За пределами Турции (подача через посольство)',
      q2Title: 'Какой у вас тип ВНЖ и оставшийся срок действия?',
      q2Tourist6: 'Туристический ВНЖ (осталось 6+ месяцев)',
      q2TouristLess: 'Туристический ВНЖ (осталось менее 6 месяцев)',
      q2Kimlik: 'Кимлик 99 (зарегистрирован в той же провинции)',
      q2KimlikDiff: 'Кимлик 99 (зарегистрирован в другой провинции)',
      q2None: 'Нет действующего ВНЖ в Турции',
      q3Title: 'Какая у вас специальность или целевая должность?',
      q3Tech: 'Инженер / IT-специалист / Менеджер проектов',
      q3Teacher: 'Преподаватель / Учитель языков',
      q3Medical: 'Врач / Медсестра / Медицинский персонал',
      q3CallCenter: 'Служба поддержки / Продажи / Колл-центр',
      q3Services: 'Техник / Общий персонал / Уход',
      q3Investor: 'Инвестор / Открытие собственной компании',
      q4Title: 'Каков статус компании-работодателя?',
      q4Ratio5: 'В компании работает 5 турецких граждан на 1 иностранца',
      q4RatioLess: 'В компании менее 5 турецких сотрудников',
      q4NewCo: 'Планирую открыть компанию (уставный капитал 500 тыс. лир)',
      q4NotSure: 'Не уверен в статусе компании',
      resultTitle: 'Анализ соответствия и отчет 2026',
      eligibleTitle: '🟢 Официально подходит для разрешения / освобождения',
      condTitle: '🟡 Подходит с условиями (требуется выполнение критериев)',
      ineligibleTitle: '🔴 Не подходит в настоящее время',
      feeHeader: 'Официальные сборы и зарплатные коэфф. 2026:',
      docsHeader: 'Необходимые документы:',
      warningHeader: '⚠️ Важное предупреждение:',
      ctaJobs: 'Вакансии с разрешением на работу ←',
      ctaGuide: 'Читать руководство по разрешению 📖',
      ctaAts: 'Проверить резюме в ATS 🤖'
    },
    fa: {
      title: 'محاسبه‌گر آنلاین واجد شرایط بودن اجازه کار ترکیه 2026 🇹🇷',
      subtitle: 'تحلیل واجد شرایط بودن برای دریافت اجازه کار یا معافیت e-Devlet و محاسبه هزینه‌های رسمی 2026 در 4 مرحله.',
      step1: '۱. ملیت و وضعیت قانونی',
      step2: '۲. نوع اقامت و اعتبار',
      step3: '۳. شغل و مدرک تحصیلی',
      step4: '۴. وضعیت شرکت اسپانسر',
      prevBtn: 'قبلی',
      nextBtn: 'مرحله بعد →',
      submitBtn: 'محاسبه و نمایش گزارش 🎯',
      restartBtn: 'شروع مجدد 🔄',
      q1Title: 'ملیت و وضعیت قانونی فعلی شما در ترکیه چیست؟',
      q1Syrian: 'تبعه سوریه (دارنده کیملیک 99 حمایت موقت)',
      q1Egyptian: 'مصر / عراق / یمن / فلسطین / اردن / مغرب',
      q1OtherArab: 'سایر اتباع خارجی با اقامت معتبر',
      q1Overseas: 'خارج از ترکیه (اقدام از طریق سفارت)',
      q2Title: 'نوع کارت اقامت فعلی و مدت اعتبار باقی‌مانده آن چقدر است؟',
      q2Tourist6: 'اقامت توریستی یا ملکی (6 ماه یا بیشتر اعتبار)',
      q2TouristLess: 'اقامت توریستی (کمتر از 6 ماه اعتبار)',
      q2Kimlik: 'کیملیک 99 فعال (در همان استان محل کار)',
      q2KimlikDiff: 'کیملیک 99 ثبت شده در استان دیگر',
      q2None: 'در حال حاضر کارت اقامت ترکیه ندارم',
      q3Title: 'حوزه کاری یا عنوان شغلی مورد نظر شما چیست؟',
      q3Tech: 'مهندس نرم‌افزار / متخصص IT / مدیر پروژه',
      q3Teacher: 'استاد / معلم زبان / مدرس',
      q3Medical: 'پزشک / پرستار / کادر درمان',
      q3CallCenter: 'پشتیبانی مشتریان / فروش / کال سنتر',
      q3Services: 'تکنسین فنی / خدمات عمومی',
      q3Investor: 'سرمایه‌گذار / ثبت شرکت شخصی',
      q4Title: 'وضعیت شرکت استخدام‌کننده چیست؟',
      q4Ratio5: 'شرکت به ازای هر خارجی 5 کارمند ترک استخدام کرده است',
      q4RatioLess: 'شرکت هنوز 5 کارمند ترک ندارد',
      q4NewCo: 'قصد ثبت شرکت شخصی دارم (سرمایه 500 هزار لیر)',
      q4NotSure: 'از وضعیت شرکت مطمئن نیستم',
      resultTitle: 'نتیجه تحلیل و گزارش قانونی 2026',
      eligibleTitle: '🟢 واجد شرایط رسمی برای اجازه کار / معافیت',
      condTitle: '🟡 واجد شرایط مشروط (نیاز به تکمیل مدارک)',
      ineligibleTitle: '🔴 در حال حاضر ناواجد شرایط',
      feeHeader: 'هزینه‌های رسمی و ضرایب حقوق 2026:',
      docsHeader: 'مدارک مورد نیاز برای درخواست:',
      warningHeader: '⚠️ نکات مهم برای جلوگیری از رد درخواست:',
      ctaJobs: 'مشاهده مشاغل با اجازه کار ←',
      ctaGuide: 'راهنمای کامل اجازه کار 📖',
      ctaAts: 'بررسی رزومه با سیستم ATS 🤖'
    },
    ur: {
      title: 'ترکی ورک پرمٹ اہلیت کیلکولیٹر 2026 🇹🇷',
      subtitle: 'ترکی میں ورک پرمٹ یا 3 سالہ استثنیٰ کی اہلیت کا تجزیہ کریں اور 2026 کی سرکاری فیسیں معلوم کریں۔',
      step1: '1. قومیت اور قانونی حیثیت',
      step2: '2. رہائشی پرمٹ کی مدت',
      step3: '3. پیشہ اور تعلیم',
      step4: '4. سپانسر کمپنی کی صورتحال',
      prevBtn: 'پچھلا',
      nextBtn: 'اگلا قدم →',
      submitBtn: 'اہلیت کا تجزیہ اور رپورٹ دیکھیں 🎯',
      restartBtn: 'دوبارہ شروع کریں 🔄',
      q1Title: 'ترکی میں آپ کی قومیت اور قانونی حیثیت کیا ہے؟',
      q1Syrian: 'سیریئن (عارضی تحفظ کیملک 99 ہولڈر)',
      q1Egyptian: 'مصر / عراق / یمن / فلسطین / اردن',
      q1OtherArab: 'دیگر قانونی رہائشی پرمٹ ہولڈر',
      q1Overseas: 'ترکی سے باہر (سفارت خانے کے ذریعے درخواست)',
      q2Title: 'آپ کے پاس کون سا اقامہ ہے اور اس کی باقی مدت کتنی ہے؟',
      q2Tourist6: 'ٹورسٹ یا رئیل اسٹیٹ اقامہ (6 ماہ سے زیادہ باقی)',
      q2TouristLess: 'ٹورسٹ اقامہ (6 ماہ سے کم باقی)',
      q2Kimlik: 'کیملک 99 (اسی صوبے میں رجسٹرڈ)',
      q2KimlikDiff: 'کیملک 99 (دوسرے صوبے میں رجسٹرڈ)',
      q2None: 'فی الحال ترکی کا اقامہ نہیں ہے',
      q3Title: 'آپ کا پیشہ یا مطلوبہ ملازمت کیا ہے؟',
      q3Tech: 'سافٹ ویئر انجینئر / آئی ٹی سپیشلسٹ',
      q3Teacher: 'ٹیچر / لیکچرار / زبان کا معلم',
      q3Medical: 'ڈاکٹر / نرس / میڈیکل عملہ',
      q3CallCenter: 'کال سینٹر / کسٹمر سروس / سیلز',
      q3Services: 'ٹیکنیشن / عام خدمات',
      q3Investor: 'سرمایہ کار / اپنی کمپنی بنانا',
      q4Title: 'سپانسر کرنے والی کمپنی کی کیا صورتحال ہے؟',
      q4Ratio5: 'کمپنی میں ہر غیر ملکی پر 5 ترکی شہری ملازم ہیں',
      q4RatioLess: 'کمپنی میں ابھی 5 ترکی شہری نہیں ہیں',
      q4NewCo: 'اپنی نئی کمپنی بنانا (500 ہزار لیرا سرمایہ)',
      q4NotSure: 'کمپنی کی صورتحال کا علم نہیں ہے',
      resultTitle: 'اہلیت کا تجزیہ اور 2026 رپورٹ',
      eligibleTitle: '🟢 ورک پرمٹ کے لیے مکمل اہل',
      condTitle: '🟡 مشروط طور پر اہل (اضافی شرائط ضروری ہیں)',
      ineligibleTitle: '🔴 فی الحال نااہل',
      feeHeader: '2026 سرکاری فیسیں اور تنخواہ کا تناسب:',
      docsHeader: 'ضروری دستاویزا ت:',
      warningHeader: '⚠️ درخواست مسترد ہونے سے بچنے کی ہدایات:',
      ctaJobs: 'ورک پرمٹ والی ملازمتیں دیکھیں ←',
      ctaGuide: 'ورک پرمٹ گائیڈ پڑھیں 📖',
      ctaAts: 'سی وی کا اے آئی سے جائزہ لیں 🤖'
    }
  };

  const t = dict[locale] || dict.ar;

  const html = `
    <div class="container" style="padding-top: 30px; padding-bottom: 60px; max-width: 900px;">
      <nav style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
        <a href="/${locale}" style="color: var(--primary); text-decoration: none; font-weight: 600;">Home</a> / <span style="font-weight: 700; color: var(--text-heading);">${t.title}</span>
      </nav>

      <div class="glass-card" style="padding: 36px; border-radius: 16px; box-shadow: var(--shadow-lg); background: var(--bg-card); border: 1px solid var(--border);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 1.85rem; font-weight: 900; color: var(--text-heading); margin-bottom: 10px;">${t.title}</h1>
          <p style="color: var(--text-muted); font-size: 1.02rem; max-width: 720px; margin: 0 auto; line-height: 1.6;">${t.subtitle}</p>
        </div>

        <!-- Wizard Stepper Header -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 35px; background: rgba(0,0,0,0.03); padding: 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; flex-wrap: wrap; gap: 8px;">
          <div id="step-tab-1" style="color: var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 4px;">${t.step1}</div>
          <div id="step-tab-2" style="color: var(--text-muted);">${t.step2}</div>
          <div id="step-tab-3" style="color: var(--text-muted);">${t.step3}</div>
          <div id="step-tab-4" style="color: var(--text-muted);">${t.step4}</div>
        </div>

        <!-- Wizard Form Steps -->
        <form id="wizard-form" onsubmit="return false;">
          <!-- Step 1 -->
          <div id="step-1" class="wizard-step">
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-heading); margin-bottom: 20px;">${t.q1Title}</h3>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <input type="radio" name="q1" value="syrian" checked>
                <span style="font-weight: 600;">${t.q1Syrian}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <input type="radio" name="q1" value="egyptian">
                <span style="font-weight: 600;">${t.q1Egyptian}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <input type="radio" name="q1" value="other_expats">
                <span style="font-weight: 600;">${t.q1OtherArab}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <input type="radio" name="q1" value="overseas">
                <span style="font-weight: 600;">${t.q1Overseas}</span>
              </label>
            </div>
          </div>

          <!-- Step 2 -->
          <div id="step-2" class="wizard-step" style="display: none;">
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-heading); margin-bottom: 20px;">${t.q2Title}</h3>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q2" value="tourist_6" checked>
                <span style="font-weight: 600;">${t.q2Tourist6}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q2" value="tourist_less">
                <span style="font-weight: 600;">${t.q2TouristLess}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q2" value="kimlik_same">
                <span style="font-weight: 600;">${t.q2Kimlik}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q2" value="kimlik_diff">
                <span style="font-weight: 600;">${t.q2KimlikDiff}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q2" value="none">
                <span style="font-weight: 600;">${t.q2None}</span>
              </label>
            </div>
          </div>

          <!-- Step 3 -->
          <div id="step-3" class="wizard-step" style="display: none;">
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-heading); margin-bottom: 20px;">${t.q3Title}</h3>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q3" value="tech" checked>
                <span style="font-weight: 600;">${t.q3Tech}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q3" value="teacher">
                <span style="font-weight: 600;">${t.q3Teacher}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q3" value="medical">
                <span style="font-weight: 600;">${t.q3Medical}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q3" value="callcenter">
                <span style="font-weight: 600;">${t.q3CallCenter}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q3" value="services">
                <span style="font-weight: 600;">${t.q3Services}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q3" value="investor">
                <span style="font-weight: 600;">${t.q3Investor}</span>
              </label>
            </div>
          </div>

          <!-- Step 4 -->
          <div id="step-4" class="wizard-step" style="display: none;">
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-heading); margin-bottom: 20px;">${t.q4Title}</h3>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q4" value="ratio5" checked>
                <span style="font-weight: 600;">${t.q4Ratio5}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q4" value="ratio_less">
                <span style="font-weight: 600;">${t.q4RatioLess}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q4" value="newco">
                <span style="font-weight: 600;">${t.q4NewCo}</span>
              </label>
              <label class="wizard-option" style="padding: 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px;">
                <input type="radio" name="q4" value="notsure">
                <span style="font-weight: 600;">${t.q4NotSure}</span>
              </label>
            </div>
          </div>

          <!-- Controls -->
          <div style="display: flex; justify-content: space-between; margin-top: 35px; border-top: 1px solid var(--border); padding-top: 20px;">
            <button id="prev-btn" type="button" class="btn" style="display: none; padding: 10px 24px; border-radius: 30px; font-weight: 700; background: var(--bg-card); border: 1px solid var(--border);">${t.prevBtn}</button>
            <div></div>
            <button id="next-btn" type="button" class="btn btn-primary" style="padding: 10px 28px; border-radius: 30px; font-weight: 700;">${t.nextBtn}</button>
            <button id="submit-btn" type="button" class="btn btn-primary" style="display: none; padding: 10px 28px; border-radius: 30px; font-weight: 700;">${t.submitBtn}</button>
          </div>
        </form>

        <!-- Results Card -->
        <div id="results-card" style="display: none; margin-top: 30px; border-top: 2px dashed var(--border); padding-top: 30px;">
          <h2 style="font-size: 1.5rem; font-weight: 900; color: var(--text-heading); text-align: center; margin-bottom: 24px;">${t.resultTitle}</h2>
          
          <div id="status-box" style="padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center;"></div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;" class="grid-2-col">
            <div style="background: rgba(0,123,255,0.04); border: 1px solid var(--border); padding: 20px; border-radius: 12px;">
              <h4 style="color: var(--primary); font-size: 1.05rem; font-weight: 700; margin-bottom: 12px;">${t.feeHeader}</h4>
              <div id="fee-details" style="font-size: 0.93rem; line-height: 1.6;"></div>
            </div>
            <div style="background: rgba(0,123,255,0.04); border: 1px solid var(--border); padding: 20px; border-radius: 12px;">
              <h4 style="color: var(--primary); font-size: 1.05rem; font-weight: 700; margin-bottom: 12px;">${t.docsHeader}</h4>
              <ul id="docs-details" style="margin: 0; padding-inline-start: 18px; font-size: 0.92rem; line-height: 1.6;"></ul>
            </div>
          </div>

          <div id="warning-box" style="background: rgba(220,53,69,0.05); border-inline-start: 4px solid var(--danger); padding: 18px; border-radius: 8px; margin-bottom: 30px; display: none;">
            <h4 style="color: var(--danger); font-size: 1.05rem; font-weight: 700; margin: 0 0 8px 0;">${t.warningHeader}</h4>
            <div id="warning-details" style="font-size: 0.93rem; line-height: 1.5;"></div>
          </div>

          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="/${locale}" class="btn btn-primary" style="padding: 10px 24px; border-radius: 30px; font-weight: 700; text-decoration: none;">${t.ctaJobs}</a>
            <a href="/${locale}/blog/work-permit-turkey-syrians-arabs-2026-guide" class="btn" style="background: var(--bg-card); border: 1px solid var(--border); padding: 10px 24px; border-radius: 30px; font-weight: 700; text-decoration: none; color: var(--text-heading);">${t.ctaGuide}</a>
            <button onclick="location.reload()" class="btn" style="background: rgba(0,0,0,0.05); border: none; padding: 10px 20px; border-radius: 30px; font-weight: 700;">${t.restartBtn}</button>
          </div>
        </div>
      </div>
    </div>

    <script>
      let currentStep = 1;
      const totalSteps = 4;

      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      const submitBtn = document.getElementById('submit-btn');

      nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
          document.getElementById('step-' + currentStep).style.display = 'none';
          document.getElementById('step-tab-' + currentStep).style.color = 'var(--text-muted)';
          document.getElementById('step-tab-' + currentStep).style.borderBottom = 'none';

          currentStep++;

          document.getElementById('step-' + currentStep).style.display = 'block';
          document.getElementById('step-tab-' + currentStep).style.color = 'var(--primary)';
          document.getElementById('step-tab-' + currentStep).style.borderBottom = '2px solid var(--primary)';

          prevBtn.style.display = 'block';

          if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
          }
        }
      });

      prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
          document.getElementById('step-' + currentStep).style.display = 'none';
          document.getElementById('step-tab-' + currentStep).style.color = 'var(--text-muted)';
          document.getElementById('step-tab-' + currentStep).style.borderBottom = 'none';

          currentStep--;

          document.getElementById('step-' + currentStep).style.display = 'block';
          document.getElementById('step-tab-' + currentStep).style.color = 'var(--primary)';
          document.getElementById('step-tab-' + currentStep).style.borderBottom = '2px solid var(--primary)';

          submitBtn.style.display = 'none';
          nextBtn.style.display = 'block';

          if (currentStep === 1) {
            prevBtn.style.display = 'none';
          }
        }
      });

      submitBtn.addEventListener('click', calculateEligibility);

      function calculateEligibility() {
        const q1 = document.querySelector('input[name="q1"]:checked').value;
        const q2 = document.querySelector('input[name="q2"]:checked').value;
        const q3 = document.querySelector('input[name="q3"]:checked').value;
        const q4 = document.querySelector('input[name="q4"]:checked').value;

        document.getElementById('wizard-form').style.display = 'none';
        document.getElementById('results-card').style.display = 'block';

        const statusBox = document.getElementById('status-box');
        const feeDetails = document.getElementById('fee-details');
        const docsDetails = document.getElementById('docs-details');
        const warningBox = document.getElementById('warning-box');
        const warningDetails = document.getElementById('warning-details');

        let isSyrian = (q1 === 'syrian');
        let isEligible = false;
        let isCond = false;

        if (isSyrian && (q2 === 'kimlik_same' || q2 === 'tourist_6')) {
          isEligible = true;
          statusBox.style.background = '#f0fdf4';
          statusBox.style.border = '2px solid #22c55e';
          statusBox.style.color = '#15803d';
          statusBox.innerHTML = \`<h3 style="margin: 0; font-weight: 800;">${t.eligibleTitle}</h3><p style="margin: 6px 0 0 0;">${locale === 'ar' ? 'تستحق تصريح إعفاء إذن العمل الممتد لـ 3 سنوات عبر منصة e-Devlet!' : 'Eligible for 3-Year e-Devlet Work Permit Exemption!'}</p>\`;
        } else if (q1 !== 'overseas' && (q2 === 'tourist_6' || q2 === 'kimlik_same') && q4 === 'ratio5') {
          isEligible = true;
          statusBox.style.background = '#f0fdf4';
          statusBox.style.border = '2px solid #22c55e';
          statusBox.style.color = '#15803d';
          statusBox.innerHTML = \`<h3 style="margin: 0; font-weight: 800;">${t.eligibleTitle}</h3><p style="margin: 6px 0 0 0;">${locale === 'ar' ? 'مستوفي لشروط التقديم من داخل تركيا بموجب كفالة الشركة!' : 'Eligible for Standard Work Permit via Employer Sponsorship!'}</p>\`;
        } else {
          isCond = true;
          statusBox.style.background = '#fffbeb';
          statusBox.style.border = '2px solid #f59e0b';
          statusBox.style.color = '#b45309';
          statusBox.innerHTML = \`<h3 style="margin: 0; font-weight: 800;">${t.condTitle}</h3><p style="margin: 6px 0 0 0;">${locale === 'ar' ? 'يتطلب استيفاء شرط نسبة الأتراك أو تجديد الإقامة قبل تقديم الملف.' : 'Requires fulfilling 5-to-1 ratio or renewing residency card.'}</p>\`;
        }

        // Multiplier & Fees
        let feeText = '';
        let multiplierText = '';
        if (q3 === 'tech') multiplierText = '4x Gross Minimum Wage (132,120 TRY)';
        else if (q3 === 'teacher' || q3 === 'medical') multiplierText = '3x Gross Minimum Wage (99,090 TRY)';
        else if (q3 === 'callcenter' || q3 === 'services') multiplierText = '2x Gross Minimum Wage (66,060 TRY)';
        else if (q3 === 'investor') multiplierText = '6.5x Gross Minimum Wage (214,695 TRY)';

        if (isSyrian) {
          feeText = \`<strong>${locale === 'ar' ? 'رسوم الإعفاء (سنة واحدة):' : 'Exemption Fee (1 Yr):'}</strong> 4,677.90 TRY<br>
                     <strong>${locale === 'ar' ? 'بدل الورق القيم:' : 'Card Fee:'}</strong> 964 TRY<br>
                     <strong>${locale === 'ar' ? 'الحد الأدنى للأجر المكتوب:' : 'Min Salary:'}</strong> 28,075 TRY (Net)\`;
        } else {
          feeText = \`<strong>${locale === 'ar' ? 'رسم تصريح العمل السنوي:' : 'Annual Permit Fee:'}</strong> 12,574.90 TRY<br>
                     <strong>${locale === 'ar' ? 'بدل الورق القيم:' : 'Card Fee:'}</strong> 964 TRY<br>
                     <strong>${locale === 'ar' ? 'مضاعف الأجر المطلوب للمهنة:' : 'Required Salary Multiplier:'}</strong> \${multiplierText}\`;
        }
        feeDetails.innerHTML = feeText;

        // Docs Checklist
        let docsArr = [
          locale === 'ar' ? 'جواز سفر ساري المفعول لمدة لا تقل عن 6 أشهر' : 'Valid Passport (6+ months validity)',
          locale === 'ar' ? 'بطاقة الإقامة السارية (سياحية / عقارية / كيمليك 99)' : 'Valid Residency Card (Tourist / Real Estate / Kimlik 99)',
          locale === 'ar' ? 'عقد عمل موقع بينك وبين الشركة الكفيلة' : 'Signed Employment Contract with Sponsoring Company',
          locale === 'ar' ? 'الشهادة الدراسية مترجمة ومنوترة (ومعادة للأطباء والمدرسين)' : 'Notarized Degree (Equivalency for Teachers & Doctors)',
          locale === 'ar' ? 'صورة شخصية خلفية بيضاء مع الرقم الضريبي Vergi No' : 'Biometric Photo & Tax Number (Vergi Numarası)'
        ];
        docsDetails.innerHTML = docsArr.map(d => \`<li style="margin-bottom: 4px;">\${d}</li>\`).join('');

        // Warnings
        if (q2 === 'kimlik_diff') {
          warningBox.style.display = 'block';
          warningDetails.innerHTML = locale === 'ar' ? 'بطاقة الكيمليك المسجلة في ولاية أخرى لا تتيح العمل في إسطنبول مباشرة دون نقل القيد أو الحصول على إذن سفر رسمي!' : 'Kimlik registered in another province requires transfer of registration before working in Istanbul!';
        } else if (q4 === 'ratio_less') {
          warningBox.style.display = 'block';
          warningDetails.innerHTML = locale === 'ar' ? 'انخفاض عدد العمال الأتراك عن 5 عمال في الشركة الكفيلة قد يؤدي لرفض طلب إذن العمل!' : 'Fewer than 5 registered Turkish employees in sponsoring firm may cause application rejection!';
        }
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// Investor Company Setup & Foreign Hiring Estimator 2026
aiFeaturesRouter.get('/:locale/investor-calculator', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') {
    return c.redirect('/ar/investor-calculator');
  }

  const dict: Record<string, any> = {
    ar: {
      title: 'حاسبة تكاليف تأسيس الشركات وتوظيف الأجانب للمستثمرين 2026 🏢🇹🇷',
      subtitle: 'أداة حاسبة استثمارية متكاملة لحساب رسوم تأسيس شركة (Ltd / A.Ş) في تركيا، استثناءات إذن العمل الشريك، وتكاليف توظيف العمالة الأجنبية والضرائب لعام 2026.',
      companyTypeLabel: 'نوع الشركة المراد تأسيسها في تركيا:',
      ltdOpt: 'شركة ذات مسؤولية محدودة (Limited Şirket - Ltd. Şti.)',
      asOpt: 'شركة مساهمة (Anonim Şirket - A.Ş.)',
      branchOpt: 'فرع شركة أجنبية (Şube / İrtibat Bürosu)',
      capitalLabel: 'رأس مال الشركة المقترح (بالليرة التركية TRY):',
      capitalHint: 'ملاحظة: رأس مال 500,000 TL يمنح الشريك الأجنبي إعفاءً من شرط الـ 5 أتراك لسنة واحدة.',
      foreignCountLabel: 'عدد الموظفين الأجانب المخطط توظيفهم:',
      roleLabel: 'المستوى الوظيفي السائد للموظفين الأجانب:',
      roleExec: 'مدير تنفيذي / مدير عام (مضاعف 6.5 أضعاف الراتب)',
      roleEng: 'مهندس / مبرمج / تقني (مضاعف 4 أضعاف الراتب)',
      roleTeacher: 'مدرس / كادر طبي (مضاعف 3 أضعاف الراتب)',
      roleSales: 'مبيعات / خدمة عملاء (مضاعف ضعفي الراتب)',
      roleService: 'عمالة خدمات عامة (مضاعف 1.5 ضعف الراتب)',
      calcBtn: 'حساب التكاليف والتقرير الاستثماري الشامل 📊',
      resultTitle: 'تقرير التكاليف الاستثمارية والتراخيص 2026',
      setupCostHeader: '1. رسوم التأسيس والتسجيل الابتدائي (مرة واحدة):',
      monthlyCostHeader: '2. التكاليف التشغيلية الشهرية والضرائب التقديرية:',
      workPermitHeader: '3. ميزانية أذونات العمل والرواتب السنوية (2026):',
      exemptionStatusHeader: '4. وضع إعفاء الشريك الأجنبي من شرط 5 أتراك:',
      checklistHeader: '📋 مستندات وخطوات التأسيس الرسمية:',
      ctaEmployerPortal: 'أضف وظيفة مجانية في بوابة أصحاب العمل ←',
      ctaGuide: 'قراءة دليل تأسيس الشركات 2026 📖'
    },
    en: {
      title: 'Investor Company Setup & Foreign Hiring Estimator 2026 🏢🇹🇷',
      subtitle: 'Comprehensive 2026 investment calculator for company incorporation in Turkey (Ltd / A.Ş), work permit partner exemption rules, and foreign employee SGK tax budgets.',
      companyTypeLabel: 'Target Company Structure in Turkey:',
      ltdOpt: 'Limited Liability Company (Limited Şirket - Ltd. Şti.)',
      asOpt: 'Joint Stock Company (Anonim Şirket - A.Ş.)',
      branchOpt: 'Foreign Company Branch / Liaison Office',
      capitalLabel: 'Proposed Paid-Up Capital (TRY):',
      capitalHint: 'Note: 500,000 TRY capital waives the 5 Turkish employee rule for foreign partner for 1st year.',
      foreignCountLabel: 'Number of Foreign Employees to Hire:',
      roleLabel: 'Predominant Job Tier for Foreign Workers:',
      roleExec: 'Executive / General Manager (6.5x Min Wage Multiplier)',
      roleEng: 'Engineer / IT Specialist (4x Min Wage Multiplier)',
      roleTeacher: 'Teacher / Healthcare Staff (3x Min Wage Multiplier)',
      roleSales: 'Sales / Customer Support (2x Min Wage Multiplier)',
      roleService: 'General Services Staff (1.5x Min Wage Multiplier)',
      calcBtn: 'Calculate Budget & Generate Investor Report 📊',
      resultTitle: '2026 Investor Cost & Compliance Report',
      setupCostHeader: '1. Initial Incorporation & Trade Registry Fees (One-Time):',
      monthlyCostHeader: '2. Estimated Monthly Operational & Tax Costs:',
      workPermitHeader: '3. Annual Work Permits & Payroll Budget (2026):',
      exemptionStatusHeader: '4. Foreign Partner 5-to-1 Exemption Status:',
      checklistHeader: '📋 Legal Incorporation Steps & Checklist:',
      ctaEmployerPortal: 'Post Job Listing on Employer Portal ←',
      ctaGuide: 'Read Full 2026 Business Setup Guide 📖'
    },
    tr: {
      title: 'Yatırımcı Şirket Kuruluşu ve Yabancı İstihdam Maliyet Hesaplama 2026 🏢🇹🇷',
      subtitle: 'Türkiye\'de şirket kuruluşu (Ltd / A.Ş), ortak çalışma izni muafiyet kuralları ve yabancı personel SGK maliyet hesaplama aracı.',
      companyTypeLabel: 'Kurulacak Şirket Türü:',
      ltdOpt: 'Limited Şirket (Ltd. Şti.)',
      asOpt: 'Anonim Şirket (A.Ş.)',
      branchOpt: 'Yabancı Şirket Şubesi / İrtibat Bürosu',
      capitalLabel: 'Öngörülen Sermaye (TL):',
      capitalHint: 'Not: 500.000 TL sermaye, yabancı ortak için 1 yıl boyunca 5 Türk çalışan şartını kaldırır.',
      foreignCountLabel: 'İstihdam Edilecek Yabancı Personel Sayısı:',
      roleLabel: 'Yabancı Personelin Meslek Seviyesi:',
      roleExec: 'Üst Düzey Yönetici (Asgari Ücretin 6.5 Katı)',
      roleEng: 'Mühendis / Yazılımcı (Asgari Ücretin 4 Katı)',
      roleTeacher: 'Öğretmen / Sağlık Personeli (Asgari Ücretin 3 Katı)',
      roleSales: 'Satış / Müşteri Hizmetleri (Asgari Ücretin 2 Katı)',
      roleService: 'Genel Hizmetler (Asgari Ücretin 1.5 Katı)',
      calcBtn: 'Maliyeti Hesapla ve Rapor Oluştur 📊',
      resultTitle: '2026 Yatırım ve Uyumluluk Raporu',
      setupCostHeader: '1. İlk Kuruluş ve Ticaret Odası Harçları (Tek Seferlik):',
      monthlyCostHeader: '2. Tahmini Aylık Operasyonel ve Muhasebe Giderleri:',
      workPermitHeader: '3. Yıllık Çalışma İzni ve Bütçe (2026):',
      exemptionStatusHeader: '4. Yabancı Ortak 5 Türk Şartı Muafiyet Durumu:',
      checklistHeader: '📋 Resmi Kuruluş Adımları ve Evraklar:',
      ctaEmployerPortal: 'İşveren Portalı Ücretsiz İlan Ver ←',
      ctaGuide: 'Şirket Kuruluş Rehberini Oku 📖'
    },
    ru: {
      title: 'Калькулятор открытия компании и найма иностранцев 2026 🏢🇹🇷',
      subtitle: 'Расчет стоимости регистрации компании в Турции (Ltd / A.Ş), освобождения партнера от разрешения на работу и налогов SGK на 2026 год.',
      companyTypeLabel: 'Тип создаваемой компании:',
      ltdOpt: 'Общество с ограниченной ответственностью (Ltd. Şti.)',
      asOpt: 'Акционерное общество (A.Ş.)',
      branchOpt: 'Филиал иностранной компании / Представительство',
      capitalLabel: 'Уставный капитал (TRY):',
      capitalHint: 'Капитал от 500 000 TRY освобождает партнера от правила 5 турок на 1 год.',
      foreignCountLabel: 'Количество иностранных сотрудников:',
      roleLabel: 'Должностная категория работников:',
      roleExec: 'Генеральный директор (6.5 коэфф. зарплаты)',
      roleEng: 'Инженер / IT-специалист (4 коэфф. зарплаты)',
      roleTeacher: 'Преподаватель / Врач (3 коэфф. зарплаты)',
      roleSales: 'Продажи / Поддержка (2 коэфф. зарплаты)',
      roleService: 'Обслуживающий персонал (1.5 коэфф. зарплаты)',
      calcBtn: 'Рассчитать бюджет и отчет 📊',
      resultTitle: 'Инвестиционный отчет 2026',
      setupCostHeader: '1. Единовременные расходы на регистрацию:',
      monthlyCostHeader: '2. Ежемесячные операционные расходы:',
      workPermitHeader: '3. Ежегодный бюджет на разрешения на работу (2026):',
      exemptionStatusHeader: '4. Статус правила 5 турецких сотрудников:',
      checklistHeader: '📋 Шаги по регистрации компании:',
      ctaEmployerPortal: 'Опубликовать вакансию на портале ←',
      ctaGuide: 'Читать руководство по бизнесу 📖'
    },
    fa: {
      title: 'محاسبه‌گر هزینه‌های ثبت شرکت و استخدام اتباع خارجی 2026 🏢🇹🇷',
      subtitle: 'ابزار جامع سرمایه‌گذاری برای محاسبه هزینه‌های ثبت شرکت (Ltd / A.Ş) در ترکیه، معافیت‌های اجازه کار شریک و مالیات SGK.',
      companyTypeLabel: 'نوع شرکت مورد نظر در ترکیه:',
      ltdOpt: 'شرکت با مسئولیت محدود (Limited Şirket - Ltd. Şti.)',
      asOpt: 'شرکت سهامی (Anonim Şirket - A.Ş.)',
      branchOpt: 'شعبه شرکت خارجی / دفتر نمایندگی',
      capitalLabel: 'سرمایه اولیه پیشنهادی (لیر ترکیه TRY):',
      capitalHint: 'نکته: سرمایه 500 هزار لیر شرط 5 کارمند ترک را برای شریک خارجی به مدت 1 سال لغو می‌کند.',
      foreignCountLabel: 'تعداد کارمندان خارجی مورد نظر برای استخدام:',
      roleLabel: 'سطح شغلی اصلی کارمندان خارجی:',
      roleExec: 'مدیر عامل / مدیر ارشد (ضریب 6.5 برابر حقوق)',
      roleEng: 'مهندس / متخصص IT (ضریب 4 برابر حقوق)',
      roleTeacher: 'استاد / کادر درمان (ضریب 3 برابر حقوق)',
      roleSales: 'فروش / پشتیبانی (ضریب 2 برابر حقوق)',
      roleService: 'خدمات عمومی (ضریب 1.5 برابر حقوق)',
      calcBtn: 'محاسبه هزینه‌ها و تولید گزارش 📊',
      resultTitle: 'گزارش سرمایه‌گذاری و هزینه‌ها 2026',
      setupCostHeader: '۱. هزینه‌های اولیه ثبت و دفاتر رسمی (یک‌باره):',
      monthlyCostHeader: '۲. هزینه‌های عملیاتی و مالیاتی ماهانه:',
      workPermitHeader: '۳. بودجه سالانه اجازه کار و حقوق کارمندان (2026):',
      exemptionStatusHeader: '۴. وضعیت معافیت شریک خارجی از شرط ۵ کارمند ترک:',
      checklistHeader: '📋 مراحل قانونی ثبت شرکت:',
      ctaEmployerPortal: 'ثبت آگهی استخدام در پورتال كارفرمایان ←',
      ctaGuide: 'راهنمای ثبت شرکت در ترکیه 📖'
    },
    ur: {
      title: 'ترکی میں کمپنی رجسٹریشن اور غیر ملکی ملازمین کے اخراجات 2026 🏢🇹🇷',
      subtitle: 'ترکی میں کمپنی بنانے (Ltd / A.Ş)، پارٹنر ورک پرمٹ کے قواعد اور غیر ملکی ملازمین کے SGK ٹیکس کا تجزیہ کریں۔',
      companyTypeLabel: 'کمپنی کی قسم:',
      ltdOpt: 'لمیٹڈ کمپنی (Limited Şirket - Ltd. Şti.)',
      asOpt: 'جوائنٹ اسٹاک کمپنی (Anonim Şirket - A.Ş.)',
      branchOpt: 'غیر ملکی کمپنی کا برانچ آفس',
      capitalLabel: 'تجویز کردہ سرمایه‌کاری (ترکی لیرا):',
      capitalHint: 'نوٹ: 500,000 لیرا سرمایہ غیر ملکی پارٹنر کے لیے 1 سال تک 5 ترک ملازمین کی شرط ختم کرتا ہے۔',
      foreignCountLabel: 'غیر ملکی ملازمین کی تعداد:',
      roleLabel: 'ملازمین کا کیریئر لیول:',
      roleExec: 'ایگزیکٹو / جنرل مینیجر (6.5 گنا کم از کم اجرت)',
      roleEng: 'انجینئر / آئی ٹی سپیشلسٹ (4 گنا کم از کم اجرت)',
      roleTeacher: 'ٹیچر / میڈیکل عملہ (3 گنا کم از کم اجرت)',
      roleSales: 'سیلز / کسٹمر سروس (2 گنا کم از کم اجرت)',
      roleService: 'عام خدمات کا عملہ (1.5 گنا کم از کم اجرت)',
      calcBtn: 'اخراجات کا حساب لگائیں 📊',
      resultTitle: '2026 سرمایه‌کاری اور تعمیل رپورٹ',
      setupCostHeader: '1. ابتدائی رجسٹریشن اور چیمبر فیس (یک وقتی):',
      monthlyCostHeader: '2. ماہانہ آپریٹنگ اخراجات:',
      workPermitHeader: '3. سالانہ ورک پرمٹ اور بٹوے کا تخمینہ (2026):',
      exemptionStatusHeader: '4. غیر ملکی پارٹنر کا استثنیٰ:',
      checklistHeader: '📋 رجسٹریشن کے قانونی مراحل:',
      ctaEmployerPortal: 'ایمپلائر پورٹل پر نوکری پوسٹ کریں ←',
      ctaGuide: 'کمپنی رجسٹریشن گائیڈ پڑھیں 📖'
    }
  };

  const t = dict[locale] || dict.ar;

  const html = `
    <div class="container" style="padding-top: 30px; padding-bottom: 60px; max-width: 900px;">
      <nav style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">
        <a href="/${locale}" style="color: var(--primary); text-decoration: none; font-weight: 600;">Home</a> / <span style="font-weight: 700; color: var(--text-heading);">${t.title}</span>
      </nav>

      <div class="glass-card" style="padding: 36px; border-radius: 16px; box-shadow: var(--shadow-lg); background: var(--bg-card); border: 1px solid var(--border);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 1.85rem; font-weight: 900; color: var(--text-heading); margin-bottom: 10px;">${t.title}</h1>
          <p style="color: var(--text-muted); font-size: 1.02rem; max-width: 720px; margin: 0 auto; line-height: 1.6;">${t.subtitle}</p>
        </div>

        <form id="investor-form" onsubmit="calculateInvestorCosts(); return false;">
          <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px;">
            <div>
              <label style="font-weight: 700; color: var(--text-heading); display: block; margin-bottom: 8px;">${t.companyTypeLabel}</label>
              <select id="company-type" style="width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-card); font-size: 0.95rem;">
                <option value="ltd">${t.ltdOpt}</option>
                <option value="as">${t.asOpt}</option>
                <option value="branch">${t.branchOpt}</option>
              </select>
            </div>

            <div>
              <label style="font-weight: 700; color: var(--text-heading); display: block; margin-bottom: 4px;">${t.capitalLabel}</label>
              <input type="number" id="capital-amount" value="500000" step="50000" min="50000" style="width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-card); font-size: 0.95rem;">
              <span style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; display: block;">${t.capitalHint}</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;" class="grid-2-col">
              <div>
                <label style="font-weight: 700; color: var(--text-heading); display: block; margin-bottom: 8px;">${t.foreignCountLabel}</label>
                <input type="number" id="foreign-count" value="2" min="0" max="50" style="width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-card); font-size: 0.95rem;">
              </div>
              <div>
                <label style="font-weight: 700; color: var(--text-heading); display: block; margin-bottom: 8px;">${t.roleLabel}</label>
                <select id="role-tier" style="width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-card); font-size: 0.95rem;">
                  <option value="exec">${t.roleExec}</option>
                  <option value="eng" selected>${t.roleEng}</option>
                  <option value="teacher">${t.roleTeacher}</option>
                  <option value="sales">${t.roleSales}</option>
                  <option value="service">${t.roleService}</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 16px; border-radius: 30px; font-weight: 800; font-size: 1.05rem;">${t.calcBtn}</button>
        </form>

        <div id="investor-results" style="display: none; margin-top: 35px; border-top: 2px dashed var(--border); padding-top: 30px;">
          <h2 style="font-size: 1.5rem; font-weight: 900; color: var(--text-heading); text-align: center; margin-bottom: 24px;">${t.resultTitle}</h2>

          <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px;">
            <div style="background: rgba(0,123,255,0.04); border: 1px solid var(--border); padding: 20px; border-radius: 12px;">
              <h4 style="color: var(--primary); font-size: 1.05rem; font-weight: 700; margin-bottom: 10px;">${t.setupCostHeader}</h4>
              <div id="setup-cost-details" style="font-size: 0.95rem; line-height: 1.6;"></div>
            </div>

            <div style="background: rgba(0,123,255,0.04); border: 1px solid var(--border); padding: 20px; border-radius: 12px;">
              <h4 style="color: var(--primary); font-size: 1.05rem; font-weight: 700; margin-bottom: 10px;">${t.monthlyCostHeader}</h4>
              <div id="monthly-cost-details" style="font-size: 0.95rem; line-height: 1.6;"></div>
            </div>

            <div style="background: rgba(0,123,255,0.04); border: 1px solid var(--border); padding: 20px; border-radius: 12px;">
              <h4 style="color: var(--primary); font-size: 1.05rem; font-weight: 700; margin-bottom: 10px;">${t.workPermitHeader}</h4>
              <div id="workpermit-cost-details" style="font-size: 0.95rem; line-height: 1.6;"></div>
            </div>

            <div id="exemption-box" style="padding: 20px; border-radius: 12px;">
              <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 8px;">${t.exemptionStatusHeader}</h4>
              <div id="exemption-details" style="font-size: 0.95rem; line-height: 1.5;"></div>
            </div>

            <div style="background: rgba(0,0,0,0.02); border: 1px solid var(--border); padding: 20px; border-radius: 12px;">
              <h4 style="color: var(--text-heading); font-size: 1.05rem; font-weight: 700; margin-bottom: 10px;">${t.checklistHeader}</h4>
              <ul style="margin: 0; padding-inline-start: 20px; font-size: 0.93rem; line-height: 1.6;">
                <li>${locale === 'ar' ? 'تصديق عقد التأسيس وعقد الإيجار التجاري لدى النوتير (Noter)' : 'Notarization of Articles of Association & Commercial Lease at Notary'}</li>
                <li>${locale === 'ar' ? 'إيداع رأس المال في بنك تركي وحصول على كتاب البنك (Sermaye Bloke Mektubu)' : 'Depositing paid-up capital in Turkish Bank and getting capital lock letter'}</li>
                <li>${locale === 'ar' ? 'التسجيل في غرفة تجارة إسطنبول (İTO) والنشر في الجريدة الرسمية (Sicil Gazetesi)' : 'Registration with Istanbul Chamber of Commerce (İTO) and Trade Registry Gazette'}</li>
                <li>${locale === 'ar' ? 'استخراج التوقيع الإلكتروني (E-İmza) والتسجيل في هيئة الضرائب والضمان الاجتماعي (SGK)' : 'Obtaining E-Signature, Tax Number, and SGK Corporate Portal Account'}</li>
              </ul>
            </div>
          </div>

          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="/${locale}/employer" class="btn btn-primary" style="padding: 10px 24px; border-radius: 30px; font-weight: 700; text-decoration: none;">${t.ctaEmployerPortal}</a>
            <a href="/${locale}/blog/work-permit-turkey-syrians-arabs-2026-guide" class="btn" style="background: var(--bg-card); border: 1px solid var(--border); padding: 10px 24px; border-radius: 30px; font-weight: 700; text-decoration: none; color: var(--text-heading);">${t.ctaGuide}</a>
          </div>
        </div>
      </div>
    </div>

    <script>
      function calculateInvestorCosts() {
        const companyType = document.getElementById('company-type').value;
        const capital = parseFloat(document.getElementById('capital-amount').value) || 500000;
        const foreignCount = parseInt(document.getElementById('foreign-count').value) || 0;
        const roleTier = document.getElementById('role-tier').value;

        document.getElementById('investor-results').style.display = 'block';

        // 1. Setup Costs
        let setupFee = 0;
        let setupDesc = '';
        if (companyType === 'ltd') {
          setupFee = 28500;
          setupDesc = '${locale === 'ar' ? 'رسوم النوتير وتدقيق السجل التجاري بغرفة تجارة إسطنبول ITO:' : 'Notary, İTO Trade Chamber, Gazette Publication:'} 28,500 TRY';
        } else if (companyType === 'as') {
          setupFee = 45000;
          setupDesc = '${locale === 'ar' ? 'رسوم التأسيس القانونية والنشر لشركة مساهمة A.Ş:' : 'Incorporation & Legal Gazette for Joint Stock A.Ş:'} 45,000 TRY';
        } else {
          setupFee = 35000;
          setupDesc = '${locale === 'ar' ? 'رسوم ترخيص فرع شركة أجنبية:' : 'Foreign Branch Office Permit & Registration:'} 35,000 TRY';
        }
        document.getElementById('setup-cost-details').innerHTML = setupDesc;

        // 2. Monthly Operational & Tax Costs
        let monthlyCpa = 4500; // Accountant fee
        let monthlyStoppage = 3500; // Estimated withholding tax
        let monthlyTotal = monthlyCpa + monthlyStoppage;
        document.getElementById('monthly-cost-details').innerHTML = \`
          <strong>${locale === 'ar' ? 'أتعاب المحاسب القانوني (Mali Müşavir):' : 'Certified Accountant (CPA) Monthly Fee:'}</strong> \${monthlyCpa.toLocaleString()} TRY/mo<br>
          <strong>${locale === 'ar' ? 'ضريبة الإيجار المقتطعة (Stopaj):' : 'Withholding Rent Tax (Stopaj):'}</strong> \${monthlyStoppage.toLocaleString()} TRY/mo<br>
          <strong>${locale === 'ar' ? 'إجمالي المصاريف الثابتة التقديرية:' : 'Total Estimated Fixed Overhead:'}</strong> <span style="color: var(--primary); font-weight: 800;">\${monthlyTotal.toLocaleString()} TRY/mo</span>
        \`;

        // 3. Work Permits & Salaries
        const grossMinWage = 33030; // 2026 Gross Minimum Wage
        let multiplier = 2.0;
        if (roleTier === 'exec') multiplier = 6.5;
        else if (roleTier === 'eng') multiplier = 4.0;
        else if (roleTier === 'teacher') multiplier = 3.0;
        else if (roleTier === 'sales') multiplier = 2.0;
        else if (roleTier === 'service') multiplier = 1.5;

        const grossSalaryPerWorker = grossMinWage * multiplier;
        const sgkEmployerTaxPerWorker = grossSalaryPerWorker * 0.175; // 15.5% SGK + 2% Unemployment
        const permitFeePerWorker = 12574.90 + 964;

        const annualPermitTotal = permitFeePerWorker * foreignCount;
        const monthlyPayrollTotal = (grossSalaryPerWorker + sgkEmployerTaxPerWorker) * foreignCount;

        document.getElementById('workpermit-cost-details').innerHTML = \`
          <strong>${locale === 'ar' ? 'إجمالي رسوم أذونات العمل السنوية لجميع الموظفين:' : 'Total Annual Work Permit Fees:'}</strong> \${annualPermitTotal.toLocaleString('en-US', {maximumFractionDigits:2})} TRY<br>
          <strong>${locale === 'ar' ? 'الراتب الإجمالي مع التأمين (SGK) لكل موظف أجنبي:' : 'Gross Salary + Employer SGK Tax per Foreign Worker:'}</strong> \${(grossSalaryPerWorker + sgkEmployerTaxPerWorker).toLocaleString('en-US', {maximumFractionDigits:2})} TRY/mo<br>
          <strong>${locale === 'ar' ? 'إجمالي الميزانية الشهرية لكادر العمالة الأجنبية:' : 'Total Monthly Foreign Payroll Budget:'}</strong> <span style="color: var(--primary); font-weight: 800;">\${monthlyPayrollTotal.toLocaleString('en-US', {maximumFractionDigits:2})} TRY/mo</span>
        \`;

        // 4. Exemption Status
        const exemptionBox = document.getElementById('exemption-box');
        const exemptionDetails = document.getElementById('exemption-details');

        if (capital >= 500000) {
          exemptionBox.style.background = '#f0fdf4';
          exemptionBox.style.border = '2px solid #22c55e';
          exemptionBox.style.color = '#15803d';
          exemptionDetails.innerHTML = '${locale === 'ar' ? '🟢 مبروك! بموجب رأس مال 500 ألف ليرةتركية، يتم إعفاء الشريك الأجنبي من شرط توظيف 5 عمال أتراك خلال السنة الأولى من التأسيس!' : '🟢 Congratulations! Capital of 500k+ TRY waives the 5 Turkish employee requirement for the foreign founding partner during the 1st year!'}';
        } else {
          exemptionBox.style.background = '#fffbeb';
          exemptionBox.style.border = '2px solid #f59e0b';
          exemptionBox.style.color = '#b45309';
          exemptionDetails.innerHTML = '${locale === 'ar' ? '🟡 تنبيه: رأس مال أقل من 500 ألف ليرة يتطلب توظيف 5 عمال أتراك مسجلين بالضمان (SGK) لمنح الشريك الأجنبي إذن عمل.' : '🟡 Alert: Capital under 500k TRY requires hiring 5 registered Turkish employees to grant the foreign partner a work permit.'}';
        }
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});



