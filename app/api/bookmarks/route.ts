import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";
import { awardReputationOnce, reputationRewards } from "@/services/member-progression-service";

const bookmarkSchema = z.object({
  slug: z.string().trim().min(1).max(180)
});

function revalidateBookmarkViews(slug: string, username?: string) {
  revalidatePath("/");
  revalidatePath(`/games/${slug}`);
  revalidatePath("/games/hot");
  revalidatePath("/games/new");
  revalidatePath("/games/quality");
  revalidatePath("/profile");

  if (username) {
    revalidatePath(`/profile/${username}`);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "Bạn cần đăng nhập để lưu game." }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ message: "Database chưa sẵn sàng nên chưa thể lưu game." }, { status: 503 });
  }

  const limited = applyRateLimit(`bookmark:${userId}`, {
    max: 50,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn bấm lưu quá nhanh, thử lại sau một chút." }, { status: 429 });
  }

  const parsed = bookmarkSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json({ message: "Game cần lưu chưa hợp lệ." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const game = await tx.game.findUnique({
        where: { slug: parsed.data.slug },
        select: { id: true }
      });

      if (!game) {
        return null;
      }

      const existing = await tx.bookmark.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId: game.id
          }
        }
      });

      if (existing) {
        await tx.bookmark.delete({
          where: {
            userId_gameId: {
              userId,
              gameId: game.id
            }
          }
        });

        await tx.game.updateMany({
          where: {
            id: game.id,
            bookmarksCount: { gt: 0 }
          },
          data: {
            bookmarksCount: { decrement: 1 }
          }
        });

        const updatedGame = await tx.game.findUniqueOrThrow({
          where: { id: game.id },
          select: { bookmarksCount: true }
        });

        return {
          saved: false,
          bookmarks: updatedGame.bookmarksCount,
          gameId: game.id
        };
      }

      await tx.bookmark.create({
        data: {
          userId,
          gameId: game.id
        }
      });

      const updatedGame = await tx.game.update({
        where: { id: game.id },
        data: {
          bookmarksCount: { increment: 1 },
          popularityScore: { increment: 2 }
        },
        select: {
          bookmarksCount: true
        }
      });

      return {
        saved: true,
        bookmarks: updatedGame.bookmarksCount,
        gameId: game.id
      };
    });

    if (!result) {
      return NextResponse.json({ message: "Không tìm thấy game để lưu." }, { status: 404 });
    }

    revalidateBookmarkViews(parsed.data.slug, session.user.username);
    const progression = result.saved
      ? await awardReputationOnce({
          userId,
          action: "bookmark_game",
          targetType: "game",
          targetId: result.gameId,
          points: reputationRewards.bookmark_game
        })
      : null;

    return NextResponse.json({
      message:
        result.saved && progression
          ? `Đã lưu game vào hồ sơ. +${reputationRewards.bookmark_game} danh tiếng.`
          : result.saved
            ? "Đã lưu game vào hồ sơ."
            : "Đã bỏ lưu game.",
      saved: result.saved,
      bookmarks: result.bookmarks,
      progression
    });
  } catch {
    return NextResponse.json({ message: "Không thể cập nhật lượt lưu lúc này." }, { status: 500 });
  }
}
