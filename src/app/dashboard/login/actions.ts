"use server";

import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function login(password: string) {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("scanconnect-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/dashboard",
    });
    return { success: true };
  }
  return { success: false };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("scanconnect-auth");
}
