import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";

export const runtime = "nodejs";

const passwordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z
    .string()
    .min(14)
    .max(128)
    .regex(/[a-z]/, "Mật khẩu mới cần có chữ thường.")
    .regex(/[A-Z]/, "Mật khẩu mới cần có chữ hoa.")
    .regex(/[0-9]/, "Mật khẩu mới cần có số.")
    .regex(/[^a-zA-Z0-9]/, "Mật khẩu mới cần có ký tự đặc biệt.")
});

function getClientKey(request: Request, userId: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `admin-password:${userId}:${forwardedFor || request.headers.get("x-real-ip") || "local"}`;
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? "";
  const role = session?.user?.role ?? "USER";

  if (!["ADMIN", "SUPER_ADMIN"].includes(role) || !userId) {
    return NextResponse.json({ message: "Bạn chưa có quyền đổi mật khẩu quản trị." }, { status: 403 });
  }

  const limited = applyRateLimit(getClientKey(request, userId), {
    max: 5,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn đổi mật khẩu quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const parsed = passwordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Mật khẩu mới chưa đủ mạnh.", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!prisma) {
    return NextResponse.json({ message: "DATABASE_URL chưa hoạt động." }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true }
  });

  if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ message: "Mật khẩu hiện tại chưa đúng." }, { status: 401 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  return NextResponse.json({ message: "Đã đổi mật khẩu quản trị thành công." });
}
