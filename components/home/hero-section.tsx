import Link from "next/link";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import type { Game } from "@/types";
import { SearchCommand } from "@/components/search/search-command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSection({
  heroGame,
  trending
}: {
  heroGame: Game;
  trending: Game[];
}) {
  return (
    <section className="relative overflow-hidden pt-16 sm:pt-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.85fr] lg:px-8">
        <div className="relative">
          <div className="absolute -left-10 top-8 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="space-y-8">
            <div className="space-y-5">
              <Badge>Dark Fantasy Discovery</Badge>
              <h1 className="max-w-4xl font-display text-5xl leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
                A premium cathedral for visual novels, sandbox routes, and story-rich obsession.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Explore adult VN curation, anime RPG discoveries, choice-matter recommendations, and polished editorial updates inside a launcher-like premium experience.
              </p>
            </div>

            <div className="relative max-w-2xl">
              <SearchCommand large />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/games/${heroGame.slug}`}>
                <Button size="lg">
                  Explore Featured VN
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/search?sort=trending">
                <Button variant="secondary" size="lg">
                  Browse Trending
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Games indexed", value: "30", note: "seeded demo titles" },
                { label: "Premium posts", value: "10", note: "editorial + updates" },
                { label: "Community glow", value: "6.4K", note: "ratings + comments" }
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{stat.label}</p>
                    <p className="font-display text-3xl text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="relative space-y-6 p-7">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/12 blur-3xl" />
            <div className="flex items-center justify-between">
              <Badge>Featured Visual Novel</Badge>
              <div className="inline-flex items-center gap-2 text-sm text-accent">
                <Sparkles className="h-4 w-4" />
                Elite curation
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="font-display text-4xl text-foreground">{heroGame.title}</h2>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">{heroGame.tagline}</p>
              <p className="text-sm leading-7 text-muted-foreground">{heroGame.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trending.slice(0, 4).map((game, index) => (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="group rounded-[24px] border border-white/8 bg-black/20 p-4 transition hover:border-primary/30 hover:bg-white/6"
                >
                  <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Flame className="h-3.5 w-3.5 text-accent" />
                    Trending #{index + 1}
                  </div>
                  <p className="font-display text-2xl text-foreground">{game.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{game.shortDescription}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
