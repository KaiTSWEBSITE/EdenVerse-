import type { Game } from "@/types";
import { GameCard } from "@/components/game/game-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function GameSection({
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
    <Reveal>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {games.length ? (
            games.map((game) => <GameCard key={game.slug} game={game} />)
          ) : (
            <div className="rounded-lg border border-white/10 bg-black/24 p-6 text-sm leading-7 text-muted-foreground md:col-span-2 xl:col-span-4">
              Chưa có game nào trong kệ này. Hãy đăng game thật trong admin để thay thế dữ liệu demo.
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}
