import Link from "next/link";
import type { DashboardMetric, Game } from "@/types";
import { ArrowRight, Activity } from "lucide-react";

export function DashboardOverview({
  metrics,
  recommendations
}: {
  metrics: DashboardMetric[];
  recommendations: Game[];
}) {
  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md bg-black/40 group transition-all hover:bg-black/60 hover:border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">{metric.label}</p>
              <Activity className="h-4 w-4 text-white/20 group-hover:text-primary/50 transition-colors" />
            </div>
            <p className="font-display text-5xl text-white font-bold drop-shadow-md">{metric.value}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
              {metric.change}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="glass-panel p-8 sm:p-10 rounded-[32px] border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-lg bg-gradient-to-br from-black/60 to-[#0a0f18]/80">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent mb-4">
              Đề xuất cho bạn
            </div>
            <h2 className="font-display text-4xl text-white font-bold">Tiếp tục cuộc phiêu lưu</h2>
            <p className="mt-2 text-sm text-muted-foreground">Những tựa game hợp mood nhất dựa trên lịch sử của bạn.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {recommendations.map((game) => (
            <Link 
              key={game.slug} 
              href={`/games/${game.slug}`} 
              className="group block rounded-[24px] border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(87,188,255,0.15)] relative overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="font-display text-2xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{game.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">{game.tagline}</p>
                
                <div className="mt-6 flex items-center text-xs font-semibold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Xem chi tiết <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
