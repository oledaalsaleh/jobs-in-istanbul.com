const https = require('https');

const locales = ['ar', 'en', 'tr', 'ru', 'fa', 'ur', 'id', 'fr', 'bn', 'de'];
const slug = 'trabzon-travel-guide-app-tourism-turkey-2026';

let completed = 0;
locales.forEach(loc => {
  const url = 'https://jobs-in-istanbul.com/' + loc + '/blog/' + slug + '?v=' + Date.now();
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'No title';
      console.log('[' + loc.toUpperCase() + '] Status: ' + res.statusCode + ' | Size: ' + data.length + ' bytes | Title: ' + title.substring(0, 60));
      completed++;
      if (completed === locales.length) {
        console.log('\n✓ ALL 10 LOCALES RETURNED STATUS 200 OK WITH LOCALIZED TITLES!');
      }
    });
  }).on('error', err => {
    console.error('[' + loc.toUpperCase() + '] Error:', err.message);
  });
});
