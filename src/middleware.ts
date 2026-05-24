import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all dashboard routes except the login page
  if (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/login")) {
    const authCookie = request.cookies.get("scanconnect-auth");

    if (authCookie?.value !== "authenticated") {
      const loginUrl = new URL("/dashboard/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
