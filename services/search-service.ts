import { demoGames } from "@/database/demo-data";
import type { SearchFilters } from "@/types";
import { getAllGames } from "@/services/game-service";

export async function getSearchSuggestions(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  return demoGames
    .map((game) => {
      const titleHit = game.title.toLowerCase().includes(q) ? 5 : 0;
      const tagHit = game.tags.some((tag) => tag.toLowerCase().includes(q)) ? 3 : 0;
      const developerHit = game.developer.toLowerCase().includes(q) ? 2 : 0;
      return { game, score: titleHit + tagHit + developerHit };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ game }) => ({
      slug: game.slug,
      title: game.title,
      subtitle: `${game.developer} • ${game.engine}`,
      mature: game.mature
    }));
}

export async function searchEverything(filters: SearchFilters) {
  const games = await getAllGames(filters);
  return { games, posts: [] };
}
