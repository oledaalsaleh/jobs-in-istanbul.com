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
  const message = `📢 *وظيفة شاغرة جديدة في إسطنبول!*\n\n` +
                  `💼 *المسمى الوظيفي:* ${jobTitle}\n` +
                  `🏢 *الشركة:* ${companyName}\n` +
                  `📍 *الموقع:* ${location}\n\n` +
                  `🔗 *رابط التفاصيل والتقديم:* [اضغط هنا للتقديم](${jobUrl})`;

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
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
