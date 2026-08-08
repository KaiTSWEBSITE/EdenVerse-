import { NextResponse } from "next/server";
import { applyRateLimit } from "@/middleware/rate-limit";

export async function POST(request: Request) {
  const limited = applyRateLimit(request.headers.get("x-forwarded-for") ?? "local:login-probe", {
    max: 8,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Too many login attempts" }, { status: 429 });
  }

  return NextResponse.json(
    { message: "Credential probing endpoint is disabled. Use the protected NextAuth session flow." },
    { status: 404 }
  );
}
