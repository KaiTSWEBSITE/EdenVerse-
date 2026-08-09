import { demoGames } from "@/database/demo-data";
import { prisma } from "@/database/prisma";
import { recordDownloadMetric } from "@/services/analytics-tracking-service";
import type { Game } from "@/types";

declare global {
  var __edenverseDownloadClicks__: Map<string, number> | undefined;
}

const downloadClicks = globalThis.__edenverseDownloadClicks__ ?? new Map<string, number>();

if (!globalThis.__edenverseDownloadClicks__) {
  globalThis.__edenverseDownloadClicks__ = downloadClicks;
}

export function getDownloadClickCount(slug: string) {
  return downloadClicks.get(slug) ?? 0;
}

export function getTrackedDownloadCount(game: Game) {
  return game.downloads + getDownloadClickCount(game.slug);
}

export async function recordDownloadClick(
  slug: string,
  mirror: "primary" | "backup" | "joyplay" | "season2" = "primary",
  isVip: boolean = false
) {
  const nextClicks = getDownloadClickCount(slug) + 1;
  downloadClicks.set(slug, nextClicks);
  await recordDownloadMetric();

  if (prisma) {
    try {
      const game = await prisma.game.update({
        where: { slug },
        data: {
          downloadsCount: { increment: 1 },
          popularityScore: { increment: 8 }
        },
        select: {
          downloadsCount: true,
          downloadUrl: true,
          downloadUrlAlt: true,
          downloadUrlJoyplay: true,
          downloadUrlSeason2: true,
          downloadUrlVip: true,
          downloadUrlAltVip: true,
          downloadUrlJoyplayVip: true,
          downloadUrlSeason2Vip: true
        }
      });

      const selectedUrl =
        mirror === "season2"
          ? (isVip && game.downloadUrlSeason2Vip) ? game.downloadUrlSeason2Vip : (game.downloadUrlSeason2 || game.downloadUrl)
          : mirror === "joyplay"
            ? (isVip && game.downloadUrlJoyplayVip) ? game.downloadUrlJoyplayVip : (game.downloadUrlJoyplay || game.downloadUrl)
            : mirror === "backup"
              ? (isVip && game.downloadUrlAltVip) ? game.downloadUrlAltVip : (game.downloadUrlAlt || game.downloadUrl)
              : (isVip && game.downloadUrlVip) ? game.downloadUrlVip : game.downloadUrl;

      return {
        clicks: nextClicks,
        downloads: game.downloadsCount,
        downloadUrl: selectedUrl || `/games/${slug}#download`,
        mirror
      };
    } catch {
      // Fall back to in-memory tracking when the clicked game is not in Prisma yet.
    }
  }

  const game = demoGames.find((entry) => entry.slug === slug);
  return {
    clicks: nextClicks,
    downloads: game ? game.downloads + nextClicks : nextClicks,
    downloadUrl: `/games/${slug}#download`,
    mirror
  };
}
