import type { MetadataRoute } from "next";
import { getAllGames } from "@/services/game-service";
import { getAllPosts } from "@/services/post-service";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, posts] = await Promise.all([getAllGames(), getAllPosts()]);

  return [
    "",
    "/search",
    "/news",
    "/dashboard",
    "/admin",
    ...games.map((game) => `/games/${game.slug}`),
    ...posts.map((post) => `/news/${post.slug}`)
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date()
  }));
}
