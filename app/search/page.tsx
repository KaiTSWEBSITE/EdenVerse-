import { GameCard } from "@/components/game/game-card";
import { SearchFilters } from "@/components/search/search-filters";
import { SectionHeading } from "@/components/ui/section-heading";
import { ENGINES, GENRES, TAGS } from "@/constants/filters";
import { searchSchema } from "@/lib/validators";
import { getAllGames } from "@/services/game-service";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const parsed = searchSchema.parse({
    q: typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : undefined,
    genre: typeof resolvedSearchParams.genre === "string" ? resolvedSearchParams.genre : undefined,
    engine: typeof resolvedSearchParams.engine === "string" ? resolvedSearchParams.engine : undefined,
    tag: typeof resolvedSearchParams.tag === "string" ? resolvedSearchParams.tag : undefined,
    mature: typeof resolvedSearchParams.mature === "string" ? resolvedSearchParams.mature : "all",
    sort: typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "trending"
  });

  const [games, allGames] = await Promise.all([getAllGames(parsed), getAllGames()]);
  const genreOptions = Array.from(new Set([...GENRES, ...allGames.flatMap((game) => game.genres)])).sort((a, b) =>
    a.localeCompare(b)
  );
  const engineOptions = Array.from(new Set([...ENGINES, ...allGames.map((game) => game.engine)])).sort((a, b) =>
    a.localeCompare(b)
  );
  const tagOptions = Array.from(new Set([...TAGS, ...allGames.flatMap((game) => game.tags)])).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Tìm kiếm"
        title="Tìm theo tên, developer, engine, tag hoặc mood"
        description="Hệ thống tìm kiếm ưu tiên tên game, thể loại, tag và developer để bạn lọc game nhanh hơn."
      />
      <div className="grid gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
        <SearchFilters
          currentParams={parsed}
          genreOptions={genreOptions}
          engineOptions={engineOptions}
          tagOptions={tagOptions}
        />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Kết quả tìm kiếm
              {parsed.q ? (
                <span className="text-primary ml-2">"{parsed.q}"</span>
              ) : null}
            </h2>
            <p className="text-sm text-muted-foreground bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              <span className="font-bold text-white mr-1">{games.length}</span> 
              game
            </p>
          </div>
          
          {games.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-black/20 border border-white/5">
              <p className="text-muted-foreground text-lg mb-2">Không tìm thấy tựa game nào phù hợp.</p>
              <p className="text-sm text-muted-foreground/60">Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {games.map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
