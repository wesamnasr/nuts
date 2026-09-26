import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_key_change_in_prod";
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      // Missing token, redirect to login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      // Verify token authenticity
      await jwtVerify(token, encodedSecret);
      return NextResponse.next();
    } catch (error) {
      console.error("JWT verification failed:", error);
      // Invalid or expired token
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
