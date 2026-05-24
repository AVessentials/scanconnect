import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and OTP code are required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");

    // ── Rate limiting: max 5 failed attempts per phone per 10 minutes ──
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

    // Clean up stale records older than the rate-limit window
    await prisma.failedOtpAttempt.deleteMany({
      where: {
        phone: cleanPhone,
        createdAt: { lt: windowStart },
      },
    });

    const recentFailures = await prisma.failedOtpAttempt.count({
      where: {
        phone: cleanPhone,
        createdAt: { gte: windowStart },
      },
    });

    if (recentFailures >= MAX_ATTEMPTS) {
      // Find the oldest attempt in the window to calculate wait time
      const oldestInWindow = await prisma.failedOtpAttempt.findFirst({
        where: {
          phone: cleanPhone,
          createdAt: { gte: windowStart },
        },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      });

      const retryAfterMs = oldestInWindow
        ? oldestInWindow.createdAt.getTime() + RATE_LIMIT_WINDOW_MS - Date.now()
        : RATE_LIMIT_WINDOW_MS;

      const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterMs / 60_000));

      return NextResponse.json(
        {
          error: `Too many incorrect attempts. Please try again in ${retryAfterMinutes} minute(s).`,
        },
        { status: 429 }
      );
    }

    // ── Verify OTP ──────────────────────────────────────────────────
    const otp = await prisma.otp.findFirst({
      where: {
        phone: cleanPhone,
        code: code.trim(),
        verified: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!otp) {
      // Record the failed attempt
      await prisma.failedOtpAttempt.create({
        data: { phone: cleanPhone },
      });

      return NextResponse.json(
        { error: "Invalid or expired OTP. Please request a new one." },
        { status: 400 }
      );
    }

    // ── Success (atomic transaction) ───────────────────────────────
    await prisma.$transaction([
      prisma.failedOtpAttempt.deleteMany({ where: { phone: cleanPhone } }),
      prisma.otp.update({
        where: { id: otp.id },
        data: { verified: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      verified: true,
      otpId: otp.id,
    });
  } catch (err) {
    console.error("OTP verify error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
