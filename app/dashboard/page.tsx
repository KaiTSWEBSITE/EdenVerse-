import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDashboardMetrics } from "@/services/analytics-service";
import { getRecommendedGames } from "@/services/game-service";

export default async function DashboardPage() {
  const [metrics, recommendations] = await Promise.all([getDashboardMetrics(), getRecommendedGames()]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Dashboard"
        title="Personal pulse, recommendations, and community momentum"
        description="A premium member dashboard ready to evolve into a logged-in control center for watchlists, recently viewed releases, and adaptive suggestions."
      />
      <DashboardOverview metrics={metrics} recommendations={recommendations.slice(0, 4)} />
    </section>
  );
}
