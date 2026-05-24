import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/latest?since=ISO_TIMESTAMP
 *
 * Returns the count of new contact requests created after `since`,
 * plus the single latest request (if any) — just enough info for the
 * live indicator to show a badge and a preview toast.
 *
 * If no `since` is provided, returns the total count (useful on first load).
 */
export async function GET(request: NextRequest) {
  const sinceParam = request.nextUrl.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : null;

  if (since && isNaN(since.getTime())) {
    return NextResponse.json({ error: "Invalid `since` date" }, { status: 400 });
  }

  const where = since ? { createdAt: { gt: since } } : {};

  const [count, latest] = await Promise.all([
    prisma.contactRequest.count({ where }),
    prisma.contactRequest.findFirst({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        callerName: true,
        message: true,
        createdAt: true,
        smsDelivered: true,
        whatsappDelivered: true,
        emailDelivered: true,
      },
    }),
  ]);

  return NextResponse.json({
    count,
    latest,
  });
}
