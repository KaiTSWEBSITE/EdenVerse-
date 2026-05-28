import Link from "next/link";
import type { DashboardMetric, Game } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardOverview({
  metrics,
  recommendations
}: {
  metrics: DashboardMetric[];
  recommendations: Game[];
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="space-y-2 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{metric.label}</p>
              <p className="font-display text-4xl text-foreground">{metric.value}</p>
              <p className="text-sm text-primary">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-5 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Recommended for you</p>
            <h2 className="mt-2 font-display text-4xl text-foreground">Continue where the mood is strongest</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((game) => (
              <Link key={game.slug} href={`/games/${game.slug}`} className="rounded-[24px] border border-white/8 bg-black/18 p-5 transition hover:bg-white/6">
                <p className="font-display text-2xl text-foreground">{game.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{game.tagline}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
