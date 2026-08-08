import type { Game } from "@/types";
import { GameCarousel } from "@/components/game/game-carousel";
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
      <GameCarousel
        games={games}
        emptyText="Chưa có game nào ở mục này. Khi admin đăng game thật, danh sách sẽ tự cập nhật."
      />
    </section>
  );
}
