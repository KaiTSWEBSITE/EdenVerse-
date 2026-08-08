import type { Game } from "@/types";
import { GameCarousel } from "@/components/game/game-carousel";
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
        <GameCarousel
          games={games}
          emptyText="Chưa có game nào trong kệ này. Hãy đăng game thật trong admin để thay thế dữ liệu demo."
        />
      </section>
    </Reveal>
  );
}
