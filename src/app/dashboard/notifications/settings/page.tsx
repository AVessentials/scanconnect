import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import SoundPreviewButton from "@/components/SoundPreviewButton";

export const dynamic = "force-dynamic";

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

async function updateNotificationPreferences(formData: FormData) {
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

  revalidatePath("/dashboard/notifications/settings");
}

// ── Toggle card component ───────────────────────────────────────────────────

function ToggleCard({
  icon,
  title,
  description,
  name,
  defaultChecked,
  accentColor,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  name: string;
  defaultChecked: boolean;
  accentColor: "emerald" | "green" | "rose" | "blue" | "amber";
  disabled?: boolean;
}) {
  const toggleColors: Record<string, string> = {
    emerald: "peer-checked:bg-emerald-500",
    green: "peer-checked:bg-green-500",
    rose: "peer-checked:bg-rose-500",
    blue: "peer-checked:bg-blue-500",
    amber: "peer-checked:bg-amber-500",
  };

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900">{title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        </div>
      </div>
      <label className="relative shrink-0 mt-1 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`w-10 h-6 rounded-full bg-zinc-200 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-4 ${toggleColors[accentColor]} ${
            disabled ? "opacity-40" : ""
          }`}
        />
      </label>
    </div>
  );
}

// ── Channel icon components ─────────────────────────────────────────────────

const SmsIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  </div>
);

const WAIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  </div>
);

const EmailIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
    <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  </div>
);

const PushIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  </div>
);

const SoundIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  </div>
);

const BrowserIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  </div>
);

const DigestIcon = () => (
  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
    <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  </div>
);

// ── Main page ───────────────────────────────────────────────────────────────

export default async function NotificationSettingsPage() {
  const owner = await getOwner();

  if (!owner) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/notifications"
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors mb-2 inline-block"
          >
            ← Back to Notifications
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Notification Settings</h1>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-zinc-500 text-sm">No owner profile found</p>
          <p className="text-zinc-400 text-xs mt-1">Create an owner profile first to configure notification settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/notifications"
          className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors mb-2 inline-block"
        >
          ← Back to Notifications
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Notification Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Configure how and when you receive notification alerts.
        </p>
      </div>

      <form action={updateNotificationPreferences}>
        <input type="hidden" name="ownerId" value={owner.id} />

        {/* Notification Channels */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="font-semibold text-zinc-900">Notification Channels</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Choose which channels are used to send alerts when someone scans your sticker.
            </p>
          </div>
          <div className="px-5 divide-y divide-zinc-100">
            <ToggleCard
              icon={<SmsIcon />}
              title="SMS"
              description={`Receive SMS alerts to ${owner.phone}`}
              name="smsEnabled"
              defaultChecked={owner.smsEnabled}
              accentColor="emerald"
            />
            <ToggleCard
              icon={<WAIcon />}
              title="WhatsApp"
              description={`Receive WhatsApp messages to ${owner.whatsapp || owner.phone}`}
              name="whatsappEnabled"
              defaultChecked={owner.whatsappEnabled}
              accentColor="green"
            />
            <ToggleCard
              icon={<EmailIcon />}
              title="Email"
              description={owner.email ? `Receive email notifications to ${owner.email}` : "Set an email on your profile to enable"}
              name="emailEnabled"
              defaultChecked={owner.emailEnabled && !!owner.email}
              accentColor="rose"
              disabled={!owner.email}
            />
            <ToggleCard
              icon={<PushIcon />}
              title="Push Notifications"
              description="Send browser push notifications to all subscribed devices"
              name="pushEnabled"
              defaultChecked={owner.pushEnabled}
              accentColor="blue"
            />
          </div>
        </div>

        {/* Live Notification Preferences */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="font-semibold text-zinc-900">Live Notification Preferences</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Configure in-dashboard alerts and sounds.
            </p>
          </div>
          <div className="px-5 divide-y divide-zinc-100">
            <ToggleCard
              icon={<SoundIcon />}
              title="Sound Notifications"
              description="Play a chime or bell when new requests arrive"
              name="soundEnabled"
              defaultChecked={owner.soundEnabled}
              accentColor="amber"
            />
            <ToggleCard
              icon={<BrowserIcon />}
              title="Browser Notifications"
              description="Show desktop notifications when new requests arrive (requires permission)"
              name="browserNotificationsEnabled"
              defaultChecked={owner.browserNotificationsEnabled}
              accentColor="blue"
            />
            <ToggleCard
              icon={<DigestIcon />}
              title="Daily Digest Email"
              description={owner.email ? "Receive an email summary of missed requests if you haven't checked the dashboard in 24h" : "Set an email on your profile to enable"}
              name="digestEnabled"
              defaultChecked={owner.digestEnabled && !!owner.email}
              accentColor="rose"
              disabled={!owner.email}
            />
          </div>

          {/* Polling Interval */}
          <div className="px-5 py-4 border-t border-zinc-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex-1">
                <label htmlFor="pollInterval" className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Polling Interval
                </label>
                <p className="text-xs text-zinc-500 mb-2">
                  How often the dashboard checks for new requests.
                </p>
                <select
                  id="pollInterval"
                  name="pollIntervalSecs"
                  defaultValue={owner.pollIntervalSecs}
                  className="w-full sm:w-40 px-3 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900"
                >
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={120}>2 minutes</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sound Selection */}
          <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50/50">
            <div>
              <label htmlFor="notificationSound" className="block text-xs font-medium text-zinc-700 mb-1.5">
                Notification Sound
              </label>
              <p className="text-xs text-zinc-500 mb-2">
                Choose the sound that plays for new notifications.
              </p>
              <div className="flex items-center gap-2">
                <select
                  id="notificationSound"
                  name="notificationSound"
                  defaultValue={owner.notificationSound}
                  className="w-full sm:w-44 px-3 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900"
                >
                  <option value="chime">Chime (two-tone)</option>
                  <option value="bell">Bell (single tone)</option>
                  <option value="silent">Silent</option>
                </select>
                <SoundPreviewButton sound="chime" />
                <span className="text-[11px] text-zinc-400 font-medium">Chime</span>
                <SoundPreviewButton sound="bell" />
                <span className="text-[11px] text-zinc-400 font-medium">Bell</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard/settings"
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors underline"
          >
            Advanced channel setup →
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
