import Image from "next/image";
import { Download, Star, Tag, Play } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import type { Game } from "@/types";
import { getCoverCropStyle } from "@/lib/cover-crop";
import { formatCompactNumber, formatDate, formatRating } from "@/lib/utils";
import { getTrackedDownloadCount } from "@/services/download-service";
import { Badge } from "@/components/ui/badge";
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
    <section className="relative w-full overflow-hidden bg-black mt-[-76px] min-h-[90vh] flex flex-col justify-end pb-12 pt-32">
      {/* Massive blurred background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={game.bannerImage || game.coverImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-40 blur-xl scale-110 saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-end">
          
          {/* Cover Image */}
          <div className="shrink-0 w-48 sm:w-64 md:w-72 lg:w-80 overflow-hidden rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 relative group">
            <div className={`relative ${game.coverAspectRatio || "aspect-[4/5]"} w-full`}>
              <Image
                src={game.coverImage}
                alt={game.title}
                fill
                sizes="(max-width: 768px) 100vw, 30vw"
                style={coverCropStyle}
                priority
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />
            </div>
          </div>

          {/* Game Info */}
          <div className="flex-1 space-y-6 pb-2">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {game.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre} className="bg-white/10 text-white hover:bg-white/20 border-transparent backdrop-blur-md">
                    {genre}
                  </Badge>
                ))}
                {game.mature && (
                  <Badge className="bg-accent/80 text-white hover:bg-accent/90 border-transparent backdrop-blur-md">
                    18+ Mature
                  </Badge>
                )}
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                {game.title}
              </h1>
              
              <p className="text-lg text-primary font-medium tracking-wide uppercase">
                {game.tagline}
              </p>
            </div>

            <p className="text-base text-white/70 line-clamp-3 max-w-3xl">
              {game.shortDescription}
            </p>

            {/* Micro Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/80 py-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-accent fill-accent" />
                <span className="font-bold text-white">{formatRating(game.rating)}</span>
                <span>({formatCompactNumber(game.reviewCount)})</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <span className="font-bold text-white">{formatCompactNumber(trackedDownloads)}</span> tải
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>Cập nhật: <span className="text-white">{formatDate(game.updatedAt)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{game.version}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <DownloadButton
                slug={game.slug}
                initialDownloads={trackedDownloads}
                hasBackup={Boolean(game.downloadUrlAlt)}
                hasJoyplay={Boolean(game.downloadUrlJoyplay)}
                hasSeason2={Boolean(game.downloadUrlSeason2)}
              />
              <SaveGameButton slug={game.slug} initialSaved={initialSaved} initialBookmarks={game.bookmarks} />
              
              <div className="ml-auto">
                <GameStarRating
                  slug={game.slug}
                  initialRating={game.rating}
                  initialReviewCount={game.reviewCount}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
