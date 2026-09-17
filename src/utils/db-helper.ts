/**
 * DB Helper for Cloudflare D1
 * Provides query retry logic in case of SQLITE_BUSY / locked database errors
 * and Circuit Breaker pattern to protect against quota exhaustion (code: 7500).
 */

let d1RateLimitTripUntil = 0;

export function isD1RateLimited(): boolean {
  return Date.now() < d1RateLimitTripUntil;
}

export function tripD1RateLimit(durationMs = 5 * 60 * 1000): void {
  d1RateLimitTripUntil = Math.max(d1RateLimitTripUntil, Date.now() + durationMs);
  console.warn(`[DB HELPER] D1 Circuit Breaker tripped until ${new Date(d1RateLimitTripUntil).toISOString()}`);
}

export function resetD1RateLimit(): void {
  d1RateLimitTripUntil = 0;
}

export async function safeQuery<T = any>(
  queryFn: () => Promise<T>,
  retries = 2,
  delayMs = 100,
  fallbackValue?: T
): Promise<T> {
  // If Circuit Breaker is active, avoid hitting D1
  if (isD1RateLimited()) {
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw new Error('[DB HELPER] D1 daily rate limit is active (Circuit Breaker)');
  }

  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await queryFn();
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || '';
      
      // If quota/rate limit exceeded, retrying will NOT help. Trip breaker and exit immediately.
      if (
        errMsg.includes('exceeded D1') ||
        errMsg.includes('daily row read limit') ||
        errMsg.includes('code: 7500') ||
        err?.code === 7500 ||
        err?.status === 7500
      ) {
        console.warn('[DB HELPER] D1 daily rate limit reached. Tripping Circuit Breaker for 5 minutes.');
        tripD1RateLimit(5 * 60 * 1000);
        if (fallbackValue !== undefined) {
          return fallbackValue;
        }
        throw err;
      }

      const isLocked = errMsg.includes('SQLITE_BUSY') || 
                       errMsg.includes('database is locked') || 
                       errMsg.includes('D1_ERROR') || 
                       err.code === 'SQLITE_BUSY';
      
      if (isLocked && i < retries - 1) {
        console.warn(`[DB HELPER] Database is busy/locked. Retrying query ${i + 1}/${retries} in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
      } else {
        if (fallbackValue !== undefined) {
          return fallbackValue;
        }
        throw err;
      }
    }
  }
  if (fallbackValue !== undefined) {
    return fallbackValue;
  }
  throw lastError;
}
