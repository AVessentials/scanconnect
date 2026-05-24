"use client";

import { useState } from "react";

interface StickerData {
  id: string;
  label: string | null;
  status: string;
  owner: { id: string; name: string; phone: string; email: string; whatsapp: string | null } | null;
}

interface Props {
  sticker: StickerData;
  updateSticker: (formData: FormData) => Promise<void>;
  deleteSticker: (formData: FormData) => Promise<void>;
}

export default function UpdateStickerForm({ sticker, updateSticker, deleteSticker }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <form action={updateSticker} className="space-y-5">
      <input type="hidden" name="stickerId" value={sticker.id} />

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={sticker.status}
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
        >
          <option value="unassigned">Unassigned</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Car Label */}
      <div>
        <label htmlFor="label" className="block text-sm font-medium text-zinc-700 mb-1.5">
          Car Label
        </label>
        <input
          type="text"
          id="label"
          name="label"
          defaultValue={sticker.label || ""}
          placeholder="e.g. White Honda City"
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          maxLength={100}
        />
      </div>

      {/* Owner Details */}
      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
        <h3 className="text-sm font-medium text-zinc-700 mb-3">
          {sticker.owner ? "Owner Details" : "Assign Owner (optional)"}
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="ownerName" className="block text-sm text-zinc-600 mb-1">
              Name
            </label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              defaultValue={sticker.owner?.name || ""}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm text-zinc-600 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={sticker.owner?.phone || ""}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="whatsapp" className="block text-sm text-zinc-600 mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              defaultValue={sticker.owner?.whatsapp || ""}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-zinc-600 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={sticker.owner?.email || ""}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all"
        >
          Save Changes
        </button>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2.5 rounded-xl text-red-500 text-sm font-medium hover:bg-red-50 transition-all"
          >
            Delete Sticker
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-500">Are you sure?</span>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              formAction={deleteSticker}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600"
            >
              Confirm Delete
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
