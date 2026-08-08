import type { DashboardMetric } from "@/types";
import { prisma } from "@/database/prisma";

const viNumber = new Intl.NumberFormat("vi-VN");

function getUtcDayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysAgo(days: number) {
  const day = getUtcDayStart();
  day.setUTCDate(day.getUTCDate() - days);
  return day;
}

function formatNumber(value: number | null | undefined) {
  return viNumber.format(value ?? 0);
}

async function getSafeDashboardCounts() {
  const fallback = {
    indexedGames: 0,
    communityReviews: 0,
    totalDownloads: 0,
    pageViews30: 0,
    uniqueVisitors30: 0,
    downloadClicks30: 0,
    pageViewsToday: 0,
    uniqueVisitorsToday: 0
  };

  if (!prisma) {
    return fallback;
  }

  try {
    const today = getUtcDayStart();
    const from30Days = daysAgo(29);
    const [indexedGames, communityReviews, downloadsAggregate, analytics30Days, analyticsToday] =
      await Promise.all([
        prisma.game.count(),
        prisma.review.count(),
        prisma.game.aggregate({ _sum: { downloadsCount: true } }),
        prisma.analyticsDay.aggregate({
          where: { day: { gte: from30Days } },
          _sum: {
            pageViews: true,
            uniqueVisitors: true,
            downloadClicks: true
          }
        }),
        prisma.analyticsDay.findUnique({
          where: { day: today },
          select: {
            pageViews: true,
            uniqueVisitors: true
          }
        })
      ]);

    return {
      indexedGames,
      communityReviews,
      totalDownloads: downloadsAggregate._sum.downloadsCount ?? 0,
      pageViews30: analytics30Days._sum.pageViews ?? 0,
      uniqueVisitors30: analytics30Days._sum.uniqueVisitors ?? 0,
      downloadClicks30: analytics30Days._sum.downloadClicks ?? 0,
      pageViewsToday: analyticsToday?.pageViews ?? 0,
      uniqueVisitorsToday: analyticsToday?.uniqueVisitors ?? 0
    };
  } catch {
    return fallback;
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  const {
    indexedGames,
    communityReviews,
    totalDownloads,
    pageViews30,
    uniqueVisitors30,
    downloadClicks30,
    pageViewsToday,
    uniqueVisitorsToday
  } = await getSafeDashboardCounts();

  return [
    {
      label: "Người vào 30 ngày",
      value: formatNumber(uniqueVisitors30),
      change: `${formatNumber(uniqueVisitorsToday)} khách hôm nay`
    },
    {
      label: "Lượt xem trang",
      value: formatNumber(pageViews30),
      change: `${formatNumber(pageViewsToday)} lượt hôm nay`
    },
    {
      label: "Tổng lượt tải",
      value: formatNumber(totalDownloads),
      change: `${formatNumber(downloadClicks30)} click tải trong 30 ngày`
    },
    {
      label: "Game & review",
      value: formatNumber(indexedGames),
      change: `${formatNumber(communityReviews)} review cộng đồng`
    }
  ];
}
