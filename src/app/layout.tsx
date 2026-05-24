import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { DarkModeProvider } from "@/components/DarkModeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScanConnect - Scan & Contact Car Owner",
  description:
    "Never leave a note again. ScanConnect QR stickers let anyone reach you when your car is parked — via call, WhatsApp, or message. No need to share your number publicly.",
  keywords: [
    "car QR sticker",
    "scan to contact owner",
    "parking sticker",
    "Sampark alternative",
    "car owner contact",
    "QR code parking",
  ],
  openGraph: {
    title: "ScanConnect - Scan & Contact Car Owner",
    description:
      "Never leave a note again. Scan your QR code to instantly contact the car owner.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ScanConnect" />
      </head>
      <body className="min-h-full flex flex-col">
        <DarkModeProvider>
          <ServiceWorkerRegistration />
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}
