import type { Prisma } from "@prisma/client";
import { demoGames } from "@/database/demo-data";
import { prisma } from "@/database/prisma";
import { isDemoCatalogHidden } from "@/services/demo-catalog-service";
import { getTrackedDownloadCount } from "@/services/download-service";
import type { Game, SearchFilters } from "@/types";

const gameInclude = {
  genres: true,
  tags: {
    include: {
      tag: true
    }
  }
} satisfies Prisma.GameInclude;

type GameRecord = Prisma.GameGetPayload<{ include: typeof gameInclude }>;

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
      return [...games].sort(
        (a, b) =>
          getTrackedDownloadCount(b) - getTrackedDownloadCount(a) ||
          b.popularityScore - a.popularityScore
      );
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
      const matchesMature = !filters.mature || filters.mature === "all" || (filters.mature === "adult" && game.mature);

      return matchesQuery && matchesGenre && matchesEngine && matchesTag && matchesMature;
    }),
    filters.sort
  );
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function mapGameRecord(game: GameRecord): Game {
  const fallback = demoGames.find((entry) => entry.slug === game.slug);

  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    tagline: game.tagline,
    shortDescription: game.shortDescription,
    description: game.description,
    story: game.story,
    version: game.version,
    developer: game.developer,
    engine: game.engine,
    releaseDate: game.releaseDate.toISOString(),
    updatedAt: game.updatedAt.toISOString(),
    rating: game.rating,
    reviewCount: game.reviewCount,
    popularityScore: game.popularityScore,
    bookmarks: game.bookmarksCount,
    downloads: game.downloadsCount,
    mature: game.mature,
    featured: game.featured,
    hero: game.hero,
    coverImage: game.coverImage,
    bannerImage: game.bannerImage,
    gallery: toStringArray(game.gallery),
    trailerUrl: game.trailerUrl ?? "",
    downloadUrl: game.downloadUrl ?? undefined,
    genres: game.genres.map((entry) => entry.genre),
    tags: game.tags.map((entry) => entry.tag.name),
    platforms: toStringArray(game.platforms).length ? toStringArray(game.platforms) : fallback?.platforms ?? ["Windows"],
    languages: toStringArray(game.languages).length ? toStringArray(game.languages) : fallback?.languages ?? ["English"]
  };
}

async function getDatabaseGames() {
  if (!prisma) {
    return [];
  }

  try {
    const games = await prisma.game.findMany({
      include: gameInclude,
      orderBy: [{ popularityScore: "desc" }, { updatedAt: "desc" }]
    });

    return games.map(mapGameRecord);
  } catch {
    return [];
  }
}

export async function getAllGames(filters: SearchFilters = {}) {
  const databaseGames = await getDatabaseGames();
  if (databaseGames.length) {
    return filterGames(databaseGames, filters);
  }

  if (!(await isDemoCatalogHidden())) {
    return filterGames(demoGames, filters);
  }

  return [];
}

export async function getFeaturedGames() {
  return (await getAllGames()).filter((game) => game.featured).slice(0, 8);
}

export async function getHeroGame() {
  const games = await getAllGames();
  return games.find((game) => game.hero) ?? games[0] ?? null;
}

export async function getHotGames(limit = 8) {
  return (await getAllGames({ sort: "trending" })).slice(0, limit);
}

export async function getTrendingGames() {
  return getHotGames();
}

export async function getNewlyReleasedGames(limit = 8) {
  return (await getAllGames()).sort((a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate)).slice(0, limit);
}

export async function getNewlyUpdatedGames() {
  return (await getAllGames({ sort: "updated" })).slice(0, 8);
}

export async function getTopRatedGames() {
  return (await getAllGames({ sort: "rating" })).slice(0, 8);
}

export async function getQualityGames(limit = 8) {
  return (await getAllGames())
    .filter((game) => game.rating >= 8.7)
    .sort((a, b) => b.rating * Math.log10(b.reviewCount + 10) - a.rating * Math.log10(a.reviewCount + 10))
    .slice(0, limit);
}

export async function getGamesByGenre(genre: string, limit = 8) {
  return (await getAllGames({ genre, sort: "popular" })).slice(0, limit);
}

export async function getHiddenGems() {
  return (await getAllGames())
    .filter((game) => game.reviewCount < 700 && game.rating >= 8.4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);
}

export async function getRecommendedGames() {
  return (await getAllGames())
    .filter((game) => game.rating >= 8.8)
    .sort((a, b) => b.rating * b.popularityScore - a.rating * a.popularityScore)
    .slice(0, 8);
}

export async function getGameBySlug(slug: string) {
  const databaseGames = await getDatabaseGames();
  const databaseGame = databaseGames.find((game) => game.slug === slug);
  if (databaseGame) {
    return databaseGame;
  }

  if (await isDemoCatalogHidden()) {
    return null;
  }

  return demoGames.find((game) => game.slug === slug) ?? null;
}

export async function getSimilarGames(slug: string) {
  const current = await getGameBySlug(slug);
  if (!current) {
    return [];
  }

  return (await getAllGames())
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
