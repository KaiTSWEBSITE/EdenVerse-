import type { DashboardMetric } from "@/types";
import { prisma } from "@/database/prisma";

export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  const [indexedGames, communityReviews] = prisma
    ? await Promise.all([prisma.game.count(), prisma.review.count()])
    : [0, 0];

  return [
    { label: "Lượt truy cập tháng", value: "0", change: "Đã reset kỳ này" },
    { label: "Game đã index", value: String(indexedGames), change: "Dữ liệu thật từ database" },
    { label: "Game chờ duyệt", value: "0", change: "Không có game chờ duyệt" },
    { label: "Review cộng đồng", value: String(communityReviews), change: "Đã bỏ số liệu demo" }
  ];
}
