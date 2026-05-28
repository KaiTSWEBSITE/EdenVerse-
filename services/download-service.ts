import { demoGames } from "@/database/demo-data";
import { prisma } from "@/database/prisma";
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

export async function recordDownloadClick(slug: string) {
  const nextClicks = getDownloadClickCount(slug) + 1;
  downloadClicks.set(slug, nextClicks);

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
          downloadUrl: true
        }
      });

      return {
        clicks: nextClicks,
        downloads: game.downloadsCount,
        downloadUrl: game.downloadUrl || `/games/${slug}#download`
      };
    } catch {
      // Fall back to in-memory tracking when the clicked game is not in Prisma yet.
    }
  }

  const game = demoGames.find((entry) => entry.slug === slug);
  return {
    clicks: nextClicks,
    downloads: game ? game.downloads + nextClicks : nextClicks,
    downloadUrl: `/games/${slug}#download`
  };
}
