import { Context, Next } from 'hono'
import { z } from 'zod'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'

const SAFE_TEXT_REGEX = /^(?!.*<\s*script)(?!.*javascript:).*$/is;

// Zod Schema for Job Submission Validation with Anti-Spam & XSS Guards
export const JobSubmissionSchema = z.object({
  title: z.string().min(3).max(100).regex(SAFE_TEXT_REGEX, 'Invalid characters in title'),
  title_en: z.string().max(200).optional().nullable(),
  title_ar: z.string().max(200).optional().nullable(),
  company: z.string().min(2).max(100).regex(SAFE_TEXT_REGEX, 'Invalid characters in company name'),
  jobType: z.enum(['full-time', 'part-time', 'remote', 'internship']),
  location: z.string().min(2).max(100),
  location_en: z.string().max(100).optional().nullable(),
  location_ar: z.string().max(100).optional().nullable(),
  applyEmail: z.string().email(),
  salary: z.string().max(50).optional().nullable(),
  description: z.string().min(10).max(5000).regex(SAFE_TEXT_REGEX, 'Invalid script content in description'),
  description_en: z.string().max(5000).optional().nullable(),
  description_ar: z.string().max(5000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  language: z.enum(['ar', 'en', 'both']).optional().nullable(),
  transitLine: z.enum(['none', 'm2', 'metrobus', 'm4', 'm11']).optional().nullable(),
  screeningQuestionsJson: z.string().max(10000).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  seoKeywords: z.string().max(500).optional().nullable(),
  website_url: z.string().max(200).optional().nullable(), // Anti-bot honeypot field
  'cf-turnstile-response': z.string().min(1, 'Turnstile captcha response is required')
});

// Middleware for input validation
export function validateJobSubmission() {
  return async (c: Context, next: Next) => {
    try {
      const data = await c.req.json();
      const parsed = JobSubmissionSchema.safeParse(data);
      if (!parsed.success) {
        return c.json({ 
          success: false, 
          error: 'Validation failed', 
          details: parsed.error.format() 
        }, 400);
      }
      // Put parsed data on context
      c.set('parsedBody', parsed.data);
      return await next();
    } catch (err) {
      return c.json({ success: false, error: 'Invalid JSON payload' }, 400);
    }
  };
}

// Canonical Turnstile Server-Side Verification Helper (Cloudflare Turnstile Spin Contract)
export async function verifyTurnstileToken(
  c: Context,
  token: unknown,
  expectedAction: string
): Promise<{ ok: boolean; status?: 400 | 403 | 500; error?: string; details?: string[] }> {
  const env: any = c.env || {};
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-real-ip') || '127.0.0.1';
  const secret: string | undefined = env.TURNSTILE_SECRET_KEY || env.TURNSTILE_SECRET;
  const isProd = env.ENVIRONMENT === 'production';

  // Allow local-authorized bypass ONLY if the user has a cryptographically valid employer session JWT cookie
  if (token === 'local-authorized') {
    const cookieVal = getCookie(c, 'employer_jwt');
    if (cookieVal) {
      const jwtSecret = env.JWT_SECRET || env.BETTER_AUTH_SECRET || 'change-me-in-production-secure-key';
      try {
        await verify(cookieVal, jwtSecret, 'HS256');
        return { ok: true };
      } catch (jwtErr) {
        console.error('Bypass attempt with invalid employer JWT cookie:', jwtErr);
      }
    }
    return { ok: false, status: 403, error: 'Bypass authorization failed. Valid employer session is required.' };
  }

  if (!secret) {
    if (isProd) {
      console.error('[Turnstile] TURNSTILE_SECRET_KEY missing in production — failing closed.');
      return { ok: false, status: 403, error: 'Turnstile verification unavailable.' };
    }
    console.warn('TURNSTILE_SECRET_KEY is not set in dev/test. Skipping Turnstile remote validation.');
    return { ok: true };
  }

  const rawHostnames = String(
    env.TURNSTILE_HOSTNAMES ||
      (isProd ? 'jobs-in-istanbul.com,www.jobs-in-istanbul.com' : 'localhost,127.0.0.1')
  );
  const expectedHostnames = new Set(
    rawHostnames
      .split(',')
      .map(h => h.trim().toLowerCase())
      .filter(Boolean)
  );

  if (typeof token !== 'string' || token.length === 0 || token.length > 2048 || expectedHostnames.size === 0) {
    return { ok: false, status: 403, error: 'Turnstile verification token is missing or invalid.' };
  }

  let verifyData: any;
  try {
    const formData = new URLSearchParams({
      secret,
      response: token,
      remoteip: ip
    });

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: formData.toString()
    });
    if (!verifyRes.ok) {
      throw new Error(`siteverify HTTP ${verifyRes.status}`);
    }
    verifyData = await verifyRes.json();
  } catch (err) {
    console.error('Error verifying Turnstile CAPTCHA:', err);
    return { ok: false, status: 403, error: 'Captcha verification failed. Please try again.' };
  }

  const isDummyTestSecret = secret.startsWith('1x00000000');
  const returnedHostname = String(verifyData?.hostname || '').toLowerCase();
  const actionMatches = isDummyTestSecret || !expectedAction || verifyData?.action === expectedAction;
  const hostnameMatches = isDummyTestSecret || expectedHostnames.has(returnedHostname);

  if (!verifyData?.success || !actionMatches || !hostnameMatches) {
    console.error('Turnstile validation failed:', {
      errors: verifyData?.['error-codes'],
      action: verifyData?.action,
      expectedAction,
      hostname: returnedHostname
    });
    return {
      ok: false,
      status: 403,
      error: 'Captcha verification failed. Please try again.',
      details: verifyData?.['error-codes']
    };
  }

  return { ok: true };
}

// Middleware for Turnstile CAPTCHA + Honeypot Bot Validation
export function validateTurnstile(expectedAction: string = 'submit-job') {
  return async (c: Context, next: Next) => {
    const body = (c.get('parsedBody') as any) || {};
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-real-ip') || '127.0.0.1';

    // 1. Server-side Honeypot Check (catches automated bots even when Turnstile uses test keys)
    if (body.website_url && String(body.website_url).trim().length > 0) {
      const db = (c.env as any)?.DB;
      if (db) {
        await logSecurityEvent(db, 'BOT_HONEYPOT_BLOCKED', body.applyEmail || 'bot', ip, `Honeypot triggered at ${c.req.path}`);
      }
      return c.json({
        success: false,
        error: 'Automated bot submission detected.'
      }, 403);
    }

    const result = await verifyTurnstileToken(c, body['cf-turnstile-response'], expectedAction);
    if (!result.ok) {
      return c.json({
        success: false,
        error: result.error || 'Captcha verification failed.',
        details: result.details
      }, result.status || 403);
    }

    return await next();
  };
}


// KV-Based Rate Limiting Middleware
export function rateLimiter(limit: number = 5, windowMinutes: number = 10) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-real-ip') || '127.0.0.1';
    const kv = (c.env as any).CACHE_KV;

    // Fallback if CACHE_KV is not bound (e.g. during local migration testing without KV)
    if (!kv) {
      return await next();
    }

    const key = `rl:${ip}:${c.req.path}`;
    const windowSeconds = windowMinutes * 60;
    
    try {
      const current = await kv.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= limit) {
        // Log block event
        const db = (c.env as any).DB;
        if (db) {
          await logSecurityEvent(db, 'RATE_LIMIT_BLOCKED', 'public-form', ip, `IP blocked at ${c.req.path} after ${count} requests`);
        }
        return c.json({ 
          success: false, 
          error: 'Too many requests. Please try again later.' 
        }, 429);
      }

      // Increment count
      await kv.put(key, (count + 1).toString(), { expirationTtl: windowSeconds });
      return await next();
    } catch (err) {
      console.error('Rate limiting error:', err);
      return await next(); // Fail open on KV issues to prevent breaking the app
    }
  };
}

// Log security audit events to the D1 Database
export async function logSecurityEvent(db: any, eventType: string, email: string, ip: string, details: string) {
  try {
    const id = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowMs = Date.now();
    
    const docData = JSON.stringify({
      eventType,
      severity: 'info',
      userId: 'public',
      email,
      ipAddress: ip,
      blocked: eventType.includes('BLOCKED') ? 1 : 0,
      details,
      timestamp: nowMs
    });

    await db.prepare(
      `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, created_at, updated_at)
       VALUES (?, ?, 'security_event', 'published', 1, 1, ?, ?, ?, ?, ?)`
    ).bind(id, id, eventType, eventType, docData, nowMs, nowMs).run();
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}
