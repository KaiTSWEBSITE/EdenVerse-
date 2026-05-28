import { demoGames } from "@/database/demo-data";
import { prisma } from "@/database/prisma";
import type { Game, SearchFilters } from "@/types";

function sortGames(games: Game[], sort: SearchFilters["sort"]) {
  switch (sort) {
    case "rating":
      return [...games].sort((a, b) => b.rating - a.rating);
    case "updated":
      return [...games].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    case "popular":
      return [...games].sort((a, b) => b.bookmarks - a.bookmarks);
    case "trending":
    default:
      return [...games].sort((a, b) => b.popularityScore - a.popularityScore);
  }
}

function filterGames(games: Game[], filters: SearchFilters = {}) {
  const q = filters.q?.toLowerCase();

  return sortGames(
    games.filter((game) => {
      const matchesQuery =
        !q ||
        [game.title, game.developer, game.engine, game.tags.join(" "), game.genres.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesGenre = !filters.genre || game.genres.includes(filters.genre);
      const matchesEngine = !filters.engine || game.engine === filters.engine;
      const matchesTag = !filters.tag || game.tags.includes(filters.tag);
      const matchesMature =
        !filters.mature ||
        filters.mature === "all" ||
        (filters.mature === "adult" ? game.mature : !game.mature);

      return matchesQuery && matchesGenre && matchesEngine && matchesTag && matchesMature;
    }),
    filters.sort
  );
}

export async function getAllGames(filters: SearchFilters = {}) {
  if (!prisma || process.env.ENABLE_PRISMA_DEMO_FALLBACK !== "false") {
    return filterGames(demoGames, filters);
  }

  try {
    const games = await prisma.game.findMany({
      orderBy: { popularityScore: "desc" }
    });

    if (!games.length) {
      return filterGames(demoGames, filters);
    }
  } catch {
    return filterGames(demoGames, filters);
  }

  return filterGames(demoGames, filters);
}

export async function getFeaturedGames() {
  return (await getAllGames()).filter((game) => game.featured).slice(0, 8);
}

export async function getHeroGame() {
  return (await getAllGames()).find((game) => game.hero) ?? demoGames[0];
}

export async function getTrendingGames() {
  return (await getAllGames({ sort: "trending" })).slice(0, 8);
}

export async function getNewlyUpdatedGames() {
  return (await getAllGames({ sort: "updated" })).slice(0, 8);
}

export async function getTopRatedGames() {
  return (await getAllGames({ sort: "rating" })).slice(0, 8);
}

export async function getGamesByGenre(genre: string, limit = 8) {
  return (await getAllGames({ genre, sort: "popular" })).slice(0, limit);
}

export async function getHiddenGems() {
  return demoGames
    .filter((game) => game.reviewCount < 700 && game.rating >= 8.4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);
}

export async function getRecommendedGames() {
  return demoGames
    .filter((game) => game.rating >= 8.8)
    .sort((a, b) => b.rating * b.popularityScore - a.rating * a.popularityScore)
    .slice(0, 8);
}

export async function getGameBySlug(slug: string) {
  return demoGames.find((game) => game.slug === slug) ?? null;
}

export async function getSimilarGames(slug: string) {
  const current = await getGameBySlug(slug);
  if (!current) {
    return [];
  }

  return demoGames
    .filter((game) => game.slug !== slug)
    .map((game) => ({
      game,
      score:
        game.genres.filter((genre) => current.genres.includes(genre)).length * 3 +
        game.tags.filter((tag) => current.tags.includes(tag)).length * 2 +
        (game.engine === current.engine ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ game }) => game);
}
