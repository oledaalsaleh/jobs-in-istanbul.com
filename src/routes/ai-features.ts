import { Hono } from 'hono'
import { renderLayout } from './public'
import { rateLimiter } from '../middleware/security'

export const aiFeaturesRouter = new Hono()

// CV & Cover Letter Optimizer Page
aiFeaturesRouter.get('/:locale/cv-optimizer', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/cv-optimizer');

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
      - Write the response in the language corresponding to: ${locale === 'ar' ? 'Arabic' : 'English'}.
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
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/salary-calculator');

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

            <div style="margin-bottom: 30px;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.languages}</label>
              <select id="sal-lang" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); color: var(--text-dark);">
                <option value="ar">${t.langAr}</option>
                <option value="en">${t.langEn}</option>
                <option value="both">${t.langBoth}</option>
                <option value="all">${t.langAll}</option>
              </select>
            </div>

            <button type="submit" class="btn-sidebar-apply" style="border: none;">${t.calcBtn}</button>
          </form>
        </div>

        <!-- Output Visual Card -->
        <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg); display: flex; flex-direction: column; justify-content: center;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin-bottom: 24px; text-align: center;">${t.resultTitle}</h2>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <div id="sal-result-avg" style="font-size: 3rem; font-weight: 900; color: var(--primary); text-shadow: 0 4px 12px var(--primary-glow);">--</div>
            <span style="font-weight: 600; color: var(--text-muted);">${t.salaryAvg}</span>
          </div>

          <div style="display: flex; justify-content: space-between; gap: 20px; font-weight: 600; border-top: 1px solid var(--border); padding-top: 20px;">
            <div style="text-align: center; flex: 1;">
              <div id="sal-result-low" style="color: var(--text-dark); font-size: 1.2rem; font-weight: 700;">--</div>
              <span style="font-size: 0.8rem; color: var(--text-muted);">${t.salaryLow}</span>
            </div>
            <div style="text-align: center; flex: 1; border-left: 1px solid var(--border); border-right: 1px solid var(--border);">
              <div id="sal-result-high" style="color: var(--accent); font-size: 1.2rem; font-weight: 700;">--</div>
              <span style="font-size: 0.8rem; color: var(--text-muted);">${t.salaryHigh}</span>
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

      function calculateSalary(e) {
        if(e) e.preventDefault();
        const field = document.getElementById('sal-field').value;
        const exp = document.getElementById('sal-exp').value;
        const lang = document.getElementById('sal-lang').value;

        const base = baseSalaries[field][exp];
        const mult = langMultipliers[lang];
        
        const avg = Math.round(base * mult);
        const low = Math.round(avg * 0.85);
        const high = Math.round(avg * 1.25);

        // Render with formatter
        const formatter = new Intl.NumberFormat('${locale === 'ar' ? 'ar-EG' : 'en-US'}', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
        
        document.getElementById('sal-result-avg').textContent = formatter.format(avg);
        document.getElementById('sal-result-low').textContent = formatter.format(low);
        document.getElementById('sal-result-high').textContent = formatter.format(high);
      }

      // Initial calculation
      document.addEventListener('DOMContentLoaded', () => {
        calculateSalary();
      });
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
})

// Resume Builder Page
aiFeaturesRouter.get('/:locale/resume-builder', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/resume-builder');

  const t = {
    ar: {
      title: 'منشئ السيرة الذاتية الاحترافية المباشر',
      subtitle: 'املأ بياناتك لإنشاء سيرة ذاتية ذات مظهر جذاب ومصممة للطباعة وحفظها بصيغة PDF فوراً.',
      personalTab: 'البيانات الشخصية',
      expTab: 'الخبرات المهنية',
      eduTab: 'التعليم والشهادات',
      skillsTab: 'المهارات واللغات',
      fullName: 'الاسم الكامل',
      jobTitle: 'المسمى الوظيفي المستهدف',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      summary: 'نبذة شخصية تعريفية',
      company: 'الشركة / جهة العمل',
      role: 'المسمى الوظيفي',
      dates: 'الفترة (مثال: ٢٠٢٣ - ٢٠٢٦)',
      desc: 'الوصف والمسؤوليات الرئيسية',
      school: 'الجامعة / المدرسة الكبرى',
      degree: 'التخصص والدرجة العلمية',
      skills: 'المهارات الفنية (افصل بينها بفاصلة)',
      languages: 'اللغات (مثال: العربية (الأم)، الإنجليزية (ممتاز))',
      printBtn: '🖨️ طباعة وحفظ كـ PDF',
      addBtn: 'إضافة بند آخر +',
      previewTitle: 'معاينة السيرة الذاتية المستندة للطباعة A4'
    },
    en: {
      title: 'Professional Interactive Resume Builder',
      subtitle: 'Build your job-winning resume in real-time, optimized for printing and PDF export directly in your browser.',
      personalTab: 'Personal Info',
      expTab: 'Experience',
      eduTab: 'Education',
      skillsTab: 'Skills & Languages',
      fullName: 'Full Name',
      jobTitle: 'Target Job Title',
      email: 'Email Address',
      phone: 'Phone Number',
      summary: 'Professional Summary',
      company: 'Company / Employer',
      role: 'Job Role / Title',
      dates: 'Dates (e.g. 2023 - 2026)',
      desc: 'Role description & achievements',
      school: 'University / School',
      degree: 'Degree & Field',
      skills: 'Skills (comma separated)',
      languages: 'Languages (e.g. Arabic (Native), English (Fluent))',
      printBtn: '🖨️ Print & Save PDF',
      addBtn: 'Add Item +',
      previewTitle: 'A4 Print Preview'
    }
  }[locale];

  const html = `
    <div class="container resume-builder-layout" style="padding: 60px 24px; margin-bottom: 100px;">
      
      <!-- Left: Input controls (hidden during print) -->
      <div class="builder-inputs glass-card" style="padding: 30px; border-radius: var(--radius-lg);">
        <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-dark); margin-bottom: 8px;">${t.title}</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 30px;">${t.subtitle}</p>

        <!-- Form fields mapping inputs directly to live-preview -->
        <form id="resume-form" oninput="updateLivePreview()">
          <h3 class="form-sec-title">${t.personalTab}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label>${t.fullName}</label>
              <input type="text" id="in-name" value="Ahmad Al-Khatib" class="form-input">
            </div>
            <div>
              <label>${t.jobTitle}</label>
              <input type="text" id="in-title" value="Senior Full Stack Engineer" class="form-input">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <label>${t.email}</label>
              <input type="email" id="in-email" value="ahmad@example.com" class="form-input">
            </div>
            <div>
              <label>${t.phone}</label>
              <input type="text" id="in-phone" value="+90 555 123 45 67" class="form-input">
            </div>
          </div>
          <div style="margin-bottom: 30px;">
            <label>${t.summary}</label>
            <textarea id="in-summary" rows="3" class="form-input">Highly analytical software developer with over 5 years of experience in building secure, distributed web applications. Passionate about optimization and clean edge architectures.</textarea>
          </div>

          <!-- Experiences Dynamic Fields -->
          <h3 class="form-sec-title">${t.expTab}</h3>
          <div id="exp-fields-group">
            <div class="dynamic-group-box">
              <input type="text" class="in-exp-comp form-input" placeholder="${t.company}" value="Istanbul Tech Labs" style="margin-bottom: 8px;">
              <input type="text" class="in-exp-role form-input" placeholder="${t.role}" value="Lead Developer" style="margin-bottom: 8px;">
              <input type="text" class="in-exp-dates form-input" placeholder="${t.dates}" value="2024 - Present" style="margin-bottom: 8px;">
              <textarea class="in-exp-desc form-input" placeholder="${t.desc}" rows="3">Led the development of bilingual payment integrations using TypeScript and Cloudflare Workers.</textarea>
            </div>
          </div>
          <button type="button" onclick="addExpField()" class="btn-apply-now" style="margin-bottom: 30px; font-size:0.85rem;">${t.addBtn}</button>

          <!-- Education Dynamic Fields -->
          <h3 class="form-sec-title">${t.eduTab}</h3>
          <div id="edu-fields-group">
            <div class="dynamic-group-box">
              <input type="text" class="in-edu-school form-input" placeholder="${t.school}" value="Istanbul Technical University" style="margin-bottom: 8px;">
              <input type="text" class="in-edu-degree form-input" placeholder="${t.degree}" value="B.Sc. in Computer Engineering" style="margin-bottom: 8px;">
              <input type="text" class="in-edu-dates form-input" placeholder="${t.dates}" value="2018 - 2022" style="margin-bottom: 8px;">
            </div>
          </div>
          <button type="button" onclick="addEduField()" class="btn-apply-now" style="margin-bottom: 30px; font-size:0.85rem;">${t.addBtn}</button>

          <!-- Skills & Languages -->
          <h3 class="form-sec-title">${t.skillsTab}</h3>
          <div style="margin-bottom: 16px;">
            <label>${t.skills}</label>
            <input type="text" id="in-skills" value="TypeScript, Javascript, Node.js, Cloudflare, Docker, SQL" class="form-input">
          </div>
          <div style="margin-bottom: 30px;">
            <label>${t.languages}</label>
            <input type="text" id="in-langs" value="Arabic (Native), English (Fluent), Turkish (Intermediate)" class="form-input">
          </div>

          <button type="button" onclick="window.print()" class="btn-sidebar-apply">${t.printBtn}</button>
        </form>
      </div>

      <!-- Right: Live A4 preview page (Styled like paper document) -->
      <div class="builder-preview">
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin-bottom: 16px; text-align: center;" class="preview-header-label">${t.previewTitle}</h2>
        <div id="paper-cv" class="paper-cv-page">
          <!-- Header -->
          <div class="cv-header">
            <h1 id="cv-name">Ahmad Al-Khatib</h1>
            <h2 id="cv-title">Senior Full Stack Engineer</h2>
            <div class="cv-contact">
              <span id="cv-email"><i class="fa-regular fa-envelope"></i> ahmad@example.com</span>
              <span id="cv-phone"><i class="fa-solid fa-phone"></i> +95 555 123 45 67</span>
            </div>
          </div>

          <!-- Body -->
          <div class="cv-body-layout">
            <!-- Summary -->
            <div class="cv-section">
              <h3 class="cv-sec-title">${locale === 'ar' ? 'ملخص مهني' : 'Professional Summary'}</h3>
              <p id="cv-summary">Highly analytical software developer with over 5 years of experience...</p>
            </div>

            <!-- Experience -->
            <div class="cv-section">
              <h3 class="cv-sec-title">${locale === 'ar' ? 'الخبرة المهنية' : 'Work Experience'}</h3>
              <div id="cv-experience">
                <!-- Injected via JS -->
              </div>
            </div>

            <!-- Education -->
            <div class="cv-section">
              <h3 class="cv-sec-title">${locale === 'ar' ? 'التعليم والشهادات' : 'Education'}</h3>
              <div id="cv-education">
                <!-- Injected via JS -->
              </div>
            </div>

            <!-- Skills -->
            <div class="cv-section">
              <h3 class="cv-sec-title">${locale === 'ar' ? 'المهارات واللغات' : 'Skills & Languages'}</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${locale === 'ar' ? 'المهارات الأساسية' : 'Key Skills'}</h4>
                  <div id="cv-skills-list" style="line-height:1.6;"></div>
                </div>
                <div>
                  <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${locale === 'ar' ? 'اللغات' : 'Languages'}</h4>
                  <div id="cv-langs-list" style="line-height:1.6;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      function addExpField() {
        const div = document.createElement('div');
        div.className = 'dynamic-group-box';
        div.innerHTML = \`
          <input type="text" class="in-exp-comp form-input" placeholder="${t.company}" style="margin-bottom: 8px;">
          <input type="text" class="in-exp-role form-input" placeholder="${t.role}" style="margin-bottom: 8px;">
          <input type="text" class="in-exp-dates form-input" placeholder="${t.dates}" style="margin-bottom: 8px;">
          <textarea class="in-exp-desc form-input" placeholder="${t.desc}" rows="3"></textarea>
        \`;
        document.getElementById('exp-fields-group').appendChild(div);
        updateLivePreview();
      }

      function addEduField() {
        const div = document.createElement('div');
        div.className = 'dynamic-group-box';
        div.innerHTML = \`
          <input type="text" class="in-edu-school form-input" placeholder="${t.school}" style="margin-bottom: 8px;">
          <input type="text" class="in-edu-degree form-input" placeholder="${t.degree}" style="margin-bottom: 8px;">
          <input type="text" class="in-edu-dates form-input" placeholder="${t.dates}" style="margin-bottom: 8px;">
        \`;
        document.getElementById('edu-fields-group').appendChild(div);
        updateLivePreview();
      }

      function updateLivePreview() {
        document.getElementById('cv-name').textContent = document.getElementById('in-name').value;
        document.getElementById('cv-title').textContent = document.getElementById('in-title').value;
        document.getElementById('cv-email').innerHTML = '<i class="fa-regular fa-envelope"></i> ' + document.getElementById('in-email').value;
        document.getElementById('cv-phone').innerHTML = '<i class="fa-solid fa-phone"></i> ' + document.getElementById('in-phone').value;
        document.getElementById('cv-summary').textContent = document.getElementById('in-summary').value;

        // Map Experience
        const expBoxes = document.querySelectorAll('#exp-fields-group .dynamic-group-box');
        let expHtml = '';
        expBoxes.forEach(box => {
          const comp = box.querySelector('.in-exp-comp').value;
          const role = box.querySelector('.in-exp-role').value;
          const dates = box.querySelector('.in-exp-dates').value;
          const desc = box.querySelector('.in-exp-desc').value;

          if (comp || role) {
            expHtml += \`
              <div class="cv-item" style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--text-dark);">
                  <span>\${role} - \${comp}</span>
                  <span style="font-weight: 500; font-size: 0.9rem; color: var(--text-muted);">\${dates}</span>
                </div>
                <p style="margin-top: 4px; font-size: 0.95rem;">\${desc}</p>
              </div>
            \`;
          }
        });
        document.getElementById('cv-experience').innerHTML = expHtml;

        // Map Education
        const eduBoxes = document.querySelectorAll('#edu-fields-group .dynamic-group-box');
        let eduHtml = '';
        eduBoxes.forEach(box => {
          const school = box.querySelector('.in-edu-school').value;
          const degree = box.querySelector('.in-edu-degree').value;
          const dates = box.querySelector('.in-edu-dates').value;

          if (school || degree) {
            eduHtml += \`
              <div class="cv-item" style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--text-dark);">
                  <span>\${degree}</span>
                  <span style="font-weight: 500; font-size: 0.9rem; color: var(--text-muted);">\${dates}</span>
                </div>
                <div style="font-size: 0.95rem; color: var(--text-main);">\${school}</div>
              </div>
            \`;
          }
        });
        document.getElementById('cv-education').innerHTML = eduHtml;

        // Map Skills & Languages
        document.getElementById('cv-skills-list').textContent = document.getElementById('in-skills').value;
        document.getElementById('cv-langs-list').textContent = document.getElementById('in-langs').value;
      }

      document.addEventListener('DOMContentLoaded', () => {
        updateLivePreview();
      });
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
})

// AI Cover Letter Generator Page
aiFeaturesRouter.get('/:locale/cover-letter-generator', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/cover-letter-generator');

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
The cover letter should be written in ${locale === 'ar' ? 'Arabic' : 'English'}.
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
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/work-permit-calculator');

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
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/turkish-test');

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
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/interview-prep');

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
The questions must be written in ${locale === 'ar' ? 'Arabic' : 'English'}.
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
        en: [
          `Tell me about your previous experience in "${role}" and how it qualifies you for this position.`,
          `What was the most challenging technical problem you faced as a "${role}" and how did you resolve it?`,
          `Why do you want to work in Istanbul and join our team?`
        ]
      }[locale === 'ar' ? 'ar' : 'en'];

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
The evaluation must be written in ${locale === 'ar' ? 'Arabic' : 'English'}.
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
