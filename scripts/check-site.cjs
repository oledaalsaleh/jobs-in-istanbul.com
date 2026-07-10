const https = require('https');

const urls = [
    'https://jobs-in-istanbul.com/robots.txt',
    'https://jobs-in-istanbul.com/sitemap.xml',
    'https://jobs-in-istanbul.com/ar',
    'https://jobs-in-istanbul.com/en',
    'https://jobs-in-istanbul.com/rss.xml',
    'https://jobs-in-istanbul.com/manifest.json',
];

function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { timeout: 15000 }, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
        }).on('error', reject);
    });
}

(async () => {
    for (const url of urls) {
        console.log('='.repeat(60));
        console.log('URL:', url);
        try {
            const { status, headers, body } = await fetch(url);
            console.log('Status:', status);
            console.log('Content-Type:', headers['content-type']);
            console.log('Body Preview:', body.substring(0, 500));
        } catch (e) {
            console.log('Error:', e.message);
        }
        console.log('');
    }

    // Also check the main page HTML for SEO tags
    console.log('='.repeat(60));
    console.log('Checking main page HTML for SEO tags...');
    try {
        const { status, body } = await fetch('https://jobs-in-istanbul.com/');
        console.log('Main page status:', status);

        // Check for critical SEO elements
        const checks = [
            ['<title>', 'Title tag'],
            ['<meta name="description"', 'Meta description'],
            ['<link rel="canonical"', 'Canonical link'],
            ['<meta property="og:', 'Open Graph tags'],
            ['<meta name="twitter:', 'Twitter Card tags'],
            ['<script type="application/ld+json"', 'Structured Data (JSON-LD)'],
            ['<h1', 'H1 tag'],
            ['hreflang', 'Hreflang tags'],
            ['<link rel="alternate"', 'Alternate links'],
            ['<meta name="robots"', 'Robots meta tag'],
        ];

        for (const [tag, label] of checks) {
            const found = body.includes(tag) ? 'YES' : 'NO';
            console.log(`  ${found} - ${label} (${tag})`);
        }
    } catch (e) {
        console.log('Error:', e.message);
    }

    // Check ar page
    console.log('');
    console.log('='.repeat(60));
    console.log('Checking /ar page for SEO tags...');
    try {
        const { status, body } = await fetch('https://jobs-in-istanbul.com/ar');
        console.log('Status:', status);
        const checks = [
            ['<title>', 'Title tag'],
            ['<meta name="description"', 'Meta description'],
            ['<link rel="canonical"', 'Canonical link'],
            ['hreflang', 'Hreflang tags'],
            ['<h1', 'H1 tag'],
            ['lang="ar"', 'Arabic lang attribute'],
        ];
        for (const [tag, label] of checks) {
            const found = body.includes(tag) ? 'YES' : 'NO';
            console.log(`  ${found} - ${label}`);
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
})();