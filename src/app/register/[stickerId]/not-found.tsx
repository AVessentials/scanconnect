import Link from "next/link";

export default function RegisterNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-zinc-900 mb-2">Sticker Not Found</h1>
        <p className="text-sm text-zinc-500 mb-6">
          This QR code doesn&apos;t match any ScanConnect sticker. 
          Please check that the sticker is a valid ScanConnect sticker and try scanning again.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all"
        >
          ← Go to Home
        </Link>
      </div>
    </div>
  );
}
