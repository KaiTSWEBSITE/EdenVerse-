import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { applyRateLimit } from "@/middleware/rate-limit";
import { getGameBySlug } from "@/services/game-service";
import { recordDownloadClick } from "@/services/download-service";
import { awardReputationOnce, reputationRewards } from "@/services/member-progression-service";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const mirror =
    body?.mirror === "season2"
      ? "season2"
      : body?.mirror === "joyplay"
        ? "joyplay"
        : body?.mirror === "backup"
          ? "backup"
          : "primary";
  const game = await getGameBySlug(slug);

  if (!game) {
    return NextResponse.json({ message: "Không tìm thấy game." }, { status: 404 });
  }

  const limited = applyRateLimit(`download:${request.headers.get("x-forwarded-for") ?? "local"}:${slug}`, {
    max: 12,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn bấm tải quá nhanh, thử lại sau một chút." }, { status: 429 });
  }

  const stats = await recordDownloadClick(slug, mirror);
  const session = await auth();
  const progression = session?.user?.id
    ? await awardReputationOnce({
        userId: session.user.id,
        action: "download_game",
        targetType: "game",
        targetId: game.id,
        points: reputationRewards.download_game
      })
    : null;

  return NextResponse.json({
    message: progression
      ? `Đã ghi nhận lượt click tải. +${reputationRewards.download_game} danh tiếng.`
      : "Đã ghi nhận lượt click tải.",
    slug,
    title: game.title,
    progression,
    ...stats
  });
}
