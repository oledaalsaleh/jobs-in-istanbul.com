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
