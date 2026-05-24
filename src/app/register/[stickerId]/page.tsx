import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RegisterForm from "./RegisterForm";
import { registerSticker } from "./actions";

interface Props {
  params: Promise<{ stickerId: string }>;
}

export const dynamic = "force-dynamic";

export default async function RegisterPage({ params }: Props) {
  const { stickerId } = await params;

  const sticker = await prisma.sticker.findUnique({
    where: { qrCodeId: stickerId },
    include: { owner: true },
  });

  if (!sticker) {
    notFound();
  }

  if (sticker.owner) {
    // Already registered — redirect to the scan page
    redirect(`/s/${stickerId}`);
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
          <span className="text-xs text-zinc-400 ml-auto">Register</span>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Activate Your Sticker</h1>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">
              Set up your profile so people can reach you when your car is parked.
              Your number will be masked for privacy.
            </p>
          </div>

          {/* Sticker info */}
          <div className="mb-6 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <p className="text-xs text-zinc-500">Sticker ID</p>
            <p className="text-xs font-mono text-zinc-700 break-all">{stickerId}</p>
          </div>

          <RegisterForm
            qrCodeId={stickerId}
            registerSticker={registerSticker}
          />
        </div>

        <p className="text-xs text-zinc-400 text-center mt-6">
          By registering, you agree to let scanners contact you through the provided channels.
          Your phone number is shown only after they tap &ldquo;Show Contact Options&rdquo;.
        </p>
      </div>
    </div>
  );
}
