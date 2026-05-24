/**
 * Email notification service using Resend API.
 *
 * Resend has a simple HTTP API: https://resend.com/docs/api-reference/emails/send-email
 * Just needs a Bearer token and a POST to https://api.resend.com/emails
 *
 * In dev mode (no API key set), emails are logged to console.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

function getApiKey(): string | null {
  return process.env.RESEND_API_KEY || null;
}

function getFromEmail(): string {
  return process.env.EMAIL_FROM || "ScanConnect <noreply@scanconnect.in>";
}

export type EmailResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Send an email notification via Resend (or log to console in dev mode).
 */
export async function sendEmailNotification(
  to: string,
  payload: {
    subject: string;
    text: string;
    html?: string;
  },
): Promise<EmailResult> {
  const apiKey = getApiKey();

  // Dev mode — log to console
  if (!apiKey) {
    console.log("═══════════════════════════════════════════");
    console.log("  🧪 DEV MODE EMAIL NOTIFICATION");
    console.log(`  📧 To:      ${to}`);
    console.log(`  📧 Subject: ${payload.subject}`);
    console.log(`  📝 Body:    ${payload.text}`);
    console.log("═══════════════════════════════════════════");
    return { success: true };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: [to],
        subject: payload.subject,
        text: payload.text,
        ...(payload.html ? { html: payload.html } : {}),
      }),
    });

    const data = await res.json();

    if (res.ok && data.id) {
      return { success: true };
    }

    console.error("Resend API error:", data);
    return {
      success: false,
      error: data?.message || data?.error || "Failed to send email notification.",
    };
  } catch (err) {
    console.error("Resend API request failed:", err);
    return {
      success: false,
      error: "Could not send email notification.",
    };
  }
}
