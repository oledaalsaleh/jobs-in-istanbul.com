const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data, url }));
    }).on('error', reject);
  });
}

async function audit() {
  console.log('Fetching sample job from sitemap-jobs.xml...');
  const sitemap = await fetch('https://jobs-in-istanbul.com/sitemap-jobs.xml');
  const match = sitemap.data.match(/<loc>(https:\/\/jobs-in-istanbul\.com\/(ar|en|tr)\/jobs\/[^<]+)<\/loc>/);
  if (!match) {
    console.log('No job URL found in sitemap');
    return;
  }
  const jobUrl = match[1];
  console.log('\nAuditing Sample Job URL:', jobUrl);

  const res = await fetch(jobUrl);
  const html = res.data;

  console.log('Status Code:', res.status);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Content-Length:', (html.length / 1024).toFixed(1) + ' KB');

  // Title
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1];
  console.log('\n--- BASIC METADATA ---');
  console.log('Title (' + (title ? title.length : 0) + ' chars):', title || 'NOT FOUND');

  // Description
  const desc = (html.match(/<meta name="description" content="([^"]*)"/i) || [])[1];
  console.log('Meta Description (' + (desc ? desc.length : 0) + ' chars):', desc || 'NOT FOUND');

  // Canonical
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/i) || [])[1];
  console.log('Canonical URL:', canonical || 'NOT FOUND');

  // Robots
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/i) || [])[1];
  console.log('Robots Meta:', robots || 'Indexable (Default)');

  // OpenGraph
  console.log('\n--- OPEN GRAPH ---');
  const ogTitle = (html.match(/<meta property="og:title" content="([^"]*)"/i) || [])[1];
  const ogDesc = (html.match(/<meta property="og:description" content="([^"]*)"/i) || [])[1];
  const ogImage = (html.match(/<meta property="og:image" content="([^"]*)"/i) || [])[1];
  const ogUrl = (html.match(/<meta property="og:url" content="([^"]*)"/i) || [])[1];
  const ogType = (html.match(/<meta property="og:type" content="([^"]*)"/i) || [])[1];
  console.log('og:title:', ogTitle || 'NOT FOUND');
  console.log('og:description:', ogDesc || 'NOT FOUND');
  console.log('og:image:', ogImage || 'NOT FOUND');
  console.log('og:url:', ogUrl || 'NOT FOUND');
  console.log('og:type:', ogType || 'NOT FOUND');

  // Twitter
  console.log('\n--- TWITTER CARD ---');
  const twCard = (html.match(/<meta name="twitter:card" content="([^"]*)"/i) || [])[1];
  const twSite = (html.match(/<meta name="twitter:site" content="([^"]*)"/i) || [])[1];
  console.log('twitter:card:', twCard || 'NOT FOUND');
  console.log('twitter:site:', twSite || 'NOT FOUND');

  // Hreflang
  console.log('\n--- INTERNATIONALIZATION (HREFLANG) ---');
  const hreflangs = html.match(/<link[^>]*hreflang=[^>]*>/gi) || [];
  console.log(`Found ${hreflangs.length} hreflang tags:`);
  hreflangs.forEach(h => console.log(' ', h));

  // Headings
  console.log('\n--- HEADINGS HIERARCHY ---');
  const h1s = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  console.log(`H1 count: ${h1s.length}`);
  h1s.forEach(h => console.log('  H1:', h.replace(/<[^>]+>/g, '').trim()));
  const h2s = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  console.log(`H2 count: ${h2s.length}`);

  // Structured Data (JSON-LD)
  console.log('\n--- STRUCTURED DATA (JSON-LD) ---');
  const schemas = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
  console.log(`Found ${schemas.length} JSON-LD blocks:`);
  schemas.forEach((s, idx) => {
    const raw = s.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '').trim();
    try {
      const parsed = JSON.parse(raw);
      console.log(`  Block #${idx + 1}: Type = "${parsed['@type'] || parsed.type}", Name/Title = "${parsed.title || parsed.name || 'N/A'}"`);
      if (parsed['@type'] === 'JobPosting') {
        console.log('    - title:', parsed.title);
        console.log('    - hiringOrganization:', parsed.hiringOrganization?.name);
        console.log('    - jobLocation:', parsed.jobLocation?.address?.addressLocality);
        console.log('    - datePosted:', parsed.datePosted);
        console.log('    - validThrough:', parsed.validThrough);
        console.log('    - employmentType:', parsed.employmentType);
      }
    } catch (e) {
      console.log(`  Block #${idx + 1}: Parse Error - ${e.message}`);
    }
  });

  // Images and alt tags
  console.log('\n--- IMAGES & ACCESSIBILITY ---');
  const imgTags = html.match(/<img [^>]*>/g) || [];
  let missingAlt = 0;
  imgTags.forEach(img => {
    if (!img.includes('alt=') || img.includes('alt=""')) missingAlt++;
  });
  console.log(`Total images: ${imgTags.length}, Missing/empty alt: ${missingAlt}`);

  // Test localized homepages
  console.log('\n--- LOCALIZED HOMEPAGES CHECK ---');
  for (const loc of ['ar', 'en', 'tr', 'ru', 'fa', 'ur']) {
    const locRes = await fetch(`https://jobs-in-istanbul.com/${loc}`);
    const lHtml = locRes.data;
    const lTitle = (lHtml.match(/<title>([^<]*)<\/title>/i) || [])[1];
    const lCanonical = (lHtml.match(/<link rel="canonical" href="([^"]*)"/i) || [])[1];
    const lDir = (lHtml.match(/<html[^>]*dir="([^"]*)"/i) || [])[1];
    console.log(`[${loc.toUpperCase()}] Status: ${locRes.status}, Dir: ${lDir || 'ltr'}, Canonical: ${lCanonical}, Title: "${lTitle}"`);
  }

  // Test specialized tools / categories
  console.log('\n--- SPECIALIZED TOOL PAGES SEO CHECK ---');
  const toolRoutes = [
    '/ar/currency-prices',
    '/ar/gold-prices',
    '/ar/salary-calculator-2026',
    '/ar/work-permit-eligibility',
    '/ar/workplace-quiz'
  ];
  for (const tRoute of toolRoutes) {
    const tRes = await fetch(`https://jobs-in-istanbul.com${tRoute}`);
    const tHtml = tRes.data;
    const tTitle = (tHtml.match(/<title>([^<]*)<\/title>/i) || [])[1];
    const tCanonical = (tHtml.match(/<link rel="canonical" href="([^"]*)"/i) || [])[1];
    console.log(`[${tRoute}] Status: ${tRes.status}, Canonical: ${tCanonical ? 'OK' : 'MISSING'}, Title: "${tTitle}"`);
  }

  console.log('\n=== AUDIT FINISHED ===');
}

audit().catch(console.error);
