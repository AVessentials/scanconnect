"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  qrCodeId: string;
  registerSticker: (qrCodeId: string, formData: FormData) => Promise<void>;
}

type Step = "phone" | "otp" | "profile";

export default function RegisterForm({ qrCodeId, registerSticker }: Props) {
  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP state
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const router = useRouter();

  // ─── Step 1: Send OTP ───────────────────────────────

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }

      // In dev mode, log the OTP to browser console for testing
      if (data.devOtp) {
        console.log("[DEV] OTP for " + cleanPhone + ": " + data.devOtp);
      }

      // Move to OTP step
      setStep("otp");
      setError("");

      // Start 60s cooldown
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 2: Verify OTP ─────────────────────────────

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setError("Please enter the complete OTP code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        setError(data.error || "Invalid OTP");
        setLoading(false);
        return;
      }

      // OTP verified — move to profile step
      setOtpId(data.otpId);
      setStep("profile");
      setError("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 3: Register ───────────────────────────────

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!name.trim()) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }

    // Attach OTP verification proof
    formData.set("phone", phone);
    formData.set("otpId", otpId || "");

    try {
      await registerSticker(qrCodeId, formData);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "digest" in err) {
        throw err;
      }
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setLoading(false);
    }
  }

  // ─── Go back to phone step ──────────────────────────

  function goBackToPhone() {
    setStep("phone");
    setOtpCode("");
    setOtpId(null);
    setError("");
  }

  // ─── Render ─────────────────────────────────────────

  return (
    <>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(["phone", "otp", "profile"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? "bg-emerald-500 text-white shadow-sm"
                  : ["phone", "otp", "profile"].indexOf(step) > i
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-zinc-100 text-zinc-400"
              }`}
            >
              {["phone", "otp", "profile"].indexOf(step) > i ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < 2 && (
              <div
                className={`w-8 h-0.5 rounded-full ${
                  ["phone", "otp", "profile"].indexOf(step) > i
                    ? "bg-emerald-300"
                    : "bg-zinc-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex justify-between text-[11px] text-zinc-400 -mt-5 mb-6 px-1">
        <span className={step === "phone" ? "text-emerald-600 font-medium" : ""}>Phone</span>
        <span className={step === "otp" ? "text-emerald-600 font-medium" : ""}>Verify</span>
        <span className={step === "profile" ? "text-emerald-600 font-medium" : ""}>Profile</span>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* ────── Step 1: Phone Input ────── */}
      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Your Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              autoFocus
            />
            <p className="text-xs text-zinc-400 mt-1">
              We&apos;ll send a one-time passcode to verify this number. Standard SMS rates may apply.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending OTP...
              </span>
            ) : (
              "Send OTP"
            )}
          </button>
        </form>
      )}

      {/* ────── Step 2: OTP Input ────── */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          {/* Phone display */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              <span className="text-sm text-zinc-600">{phone.slice(0, 2)}*****{phone.slice(-4)}</span>
            </div>
            <button
              type="button"
              onClick={goBackToPhone}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Change
            </button>
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Enter OTP Code
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-lg text-center font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              autoFocus
              maxLength={6}
              inputMode="numeric"
            />
            <p className="text-xs text-zinc-400 mt-1 text-center">
              Enter the 6-digit code sent to your phone
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading || otpCode.length < 4}
              className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify OTP"
              )}
            </button>

            {cooldown > 0 ? (
              <p className="text-xs text-zinc-400 text-center">
                Resend OTP in {cooldown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full text-xs text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}

      {/* ────── Step 3: Profile Details ────── */}
      {step === "profile" && (
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Verified phone badge */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-xs text-emerald-700">
              Phone verified: {phone.slice(0, 2)}*****{phone.slice(-4)}
            </span>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              maxLength={100}
              autoFocus
            />
            <p className="text-xs text-zinc-400 mt-1">This will be shown to anyone who scans your sticker</p>
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-zinc-700 mb-1.5">
              WhatsApp Number <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              placeholder="Same as phone if left empty"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Email <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="rahul@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-zinc-400 mt-1">For receiving contact notifications</p>
          </div>

          {/* Car Label */}
          <div>
            <label htmlFor="carLabel" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Car Details <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              id="carLabel"
              name="carLabel"
              placeholder="e.g. White Honda City · MH 12 AB 1234"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              maxLength={100}
            />
            <p className="text-xs text-zinc-400 mt-1">Helps scanners identify your car</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Activating...
              </span>
            ) : (
              "Activate My Sticker"
            )}
          </button>
        </form>
      )}
    </>
  );
}
