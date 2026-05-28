import { NextResponse } from "next/server";
import { verifyCaptcha } from "@/lib/captcha";
import { loginSchema } from "@/lib/validators";
import { verifyDemoCredentials } from "@/services/auth-service";
import { applyRateLimit } from "@/middleware/rate-limit";

export async function POST(request: Request) {
  const limited = applyRateLimit(request.headers.get("x-forwarded-for") ?? "local:login", {
    max: 8,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Too many login attempts" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid credentials payload" }, { status: 400 });
  }

  const captcha = await verifyCaptcha(parsed.data, request);
  if (!captcha.ok) {
    return NextResponse.json({ message: captcha.message }, { status: 403 });
  }

  const user = await verifyDemoCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }

  return NextResponse.json({ message: "Credentials validated. Use NextAuth session flow on the client.", user });
}
