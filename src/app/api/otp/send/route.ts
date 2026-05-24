import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpSms } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid phone number (at least 10 digits)" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");

    const now = new Date();

    // ── Housekeeping: clean up expired OTPs for this phone ─────────
    await prisma.otp.deleteMany({
      where: {
        phone: cleanPhone,
        expiresAt: { lt: now },
      },
    });

    // ── Rate limit: max 1 OTP per 60 seconds (cooldown) ────────────
    const recentOtp = await prisma.otp.findFirst({
      where: {
        phone: cleanPhone,
        createdAt: { gte: new Date(now.getTime() - 60_000) },
      },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: "OTP already sent. Please wait 60 seconds before requesting a new one." },
        { status: 429 }
      );
    }

    // ── Rate limit: max 5 OTPs per phone per 10 minutes ────────────
    const recentOtpsCount = await prisma.otp.count({
      where: {
        phone: cleanPhone,
        createdAt: { gte: new Date(now.getTime() - 10 * 60 * 1000) },
      },
    });

    if (recentOtpsCount >= 5) {
      const oldestInWindow = await prisma.otp.findFirst({
        where: {
          phone: cleanPhone,
          createdAt: { gte: new Date(now.getTime() - 10 * 60 * 1000) },
        },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      });

      const retryAfterMs = oldestInWindow
        ? oldestInWindow.createdAt.getTime() + 10 * 60 * 1000 - now.getTime()
        : 10 * 60 * 1000;

      return NextResponse.json(
        {
          error: `Too many OTP requests. Please try again in ${Math.max(1, Math.ceil(retryAfterMs / 60_000))} minute(s).`,
        },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Store OTP in database (expires in 10 minutes)
    await prisma.otp.create({
      data: {
        phone: cleanPhone,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send via SMS
    const result = await sendOtpSms(cleanPhone, code);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // In dev mode, return the code so the browser test can read it
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json({
      success: true,
      ...(isDev ? { devOtp: code } : {}),
    });
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
