import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";
import { getAllUsers } from "@/services/user-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const updateUserSchema = z.object({
  id: z.string().trim().min(1),
  role: z.enum(["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]),
  vipTier: z.coerce.number().int().min(0).max(3)
});

function canManageUsers(role: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function clientKey(request: Request) {
  return `admin-users:${request.headers.get("x-forwarded-for") ?? "local"}`;
}

export async function GET() {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!canManageUsers(role)) {
    return NextResponse.json({ message: "Bạn không có quyền xem danh sách thành viên." }, { status: 403 });
  }

  const users = await getAllUsers();
  
  const response = NextResponse.json({ users });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function PATCH(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!canManageUsers(role)) {
    return NextResponse.json({ message: "Bạn không có quyền chỉnh sửa thành viên." }, { status: 403 });
  }

  const limited = applyRateLimit(`${clientKey(request)}:update`, {
    max: 20,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Thao tác quá nhanh, thử lại sau một chút." }, { status: 429 });
  }

  const parsed = updateUserSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json({ message: "Dữ liệu cập nhật chưa hợp lệ." }, { status: 400 });
  }

  if (!prisma) {
    return NextResponse.json({ message: "Chưa kết nối CSDL PostgreSQL." }, { status: 503 });
  }

  // Prevent modifying Super Admin if you are not Super Admin yourself (Optional security)
  if (role !== "SUPER_ADMIN" && parsed.data.role === "SUPER_ADMIN") {
    return NextResponse.json({ message: "Bạn không thể cấp quyền Super Admin." }, { status: 403 });
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: parsed.data.id } });
    if (!targetUser) {
      return NextResponse.json({ message: "Không tìm thấy người dùng này." }, { status: 404 });
    }

    if (targetUser.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Không thể chỉnh sửa tài khoản Super Admin." }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: parsed.data.id },
      data: {
        role: parsed.data.role,
        vipTier: parsed.data.vipTier
      }
    });

    return NextResponse.json({ message: `Đã cập nhật thành công tài khoản @${targetUser.username}.` });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống khi cập nhật dữ liệu." }, { status: 500 });
  }
}
