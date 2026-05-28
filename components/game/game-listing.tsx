import type { Game } from "@/types";
import { GameCard } from "@/components/game/game-card";
import { SectionHeading } from "@/components/ui/section-heading";

export function GameListing({
  eyebrow,
  title,
  description,
  games
}: {
  eyebrow: string;
  title: string;
  description: string;
  games: Game[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {games.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </section>
  );
}
