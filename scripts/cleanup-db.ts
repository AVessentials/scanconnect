import { PrismaClient } from "@prisma/client";
import { FAILED_ATTEMPT_RETENTION_HOURS } from "../src/lib/cleanup";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - FAILED_ATTEMPT_RETENTION_HOURS * 60 * 60 * 1000);

  console.log(`[Cleanup] Starting at ${now.toISOString()}`);

  // 1. Delete expired OTPs
  const expiredOtpResult = await prisma.otp.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  console.log(`[Cleanup] Deleted ${expiredOtpResult.count} expired OTP(s)`);

  // 2. Delete old failed attempts
  const oldAttemptsResult = await prisma.failedOtpAttempt.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  console.log(`[Cleanup] Deleted ${oldAttemptsResult.count} old failed attempt(s)`);

  console.log("[Cleanup] Done.");
}

main()
  .catch((err) => {
    console.error("[Cleanup] Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
