import { GameSection } from "@/components/home/game-section";
import { HeroSection } from "@/components/home/hero-section";
import { QuickDiscovery } from "@/components/home/quick-discovery";
import { CategorySection } from "@/components/home/category-section";
import { cookies } from "next/headers";
import {
  getHeroGame,
  getHotGames,
  getNewlyReleasedGames,
  getQualityGames
} from "@/services/game-service";
import { getHeroIntro } from "@/services/site-settings-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function decodeHeroIntroCookie(value?: string) {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(value).trim();
  } catch {
    return "";
  }
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const cookieHeroIntro = decodeHeroIntroCookie(cookieStore.get("edenverse_hero_intro")?.value);
  const [heroGame, savedHeroIntro, hotGames, newGames, qualityGames] = await Promise.all([
    getHeroGame(),
    getHeroIntro(),
    getHotGames(8),
    getNewlyReleasedGames(8),
    getQualityGames(8)
  ]);

  return (
    <>
      <HeroSection heroGame={heroGame} />
      <QuickDiscovery />
      <GameSection
        eyebrow="Thịnh hành"
        title="Game được tải nhiều nhất"
        description="Bảng này tự tăng hạng theo số lần người dùng bấm vào link tải game."
        games={hotGames}
      />
      <CategorySection />
      <GameSection
        eyebrow="Mới ra mắt"
        title="Các trò chơi mới ra mắt"
        description="Ưu tiên theo ngày phát hành mới nhất để người chơi thấy game mới trước."
        games={newGames}
      />
      <GameSection
        eyebrow="EdenVerse Picks"
        title="Lựa chọn từ EdenVerse"
        description="Những tựa game chất lượng cao, hình ảnh đẹp và cốt truyện có chiều sâu do chúng tôi tuyển chọn."
        games={qualityGames}
      />
    </>
  );
}
