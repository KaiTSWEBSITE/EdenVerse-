"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Star } from "lucide-react";
import type { CSSProperties, MouseEvent } from "react";
import type { Game } from "@/types";
import { formatCompactNumber, formatRating } from "@/lib/utils";
import { useAppStore } from "@/context/app-store";
import { Badge } from "@/components/ui/badge";

type GlowStyle = CSSProperties & {
  "--spotlight-x"?: string;
  "--spotlight-y"?: string;
};

export function GameCard({ game }: { game: Game }) {
  const safeMode = useAppStore((state) => state.safeMode);
  const bookmarks = useAppStore((state) => state.bookmarks);
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);

  const isBlurred = game.mature && safeMode;
  const bookmarked = bookmarks.includes(game.slug);

  function moveGlow(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }

  return (
    <article
      onMouseMove={moveGlow}
      onMouseLeave={(event) => {
        event.currentTarget.style.setProperty("--spotlight-x", "50%");
        event.currentTarget.style.setProperty("--spotlight-y", "45%");
      }}
      style={{ "--spotlight-x": "50%", "--spotlight-y": "45%" } as GlowStyle}
      className="group relative transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(83,188,255,0.16)]"
    >
      <Link href={`/games/${game.slug}`} className="glass-panel relative block overflow-hidden rounded-lg">
        <div className="pointer-events-none absolute -inset-px z-0 rounded-lg bg-[radial-gradient(360px_circle_at_var(--spotlight-x)_var(--spotlight-y),rgba(83,188,255,0.18),rgba(221,183,105,0.07)_34%,transparent_68%)] opacity-0 blur-xl transition duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 rounded-lg bg-[radial-gradient(280px_circle_at_var(--spotlight-x)_var(--spotlight-y),rgba(111,205,255,0.22),rgba(210,171,96,0.08)_32%,transparent_62%)]" />
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          <div className="absolute inset-0 rounded-lg ring-1 ring-primary/30" />
        </div>

        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover transition duration-300 group-hover:scale-[1.035] ${
              isBlurred ? "scale-105 blur-lg brightness-50" : ""
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {game.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} className="bg-black/25 text-[10px] text-white/80">
                  {tag}
                </Badge>
              ))}
              {game.mature ? <Badge className="border-accent/30 bg-accent/10 text-accent">18+</Badge> : null}
            </div>
            <h3 className="font-display text-2xl leading-tight text-white">{game.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/72">{game.shortDescription}</p>
          </div>
          {isBlurred ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-lg border border-white/12 bg-black/55 px-4 py-2 text-xs uppercase text-accent">
                Đang ẩn 18+
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative z-20 flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {formatRating(game.rating)}
            </span>
            <span className="truncate">{game.developer}</span>
            <span className="hidden sm:inline">{formatCompactNumber(game.bookmarks)} lưu</span>
          </div>
          <button
            type="button"
            aria-label={bookmarked ? "Bỏ lưu" : "Lưu game"}
            onClick={(event) => {
              event.preventDefault();
              toggleBookmark(game.slug);
            }}
            className={`rounded-lg border p-2 transition ${
              bookmarked
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-white/10 bg-white/6 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>
    </article>
  );
}
