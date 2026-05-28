import type { DashboardMetric } from "@/types";

export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  return [
    { label: "Monthly visitors", value: "182K", change: "+12.4%" },
    { label: "Games indexed", value: "30", change: "+6 this month" },
    { label: "Published editorials", value: "10", change: "+3 this week" },
    { label: "Community reviews", value: "6.4K", change: "+18.2%" }
  ];
}
