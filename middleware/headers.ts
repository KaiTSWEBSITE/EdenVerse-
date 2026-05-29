import type { NextResponse } from "next/server";

export function applySecurityHeaders(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === "production";
  const scriptSrc = ["script-src 'self' 'unsafe-inline'"];

  if (!isProduction) {
    scriptSrc.push("'unsafe-eval'");
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Origin-Agent-Cluster", "?1");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(self), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=(), xr-spatial-tracking=()"
  );

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
      "frame-ancestors 'none'",
      "img-src 'self' data: https:",
      "manifest-src 'self'",
      "media-src 'self' https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      scriptSrc.join(" "),
      "script-src-attr 'none'",
      "connect-src 'self' https://*.vercel-insights.com https://*.vercel.app",
      "frame-src 'none'",
      "worker-src 'self' blob:",
      isProduction ? "block-all-mixed-content" : "",
      isProduction ? "upgrade-insecure-requests" : ""
    ].filter(Boolean).join("; ")
  );
}
