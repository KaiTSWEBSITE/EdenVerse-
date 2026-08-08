import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";
import { awardReputationOnce, reputationRewards } from "@/services/member-progression-service";

export const runtime = "nodejs";

const ratingSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5)
});

function getClientIdentity(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "local";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const salt = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "edenverse-rating";

  return createHash("sha256").update(`${ip}:${userAgent}:${salt}`).digest("hex").slice(0, 48);
}

function revalidateRatingShelves(slug: string) {
  revalidatePath("/");
  revalidatePath("/games/quality");
  revalidatePath("/search");
  revalidatePath(`/games/${slug}`);
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const clientIdentity = getClientIdentity(request);
  const userId = session?.user?.id || null;
  const fingerprint = userId ? `user:${userId}` : `anon:${clientIdentity}`;

  const limited = applyRateLimit(`game-rating:${fingerprint}`, {
    max: 12,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn chấm sao hơi nhanh, thử lại sau một chút nhé." }, { status: 429 });
  }

  const parsed = ratingSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Điểm sao chưa hợp lệ. Hãy chọn từ 1 đến 5 sao.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!prisma) {
    return NextResponse.json({ message: "Database chưa sẵn sàng nên chưa thể lưu đánh giá." }, { status: 503 });
  }

  const game = await prisma.game.findUnique({
    where: { slug },
    select: { id: true, title: true }
  });

  if (!game) {
    return NextResponse.json({ message: "Không tìm thấy game để đánh giá." }, { status: 404 });
  }

  await prisma.gameRating.upsert({
    where: {
      gameId_fingerprint: {
        gameId: game.id,
        fingerprint
      }
    },
    create: {
      gameId: game.id,
      userId,
      fingerprint,
      rating: parsed.data.rating
    },
    update: {
      userId,
      rating: parsed.data.rating
    }
  });

  const aggregate = await prisma.gameRating.aggregate({
    where: { gameId: game.id },
    _avg: { rating: true },
    _count: { _all: true }
  });
  const averageStars = aggregate._avg.rating ?? parsed.data.rating;
  const ratingScore = Number((averageStars * 2).toFixed(2));
  const reviewCount = aggregate._count._all;

  const updatedGame = await prisma.game.update({
    where: { id: game.id },
    data: {
      rating: ratingScore,
      reviewCount,
      popularityScore: { increment: 2 }
    },
    select: {
      rating: true,
      reviewCount: true
    }
  });

  revalidateRatingShelves(slug);
  const progression = userId
    ? await awardReputationOnce({
        userId,
        action: "rate_game",
        targetType: "game",
        targetId: game.id,
        points: reputationRewards.rate_game
      })
    : null;

  return NextResponse.json({
    message: progression
      ? `Đã ghi nhận ${parsed.data.rating}/5 sao cho ${game.title}. +${reputationRewards.rate_game} danh tiếng.`
      : `Đã ghi nhận ${parsed.data.rating}/5 sao cho ${game.title}.`,
    rating: updatedGame.rating,
    reviewCount: updatedGame.reviewCount,
    stars: averageStars,
    userRating: parsed.data.rating,
    progression
  });
}
