/**
 * IndexNow API Service
 * 
 * Instantly submits updated or new URLs to Bing, Yandex, Seznam, and Naver search engines.
 */

export async function notifyIndexNow(env: any, urls: string[]): Promise<boolean> {
  const host = 'jobs-in-istanbul.com';
  const key = env.INDEXNOW_KEY || 'jobs-istanbul-indexnow-2026-key';
  const keyLocation = `https://${host}/${key}.txt`;

  if (!urls || urls.length === 0) return false;

  try {
    console.log(`[IndexNow] Sending ${urls.length} URLs to IndexNow endpoint...`);

    const payload = {
      host: host,
      key: key,
      keyLocation: keyLocation,
      urlList: urls
    };

    // IndexNow API endpoints (Bing & Yandex)
    const endpoints = [
      'https://api.indexnow.org/indexnow',
      'https://www.bing.com/indexnow',
      'https://yandex.com/indexnow'
    ];

    const results = await Promise.allSettled(
      endpoints.map(endpoint =>
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(payload)
        })
      )
    );

    let successCount = 0;
    for (const res of results) {
      if (res.status === 'fulfilled' && (res.value.status === 200 || res.value.status === 202)) {
        successCount++;
      }
    }

    console.log(`[IndexNow] Successfully notified ${successCount}/${endpoints.length} IndexNow endpoints.`);
    return successCount > 0;
  } catch (error) {
    console.error('[IndexNow] Error submitting to IndexNow:', error);
    return false;
  }
}
