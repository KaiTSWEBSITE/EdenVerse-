import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { applySecurityHeaders } from "@/middleware/headers";

export default auth((request) => {
  const response = NextResponse.next();
  applySecurityHeaders(response);

  const isProtected = request.nextUrl.pathname.startsWith("/admin");
  if (isProtected && request.auth?.user?.role !== "ADMIN" && request.auth?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"]
};
