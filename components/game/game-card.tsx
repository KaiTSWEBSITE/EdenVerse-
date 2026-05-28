"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Star } from "lucide-react";
import type { Game } from "@/types";
import { formatCompactNumber, formatRating } from "@/lib/utils";
import { useAppStore } from "@/context/app-store";
import { Badge } from "@/components/ui/badge";

export function GameCard({ game }: { game: Game }) {
  const safeMode = useAppStore((state) => state.safeMode);
  const bookmarks = useAppStore((state) => state.bookmarks);
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);

  const isBlurred = game.mature && safeMode;
  const bookmarked = bookmarks.includes(game.slug);

  return (
    <article className="group relative transition duration-200 hover:-translate-y-1">
      <Link href={`/games/${game.slug}`} className="glass-panel block overflow-hidden rounded-lg">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover transition duration-300 group-hover:scale-[1.035] ${isBlurred ? "scale-105 blur-lg brightness-50" : ""}`}
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
              <div className="rounded-lg border border-white/12 bg-black/55 px-4 py-2 text-xs uppercase tracking-[0.18em] text-accent">
                Đang ẩn 18+
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
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
            className={`rounded-lg border p-2 transition ${bookmarked ? "border-primary/40 bg-primary/15 text-primary" : "border-white/10 bg-white/6 text-muted-foreground hover:text-foreground"}`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>
    </article>
  );
}
