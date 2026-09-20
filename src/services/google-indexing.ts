/**
 * Google Indexing API Service
 * 
 * Automatically sends instant indexing requests to Google Search Console
 * when new job postings are published.
 * 
 * To activate, configure the following environment variables / secrets:
 * - GOOGLE_CLIENT_EMAIL: The client email of your Google Cloud Service Account
 * - GOOGLE_PRIVATE_KEY: The PEM-formatted private key of your Service Account
 */

export async function notifyGoogleIndexing(env: any, jobSlug: string): Promise<boolean> {
  const clientEmail = env.GOOGLE_CLIENT_EMAIL;
  const privateKey = env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    console.log('[Google Indexing] Credentials not configured. Skipping API notification.');
    return false;
  }

  try {
    console.log(`[Google Indexing] Initializing indexing request for job: ${jobSlug}`);
    const jwt = await generateGoogleJwt(privateKey, clientEmail);
    const accessToken = await fetchAccessToken(jwt);
    
    // Send indexing alerts for all supported website language URL paths
    const urls = [
      `https://jobs-in-istanbul.com/ar/jobs/${jobSlug}`,
      `https://jobs-in-istanbul.com/en/jobs/${jobSlug}`,
      `https://jobs-in-istanbul.com/tr/jobs/${jobSlug}`,
      `https://jobs-in-istanbul.com/ru/jobs/${jobSlug}`,
      `https://jobs-in-istanbul.com/fa/jobs/${jobSlug}`,
      `https://jobs-in-istanbul.com/ur/jobs/${jobSlug}`
    ];

    for (const url of urls) {
      const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          type: 'URL_UPDATED'
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Google Indexing] Failed to notify index for ${url}:`, errText);
      } else {
        console.log(`[Google Indexing] Success notifying index for ${url}`);
      }
    }

    return true;
  } catch (error) {
    console.error('[Google Indexing] Error during notify:', error);
    return false;
  }
}

async function generateGoogleJwt(privateKeyPem: string, clientEmail: string): Promise<string> {
  // Normalize PEM key string by removing headers, footers and whitespace
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const cleanPem = privateKeyPem
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s+/g, '');

  const binaryDerString = atob(cleanPem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  // Import private key into Web Crypto
  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64UrlEncode = (str: string) => {
    return btoa(str)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = new TextEncoder().encode(`${headerEncoded}.${payloadEncoded}`);

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    dataToSign
  );

  const signatureArray = new Uint8Array(signature);
  let signatureString = '';
  for (let i = 0; i < signatureArray.length; i++) {
    signatureString += String.fromCharCode(signatureArray[i]);
  }
  const signatureEncoded = base64UrlEncode(signatureString);

  return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;
}

async function fetchAccessToken(jwtAssertion: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtAssertion
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to exchange JWT for token: ${err}`);
  }

  const result: any = await response.json();
  return result.access_token;
}
