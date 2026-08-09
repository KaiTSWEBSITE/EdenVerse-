import Image from "next/image";
import { Download, Star, Tag } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import type { Game } from "@/types";
import { getCoverCropStyle } from "@/lib/cover-crop";
import { formatCompactNumber, formatDate, formatRating } from "@/lib/utils";
import { getTrackedDownloadCount } from "@/services/download-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadButton } from "@/components/game/download-button";
import { GameBookmarkStatCard } from "@/components/game/game-bookmark-stat-card";
import { GameStarRating } from "@/components/game/game-star-rating";
import { SaveGameButton } from "@/components/game/save-game-button";

async function getInitialSavedState(slug: string) {
  const session = await auth();

  if (!session?.user?.id || !prisma) {
    return false;
  }

  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        game: { slug }
      },
      select: { gameId: true }
    });

    return Boolean(bookmark);
  } catch {
    return false;
  }
}

export async function GameHero({ game }: { game: Game }) {
  const trackedDownloads = getTrackedDownloadCount(game);
  const coverCropStyle = getCoverCropStyle(game);
  const initialSaved = await getInitialSavedState(game.slug);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[0.62fr_1.38fr]">

        {/* Cover card */}
        <Card className="group self-start overflow-hidden transition duration-300 hover:border-primary/20 hover:shadow-card-hover">
          <div className="relative aspect-[4/5] bg-[#050912]">
            <Image
              src={game.coverImage}
              alt=""
              fill
              aria-hidden
              className="scale-110 object-cover opacity-30 blur-2xl"
              sizes="(max-width: 1280px) 100vw, 30vw"
              priority
            />
            <Image
              src={game.coverImage}
              alt={game.title}
              fill
              style={coverCropStyle}
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 1280px) 100vw, 30vw"
              priority
            />
            {/* Cinematic overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition duration-400 group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/8" />
          </div>
        </Card>

        {/* Detail card */}
        <Card>
          <CardContent className="space-y-8 p-8">
            {/* Genre badges */}
            <div className="flex flex-wrap gap-2">
              {game.genres.map((genre) => (
                <Badge
                  key={genre}
                  className="transition duration-200 hover:border-primary/35 hover:shadow-glow-sm"
                >
                  {genre}
                </Badge>
              ))}
              {game.mature ? (
                <Badge className="border-accent/30 bg-accent/10 text-accent transition hover:border-accent/48">
                  18+ Mature
                </Badge>
              ) : null}
            </div>

            {/* Title & tagline */}
            <div className="space-y-3">
              <h1 className="break-words py-2 font-display text-5xl leading-[1.24] sm:text-6xl sm:leading-[1.2]">
                <span className="text-gradient-title">{game.title}</span>
              </h1>
              <p className="whitespace-pre-line break-words text-sm uppercase leading-7 tracking-[0.22em] text-primary">
                {game.tagline}
              </p>
              <p className="max-w-4xl whitespace-pre-line text-base leading-8 text-muted-foreground">
                {game.description}
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 md:grid-cols-4">
              {/* Rating */}
              <Card className="bg-black/18 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/28 hover:shadow-glow-sm group/stat">
                <CardContent className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Star className="h-4 w-4 text-accent transition duration-300 group-hover/stat:drop-shadow-[0_0_6px_rgba(209,160,88,0.6)]" />
                    Đánh giá
                  </span>
                  <p className="font-display text-4xl text-foreground">{formatRating(game.rating)}</p>
                  <p className="text-sm text-muted-foreground">{formatCompactNumber(game.reviewCount)} lượt đánh giá</p>
                </CardContent>
              </Card>

              {/* Bookmark (dynamic) */}
              <GameBookmarkStatCard slug={game.slug} initialBookmarks={game.bookmarks} />

              {/* Downloads */}
              <Card className="bg-black/18 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/28 hover:shadow-glow-sm group/stat">
                <CardContent className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Download className="h-4 w-4 text-primary transition duration-300 group-hover/stat:drop-shadow-[0_0_6px_rgba(87,188,255,0.6)]" />
                    Lượt tải
                  </span>
                  <p className="font-display text-4xl text-foreground">{formatCompactNumber(trackedDownloads)}</p>
                  <p className="text-sm text-muted-foreground">lượt click tải</p>
                </CardContent>
              </Card>

              {/* Updated date */}
              <Card className="bg-black/18 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/28 hover:shadow-glow-sm group/stat">
                <CardContent className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Tag className="h-4 w-4 text-accent transition duration-300 group-hover/stat:drop-shadow-[0_0_6px_rgba(209,160,88,0.6)]" />
                    Cập nhật
                  </span>
                  <p className="font-display text-2xl leading-tight text-foreground">{formatDate(game.updatedAt)}</p>
                  <p className="break-words text-sm leading-5 text-muted-foreground">{game.version}</p>
                </CardContent>
              </Card>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <DownloadButton
                slug={game.slug}
                initialDownloads={trackedDownloads}
                hasBackup={Boolean(game.downloadUrlAlt)}
                hasJoyplay={Boolean(game.downloadUrlJoyplay)}
                hasSeason2={Boolean(game.downloadUrlSeason2)}
              />
              <SaveGameButton slug={game.slug} initialSaved={initialSaved} initialBookmarks={game.bookmarks} />
            </div>

            <GameStarRating
              slug={game.slug}
              initialRating={game.rating}
              initialReviewCount={game.reviewCount}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
