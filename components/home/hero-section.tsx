import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Flame, Sparkles, Star } from "lucide-react";
import type { Game } from "@/types";
import { SearchCommand } from "@/components/search/search-command";
import { HeroIntroText } from "@/components/home/hero-intro-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCompactNumber, formatRating } from "@/lib/utils";

export function HeroSection({
  heroGame,
  intro,
  trending
}: {
  heroGame: Game | null;
  intro: string;
  trending: Game[];
}) {
  return (
    <section className="relative min-h-[calc(100vh-76px)] overflow-hidden">
      <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl flex-col justify-center px-4 pb-10 pt-14 sm:px-6 lg:px-8">

        {/* Top content */}
        <div className="max-w-4xl space-y-7">
          {/* Animated eyebrow badge */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="glow-badge animate-glow-breathe">Visual Novel Hub</Badge>
          </div>

          {/* Title + intro */}
          <div className="space-y-4">
            <h1 className="font-display text-6xl leading-none sm:text-7xl lg:text-8xl">
              <span className="text-gradient-hero">EdenVerse</span>
            </h1>
            <HeroIntroText intro={intro} />
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <SearchCommand large />
          </div>

          {/* CTA buttons */}
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

        {/* Bento grid — hero game + trending */}
        <div className="mt-10 grid gap-4 border-t border-white/8 pt-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Featured hero game card */}
          {heroGame ? (
            <Link
              href={`/games/${heroGame.slug}`}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-0 backdrop-blur-md transition duration-300 hover:border-primary/35 hover:shadow-card-hover"
            >
              {/* Card shimmer */}
              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-xl">
                <div className="card-shimmer-inner" />
              </div>

              {/* Cover image background */}
              {heroGame.coverImage && (
                <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
                  <Image
                    src={heroGame.coverImage}
                    alt=""
                    fill
                    aria-hidden
                    className="scale-110 object-cover opacity-14 blur-sm transition duration-500 group-hover:opacity-22 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

              <div className="relative z-10 flex h-full flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="h-4 w-4" />
                    Game được chọn hôm nay
                  </div>
                  <h2 className="font-display text-4xl leading-tight text-foreground">{heroGame.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                    {heroGame.shortDescription}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5 text-sm text-muted-foreground md:flex-col md:items-end md:gap-3">
                  <span className="inline-flex items-center gap-1.5 text-foreground">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {formatRating(heroGame.rating)}
                  </span>
                  <span>{formatCompactNumber(heroGame.bookmarks)} lượt lưu</span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
              <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-4 w-4" />
                Chưa có game
              </div>
              <h2 className="font-display text-4xl leading-tight text-foreground">Đang chờ game thật đầu tiên</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Game demo đã được dọn khỏi trang chủ. Hãy vào admin để đăng game thật đầu tiên cho EdenVerse.
              </p>
            </div>
          )}

          {/* Trending cards grid — 2×2 bento */}
          <div className="grid grid-cols-2 gap-3">
            {trending.length ? (
              trending.slice(0, 4).map((game, index) => (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/26 backdrop-blur-md transition duration-300 hover:border-primary/30 hover:shadow-card-hover"
                >
                  {/* Shimmer */}
                  <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-xl">
                    <div className="card-shimmer-inner" />
                  </div>

                  {/* Cover background */}
                  {game.coverImage && (
                    <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
                      <Image
                        src={game.coverImage}
                        alt=""
                        fill
                        aria-hidden
                        className="scale-110 object-cover opacity-18 blur-sm transition duration-500 group-hover:opacity-26"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30" />
                    </div>
                  )}

                  <div className="relative z-10 p-4">
                    <div className="mb-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <Flame className="h-3.5 w-3.5 text-accent" />
                      #{index + 1}
                    </div>
                    <p className="break-words font-display text-xl leading-tight text-foreground">{game.title}</p>
                    <p className="mt-1 shrink text-xs text-muted-foreground">{game.developer}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 rounded-xl border border-white/10 bg-black/26 p-4 text-sm leading-7 text-muted-foreground backdrop-blur-md">
                Kệ Game Hot sẽ tự hiện lại khi có game thật và người dùng bắt đầu bấm link tải.
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex flex-col items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground/60">
            <span>Khám phá</span>
            <ChevronDown className="h-4 w-4 animate-bounce-gentle" />
          </div>
        </div>
      </div>
    </section>
  );
}
