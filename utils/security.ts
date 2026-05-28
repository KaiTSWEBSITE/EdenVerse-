import crypto from "node:crypto";
import sanitizeHtml from "sanitize-html";

export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3"]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title"]
    }
  });
}

export function createCsrfToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function secureCompare(a?: string | null, b?: string | null) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
