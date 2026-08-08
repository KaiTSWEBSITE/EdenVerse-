import { NextResponse } from "next/server";
import { z } from "zod";
import { applySecurityHeaders } from "@/middleware/headers";
import { applyRateLimit } from "@/middleware/rate-limit";

const captchaSchema = z.object({
  token: z.string().trim().min(20).max(4096)
});

type TurnstileResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
};

function json(message: string, status: number) {
  const response = NextResponse.json({ message }, { status });
  applySecurityHeaders(response);
  return response;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("cf-connecting-ip") || forwardedFor || request.headers.get("x-real-ip") || "local";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(`captcha:${ip}`, {
    windowMs: 60_000,
    max: 12
  });

  if (!limited.success) {
    return json(`Bạn xác minh quá nhanh. Thử lại sau ${limited.retryAfter ?? 60} giây.`, 429);
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return json("Captcha server chưa được cấu hình TURNSTILE_SECRET_KEY.", 503);
  }

  const body = await request.json().catch(() => null);
  const parsed = captchaSchema.safeParse(body);

  if (!parsed.success) {
    return json("Captcha token không hợp lệ.", 400);
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", parsed.data.token);
  if (ip !== "local") {
    form.set("remoteip", ip);
  }

  try {
    const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000)
    });

    const data = (await verifyResponse.json()) as TurnstileResponse;

    if (!verifyResponse.ok || !data.success) {
      return json("Captcha chưa được xác minh, vui lòng thử lại.", 400);
    }

    const response = NextResponse.json({ ok: true });
    applySecurityHeaders(response);
    return response;
  } catch {
    return json("Không kết nối được máy chủ captcha. Vui lòng thử lại.", 502);
  }
}
