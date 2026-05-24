import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UpdateForm from "./UpdateForm";
import { updateSticker, deactivateSticker } from "./actions";

interface Props {
  params: Promise<{ stickerId: string }>;
  searchParams: Promise<{ updated?: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditStickerPage({ params, searchParams }: Props) {
  const { stickerId } = await params;
  const { updated } = await searchParams;

  const sticker = await prisma.sticker.findUnique({
    where: { qrCodeId: stickerId },
    include: { owner: true },
  });

  if (!sticker) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-2">
          <Link href={`/s/${stickerId}`} className="text-xs text-zinc-400 hover:text-zinc-700 mr-2">
            ← Back
          </Link>
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-zinc-900">
            Scan<span className="text-emerald-500">Connect</span>
          </span>
          <span className="text-xs text-zinc-400 ml-auto">My Sticker</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Updated banner */}
        {updated === "true" && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <p className="text-sm text-emerald-800 font-medium">Your details have been updated successfully!</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">Manage My Sticker</h1>
            <p className="text-sm text-zinc-500 mt-2">
              Update your contact details or deactivate your sticker.
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Verify your identity with an OTP sent to your registered phone.
            </p>
          </div>

          {!sticker.owner ? (
            /* Not yet registered */
            <div className="text-center py-6">
              <p className="text-zinc-600 text-sm mb-4">This sticker hasn&apos;t been activated yet.</p>
              <Link
                href={`/register/${stickerId}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all"
              >
                Register Now
              </Link>
            </div>
          ) : (
            /* Edit form */
            <UpdateForm
              sticker={{ qrCodeId: stickerId, label: sticker.label }}
              owner={sticker.owner}
              updateSticker={updateSticker}
              deactivateSticker={deactivateSticker}
            />
          )}
        </div>

        <Link
          href={`/s/${stickerId}`}
          className="block text-center text-sm text-zinc-400 hover:text-zinc-700 mt-6 transition-colors"
        >
          ← Back to scan page
        </Link>
      </div>
    </div>
  );
}
