import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { renderLayout } from './public'
import { rateLimiter } from '../middleware/security'

export const employerPortalRouter = new Hono()

const COOKIE_NAME = 'employer_jwt';

// Employer Login Page
employerPortalRouter.get('/:locale/employer/login', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/employer/login');

  const t = {
    ar: {
      title: 'بوابة أصحاب العمل - تسجيل الدخول',
      subtitle: 'أدخل بريدك الإلكتروني لتلقي رابط تسجيل الدخول السحري للوصول للوحة التحكم وإدارة طلبات التوظيف.',
      emailLabel: 'البريد الإلكتروني للشركة',
      emailPlh: 'company@example.com',
      submitBtn: 'إرسال رابط الدخول 🚀',
      loading: 'جاري إرسال الرابط... ⏳',
      successMsg: 'تم إرسال رابط الدخول السحري بنجاح! تفقد بريدك الإلكتروني.',
      devLinkNotice: '🔧 في بيئة التطوير، يمكنك تسجيل الدخول مباشرة بالنقر أدناه:'
    },
    en: {
      title: 'Employer Portal - Sign In',
      subtitle: 'Enter your business email to receive a secure magic login link to manage candidate applications.',
      emailLabel: 'Business Email Address',
      emailPlh: 'company@example.com',
      submitBtn: 'Send Magic Link 🚀',
      loading: 'Sending magic link... ⏳',
      successMsg: 'Magic login link sent! Please check your email inbox.',
      devLinkNotice: '🔧 In development mode, you can sign in directly by clicking below:'
    },
    tr: {
      title: 'İşveren Portalı - Giriş Yap',
      subtitle: 'Başvuruları yönetmek ve aday listelerini kontrol etmek için güvenli sihirli giriş bağlantısı alacağınız şirket e-postanızı girin.',
      emailLabel: 'Şirket E-posta Adresi',
      emailPlh: 'company@example.com',
      submitBtn: 'Giriş Bağlantısı Gönder 🚀',
      loading: 'Bağlantı gönderiliyor... ⏳',
      successMsg: 'Sihirli giriş bağlantısı başarıyla gönderildi! Lütfen e-postanızı kontrol edin.',
      devLinkNotice: '🔧 Geliştirme modunda doğrudan aşağıdaki bağlantıya tıklayarak giriş yapabilirsiniz:'
    },
    ru: {
      title: 'Портал работодателя - Вход',
      subtitle: 'Введите рабочий адрес электронной почты, чтобы получить ссылку для входа и управления откликами.',
      emailLabel: 'Рабочий адрес электронной почты',
      emailPlh: 'company@example.com',
      submitBtn: 'Отправить ссылку 🚀',
      loading: 'Отправка ссылки... ⏳',
      successMsg: 'Волшебная ссылка отправлена! Пожалуйста, проверьте почту.',
      devLinkNotice: '🔧 В режиме разработки вы можете войти напрямую, нажав ниже:'
    },
    fa: {
      title: 'پورتال کارفرمایان - ورود',
      subtitle: 'ایمیل تجاری خود را وارد کنید تا لینک جادویی و ایمن ورود برای مدیریت آگهی‌های استخدام و درخواست‌های کارجویان ارسال شود.',
      emailLabel: 'آدرس ایمیل شرکت / کاری',
      emailPlh: 'company@example.com',
      submitBtn: 'ارسال لینک جادویی 🚀',
      loading: 'در حال ارسال لینک... ⏳',
      successMsg: 'لینک ورود جادویی با موفقیت ارسال شد! لطفاً ایمیل خود را بررسی کنید.',
      devLinkNotice: '🔧 در محیط توسعه، می‌توانید مستقیماً با کلیک بر روی لینک زیر وارد شوید:'
    },
    ur: {
      title: 'آجر (Employer) لاگ ان پورٹل',
      subtitle: 'اپنی کمپنی کا آفیشل ای میل درج کریں تاکہ نوکریوں اور امیدواروں کے انتظام کے لیے میجک لنک حاصل ہو سکے۔',
      emailLabel: 'آفیشل کمپنی ای میل',
      emailPlh: 'company@example.com',
      submitBtn: 'لاگ ان میجک لنک بھیجیں 🚀',
      loading: 'لنک بھیجا جا رہا ہے... ⏳',
      successMsg: 'لاگ ان لنک کامیابی سے بھیج دیا گیا ہے! اپنا ای میل چیک کریں۔',
      devLinkNotice: '🔧 ڈویلپمنٹ موڈ: آپ براہِ راست لاگ ان کرنے کے لیے نیچے کلک کر سکتے ہیں:'
    }
  }[locale];

  const html = `
    <div class="container" style="max-width: 500px; padding: 80px 20px;">
      <div class="glass-card" style="padding: 40px; border-radius: var(--radius-lg); text-align: center;">
        <i class="fa-solid fa-user-tie" style="font-size: 3rem; color: var(--primary); margin-bottom: 20px; filter: drop-shadow(0 4px 10px var(--primary-glow));"></i>
        <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-dark); margin-bottom: 8px;">${t.title}</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 30px;">${t.subtitle}</p>

        <form id="magic-login-form">
          <input type="hidden" name="locale" value="${locale}">
          <div style="margin-bottom: 24px; text-align: left;">
            <label style="display: block; font-weight: 700; color: var(--text-dark); margin-bottom: 8px;">${t.emailLabel}</label>
            <input type="email" id="login-email" name="email" required placeholder="${t.emailPlh}" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-site); color: var(--text-dark); outline: none;">
          </div>

          <button type="submit" id="loginBtn" class="btn-sidebar-apply" style="border: none;">${t.submitBtn}</button>
        </form>

        <div id="login-success" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: var(--radius-md); color: #166534; font-weight: 600; margin-top: 20px; font-size: 0.95rem;">
          ${t.successMsg}
        </div>

        <div id="dev-mode-notice" style="display: none; margin-top: 30px; border-top: 1px dashed var(--border); padding-top: 20px; text-align: left;">
          <span style="font-weight: 700; color: var(--accent); font-size: 0.9rem; display: block; margin-bottom: 8px;">${t.devLinkNotice}</span>
          <a id="dev-magic-link" href="#" style="color: var(--primary); text-decoration: underline; font-weight: 600; font-size: 0.9rem; word-break: break-all;"></a>
        </div>
      </div>
    </div>

    <script>
      document.getElementById('magic-login-form').addEventListener('submit', async function(e) {
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
          const res = await fetch('/api/employer/request-magic', {
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

// Magic Link Request Endpoint
employerPortalRouter.post('/api/employer/request-magic', rateLimiter(3, 10), async (c) => {
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
      action: 'magic-login'
    }, jwtSecret);

    const magicUrl = `http://${c.req.header('host') || 'localhost:8787'}/employer/verify?token=${token}&locale=${locale}`;
    
    console.log(`[MAGIC LINK EMAIL SUL] Magic login link for ${email}: ${magicUrl}`);

    const isDev = env.ENVIRONMENT === 'development' || !env.ENVIRONMENT;
    
    return c.json({
      success: true,
      devLink: isDev ? magicUrl : null
    });

  } catch(err: any) {
    return c.json({ error: 'Failed to generate token: ' + err.message }, 500);
  }
})

// Verify Magic Link Endpoint
employerPortalRouter.get('/employer/verify', async (c) => {
  const env: any = c.env;
  const token = c.req.query('token');
  const locale = (c.req.query('locale') || 'ar') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';

  if (!token) {
    return c.text('Verification token is missing.', 400);
  }

  try {
    const jwtSecret = env.JWT_SECRET || 'change-me-in-production-secure-key';
    const payload = await verify(token, jwtSecret, 'HS256');

    if (payload.action !== 'magic-login') {
      return c.text('Invalid token action.', 400);
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

    return c.redirect(`/${locale}/employer/dashboard`);

  } catch(err) {
    return c.text('The magic link has expired or is invalid. Please request a new one.', 401);
  }
})

// Employer Sign Out Route
employerPortalRouter.get('/employer/logout', (c) => {
  deleteCookie(c, COOKIE_NAME);
  return c.redirect('/ar/employer/login');
})

// Pricing Mock Packages page
employerPortalRouter.get('/:locale/employer/pricing', (c) => {
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/employer/pricing');

  const t = {
    ar: {
      title: 'باقات اشتراك أصحاب العمل',
      subtitle: 'اختر الباقة المناسبة لشركتك لتصل لآلاف الكفاءات والكوادر في إسطنبول، وتفعل ميزات الفلترة الذكية ATS.',
      planFree: 'الباقة المجانية',
      planPro: 'الباقة الاحترافية (Pro)',
      planEnterprise: 'الباقة الشاملة (Enterprise)',
      priceFree: 'مجاناً',
      pricePro: '٩٩ $ / شهرياً',
      priceEnterprise: '٢٤٩ $ / شهرياً',
      btnSelect: 'اشترك الآن 💳',
      sandboxTitle: 'محاكي بوابات الدفع (Sandbox)',
      sandboxDesc: 'هذه محاكاة سريعة لعملية الدفع لتفعيل ميزات حساب أصحاب العمل الاحترافي.',
      sandboxSuccess: 'تم ترقية حسابك بنجاح! يمكنك الآن نشر عدد غير محدود من الوظائف وتفعيل نظام الفرز ATS.'
    },
    en: {
      title: 'Employer Subscription Packages',
      subtitle: 'Select the ideal plan for your enterprise to target top candidates in Istanbul and activate smart ATS tools.',
      planFree: 'Free Basic Plan',
      planPro: 'Professional Plan (Pro)',
      planEnterprise: 'Enterprise Plan',
      priceFree: '$0',
      pricePro: '$99 / month',
      priceEnterprise: '$249 / month',
      btnSelect: 'Subscribe Now 💳',
      sandboxTitle: 'Stripe Sandbox Simulation',
      sandboxDesc: 'This is a simulated gateway checkout to activate your premium ATS Employer limits.',
      sandboxSuccess: 'Plan upgraded successfully! You can now publish unlimited jobs and filter ATS candidates.'
    },
    tr: {
      title: 'İşveren Abonelik Paketleri',
      subtitle: 'İstanbul\'daki binlerce adaya ulaşmak ve akıllı ATS araçlarını kullanmak için firmanıza en uygun planı seçin.',
      planFree: 'Ücretsiz Başlangıç Planı',
      planPro: 'Profesyonel Plan (Pro)',
      planEnterprise: 'Kurumsal Plan (Enterprise)',
      priceFree: 'Ücretsiz',
      pricePro: '99 $ / aylık',
      priceEnterprise: '249 $ / aylık',
      btnSelect: 'Şimdi Abone Ol 💳',
      sandboxTitle: 'Ödeme Simülasyonu (Sandbox)',
      sandboxDesc: 'Profesyonel işveren hesabı özelliklerini aktifleştirmek için hızlı bir ödeme simülasyonudur.',
      sandboxSuccess: 'Hesabınız başarıyla yükseltildi! Artık sınırsız iş ilanı yayınlayabilir ve ATS sistemini kullanabilirsiniz.'
    },
    ru: {
      title: 'Пакеты подписки для работодателей',
      subtitle: 'Выберите подходящий план для вашей компании, чтобы связаться с лучшими кандидатами в Стамбуле и активировать инструменты ATS.',
      planFree: 'Бесплатный базовый тариф',
      planPro: 'Профессиональный тариф (Pro)',
      planEnterprise: 'Kurumsal Plan (Enterprise)',
      priceFree: 'Бесплатно',
      pricePro: '99 $ / мес',
      priceEnterprise: '249 $ / мес',
      btnSelect: 'Подписаться 💳',
      sandboxTitle: 'Имитация оплаты (Sandbox)',
      sandboxDesc: 'Это симуляция процесса оплаты для активации расширенных лимитов работодателя.',
      sandboxSuccess: 'Тариф успешно обновлен! Теперь вы можете публиковать неограниченное количество вакансий и использовать систему ATS.'
    },
    fa: {
      title: 'بسته‌های اشتراک کارفرمایان',
      subtitle: 'پلان مناسب شرکت خود را انتخاب کنید تا با بهترین کارجویان متخصص در استانبول ارتباط برقرار کرده و ابزارهای غربالگری هوشمند را فعال کنید.',
      planFree: 'پلان رایگان پایه',
      planPro: 'پلان حرفه‌ای (Pro)',
      planEnterprise: 'پلان شرکتی (Enterprise)',
      priceFree: 'رایگان',
      pricePro: '۹۹ دلار / ماهانه',
      priceEnterprise: '۲۴۹ دلار / ماهانه',
      btnSelect: 'خرید اشتراک 💳',
      sandboxTitle: 'شبیه‌ساز پرداخت (محیط تست)',
      sandboxDesc: 'یک شبیه‌سازی پرداخت سریع برای ارتقای آنی حساب کاربری و فعال‌سازی قابلیت‌های کارفرمای حرفه‌ای است.',
      sandboxSuccess: 'حساب کاربری شما با موفقیت ارتقا یافت! اکنون می‌توانید بدون محدودیت آگهی استخدام ثبت کنید و از سیستم ATS استفاده کنید.'
    },
    ur: {
      title: 'آجروں کے لیے سبسکرپشن پیکجز',
      subtitle: 'بہترین امیدواروں اور اے ٹی ایس ٹولز تک رسائی کے لیے مناسب ترین پلان منتخب کریں۔',
      planFree: 'بنیادی مفت پلان',
      planPro: 'پیشہ ورانہ (Pro) پلان',
      planEnterprise: 'کارپوریٹ (Enterprise) پلان',
      priceFree: 'مفت',
      pricePro: '$99 / ماہانہ',
      priceEnterprise: '$249 / ماہانہ',
      btnSelect: 'پلان منتخب کریں 💳',
      sandboxTitle: 'پیمنٹ سمیلیٹر (ٹیسٹ موڈ)',
      sandboxDesc: 'فوری اکاؤنٹ اپ گریڈ اور اے ٹی ایس پریمیم فیچرز ایکٹیویٹ کرنے کے لیے ٹیسٹ پیمنٹ کریں۔',
      sandboxSuccess: 'آپ کا اکاؤنٹ کامیابی سے اپ گریڈ کر دیا گیا ہے! اب آپ لامحدود نوکریاں پوسٹ کر سکتے ہیں۔'
    }
  }[locale];

  const html = `
    <div class="container" style="padding: 60px 20px; margin-bottom: 100px;">
      <h1 class="hero-title-gradient" style="text-align: center; margin-bottom: 12px; font-size: 2.5rem; font-weight: 800;">${t.title}</h1>
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 50px; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto;">${t.subtitle}</p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1000px; margin: 0 auto;">
        
        <!-- Free Plan -->
        <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px;">${t.planFree}</h2>
            <div style="font-size: 2rem; font-weight: 900; color: var(--primary); margin-bottom: 24px;">${t.priceFree}</div>
            <ul style="list-style: none; padding:0; margin-bottom:30px; line-height: 1.8;">
              <li><i class="fa-solid fa-check" style="color:var(--primary);"></i> ${locale === 'ar' ? 'نشر حتى ٣ وظائف في الشهر' : 'Post up to 3 jobs / month'}</li>
              <li><i class="fa-solid fa-check" style="color:var(--primary);"></i> ${locale === 'ar' ? 'استلام الطلبات عبر البريد' : 'Receive resumes via email'}</li>
              <li><i class="fa-solid fa-xmark" style="color:red;"></i> ${locale === 'ar' ? 'نظام الفرز والتقييم ATS' : 'Smart ATS screening'}</li>
            </ul>
          </div>
          <button onclick="triggerCheckout('${t.planFree}')" class="btn-apply-now" style="width: 100%;">${t.btnSelect}</button>
        </div>

        <!-- Pro Plan -->
        <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg); border: 2px solid var(--primary); display: flex; flex-direction: column; justify-content: space-between; position: relative;">
          <span class="tag tag-feat" style="position: absolute; top: -14px; left: 24px; padding: 4px 12px; font-size: 0.8rem;">POPULAR / الأكثر طلباً</span>
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px;">${t.planPro}</h2>
            <div style="font-size: 2rem; font-weight: 900; color: var(--primary); margin-bottom: 24px;">${t.pricePro}</div>
            <ul style="list-style: none; padding:0; margin-bottom:30px; line-height: 1.8;">
              <li><i class="fa-solid fa-check" style="color:var(--primary);"></i> ${locale === 'ar' ? 'نشر حتى ١٥ وظيفة نشطة' : 'Post up to 15 active jobs'}</li>
              <li><i class="fa-solid fa-check" style="color:var(--primary);"></i> ${locale === 'ar' ? 'تفعيل اختبارات الفحص ATS' : 'Enable screening assessments'}</li>
              <li><i class="fa-solid fa-check" style="color:var(--primary);"></i> ${locale === 'ar' ? 'عرض الفيديوهات التعريفية للمتقدمين' : 'Play candidate video pitches'}</li>
            </ul>
          </div>
          <button onclick="triggerCheckout('${t.planPro}')" class="btn-sidebar-apply" style="margin-top: 0; width: 100%;">${t.btnSelect}</button>
        </div>

        <!-- Enterprise Plan -->
        <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px;">${t.planEnterprise}</h2>
            <div style="font-size: 2rem; font-weight: 900; color: var(--primary); margin-bottom: 24px;">${t.priceEnterprise}</div>
            <ul style="list-style: none; padding:0; margin-bottom:30px; line-height: 1.8;">
              <li><i class="fa-solid fa-check" style="color:var(--primary);"></i> ${locale === 'ar' ? 'وظائف غير محدودة ونشر مميز' : 'Unlimited jobs + featured posts'}</li>
              <li><i class="fa-solid fa-check" style="color:var(--primary);"></i> ${locale === 'ar' ? 'مساعد التوليد بالذكاء الاصطناعي' : 'Full AI copywriting helper'}</li>
              <li><i class="fa-solid fa-check" style="color:var(--primary);"></i> ${locale === 'ar' ? 'دعم فني خاص على مدار الساعة' : 'Dedicated 24/7 Account Manager'}</li>
            </ul>
          </div>
          <button onclick="triggerCheckout('${t.planEnterprise}')" class="btn-apply-now" style="width: 100%;">${t.btnSelect}</button>
        </div>

      </div>
    </div>

    <!-- Stripe Checkout Modal Mockup -->
    <div id="checkout-modal" class="apply-modal">
      <div class="apply-modal-content" style="max-width: 450px;">
        <span class="modal-close" onclick="closeCheckout()">&times;</span>
        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px; text-align: center;">${t.sandboxTitle}</h2>
        <p style="color: var(--text-muted); text-align: center; font-size: 0.9rem; margin-bottom: 20px;">${t.sandboxDesc}</p>
        
        <div style="background: var(--bg-site); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
          <div style="font-weight: 700; margin-bottom: 6px;">${locale === 'ar' ? 'الباقة المختارة:' : 'Selected Plan:'} <span id="checkout-plan-name" style="color:var(--primary);"></span></div>
          <div style="font-size: 0.85rem; color:var(--text-muted);">Card Number: 4242 •••• •••• 4242 (Sandbox)</div>
        </div>

        <button onclick="confirmCheckout()" class="btn-sidebar-apply" style="margin-top: 0; width: 100%;">
          ${locale === 'ar' ? 'تأكيد ودفع الرسوم' : 'Confirm & Process Payment'}
        </button>
      </div>
    </div>

    <script>
      function triggerCheckout(plan) {
        document.getElementById('checkout-plan-name').textContent = plan;
        document.getElementById('checkout-modal').style.display = 'flex';
      }
      function closeCheckout() {
        document.getElementById('checkout-modal').style.display = 'none';
      }
      function confirmCheckout() {
        alert("${t.sandboxSuccess}");
        closeCheckout();
        window.location.href = '/${locale}/employer/dashboard';
      }
    </script>
  `;

  return c.html(renderLayout(c, t.title, html, locale));
})

// Employer Dashboard Frontend
employerPortalRouter.get('/:locale/employer/dashboard', async (c) => {
  const env: any = c.env;
  const db = env.DB;
  const locale = c.req.param('locale') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur';
  if (locale !== 'ar' && locale !== 'en' && locale !== 'tr' && locale !== 'ru' && locale !== 'fa' && locale !== 'ur') return c.redirect('/ar/employer/dashboard');;

  const cookieVal = getCookie(c, COOKIE_NAME);
  if (!cookieVal) {
    return c.redirect(`/${locale}/employer/login`);
  }

  let employerEmail = '';
  try {
    const jwtSecret = env.JWT_SECRET || 'change-me-in-production-secure-key';
    const payload = await verify(cookieVal, jwtSecret, 'HS256');
    employerEmail = payload.email as string;
  } catch (err) {
    return c.redirect(`/${locale}/employer/login`);
  }

  const t = {
    ar: {
      title: 'بوابة أصحاب العمل - لوحة التحكم',
      welcome: `مرحباً، ${employerEmail}`,
      logout: 'تسجيل الخروج',
      postJobSec: 'أعلن عن وظيفة جديدة (مدعوم بالذكاء الاصطناعي 🤖)',
      jobsTitle: 'الوظائف الخاصة بك',
      appsTitle: 'نظام المتقدمين (ATS) والتقييمات',
      noJobs: 'لم تقم بنشر أي وظائف حتى الآن.',
      noApps: 'لا توجد طلبات توظيف جديدة.',
      tblCandidate: 'المتقدم',
      tblJob: 'الوظيفة',
      tblQuiz: 'نقاط الاختبار',
      tblStatus: 'الحالة',
      tblActions: 'الإجراءات',
      viewLetter: 'الرسالة',
      downloadCV: 'السيرة',
      playVideo: 'فيديو Pitch',
      postBtn: 'نشر الوظيفة والأسئلة 🚀',
      aiGenBtn: 'توليد بالذكاء الاصطناعي 🤖',
      quizPlaceholder: 'مثال:\\n1. هل تجيد React؟ [نعم/لا]\\n2. سنوات الخبرة؟ [1-3/4+]',
      pricingLink: 'عرض الباقات والترقية 👑'
    },
    en: {
      title: 'Employer Dashboard & ATS',
      welcome: `Welcome, ${employerEmail}`,
      logout: 'Sign Out',
      postJobSec: 'Post a New Job (AI Assistant Enabled 🤖)',
      jobsTitle: 'Your Posted Jobs',
      appsTitle: 'ATS - Job Applicants & Quizzes',
      noJobs: 'You have not posted any job vacancies yet.',
      noApps: 'No applications received.',
      tblCandidate: 'Candidate',
      tblJob: 'Job Title',
      tblQuiz: 'Quiz Score',
      tblStatus: 'Status',
      tblActions: 'Actions',
      viewLetter: 'Letter',
      downloadCV: 'CV File',
      playVideo: 'Video Pitch',
      postBtn: 'Publish Job Listing 🚀',
      aiGenBtn: 'Generate description 🤖',
      quizPlaceholder: 'Example:\\n1. Do you know React? [Yes/No]\\n2. Years of experience? [1-3/4+]',
      pricingLink: 'Pricing Plans & Upgrades 👑'
    },
    tr: {
      title: 'İşveren Paneli & ATS',
      welcome: `Hoş geldiniz, ${employerEmail}`,
      logout: 'Çıkış Yap',
      postJobSec: 'Yeni İş İlanı Yayınla (Yapay Zeka Destekli 🤖)',
      jobsTitle: 'Yayınladığınız İş İlanları',
      appsTitle: 'ATS - Başvurular & Test Skorları',
      noJobs: 'Henüz herhangi bir iş ilanı yayınlamadınız.',
      noApps: 'Henüz yeni başvuru alınmadı.',
      tblCandidate: 'Aday',
      tblJob: 'İş Unvanı',
      tblQuiz: 'Test Skoru',
      tblStatus: 'Durum',
      tblActions: 'İşlemler',
      viewLetter: 'Ön Yazı',
      downloadCV: 'CV Dosyası',
      playVideo: 'Video Pitch',
      postBtn: 'İş İlanını Yayınla 🚀',
      aiGenBtn: 'Açıklama Üret 🤖',
      quizPlaceholder: 'Örnek:\n1. React biliyor musunuz? [Evet/Hayır]\n2. Kaç yıl deneyiminiz var? [1-3/4+]',
      pricingLink: 'Paketler ve Yükseltmeler 👑',
      lblTitleEn: 'İş Unvanı (İngilizce)',
      lblTitleAr: 'İş Unvanı (Arapça)',
      lblCompany: 'Şirket Adı',
      lblCategory: 'Kategori',
      lblDistrict: 'İlçe (örn. Şişli)',
      lblTransit: 'Ulaşım Hattı',
      lblJobType: 'Çalışma Türü',
      lblLanguage: 'Gerekli Dil',
      lblDesc: 'Açıklama (Gereksinimler)',
      lblQuizHeader: 'Değerlendirme Test Soruları (YAML/JSON Array)',
      genQuizBtn: 'Yapay Zeka ile Test Oluştur 🤖',
      modalVideoTitle: 'Aday Video Sunumu 🎥',
      transitNone: 'Yok',
      statusApplied: 'Başvuruldu',
      statusReviewed: 'İncelendi',
      statusShortlisted: 'Kısa Listeye Alındı',
      statusRejected: 'Reddedildi'
    },
    ru: {
      title: 'Панель работодателя & ATS',
      welcome: `Добро пожаловать, ${employerEmail}`,
      logout: 'Выйти',
      postJobSec: 'Опубликовать новую вакансию (с помощью ИИ 🤖)',
      jobsTitle: 'Опубликованные вами вакансии',
      appsTitle: 'ATS - Отклики и результаты тестов',
      noJobs: 'Вы еще не опубликовали ни одной вакансии.',
      noApps: 'Новых откликов пока нет.',
      tblCandidate: 'Кандидат',
      tblJob: 'Название вакансии',
      tblQuiz: 'Результат теста',
      tblStatus: 'Статус',
      tblActions: 'Действия',
      viewLetter: 'Сопроводительное',
      downloadCV: 'Скачать резюме',
      playVideo: 'Видео-презентация',
      postBtn: 'Опубликовать вакансию 🚀',
      aiGenBtn: 'Создать описание 🤖',
      quizPlaceholder: 'Пример:\n1. Знаете ли вы React? [Да/Нет]\n2. Сколько лет опыта? [1-3/4+]',
      pricingLink: 'Тарифные планы и улучшения 👑',
      lblTitleEn: 'Название вакансии (Английский)',
      lblTitleAr: 'Название вакансии (Арабский)',
      lblCompany: 'Название компании',
      lblCategory: 'Категория',
      lblDistrict: 'Район (например, Шишли)',
      lblTransit: 'Линия транспорта',
      lblJobType: 'Тип занятости',
      lblLanguage: 'Требуемый язык',
      lblDesc: 'Описание (Требования)',
      lblQuizHeader: 'Вопросы для оценки (YAML/JSON Array)',
      genQuizBtn: 'Создать тест с помощью ИИ 🤖',
      modalVideoTitle: 'Видео-презентация кандидата 🎥',
      transitNone: 'Нет',
      statusApplied: 'Получено',
      statusReviewed: 'На рассмотрении',
      statusShortlisted: 'В шорт-листе',
      statusRejected: 'Отклонено'
    },
    fa: {
      title: 'داشبورد مدیریت کارفرمایان - کاریابی در استانبول',
      welcome: `خوش آمدید، ${employerEmail}`,
      logout: 'خروج از حساب',
      postJobTitle: 'ثبت آگهی استخدام جدید',
      activeJobsTitle: 'آگهی‌های فعال شما',
      noJobs: 'شما هنوز هیچ آگهی استخدامی ثبت نکرده‌اید.',
      tblJob: 'عنوان شغلی',
      tblApplicants: 'متقاضیان',
      viewApplicants: 'مشاهده کارجویان ({count}) 👥',
      applicantsFor: 'متقاضیان کار برای: {job}',
      noApplicants: 'هنوز هیچ درخواستی برای این شغل ارسال نشده است.',
      tblCandidate: 'کارجو',
      tblMatchScore: 'انطباق رزومه (ATS)',
      downloadCV: 'دانلود رزومه',
      playVideo: 'ویدیو معرفی',
      postBtn: 'انتشار آگهی استخدام 🚀',
      aiGenBtn: 'تولید شرح شغل با هوش مصنوعی 🤖',
      quizPlaceholder: 'مثال:\n1. آیا به React تسلط دارید؟ [بله/خیر]\n2. چند سال سابقه کار دارید؟ [۱-۳/۴+]',
      pricingLink: 'ارتقای حساب و پلان‌های اشتراک 👑',
      lblTitleEn: 'عنوان شغلی (انگلیسی)',
      lblTitleAr: 'عنوان شغلی (عربی/فارسی)',
      lblCompany: 'نام شرکت',
      lblCategory: 'دسته‌بندی شغلی',
      lblDistrict: 'منطقه / محله (مانند: Şişli)',
      lblTransit: 'نزدیک‌ترین خط ترانزیت (مترو/متروبوس)',
      lblJobType: 'نوع همکاری',
      lblLanguage: 'زبان‌های مورد نیاز',
      lblDesc: 'شرح شغل و نیازمندی‌ها (قالب HTML مجاز است)',
      lblQuizHeader: 'سوالات غربالگری کارجو (فرم سوال و جواب تعاملی)',
      genQuizBtn: 'تولید خودکار آزمون با هوش مصنوعی 🤖',
      modalVideoTitle: 'ویدیو معرفی کارجو 🎥',
      transitNone: 'ندارد',
      statusApplied: 'دریافت شده',
      statusReviewed: 'در حال بررسی',
      statusShortlisted: 'در لیست کوتاه (مصاحبه)',
      statusRejected: 'رد شده'
    },
    ur: {
      title: 'مالکِ ملازم کا ڈیش بورڈ - استنبول جاب بورڈ',
      welcome: `خوش آمدید، ${employerEmail}`,
      logout: 'لاگ آؤٹ',
      postJobTitle: 'نیا اشتہار پوسٹ کریں',
      activeJobsTitle: 'آپ کی فعال ملازمتیں',
      noJobs: 'آپ نے ابھی تک کوئی نوکری پوسٹ نہیں کی۔',
      tblJob: 'ملازمت کا عنوان',
      tblApplicants: 'امیدوار',
      viewApplicants: 'امیدوار دیکھیں ({count}) 👥',
      applicantsFor: 'امیدوار برائے: {job}',
      noApplicants: 'اس نوکری کے لیے ابھی تک کوئی درخواست موصول نہیں ہوئی۔',
      tblCandidate: 'امیدوار',
      tblMatchScore: 'سی وی مطابقت (ATS)',
      downloadCV: 'سی وی ڈاؤن لوڈ کریں',
      playVideo: 'تعارفی ویڈیو',
      postBtn: 'ملازمت شائع کریں 🚀',
      aiGenBtn: 'اے آئی کے ذریعے تفصیل تیار کریں 🤖',
      quizPlaceholder: 'مثال:\n1. کیا آپ React میں مہارت رکھتے ہیں؟ [جی ہاں/جی نہیں]\n2. آپ کا کتنا تجربہ ہے؟ [۱-۳ سال/۴+ سال]',
      pricingLink: 'اکاؤنٹ اپ گریڈ اور پلانز 👑',
      lblTitleEn: 'نوکری کا عنوان (انگریزی)',
      lblTitleAr: 'نوکری کا عنوان (عربی/اردو)',
      lblCompany: 'کمپنی کا نام',
      lblCategory: 'ملازمت کا شعبہ',
      lblDistrict: 'استنبول کا ضلع (مثال: Şişli)',
      lblTransit: 'قریبی ٹرانزیت لائن (میٹرو/میٹربس)',
      lblJobType: 'ملازمت کی قسم',
      lblLanguage: 'مطلوبہ زبانیں',
      lblDesc: 'ملازمت کی تفصیل اور شرائط (HTML فارمیٹ قابلِ قبول ہے)',
      lblQuizHeader: 'امیدواروں کے لیے اسکریننگ ٹیسٹ سوالات',
      genQuizBtn: 'اے آئی کے ذریعے خودکار سوالات تیار کریں 🤖',
      modalVideoTitle: 'امیدوار کی ویڈیو 🎥',
      transitNone: 'کوئی نہیں',
      statusApplied: 'موصول شدہ',
      statusReviewed: 'زیرِ نظر',
      statusShortlisted: 'منتخب کردہ',
      statusRejected: 'مسترد شدہ'
    }
  }[locale];

  try {
    // 1. Fetch categories
    const catRows = await db.prepare(
      `SELECT id, slug, data FROM documents WHERE type_id = 'categories' AND status = 'published' AND is_published = 1`
    ).all();
    const categories = (catRows.results || []).map((row: any) => ({
      id: row.id,
      ...JSON.parse(row.data)
    }));

    // 2. Fetch jobs belonging to employer email
    const jobRows = await db.prepare(
      `SELECT id, slug, data, published_at FROM documents WHERE type_id = 'jobs'`
    ).all();

    const jobs = (jobRows.results || []).map((row: any) => ({
      id: row.id,
      slug: row.slug,
      publishedAt: row.published_at,
      ...JSON.parse(row.data)
    })).filter((job: any) => 
      (job.guestEmail && job.guestEmail.toLowerCase() === employerEmail) || 
      (job.applyEmail && job.applyEmail.toLowerCase() === employerEmail)
    );

    const jobIds = jobs.map((j: any) => j.id);

    // 3. Fetch applications
    let applications: any[] = [];
    if (jobIds.length > 0) {
      const appRows = await db.prepare(
        `SELECT id, data, created_at FROM documents WHERE type_id = 'applications'`
      ).all();

      applications = (appRows.results || []).map((row: any) => ({
        id: row.id,
        createdAt: row.created_at,
        ...JSON.parse(row.data)
      })).filter((app: any) => jobIds.includes(app.jobId));
    }

    // Render Jobs List
    const jobsHtml = jobs.length > 0 ? jobs.map((job: any) => {
      const title = locale === 'ar' ? (job.title_ar || job.title_en) : (locale === 'tr' ? (job.title_tr || job.title_en) : job.title_en);
      return `
        <div style="background: var(--bg-site); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <a href="/${locale}/jobs/${job.slug}" target="_blank" style="font-weight: 700; color: var(--text-dark);">${title}</a>
            <span style="font-size: 0.8rem; color: var(--text-muted); display:block;">${new Date(job.publishedAt).toLocaleDateString()}</span>
          </div>
          <span class="tag" style="background: ${job.status === 'published' ? '#f0fdf4; color: #166534;' : '#f3f4f6; color: #374151;'}">${job.status}</span>
        </div>
      `;
    }).join('') : `<p style="color: var(--text-muted);">${t.noJobs}</p>`;

    // Render ATS Candidates
    const appsHtml = applications.length > 0 ? `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border); color: var(--text-dark); font-weight: 700;">
              <th style="padding: 10px;">${t.tblCandidate}</th>
              <th style="padding: 10px;">${t.tblJob}</th>
              <th style="padding: 10px; text-align: center;">${t.tblQuiz}</th>
              <th style="padding: 10px;">${t.tblStatus}</th>
              <th style="padding: 10px; text-align: center;">${t.tblActions}</th>
            </tr>
          </thead>
          <tbody>
            ${applications.map((app: any) => {
              const job = jobs.find((j: any) => j.id === app.jobId);
              const jobTitle = job ? (locale === 'ar' ? (job.title_ar || job.title_en) : (locale === 'tr' ? (job.title_tr || job.title_en) : job.title_en)) : 'Unspecified';
              const quizScore = app.quizScore ? app.quizScore : '--';
              const statusSel = (st: string) => app.status === st ? 'selected' : '';
              
              const videoAction = app.videoPitchUrl ? `
                <button onclick="playCandidateVideo('${app.videoPitchUrl}')" class="btn-apply-now" style="font-size: 0.8rem; padding: 4px 8px; background:#f0f7ff; border-color:#93c5fd; color:#1d4ed8;">
                  <i class="fa-solid fa-video"></i> ${t.playVideo}
                </button>
              ` : '';

              return `
                <tr style="border-bottom: 1px solid var(--border);">
                  <td style="padding: 10px;">
                    <div style="font-weight: 700; color: var(--text-dark);">${app.candidateName}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${app.candidateEmail}</div>
                  </td>
                  <td style="padding: 10px; font-weight: 500;">${jobTitle}</td>
                  <td style="padding: 10px; text-align: center; font-weight: 700; color: var(--primary);">${quizScore}</td>
                  <td style="padding: 10px;">
                    <select onchange="updateAppStatus('${app.id}', this.value)" style="padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.85rem; font-weight:600;">
                      <option value="applied" ${statusSel('applied')}>Applied</option>
                      <option value="reviewed" ${statusSel('reviewed')}>Reviewed</option>
                      <option value="shortlisted" ${statusSel('shortlisted')}>Shortlisted</option>
                      <option value="rejected" ${statusSel('rejected')}>Rejected</option>
                    </select>
                  </td>
                  <td style="padding: 10px; text-align: center; display: flex; gap: 6px; justify-content: center; align-items: center;">
                    <button onclick="alert(\`Cover Letter:\\n\\n\${decodeURIComponent('${encodeURIComponent(app.coverLetter)}')}\`)" class="btn-apply-now" style="font-size: 0.8rem; padding: 4px 8px;"><i class="fa-regular fa-message"></i></button>
                    <a href="/api/resumes/download?key=${encodeURIComponent(app.resumeUrl)}&name=${encodeURIComponent(app.candidateName + '_CV.pdf')}" target="_blank" class="btn-sidebar-apply" style="font-size: 0.8rem; padding: 4px 8px; margin-top: 0; width: auto;"><i class="fa-solid fa-download"></i></a>
                    ${videoAction}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : `<p style="color: var(--text-muted); font-style: italic;">${t.noApps}</p>`;

    const html = `
      <div class="container" style="padding: 60px 20px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 20px;">
          <div>
            <h1 style="font-size: 2.25rem; font-weight: 800; color: var(--text-dark);">${t.title}</h1>
            <p style="color: var(--text-muted); font-weight: 600;">${t.welcome}</p>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <a href="/${locale}/employer/pricing" class="lang-switch" style="border: 1px solid var(--accent); color: var(--accent); background: transparent;">${t.pricingLink}</a>
            <a href="/employer/logout" class="btn-apply-now" style="border: 1px solid hsl(0, 100%, 65%); color: hsl(0, 100%, 55%); padding: 10px 24px; font-weight: 700; background: transparent;"><i class="fa-solid fa-arrow-right-from-bracket"></i> ${t.logout}</a>
          </div>
        </div>

        <div class="main-layout" style="grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
          
          <!-- Column 1: Post New Job -->
          <div class="glass-card" style="padding: 30px; border-radius: var(--radius-lg);">
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;"><i class="fa-solid fa-plus" style="color: var(--primary);"></i> ${t.postJobSec}</h3>
            
            <form id="post-job-form">
              <input type="hidden" name="applyEmail" value="${employerEmail}">
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark); display: block; margin-bottom: 6px;">${t.lblTitleEn}</label>
                  <input type="text" id="post-title-en" name="title_en" required class="form-input">
                </div>
                <div>
                  <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark); display: block; margin-bottom: 6px;">${t.lblTitleAr}</label>
                  <input type="text" name="title_ar" required class="form-input">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark); display: block; margin-bottom: 6px;">${t.lblCompany}</label>
                  <input type="text" name="company" required class="form-input" value="My Enterprise">
                </div>
                <div>
                  <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark); display: block; margin-bottom: 6px;">${t.lblCategory}</label>
                  <select name="category" required class="form-input">
                    ${categories.map((c: any) => `<option value="${c.id}">${locale === 'ar' ? c.name_ar : (locale === 'tr' ? (c.name_tr || c.name_en) : c.name_en)}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark); display: block; margin-bottom: 6px;">${t.lblDistrict}</label>
                  <input type="text" name="location_en" required class="form-input" value="Sisli">
                  <input type="hidden" name="location_ar" value="شيشلي">
                </div>
                <div>
                  <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark); display: block; margin-bottom: 6px;">${t.lblTransit}</label>
                  <select name="transitLine" class="form-input">
                    <option value="none">${t.transitNone}</option>
                    <option value="m2">M2 Metro (Sisli/Mecidiyekoy/Levent)</option>
                    <option value="metrobus">Metrobus (E-5 Express Line)</option>
                    <option value="m4">M4 Metro (Kadikoy Side)</option>
                    <option value="m11">M11 Airport Express</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark); display: block; margin-bottom: 6px;">${t.lblJobType}</label>
                  <select name="jobType" class="form-input">
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="remote">Remote</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark); display: block; margin-bottom: 6px;">${t.lblLanguage}</label>
                  <select name="language" class="form-input">
                    <option value="both">Bilingual (Ar/En)</option>
                    <option value="en">English Only</option>
                    <option value="ar">Arabic Only</option>
                  </select>
                </div>
              </div>

              <div style="margin-bottom: 16px; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark); margin:0;">${t.lblDesc}</label>
                  <button type="button" onclick="generateAiJobDescription()" id="desc-ai-btn" class="btn-apply-now" style="font-size: 0.8rem; padding: 4px 10px; margin-top:0; border-color: var(--primary); color:var(--primary); background:transparent;">
                    ${t.aiGenBtn}
                  </button>
                </div>
                <textarea id="post-desc" name="description_en" required rows="6" class="form-input"></textarea>
                <input type="hidden" name="description_ar" id="post-desc-ar" value="">
              </div>

              <!-- Screening Questions assessment builder -->
              <div style="margin-bottom: 24px; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label style="font-weight: 700; font-size: 0.9rem; color: var(--text-dark); margin:0;">${t.lblQuizHeader}</label>
                  <button type="button" onclick="generateAiScreeningQuiz()" id="quiz-ai-btn" class="btn-apply-now" style="font-size: 0.8rem; padding: 4px 10px; margin-top:0; border-color: var(--primary); color:var(--primary); background:transparent;">
                    ${t.genQuizBtn}
                  </button>
                </div>
                <textarea id="post-quiz" name="screeningQuestionsJson" rows="4" placeholder="${t.quizPlaceholder}" class="form-input" style="font-family: monospace; font-size:0.85rem;"></textarea>
              </div>

              <button type="submit" id="postSubmitBtn" class="btn-sidebar-apply" style="border:none;">${t.postBtn}</button>
            </form>
          </div>

          <!-- Column 2: Dashboard stats & Job List -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="glass-card" style="padding: 24px; border-radius: var(--radius-lg);">
              <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-dark); margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px;"><i class="fa-solid fa-list-check" style="color: var(--accent);"></i> ${t.jobsTitle}</h3>
              ${jobsHtml}
            </div>
            
            <div class="glass-card" style="padding: 24px; border-radius: var(--radius-lg); flex: 1;">
              <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-dark); margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px;"><i class="fa-solid fa-users" style="color: var(--primary);"></i> ${t.appsTitle}</h3>
              ${appsHtml}
            </div>
          </div>

        </div>
      </div>

      <!-- Video Pitch Playback Modal -->
      <div id="video-pitch-modal" class="apply-modal">
        <div class="apply-modal-content" style="max-width: 500px; text-align: center;">
          <span class="modal-close" onclick="closeVideoModal()">&times;</span>
          <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-dark); margin-bottom: 20px;">${t.modalVideoTitle}</h2>
          <video id="modal-video-player" controls style="width: 100%; border-radius: var(--radius-md); box-shadow: var(--shadow-md); background: #000;"></video>
        </div>
      </div>

      <script>
        async function generateAiJobDescription() {
          const title = document.getElementById('post-title-en').value;
          const btn = document.getElementById('desc-ai-btn');
          const textarea = document.getElementById('post-desc');
          
          if (!title.trim()) {
            return alert('Please enter a Job Title (English) first to generate a description!');
          }

          btn.innerText = "${locale === 'ar' ? 'جاري التوليد...' : 'Generating...'}";
          btn.disabled = true;

          try {
            const res = await fetch('/api/employer/generate-desc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title })
            });

            const data = await res.json();
            if (res.ok) {
              textarea.value = data.description;
              document.getElementById('post-desc-ar').value = data.description;
            } else {
              alert('AI generation failed. Please enter description manually.');
            }
          } catch(err) {
            alert('Error generating text.');
          } finally {
            btn.innerText = "${t.aiGenBtn}";
            btn.disabled = false;
          }
        }

        async function generateAiScreeningQuiz() {
          const title = document.getElementById('post-title-en').value;
          const desc = document.getElementById('post-desc').value;
          const btn = document.getElementById('quiz-ai-btn');
          const textarea = document.getElementById('post-quiz');
          
          if (!title.trim()) {
            return alert('Please enter a Job Title (English) first to generate questions!');
          }

          btn.innerText = "${locale === 'ar' ? 'جاري التوليد...' : 'Generating...'}";
          btn.disabled = true;

          try {
            const res = await fetch('/api/employer/generate-quiz', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, description: desc })
            });

            const data = await res.json();
            if (res.ok) {
              textarea.value = JSON.stringify(data.quiz, null, 2);
            } else {
              alert(data.error || 'AI quiz generation failed. Please enter questions manually.');
            }
          } catch(err) {
            alert('Error generating quiz.');
          } finally {
            btn.innerText = "${locale === 'ar' ? 'توليد بالذكاء الاصطناعي 🤖' : 'Generate Quiz with AI 🤖'}";
            btn.disabled = false;
          }
        }

        document.getElementById('post-job-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          const form = e.target;
          const formData = new FormData(form);
          const rawData = Object.fromEntries(formData);
          const btn = document.getElementById('postSubmitBtn');
          
          btn.innerText = "${locale === 'ar' ? 'جاري النشر... ⏳' : 'Publishing... ⏳'}";
          btn.disabled = true;

          try {
            const res = await fetch('/submit-job-api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: rawData.title_en,
                title_en: rawData.title_en,
                title_ar: rawData.title_ar,
                company: rawData.company,
                jobType: rawData.jobType,
                location: rawData.location_en,
                location_en: rawData.location_en,
                location_ar: rawData.location_ar,
                applyEmail: rawData.applyEmail,
                description: rawData.description_en,
                description_en: rawData.description_en,
                description_ar: rawData.description_ar,
                category: rawData.category,
                language: rawData.language,
                transitLine: rawData.transitLine,
                screeningQuestionsJson: rawData.screeningQuestionsJson,
                // Passing Turnstile bypass in local context since this is authenticated
                'cf-turnstile-response': 'local-authorized'
              })
            });

            if (res.ok) {
              alert("${locale === 'ar' ? 'تم حفظ الوظيفة ونشرها كمسودة بنجاح!' : 'Job posted successfully as draft!'}");
              window.location.reload();
            } else {
              const err = await res.json();
              alert(err.error || 'Failed to post job.');
            }
          } catch(err) {
            alert('Network error.');
          } finally {
            btn.innerText = "${t.postBtn}";
            btn.disabled = false;
          }
        });

        async function updateAppStatus(appId, newStatus) {
          try {
            const res = await fetch('/api/employer/update-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ appId, status: newStatus })
            });

            if (!res.ok) {
              alert('Failed to update status.');
            }
          } catch (err) {
            alert('Connection issue.');
          }
        }

        function playCandidateVideo(key) {
          const modal = document.getElementById('video-pitch-modal');
          const player = document.getElementById('modal-video-player');
          player.src = '/api/videos/stream?key=' + encodeURIComponent(key);
          modal.style.display = 'flex';
          player.play();
        }

        function closeVideoModal() {
          const modal = document.getElementById('video-pitch-modal');
          const player = document.getElementById('modal-video-player');
          player.pause();
          player.src = '';
          modal.style.display = 'none';
        }
      </script>
    `;

    return c.html(renderLayout(c, t.title, html, locale));

  } catch(err: any) {
    return c.text('Error loading dashboard: ' + err.message, 500);
  }
})

// AI Job Description Generator API using Workers AI
employerPortalRouter.post('/api/employer/generate-desc', rateLimiter(5, 10), async (c) => {
  const env: any = c.env;
  if (!env.AI) {
    return c.json({ error: 'AI binding is not configured in this environment.' }, 500);
  }

  try {
    const { title } = await c.req.json();
    if (!title) {
      return c.json({ error: 'Missing title parameter' }, 400);
    }

    const aiPrompt = `
      You are an expert HR copywriter. Draft a professional, highly engaging Job Description (including Responsibilities and Requirements) for the position: "${title}".
      The output should be formatted with clean HTML paragraph tags (<p>, <ul>, <li>, <h3>) and look extremely premium. Write it in English.
    `;

    const aiResponse: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
      messages: [{ role: 'user', content: aiPrompt }]
    });

    return c.json({ description: aiResponse.response });

  } catch(err: any) {
    return c.json({ error: 'AI generation failed: ' + err.message }, 500);
  }
})

// AI Screening Quiz Generator API using Workers AI
employerPortalRouter.post('/api/employer/generate-quiz', rateLimiter(5, 10), async (c) => {
  const env: any = c.env;
  if (!env.AI) {
    return c.json({ error: 'AI binding is not configured in this environment.' }, 500);
  }

  let title = '';
  let description = '';
  try {
    const body = await c.req.json();
    title = body.title || '';
    description = body.description || '';
  } catch (e) {
    return c.json({ error: 'Invalid request body' }, 400);
  }

  if (!title) {
    return c.json({ error: 'Missing title parameter' }, 400);
  }

  try {
    const aiPrompt = `
      You are an expert HR recruitment specialist.
      Generate exactly 3 multiple-choice screening questions in English for the position: "${title}".
      The questions should test core competencies for the role based on the title and description.
      
      You MUST output ONLY a valid JSON array of objects, with no markdown tags, no backticks, no comments, no intro or outro text.
      Each object in the array must look exactly like this:
      {
        "question": "What is ...?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Option A"
      }
      The options must be brief and one option must exactly match the answer field.
    `;

    const aiResponse: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
      messages: [{ role: 'user', content: aiPrompt + "\nJob Details:\nTitle: " + title + "\nDescription: " + (description || '') }]
    });

    let rawResponse = aiResponse.response;
    rawResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const startIdx = rawResponse.indexOf('[');
    const endIdx = rawResponse.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      rawResponse = rawResponse.substring(startIdx, endIdx + 1);
    }

    const parsed = JSON.parse(rawResponse);
    return c.json({ quiz: parsed });

  } catch(err: any) {
    console.error('AI Quiz Generation Error:', err);
    // Fallback generic quiz
    const fallbacks = [
      {
        "question": `Do you have 2+ years of professional experience as a ${title}?`,
        "options": ["Yes", "No"],
        "answer": "Yes"
      },
      {
        "question": `Are you currently residing in Istanbul or willing to relocate?`,
        "options": ["Yes, I live in Istanbul", "Yes, I am willing to relocate", "No"],
        "answer": "Yes, I live in Istanbul"
      },
      {
        "question": `What is your professional level in English?`,
        "options": ["Fluent / Native", "Intermediate", "Basic"],
        "answer": "Fluent / Native"
      }
    ];
    return c.json({ quiz: fallbacks });
  }
})

// Video Pitch Streaming Proxy from R2
employerPortalRouter.get('/api/videos/stream', async (c) => {
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
      return c.text('Video file not found.', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Type', 'video/mp4');

    return c.body(object.body, 200, Object.fromEntries(headers.entries()));

  } catch(err: any) {
    return c.text('Streaming failed: ' + err.message, 500);
  }
})

// Update Application Status Endpoint
employerPortalRouter.post('/api/employer/update-status', async (c) => {
  const env: any = c.env;
  const db = env.DB;

  const cookieVal = getCookie(c, COOKIE_NAME);
  if (!cookieVal) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const jwtSecret = env.JWT_SECRET || 'change-me-in-production-secure-key';
    await verify(cookieVal, jwtSecret, 'HS256');

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
    appData.status = status;

    await db.prepare(
      `UPDATE documents SET data = ?, updated_at = ? WHERE id = ?`
    ).bind(JSON.stringify(appData), Date.now(), appId).run();

    return c.json({ success: true });

  } catch(err: any) {
    return c.json({ error: 'Failed to update: ' + err.message }, 500);
  }
})

// CV Resume File Download Proxy from R2
employerPortalRouter.get('/api/resumes/download', async (c) => {
  const env: any = c.env;
  const key = c.req.query('key');
  const customName = c.req.query('name') || 'resume.pdf';

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
      return c.text('Resume file not found in storage.', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(customName)}"`);

    return c.body(object.body, 200, Object.fromEntries(headers.entries()));

  } catch(err: any) {
    return c.text('Download failed: ' + err.message, 500);
  }
})
