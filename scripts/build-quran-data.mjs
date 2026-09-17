import * as fs from 'fs';
import * as path from 'path';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.quran.karim.kamel.bidon.net.murtal.tilaat.smart';
const PACKAGE_NAME = 'com.quran.karim.kamel.bidon.net.murtal.tilaat.smart';

interface ArticleDataConfig {
  locale: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  canonical: string;
  isRtl: boolean;
  appName: string;
  appBadgeTop: string;
  appHeaderTitle: string;
  appHeaderDesc: string;
  badges: {
    rating: string;
    android: string;
    offline: string;
    free: string;
  };
  downloadBtnText: string;
  bannerAlt: string;
  bannerCaption: string;
  introParagraph: string;
  whyChooseHeading: string;
  whyChooseDesc: string;
  features: Array<{
    title: string;
    desc: string;
    img: string;
    alt: string;
  }>;
  midCtaHeading: string;
  midCtaDesc: string;
  midCtaBtnText: string;
  specsHeading: string;
  specs: Array<{ key: string; val: string; isLink?: boolean; href?: string }>;
  stepsHeading: string;
  steps: string[];
  faqHeading: string;
  faqs: Array<{ question: string; answer: string }>;
  finalCtaHeading: string;
  finalCtaDesc: string;
  finalCtaBtnText: string;
}

function generateHtml(cfg: ArticleDataConfig): string {
  const align = cfg.isRtl ? 'right' : 'left';
  const dir = cfg.isRtl ? 'rtl' : 'ltr';

  const featuresHtml = cfg.features.map(f => `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column;">
          <img src="/public/images/quran-app/${f.img}" alt="${f.alt.replace(/"/g, '&quot;')}" style="width: 100%; height: 260px; object-fit: cover; background: #f1f5f9;">
          <div style="padding: 20px; flex-grow: 1;">
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--primary); margin: 0 0 8px 0;">${f.title}</h3>
            <p style="font-size: 0.92rem; color: var(--text-body); line-height: 1.6; margin: 0;">${f.desc}</p>
          </div>
        </div>`).join('\n');

  const specsRowsHtml = cfg.specs.map(s => `
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 12px;"><strong>${s.key}</strong></td>
            <td style="padding: 12px; ${s.isLink ? '' : 'color: var(--text-dark);'}">${s.isLink ? `<a href="${s.href}" target="_blank" style="color: var(--primary); font-family: monospace; font-weight: 700;">${s.val}</a>` : s.val}</td>
          </tr>`).join('\n');

  const stepsListHtml = cfg.steps.map(step => `        <li>${step}</li>`).join('\n');

  const faqsCardsHtml = cfg.faqs.map(faq => `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; margin-bottom: 14px;">
          <h4 style="margin: 0 0 8px 0; color: var(--text-dark); font-size: 1.05rem; font-weight: 700;">❓ ${faq.question}</h4>
          <p style="margin: 0; font-size: 0.95rem; color: var(--text-body); line-height: 1.6;">${faq.answer}</p>
        </div>`).join('\n');

  return `
    <div class="article-rich-text" dir="${dir}" style="text-align: ${align};">
      <!-- App Header Showcase -->
      <div style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%); border-radius: 20px; padding: 32px 24px; color: #ffffff; margin-bottom: 36px; box-shadow: 0 12px 30px rgba(4, 120, 87, 0.25); text-align: center; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -40px; right: -40px; width: 150px; height: 150px; background: rgba(255,255,255,0.08); border-radius: 50%; pointer-events: none;"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%; pointer-events: none;"></div>
        
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; margin-bottom: 20px;">
          <img src="/public/images/quran-app/00_App_Icon_3D_Logo.jpg" alt="${cfg.appName.replace(/"/g, '&quot;')}" style="width: 100px; height: 100px; border-radius: 22px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); border: 3px solid rgba(255,255,255,0.3); object-fit: cover;">
          <div>
            <span style="background: rgba(255, 255, 255, 0.2); padding: 4px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.5px; display: inline-block; margin-bottom: 8px;">✨ ${cfg.appBadgeTop}</span>
            <h2 style="color: #ffffff; font-size: 1.75rem; font-weight: 900; margin: 0 0 6px 0; line-height: 1.3;">${cfg.appHeaderTitle}</h2>
            <p style="color: rgba(255, 255, 255, 0.9); font-size: 0.95rem; margin: 0; max-width: 620px; line-height: 1.6;">${cfg.appHeaderDesc}</p>
          </div>
        </div>

        <!-- Badges & Ratings -->
        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; font-size: 0.88rem;">
          <span style="background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 12px; display: flex; align-items: center; gap: 6px;">
            <span style="color: #fbbf24;">★★★★★</span> <strong>${cfg.badges.rating}</strong>
          </span>
          <span style="background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 12px;">
            📱 <strong>${cfg.badges.android}</strong>
          </span>
          <span style="background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 12px;">
            ⚡ <strong>${cfg.badges.offline}</strong>
          </span>
          <span style="background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 12px;">
            🆓 <strong>${cfg.badges.free}</strong>
          </span>
        </div>

        <!-- Download Action -->
        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
          <a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="background: #ffffff; color: #064e3b; padding: 14px 32px; border-radius: 14px; font-weight: 800; font-size: 1.05rem; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 6px 18px rgba(0,0,0,0.2); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <svg style="width: 22px; height: 22px; fill: currentColor;" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186c-.368-.387-.61-.926-.61-1.547V3.361c0-.621.242-1.16.609-1.547zm11.238 11.238l2.583-2.583-11.83-6.83 9.247 9.413zm0 1.896l-9.247 9.413 11.83-6.83-2.583-2.583zm1.053-1.053l3.708 2.14c.833.481 1.392-.078 1.392-.078l-4.047-4.047-1.053 1.985z"/></svg>
            ${cfg.downloadBtnText}
          </a>
        </div>
      </div>

      <!-- Main Overview Banner Image -->
      <div style="margin-bottom: 32px; text-align: center;">
        <img src="/public/images/quran-app/quran-banner.png" alt="${cfg.bannerAlt.replace(/"/g, '&quot;')}" style="width: 100%; max-height: 480px; object-fit: cover; border-radius: 18px; box-shadow: var(--shadow-md);">
        <p style="font-size: 0.88rem; color: var(--text-muted); text-align: center; margin-top: 10px;">${cfg.bannerCaption}</p>
      </div>

      <p style="font-size: 1.15rem; line-height: 1.9; color: var(--text-dark);">${cfg.introParagraph}</p>

      <h2>${cfg.whyChooseHeading}</h2>
      <p>${cfg.whyChooseDesc}</p>

      <!-- Grid of Features with Real App Screenshots -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 36px 0;">
${featuresHtml}
      </div>

      <!-- Mid-Article CTA -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%); border: 2px dashed #10b981; border-radius: 16px; padding: 28px; text-align: center; margin: 40px 0;">
        <h3 style="font-size: 1.4rem; font-weight: 800; color: #064e3b; margin: 0 0 10px 0;">📥 ${cfg.midCtaHeading}</h3>
        <p style="font-size: 0.98rem; color: var(--text-body); max-width: 600px; margin: 0 auto 20px auto; line-height: 1.6;">${cfg.midCtaDesc}</p>
        <a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="background: #047857; color: #ffffff; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 1rem; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3);">
          ⭐ ${cfg.midCtaBtnText}
        </a>
      </div>

      <h2>${cfg.specsHeading}</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 0.95rem;">
        <thead>
          <tr style="background: var(--bg-subtle); text-align: ${align};">
            <th style="padding: 12px; border-bottom: 2px solid var(--border);">${cfg.isRtl ? 'المواصفة' : (cfg.locale === 'tr' ? 'Özellik' : (cfg.locale === 'de' ? 'Eigenschaft' : (cfg.locale === 'fr' ? 'Spécification' : 'Specification')))}</th>
            <th style="padding: 12px; border-bottom: 2px solid var(--border);">${cfg.isRtl ? 'التفاصيل' : (cfg.locale === 'tr' ? 'Detay' : (cfg.locale === 'de' ? 'Details' : (cfg.locale === 'fr' ? 'Détails' : 'Details')))}</th>
          </tr>
        </thead>
        <tbody>
${specsRowsHtml}
        </tbody>
      </table>

      <h2>${cfg.stepsHeading}</h2>
      <ol style="line-height: 1.9; font-size: 1.05rem;">
${stepsListHtml}
      </ol>

      <h2>${cfg.faqHeading}</h2>
      <div style="margin-top: 20px;">
${faqsCardsHtml}
      </div>

      <!-- Final Sticky CTA Box -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; border-radius: 18px; padding: 30px; text-align: center; margin-top: 40px; box-shadow: var(--shadow-lg);">
        <h3 style="color: #ffffff; font-size: 1.5rem; font-weight: 900; margin: 0 0 12px 0;">${cfg.finalCtaHeading}</h3>
        <p style="color: #94a3b8; font-size: 0.98rem; max-width: 550px; margin: 0 auto 24px auto; line-height: 1.6;">${cfg.finalCtaDesc}</p>
        <a href="${GOOGLE_PLAY_URL}" target="_blank" rel="noopener" style="background: #10b981; color: #ffffff; padding: 14px 34px; border-radius: 12px; font-weight: 800; font-size: 1.05rem; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
          📲 ${cfg.finalCtaBtnText}
        </a>
      </div>
    </div>
  `;
}

console.log('Builder module ready');
