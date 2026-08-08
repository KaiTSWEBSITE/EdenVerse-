import crypto from "node:crypto";
import sanitizeHtml from "sanitize-html";

// ─── HTML sanitization ────────────────────────────────────────────────────────

export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3"]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title"]
    }
  });
}

// ─── Timing-safe comparison ───────────────────────────────────────────────────

export function secureCompare(a?: string | null, b?: string | null) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// ─── CSRF helpers (double-submit cookie pattern) ──────────────────────────────

export const CSRF_COOKIE_NAME = "edenverse_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generates a cryptographically random CSRF token.
 */
export function createCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validates a CSRF token from request header against the cookie value.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function validateCsrfToken(
  headerToken: string | null,
  cookieToken: string | null
): boolean {
  if (!headerToken || !cookieToken) return false;
  if (headerToken.length !== cookieToken.length) return false;
  return secureCompare(headerToken, cookieToken);
}

// ─── Request ID ───────────────────────────────────────────────────────────────

/**
 * Generates a short unique request ID for tracing/logging.
 */
export function createRequestId(): string {
  return crypto.randomBytes(8).toString("hex");
}
