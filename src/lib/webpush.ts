/**
 * Web Push notification utility.
 *
 * In production, set the following env vars:
 *   VAPID_PUBLIC_KEY  — generated via `npx web-push generate-vapid-keys`
 *   VAPID_PRIVATE_KEY — generated via `npx web-push generate-vapid-keys`
 *   VAPID_SUBJECT    — mailto:your-email@example.com
 *
 * In dev mode (no VAPID keys set), push notifications are logged to console.
 */

import type { PushSubscription } from "@prisma/client";

function getVapidKeys() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@scanconnect.in";
  return { publicKey, privateKey, subject };
}

export type PushResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Send a push notification to a single subscription.
 */
export async function sendPushNotification(
  subscription: Pick<PushSubscription, "endpoint" | "p256dh" | "auth">,
  payload: { title: string; body: string; url?: string },
): Promise<PushResult> {
  const { publicKey, privateKey, subject } = getVapidKeys();

  // Dev mode — log to console
  if (!publicKey || !privateKey) {
    console.log("═══════════════════════════════════════════");
    console.log("  🧪 DEV MODE PUSH NOTIFICATION");
    console.log(`  📨 Title: ${payload.title}`);
    console.log(`  📝 Body:  ${payload.body}`);
    console.log(`  🔗 URL:   ${payload.url || "/dashboard/notifications"}`);
    console.log("═══════════════════════════════════════════");
    return { success: true };
  }

  try {
    // Dynamic import so web-push is not a hard dependency in dev
    const webpush = await import("web-push");

    webpush.default.setVapidDetails(subject, publicKey, privateKey);

    await webpush.default.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload),
    );

    return { success: true };
  } catch (err: any) {
    // Subscription is expired or invalid — the caller should delete it
    if (err?.statusCode === 410 || err?.statusCode === 404) {
      return { success: false, error: "subscription_expired" };
    }
    console.error("Web Push error:", err);
    return { success: false, error: err?.message || "Failed to send push notification" };
  }
}
