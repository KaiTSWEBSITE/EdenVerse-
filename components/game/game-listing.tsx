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
        {games.length ? (
          games.map((game) => <GameCard key={game.slug} game={game} />)
        ) : (
          <div className="rounded-lg border border-white/10 bg-black/24 p-6 text-sm leading-7 text-muted-foreground md:col-span-2 xl:col-span-4">
            Chưa có game nào ở mục này. Khi admin đăng game thật, danh sách sẽ tự cập nhật.
          </div>
        )}
      </div>
    </section>
  );
}
