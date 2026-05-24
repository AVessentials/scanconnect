import Link from "next/link";

export default function StickerNotFound() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-zinc-900 mb-2">Sticker Not Found</h2>
      <p className="text-zinc-500 text-sm mb-6">This sticker doesn&apos;t exist.</p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
