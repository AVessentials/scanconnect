const FAST2SMS_API_URL = "https://www.fast2sms.com/dev/bulkV2";

function getApiKey(): string | null {
  return process.env.FAST2SMS_API_KEY || null;
}

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Send an OTP via SMS using Fast2SMS (or log to console in dev mode).
 */
export async function sendOtpSms(
  phone: string,
  otp: string
): Promise<{ success: true } | { success: false; error: string }> {
  const cleanPhone = phone.replace(/\D/g, "");
  const apiKey = getApiKey();

  if (!apiKey) {
    console.log("═══════════════════════════════════════════");
    console.log("  🧪 DEV MODE OTP");
    console.log(`  📱 Phone: ${cleanPhone}`);
    console.log(`  🔑 OTP:   ${otp}`);
    console.log("═══════════════════════════════════════════");
    return { success: true };
  }

  try {
    const res = await fetch(FAST2SMS_API_URL, {
      method: "POST",
      headers: {
        authorization: apiKey,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        numbers: cleanPhone,
      }),
    });

    const data = await res.json();

    if (data.return === true) {
      return { success: true };
    }

    console.error("Fast2SMS error:", data);
    return {
      success: false,
      error: data.message || "Failed to send OTP. Please try again.",
    };
  } catch (err) {
    console.error("Fast2SMS request failed:", err);
    return {
      success: false,
      error: "Could not send OTP. Check your network and try again.",
    };
  }
}

/**
 * Send a custom notification SMS via Fast2SMS Quick SMS route.
 * Logs to console in dev mode when no API key is set.
 */
export async function sendSmsNotification(
  phone: string,
  message: string
): Promise<{ success: true } | { success: false; error: string }> {
  const cleanPhone = phone.replace(/\D/g, "");
  const apiKey = getApiKey();

  if (!apiKey) {
    console.log("═══════════════════════════════════════════");
    console.log("  🧪 DEV MODE SMS NOTIFICATION");
    console.log(`  📱 To: ${cleanPhone}`);
    console.log(`  📝 Message: ${message}`);
    console.log("═══════════════════════════════════════════");
    return { success: true };
  }

  try {
    const res = await fetch(FAST2SMS_API_URL, {
      method: "POST",
      headers: {
        authorization: apiKey,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        route: "q", // Quick SMS route for custom messages
        message,
        numbers: cleanPhone,
        language: "english",
      }),
    });

    const data = await res.json();

    if (data.return === true) {
      return { success: true };
    }

    console.error("Fast2SMS notification error:", data);
    return {
      success: false,
      error: data.message || "Failed to send notification.",
    };
  } catch (err) {
    console.error("Fast2SMS notification request failed:", err);
    return {
      success: false,
      error: "Could not send notification.",
    };
  }
}
