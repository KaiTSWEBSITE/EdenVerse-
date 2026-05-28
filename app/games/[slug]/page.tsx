import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommentThread } from "@/components/community/comment-thread";
import { ReviewList } from "@/components/community/review-list";
import { GameGallery } from "@/components/game/game-gallery";
import { GameHero } from "@/components/game/game-hero";
import { GameOverview } from "@/components/game/game-overview";
import { GameReportForm } from "@/components/game/game-report-form";
import { GameSection } from "@/components/home/game-section";
import { getCommentsForGame, getReviewsForGame } from "@/services/community-service";
import { getGameBySlug, getQualityGames } from "@/services/game-service";

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

  const [comments, reviews, qualityGames] = await Promise.all([
    getCommentsForGame(game.slug),
    getReviewsForGame(game.slug),
    getQualityGames(8)
  ]);

  return (
    <div className="pb-16">
      <GameHero game={game} />
      <GameOverview game={game} />
      <GameGallery gallery={game.gallery} />
      <GameReportForm gameSlug={game.slug} gameTitle={game.title} />
      {reviews.length || comments.length ? (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 xl:grid-cols-2 lg:px-8">
          {reviews.length ? <ReviewList reviews={reviews} /> : null}
          {comments.length ? <CommentThread comments={comments} /> : null}
        </section>
      ) : null}
      <GameSection
        eyebrow="Chất lượng tốt"
        title="Một vài game tốt khác"
        description="Gợi ý nhanh từ nhóm game có rating cao và phản hồi ổn định."
        games={qualityGames.filter((entry) => entry.slug !== game.slug).slice(0, 8)}
      />
    </div>
  );
}
