const https = require('https');
const http = require('http');

function fetch(url) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data, url }));
        }).on('error', reject);
    });
}

async function runAudit() {
    const results = {};

    // 1. Homepage check
    console.log('=== AUDITING: jobs-in-istanbul.com ===\n');

    // Check main pages
    const pages = [
        'https://jobs-in-istanbul.com/',
        'https://jobs-in-istanbul.com/en',
        'https://jobs-in-istanbul.com/ar',
        'https://jobs-in-istanbul.com/tr',
        'https://jobs-in-istanbul.com/en/jobs',
        'https://jobs-in-istanbul.com/en/blog',
        'https://jobs-in-istanbul.com/en/about',
        'https://jobs-in-istanbul.com/en/submit-job',
        'https://jobs-in-istanbul.com/en/install',
    ];

    console.log('--- PAGE STATUS CHECKS ---');
    for (const url of pages) {
        try {
            const r = await fetch(url);
            console.log(`[${r.status}] ${url} (${(r.data.length / 1024).toFixed(1)}KB)`);
        } catch (e) {
            console.log(`[ERR] ${url}: ${e.message}`);
        }
    }

    // Check SEO files
    console.log('\n--- SEO FILES ---');
    const seoFiles = [
        'https://jobs-in-istanbul.com/robots.txt',
        'https://jobs-in-istanbul.com/sitemap.xml',
        'https://jobs-in-istanbul.com/sitemap-static.xml',
        'https://jobs-in-istanbul.com/sitemap-jobs.xml',
        'https://jobs-in-istanbul.com/sitemap-blog.xml',
    ];
    for (const url of seoFiles) {
        try {
            const r = await fetch(url);
            console.log(`[${r.status}] ${url} (${(r.data.length / 1024).toFixed(1)}KB)`);
            if (url.includes('robots.txt')) {
                console.log(`  Content: ${r.data.substring(0, 500)}`);
            }
        } catch (e) {
            console.log(`[ERR] ${url}: ${e.message}`);
        }
    }

    // Check homepage meta tags
    console.log('\n--- HOMEPAGE META TAGS (en) ---');
    try {
        const r = await fetch('https://jobs-in-istanbul.com/en');
        const html = r.data;

        // Title
        const title = html.match(/<title>([^<]*)<\/title>/);
        console.log(`Title: ${title ? title[1] : 'NOT FOUND'}`);

        // Meta description
        const desc = html.match(/<meta name="description" content="([^"]*)"/);
        console.log(`Description: ${desc ? desc[1].substring(0, 150) : 'NOT FOUND'}`);

        // Canonical
        const canonical = html.match(/<link rel="canonical" href="([^"]*)"/);
        console.log(`Canonical: ${canonical ? canonical[1] : 'NOT FOUND'}`);

        // OG tags
        const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/);
        const ogDesc = html.match(/<meta property="og:description" content="([^"]*)"/);
        const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/);
        const ogUrl = html.match(/<meta property="og:url" content="([^"]*)"/);
        const ogType = html.match(/<meta property="og:type" content="([^"]*)"/);
        console.log(`OG Title: ${ogTitle ? ogTitle[1] : 'NOT FOUND'}`);
        console.log(`OG Description: ${ogDesc ? ogDesc[1].substring(0, 100) : 'NOT FOUND'}`);
        console.log(`OG Image: ${ogImage ? ogImage[1] : 'NOT FOUND'}`);
        console.log(`OG URL: ${ogUrl ? ogUrl[1] : 'NOT FOUND'}`);
        console.log(`OG Type: ${ogType ? ogType[1] : 'NOT FOUND'}`);

        // Twitter
        const twCard = html.match(/<meta name="twitter:card" content="([^"]*)"/);
        const twSite = html.match(/<meta name="twitter:site" content="([^"]*)"/);
        console.log(`Twitter Card: ${twCard ? twCard[1] : 'NOT FOUND'}`);
        console.log(`Twitter Site: ${twSite ? twSite[1] : 'NOT FOUND'}`);

        // JSON-LD
        const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        if (jsonLd) {
            try {
                const schema = JSON.parse(jsonLd[1]);
                console.log(`JSON-LD Type: ${schema['@type']}`);
                console.log(`JSON-LD Name: ${schema.name}`);
            } catch (e) {
                console.log(`JSON-LD: Parse error`);
            }
        } else {
            console.log(`JSON-LD: NOT FOUND`);
        }

        // Hreflang
        const hreflangs = html.match(/<link rel="alternate" hreflang="[^"]*"/g);
        console.log(`Hreflang tags: ${hreflangs ? hreflangs.length : 0}`);
        if (hreflangs) hreflangs.forEach(h => console.log(`  ${h}`));

        // Mobile viewport
        const viewport = html.match(/<meta name="viewport"/);
        console.log(`Viewport meta: ${viewport ? 'FOUND' : 'NOT FOUND'}`);

        // Check for missing alt on images
        const imgs = html.match(/<img[^>]*>/g) || [];
        const noAlt = imgs.filter(i => !i.includes('alt='));
        console.log(`Images: ${imgs.length} total, ${noAlt.length} missing alt`);

        // Check H1 tags
        const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
        console.log(`H1 tags: ${h1s.length}`);
        if (h1s.length > 1) console.log('  WARNING: Multiple H1 tags!');
        if (h1s.length === 0) console.log('  WARNING: No H1 tag!');

    } catch (e) {
        console.log(`Error: ${e.message}`);
    }

    // Check headers for security
    console.log('\n--- SECURITY HEADERS ---');
    try {
        const r = await fetch('https://jobs-in-istanbul.com/en');
        const securityHeaders = [
            'strict-transport-security',
            'x-content-type-options',
            'x-frame-options',
            'content-security-policy',
            'x-xss-protection',
            'referrer-policy',
            'permissions-policy'
        ];
        for (const h of securityHeaders) {
            console.log(`${h}: ${r.headers[h] || 'NOT SET'}`);
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }

    // Check Arabic page for RTL
    console.log('\n--- ARABIC PAGE CHECK ---');
    try {
        const r = await fetch('https://jobs-in-istanbul.com/ar');
        const html = r.data;
        const dir = html.match(/dir="([^"]*)"/);
        const lang = html.match(/<html[^>]*lang="([^"]*)"/);
        console.log(`Direction: ${dir ? dir[1] : 'NOT SET'}`);
        console.log(`Language: ${lang ? lang[1] : 'NOT SET'}`);
        const arTitle = html.match(/<title>([^<]*)<\/title>/);
        console.log(`Title: ${arTitle ? arTitle[1] : 'NOT FOUND'}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }

    // Check www redirect
    console.log('\n--- REDIRECT CHECKS ---');
    try {
        const r = await fetch('https://www.jobs-in-istanbul.com/');
        console.log(`www redirect: [${r.status}]`);
    } catch (e) {
        console.log(`www redirect: Error - ${e.message}`);
    }

    // Check sitemap content
    console.log('\n--- SITEMAP DETAILS ---');
    try {
        const r = await fetch('https://jobs-in-istanbul.com/sitemap-jobs.xml');
        const urls = r.data.match(/<loc>/g);
        console.log(`Job URLs in sitemap: ${urls ? urls.length : 0}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
    try {
        const r = await fetch('https://jobs-in-istanbul.com/sitemap-blog.xml');
        const urls = r.data.match(/<loc>/g);
        console.log(`Blog URLs in sitemap: ${urls ? urls.length : 0}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }

    // Performance check
    console.log('\n--- PERFORMANCE ---');
    try {
        const start = Date.now();
        const r = await fetch('https://jobs-in-istanbul.com/en');
        const elapsed = Date.now() - start;
        console.log(`Homepage TTFB: ${elapsed}ms`);
        console.log(`Page size: ${(r.data.length / 1024).toFixed(1)}KB`);
        console.log(`Cache-Control: ${r.headers['cache-control'] || 'NOT SET'}`);
        console.log(`CF-Cache-Status: ${r.headers['cf-cache-status'] || 'NOT SET'}`);
        console.log(`Content-Encoding: ${r.headers['content-encoding'] || 'NOT SET'}`);

        // Check inline CSS size
        const styleMatch = r.data.match(/<style>([\s\S]*?)<\/style>/g);
        if (styleMatch) {
            const totalCss = styleMatch.reduce((sum, s) => sum + s.length, 0);
            console.log(`Inline CSS: ${(totalCss / 1024).toFixed(1)}KB (${styleMatch.length} blocks)`);
        }

        // Check inline JS
        const scriptMatch = r.data.match(/<script>([\s\S]*?)<\/script>/g);
        if (scriptMatch) {
            const totalJs = scriptMatch.reduce((sum, s) => sum + s.length, 0);
            console.log(`Inline JS: ${(totalJs / 1024).toFixed(1)}KB (${scriptMatch.length} blocks)`);
        }

        // Check external resources
        const externalCSS = r.data.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]*)"/g) || [];
        const externalJS = r.data.match(/<script[^>]*src="([^"]*)"/g) || [];
        console.log(`External CSS: ${externalCSS.length}`);
        console.log(`External JS: ${externalJS.length}`);

    } catch (e) {
        console.log(`Error: ${e.message}`);
    }

    // Check structured data on job pages
    console.log('\n--- STRUCTURED DATA CHECK ---');
    try {
        const r = await fetch('https://jobs-in-istanbul.com/en');
        const jsonLdBlocks = r.data.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
        console.log(`JSON-LD blocks: ${jsonLdBlocks.length}`);
        for (const block of jsonLdBlocks) {
            const content = block.replace(/<\/?script[^>]*>/g, '');
            try {
                const schema = JSON.parse(content);
                if (Array.isArray(schema)) {
                    schema.forEach(s => console.log(`  - ${s['@type'] || 'unknown'}`));
                } else {
                    console.log(`  - ${schema['@type'] || 'unknown'}`);
                }
            } catch (e) {
                console.log(`  - Parse error`);
            }
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }

    console.log('\n=== AUDIT COMPLETE ===');
}

runAudit().catch(console.error);