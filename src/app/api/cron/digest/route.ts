import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailNotification } from "@/lib/email";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  // Authenticate via CRON_SECRET
  const authHeader = request.headers.get("authorization") || "";
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS);

    // Find owners who have digest enabled and an email
    const owners = await prisma.owner.findMany({
      where: {
        digestEnabled: true,
        email: { not: "" },
      },
      select: {
        id: true,
        name: true,
        email: true,
        lastViewedNotificationsAt: true,
      },
    });

    const results: { email: string; sent: boolean; reason: string }[] = [];

    for (const owner of owners) {
      // Skip if they've viewed notifications within the last 24 hours
      if (owner.lastViewedNotificationsAt && owner.lastViewedNotificationsAt > cutoff) {
        results.push({
          email: owner.email,
          sent: false,
          reason: "Viewed notifications within last 24h",
        });
        continue;
      }

      // Find unviewed requests (created after lastViewed or all time if never viewed)
      const since = owner.lastViewedNotificationsAt || new Date(0);
      const unviewed = await prisma.contactRequest.findMany({
        where: {
          createdAt: { gt: since },
          sticker: { ownerId: owner.id },
        },
        select: {
          id: true,
          callerName: true,
          message: true,
          createdAt: true,
          sticker: { select: { label: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      if (unviewed.length === 0) {
        results.push({
          email: owner.email,
          sent: false,
          reason: "No unviewed requests",
        });
        continue;
      }

      // Build digest email content
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const dashboardUrl = `${baseUrl}/dashboard/notifications`;

      const itemsList = unviewed
        .map(
          (r, i) =>
            `${i + 1}. ${r.callerName || "Someone"}${
              r.sticker.label ? ` (via ${r.sticker.label})` : ""
            } — ${r.message || "Sent a message"}`
        )
        .join("\n");

      const textBody = [
        `Hi ${owner.name},\n`,
        `You have ${unviewed.length} unread contact request${unviewed.length !== 1 ? "s" : ""} on ScanConnect since your last visit.\n`,
        itemsList,
        `\n───\nView all requests: ${dashboardUrl}\n`,
        `To change your notification preferences, visit your settings: ${baseUrl}/dashboard/settings`,
      ].join("\n");

      const htmlBody = buildDigestHtml({
        ownerName: owner.name,
        unreadCount: unviewed.length,
        requests: unviewed.map((r) => ({
          callerName: r.callerName || "Someone",
          label: r.sticker.label || undefined,
          message: r.message || undefined,
          time: r.createdAt.toISOString(),
        })),
        dashboardUrl,
        settingsUrl: `${baseUrl}/dashboard/settings`,
      });

      const result = await sendEmailNotification(owner.email, {
        subject: `ScanConnect — ${unviewed.length} new request${unviewed.length !== 1 ? "s" : ""} since your last visit`,
        text: textBody,
        html: htmlBody,
      });

      results.push({
        email: owner.email,
        sent: result.success,
        reason: result.success ? "Sent" : `Failed: ${result.error}`,
      });
    }

    return NextResponse.json({
      ok: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Digest cron error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

// ── Digest HTML template ────────────────────────────────────────────────────

function buildDigestHtml({
  ownerName,
  unreadCount,
  requests,
  dashboardUrl,
  settingsUrl,
}: {
  ownerName: string;
  unreadCount: number;
  requests: { callerName: string; label?: string; message?: string; time: string }[];
  dashboardUrl: string;
  settingsUrl: string;
}) {
  const requestRows = requests
    .map(
      (r) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="36" valign="top" style="padding-right: 12px;">
              <table cellpadding="0" cellspacing="0" style="width: 36px; height: 36px; border-radius: 50%; background: #d1fae5; text-align: center;">
                <tr>
                  <td style="font-size: 14px; font-weight: 700; color: #059669; text-align: center; vertical-align: middle;">
                    ${escapeHtml(r.callerName.charAt(0).toUpperCase())}
                  </td>
                </tr>
              </table>
            </td>
            <td>
              <div style="font-size: 14px; font-weight: 600; color: #18181b;">
                ${escapeHtml(r.callerName)}
                ${r.label ? `<span style="font-size: 12px; color: #71717a; font-weight: 400;"> — via ${escapeHtml(r.label)}</span>` : ""}
              </div>
              ${r.message ? `<div style="font-size: 13px; color: #52525b; margin-top: 2px;">${escapeHtml(r.message)}</div>` : ""}
              <div style="font-size: 11px; color: #a1a1aa; margin-top: 2px;">
                ${new Date(r.time).toLocaleString()}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="light">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 32px 24px; text-align: center;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: #ffffff; display: inline-block; vertical-align: middle; line-height: 48px; font-size: 24px; font-weight: 800; color: #059669;">SC</div>
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 16px 0 4px;">Daily Digest</h1>
              <p style="color: #a7f3d0; font-size: 14px; margin: 0;">
                ${unreadCount} new request${unreadCount !== 1 ? "s" : ""} since your last visit
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 32px 8px;">
              <p style="font-size: 15px; color: #18181b; margin: 0;">
                Hi ${escapeHtml(ownerName)},
              </p>
              <p style="font-size: 14px; color: #52525b; margin: 8px 0 0;">
                Here&rsquo;s what you missed on ScanConnect while you were away:
              </p>
            </td>
          </tr>

          <!-- Requests list -->
          <tr>
            <td style="padding: 8px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${requestRows}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 16px 32px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: #18181b; border-radius: 12px; padding: 12px 28px; text-align: center;">
                    <a href="${escapeHtml(dashboardUrl)}" style="color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; display: block;">
                      View all requests →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #a1a1aa; margin: 0;">
                You&rsquo;re receiving this because you enabled daily digests in your
                <a href="${escapeHtml(settingsUrl)}" style="color: #059669; text-decoration: underline;">notification settings</a>.
              </p>
              <p style="font-size: 12px; color: #a1a1aa; margin: 8px 0 0;">
                ScanConnect — Stay connected with your customers.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
