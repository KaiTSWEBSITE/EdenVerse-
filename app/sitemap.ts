import type { MetadataRoute } from "next";
import { getAllGames } from "@/services/game-service";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const games = await getAllGames();

  return [
    "",
    "/search",
    "/games/hot",
    "/games/new",
    "/games/quality",
    "/dashboard",
    ...games.map((game) => `/games/${game.slug}`)
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date()
  }));
}
