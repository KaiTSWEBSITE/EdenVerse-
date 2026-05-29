import { NextResponse } from "next/server";
import { applyRateLimit } from "@/middleware/rate-limit";

export async function POST(request: Request) {
  const limited = applyRateLimit(request.headers.get("x-forwarded-for") ?? "local:verify-email", {
    max: 8,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Too many verification attempts" }, { status: 429 });
  }

  await request.json().catch(() => ({}));
  return NextResponse.json({
    message: "Email verification request received."
  });
}
