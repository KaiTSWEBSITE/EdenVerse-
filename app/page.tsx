import { GameSection } from "@/components/home/game-section";
import { HeroSection } from "@/components/home/hero-section";
import {
  getHeroGame,
  getHotGames,
  getNewlyReleasedGames,
  getQualityGames
} from "@/services/game-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [heroGame, hotGames, newGames, qualityGames] = await Promise.all([
    getHeroGame(),
    getHotGames(8),
    getNewlyReleasedGames(8),
    getQualityGames(8)
  ]);

  return (
    <>
      <HeroSection heroGame={heroGame} trending={hotGames.slice(0, 4)} />
      <GameSection
        eyebrow="Game Hot"
        title="Game được tải nhiều nhất"
        description="Bảng này tự tăng hạng theo số lần người dùng bấm vào link tải game."
        games={hotGames}
      />
      <GameSection
        eyebrow="Mới ra mắt"
        title="Các trò chơi mới ra mắt"
        description="Ưu tiên theo ngày phát hành mới nhất để người chơi thấy game mới trước."
        games={newGames}
      />
      <GameSection
        eyebrow="Chất lượng tốt"
        title="Game có đánh giá và phản hồi ổn định"
        description="Lọc theo rating cao, số review đủ tốt và độ hoàn thiện tổng thể của game."
        games={qualityGames}
      />
    </>
  );
}
