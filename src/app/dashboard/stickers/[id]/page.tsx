import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UpdateStickerForm from "./UpdateStickerForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

async function updateSticker(formData: FormData) {
  "use server";

  const id = formData.get("stickerId") as string;
  const status = formData.get("status") as string;
  const label = formData.get("label") as string;
  const ownerName = formData.get("ownerName") as string;
  const phone = formData.get("phone") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const email = formData.get("email") as string;

  const sticker = await prisma.sticker.findUnique({ where: { id } });
  if (!sticker) return;

  if (sticker.ownerId) {
    // Update existing owner
    await prisma.owner.update({
      where: { id: sticker.ownerId },
      data: {
        name: ownerName,
        phone,
        whatsapp: whatsapp || phone,
        email,
      },
    });
  } else if (ownerName && phone) {
    // Create new owner
    const owner = await prisma.owner.create({
      data: {
        name: ownerName,
        phone,
        email: email || `owner-${Date.now()}@scanconnect.in`,
        whatsapp: whatsapp || phone,
      },
    });
    await prisma.sticker.update({
      where: { id },
      data: { ownerId: owner.id, status: "active" },
    });
  }

  await prisma.sticker.update({
    where: { id },
    data: {
      label: label || null,
      status: status as string,
    },
  });

  redirect(`/dashboard/stickers/${id}`);
}

async function deleteSticker(formData: FormData) {
  "use server";

  const id = formData.get("stickerId") as string;
  await prisma.sticker.delete({ where: { id } });
  redirect("/dashboard");
}

export default async function StickerDetailPage({ params }: Props) {
  const { id } = await params;

  const sticker = await prisma.sticker.findUnique({
    where: { id },
    include: {
      owner: true,
      contactRequests: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!sticker) notFound();

  const scanUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/s/${sticker.qrCodeId}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 mt-1">
            {sticker.owner?.name || sticker.label || "Unassigned Sticker"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/stickers/${id}/qr`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            </svg>
            View QR & Sticker
          </Link>
        </div>
      </div>

      {/* Sticker Info Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="font-semibold text-zinc-900 mb-4">Sticker Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">QR Code ID</span>
            <p className="font-mono text-zinc-900 mt-0.5 text-xs break-all">{sticker.qrCodeId}</p>
          </div>
          <div>
            <span className="text-zinc-500">Status</span>
            <p className="mt-0.5">
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  sticker.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : sticker.status === "unassigned"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {sticker.status}
              </span>
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Scan URL</span>
            <p className="font-mono text-zinc-900 mt-0.5 text-xs break-all">{scanUrl}</p>
          </div>
          <div>
            <span className="text-zinc-500">Created</span>
            <p className="text-zinc-900 mt-0.5">{new Date(sticker.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Edit Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="font-semibold text-zinc-900 mb-4">Edit Sticker</h2>
        <UpdateStickerForm
          sticker={sticker}
          updateSticker={updateSticker}
          deleteSticker={deleteSticker}
        />
      </div>

      {/* Contact Requests */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-900">
            Contact Requests ({sticker.contactRequests.length})
          </h2>
        </div>
        {sticker.contactRequests.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-zinc-400">No contact requests yet</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {sticker.contactRequests.map((req) => (
              <div key={req.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-900">{req.message}</p>
                    {req.callerName && (
                      <p className="text-xs text-zinc-400 mt-1">From: {req.callerName}</p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
