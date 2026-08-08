import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { applyRateLimit } from "@/middleware/rate-limit";
import { getAdminGameReports, moderateGameReport } from "@/services/game-report-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const reportActionSchema = z.object({
  adminNote: z.string().trim().max(600).optional(),
  penaltyPoints: z.coerce.number().int().min(0).max(500).optional(),
  reportId: z.string().trim().min(1),
  status: z.enum(["OPEN", "RESOLVED", "REJECTED"])
});

function canModerate(role: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN" || role === "MODERATOR";
}

function clientKey(request: Request) {
  return `admin-reports:${request.headers.get("x-forwarded-for") ?? "local"}`;
}

export async function GET() {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!canModerate(role)) {
    return NextResponse.json({ message: "Bạn không có quyền xem báo cáo lỗi." }, { status: 403 });
  }

  const reports = await getAdminGameReports(50);
  const response = NextResponse.json({ reports });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function PATCH(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!canModerate(role)) {
    return NextResponse.json({ message: "Bạn không có quyền xử lý báo cáo lỗi." }, { status: 403 });
  }

  const limited = applyRateLimit(clientKey(request), {
    max: 30,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Thao tác quá nhanh, thử lại sau một chút." }, { status: 429 });
  }

  const parsed = reportActionSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json({ message: "Dữ liệu xử lý báo cáo chưa hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = await moderateGameReport(parsed.data);

  if (!result.report) {
    return NextResponse.json({ message: "Không tìm thấy báo cáo lỗi cần xử lý." }, { status: 404 });
  }

  return NextResponse.json({
    message:
      parsed.data.penaltyPoints && result.progression
        ? `Đã xử lý báo cáo và trừ ${parsed.data.penaltyPoints} danh tiếng của người gửi.`
        : "Đã cập nhật trạng thái báo cáo.",
    ...result
  });
}
