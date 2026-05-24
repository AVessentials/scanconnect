import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import QRCodeDisplay from "./QRCodeDisplay";
import StickerSVG from "./StickerSVG";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function QRPage({ params }: Props) {
  const { id } = await params;

  const sticker = await prisma.sticker.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!sticker) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const scanUrl = `${baseUrl}/s/${sticker.qrCodeId}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/dashboard/stickers/${id}`}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← Back to Sticker Details
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 mt-1">
            QR Code & Sticker
          </h1>
        </div>
      </div>

      {/* QR Code Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="font-semibold text-zinc-900 mb-4">QR Code</h2>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
            <QRCodeDisplay url={scanUrl} size={200} />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-500">Scan URL</p>
              <p className="text-sm font-mono text-zinc-900 break-all">{scanUrl}</p>
            </div>
            {sticker.owner && (
              <div>
                <p className="text-xs text-zinc-500">Assigned to</p>
                <p className="text-sm font-medium text-zinc-900">{sticker.owner.name}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <a
                href={scanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Test Scan Page
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sticker Design */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-zinc-900">Sticker Design</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Right-click and save this as a high-quality PNG. Print on weatherproof vinyl sticker paper (3.5" x 5").
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-all print:hidden"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Print / Save PDF
          </button>
        </div>

        <div className="flex justify-center p-6 bg-zinc-50 rounded-xl">
          <StickerSVG
            scanUrl={scanUrl}
            qrCodeId={sticker.qrCodeId}
            ownerName={sticker.owner?.name || null}
            carLabel={sticker.label}
          />
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-3">
            <span className="text-amber-600 text-lg">📋</span>
            <div>
              <p className="text-sm font-medium text-amber-800">Printing Instructions</p>
              <ul className="text-xs text-amber-700 mt-1 space-y-1 list-disc list-inside">
                <li>Print on <strong>weatherproof vinyl sticker paper</strong> (not regular paper)</li>
                <li>Recommended size: <strong>3.5" × 5"</strong> (credit card size) or <strong>4" × 6"</strong></li>
                <li>Cut along the outer dashed line</li>
                <li>Peel and stick on the <strong>inside of windshield</strong> (driver side bottom corner)</li>
                <li>The QR code should face outward so it can be scanned from outside</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
