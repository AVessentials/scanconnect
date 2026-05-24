"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { playChime, playBell } from "@/lib/sounds";

interface LatestResponse {
  count: number;
  latest: {
    id: string;
    callerName: string | null;
    message: string | null;
    createdAt: string;
    smsDelivered: boolean;
    whatsappDelivered: boolean;
    emailDelivered: boolean;
  } | null;
}

interface Props {
  pollIntervalSecs?: number;
  soundEnabled?: boolean;
  browserNotificationsEnabled?: boolean;
  notificationSound?: "chime" | "bell" | "silent";
}

const TOAST_DURATION_MS = 10_000;

// ── Browser Notification helper ──────────────────────────────────────────

async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

function showBrowserNotification(
  title: string,
  options: { body?: string; icon?: string; tag?: string }
) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, options);
  } catch {
    // Silently ignore
  }
}

// ── Component ────────────────────────────────────────────────────────────

export default function LiveNotificationIndicator({
  pollIntervalSecs = 30,
  soundEnabled = true,
  browserNotificationsEnabled = true,
  notificationSound = "chime",
}: Props) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<{
    id: string;
    callerName: string;
    message: string | null;
  } | null>(null);
  const lastCheckedRef = useRef<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPolledOnceRef = useRef(false);
  const permissionRequestedRef = useRef(false);

  // ── Play the configured sound ───────────────────────────────────────

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    if (notificationSound === "chime") playChime();
    else if (notificationSound === "bell") playBell();
    // "silent" — do nothing
  }, [soundEnabled, notificationSound]);

  // ── Mark notifications as viewed ────────────────────────────────────

  const markAsViewed = useCallback(async () => {
    try {
      await fetch("/api/notifications/viewed", { method: "POST" });
    } catch {
      // Silently ignore
    }
  }, []);

  // ── Fetch latest count ──────────────────────────────────────────────

  const checkForNew = useCallback(async () => {
    try {
      const isFirstPoll = !hasPolledOnceRef.current;
      const since = lastCheckedRef.current
        ? `?since=${encodeURIComponent(lastCheckedRef.current)}`
        : "";
      const res = await fetch(`/api/notifications/latest${since}`);
      if (!res.ok) return;
      const data: LatestResponse = await res.json();

      // First poll silently records the cutoff without showing a badge
      if (!isFirstPoll && data.count > 0) {
        setUnreadCount((prev) => prev + data.count);

        // 🔊 Play sound on new notifications
        playNotificationSound();

        // 🔔 Show browser notification
        if (browserNotificationsEnabled) {
          const name = data.latest?.callerName || "Someone";
          const message = data.latest?.message || "Sent you a message";
          showBrowserNotification(`New message from ${name}`, {
            body: message,
            tag: `scanconnect-${data.latest?.id}`,
          });

          // Request permission on first use (but only after a notification actually arrives)
          if (!permissionRequestedRef.current) {
            permissionRequestedRef.current = true;
            requestNotificationPermission();
          }
        }
      }

      // Show a toast for the latest new request (only on subsequent polls)
      if (!isFirstPoll && data.latest && data.count > 0) {
        const name = data.latest.callerName || "Someone";
        setToast({
          id: data.latest.id,
          callerName: name,
          message: data.latest.message,
        });

        // Auto-dismiss toast
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setToast(null);
        }, TOAST_DURATION_MS);
      }

      // Always update timestamp so subsequent polls have a cutoff
      lastCheckedRef.current = new Date().toISOString();
      hasPolledOnceRef.current = true;
    } catch {
      // Silently ignore polling errors
    }
  }, [playNotificationSound, browserNotificationsEnabled]);

  // ── First check + periodic polling ─────────────────────────────────

  useEffect(() => {
    // Clamp interval to a safe range (5s – 300s)
    const safeInterval = Math.max(5, Math.min(300, pollIntervalSecs)) * 1000;

    // Don't check immediately — give the page time to load
    const initialTimer = setTimeout(() => {
      checkForNew();
    }, 3000);

    const interval = setInterval(checkForNew, safeInterval);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [checkForNew, pollIntervalSecs]);

  // ── Dismiss badge, mark viewed, go to notifications ────────────────

  function handleClick() {
    setUnreadCount(0);
    setToast(null);
    markAsViewed();
    router.push("/dashboard/notifications");
  }

  function dismissToast() {
    setToast(null);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <>
      {/* Bell icon with badge */}
      <button
        onClick={handleClick}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
        title={unreadCount > 0 ? `${unreadCount} new request${unreadCount !== 1 ? "s" : ""}` : "No new requests"}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span key={unreadCount} className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-bounce-subtle">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg p-4 relative">
            {/* Close button */}
            <button
              onClick={dismissToast}
              className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-emerald-600">
                  {toast.callerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900">
                  {toast.callerName}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                  {toast.message || "Sent you a message"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleClick}
                    className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    View details →
                  </button>
                  <span className="text-[10px] text-zinc-300">·</span>
                  <button
                    onClick={dismissToast}
                    className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
