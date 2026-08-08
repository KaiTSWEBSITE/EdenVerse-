import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "@/middleware/headers";
import { createRequestId } from "@/utils/security";

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
  /^\/xmlrpc\.php/i,
  /^\/\.well-known\/(?!acme-challenge)/i, // Allow ACME but block other .well-known probes
  /^\/config(?:\/|$)/i,
  /^\/backup(?:\/|$)/i
];

const unsafeMethods = new Set(["DELETE", "PATCH", "POST", "PUT"]);
const MAX_API_BODY_BYTES = 1_000_000;
const MAX_UPLOAD_BODY_BYTES = 6_000_000;

function securityJson(message: string, status: number, extra?: Record<string, string>) {
  const response = NextResponse.json({ message }, { status });
  applySecurityHeaders(response);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      response.headers.set(key, value);
    }
  }
  return response;
}

function getContentLength(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return 0;
  const parsed = Number(contentLength);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isCrossSiteFetch(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  return fetchSite === "cross-site";
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // no origin header = likely same-origin or server-to-server

  try {
    const originHost = new URL(origin).host;
    const requestHost = new URL(request.url).host;
    return originHost === requestHost;
  } catch {
    return false;
  }
}

function hasAuthSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.includes("authjs.session-token") ||
        cookie.name.includes("next-auth.session-token")
    );
}

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  applySecurityHeaders(response);

  // Attach a unique request ID for traceability
  const requestId = createRequestId();
  response.headers.set("X-Request-Id", requestId);

  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");
  const isProtected = pathname.startsWith("/admin");
  const isAdminVault = pathname === "/eden-vault";

  if (isApiRoute || isProtected || isAdminVault) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  // Block sensitive file/path access attempts
  if (blockedPathPatterns.some((pattern) => pattern.test(pathname))) {
    return securityJson("Yeu cau bi chan boi EdenVerse Shield.", 404);
  }

  // CSRF / origin checks for state-changing requests
  if (unsafeMethods.has(request.method)) {
    if (isCrossSiteFetch(request) || !isSameOriginRequest(request)) {
      return securityJson("Yeu cau khong dung nguon hop le.", 403);
    }

    if (isApiRoute) {
      const maxBodySize =
        pathname === "/api/upload" ? MAX_UPLOAD_BODY_BYTES : MAX_API_BODY_BYTES;
      if (getContentLength(request) > maxBodySize) {
        return securityJson("Request qua lon nen da bi chan.", 413);
      }
    }
  }

  // Protect admin routes — require session cookie
  if (isProtected && !hasAuthSessionCookie(request)) {
    const redirect = NextResponse.redirect(new URL("/", request.url));
    applySecurityHeaders(redirect);
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"]
};
