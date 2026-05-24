import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ── Mark all as read server action ──────────────────────────────────────────

async function markAllAsRead() {
  "use server";

  const adminOwnerId = process.env.ADMIN_OWNER_ID;
  if (adminOwnerId) {
    await prisma.owner.update({
      where: { id: adminOwnerId },
      data: { lastViewedNotificationsAt: new Date() },
    });
  }

  revalidatePath("/dashboard/notifications");
  redirect("/dashboard/notifications");
}

// ── Quick reply server action ───────────────────────────────────────────────

async function replyToRequest(formData: FormData) {
  "use server";

  const requestId = formData.get("requestId") as string;
  const reply = formData.get("reply") as string;
  if (!requestId || !reply || reply.trim().length === 0) {
    throw new Error("Missing requestId or reply");
  }

  await prisma.contactRequest.update({
    where: { id: requestId },
    data: { reply: reply.trim(), repliedAt: new Date() },
  });

  revalidatePath("/dashboard/notifications");
}

// ── Channel delivery icon ───────────────────────────────────────────────────

function ChannelIcon({
  channel,
  delivered,
}: {
  channel: "sms" | "whatsapp" | "email";
  delivered: boolean;
}) {
  const color = delivered
    ?    { sms: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60", whatsapp: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/60", email: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60" }
    : { sms: "text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800", whatsapp: "text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800", email: "text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800" };

  const icons = {
    sms: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    whatsapp: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    email: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  };

  const labels = { sms: "SMS", whatsapp: "WhatsApp", email: "Email" };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium transition-all ${
        delivered
          ? `${color[channel]} shadow-sm`
          : "text-zinc-300 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
      }`}
      title={delivered ? `${labels[channel]} delivered` : `${labels[channel]} not delivered`}
    >
      <span className={delivered ? "" : "opacity-40"}>{icons[channel]}</span>
      {labels[channel]}
    </span>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default async function NotificationsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q.trim() : "";
  const channelFilter = typeof sp.channel === "string" ? sp.channel : "all";
  const sortOrder = typeof sp.sort === "string" && sp.sort === "oldest" ? "asc" : "desc";

  // Build where clause for search
  const searchWhere: Record<string, unknown> = {};
  if (query) {
    searchWhere.OR = [
      { callerName: { contains: query } },
      { message: { contains: query } },
    ];
  }

  // Channel filter
  const channelWhere: Record<string, unknown> = {};
  if (channelFilter === "sms") {
    channelWhere.smsDelivered = true;
  } else if (channelFilter === "whatsapp") {
    channelWhere.whatsappDelivered = true;
  } else if (channelFilter === "email") {
    channelWhere.emailDelivered = true;
  }

  // Merge where clauses
  const where = { ...searchWhere, ...channelWhere };

  // Fetch filtered requests
  const requests = await prisma.contactRequest.findMany({
    where,
    include: {
      sticker: { include: { owner: true } },
    },
    orderBy: { createdAt: sortOrder },
    take: 100,
  });

  // Stats (unfiltered — use count() for scalability)
  const [totalCount, smsSuccess, waSuccess, emailSuccess] = await Promise.all([
    prisma.contactRequest.count(),
    prisma.contactRequest.count({ where: { smsDelivered: true } }),
    prisma.contactRequest.count({ where: { whatsappDelivered: true } }),
    prisma.contactRequest.count({ where: { emailDelivered: true } }),
  ]);

  // Get last viewed timestamp
  const adminOwnerId = process.env.ADMIN_OWNER_ID;
  let lastViewedAt: Date | null = null;
  if (adminOwnerId) {
    const owner = await prisma.owner.findUnique({
      where: { id: adminOwnerId },
      select: { lastViewedNotificationsAt: true },
    });
    lastViewedAt = owner?.lastViewedNotificationsAt || null;
  }

  // Count unread (requests created after lastViewedAt)
  const unreadCount = lastViewedAt
    ? await prisma.contactRequest.count({
        where: { createdAt: { gt: lastViewedAt } },
      })
    : 0;

  // Build URL helpers
  function qs(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const newQuery = overrides.q !== undefined ? overrides.q : query;
    const newChannel = overrides.channel !== undefined ? overrides.channel : channelFilter;
    const currentSort = sortOrder === "asc" ? "oldest" : "newest";
    const newSort = overrides.sort !== undefined ? overrides.sort : currentSort;
    if (newQuery) params.set("q", newQuery);
    if (newChannel && newChannel !== "all") params.set("channel", newChannel);
    if (newSort !== "newest") params.set("sort", newSort);
    return `/dashboard/notifications${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Notification History</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Contact requests and their delivery status
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-6">
          {/* Mark all as read */}
          {unreadCount > 0 && (
            <form action={markAllAsRead}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-100 transition-all active:scale-[0.97]"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mark all as read
              </button>
            </form>
          )}
          <Link
            href="/dashboard/notifications/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-100 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: totalCount, color: "bg-blue-500" },
          { label: "SMS Delivered", value: smsSuccess, color: "bg-emerald-500" },
          { label: "WhatsApp Delivered", value: waSuccess, color: "bg-green-500" },
          { label: "Email Delivered", value: emailSuccess, color: "bg-rose-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 space-y-4">
          {/* Search bar */}
          <form method="GET" action="/dashboard/notifications" className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search by name or message..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100"
            />
            {/* Preserve existing channel/sort params when searching */}
            {channelFilter !== "all" && <input type="hidden" name="channel" value={channelFilter} />}
            {sortOrder === "asc" && <input type="hidden" name="sort" value="oldest" />}
          </form>

          {/* Filter & sort row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Channel filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: "all", label: "All" },
                { key: "sms", label: "SMS" },
                { key: "whatsapp", label: "WhatsApp" },
                { key: "email", label: "Email" },
              ].map((f) => {
                const href = qs({ channel: f.key });
                const active = channelFilter === f.key;
                return (
                  <Link
                    key={f.key}
                    href={href}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      active
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </div>

            {/* Sort toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">Sort:</span>
              {[
                { key: "newest", label: "Newest" },
                { key: "oldest", label: "Oldest" },
              ].map((s) => {
                const currentSort = sortOrder === "asc" ? "oldest" : "newest";
                const active = currentSort === s.key;
                return (
                  <Link
                    key={s.key}
                    href={qs({ sort: s.key })}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                      active
                        ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Active search indicator */}
          {query && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                Searching for &ldquo;<span className="font-medium text-zinc-700 dark:text-zinc-300">{query}</span>&rdquo;
              </span>
              <Link
                href={qs({ q: "" })}
                className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors ml-1"
              >
                ✕ Clear
              </Link>
            </div>
          )}

          {/* Unread indicator */}
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-xl px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-medium">{unreadCount} unread request{unreadCount !== 1 ? "s" : ""}</span>
              <span className="text-blue-400">·</span>
              <form action={markAllAsRead} className="inline">
                <button type="submit" className="underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  Mark as read
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Timeline / Requests List */}
        {requests.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />
              </svg>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {query || channelFilter !== "all"
                ? "No requests match your search"
                : "No contact requests yet"}
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">
              {query || channelFilter !== "all"
                ? "Try a different search term or filter."
                : "Requests will appear here once people scan your stickers and send messages."}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-zinc-100 dark:bg-zinc-800 hidden sm:block" />

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {requests.map((req, index) => {
                const createdAt = new Date(req.createdAt);
                const isUnread = lastViewedAt ? createdAt > lastViewedAt : true;
                const deliveredChannels = [
                  { key: "sms" as const, delivered: req.smsDelivered },
                  { key: "whatsapp" as const, delivered: req.whatsappDelivered },
                  { key: "email" as const, delivered: req.emailDelivered },
                ];
                const anyDelivered = deliveredChannels.some((c) => c.delivered);

                return (
                  <div
                    key={req.id}
                    className={`relative flex items-start gap-4 px-4 sm:px-5 py-5 transition-colors ${
                      isUnread ? "bg-emerald-50/40 dark:bg-emerald-950/20" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    {/* Timeline dot (desktop) */}
                    <div className="hidden sm:flex flex-col items-center shrink-0 pt-1">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isUnread
                            ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-900/60"
                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isUnread ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-600"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {/* Header row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Avatar */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 sm:hidden ${
                            isUnread ? "bg-emerald-100" : "bg-zinc-100"
                          }`}
                        >
                          <span className={`text-[10px] font-bold ${isUnread ? "text-emerald-600" : "text-zinc-400"}`}>
                            {(req.callerName || "A").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className={`font-semibold text-sm ${isUnread ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}>
                          {req.callerName || "Anonymous"}
                        </span>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          → {req.sticker.owner?.name || req.sticker.label || "Unknown"}
                        </span>
                      </div>

                      {/* Message */}
                      {req.message && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 pl-0 sm:pl-0 border-l-2 border-emerald-200 dark:border-emerald-800 pl-3 italic">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}

                      {/* Timeline metadata row */}
                      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                        {/* Time */}
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {timeAgo(createdAt)}
                        </span>

                        <span className="text-[10px] text-zinc-300 dark:text-zinc-600">·</span>

                        {/* Delivery summary */}
                        <span className={`text-[11px] ${anyDelivered ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}`}>
                          {anyDelivered ? "Delivered" : "No channels delivered"}
                        </span>

                        <span className="text-[10px] text-zinc-300">·</span>

                        {/* Full timestamp */}
                        <span className="text-[10px] text-zinc-300 dark:text-zinc-600" title={createdAt.toISOString()}>
                          {createdAt.toLocaleString()}
                        </span>
                      </div>

                      {/* Channel delivery badges */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        {deliveredChannels.map((c) => (
                          <ChannelIcon key={c.key} channel={c.key} delivered={c.delivered} />
                        ))}
                      </div>

                      {/* Quick Reply */}
                      <details className="group mt-3">
                        <summary className="inline-flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer transition-colors list-none [&::-webkit-details-marker]:hidden">
                          <svg className="w-3 h-3 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                          {req.reply ? "Edit reply" : "Quick reply"}
                        </summary>
                        <form action={replyToRequest} className="mt-2 flex gap-2">
                          <input type="hidden" name="requestId" value={req.id} />
                          <input
                            type="text"
                            name="reply"
                            defaultValue={req.reply || ""}
                            placeholder="Type your reply..."
                            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white dark:bg-zinc-800 dark:text-zinc-100"
                          />
                          <button
                            type="submit"
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-all active:scale-[0.97] shrink-0"
                          >
                            Send
                          </button>
                        </form>
                      </details>

                      {/* Show existing reply */}
                      {req.reply && !req.repliedAt && (
                        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2 border border-zinc-100 dark:border-zinc-700">
                          <span className="font-medium text-zinc-600 dark:text-zinc-300">Reply: </span>
                          {req.reply}
                        </div>
                      )}
                      {req.reply && req.repliedAt && (
                        <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg px-3 py-2 border border-emerald-100 dark:border-emerald-900">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Replied {timeAgo(req.repliedAt)}</span>
                          </div>
                          <p className="text-emerald-600 dark:text-emerald-400">{req.reply}</p>
                        </div>
                      )}
                    </div>

                    {/* New badge */}
                    {isUnread && (
                      <span className="shrink-0 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {requests.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Showing {requests.length}
            {query || channelFilter !== "all" ? " matching" : ""} request{requests.length !== 1 ? "s" : ""}
            {requests.length >= 100 ? " (max 100)" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
