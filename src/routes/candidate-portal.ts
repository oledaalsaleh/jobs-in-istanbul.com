import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { renderLayout } from './public'
import { rateLimiter } from '../middleware/security'

export const candidatePortalRouter = new Hono()

const COOKIE_NAME = 'candidate_jwt';

// Candidate Login
candidatePortalRouter.get('/:locale/candidate/login', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru') return c.redirect('/ar/candidate/login');

  const t = {
    ar: {
      title: 'بوابة الباحثين عن عمل - تسجيل الدخول',
      subtitle: 'أدخل بريدك الإلكتروني لتلقي رابط الدخول السحري للوصول للوحة التحكم ومتابعة طلباتك ومطابقة السيرة الذاتية.',
      emailLabel: 'البريد الإلكتروني الشخصي',
      emailPlh: 'candidate@example.com',
      submitBtn: 'إرسال رابط الدخول السحري 🚀',
      loading: 'جاري الإرسال... ⏳',
      successMsg: 'تم إرسال رابط الدخول السحري! تفقد صندوق الرسائل.',
      devNotice: '🔧 في بيئة التطوير، يمكنك الدخول مباشرة بالنقر أدناه:'
    },
    en: {
      title: 'Candidate Portal - Sign In',
      subtitle: 'Enter your email address to receive a magic login link to track your applications and check AI job matching.',
      emailLabel: 'Personal Email Address',
      emailPlh: 'candidate@example.com',
      submitBtn: 'Send Magic Link 🚀',
      loading: 'Sending magic link... ⏳',
      successMsg: 'Magic login link sent! Please check your email inbox.',
      devNotice: '🔧 In development mode, you can sign in directly by clicking below:'
    },
    tr: {
      title: 'Aday Portalı - Giriş Yap',
      subtitle: 'Başvurularınızı takip etmek ve yapay zeka uyumluluğunu kontrol etmek için sihirli giriş bağlantısı alacağınız e-posta adresinizi girin.',
      emailLabel: 'Kişisel E-posta Adresi',
      emailPlh: 'candidate@example.com',
      submitBtn: 'Sihirli Bağlantı Gönder 🚀',
      loading: 'Bağlantı gönderiliyor... ⏳',
      successMsg: 'Sihirli giriş bağlantısı gönderildi! Lütfen e-posta gelen kutunuzu kontrol edin.',
      devNotice: '🔧 Geliştirme modunda, doğrudan aşağıdaki bağlantıya tıklayarak giriş yapabilirsiniz:'
    },
    ru: {
      title: 'Портал кандидата - Вход',
      subtitle: 'Введите адрес электронной почты, чтобы получить волшебную ссылку для входа, отслеживания заявок и ИИ-подбора.',
      emailLabel: 'Личный адрес электронной почты',
      emailPlh: 'candidate@example.com',
      submitBtn: 'Отправить ссылку 🚀',
      loading: 'Отправка ссылки... ⏳',
      successMsg: 'Волшебная ссылка отправлена! Пожалуйста, проверьте почту.',
      devNotice: '🔧 В режиме разработки вы можете войти напрямую, нажав ниже:'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 500px; padding: 80px 20px;">
      <div class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: center;">
        <i class="fa-solid fa-graduation-cap" style="font-size: 3rem; color: var(--accent); margin-bottom: 20px; filter: drop-shadow(0 4px 10px var(--accent-light));"></i>
        <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-dark); margin-bottom: 8px;">${t.title}</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 30px;">${t.subtitle}</p>

        <form id="cand-login-form">
          <input type="hidden" name="locale" value="${locale}">
          <div style="margin-bottom: 24px; text-align: left;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.emailLabel}</label>
            <input type="email" name="email" required placeholder="${t.emailPlh}" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); color: var(--text-dark); outline: none;">
          </div>

          <button type="submit" id="loginBtn" class="btn-sidebar-apply" style="border: none;">${t.submitBtn}</button>
        </form>

        <div id="login-success" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: var(--radius-md); color: #166534; font-weight: 600; margin-top: 20px; font-size: 0.95rem;">
          ${t.successMsg}
        </div>

        <div id="dev-mode-notice" style="display: none; margin-top: 30px; border-top: 1px dashed var(--border); padding-top: 20px; text-align: left;">
          <span style="font-weight: 700; color: var(--accent); font-size: 0.9rem; display: block; margin-bottom: 8px;">${t.devNotice}</span>
          <a id="dev-magic-link" href="#" style="color: var(--primary); text-decoration: underline; font-weight: 600; font-size: 0.9rem; word-break: break-all;"></a>
        </div>
      </div>
    </div>

    <script>
      document.getElementById('cand-login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('loginBtn');
        const successDiv = document.getElementById('login-success');
        const devDiv = document.getElementById('dev-mode-notice');
        const devLink = document.getElementById('dev-magic-link');
        
        btn.innerText = "${t.loading}";
        btn.disabled = true;
        successDiv.style.display = 'none';
        devDiv.style.display = 'none';

        try {
          const res = await fetch('/api/candidate/request-magic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: form.email.value,
              locale: form.locale.value
            })
          });

          const data = await res.json();
          if (res.ok) {
            successDiv.style.display = 'block';
            if (data.devLink) {
              devLink.href = data.devLink;
              devLink.textContent = data.devLink;
              devDiv.style.display = 'block';
            }
          } else {
            alert(data.error || 'Request failed. Please try again.');
          }
        } catch(err) {
          alert('Network error. Please try again.');
        } finally {
          btn.innerText = "${t.submitBtn}";
          btn.disabled = false;
        }
      });
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
})

// Magic Link Request for Candidates
candidatePortalRouter.post('/api/candidate/request-magic', rateLimiter(3, 10), async (c) => {
  const env: any = c.env;
  const { email, locale } = await c.req.json();

  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  try {
    const jwtSecret = env.JWT_SECRET || 'change-me-in-production-secure-key';
    const expiration = Math.floor(Date.now() / 1000) + (15 * 60); // 15 mins
    
    // Sign magic token
    const token = await sign({
      email: email.toLowerCase(),
      exp: expiration,
      action: 'candidate-magic'
    }, jwtSecret);

    const magicUrl = `http://${c.req.header('host') || 'localhost:8787'}/candidate/verify?token=${token}&locale=${locale}`;
    
    console.log(`[CANDIDATE MAGIC URL] Magic link for ${email}: ${magicUrl}`);

    const isDev = env.ENVIRONMENT === 'development' || !env.ENVIRONMENT;
    
    return c.json({
      success: true,
      devLink: isDev ? magicUrl : null
    });

  } catch(err: any) {
    return c.json({ error: 'Failed to generate token: ' + err.message }, 500);
  }
})

// Verify Candidate Magic Link
candidatePortalRouter.get('/candidate/verify', async (c) => {
  const env: any = c.env;
  const token = c.req.query('token');
  const locale = (c.req.query('locale') || 'ar') as 'ar' | 'en' | 'tr' | 'ru';

  if (!token) {
    return c.text('Token parameter missing', 400);
  }

  try {
    const jwtSecret = env.JWT_SECRET || 'change-me-in-production-secure-key';
    const payload = await verify(token, jwtSecret, 'HS256');

    if (payload.action !== 'candidate-magic') {
      return c.text('Invalid action', 400);
    }

    // Set signed cookie valid for 7 days
    const cookieToken = await sign({
      email: payload.email,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    }, jwtSecret);

    setCookie(c, COOKIE_NAME, cookieToken, {
      path: '/',
      secure: env.ENVIRONMENT === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'Lax'
    });

    return c.redirect(`/${locale}/candidate/dashboard`);

  } catch(err) {
    return c.text('Magic link has expired or is invalid.', 401);
  }
})

// Logout
candidatePortalRouter.get('/candidate/logout', (c) => {
  deleteCookie(c, COOKIE_NAME);
  return c.redirect('/ar/candidate/login');
})

// Candidate Dashboard Frontend
candidatePortalRouter.get('/:locale/candidate/dashboard', async (c) => {
  const env: any = c.env;
  const db = env.DB;
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru') return c.redirect('/ar/candidate/dashboard');

  const cookieVal = getCookie(c, COOKIE_NAME);
  if (!cookieVal) {
    return c.redirect(`/${locale}/candidate/login`);
  }

  let candidateEmail = '';
  try {
    const jwtSecret = env.JWT_SECRET || 'change-me-in-production-secure-key';
    const payload = await verify(cookieVal, jwtSecret, 'HS256');
    candidateEmail = payload.email as string;
  } catch (err) {
    return c.redirect(`/${locale}/candidate/login`);
  }

  const t = {
    ar: {
      title: 'لوحة تحكم الباحث عن عمل',
      welcome: `أهلاً بك، ${candidateEmail}`,
      logout: 'تسجيل الخروج',
      appsTitle: 'طلبات التوظيف التي قدمتها',
      noApps: 'لم تقم بالتقديم لأي وظائف بعد.',
      tblJob: 'الوظيفة والشركة',
      tblDate: 'تاريخ التقديم',
      tblQuiz: 'نتيجة الاختبار',
      tblStatus: 'حالة الطلب الحالي',
      aiMatchingTitle: 'مطابقة الوظائف بالذكاء الاصطناعي 🤖',
      aiMatchingDesc: 'الصق مهاراتك أو نص سيرتك الذاتية لمعرفة مدى مطابقتها للوظائف الشاغرة لدينا.',
      cvPlh: 'الصق نص سيرتك الذاتية هنا...',
      matchBtn: 'تحليل ومطابقة 🔍',
      tblMatchScore: 'نسبة التطابق',
      statusApplied: 'تم استلامه',
      statusReviewed: 'قيد المراجعة',
      statusShortlisted: 'مقابلة مجدولة',
      statusRejected: 'مرفوض'
    },
    en: {
      title: 'Candidate Dashboard',
      welcome: `Welcome, ${candidateEmail}`,
      logout: 'Sign Out',
      appsTitle: 'Your Job Applications',
      noApps: 'You have not submitted any applications yet.',
      tblJob: 'Job & Company',
      tblDate: 'Date Applied',
      tblQuiz: 'Quiz Score',
      tblStatus: 'Application Status',
      aiMatchingTitle: 'AI Job Matching 🤖',
      aiMatchingDesc: 'Paste your resume text to calculate matching percentages against all open jobs.',
      cvPlh: 'Paste your CV / Resume text here...',
      matchBtn: 'Match Jobs 🔍',
      tblMatchScore: 'Match Score',
      statusApplied: 'Applied',
      statusReviewed: 'Reviewed',
      statusShortlisted: 'Interview Scheduled',
      statusRejected: 'Rejected'
    },
    tr: {
      title: 'Aday Yönetim Paneli',
      welcome: `Hoş geldiniz, ${candidateEmail}`,
      logout: 'Çıkış Yap',
      appsTitle: 'İş Başvurularınız',
      noApps: 'Henüz herhangi bir başvuru yapmadınız.',
      tblJob: 'İş & Şirket',
      tblDate: 'Başvuru Tarihi',
      tblQuiz: 'Test Skoru',
      tblStatus: 'Başvuru Durumu',
      aiMatchingTitle: 'Yapay Zeka İş Eşleştirme 🤖',
      aiMatchingDesc: 'Açık ilanlarımızla eşleşme oranlarını hesaplamak için özgeçmiş metninizi yapıştırın.',
      cvPlh: 'CV / Özgeçmiş metninizi buraya yapıştırın...',
      matchBtn: 'İşleri Eşleştir 🔍',
      tblMatchScore: 'Eşleşme Skoru',
      statusApplied: 'Başvuruldu',
      statusReviewed: 'İncelendi',
      statusShortlisted: 'Mülakat Planlandı',
      statusRejected: 'Reddedildi'
    },
    ru: {
      title: 'Панель кандидата',
      welcome: `Добро пожаловать, ${candidateEmail}`,
      logout: 'Выйти',
      appsTitle: 'Ваши отклики на вакансии',
      noApps: 'Вы еще не отправили ни одного отклика.',
      tblJob: 'Вакансия и компания',
      tblDate: 'Дата отклика',
      tblQuiz: 'Результат теста',
      tblStatus: 'Статус отклика',
      aiMatchingTitle: 'ИИ-Подбор вакансий 🤖',
      aiMatchingDesc: 'Вставьте текст вашего резюме, чтобы рассчитать процент соответствия всем открытым вакансиям.',
      cvPlh: 'Вставьте текст вашего резюме сюда...',
      matchBtn: 'Подобрать вакансии 🔍',
      tblMatchScore: 'Процент соответствия',
      statusApplied: 'Получено',
      statusReviewed: 'На рассмотрении',
      statusShortlisted: 'Собеседование назначено',
      statusRejected: 'Отклонено'
    }
  }[locale];

  try {
    // 1. Fetch applications
    const appRows = await db.prepare(
      `SELECT id, data, created_at FROM documents WHERE type_id = 'applications'`
    ).all();

    const rawApps = (appRows.results || []).map((row: any) => ({
      id: row.id,
      createdAt: row.created_at,
      ...JSON.parse(row.data)
    })).filter((app: any) => app.candidateEmail.toLowerCase() === candidateEmail);

    // 2. Fetch jobs to map details
    const jobRows = await db.prepare(
      `SELECT id, slug, data FROM documents WHERE type_id = 'jobs' AND status = 'published' AND is_published = 1`
    ).all();

    const jobsMap = new Map();
    for (const row of jobRows.results || []) {
      jobsMap.set(row.id, {
        id: row.id,
        slug: row.slug,
        ...JSON.parse(row.data)
      });
    }

    const countApplied = rawApps.filter((app: any) => (app.status || 'applied') === 'applied').length;
    const countReviewed = rawApps.filter((app: any) => app.status === 'reviewed').length;
    const countShortlisted = rawApps.filter((app: any) => app.status === 'shortlisted').length;
    const countRejected = rawApps.filter((app: any) => app.status === 'rejected').length;

    const renderKanbanCards = (status: string) => {
      const filtered = rawApps.filter((app: any) => (app.status || 'applied') === status);
      if (filtered.length === 0) {
        return `<div class="empty-col-notice" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">${locale === 'ar' ? 'فارغ' : 'Empty'}</div>`;
      }
      return filtered.map((app: any) => {
        const job = jobsMap.get(app.jobId) || { title_ar: 'Job Posting', title_en: 'Job Posting', company: 'Company', slug: '' };
        const title = locale === 'ar' ? job.title_ar : (locale === 'tr' ? (job.title_tr || job.title_en) : job.title_en);
        const quizText = app.quizScore ? `${app.quizScore}%` : '';
        return `
          <div class="kanban-card" draggable="true" ondragstart="drag(event)" id="app-card-${app.id}" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 12px; box-shadow: var(--shadow-sm); cursor: grab; transition: var(--t-base);">
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; margin-bottom: 4px;">${job.company}</div>
            <a href="/${locale}/jobs/${job.slug}" target="_blank" style="font-weight: 700; color: var(--text-heading); font-size: 0.95rem; display: block; margin-bottom: 8px; line-height: 1.3;">${title}</a>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px; color: var(--text-muted);">
              <span><i class="fa-solid fa-clock"></i> ${new Date(app.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
              ${app.quizScore ? `<span style="font-weight: 700; color: var(--primary);"><i class="fa-solid fa-award"></i> ${quizText}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
    };

    // Render applications HTML with switcher and both Kanban and Table views
    const appsHtml = rawApps.length > 0 ? `
      <style>
        .view-toggle-btn.active-toggle {
          background: var(--primary) !important;
          color: #fff !important;
        }
        .kanban-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
          border-color: var(--primary) !important;
        }
      </style>
      <div id="applications-section-wrapper">
        <!-- View Toggle Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 12px; flex-wrap: wrap; gap: 12px;">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-heading); margin: 0;"><i class="fa-solid fa-file-invoice" style="color: var(--accent);"></i> ${t.appsTitle}</h3>
          <div style="display: flex; background: var(--bg-subtle); border: 1px solid var(--border); padding: 4px; border-radius: var(--r-sm);">
            <button type="button" onclick="switchView('kanban')" id="btn-view-kanban" class="view-toggle-btn active-toggle" style="border: none; padding: 6px 12px; font-weight: 700; border-radius: var(--r-xs); cursor: pointer; transition: all 0.2s; background: var(--primary); color: #fff;">
              <i class="fa-solid fa-grip-vertical"></i> ${locale === 'ar' ? 'لوحة كانبان' : 'Kanban'}
            </button>
            <button type="button" onclick="switchView('table')" id="btn-view-table" class="view-toggle-btn" style="border: none; padding: 6px 12px; font-weight: 700; border-radius: var(--r-xs); cursor: pointer; transition: all 0.2s; background: transparent; color: var(--text-muted);">
              <i class="fa-solid fa-list"></i> ${locale === 'ar' ? 'جدول' : 'Table'}
            </button>
          </div>
        </div>

        <!-- Kanban View -->
        <div id="view-kanban" class="dashboard-view-panel">
          <div class="kanban-board" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 10px;">
            
            <!-- Column: Applied -->
            <div class="kanban-column" style="background: var(--bg-subtle); border: 1px solid var(--border); border-radius: var(--r-md); padding: 14px; display: flex; flex-direction: column; min-height: 400px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
                <h4 style="margin: 0; font-weight: 800; color: var(--text-heading); font-size: 0.9rem;"><i class="fa-solid fa-paper-plane" style="color: #3b82f6;"></i> ${t.statusApplied}</h4>
                <span class="badge" style="background: #3b82f615; color: #3b82f6; font-size: 0.8rem; font-weight: 700; padding: 2px 8px; border-radius: var(--r-full);" id="count-applied">${countApplied}</span>
              </div>
              <div class="kanban-cards" ondragover="allowDrop(event)" ondrop="drop(event, 'applied')" style="display: flex; flex-direction: column; gap: 12px; flex-grow: 1;" data-status="applied">
                ${renderKanbanCards('applied')}
              </div>
            </div>
            
            <!-- Column: Reviewed -->
            <div class="kanban-column" style="background: var(--bg-subtle); border: 1px solid var(--border); border-radius: var(--r-md); padding: 14px; display: flex; flex-direction: column; min-height: 400px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
                <h4 style="margin: 0; font-weight: 800; color: var(--text-heading); font-size: 0.9rem;"><i class="fa-solid fa-magnifying-glass" style="color: #f59e0b;"></i> ${t.statusReviewed}</h4>
                <span class="badge" style="background: #f59e0b15; color: #f59e0b; font-size: 0.8rem; font-weight: 700; padding: 2px 8px; border-radius: var(--r-full);" id="count-reviewed">${countReviewed}</span>
              </div>
              <div class="kanban-cards" ondragover="allowDrop(event)" ondrop="drop(event, 'reviewed')" style="display: flex; flex-direction: column; gap: 12px; flex-grow: 1;" data-status="reviewed">
                ${renderKanbanCards('reviewed')}
              </div>
            </div>

            <!-- Column: Shortlisted -->
            <div class="kanban-column" style="background: var(--bg-subtle); border: 1px solid var(--border); border-radius: var(--r-md); padding: 14px; display: flex; flex-direction: column; min-height: 400px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">
                <h4 style="margin: 0; font-weight: 800; color: var(--text-heading); font-size: 0.9rem;"><i class="fa-solid fa-calendar-check" style="color: #10b981;"></i> ${t.statusShortlisted}</h4>
                <span class="badge" style="background: #10b98115; color: #10b981; font-size: 0.8rem; font-weight: 700; padding: 2px 8px; border-radius: var(--r-full);" id="count-shortlisted">${countShortlisted}</span>
              </div>
              <div class="kanban-cards" ondragover="allowDrop(event)" ondrop="drop(event, 'shortlisted')" style="display: flex; flex-direction: column; gap: 12px; flex-grow: 1;" data-status="shortlisted">
                ${renderKanbanCards('shortlisted')}
              </div>
            </div>

            <!-- Column: Rejected -->
            <div class="kanban-column" style="background: var(--bg-subtle); border: 1px solid var(--border); border-radius: var(--r-md); padding: 14px; display: flex; flex-direction: column; min-height: 400px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 2px solid #ef4444; padding-bottom: 8px;">
                <h4 style="margin: 0; font-weight: 800; color: var(--text-heading); font-size: 0.9rem;"><i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i> ${t.statusRejected}</h4>
                <span class="badge" style="background: #ef444415; color: #ef4444; font-size: 0.8rem; font-weight: 700; padding: 2px 8px; border-radius: var(--r-full);" id="count-rejected">${countRejected}</span>
              </div>
              <div class="kanban-cards" ondragover="allowDrop(event)" ondrop="drop(event, 'rejected')" style="display: flex; flex-direction: column; gap: 12px; flex-grow: 1;" data-status="rejected">
                ${renderKanbanCards('rejected')}
              </div>
            </div>

          </div>
        </div>

        <!-- Table View -->
        <div id="view-table" class="dashboard-view-panel" style="display: none;">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border); color: var(--text-heading); font-weight: 700;">
                  <th style="padding: 12px;">${t.tblJob}</th>
                  <th style="padding: 12px;">${t.tblDate}</th>
                  <th style="padding: 12px;">${t.tblQuiz}</th>
                  <th style="padding: 12px;">${t.tblStatus}</th>
                </tr>
              </thead>
              <tbody>
                ${rawApps.map((app: any) => {
                  const job = jobsMap.get(app.jobId) || { title_ar: 'Job Posting', title_en: 'Job Posting', company: 'Company', slug: '' };
                  const title = locale === 'ar' ? job.title_ar : job.title_en;
                  const quizText = app.quizScore ? app.quizScore : '--';
                  
                  let statusText = t.statusApplied;
                  let statusColor = '#3b82f6';
                  if (app.status === 'reviewed') { statusText = t.statusReviewed; statusColor = '#f59e0b'; }
                  if (app.status === 'shortlisted') { statusText = t.statusShortlisted; statusColor = '#10b981'; }
                  if (app.status === 'rejected') { statusText = t.statusRejected; statusColor = '#ef4444'; }

                  return `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 12px;">
                        <a href="/${locale}/jobs/${job.slug}" target="_blank" style="font-weight: 700; color: var(--text-heading);">${title}</a>
                      </td>
                      <td style="padding: 12px; color: var(--text-muted);">${new Date(app.createdAt).toLocaleDateString()}</td>
                      <td style="padding: 12px; font-weight: 600;">${quizText}</td>
                      <td style="padding: 12px;">
                        <span class="tag" style="background: ${statusColor}15; color: ${statusColor}; font-weight: 700; border: 1px solid ${statusColor}30;">
                          ${statusText}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ` : `<p style="color: var(--text-muted); font-style: italic;">${t.noApps}</p>`;

    const html = `
      <div class="container" style="padding: 60px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 20px;">
          <div>
            <h1 style="font-size: 2.25rem; font-weight: 800; color: var(--text-dark);">${t.title}</h1>
            <p style="color: var(--text-muted); font-weight: 600;">${t.welcome}</p>
          </div>
          <a href="/candidate/logout" class="btn-apply-now" style="border: 1px solid hsl(0, 100%, 65%); color: hsl(0, 100%, 55%); padding: 10px 24px; font-weight: 700; background: transparent;"><i class="fa-solid fa-arrow-right-from-bracket"></i> ${t.logout}</a>
        </div>

        <div class="main-layout" style="grid-template-columns: 1fr 1fr; gap: 40px;">
          
          <!-- Left side: Job Applications -->
          <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg);">
            ${appsHtml}
          </div>

          <!-- Right side: AI Job Matcher -->
          <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg);">
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin-bottom: 10px;"><i class="fa-solid fa-robot" style="color: var(--primary);"></i> ${t.aiMatchingTitle}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">${t.aiMatchingDesc}</p>

            <form id="ai-matching-form" onsubmit="calculateJobMatches(event)">
              <textarea id="candidate-cv-text" required placeholder="${t.cvPlh}" rows="8" class="form-input" style="margin-bottom: 20px;"></textarea>
              <button type="submit" id="matchBtn" class="btn-sidebar-apply" style="border: none;">${t.matchBtn}</button>
            </form>

            <div id="matching-results-container" style="display: none; margin-top: 30px; border-top: 1px solid var(--border); padding-top: 20px;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--border); color: var(--text-dark); font-weight: 700;">
                    <th style="padding: 10px;">${locale === 'ar' ? 'الوظيفة' : (locale === 'tr' ? 'İş Unvanı' : 'Job Title')}</th>
                    <th style="padding: 10px; text-align: center;">${t.tblMatchScore}</th>
                  </tr>
                </thead>
                <tbody id="matching-results-body">
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <script>
        function switchView(view) {
          document.querySelectorAll('.dashboard-view-panel').forEach(panel => panel.style.display = 'none');
          document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.classList.remove('active-toggle');
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-muted)';
          });
          
          if (view === 'kanban') {
            document.getElementById('view-kanban').style.display = 'block';
            const btn = document.getElementById('btn-view-kanban');
            btn.classList.add('active-toggle');
            btn.style.background = 'var(--primary)';
            btn.style.color = '#fff';
          } else {
            document.getElementById('view-table').style.display = 'block';
            const btn = document.getElementById('btn-view-table');
            btn.classList.add('active-toggle');
            btn.style.background = 'var(--primary)';
            btn.style.color = '#fff';
          }
        }

        function allowDrop(ev) {
          ev.preventDefault();
        }

        function drag(ev) {
          ev.dataTransfer.setData("text", ev.target.id);
        }

        async function drop(ev, newStatus) {
          ev.preventDefault();
          const data = ev.dataTransfer.getData("text");
          const cardEl = document.getElementById(data);
          if (!cardEl) return;
          
          const targetCardsContainer = ev.currentTarget.closest('.kanban-column').querySelector('.kanban-cards');
          if (!targetCardsContainer) return;
          
          // Remove empty notice if any
          const emptyNotice = targetCardsContainer.querySelector('.empty-col-notice');
          if (emptyNotice) {
            emptyNotice.remove();
          }

          // Append the card visually
          targetCardsContainer.appendChild(cardEl);
          
          // Recalculate counts
          recalculateCounts();
          
          const appId = data.replace('app-card-', '');
          try {
            const res = await fetch('/api/candidate/update-app-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ appId, status: newStatus })
            });
            if (!res.ok) {
              alert('Failed to save status on server.');
            }
          } catch (err) {
            alert('Network error, could not save status.');
          }
        }

        function recalculateCounts() {
          ['applied', 'reviewed', 'shortlisted', 'rejected'].forEach(status => {
            const col = document.querySelector('.kanban-cards[data-status="' + status + '"]');
            if (col) {
              const cards = col.querySelectorAll('.kanban-card');
              const count = cards.length;
              const badge = document.getElementById('count-' + status);
              if (badge) badge.textContent = count;

              // If count is 0 and no empty notice, add one
              const notice = col.querySelector('.empty-col-notice');
              if (count === 0 && !notice) {
                const div = document.createElement('div');
                div.className = 'empty-col-notice';
                div.style.textAlign = 'center';
                div.style.padding = '20px';
                div.style.color = 'var(--text-muted)';
                div.style.fontSize = '0.85rem';
                div.style.fontStyle = 'italic';
                div.textContent = "${locale === 'ar' ? 'فارغ' : (locale === 'tr' ? 'Boş' : 'Empty')}";
                col.appendChild(div);
              }
            }
          });
        }

        async function calculateJobMatches(e) {
          e.preventDefault();
          const cvText = document.getElementById('candidate-cv-text').value;
          const btn = document.getElementById('matchBtn');
          const tbody = document.getElementById('matching-results-body');
          const container = document.getElementById('matching-results-container');
          
          btn.innerText = "${locale === 'ar' ? 'جاري التحليل والمطابقة...' : (locale === 'tr' ? 'Analiz Ediliyor ve Eşleştiriliyor...' : 'Analyzing & Matching...')}";
          btn.disabled = true;
          container.style.display = 'none';

          try {
            const res = await fetch('/api/jobs/match', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cvText })
            });

            const data = await res.json();
            if (res.ok && data.matches.length > 0) {
              tbody.innerHTML = data.matches.map(m => {
                const scoreColor = m.score >= 80 ? '#10b981' : m.score >= 50 ? '#f59e0b' : '#ef4444';
                return \`
                  <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 10px;">
                      <a href="/${locale}/jobs/\${m.slug}" target="_blank" style="font-weight: 700; color: var(--text-dark);">\${m.title}</a>
                    </td>
                    <td style="padding: 10px; text-align: center;">
                      <span class="tag" style="background: \${scoreColor}15; color: \${scoreColor}; font-weight: 800;">\${m.score}% Match</span>
                    </td>
                  </tr>
                \`;
              }).join('');
              container.style.display = 'block';
            } else {
              tbody.innerHTML = '<tr><td colspan="2" style="padding:10px; text-align:center; color:var(--text-muted);">${locale === 'ar' ? 'لا توجد وظائف متطابقة حالياً.' : (locale === 'tr' ? 'Eşleşen iş ilanı bulunamadı.' : 'No matching jobs found.')}</td></tr>';
              container.style.display = 'block';
            }
          } catch (err) {
            alert('Error running AI job matcher.');
          } finally {
            btn.innerText = "${t.matchBtn}";
            btn.disabled = false;
          }
        }
      </script>
    `;

    return c.html(renderLayout(c, t.title, html, locale));

  } catch(err: any) {
    return c.text('Error loading candidate dashboard: ' + err.message, 500);
  }
})

// Update Application Status for Candidate Tracker
candidatePortalRouter.post('/api/candidate/update-app-status', async (c) => {
  const env: any = c.env;
  const db = env.DB;

  const cookieVal = getCookie(c, COOKIE_NAME);
  if (!cookieVal) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const jwtSecret = env.JWT_SECRET || 'change-me-in-production-secure-key';
    const payload = await verify(cookieVal, jwtSecret, 'HS256');
    const candidateEmail = payload.email as string;

    const { appId, status } = await c.req.json();
    if (!appId || !status) {
      return c.json({ error: 'Missing app ID or status' }, 400);
    }

    // Fetch existing application document
    const appRow = await db.prepare(
      `SELECT data FROM documents WHERE id = ? AND type_id = 'applications'`
    ).bind(appId).first();

    if (!appRow) {
      return c.json({ error: 'Application not found' }, 404);
    }

    const appData = JSON.parse(appRow.data);
    
    // Safety check: candidate can only update their own application
    if (appData.candidateEmail.toLowerCase() !== candidateEmail.toLowerCase()) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    appData.status = status;

    await db.prepare(
      `UPDATE documents SET data = ?, updated_at = ? WHERE id = ?`
    ).bind(JSON.stringify(appData), Date.now(), appId).run();

    return c.json({ success: true });

  } catch(err: any) {
    return c.json({ error: 'Failed to update: ' + err.message }, 500);
  }
})

// AI Matcher API Endpoint
candidatePortalRouter.post('/api/jobs/match', async (c) => {
  const env: any = c.env;
  const db = env.DB;
  const { cvText } = await c.req.json();

  if (!cvText) {
    return c.json({ error: 'CV Text is required' }, 400);
  }

  try {
    // Fetch all published jobs
    const jobRows = await db.prepare(
      `SELECT id, slug, data FROM documents WHERE type_id = 'jobs' AND status = 'published' AND is_published = 1`
    ).all();

    const jobs = (jobRows.results || []).map((row: any) => ({
      id: row.id,
      slug: row.slug,
      ...JSON.parse(row.data)
    }));

    const cleanCV = cvText.toLowerCase().replace(/[^a-z0-9\sأ-ي]/g, ' ');
    const cvWords = new Set(cleanCV.split(/\s+/).filter((w: string) => w.length > 2));

    const matches = jobs.map((job: any) => {
      // Analyze description keywords
      const title = job.title_en || job.title_ar;
      const descText = (job.title_en + ' ' + job.title_ar + ' ' + job.description_en + ' ' + job.description_ar).toLowerCase();
      const jobWords = descText.replace(/[^a-z0-9\sأ-ي]/g, ' ').split(/\s+/).filter((w: string) => w.length > 2);
      
      const uniqueJobWords = Array.from(new Set(jobWords));
      let matchesCount = 0;
      
      uniqueJobWords.forEach((word: string) => {
        if (cvWords.has(word)) {
          matchesCount++;
        }
      });

      // Calculate score out of 100 based on keyword overlap
      const score = uniqueJobWords.length > 0 ? Math.round((matchesCount / uniqueJobWords.length) * 100) : 0;
      
      // Scale matching ratio to feel natural
      const scaledScore = Math.min(Math.round(score * 2.5 + 20), 100); 

      return {
        title,
        slug: job.slug,
        score: scaledScore > 100 ? 100 : scaledScore < 15 ? 15 : scaledScore
      };
    }).sort((a: any, b: any) => b.score - a.score);

    return c.json({ matches: matches.slice(0, 10) });

  } catch(err: any) {
    return c.json({ error: 'Failed to calculate job matches: ' + err.message }, 500);
  }
})
