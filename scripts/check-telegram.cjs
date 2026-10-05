const https = require('https');

https.get('https://t.me/s/jobsintr', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  console.log('Telegram status:', res.statusCode);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const regex = /data-post="jobsintr\/(\d+)"/g;
    const matches = [...d.matchAll(regex)].map(m => m[1]);
    console.log('Found posts:', matches.length);
    console.log('Sample recent post IDs:', matches.slice(-5));
  });
}).on('error', e => console.error('Telegram preview error:', e.message));
