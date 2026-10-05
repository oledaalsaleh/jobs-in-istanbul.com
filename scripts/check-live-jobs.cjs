const https = require('https');

const url = 'https://jobs-in-istanbul.com/ar?nocache=' + Date.now();
https.get(url, (res) => {
  let body = '';
  console.log('Headers:', res.headers['cf-cache-status'], res.headers['cache-control']);
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    const cardMatches = body.match(/class="job-card/g);
    console.log('Job cards count found on page:', cardMatches ? cardMatches.length : 0);

    const jobsHeaderPos = body.indexOf('class="jobs-header"');
    const quranPromoPos = body.indexOf('class="quran-app-promo"');
    console.log('jobsHeaderPos:', jobsHeaderPos, 'quranPromoPos:', quranPromoPos);
    console.log('Jobs appear above promo:', jobsHeaderPos < quranPromoPos);

    const eyebrow = body.match(/<div class="hero-eyebrow[^>]*>([\s\S]*?)<\/div>/);
    console.log('Eyebrow text:', eyebrow ? eyebrow[1].replace(/\s+/g, ' ').trim() : 'N/A');

    const titleMatches = [...body.matchAll(/class="job-card-title"[^>]*>([^<]+)<\/a>/g)];
    console.log('Top jobs on page:');
    titleMatches.slice(0, 5).forEach((m, idx) => {
      console.log(` ${idx + 1}. ${m[1].trim()}`);
    });
  });
}).on('error', err => {
  console.error('Error fetching:', err);
});
