import { EditorialStrip } from "@/components/home/editorial-strip";
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
import { getLatestPosts } from "@/services/post-service";

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
    recommended,
    latestPosts
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
    getRecommendedGames(),
    getLatestPosts(4)
  ]);

  return (
    <>
      <HeroSection heroGame={heroGame} trending={trendingGames.slice(0, 4)} />
      <GameSection
        eyebrow="Trending"
        title="Curated titles everyone is chasing tonight"
        description="Momentum-driven rankings combining popularity, reputation-weighted reviews, bookmark velocity, and recent update energy."
        games={trendingGames}
      />
      <GameSection
        eyebrow="Newly Updated"
        title="Fresh patches, route expansions, and version drops"
        description="Track release cadence, adult scene additions, route reworks, and QoL improvements without digging through forum threads."
        games={newlyUpdated}
      />
      <GameSection
        eyebrow="Top Rated"
        title="Community champions with premium execution"
        description="High reputation reviews, consistent route polish, and standout atmosphere put these at the top of the archive."
        games={topRated}
      />
      <GameSection
        eyebrow="Popular Visual Novel"
        title="Elegant visual novels with serious narrative confidence"
        description="A hand-curated shelf of premium VN releases, reactive romance writing, and gothic anime mood."
        games={visualNovels}
      />
      <GameSection
        eyebrow="Sandbox Games"
        title="Route freedom, district exploration, and living systems"
        description="Open-ended progression for players who want schedules, roaming maps, layered relationships, and meaningful agency."
        games={sandboxGames}
      />
      <GameSection
        eyebrow="RPG"
        title="Story-rich RPG worlds with lush emotional stakes"
        description="From dark pilgrimage survival to decadent throne simulators, these RPGs blend progression with heavy narrative payoff."
        games={rpgGames}
      />
      <GameSection
        eyebrow="Choice Matter"
        title="Consequences that shape endings, factions, and intimacy"
        description="These are the games where dialogue, route loyalty, and moral decisions echo across the whole narrative architecture."
        games={choiceMatter}
      />
      <GameSection
        eyebrow="Hidden Gems"
        title="Smaller names with elite atmosphere and writing"
        description="Underrated releases that overdeliver on mood, cast chemistry, and premium visual identity."
        games={hiddenGems}
      />
      <EditorialStrip posts={latestPosts} />
      <GameSection
        eyebrow="Recommended For You"
        title="A late-night shelf tuned for premium dark fantasy taste"
        description="Handpicked from the archive to mirror the users who love story richness, route density, and cinematic presentation."
        games={recommended}
      />
    </>
  );
}
