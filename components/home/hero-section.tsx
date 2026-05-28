import Link from "next/link";
import { ArrowRight, Flame, Sparkles, Star } from "lucide-react";
import type { Game } from "@/types";
import { SearchCommand } from "@/components/search/search-command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCompactNumber, formatRating } from "@/lib/utils";

export function HeroSection({
  heroGame,
  trending
}: {
  heroGame: Game;
  trending: Game[];
}) {
  return (
    <section className="relative min-h-[calc(100vh-76px)] overflow-hidden">
      <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl flex-col justify-center px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-7">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Dark Fantasy VN Hub</Badge>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-6xl leading-none text-foreground sm:text-7xl lg:text-8xl">
              EdenVerse
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-foreground/86 sm:text-xl">
              Khám phá EdenVerse qua ba lối vào gọn gàng: game đang được tải nhiều, game vừa ra mắt
              và những lựa chọn chất lượng cao được cộng đồng đánh giá tốt.
            </p>
          </div>

          <div className="relative max-w-2xl">
            <SearchCommand large />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/games/hot">
              <Button size="lg">
                Xem Game Hot
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/games/new">
              <Button variant="secondary" size="lg">
                Game mới ra mắt
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 border-t border-white/10 pt-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Link
            href={`/games/${heroGame.slug}`}
            className="group grid gap-4 rounded-lg border border-white/10 bg-black/28 p-5 backdrop-blur-md transition hover:border-primary/35 hover:bg-black/38 md:grid-cols-[1fr_auto]"
          >
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-4 w-4" />
                Game được chọn hôm nay
              </div>
              <h2 className="font-display text-4xl leading-tight text-foreground">{heroGame.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{heroGame.shortDescription}</p>
            </div>
            <div className="flex items-center gap-5 text-sm text-muted-foreground md:justify-end">
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {formatRating(heroGame.rating)}
              </span>
              <span>{formatCompactNumber(heroGame.bookmarks)} lượt lưu</span>
            </div>
          </Link>

          <div className="grid gap-3 sm:grid-cols-2">
            {trending.slice(0, 4).map((game, index) => (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className="group rounded-lg border border-white/10 bg-black/24 p-4 backdrop-blur-md transition hover:border-primary/30 hover:bg-black/36"
              >
                <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-accent" />
                  Hot #{index + 1}
                </div>
                <p className="font-display text-2xl leading-tight text-foreground">{game.title}</p>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{game.developer}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
