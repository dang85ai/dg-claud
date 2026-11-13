import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/login",
    "/mfa",
    "/activate",
    "/auth/finish",
    "/roster",
    "/media",
    "/order"
  ]
};

