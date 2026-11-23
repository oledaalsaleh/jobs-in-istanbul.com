/**
 * Edge Anti-Bot, Anti-Scraper & Exploit Shield
 *
 * Protects Jobs in Istanbul against:
 * 1. Aggressive commercial scrapers, headless browsers & CLI harvesters (403 Forbidden)
 * 2. Automated vulnerability scanners, PHP/.env/.git probes & SQLi/XSS URL attacks (403 Forbidden)
 * 3. High-rate per-IP job harvesting bursts (429 Too Many Requests + 15-min KV block)
 *
 * Strictly preserves 100% access for legitimate Search Engines (Google, Bing, Yandex, DuckDuckGo,
 * Yahoo, Apple, Brave, Naver, Seznam, AI Search bots), Google AdSense crawlers, social preview
 * bots (Telegram, WhatsApp, Facebook, X, LinkedIn), and the official mobile app.
 */

// Trusted Search Engines, AdSense Crawlers, Policy Renderers & Social Preview Bots (Never block or throttle)
const TRUSTED_BOT_UA_REGEX =
  /googlebot|google-inspectiontool|googleother|storebot-google|mediapartners-google|adsbot-google|feedfetcher-google|apis-google|google-read-aloud|google-extended|google\s*favicon|chrome-lighthouse|bingbot|bingpreview|adidxbot|msnbot|duckduckbot|slurp|yandexbot|yandeximages|yandex\.com\/bots|applebot|bravebot|seznambot|yeti\/|naverbot|petalbot|baiduspider|oai-searchbot|chatgpt-user|gptbot|perplexitybot|claudebot|claude-web|telegrambot|whatsapp|facebookexternalhit|facebot|twitterbot|linkedinbot|discordbot|slackbot/i;

// Known Malicious Bots, Content Scrapers, SEO Link Harvesters & Attack Tools
// Note: HeadlessChrome is intentionally NOT blocked because Google AdSense review/preview renderers use Chromium headless engines.
const BAD_BOT_UA_REGEX =
  /ahrefsbot|semrushbot|mj12bot|dotbot|blexbot|dataforseobot|bytespider|barkrowler|seekportbot|megaindex|serpstatbot|rogerbot|sogou|exabot|turnitinbot|zoominfobot|scrapy|crawldaddy|HTTrack|webcopier|offline explorer|teleport|siteimprove|sqlmap|nikto|nmap|masscan|zgrab|nuclei|acunetix|nessus|openvas|wpscan|dirbuster|gobuster|ffuf|feroxbuster|wfuzz|havij|morfeus|python-requests|python-urllib|aiohttp|httpx|go-http-client|libwww-perl|mechanize|phantomjs|playwright|puppeteer|selenium|cypress|^curl\/|^wget\/|^java\//i;

// Vulnerability Scanner & Exploit Probe Paths (Zero legitimate routes match these)
const EXPLOIT_PATH_REGEX =
  /(?:^|\/)(?:wp-admin|wp-login\.php|wp-content|wp-includes|xmlrpc\.php|\.env(?:\.[^/]+)?|\.git|\.svn|\.aws|phpmyadmin|pma|adminer|vendor\/phpunit|boaform|cgi-bin|actuator)(?:\/|$)|\.php$|\.asp$|\.aspx$|\.jsp$|\.\.\//i;

// Obvious SQLi / XSS / Log4Shell probe patterns in raw query string
const EXPLOIT_QUERY_REGEX =
  /(?:union[\s+]+select|select[\s+]+.+[\s+]+from|information_schema|sleep\(\d+\)|benchmark\(\d+|\$\{jndi:|<script\b|javascript:|onerror\s*=)/i;

// Static assets exempt from per-IP page rate counting
const STATIC_ASSET_REGEX =
  /^\/(?:css\/|public\/|js\/|favicon\.ico$|icon-\d+\.png$|manifest\.json$|sw\.js$|robots\.txt$|ads\.txt$|app-ads\.txt$|sitemap[^/]*\.xml$|BingSiteAuth\.xml$|opensearch\.xml$|llms(?:-full)?\.txt$)/i;

interface IpBucket {
  htmlCount: number;
  apiCount: number;
  windowStart: number;
  blockedUntil: number;
}

// Fast isolate-level sliding window store (zero KV writes during normal traffic)
const ipBuckets = new Map<string, IpBucket>();
const evaluatedRequests = new WeakSet<Request>();
let lastCleanupMs = 0;

function cleanupBuckets(now: number) {
  if (now - lastCleanupMs < 60_000) return;
  lastCleanupMs = now;
  if (ipBuckets.size > 5000) {
    for (const [ip, b] of ipBuckets.entries()) {
      if (now - b.windowStart > 120_000 && b.blockedUntil < now) {
        ipBuckets.delete(ip);
      }
    }
  }
}

export function resetBotShieldBucketsForTests() {
  ipBuckets.clear();
}

export interface BotShieldDecision {
  blocked: boolean;
  status?: 403 | 429;
  reason?: string;
  retryAfterSeconds?: number;
}

export async function evaluateBotShield(
  request: Request,
  env: any,
  ctx?: any
): Promise<BotShieldDecision> {
  if (evaluatedRequests.has(request)) {
    return { blocked: false };
  }
  evaluatedRequests.add(request);

  const url = new URL(request.url);
  const pathname = url.pathname || '/';
  const rawSearch = decodeURIComponent(url.search || '').slice(0, 2000);

  // 1. Block exploit & scanner path/query probes immediately (all environments)
  if (EXPLOIT_PATH_REGEX.test(pathname) || EXPLOIT_QUERY_REGEX.test(rawSearch)) {
    return {
      blocked: true,
      status: 403,
      reason: 'Exploit or vulnerability scanner request blocked.'
    };
  }

  // Allow authenticated internal/admin Bearer API calls
  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ') && authHeader.length > 20) {
    return { blocked: false };
  }

  const ua = (request.headers.get('User-Agent') || '').trim();

  // 2. Always allow trusted search engines, AdSense crawlers & social preview bots
  if (ua && TRUSTED_BOT_UA_REGEX.test(ua)) {
    return { blocked: false };
  }

  // 3. Block known bad scrapers, headless browsers & attack tools immediately
  if (ua && BAD_BOT_UA_REGEX.test(ua)) {
    return {
      blocked: true,
      status: 403,
      reason: 'Automated scraping and bot tools are not permitted.'
    };
  }

  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '';

  const isProd = env?.ENVIRONMENT === 'production';
  const isMobileApiRoute =
    pathname.startsWith('/api/mobile/') ||
    pathname.startsWith('/api/v1/') ||
    pathname === '/api/config' ||
    pathname === '/api/feed';

  // 4. In production, reject external requests with completely empty User-Agent strings
  if (isProd && ip && !ua && !isMobileApiRoute && !STATIC_ASSET_REGEX.test(pathname)) {
    return {
      blocked: true,
      status: 403,
      reason: 'Missing browser User-Agent header.'
    };
  }

  // Skip rate limiting for static assets, sitemaps, and verification files
  if (STATIC_ASSET_REGEX.test(pathname)) {
    return { blocked: false };
  }

  // 5. Per-IP Anti-Scraping Burst Limiter (protects job listings & APIs from bulk harvesting)
  if (!ip || ip === '127.0.0.1') {
    return { blocked: false };
  }

  const now = Date.now();
  cleanupBuckets(now);

  let bucket = ipBuckets.get(ip);
  if (bucket && bucket.blockedUntil > now) {
    return {
      blocked: true,
      status: 429,
      reason: 'Rate limit exceeded. Automated bulk requests are blocked.',
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.blockedUntil - now) / 1000))
    };
  }

  // Check if IP was recently banned across isolates in KV (only checked on first hit of window)
  if (!bucket && env?.CACHE_KV) {
    try {
      const kvBan = await env.CACHE_KV.get(`botban:${ip}`);
      if (kvBan) {
        const until = parseInt(kvBan, 10) || now + 300_000;
        ipBuckets.set(ip, { htmlCount: 0, apiCount: 0, windowStart: now, blockedUntil: until });
        return {
          blocked: true,
          status: 429,
          reason: 'Temporarily blocked due to automated scraping activity.',
          retryAfterSeconds: Math.max(1, Math.ceil((until - now) / 1000))
        };
      }
    } catch (e) {}
  }

  if (!bucket || now - bucket.windowStart >= 60_000) {
    bucket = { htmlCount: 0, apiCount: 0, windowStart: now, blockedUntil: 0 };
    ipBuckets.set(ip, bucket);
  }

  const isApiOrSearch = pathname.startsWith('/api/') || url.searchParams.has('search');
  if (isApiOrSearch) {
    bucket.apiCount++;
  } else {
    bucket.htmlCount++;
  }

  // Thresholds per 60 seconds per single IP:
  // - 80 HTML page loads/min (>1.3 pages/sec sustained) OR 40 API/search queries/min
  const maxHtmlPerMin = Number(env?.BOT_MAX_HTML_PER_MIN) || 80;
  const maxApiPerMin = Number(env?.BOT_MAX_API_PER_MIN) || 40;

  if (bucket.htmlCount > maxHtmlPerMin || bucket.apiCount > maxApiPerMin) {
    const banDurationMs = 15 * 60_000; // 15-minute cooldown ban
    bucket.blockedUntil = now + banDurationMs;

    if (env?.CACHE_KV) {
      const putPromise = env.CACHE_KV.put(`botban:${ip}`, String(bucket.blockedUntil), {
        expirationTtl: 900
      }).catch(() => {});
      if (ctx?.waitUntil) ctx.waitUntil(putPromise);
    }

    return {
      blocked: true,
      status: 429,
      reason: 'Too many requests from your IP. Bulk scraping is prohibited.',
      retryAfterSeconds: 900
    };
  }

  return { blocked: false };
}

export function buildBotBlockedResponse(decision: BotShieldDecision): Response {
  const status = decision.status || 403;
  const headers: Record<string, string> = {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Robots-Tag': 'noindex, nofollow',
    'Cache-Control': status === 403 ? 'public, max-age=600' : 'no-store'
  };
  if (decision.retryAfterSeconds) {
    headers['Retry-After'] = String(decision.retryAfterSeconds);
  }
  return new Response(decision.reason || 'Access Denied', { status, headers });
}
