const https = require('https');

https.get('https://jobs-in-istanbul.com/ar', (res) => {
  let body = '';
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    const listIndex = body.indexOf('class="jobs-list"');
    console.log('Index of jobs-list in HTML:', listIndex);
    if (listIndex !== -1) {
      console.log('Snippet around jobs-list:');
      console.log(body.substring(listIndex - 200, listIndex + 500));
    }
  });
});
