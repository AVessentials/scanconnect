/**
 * HTML email templates for ScanConnect notification emails.
 * Uses inline styles for maximum email client compatibility.
 */

interface ContactRequestEmailProps {
  callerName: string;
  message: string;
  ownerName: string;
  carLabel?: string | null;
  dashboardUrl: string;
}

export function getContactRequestHtml(props: ContactRequestEmailProps): string {
  const { callerName, message, ownerName, carLabel, dashboardUrl } = props;
  const preview = `New message from ${callerName} via ScanConnect`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${escapeHtml(preview)}</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #f5f5f4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
">
  <!--[if mso]>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;"><tr><td align="center">
  <![endif]-->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <!-- Main Card -->
        <table cellpadding="0" cellspacing="0" style="
          max-width: 520px;
          width: 100%;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
        ">
          <!-- Header Gradient -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #10b981, #059669);
              padding: 36px 32px 28px;
              text-align: center;
            ">
              <!-- Logo placeholder -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="
                    width: 48px;
                    height: 48px;
                    background-color: rgba(255,255,255,0.2);
                    border-radius: 14px;
                    text-align: center;
                    vertical-align: middle;
                  ">
                    <span style="
                      font-size: 22px;
                      line-height: 48px;
                      color: #ffffff;
                    ">📎</span>
                  </td>
                </tr>
              </table>
              <h1 style="
                margin: 16px 0 4px;
                font-size: 20px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: -0.3px;
              ">
                ScanConnect
              </h1>
              <p style="
                margin: 0;
                font-size: 14px;
                color: rgba(255,255,255,0.85);
              ">
                New contact request received
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px 24px;">
              <!-- Greeting -->
              <p style="
                margin: 0 0 4px;
                font-size: 14px;
                color: #78716c;
              ">
                Hello${ownerName ? ` ${escapeHtml(ownerName)}` : ''},
              </p>
              <p style="
                margin: 0 0 20px;
                font-size: 15px;
                color: #44403c;
                line-height: 1.5;
              ">
                Someone wants to get in touch with you through your ScanConnect sticker${carLabel ? ` on <strong>${escapeHtml(carLabel)}</strong>` : ''}.
              </p>

              <!-- Sender Info Card -->
              <table cellpadding="0" cellspacing="0" style="
                width: 100%;
                background-color: #fafaf9;
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 20px;
              ">
                <tr>
                  <td style="
                    width: 40px;
                    vertical-align: top;
                  ">
                    <table cellpadding="0" cellspacing="0" style="
                      width: 36px;
                      height: 36px;
                      background-color: #d1fae5;
                      border-radius: 10px;
                    ">
                      <tr>
                        <td style="text-align: center; vertical-align: middle;">
                          <span style="
                            font-size: 16px;
                            font-weight: 700;
                            color: #059669;
                            line-height: 36px;
                          ">
                            ${escapeHtml(getInitials(callerName))}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <p style="
                      margin: 0 0 2px;
                      font-size: 15px;
                      font-weight: 600;
                      color: #292524;
                    ">
                      ${escapeHtml(callerName)}
                    </p>
                    <p style="
                      margin: 0;
                      font-size: 13px;
                      color: #a8a29e;
                    ">
                      Sent a message just now
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Message Bubble -->
              <table cellpadding="0" cellspacing="0" style="
                width: 100%;
                background-color: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 24px;
              ">
                <tr>
                  <td>
                    <p style="
                      margin: 0 0 6px;
                      font-size: 11px;
                      font-weight: 600;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                      color: #16a34a;
                    ">
                      Message
                    </p>
                    <p style="
                      margin: 0;
                      font-size: 14px;
                      color: #292524;
                      line-height: 1.6;
                      word-wrap: break-word;
                    ">
                      ${escapeHtml(message)}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="
                          background-color: #18181b;
                          border-radius: 12px;
                          text-align: center;
                        ">
                          <a href="${escapeHtml(dashboardUrl)}" target="_blank" style="
                            display: inline-block;
                            padding: 13px 28px;
                            font-size: 14px;
                            font-weight: 600;
                            color: #ffffff;
                            text-decoration: none;
                            background-color: #18181b;
                            border-radius: 12px;
                          ">
                            View in Dashboard →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Delivery Status Hint -->
              <table cellpadding="0" cellspacing="0" style="
                width: 100%;
                background-color: #fefce8;
                border: 1px solid #fde68a;
                border-radius: 10px;
                padding: 12px 16px;
                margin-bottom: 8px;
              ">
                <tr>
                  <td style="width: 20px; vertical-align: top;">
                    <span style="font-size: 14px;">💡</span>
                  </td>
                  <td style="padding-left: 8px;">
                    <p style="
                      margin: 0;
                      font-size: 12px;
                      color: #a16207;
                      line-height: 1.4;
                    ">
                      This is a notification-only email. Reply to the sender by calling or messaging them through your ScanConnect dashboard.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 28px;">
                <tr>
                  <td style="
                    border-top: 1px solid #e7e5e4;
                    padding-top: 16px;
                    text-align: center;
                  ">
                    <p style="
                      margin: 0 0 4px;
                      font-size: 11px;
                      color: #a8a29e;
                    ">
                      ScanConnect — Never leave a note again
                    </p>
                    <p style="
                      margin: 0;
                      font-size: 11px;
                      color: #d6d3d1;
                    ">
                      <a href="${escapeHtml(dashboardUrl)}" style="color: #a8a29e; text-decoration: underline;">Dashboard</a>
                      &nbsp;·&nbsp;
                      <a href="${escapeHtml(dashboardUrl.replace('/notifications', '/settings'))}" style="color: #a8a29e; text-decoration: underline;">Notification Settings</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Unsubscribe / footer note -->
        <p style="
          margin: 16px 0 0;
          font-size: 11px;
          color: #a8a29e;
          text-align: center;
        ">
          You received this email because someone scanned your ScanConnect sticker.
          <br />
          To stop receiving email notifications, disable the Email channel in your
          <a href="${escapeHtml(dashboardUrl.replace('/notifications', '/settings'))}" style="color: #a8a29e; text-decoration: underline;">notification settings</a>.
        </p>
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td></tr></table>
  <![endif]-->
</body>
</html>`;
}

/**
 * Plain text fallback for email notifications.
 */
export function getContactRequestText(props: ContactRequestEmailProps): string {
  const { callerName, message, ownerName, carLabel, dashboardUrl } = props;

  return [
    `Hello${ownerName ? ` ${ownerName}` : ''},`,
    '',
    `Someone wants to get in touch with you through your ScanConnect sticker${carLabel ? ` on "${carLabel}"` : ''}.`,
    '',
    `━━━ From: ${callerName} ━━━`,
    '',
    `${message}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    `View in Dashboard: ${dashboardUrl}`,
    '',
    '---',
    'ScanConnect — Never leave a note again',
    `Manage notification settings: ${dashboardUrl.replace('/notifications', '/settings')}`,
  ].join('\n');
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}
