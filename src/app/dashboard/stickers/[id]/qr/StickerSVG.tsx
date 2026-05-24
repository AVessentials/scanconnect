"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface Props {
  scanUrl: string;
  qrCodeId: string;
  ownerName: string | null;
  carLabel: string | null;
}

export default function StickerSVG({ scanUrl, qrCodeId, ownerName, carLabel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (qrDataUrl) return;

    QRCode.toDataURL(scanUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
    }).then((url) => {
      setQrDataUrl(url);
    });
  }, [scanUrl, qrDataUrl]);

  const stickerWidth = 1050; // 3.5 inches at 300 DPI
  const stickerHeight = 1500; // 5 inches at 300 DPI

  return (
    <div className="flex flex-col items-center">
      {/* Sticker Preview */}
      <svg
        viewBox={`0 0 ${stickerWidth} ${stickerHeight}`}
        width={stickerWidth / 4}
        height={stickerHeight / 4}
        className="border border-zinc-300 rounded-lg shadow-lg bg-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cut line (dashed border) */}
        <rect
          x="20"
          y="20"
          width={stickerWidth - 40}
          height={stickerHeight - 40}
          rx="30"
          ry="30"
          fill="none"
          stroke="#d4d4d8"
          strokeWidth="3"
          strokeDasharray="12,6"
        />

        {/* White background */}
        <rect
          x="30"
          y="30"
          width={stickerWidth - 60}
          height={stickerHeight - 60}
          rx="24"
          ry="24"
          fill="#ffffff"
        />

        {/* Top gradient bar */}
        <defs>
          <linearGradient id="topBar" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="bottomBar" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* Top bar */}
        <rect
          x="30"
          y="30"
          width={stickerWidth - 60}
          height="100"
          rx="24"
          ry="24"
          fill="url(#topBar)"
        />
        <rect
          x="30"
          y="80"
          width={stickerWidth - 60}
          height="50"
          fill="url(#topBar)"
        />

        {/* ScanConnect Logo in top bar */}
        <rect x="60" y="52" width="36" height="36" rx="8" ry="8" fill="rgba(255,255,255,0.2)" />
        {/* QR icon inside logo */}
        <rect x="66" y="58" width="10" height="10" rx="2" ry="2" fill="white" />
        <rect x="80" y="58" width="10" height="10" rx="2" ry="2" fill="white" />
        <rect x="66" y="72" width="24" height="10" rx="2" ry="2" fill="white" />

        <text x="112" y="78" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="white">
          ScanConnect
        </text>

        {/* Main content area */}
        {/* Instructions text */}
        <text
          x={stickerWidth / 2}
          y="180"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="22"
          fontWeight="bold"
          fill="#18181b"
        >
          Scan & CONTACT OWNER
        </text>

        <text
          x={stickerWidth / 2}
          y="210"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="14"
          fill="#71717a"
        >
          If I'm parked inconveniently, please scan me
        </text>

        {/* QR Code area */}
        {qrDataUrl ? (
          <image
            x={stickerWidth / 2 - 180}
            y="250"
            width="360"
            height="360"
            href={qrDataUrl}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          <rect
            x={stickerWidth / 2 - 180}
            y="250"
            width="360"
            height="360"
            rx="16"
            ry="16"
            fill="#f4f4f5"
          />
        )}

        {/* Camera hint */}
        <text
          x={stickerWidth / 2}
          y="660"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="14"
          fill="#71717a"
        >
          📸 Point your camera here
        </text>

        {/* Contact options */}
        <g transform="translate(120, 720)">
          {/* Call */}
          <rect x="0" y="0" width="370" height="50" rx="12" ry="12" fill="#10b981" />
          <text x="185" y="32" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="white">
            📞  Call Owner
          </text>

          {/* WhatsApp */}
          <rect x="410" y="0" width="370" height="50" rx="12" ry="12" fill="#25D366" />
          <text x="595" y="32" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="white">
            💬  WhatsApp
          </text>
        </g>

        {/* Message option */}
        <g transform="translate(120, 790)">
          <rect x="0" y="0" width="660" height="44" rx="12" ry="12" fill="none" stroke="#e4e4e7" strokeWidth="2" />
          <text x="330" y="28" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="15" fill="#52525b">
            ✉️  Or send a message — number stays private
          </text>
        </g>

        {ownerName && (
          <text
            x={stickerWidth / 2}
            y="880"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="16"
            fill="#18181b"
            fontWeight="bold"
          >
            {carLabel ? `${ownerName} · ${carLabel}` : ownerName}
          </text>
        )}

        {/* Sticker ID */}
        <text
          x={stickerWidth / 2}
          y="920"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="10"
          fill="#a1a1aa"
        >
          ID: {qrCodeId.slice(0, 12)}...
        </text>

        {/* Bottom bar */}
        <rect
          x="30"
          y={stickerHeight - 130}
          width={stickerWidth - 60}
          height="100"
          rx="24"
          ry="24"
          fill="url(#bottomBar)"
        />
        <rect
          x="30"
          y={stickerHeight - 130}
          width={stickerWidth - 60}
          height="50"
          fill="url(#bottomBar)"
        />

        <text
          x={stickerWidth / 2}
          y={stickerHeight - 95}
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="14"
          fill="#a1a1aa"
        >
          No app required · Works with any smartphone camera
        </text>

        <text
          x={stickerWidth / 2}
          y={stickerHeight - 70}
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="12"
          fontWeight="bold"
          fill="#34d399"
        >
          ScanConnect
        </text>

        <text
          x={stickerWidth / 2}
          y={stickerHeight - 52}
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="9"
          fill="#52525b"
        >
          scanconnect.in
        </text>
      </svg>

      {/* Download buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => downloadSVG(stickerWidth, stickerHeight, qrDataUrl, scanUrl, qrCodeId, ownerName, carLabel)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download SVG
        </button>
      </div>
    </div>
  );
}

function downloadSVG(
  width: number,
  height: number,
  qrDataUrl: string,
  scanUrl: string,
  qrCodeId: string,
  ownerName: string | null,
  carLabel: string | null
) {
  const svgContent = generateSVGString(width, height, qrDataUrl, scanUrl, qrCodeId, ownerName, carLabel);
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scanconnect-sticker-${qrCodeId.slice(0, 8)}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

function generateSVGString(
  width: number,
  height: number,
  qrDataUrl: string,
  scanUrl: string,
  qrCodeId: string,
  ownerName: string | null,
  carLabel: string | null
): string {
  const maskedId = qrCodeId.slice(0, 12);
  const ownerText = ownerName
    ? carLabel
      ? `${ownerName} · ${carLabel}`
      : ownerName
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${width} ${height}" width="${width / 4}" height="${height / 4}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#10b981"/>
      <stop offset="100%" stopColor="#059669"/>
    </linearGradient>
    <linearGradient id="bottomBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#0f172a"/>
      <stop offset="100%" stopColor="#1e293b"/>
    </linearGradient>
  </defs>

  <!-- Cut line -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="30" ry="30" fill="none" stroke="#d4d4d8" stroke-width="3" stroke-dasharray="12,6"/>

  <!-- White background -->
  <rect x="30" y="30" width="${width - 60}" height="${height - 60}" rx="24" ry="24" fill="#ffffff"/>

  <!-- Top bar -->
  <rect x="30" y="30" width="${width - 60}" height="100" rx="24" ry="24" fill="url(#topBar)"/>
  <rect x="30" y="80" width="${width - 60}" height="50" fill="url(#topBar)"/>

  <!-- Logo -->
  <rect x="60" y="52" width="36" height="36" rx="8" ry="8" fill="rgba(255,255,255,0.2)"/>
  <rect x="66" y="58" width="10" height="10" rx="2" ry="2" fill="white"/>
  <rect x="80" y="58" width="10" height="10" rx="2" ry="2" fill="white"/>
  <rect x="66" y="72" width="24" height="10" rx="2" ry="2" fill="white"/>
  <text x="112" y="78" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white">ScanConnect</text>

  <!-- Title -->
  <text x="${width / 2}" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#18181b">Scan &amp; CONTACT OWNER</text>
  <text x="${width / 2}" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#71717a">If I'm parked inconveniently, please scan me</text>

  <!-- QR Code -->
  <image x="${width / 2 - 180}" y="250" width="360" height="360" href="${qrDataUrl}" preserveAspectRatio="xMidYMid meet"/>

  <!-- Camera hint -->
  <text x="${width / 2}" y="660" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#71717a">📸 Point your camera here</text>

  <!-- Contact buttons -->
  <g transform="translate(120, 720)">
    <rect x="0" y="0" width="370" height="50" rx="12" ry="12" fill="#10b981"/>
    <text x="185" y="32" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">📞  Call Owner</text>
    <rect x="410" y="0" width="370" height="50" rx="12" ry="12" fill="#25D366"/>
    <text x="595" y="32" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">💬  WhatsApp</text>
  </g>

  <!-- Message option -->
  <g transform="translate(120, 790)">
    <rect x="0" y="0" width="660" height="44" rx="12" ry="12" fill="none" stroke="#e4e4e7" stroke-width="2"/>
    <text x="330" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#52525b">✉️  Or send a message — number stays private</text>
  </g>

  ${ownerText ? `<text x="${width / 2}" y="880" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#18181b" font-weight="bold">${ownerText}</text>` : ""}

  <!-- Sticker ID -->
  <text x="${width / 2}" y="920" text-anchor="middle" font-family="monospace" font-size="10" fill="#a1a1aa">ID: ${maskedId}...</text>

  <!-- Bottom bar -->
  <rect x="30" y="${height - 130}" width="${width - 60}" height="100" rx="24" ry="24" fill="url(#bottomBar)"/>
  <rect x="30" y="${height - 130}" width="${width - 60}" height="50" fill="url(#bottomBar)"/>
  <text x="${width / 2}" y="${height - 95}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#a1a1aa">No app required · Works with any smartphone camera</text>
  <text x="${width / 2}" y="${height - 70}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#34d399">ScanConnect</text>
  <text x="${width / 2}" y="${height - 52}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#52525b">scanconnect.in</text>
</svg>`;
}
