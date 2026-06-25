import { Context, Next } from 'hono'
import { z } from 'zod'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'

// Zod Schema for Job Submission Validation
export const JobSubmissionSchema = z.object({
  title: z.string().min(3).max(100),
  title_en: z.string().max(200).optional().nullable(),
  title_ar: z.string().max(200).optional().nullable(),
  company: z.string().min(2).max(100),
  jobType: z.enum(['full-time', 'part-time', 'remote', 'internship']),
  location: z.string().min(2).max(100),
  location_en: z.string().max(100).optional().nullable(),
  location_ar: z.string().max(100).optional().nullable(),
  applyEmail: z.string().email(),
  salary: z.string().max(50).optional().nullable(),
  description: z.string().min(10).max(5000),
  description_en: z.string().max(5000).optional().nullable(),
  description_ar: z.string().max(5000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  language: z.enum(['ar', 'en', 'both']).optional().nullable(),
  transitLine: z.enum(['none', 'm2', 'metrobus', 'm4', 'm11']).optional().nullable(),
  screeningQuestionsJson: z.string().max(10000).optional().nullable(),
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

// Middleware for Turnstile CAPTCHA validation
export function validateTurnstile() {
  return async (c: Context, next: Next) => {
    const secret = c.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.warn('TURNSTILE_SECRET_KEY is not set. Skipping Turnstile validation.');
      return await next();
    }

    try {
      const body = c.get('parsedBody') || {};
      const token = body['cf-turnstile-response'];
      const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-real-ip') || '127.0.0.1';

      if (!token) {
        return c.json({ success: false, error: 'Turnstile verification token is missing' }, 400);
      }

      // Allow local-authorized bypass if the user has a valid employer session JWT cookie
      if (token === 'local-authorized') {
        const cookieVal = getCookie(c, 'employer_jwt');
        if (cookieVal) {
          const jwtSecret = c.env.JWT_SECRET || 'change-me-in-production-secure-key';
          try {
            await verify(cookieVal, jwtSecret, 'HS256');
            return await next();
          } catch (jwtErr) {
            console.error('Bypass attempt with invalid employer JWT cookie:', jwtErr);
          }
        }
        return c.json({ success: false, error: 'Bypass authorization failed. Valid employer session is required.' }, 403);
      }

      // Verify Turnstile token with Cloudflare
      const formData = new URLSearchParams();
      formData.append('secret', secret);
      formData.append('response', token);
      formData.append('remoteip', ip);

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const verifyData: any = await verifyRes.json();
      if (!verifyData.success) {
        console.error('Turnstile validation failed:', verifyData['error-codes']);
        return c.json({ 
          success: false, 
          error: 'Captcha verification failed. Please try again.',
          details: verifyData['error-codes']
        }, 403);
      }

      return await next();
    } catch (err) {
      console.error('Error verifying Turnstile CAPTCHA:', err);
      return c.json({ success: false, error: 'Internal server error during captcha verification' }, 500);
    }
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
