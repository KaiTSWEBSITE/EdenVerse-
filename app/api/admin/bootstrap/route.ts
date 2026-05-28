import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";

export const runtime = "nodejs";

const bootstrapSchema = z.object({
  setupToken: z.string().trim().min(24).optional(),
  email: z.string().email(),
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().trim().min(2).max(80).default("EdenVerse Owner"),
  password: z
    .string()
    .min(14)
    .max(128)
    .regex(/[a-z]/, "Mật khẩu cần có chữ thường.")
    .regex(/[A-Z]/, "Mật khẩu cần có chữ hoa.")
    .regex(/[0-9]/, "Mật khẩu cần có số.")
    .regex(/[^a-zA-Z0-9]/, "Mật khẩu cần có ký tự đặc biệt.")
});

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `admin-bootstrap:${forwardedFor || request.headers.get("x-real-ip") || "local"}`;
}

function safeTokenMatch(providedToken: string, expectedToken: string) {
  const provided = Buffer.from(providedToken);
  const expected = Buffer.from(expectedToken);

  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function POST(request: Request) {
  const setupToken = process.env.ADMIN_SETUP_TOKEN?.trim();

  if (!setupToken) {
    return NextResponse.json({ message: "Bootstrap admin đang tắt trên production." }, { status: 404 });
  }

  const limited = applyRateLimit(getClientKey(request), {
    max: 3,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn thử setup quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const parsed = bootstrapSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Dữ liệu setup admin chưa hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const providedToken = request.headers.get("x-admin-setup-token")?.trim() || parsed.data.setupToken || "";
  if (!safeTokenMatch(providedToken, setupToken)) {
    return NextResponse.json({ message: "Setup token không hợp lệ." }, { status: 403 });
  }

  if (!prisma) {
    return NextResponse.json({ message: "DATABASE_URL chưa hoạt động." }, { status: 503 });
  }

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    select: { id: true }
  });

  if (existingSuperAdmin && process.env.ADMIN_SETUP_ALLOW_RESET !== "true") {
    return NextResponse.json({ message: "Super Admin đã tồn tại. Bootstrap đã bị khóa." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: {
      username: parsed.data.username,
      name: parsed.data.name,
      passwordHash,
      role: "SUPER_ADMIN",
      level: 99,
      reputation: 9999,
      allowMatureContent: true
    },
    create: {
      email: parsed.data.email,
      username: parsed.data.username,
      name: parsed.data.name,
      passwordHash,
      role: "SUPER_ADMIN",
      level: 99,
      reputation: 9999,
      allowMatureContent: true
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true
    }
  });

  return NextResponse.json({
    message: "Đã tạo Super Admin production. Hãy gỡ ADMIN_SETUP_TOKEN sau khi setup xong.",
    user
  });
}
