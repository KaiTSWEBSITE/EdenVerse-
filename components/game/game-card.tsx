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
  const visibleTags = Array.from(new Set(game.tags.filter((tag) => tag !== "18+"))).slice(0, 2);
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
    <article className="group relative flex h-full flex-col">
      <Link href={`/games/${game.slug}`} className="flex h-full flex-col">
        {/* Cover Image */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 group-hover:shadow-glow-sm">
          {/* Main Image */}
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            style={coverCropStyle}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          
          {/* Dark Overlay (Bottom) for contrast if we put tags there, but we put them top left */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Badges Overlay */}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
            {game.mature && (
              <Badge className="border-accent/30 bg-accent/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                18+
              </Badge>
            )}
            {visibleTags.map((tag) => (
              <Badge key={tag} className="border-white/10 bg-black/60 px-1.5 py-0.5 text-[10px] text-white/90 backdrop-blur-md">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            aria-label={bookmarked ? "Bỏ lưu" : "Lưu game"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void toggleSave();
            }}
            disabled={saving}
            className={`absolute right-2 top-2 rounded-full p-1.5 backdrop-blur-md transition-all duration-200 disabled:opacity-50 ${
              bookmarked
                ? "bg-primary/90 text-white shadow-glow-sm"
                : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Info Area (Below Image) */}
        <div className="mt-3 flex flex-1 flex-col">
          <h3 className="line-clamp-1 font-display text-base font-semibold text-foreground transition-colors group-hover:text-primary">
            {game.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{game.developer}</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className="shrink-0">{game.version}</span>
          </div>
          
          <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 text-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="font-medium">{formatRating(game.rating)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Download className="h-3 w-3" />
              <span>{formatCompactNumber(game.downloads)}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
