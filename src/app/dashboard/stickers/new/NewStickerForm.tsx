"use client";

import { useState } from "react";

interface Props {
  createSticker: (formData: FormData) => Promise<void>;
}

export default function NewStickerForm({ createSticker }: Props) {
  const [assignOwner, setAssignOwner] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createSticker(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Car Label */}
      <div>
        <label htmlFor="carLabel" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Car Label (optional)
        </label>
        <input
          type="text"
          id="carLabel"
          name="carLabel"
          placeholder="e.g. White Honda City · MH 12 AB 1234"
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          maxLength={100}
        />
        <p className="text-xs text-zinc-400 mt-1">Shown on the scan page so people know it&apos;s your car</p>
      </div>

      {/* Assign Owner Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAssignOwner(!assignOwner)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            assignOwner ? "bg-emerald-500" : "bg-zinc-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              assignOwner ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-zinc-700">Assign to an owner</span>
      </div>

      {/* Owner Fields */}
      {assignOwner && (
        <div className="space-y-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Owner Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              required
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-zinc-700 mb-1.5">
              WhatsApp Number
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              placeholder="Same as phone if empty"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-zinc-400 mt-1">Leave empty to use the same as phone number</p>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="rahul@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 transition-all active:scale-[0.98]"
      >
        Generate QR Sticker
      </button>
    </form>
  );
}
