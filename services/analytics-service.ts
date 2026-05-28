import type { DashboardMetric } from "@/types";

export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  return [
    { label: "Lượt truy cập tháng", value: "182K", change: "+12.4%" },
    { label: "Game đã index", value: "30", change: "+6 trong tháng" },
    { label: "Game chờ duyệt", value: "7", change: "+2 hôm nay" },
    { label: "Review cộng đồng", value: "6.4K", change: "+18.2%" }
  ];
}
