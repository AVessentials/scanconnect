import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCallLink, getWhatsAppLink } from "@/lib/utils";
import ScanPageClient from "./ScanPageClient";

interface Props {
  params: Promise<{ stickerId: string }>;
}

export default async function ScanPage({ params }: Props) {
  const { stickerId } = await params;

  const sticker = await prisma.sticker.findUnique({
    where: { qrCodeId: stickerId },
    include: { owner: true },
  });

  if (!sticker || sticker.status === "inactive") {
    notFound();
  }

  const owner = sticker.owner;

  if (!owner) {
    // Sticker not yet registered — show self-service CTA
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
        <div className="sticker-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Not Yet Registered</h2>
          <p className="text-zinc-500 text-sm mb-4">
            This sticker hasn&apos;t been activated yet.
          </p>
          <p className="text-zinc-400 text-xs mb-6">
            Is this your sticker? Set it up in under a minute.
            <br />
            Sticker ID: {stickerId.slice(0, 8)}...
          </p>
          <Link
            href={`/register/${stickerId}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM19.5 21a7.5 7.5 0 00-15 0" />
            </svg>
            Register My Sticker
          </Link>
        </div>
      </div>
    );
  }

  const callLink = getCallLink(owner.phone);
  const whatsappLink = getWhatsAppLink(
    owner.whatsapp || owner.phone,
    `Hi! I found your car parked and wanted to reach you.`
  );

  return (
    <ScanPageClient
      ownerName={owner.name}
      carLabel={sticker.label}
      callLink={callLink}
      whatsappLink={whatsappLink}
      stickerId={sticker.id}
      maskedPhone={maskPhone(owner.phone)}
      qrCodeId={stickerId}
      ownerId={owner.id}
    />
  );
}

function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 10) {
    return `${cleaned.slice(0, 2)}****${cleaned.slice(-4)}`;
  }
  return phone;
}
