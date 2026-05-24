import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-zinc-900">
              Scan<span className="text-emerald-500">Connect</span>
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <Link href="#how-it-works" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              How It Works
            </Link>
            <Link href="#features" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Admin Panel
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </nav>
          {/* Mobile menu button */}
          <Link
            href="/dashboard"
            className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-medium"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-100" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Now Available — Premium QR Parking Stickers
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6">
              Scan & Contact
              <span className="block text-emerald-500 mt-1">Car Owner Instantly</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              Never leave a paper note again. Stick our QR code on your windshield.
              When parked, anyone can scan it to call, WhatsApp, or message you —
              <span className="font-semibold text-zinc-800"> without exposing your number</span>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                Get Your Sticker
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-50 transition-all"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-zinc-600 max-w-xl mx-auto">
              Three simple steps to never worry about parking notes again
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Get Your Sticker",
                desc: "Order your ScanConnect sticker. We'll ship a weatherproof QR sticker ready to stick on your windshield or bumper.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Set Up Your Profile",
                desc: "Register your sticker online. Add your phone & WhatsApp — the system keeps your number masked from the public.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Park Worry-Free",
                desc: "Stick it on your car. When parked, anyone can scan the QR and reach you instantly — call, WhatsApp, or send a message.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8 rounded-3xl border border-zinc-100 hover:border-emerald-200 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-emerald-500 mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">{item.title}</h3>
                  <p className="text-zinc-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scan Preview */}
      <section className="py-20 sm:py-28 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-4">
                👀 What They See
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
                This is what shows up when someone scans your QR code
              </h2>
              <p className="text-lg text-zinc-600 leading-relaxed mb-6">
                A clean, professional page appears on their phone instantly.
                No app download needed — it works right in the camera or browser.
              </p>
              <ul className="space-y-3">
                {[
                  "📱 Instant call button — one tap to connect",
                  "💬 WhatsApp direct message",
                  "✉️ Send a message form (number stays private)",
                  "🚗 Optional car details so they know it's your car",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-zinc-700">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              {/* Phone mockup */}
              <div className="mx-auto max-w-[280px]">
                <div className="bg-zinc-900 rounded-[2.5rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-emerald-500 px-4 pt-8 pb-4 text-white text-center">
                      <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mb-3" />
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-white/90">ScanConnect</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="text-center">
                        <p className="text-xs text-zinc-400">This car belongs to</p>
                        <p className="font-bold text-zinc-900">Rahul S.</p>
                      </div>
                      <button className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition-colors">
                        📞 Call Owner
                      </button>
                      <button className="w-full py-2.5 rounded-xl bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-colors">
                        💬 WhatsApp
                      </button>
                      <button className="w-full py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium text-sm hover:bg-zinc-50 transition-colors">
                        ✉️ Send Message
                      </button>
                      <p className="text-[10px] text-zinc-400 text-center">
                        Your number stays private • No app needed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Why ScanConnect?
            </h2>
            <p className="text-lg text-zinc-600 max-w-xl mx-auto">
              Everything you need for stress-free parking
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Privacy Protected", desc: "Your phone number stays hidden. All communication is routed through our platform.", emoji: "🛡️" },
              { title: "Weatherproof Sticker", desc: "Premium vinyl sticker that survives rain, sun, and car washes. UV resistant.", emoji: "☀️" },
              { title: "No App Required", desc: "Works with any phone's camera. No downloads, no sign-ups for the scanner.", emoji: "📸" },
              { title: "Multiple Contact Options", desc: "Call, WhatsApp, or send a message — the scanner chooses how to reach you.", emoji: "📱" },
              { title: "Instant Setup", desc: "Register your sticker online in under 2 minutes. Start using it immediately.", emoji: "⚡" },
              { title: "Resell & Earn", desc: "Buy in bulk as an affiliate. Sell to friends, family, and local car owners.", emoji: "💰" },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl border border-zinc-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                <span className="text-3xl mb-3 block">{feature.emoji}</span>
                <h3 className="font-bold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
              Pricing
            </h2>
            <p className="text-lg text-zinc-600 max-w-xl mx-auto">
              Choose the plan that works for you
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Single",
                price: "₹199",
                desc: "One sticker for your car",
                features: ["1 premium QR sticker", "Full privacy masking", "Lifetime profile access", "Instant setup"],
                popular: false,
              },
              {
                name: "Family Pack",
                price: "₹499",
                desc: "For 3 cars in your family",
                features: ["3 premium QR stickers", "Full privacy masking", "Lifetime profile access", "Bulk discount", "Priority support"],
                popular: true,
              },
              {
                name: "Reseller Pack",
                price: "₹999",
                desc: "Sell stickers & earn profit",
                features: ["10 premium QR stickers", "Full privacy masking", "Reseller dashboard", "Custom branding option", "Wholesale pricing", "Dedicated support"],
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? "bg-zinc-900 text-white ring-2 ring-emerald-400 scale-105"
                    : "bg-white border border-zinc-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold ${plan.popular ? "text-zinc-300" : "text-zinc-500"}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className={`text-sm ml-1 ${plan.popular ? "text-zinc-400" : "text-zinc-500"}`}>/ once</span>
                  </div>
                  <p className={`text-sm mt-1 ${plan.popular ? "text-zinc-400" : "text-zinc-500"}`}>{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 ${plan.popular ? "text-emerald-400" : "text-emerald-500"}`}>✓</span>
                      <span className={plan.popular ? "text-zinc-300" : "text-zinc-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:orders@scanconnect.in?subject=Order: ${plan.name} Pack`}
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  Order Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-zinc-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Never Leave a Note Again?
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Join hundreds of car owners who use ScanConnect. Get your sticker today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-all hover:scale-105 shadow-lg"
            >
              Order Your Sticker
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800 transition-all"
            >
              Manage My Sticker
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-500 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-zinc-400">
                Scan<span className="text-emerald-500">Connect</span>
              </span>
            </div>
            <p className="text-xs">© 2026 ScanConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
