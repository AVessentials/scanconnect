import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import SoundPreviewButton from "@/components/SoundPreviewButton";

export const dynamic = "force-dynamic";

// ── Env var status helpers ──────────────────────────────────────────────────

type ChannelStatus = "connected" | "dev_mode" | "not_configured";

function checkSmsStatus(): ChannelStatus {
  const key = process.env.FAST2SMS_API_KEY;
  if (!key) return "dev_mode";
  return key.length > 5 ? "connected" : "not_configured";
}

function checkWhatsAppStatus(): ChannelStatus {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token && !phoneId) return "dev_mode";
  return token && phoneId && token.length > 5 && phoneId.length > 5
    ? "connected"
    : "not_configured";
}

function checkEmailStatus(): ChannelStatus {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "dev_mode";
  return key.length > 5 ? "connected" : "not_configured";
}

function checkPushStatus(): ChannelStatus {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub && !priv) return "dev_mode";
  return pub && priv && pub.length > 20 && priv.length > 20
    ? "connected"
    : "not_configured";
}

// ── Owner lookup ────────────────────────────────────────────────────────────

async function getOwner() {
  const adminOwnerId = process.env.ADMIN_OWNER_ID;
  if (adminOwnerId) {
    const owner = await prisma.owner.findUnique({ where: { id: adminOwnerId } });
    if (owner) return owner;
  }
  return prisma.owner.findFirst({ orderBy: { createdAt: "asc" } });
}

// ── Server action ───────────────────────────────────────────────────────────

async function updatePreferences(formData: FormData) {
  "use server";

  const ownerId = formData.get("ownerId") as string;
  if (!ownerId) return;

  const smsEnabled = formData.get("smsEnabled") === "on";
  const whatsappEnabled = formData.get("whatsappEnabled") === "on";
  const emailEnabled = formData.get("emailEnabled") === "on";
  const pushEnabled = formData.get("pushEnabled") === "on";
  const raw = parseInt(formData.get("pollIntervalSecs") as string, 10);
  const pollIntervalSecs = Number.isNaN(raw) ? 30 : Math.min(300, Math.max(5, raw));

  const soundEnabled = formData.get("soundEnabled") === "on";
  const browserNotificationsEnabled = formData.get("browserNotificationsEnabled") === "on";
  const notificationSound = formData.get("notificationSound") as string;
  const digestEnabled = formData.get("digestEnabled") === "on";

  await prisma.owner.update({
    where: { id: ownerId },
    data: {
      smsEnabled,
      whatsappEnabled,
      emailEnabled,
      pushEnabled,
      pollIntervalSecs,
      soundEnabled,
      browserNotificationsEnabled,
      notificationSound: ["chime", "bell", "silent"].includes(notificationSound)
        ? notificationSound
        : "chime",
      digestEnabled,
    },
  });

  revalidatePath("/dashboard/settings");
}

// ── Status badge component ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: ChannelStatus }) {
  const styles: Record<ChannelStatus, { label: string; bg: string; text: string; dot: string }> = {
    connected: {
      label: "Connected",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900",
      text: "text-emerald-700 dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
    dev_mode: {
      label: "Dev Mode",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
      text: "text-amber-700 dark:text-amber-300",
      dot: "bg-amber-400",
    },
    not_configured: {
      label: "Not Configured",
      bg: "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700",
      text: "text-zinc-500 dark:text-zinc-400",
      dot: "bg-zinc-300 dark:bg-zinc-600",
    },
  };

  const s = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Setup guide components ──────────────────────────────────────────────────

function EnvVarRow({ varName, value, link }: { varName: string; value: string | undefined; link?: string }) {
  const isSet = !!value && value.length > 0;
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${isSet ? "bg-emerald-500" : "bg-zinc-300"}`}
        />
        <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{varName}</code>
        {isSet ? (
          <span className="text-[10px] text-emerald-600 font-medium">✓ Set</span>
        ) : (
          <span className="text-[10px] text-zinc-400 font-medium">Not set</span>
        )}
      </div>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-blue-600 hover:text-blue-800 underline shrink-0 ml-2"
        >
          Get one →
        </a>
      )}
    </div>
  );
}

function SetupGuide({ children }: { children: React.ReactNode }) {
  return (
    <details className="group mt-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
      <summary className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer list-none select-none rounded">
        <svg
          className="w-3.5 h-3.5 transition-transform group-open:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Setup Guide
      </summary>
      <div className="mt-3 space-y-0 text-xs text-zinc-600 dark:text-zinc-400">{children}</div>
    </details>
  );
}

function Step({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 py-1.5">
      <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
        {num}
      </span>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default async function SettingsPage() {
  const owner = await getOwner();

  // Read env var statuses once
  const smsStatus = checkSmsStatus();
  const waStatus = checkWhatsAppStatus();
  const emailStatus = checkEmailStatus();
  const pushStatus = checkPushStatus();

  const channelCounts = {
    connected: [smsStatus, waStatus, emailStatus, pushStatus].filter((s) => s === "connected").length,
    devMode: [smsStatus, waStatus, emailStatus, pushStatus].filter((s) => s === "dev_mode").length,
  };

  if (!owner) {
    return (
      <div className="space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Notification Channels</h1>
        </div>            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">No owner profile found</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">Create an owner profile first to configure notification channels.</p>
        </div>
      </div>
    );
  }

  const hasEmail = !!owner.email;

  // ── Setup guide content per channel ─────────────────────────────────────

  const smsGuide = (
    <>
      <p className="mb-2 font-medium text-zinc-700">Environment Variables</p>
      <EnvVarRow varName="FAST2SMS_API_KEY" value={process.env.FAST2SMS_API_KEY} link="https://www.fast2sms.com/" />
      <p className="mt-3 font-medium text-zinc-700">How to set up</p>
      <Step num={1}>
        Sign up at{" "}
        <a href="https://www.fast2sms.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          fast2sms.com
        </a>{" "}
        (India only)
      </Step>
      <Step num={2}>Generate an API key from your Fast2SMS dashboard</Step>
      <Step num={3}>
        Add it to              <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">.env.local</code>:                <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-200 dark:text-zinc-300 p-2 rounded-lg mt-1 text-[10px] overflow-x-auto">FAST2SMS_API_KEY=&quot;your-api-key-here&quot;</pre>
      </Step>
      <Step num={4}>SMS notifications use the Quick SMS route to send real-time alerts</Step>
      <p className="mt-3 text-[10px] text-zinc-400 dark:text-zinc-500 italic">
        Without the API key, SMS notifications are logged to the console in dev mode.
      </p>
    </>
  );

  const waGuide = (
    <>
      <p className="mb-2 font-medium text-zinc-700">Environment Variables</p>
      <EnvVarRow varName="WHATSAPP_TOKEN" value={process.env.WHATSAPP_TOKEN ? "••••••" + (process.env.WHATSAPP_TOKEN.length > 10 ? process.env.WHATSAPP_TOKEN.slice(-4) : "") : undefined} link="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" />
      <EnvVarRow varName="WHATSAPP_PHONE_ID" value={process.env.WHATSAPP_PHONE_ID} />
      <EnvVarRow varName="WHATSAPP_TEMPLATE_NAME" value={process.env.WHATSAPP_TEMPLATE_NAME} />
      <p className="mt-3 font-medium text-zinc-700">How to set up</p>
      <Step num={1}>
        Create a{" "}
        <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          Meta Business account
        </a>
      </Step>
      <Step num={2}>
        Set up a{" "}
        <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          WhatsApp Business Account
        </a>{" "}
        in Meta Business Suite
      </Step>
      <Step num={3}>
        Create a message template (name defaults to{" "}
                     <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">scanconnect_notification</code>)
        with body variables:              <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">{`{{1}}`}</code> = sender name,{" "}
                     <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">{`{{2}}`}</code> = message preview
      </Step>
      <Step num={4}>Generate a permanent access token from the Meta Developer Console</Step>
      <Step num={5}>Find your phone number ID in WhatsApp Business Account settings</Step>
      <Step num={6}>
        Add to              <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">.env.local</code>:                <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-200 dark:text-zinc-300 p-2 rounded-lg mt-1 text-[10px] overflow-x-auto">WHATSAPP_TOKEN=&quot;your-token&quot;
WHATSAPP_PHONE_ID=&quot;your-phone-id&quot;</pre>
      </Step>
      <p className="mt-3 text-[10px] text-zinc-400 italic">
        Without credentials, WhatsApp notifications are logged to the console in dev mode.
      </p>
    </>
  );

  const emailGuide = (
    <>
      <p className="mb-2 font-medium text-zinc-700">Environment Variables</p>
      <EnvVarRow varName="RESEND_API_KEY" value={process.env.RESEND_API_KEY ? "re_" + process.env.RESEND_API_KEY.slice(3, 8) + "…" : undefined} link="https://resend.com/" />
      <EnvVarRow varName="EMAIL_FROM" value={process.env.EMAIL_FROM} />
      <p className="mt-3 font-medium text-zinc-700">How to set up</p>
      <Step num={1}>
        Sign up at{" "}
        <a href="https://resend.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          resend.com
        </a>{" "}
        (3,000 free emails/month)
      </Step>
      <Step num={2}>
        Generate an API key from the Resend dashboard
      </Step>
      <Step num={3}>Verify a domain or use the default              <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">@resend.dev</code> for testing</Step>
      <Step num={4}>
        Add to              <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">.env.local</code>:                <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-200 dark:text-zinc-300 p-2 rounded-lg mt-1 text-[10px] overflow-x-auto">RESEND_API_KEY=&quot;re_your-api-key&quot;
EMAIL_FROM=&quot;ScanConnect &lt;noreply@yourdomain.com&gt;&quot;</pre>
      </Step>
      <p className="mt-3 text-[10px] text-zinc-400 italic">
        Without the API key, emails are logged to the console in dev mode.
      </p>
    </>
  );

  const pushGuide = (
    <>
      <p className="mb-2 font-medium text-zinc-700">Environment Variables</p>
      <EnvVarRow varName="VAPID_PUBLIC_KEY" value={process.env.VAPID_PUBLIC_KEY ? process.env.VAPID_PUBLIC_KEY.slice(0, 20) + "…" : undefined} />
      <EnvVarRow varName="VAPID_PRIVATE_KEY" value={process.env.VAPID_PRIVATE_KEY ? "••••" + process.env.VAPID_PRIVATE_KEY.slice(-4) : undefined} />
      <EnvVarRow varName="VAPID_SUBJECT" value={process.env.VAPID_SUBJECT} />
      <p className="mt-3 font-medium text-zinc-700">How to set up</p>
      <Step num={1}>
        Run this command to generate VAPID keys:                <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-200 dark:text-zinc-300 p-2 rounded-lg mt-1 text-[10px] overflow-x-auto">npx web-push generate-vapid-keys</pre>
      </Step>
      <Step num={2}>
        Add the keys to              <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">.env.local</code>:                <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-200 dark:text-zinc-300 p-2 rounded-lg mt-1 text-[10px] overflow-x-auto">VAPID_PUBLIC_KEY=&quot;your-public-key&quot;
VAPID_PRIVATE_KEY=&quot;your-private-key&quot;
VAPID_SUBJECT=&quot;mailto:admin@yourdomain.com&quot;</pre>
      </Step>
      <Step num={3}>
        Push notifications are sent to all subscribed browsers when a contact request comes in
      </Step>
      <p className="mt-3 text-[10px] text-zinc-400 italic">
        Without VAPID keys, push notifications are logged to the console in dev mode.
      </p>
    </>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Notification Channels</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Configure how you receive alerts when someone scans your sticker.
              </p>
            </div>
          {/* Overview pills */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {channelCounts.connected > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {channelCounts.connected} active
              </span>
            )}
            {channelCounts.devMode > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {channelCounts.devMode} in dev mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Owner Info Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {owner.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{owner.name}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
            {owner.phone}
            {owner.whatsapp ? ` · WA: ${owner.whatsapp}` : ""}
            {owner.email ? ` · ${owner.email}` : ""}
            {!owner.email && (
              <span className="text-amber-600 ml-2 font-medium">
                No email set — email channel unavailable
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Channel Cards Grid */}
      <form action={updatePreferences} className="space-y-0">
        <input type="hidden" name="ownerId" value={owner.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ── SMS ── */}
          <ChannelCard
            icon={
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
            }
            name="SMS"
            description={
              <>Receive SMS alerts via Fast2SMS to <strong>{owner.phone}</strong></>
            }
            checkboxName="smsEnabled"
            defaultChecked={owner.smsEnabled}
            toggleColor="emerald"
            status={smsStatus}
            guide={smsGuide}
          />

          {/* ── WhatsApp ── */}
          <ChannelCard
            icon={
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
            }
            name="WhatsApp"
            description={
              <>Receive WhatsApp messages via Meta Cloud API to <strong>{owner.whatsapp || owner.phone}</strong></>
            }
            checkboxName="whatsappEnabled"
            defaultChecked={owner.whatsappEnabled}
            toggleColor="green"
            status={waStatus}
            guide={waGuide}
          />

          {/* ── Email ── */}
          <ChannelCard
            icon={
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            }
            name="Email"
            description={
              owner.email ? (
                <>Receive email notifications via Resend to <strong>{owner.email}</strong></>
              ) : (
                <span className="text-amber-600">Set an email on the owner profile to enable this channel</span>
              )
            }
            checkboxName="emailEnabled"
            defaultChecked={owner.emailEnabled && !!owner.email}
            toggleColor="rose"
            status={emailStatus}
            guide={emailGuide}
            disabled={!owner.email}
          />

          {/* ── Push ── */}
          <ChannelCard
            icon={
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
            }
            name="Push Notifications"
            description={
              <>Send browser push notifications to all your subscribed devices</>
            }
            checkboxName="pushEnabled"
            defaultChecked={owner.pushEnabled}
            toggleColor="blue"
            status={pushStatus}
            guide={pushGuide}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-700 text-white text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-all active:scale-[0.98]"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Live Notification Settings */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Live Notification Settings</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure how the dashboard alerts you to new contact requests in real time.
          </p>
        </div>

        {/* Polling Interval */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div className="flex-1">
            <label htmlFor="pollInterval" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Polling Interval
            </label>
            <div className="flex items-center gap-3">
              <select
                id="pollInterval"
                name="pollIntervalSecs"
                defaultValue={owner.pollIntervalSecs}
                className="w-full sm:w-40 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900"
              >
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
                <option value={300}>5 minutes</option>
              </select>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                How often to check for new requests
              </span>
            </div>
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-zinc-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Sound Notifications</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Play a chime or bell when new requests arrive.
              </p>
            </div>
          </div>
          <label className="relative shrink-0 cursor-pointer">
            <input
              type="checkbox"
              name="soundEnabled"
              defaultChecked={owner.soundEnabled}
              className="sr-only peer"
            />
            <div className="w-10 h-6 rounded-full bg-zinc-200 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-4 peer-checked:bg-amber-500" />
          </label>
        </div>

        {/* Sound Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pl-11">
          <div>
            <label htmlFor="notificationSound" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Notification Sound
            </label>
            <div className="flex items-center gap-2">
              <select
                id="notificationSound"
                name="notificationSound"
                defaultValue={owner.notificationSound}
                className="w-full sm:w-44 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900"
              >
                <option value="chime">Chime (two-tone)</option>
                <option value="bell">Bell (single tone)</option>
                <option value="silent">Silent</option>
              </select>
              <SoundPreviewButton sound="chime" />
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">Chime</span>
              <SoundPreviewButton sound="bell" />
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">Bell</span>
            </div>
          </div>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Choose the sound that plays for new notifications
          </span>
        </div>

        {/* Browser Notifications Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Browser Notifications</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Show desktop notifications when new requests arrive (requires permission).
              </p>
            </div>
          </div>
          <label className="relative shrink-0 cursor-pointer">
            <input
              type="checkbox"
              name="browserNotificationsEnabled"
              defaultChecked={owner.browserNotificationsEnabled}
              className="sr-only peer"
            />
            <div className="w-10 h-6 rounded-full bg-zinc-200 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-4 peer-checked:bg-blue-500" />
          </label>
        </div>

        {/* Daily Digest Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Daily Digest Email</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                If you haven&apos;t checked the dashboard in over 24 hours, receive an email summary of missed requests.
              </p>
              {!owner.email && (
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  Set an email on the owner profile to enable this feature.
                </p>
              )}
            </div>
          </div>
          <label className="relative shrink-0 cursor-pointer">
            <input
              type="checkbox"
              name="digestEnabled"
              defaultChecked={owner.digestEnabled && !!owner.email}
              disabled={!owner.email}
              className="sr-only peer"
            />
            <div className={`w-10 h-6 rounded-full bg-zinc-200 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-4 peer-checked:bg-rose-500 ${!owner.email ? "opacity-40" : ""}`} />
          </label>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300">
            <p className="font-medium mb-1">How it works</p>
            <p>
              When someone scans your sticker and sends a message through the scan page, you&apos;ll receive notifications on the channels you&apos;ve enabled above. Disabling a channel means you won&apos;t get notified through that method — the message will still be saved and visible in your{" "}
              <Link href="/dashboard/notifications" className="underline hover:text-amber-800 dark:hover:text-amber-200">notification history</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Channel Card component ──────────────────────────────────────────────────

function ChannelCard({
  icon,
  name,
  description,
  checkboxName,
  defaultChecked,
  toggleColor,
  status,
  guide,
  disabled,
}: {
  icon: React.ReactNode;
  name: string;
  description: React.ReactNode;
  checkboxName: string;
  defaultChecked: boolean;
  toggleColor: "emerald" | "green" | "rose" | "blue";
  status: ChannelStatus;
  guide: React.ReactNode;
  disabled?: boolean;
}) {
  const toggleStyles: Record<string, string> = {
    emerald: "peer-checked:bg-emerald-500",
    green: "peer-checked:bg-green-500",
    rose: "peer-checked:bg-rose-500",
    blue: "peer-checked:bg-blue-500",
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-shadow hover:shadow-sm dark:hover:shadow-zinc-900/50">
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {icon}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</h3>
                <StatusBadge status={status} />
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 max-w-sm">{description}</p>
            </div>
          </div>
          {/* Toggle */}
          <label className="relative shrink-0 mt-1 cursor-pointer">
            <input
              type="checkbox"
              name={checkboxName}
              defaultChecked={defaultChecked}
              disabled={disabled}
              className="sr-only peer"
            />
            <div
              className={`w-10 h-6 rounded-full bg-zinc-200 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-4 ${toggleStyles[toggleColor]} ${
                disabled ? "opacity-40" : ""
              }`}
            />
          </label>
        </div>

        {/* Setup Guide */}
        <SetupGuide>{guide}</SetupGuide>
      </div>
    </div>
  );
}
