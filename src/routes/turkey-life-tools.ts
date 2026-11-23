import { Hono } from 'hono'
import { renderLayout } from './public'
import { generateMetaTags } from '../utils/seo-helper'

export const turkeyLifeToolsRouter = new Hono()

type PrimaryLoc = 'ar' | 'en' | 'tr'
const ALL_LOCALES = ['ar', 'en', 'tr', 'ru', 'fa', 'ur'] as const

function normalizeLocale(raw: string | undefined): { locale: 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur'; lang: PrimaryLoc; isRtl: boolean } {
  const loc = (ALL_LOCALES.includes(raw as any) ? raw : 'ar') as 'ar' | 'en' | 'tr' | 'ru' | 'fa' | 'ur'
  const lang: PrimaryLoc = loc === 'ar' || loc === 'tr' ? loc : 'en'
  return { locale: loc, lang, isRtl: loc === 'ar' || loc === 'fa' || loc === 'ur' }
}

function buildToolSchemas(lang: PrimaryLoc, slug: string, name: string, description: string, faqs: Array<{ q: string; a: string }>) {
  const url = `https://jobs-in-istanbul.com/${lang}/${slug}`
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    inLanguage: lang,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
    description,
    publisher: { '@id': 'https://jobs-in-istanbul.com/#organization' }
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'ar' ? 'الرئيسية' : lang === 'tr' ? 'Anasayfa' : 'Home', item: `https://jobs-in-istanbul.com/${lang}` },
      { '@type': 'ListItem', position: 2, name, item: url }
    ]
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }
  return `
  <script type="application/ld+json">${JSON.stringify(appSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`
}

function renderFaqSection(lang: PrimaryLoc, faqs: Array<{ q: string; a: string }>, relatedLinks: Array<{ href: string; label: string }>) {
  const faqTitle = lang === 'ar' ? 'الأسئلة الشائعة والدليل العملي 2026' : lang === 'tr' ? 'Sıkça Sorulan Sorular ve 2026 Rehberi' : 'Frequently Asked Questions (2026 Guide)'
  const relTitle = lang === 'ar' ? 'أدوات وروابط مفيدة في إسطنبول' : lang === 'tr' ? 'İstanbul İçin Faydalı Araçlar' : 'More Useful Istanbul Tools'
  return `
    <section class="glass-card" style="padding: 28px; border-radius: 18px; margin-top: 28px; border: 1px solid var(--border);">
      <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-heading); margin: 0 0 18px 0;">${faqTitle}</h2>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${faqs.map(f => `
          <details style="background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;" open>
            <summary style="font-weight: 800; color: var(--text-heading); cursor: pointer; font-size: 0.98rem;">${f.q}</summary>
            <p style="margin: 10px 0 0 0; color: var(--text-body); line-height: 1.75; font-size: 0.94rem;">${f.a}</p>
          </details>
        `).join('')}
      </div>
    </section>

    <section class="glass-card" style="padding: 22px 26px; border-radius: 18px; margin-top: 22px; border: 1px solid var(--border);">
      <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-heading); margin: 0 0 14px 0;">${relTitle}</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        ${relatedLinks.map(l => `<a href="${l.href}" style="padding: 8px 15px; border-radius: 999px; background: var(--bg-subtle); border: 1px solid var(--border); color: var(--primary); font-weight: 700; font-size: 0.86rem; text-decoration: none;">${l.label}</a>`).join('')}
      </div>
    </section>
  `
}

// ============================================================================
// 1. DILEKCE PDF STUDIO (Turkish Official Work & Housing Petitions + Arabic/EN)
// ============================================================================
turkeyLifeToolsRouter.get('/:locale/dilekce-generator', (c) => {
  const { locale, lang, isRtl } = normalizeLocale(c.req.param('locale'))
  if (!ALL_LOCALES.includes(c.req.param('locale') as any)) return c.redirect('/ar/dilekce-generator', 301)

  const copy = {
    ar: {
      title: 'مولّد الخطابات والطلبات الرسمية بالتركية 2026 (استقالة، إجازة، إيجار) PDF',
      desc: 'أنشئ خطاب استقالة بالتركي (İstifa Dilekçesi)، طلب إجازة سنوية، شهادة عمل وراتب، أو إشعار إخلاء شقة باللغة التركية القانونية الرسمية مع ترجمة عربية فورية وتحميل PDF مجاناً.',
      keywords: 'نموذج استقالة بالتركي مترجم, استقالة باللغة التركية, طلب اجازة سنوية بالتركي, istifa dilekçesi örneği, شهادة عمل بالتركي, إشعار إخلاء شقة تركيا, dilekçe generator',
      h1: 'استوديو الخطابات والطلبات الرسمية بالتركية (Dilekçe PDF)',
      sub: 'املأ بياناتك بالعربية أو الإنجليزية واحصل فوراً على خطاب رسمي مصاغ بالتركية القانونية المعتمدة في الشركات والمؤسسات التركية، مع الترجمة العربية وزر طباعة أو حفظ PDF.',
      typeLabel: 'اختر نوع الخطاب الرسمي',
      fullName: 'الاسم الكامل كما في الإقامة / الكملك',
      idNo: 'رقم الهوية / T.C. Kimlik (99...) اختياري',
      recipient: 'اسم الشركة أو صاحب العمل / المالك',
      role: 'المسمى الوظيفي أو عنوان الشقة',
      startDate: 'تاريخ التعيين / بداية العقد',
      effectiveDate: 'تاريخ الاستقالة / بدء الإجازة / الإخلاء',
      daysOrNote: 'عدد أيام الإجازة أو ملاحظة إضافية (اختياري)',
      trHeader: 'النص التركي الرسمي الجاهز للتسليم (Türkçe Resmi Dilekçe)',
      arHeader: 'الترجمة التوضيحية بالعربية (لفهم كل بند قبل التوقيع)',
      copyBtn: 'نسخ النص التركي',
      printBtn: 'طباعة / حفظ PDF رسمي',
      copied: 'تم نسخ الخطاب التركي بنجاح!'
    },
    tr: {
      title: 'Resmi Dilekçe Oluşturucu 2026 | İstifa, Yıllık İzin, Çalışma Belgesi PDF',
      desc: '4857 sayılı İş Kanunu uyumlu istifa dilekçesi, yıllık izin talebi, maaş ve çalışma belgesi, haklı fesih ve kira tahliye bildirimi dilekçelerini ücretsiz oluşturup PDF yazdırın.',
      keywords: 'istifa dilekçesi örneği 2026, yıllık izin dilekçesi, çalışma belgesi talebi, kira tahliye ihtarnamesi, resmi dilekçe oluşturucu pdf',
      h1: 'Resmi İş ve Kira Dilekçesi Oluşturucu (PDF)',
      sub: 'Bilgilerinizi girin, Türk hukuk standartlarına uygun resmi dilekçenizi anında oluşturun, kopyalayın veya A4 PDF olarak yazdırın.',
      typeLabel: 'Dilekçe Türünü Seçin',
      fullName: 'Ad Soyad',
      idNo: 'T.C. / Yabancı Kimlik No (Opsiyonel)',
      recipient: 'Şirket / İşveren / Ev Sahibi Adı',
      role: 'Göreviniz / Unvanınız veya Adres',
      startDate: 'İşe Başlama / Sözleşme Tarihi',
      effectiveDate: 'Geçerlilik / İzin Başlangıç Tarihi',
      daysOrNote: 'İzin Gün Sayısı veya Ek Not (Opsiyonel)',
      trHeader: 'Resmi Türkçe Dilekçe Metni (Teslime Hazır)',
      arHeader: 'Özet Bilgilendirme ve Kontrol Listesi',
      copyBtn: 'Dilekçeyi Kopyala',
      printBtn: 'Yazdır / PDF Kaydet',
      copied: 'Dilekçe metni panoya kopyalandı!'
    },
    en: {
      title: 'Official Turkish Work & Lease Letter Generator 2026 (İstifa & Dilekçe PDF)',
      desc: 'Generate legally formatted Turkish resignation letters (İstifa Dilekçesi), annual leave requests, employment certificates, unpaid wage notices, and lease termination letters with English translation & PDF export.',
      keywords: 'turkish resignation letter template, istifa dilekcesi english, annual leave request turkey, turkish work letter pdf, lease termination notice turkey',
      h1: 'Official Turkish Legal Letter & Dilekçe Studio (PDF)',
      sub: 'Enter your details in English to generate a formal Turkish HR or tenancy petition ready for signature, printing, or PDF export — with side-by-side translation.',
      typeLabel: 'Choose Official Letter Type',
      fullName: 'Full Legal Name',
      idNo: 'T.C. / Foreigner ID No (99...) Optional',
      recipient: 'Company / Employer / Landlord Name',
      role: 'Job Title or Apartment Address',
      startDate: 'Start Date / Contract Date',
      effectiveDate: 'Effective Date (Resignation / Leave / Move-out)',
      daysOrNote: 'Leave Days or Extra Note (Optional)',
      trHeader: 'Official Turkish Petition (Ready to Sign & Submit)',
      arHeader: 'English Translation & Legal Summary',
      copyBtn: 'Copy Turkish Letter',
      printBtn: 'Print / Save A4 PDF',
      copied: 'Turkish letter copied to clipboard!'
    }
  }[lang]

  const faqs = lang === 'ar' ? [
    { q: 'هل خطاب الاستقالة بالتركية (İstifa Dilekçesi) ملزم قانونياً؟', a: 'نعم، يشترط قانون العمل التركي رقم 4857 تقديم إشعار الاستقالة خطياً وموقّعاً باللغة التركية (أو عبر كاتب العدل Noter في حالات النزاع) مع الالتزام بمدة الإشعار القانونية (من أسبوعين إلى 8 أسابيع حسب سنوات الخدمة).' },
    { q: 'متى يحق للعامل استلام تعويض نهاية الخدمة عند تقديم الاستقالة؟', a: 'الاستقالة العادية لا تستحق تعويض Kıdem، إلا إذا كانت "استقالة لسبب محق" (Haklı Nedenle Fesih وفق المادة 24) مثل عدم دفع الراتب أو عدم تسجيل التأمين SGK بالراتب الحقيقي، وهنا يُنصح بإرسال الإنذار عبر كاتب العدل (Noter).' },
    { q: 'كيف أحفظ الخطاب كملف PDF نظيف من الهاتف أو الكمبيوتر؟', a: 'اضغط زر "طباعة / حفظ PDF رسمي" وسيقوم الموقع تلقائياً بإخفاء القوائم والألوان وتجهيز ورقة A4 بيضاء رسمية جاهزة للحفظ كـ PDF أو الطباعة والتوقيع باليد.' }
  ] : lang === 'tr' ? [
    { q: 'İstifa dilekçesinde ihbar süresi ne kadardır?', a: '4857 sayılı İş Kanunu 17. maddesine göre çalışma süresi 6 aydan az ise 2 hafta, 6 ay–1,5 yıl arası 4 hafta, 1,5–3 yıl arası 6 hafta ve 3 yıldan fazla ise 8 hafta önceden yazılı bildirim yapılmalıdır.' },
    { q: 'Maaş ödenmemesi durumunda haklı nedenle fesih nasıl yapılır?', a: 'Ücretin ödenmemesi veya SGK primlerinin eksik yatırılması İş Kanunu 24/II-e gereği haklı fesih sebebidir; ispat kolaylığı için noter ihtarnamesi ile gönderilmesi tavsiye edilir.' },
    { q: 'Kira tahliye bildirimi kaç gün önce yapılmalıdır?', a: 'Türk Borçlar Kanunu 347. maddesi uyarınca kiracı, belirli süreli kira sözleşmesinin bitiminden en az 15 gün önce yazılı bildirimde bulunarak sözleşmeyi sonlandırabilir.' }
  ] : [
    { q: 'Must resignation and HR petitions in Turkey be submitted in Turkish?', a: 'Yes. Under Turkish Labor Law No. 4857, official HR filings, resignation notices (İstifa Dilekçesi), and lease notices should be written and signed in Turkish so they carry full legal validity.' },
    { q: 'How many days before lease expiry must a tenant send a move-out notice?', a: 'Under Article 347 of the Turkish Code of Obligations, tenants must deliver written notice at least 15 days before the annual contract renewal date to prevent automatic one-year renewal.' },
    { q: 'Does the Print/PDF button remove website headers automatically?', a: 'Yes. Dedicated print stylesheet rules hide navigation and sidebars so only the clean A4 Turkish letter is exported to PDF.' }
  ]

  const seoHtml = generateMetaTags(locale, 'home', {
    title: copy.title,
    description: copy.desc,
    slug: 'dilekce-generator',
    seoKeywords: copy.keywords
  }) + buildToolSchemas(lang, 'dilekce-generator', copy.h1, copy.desc, faqs)

  const todayIso = new Date().toISOString().split('T')[0]

  const bodyHtml = `
    <style>
      .dlk-grid { display: grid; grid-template-columns: minmax(300px, 1fr) minmax(340px, 1.35fr); gap: 24px; align-items: start; }
      @media (max-width: 900px) { .dlk-grid { grid-template-columns: 1fr; } }
      .dlk-input { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg-site); color: var(--text-heading); font-size: 0.94rem; }
      .dlk-paper { background: #ffffff; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 14px; padding: 30px 28px; font-family: 'Times New Roman', Georgia, serif; line-height: 1.85; font-size: 0.98rem; white-space: pre-wrap; direction: ltr; text-align: left; box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
      @media print {
        body * { visibility: hidden !important; }
        #dilekce-print-area, #dilekce-print-area * { visibility: visible !important; }
        #dilekce-print-area { position: fixed !important; inset: 0 !important; margin: 0 !important; padding: 24mm 20mm !important; border: none !important; box-shadow: none !important; font-size: 12pt !important; background: #fff !important; color: #000 !important; }
      }
    </style>

    <div class="container" style="max-width: 1220px; padding: 34px 20px 72px;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color: #fff; padding: 34px 28px; border-radius: 22px; margin-bottom: 26px;">
        <h1 style="margin: 0 0 10px 0; font-size: clamp(1.45rem, 3vw, 2.1rem); font-weight: 900; color: #fff;">${copy.h1}</h1>
        <p style="margin: 0; color: #e2e8f0; max-width: 820px; line-height: 1.7; font-size: 0.98rem;">${copy.sub}</p>
      </div>

      <div class="dlk-grid">
        <div class="glass-card" style="padding: 24px; border-radius: 18px; border: 1px solid var(--border);">
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display:block;font-weight:800;margin-bottom:6px;color:var(--text-heading);font-size:0.9rem;">${copy.typeLabel}</label>
              <select id="dlk-type" class="dlk-input" onchange="updateDilekce()">
                <option value="istifa">${lang === 'ar' ? '1. خطاب استقالة نظامي (İstifa Dilekçesi)' : lang === 'tr' ? '1. İstifa Dilekçesi (Standart)' : '1. Standard Resignation Letter (İstifa Dilekçesi)'}</option>
                <option value="izin">${lang === 'ar' ? '2. طلب إجازة سنوية مدفوعة (Yıllık İzin Talebi)' : lang === 'tr' ? '2. Yıllık Ücretli İzin Dilekçesi' : '2. Paid Annual Leave Request (Yıllık İzin)'}</option>
                <option value="belge">${lang === 'ar' ? '3. طلب شهادة عمل وكشف راتب (Çalışma ve Maaş Belgesi)' : lang === 'tr' ? '3. Çalışma Belgesi ve Maaş Bordrosu Talebi' : '3. Employment & Salary Certificate Request'}</option>
                <option value="maas">${lang === 'ar' ? '4. إشعار مطالبة براتب متأخر / فسخ محق (Madde 24)' : lang === 'tr' ? '4. Ücret Alacağı ve Haklı Fesih Bildirimi (Md. 24)' : '4. Unpaid Salary & Just-Cause Notice (Art. 24)'}</option>
                <option value="kira">${lang === 'ar' ? '5. إشعار عدم تجديد وإخلاء شقة إيجار (Kira Tahliye)' : lang === 'tr' ? '5. Kira Sözleşmesi Tahliye Bildirimi (TBK 347)' : '5. Apartment Lease Non-Renewal Notice (TBK 347)'}</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-weight:700;margin-bottom:5px;font-size:0.88rem;color:var(--text-heading);">${copy.fullName}</label>
              <input id="dlk-name" type="text" class="dlk-input" value="${lang === 'tr' ? 'Ahmet Yılmaz' : 'Ahmad Al-Mansour'}" oninput="updateDilekce()">
            </div>
            <div>
              <label style="display:block;font-weight:700;margin-bottom:5px;font-size:0.88rem;color:var(--text-heading);">${copy.idNo}</label>
              <input id="dlk-tc" type="text" class="dlk-input" placeholder="99XXXXXXXXX" oninput="updateDilekce()">
            </div>
            <div>
              <label style="display:block;font-weight:700;margin-bottom:5px;font-size:0.88rem;color:var(--text-heading);">${copy.recipient}</label>
              <input id="dlk-company" type="text" class="dlk-input" value="İstanbul Ticaret Ltd. Şti." oninput="updateDilekce()">
            </div>
            <div>
              <label style="display:block;font-weight:700;margin-bottom:5px;font-size:0.88rem;color:var(--text-heading);">${copy.role}</label>
              <input id="dlk-role" type="text" class="dlk-input" value="${lang === 'tr' ? 'Satış Uzmanı' : 'Sales Specialist'}" oninput="updateDilekce()">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div>
                <label style="display:block;font-weight:700;margin-bottom:5px;font-size:0.84rem;color:var(--text-heading);">${copy.startDate}</label>
                <input id="dlk-start" type="date" class="dlk-input" value="2025-01-15" oninput="updateDilekce()">
              </div>
              <div>
                <label style="display:block;font-weight:700;margin-bottom:5px;font-size:0.84rem;color:var(--text-heading);">${copy.effectiveDate}</label>
                <input id="dlk-end" type="date" class="dlk-input" value="${todayIso}" oninput="updateDilekce()">
              </div>
            </div>
            <div>
              <label style="display:block;font-weight:700;margin-bottom:5px;font-size:0.88rem;color:var(--text-heading);">${copy.daysOrNote}</label>
              <input id="dlk-extra" type="text" class="dlk-input" value="14" oninput="updateDilekce()">
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:6px;">
              <button type="button" onclick="copyDilekceText()" class="btn-primary" style="flex:1;padding:12px 16px;border-radius:10px;border:none;cursor:pointer;font-weight:800;"><i class="fa-regular fa-copy"></i> ${copy.copyBtn}</button>
              <button type="button" onclick="window.print()" style="flex:1;padding:12px 16px;border-radius:10px;border:1.5px solid var(--primary);background:transparent;color:var(--primary);cursor:pointer;font-weight:800;"><i class="fa-solid fa-file-pdf"></i> ${copy.printBtn}</button>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:18px;">
          <div class="glass-card" style="padding:20px;border-radius:18px;border:1px solid var(--border);">
            <div style="font-weight:800;font-size:0.92rem;color:var(--primary);margin-bottom:12px;"><i class="fa-solid fa-file-signature"></i> ${copy.trHeader}</div>
            <div id="dilekce-print-area" class="dlk-paper"></div>
          </div>
          <div class="glass-card" style="padding:20px;border-radius:18px;border:1px solid var(--border);direction:${isRtl ? 'rtl' : 'ltr'};">
            <div style="font-weight:800;font-size:0.92rem;color:#059669;margin-bottom:10px;"><i class="fa-solid fa-language"></i> ${copy.arHeader}</div>
            <div id="dilekce-translation" style="white-space:pre-wrap;line-height:1.85;font-size:0.94rem;color:var(--text-body);"></div>
          </div>
        </div>
      </div>

      ${renderFaqSection(lang, faqs, [
        { href: `/${lang}/kidem-tazminati-hesaplama`, label: lang === 'ar' ? 'حاسبة تعويض نهاية الخدمة' : lang === 'tr' ? 'Kıdem Tazminatı Hesaplama' : 'Severance Pay Calculator' },
        { href: `/${lang}/kira-artis-orani`, label: lang === 'ar' ? 'حاسبة الزيادة القانونية للإيجار' : lang === 'tr' ? 'Kira Artış Oranı' : 'Legal Rent Calculator' },
        { href: `/${lang}/salary-calculator-2026`, label: lang === 'ar' ? 'حاسبة الراتب والضرائب 2026' : lang === 'tr' ? '2026 Maaş Hesaplama' : '2026 Salary Calculator' },
        { href: `/${lang}`, label: lang === 'ar' ? 'أحدث وظائف إسطنبول' : lang === 'tr' ? 'İstanbul İş İlanları' : 'Latest Istanbul Jobs' }
      ])}
    </div>

    <script>
      function fmtDateTr(iso) {
        if (!iso) return '..../..../2026';
        var p = iso.split('-');
        return p.length === 3 ? (p[2] + '.' + p[1] + '.' + p[0]) : iso;
      }
      function updateDilekce() {
        var type = document.getElementById('dlk-type').value;
        var name = (document.getElementById('dlk-name').value || 'Ad Soyad').trim();
        var tc = (document.getElementById('dlk-tc').value || '').trim();
        var company = (document.getElementById('dlk-company').value || 'Şirket Yetkilisi').trim();
        var role = (document.getElementById('dlk-role').value || 'Personel').trim();
        var start = fmtDateTr(document.getElementById('dlk-start').value);
        var end = fmtDateTr(document.getElementById('dlk-end').value);
        var extra = (document.getElementById('dlk-extra').value || '14').trim();
        var tcLine = tc ? ('\\nT.C. / Kimlik No: ' + tc) : '';
        var tr = '';
        var trs = '';
        var lang = '${lang}';

        if (type === 'istifa') {
          tr = 'Tarih: ' + end + '\\n\\n' + company.toUpperCase() + ' İNSAN KAYNAKLARI MÜDÜRLÜĞÜNE\\nİSTANBUL\\n\\nKonu: İstifa Dilekçesi\\n\\nŞirketiniz bünyesinde ' + start + ' tarihinden bu yana "' + role + '" görevinde çalışmaktayım. Gördüğüm lüzum ve kişisel nedenlerim dolayısıyla ' + end + ' tarihi itibarıyla iş sözleşmemi kendi isteğimle feshederek görevimden istifa ediyorum.\\n\\nKanuni haklarım ve bakiye ücretlerimin tarafıma ödenmesi hususunda gereğinin yapılmasını saygılarımla arz ederim.\\n\\nAd Soyad: ' + name + tcLine + '\\nİmza: ..............................';
          trs = lang === 'ar'
            ? 'إلى إدارة الموارد البشرية في شركة ' + company + ' — إسطنبول\\nالموضوع: خطاب استقالة نظامي\\n\\nأعمل لدى شركتكم منذ تاريخ ' + start + ' بصفة "' + role + '". ولأسباب شخصية أُعلمكم برغبتي في إنهاء عقد عملي والاستقالة اعتباراً من تاريخ ' + end + '. أرجو التكرم بإتمام إجراءات المخالصة وصرف مستحقاتي القانونية وأجوري المتبقية.\\nالاسم والتوقيع: ' + name
            : 'To HR Department of ' + company + ' — Istanbul\\nSubject: Formal Resignation Notice\\n\\nI have been employed as "' + role + '" since ' + start + '. Due to personal reasons, I hereby submit my formal resignation effective ' + end + '. Kindly process my exit clearance and remaining statutory salary dues.\\nSignature: ' + name;
        } else if (type === 'izin') {
          tr = 'Tarih: ' + end + '\\n\\n' + company.toUpperCase() + ' YÖNETİMİNE\\nİSTANBUL\\n\\nKonu: Yıllık Ücretli İzin Talebi\\n\\nŞirketinizde ' + start + ' tarihinden itibaren "' + role + '" olarak görev yapmaktayım. 4857 sayılı İş Kanunu kapsamında hak kazanmış olduğum yıllık ücretli iznimden ' + extra + ' iş gününü ' + end + ' tarihinden itibaren kullanmak istiyorum.\\n\\nGereğinin yapılmasını ve iznimin onaylanmasını saygılarımla arz ederim.\\n\\nAd Soyad: ' + name + tcLine + '\\nİmza: ..............................';
          trs = lang === 'ar'
            ? 'إلى إدارة شركة ' + company + '\\nالموضوع: طلب إجازة سنوية مدفوعة الأجر\\n\\nأعمل لدى شركتكم منذ ' + start + ' بمسمى "' + role + '". أطلب الموافقة على منحي (' + extra + ') يوم عمل من رصيد إجازتي السنوية المستحقة وفق قانون العمل رقم 4857 اعتباراً من تاريخ ' + end + '.\\nالاسم والتوقيع: ' + name
            : 'To Management of ' + company + '\\nSubject: Paid Annual Leave Request\\n\\nAs "' + role + '" employed since ' + start + ', I request ' + extra + ' working days of my statutory paid annual leave starting ' + end + ' under Labor Law No. 4857.\\nSignature: ' + name;
        } else if (type === 'belge') {
          tr = 'Tarih: ' + end + '\\n\\n' + company.toUpperCase() + ' İNSAN KAYNAKLARI MÜDÜRLÜĞÜNE\\nİSTANBUL\\n\\nKonu: Çalışma Belgesi ve Maaş Bordrosu Talebi\\n\\nŞirketinizde ' + start + ' tarihinden bu yana "' + role + '" unvanıyla görev yapmaktayım. Resmi kurum ve banka işlemlerimde kullanılmak üzere kaşeli ve imzalı Çalışma Belgesi ile son dönem Maaş Bordromun tarafıma verilmesini arz ederim.\\n\\nSaygılarımla,\\n\\nAd Soyad: ' + name + tcLine + '\\nİmza: ..............................';
          trs = lang === 'ar'
            ? 'إلى الموارد البشرية في ' + company + '\\nالموضوع: طلب شهادة عمل وكشف راتب مختوم (Maaş Bordrosu)\\n\\nأعمل لديكم منذ ' + start + ' بصفة "' + role + '". أرجو تزويدي بشهادة عمل رسمية مختومة وموقعة مع كشف الراتب الأخير لاستخدامها في المعاملات البنكية والرسمية.\\nالاسم والتوقيع: ' + name
            : 'To HR of ' + company + '\\nSubject: Employment & Payroll Certificate Request\\n\\nEmployed as "' + role + '" since ' + start + ', I kindly request a stamped employment verification letter and recent payslip (Maaş Bordrosu) for banking/official procedures.\\nSignature: ' + name;
        } else if (type === 'maas') {
          tr = 'Tarih: ' + end + '\\n\\n' + company.toUpperCase() + ' YETKİLİLERİNE\\nİSTANBUL\\n\\nKonu: Ödenmeyen Ücret Alacaklarının Talep Edilmesi ve Haklı Fesih İhtarı (İş Kanunu Md. 24/II-e)\\n\\nŞirketinizde ' + start + ' tarihinden beri "' + role + '" olarak çalışmaktayım. Tarafıma ödenmesi gereken maaş ve yasal alacaklarım süresinde ödenmemiştir. 4857 sayılı İş Kanunu 24/II-e maddesi gereğince tüm birikmiş ücret, fazla mesai ve kıdem tazminatı haklarımın ' + extra + ' gün içinde banka hesabıma ödenmesini, aksi halde yasal haklarımı kullanacağımı ihtaren bildiririm.\\n\\nAd Soyad: ' + name + tcLine + '\\nİmza: ..............................';
          trs = lang === 'ar'
            ? 'إلى إدارة شركة ' + company + '\\nالموضوع: إشعار مطالبة بالرواتب المتأخرة وحفظ حق الفسخ المحق (المادة 24/II-e)\\n\\nأعمل لديكم منذ ' + start + ' بصفة "' + role + '". نظراً لعدم سداد رواتبي ومستحقاتي في موعدها، أطالب بسداد كامل الرواتب المتأخرة ومستحقاتي القانونية خلال (' + extra + ') يوماً وفق المادة 24 من قانون العمل التركي مع احتفاظي بكامل حقوقي القانونية.\\n(تنبيه: في حالات النزاع الجدي يُنصح بإرسال هذا الإشعار عبر كاتب العدل Noter).'
            : 'To Management of ' + company + '\\nSubject: Formal Demand for Unpaid Wages (Labor Law Art. 24/II-e)\\n\\nDemanding full payment of overdue salary and statutory dues within ' + extra + ' days under Turkish Labor Law Art. 24/II-e while reserving full severance rights. (Tip: Send via Notary/Noter for formal legal proof.)';
        } else {
          tr = 'Tarih: ' + end + '\\n\\nSAYIN ' + company.toUpperCase() + '\\nİSTANBUL\\n\\nKonu: Kira Sözleşmesinin Yenilenmeyeceği ve Tahliye Bildirimi (TBK Md. 347)\\n\\nTarafınızla ' + start + ' başlangıç tarihli kira sözleşmesi uyarınca kiracısı bulunduğum "' + role + '" adresindeki taşınmazı, Türk Borçlar Kanunu 347. maddesi gereğince yeni kira döneminde yenilemeyeceğimi ve ' + end + ' tarihinde tahliye ederek anahtarları teslim edeceğimi bildiririm.\\n\\nDepozito bedelimin kesintisiz iadesini rica ederim.\\n\\nKiracı Ad Soyad: ' + name + tcLine + '\\nİmza: ..............................';
          trs = lang === 'ar'
            ? 'إلى المالك المحترم ' + company + '\\nالموضوع: إشعار رسمي بعدم تجديد عقد الإيجار وإخلاء الشقة (المادة 347)\\n\\nأُعلمكم بأنني لن أجدد عقد إيجار الشقة الكائنة في "' + role + '" (المبرم بتاريخ ' + start + ')، وسأقوم بإخلاء العقار وتسليم المفاتيح بتاريخ ' + end + ' وفقاً للمادة 347 من قانون الالتزامات التركي، مع طلب استرداد مبلغ التأمين (Depozito).\\n(مهم: يُسلَّم هذا الإشعار قبل 15 يوماً على الأقل من موعد انتهاء العقد).'
            : 'To Landlord ' + company + '\\nSubject: Official Lease Non-Renewal & Move-Out Notice (TBK Art. 347)\\n\\nFormal notice that the tenancy at "' + role + '" (started ' + start + ') will not be renewed and keys will be handed over on ' + end + ', requesting return of the security deposit. (Must be sent at least 15 days prior to contract end.)';
        }

        document.getElementById('dilekce-print-area').textContent = tr;
        document.getElementById('dilekce-translation').textContent = trs;
      }
      function copyDilekceText() {
        var txt = document.getElementById('dilekce-print-area').textContent || '';
        if (navigator.clipboard) {
          navigator.clipboard.writeText(txt).then(function() { alert('${copy.copied}'); });
        }
      }
      document.addEventListener('DOMContentLoaded', updateDilekce);
    </script>
  `
  return c.html(renderLayout(c, copy.title, bodyHtml, locale, seoHtml))
})

// ============================================================================
// 2. ISTANBULKART & MAVI KART COMMUTE COST CALCULATOR 2026
// ============================================================================
turkeyLifeToolsRouter.get('/:locale/istanbulkart-calculator', (c) => {
  const { locale, lang } = normalizeLocale(c.req.param('locale'))
  if (!ALL_LOCALES.includes(c.req.param('locale') as any)) return c.redirect('/ar/istanbulkart-calculator', 301)

  const copy = {
    ar: {
      title: 'حاسبة أسعار كرت إسطنبول والمواصلات 2026 | مقارنة اشتراك Mavi Kart الشهري',
      desc: 'احسب تكلفة المواصلات اليومية والشهرية في إسطنبول 2026 (مترو، متروبوس، مرمراي، باص، تحويلات Aktarma) لكرت الطالب والعادي والمعلم واكتشف هل اشتراك Mavi Kart أوفر لك.',
      keywords: 'سعر كرت اسطنبول 2026, اسعار المواصلات في اسطنبول 2026, اشتراك كرت اسطنبول الشهري mavi kart, كرت الطالب في اسطنبول, سعر المتروبوس, سعر مرمراي اسطنبول',
      h1: 'حاسبة أسعار كرت إسطنبول والمواصلات الشهرية 2026',
      sub: 'احسب مصروفك الشهري على المترو والمتروبوس ومرمراي والباص مع خصم التحويلات (Aktarma)، واعرف فوراً كم ليرة يوفر لك الاشتراك الشهري Mavi Kart.',
      cardType: 'نوع كرت إسطنبول',
      mode: 'وسيلة المواصلات الأساسية',
      transfers: 'عدد التحويلات الإضافية في كل اتجاه (Aktarma)',
      days: 'أيام الذهاب للعمل / الجامعة شهرياً',
      tripsPerDay: 'رحلات يومياً (2 = ذهاب وإياب)',
      salary: 'راتبك الشهري بالليرة (اختياري لحساب النسبة)',
      resPayAsYouGo: 'التكلفة بالدفع العادي (شهرياً)',
      resMavi: 'تكلفة الاشتراك الشهري (Mavi Kart)',
      resVerdict: 'التوصية الأوفر لك'
    },
    tr: {
      title: 'İstanbulkart Ücret Hesaplama 2026 | Aylık Mavi Kart, Metrobüs ve Marmaray',
      desc: '2026 güncel İstanbulkart tam, öğrenci ve öğretmen tarifeleriyle aylık ulaşım maliyetinizi hesaplayın. Aylık Mavi Kart abonmanı mı yoksa tek basım mı daha avantajlı hemen görün.',
      keywords: 'istanbulkart ücretleri 2026, aylık mavi kart ücreti 2026, öğrenci akbil ücreti, metrobüs durak ücretleri 2026, marmaray ücret hesaplama',
      h1: 'İstanbulkart ve Aylık Mavi Kart Maliyet Hesaplayıcı 2026',
      sub: 'Metro, otobüs, metrobüs, Marmaray ve aktarma sayınıza göre aylık ulaşım giderinizi hesaplayın; Mavi Kart abonmanının size kaç TL tasarruf ettireceğini anında görün.',
      cardType: 'İstanbulkart Türü',
      mode: 'Ana Ulaşım Aracı',
      transfers: 'Tek Yönde Aktarma Sayısı',
      days: 'Aylık İş / Okul Günü',
      tripsPerDay: 'Günlük Yolculuk (2 = Gidiş-Dönüş)',
      salary: 'Aylık Net Maaşınız (TL - Opsiyonel)',
      resPayAsYouGo: 'Tek Basım Aylık Toplam',
      resMavi: 'Aylık Mavi Kart Abonmanı',
      resVerdict: 'Sizin İçin En Ekonomik Seçenek'
    },
    en: {
      title: 'Istanbulkart Fare & Mavi Kart Subscription Calculator 2026 | Metro, Metrobus & Marmaray',
      desc: 'Calculate your exact daily and monthly Istanbul public transport budget for 2026 across Metro, Tram, Bus, Metrobus, and Marmaray — and compare pay-per-ride vs monthly Mavi Kart.',
      keywords: 'istanbulkart price 2026, istanbul public transport fares, mavi kart monthly cost 2026, metrobus fare istanbul, marmaray price calculator',
      h1: 'Istanbulkart & Monthly Mavi Kart Commute Calculator 2026',
      sub: 'Estimate your monthly Istanbul commuting expenses across Metro, Bus, Metrobus, and Marmaray with transfer discounts (Aktarma) and see if a monthly Mavi Kart saves you money.',
      cardType: 'Istanbulkart Card Type',
      mode: 'Primary Transit Line',
      transfers: 'Extra Transfers per Direction (Aktarma)',
      days: 'Commuting Days per Month',
      tripsPerDay: 'Trips per Day (2 = Round Trip)',
      salary: 'Monthly Net Salary in TRY (Optional)',
      resPayAsYouGo: 'Pay-Per-Ride Monthly Cost',
      resMavi: 'Monthly Mavi Kart Subscription',
      resVerdict: 'Best Money-Saving Choice'
    }
  }[lang]

  const faqs = lang === 'ar' ? [
    { q: 'كم سعر الاشتراك الشهري Mavi Kart في إسطنبول 2026 وكم نقطة يمنح؟', a: 'يمنح الاشتراك الشهري (Mavi Kart) عدد 180 نقطة استخدام شهرياً (الرحلة العادية تستهلك نقطة واحدة، والمتروبوس/مرمراي يستهلك نقطتين). الاشتراك العادي يقارب 2,120 ليرة، بينما اشتراك الطالب المخفّض يقارب 381 ليرة فقط شهرياً — وهو الأوفر بنسبة تتجاوز 60% للطلاب.' },
    { q: 'هل يعمل التحويل المخفض (Aktarma) على كرت إسطنبول؟', a: 'نعم، بشرط أن يكون الكرت مفعّلاً ومربوطاً برقم الهوية/الإقامة (Kişiselleştirilmiş İstanbulkart) عبر تطبيق İstanbulkart. عند الانتقال خلال ساعتين تُخصم تعرفة مخفضة للتحويل الأول والثاني.' },
    { q: 'هل يوجد استرجاع رصيد (İade) في المتروبوس ومرمراي؟', a: 'نعم، في المتروبوس ومرمراي يتم خصم الحد الأقصى عند الدخول، وعند النزول بعد عدد محطات أقل مرّر الكرت على جهاز الاسترجاع (İade Makinesi) لاستعادة الفرق فوراً.' }
  ] : lang === 'tr' ? [
    { q: 'Aylık Mavi Kart kaç basım hakkı verir?', a: 'Aylık Mavi Kart abonmanı 30 gün boyunca 180 basım hakkı sunar. Standart otobüs/metro/tramvay 1 basım, Metrobüs ve Marmaray mesafeye göre 2 basım düşer.' },
    { q: 'Aktarma indirimi için ne yapmalıyım?', a: 'Aktarma indirimlerinden ve resmi tatillerde ücretsiz ulaşımdan yararlanmak için İstanbulkart mobil uygulaması üzerinden kartınızı kişiselleştirmeniz gerekir.' },
    { q: 'Metrobüs ve Marmaray ücret iadesi nasıl alınır?', a: 'Girişte en uzun mesafe ücreti tahsil edilir; çıkış turnikelerinin yanındaki iade cihazlarına kartınızı okutarak kısa mesafe farkını anında geri alabilirsiniz.' }
  ] : [
    { q: 'How many rides does the monthly Istanbul Mavi Kart include?', a: 'Mavi Kart includes 180 monthly boarding credits valid for 30 days. Standard Metro/Bus/Tram rides consume 1 credit, while Metrobus and Marmaray consume 2 credits.' },
    { q: 'How do I activate transfer discounts (Aktarma) on Istanbulkart?', a: 'Personalized cards linked to your Residence Permit (99-ID) or Turkish ID in the official Istanbulkart app automatically receive Aktarma transfer discounts within 2 hours.' },
    { q: 'Remember to tap the refund machine (İade) on Metrobus and Marmaray', a: 'Both systems charge the maximum fare at entry; tapping the yellow refund machine at your exit station instantly credits back unused distance.' }
  ]

  const seoHtml = generateMetaTags(locale, 'home', {
    title: copy.title,
    description: copy.desc,
    slug: 'istanbulkart-calculator',
    seoKeywords: copy.keywords
  }) + buildToolSchemas(lang, 'istanbulkart-calculator', copy.h1, copy.desc, faqs)

  const bodyHtml = `
    <div class="container" style="max-width: 1120px; padding: 34px 20px 72px;">
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0f172a 100%); color: #fff; padding: 34px 28px; border-radius: 22px; margin-bottom: 26px;">
        <h1 style="margin: 0 0 10px 0; font-size: clamp(1.45rem, 3vw, 2.05rem); font-weight: 900; color: #fff;">${copy.h1}</h1>
        <p style="margin: 0; color: #e0f2fe; max-width: 820px; line-height: 1.7;">${copy.sub}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 22px; align-items: start;">
        <div class="glass-card" style="padding: 26px; border-radius: 18px; border: 1px solid var(--border); display:flex; flex-direction:column; gap:15px;">
          <div>
            <label style="display:block;font-weight:800;margin-bottom:6px;color:var(--text-heading);">${copy.cardType}</label>
            <select id="ik-card" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" onchange="calcIstanbulkart()">
              <option value="full">${lang === 'ar' ? 'كرت عادي (Tam — 27 TL / اشتراك 2,120 TL)' : lang === 'tr' ? 'Tam Kart (27 TL / Mavi Kart 2.120 TL)' : 'Standard Full Card (27 TL / Mavi Kart 2,120 TL)'}</option>
              <option value="student">${lang === 'ar' ? 'كرت طالب (Öğrenci — 13.18 TL / اشتراك 381 TL)' : lang === 'tr' ? 'Öğrenci Kartı (13,18 TL / Abonman 381 TL)' : 'Student Card (13.18 TL / Monthly 381 TL)'}</option>
              <option value="teacher">${lang === 'ar' ? 'معلم / فوق 60 عاماً (Sosyal — 19.33 TL / اشتراك 1,318 TL)' : lang === 'tr' ? 'Öğretmen / 60 Yaş (19,33 TL / Abonman 1.318 TL)' : 'Teacher / 60+ Card (19.33 TL / Monthly 1,318 TL)'}</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-weight:800;margin-bottom:6px;color:var(--text-heading);">${copy.mode}</label>
            <select id="ik-mode" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" onchange="calcIstanbulkart()">
              <option value="standard">${lang === 'ar' ? 'مترو / باص IETT / ترامواي / عبارة (تعرفة عادية)' : lang === 'tr' ? 'Metro / İETT Otobüs / Tramvay / Vapur' : 'Metro / Bus / Tram / Ferry (Standard)'}</option>
              <option value="metrobus_mid">${lang === 'ar' ? 'متروبوس — مسافة متوسطة (4 إلى 15 محطة)' : lang === 'tr' ? 'Metrobüs — Orta Mesafe (4–15 Durak)' : 'Metrobus — Medium Distance (4–15 Stops)'}</option>
              <option value="metrobus_full">${lang === 'ar' ? 'متروبوس — مسافة طويلة (أكثر من 22 محطة)' : lang === 'tr' ? 'Metrobüs — Uzun Mesafe (22+ Durak)' : 'Metrobus — Full Route (22+ Stops)'}</option>
              <option value="marmaray_mid">${lang === 'ar' ? 'مرمراي — عبور بين القارتين (8 إلى 21 محطة)' : lang === 'tr' ? 'Marmaray — Kıta Geçişi (8–21 Durak)' : 'Marmaray — Cross-Continent (8–21 Stops)'}</option>
              <option value="marmaray_full">${lang === 'ar' ? 'مرمراي — الخط الكامل (أكثر من 35 محطة)' : lang === 'tr' ? 'Marmaray — Tam Parkur (35+ Durak)' : 'Marmaray — Full Line (35+ Stops)'}</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-weight:700;margin-bottom:6px;font-size:0.86rem;color:var(--text-heading);">${copy.transfers}</label>
              <select id="ik-transfers" style="width:100%;padding:11px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" onchange="calcIstanbulkart()">
                <option value="0">0</option>
                <option value="1" selected>1</option>
                <option value="2">2</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-weight:700;margin-bottom:6px;font-size:0.86rem;color:var(--text-heading);">${copy.days}</label>
              <input id="ik-days" type="number" min="1" max="31" value="24" style="width:100%;padding:11px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" oninput="calcIstanbulkart()">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-weight:700;margin-bottom:6px;font-size:0.86rem;color:var(--text-heading);">${copy.tripsPerDay}</label>
              <input id="ik-trips" type="number" min="1" max="8" value="2" style="width:100%;padding:11px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" oninput="calcIstanbulkart()">
            </div>
            <div>
              <label style="display:block;font-weight:700;margin-bottom:6px;font-size:0.86rem;color:var(--text-heading);">${copy.salary}</label>
              <input id="ik-salary" type="number" min="0" value="35000" step="1000" style="width:100%;padding:11px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" oninput="calcIstanbulkart()">
            </div>
          </div>
        </div>

        <div class="glass-card" style="padding: 26px; border-radius: 18px; border: 1px solid var(--border); display:flex; flex-direction:column; gap:16px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div style="background:var(--bg-subtle);padding:18px;border-radius:14px;border:1px solid var(--border);">
              <div style="font-size:0.82rem;color:var(--text-muted);font-weight:700;margin-bottom:6px;">${copy.resPayAsYouGo}</div>
              <div id="ik-payg" style="font-size:1.75rem;font-weight:900;color:var(--text-heading);">0 TL</div>
              <div id="ik-daily" style="font-size:0.82rem;color:var(--text-muted);margin-top:4px;"></div>
            </div>
            <div style="background:rgba(37,99,235,0.08);padding:18px;border-radius:14px;border:1.5px solid rgba(37,99,235,0.28);">
              <div style="font-size:0.82rem;color:var(--primary);font-weight:800;margin-bottom:6px;">${copy.resMavi}</div>
              <div id="ik-mavi" style="font-size:1.75rem;font-weight:900;color:var(--primary);">2,120 TL</div>
              <div id="ik-credits" style="font-size:0.82rem;color:var(--text-muted);margin-top:4px;"></div>
            </div>
          </div>
          <div id="ik-verdict-box" style="padding:18px 20px;border-radius:14px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#065f46;font-weight:800;line-height:1.65;"></div>
          <div id="ik-salary-share" style="font-size:0.9rem;color:var(--text-body);background:var(--bg-subtle);padding:12px 16px;border-radius:10px;"></div>
        </div>
      </div>

      ${renderFaqSection(lang, faqs, [
        { href: `/${lang}/akaryakit-fiyatlari`, label: lang === 'ar' ? 'أسعار الوقود والبنزين في إسطنبول' : lang === 'tr' ? 'İstanbul Akaryakıt Fiyatları' : 'Istanbul Fuel Prices' },
        { href: `/${lang}/district/fatih`, label: lang === 'ar' ? 'وظائف الفاتح (مرمراي وترامواي)' : lang === 'tr' ? 'Fatih İş İlanları' : 'Jobs in Fatih' },
        { href: `/${lang}/district/sisli`, label: lang === 'ar' ? 'وظائف شيشلي (مترو M2 ومتروبوس)' : lang === 'tr' ? 'Şişli İş İlanları' : 'Jobs in Sisli' },
        { href: `/${lang}/salary-calculator-2026`, label: lang === 'ar' ? 'حاسبة صافي الراتب 2026' : lang === 'tr' ? '2026 Maaş Hesaplama' : '2026 Salary Calculator' }
      ])}
    </div>

    <script>
      function calcIstanbulkart() {
        var card = document.getElementById('ik-card').value;
        var mode = document.getElementById('ik-mode').value;
        var transfers = parseInt(document.getElementById('ik-transfers').value, 10) || 0;
        var days = Math.max(1, Math.min(31, parseInt(document.getElementById('ik-days').value, 10) || 24));
        var trips = Math.max(1, Math.min(8, parseInt(document.getElementById('ik-trips').value, 10) || 2));
        var salary = Math.max(0, parseFloat(document.getElementById('ik-salary').value) || 0);

        var tariffs = {
          full:    { base: 27.00, tr1: 19.33, tr2: 14.67, mbMid: 34.20, mbFull: 40.08, mrMid: 43.20, mrFull: 59.76, mavi: 2120 },
          student: { base: 13.18, tr1: 5.78,  tr2: 5.45,  mbMid: 13.18, mbFull: 13.18, mrMid: 19.80, mrFull: 27.00, mavi: 381 },
          teacher: { base: 19.33, tr1: 11.60, tr2: 9.85,  mbMid: 23.00, mbFull: 24.64, mrMid: 29.90, mrFull: 41.60, mavi: 1318 }
        }[card];

        var firstLeg = tariffs.base;
        var creditPerLeg = 1;
        if (mode === 'metrobus_mid') { firstLeg = tariffs.mbMid; creditPerLeg = 2; }
        else if (mode === 'metrobus_full') { firstLeg = tariffs.mbFull; creditPerLeg = 2; }
        else if (mode === 'marmaray_mid') { firstLeg = tariffs.mrMid; creditPerLeg = 2; }
        else if (mode === 'marmaray_full') { firstLeg = tariffs.mrFull; creditPerLeg = 2; }

        var transferCost = transfers === 0 ? 0 : (transfers === 1 ? tariffs.tr1 : tariffs.tr1 + tariffs.tr2);
        var perTripCost = firstLeg + transferCost;
        var dailyCost = perTripCost * trips;
        var monthlyPayg = Math.round(dailyCost * days);
        var creditsNeeded = (creditPerLeg + transfers) * trips * days;
        var maviPacks = Math.max(1, Math.ceil(creditsNeeded / 180));
        var monthlyMavi = tariffs.mavi * maviPacks;
        var diff = monthlyPayg - monthlyMavi;
        var bestCost = Math.min(monthlyPayg, monthlyMavi);

        var lang = '${lang}';
        document.getElementById('ik-payg').textContent = monthlyPayg.toLocaleString('en-US') + ' TL';
        document.getElementById('ik-daily').textContent = (lang === 'ar' ? 'يومي: ' : lang === 'tr' ? 'Günlük: ' : 'Daily: ') + Math.round(dailyCost) + ' TL';
        document.getElementById('ik-mavi').textContent = monthlyMavi.toLocaleString('en-US') + ' TL';
        document.getElementById('ik-credits').textContent = creditsNeeded + (lang === 'ar' ? ' نقطة/شهر (الحد 180)' : lang === 'tr' ? ' basım/ay (180 hak)' : ' credits/mo (180/pack)');

        var verdictEl = document.getElementById('ik-verdict-box');
        if (diff > 0) {
          verdictEl.style.background = 'rgba(16,185,129,0.12)';
          verdictEl.style.color = '#065f46';
          verdictEl.textContent = lang === 'ar'
            ? '✅ الاشتراك الشهري (Mavi Kart) أوفر لك بمقدار ' + diff.toLocaleString('en-US') + ' ليرة تركية شهرياً (توفير ' + Math.round((diff / monthlyPayg) * 100) + '%).'
            : lang === 'tr'
            ? '✅ Aylık Mavi Kart abonmanı size ayda ' + diff.toLocaleString('en-US') + ' TL tasarruf sağlar (%' + Math.round((diff / monthlyPayg) * 100) + ' daha ekonomik).'
            : '✅ Monthly Mavi Kart saves you ' + diff.toLocaleString('en-US') + ' TRY/month (' + Math.round((diff / monthlyPayg) * 100) + '% cheaper than pay-per-ride).';
        } else {
          verdictEl.style.background = 'rgba(37,99,235,0.08)';
          verdictEl.style.color = 'var(--text-heading)';
          verdictEl.textContent = lang === 'ar'
            ? '💡 الدفع بالرحلة العادية أوفر لك حالياً بمقدار ' + Math.abs(diff).toLocaleString('en-US') + ' ليرة شهرياً من الاشتراك الشهري.'
            : lang === 'tr'
            ? '💡 Mevcut kullanımınızda tek basım ödeme aylık abonmandan ' + Math.abs(diff).toLocaleString('en-US') + ' TL daha ekonomiktir.'
            : '💡 Pay-per-ride is currently ' + Math.abs(diff).toLocaleString('en-US') + ' TRY/month cheaper for your commute frequency.';
        }

        var shareEl = document.getElementById('ik-salary-share');
        if (salary > 0) {
          var pct = ((bestCost / salary) * 100).toFixed(1);
          shareEl.textContent = lang === 'ar'
            ? '📊 تشكل المواصلات نسبة ' + pct + '% من راتبك الشهري (' + bestCost.toLocaleString('en-US') + ' TL من أصل ' + salary.toLocaleString('en-US') + ' TL).'
            : lang === 'tr'
            ? '📊 Ulaşım gideriniz net maaşınızın %' + pct + ' oranına denk geliyor (' + bestCost.toLocaleString('en-US') + ' TL / ' + salary.toLocaleString('en-US') + ' TL).'
            : '📊 Commuting represents ' + pct + '% of your net monthly salary (' + bestCost.toLocaleString('en-US') + ' TRY of ' + salary.toLocaleString('en-US') + ' TRY).';
        } else {
          shareEl.textContent = '';
        }
      }
      document.addEventListener('DOMContentLoaded', calcIstanbulkart);
    </script>
  `
  return c.html(renderLayout(c, copy.title, bodyHtml, locale, seoHtml))
})

// ============================================================================
// 3. TURKEY RESIDENCE PERMIT (IKAMET) FEES & HEALTH INSURANCE CALCULATOR 2026
// ============================================================================
turkeyLifeToolsRouter.get('/:locale/ikamet-calculator', (c) => {
  const { locale, lang } = normalizeLocale(c.req.param('locale'))
  if (!ALL_LOCALES.includes(c.req.param('locale') as any)) return c.redirect('/ar/ikamet-calculator', 301)

  const copy = {
    ar: {
      title: 'حاسبة رسوم الإقامة في تركيا والتأمين الصحي 2026 | السياحية والعائلية والطلابية',
      desc: 'احسب التكلفة الرسمية للإقامة في تركيا 2026 (بدل الكرت، ضريبة الإقامة، رسم الفيزا، وتكلفة التأمين الصحي حسب العمر) للسياحية والعائلية والطلابية بالليرة والدولار مع الأوراق المطلوبة.',
      keywords: 'تكلفة الإقامة السياحية في تركيا 2026, رسوم تجديد الإقامة في تركيا 2026, سعر كرت الإقامة في تركيا, سعر التأمين الصحي للإقامة حسب العمر, ikamet izni harçları 2026',
      h1: 'حاسبة رسوم الإقامة التركية والتأمين الصحي 2026 (İkamet)',
      sub: 'أدخل نوع الإقامة ومدتها وعمرك لتعرف فوراً تفصيل الرسوم الحكومية (بدل الكرت + الضريبة + التأمين الصحي الإلزامي) وقائمة الأوراق المطلوبة قبل موعد دائرة الهجرة.',
      permitType: 'نوع الإقامة',
      duration: 'مدة الإقامة المطلوبة',
      ageGroup: 'الفئة العمرية (تحدد سعر التأمين الصحي الإلزامي)',
      firstTime: 'حالة التقديم / رسم الفيزا (Tek Giriş Harcı)',
      totalTry: 'التكلفة الإجمالية التقديرية (ليرة تركية)',
      docsTitle: 'قائمة الأوراق الأساسية المطلوبة لدائرة الهجرة (Göç İdaresi)'
    },
    tr: {
      title: 'İkamet İzni Harçları ve Sağlık Sigortası Hesaplama 2026 (Oturma İzni)',
      desc: '2026 yılı güncel yabancı ikamet izni kart bedeli, harç tutarı, tek giriş vize harcı ve yaşa göre yabancı sağlık sigortası maliyetini anında hesaplayın.',
      keywords: 'ikamet izni harçları 2026, oturma izni ücreti hesaplama, ikamet kart bedeli 2026, yabancı sağlık sigortası fiyatları 2026',
      h1: 'İkamet İzni Harçları ve Sigorta Hesaplayıcı 2026',
      sub: 'İkamet türü, süresi ve yaş aralığınızı seçerek 2026 kart bedeli, ikamet harcı ve özel sağlık sigortası toplam maliyetini anında hesaplayın.',
      permitType: 'İkamet İzni Türü',
      duration: 'İkamet Süresi',
      ageGroup: 'Yaş Aralığı (Sağlık Sigortası İçin)',
      firstTime: 'Başvuru Durumu / Tek Giriş Harcı',
      totalTry: 'Tahmini Toplam Maliyet (TL)',
      docsTitle: 'Göç İdaresi Başvurusu İçin Temel Evraklar'
    },
    en: {
      title: 'Turkey Residence Permit (İkamet) Fees & Health Insurance Calculator 2026',
      desc: 'Calculate total 2026 Turkey Ikamet residence permit costs: plastic card fee, annual residence tax, single-entry visa fee, and mandatory private health insurance by age bracket.',
      keywords: 'turkey residence permit fees 2026, ikamet cost calculator turkey, turkey foreigner health insurance price by age, tourist ikamet renewal cost',
      h1: 'Turkey Residence Permit (İkamet) Cost Calculator 2026',
      sub: 'Select your permit category, duration, and age bracket to get a complete 2026 cost breakdown (Card Fee + Permit Tax + Mandatory Health Insurance) plus document checklist.',
      permitType: 'Residence Permit Type',
      duration: 'Requested Duration',
      ageGroup: 'Age Bracket (Determines Health Insurance Cost)',
      firstTime: 'Application Type / Single-Entry Visa Fee',
      totalTry: 'Estimated Total Cost (TRY)',
      docsTitle: 'Essential Documents Checklist for Göç İdaresi'
    }
  }[lang]

  const faqs = lang === 'ar' ? [
    { q: 'من هم المعفيون من التأمين الصحي الخاص عند استخراج الإقامة في تركيا؟', a: 'يُعفى الأطفال دون سن 18 عاماً وكبار السن فوق 65 عاماً من شرط شراء التأمين الصحي الخاص للإقامة، كما يُعفى حاملو التأمين الحكومي (SGK / GSS) أو الإقامة الطلابية عند الاشتراك بالتأمين العام.' },
    { q: 'ما هو رسم الدخول لمرة واحدة (Tek Giriş Vize Harcı)؟', a: 'هو رسم حكومي يُدفع مرة واحدة فقط عند التقديم لأول مرة للأشخاص القادمين بدون فيزا أو بفيزا سياحية من بعض الجنسيات، ولا يُدفع عند تجديد الإقامة أو لحاملي الإقامة العائلية والطلابية المعفاة.' },
    { q: 'متى يجب التقديم على تجديد الإقامة في تركيا؟', a: 'يجب تقديم طلب التجديد عبر بوابة e-ikamet قبل انتهاء صلاحية الإقامة الحالية بمدة أقصاها 60 يوماً، وقبل يوم الانتهاء الفعلي لتجنب الغرامات.' }
  ] : lang === 'tr' ? [
    { q: 'Kimler özel yabancı sağlık sigortasından muaftır?', a: '18 yaşından küçükler, 65 yaşından büyükler ve aktif SGK (GSS) kapsamında bulunan yabancılar özel sağlık sigortası yaptırmak zorunda değildir.' },
    { q: 'İkamet uzatma başvurusu ne zaman yapılmalıdır?', a: 'Mevcut ikamet izninin bitiş tarihine 60 gün kala e-ikamet sistemi üzerinden uzatma başvurusu yapılabilir.' },
    { q: 'İkamet kart bedeli her başvuruda ödenir mi?', a: 'Evet, yeni başvuru, uzatma ve geçiş başvurularının tamamında Değerli Kağıt (Kart) Bedeli ödenir.' }
  ] : [
    { q: 'Who is exempt from private health insurance for a Turkish Ikamet?', a: 'Applicants under 18, over 65, and foreigners actively covered under Turkish state social security (SGK/GSS) are exempt from purchasing private foreigner health insurance.' },
    { q: 'When can I apply to renew my Turkish residence permit?', a: 'Renewal applications open on the official e-ikamet portal 60 days prior to your current card expiration date.' },
    { q: 'Are student residence permits exempt from the annual residence tax?', a: 'Yes, students enrolled in Turkish universities pay only the residence permit plastic card fee (Değerli Kağıt Bedeli) plus insurance, and are exempt from annual stay tax.' }
  ]

  const seoHtml = generateMetaTags(locale, 'home', {
    title: copy.title,
    description: copy.desc,
    slug: 'ikamet-calculator',
    seoKeywords: copy.keywords
  }) + buildToolSchemas(lang, 'ikamet-calculator', copy.h1, copy.desc, faqs)

  const bodyHtml = `
    <div class="container" style="max-width: 1120px; padding: 34px 20px 72px;">
      <div style="background: linear-gradient(135deg, #065f46 0%, #0f172a 100%); color: #fff; padding: 34px 28px; border-radius: 22px; margin-bottom: 26px;">
        <h1 style="margin: 0 0 10px 0; font-size: clamp(1.45rem, 3vw, 2.05rem); font-weight: 900; color: #fff;">${copy.h1}</h1>
        <p style="margin: 0; color: #d1fae5; max-width: 820px; line-height: 1.7;">${copy.sub}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 22px; align-items: start;">
        <div class="glass-card" style="padding: 26px; border-radius: 18px; border: 1px solid var(--border); display:flex; flex-direction:column; gap:15px;">
          <div>
            <label style="display:block;font-weight:800;margin-bottom:6px;color:var(--text-heading);">${copy.permitType}</label>
            <select id="ikm-type" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" onchange="calcIkamet()">
              <option value="tourist">${lang === 'ar' ? 'إقامة قصيرة الأمد (سياحية / عقارية)' : lang === 'tr' ? 'Kısa Dönem İkamet (Turistik / Taşınmaz)' : 'Short-Term Residence (Tourist / Property)'}</option>
              <option value="family">${lang === 'ar' ? 'إقامة عائلية (Aile İkameti)' : lang === 'tr' ? 'Aile İkamet İzni' : 'Family Residence Permit'}</option>
              <option value="student">${lang === 'ar' ? 'إقامة طالب (معفاة من ضريبة المدة)' : lang === 'tr' ? 'Öğrenci İkamet İzni (Harçtan Muaf)' : 'Student Residence Permit (Tax-Exempt)'}</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-weight:800;margin-bottom:6px;color:var(--text-heading);">${copy.duration}</label>
            <select id="ikm-years" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" onchange="calcIkamet()">
              <option value="1" selected>${lang === 'ar' ? 'سنة واحدة (12 شهراً)' : lang === 'tr' ? '1 Yıl (12 Ay)' : '1 Year (12 Months)'}</option>
              <option value="2">${lang === 'ar' ? 'سنتان (24 شهراً)' : lang === 'tr' ? '2 Yıl (24 Ay)' : '2 Years (24 Months)'}</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-weight:800;margin-bottom:6px;color:var(--text-heading);">${copy.ageGroup}</label>
            <select id="ikm-age" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" onchange="calcIkamet()">
              <option value="exempt_young">${lang === 'ar' ? 'أقل من 18 سنة (معفى من التأمين الخاص)' : lang === 'tr' ? '18 Yaş Altı (Özel Sigorta Muaf)' : 'Under 18 (Private Insurance Exempt)'}</option>
              <option value="18_25" selected>${lang === 'ar' ? '18 – 25 سنة' : lang === 'tr' ? '18 – 25 Yaş' : '18 – 25 Years'}</option>
              <option value="26_35">${lang === 'ar' ? '26 – 35 سنة' : lang === 'tr' ? '26 – 35 Yaş' : '26 – 35 Years'}</option>
              <option value="36_45">${lang === 'ar' ? '36 – 45 سنة' : lang === 'tr' ? '36 – 45 Yaş' : '36 – 45 Years'}</option>
              <option value="46_55">${lang === 'ar' ? '46 – 55 سنة' : lang === 'tr' ? '46 – 55 Yaş' : '46 – 55 Years'}</option>
              <option value="56_65">${lang === 'ar' ? '56 – 65 سنة' : lang === 'tr' ? '56 – 65 Yaş' : '56 – 65 Years'}</option>
              <option value="exempt_senior">${lang === 'ar' ? 'فوق 65 سنة (معفى من التأمين الخاص)' : lang === 'tr' ? '65 Yaş Üstü (Özel Sigorta Muaf)' : 'Over 65 (Private Insurance Exempt)'}</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-weight:800;margin-bottom:6px;color:var(--text-heading);">${copy.firstTime}</label>
            <select id="ikm-visa" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" onchange="calcIkamet()">
              <option value="renewal" selected>${lang === 'ar' ? 'تجديد إقامة (لا يوجد رسم فيزا)' : lang === 'tr' ? 'Uzatma Başvurusu (Tek Giriş Harcı Yok)' : 'Renewal (No Single-Entry Visa Fee)'}</option>
              <option value="first_visa">${lang === 'ar' ? 'أول مرة — تشمل رسم الفيزا (Tek Giriş Harcı)' : lang === 'tr' ? 'İlk Başvuru — Tek Giriş Harcı Dahil' : 'First Application — Includes Single-Entry Visa Fee'}</option>
              <option value="first_exempt">${lang === 'ar' ? 'أول مرة — جنسية معفاة من رسم الفيزا' : lang === 'tr' ? 'İlk Başvuru — Tek Giriş Harcından Muaf' : 'First Application — Visa-Fee Exempt Nationality'}</option>
            </select>
          </div>
        </div>

        <div class="glass-card" style="padding: 26px; border-radius: 18px; border: 1px solid var(--border);">
          <div style="text-align:center;padding:20px;border-radius:14px;background:rgba(16,185,129,0.09);border:1.5px solid rgba(16,185,129,0.28);margin-bottom:18px;">
            <div style="font-size:0.86rem;font-weight:700;color:#059669;margin-bottom:6px;">${copy.totalTry}</div>
            <div id="ikm-total" style="font-size:2.1rem;font-weight:900;color:var(--text-heading);">0 TL</div>
            <div id="ikm-usd" style="font-size:0.9rem;color:var(--text-muted);margin-top:4px;"></div>
          </div>
          <div id="ikm-breakdown" style="display:flex;flex-direction:column;gap:10px;font-size:0.93rem;"></div>
        </div>
      </div>

      <div class="glass-card" style="padding:24px 28px;border-radius:18px;border:1px solid var(--border);margin-top:24px;">
        <h2 style="font-size:1.2rem;font-weight:800;color:var(--text-heading);margin:0 0 14px 0;"><i class="fa-solid fa-list-check" style="color:#059669;"></i> ${copy.docsTitle}</h2>
        <ul style="margin:0;padding-inline-start:20px;line-height:1.9;color:var(--text-body);font-size:0.95rem;">
          <li>${lang === 'ar' ? 'استمارة موعد الإقامة المطبوعة والموقّعة من بوابة e-ikamet.' : lang === 'tr' ? 'e-ikamet sisteminden alınan imzalı başvuru formu.' : 'Signed application form printed from the official e-ikamet portal.'}</li>
          <li>${lang === 'ar' ? 'جواز سفر ساري المفعول (بصلاحية تزيد 60 يوماً عن مدة الإقامة) مع نسخة مترجمة ومصدقة.' : lang === 'tr' ? 'Geçerli pasaport aslı ve fotokopisi (talep edilen süreden en az 60 gün fazla geçerli).' : 'Valid passport (at least 60 days beyond requested stay) + photocopy.'}</li>
          <li>${lang === 'ar' ? '4 صور بيومترية حديثة بخلفية بيضاء + وثيقة التأمين الصحي الساري (لمن أعمارهم 18–65).' : lang === 'tr' ? '4 adet biyometrik fotoğraf + geçerli sağlık sigortası poliçesi (18–65 yaş).' : '4 biometric photos + valid foreigner health insurance policy (ages 18–65).'}</li>
          <li>${lang === 'ar' ? 'عقد إيجار مصدق من كاتب العدل (Noter) مع إثبات العنوان (أو سند الملكية الطابو) + إيصال دفع الرسوم من دائرة الضرائب.' : lang === 'tr' ? 'Noter onaylı kira sözleşmesi veya tapu + vergi dairesi harç dekontu.' : 'Notarized lease contract or title deed (Tapu) + tax office payment receipts.'}</li>
        </ul>
      </div>

      ${renderFaqSection(lang, faqs, [
        { href: `/${lang}/work-permit-eligibility`, label: lang === 'ar' ? 'حاسبة أهلية إذن العمل 2026' : lang === 'tr' ? 'Çalışma İzni Uygunluk' : 'Work Permit Eligibility' },
        { href: `/${lang}/currency-prices`, label: lang === 'ar' ? 'أسعار الدولار والعملات اليوم' : lang === 'tr' ? 'Canlı Döviz Kurları' : 'Live TRY Currency Rates' },
        { href: `/${lang}/dilekce-generator`, label: lang === 'ar' ? 'مولّد الخطابات الرسمية بالتركية' : lang === 'tr' ? 'Resmi Dilekçe Oluşturucu' : 'Turkish Letter Studio' }
      ])}
    </div>

    <script>
      function calcIkamet() {
        var type = document.getElementById('ikm-type').value;
        var years = parseInt(document.getElementById('ikm-years').value, 10) || 1;
        var age = document.getElementById('ikm-age').value;
        var visa = document.getElementById('ikm-visa').value;

        var cardFee = 810; // 2026 Valuable Paper (Değerli Kağıt) card fee estimate in TRY
        var annualStayTax = type === 'student' ? 0 : (type === 'family' ? 2850 : 2850);
        var stayTaxTotal = annualStayTax * years;
        var singleEntryVisa = visa === 'first_visa' ? 7650 : 0;

        var insAnnualMap = {
          exempt_young: 0,
          '18_25': 1950,
          '26_35': 2600,
          '36_45': 3650,
          '46_55': 5200,
          '56_65': 7400,
          exempt_senior: 0
        };
        var insTotal = (insAnnualMap[age] || 2600) * years;
        var notaryMisc = 1200;
        var grandTotal = cardFee + stayTaxTotal + singleEntryVisa + insTotal + notaryMisc;
        var usdApprox = Math.round(grandTotal / 39.5);

        var lang = '${lang}';
        document.getElementById('ikm-total').textContent = grandTotal.toLocaleString('en-US') + ' TL';
        document.getElementById('ikm-usd').textContent = '≈ $' + usdApprox.toLocaleString('en-US') + ' USD';

        var rows = [
          [lang === 'ar' ? 'بدل بطاقة الإقامة (Değerli Kağıt Bedeli)' : lang === 'tr' ? 'İkamet Kart Bedeli (Değerli Kağıt)' : 'Plastic Card Fee (Değerli Kağıt)', cardFee],
          [lang === 'ar' ? 'ضريبة الإقامة (' + years + ' سنة)' : lang === 'tr' ? 'İkamet İzni Harcı (' + years + ' Yıl)' : 'Residence Stay Tax (' + years + ' yr)', stayTaxTotal],
          [lang === 'ar' ? 'رسم الفيزا لمرة واحدة (Tek Giriş Harcı)' : lang === 'tr' ? 'Tek Giriş Vize Harcı' : 'Single-Entry Visa Fee', singleEntryVisa],
          [lang === 'ar' ? 'التأمين الصحي الإلزامي (' + years + ' سنة)' : lang === 'tr' ? 'Yabancı Sağlık Sigortası (' + years + ' Yıl)' : 'Mandatory Health Insurance (' + years + ' yr)', insTotal],
          [lang === 'ar' ? 'مصاريف نوتر وترجمة وصور تقديرية' : lang === 'tr' ? 'Noter, Tercüme ve Fotoğraf (Tahmini)' : 'Notary, Translation & Photos (Est.)', notaryMisc]
        ];

        document.getElementById('ikm-breakdown').innerHTML = rows.map(function(r) {
          return '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-radius:10px;background:var(--bg-subtle);border:1px solid var(--border);">' +
            '<span style="color:var(--text-body);font-weight:600;">' + r[0] + '</span>' +
            '<strong style="color:var(--text-heading);">' + r[1].toLocaleString('en-US') + ' TL</strong>' +
          '</div>';
        }).join('');
      }
      document.addEventListener('DOMContentLoaded', calcIkamet);
    </script>
  `
  return c.html(renderLayout(c, copy.title, bodyHtml, locale, seoHtml))
})

// ============================================================================
// 4. TURKEY IMEI REGISTRATION & 120+120 DUAL-SIM DAYS CALCULATOR 2026
// ============================================================================
turkeyLifeToolsRouter.get('/:locale/imei-calculator', (c) => {
  const { locale, lang } = normalizeLocale(c.req.param('locale'))
  if (!ALL_LOCALES.includes(c.req.param('locale') as any)) return c.redirect('/ar/imei-calculator', 301)

  const copy = {
    ar: {
      title: 'حاسبة تتريك الهاتف في تركيا 2026 وعدّاد أيام الشريحتين (120 + 120 يوم IMEI)',
      desc: 'احسب بدقة تاريخ توقف هاتفك الأجنبي في تركيا على الشريحة الأولى (120 يوم) والشريحة الثانية / eSIM (120 يوم)، وموعد تصفير 1 يناير، وقارن ضريبة التتريك 2026 بسعر شراء هاتف محلي.',
      keywords: 'تتريك الهاتف في تركيا 2026, سعر تتريك الهاتف في تركيا, مدة عمل الهاتف الاجنبي في تركيا 120 يوم, عداد ايام الهاتف الاجنبي, IMEI kayıt ücreti 2026, تصفير ايمي يناير',
      h1: 'حاسبة تتريك الهاتف الأجنبي وعدّاد 120+120 يوم في تركيا 2026',
      sub: 'أدخل تاريخ تشغيل أول شريحة تركية لتعرف باليوم متى يتوقف الإرسال ومتى تنتقل للشريحة الثانية (eSIM) وموعد التصفير السنوي في 1 يناير، مع مقارنة مالية لضريبة IMEI.',
      sim1Date: 'تاريخ إدخال الشريحة التركية الأولى (IMEI 1)',
      hasDual: 'هل يدعم هاتفك شريحتين (أو شريحة + eSIM)؟',
      imeiFee: 'ضريبة تتريك الهاتف الرسمية 2026 (TL)',
      foreignPrice: 'سعر شراء الهاتف من الخارج (TL)',
      localPrice: 'سعر نفس الهاتف رسمياً داخل تركيا (TL)'
    },
    tr: {
      title: 'IMEI Kayıt Ücreti ve Yurt Dışı Telefon 120+120 Gün Hesaplama 2026',
      desc: 'Yurt dışından getirilen telefonunuzun 4+4 ay (120+120 gün) kullanım süresini, kapanma tarihini ve 1 Ocak yenilenmesine kalan günü hesaplayın; IMEI kayıt maliyetini karşılaştırın.',
      keywords: 'imei kayıt ücreti 2026, yurt dışı telefon kullanım süresi hesaplama, 120 gün hesaplama, 4+4 ay telefon kapanma tarihi, e-sim süre hesaplama',
      h1: 'Yurt Dışı Telefon 120+120 Gün ve IMEI Kayıt Hesaplayıcı 2026',
      sub: 'İlk SIM kartı taktığınız tarihi girin; kapanma tarihini, çift SIM/eSIM bitiş gününü ve 1 Ocak sıfırlamasına kalan süreyi anında görün.',
      sim1Date: '1. Fiziksel SIM Kartı Taktığınız Tarih (IMEI 1)',
      hasDual: 'Cihazınız Çift SIM veya eSIM Destekliyor mu?',
      imeiFee: '2026 IMEI Pasaport Kayıt Harcı (TL)',
      foreignPrice: 'Yurt Dışı Telefon Maliyeti (TL)',
      localPrice: 'Türkiye Garantili Satış Fiyatı (TL)'
    },
    en: {
      title: 'Turkey Foreign Phone 120+120 Days & IMEI Registration Calculator 2026',
      desc: 'Track exact remaining days for your foreign phone in Turkey across SIM 1 (120 days) and SIM 2/eSIM (120 days), Jan 1 reset countdown, and compare 2026 IMEI tax vs buying locally.',
      keywords: 'turkey imei registration fee 2026, foreign phone 120 days turkey calculator, turkey esim 240 days reset january 1, register phone in turkey cost',
      h1: 'Turkey Foreign Phone 120+120 Days & IMEI Tax Calculator 2026',
      sub: 'Enter the date you first inserted a Turkish SIM card to calculate exact shutdown dates for SIM 1 & SIM 2/eSIM, the Jan 1 annual reset, and whether paying the IMEI tax makes financial sense.',
      sim1Date: 'Date You Inserted First Turkish SIM (IMEI 1)',
      hasDual: 'Does Your Phone Support Dual SIM or eSIM?',
      imeiFee: 'Official 2026 IMEI Registration Tax (TRY)',
      foreignPrice: 'Phone Cost Bought Abroad (TRY)',
      localPrice: 'Official Retail Price Inside Turkey (TRY)'
    }
  }[lang]

  const faqs = lang === 'ar' ? [
    { q: 'كيف يعمل نظام 120 + 120 يوم للهواتف الأجنبية في تركيا؟', a: 'تمنح هيئة الاتصالات التركية (BTK) كل رقم IMEI غير مسجل 120 يوماً (4 أشهر) من العمل بشريحة تركية داخل كل سنة ميلادية. إذا كان الهاتف بشريحتين (أو شريحة + eSIM) فله رقما IMEI وبالتالي يعمل 240 يوماً (8 أشهر) سنوياً.' },
    { q: 'متى يتم تصفير عدّاد الأيام تلقائياً؟', a: 'في الأول من يناير (1 Ocak) من كل سنة ميلادية جديدة، تتصفر مدة الـ 120 يوماً لكل شريحة تلقائياً وتعود الشبكة للعمل خلال أيام قليلة.' },
    { q: 'ما شروط تتريك الهاتف عبر بوابة e-Devlet؟', a: 'يشترط دخول صاحب الجواز إلى تركيا خلال آخر 365 يوماً، ويكون الخط التركي المستخدم مسجلاً باسم نفس الشخص صاحب الجواز لمدة 3 سنوات ميلادية.' }
  ] : lang === 'tr' ? [
    { q: 'Yurt dışı telefonlar yılda kaç ay kayıtsız kullanılabilir?', a: 'BTK düzenlemesine göre her IMEI numarası takvim yılı başına 120 gün (4 ay) sinyal alabilir. Çift SIM veya eSIM destekli cihazlarda iki ayrı IMEI bulunduğu için toplam 240 gün (8 ay) kullanım mümkündür.' },
    { q: 'Süreler ne zaman sıfırlanır?', a: 'Her yıl 1 Ocak itibarıyla her IMEI için yeni 120 günlük kullanım hakkı otomatik olarak yenilenir.' },
    { q: 'IMEI kaydı sonrası hat kısıtlaması var mı?', a: 'Evet, pasaport kaydı yapılan telefon 3 takvim yılı boyunca yalnızca kayıt yaptıran kişinin T.C. kimlik numarasına kayıtlı SIM kartlarla çalışır.' }
  ] : [
    { q: 'How does Turkey’s 120 + 120 day rule work for foreign phones?', a: 'Each unregistered IMEI slot can connect to Turkish networks for 120 days per calendar year. Dual-SIM / eSIM phones have two distinct IMEI numbers, providing up to 240 days (8 months) per calendar year.' },
    { q: 'When do the 120-day allowances reset?', a: 'On January 1 of every new calendar year, BTK resets the 120-day counter for each IMEI slot automatically.' },
    { q: 'What is the SIM-owner restriction after paying the IMEI tax?', a: 'Once registered on e-Devlet, the phone only works with Turkish SIM cards registered under the same passport/ID holder for 3 calendar years.' }
  ]

  const seoHtml = generateMetaTags(locale, 'home', {
    title: copy.title,
    description: copy.desc,
    slug: 'imei-calculator',
    seoKeywords: copy.keywords
  }) + buildToolSchemas(lang, 'imei-calculator', copy.h1, copy.desc, faqs)

  const defaultStart = new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0]

  const bodyHtml = `
    <div class="container" style="max-width: 1120px; padding: 34px 20px 72px;">
      <div style="background: linear-gradient(135deg, #4338ca 0%, #0f172a 100%); color: #fff; padding: 34px 28px; border-radius: 22px; margin-bottom: 26px;">
        <h1 style="margin: 0 0 10px 0; font-size: clamp(1.45rem, 3vw, 2.05rem); font-weight: 900; color: #fff;">${copy.h1}</h1>
        <p style="margin: 0; color: #e0e7ff; max-width: 820px; line-height: 1.7;">${copy.sub}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 22px; align-items: start;">
        <div class="glass-card" style="padding: 26px; border-radius: 18px; border: 1px solid var(--border); display:flex; flex-direction:column; gap:15px;">
          <div>
            <label style="display:block;font-weight:800;margin-bottom:6px;color:var(--text-heading);">${copy.sim1Date}</label>
            <input id="imei-date" type="date" value="${defaultStart}" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" oninput="calcImei()">
          </div>
          <div>
            <label style="display:block;font-weight:800;margin-bottom:6px;color:var(--text-heading);">${copy.hasDual}</label>
            <select id="imei-dual" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" onchange="calcImei()">
              <option value="2" selected>${lang === 'ar' ? 'نعم — شريحتان / eSIM (240 يوماً = 8 أشهر)' : lang === 'tr' ? 'Evet — Çift SIM / eSIM (240 Gün = 8 Ay)' : 'Yes — Dual SIM / eSIM (240 Days = 8 Months)'}</option>
              <option value="1">${lang === 'ar' ? 'لا — شريحة واحدة فقط (120 يوماً = 4 أشهر)' : lang === 'tr' ? 'Hayır — Tek SIM (120 Gün = 4 Ay)' : 'No — Single SIM Only (120 Days = 4 Months)'}</option>
            </select>
          </div>
          <hr style="border:none;border-top:1px solid var(--border);margin:4px 0;">
          <div>
            <label style="display:block;font-weight:700;margin-bottom:6px;font-size:0.88rem;color:var(--text-heading);">${copy.imeiFee}</label>
            <input id="imei-fee" type="number" value="45614" style="width:100%;padding:11px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" oninput="calcImei()">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-weight:700;margin-bottom:6px;font-size:0.84rem;color:var(--text-heading);">${copy.foreignPrice}</label>
              <input id="imei-foreign" type="number" value="42000" step="1000" style="width:100%;padding:11px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" oninput="calcImei()">
            </div>
            <div>
              <label style="display:block;font-weight:700;margin-bottom:6px;font-size:0.84rem;color:var(--text-heading);">${copy.localPrice}</label>
              <input id="imei-local" type="number" value="95000" step="1000" style="width:100%;padding:11px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-site);color:var(--text-heading);" oninput="calcImei()">
            </div>
          </div>
        </div>

        <div class="glass-card" style="padding: 26px; border-radius: 18px; border: 1px solid var(--border); display:flex; flex-direction:column; gap:14px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div style="padding:16px;border-radius:14px;background:var(--bg-subtle);border:1px solid var(--border);">
              <div style="font-size:0.8rem;color:var(--text-muted);font-weight:700;">${lang === 'ar' ? 'نهاية الشريحة الأولى (IMEI 1)' : lang === 'tr' ? 'IMEI 1 Bitiş Tarihi' : 'SIM 1 Cutoff Date'}</div>
              <div id="imei-sim1-end" style="font-size:1.3rem;font-weight:900;color:var(--text-heading);margin-top:4px;">—</div>
            </div>
            <div style="padding:16px;border-radius:14px;background:rgba(67,56,202,0.08);border:1px solid rgba(67,56,202,0.25);">
              <div style="font-size:0.8rem;color:#4338ca;font-weight:700;">${lang === 'ar' ? 'نهاية الشريحتين (الإجمالي)' : lang === 'tr' ? 'Toplam Kullanım Sonu' : 'Final Cutoff (Dual SIM)'}</div>
              <div id="imei-sim2-end" style="font-size:1.3rem;font-weight:900;color:#4338ca;margin-top:4px;">—</div>
            </div>
          </div>
          <div id="imei-remaining-box" style="padding:16px;border-radius:14px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.28);font-weight:800;color:#065f46;line-height:1.65;"></div>
          <div id="imei-compare-box" style="padding:16px;border-radius:14px;background:var(--bg-subtle);border:1px solid var(--border);font-size:0.93rem;line-height:1.7;color:var(--text-body);"></div>
        </div>
      </div>

      ${renderFaqSection(lang, faqs, [
        { href: `/${lang}/ikamet-calculator`, label: lang === 'ar' ? 'حاسبة رسوم الإقامة التركية' : lang === 'tr' ? 'İkamet Harçları Hesaplama' : 'Ikamet Cost Calculator' },
        { href: `/${lang}/currency-prices`, label: lang === 'ar' ? 'أسعار الدولار واليورو اليوم' : lang === 'tr' ? 'Canlı Döviz Kurları' : 'Live Currency Rates' },
        { href: `/${lang}/istanbul-guide-directory`, label: lang === 'ar' ? 'دليل الطوارئ والرموز البريدية' : lang === 'tr' ? 'İstanbul Posta Kodları' : 'Istanbul Postal Codes' }
      ])}
    </div>

    <script>
      function calcImei() {
        var dateVal = document.getElementById('imei-date').value;
        var slots = parseInt(document.getElementById('imei-dual').value, 10) || 2;
        var fee = parseFloat(document.getElementById('imei-fee').value) || 45614;
        var foreignP = parseFloat(document.getElementById('imei-foreign').value) || 0;
        var localP = parseFloat(document.getElementById('imei-local').value) || 0;
        var lang = '${lang}';

        var start = dateVal ? new Date(dateVal + 'T00:00:00') : new Date();
        var sim1End = new Date(start.getTime() + 120 * 86400000);
        var finalEnd = new Date(start.getTime() + (slots * 120) * 86400000);
        var now = new Date();
        var remDays = Math.ceil((finalEnd.getTime() - now.getTime()) / 86400000);
        var nextJan1 = new Date(now.getFullYear() + 1, 0, 1);
        var daysToReset = Math.max(0, Math.ceil((nextJan1.getTime() - now.getTime()) / 86400000));

        var fmt = function(d) { return d.toISOString().split('T')[0]; };
        document.getElementById('imei-sim1-end').textContent = fmt(sim1End);
        document.getElementById('imei-sim2-end').textContent = fmt(finalEnd);

        var remBox = document.getElementById('imei-remaining-box');
        if (remDays > 0) {
          remBox.textContent = lang === 'ar'
            ? '⏳ المتبقي لعمل الهاتف بدون تتريك: ' + remDays + ' يوماً — وموعد التصفير السنوي (1 يناير) بعد ' + daysToReset + ' يوماً.'
            : lang === 'tr'
            ? '⏳ Kalan kayıtsız kullanım süresi: ' + remDays + ' gün — 1 Ocak sıfırlamasına kalan süre: ' + daysToReset + ' gün.'
            : '⏳ Remaining unregistered usage: ' + remDays + ' days — Annual Jan 1 reset in ' + daysToReset + ' days.';
        } else {
          remBox.textContent = lang === 'ar'
            ? '⚠️ انتهت مدة الاستخدام السنوية؛ سيتصفر العدّاد تلقائياً في 1 يناير بعد ' + daysToReset + ' يوماً.'
            : lang === 'tr'
            ? '⚠️ Yıllık süre doldu; 1 Ocak tarihinde (' + daysToReset + ' gün sonra) hatlar otomatik yenilenir.'
            : '⚠️ Annual allowance ended; lines reset automatically on January 1 (in ' + daysToReset + ' days).';
        }

        var totalImported = foreignP + fee;
        var diff = localP - totalImported;
        var cmpBox = document.getElementById('imei-compare-box');
        if (diff > 0) {
          cmpBox.innerHTML = lang === 'ar'
            ? '<strong>💰 المقارنة المالية:</strong> إجمالي الهاتف الخارجي + التتريك = <strong>' + totalImported.toLocaleString('en-US') + ' TL</strong>. التتريك أوفر من الشراء داخل تركيا بمقدار <strong style="color:#059669;">' + diff.toLocaleString('en-US') + ' TL</strong>.'
            : lang === 'tr'
            ? '<strong>💰 Maliyet Karşılaştırması:</strong> Yurt dışı + IMEI Harcı = <strong>' + totalImported.toLocaleString('en-US') + ' TL</strong>. Kayıt yaptırmak Türkiye fiyatından <strong style="color:#059669;">' + diff.toLocaleString('en-US') + ' TL</strong> daha avantajlı.'
            : '<strong>💰 Cost Comparison:</strong> Foreign Phone + IMEI Tax = <strong>' + totalImported.toLocaleString('en-US') + ' TRY</strong>, saving <strong style="color:#059669;">' + diff.toLocaleString('en-US') + ' TRY</strong> vs local retail.';
        } else {
          cmpBox.innerHTML = lang === 'ar'
            ? '<strong>💡 المقارنة المالية:</strong> إجمالي الهاتف الخارجي + التتريك = <strong>' + totalImported.toLocaleString('en-US') + ' TL</strong>. الشراء الرسمي بضمان داخل تركيا أوفر بمقدار <strong style="color:#dc2626;">' + Math.abs(diff).toLocaleString('en-US') + ' TL</strong>.'
            : lang === 'tr'
            ? '<strong>💡 Maliyet Karşılaştırması:</strong> Yurt dışı + IMEI Harcı = <strong>' + totalImported.toLocaleString('en-US') + ' TL</strong>. Türkiye garantili cihaz almak <strong style="color:#dc2626;">' + Math.abs(diff).toLocaleString('en-US') + ' TL</strong> daha ekonomik.'
            : '<strong>💡 Cost Comparison:</strong> Foreign Phone + IMEI Tax = <strong>' + totalImported.toLocaleString('en-US') + ' TRY</strong>. Buying locally in Turkey saves <strong style="color:#dc2626;">' + Math.abs(diff).toLocaleString('en-US') + ' TRY</strong>.';
        }
      }
      document.addEventListener('DOMContentLoaded', calcImei);
    </script>
  `
  return c.html(renderLayout(c, copy.title, bodyHtml, locale, seoHtml))
})
