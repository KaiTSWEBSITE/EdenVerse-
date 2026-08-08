import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { applyRateLimit } from "@/middleware/rate-limit";
import { createGameReport } from "@/services/game-report-service";
import { getGameBySlug } from "@/services/game-service";
import { awardReputationOnce, reputationRewards } from "@/services/member-progression-service";

const gameReportSchema = z.object({
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
  description: z.string().trim().min(10).max(2000),
  issueType: z.enum(["download", "crash", "wrong_version", "missing_file", "bad_link", "other"]),
  title: z.string().trim().min(3).max(120)
});

function getClientKey(request: Request, slug: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `game-report:${slug}:${forwardedFor || request.headers.get("x-real-ip") || "local"}`;
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const game = await getGameBySlug(slug);

  if (!game) {
    return NextResponse.json({ message: "Không tìm thấy game cần báo lỗi." }, { status: 404 });
  }

  const limited = applyRateLimit(getClientKey(request, slug), {
    max: 5,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn gửi báo lỗi quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const json = await request.json();
  const parsed = gameReportSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Thông tin báo lỗi chưa hợp lệ.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const report = await createGameReport({
    ...parsed.data,
    contactEmail: parsed.data.contactEmail || session?.user?.email || undefined,
    gameSlug: slug,
    reporterId: session?.user?.id ?? null
  });
  const progression = session?.user?.id
    ? await awardReputationOnce({
        userId: session.user.id,
        action: "report_game",
        targetType: "game",
        targetId: game.id,
        points: reputationRewards.report_game
      })
    : null;

  return NextResponse.json(
    {
      message: progression
        ? `Đã nhận báo cáo lỗi game. +${reputationRewards.report_game} danh tiếng. Cảm ơn bạn đã giúp EdenVerse sạch hơn.`
        : "Đã nhận báo cáo lỗi game. Cảm ơn bạn đã giúp EdenVerse sạch và dễ dùng hơn.",
      reportId: report.id,
      progression
    },
    { status: 201 }
  );
}
