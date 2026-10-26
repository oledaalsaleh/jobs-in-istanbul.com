// Layout critical CSS (header, mobile nav, native ad cards) — served from /css/layout.css
// so it is cached once instead of being repeated inside every HTML response.
export const layoutCss = `
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      width: 100% !important;
      max-width: 100vw !important;
      overflow-x: clip !important;
    }
    .page-wrapper {
      width: 100% !important;
      max-width: 100vw !important;
      overflow-x: clip !important;
      position: relative !important;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .site-header { transform: translateY(0); }

    /* IN-FEED NATIVE GOOGLE PLAY AD CARD */
    .native-ad-feed-card {
      position: relative;
      background: var(--bg-card);
      border: 1.5px solid rgba(16, 185, 129, 0.32);
      border-radius: var(--r-xl);
      padding: 22px 24px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: var(--t-base);
      box-shadow: 0 4px 18px rgba(16, 185, 129, 0.07), var(--shadow-xs);
      overflow: hidden;
      box-sizing: border-box;
      width: 100%;
      max-width: 100%;
    }
    .native-ad-feed-card::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      width: 5px;
      left: 0;
      background: linear-gradient(180deg, #10b981 0%, #0284c7 100%);
      border-radius: 0 var(--r-xs) var(--r-xs) 0;
      transition: width 0.2s ease;
    }
    .rtl .native-ad-feed-card::before {
      left: auto;
      right: 0;
      border-radius: var(--r-xs) 0 0 var(--r-xs);
    }
    .native-ad-feed-card:hover {
      transform: translateY(-3px);
      border-color: rgba(16, 185, 129, 0.55);
      box-shadow: 0 12px 30px rgba(16, 185, 129, 0.16), var(--shadow-card-hover);
    }
    .native-ad-feed-card:hover::before {
      width: 7px;
    }
    body.dark-mode .native-ad-feed-card {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 48, 0.95) 100%);
      border-color: rgba(16, 185, 129, 0.35);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 16px rgba(16, 185, 129, 0.12);
    }
    .ad-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      border-bottom: 1px dashed rgba(16, 185, 129, 0.22);
      padding-bottom: 10px;
    }
    .ad-badge-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ad-tag-pill {
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #059669;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 2px 8px;
      border-radius: 4px;
      line-height: 1.2;
    }
    body.dark-mode .ad-tag-pill {
      color: #34d399;
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(52, 211, 153, 0.4);
    }
    .ad-sponsor-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .ad-rating-box {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      font-weight: 800;
      color: #d97706;
      background: rgba(245, 158, 11, 0.12);
      padding: 3px 10px;
      border-radius: var(--r-full);
    }
    .ad-rating-stars {
      letter-spacing: 1.5px;
    }
    .ad-rating-count {
      font-size: 0.74rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .ad-content-wrapper {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 20px;
    }
    .ad-top-flex-mobile {
      display: flex;
      align-items: flex-start;
      gap: 18px;
      min-width: 0;
    }
    .ad-icon-box {
      position: relative;
      width: 72px;
      height: 72px;
      flex-shrink: 0;
      border-radius: 18px;
      text-decoration: none;
      display: block;
    }
    .ad-app-img {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      object-fit: cover;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.14);
      transition: transform 0.25s ease;
      display: block;
    }
    .native-ad-feed-card:hover .ad-app-img {
      transform: scale(1.06) rotate(-1deg);
    }
    .ad-offline-tag {
      position: absolute;
      bottom: -6px;
      right: -6px;
      background: #059669;
      color: #ffffff;
      font-size: 0.62rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: var(--r-full);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
      display: inline-flex;
      align-items: center;
      gap: 3px;
      white-space: nowrap;
    }
    .rtl .ad-offline-tag {
      right: auto;
      left: -6px;
    }
    .ad-info-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }
    .ad-headline-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .ad-app-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-heading);
      text-decoration: none;
      line-height: 1.3;
      margin: 0;
      transition: color var(--t-fast);
    }
    .ad-app-title:hover {
      color: var(--primary);
    }
    .ad-pill-free {
      font-size: 0.72rem;
      font-weight: 800;
      color: #059669;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.28);
      padding: 2px 9px;
      border-radius: var(--r-full);
      line-height: 1.3;
    }
    body.dark-mode .ad-pill-free {
      color: #34d399;
      background: rgba(52, 211, 153, 0.18);
    }
    .ad-text-desc {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .ad-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }
    .ad-chip-item {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-base);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      padding: 3px 10px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      line-height: 1.3;
    }
    .ad-chip-item i {
      color: #10b981;
      font-size: 0.76rem;
    }
    .ad-cta-side {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }
    .rtl .ad-cta-side {
      align-items: flex-start;
    }
    .ad-play-button {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #0f172a;
      color: #ffffff !important;
      padding: 10px 18px;
      border-radius: 12px;
      text-decoration: none;
      font-family: inherit;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.22);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      white-space: nowrap;
    }
    body.dark-mode .ad-play-button {
      background: #020617;
      border-color: rgba(16, 185, 129, 0.4);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), 0 0 14px rgba(16, 185, 129, 0.25);
    }
    .ad-play-button:hover {
      transform: translateY(-2px);
      background: #000000;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.38);
      border-color: #10b981;
    }
    .ad-btn-texts {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
      text-align: start;
    }
    .ad-btn-sub {
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.82;
      font-weight: 600;
    }
    .ad-btn-title {
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 0.2px;
    }
    .ad-sub-note {
      font-size: 0.72rem;
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    @media (max-width: 768px) {
      .container { padding: 0 14px !important; max-width: 100% !important; }
      .site-header { height: 60px !important; width: 100% !important; }
      .header-inner { padding: 0 14px !important; width: 100% !important; justify-content: space-between !important; }
      .header-playstore-btn, .header-turkey-guide-btn, .header-telegram-btn, .header-install-btn, .lang-btn, #dark-mode-toggle, #desktop-nav {
        display: none !important;
      }
      #mobile-menu-btn {
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
      }
      #turkey-travel-top-bar, .turkey-travel-top-bar {
        display: none !important;
      }
      #smart-app-banner {
        padding: 6px 12px !important;
      }
      #smart-app-banner strong { font-size: 0.78rem !important; }
      #smart-app-banner span { font-size: 0.68rem !important; }
      #smart-app-banner a { padding: 5px 10px !important; font-size: 0.72rem !important; }
      .hero { padding: 26px 0 40px !important; }
      .hero-title { font-size: clamp(1.45rem, 5.5vw, 1.85rem) !important; line-height: 1.25 !important; margin-bottom: 10px !important; }
      .hero-subtitle { font-size: 0.88rem !important; margin-bottom: 16px !important; line-height: 1.5 !important; }
      .hero-eyebrow { font-size: 0.74rem !important; padding: 4px 12px !important; margin-bottom: 12px !important; }
      .hero-stats { display: none !important; }
      .search-section { margin-top: -22px !important; margin-bottom: 26px !important; }
      .search-card { padding: 10px !important; gap: 8px !important; border-radius: 16px !important; flex-direction: column !important; }
      .search-field-wrap { min-height: 46px !important; padding: 0 14px !important; width: 100% !important; box-sizing: border-box !important; }
      .search-district-wrap { flex: 1 1 auto !important; width: 100% !important; min-height: 46px !important; }
      .btn-search { min-height: 46px !important; padding: 12px !important; font-size: 0.95rem !important; width: 100% !important; justify-content: center !important; }

      /* MAIN LAYOUT & SIDEBAR ON MOBILE */
      .main-layout {
        grid-template-columns: 100% !important;
        gap: 16px !important;
        margin-bottom: 36px !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .filters-sidebar {
        position: static !important;
        margin-bottom: 16px !important;
        padding: 16px 14px !important;
        border-radius: 16px !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      .filter-header {
        margin-bottom: 12px !important;
        padding-bottom: 10px !important;
      }
      .filter-main-title {
        font-size: 0.95rem !important;
      }
      .filter-group {
        margin-bottom: 14px !important;
      }
      .filter-group-title {
        font-size: 0.72rem !important;
        margin-bottom: 8px !important;
      }
      .filter-options {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .filter-radio {
        flex: 1 1 calc(50% - 6px) !important;
        min-width: 110px !important;
        max-width: 100% !important;
        padding: 9px 12px !important;
        font-size: 0.82rem !important;
        border-radius: var(--r-full) !important;
        border: 1.5px solid var(--border) !important;
        background: var(--bg-card) !important;
        justify-content: center !important;
        text-align: center !important;
        box-sizing: border-box !important;
        gap: 6px !important;
        margin: 0 !important;
      }
      .filter-radio input {
        display: none !important;
      }
      .filter-radio.selected {
        background: var(--primary) !important;
        color: #ffffff !important;
        border-color: var(--primary) !important;
        box-shadow: 0 2px 8px var(--primary-glow) !important;
        font-weight: 700 !important;
      }
      .filters-sidebar a.btn-primary {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        justify-content: center !important;
        padding: 12px 16px !important;
        font-size: 0.88rem !important;
        border-radius: var(--r-md) !important;
      }
      .telegram-cta {
        margin-top: 14px !important;
        padding: 14px 12px !important;
        border-radius: 14px !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      .telegram-cta h3 {
        font-size: 0.95rem !important;
        margin-bottom: 6px !important;
      }
      .telegram-cta p {
        font-size: 0.78rem !important;
        line-height: 1.35 !important;
        margin-bottom: 12px !important;
      }
      .telegram-cta .telegram-btn {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        padding: 9px 12px !important;
        font-size: 0.82rem !important;
        justify-content: center !important;
        border-radius: 8px !important;
      }
      .telegram-cta > div[style*="font-size:120px"] {
        display: none !important;
      }
      .job-card {
        grid-template-columns: 100% !important;
        padding: 16px 14px !important;
        border-radius: 16px !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .btn-apply {
        width: 100% !important;
        box-sizing: border-box !important;
        justify-content: center !important;
        padding: 11px !important;
        font-size: 0.88rem !important;
      }
      .native-ad-feed-card {
        padding: 16px 14px !important;
        gap: 12px !important;
        border-radius: 16px !important;
        box-sizing: border-box !important;
        width: 100% !important;
        max-width: 100% !important;
        overflow: hidden !important;
      }
      .ad-content-wrapper {
        grid-template-columns: 1fr !important;
        gap: 14px !important;
      }
      .ad-top-flex-mobile {
        display: flex !important;
        align-items: flex-start !important;
        gap: 12px !important;
      }
      .ad-icon-box {
        width: 60px !important;
        height: 60px !important;
        border-radius: 14px !important;
      }
      .ad-app-img {
        width: 60px !important;
        height: 60px !important;
        border-radius: 14px !important;
      }
      .ad-app-title {
        font-size: 1.05rem !important;
      }
      .ad-text-desc {
        font-size: 0.84rem !important;
        -webkit-line-clamp: 3 !important;
      }
      .ad-tags-row {
        gap: 5px !important;
      }
      .ad-chip-item {
        font-size: 0.72rem !important;
        padding: 2px 8px !important;
      }
      .ad-cta-side {
        width: 100% !important;
        align-items: stretch !important;
      }
      .ad-play-button {
        width: 100% !important;
        box-sizing: border-box !important;
        justify-content: center !important;
        padding: 12px 16px !important;
        border-radius: var(--r-full) !important;
      }
      .ad-sub-note {
        justify-content: center !important;
        width: 100% !important;
        margin-top: 2px !important;
      }
    }
    @media (max-width: 480px) {
      .logo-text span { display: none !important; }
      .logo-text strong { font-size: 0.92rem !important; }
      .logo-icon { width: 38px !important; height: 38px !important; border-radius: 10px !important; }
      .hero { padding: 24px 0 36px !important; }
      .hero-title { font-size: 1.5rem !important; }
      .hero-subtitle { font-size: 0.85rem !important; margin-bottom: 14px !important; }
    }
  `;
