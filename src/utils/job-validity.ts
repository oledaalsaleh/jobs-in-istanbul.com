/**
 * Job posting validity policy.
 *
 * Most listings are aggregated from Telegram/partner channels and are usually filled
 * within days or weeks. Google Jobs guidelines require expired postings to be removed
 * (or marked expired) — so every job is treated as valid for JOB_VALIDITY_DAYS after
 * publication unless the posting itself carries an explicit, later deadline.
 */

export const JOB_VALIDITY_DAYS = 30;
export const JOB_VALIDITY_MS = JOB_VALIDITY_DAYS * 24 * 60 * 60 * 1000;

function toMs(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') {
    // Accept both seconds and milliseconds epochs
    return value < 1e12 ? value * 1000 : value;
  }
  const parsed = new Date(String(value)).getTime();
  return isNaN(parsed) ? null : parsed;
}

/** Explicit deadline on the job document (validThrough / expiresAt / deadline), if any. */
export function getExplicitJobDeadline(job: any): number | null {
  if (!job) return null;
  return toMs(job.validThrough) ?? toMs(job.expiresAt) ?? toMs(job.expires_at) ?? toMs(job.deadline) ?? null;
}

/** Date until which the job is considered open. */
export function getJobValidThrough(publishedAt: unknown, explicitDeadline?: unknown): Date {
  const explicit = toMs(explicitDeadline);
  if (explicit) return new Date(explicit);
  const published = toMs(publishedAt) ?? Date.now();
  return new Date(published + JOB_VALIDITY_MS);
}

/** True when the job is past its validity window. Jobs without a publish date are treated as open. */
export function isJobExpired(publishedAt: unknown, explicitDeadline?: unknown, now: number = Date.now()): boolean {
  const explicit = toMs(explicitDeadline);
  if (explicit) return explicit < now;
  const published = toMs(publishedAt);
  if (!published) return false;
  return published + JOB_VALIDITY_MS < now;
}

/** Earliest publish timestamp (ms) a job may have to still be open — used for sitemap/SQL filters. */
export function getJobFreshnessCutoffMs(now: number = Date.now()): number {
  return now - JOB_VALIDITY_MS;
}

const JOB_LOCALES = ['ar', 'en', 'tr', 'ru', 'fa', 'ur'] as const;
// Compare plain text only: aggregated "translations" are often the English text wrapped in <p> tags
// or re-spaced. Only the first 200 characters matter — real translations differ from the start, and
// this lets the jobs sitemap fetch short SQL substrings instead of full descriptions.
export const JOB_COMPARE_CHARS = 200;
const norm = (v: unknown) => String(v ?? '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase()
  .slice(0, JOB_COMPARE_CHARS);

/**
 * Locales in which a job has genuinely localized content.
 *
 * Many aggregated jobs store English text in title_tr / title_ru / ... (or leave them empty),
 * so their tr/ru/fa/ur pages are exact duplicates of the English page. Google treats such
 * copies as duplicate job postings, so only locales whose title OR description differs from
 * English count as native. English is always native (it is the fallback for every field).
 */
export function getJobNativeLocales(job: any): string[] {
  if (!job) return ['en'];
  const enTitle = norm(job.title_en || job.title);
  const enDesc = norm(job.description_en || job.description);
  const native = JOB_LOCALES.filter(loc => {
    if (loc === 'en') return true;
    const t = norm(job[`title_${loc}`]);
    const d = norm(job[`description_${loc}`]);
    return (t !== '' && t !== enTitle) || (d !== '' && d !== enDesc);
  });
  return native as string[];
}
