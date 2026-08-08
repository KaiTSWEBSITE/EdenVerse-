import { GameListing } from "@/components/game/game-listing";
import { getQualityGames } from "@/services/game-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QualityGamesPage() {
  const games = await getQualityGames(24);

  return (
    <GameListing
      eyebrow="Chất lượng tốt"
      title="Game có chất lượng tốt"
      description="Ưu tiên rating cao, lượt đánh giá ổn định và độ hoàn thiện tổng thể để tránh game chỉ nổi nhờ hype."
      games={games}
    />
  );
}
