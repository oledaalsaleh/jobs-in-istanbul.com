function escapeHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendTelegramAlert(
  env: any,
  jobTitle: string,
  companyName: string,
  location: string,
  slug: string
) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHANNEL_ID;

  if (!token || !chatId) {
    console.warn('[TELEGRAM ALERT] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID in environment. Skipping alert.');
    return;
  }

  const jobUrl = `https://jobs-in-istanbul.com/ar/jobs/${slug}`;
  const message = `📢 <b>وظيفة شاغرة جديدة في إسطنبول!</b>\n\n` +
                  `💼 <b>المسمى الوظيفي:</b> ${escapeHtml(jobTitle)}\n` +
                  `🏢 <b>الشركة:</b> ${escapeHtml(companyName)}\n` +
                  `📍 <b>الموقع:</b> ${escapeHtml(location)}\n\n` +
                  `🔗 <b>رابط التفاصيل والتقديم:</b> <a href="${jobUrl}">اضغط هنا للتقديم</a>`;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[TELEGRAM ALERT] Telegram API returned error status ${res.status}:`, errText);
    } else {
      console.log(`[TELEGRAM ALERT] Alert sent successfully for "${jobTitle}"`);
    }
  } catch (err) {
    console.error('[TELEGRAM ALERT] Error sending Telegram message:', err);
  }
}

