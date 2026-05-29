import { NextResponse } from "next/server";
import { getGameBySlug } from "@/services/game-service";
import { recordDownloadClick } from "@/services/download-service";
import { applyRateLimit } from "@/middleware/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const mirror = body?.mirror === "backup" ? "backup" : "primary";
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

  return NextResponse.json({
    message: "Đã ghi nhận lượt click tải.",
    slug,
    title: game.title,
    ...stats
  });
}
