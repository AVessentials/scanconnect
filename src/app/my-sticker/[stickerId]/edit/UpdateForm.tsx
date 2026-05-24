"use client";

import { useState } from "react";

interface StickerData {
  qrCodeId: string;
  label: string | null;
}

interface OwnerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp: string | null;
}

interface Props {
  sticker: StickerData;
  owner: OwnerData;
  updateSticker: (qrCodeId: string, formData: FormData) => Promise<void>;
  deactivateSticker: (qrCodeId: string, formData: FormData) => Promise<void>;
}

type Step = "otp" | "edit";

export default function UpdateForm({ sticker, owner, updateSticker, deactivateSticker }: Props) {
  const [step, setStep] = useState<Step>("otp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [reVerifying, setReVerifying] = useState(false);

  // Edit / deactivate state
  const [showDeactivate, setShowDeactivate] = useState(false);

  const maskedPhone =
    owner.phone.length >= 10
      ? owner.phone.slice(0, 2) + "*****" + owner.phone.slice(-4)
      : owner.phone;

  // ─── Send OTP (pre-filled with owner's registered phone) ──────────

  async function handleSendOtp() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: owner.phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }

      // In dev mode, log the OTP to browser console for testing
      if (data.devOtp) {
        console.log("[DEV] OTP for " + owner.phone + ": " + data.devOtp);
      }

      // Start 60s cooldown
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev: number) => {
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

  // ─── Verify OTP ───────────────────────────────────

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
        body: JSON.stringify({ phone: owner.phone, code: otpCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        setError(data.error || "Invalid OTP");
        setLoading(false);
        return;
      }

      // OTP verified — unlock the edit form (or return from re-verify)
      setOtpId(data.otpId);
      setOtpCode("");
      setCooldown(0);

      if (reVerifying) {
        // Coming back from re-verify — keep on edit step, dismiss re-verify
        setReVerifying(false);
      } else {
        // First-time verification — move to edit step
        setStep("edit");
      }

      setError("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Start re-verify ──────────────────────────────

  function handleStartReVerify() {
    setReVerifying(true);
    setOtpCode("");
    setCooldown(0);
    setError("");
  }

  // ─── Update ───────────────────────────────────────

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("otpId", otpId || "");

    try {
      await updateSticker(sticker.qrCodeId, formData);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "digest" in err) {
        throw err;
      }
      setError(err instanceof Error ? err.message : "Update failed. Please try again.");
      setLoading(false);
    }
  }

  // ─── Deactivate ───────────────────────────────────

  async function handleDeactivate() {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("otpId", otpId || "");

    try {
      await deactivateSticker(sticker.qrCodeId, formData);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "digest" in err) {
        throw err;
      }
      setError(err instanceof Error ? err.message : "Failed to deactivate. Please try again.");
      setLoading(false);
    }
  }

  // ─── Render ───────────────────────────────────────

  function renderStepIndicator() {
    const steps: Step[] = ["otp", "edit"];
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all " +
                (step === s
                  ? "bg-emerald-500 text-white shadow-sm"
                  : step === "edit"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-zinc-100 text-zinc-400")
              }
            >
              {step === "edit" && i === 0 ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i === 0 && (
              <div
                className={
                  "w-8 h-0.5 rounded-full " +
                  (step === "edit" ? "bg-emerald-300" : "bg-zinc-200")
                }
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderStepLabels() {
    return (
      <div className="flex justify-between text-[11px] text-zinc-400 -mt-5 mb-6 px-1">
        <span className={step === "otp" ? "text-emerald-600 font-medium" : ""}>Verify</span>
        <span className={step === "edit" ? "text-emerald-600 font-medium" : ""}>Edit</span>
      </div>
    );
  }

  function renderError() {
    if (!error) return null;
    return (
      <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200">
        <p className="text-xs text-red-600">{error}</p>
      </div>
    );
  }

  function renderOtpStep() {
    if (step !== "otp") return null;
    return (
      <div className="space-y-5">
        {/* Phone info */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-amber-800 mb-1">Verify Your Identity</p>
          <p className="text-xs text-amber-600 mb-4">
            We&apos;ll send a one-time passcode to your registered phone number ending in <strong>{owner.phone.slice(-4)}</strong>.
          </p>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || cooldown > 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : cooldown > 0 ? (
              `Resend OTP in ${cooldown}s`
            ) : (
              "Send OTP"
            )}
          </button>
        </div>

        {/* OTP input */}
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label htmlFor="edit-otp" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Enter OTP Code
            </label>
            <input
              type="text"
              id="edit-otp"
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
          </div>

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
        </form>
      </div>
    );
  }

  function renderReVerifySection() {
    if (!reVerifying) return null;
    return (
      <div className="space-y-5 mb-6 pb-6 border-b border-zinc-100">
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-sm font-medium text-amber-800">Re-verify your identity</p>
          </div>
          <p className="text-xs text-amber-600 mb-4">
            Your previous verification has expired or you need a fresh OTP.
            A code will be sent to <strong>{maskedPhone}</strong>.
          </p>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || cooldown > 0}
              className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP"}
            </button>
            <button
              type="button"
              onClick={() => {
                setReVerifying(false);
                setError("");
              }}
              className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-600 text-xs hover:bg-zinc-50 transition-all"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleVerifyOtp}>
            <label htmlFor="reverify-otp" className="block text-xs font-medium text-amber-700 mb-1.5">
              Enter new OTP code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="reverify-otp"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                className="flex-1 px-3 py-2 rounded-lg border border-amber-300 text-sm text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                maxLength={6}
                inputMode="numeric"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || otpCode.length < 4}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderEditForm() {
    return (
      <form onSubmit={handleUpdate} className="space-y-5">
        {/* Verified badge */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-xs text-emerald-700">
            Phone verified: {maskedPhone}
          </span>
          <button
            type="button"
            onClick={handleStartReVerify}
            className="ml-auto text-[11px] text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
          >
            Re-verify
          </button>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={owner.name}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            maxLength={100}
            autoFocus
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={owner.phone}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-zinc-700 mb-1.5">
            WhatsApp Number
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            defaultValue={owner.whatsapp || ""}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={owner.email}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Car Label */}
        <div>
          <label htmlFor="carLabel" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Car Details
          </label>
          <input
            type="text"
            id="carLabel"
            name="carLabel"
            defaultValue={sticker.label || ""}
            placeholder="e.g. White Honda City - MH 12 AB 1234"
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            maxLength={100}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {/* Deactivate section */}
        <div className="pt-4 border-t border-zinc-100">
          {!showDeactivate ? (
            <button
              type="button"
              onClick={() => setShowDeactivate(true)}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-all"
            >
              Deactivate My Sticker
            </button>
          ) : (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xs text-red-700 font-medium mb-3">
                This will make your sticker inactive. People scanning it will see &quot;Sticker Not Found&quot;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowDeactivate(false);
                  setError("");
                }}
                className="text-xs text-zinc-500 hover:text-zinc-700 mb-3 block"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Deactivating..." : "Yes, Deactivate My Sticker"}
              </button>
            </div>
          )}
        </div>
      </form>
    );
  }

  function renderEditStep() {
    if (step !== "edit") return null;
    return (
      <>
        {renderReVerifySection()}
        {renderEditForm()}
      </>
    );
  }

  return (
    <>
      {renderStepIndicator()}
      {renderStepLabels()}
      {renderError()}
      {step === "otp" && renderOtpStep()}
      {renderEditStep()}
    </>
  );
}
