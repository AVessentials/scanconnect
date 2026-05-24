"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface Props {
  url: string;
  size?: number;
}

export default function QRCodeDisplay({ url, size = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });
    }
  }, [url, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg"
    />
  );
}
