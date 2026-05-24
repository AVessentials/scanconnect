import { NextResponse } from "next/server";

export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY || null;

  if (!publicKey) {
    // In dev mode, return a placeholder so the client can still subscribe
    // (the push will just log to console)
    return NextResponse.json({
      publicKey: "BGEpONN4CJfWZHEVJxB-6YqVz3XwZZRp5gk5Qm3MDySAfN-nr7TpdxGg3AXyGAMY3AP0gR3PZ_dD5ZRoWFbLh1k",
    });
  }

  return NextResponse.json({ publicKey });
}
