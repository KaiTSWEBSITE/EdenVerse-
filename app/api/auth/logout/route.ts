import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "@/middleware/headers";

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token"
];

const AUXILIARY_COOKIE_NAMES = [
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url"
];

const MAX_CHUNKED_SESSION_COOKIES = 6;

function getSafeCallbackUrl(request: NextRequest) {
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") ?? "/";

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/";
  }

  if (callbackUrl.startsWith("/admin") || callbackUrl.startsWith("/eden-vault")) {
    return "/";
  }

  return callbackUrl;
}

function getAuthCookieNames() {
  const sessionCookieNames = SESSION_COOKIE_NAMES.flatMap((name) => [
    name,
    ...Array.from({ length: MAX_CHUNKED_SESSION_COOKIES }, (_, index) => `${name}.${index}`)
  ]);

  return [...sessionCookieNames, ...AUXILIARY_COOKIE_NAMES];
}

function appendExpiredCookie(response: NextResponse, name: string, domain?: string) {
  const domainPart = domain ? `; Domain=${domain}` : "";
  response.headers.append(
    "Set-Cookie",
    `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure${domainPart}`
  );
}

function expireAuthCookies(request: NextRequest, response: NextResponse) {
  const host = request.nextUrl.hostname;

  for (const name of getAuthCookieNames()) {
    appendExpiredCookie(response, name);
    appendExpiredCookie(response, name, host);
  }
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL(getSafeCallbackUrl(request), request.url));
  expireAuthCookies(request, response);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  applySecurityHeaders(response);
  return response;
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  expireAuthCookies(request, response);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  applySecurityHeaders(response);
  return response;
}
