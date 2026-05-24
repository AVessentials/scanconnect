import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stickers, totalRequests, unassignedCount, recentRequests, todayCount, weekData] = await Promise.all([
    prisma.sticker.findMany({
      include: { owner: true, _count: { select: { contactRequests: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactRequest.count(),
    prisma.sticker.count({ where: { status: "unassigned" } }),
    prisma.contactRequest.findMany({
      include: { sticker: { select: { label: true, owner: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Today's stats
    (async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const where = { createdAt: { gte: today } };
      const [count, sms, wa, email] = await Promise.all([
        prisma.contactRequest.count({ where }),
        prisma.contactRequest.count({ where: { ...where, smsDelivered: true } }),
        prisma.contactRequest.count({ where: { ...where, whatsappDelivered: true } }),
        prisma.contactRequest.count({ where: { ...where, emailDelivered: true } }),
      ]);
      return { count, sms, wa, email };
    })(),
    // Weekly activity (past 7 days)
    (async () => {
      const days: { label: string; count: number; date: Date }[] = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = await prisma.contactRequest.count({
          where: { createdAt: { gte: day, lt: nextDay } },
        });
        const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : day.toLocaleDateString("en-US", { weekday: "short" });
        days.push({ label, count, date: day });
      }
      return days;
    })(),
  ]);

  const activeCount = stickers.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage your ScanConnect stickers</p>
        </div>
        <Link
          href="/dashboard/stickers/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-700 text-white text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-600 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Sticker
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Stickers", value: stickers.length, color: "bg-zinc-900" },
          { label: "Active", value: activeCount, color: "bg-emerald-500" },
          { label: "Unassigned", value: unassignedCount, color: "bg-amber-500" },
          { label: "Total Contacts", value: totalRequests, color: "bg-blue-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Weekly Activity</h2>
          <div className="flex items-center gap-2">
            {/* CSV Export */}
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                ["Day,Requests", ...weekData.map((d) => `${d.label},${d.count}`)].join("\n")
              )}`}
              download="weekly-activity.csv"
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-1"
              title="Download as CSV"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              CSV
            </a>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {weekData.reduce((s, d) => s + d.count, 0)} total
            </span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {weekData.map((day) => {
            const maxCount = Math.max(...weekData.map((d) => d.count), 1);
            const heightPct = (day.count / maxCount) * 100;
            const isToday =
              day.date.toDateString() === new Date().toDateString();
            return (
              <div key={day.label} className="flex-1 flex flex-col items-center h-full">
                {/* Spacer pushes bar down from top */}
                <div className="flex-1" />
                {/* Count label above bar */}
                {day.count > 0 && (
                  <span className="text-[10px] font-medium text-zinc-600 mb-0.5">
                    {day.count}
                  </span>
                )}
                {/* Bar */}
                <div
                  className="relative w-full flex justify-center"
                  style={{ height: `${heightPct}%`, minHeight: day.count > 0 ? "8px" : "4px" }}
                >
                  <div
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${
                      isToday
                        ? "bg-emerald-500"
                        : day.count > 0
                        ? "bg-emerald-200 hover:bg-emerald-300"
                        : "bg-zinc-100"
                    }`}
                    style={{ height: "100%" }}
                    title={`${day.label}: ${day.count} requests`}
                  />
                </div>
                {/* Day label at bottom */}
                <span
                  className={`text-[10px] pt-1 ${
                    isToday ? "font-semibold text-zinc-900" : "text-zinc-400"
                  }`}
                >
                  {day.label === "Today"
                    ? "Today"
                    : day.label === "Yesterday"
                    ? "Yest"
                    : day.label.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's delivery stats + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's delivery stats */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Today&apos;s Activity</h2>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {todayCount.count} request{todayCount.count !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {[
              { label: "SMS", value: todayCount.sms, total: todayCount.count, color: "bg-emerald-500", bg: "bg-emerald-50" },
              { label: "WhatsApp", value: todayCount.wa, total: todayCount.count, color: "bg-green-500", bg: "bg-green-50" },
              { label: "Email", value: todayCount.email, total: todayCount.count, color: "bg-rose-500", bg: "bg-rose-50" },
            ].map((channel) => {
              const pct = todayCount.count > 0 ? Math.round((channel.value / todayCount.count) * 100) : 0;
              return (
                <div key={channel.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${channel.color} shrink-0`} />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 w-16">{channel.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${channel.color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 w-8 text-right font-medium">
                    {channel.value}
                  </span>
                </div>
              );
            })}
          </div>
          {todayCount.count > 0 && (
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                <span className="font-medium text-zinc-600 dark:text-zinc-300">{todayCount.sms}</span> SMS ·{" "}
                <span className="font-medium text-zinc-600 dark:text-zinc-300">{todayCount.wa}</span> WhatsApp ·{" "}
                <span className="font-medium text-zinc-600 dark:text-zinc-300">{todayCount.email}</span> Email
              </p>
            </div>
          )}
          {todayCount.count === 0 && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">No activity today yet</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Recent Activity</h2>
            <Link
              href="/dashboard/notifications"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />
                </svg>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">No contact requests yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentRequests.map((req) => {
                const deliveredChannels = [
                  { key: "SMS" as const, delivered: req.smsDelivered },
                  { key: "WA" as const, delivered: req.whatsappDelivered },
                  { key: "Email" as const, delivered: req.emailDelivered },
                ];
                const deliveredCount = deliveredChannels.filter((c) => c.delivered).length;

                return (
                  <Link
                    key={req.id}
                    href="/dashboard/notifications"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-emerald-600">
                        {(req.callerName || "A").charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {req.callerName || "Anonymous"}
                        </span>
                        <span className="text-[10px] text-zinc-300 dark:text-zinc-600">·</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                          {req.sticker.owner?.name || req.sticker.label || "Unknown sticker"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">{timeAgo(new Date(req.createdAt))}</span>
                        {req.message && (
                          <>
                            <span className="text-[10px] text-zinc-300 dark:text-zinc-600">·</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[180px]">
                              &ldquo;{req.message}&rdquo;
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delivery badges */}
                    <div className="flex items-center gap-1 shrink-0">
                      {deliveredChannels.map((c) => (
                        <span
                          key={c.key}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            c.delivered
                              ? c.key === "SMS"
                                ? "bg-emerald-100 text-emerald-700"
                                : c.key === "WA"
                                ? "bg-green-100 text-green-700"
                                : "bg-rose-100 text-rose-700"
                              : "bg-zinc-100 text-zinc-300"
                          }`}
                        >
                          {c.key}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Stickers List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">All Stickers</h2>
        </div>
        {stickers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No stickers yet</p>
            <Link
              href="/dashboard/stickers/new"
              className="inline-block mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Create your first sticker
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stickers.map((sticker) => (
              <Link
                key={sticker.id}
                href={`/dashboard/stickers/${sticker.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      sticker.status === "active"
                        ? "bg-emerald-500"
                        : sticker.status === "unassigned"
                        ? "bg-amber-400"
                        : "bg-zinc-300"
                    }`}
                  />
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {sticker.owner?.name || sticker.label || "Unassigned"}
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500">
                      ID: {sticker.qrCodeId.slice(0, 8)}... · Created{" "}
                      {new Date(sticker.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {sticker._count.contactRequests} contact
                    {sticker._count.contactRequests !== 1 ? "s" : ""}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sticker.status === "active"
                        ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                        : sticker.status === "unassigned"
                        ? "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {sticker.status}
                  </span>
                  <svg className="w-4 h-4 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
