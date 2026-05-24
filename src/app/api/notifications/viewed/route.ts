import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const adminOwnerId = process.env.ADMIN_OWNER_ID;
    if (!adminOwnerId) {
      return NextResponse.json({ ok: false, error: "No ADMIN_OWNER_ID set" }, { status: 400 });
    }

    await prisma.owner.update({
      where: { id: adminOwnerId },
      data: { lastViewedNotificationsAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update lastViewedNotificationsAt:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
