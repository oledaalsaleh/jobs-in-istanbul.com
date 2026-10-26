/**
 * Shared helpers for multilingual SEO link tags (hreflang / Open Graph image).
 * Keeps hreflang clusters and x-default consistent across hand-built page heads.
 */

export const SITE_URL = 'https://jobs-in-istanbul.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/public/images/og-share.png`;
export const CORE_LOCALES = ['ar', 'en', 'tr', 'ru', 'fa', 'ur'] as const;
export const PRIMARY_LOCALES = ['ar', 'en', 'tr'] as const;

/**
 * Pages whose body content only exists in ar/en/tr. Their ru/fa/ur URLs render the
 * English fallback, so those variants must canonicalize to /en and stay out of the
 * hreflang cluster and sitemap (otherwise Google sees duplicate English pages).
 * Remove a path from this list once real ru/fa/ur content is added for it.
 */
export const PRIMARY_LOCALE_ONLY_PATHS = new Set<string>([
  'jobs-for-arabs', 'jobs-without-turkish', 'entry-level-jobs', 'driver-jobs', 'restaurant-jobs',
  'factory-jobs', 'call-center-jobs', 'jobs-for-women', 'student-jobs', 'medical-tourism-jobs',
  'real-estate-jobs', 'tech-developer-jobs', 'translation-jobs', 'accounting-jobs',
  'jobs-in-fatih', 'jobs-in-basaksehir', 'jobs-in-esenyurt', 'jobs-in-sisli', 'jobs-in-beylikduzu',
  'jobs-in-taksim', 'jobs-in-kadikoy',
  'kidem-tazminati-hesaplama', 'privacy', 'ai-job-matcher', 'apps'
]);

/** Locales with genuine content for a page path (without locale prefix, e.g. "jobs-for-arabs"). */
export function getNativeLocales(path: string): readonly string[] {
  const key = String(path || '').replace(/^\/+|\/+$/g, '');
  return PRIMARY_LOCALE_ONLY_PATHS.has(key) ? PRIMARY_LOCALES : CORE_LOCALES;
}

const OG_LOCALES: Record<string, string> = {
  ar: 'ar_AR', en: 'en_US', tr: 'tr_TR', ru: 'ru_RU', fa: 'fa_IR', ur: 'ur_PK'
};

export function ogLocale(locale: string): string {
  return OG_LOCALES[locale] || 'en_US';
}

/**
 * Pick the x-default target: English when available (international fallback),
 * otherwise the first available locale.
 */
export function pickDefaultLocale(locales: readonly string[]): string {
  return locales.includes('en') ? 'en' : (locales[0] || 'en');
}

/**
 * Canonical locale for a page that is only truly translated into `nativeLocales`.
 * Untranslated locales (which render fallback content) canonicalize to the default locale.
 */
export function canonicalLocaleFor(locale: string, nativeLocales: readonly string[]): string {
  return nativeLocales.includes(locale) ? locale : pickDefaultLocale(nativeLocales);
}

/**
 * Build <link rel="alternate" hreflang> tags for `/{locale}{path}` across the given locales,
 * plus a consistent x-default.
 */
export function hreflangLinks(path: string, locales: readonly string[] = CORE_LOCALES): string {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const tags = locales.map(loc => `<link rel="alternate" hreflang="${loc}" href="${SITE_URL}/${loc}${cleanPath}">`);
  tags.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/${pickDefaultLocale(locales)}${cleanPath}">`);
  return tags.join('\n    ');
}

/** Open Graph + Twitter image tags (1200x630 share card). */
export function ogImageTags(image: string = DEFAULT_OG_IMAGE, alt: string = ''): string {
  const safeAlt = alt.replace(/"/g, '&quot;');
  return [
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    safeAlt ? `<meta property="og:image:alt" content="${safeAlt}">` : '',
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${image}">`
  ].filter(Boolean).join('\n    ');
}
