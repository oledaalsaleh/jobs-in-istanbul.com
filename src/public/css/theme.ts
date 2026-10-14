export const themeCss = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

:root {
  --font-en: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-ar: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Modern 2026 Color Palette */
  --primary:         hsl(221, 83%, 53%);
  --primary-hover:   hsl(224, 76%, 46%);
  --primary-dark:    hsl(226, 71%, 38%);
  --primary-light:   hsl(220, 100%, 97%);
  --primary-glow:    hsla(221, 83%, 53%, 0.28);

  --secondary:       hsl(222, 47%, 10%);
  --secondary-mid:   hsl(222, 40%, 14%);
  --secondary-lite:  hsl(217, 33%, 20%);

  --accent:          hsl(38, 96%, 53%);
  --accent-hover:    hsl(38, 94%, 44%);
  --accent-light:    hsl(48, 100%, 96%);
  --accent-glow:     hsla(38, 96%, 53%, 0.25);

  --success:         hsl(158, 64%, 42%);
  --success-light:   hsl(152, 70%, 96%);
  --danger:          hsl(350, 89%, 60%);
  --danger-light:    hsl(350, 100%, 97%);
  --info:            hsl(199, 89%, 48%);
  --info-light:      hsl(199, 100%, 96%);
  --purple:          hsl(258, 90%, 66%);
  --purple-light:    hsl(258, 100%, 97%);

  /* Surface Colors - Light */
  --bg-base:         hsl(210, 40%, 98%);
  --bg-card:         #ffffff;
  --bg-subtle:       hsl(214, 32%, 96%);
  --bg-hover:        hsl(214, 32%, 93%);
  --border:          hsl(214, 32%, 91%);
  --border-strong:   hsl(215, 25%, 82%);

  /* Typography */
  --text-heading:    hsl(222, 47%, 11%);
  --text-body:       hsl(215, 25%, 32%);
  --text-muted:      hsl(215, 16%, 52%);
  --text-white:      hsl(0, 0%, 100%);

  /* Backward Compatibility Aliases */
  --text-dark:       var(--text-heading);
  --text-main:       var(--text-body);
  --text-light:      var(--text-muted);
  --primary-color:   var(--primary);
  --border-color:    var(--border);
  --card-bg:         var(--bg-card);
  --bg-light:        var(--bg-subtle);
  --bg-main:         var(--bg-base);

  /* Shadows - Modern Multi-stop */
  --shadow-xs:       0 1px 2px 0 rgba(15, 23, 42, 0.05);
  --shadow-sm:       0 2px 6px -1px rgba(15, 23, 42, 0.06), 0 1px 3px -1px rgba(15, 23, 42, 0.04);
  --shadow-md:       0 6px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
  --shadow-lg:       0 16px 32px -4px rgba(15, 23, 42, 0.08), 0 6px 12px -2px rgba(15, 23, 42, 0.04);
  --shadow-xl:       0 24px 50px -12px rgba(15, 23, 42, 0.16);
  --shadow-glow:     0 0 28px var(--primary-glow);
  --shadow-card-hover: 0 20px 40px -8px rgba(37, 99, 235, 0.14), 0 6px 16px -4px rgba(15, 23, 42, 0.05);

  /* Glassmorphism */
  --glass-bg:        rgba(255, 255, 255, 0.82);
  --glass-border:    rgba(226, 232, 240, 0.8);
  --glass-blur:      blur(20px) saturate(180%);

  /* Radius */
  --r-xs:            6px;
  --r-sm:            10px;
  --r-md:            16px;
  --r-lg:            22px;
  --r-xl:            30px;
  --r-2xl:           42px;
  --r-full:          9999px;

  --radius-sm:       var(--r-sm);
  --radius-md:       var(--r-md);
  --radius-lg:       var(--r-lg);
  --radius-xl:       var(--r-xl);

  /* Transitions */
  --ease-out:        cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);
  --t-fast:          all 0.15s var(--ease-out);
  --t-base:          all 0.25s var(--ease-out);
  --t-slow:          all 0.40s var(--ease-out);
  --t-spring:        all 0.30s var(--ease-spring);
}

/* ============================================================
   RESET & BASE
   ============================================================ */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
}

body {
  font-family: var(--font-en);
  background: var(--bg-base);
  color: var(--text-body);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  text-rendering: optimizeLegibility;
}

body.rtl {
  font-family: var(--font-ar);
  direction: rtl;
}

.page-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
  transition: var(--t-base);
}

img, svg {
  max-width: 100%;
  display: block;
}

button, input, select, textarea {
  font-family: inherit;
  outline: none;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}

*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
  border-radius: 6px;
}

/* Container */
.container {
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }
}

main {
  flex: 1;
}

/* ============================================================
   HEADER & NAVBAR
   ============================================================ */
.site-header {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 500;
  height: 72px;
  display: flex;
  align-items: center;
  transition: var(--t-base);
}

.site-header.scrolled {
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow-sm);
  border-bottom-color: var(--border);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
}

/* Brand Logo */
.logo {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-heading);
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: -0.02em;
  flex-shrink: 0;
  text-decoration: none;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--primary) 0%, hsl(260, 84%, 58%) 100%);
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.15rem;
  box-shadow: 0 4px 14px var(--primary-glow);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition: var(--t-spring);
}

.logo-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.28), transparent);
  border-radius: var(--r-md) var(--r-md) 0 0;
}

.logo:hover .logo-icon {
  transform: scale(1.05) rotate(-3deg);
  box-shadow: 0 6px 18px var(--primary-glow);
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.logo-text strong {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-heading);
  white-space: nowrap;
  letter-spacing: -0.015em;
}

.logo-text span {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* Desktop Nav Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
}

.nav-link {
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--text-body);
  padding: 8px 14px;
  border-radius: var(--r-full);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  transition: var(--t-fast);
}

.nav-link:hover {
  color: var(--primary);
  background: var(--primary-light);
}

.nav-link.active {
  color: var(--primary);
  background: var(--primary-light);
  font-weight: 700;
}

/* Nav CTA */
.nav-cta {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%) !important;
  color: white !important;
  padding: 8px 18px !important;
  border-radius: var(--r-full) !important;
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 14px var(--primary-glow) !important;
}

.nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px var(--primary-glow) !important;
}

/* Dropdown Menu */
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
  box-shadow: var(--shadow-xl);
  min-width: 260px;
  padding: 8px;
  z-index: 1000;
  margin-top: 6px;
  animation: dropdownFade 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-dropdown:hover .nav-dropdown-menu {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--r-sm);
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-body);
  transition: var(--t-fast);
}

.dropdown-item:hover {
  background: var(--primary-light);
  color: var(--primary);
  padding-inline-start: 17px;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translate(-50%, 8px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-body);
  border: 1px solid var(--border);
  background: var(--bg-card);
  transition: var(--t-base);
  position: relative;
  font-size: 0.95rem;
}

.icon-btn:hover {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.icon-btn .badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: var(--danger);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-card);
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: var(--r-full);
  font-size: 0.82rem;
  font-weight: 700;
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-heading);
  transition: var(--t-base);
}

.lang-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

/* ============================================================
   HERO — Tech-Forward Atmospheric Design
   ============================================================ */
.hero {
  position: relative;
  overflow: hidden;
  background: var(--secondary);
  padding: 88px 0 110px;
  text-align: center;
  color: white;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 75% 55% at 50% -10%, hsla(221, 83%, 55%, 0.38), transparent 75%),
    radial-gradient(ellipse 60% 45% at 85% 70%, hsla(260, 80%, 60%, 0.22), transparent 70%),
    radial-gradient(ellipse 55% 55% at 15% 85%, hsla(38, 96%, 53%, 0.15), transparent 65%);
}

.hero-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(ellipse 85% 75% at 50% 45%, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 85% 75% at 50% 45%, black 40%, transparent 100%);
}

.hero::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(180deg, transparent 0%, var(--bg-base) 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 10;
}

/* Hero Eyebrow Live Badge */
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.95);
  padding: 7px 18px;
  border-radius: var(--r-full);
  font-size: 0.84rem;
  font-weight: 700;
  margin-bottom: 22px;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.hero-title {
  font-size: clamp(2.4rem, 5.5vw, 3.8rem);
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.15;
  margin-bottom: 20px;
  color: #ffffff;
}

.hero-title .gradient-word {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fef08a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.hero-subtitle {
  font-size: 1.12rem;
  color: rgba(255, 255, 255, 0.72);
  max-width: 650px;
  margin: 0 auto 36px;
  font-weight: 400;
  line-height: 1.7;
}

/* Stats Row */
.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 40px;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--r-lg);
  padding: 14px 28px;
  min-width: 140px;
  transition: var(--t-base);
}

.hero-stat:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.22);
}

.hero-stat-value {
  font-size: 1.85rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.hero-stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 600;
  margin-top: 2px;
}

.hero-stat-divider {
  display: none;
}

/* ============================================================
   SEARCH BOX — Modern Omnibar
   ============================================================ */
.search-section {
  margin-top: -38px;
  position: relative;
  z-index: 40;
  margin-bottom: 48px;
}

.search-card {
  background: var(--bg-card);
  border-radius: var(--r-xl);
  box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(226, 232, 240, 0.9);
  padding: 14px;
  display: flex;
  align-items: stretch;
  gap: 12px;
  transition: var(--t-base);
}

.search-field-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 18px;
  border-radius: var(--r-lg);
  background: var(--bg-subtle);
  border: 1.5px solid transparent;
  min-height: 56px;
  transition: var(--t-base);
}

.search-field-wrap:focus-within {
  border-color: var(--primary);
  background: #ffffff;
  box-shadow: 0 0 0 4px var(--primary-glow);
}

.search-field-wrap .s-icon {
  color: var(--primary);
  font-size: 1.15rem;
  flex-shrink: 0;
}

.search-field-wrap input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-heading);
  font-weight: 600;
}

.search-field-wrap input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.search-district-wrap {
  flex: 0 0 250px;
}

.search-district-wrap select {
  font-family: inherit;
  font-size: 0.92rem;
  color: var(--text-heading);
  font-weight: 600;
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
}

.search-district-wrap select option {
  background: var(--bg-card);
  color: var(--text-heading);
}

.btn-search {
  background: linear-gradient(135deg, var(--primary) 0%, hsl(224, 76%, 45%) 100%);
  color: white;
  border: none;
  padding: 0 36px;
  border-radius: var(--r-lg);
  font-size: 1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  box-shadow: 0 4px 16px var(--primary-glow);
  transition: var(--t-spring);
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--primary-glow);
  filter: brightness(1.05);
}

.btn-search:active {
  transform: translateY(0);
}

.search-quick-tags {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sq-label {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 600;
}

.sq-tag {
  padding: 5px 14px;
  border-radius: var(--r-full);
  background: var(--bg-card);
  border: 1px solid var(--border);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-body);
  cursor: pointer;
  transition: var(--t-base);
  box-shadow: var(--shadow-xs);
}

.sq-tag:hover {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}

/* ============================================================
   COLLAPSIBLE EXPLORER MODULES (Categories, Districts, Tools)
   ============================================================ */
#categories-toggle-btn,
#districts-toggle-btn,
#tools-toggle-btn {
  background: var(--bg-card) !important;
  border: 1.5px solid var(--border) !important;
  border-radius: var(--r-lg) !important;
  padding: 16px 22px !important;
  transition: var(--t-base) !important;
  box-shadow: var(--shadow-xs) !important;
}

#categories-toggle-btn:hover,
#districts-toggle-btn:hover,
#tools-toggle-btn:hover {
  border-color: var(--primary) !important;
  box-shadow: var(--shadow-md) !important;
  transform: translateY(-1px);
}

/* Categories Grid */
.categories-sec {
  margin-bottom: 28px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));
  gap: 14px;
}

.category-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--r-lg);
  padding: 22px 14px 18px;
  text-align: center;
  cursor: pointer;
  transition: var(--t-spring);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-xs);
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary-light) 0%, transparent 80%);
  opacity: 0;
  transition: var(--t-base);
}

.category-card:hover,
.category-card.active {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: var(--shadow-card-hover);
}

.category-card:hover::before,
.category-card.active::before {
  opacity: 1;
}

.category-card.active {
  background: var(--primary);
  border-color: var(--primary);
}

.category-card.active .category-name {
  color: white;
}

.cat-emoji {
  font-size: 2.2rem;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.08));
  transition: var(--t-spring);
}

.category-card:hover .cat-emoji {
  transform: scale(1.15) rotate(4deg);
}

.category-name {
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--text-heading);
  line-height: 1.35;
  position: relative;
}

/* ============================================================
   TRANSIT & DISTRICT CHIPS
   ============================================================ */
.chips-section {
  margin-bottom: 32px;
}

.chips-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: var(--r-full);
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-body);
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--t-base);
  box-shadow: var(--shadow-xs);
}

.chip:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
  transform: translateY(-1px);
}

.chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.chip-icon {
  font-size: 1rem;
}

/* District Grid */
.district-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}

.district-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  padding: 11px 10px;
  border-radius: var(--r-md);
  text-align: center;
  font-weight: 700;
  font-size: 0.84rem;
  color: var(--text-heading);
  cursor: pointer;
  transition: var(--t-base);
  box-shadow: var(--shadow-xs);
}

.district-card:hover,
.district-card.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 4px 14px var(--primary-glow);
  transform: translateY(-1px);
}

/* ============================================================
   MAIN LAYOUT & SIDEBAR
   ============================================================ */
.main-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  margin-bottom: 96px;
  align-items: start;
}

.filters-sidebar {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--r-xl);
  padding: 24px;
  position: sticky;
  top: 92px;
  box-shadow: var(--shadow-xs);
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.filter-main-title {
  font-weight: 800;
  color: var(--text-heading);
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-clear {
  font-size: 0.8rem;
  color: var(--primary);
  font-weight: 700;
}

.filter-clear:hover {
  text-decoration: underline;
}

.filter-group {
  margin-bottom: 22px;
}

.filter-group-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-radio {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: var(--t-base);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-body);
  border: 1px solid transparent;
}

.filter-radio:hover {
  background: var(--bg-subtle);
  color: var(--primary);
}

.filter-radio input {
  accent-color: var(--primary);
  width: 17px;
  height: 17px;
}

.filter-radio.selected {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 700;
  border-color: hsla(221, 83%, 53%, 0.2);
}

/* ============================================================
   JOBS LIST & JOB CARDS
   ============================================================ */
.jobs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}

.jobs-count {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
}

.jobs-count strong {
  color: var(--text-heading);
  font-size: 1.15rem;
  font-weight: 900;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Job Card */
.job-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--r-xl);
  padding: 24px;
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 20px;
  transition: var(--t-base);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-xs);
  cursor: pointer;
}

.job-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary);
  opacity: 0;
  transition: var(--t-base);
  border-radius: 0 var(--r-xs) var(--r-xs) 0;
}

.rtl .job-card::before {
  left: auto;
  right: 0;
  border-radius: var(--r-xs) 0 0 var(--r-xs);
}

.job-card:hover {
  border-color: hsla(221, 83%, 53%, 0.35);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-3px);
}

.job-card:hover::before {
  opacity: 1;
}

.job-card.featured {
  border-color: hsla(38, 96%, 53%, 0.4);
  background: linear-gradient(135deg, #fffcf5 0%, #ffffff 60%);
}

.job-card.featured::before {
  background: var(--accent);
  opacity: 1;
}

/* Company Logo Squircle */
.co-logo {
  width: 64px;
  height: 64px;
  border-radius: var(--r-md);
  border: 1.5px solid var(--border);
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--primary);
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: var(--shadow-xs);
  transition: var(--t-base);
}

.job-card:hover .co-logo {
  transform: scale(1.04);
}

.co-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
}

/* Job Body */
.job-body {
  min-width: 0;
}

.job-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 4px;
}

.job-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.job-card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-heading);
  line-height: 1.35;
  letter-spacing: -0.015em;
  transition: var(--t-fast);
}

.job-card-title:hover {
  color: var(--primary);
}

.job-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 11px;
  border-radius: var(--r-full);
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge-featured {
  background: var(--accent-light);
  color: hsl(38, 90%, 34%);
  border: 1px solid hsla(38, 90%, 54%, 0.3);
}

.badge-new {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid hsla(158, 64%, 42%, 0.25);
}

.btn-fav {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
  transition: var(--t-spring);
  padding: 6px;
  border-radius: var(--r-full);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-fav:hover {
  color: var(--danger);
  transform: scale(1.18);
  background: var(--danger-light);
}

.btn-fav.active {
  color: var(--danger);
}

.job-company {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.jtag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--r-full);
  font-size: 0.78rem;
  font-weight: 700;
}

.jtag-type {
  background: var(--primary-light);
  color: var(--primary);
}

.jtag-loc {
  background: rgba(14, 165, 233, 0.09);
  color: #0284c7;
}

.jtag-lang {
  background: rgba(139, 92, 246, 0.09);
  color: #7c3aed;
}

.jtag-remote {
  background: rgba(16, 185, 129, 0.09);
  color: #059669;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 14px;
  gap: 12px;
}

.job-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.job-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 600;
}

.job-salary {
  font-weight: 800;
  color: var(--success);
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-apply {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: white;
  padding: 9px 22px;
  border-radius: var(--r-full);
  font-size: 0.85rem;
  font-weight: 800;
  border: none;
  transition: var(--t-spring);
  white-space: nowrap;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.btn-apply:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px var(--primary-glow);
}

/* Empty State */
.jobs-empty {
  text-align: center;
  padding: 72px 24px;
  background: var(--bg-card);
  border-radius: var(--r-xl);
  border: 1.5px dashed var(--border);
}

.jobs-empty i {
  font-size: 3.2rem;
  color: var(--border-strong);
  margin-bottom: 16px;
}

.jobs-empty p {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.jobs-empty a {
  color: var(--primary);
  font-weight: 800;
  text-decoration: underline;
}

/* ============================================================
   JOB DETAIL PAGE
   ============================================================ */
.detail-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--text-muted);
  margin-bottom: 28px;
}

.detail-breadcrumb a {
  color: var(--primary);
  font-weight: 600;
}

.detail-breadcrumb i {
  font-size: 0.65rem;
  opacity: 0.6;
}

.job-detail-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  margin-bottom: 80px;
  align-items: start;
}

.detail-main {
  background: var(--bg-card);
  border-radius: var(--r-xl);
  padding: 40px;
  border: 1.5px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.detail-co-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.detail-co-logo {
  width: 76px;
  height: 76px;
  border-radius: var(--r-lg);
  border: 1.5px solid var(--border);
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary);
  overflow: hidden;
}

.detail-co-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.detail-co-info {
  flex: 1;
}

.detail-co-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-heading);
}

.detail-co-cat {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.detail-title {
  font-size: 2.1rem;
  font-weight: 900;
  color: var(--text-heading);
  margin-bottom: 18px;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.detail-body {
  font-size: 1.02rem;
  line-height: 1.85;
  color: var(--text-body);
}

.detail-body h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-heading);
  margin: 32px 0 14px;
}

.detail-body p {
  margin-bottom: 16px;
}

.detail-body ul {
  margin: 0 0 24px 24px;
}

.rtl .detail-body ul {
  margin: 0 24px 24px 0;
}

.detail-body li {
  margin-bottom: 8px;
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 22px;
  position: sticky;
  top: 92px;
}

.sidebar-box {
  background: var(--bg-card);
  border-radius: var(--r-xl);
  padding: 28px;
  border: 1.5px solid var(--border);
  box-shadow: var(--shadow-xs);
}

.sidebar-box-title {
  font-weight: 800;
  color: var(--text-heading);
  font-size: 1.05rem;
  margin-bottom: 18px;
}

.apply-main-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--primary) 0%, hsl(224, 76%, 45%) 100%);
  color: white;
  font-weight: 800;
  font-size: 1.05rem;
  border-radius: var(--r-lg);
  border: none;
  box-shadow: 0 6px 22px var(--primary-glow);
  transition: var(--t-spring);
}

.apply-main-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px var(--primary-glow);
}

.job-info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.job-info-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.job-info-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--r-md);
  flex-shrink: 0;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
}

.job-info-label {
  font-size: 0.76rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.job-info-value {
  font-weight: 800;
  color: var(--text-heading);
  font-size: 0.94rem;
}

.share-row {
  display: flex;
  gap: 10px;
}

.share-btn {
  flex: 1;
  height: 44px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.15rem;
  transition: var(--t-base);
}

.share-btn:hover {
  transform: translateY(-2px) scale(1.05);
}

.share-wa { background: #25D366; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35); }
.share-tg { background: #0088cc; box-shadow: 0 4px 14px rgba(0, 136, 204, 0.35); }
.share-tw { background: #1A8CD8; box-shadow: 0 4px 14px rgba(26, 140, 216, 0.35); }
.share-cp { background: var(--text-muted); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1); cursor: pointer; }

/* ============================================================
   FORMS & INPUTS
   ============================================================ */
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--border);
  border-radius: var(--r-md);
  background: var(--bg-subtle);
  color: var(--text-heading);
  font-size: 0.92rem;
  font-weight: 500;
  transition: var(--t-base);
}

.form-input:focus {
  border-color: var(--primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.form-sec-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-heading);
  margin: 24px 0 14px;
  border-bottom: 2px solid var(--border);
  padding-bottom: 8px;
}

.dynamic-group-box {
  background: var(--bg-subtle);
  border: 1.5px dashed var(--border);
  border-radius: var(--r-lg);
  padding: 20px;
  margin-bottom: 14px;
}

/* ============================================================
   FOOTER
   ============================================================ */
.site-footer {
  background: var(--secondary);
  color: rgba(255, 255, 255, 0.7);
  padding: 80px 0 32px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 56px;
  flex-wrap: wrap;
  margin-bottom: 56px;
}

.footer-brand {
  max-width: 360px;
}

.footer-brand .logo {
  color: white;
  margin-bottom: 18px;
}

.footer-brand p {
  font-size: 0.88rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.65);
}

.footer-social {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--r-md);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
  transition: var(--t-base);
}

.social-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px var(--primary-glow);
}

.footer-links-group {
  display: flex;
  gap: 64px;
  flex-wrap: wrap;
}

.footer-links {
  list-style: none;
}

.footer-col-title {
  font-weight: 800;
  color: #ffffff;
  font-size: 0.92rem;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.65);
  transition: var(--t-fast);
}

.footer-links a:hover {
  color: #ffffff;
  padding-inline-start: 4px;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.5);
}

/* ============================================================
   DARK MODE
   ============================================================ */
body.dark-mode {
  --bg-base:        hsl(224, 71%, 4%);
  --bg-card:        hsl(222, 47%, 9%);
  --bg-subtle:      hsl(217, 33%, 14%);
  --bg-hover:       hsl(217, 33%, 18%);
  --border:         rgba(255, 255, 255, 0.08);
  --border-strong:  rgba(255, 255, 255, 0.16);

  --text-heading:   hsl(210, 40%, 98%);
  --text-body:      hsl(215, 20%, 75%);
  --text-muted:     hsl(215, 16%, 52%);

  --glass-bg:       rgba(11, 15, 25, 0.85);
  --glass-border:   rgba(255, 255, 255, 0.08);

  --primary-light:  hsla(221, 83%, 53%, 0.16);
  --accent-light:   hsla(38, 96%, 53%, 0.14);
  --success-light:  hsla(158, 64%, 42%, 0.14);
  --danger-light:   hsla(350, 89%, 60%, 0.14);
}

body.dark-mode .site-header.scrolled {
  background: rgba(11, 15, 25, 0.96);
  border-bottom-color: var(--border);
}

body.dark-mode .hero::after {
  background: linear-gradient(180deg, transparent 0%, var(--bg-base) 100%);
}

body.dark-mode .job-card.featured {
  background: linear-gradient(135deg, hsl(222, 47%, 11%) 0%, hsl(222, 47%, 9%) 100%);
}

body.dark-mode .site-footer {
  background: hsl(224, 71%, 3%);
}

body.dark-mode .search-card {
  background: hsl(222, 47%, 10%);
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

body.dark-mode .search-field-wrap {
  background: hsl(217, 33%, 14%);
}

body.dark-mode .search-field-wrap:focus-within {
  background: hsl(217, 33%, 18%);
}

body.dark-mode .search-district-wrap select option {
  background: hsl(222, 47%, 10%);
  color: #ffffff;
}

body.dark-mode .sq-tag {
  background: hsl(217, 33%, 13%);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-body);
}

body.dark-mode .sq-tag:hover {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
}

body.dark-mode .nav-dropdown-menu {
  background: hsl(222, 47%, 10%);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
}

body.dark-mode .dropdown-item {
  color: var(--text-heading);
}

body.dark-mode .dropdown-item:hover {
  background: var(--primary-light);
  color: var(--primary);
}

body.dark-mode .nav-link {
  color: var(--text-heading);
}

body.dark-mode .lang-btn {
  background: hsl(222, 47%, 10%);
  border-color: rgba(255, 255, 255, 0.1);
}

body.dark-mode .icon-btn {
  background: hsl(222, 47%, 10%);
  border-color: rgba(255, 255, 255, 0.1);
}

body.dark-mode .filter-group {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

body.dark-mode .anti-scam-banner {
  background: rgba(239, 68, 68, 0.12) !important;
  border-color: rgba(239, 68, 68, 0.35) !important;
}

body.dark-mode .anti-scam-banner * {
  color: #fca5a5 !important;
}

/* ============================================================
   ANIMATIONS & MICRO-INTERACTIONS
   ============================================================ */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.4); opacity: 0.6; }
}

@keyframes heartPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.35); }
  100% { transform: scale(1); }
}

.animate-fadeup { animation: fadeUp 0.5s var(--ease-out) both; }
.animate-delay-1 { animation-delay: 0.08s; }
.animate-delay-2 { animation-delay: 0.16s; }
.animate-delay-3 { animation-delay: 0.24s; }

.skeleton {
  background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--border) 50%, var(--bg-subtle) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--r-sm);
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulseLive 2s infinite;
  display: inline-block;
}

@keyframes pulseLive {
  0%   { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70%  { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* ============================================================
   MODALS
   ============================================================ */
.apply-modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.apply-modal.open {
  display: flex;
}

.apply-modal-content {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--r-xl);
  padding: 36px;
  max-width: 580px;
  width: 100%;
  position: relative;
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeUp 0.3s var(--ease-out);
}

.modal-close {
  position: absolute;
  top: 18px;
  right: 20px;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--text-muted);
  width: 34px;
  height: 34px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--t-base);
}

.modal-close:hover {
  background: var(--bg-subtle);
  color: var(--text-heading);
}

/* ============================================================
   MISC UTILS & BUTTONS
   ============================================================ */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: white;
  padding: 12px 28px;
  border-radius: var(--r-full);
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  transition: var(--t-spring);
  box-shadow: 0 4px 16px var(--primary-glow);
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--primary-glow);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 2px solid var(--border);
  color: var(--text-heading);
  padding: 11px 24px;
  border-radius: var(--r-full);
  font-weight: 700;
  font-size: 0.9rem;
  transition: var(--t-base);
  background: transparent;
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.hero-title-gradient {
  background: linear-gradient(135deg, var(--text-heading), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Resume Builder Paper CV styles */
.resume-builder-layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 32px;
}

.builder-preview {
  position: sticky;
  top: 88px;
  height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
}

.paper-cv-page {
  --cv-primary: #3b82f6;
  background: #ffffff;
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

.tpl-minimal .cv-header {
  border-bottom: 2px solid var(--cv-primary);
  padding-bottom: 16px;
  margin-bottom: 24px;
  text-align: center;
}

.tpl-minimal .cv-header h1 { font-size: 1.9rem; font-weight: 900; color: #111827; margin-bottom: 4px; }
.tpl-minimal .cv-header h2 { font-size: 1.15rem; font-weight: 700; color: var(--cv-primary); text-transform: uppercase; letter-spacing: 0.05em; }
.tpl-minimal .cv-contact { display: flex; justify-content: center; gap: 20px; font-size: 0.85rem; color: #4b5563; margin-top: 8px; }
.tpl-minimal .cv-sec-title { font-size: 1.05rem; font-weight: 800; color: var(--cv-primary); border-bottom: 1.5px solid var(--border); padding-bottom: 4px; margin: 24px 0 12px; text-transform: uppercase; }

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

.tpl-classic { font-family: 'Georgia', 'Garamond', serif !important; padding: 44px; }
.tpl-classic .cv-header { text-align: center; border-bottom: 1px solid #1f2937; padding-bottom: 12px; margin-bottom: 20px; }
.tpl-classic .cv-header h1 { font-size: 2.1rem; font-weight: 500; color: #000; font-family: 'Georgia', 'Garamond', serif !important; margin-bottom: 4px; }
.tpl-classic .cv-header h2 { font-size: 1.15rem; font-style: italic; color: #4b5563; font-weight: 500; font-family: 'Georgia', 'Garamond', serif !important; }
.tpl-classic .cv-contact { display: flex; justify-content: center; gap: 20px; font-size: 0.85rem; color: #4b5563; margin-top: 8px; }
.tpl-classic .cv-sec-title { font-size: 1rem; font-weight: 700; color: #000; border-bottom: 1px double #4b5563; padding-bottom: 2px; margin: 20px 0 10px; text-align: center; text-transform: uppercase; font-family: 'Georgia', 'Garamond', serif !important; }
.tpl-classic .cv-item { font-family: 'Georgia', 'Garamond', serif !important; }

.cv-item { font-size: 0.9rem; line-height: 1.5; }

/* ============================================================
   RESPONSIVE DESIGN
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
  .logo-text span { font-size: 0.68rem; }
  .hero { padding: 64px 0 96px; }
  .hero-title { font-size: 2.1rem; }
  .hero-stats { gap: 12px; }
  .hero-stat { min-width: 100px; padding: 10px 16px; }
  .hero-stat-value { font-size: 1.5rem; }
  .hero-stat-label { font-size: 0.74rem; }
  .search-card { flex-direction: column; gap: 10px; padding: 12px; }
  .btn-search { padding: 14px; border-radius: var(--r-md); justify-content: center; }
  .categories-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
  .category-card { padding: 16px 10px 12px; }
  .cat-emoji { font-size: 1.9rem; }
  .job-card { grid-template-columns: 1fr; padding: 18px; }
  .co-logo { display: none; }
  .job-footer { flex-direction: column; align-items: flex-start; gap: 12px; }
  .btn-apply { width: 100%; justify-content: center; }
  .detail-main { padding: 24px; }
  .container { padding: 0 16px; }
}

@media (max-width: 480px) {
  .hero-stats { display: none; }
  .hero-title { font-size: 1.6rem; line-height: 1.25; }
  .hero-eyebrow { font-size: 0.74rem; padding: 5px 14px; margin-bottom: 16px; }
  .hero-subtitle { font-size: 0.92rem; margin-bottom: 20px; }
  .hero { padding: 48px 0 80px; }
  .search-section { margin-top: -30px; margin-bottom: 36px; }
  .search-field-wrap { min-height: 48px; padding: 0 14px; }
  .search-field-wrap input { font-size: 0.92rem; }
  .btn-search { padding: 12px; font-size: 0.92rem; }
  .job-card-title { font-size: 1.02rem; }
  .footer-inner { flex-direction: column; gap: 36px; }
  .footer-links-group { gap: 36px; }
  .chips-section { margin-bottom: 24px; }
  .chip { padding: 7px 14px; font-size: 0.78rem; }
}

/* Print */
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
