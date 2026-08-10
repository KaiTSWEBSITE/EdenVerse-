"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Game } from "@/types";
import { GameCard } from "@/components/game/game-card";

export function GameCarousel({ games, emptyText }: { games: Game[]; emptyText: string }) {
  const railRef = useRef<HTMLDivElement>(null);

  function scrollRail(direction: -1 | 1) {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    rail.scrollBy({
      left: direction * Math.max(320, rail.clientWidth * 0.86),
      behavior: "smooth"
    });
  }

  if (!games.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/24 p-6 text-sm leading-7 text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Kéo danh sách game sang trái"
        onClick={() => scrollRail(-1)}
        className="absolute -left-4 top-[40%] z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/80 text-white shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-md transition hover:border-primary/50 hover:bg-primary/20 hover:text-primary md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={railRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pr-4 scroll-smooth"
      >
        {games.map((game) => (
          <div
            key={game.slug}
            className="w-[min(82vw,16rem)] shrink-0 snap-start sm:w-[16rem] md:w-[calc((100%_-_1rem)/2)] lg:w-[calc((100%_-_3rem)/4)] xl:w-[calc((100%_-_4rem)/5)] 2xl:w-[calc((100%_-_5rem)/6)]"
          >
            <GameCard game={game} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Kéo danh sách game sang phải"
        onClick={() => scrollRail(1)}
        className="absolute -right-4 top-[40%] z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/80 text-white shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-md transition hover:border-primary/50 hover:bg-primary/20 hover:text-primary md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-20 bg-gradient-to-l from-black/70 to-transparent md:block" />
    </div>
  );
}
