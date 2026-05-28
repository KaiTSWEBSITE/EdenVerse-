import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { applyRateLimit } from "@/middleware/rate-limit";
import { createCsrfToken } from "@/utils/security";

export async function POST(request: Request) {
  const limited = applyRateLimit(request.headers.get("x-forwarded-for") ?? "local:forgot-password", {
    max: 5,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Too many password reset requests" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = forgotPasswordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
  }

  return NextResponse.json({
    message: `Password reset flow initialized for ${parsed.data.email}. Connect your mailer to deliver this token.`,
    token: createCsrfToken()
  });
}
