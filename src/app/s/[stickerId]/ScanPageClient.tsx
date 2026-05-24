"use client";

import { useState, useEffect } from "react";
import { sendContactRequest } from "./actions";

interface Props {
  ownerName: string;
  carLabel: string | null;
  callLink: string;
  whatsappLink: string;
  stickerId: string;
  maskedPhone: string;
  qrCodeId: string;
  ownerId: string;
}

export default function ScanPageClient({
  ownerName,
  carLabel,
  callLink,
  whatsappLink,
  stickerId,
  maskedPhone,
  qrCodeId,
  ownerId,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [notifiedVia, setNotifiedVia] = useState<{ sms: boolean; whatsapp: boolean; email: boolean; push: boolean } | null>(null);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushGranted, setPushGranted] = useState(false);
  const [pushSubscribing, setPushSubscribing] = useState(false);

  // Check push notification support on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      // Check current permission state without prompting
      setPushGranted(Notification.permission === "granted");
    }
  }, []);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError("");

    try {
      const res = await sendContactRequest(stickerId, message.trim(), senderName.trim() || undefined);
      if (res.success) {
        setSent(true);
        setMessage("");
        setSenderName("");
        if (res.notifiedVia) {
          setNotifiedVia(res.notifiedVia);
        }
      } else {
        setError(res.error || "Failed to send message. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function subscribeToPush() {
    if (!pushSupported) return;
    setPushSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const keyStr = await fetchPushPublicKey();
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyStr,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId,
          subscription: sub.toJSON(),
        }),
      });

      setPushGranted(true);
    } catch (err) {
      console.error("Push subscription failed:", err);
    } finally {
      setPushSubscribing(false);
    }
  }

  async function fetchPushPublicKey(): Promise<string> {
    // Fetch the VAPID public key from the server
    const res = await fetch("/api/push/public-key");
    const data = await res.json();
    return data.publicKey;
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="sticker-card animate-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 pt-8 pb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-white">ScanConnect</h1>
            <p className="text-emerald-100 text-sm mt-1">
              This car belongs to
            </p>
            <p className="text-2xl font-bold text-white mt-1">{ownerName}</p>
            {carLabel && (
              <p className="text-emerald-100 text-xs mt-1">{carLabel}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          {!revealed ? (
            /* Privacy gate - tap to reveal contact options */
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-amber-800 mb-1">Protected Contact</p>
                <p className="text-xs text-amber-600 mb-3">
                  Tap to reveal contact options. The owner&apos;s number ({maskedPhone}) is masked for privacy.
                </p>
                <button
                  onClick={() => setRevealed(true)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all active:scale-[0.98]"
                >
                  Show Contact Options
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-zinc-400">or send a private message</span>
                </div>
              </div>
            </div>
          ) : (
            /* Revealed contact options */
            <>
              {/* Call Button */}
              <a
                href={callLink}
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call Owner
              </a>

              {/* WhatsApp Button */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all active:scale-[0.98] shadow-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-zinc-400">or send a private message</span>
                </div>
              </div>
            </>
          )}

          {/* Message Form */}
          {!showMessageForm && !sent && (
            <button
              onClick={() => setShowMessageForm(true)}
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl border-2 border-dashed border-zinc-300 text-zinc-600 font-medium hover:border-emerald-400 hover:text-emerald-600 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Send a Message
            </button>
          )}

          {showMessageForm && !sent && (
            <form onSubmit={handleSendMessage} className="space-y-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                maxLength={50}
              />
              <textarea
                placeholder="Write a message for the owner..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                maxLength={500}
                required
              />
              {error && (
                <p className="text-red-500 text-xs">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMessageForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {sent && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-emerald-700 font-medium">Message sent!</p>
              <p className="text-zinc-500 text-sm mt-1">The owner will receive your message.</p>

              {/* Delivery status indicators */}
              {notifiedVia && (
                <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                  {/* SMS badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                      notifiedVia.sms
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                    title={notifiedVia.sms ? "SMS delivered to owner" : "SMS not sent (owner opted out or unavailable)"}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    SMS {notifiedVia.sms ? "Delivered" : "Unavailable"}
                  </span>

                  {/* WhatsApp badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                      notifiedVia.whatsapp
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                    title={notifiedVia.whatsapp ? "WhatsApp delivered to owner" : "WhatsApp not sent (owner opted out or unavailable)"}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp {notifiedVia.whatsapp ? "Delivered" : "Unavailable"}
                  </span>

                  {/* Email badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                      notifiedVia.email
                        ? "bg-rose-100 text-rose-700"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                    title={notifiedVia.email ? "Email delivered to owner" : "Email not sent (owner opted out or unavailable)"}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Email {notifiedVia.email ? "Delivered" : "Unavailable"}
                  </span>

                  {/* Push badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                      notifiedVia.push
                        ? "bg-blue-100 text-blue-700"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                    title={notifiedVia.push ? "Push notification delivered to owner's devices" : "Push not sent (owner opted out or no subscriptions)"}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    Push {notifiedVia.push ? "Delivered" : "Unavailable"}
                  </span>
                </div>
              )}

              {/* Push notification prompt */}
              {pushSupported && !pushGranted && (
                <button
                  onClick={subscribeToPush}
                  disabled={pushSubscribing}
                  className="mt-3 text-xs text-zinc-400 hover:text-emerald-600 transition-colors underline underline-offset-2"
                >
                  {pushSubscribing
                    ? "Setting up notifications..."
                    : "🔔 Get notified when the owner replies"}
                </button>
              )}

              <button
                onClick={() => { setSent(false); setShowMessageForm(false); }}
                className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Send another message
              </button>
            </div>
          )}

          {/* Privacy notice */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Owner&apos;s number ({maskedPhone}) is masked for privacy
            </div>
          </div>

          {/* Manage link for owner */}
          <div className="text-center pb-1">
            <a
              href={`/my-sticker/${qrCodeId}/edit`}
              className="text-[11px] text-zinc-300 hover:text-zinc-500 transition-colors"
            >
              Is this your car? Manage your sticker →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
