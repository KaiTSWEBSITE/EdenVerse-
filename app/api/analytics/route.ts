import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { applyRateLimit } from "@/middleware/rate-limit";
import { getDashboardMetrics } from "@/services/analytics-service";
import { recordPageView } from "@/services/analytics-tracking-service";

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function getVisitorFingerprint(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "unknown-agent";
  const acceptLanguage = request.headers.get("accept-language") ?? "unknown-lang";
  const salt = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "edenverse-local-salt";

  return createHash("sha256")
    .update(`${getClientIp(request)}:${userAgent}:${acceptLanguage}:${salt}`)
    .digest("hex");
}

function isTrackablePath(path: unknown) {
  if (typeof path !== "string") {
    return true;
  }

  return !path.startsWith("/api") && !path.startsWith("/admin") && !path.startsWith("/eden-vault");
}

export async function GET() {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Bạn không có quyền xem analytics." }, { status: 403 });
  }

  const metrics = await getDashboardMetrics();
  return NextResponse.json({ metrics });
}

export async function POST(request: Request) {
  const fingerprint = getVisitorFingerprint(request);
  const limited = applyRateLimit(`analytics:${fingerprint}`, {
    max: 80,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const body = await request.json().catch(() => ({}));

  if (!isTrackablePath((body as { path?: unknown }).path)) {
    return NextResponse.json({ ok: true });
  }

  await recordPageView(fingerprint);

  return NextResponse.json({ ok: true });
}
