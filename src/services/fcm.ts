/**
 * Firebase Cloud Messaging (FCM) Service for Mobile App Push Notifications
 * Supports topic broadcasting and direct device messaging
 */

export interface FcmNotificationPayload {
  topic?: string;
  token?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Send an FCM notification to a topic or specific token.
 * Supports:
 * 1. FCM Server Key (env.FCM_SERVER_KEY) -> Legacy FCM HTTP endpoint
 * 2. FCM v1 OAuth2 Bearer Token (env.FCM_ACCESS_TOKEN & env.FIREBASE_PROJECT_ID)
 * 3. Custom Push Webhook (env.PUSH_WEBHOOK_URL)
 */
export async function sendFcmNotification(
  env: any,
  payload: FcmNotificationPayload
): Promise<{ success: boolean; message?: string }> {
  const { topic = 'turkey_jobs', token, title, body, data = {} } = payload;

  const fcmServerKey = env?.FCM_SERVER_KEY;
  const fcmAccessToken = env?.FCM_ACCESS_TOKEN;
  const fcmProjectId = env?.FIREBASE_PROJECT_ID;
  const pushWebhookUrl = env?.PUSH_WEBHOOK_URL;

  if (!fcmServerKey && !fcmAccessToken && !pushWebhookUrl) {
    console.warn('[FCM] No FCM_SERVER_KEY, FCM_ACCESS_TOKEN or PUSH_WEBHOOK_URL found in environment. Skipping push notification.');
    return { success: false, message: 'FCM not configured in server environment' };
  }

  // 1. Direct FCM Legacy HTTP API (Topic or Token)
  if (fcmServerKey) {
    try {
      const recipient = token ? token : `/topics/${topic}`;
      const fcmBody = {
        to: recipient,
        priority: 'high',
        notification: {
          title,
          body,
          sound: 'default',
          android_channel_id: 'high_importance_channel',
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        data: {
          ...data,
          title,
          body,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
      };

      const res = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${fcmServerKey}`
        },
        body: JSON.stringify(fcmBody),
        signal: AbortSignal.timeout(8000)
      });

      if (res.ok) {
        console.log(`[FCM] Notification sent successfully to ${recipient}: "${title}"`);
        return { success: true };
      } else {
        const errorText = await res.text();
        console.error(`[FCM ERROR] FCM send failed with status ${res.status}:`, errorText);
        return { success: false, message: errorText };
      }
    } catch (err: any) {
      console.error('[FCM EXCEPTION] Error calling FCM Legacy API:', err);
      return { success: false, message: err?.message };
    }
  }

  // 2. FCM HTTP v1 API
  if (fcmAccessToken && fcmProjectId) {
    try {
      const messageTarget = token ? { token } : { topic };
      const v1Body = {
        message: {
          ...messageTarget,
          notification: {
            title,
            body
          },
          data: {
            ...data,
            title,
            body
          },
          android: {
            priority: 'high',
            notification: {
              channel_id: 'high_importance_channel',
              sound: 'default'
            }
          }
        }
      };

      const res = await fetch(`https://fcm.googleapis.com/v1/projects/${fcmProjectId}/messages:send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fcmAccessToken}`
        },
        body: JSON.stringify(v1Body),
        signal: AbortSignal.timeout(8000)
      });

      if (res.ok) {
        console.log(`[FCM v1] Notification sent successfully: "${title}"`);
        return { success: true };
      } else {
        const errorText = await res.text();
        console.error(`[FCM v1 ERROR] status ${res.status}:`, errorText);
        return { success: false, message: errorText };
      }
    } catch (err: any) {
      console.error('[FCM v1 EXCEPTION]:', err);
      return { success: false, message: err?.message };
    }
  }

  // 3. Custom Push Webhook
  if (pushWebhookUrl) {
    try {
      const res = await fetch(pushWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000)
      });
      return { success: res.ok };
    } catch (err: any) {
      console.error('[PUSH WEBHOOK ERROR]:', err);
      return { success: false, message: err?.message };
    }
  }

  return { success: false, message: 'Unknown configuration' };
}

/**
 * Trigger an FCM push alert when a new job is scraped or published
 */
export async function sendFcmJobNotification(
  env: any,
  job: {
    id?: string;
    title: string;
    companyName?: string;
    location?: string;
    slug: string;
  }
) {
  const company = job.companyName ? ` في ${job.companyName}` : '';
  const loc = job.location ? ` (${job.location})` : '';
  
  return sendFcmNotification(env, {
    topic: 'turkey_jobs',
    title: '💼 وظيفة جديدة في إسطنبول!',
    body: `${job.title}${company}${loc}`,
    data: {
      screen: 'job_details',
      type: 'job',
      id: job.id || '',
      slug: job.slug,
      url: `https://jobs-in-istanbul.com/ar/jobs/${job.slug}`
    }
  });
}

/**
 * Trigger an FCM push alert when currency rates or gold prices are updated
 */
export async function sendFcmRatesNotification(
  env: any,
  type: 'currency' | 'gold',
  summaryText: string
) {
  const isCurrency = type === 'currency';
  const topic = isCurrency ? 'turkey_currencies' : 'turkey_gold';
  const title = isCurrency ? '📈 تحديث أسعار العملات في تركيا' : '🪙 تحديث أسعار الذهب في تركيا';

  return sendFcmNotification(env, {
    topic,
    title,
    body: summaryText,
    data: {
      screen: isCurrency ? 'currency' : 'gold',
      type: isCurrency ? 'currency_update' : 'gold_update',
      timestamp: Date.now().toString()
    }
  });
}
