const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const LOCAL_CAPTCHA_PREFIX = "eden-local.";
const CAPTCHA_TTL_MS = 10 * 60_000;

type LocalCaptchaPayload = {
  answerHash: string;
  expiresAt: number;
  nonce: string;
};

type CaptchaInput = {
  captchaAnswer?: unknown;
  captchaToken?: unknown;
};

const textEncoder = new TextEncoder();

function getCaptchaSecret() {
  return process.env.CAPTCHA_SECRET ?? process.env.AUTH_SECRET ?? "edenverse-development-captcha-secret";
}

function randomBetween(min: number, max: number) {
  const range = max - min + 1;
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return min + (values[0] % range);
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToString(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

function base64UrlEncode(value: string) {
  return bytesToBase64Url(textEncoder.encode(value));
}

async function hmac(value: string, output: "base64url" | "hex") {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getCaptchaSecret()),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"]
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, textEncoder.encode(value)));

  if (output === "hex") {
    return Array.from(signature)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  return bytesToBase64Url(signature);
}

async function sign(value: string) {
  return hmac(value, "base64url");
}

async function hashAnswer(answer: string, nonce: string) {
  return hmac(`${answer.trim().toLowerCase()}:${nonce}`, "hex");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}

function getRemoteIp(request?: Request) {
  return request?.headers.get("cf-connecting-ip") ?? request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}

export async function generateLocalCaptcha() {
  const left = randomBetween(4, 12);
  const right = randomBetween(2, 10);
  const answer = String(left + right);
  const nonce = crypto.randomUUID();
  const payload: LocalCaptchaPayload = {
    answerHash: await hashAnswer(answer, nonce),
    expiresAt: Date.now() + CAPTCHA_TTL_MS,
    nonce
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(encodedPayload);

  return {
    expiresAt: payload.expiresAt,
    provider: "local",
    question: `${left} + ${right} = ?`,
    token: `${LOCAL_CAPTCHA_PREFIX}${encodedPayload}.${signature}`
  };
}

async function verifyLocalCaptcha(token: string, answer: string) {
  if (!token.startsWith(LOCAL_CAPTCHA_PREFIX)) {
    return false;
  }

  const unsignedToken = token.slice(LOCAL_CAPTCHA_PREFIX.length);
  const [encodedPayload, signature] = unsignedToken.split(".");

  if (!encodedPayload || !signature || !safeEqual(await sign(encodedPayload), signature)) {
    return false;
  }

  const payload = JSON.parse(base64UrlToString(encodedPayload)) as LocalCaptchaPayload;

  if (!payload.expiresAt || payload.expiresAt < Date.now()) {
    return false;
  }

  return safeEqual(payload.answerHash, await hashAnswer(answer, payload.nonce));
}

async function verifyTurnstileCaptcha(token: string, request?: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { ok: false, message: "CAPTCHA chưa được cấu hình trên server." };
  }

  const body = new URLSearchParams({
    secret,
    response: token
  });
  const remoteIp = getRemoteIp(request);

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body,
    cache: "no-store"
  });

  if (!response.ok) {
    return { ok: false, message: "Không thể xác minh CAPTCHA lúc này." };
  }

  const result = (await response.json()) as { success?: boolean };
  return result.success
    ? { ok: true }
    : { ok: false, message: "CAPTCHA không hợp lệ, vui lòng thử lại." };
}

export async function verifyCaptcha(input: CaptchaInput, request?: Request) {
  const token = typeof input.captchaToken === "string" ? input.captchaToken : "";
  const answer = typeof input.captchaAnswer === "string" ? input.captchaAnswer : "";

  if (!token) {
    return { ok: false, message: "Vui lòng hoàn tất CAPTCHA." };
  }

  if (token.startsWith(LOCAL_CAPTCHA_PREFIX)) {
    return (await verifyLocalCaptcha(token, answer))
      ? { ok: true }
      : { ok: false, message: "Mã CAPTCHA không đúng hoặc đã hết hạn." };
  }

  return verifyTurnstileCaptcha(token, request);
}
