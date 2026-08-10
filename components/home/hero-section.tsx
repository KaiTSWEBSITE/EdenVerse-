import Image from "next/image";
import Link from "next/link";
import { Play, Sparkles, Download, Star } from "lucide-react";
import type { Game } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCompactNumber, formatRating } from "@/lib/utils";

export function HeroSection({ heroGame }: { heroGame: Game | null }) {
  if (!heroGame) return null;

  // Ideally, a cinematic hero image should be a wide landscape image (16:9). 
  // If we only have coverImage (portrait), it might not look perfect, but we'll blur the edges or use object-cover.
  const bannerImage = heroGame.coverImage;

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] flex items-end pb-12 pt-32 overflow-hidden bg-noir-bg0 mt-[-76px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bannerImage}
          alt={heroGame.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-70 mask-image-gradient"
        />
      </div>

      {/* Overlays for readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-noir-bg0 via-noir-bg0/60 to-transparent" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-noir-bg0/90 via-noir-bg0/40 to-transparent" />
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-5">
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30 shadow-none backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Spotlight
          </Badge>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-lg">
            {heroGame.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-white/80">
            {heroGame.mature && (
              <Badge className="bg-accent/80 text-white hover:bg-accent/90 border-transparent">18+</Badge>
            )}
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded backdrop-blur-md border border-white/10">
              <Star className="h-3.5 w-3.5 text-noir-warning fill-noir-warning" />
              {formatRating(heroGame.rating)}
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded backdrop-blur-md border border-white/10">
              <Download className="h-3.5 w-3.5 text-primary" />
              {formatCompactNumber(heroGame.downloads)} Tải về
            </span>
            <span>{heroGame.developer}</span>
          </div>
          
          <p className="text-base md:text-lg text-white/70 line-clamp-2 max-w-xl">
            {heroGame.shortDescription}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Link href={`/games/${heroGame.slug}`}>
              <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full px-8 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Play className="h-5 w-5 mr-2 fill-black" />
                Khám Phá Ngay
              </Button>
            </Link>
            <Link href="/games/new">
              <Button variant="ghost" size="lg" className="rounded-full px-6 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md">
                Game mới cập nhật
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
