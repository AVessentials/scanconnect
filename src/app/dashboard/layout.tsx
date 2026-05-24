import Link from "next/link";
import LiveNotificationIndicator from "@/components/LiveNotificationIndicator";
import DarkModeToggle from "@/components/DarkModeToggle";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the owner's notification preferences
  const adminOwnerId = process.env.ADMIN_OWNER_ID;
  let pollIntervalSecs = 30;
  let soundEnabled = true;
  let browserNotificationsEnabled = true;
  let notificationSound: "chime" | "bell" | "silent" = "chime";

  if (adminOwnerId) {
    const owner = await prisma.owner.findUnique({
      where: { id: adminOwnerId },
      select: {
        pollIntervalSecs: true,
        soundEnabled: true,
        browserNotificationsEnabled: true,
        notificationSound: true,
      },
    });
    if (owner) {
      pollIntervalSecs = owner.pollIntervalSecs;
      soundEnabled = owner.soundEnabled;
      browserNotificationsEnabled = owner.browserNotificationsEnabled;
      // Type-safe mapping from DB string
      if (["chime", "bell", "silent"].includes(owner.notificationSound)) {
        notificationSound = owner.notificationSound as "chime" | "bell" | "silent";
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Scan<span className="text-emerald-500">Connect</span>
              </span>
            </Link>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <nav className="flex items-center gap-2">
            <DarkModeToggle />
            <LiveNotificationIndicator
              pollIntervalSecs={pollIntervalSecs}
              soundEnabled={soundEnabled}
              browserNotificationsEnabled={browserNotificationsEnabled}
              notificationSound={notificationSound}
            />
            <Link
              href="/"
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              ← Back to Site
            </Link>
          </nav>
        </div>
      </header>

      {/* Subnav */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-6 -mb-px">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/dashboard/notifications", label: "Notifications" },
              { href: "/dashboard/settings", label: "Settings" },
              { href: "/dashboard/stickers/new", label: "New Sticker" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border-b-2 border-transparent hover:border-zinc-900 dark:hover:border-zinc-100 py-3 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
