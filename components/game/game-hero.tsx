import Image from "next/image";
import { Download, Heart, Star, Tag } from "lucide-react";
import type { Game } from "@/types";
import { formatCompactNumber, formatDate, formatRating } from "@/lib/utils";
import { getTrackedDownloadCount } from "@/services/download-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadButton } from "@/components/game/download-button";

export function GameHero({ game }: { game: Game }) {
  const trackedDownloads = getTrackedDownloadCount(game);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[0.62fr_1.38fr]">
        <Card className="overflow-hidden">
          <div className="relative aspect-[4/5]">
            <Image src={game.coverImage} alt={game.title} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 30vw" />
          </div>
        </Card>
        <Card>
          <CardContent className="space-y-8 p-8">
            <div className="flex flex-wrap gap-2">
              {game.genres.map((genre) => (
                <Badge key={genre}>{genre}</Badge>
              ))}
              {game.mature ? <Badge className="border-accent/30 bg-accent/10 text-accent">18+ Mature</Badge> : null}
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-5xl text-foreground sm:text-6xl">{game.title}</h1>
              <p className="text-sm uppercase tracking-[0.22em] text-primary">{game.tagline}</p>
              <p className="max-w-4xl text-base leading-8 text-muted-foreground">{game.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-black/18">
                <CardContent className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Star className="h-4 w-4 text-accent" />
                    Đánh giá
                  </span>
                  <p className="font-display text-4xl text-foreground">{formatRating(game.rating)}</p>
                  <p className="text-sm text-muted-foreground">{formatCompactNumber(game.reviewCount)} review</p>
                </CardContent>
              </Card>
              <Card className="bg-black/18">
                <CardContent className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Heart className="h-4 w-4 text-primary" />
                    Lượt lưu
                  </span>
                  <p className="font-display text-4xl text-foreground">{formatCompactNumber(game.bookmarks)}</p>
                  <p className="text-sm text-muted-foreground">người dùng lưu</p>
                </CardContent>
              </Card>
              <Card className="bg-black/18">
                <CardContent className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Download className="h-4 w-4 text-primary" />
                    Lượt tải
                  </span>
                  <p className="font-display text-4xl text-foreground">{formatCompactNumber(trackedDownloads)}</p>
                  <p className="text-sm text-muted-foreground">lượt click tải</p>
                </CardContent>
              </Card>
              <Card className="bg-black/18">
                <CardContent className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Tag className="h-4 w-4 text-accent" />
                    Cập nhật
                  </span>
                  <p className="font-display text-2xl text-foreground">{formatDate(game.updatedAt)}</p>
                  <p className="text-sm text-muted-foreground">{game.version}</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-wrap gap-3">
              <DownloadButton slug={game.slug} initialDownloads={trackedDownloads} />
              <Button variant="secondary">Lưu vào danh sách</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
