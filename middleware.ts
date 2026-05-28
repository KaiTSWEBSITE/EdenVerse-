import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { applySecurityHeaders } from "@/middleware/headers";

const blockedPathPatterns = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/wp-admin/i,
  /^\/wp-login\.php/i,
  /^\/phpmyadmin/i,
  /^\/server-status/i,
  /^\/xmlrpc\.php/i
];

export default auth((request) => {
  const response = NextResponse.next();
  applySecurityHeaders(response);

  const pathname = request.nextUrl.pathname;
  if (blockedPathPatterns.some((pattern) => pattern.test(pathname))) {
    const blocked = NextResponse.json({ message: "Yeu cau bi chan boi EdenVerse Shield." }, { status: 404 });
    applySecurityHeaders(blocked);
    return blocked;
  }

  const isProtected = request.nextUrl.pathname.startsWith("/admin");
  if (isProtected && request.auth?.user?.role !== "ADMIN" && request.auth?.user?.role !== "SUPER_ADMIN") {
    const redirect = NextResponse.redirect(new URL("/auth/login", request.url));
    applySecurityHeaders(redirect);
    return redirect;
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"]
};
