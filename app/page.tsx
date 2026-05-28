import { GameSection } from "@/components/home/game-section";
import { HeroSection } from "@/components/home/hero-section";
import {
  getGamesByGenre,
  getHeroGame,
  getHiddenGems,
  getNewlyUpdatedGames,
  getRecommendedGames,
  getTopRatedGames,
  getTrendingGames
} from "@/services/game-service";

export default async function HomePage() {
  const [
    heroGame,
    trendingGames,
    newlyUpdated,
    topRated,
    visualNovels,
    sandboxGames,
    rpgGames,
    choiceMatter,
    hiddenGems,
    recommended
  ] = await Promise.all([
    getHeroGame(),
    getTrendingGames(),
    getNewlyUpdatedGames(),
    getTopRatedGames(),
    getGamesByGenre("Visual Novel"),
    getGamesByGenre("Sandbox"),
    getGamesByGenre("RPG"),
    getGamesByGenre("Choice Matter"),
    getHiddenGems(),
    getRecommendedGames()
  ]);

  return (
    <>
      <HeroSection heroGame={heroGame} trending={trendingGames.slice(0, 4)} />
      <GameSection
        eyebrow="Đang hot"
        title="Những tựa game được chú ý nhiều nhất"
        description="Xếp hạng theo độ phổ biến, lượt lưu, đánh giá cộng đồng và nhịp cập nhật gần đây."
        games={trendingGames}
      />
      <GameSection
        eyebrow="Mới cập nhật"
        title="Bản vá, route mới và version vừa lên"
        description="Theo dõi các thay đổi quan trọng mà không phải tự lục từng thread hoặc changelog rời rạc."
        games={newlyUpdated}
      />
      <GameSection
        eyebrow="Đánh giá cao"
        title="Game có chất lượng ổn định và đáng chơi"
        description="Các tựa nổi bật nhờ route chắc tay, không khí tốt, UI đẹp và phản hồi tích cực từ cộng đồng."
        games={topRated}
      />
      <GameSection
        eyebrow="Visual Novel"
        title="Visual Novel có cốt truyện và mood tốt"
        description="Danh sách dành cho người thích romance route, lựa chọn có hậu quả và chất anime gothic."
        games={visualNovels}
      />
      <GameSection
        eyebrow="Sandbox"
        title="Tự do khám phá, lịch trình và nhiều route"
        description="Dành cho người thích gameplay mở, nhiều địa điểm, quan hệ nhân vật và hệ thống tiến triển dài hơi."
        games={sandboxGames}
      />
      <GameSection
        eyebrow="RPG"
        title="RPG giàu cốt truyện và cảm xúc"
        description="Tập trung vào xây dựng nhân vật, tiến trình rõ ràng và những lựa chọn có sức nặng."
        games={rpgGames}
      />
      <GameSection
        eyebrow="Choice Matter"
        title="Lựa chọn thật sự ảnh hưởng kết thúc"
        description="Các game nơi hội thoại, độ thân thiết, phe phái và quyết định đạo đức đều để lại hậu quả."
        games={choiceMatter}
      />
      <GameSection
        eyebrow="Hidden Gems"
        title="Những game ít ồn ào nhưng rất có chất"
        description="Các tựa chưa quá nổi nhưng có không khí, nhân vật và phong cách trình bày đáng nhớ."
        games={hiddenGems}
      />
      <GameSection
        eyebrow="Đề xuất"
        title="Gợi ý cho người thích dark fantasy và story-rich"
        description="Tuyển chọn dựa trên điểm đánh giá, route density, chất lượng trình bày và độ hợp mood."
        games={recommended}
      />
    </>
  );
}
