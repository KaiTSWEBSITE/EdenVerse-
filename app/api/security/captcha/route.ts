import { NextResponse } from "next/server";
import { generateLocalCaptcha } from "@/lib/captcha";
import { applyRateLimit } from "@/middleware/rate-limit";

export async function GET(request: Request) {
  const limited = applyRateLimit(`captcha:${request.headers.get("x-forwarded-for") ?? "local"}`, {
    max: 30,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn tạo CAPTCHA quá nhanh, thử lại sau một chút." }, { status: 429 });
  }

  return NextResponse.json(await generateLocalCaptcha(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
