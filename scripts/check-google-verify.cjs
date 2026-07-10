const https = require('https');
https.get('https://jobs-in-istanbul.com/en', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const match = data.match(/google-site-verification/);
        const bingMatch = data.match(/msvalidate\.01/);
        console.log('Status:', res.statusCode);
        console.log('Google verification meta tag found:', !!match);
        console.log('Bing verification meta tag found:', !!bingMatch);

        // Extract the full google verification line
        const googleLine = data.match(/<meta name="google-site-verification"[^>]*>/);
        if (googleLine) console.log('Google meta:', googleLine[0]);

        // Check page size
        console.log('Page size:', Buffer.byteLength(data), 'bytes');

        // Check for og:locale
        const ogLocale = data.match(/og:locale[^>]*content="([^"]*)"/);
        console.log('og:locale:', ogLocale ? ogLocale[1] : 'NOT FOUND');

        // Check for twitter:site
        const twitterSite = data.match(/twitter:site[^>]*content="([^"]*)"/);
        console.log('twitter:site:', twitterSite ? twitterSite[1] : 'NOT FOUND');
    });
}).on('error', err => console.error('Error:', err.message));