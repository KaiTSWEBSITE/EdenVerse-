"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Star } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.article whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="group relative">
      <Link href={`/games/${game.slug}`} className="glass-panel block overflow-hidden rounded-[28px]">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover transition duration-500 group-hover:scale-105 ${isBlurred ? "scale-110 blur-xl brightness-50" : ""}`}
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
            <p className="mt-2 text-sm leading-6 text-white/72">{game.shortDescription}</p>
          </div>
          {isBlurred ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-full border border-white/12 bg-black/45 px-4 py-2 text-xs uppercase tracking-[0.24em] text-accent">
                Safe Mode Blur
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {formatRating(game.rating)}
            </span>
            <span>{game.developer}</span>
            <span>{formatCompactNumber(game.bookmarks)} saves</span>
          </div>
          <button
            type="button"
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            onClick={(event) => {
              event.preventDefault();
              toggleBookmark(game.slug);
            }}
            className={`rounded-full border p-2 transition ${bookmarked ? "border-primary/40 bg-primary/15 text-primary" : "border-white/10 bg-white/6 text-muted-foreground hover:text-foreground"}`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>
    </motion.article>
  );
}
