import { GameListing } from "@/components/game/game-listing";
import { getNewlyReleasedGames } from "@/services/game-service";

export default async function NewGamesPage() {
  const games = await getNewlyReleasedGames(24);

  return (
    <GameListing
      eyebrow="Mới ra mắt"
      title="Các trò chơi mới ra mắt"
      description="Danh sách sắp xếp theo ngày phát hành mới nhất để người chơi thấy game mới trước."
      games={games}
    />
  );
}
