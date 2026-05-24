import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ stickerId: string }>;
}

export const dynamic = "force-dynamic";

export default async function RegistrationSuccessPage({ params }: Props) {
  const { stickerId } = await params;

  const sticker = await prisma.sticker.findUnique({
    where: { qrCodeId: stickerId },
    include: { owner: true },
  });

  if (!sticker || !sticker.owner) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-zinc-900">
            Scan<span className="text-emerald-500">Connect</span>
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm text-center">
          {/* Success icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Sticker Activated! 🎉</h1>
          <p className="text-zinc-600 mb-6">
            Your ScanConnect sticker is now live. Anyone who scans it will be able to reach you.
          </p>

          {/* Owner details */}
          <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Name</span>
              <span className="text-zinc-900 font-medium">{sticker.owner.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Phone</span>
              <span className="text-zinc-900 font-medium">{sticker.owner.phone.replace(/.(?=.{4})/g, "*")}</span>
            </div>
            {sticker.label && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Car</span>
                <span className="text-zinc-900 font-medium">{sticker.label}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Status</span>
              <span className="text-emerald-600 font-medium">Active ✓</span>
            </div>
          </div>

          {/* Next steps */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-700">What to do next:</p>
            <ol className="text-sm text-zinc-500 text-left space-y-2 max-w-xs mx-auto">
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">1.</span>
                <span>Stick the QR code sticker on your windshield (inside, driver side)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">2.</span>
                <span>That&apos;s it! Anyone who scans it can now call or message you.</span>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <Link
              href={`/s/${stickerId}`}
              className="block w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-sm"
            >
              Preview Your Scan Page
            </Link>
            <Link
              href={`/my-sticker/${stickerId}/edit`}
              className="block w-full py-3 rounded-xl border border-zinc-200 text-zinc-700 font-medium text-sm hover:bg-zinc-50 transition-all"
            >
              Edit My Details Later
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
