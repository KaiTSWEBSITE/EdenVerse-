import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommentThread } from "@/components/community/comment-thread";
import { ReviewList } from "@/components/community/review-list";
import { GameGallery } from "@/components/game/game-gallery";
import { GameHero } from "@/components/game/game-hero";
import { GameOverview } from "@/components/game/game-overview";
import { GameSection } from "@/components/home/game-section";
import { getCommentsForGame, getReviewsForGame } from "@/services/community-service";
import { getGameBySlug, getSimilarGames, getRecommendedGames } from "@/services/game-service";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) {
    return {};
  }

  return {
    title: game.title,
    description: game.shortDescription,
    openGraph: {
      title: game.title,
      description: game.shortDescription,
      images: [{ url: game.bannerImage }]
    }
  };
}

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const [comments, reviews, similarGames, recommended] = await Promise.all([
    getCommentsForGame(game.slug),
    getReviewsForGame(game.slug),
    getSimilarGames(game.slug),
    getRecommendedGames()
  ]);

  return (
    <div className="pb-16">
      <GameHero game={game} />
      <GameOverview game={game} />
      <GameGallery gallery={game.gallery} trailerUrl={game.trailerUrl} />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 xl:grid-cols-2 lg:px-8">
        <ReviewList reviews={reviews} />
        <CommentThread comments={comments} />
      </section>
      <GameSection
        eyebrow="Similar Games"
        title="If this mood landed, start here next"
        description="Recommendations weighted by engine, genre overlap, route tone, and curation alignment."
        games={similarGames}
      />
      <GameSection
        eyebrow="Recommended"
        title="More premium picks from the archive"
        description="A second shelf of handpicked titles with high atmosphere and strong narrative craftsmanship."
        games={recommended.slice(0, 8)}
      />
    </div>
  );
}
