import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { applyRateLimit } from "@/middleware/rate-limit";
import { subtractMemberReputation } from "@/services/game-report-service";

const penaltySchema = z.object({
  identifier: z.string().trim().min(2).max(160),
  points: z.coerce.number().int().min(1).max(1000),
  reason: z.string().trim().min(3).max(400)
});

function canPenalize(role: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!canPenalize(role)) {
    return NextResponse.json({ message: "Bạn không có quyền trừ danh tiếng thành viên." }, { status: 403 });
  }

  const limited = applyRateLimit(`admin-reputation:${session?.user?.id ?? "local"}`, {
    max: 20,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn thao tác quá nhanh, thử lại sau." }, { status: 429 });
  }

  const parsed = penaltySchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json({ message: "Thông tin trừ điểm chưa hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = await subtractMemberReputation(parsed.data);

  if (!result) {
    return NextResponse.json({ message: "Không tìm thấy thành viên theo username hoặc email này." }, { status: 404 });
  }

  return NextResponse.json({
    message: `Đã trừ ${parsed.data.points} danh tiếng của @${result.user.username}.`,
    ...result
  });
}
