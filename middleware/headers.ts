import type { NextResponse } from "next/server";

export function applySecurityHeaders(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === "production";
  const scriptSrc = ["script-src 'self' 'unsafe-inline'", "https://challenges.cloudflare.com"];

  if (!isProduction) {
    scriptSrc.push("'unsafe-eval'");
  }

  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");

  if (isProduction) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "img-src 'self' data: https:",
      "manifest-src 'self'",
      "media-src 'self' https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      scriptSrc.join(" "),
      "connect-src 'self' https://api.github.com https://*.vercel-insights.com https://*.vercel.app https://challenges.cloudflare.com",
      "frame-src 'self' https://challenges.cloudflare.com",
      "worker-src 'self' blob:",
      isProduction ? "upgrade-insecure-requests" : ""
    ].filter(Boolean).join("; ")
  );
}
