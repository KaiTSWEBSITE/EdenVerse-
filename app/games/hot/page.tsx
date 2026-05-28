import { GameListing } from "@/components/game/game-listing";
import { getHotGames } from "@/services/game-service";

export const dynamic = "force-dynamic";

export default async function HotGamesPage() {
  const games = await getHotGames(24);

  return (
    <GameListing
      eyebrow="Game Hot"
      title="Game được tải nhiều nhất"
      description="Tự thống kê theo số lần người dùng bấm nút tải. Game nào được tải nhiều hơn sẽ lên cao hơn."
      games={games}
    />
  );
}
