import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { applySecurityHeaders } from "@/middleware/headers";

const blockedPathPatterns = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/\.next/i,
  /^\/\.npmrc$/i,
  /^\/\.vercel(?:\/|$)/i,
  /^\/auth\.ts$/i,
  /^\/docker-compose\.ya?ml$/i,
  /^\/Dockerfile$/i,
  /^\/database(?:\/|$)/i,
  /^\/eslint\.config\.(?:js|mjs|ts)$/i,
  /^\/middleware\.ts$/i,
  /^\/next\.config\.(?:js|mjs|ts)$/i,
  /^\/node_modules(?:\/|$)/i,
  /^\/package(?:-lock)?\.json$/i,
  /^\/pnpm-lock\.yaml$/i,
  /^\/prisma(?:\/|$)/i,
  /^\/README\.md$/i,
  /^\/scripts(?:\/|$)/i,
  /^\/src(?:\/|$)/i,
  /^\/source(?:\/|$)/i,
  /^\/tsconfig\.json$/i,
  /^\/yarn\.lock$/i,
  /^\/wp-admin/i,
  /^\/wp-login\.php/i,
  /^\/phpmyadmin/i,
  /^\/server-status/i,
  /^\/xmlrpc\.php/i
];

const unsafeMethods = new Set(["DELETE", "PATCH", "POST", "PUT"]);
const MAX_API_BODY_BYTES = 1_000_000;
const MAX_UPLOAD_BODY_BYTES = 6_000_000;

function securityJson(message: string, status: number) {
  const response = NextResponse.json({ message }, { status });
  applySecurityHeaders(response);
  return response;
}

function getContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) {
    return 0;
  }

  const parsed = Number(contentLength);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isCrossSiteFetch(request: Request) {
  return request.headers.get("sec-fetch-site") === "cross-site";
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export default auth((request) => {
  const response = NextResponse.next();
  applySecurityHeaders(response);

  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const isProtected = pathname.startsWith("/admin");

  if (isApiRoute || isProtected) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  if (blockedPathPatterns.some((pattern) => pattern.test(pathname))) {
    return securityJson("Yeu cau bi chan boi EdenVerse Shield.", 404);
  }

  if (unsafeMethods.has(request.method)) {
    if (isCrossSiteFetch(request) || !isSameOriginRequest(request)) {
      return securityJson("Yeu cau khong dung nguon hop le.", 403);
    }

    if (isApiRoute) {
      const maxBodySize = pathname === "/api/upload" ? MAX_UPLOAD_BODY_BYTES : MAX_API_BODY_BYTES;
      if (getContentLength(request) > maxBodySize) {
        return securityJson("Request qua lon nen da bi chan.", 413);
      }
    }
  }

  if (isProtected) {
    const role = request.auth?.user?.role ?? "";
    const canEnterAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

    if (canEnterAdmin) {
      return response;
    }

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);

    if (request.auth?.user) {
      loginUrl.searchParams.set("reason", "not-admin");
    }

    const redirect = NextResponse.redirect(loginUrl);
    applySecurityHeaders(redirect);
    return redirect;
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"]
};
