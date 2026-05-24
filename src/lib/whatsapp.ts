/**
 * WhatsApp Cloud API integration.
 *
 * To use this in production:
 * 1. Create a Meta Business account: https://business.facebook.com/
 * 2. Set up a WhatsApp Business Account in Meta Business Suite
 * 3. Create a message template (e.g., "scanconnect_notification")
 *    with variables: {{1}} = sender name, {{2}} = message preview
 * 4. Set the following environment variables:
 *    - WHATSAPP_TOKEN (permanent access token from Meta)
 *    - WHATSAPP_PHONE_ID (the business phone number ID)
 *    - WHATSAPP_TEMPLATE_NAME (your approved template name, default: "scanconnect_notification")
 *
 * In dev mode (no token set), messages are logged to console.
 */

const API_VERSION = "v22.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

function getToken(): string | null {
  return process.env.WHATSAPP_TOKEN || null;
}

function getPhoneId(): string | null {
  return process.env.WHATSAPP_PHONE_ID || null;
}

function getTemplateName(): string {
  return process.env.WHATSAPP_TEMPLATE_NAME || "scanconnect_notification";
}

export type WhatsAppResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Send a WhatsApp notification to a recipient using an approved template.
 * Falls back to console.log in dev mode.
 */
export async function sendWhatsAppNotification(
  to: string,
  params: { callerName?: string; messagePreview: string }
): Promise<WhatsAppResult> {
  const token = getToken();
  const phoneId = getPhoneId();
  const cleanPhone = to.replace(/\D/g, "");

  // Dev mode — log to console
  if (!token || !phoneId) {
    console.log("═══════════════════════════════════════════");
    console.log("  🧪 DEV MODE WHATSAPP NOTIFICATION");
    console.log(`  📱 To: ${cleanPhone}`);
    console.log(`  👤 From: ${params.callerName || "Someone"}`);
    console.log(`  📝 Message: ${params.messagePreview}`);
    console.log("═══════════════════════════════════════════");
    return { success: true };
  }

  try {
    const res = await fetch(`${BASE_URL}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "template",
        template: {
          name: getTemplateName(),
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: params.callerName || "Someone" },
                { type: "text", text: params.messagePreview },
              ],
            },
          ],
        },
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return { success: true };
    }

    console.error("WhatsApp API error:", data);
    return {
      success: false,
      error: data?.error?.message || "Failed to send WhatsApp notification.",
    };
  } catch (err) {
    console.error("WhatsApp API request failed:", err);
    return {
      success: false,
      error: "Could not send WhatsApp notification.",
    };
  }
}
