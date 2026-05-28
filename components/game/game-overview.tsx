import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Game } from "@/types";
import { formatDate } from "@/lib/utils";

export function GameOverview({ game }: { game: Game }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 xl:grid-cols-[1.15fr_0.85fr] lg:px-8">
      <Card>
        <CardContent className="space-y-8 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Story</p>
            <p className="mt-3 text-base leading-8 text-muted-foreground">{game.story}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Description</p>
            <p className="mt-3 text-base leading-8 text-muted-foreground">{game.description}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Download Notes</p>
            <p className="mt-3 text-base leading-8 text-muted-foreground">
              Mirrors, changelogs, and checksum fields can be wired to your real release pipeline. This production-ready demo already includes the card structure, version handling, and secure file-upload hooks for future CMS integration.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-8">
          {[
            ["Developer", game.developer],
            ["Engine", game.engine],
            ["Release date", formatDate(game.releaseDate)],
            ["Platforms", game.platforms.join(", ")],
            ["Languages", game.languages.join(", ")],
            ["Genres", game.genres.join(", ")],
            ["Tags", game.tags.join(", ")]
          ].map(([label, value]) => (
            <div key={label} className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
              <p className="text-base text-foreground">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
