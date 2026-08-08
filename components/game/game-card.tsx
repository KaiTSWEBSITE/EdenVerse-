"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Download, Star } from "lucide-react";
import { useState } from "react";
import type { Game } from "@/types";
import { formatCompactNumber, formatRating } from "@/lib/utils";
import { getCoverCropStyle } from "@/lib/cover-crop";
import { useAppStore } from "@/context/app-store";
import { Badge } from "@/components/ui/badge";

export function GameCard({ game }: { game: Game }) {
  const bookmarks = useAppStore((state) => state.bookmarks);
  const setBookmark = useAppStore((state) => state.setBookmark);
  const [saving, setSaving] = useState(false);

  const bookmarked = bookmarks.includes(game.slug);
  const visibleTags = Array.from(new Set(game.tags.filter((tag) => tag !== "18+"))).slice(0, game.mature ? 3 : 4);
  const coverCropStyle = getCoverCropStyle(game);

  async function toggleSave() {
    if (saving) return;
    setSaving(true);

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: game.slug })
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      if (response.ok) {
        setBookmark(game.slug, Boolean(data.saved), Number(data.bookmarks ?? game.bookmarks));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="group relative transition duration-300 hover:-translate-y-1.5">
      <Link
        href={`/games/${game.slug}`}
        className="glass-panel relative block overflow-hidden rounded-xl transition duration-300 hover:border-primary/28 hover:shadow-card-hover"
      >
        {/* Shimmer sweep on hover */}
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-xl">
          <div className="card-shimmer-inner" />
        </div>

        {/* Top glow line on hover */}
        <div className="pointer-events-none absolute inset-0 z-20 opacity-0 transition duration-400 group-hover:opacity-100">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/12 blur-2xl" />
          <div className="absolute inset-0 rounded-xl ring-1 ring-primary/18" />
        </div>

        {/* Cover image area */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#050912]">
          {/* Blurred bg */}
          <Image
            src={game.coverImage}
            alt=""
            fill
            aria-hidden
            sizes="(max-width: 768px) 100vw, 33vw"
            className="scale-110 object-cover opacity-32 blur-2xl transition duration-500 group-hover:opacity-44"
          />
          {/* Main cover */}
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={coverCropStyle}
            className="object-contain transition duration-500 ease-out group-hover:scale-[1.04] group-hover:saturate-110"
          />
          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/28 to-transparent" />
          {/* Hover vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-400 group-hover:opacity-100" />

          {/* Tags & title */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <Badge key={tag} className="border-white/10 bg-black/40 px-2 py-1 text-[9px] leading-none text-white/82">
                  {tag}
                </Badge>
              ))}
              {game.mature ? (
                <Badge className="border-accent/32 bg-accent/12 px-2 py-1 text-[9px] leading-none text-accent">
                  18+
                </Badge>
              ) : null}
            </div>
            <h3 className="line-clamp-2 break-words py-1 font-display text-2xl leading-[1.24] text-white">
              {game.title}
            </h3>
            <p className="mt-2 line-clamp-2 pb-0.5 text-sm leading-7 text-white/74">
              {game.shortDescription}
            </p>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="relative z-20 flex items-center justify-between gap-3 border-t border-white/6 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {formatRating(game.rating)}
            </span>
            <span className="truncate">{game.developer}</span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Download className="h-3.5 w-3.5 text-primary/80" />
              {formatCompactNumber(game.downloads)} tải
            </span>
          </div>

          {/* Bookmark button */}
          <button
            type="button"
            aria-label={bookmarked ? "Bỏ lưu" : "Lưu game"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void toggleSave();
            }}
            disabled={saving}
            className={`rounded-lg border p-2 transition-all duration-200 disabled:cursor-wait disabled:opacity-70 ${
              bookmarked
                ? "scale-105 border-primary/45 bg-primary/18 text-primary shadow-glow-sm"
                : "border-white/10 bg-white/6 text-muted-foreground hover:scale-105 hover:border-primary/28 hover:text-foreground"
            }`}
          >
            <Bookmark className={`h-4 w-4 transition-all duration-200 ${bookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>
    </article>
  );
}
