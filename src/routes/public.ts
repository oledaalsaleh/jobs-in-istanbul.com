import { Hono } from 'hono'
import { cache } from 'hono/cache'
import { generateMetaTags, generateJsonLd } from '../utils/seo-helper'
import { validateJobSubmission, validateTurnstile, rateLimiter, logSecurityEvent } from '../middleware/security'
import { themeCss } from '../public/css/theme'

export const publicRouter = new Hono()

// Serve our CSS file directly from the bundled memory
publicRouter.get('/css/theme.css', (c) => {
  return c.body(themeCss, 200, {
    'Content-Type': 'text/css',
    'Cache-Control': 'public, max-age=3600'
  })
})

// Base layout helper
function renderLayout(c: any, title: string, contentHtml: string, locale: 'ar' | 'en', seoHtml: string = '') {
  const isRtl = locale === 'ar';
  
  const translations = {
    ar: {
      siteName: 'عمل إسطنبول',
      tagline: 'فرص عمل في إسطنبول',
      findJob: 'ابحث عن وظيفتك',
      postJob: 'أعلن عن وظيفة',
      allJobs: 'كل الوظائف',
      about: 'من نحن',
      contact: 'اتصل بنا',
      copyright: '© ٢٠٢٦ عمل إسطنبول. جميع الحقوق محفوظة.',
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
  }

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${seoHtml ? seoHtml : `<title>${title} | ${t.tagline}</title>`}
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <!-- Stylesheet -->
  <link rel="stylesheet" href="/css/theme.css">
  
  <!-- Custom inline styles for instant FCP -->
  <style>
    body { font-family: ${isRtl ? 'var(--font-ar)' : 'var(--font-en)'}; }
  </style>
</head>
<body class="${isRtl ? 'rtl' : ''}">
  <header class="site-header">
    <div class="container header-inner">
      <a href="/${locale}" class="logo">
        <i class="fa-solid fa-briefcase"></i>
        <span>${locale === 'ar' ? 'إسطنبول' : 'Istanbul'}</span> ${locale === 'ar' ? 'عمل' : 'Jobs'}
      </a>
      <nav>
        <ul class="nav-links">
          <li><a href="/${locale}" class="nav-link active">${t.allJobs}</a></li>
          <li><a href="/${locale}/submit-job" class="nav-link">${t.postJob}</a></li>
          <li>
            <a href="/${locale}?favorites=1" class="lang-switch fav-filter-link">
              <i class="fa-solid fa-heart"></i> ${locale === 'ar' ? 'المفضلة' : 'Saved'} <span id="fav-count-badge" style="display: none;">0</span>
            </a>
          </li>
          <li>
            <a href="${langSwitchUrl}" class="lang-switch">
              <i class="fa-solid fa-globe"></i> ${t.langLabel}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    ${contentHtml}
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-info">
        <div class="logo">
          <i class="fa-solid fa-briefcase"></i>
          <span>${locale === 'ar' ? 'إسطنبول' : 'Istanbul'}</span> ${locale === 'ar' ? 'عمل' : 'Jobs'}
        </div>
        <p>${locale === 'ar' ? 'المنصة الرائدة للبحث عن أفضل فرص العمل والوظائف الشاغرة في مدينة إسطنبول.' : 'The leading platform for finding the best job vacancies and employment opportunities in Istanbul.'}</p>
      </div>
      <div class="footer-links-group">
        <ul class="footer-links">
          <li class="footer-title">${locale === 'ar' ? 'الموقع' : 'Site'}</li>
          <li><a href="/${locale}">${t.allJobs}</a></li>
          <li><a href="/${locale}/submit-job">${t.postJob}</a></li>
        </ul>
        <ul class="footer-links">
          <li class="footer-title">${locale === 'ar' ? 'تواصل معنا' : 'Contact'}</li>
          <li><a href="mailto:info@jobs-in-istanbul.com">info@jobs-in-istanbul.com</a></li>
          <li><i class="fa-brands fa-whatsapp"></i> +90 555 555 55 55</li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>${t.copyright}</p>
    </div>
  </footer>

  <script>
    function getFavorites() {
      try {
        return JSON.parse(localStorage.getItem('fav_jobs') || '[]');
      } catch {
        return [];
      }
    }
    
    function toggleFavorite(jobId, event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
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
        if (card) {
          card.style.display = 'none';
        }
      }
    }

    function updateFavCounter() {
      const count = getFavorites().length;
      const badge = document.getElementById('fav-count-badge');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      const favs = getFavorites();
      favs.forEach(id => {
        const btns = document.querySelectorAll('.btn-fav[data-job-id="' + id + '"]');
        btns.forEach(btn => {
          btn.classList.add('active');
          const icon = btn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-heart';
        });
      });
      updateFavCounter();

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('favorites') === '1') {
        const jobCards = document.querySelectorAll('.job-card');
        let visibleCount = 0;
        jobCards.forEach(card => {
          const jobId = card.getAttribute('data-job-id');
          if (favs.includes(jobId)) {
            card.style.display = 'flex';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });
        
        // Update results label
        const countLabels = document.querySelectorAll('div[style*="margin-bottom: 20px"][style*="font-weight: 600"]');
        countLabels.forEach(lbl => {
          lbl.textContent = "${locale === 'ar' ? 'الوظائف المفضلة المحفوظة' : 'Saved Favorite Jobs'}: " + visibleCount;
        });

        // Highlight Active Tab
        const favLink = document.querySelector('.fav-filter-link');
        if (favLink) favLink.style.border = '1px solid hsl(0, 100%, 60%)';
      }
    });

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert("${locale === 'ar' ? 'تم نسخ رابط الوظيفة بنجاح!' : 'Job link copied to clipboard!'}");
      }).catch(err => {
        alert("Failed to copy link");
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

  // Map company & category relations to job
  for (const job of jobs) {
    job.companyObj = companiesMap.get(job.company) || { name: 'Company', logo: '' };
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
      <div class="category-icon">${cat.icon || '💼'}</div>
      <div class="category-name">${name}</div>
    </a>`;
  }).join('');

  // Render Jobs HTML
  const jobsHtml = jobs.length > 0 ? jobs.map((job: any) => {
    const title = locale === 'ar' ? job.title_ar : job.title_en;
    const location = locale === 'ar' ? job.location_ar : job.location_en;
    const typeLabel = t[job.jobType === 'full-time' ? 'fullTime' : job.jobType === 'part-time' ? 'partTime' : job.jobType === 'remote' ? 'remote' : 'internship'];
    const timeAgo = new Date(job.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const logoPlaceholder = job.companyObj.name.charAt(0);

    return `
    <div class="job-card ${job.featured ? 'featured' : ''}" data-job-id="${job.id}">
      <div class="company-logo-wrapper">
        ${job.companyObj.logo ? `<img src="${job.companyObj.logo}" alt="${job.companyObj.name}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=&quot;font-weight: 700; color: var(--primary);&quot;>${logoPlaceholder}</span>';">` : `<span style="font-weight: 700; color: var(--primary);">${logoPlaceholder}</span>`}
      </div>
      <div class="job-details-brief">
        <div class="job-title-row">
          <div style="display: flex; align-items: center; gap: 8px;">
            <a href="/${locale}/jobs/${job.slug}" class="job-card-title">${title}</a>
            <button class="btn-fav" data-job-id="${job.id}" onclick="toggleFavorite('${job.id}', event)" title="${locale === 'ar' ? 'حفظ في المفضلة' : 'Save to Favorites'}">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
          ${job.featured ? `<span class="tag tag-feat">${t.featuredBadge}</span>` : ''}
        </div>
        <div class="company-name">${job.companyObj.name}</div>
        <div class="job-tags">
          <span class="tag tag-type">${typeLabel}</span>
          <span class="tag tag-loc"><i class="fa-solid fa-location-dot"></i> ${location}</span>
          <span class="tag tag-lang"><i class="fa-solid fa-language"></i> ${job.language === 'both' ? (locale === 'ar' ? 'ثنائي اللغة' : 'Bilingual') : job.language.toUpperCase()}</span>
        </div>
        <div class="job-meta-row">
          <div class="job-meta-items">
            <span><i class="fa-regular fa-clock"></i> ${timeAgo}</span>
            ${job.salary ? `<span><i class="fa-solid fa-wallet"></i> ${job.salary}</span>` : ''}
          </div>
          <a href="/${locale}/jobs/${job.slug}" class="btn-apply-now">${t.applyBtn}</a>
        </div>
      </div>
    </div>`;
  }).join('') : `<div style="text-align: center; padding: 40px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border);">
    <i class="fa-solid fa-search-minus" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
    <p style="font-weight: 600; color: var(--text-dark);">${t.noJobs}</p>
    <a href="/${locale}" style="color: var(--primary); text-decoration: underline; margin-top: 10px; display: inline-block;">${locale === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset filters'}</a>
  </div>`;

  const html = `
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">${t.heroTitle}</h1>
        <p class="hero-subtitle">${t.heroSubtitle}</p>
      </div>
    </section>

    <div class="container">
      <div class="search-container">
        <form class="search-box" method="GET" action="/${locale}">
          <div class="search-field">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" name="search" placeholder="${t.searchPlh}" value="${querySearch}">
          </div>
          <button type="submit" class="btn-search">${locale === 'ar' ? 'بحث' : 'Search'}</button>
        </form>
      </div>

      <section class="categories-sec">
        <h2 class="section-title">
          <span>${locale === 'ar' ? 'تصفح بالقطاعات' : 'Browse by Sectors'}</span>
        </h2>
        <div class="categories-grid">
          ${categoriesHtml}
        </div>
      </section>

      <div class="main-layout">
        <aside class="filters-sidebar">
          <h3 class="filter-title">${t.filterTitle}</h3>
          <form method="GET" action="/${locale}">
            <input type="hidden" name="search" value="${querySearch}">
            <input type="hidden" name="category" value="${queryCategory}">
            
            <div class="filter-group">
              <div class="filter-title">${t.jobType}</div>
              <div class="filter-options">
                <label class="checkbox-label">
                  <input type="radio" name="type" value="" ${!queryJobType ? 'checked' : ''} onchange="this.form.submit()">
                  <span>${locale === 'ar' ? 'الكل' : 'All'}</span>
                </label>
                <label class="checkbox-label">
                  <input type="radio" name="type" value="full-time" ${queryJobType === 'full-time' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>${t.fullTime}</span>
                </label>
                <label class="checkbox-label">
                  <input type="radio" name="type" value="part-time" ${queryJobType === 'part-time' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>${t.partTime}</span>
                </label>
                <label class="checkbox-label">
                  <input type="radio" name="type" value="remote" ${queryJobType === 'remote' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>${t.remote}</span>
                </label>
                <label class="checkbox-label">
                  <input type="radio" name="type" value="internship" ${queryJobType === 'internship' ? 'checked' : ''} onchange="this.form.submit()">
                  <span>${t.internship}</span>
                </label>
              </div>
            </div>
          </form>
        </aside>

        <section>
          <div style="margin-bottom: 20px; font-weight: 600; color: var(--text-muted);">${t.resultsCount}</div>
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
  const company = compRow ? JSON.parse(compRow.data) : { name: 'Company', description: '' };

  const title = locale === 'ar' ? job.title_ar : job.title_en;
  const description = locale === 'ar' ? job.description_ar : job.description_en;
  const location = locale === 'ar' ? job.location_ar : job.location_en;
  
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
  const applyAction = job.applyLink ? job.applyLink : `mailto:${job.applyEmail}?subject=Application for ${title}`;

  // Format description paragraphs
  const formattedDescription = description.split('\n').map((p: string) => p.trim() ? `<p style="margin-bottom: 16px;">${p}</p>` : '').join('');

  const html = `
    <div class="container">
      <div style="margin: 30px 0 10px;">
        <a href="/${locale}" style="color: var(--primary); font-weight: 600;">${translations.backToList}</a>
      </div>

      <div class="job-detail-layout">
        <article class="detail-main">
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
            <a href="${applyAction}" target="_blank" class="btn-sidebar-apply" style="margin-bottom: 20px;">${translations.applyNow}</a>
            
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
  `;

  const seoHtml = generateMetaTags(locale, 'job', {
    title,
    description: job.description_ar,
    slug: job.slug,
    publishedAt: job.publishedAt,
    companyName: company.name,
    location,
    jobType: job.jobType,
    salary: job.salary
  }) + generateJsonLd(locale, 'job', {
    title,
    description: job.description_ar,
    slug: job.slug,
    publishedAt: job.publishedAt,
    companyName: company.name,
    location,
    jobType: job.jobType,
    salary: job.salary
  });

  return c.html(renderLayout(c, title, html, locale, seoHtml));
})

// Submit Job Page
publicRouter.get('/:locale/submit-job', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en';
  
  if (locale !== 'ar' && locale !== 'en') {
    return c.redirect('/ar/submit-job');
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
      desc: 'الوصف الوظيفي والمتطلبات التفصيلية',
      submit: 'إرسال طلب التوظيف للمراجعة',
      successMsg: 'تم إرسال الوظيفة للمراجعة بنجاح! ستظهر على الموقع فور الموافقة عليها.'
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
      desc: 'Job Description & Requirements',
      submit: 'Submit Job for Review',
      successMsg: 'Job submitted successfully! It will appear on the site as soon as it is approved.'
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
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.salary}</label>
            <input type="text" name="salary" placeholder="e.g. 20,000 - 30,000 TL" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); outline: none;">
          </div>
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
      
      const docData = JSON.stringify({
        title_ar: data.title,
        title_en: data.title,
        slug: slug,
        description_ar: data.description,
        description_en: data.description,
        company: 'comp-ist-tech', // Placeholder company for review
        category: 'cat-it',       // Placeholder category for review
        location_ar: data.location,
        location_en: data.location,
        jobType: data.jobType || 'full-time',
        salary: data.salary || '',
        applyEmail: data.applyEmail,
        language: 'both',
        featured: false,
        publishedAt: nowMs,
        status: 'draft'
      });

      await db.prepare(
        `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, created_at, updated_at)
         VALUES (?, ?, 'jobs', 'draft', 0, 1, ?, ?, ?, ?, ?)`
      ).bind(id, id, slug, data.title, docData, nowMs, nowMs).run();

      // Log security event for auditing
      await logSecurityEvent(db, 'JOB_SUBMITTED', data.applyEmail, ip, `Public job submitted: ${data.title}`);

      return c.json({ success: true });
    } catch (error) {
      console.error('Error submitting job form:', error);
      return c.json({ success: false, error: 'Database insertion failed' }, 500);
    }
  }
)

