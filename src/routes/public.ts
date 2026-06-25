import { Hono } from 'hono'
import { cache } from 'hono/cache'
import { generateMetaTags, generateJsonLd } from '../utils/seo-helper'
import { validateJobSubmission, validateTurnstile, rateLimiter, logSecurityEvent } from '../middleware/security'
import { themeCss } from '../public/css/theme'
import { sendTelegramAlert } from '../services/telegram'
import { assignJobImage } from '../services/scraper'
import { optimizeSeoWithGemini } from '../services/gemini-seo'

export const publicRouter = new Hono()

// Serve our CSS file directly from the bundled memory
publicRouter.get('/css/theme.css', (c) => {
  return c.body(themeCss, 200, {
    'Content-Type': 'text/css',
    'Cache-Control': 'public, max-age=3600'
  })
})

// Base layout helper
export function renderLayout(c: any, title: string, contentHtml: string, locale: 'ar' | 'en', seoHtml: string = '') {
  const isRtl = locale === 'ar';

  const translations = {
    ar: {
      siteName: 'فرص عمل في إسطنبول',
      tagline: 'أفضل الوظائف في إسطنبول',
      findJob: 'ابحث عن وظيفتك',
      postJob: 'أعلن عن وظيفة',
      allJobs: 'كل الوظائف',
      about: 'من نحن',
      contact: 'اتصل بنا',
      copyright: '© ٢٠٢٦ فرص عمل في إسطنبول. جميع الحقوق محفوظة.',
      langLabel: 'English',
      langCode: 'en'
    },
    en: {
      siteName: 'Istanbul Jobs',
      tagline: 'Job Opportunities in Istanbul',
      findJob: 'Find a Job',
      postJob: 'Post a Job',
      allJobs: 'All Jobs',
      about: 'About Us',
      contact: 'Contact Us',
      copyright: '© 2026 Istanbul Jobs. All rights reserved.',
      langLabel: 'العربية',
      langCode: 'ar'
    }
  };

  const t = translations[locale];
  const oppositeLocale = locale === 'ar' ? 'en' : 'ar';
  const requestPath = c.req.path;

  // Calculate language switch URL
  let langSwitchUrl = `/${oppositeLocale}`;
  if (requestPath.includes('/jobs/')) {
    const slug = requestPath.split('/jobs/')[1];
    langSwitchUrl = `/${oppositeLocale}/jobs/${slug}`;
  } else if (requestPath.includes('/blog/')) {
    const slug = requestPath.split('/blog/')[1];
    langSwitchUrl = `/${oppositeLocale}/blog/${slug}`;
  } else if (requestPath.endsWith('/blog') || requestPath.endsWith('/blog/')) {
    langSwitchUrl = `/${oppositeLocale}/blog`;
  } else if (requestPath.includes('/insights')) {
    langSwitchUrl = `/${oppositeLocale}/insights`;
  }

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${seoHtml ? seoHtml : `<title>${title} | ${t.tagline}</title>`}
  
  <!-- Preconnect for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  
  <!-- Stylesheet -->
  <link rel="stylesheet" href="/css/theme.css">
  
  <!-- Critical inline CSS for zero flash -->
  <style>
    body { font-family: ${isRtl ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif"}; }
    .site-header { transform: translateY(0); }
  </style>
</head>
<body class="${isRtl ? 'rtl' : ''}">

  <!-- HEADER -->
  <header class="site-header" id="site-header">
    <div class="container header-inner" style="max-width:1360px">

      <!-- Logo -->
      <a href="/${locale}" class="logo">
        <div class="logo-icon">
          <i class="fa-solid fa-briefcase"></i>
        </div>
        <div class="logo-text">
          <strong>${locale === 'ar' ? 'فرص عمل في إسطنبول' : 'Jobs in Istanbul'}</strong>
          <span>${locale === 'ar' ? 'أفضل الوظائف الشاغرة' : 'Premium Job Board'}</span>
        </div>
      </a>

      <!-- Desktop Nav -->
      <nav id="desktop-nav">
        <style>
          .nav-dropdown {
            position: relative;
          }
          .nav-dropdown-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            box-shadow: var(--shadow-lg);
            min-width: 250px;
            padding: 8px 0;
            z-index: 1000;
            margin-top: 4px;
            animation: dropdownFade 0.2s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .nav-dropdown:hover .nav-dropdown-menu {
            display: block;
          }
          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-body);
            transition: var(--t-base);
          }
          .dropdown-item:hover {
            background: var(--primary-light);
            color: var(--primary);
          }
          .dropdown-item i {
            font-size: 0.95rem;
            width: 18px;
            text-align: center;
            opacity: 0.8;
          }
          @keyframes dropdownFade {
            from { opacity: 0; transform: translate(-50%, 8px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        </style>
        <ul class="nav-links">
          <li><a href="/${locale}" class="nav-link">${locale === 'ar' ? '🏠 الرئيسية' : '🏠 Home'}</a></li>
          
          <!-- Dropdown: AI Tools -->
          <li class="nav-dropdown">
            <a href="#" class="nav-link" onclick="event.preventDefault()">${locale === 'ar' ? '🤖 أدوات AI ▾' : '🤖 AI Tools ▾'}</a>
            <div class="nav-dropdown-menu">
              <a href="/${locale}/cv-optimizer" class="dropdown-item">
                <i class="fa-solid fa-wand-magic-sparkles" style="color: var(--primary);"></i>
                <span>${locale === 'ar' ? 'تحسين السيرة بالذكاء الاصطناعي' : 'AI CV Optimizer'}</span>
              </a>
              <a href="/${locale}/cover-letter-generator" class="dropdown-item">
                <i class="fa-solid fa-pen-nib" style="color: var(--accent);"></i>
                <span>${locale === 'ar' ? 'توليد رسائل التغطية بالذكاء الاصطناعي' : 'AI Cover Letter Generator'}</span>
              </a>
              <a href="/${locale}/interview-prep" class="dropdown-item">
                <i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i>
                <span>${locale === 'ar' ? 'محاكي مقابلات التوظيف بالذكاء الاصطناعي' : 'AI Interview Simulator'}</span>
              </a>
            </div>
          </li>

          <!-- Dropdown: Career & Rules -->
          <li class="nav-dropdown">
            <a href="#" class="nav-link" onclick="event.preventDefault()">${locale === 'ar' ? '🛠 الأدوات والتقييمات ▾' : '🛠 Tools & Tests ▾'}</a>
            <div class="nav-dropdown-menu">
              <a href="/${locale}/resume-builder" class="dropdown-item">
                <i class="fa-solid fa-file-invoice" style="color: #eab308;"></i>
                <span>${locale === 'ar' ? 'منشئ السيرة الذاتية التفاعلي' : 'Interactive CV Builder'}</span>
              </a>
              <a href="/${locale}/work-permit-calculator" class="dropdown-item">
                <i class="fa-solid fa-passport" style="color: #a855f7;"></i>
                <span>${locale === 'ar' ? 'حاسبة إذن العمل والجنسية' : 'Work Permit & Citizenship Calculator'}</span>
              </a>
              <a href="/${locale}/turkish-test" class="dropdown-item">
                <i class="fa-solid fa-graduation-cap" style="color: #14b8a6;"></i>
                <span>${locale === 'ar' ? 'اختبار اللغة التركية للعمل' : 'Business Turkish Level Test'}</span>
              </a>
              <a href="/${locale}/salary-calculator" class="dropdown-item">
                <i class="fa-solid fa-scale-balanced" style="color: #ec4899;"></i>
                <span>${locale === 'ar' ? 'مؤشر رواتب إسطنبول ٢٠٢٦' : 'Istanbul Salary Estimator'}</span>
              </a>
            </div>
          </li>
          
          <li><a href="/${locale}/insights" class="nav-link">${locale === 'ar' ? '📊 إحصائيات السوق' : '📊 Market Insights'}</a></li>
          <li><a href="/${locale}/blog" class="nav-link">${locale === 'ar' ? '📝 مدونة المهنة' : '📝 Career Blog'}</a></li>
          <li><a href="/${locale}/candidate/dashboard" class="nav-link" style="color: var(--primary);"><i class="fa-solid fa-graduation-cap"></i> ${locale === 'ar' ? 'بوابة الباحث' : 'Candidate Portal'}</a></li>
          <li><a href="/${locale}/employer/dashboard" class="nav-link nav-cta"><i class="fa-solid fa-user-tie"></i> ${locale === 'ar' ? 'بوابة الأعمال' : 'Employer Portal'}</a></li>
        </ul>
      </nav>

      <!-- Header Actions -->
      <div class="header-actions">
        <a href="/${locale}?favorites=1" class="icon-btn" title="${locale === 'ar' ? 'المفضلة' : 'Saved Jobs'}">
          <i class="fa-regular fa-heart"></i>
          <span class="badge" id="fav-count-badge">0</span>
        </a>
        <button id="dark-mode-toggle" class="icon-btn" title="${locale === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}">
          <i class="fa-solid fa-moon"></i>
        </button>
        <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" class="header-telegram-btn" title="${locale === 'ar' ? 'انضم لقناة التلغرام' : 'Join Telegram Channel'}">
          <i class="fa-brands fa-telegram"></i>
          <span>${locale === 'ar' ? 'تلغرام' : 'Telegram'}</span>
        </a>
        <a href="${langSwitchUrl}" class="lang-btn">
          <i class="fa-solid fa-globe"></i> ${t.langLabel}
        </a>
        <!-- Mobile hamburger -->
        <button class="icon-btn" id="mobile-menu-btn" style="display:none">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>

    </div>
  </header>

  <!-- Mobile Nav Drawer -->
  <div id="mobile-nav" style="display:none; position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.5)" onclick="closeMobileNav(this,event)">
    <div style="position:absolute; ${isRtl ? 'right:0' : 'left:0'}; top:0; bottom:0; width:min(300px,85vw); background:var(--bg-card); padding:24px; overflow-y:auto; box-shadow:var(--shadow-xl); animation: slideIn${isRtl ? 'Right' : 'Left'} 0.3s var(--ease-out);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
        <a href="/${locale}" class="logo" style="font-size:1.2rem">
          <div class="logo-icon"><i class="fa-solid fa-briefcase"></i></div>
          <div class="logo-text"><strong>${locale === 'ar' ? 'فرص عمل في إسطنبول' : 'Jobs in Istanbul'}</strong></div>
        </a>
        <button onclick="document.getElementById('mobile-nav').style.display='none'" class="icon-btn"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <nav style="display:flex; flex-direction:column; gap:6px;">
        <a href="/${locale}" style="padding:12px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'">🏠 ${locale === 'ar' ? 'الرئيسية' : 'Home'}</a>
        <a href="/${locale}/insights" style="padding:12px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'">📊 ${locale === 'ar' ? 'إحصائيات السوق' : 'Market Insights'}</a>
        <a href="/${locale}/blog" style="padding:12px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'">📝 ${locale === 'ar' ? 'مدونة المهنة' : 'Career Blog'}</a>
        
        <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-top:14px; margin-bottom:6px; padding-inline-start:16px; letter-spacing:0.05em;">🤖 ${locale === 'ar' ? 'أدوات الذكاء الاصطناعي' : 'AI Assistant Tools'}</div>
        <a href="/${locale}/cv-optimizer" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--primary);"></i> ${locale === 'ar' ? 'تحسين السيرة الذاتية' : 'AI CV Optimizer'}</a>
        <a href="/${locale}/cover-letter-generator" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-pen-nib" style="color: var(--accent);"></i> ${locale === 'ar' ? 'مولد رسائل التغطية' : 'Cover Letter Generator'}</a>
        <a href="/${locale}/interview-prep" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i> ${locale === 'ar' ? 'محاكي المقابلات' : 'AI Interview Prep'}</a>

        <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-top:14px; margin-bottom:6px; padding-inline-start:16px; letter-spacing:0.05em;">🛠 ${locale === 'ar' ? 'التقييمات والحسابات' : 'Calculators & Tests'}</div>
        <a href="/${locale}/resume-builder" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-file-invoice" style="color: #eab308;"></i> ${locale === 'ar' ? 'منشئ السيرة التفاعلي' : 'CV Builder'}</a>
        <a href="/${locale}/work-permit-calculator" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-passport" style="color: #a855f7;"></i> ${locale === 'ar' ? 'حاسبة إذن العمل' : 'Work Permit Eligibility'}</a>
        <a href="/${locale}/turkish-test" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-graduation-cap" style="color: #14b8a6;"></i> ${locale === 'ar' ? 'اختبار اللغة التركية للعمل' : 'Turkish Competency Test'}</a>
        <a href="/${locale}/salary-calculator" style="padding:10px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-scale-balanced" style="color: #ec4899;"></i> ${locale === 'ar' ? 'مؤشر الرواتب' : 'Salary Estimator'}</a>

        <div style="margin-top:14px; border-top:1px solid var(--border); padding-top:10px; display:flex; flex-direction:column; gap:6px;">
          <a href="/${locale}/submit-job" style="padding:12px 16px; border-radius:var(--r-md); color:var(--text-heading); font-weight:600; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'">📢 ${locale === 'ar' ? 'نشر وظيفة' : 'Post a Job'}</a>
          <a href="/${locale}/candidate/dashboard" style="padding:12px 16px; border-radius:var(--r-md); color:var(--primary); font-weight:700; display:flex; align-items:center; gap:10px; transition:var(--t-base);" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'"><i class="fa-solid fa-graduation-cap"></i> ${locale === 'ar' ? 'بوابة الباحث عن عمل' : 'Candidate Portal'}</a>
          <a href="/${locale}/employer/dashboard" style="margin-top:6px; padding:14px 16px; border-radius:var(--r-md); background:var(--primary); color:white; font-weight:700; display:flex; align-items:center; gap:10px; justify-content:center;"><i class="fa-solid fa-user-tie"></i> ${locale === 'ar' ? 'بوابة الأعمال' : 'Employer Portal'}</a>
        </div>
        
        <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" style="margin-top:12px; display:flex; align-items:center; justify-content:center; gap:8px; background:#0088cc; color:white; padding:12px; border-radius:var(--r-md); font-weight:700; font-size:0.875rem; text-decoration:none; box-shadow:0 4px 12px rgba(0, 136, 204, 0.15);">
          <i class="fa-brands fa-telegram" style="font-size:1.2rem;"></i>
          ${locale === 'ar' ? 'انضم لقناتنا على تلغرام' : 'Join Our Telegram'}
        </a>

        <!-- Mobile Actions inside Drawer -->
        <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--border); display:flex; gap:10px; justify-content:space-between; align-items:center;">
          <a href="${langSwitchUrl}" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px 14px; border-radius:var(--r-full); border:1.5px solid var(--border); font-size:0.82rem; font-weight:700; color:var(--text-body); transition:var(--t-base);">
            <i class="fa-solid fa-globe"></i> ${t.langLabel}
          </a>
          <button id="dark-mode-toggle-mobile" style="width:40px; height:40px; border-radius:var(--r-md); border:1.5px solid var(--border); display:flex; align-items:center; justify-content:center; color:var(--text-body); cursor:pointer; transition:var(--t-base);" title="${locale === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}">
            <i class="fa-solid fa-moon"></i>
          </button>
        </div>
      </nav>
    </div>
  </div>

  <main>
    ${contentHtml}
  </main>

  <!-- FOOTER -->
  <footer class="site-footer">
    <div class="container footer-inner" style="max-width:1360px">
      <div class="footer-brand">
        <div class="logo" style="margin-bottom:16px; color:white;">
          <div class="logo-icon"><i class="fa-solid fa-briefcase"></i></div>
          <div class="logo-text" style="color:white;">
            <strong style="color:white;">${locale === 'ar' ? 'وظائف إسطنبول' : 'Istanbul Jobs'}</strong>
            <span style="color:rgba(255,255,255,0.5);">${locale === 'ar' ? 'فرص عمل حقيقية' : 'Real Opportunities'}</span>
          </div>
        </div>
        <p>${locale === 'ar' ? 'المنصة الرائدة في توصيل المواهب العربية والدولية بأفضل فرص العمل في إسطنبول.' : 'The leading platform connecting Arab & international talents with the best job opportunities in Istanbul.'}</p>
        <div class="footer-social">
          <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" class="social-btn" title="Telegram"><i class="fa-brands fa-telegram"></i></a>
          <a href="#" class="social-btn" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
          <a href="#" class="social-btn" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" class="social-btn" title="X / Twitter"><i class="fa-brands fa-x-twitter"></i></a>
        </div>
      </div>
      <div class="footer-links-group">
        <ul class="footer-links">
          <li class="footer-col-title">${locale === 'ar' ? 'الموقع' : 'Platform'}</li>
          <li><a href="/${locale}">${locale === 'ar' ? 'جميع الوظائف' : 'All Jobs'}</a></li>
          <li><a href="/${locale}/blog">${locale === 'ar' ? 'مدونة المهنة' : 'Career Blog'}</a></li>
          <li><a href="/${locale}/insights">${locale === 'ar' ? 'إحصائيات السوق' : 'Market Insights'}</a></li>
          <li><a href="/${locale}/about">${locale === 'ar' ? 'من نحن' : 'About Us'}</a></li>
          <li><a href="/${locale}/contact">${locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}</a></li>
          <li><a href="/${locale}/submit-job">${locale === 'ar' ? 'نشر وظيفة' : 'Post a Job'}</a></li>
        </ul>
        <ul class="footer-links">
          <li class="footer-col-title">${locale === 'ar' ? 'أدوات ذكية' : 'Smart Tools'}</li>
          <li><a href="/${locale}/cv-optimizer">${locale === 'ar' ? 'تحسين السيرة بالذكاء الاصطناعي' : 'AI CV Optimizer'}</a></li>
          <li><a href="/${locale}/resume-builder">${locale === 'ar' ? 'منشئ السيرة الذاتية' : 'Resume Builder'}</a></li>
          <li><a href="/${locale}/salary-calculator">${locale === 'ar' ? 'حاسبة ومؤشر الرواتب' : 'Salary Estimator'}</a></li>
        </ul>
        <ul class="footer-links">
          <li class="footer-col-title">${locale === 'ar' ? 'شروط وخصوصية' : 'Legal'}</li>
          <li><a href="/${locale}/privacy">${locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a></li>
          <li><a href="/${locale}/terms">${locale === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}</a></li>
          <li><a href="mailto:info@jobs-in-istanbul.com"><i class="fa-solid fa-envelope" style="margin-inline-end:6px;opacity:.6"></i>info@jobs-in-istanbul.com</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom" style="max-width:1360px">
      <p>${t.copyright}</p>
      <div style="display:flex;gap:16px;">
        <a href="${langSwitchUrl}" style="opacity:.6;font-size:.82rem;"><i class="fa-solid fa-globe"></i> ${t.langLabel}</a>
      </div>
    </div>
  </footer>

  <style>
    @keyframes slideInLeft  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    @keyframes slideInRight { from { transform: translateX(100%); }  to { transform: translateX(0); } }
    
    .header-telegram-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #0088cc;
      color: white !important;
      padding: 8px 14px;
      border-radius: var(--r-full);
      font-size: 0.82rem;
      font-weight: 700;
      transition: var(--t-base);
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(0, 136, 204, 0.15);
    }
    .header-telegram-btn:hover {
      background: #1d90f3;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 136, 204, 0.25);
    }
    @media (max-width: 768px) {
      .header-telegram-btn span {
        display: none;
      }
      .header-telegram-btn {
        padding: 8px;
        width: 36px;
        height: 36px;
        justify-content: center;
        border-radius: 50%;
      }
    }
  </style>

  <script>
    // ---- Favorites ----
    function getFavorites() {
      try { return JSON.parse(localStorage.getItem('fav_jobs') || '[]'); } catch { return []; }
    }
    function toggleFavorite(jobId, event) {
      if (event) { event.preventDefault(); event.stopPropagation(); }
      let favs = getFavorites();
      const index = favs.indexOf(jobId);
      const btns = document.querySelectorAll('.btn-fav[data-job-id="' + jobId + '"]');
      let isAdded = false;
      if (index > -1) {
        favs.splice(index, 1);
        btns.forEach(btn => {
          btn.classList.remove('active');
          const icon = btn.querySelector('i');
          if (icon) icon.className = 'fa-regular fa-heart';
        });
      } else {
        favs.push(jobId);
        isAdded = true;
        btns.forEach(btn => {
          btn.classList.add('active');
          const icon = btn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-heart';
        });
      }
      localStorage.setItem('fav_jobs', JSON.stringify(favs));
      updateFavCounter();
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('favorites') === '1' && !isAdded) {
        const card = document.querySelector('.job-card[data-job-id="' + jobId + '"]');
        if (card) { card.style.display = 'none'; }
      }
    }
    function updateFavCounter() {
      const count = getFavorites().length;
      const badge = document.getElementById('fav-count-badge');
      if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
    }

    // ---- SPA Filtering ----
    async function fetchFilteredJobs(url) {
      const jobsList = document.querySelector('.jobs-list');
      const countLabel = document.querySelector('.jobs-count');
      if (!jobsList) return;
      jobsList.style.opacity = '0.45';
      jobsList.style.transition = 'opacity 0.2s ease';
      try {
        const res = await fetch(url);
        const htmlText = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const newJobsList = doc.querySelector('.jobs-list');
        const newCountLabel = doc.querySelector('.jobs-count');
        if (newJobsList) {
          jobsList.innerHTML = newJobsList.innerHTML;
          const favs = getFavorites();
          favs.forEach(id => {
            const btns = document.querySelectorAll('.btn-fav[data-job-id="' + id + '"]');
            btns.forEach(btn => { btn.classList.add('active'); const icon = btn.querySelector('i'); if (icon) icon.className = 'fa-solid fa-heart'; });
          });
        }
        if (countLabel && newCountLabel) countLabel.innerHTML = newCountLabel.innerHTML;
        const newDistGrid = doc.querySelector('.district-grid');
        const oldDistGrid = document.querySelector('.district-grid');
        if (oldDistGrid && newDistGrid) { oldDistGrid.innerHTML = newDistGrid.innerHTML; setupDistrictClickListeners(); }
        window.history.pushState({}, '', url);
      } catch (err) { console.error('Error filtering jobs:', err); }
      finally { jobsList.style.opacity = '1'; }
    }

    function setupDistrictClickListeners() {
      document.querySelectorAll('.district-card').forEach(card => {
        card.addEventListener('click', (e) => { e.preventDefault(); const href = card.getAttribute('href'); fetchFilteredJobs(href); });
      });
    }

    // ---- Mobile Nav ----
    function closeMobileNav(overlay, event) {
      if (event.target === overlay) overlay.style.display = 'none';
    }

    // ---- Init ----
    document.addEventListener('DOMContentLoaded', () => {
      // Favorites
      const favs = getFavorites();
      favs.forEach(id => {
        const btns = document.querySelectorAll('.btn-fav[data-job-id="' + id + '"]');
        btns.forEach(btn => { btn.classList.add('active'); const icon = btn.querySelector('i'); if (icon) icon.className = 'fa-solid fa-heart'; });
      });
      updateFavCounter();

      // Fav filter page
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('favorites') === '1') {
        const jobCards = document.querySelectorAll('.job-card');
        let visibleCount = 0;
        jobCards.forEach(card => {
          const jobId = card.getAttribute('data-job-id');
          if (favs.includes(jobId)) { card.style.display = 'grid'; visibleCount++; }
          else card.style.display = 'none';
        });
        const countLabel = document.querySelector('.jobs-count');
        if (countLabel) countLabel.innerHTML = '<strong>' + visibleCount + '</strong> ${locale === 'ar' ? 'وظيفة محفوظة' : 'saved jobs'}';
      }

      // Dark Mode
      const darkToggle = document.getElementById('dark-mode-toggle');
      const darkToggleMobile = document.getElementById('dark-mode-toggle-mobile');
      if (darkToggle || darkToggleMobile) {
        const applyTheme = (isDark) => {
          document.body.classList.toggle('dark-mode', isDark);
          const iconHtml = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
          if (darkToggle) darkToggle.innerHTML = iconHtml;
          if (darkToggleMobile) darkToggleMobile.innerHTML = iconHtml;
        };
        const toggleAction = () => {
          const isDark = !document.body.classList.contains('dark-mode');
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
          applyTheme(isDark);
        };
        if (darkToggle) darkToggle.addEventListener('click', toggleAction);
        if (darkToggleMobile) darkToggleMobile.addEventListener('click', toggleAction);
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) applyTheme(true);
      }

      // Sticky header scroll effect
      const header = document.getElementById('site-header');
      if (header) {
        window.addEventListener('scroll', () => {
          header.classList.toggle('scrolled', window.scrollY > 10);
        }, { passive: true });
      }

      // Mobile menu btn show on small screens
      const mobileBtn = document.getElementById('mobile-menu-btn');
      const desktopNav = document.getElementById('desktop-nav');
      const mobileNav = document.getElementById('mobile-nav');
      const checkWidth = () => {
        if (window.innerWidth <= 768) {
          mobileBtn.style.display = 'flex';
          if (desktopNav) desktopNav.style.display = 'none';
        } else {
          mobileBtn.style.display = 'none';
          if (desktopNav) desktopNav.style.display = '';
          if (mobileNav) mobileNav.style.display = 'none';
        }
      };
      checkWidth();
      window.addEventListener('resize', checkWidth, { passive: true });
      if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', () => { mobileNav.style.display = 'block'; });
      }

      // SPA Filters
      const filterForm = document.querySelector('.filters-sidebar form');
      if (filterForm) {
        filterForm.querySelectorAll('input').forEach(input => {
          input.addEventListener('change', () => {
            const formData = new FormData(filterForm);
            const params = new URLSearchParams(formData);
            const action = filterForm.getAttribute('action') || window.location.pathname;
            fetchFilteredJobs(action + '?' + params.toString());
          });
        });
      }

      const searchForm = document.querySelector('.search-card');
      if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const query = searchForm.querySelector('input[name="search"]').value;
          const url = new URL(window.location.href);
          url.searchParams.set('search', query);
          fetchFilteredJobs(url.pathname + url.search);
        });
      }

      setupDistrictClickListeners();

      // Active nav link
      const currentPath = window.location.pathname;
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPath);
      });

      // Quick search tags
      document.querySelectorAll('.sq-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const input = document.querySelector('input[name="search"]');
          if (input) { input.value = tag.textContent.trim(); const form = input.closest('form'); if (form) form.dispatchEvent(new Event('submit', {bubbles:true})); }
        });
      });

      // Category cards SPA
      document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', (e) => { e.preventDefault(); fetchFilteredJobs(card.getAttribute('href')); });
      });
    });

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        const msg = document.createElement('div');
        msg.textContent = '${locale === 'ar' ? '✅ تم نسخ الرابط!' : '✅ Link copied!'}';
        msg.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text-heading);color:white;padding:10px 24px;border-radius:var(--r-full);font-weight:600;z-index:9999;font-size:.9rem;box-shadow:var(--shadow-lg);';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2500);
      });
    }
  </script>
</body>
</html>`;
}

// Redirect root to default language (ar)
publicRouter.get('/', (c) => {
  const acceptLang = c.req.header('Accept-Language') || '';
  const lang = acceptLang.toLowerCase().includes('en') ? 'en' : 'ar';
  return c.redirect(`/${lang}`);
})

// Homepage for listing jobs
const homeHandler = async (c: any, locale: 'ar' | 'en') => {
  const db = c.env.DB;

  // Get query parameters
  const querySearch = c.req.query('search') || '';
  const queryCategory = c.req.query('category') || '';
  const queryJobType = c.req.query('type') || '';
  const queryDistrict = c.req.query('district') || '';
  const queryTransit = c.req.query('transit') || '';

  // 1. Fetch Categories
  const catRows = await db.prepare(
    `SELECT id, slug, data FROM documents WHERE type_id = 'categories' AND status = 'published' AND is_published = 1`
  ).all();

  const categories = (catRows.results || []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    ...JSON.parse(row.data)
  }));

  // 2. Fetch Companies
  const compRows = await db.prepare(
    `SELECT id, slug, data FROM documents WHERE type_id = 'companies' AND status = 'published' AND is_published = 1`
  ).all();

  const companiesMap = new Map();
  for (const row of compRows.results || []) {
    companiesMap.set(row.id, {
      id: row.id,
      slug: row.slug,
      ...JSON.parse(row.data)
    });
  }

  // 3. Build Jobs Query with Filters
  let sql = `
    SELECT j.id, j.slug, j.data, j.published_at
    FROM documents j
    WHERE j.type_id = 'jobs' AND j.status = 'published' AND j.is_published = 1
  `;

  const params: any[] = [];

  // Filter by Category
  if (queryCategory) {
    sql += ` AND EXISTS (
      SELECT 1 FROM document_references ref 
      WHERE ref.from_document_id = j.id AND ref.field_name = 'category' AND ref.to_root_id = ?
    )`;
    params.push(queryCategory);
  }

  // Filter by Job Type
  if (queryJobType) {
    sql += ` AND json_extract(j.data, '$.jobType') = ?`;
    params.push(queryJobType);
  }

  sql += ` ORDER BY j.published_at DESC`;

  const jobRows = await db.prepare(sql).bind(...params).all();

  let jobs = (jobRows.results || []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    publishedAt: row.published_at,
    ...JSON.parse(row.data)
  }));

  // Filter by Keyword (search) client-side or parse company logos
  if (querySearch) {
    const kw = querySearch.toLowerCase();
    jobs = jobs.filter((job: any) =>
      job.title_ar.toLowerCase().includes(kw) ||
      job.title_en.toLowerCase().includes(kw) ||
      job.description_ar.toLowerCase().includes(kw) ||
      job.description_en.toLowerCase().includes(kw) ||
      job.location_ar.toLowerCase().includes(kw) ||
      job.location_en.toLowerCase().includes(kw)
    );
  }

  // Filter by District client-side
  if (queryDistrict) {
    const kw = queryDistrict.toLowerCase();
    jobs = jobs.filter((job: any) =>
      job.location_ar.toLowerCase().includes(kw) ||
      job.location_en.toLowerCase().includes(kw)
    );
  }

  // Filter by Transit line
  if (queryTransit && queryTransit !== 'all') {
    jobs = jobs.filter((job: any) => job.transitLine === queryTransit);
  }

  // Map company & category relations to job
  for (const job of jobs) {
    job.companyObj = companiesMap.get(job.company) || { name: job.company || 'Company', logo: '' };
    job.categoryObj = categories.find((c: any) => c.id === job.category) || { name_ar: '', name_en: '' };
  }

  // Translations
  const t = {
    ar: {
      heroTitle: 'اعثر على وظيفتك المستقبلية في إسطنبول',
      heroSubtitle: 'فرص عمل مميزة للعرب والأجانب في مختلف القطاعات بمدينة إسطنبول الكبرى',
      searchPlh: 'ابحث عن مسمى وظيفي، كلمات مفتاحية...',
      locPlh: 'كل المناطق',
      allCats: 'جميع التصنيفات',
      filterTitle: 'تصفية النتائج',
      jobType: 'نوع العمل',
      fullTime: 'دوام كامل',
      partTime: 'دوام جزئي',
      remote: 'عمل عن بعد',
      internship: 'تدريب عملي',
      resultsCount: `تم العثور على ${jobs.length} وظيفة شاغرة`,
      featuredBadge: 'مميزة',
      applyBtn: 'تقدم الآن',
      noJobs: 'لا توجد وظائف تطابق خيارات البحث الحالية.'
    },
    en: {
      heroTitle: 'Find Your Next Job in Istanbul',
      heroSubtitle: 'Premium job vacancies for locals and internationals in Istanbul metropolitan area',
      searchPlh: 'Search job title, keywords...',
      locPlh: 'All districts',
      allCats: 'All categories',
      filterTitle: 'Filter Results',
      jobType: 'Job Type',
      fullTime: 'Full Time',
      partTime: 'Part Time',
      remote: 'Remote',
      internship: 'Internship',
      resultsCount: `Found ${jobs.length} vacant jobs`,
      featuredBadge: 'Featured',
      applyBtn: 'Apply Now',
      noJobs: 'No jobs match your search filters.'
    }
  }[locale];

  // Render Categories HTML
  const categoriesHtml = categories.map((cat: any) => {
    const name = locale === 'ar' ? cat.name_ar : cat.name_en;
    const activeClass = queryCategory === cat.id ? 'active' : '';
    return `<a href="/${locale}?category=${cat.id}" class="category-card ${activeClass}">
      <div class="cat-emoji">${cat.icon || '💼'}</div>
      <div class="category-name">${name}</div>
    </a>`;
  }).join('');

  // Render Jobs HTML
  const jobsHtml = jobs.length > 0 ? jobs.map((job: any) => {
    const title = locale === 'ar' ? job.title_ar : job.title_en;
    const location = locale === 'ar' ? job.location_ar : job.location_en;
    const typeKey = job.jobType === 'full-time' ? 'fullTime' : job.jobType === 'part-time' ? 'partTime' : job.jobType === 'remote' ? 'remote' : 'internship';
    const typeLabel = t[typeKey];
    const isRemote = job.jobType === 'remote';
    const timeAgo = new Date(job.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const logoPlaceholder = job.companyObj.name.charAt(0).toUpperCase();
    const isNew = (Date.now() - new Date(job.publishedAt).getTime()) < 3 * 24 * 60 * 60 * 1000;

    return `
    <div class="job-card ${job.featured ? 'featured' : ''}" data-job-id="${job.id}">
      <div class="co-logo">
        ${job.companyObj.logo
        ? `<img src="${job.companyObj.logo}" alt="${job.companyObj.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<span>${logoPlaceholder}</span>';">`
        : `<span>${logoPlaceholder}</span>`}
      </div>
      <div class="job-body">
        <div class="job-top">
          <div class="job-title-wrap">
            <a href="/${locale}/jobs/${job.slug}" class="job-card-title">${title}</a>
            ${job.featured ? `<span class="job-badge badge-featured">⭐ ${t.featuredBadge}</span>` : ''}
            ${isNew && !job.featured ? `<span class="job-badge badge-new">${locale === 'ar' ? 'جديد' : 'New'}</span>` : ''}
          </div>
          <button class="btn-fav" data-job-id="${job.id}" onclick="toggleFavorite('${job.id}', event)" title="${locale === 'ar' ? 'حفظ في المفضلة' : 'Save to Favorites'}">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
        <div class="job-company">${job.companyObj.name}</div>
        <div class="job-tags">
          <span class="jtag jtag-type">${typeLabel}</span>
          <span class="jtag jtag-loc"><i class="fa-solid fa-location-dot"></i> ${location}</span>
          ${isRemote ? `<span class="jtag jtag-remote"><i class="fa-solid fa-wifi"></i> ${locale === 'ar' ? 'عن بُعد' : 'Remote'}</span>` : ''}
          <span class="jtag jtag-lang"><i class="fa-solid fa-language"></i> ${job.language === 'both' ? (locale === 'ar' ? 'ثنائي اللغة' : 'Bilingual') : (job.language || 'TR').toUpperCase()}</span>
        </div>
        <div class="job-footer">
          <div class="job-meta">
            <span class="job-meta-item"><i class="fa-regular fa-clock"></i> ${timeAgo}</span>
            ${job.salary ? `<span class="job-salary"><i class="fa-solid fa-turkish-lira-sign"></i> ${job.salary}</span>` : ''}
          </div>
          <a href="/${locale}/jobs/${job.slug}" class="btn-apply">${t.applyBtn} <i class="fa-solid fa-arrow-${locale === 'ar' ? 'left' : 'right'}"></i></a>
        </div>
      </div>
    </div>`;
  }).join('') : `<div class="jobs-empty">
    <i class="fa-solid fa-magnifying-glass-minus"></i>
    <p>${t.noJobs}</p>
    <a href="/${locale}">${locale === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset filters'}</a>
  </div>`;

  const html = `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-grid"></div>
      <div class="container hero-content">
        <div class="hero-eyebrow animate-fadeup">
          <span class="live-dot"></span>
          ${locale === 'ar' ? 'أكثر من 500 وظيفة في إسطنبول الآن' : 'Over 500 jobs in Istanbul right now'}
        </div>
        <h1 class="hero-title animate-fadeup animate-delay-1">
          ${locale === 'ar'
      ? `اعثر على وظيفتك <span class="gradient-word">المثالية</span><br>في إسطنبول`
      : `Find Your <span class="gradient-word">Dream Job</span><br>in Istanbul`
    }
        </h1>
        <p class="hero-subtitle animate-fadeup animate-delay-2">${t.heroSubtitle}</p>
        <div class="hero-stats animate-fadeup animate-delay-3">
          <div class="hero-stat">
            <div class="hero-stat-value">${jobs.length}+</div>
            <div class="hero-stat-label">${locale === 'ar' ? 'وظيفة شاغرة' : 'Open Positions'}</div>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <div class="hero-stat-value">${categories.length}+</div>
            <div class="hero-stat-label">${locale === 'ar' ? 'قطاع مهني' : 'Sectors'}</div>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <div class="hero-stat-value">100%</div>
            <div class="hero-stat-label">${locale === 'ar' ? 'وظائف موثوقة' : 'Verified Jobs'}</div>
          </div>
        </div>
      </div>
    </section>

    <div class="container" style="max-width:1360px">

      <!-- SEARCH -->
      <div class="search-section">
        <form class="search-card" method="GET" action="/${locale}">
          <div class="search-field-wrap">
            <i class="fa-solid fa-magnifying-glass s-icon"></i>
            <input type="text" name="search" placeholder="${t.searchPlh}" value="${querySearch}" autocomplete="off">
          </div>
          <button type="submit" class="btn-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            ${locale === 'ar' ? 'بحث' : 'Search'}
          </button>
        </form>
        <div class="search-quick-tags">
          <span class="sq-label">${locale === 'ar' ? 'بحث سريع:' : 'Quick search:'}</span>
          ${locale === 'ar'
      ? ['مطوّر', 'محاسب', 'ترجمة', 'فندقي', 'مبيعات'].map(k => `<span class="sq-tag">${k}</span>`).join('')
      : ['Developer', 'Accountant', 'Sales', 'Hotel', 'Marketing'].map(k => `<span class="sq-tag">${k}</span>`).join('')
    }
        </div>
      </div>

      <!-- CATEGORIES -->
      <section class="categories-sec">
        <div class="sec-header">
          <h2 class="sec-title">${locale === 'ar' ? 'تصفح بالقطاعات' : 'Browse by Sector'}</h2>
          ${queryCategory ? `<a href="/${locale}" class="sec-link">${locale === 'ar' ? 'عرض الكل' : 'View all'} <i class="fa-solid fa-arrow-${locale === 'ar' ? 'left' : 'right'}"></i></a>` : ''}
        </div>
        <div class="categories-grid">
          ${categoriesHtml}
        </div>
      </section>

      <!-- TRANSIT CHIPS -->
      <section class="chips-section" style="margin-bottom:40px">
        <div class="sec-header">
          <h2 class="sec-title">${locale === 'ar' ? 'خطوط المواصلات' : 'Transit Lines'}</h2>
        </div>
        <div class="chips-group">
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}" class="chip ${!queryTransit || queryTransit === 'all' ? 'active' : ''}">
            <span class="chip-icon">🚇</span> ${locale === 'ar' ? 'جميع الخطوط' : 'All Lines'}
          </a>
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}&transit=metrobus" class="chip ${queryTransit === 'metrobus' ? 'active' : ''}">
            <span class="chip-icon">🚌</span> ${locale === 'ar' ? 'متروبوس (E-5)' : 'Metrobus (E-5)'}
          </a>
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}&transit=m2" class="chip ${queryTransit === 'm2' ? 'active' : ''}">
            <span class="chip-icon">🚇</span> M2 ${locale === 'ar' ? '(تقسيم/شيشلي)' : '(Taksim/Sisli)'}
          </a>
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}&transit=m4" class="chip ${queryTransit === 'm4' ? 'active' : ''}">
            <span class="chip-icon">🚇</span> M4 ${locale === 'ar' ? '(الجانب الآسيوي)' : '(Asian Side)'}
          </a>
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}&transit=m11" class="chip ${queryTransit === 'm11' ? 'active' : ''}">
            <span class="chip-icon">✈️</span> M11 ${locale === 'ar' ? '(مطار إسطنبول)' : '(Airport)'}
          </a>
        </div>
      </section>

      <!-- DISTRICTS -->
      <section class="chips-section" style="margin-bottom:48px">
        <div class="sec-header">
          <h2 class="sec-title">${locale === 'ar' ? 'البحث بالأحياء' : 'Filter by District'}</h2>
        </div>
        <div class="district-grid">
          <a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}" class="district-card ${!queryDistrict ? 'active' : ''}">
            ${locale === 'ar' ? 'الكل' : 'All'}
          </a>
          ${['Fatih', 'Sisli', 'Basaksehir', 'Esenyurt', 'Kadikoy', 'Besiktas', 'Beylikduzu', 'Uskudar', 'Zeytinburnu'].map(dist => {
      const name = locale === 'ar' ? ({ 'Fatih': 'الفاتح', 'Sisli': 'شيشلي', 'Basaksehir': 'باشاك شهير', 'Esenyurt': 'إسنيورت', 'Kadikoy': 'كاديكوي', 'Besiktas': 'بشيكتاش', 'Beylikduzu': 'بيليك دوزو', 'Uskudar': 'أوسكودار', 'Zeytinburnu': 'زيتون بورنو' }[dist] || dist) : dist;
      return `<a href="/${locale}?search=${querySearch}&category=${queryCategory}&type=${queryJobType}&district=${dist}" class="district-card ${queryDistrict.toLowerCase() === dist.toLowerCase() ? 'active' : ''}">${name}</a>`;
    }).join('')}
        </div>
      </section>

      <!-- MAIN LAYOUT: SIDEBAR + JOBS -->
      <div class="main-layout">
        <aside class="filters-sidebar">
          <div class="filter-header">
            <div class="filter-main-title"><i class="fa-solid fa-sliders"></i> ${t.filterTitle}</div>
            ${queryJobType ? `<a href="/${locale}?search=${querySearch}&category=${queryCategory}" class="filter-clear">${locale === 'ar' ? 'مسح' : 'Clear'}</a>` : ''}
          </div>
          <form method="GET" action="/${locale}">
            <input type="hidden" name="search" value="${querySearch}">
            <input type="hidden" name="category" value="${queryCategory}">
            <input type="hidden" name="district" value="${queryDistrict}">
            <input type="hidden" name="transit" value="${queryTransit}">
            <div class="filter-group">
              <div class="filter-group-title">${t.jobType}</div>
              <div class="filter-options">
                <label class="filter-radio ${!queryJobType ? 'selected' : ''}">
                  <input type="radio" name="type" value="" ${!queryJobType ? 'checked' : ''} onchange="this.form.submit()">
                  <span>${locale === 'ar' ? 'جميع الأنواع' : 'All Types'}</span>
                </label>
                <label class="filter-radio ${queryJobType === 'full-time' ? 'selected' : ''}">
                  <input type="radio" name="type" value="full-time" ${queryJobType === 'full-time' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>⏱ ${t.fullTime}</span>
                </label>
                <label class="filter-radio ${queryJobType === 'part-time' ? 'selected' : ''}">
                  <input type="radio" name="type" value="part-time" ${queryJobType === 'part-time' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>🕐 ${t.partTime}</span>
                </label>
                <label class="filter-radio ${queryJobType === 'remote' ? 'selected' : ''}">
                  <input type="radio" name="type" value="remote" ${queryJobType === 'remote' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>🌐 ${t.remote}</span>
                </label>
                <label class="filter-radio ${queryJobType === 'internship' ? 'selected' : ''}">
                  <input type="radio" name="type" value="internship" ${queryJobType === 'internship' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>🎓 ${t.internship}</span>
                </label>
              </div>
            </div>
          </form>

          <!-- Quick CTA -->
          <div style="margin-top:24px; padding-top:20px; border-top:1px solid var(--border);">
            <a href="/${locale}/submit-job" class="btn-primary" style="width:100%; justify-content:center; font-size:.875rem;">
              <i class="fa-solid fa-plus"></i> ${locale === 'ar' ? 'نشر وظيفة' : 'Post a Job'}
            </a>
          </div>

          <!-- Telegram Promo Card -->
          <div class="telegram-cta" style="margin-top:20px; padding:20px; border-radius:var(--radius-lg); background:linear-gradient(135deg, #1d90f3 0%, #0088cc 100%); color:white; position:relative; overflow:hidden; box-shadow:0 8px 24px rgba(0, 136, 204, 0.2); transition:all 0.3s ease;">
            <div style="position:absolute; right:-20px; bottom:-20px; font-size:120px; opacity:0.1; transform:rotate(-15deg); color:white; pointer-events:none;">
              <i class="fa-brands fa-telegram"></i>
            </div>
            <h3 style="font-size:1.1rem; font-weight:800; margin:0 0 8px 0; color:white; display:flex; align-items:center; gap:8px;">
              <i class="fa-brands fa-telegram" style="font-size:1.3rem;"></i>
              ${locale === 'ar' ? 'قناتنا على تلغرام' : 'Telegram Channel'}
            </h3>
            <p style="font-size:0.82rem; line-height:1.4; opacity:0.95; margin:0 0 16px 0; color:rgba(255,255,255,0.9);">
              ${locale === 'ar'
      ? 'انضم لأكثر من ٢٠ ألف مشترك واحصل على أحدث الوظائف الشاغرة في إسطنبول فوراً!'
      : 'Join 20k+ subscribers and get the latest job postings in Istanbul instantly!'
    }
            </p>
            <a href="https://t.me/jobsistanbul" target="_blank" rel="noopener" class="telegram-btn" style="display:flex; align-items:center; justify-content:center; gap:8px; background:white; color:#0088cc; padding:10px 16px; border-radius:var(--radius-md); font-weight:700; font-size:0.875rem; text-decoration:none; box-shadow:0 4px 12px rgba(0,0,0,0.1); transition:all 0.2s ease;">
              ${locale === 'ar' ? 'انضم الآن مجاناً' : 'Join Free Now'}
              <i class="fa-solid fa-paper-plane"></i>
            </a>
          </div>
          
          <style>
            .telegram-cta:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 30px rgba(0, 136, 204, 0.35) !important;
            }
            .telegram-cta:hover .telegram-btn {
              background: #f0f9ff !important;
            }
          </style>
        </aside>

        <section>
          <div class="jobs-header">
            <p class="jobs-count"><strong>${jobs.length}</strong> ${locale === 'ar' ? 'وظيفة متاحة' : 'jobs available'}</p>
            ${querySearch || queryCategory || queryJobType || queryDistrict || queryTransit ? `<a href="/${locale}" style="font-size:.82rem; color:var(--danger); font-weight:600;"><i class="fa-solid fa-xmark"></i> ${locale === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}</a>` : ''}
          </div>
          <div class="jobs-list">
            ${jobsHtml}
          </div>
        </section>
      </div>
    </div>
  `;

  const seoHtml = generateMetaTags(locale, 'home') + generateJsonLd(locale, 'home');
  return c.html(renderLayout(c, locale === 'ar' ? 'فرص عمل في إسطنبول' : 'Istanbul Jobs Vacancies', html, locale, seoHtml));
}

publicRouter.get(
  '/ar',
  cache({ cacheName: 'istanbul-jobs-ar', cacheControl: 'max-age=60' }),
  (c) => homeHandler(c, 'ar')
)

publicRouter.get(
  '/en',
  cache({ cacheName: 'istanbul-jobs-en', cacheControl: 'max-age=60' }),
  (c) => homeHandler(c, 'en')
)

// Detail view for a job
publicRouter.get(
  '/:locale/jobs/:slug',
  cache({ cacheName: 'istanbul-job-details', cacheControl: 'max-age=300' }),
  async (c) => {
    const locale = c.req.param('locale') as 'ar' | 'en';
    const slug = c.req.param('slug');
    const db = (c.env as any).DB;

    if (locale !== 'ar' && locale !== 'en') {
      return c.redirect('/ar');
    }

    // Fetch job document matching the slug
    const jobRow = await db.prepare(
      `SELECT id, data, published_at FROM documents WHERE type_id = 'jobs' AND slug = ? AND status = 'published' AND is_published = 1`
    ).bind(slug).first();

    if (!jobRow) {
      return c.text(locale === 'ar' ? 'الوظيفة غير موجودة أو انتهت صلاحيتها.' : 'Job not found or expired.', 404);
    }

    const job = {
      id: jobRow.id,
      publishedAt: jobRow.published_at,
      ...JSON.parse(jobRow.data)
    };

    // Fetch Company
    const compRow = await db.prepare(
      `SELECT data FROM documents WHERE id = ?`
    ).bind(job.company).first();
    const company = compRow ? JSON.parse(compRow.data) : { name: job.company || 'Company', description: '' };

    const title = locale === 'ar' ? job.title_ar : job.title_en;
    const description = locale === 'ar' ? job.description_ar : job.description_en;
    const location = locale === 'ar' ? job.location_ar : job.location_en;

    let quizQuestionsRaw = [];
    try {
      if (job.screeningQuestionsJson) {
        quizQuestionsRaw = JSON.parse(job.screeningQuestionsJson);
      }
    } catch (err) { }

    const translations = {
      ar: {
        jobType: 'نوع العمل',
        location: 'الموقع',
        published: 'تاريخ النشر',
        salary: 'الراتب المتوقع',
        applyNow: 'تقدم للوظيفة الآن',
        companyDetails: 'عن جهة العمل',
        requirements: 'الوصف والمهام المطلوبة',
        backToList: '← العودة لقائمة الوظائف',
        fullTime: 'دوام كامل',
        partTime: 'دوام جزئي',
        remote: 'عمل عن بعد',
        internship: 'تدريب عملي',
        featured: 'وظيفة مميزة'
      },
      en: {
        jobType: 'Job Type',
        location: 'Location',
        published: 'Published At',
        salary: 'Offered Salary',
        applyNow: 'Apply For Job',
        companyDetails: 'About Company',
        requirements: 'Description & Requirements',
        backToList: '← Back to all jobs',
        fullTime: 'Full Time',
        partTime: 'Part Time',
        remote: 'Remote',
        internship: 'Internship',
        featured: 'Featured Job'
      }
    }[locale];

    const typeLabel = translations[job.jobType === 'full-time' ? 'fullTime' : job.jobType === 'part-time' ? 'partTime' : job.jobType === 'remote' ? 'remote' : 'internship'];
    const pubDate = new Date(job.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    // Format description paragraphs
    const formattedDescription = description.split('\n').map((p: string) => p.trim() ? `<p style="margin-bottom: 16px;">${p}</p>` : '').join('');

    const html = `
    <div class="container">
      <div style="margin: 30px 0 10px;">
        <a href="/${locale}" style="color: var(--primary); font-weight: 600;">${translations.backToList}</a>
      </div>

      <div class="job-detail-layout">
        <article class="detail-main">
          ${job.imageUrl ? `<div class="detail-banner-wrapper" style="margin-bottom: 24px; border-radius: var(--radius-lg); overflow: hidden; max-height: 300px; box-shadow: var(--shadow-sm); border: 1px solid var(--border);">
            <img src="${job.imageUrl.startsWith('http') ? job.imageUrl : '/api/jobs/image?key=' + encodeURIComponent(job.imageUrl)}" alt="${title}" style="width: 100%; height: 300px; object-fit: cover;">
          </div>` : ''}
          <div class="detail-header" data-job-id="${job.id}">
            ${job.featured ? `<span class="tag tag-feat" style="margin-bottom: 12px; display: inline-block;">${translations.featured}</span>` : ''}
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 16px;">
              <h1 class="detail-title" style="margin-bottom: 0;">${title}</h1>
              <button class="btn-fav" data-job-id="${job.id}" onclick="toggleFavorite('${job.id}', event)" style="font-size: 1.8rem; width: 50px; height: 50px;" title="${locale === 'ar' ? 'حفظ في المفضلة' : 'Save to Favorites'}">
                <i class="fa-regular fa-heart"></i>
              </button>
            </div>
            <div class="detail-meta">
              <span><i class="fa-solid fa-building"></i> ${company.name}</span>
              <span><i class="fa-solid fa-location-dot"></i> ${location}</span>
              <span><i class="fa-regular fa-clock"></i> ${pubDate}</span>
            </div>
          </div>

          <div class="detail-body">
            <h3 style="font-weight: 700; border-bottom: 2px solid var(--bg-site); padding-bottom: 8px; margin-bottom: 16px;">${translations.requirements}</h3>
            ${formattedDescription}
          </div>
        </article>

        <aside class="detail-sidebar">
          <div class="sidebar-box" style="text-align: center;">
            <div class="sidebar-company-logo">
              ${company.logo ? `<img src="${company.logo}" alt="${company.name}" onerror="this.onerror=null; this.parentElement.innerHTML='${company.name.charAt(0)}';">` : company.name.charAt(0)}
            </div>
            <div class="sidebar-company-name">${company.name}</div>
            ${company.description ? `<div class="sidebar-company-desc">${company.description}</div>` : ''}
            ${company.website ? `<a href="${company.website}" target="_blank" rel="noopener" style="color: var(--primary); font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 16px;">${locale === 'ar' ? 'زيارة موقع الشركة' : 'Visit Website'} <i class="fa-solid fa-external-link" style="font-size: 0.75rem;"></i></a>` : ''}
          </div>

          <div class="sidebar-box">
            <div style="margin-bottom: 16px;">
              <span style="font-weight: 700; color: var(--text-dark); display: block; font-size: 0.9rem;">${translations.jobType}</span>
              <span style="color: var(--text-main); font-size: 1rem;">${typeLabel}</span>
            </div>
            ${job.salary ? `<div style="margin-bottom: 16px;">
              <span style="font-weight: 700; color: var(--text-dark); display: block; font-size: 0.9rem;">${translations.salary}</span>
              <span style="color: var(--text-main); font-size: 1rem;">${job.salary}</span>
            </div>` : ''}
            <div style="margin-bottom: 24px;">
              <span style="font-weight: 700; color: var(--text-dark); display: block; font-size: 0.9rem;">${translations.published}</span>
              <span style="color: var(--text-main); font-size: 1rem;">${pubDate}</span>
            </div>
            ${job.phone ? `<div style="margin-bottom: 20px; border-top: 1px solid var(--border); padding-top: 16px;">
              <span style="font-weight: 700; color: var(--text-dark); display: block; font-size: 0.9rem; margin-bottom: 4px;">
                ${locale === 'ar' ? '📞 هاتف التواصل:' : '📞 Contact Phone:'}
              </span>
              <a href="tel:${job.phone}" style="color: var(--primary); font-weight: 600; font-size: 1.05rem; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-phone"></i> ${job.phone}
              </a>
              ${job.phone.replace(/[^0-9]/g, '').length >= 10 ? `
              <a href="https://wa.me/${job.phone.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener" style="color: #25d366; font-weight: 600; font-size: 0.9rem; text-decoration: none; display: flex; align-items: center; gap: 6px; margin-top: 8px;">
                <i class="fa-brands fa-whatsapp" style="font-size: 1.15rem;"></i> ${locale === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
              </a>` : ''}
            </div>` : ''}
            <button onclick="openApplyModal()" class="btn-sidebar-apply" style="margin-bottom: 20px; border: none; cursor: pointer; display: block; width: 100%;">${translations.applyNow}</button>
            
            <!-- Social Share Widget -->
            <div class="share-widget" style="border-top: 1px solid var(--border); padding-top: 20px;">
              <div class="share-widget-title">${locale === 'ar' ? 'مشاركة هذه الوظيفة:' : 'Share this Job:'}</div>
              <div class="share-buttons">
                <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + 'https://jobs-in-istanbul.com/' + locale + '/jobs/' + job.slug)}" target="_blank" class="btn-share share-wa" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                <a href="https://t.me/share/url?url=${encodeURIComponent('https://jobs-in-istanbul.com/' + locale + '/jobs/' + job.slug)}&text=${encodeURIComponent(title)}" target="_blank" class="btn-share share-tg" title="Telegram"><i class="fa-brands fa-telegram"></i></a>
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent('https://jobs-in-istanbul.com/' + locale + '/jobs/' + job.slug)}" target="_blank" class="btn-share share-tw" title="Twitter"><i class="fa-brands fa-twitter"></i></a>
                <button onclick="copyToClipboard(window.location.href)" class="btn-share share-link" title="Copy Link" style="border:none;"><i class="fa-solid fa-link"></i></button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Quick Apply Modal -->
    <div id="apply-modal" class="apply-modal">
      <div class="apply-modal-content">
        <span class="modal-close" onclick="closeApplyModal()">&times;</span>
        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px; text-align: center;">
          ${locale === 'ar' ? 'التقديم السريع للوظيفة' : 'Quick Application'}
        </h2>
        <h3 style="font-size: 1.1rem; color: var(--primary); text-align: center; margin-bottom: 24px;">${title}</h3>

        <form id="apply-job-form">
          <input type="hidden" name="jobId" value="${job.id}">
          <input type="hidden" name="locale" value="${locale}">
          
          <!-- Step 1: Basic Info & CV -->
          <div id="apply-step-1" class="apply-form-step">
            <div style="margin-bottom: 16px; text-align: left;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
              <input type="text" name="candidateName" required class="form-input">
            </div>

            <div style="margin-bottom: 16px; text-align: left;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <input type="email" name="candidateEmail" required class="form-input">
            </div>

            <div style="margin-bottom: 16px; position: relative; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-weight: 700; color: var(--text-dark); margin: 0;">${locale === 'ar' ? 'رسالة التغطية' : 'Cover Letter'}</label>
                <button type="button" onclick="generateAiCoverLetter()" id="btn-ai-letter" class="btn-apply-now" style="font-size: 0.8rem; padding: 4px 10px; margin-top: 0; background: transparent;">
                  🤖 ${locale === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'Draft with AI'}
                </button>
              </div>
              <textarea id="candidate-cover" name="coverLetter" required rows="6" class="form-input" placeholder="${locale === 'ar' ? 'اكتب رسالة التغطية أو دع الذكاء الاصطناعي يكتبها لك...' : 'Write your cover letter or let AI generate it...'}" style="resize: vertical;"></textarea>
            </div>

            <div style="margin-bottom: 24px; text-align: left;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${locale === 'ar' ? 'تحميل السيرة الذاتية (PDF)' : 'Upload CV (PDF)'}</label>
              <input type="file" name="resumeFile" required accept=".pdf" class="form-input">
            </div>

            <button type="button" onclick="nextApplyStep(2)" class="btn-sidebar-apply" style="border: none;">
              ${locale === 'ar' ? 'المتابعة للتقييم والـ Video Pitch ←' : 'Next: Screening & Video Pitch ←'}
            </button>
          </div>

          <!-- Step 2: Screening Quiz -->
          <div id="apply-step-2" class="apply-form-step" style="display: none;">
            <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin-bottom: 16px; text-align: left;">
              ${locale === 'ar' ? 'الخطوة ٢: اختبار المهارات السريع' : 'Step 2: Screening Quiz'}
            </h4>
            
            <div id="quiz-questions-container" style="text-align: left;">
              ${quizQuestionsRaw.length > 0 ? quizQuestionsRaw.map((q: any, qIdx: number) => `
                  <div style="margin-bottom: 16px; background: rgba(0,0,0,0.02); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    <div style="font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">Q${qIdx + 1}: ${q.question}</div>
                    ${q.options.map((opt: string) => `
                      <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                        <input type="radio" name="quiz_q_${qIdx}" value="${opt}" required style="accent-color: var(--primary);">
                        <span>${opt}</span>
                      </label>
                    `).join('')}
                  </div>
                `).join('') : `
                  <!-- Fallback general screening questions -->
                  <div style="margin-bottom: 16px; background: rgba(0,0,0,0.02); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    <div style="font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">Q1: ${locale === 'ar' ? 'هل تمتلك تصريح عمل أو إقامة سارية في تركيا؟' : 'Do you have a valid work permit or residency in Turkey?'}</div>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                      <input type="radio" name="quiz_q_0" value="Yes" checked style="accent-color: var(--primary);">
                      <span>${locale === 'ar' ? 'نعم' : 'Yes'}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                      <input type="radio" name="quiz_q_0" value="No" style="accent-color: var(--primary);">
                      <span>${locale === 'ar' ? 'لا' : 'No'}</span>
                    </label>
                  </div>
                  <div style="margin-bottom: 16px; background: rgba(0,0,0,0.02); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    <div style="font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">Q2: ${locale === 'ar' ? 'كم عدد سنوات خبرتك المهنية في هذا المجال؟' : 'How many years of professional experience do you have in this field?'}</div>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                      <input type="radio" name="quiz_q_1" value="0-2" checked style="accent-color: var(--primary);">
                      <span>${locale === 'ar' ? '٠ - ٢ سنة' : '0 - 2 years'}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                      <input type="radio" name="quiz_q_1" value="3-5" style="accent-color: var(--primary);">
                      <span>${locale === 'ar' ? '٣ - ٥ سنوات' : '3 - 5 years'}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; cursor: pointer;">
                      <input type="radio" name="quiz_q_1" value="5+" style="accent-color: var(--primary);">
                      <span>${locale === 'ar' ? 'أكثر من ٥ سنوات' : '5+ years'}</span>
                    </label>
                  </div>
                `
      }
            </div>

            <div style="display: flex; gap: 12px; margin-top: 20px;">
              <button type="button" onclick="nextApplyStep(1)" class="btn-apply-now" style="flex: 1;">${locale === 'ar' ? 'السابق' : 'Previous'}</button>
              <button type="button" onclick="nextApplyStep(3)" class="btn-sidebar-apply" style="flex: 1; margin-top: 0;">${locale === 'ar' ? 'المتابعة للمقطع التعريفي ←' : 'Next: Video Pitch ←'}</button>
            </div>
          </div>

          <!-- Step 3: Video Pitch -->
          <div id="apply-step-3" class="apply-form-step" style="display: none;">
            <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin-bottom: 12px; text-align: left;">
              ${locale === 'ar' ? 'الخطوة ٣: مقطع فيديو تعريفي قصير (Video Pitch - اختياري)' : 'Step 3: 60-Second Video Pitch (Optional)'}
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); text-align: left; margin-bottom: 16px; line-height:1.5;">
              ${locale === 'ar' ? 'أضف لمسة شخصية لطلبك عن طريق رفع فيديو تعريفي قصير (حتى ٦٠ ثانية) يظهر مهاراتك وثقتك أمام أصحاب العمل.' : 'Add a personal touch to your application by uploading a brief self-introduction video.'}
            </p>

            <div style="margin-bottom: 20px; text-align: left;">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${locale === 'ar' ? 'ملف الفيديو (.mp4 أو .webm)' : 'Video File (.mp4 or .webm)'}</label>
              <input type="file" name="videoFile" accept="video/mp4,video/webm" class="form-input">
            </div>

            <div style="display: flex; gap: 12px; margin-top: 30px;">
              <button type="button" onclick="nextApplyStep(2)" class="btn-apply-now" style="flex: 1;">${locale === 'ar' ? 'السابق' : 'Previous'}</button>
              <button type="submit" id="applySubmitBtn" class="btn-sidebar-apply" style="flex: 1; margin-top: 0; border: none;">
                ${locale === 'ar' ? 'إرسال طلب التوظيف 🚀' : 'Submit Application 🚀'}
              </button>
            </div>
          </div>
        </form>

        <div id="apply-success" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: var(--radius-md); color: #166534; font-weight: 600; text-align: center; margin-top: 20px;">
          <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
          ${locale === 'ar' ? 'تم إرسال طلبك لصاحب العمل بنجاح!' : 'Your application was sent successfully!'}
        </div>
      </div>
    </div>

    <script>
      function openApplyModal() {
        document.getElementById('apply-modal').style.display = 'flex';
      }

      function closeApplyModal() {
        document.getElementById('apply-modal').style.display = 'none';
        document.getElementById('apply-success').style.display = 'none';
        document.getElementById('apply-job-form').style.display = 'block';
        nextApplyStep(1); // Reset step
      }

      function nextApplyStep(stepNum) {
        document.querySelectorAll('.apply-form-step').forEach(step => step.style.display = 'none');
        document.getElementById('apply-step-' + stepNum).style.display = 'block';
      }

      async function generateAiCoverLetter() {
        const btn = document.getElementById('btn-ai-letter');
        const text = document.getElementById('candidate-cover');
        
        btn.innerText = "${locale === 'ar' ? 'جاري الصياغة...' : 'Drafting...'}";
        btn.disabled = true;

        try {
          const res = await fetch('/api/cv-optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              locale: '${locale}',
              jobDescription: decodeURIComponent('${encodeURIComponent(description)}'),
              experience: "${locale === 'ar' ? 'يرجى كتابة رسالة تغطية احترافية ومقنعة بناءً على متطلبات الوظيفة الشاغرة المحددة.' : 'Please draft a highly relevant, professional cover letter for this job role.'}"
            })
          });

          const data = await res.json();
          if (res.ok) {
            text.value = data.coverLetter;
          } else {
            alert('Failed to generate. Please write manually.');
          }
        } catch(err) {
          alert('Error generating text.');
        } finally {
          btn.innerText = "🤖 ${locale === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'Draft with AI'}";
          btn.disabled = false;
        }
      }

      document.getElementById('apply-job-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const btn = document.getElementById('applySubmitBtn');
        
        btn.innerText = "${locale === 'ar' ? 'جاري الإرسال... ⏳' : 'Submitting... ⏳'}";
        btn.disabled = true;

        try {
          const res = await fetch('/api/jobs/apply', {
            method: 'POST',
            body: formData
          });

          const data = await res.json();
          if (res.ok) {
            form.style.display = 'none';
            document.getElementById('apply-success').style.display = 'block';
          } else {
            alert(data.error || 'Failed to submit application.');
          }
        } catch(err) {
          alert('Network connection error.');
        } finally {
          btn.innerText = "${locale === 'ar' ? 'إرسال طلب التوظيف' : 'Submit Application'}";
          btn.disabled = false;
        }
      });
    </script>
  `;

    const seoHtml = generateMetaTags(locale, 'job', {
      title,
      description: description,
      slug: job.slug,
      publishedAt: job.publishedAt,
      companyName: company.name,
      location,
      jobType: job.jobType,
      salary: job.salary,
      seoKeywords: job.seoKeywords || [],
      seoDescription: job.seoDescription || ''
    }) + generateJsonLd(locale, 'job', {
      title,
      description: description,
      slug: job.slug,
      publishedAt: job.publishedAt,
      companyName: company.name,
      companyLogo: company.logo,
      companyWebsite: company.website,
      location,
      jobType: job.jobType,
      salary: job.salary
    });

    return c.html(renderLayout(c, title, html, locale, seoHtml));
  })

// Submit Job Page
publicRouter.get('/:locale/submit-job', async (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en';

  if (locale !== 'ar' && locale !== 'en') {
    return c.redirect('/ar/submit-job');
  }

  const db = (c.env as any).DB;
  let categories: any[] = [];
  try {
    const catRows = await db.prepare(
      `SELECT id, slug, data FROM documents WHERE type_id = 'categories' AND status = 'published' AND is_published = 1`
    ).all();
    categories = (catRows.results || []).map((row: any) => ({
      id: row.id,
      slug: row.slug,
      ...JSON.parse(row.data)
    }));
  } catch (err) {
    console.error('Error fetching categories in submit job page:', err);
  }

  const t = {
    ar: {
      title: 'أعلن عن وظيفة شاغرة',
      subtitle: 'أضف تفاصيل الوظيفة لتصل إلى آلاف المتقدمين المهتمين بالعمل في إسطنبول',
      jobTitle: 'المسمى الوظيفي',
      compName: 'اسم الشركة',
      category: 'التصنيف الوظيفي',
      jobType: 'نوع التوظيف',
      location: 'المنطقة في إسطنبول',
      salary: 'الراتب المتوقع (اختياري)',
      applyEmail: 'بريد التقديم الإلكتروني',
      phone: 'رقم الهاتف (اختياري)',
      desc: 'الوصف الوظيفي والمتطلبات التفصيلية',
      submit: 'نشر الوظيفة فوراً',
      successMsg: 'تم نشر الوظيفة بنجاح وظهرت فوراً على الموقع!'
    },
    en: {
      title: 'Post a Job Vacancy',
      subtitle: 'Publish your job vacancy to reach thousands of active job seekers in Istanbul',
      jobTitle: 'Job Title',
      compName: 'Company Name',
      category: 'Job Category',
      jobType: 'Employment Type',
      location: 'District in Istanbul',
      salary: 'Offered Salary (Optional)',
      applyEmail: 'Application Email',
      phone: 'Phone Number (Optional)',
      desc: 'Job Description & Requirements',
      submit: 'Publish Job Instantly',
      successMsg: 'Job published successfully! It is now live on the site.'
    }
  }[locale];

  const html = `
    <!-- Cloudflare Turnstile API -->
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

    <div class="container" style="max-width: 800px; padding: 60px 20px;">
      <h1 style="font-size: 2.25rem; font-weight: 800; color: var(--text-dark); margin-bottom: 8px; text-align: center;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem;">${t.subtitle}</p>

      <form id="submit-job-form" method="POST" action="/submit-job-api" style="background: white; border: 1px solid var(--border); padding: 40px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
        <input type="hidden" name="locale" value="${locale}">
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.jobTitle}</label>
          <input type="text" name="title" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.compName}</label>
          <input type="text" name="company" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.category}</label>
          <select name="category" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none; background: white;">
            <option value="">${locale === 'ar' ? '-- اختر القسم --' : '-- Select Category --'}</option>
            ${categories.map((cat: any) => `
              <option value="${cat.id}">${locale === 'ar' ? (cat.name_ar || cat.name) : (cat.name_en || cat.name)}</option>
            `).join('')}
          </select>
        </div>

        <div style="margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.jobType}</label>
            <select name="jobType" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none; background: white;">
              <option value="full-time">Full-time / دوام كامل</option>
              <option value="part-time">Part-time / دوام جزئي</option>
              <option value="remote">Remote / عمل عن بعد</option>
              <option value="internship">Internship / تدريب عملي</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.location}</label>
            <input type="text" name="location" required placeholder="e.g. Fatih / الفاتح" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
          </div>
        </div>

        <div style="margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.applyEmail}</label>
            <input type="email" name="applyEmail" required placeholder="jobs@company.com" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
          </div>
          <div>
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.phone}</label>
            <input type="tel" name="phone" placeholder="e.g. +90 555 123 4567" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.salary}</label>
          <input type="text" name="salary" placeholder="e.g. 20,000 - 30,000 TL" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
        </div>

        <div style="margin-bottom: 30px;">
          <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.desc}</label>
          <textarea name="description" required rows="8" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none; resize: vertical;"></textarea>
        </div>

        <!-- Cloudflare Turnstile CAPTCHA Widget -->
        <div style="margin-bottom: 30px; display: flex; justify-content: center;">
          <div class="cf-turnstile" data-sitekey="${(c.env as any).TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}" data-theme="light"></div>
        </div>

        <button type="submit" class="btn-sidebar-apply" style="border: none; cursor: pointer;">${t.submit}</button>
      </form>
      
      <div id="form-success" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: var(--radius-md); color: #166534; font-weight: 600; text-align: center; margin-top: 20px;">
        <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
        ${t.successMsg}
      </div>
      
      <script>
        document.getElementById('submit-job-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          const form = e.target;
          const formData = new FormData(form);
          const data = Object.fromEntries(formData);
          
          try {
            const res = await fetch(form.action, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            if (res.ok) {
              form.style.display = 'none';
              document.getElementById('form-success').style.display = 'block';
            } else {
              const errData = await res.json().catch(() => ({}));
              alert(errData.error || 'Error submitting form. Please try again.');
              // Reset Turnstile on failure
              if (window.turnstile) {
                window.turnstile.reset();
              }
            }
          } catch(err) {
            alert('An error occurred. Please try again.');
          }
        });
      </script>
    </div>
  `;

  const seoHtml = generateMetaTags(locale, 'submit');
  return c.html(renderLayout(c, t.title, html, locale, seoHtml));
})

// Receive public job submissions for review
publicRouter.post(
  '/submit-job-api',
  rateLimiter(5, 10), // Limit 5 submissions per 10 minutes per IP
  validateJobSubmission(),
  validateTurnstile(),
  async (c) => {
    try {
      const db = (c.env as any).DB;
      const data: any = (c as any).get('parsedBody');
      const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-real-ip') || '127.0.0.1';
      const nowMs = Date.now();
      const id = `job-pending-${nowMs}-${Math.random().toString(36).substring(2, 7)}`;
      const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nowMs}`;

      let imageUrl = '';
      const bucket = (c.env as any).MEDIA_BUCKET;
      if (bucket) {
        try {
          imageUrl = await assignJobImage(bucket, id, data.category || 'cat-general');
        } catch (e) {
          console.error('Error assigning job image during submission:', e);
        }
      }

      let titleAr = data.title;
      let titleEn = data.title;
      let descAr = data.description;
      let descEn = data.description;
      let seoKeywords: string[] = [];
      let seoDescription = '';

      const geminiApiKey = (c.env as any).GEMINI_API_KEY;
      if (geminiApiKey) {
        try {
          const seoResult = await optimizeSeoWithGemini(
            geminiApiKey,
            data.title,
            data.description,
            data.locale || 'ar'
          );
          titleAr = seoResult.title_ar || data.title;
          titleEn = seoResult.title_en || data.title;
          descAr = seoResult.description_ar || data.description;
          descEn = seoResult.description_en || data.description;
          seoKeywords = seoResult.keywords || [];
          seoDescription = seoResult.seoDescription || '';
        } catch (e) {
          console.error('Gemini SEO call failed on guest submission:', e);
        }
      }

      const docData = JSON.stringify({
        title_ar: titleAr,
        title_en: titleEn,
        slug: slug,
        description_ar: descAr,
        description_en: descEn,
        company: data.company, // Capturing guest input
        category: data.category || 'cat-general',
        location_ar: data.location_ar || data.location,
        location_en: data.location_en || data.location,
        jobType: data.jobType || 'full-time',
        salary: data.salary || '',
        phone: data.phone || '',
        applyEmail: data.applyEmail,
        guestEmail: data.applyEmail, // Track who submitted it
        language: data.language || 'both',
        featured: false,
        publishedAt: nowMs,
        status: 'published',
        screeningQuestionsJson: data.screeningQuestionsJson || '',
        transitLine: data.transitLine || 'none',
        imageUrl: imageUrl,
        seoKeywords,
        seoDescription
      });

      await db.prepare(
        `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, published_at, created_at, updated_at)
         VALUES (?, ?, 'jobs', 'published', 1, 1, ?, ?, ?, ?, ?, ?)`
      ).bind(id, id, slug, titleEn, docData, nowMs, nowMs, nowMs).run();

      // Insert category reference in document_references so filtering works
      if (data.category) {
        await db.prepare(
          `INSERT INTO document_references (id, tenant_id, from_root_id, from_document_id, field_name, ordinal, to_root_id, ref_strength)
           VALUES (?, 'default', ?, ?, 'category', 0, ?, 'weak')`
        ).bind(`ref-${id}-category`, id, id, data.category).run();
      }

      // Log security event for auditing
      await logSecurityEvent(db, 'JOB_PUBLISHED_GUEST', data.applyEmail, ip, `Public job published instantly: ${data.title}`);

      // Dispatch Telegram notifications in the background
      let hasWaitUntil = false;
      try {
        if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
          hasWaitUntil = true;
        }
      } catch (e) { }

      if (hasWaitUntil) {
        c.executionCtx.waitUntil(
          sendTelegramAlert(c.env, data.title, data.company, data.location, slug).catch((err) =>
            console.error('Telegram alert async dispatch error:', err)
          )
        );
      } else {
        sendTelegramAlert(c.env, data.title, data.company, data.location, slug).catch((err) =>
          console.error('Telegram alert fallback error:', err)
        );
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Error submitting job form:', error);
      return c.json({ success: false, error: 'Database insertion failed' }, 500);
    }
  }
)

// Direct Job Application with R2 PDF Upload
publicRouter.post('/api/jobs/apply', rateLimiter(10, 5), async (c) => {
  const env: any = c.env;
  const db = env.DB;
  const bucket = env.MEDIA_BUCKET;

  if (!bucket) {
    return c.json({ error: 'R2 Media Bucket binding missing' }, 500);
  }

  try {
    const body = await c.req.parseBody();
    const jobId = body.jobId as string;
    const candidateName = body.candidateName as string;
    const candidateEmail = body.candidateEmail as string;
    const coverLetter = body.coverLetter as string;
    const resumeFile = body.resumeFile as File;

    if (!jobId || !candidateName || !candidateEmail || !coverLetter || !resumeFile) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    const timestamp = Date.now();

    // 1. Upload CV PDF to Cloudflare R2
    const fileExtension = resumeFile.name.split('.').pop() || 'pdf';
    const r2Key = `resumes/${jobId}/${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;

    const fileBuffer = await resumeFile.arrayBuffer();
    await bucket.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: resumeFile.type || 'application/pdf',
      }
    });

    // 2. Optional: Upload Video Pitch to Cloudflare R2
    const videoFile = body.videoFile as any;
    let videoPitchUrl = '';
    if (videoFile && typeof videoFile === 'object' && 'size' in videoFile && videoFile.size > 0) {
      const vFile = videoFile as File;
      const videoExtension = vFile.name.split('.').pop() || 'mp4';
      const r2VideoKey = `videos/${jobId}/${timestamp}-${Math.random().toString(36).substring(2, 7)}.${videoExtension}`;
      const videoBuffer = await vFile.arrayBuffer();
      await bucket.put(r2VideoKey, videoBuffer, {
        httpMetadata: {
          contentType: vFile.type || 'video/mp4',
        }
      });
      videoPitchUrl = r2VideoKey;
    }

    // 3. Score Quiz Answers
    const jobRow = await db.prepare(
      `SELECT data FROM documents WHERE id = ? AND type_id = 'jobs'`
    ).bind(jobId).first();

    let quizScore = '--';
    let screeningQuestions: any[] = [];
    if (jobRow) {
      try {
        const jobData = JSON.parse(jobRow.data);
        if (jobData.screeningQuestionsJson) {
          screeningQuestions = JSON.parse(jobData.screeningQuestionsJson);
        }
      } catch (e) {
        console.error('Error parsing job screeningQuestionsJson:', e);
      }
    }

    if (Array.isArray(screeningQuestions) && screeningQuestions.length > 0) {
      let correctCount = 0;
      for (let i = 0; i < screeningQuestions.length; i++) {
        const q = screeningQuestions[i];
        const submittedAnswer = body[`quiz_q_${i}`];
        if (submittedAnswer !== undefined) {
          const correctAnswerKey = q.correct || q.correctAnswer || q.answer || q.correctOption || q.correct_answer;
          if (!correctAnswerKey || String(submittedAnswer).trim().toLowerCase() === String(correctAnswerKey).trim().toLowerCase()) {
            correctCount++;
          }
        }
      }
      quizScore = `${correctCount}/${screeningQuestions.length}`;
    } else {
      // Fallback questions validation
      let correctCount = 0;
      const ans0 = body['quiz_q_0'];
      const ans1 = body['quiz_q_1'];
      if (ans0 === 'Yes' || ans0 === 'نعم') {
        correctCount++;
      }
      if (ans1 === '3-5' || ans1 === '5+' || ans1 === '٣ - ٥ سنوات' || ans1 === 'أكثر من ٥ سنوات') {
        correctCount++;
      }
      quizScore = `${correctCount}/2`;
    }

    // 4. Insert document of type 'applications' into D1 documents table
    const appDocId = `app-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;
    const docData = JSON.stringify({
      jobId,
      candidateName,
      candidateEmail,
      coverLetter,
      resumeUrl: r2Key,
      status: 'applied',
      createdAt: timestamp,
      quizScore,
      videoPitchUrl
    });

    await db.prepare(
      `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, created_at, updated_at)
       VALUES (?, ?, 'applications', 'published', 1, 1, ?, ?, ?, ?, ?)`
    ).bind(appDocId, appDocId, appDocId, candidateName, docData, timestamp, timestamp).run();

    return c.json({ success: true });

  } catch (err: any) {
    console.error('Quick Apply Endpoint Error:', err);
    return c.json({ error: 'Application submission failed: ' + err.message }, 500);
  }
})

// Serve job cover images from R2
publicRouter.get('/api/jobs/image', async (c) => {
  const env: any = c.env;
  const key = c.req.query('key');

  if (!key) {
    return c.text('Missing key parameter', 400);
  }

  try {
    const bucket = env.MEDIA_BUCKET;
    if (!bucket) {
      return c.text('R2 Media Bucket binding missing.', 500);
    }

    const object = await bucket.get(key);
    if (!object) {
      return c.text('Image not found.', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Type', 'image/webp');
    headers.set('Cache-Control', 'public, max-age=86400');

    return c.body(object.body, 200, Object.fromEntries(headers.entries()));
  } catch (err: any) {
    return c.text('Failed to load image: ' + err.message, 500);
  }
});

// Serve logo.png from R2 bucket
publicRouter.get('/public/images/logo.png', async (c) => {
  const env: any = c.env;
  try {
    const bucket = env.MEDIA_BUCKET;
    if (!bucket) return c.text('R2 Media Bucket binding missing.', 500);
    const object = await bucket.get('public/images/logo.png');
    if (!object) return c.text('Logo not found.', 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Type', 'image/png');
    headers.set('Cache-Control', 'public, max-age=86400');
    return c.body(object.body, 200, Object.fromEntries(headers.entries()));
  } catch (err: any) {
    return c.text('Failed to load logo: ' + err.message, 500);
  }
});

// Serve og-share.png from R2 bucket
publicRouter.get('/public/images/og-share.png', async (c) => {
  const env: any = c.env;
  try {
    const bucket = env.MEDIA_BUCKET;
    if (!bucket) return c.text('R2 Media Bucket binding missing.', 500);
    const object = await bucket.get('public/images/og-share.png');
    if (!object) return c.text('OG image not found.', 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Type', 'image/png');
    headers.set('Cache-Control', 'public, max-age=86400');
    return c.body(object.body, 200, Object.fromEntries(headers.entries()));
  } catch (err: any) {
    return c.text('Failed to load OG image: ' + err.message, 500);
  }
});

// Backfill stock images & Gemini SEO for existing jobs in D1 and R2
publicRouter.get('/admin-api/backfill-images', async (c) => {
  const env: any = c.env;
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${env.JWT_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const db = env.DB;
  const bucket = env.MEDIA_BUCKET;
  const geminiApiKey = env.GEMINI_API_KEY;
  if (!db || !bucket) {
    return c.json({ error: 'Database or R2 bindings missing' }, 500);
  }

  try {
    const jobRows = await db.prepare(
      `SELECT id, data FROM documents WHERE type_id = 'jobs'`
    ).all();

    let updatedCount = 0;
    for (const row of jobRows.results || []) {
      const jobData = JSON.parse(row.data);
      let changed = false;

      // 1. Image backfill
      if (!jobData.imageUrl) {
        const categoryId = jobData.category || 'cat-general';
        const categoryMap: Record<string, string> = {
          'cat-it': 'it-software',
          'cat-tourism': 'tourism-hospitality',
          'cat-realestate': 'real-estate-sales',
          'cat-education': 'education-teaching',
          'cat-customer': 'customer-service-translation'
        };
        const categorySlug = categoryMap[categoryId] || 'general';

        const r2Key = await assignJobImage(bucket, row.id, categorySlug);
        jobData.imageUrl = r2Key;
        changed = true;
      }

      // 2. Gemini SEO & grammar corrections backfill
      if (!jobData.seoKeywords || !jobData.seoDescription) {
        if (geminiApiKey) {
          try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const seoResult = await optimizeSeoWithGemini(
              geminiApiKey,
              jobData.title_en || jobData.title_ar,
              jobData.description_en || jobData.description_ar,
              jobData.language === 'ar' ? 'ar' : 'en'
            );
            jobData.seoKeywords = seoResult.keywords || [];
            jobData.seoDescription = seoResult.seoDescription || '';
            if (seoResult.correctedTitle) {
              jobData.title_en = seoResult.correctedTitle;
            }
            if (seoResult.correctedDesc) {
              jobData.description_en = seoResult.correctedDesc;
            }
            changed = true;
          } catch (e) {
            console.error(`Gemini backfill failed for job ${row.id}:`, e);
          }
        }
      }

      if (changed) {
        await db.prepare(
          `UPDATE documents SET data = ? WHERE id = ?`
        ).bind(JSON.stringify(jobData), row.id).run();
        updatedCount++;
      }
    }

    return c.json({ success: true, updated: updatedCount });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// About Us Page
publicRouter.get('/:locale/about', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/about');

  const t = {
    ar: {
      title: 'من نحن - فرص عمل في إسطنبول',
      heading: 'من نحن',
      subtitle: 'المنصة المهنية الرائدة لفرص العمل والحلول الذكية في إسطنبول',
      missionTitle: 'رسالتنا وهدفنا',
      missionText: 'نعمل على سد الفجوة بين الباحثين عن عمل المتميزين وأصحاب الأعمال الرائدين في إسطنبول. هدفنا هو تسهيل العثور على وظائف وتوظيف المواهب عبر توفير حلول مبتكرة وموثوقة بنسبة ١٠٠٪.',
      featureTitle: 'لماذا تختار منصتنا؟',
      feat1Title: 'أدوات الذكاء الاصطناعي 🤖',
      feat1Desc: 'نقدم فاحصاً ذكياً ومحسناً للسير الذاتية ومولداً مخصصاً لرسائل التغطية بالإضافة إلى محاكٍ واقعي لمقابلات العمل.',
      feat2Title: 'التوظيف الفوري ⚡',
      feat2Desc: 'نمكن الشركات والأفراد من نشر إعلانات وظيفية تظهر فوراً على الموقع والوصول لآلاف المهتمين في دقائق.',
      feat3Title: 'شفافية وموثوقية 🤝',
      feat3Desc: 'يتم فحص الوظائف وتحديث الرواتب ومراجعة الطلبات لضمان تجربة آمنة وجدية لجميع المستخدمين.',
      statsTitle: 'أرقام تتحدث عنا',
      stat1Val: '+٥٠٠',
      stat1Lbl: 'وظيفة شاغرة نشطة',
      stat2Val: '+١٠ آلاف',
      stat2Lbl: 'متقدم للوظائف شهرياً',
      stat3Val: '١٠٠٪',
      stat3Lbl: 'وظائف موثوقة'
    },
    en: {
      title: 'About Us - Istanbul Jobs',
      heading: 'About Us',
      subtitle: 'The leading career platform and smart employment solution in Istanbul',
      missionTitle: 'Our Mission & Goal',
      missionText: 'We strive to bridge the gap between outstanding job seekers and leading employers in Istanbul. Our goal is to make career matching easy, accessible, and 100% verified through cutting-edge technology and AI integrations.',
      featureTitle: 'Why Choose Our Platform?',
      feat1Title: 'AI-Powered Tools 🤖',
      feat1Desc: 'Optimize your CV, generate professional cover letters, and practice with our realistic AI Interview Simulator.',
      feat2Title: 'Instant Job Posting ⚡',
      feat2Desc: 'Empower companies and individuals to post job listings that go live immediately to reach thousands of candidates.',
      feat3Title: 'Transparency & Trust 🤝',
      feat3Desc: 'We verify job postings, support salary transparency, and ensure a reliable hiring experience for all.',
      statsTitle: 'Our Impact in Numbers',
      stat1Val: '500+',
      stat1Lbl: 'Active Vacancies',
      stat2Val: '10K+',
      stat2Lbl: 'Monthly Job Seekers',
      stat3Val: '100%',
      stat3Lbl: 'Verified Listings'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 900px; padding: 60px 20px;">
      <div class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: center; margin-bottom: 40px;">
        <h1 class="hero-title-gradient" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 12px;">${t.heading}</h1>
        <p style="color: var(--text-muted); font-size: 1.15rem; max-width: 700px; margin: 0 auto 30px;">${t.subtitle}</p>
        
        <div style="text-align: ${locale === 'ar' ? 'right' : 'left'}; border-top: 1px solid var(--border); padding-top: 30px; margin-top: 30px;">
          <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px;">🎯 ${t.missionTitle}</h2>
          <p style="color: var(--text-body); line-height: 1.7; font-size: 1.05rem;">${t.missionText}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 40px;">
        <div class="glass-card" style="padding: 24px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 2.2rem; font-weight: 900; color: var(--primary); margin-bottom: 6px;">${t.stat1Val}</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-muted);">${t.stat1Lbl}</div>
        </div>
        <div class="glass-card" style="padding: 24px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent); margin-bottom: 6px;">${t.stat2Val}</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-muted);">${t.stat2Lbl}</div>
        </div>
        <div class="glass-card" style="padding: 24px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-size: 2.2rem; font-weight: 900; color: #10b981; margin-bottom: 6px;">${t.stat3Val}</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-muted);">${t.stat3Lbl}</div>
        </div>
      </div>

      <!-- Features -->
      <div class="glass-card" style="padding: 40px; border-radius: var(--radius-lg);">
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-dark); margin-bottom: 24px; text-align: center;">${t.featureTitle}</h2>
        <div style="display: flex; flex-direction: column; gap: 24px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
          <div style="border-bottom: 1px solid var(--border); padding-bottom: 20px;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-bottom: 8px;">${t.feat1Title}</h3>
            <p style="color: var(--text-body); line-height: 1.6; margin: 0;">${t.feat1Desc}</p>
          </div>
          <div style="border-bottom: 1px solid var(--border); padding-bottom: 20px;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--accent); margin-bottom: 8px;">${t.feat2Title}</h3>
            <p style="color: var(--text-body); line-height: 1.6; margin: 0;">${t.feat2Desc}</p>
          </div>
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #10b981; margin-bottom: 8px;">${t.feat3Title}</h3>
            <p style="color: var(--text-body); line-height: 1.6; margin: 0;">${t.feat3Desc}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// Contact Us Page
publicRouter.get('/:locale/contact', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/contact');

  const t = {
    ar: {
      title: 'اتصل بنا - إسطنبول للوظائف',
      heading: 'اتصل بنا',
      subtitle: 'نحن هنا للإجابة على استفساراتكم ومساعدتكم. تواصلوا معنا عبر القنوات المتاحة.',
      formTitle: 'أرسل لنا رسالة مباشرة',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      subject: 'الموضوع',
      message: 'نص الرسالة',
      sendBtn: 'إرسال الرسالة ✉️',
      successMsg: 'تم إرسال رسالتك بنجاح! سنتواصل معك في أقرب وقت ممكن.',
      cardEmail: 'البريد الإلكتروني',
      cardPhone: 'واتساب والدعم المباشر',
      cardLoc: 'العنوان والمقر'
    },
    en: {
      title: 'Contact Us - Istanbul Jobs',
      heading: 'Contact Us',
      subtitle: 'We are here to answer your questions and help you. Get in touch with us through our active channels.',
      formTitle: 'Send Us a Message',
      name: 'Full Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Message Content',
      sendBtn: 'Send Message ✉️',
      successMsg: 'Your message has been sent successfully! We will get back to you shortly.',
      cardEmail: 'Email Us',
      cardPhone: 'WhatsApp & Support',
      cardLoc: 'Office Address'
    }
  }[locale];

  const html = `
    <style>
      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 30px;
        align-items: start;
      }
      .contact-card-box {
        padding: 24px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 16px;
        text-align: ${locale === 'ar' ? 'right' : 'left'};
      }
      .contact-form-box {
        padding: 40px;
        border-radius: var(--radius-lg);
      }
      @media (max-width: 768px) {
        .contact-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .contact-card-box {
          padding: 16px;
        }
        .contact-form-box {
          padding: 24px 16px;
        }
      }
    </style>

    <div class="container" style="max-width: 1000px; padding: 60px 20px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.heading}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 40px; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>

      <div class="contact-grid">
        <!-- Contact Cards -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-card contact-card-box">
            <div style="width: 46px; height: 46px; border-radius: var(--r-full); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;"><i class="fa-solid fa-envelope"></i></div>
            <div>
              <div style="font-weight: 800; color: var(--text-dark); margin-bottom: 2px;">${t.cardEmail}</div>
              <a href="mailto:info@jobs-in-istanbul.com" style="color: var(--primary); font-weight: 600; font-size: 0.92rem;">info@jobs-in-istanbul.com</a>
            </div>
          </div>
          <div class="glass-card contact-card-box">
            <div style="width: 46px; height: 46px; border-radius: var(--r-full); background: #f0fdf4; color: #166534; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0;"><i class="fa-brands fa-whatsapp"></i></div>
            <div>
              <div style="font-weight: 800; color: var(--text-dark); margin-bottom: 2px;">${t.cardPhone}</div>
              <span style="color: #166534; font-weight: 600; font-size: 0.92rem; direction: ltr; display: inline-block;">+90 555 555 55 55</span>
            </div>
          </div>
          <div class="glass-card contact-card-box">
            <div style="width: 46px; height: 46px; border-radius: var(--r-full); background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;"><i class="fa-solid fa-location-dot"></i></div>
            <div>
              <div style="font-weight: 800; color: var(--text-dark); margin-bottom: 2px;">${t.cardLoc}</div>
              <span style="color: var(--text-muted); font-size: 0.9rem;">Şişli, Istanbul, Turkey</span>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="glass-card contact-form-box">
          <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-dark); margin-bottom: 24px; text-align: ${locale === 'ar' ? 'right' : 'left'};">${t.formTitle}</h2>
          
          <form id="contact-form" onsubmit="handleContactSubmit(event)">
            <div style="margin-bottom: 16px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${t.name}</label>
              <input type="text" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); outline: none;">
            </div>
            <div style="margin-bottom: 16px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${t.email}</label>
              <input type="email" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); outline: none;">
            </div>
            <div style="margin-bottom: 16px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${t.subject}</label>
              <input type="text" required style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); outline: none;">
            </div>
            <div style="margin-bottom: 24px; text-align: ${locale === 'ar' ? 'right' : 'left'};">
              <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">${t.message}</label>
              <textarea required rows="5" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); outline: none; resize: vertical;"></textarea>
            </div>
            <button type="submit" class="btn-sidebar-apply" style="border: none; cursor: pointer; width: 100%;">${t.sendBtn}</button>
          </form>

          <div id="contact-success" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: var(--radius-md); color: #166534; font-weight: 600; text-align: center; margin-top: 20px;">
            <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
            ${t.successMsg}
          </div>
        </div>
      </div>
    </div>

    <script>
      function handleContactSubmit(e) {
        e.preventDefault();
        document.getElementById('contact-form').style.display = 'none';
        document.getElementById('contact-success').style.display = 'block';
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// Privacy Policy Page
publicRouter.get('/:locale/privacy', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/privacy');

  const t = {
    ar: {
      title: 'سياسة الخصوصية - إسطنبول للوظائف',
      heading: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: يونيو ٢٠٢٦',
      intro: 'نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيف نقوم بجمع معلوماتك واستخدامها وحمايتها عند زيارتك لمنصتنا.',
      sec1Title: '١. المعلومات التي نجمعها',
      sec1Text: 'نقوم بجمع البيانات الشخصية التي تقدمها لنا طواعية (مثل الاسم، البريد الإلكتروني، السيرة الذاتية، ورسالة التغطية عند التقدم لوظيفة أو نشر وظيفة). كما نجمع بعض البيانات التقنية تلقائياً مثل عنوان IP والملفات المؤقتة (Cookies).',
      sec2Title: '٢. كيف نستخدم معلوماتك',
      sec2Text: 'نستخدم معلوماتك لتشغيل وتسهيل خدمات التوظيف على الموقع، وللتواصل معك بخصوص طلباتك، ولتحسين أدوات الذكاء الاصطناعي، وضمان أمن المنصة ومكافحة الانتهاكات.',
      sec3Title: '٣. حماية البيانات (KVKK / GDPR)',
      sec3Text: 'نتخذ التدابير الفنية والإدارية المناسبة لحماية بياناتك الشخصية وفقاً لقانون حماية البيانات الشخصية التركي (KVKK) والقانون العام لحماية البيانات الأوروبي (GDPR). لا نبيع بياناتك لأطراف ثالثة أبداً.',
      sec4Title: '٤. حقوق المستخدمين',
      sec4Text: 'لديك الحق الكامل في طلب مراجعة بياناتك، تعديلها، أو حذفها نهائياً من أنظمتنا في أي وقت عبر مراسلتنا بالبريد الإلكتروني.'
    },
    en: {
      title: 'Privacy Policy - Istanbul Jobs',
      heading: 'Privacy Policy',
      lastUpdated: 'Last Updated: June 2026',
      intro: 'We are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, and protect your information when you visit our platform.',
      sec1Title: '1. Information We Collect',
      sec1Text: 'We collect personal information you voluntarily provide (e.g., name, email address, CV/resume, and cover letter when submitting applications or posting jobs). We also collect automated technical data such as IP address and cookie data.',
      sec2Title: '2. How We Use Your Information',
      sec2Text: 'We use your information to operate and facilitate recruitment services, communicate with you regarding your applications, optimize our AI-powered features, and ensure platform security.',
      sec3Title: '3. Data Security (KVKK / GDPR)',
      sec3Text: 'We implement strong technical and organizational measures to safeguard your personal data in compliance with Turkish Data Protection Law (KVKK) and EU General Data Protection Regulation (GDPR). We never sell your data.',
      sec4Title: '4. Your Data Rights',
      sec4Text: 'You have the right to access, edit, update, or request permanent deletion of your personal data from our systems at any time by contacting our data support team.'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 800px; padding: 60px 20px;">
      <div class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: ${locale === 'ar' ? 'right' : 'left'};">
        <h1 class="hero-title-gradient" style="font-size: 2.3rem; font-weight: 800; margin-bottom: 8px; text-align: center;">${t.heading}</h1>
        <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-bottom: 30px;">${t.lastUpdated}</div>
        
        <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-dark); margin-bottom: 30px; font-weight: 500;">${t.intro}</p>

        <div style="display: flex; flex-direction: column; gap: 28px;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec1Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec1Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec2Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec2Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec3Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec3Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec4Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec4Text}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

// Terms & Conditions Page
publicRouter.get('/:locale/terms', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en';
  if (locale !== 'ar' && locale !== 'en') return c.redirect('/ar/terms');

  const t = {
    ar: {
      title: 'الشروط والأحكام - إسطنبول للوظائف',
      heading: 'الشروط والأحكام',
      lastUpdated: 'آخر تحديث: يونيو ٢٠٢٦',
      intro: 'يرجى قراءة شروط الخدمة هذه بعناية قبل استخدام منصتنا. استخدامك للموقع يعني موافقتك الكاملة على هذه الشروط والأحكام.',
      sec1Title: '١. شروط الاستخدام وقبول الخدمة',
      sec1Text: 'تُقدم المنصة خدمات إعلانات التوظيف وتسهيل التواصل بين الباحثين عن عمل والشركات. يجب أن يكون استخدامك متوافقاً مع الآداب العامة والقوانين التركية المعمول بها.',
      sec2Title: '٢. سياسة نشر إعلانات الوظائف',
      sec2Text: 'يتحمل معلنو الوظائف المسؤولية الكاملة عن صحة ودقة البيانات وتفاصيل الوظيفة المنشورة. يُمنع منعاً باتاً نشر إعلانات وظيفية وهمية، احتيالية، مضللة، أو تطلب مبالغ مالية مقابل التقديم.',
      sec3Title: '٣. إخلاء المسؤولية',
      sec3Text: 'منصتنا هي وسيط توظيف وإعلانات فقط. لا نتدخل في اتفاقيات العمل ولا نضمن الحصول على وظائف أو مرشحين، ولا نتحمل أي مسؤولية عن أي نزاعات تنشأ بين أصحاب الأعمال والموظفين.',
      sec4Title: '٤. تعديل الشروط',
      sec4Text: 'نحتفظ بالحق في تحديث أو تعديل هذه الشروط في أي وقت لتناسب التغيرات القانونية أو الفنية. تُصبح التعديلات سارية بمجرد نشرها على هذه الصفحة.'
    },
    en: {
      title: 'Terms & Conditions - Istanbul Jobs',
      heading: 'Terms & Conditions',
      lastUpdated: 'Last Updated: June 2026',
      intro: 'Please read these Terms of Service carefully before using our platform. By accessing or using the site, you agree to be bound by these terms.',
      sec1Title: '1. Acceptance of Terms',
      sec1Text: 'Our platform provides recruitment advertising and career tools. Your usage must comply with moral guidelines, international standards, and applicable Turkish laws.',
      sec2Title: '2. Job Posting Policy',
      sec2Text: 'Employers and individuals posting jobs assume full responsibility for the accuracy and legality of the listing details. Spam, fraud, illegal vacancies, or listings asking candidates for payment are strictly prohibited.',
      sec3Title: '3. Disclaimer of Liability',
      sec3Text: 'We act as an advertising venue only. We do not participate in employment agreements or guarantee hiring outcomes, and we are not liable for any disputes arising between employers and candidates.',
      sec4Title: '4. Modifications of Terms',
      sec4Text: 'We reserve the right to modify these terms and conditions at any time. Updates become effective immediately upon posting on this page.'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 800px; padding: 60px 20px;">
      <div class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: ${locale === 'ar' ? 'right' : 'left'};">
        <h1 class="hero-title-gradient" style="font-size: 2.3rem; font-weight: 800; margin-bottom: 8px; text-align: center;">${t.heading}</h1>
        <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-bottom: 30px;">${t.lastUpdated}</div>
        
        <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-dark); margin-bottom: 30px; font-weight: 500;">${t.intro}</p>

        <div style="display: flex; flex-direction: column; gap: 28px;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec1Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec1Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec2Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec2Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec3Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec3Text}</p>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 10px;">${t.sec4Title}</h2>
            <p style="color: var(--text-body); line-height: 1.7; font-size: 0.98rem; margin: 0;">${t.sec4Text}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
});

