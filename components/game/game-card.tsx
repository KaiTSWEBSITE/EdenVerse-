"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Download, Star } from "lucide-react";
import type { Game } from "@/types";
import { formatCompactNumber, formatRating } from "@/lib/utils";
import { useAppStore } from "@/context/app-store";
import { Badge } from "@/components/ui/badge";

export function GameCard({ game }: { game: Game }) {
  const bookmarks = useAppStore((state) => state.bookmarks);
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);

  const bookmarked = bookmarks.includes(game.slug);
  const visibleTags = Array.from(new Set(game.tags.filter((tag) => tag !== "18+"))).slice(0, game.mature ? 3 : 4);

  return (
    <article className="group relative transition duration-200 hover:-translate-y-1">
      <Link
        href={`/games/${game.slug}`}
        className="glass-panel relative block overflow-hidden rounded-lg transition duration-300 hover:border-primary/25 hover:bg-white/[0.045] hover:shadow-[0_18px_46px_rgba(0,0,0,0.32)]"
      >
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent" />
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute inset-0 rounded-lg ring-1 ring-primary/20" />
        </div>

        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.025] group-hover:saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <Badge key={tag} className="border-white/10 bg-black/35 px-2 py-1 text-[9px] leading-none text-white/82">
                  {tag}
                </Badge>
              ))}
              {game.mature ? <Badge className="border-accent/30 bg-accent/10 px-2 py-1 text-[9px] leading-none text-accent">18+</Badge> : null}
            </div>
            <h3 className="font-display text-2xl leading-tight text-white">{game.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/72">{game.shortDescription}</p>
          </div>
        </div>

        <div className="relative z-20 flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {formatRating(game.rating)}
            </span>
            <span className="truncate">{game.developer}</span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Download className="h-3.5 w-3.5 text-primary" />
              {formatCompactNumber(game.downloads)} tải
            </span>
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
