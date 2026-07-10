const https = require('https');

// Test the Google verification file endpoint
const testUrl = 'https://jobs-in-istanbul.com/google123abc.html';
https.get(testUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('URL:', testUrl);
        console.log('Status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Body:', data.substring(0, 500));
    });
}).on('error', err => console.error('Error:', err.message));