import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FAILED_ATTEMPT_RETENTION_HOURS } from "@/lib/cleanup";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  // ── Authorization ──────────────────────────────────────────
  // If CRON_SECRET is set in production, require matching header
  if (CRON_SECRET) {
    const authHeader = req.headers.get("x-cron-secret") ?? "";
    if (authHeader !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  // In dev (no CRON_SECRET), allow open access for testing

  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - FAILED_ATTEMPT_RETENTION_HOURS * 60 * 60 * 1000);

    // ── 1. Delete expired OTPs ──────────────────────────────
    const expiredOtpResult = await prisma.otp.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    // ── 2. Delete old failed attempts ────────────────────────
    const oldAttemptsResult = await prisma.failedOtpAttempt.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    return NextResponse.json({
      success: true,
      deletedExpiredOtps: expiredOtpResult.count,
      deletedOldFailedAttempts: oldAttemptsResult.count,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("Cleanup error:", err);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
