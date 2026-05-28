import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDashboardMetrics } from "@/services/analytics-service";
import { getRecommendedGames } from "@/services/game-service";

export default async function DashboardPage() {
  const [metrics, recommendations] = await Promise.all([getDashboardMetrics(), getRecommendedGames()]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Bảng cá nhân"
        title="Gợi ý riêng, nhịp cộng đồng và danh sách theo dõi"
        description="Dashboard thành viên được dựng sẵn để phát triển thành trung tâm đăng nhập thật cho watchlist, game vừa xem và đề xuất cá nhân hóa."
      />
      <DashboardOverview metrics={metrics} recommendations={recommendations.slice(0, 4)} />
    </section>
  );
}
