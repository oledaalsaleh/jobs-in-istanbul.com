export const themeCss = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --font-en: 'Plus Jakarta Sans', sans-serif;
  --font-ar: 'Cairo', sans-serif;

  /* Premium Color System */
  --primary:        hsl(224, 80%, 54%);
  --primary-hover:  hsl(224, 80%, 44%);
  --primary-dark:   hsl(224, 80%, 36%);
  --primary-light:  hsl(224, 100%, 96%);
  --primary-glow:   hsla(224, 80%, 54%, 0.30);

  --secondary:      hsl(240, 22%, 9%);
  --secondary-mid:  hsl(240, 18%, 14%);
  --secondary-lite: hsl(240, 14%, 20%);

  --accent:         hsl(38, 94%, 54%);
  --accent-hover:   hsl(38, 94%, 44%);
  --accent-light:   hsl(38, 100%, 96%);
  --accent-glow:    hsla(38, 94%, 54%, 0.25);

  --success:        hsl(152, 70%, 40%);
  --success-light:  hsl(152, 70%, 96%);
  --danger:         hsl(0, 80%, 57%);
  --danger-light:   hsl(0, 80%, 96%);

  --bg-base:        hsl(222, 30%, 98%);
  --bg-card:        #ffffff;
  --bg-subtle:      hsl(222, 20%, 96%);
  --border:         hsl(220, 20%, 90%);
  --border-strong:  hsl(220, 20%, 80%);

  --text-heading:   hsl(240, 22%, 9%);
  --text-body:      hsl(220, 15%, 35%);
  --text-muted:     hsl(220, 12%, 58%);
  --text-white:     hsl(0, 0%, 100%);

  /* Shadows */
  --shadow-xs:  0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --shadow-sm:  0 4px 6px -1px rgba(0,0,0,.06), 0 2px 4px -1px rgba(0,0,0,.04);
  --shadow-md:  0 10px 15px -3px rgba(0,0,0,.07), 0 4px 6px -2px rgba(0,0,0,.04);
  --shadow-lg:  0 20px 25px -5px rgba(0,0,0,.08), 0 10px 10px -5px rgba(0,0,0,.04);
  --shadow-xl:  0 25px 50px -12px rgba(0,0,0,.18);
  --shadow-glow: 0 0 30px var(--primary-glow);
  --shadow-card-hover: 0 20px 40px -8px rgba(20, 50, 150, 0.14), 0 8px 16px -4px rgba(20, 50, 150, 0.08);

  /* Glass */
  --glass-bg:     rgba(255, 255, 255, 0.78);
  --glass-border: rgba(255, 255, 255, 0.6);
  --glass-blur:   blur(20px) saturate(180%);

  /* Radius */
  --r-xs:  6px;
  --r-sm:  10px;
  --r-md:  14px;
  --r-lg:  20px;
  --r-xl:  28px;
  --r-2xl: 40px;
  --r-full: 9999px;

  /* Transitions */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --t-fast:   all 0.15s var(--ease-out);
  --t-base:   all 0.25s var(--ease-out);
  --t-slow:   all 0.40s var(--ease-out);
  --t-spring: all 0.35s var(--ease-spring);
}

/* ---- Reset ---- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; text-size-adjust: 100%; overflow-x: hidden; width: 100%; max-width: 100%; }

body {
  font-family: var(--font-en);
  background: var(--bg-base);
  color: var(--text-body);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
}
body.rtl { font-family: var(--font-ar); direction: rtl; }
a { color: inherit; text-decoration: none; transition: var(--t-base); }
img, svg { max-width: 100%; display: block; }
button, input, select, textarea { font-family: inherit; outline: none; }
button { cursor: pointer; border: none; background: none; }
*:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; border-radius: 4px; }

/* ---- Layout ---- */
.container { width: 100%; max-width: 1300px; margin: 0 auto; padding: 0 28px; }
main { flex: 1; }

/* ============================================================
   HEADER
   ============================================================ */
.site-header {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 200;
  height: 72px;
  display: flex;
  align-items: center;
  transition: var(--t-base);
}
.site-header.scrolled {
  background: rgba(255,255,255,0.95);
  box-shadow: var(--shadow-sm);
}

.header-inner { display: flex; justify-content: space-between; align-items: center; width: 100%; }

/* Logo */
.logo {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text-heading);
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.03em;
  flex-shrink: 0;
}
.logo-icon {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, var(--primary), hsl(260, 80%, 60%));
  border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 1.05rem;
  box-shadow: 0 4px 12px var(--primary-glow);
  flex-shrink: 0;
}
.logo-text { display: flex; flex-direction: column; line-height: 1.1; }
.logo-text strong { font-size: 1.05rem; color: var(--primary); white-space: nowrap; }
.logo-text span { font-size: 0.72rem; font-weight: 500; color: var(--text-muted); letter-spacing: 0.02em; white-space: nowrap; }

/* Nav */
.nav-links { display: flex; align-items: center; gap: 4px; list-style: none; }
.nav-link {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-body);
  padding: 7px 13px;
  border-radius: var(--r-sm);
  position: relative;
  white-space: nowrap;
}
.nav-link:hover { color: var(--primary); background: var(--primary-light); }
.nav-link.active { color: var(--primary); background: var(--primary-light); }

/* Nav CTA */
.nav-cta {
  display: flex; align-items: center; gap: 8px;
  background: var(--primary);
  color: white !important;
  padding: 7px 16px !important;
  border-radius: var(--r-full) !important;
  font-size: 0.85rem !important;
}
.nav-cta:hover { background: var(--primary-hover) !important; transform: translateY(-1px); box-shadow: 0 4px 16px var(--primary-glow); }

/* Header Actions */
.header-actions { display: flex; align-items: center; gap: 6px; }
.icon-btn {
  width: 38px; height: 38px;
  border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-body);
  transition: var(--t-base);
  position: relative;
}
.icon-btn:hover { background: var(--bg-subtle); color: var(--primary); }
.icon-btn .badge {
  position: absolute; top: 4px; right: 4px;
  width: 16px; height: 16px;
  background: var(--danger);
  color: white; font-size: 0.6rem; font-weight: 700;
  border-radius: var(--r-full);
  display: flex; align-items: center; justify-content: center;
  display: none;
}
.lang-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  border-radius: var(--r-full);
  font-size: 0.82rem; font-weight: 700;
  border: 1.5px solid var(--border);
  color: var(--text-body);
  transition: var(--t-base);
}
.lang-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }

/* ============================================================
   HERO — Premium Animated
   ============================================================ */
.hero {
  position: relative;
  overflow: hidden;
  background: var(--secondary);
  padding: 96px 0 130px;
  text-align: center;
}
.hero-bg {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 60% at 50% -10%, hsla(224, 80%, 60%, 0.35), transparent),
    radial-gradient(ellipse 60% 50% at 80% 80%, hsla(280, 70%, 55%, 0.20), transparent),
    radial-gradient(ellipse 50% 60% at 10% 90%, hsla(38, 94%, 54%, 0.12), transparent);
}
/* Animated grid pattern */
.hero-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
}
.hero::after {
  content: '';
  position: absolute; bottom: -2px; left: -5%; right: -5%;
  height: 80px;
  background: var(--bg-base);
  border-radius: 50% 50% 0 0;
}
.hero-content { position: relative; z-index: 10; }

/* Eyebrow label */
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.85);
  padding: 6px 16px;
  border-radius: var(--r-full);
  font-size: 0.82rem; font-weight: 600;
  margin-bottom: 24px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.hero-eyebrow i { color: var(--accent); font-size: 0.75rem; }

.hero-title {
  font-size: clamp(2.6rem, 6vw, 4.2rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.08;
  margin-bottom: 22px;
  color: white;
}
.hero-title .gradient-word {
  background: linear-gradient(90deg, var(--accent), hsl(38, 100%, 78%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: rgba(255,255,255,0.68);
  max-width: 640px;
  margin: 0 auto 40px;
  font-weight: 400;
  line-height: 1.7;
}

/* Stats row */
.hero-stats {
  display: flex; justify-content: center; align-items: center;
  gap: 32px; flex-wrap: wrap;
  margin-top: 48px;
}
.hero-stat {
  display: flex; flex-direction: column; align-items: center;
  color: white;
}
.hero-stat-value { font-size: 1.9rem; font-weight: 800; letter-spacing: -0.03em; }
.hero-stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.55); font-weight: 500; margin-top: 2px; }
.hero-stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.12); }

/* ============================================================
   SEARCH BOX — Floating Overlay
   ============================================================ */
.search-section {
  margin-top: -52px;
  position: relative; z-index: 30;
  margin-bottom: 64px;
}
.search-card {
  background: white;
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-xl), 0 0 0 1px rgba(0,0,0,0.04);
  padding: 18px;
  display: flex; align-items: stretch; gap: 12px;
}
.search-field-wrap {
  flex: 1; display: flex; align-items: center; gap: 12px;
  padding: 0 18px;
  border-radius: var(--r-lg);
  background: var(--bg-subtle);
  border: 1.5px solid transparent;
  min-height: 56px;
  transition: var(--t-base);
}
.search-field-wrap:focus-within {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 4px var(--primary-glow);
}
.search-field-wrap .s-icon { color: var(--primary); font-size: 1.1rem; flex-shrink: 0; }
.search-field-wrap input {
  flex: 1; border: none; background: transparent;
  font-size: 1rem; color: var(--text-heading); font-weight: 500;
}
.search-field-wrap input::placeholder { color: var(--text-muted); font-weight: 400; }
.btn-search {
  background: linear-gradient(135deg, var(--primary), hsl(224, 80%, 46%));
  color: white; border: none;
  padding: 0 36px;
  border-radius: var(--r-lg);
  font-size: 1rem; font-weight: 700;
  display: flex; align-items: center; gap: 8px;
  white-space: nowrap;
  box-shadow: 0 4px 16px var(--primary-glow);
  transition: var(--t-spring);
}
.btn-search:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 24px var(--primary-glow); }
.btn-search:active { transform: translateY(0); }
.search-quick-tags { margin-top: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sq-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
.sq-tag {
  padding: 4px 12px; border-radius: var(--r-full);
  background: var(--bg-subtle); border: 1px solid var(--border);
  font-size: 0.78rem; font-weight: 600; color: var(--text-body);
  cursor: pointer; transition: var(--t-base);
}
.sq-tag:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }

/* ============================================================
   SECTION HEADERS
   ============================================================ */
.sec-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px;
}
.sec-title {
  font-size: 1.65rem; font-weight: 800;
  color: var(--text-heading); letter-spacing: -0.025em;
  display: flex; align-items: center; gap: 10px;
}
.sec-title::before {
  content: '';
  width: 4px; height: 26px;
  background: linear-gradient(180deg, var(--primary), var(--accent));
  border-radius: var(--r-full);
  flex-shrink: 0;
}
.rtl .sec-title::before { order: -1; }
.sec-link {
  font-size: 0.875rem; font-weight: 700;
  color: var(--primary);
  display: flex; align-items: center; gap: 4px;
}
.sec-link:hover { gap: 8px; }

/* ============================================================
   CATEGORIES
   ============================================================ */
.categories-sec { margin-bottom: 60px; }
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px;
}
.category-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--r-lg);
  padding: 24px 16px 20px;
  text-align: center;
  cursor: pointer;
  transition: var(--t-spring);
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  box-shadow: var(--shadow-xs);
  position: relative;
  overflow: hidden;
}
.category-card::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--primary-light), transparent 70%);
  opacity: 0; transition: var(--t-base);
}
.category-card:hover, .category-card.active { transform: translateY(-5px); border-color: var(--primary); box-shadow: var(--shadow-card-hover); }
.category-card:hover::before, .category-card.active::before { opacity: 1; }
.category-card.active { background: var(--primary); border-color: var(--primary); }
.category-card.active .category-name { color: white; }
.cat-emoji {
  font-size: 2.4rem; line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.1));
  transition: var(--t-spring);
}
.category-card:hover .cat-emoji { transform: scale(1.15) rotate(5deg); }
.category-name { font-weight: 700; font-size: 0.88rem; color: var(--text-heading); line-height: 1.3; position: relative; }
.category-count { font-size: 0.72rem; color: var(--text-muted); font-weight: 500; }

/* ============================================================
   TRANSIT & DISTRICT CHIPS
   ============================================================ */
.chips-section { margin-bottom: 44px; }
.chips-group { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.chip {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 18px;
  border-radius: var(--r-full);
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-body); font-size: 0.83rem; font-weight: 600;
  cursor: pointer; transition: var(--t-base);
  box-shadow: var(--shadow-xs);
}
.chip:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); transform: translateY(-1px); }
.chip.active { background: var(--primary); border-color: var(--primary); color: white; box-shadow: 0 4px 12px var(--primary-glow); }
.chip-icon { font-size: 1rem; }

/* District chips — smaller */
.chip-sm { padding: 6px 14px; font-size: 0.79rem; }

/* ============================================================
   MAIN LAYOUT
   ============================================================ */
.main-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  margin-bottom: 100px;
  align-items: start;
}

/* ============================================================
   SIDEBAR
   ============================================================ */
.filters-sidebar {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--r-lg);
  padding: 24px;
  position: sticky; top: 88px;
  box-shadow: var(--shadow-xs);
}
.filter-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 22px; padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.filter-main-title { font-weight: 800; color: var(--text-heading); font-size: 1rem; display: flex; align-items: center; gap: 8px; }
.filter-clear { font-size: 0.78rem; color: var(--primary); font-weight: 600; }
.filter-clear:hover { text-decoration: underline; }
.filter-group { margin-bottom: 22px; }
.filter-group-title { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; }
.filter-options { display: flex; flex-direction: column; gap: 8px; }
.filter-radio {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: var(--r-sm);
  cursor: pointer; transition: var(--t-base);
  font-size: 0.875rem; font-weight: 500; color: var(--text-body);
}
.filter-radio:hover { background: var(--bg-subtle); color: var(--primary); }
.filter-radio input { accent-color: var(--primary); width: 16px; height: 16px; }
.filter-radio.selected { background: var(--primary-light); color: var(--primary); font-weight: 600; }

/* ============================================================
   JOBS LIST
   ============================================================ */
.jobs-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.jobs-count {
  font-size: 0.9rem; font-weight: 600; color: var(--text-muted);
}
.jobs-count strong { color: var(--text-heading); font-size: 1.1rem; }
.jobs-sort {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.82rem; color: var(--text-muted);
}
.jobs-sort select {
  border: 1px solid var(--border); border-radius: var(--r-sm);
  padding: 4px 8px; font-size: 0.82rem; background: transparent;
  color: var(--text-body);
}

.jobs-list { display: flex; flex-direction: column; gap: 16px; }

/* ---- Job Card ---- */
.job-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--r-lg);
  padding: 22px 24px;
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 18px;
  transition: var(--t-base);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-xs);
  cursor: pointer;
}
.job-card::after {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: var(--primary); opacity: 0; transition: var(--t-base);
  border-radius: 0 var(--r-xs) var(--r-xs) 0;
}
.rtl .job-card::after { left: auto; right: 0; border-radius: var(--r-xs) 0 0 var(--r-xs); }
.job-card:hover {
  border-color: hsl(224, 80%, 80%);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-3px);
}
.job-card:hover::after { opacity: 1; }

.job-card.featured { border-color: var(--accent); background: linear-gradient(135deg, #fffbf0 0%, white 60%); }
.job-card.featured::after { background: var(--accent); opacity: 1; }

/* Company logo */
.co-logo {
  width: 64px; height: 64px;
  border-radius: var(--r-md);
  border: 1.5px solid var(--border);
  background: var(--bg-subtle);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; font-weight: 800; color: var(--primary);
  overflow: hidden; flex-shrink: 0;
  box-shadow: var(--shadow-xs);
}
.co-logo img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }

/* Job card body */
.job-body { min-width: 0; }
.job-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
.job-title-wrap { display: flex; align-items: center; gap: 10px; }
.job-card-title {
  font-size: 1.1rem; font-weight: 800; color: var(--text-heading);
  line-height: 1.3; letter-spacing: -0.015em;
  transition: var(--t-base);
}
.job-card-title:hover { color: var(--primary); }
.job-badge {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: var(--r-full);
  font-size: 0.72rem; font-weight: 700; white-space: nowrap;
}
.badge-featured { background: var(--accent-light); color: hsl(38, 90%, 36%); border: 1px solid hsla(38, 90%, 54%, .25); }
.badge-new { background: var(--success-light); color: var(--success); border: 1px solid hsla(152, 70%, 40%, .25); }
.btn-fav {
  background: transparent; border: none;
  color: var(--text-muted); font-size: 1.15rem;
  cursor: pointer; transition: var(--t-spring);
  padding: 4px; border-radius: var(--r-xs); flex-shrink: 0;
}
.btn-fav:hover { color: #f43f5e; transform: scale(1.15); }
.btn-fav.active { color: #f43f5e; }

.job-company { font-size: 0.875rem; font-weight: 600; color: var(--text-muted); margin-bottom: 12px; }
.job-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.jtag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: var(--r-full);
  font-size: 0.76rem; font-weight: 600;
}
.jtag-type { background: var(--primary-light); color: var(--primary); }
.jtag-loc { background: hsl(150, 50%, 95%); color: hsl(150, 50%, 28%); }
.jtag-lang { background: hsl(270, 50%, 95%); color: hsl(270, 50%, 40%); }
.jtag-remote { background: hsl(200, 60%, 95%); color: hsl(200, 60%, 32%); }

.job-footer {
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 14px; gap: 12px;
}
.job-meta { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.job-meta-item { display: flex; align-items: center; gap: 5px; font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
.job-meta-item i { color: var(--primary); font-size: 0.8rem; opacity: 0.7; }
.job-salary { font-weight: 700; color: var(--success); font-size: 0.875rem; }
.btn-apply {
  flex-shrink: 0;
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--primary-light); color: var(--primary);
  padding: 8px 20px; border-radius: var(--r-full);
  font-size: 0.83rem; font-weight: 700;
  border: 1.5px solid transparent;
  transition: var(--t-spring);
  white-space: nowrap;
}
.btn-apply:hover { background: var(--primary); color: white; box-shadow: 0 4px 14px var(--primary-glow); transform: translateY(-1px); }

/* empty state */
.jobs-empty {
  text-align: center; padding: 60px 24px;
  background: var(--bg-card); border-radius: var(--r-lg); border: 1.5px dashed var(--border);
}
.jobs-empty i { font-size: 3rem; color: var(--border-strong); margin-bottom: 16px; }
.jobs-empty p { font-weight: 600; color: var(--text-muted); margin-bottom: 12px; }
.jobs-empty a { color: var(--primary); font-weight: 700; text-decoration: underline; }

/* ============================================================
   JOB DETAIL PAGE
   ============================================================ */
.detail-breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.83rem; color: var(--text-muted); margin-bottom: 28px;
}
.detail-breadcrumb a { color: var(--primary); }
.detail-breadcrumb i { font-size: 0.65rem; }

.job-detail-layout { display: grid; grid-template-columns: 1fr 340px; gap: 32px; margin-bottom: 80px; align-items: start; }

.detail-main {
  background: var(--bg-card); border-radius: var(--r-xl);
  padding: 40px; border: 1.5px solid var(--border); box-shadow: var(--shadow-sm);
}
.detail-co-row { display: flex; align-items: center; gap: 18px; margin-bottom: 24px; }
.detail-co-logo {
  width: 76px; height: 76px; border-radius: var(--r-md); border: 1.5px solid var(--border);
  background: var(--bg-subtle); display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; font-weight: 800; color: var(--primary); overflow: hidden;
}
.detail-co-logo img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }
.detail-co-info { flex: 1; }
.detail-co-name { font-size: 1rem; font-weight: 700; color: var(--text-heading); }
.detail-co-cat { font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; }

.detail-title { font-size: 2rem; font-weight: 900; color: var(--text-heading); margin-bottom: 18px; line-height: 1.2; letter-spacing: -0.025em; }
.detail-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.detail-body { font-size: 1rem; line-height: 1.85; color: var(--text-body); }
.detail-body h3 { font-size: 1.2rem; font-weight: 800; color: var(--text-heading); margin: 28px 0 12px; }
.detail-body p { margin-bottom: 14px; }
.detail-body ul { margin: 0 0 20px 22px; }
.rtl .detail-body ul { margin: 0 22px 20px 0; }
.detail-body li { margin-bottom: 7px; }

.detail-sidebar { display: flex; flex-direction: column; gap: 22px; position: sticky; top: 88px; }
.sidebar-box { background: var(--bg-card); border-radius: var(--r-xl); padding: 28px; border: 1.5px solid var(--border); box-shadow: var(--shadow-xs); }
.sidebar-box-title { font-weight: 800; color: var(--text-heading); font-size: 1rem; margin-bottom: 18px; }
.apply-main-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 15px;
  background: linear-gradient(135deg, var(--primary), hsl(224, 80%, 46%));
  color: white; font-weight: 800; font-size: 1.05rem;
  border-radius: var(--r-lg); border: none;
  box-shadow: 0 6px 20px var(--primary-glow);
  transition: var(--t-spring);
}
.apply-main-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px var(--primary-glow); }

.job-info-list { display: flex; flex-direction: column; gap: 14px; }
.job-info-item { display: flex; gap: 14px; align-items: flex-start; }
.job-info-icon {
  width: 36px; height: 36px; border-radius: var(--r-sm); flex-shrink: 0;
  background: var(--primary-light); color: var(--primary);
  display: flex; align-items: center; justify-content: center; font-size: 0.9rem;
}
.job-info-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.job-info-value { font-weight: 700; color: var(--text-heading); font-size: 0.9rem; }

.share-row { display: flex; gap: 10px; }
.share-btn {
  flex: 1; height: 42px; border-radius: var(--r-md);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 1.1rem; transition: var(--t-base);
}
.share-btn:hover { transform: translateY(-2px) scale(1.05); }
.share-wa { background: #25D366; box-shadow: 0 4px 12px rgba(37,211,102,.3); }
.share-tg { background: #0088cc; box-shadow: 0 4px 12px rgba(0,136,204,.3); }
.share-tw { background: #1A8CD8; box-shadow: 0 4px 12px rgba(26,140,216,.3); }
.share-cp { background: var(--text-muted); box-shadow: 0 4px 12px rgba(0,0,0,.1); cursor: pointer; }

/* ============================================================
   FORM INPUTS
   ============================================================ */
.form-input {
  width: 100%; padding: 11px 15px;
  border: 1.5px solid var(--border); border-radius: var(--r-md);
  background: var(--bg-subtle); color: var(--text-heading);
  font-size: 0.9rem; transition: var(--t-base);
}
.form-input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 3px var(--primary-glow); }
.form-sec-title { font-size: 1rem; font-weight: 800; color: var(--text-heading); margin: 24px 0 12px; border-bottom: 2px solid var(--border); padding-bottom: 6px; }
.dynamic-group-box { background: var(--bg-subtle); border: 1.5px dashed var(--border); border-radius: var(--r-md); padding: 18px; margin-bottom: 12px; }

/* ============================================================
   FOOTER
   ============================================================ */
.site-footer {
  background: var(--secondary);
  color: rgba(255,255,255,0.65);
  padding: 72px 0 28px;
  margin-top: auto;
}
.footer-inner { display: flex; justify-content: space-between; gap: 56px; flex-wrap: wrap; margin-bottom: 56px; }
.footer-brand { max-width: 340px; }
.footer-brand .logo { color: white; margin-bottom: 16px; }
.footer-brand p { font-size: 0.875rem; line-height: 1.7; }
.footer-social { display: flex; gap: 10px; margin-top: 20px; }
.social-btn {
  width: 36px; height: 36px; border-radius: var(--r-sm);
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.7); font-size: 0.9rem;
  transition: var(--t-base);
}
.social-btn:hover { background: var(--primary); border-color: var(--primary); color: white; transform: translateY(-2px); }
.footer-links-group { display: flex; gap: 64px; flex-wrap: wrap; }
.footer-links { list-style: none; }
.footer-col-title { font-weight: 700; color: white; font-size: 0.9rem; margin-bottom: 18px; }
.footer-links li { margin-bottom: 10px; }
.footer-links a { font-size: 0.86rem; transition: var(--t-base); }
.footer-links a:hover { color: white; padding-inline-start: 4px; }
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.07);
  padding-top: 24px;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
  font-size: 0.82rem;
}

/* ============================================================
   DARK MODE
   ============================================================ */
body.dark-mode {
  --bg-base:    hsl(222, 28%, 7%);
  --bg-card:    hsl(222, 25%, 11%);
  --bg-subtle:  hsl(222, 22%, 16%);
  --border:     hsl(222, 20%, 20%);
  --border-strong: hsl(222, 18%, 28%);
  --text-heading: hsl(0, 0%, 96%);
  --text-body:    hsl(220, 12%, 72%);
  --text-muted:   hsl(220, 10%, 52%);
  --glass-bg:   rgba(16, 20, 34, 0.80);
  --glass-border: rgba(255,255,255,0.05);
  --primary-light: hsla(224, 80%, 54%, 0.15);
  --accent-light:  hsla(38, 94%, 54%, 0.13);
  --success-light: hsla(152, 70%, 40%, 0.13);
}
body.dark-mode .hero::after { background: var(--bg-base); }
body.dark-mode .site-footer { background: hsl(222, 30%, 5%); }

/* ============================================================
   ANIMATIONS
   ============================================================ */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
.animate-fadeup { animation: fadeUp 0.5s var(--ease-out) both; }
.animate-delay-1 { animation-delay: 0.08s; }
.animate-delay-2 { animation-delay: 0.16s; }
.animate-delay-3 { animation-delay: 0.24s; }

/* Skeleton shimmer */
.skeleton {
  background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--border) 50%, var(--bg-subtle) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--r-sm);
}

/* Live indicator */
.live-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--success);
  animation: pulse-dot 2s ease-in-out infinite;
  display: inline-block;
}

/* ============================================================
   MODALS
   ============================================================ */
.apply-modal {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(8px);
  z-index: 1000;
  justify-content: center; align-items: center; padding: 20px;
}
.apply-modal.open { display: flex; }
.apply-modal-content {
  background: var(--bg-card); border: 1.5px solid var(--border);
  border-radius: var(--r-xl); padding: 36px;
  max-width: 580px; width: 100%;
  position: relative; box-shadow: var(--shadow-xl);
  max-height: 90vh; overflow-y: auto;
  animation: fadeUp 0.3s var(--ease-out);
}
.modal-close {
  position: absolute; top: 18px; right: 20px;
  font-size: 1.4rem; cursor: pointer; color: var(--text-muted);
  width: 32px; height: 32px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  transition: var(--t-base);
}
.modal-close:hover { background: var(--bg-subtle); color: var(--text-heading); }

/* ============================================================
   MISC UTILS
   ============================================================ */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
}
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--primary); color: white;
  padding: 12px 28px; border-radius: var(--r-full);
  font-weight: 700; font-size: 0.95rem; border: none;
  transition: var(--t-spring); box-shadow: 0 4px 16px var(--primary-glow);
}
.btn-primary:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 8px 24px var(--primary-glow); }
.btn-outline {
  display: inline-flex; align-items: center; gap: 8px;
  border: 2px solid var(--border); color: var(--text-body);
  padding: 11px 24px; border-radius: var(--r-full);
  font-weight: 700; font-size: 0.9rem;
  transition: var(--t-base); background: transparent;
}
.btn-outline:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }

/* Resume builder */
.resume-builder-layout { display: grid; grid-template-columns: 1.1fr 1fr; gap: 32px; }
.builder-preview { position: sticky; top: 88px; height: calc(100vh - 110px); display: flex; flex-direction: column; }

.paper-cv-page {
  --cv-primary: #3b82f6; /* Default Blue */
  background: #fff;
  color: #1f2937;
  width: 100%;
  flex: 1;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 40px;
  overflow-y: auto;
  min-height: 842px;
  transition: all var(--t-base);
}

.theme-indigo .paper-cv-page { --cv-primary: #4f46e5; }
.theme-emerald .paper-cv-page { --cv-primary: #10b981; }
.theme-crimson .paper-cv-page { --cv-primary: #dc2626; }
.theme-slate .paper-cv-page { --cv-primary: #475569; }

.rtl .paper-cv-page { direction: rtl; }

/* Template 1: Modern Minimalist */
.tpl-minimal .cv-header { border-bottom: 2px solid var(--cv-primary); padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
.tpl-minimal .cv-header h1 { font-size: 1.9rem; font-weight: 900; color: #111827; margin-bottom: 4px; }
.tpl-minimal .cv-header h2 { font-size: 1.15rem; font-weight: 700; color: var(--cv-primary); text-transform: uppercase; letter-spacing: 0.05em; }
.tpl-minimal .cv-contact { display: flex; justify-content: center; gap: 20px; font-size: 0.85rem; color: #4b5563; margin-top: 8px; }
.tpl-minimal .cv-sec-title { font-size: 1.05rem; font-weight: 800; color: var(--cv-primary); border-bottom: 1.5px solid var(--border); padding-bottom: 4px; margin: 24px 0 12px; text-transform: uppercase; }

/* Template 2: Professional Sidebar */
.tpl-sidebar { padding: 0 !important; display: flex !important; flex-direction: row !important; align-items: stretch; min-height: 842px; }
.tpl-sidebar .cv-sidebar { width: 32%; background: #f9fafb; border-right: 1px solid var(--border); padding: 36px 20px; box-sizing: border-box; }
.rtl .tpl-sidebar .cv-sidebar { border-right: none; border-left: 1px solid var(--border); }
.tpl-sidebar .cv-main { width: 68%; padding: 36px 28px; box-sizing: border-box; }
.tpl-sidebar .cv-header { text-align: left; border-bottom: none; padding-bottom: 0; margin-bottom: 20px; }
.rtl .tpl-sidebar .cv-header { text-align: right; }
.tpl-sidebar .cv-header h1 { font-size: 1.7rem; font-weight: 800; color: #111827; margin-bottom: 2px; }
.tpl-sidebar .cv-header h2 { font-size: 1.05rem; font-weight: 700; color: var(--cv-primary); }
.tpl-sidebar .cv-contact { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; margin-top: 16px; font-size: 0.8rem; color: #4b5563; }
.rtl .tpl-sidebar .cv-contact { align-items: flex-start; }
.tpl-sidebar .cv-sec-title { font-size: 0.95rem; font-weight: 800; color: #111827; border-bottom: 2px solid var(--cv-primary); padding-bottom: 4px; margin: 20px 0 10px; text-transform: uppercase; }

/* Template 3: Executive Classic */
.tpl-classic { font-family: 'Georgia', 'Garamond', serif !important; padding: 44px; }
.tpl-classic .cv-header { text-align: center; border-bottom: 1px solid #1f2937; padding-bottom: 12px; margin-bottom: 20px; }
.tpl-classic .cv-header h1 { font-size: 2.1rem; font-weight: 500; color: #000; font-family: 'Georgia', 'Garamond', serif !important; margin-bottom: 4px; }
.tpl-classic .cv-header h2 { font-size: 1.15rem; font-style: italic; color: #4b5563; font-weight: 500; font-family: 'Georgia', 'Garamond', serif !important; }
.tpl-classic .cv-contact { display: flex; justify-content: center; gap: 20px; font-size: 0.85rem; color: #4b5563; margin-top: 8px; }
.tpl-classic .cv-sec-title { font-size: 1rem; font-weight: 700; color: #000; border-bottom: 1px double #4b5563; padding-bottom: 2px; margin: 20px 0 10px; text-align: center; text-transform: uppercase; font-family: 'Georgia', 'Garamond', serif !important; }
.tpl-classic .cv-item { font-family: 'Georgia', 'Garamond', serif !important; }

.cv-item { font-size: 0.9rem; line-height: 1.5; }
.district-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
.district-card {
  background: var(--bg-card); border: 1.5px solid var(--border);
  padding: 10px 8px; border-radius: var(--r-sm); text-align: center;
  font-weight: 700; font-size: 0.85rem; color: var(--text-heading);
  cursor: pointer; transition: var(--t-base);
}
.district-card:hover, .district-card.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 12px var(--primary-glow); }
.hero-title-gradient { background: linear-gradient(135deg, var(--text-heading), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1024px) {
  .main-layout { grid-template-columns: 1fr; }
  .filters-sidebar { position: static; margin-bottom: 24px; }
  .job-detail-layout { grid-template-columns: 1fr; }
  .detail-sidebar { position: static; }
  .resume-builder-layout { grid-template-columns: 1fr; }
  .builder-preview { position: static; height: auto; margin-top: 32px; }
}
@media (max-width: 768px) {
  .nav-links { display: none; }
  .lang-btn { display: none; }
  #dark-mode-toggle { display: none; }
  .logo-text strong { font-size: 0.95rem; }
  .logo-text span { font-size: 0.65rem; }
  .hero { padding: 72px 0 110px; }
  .hero-title { font-size: 2.2rem; }
  .hero-stats { gap: 20px; }
  .search-card { flex-direction: column; gap: 10px; }
  .btn-search { padding: 16px; border-radius: var(--r-lg); justify-content: center; }
  .categories-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
  .job-card { grid-template-columns: 1fr; }
  .co-logo { display: none; }
  .job-footer { flex-direction: column; align-items: flex-start; gap: 12px; }
  .btn-apply { width: 100%; justify-content: center; }
  .detail-main { padding: 24px; }
  .container { padding: 0 16px; }
}
@media (max-width: 480px) {
  .hero-stats { display: none; }
  .hero-title { font-size: 1.7rem; }
  .hero-subtitle { font-size: 0.95rem; margin-bottom: 24px; }
  .hero { padding: 48px 0 80px; }
  .footer-inner { flex-direction: column; gap: 36px; }
  .footer-links-group { gap: 36px; }
}

/* ============================================================
   PRINT (CV Builder)
   ============================================================ */
@media print {
  body { background: #fff !important; color: #000 !important; }
  .site-header, .site-footer, .builder-inputs { display: none !important; }
  .container { padding: 0 !important; max-width: 100% !important; }
  .resume-builder-layout { display: block !important; }
  .builder-preview { position: static !important; height: auto !important; }
  .paper-cv-page { border: none !important; box-shadow: none !important; overflow: visible !important; }
  @page { size: A4; margin: 1.5cm; }
}
`;
