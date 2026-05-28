import { GameCard } from "@/components/game/game-card";
import { SearchFilters } from "@/components/search/search-filters";
import { SectionHeading } from "@/components/ui/section-heading";
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

  const games = await getAllGames(parsed);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Search System"
        title="Find by title, developer, engine, tag, or mood"
        description="Smart search combines direct title matching with genre/tag/developer ranking so you can surface premium visual novels fast."
      />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <SearchFilters activeGenre={parsed.genre} activeEngine={parsed.engine} activeTag={parsed.tag} />
        <div className="space-y-5">
          <div className="glass-panel rounded-[28px] p-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{games.length}</span> results
              {parsed.q ? ` for "${parsed.q}"` : ""}.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
