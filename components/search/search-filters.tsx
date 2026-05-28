import { ENGINES, GENRES, TAGS } from "@/constants/filters";
import { Card, CardContent } from "@/components/ui/card";

export function SearchFilters({
  activeGenre,
  activeEngine,
  activeTag
}: {
  activeGenre?: string;
  activeEngine?: string;
  activeTag?: string;
}) {
  return (
    <Card className="h-fit">
      <CardContent className="space-y-6 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary">Filters</p>
          <h2 className="mt-2 font-display text-3xl text-foreground">Smart search</h2>
        </div>
        <div className="space-y-5">
          <FilterGroup title="Genres" options={GENRES} active={activeGenre} queryKey="genre" />
          <FilterGroup title="Engines" options={ENGINES} active={activeEngine} queryKey="engine" />
          <FilterGroup title="Tags" options={TAGS.slice(0, 8)} active={activeTag} queryKey="tag" />
        </div>
      </CardContent>
    </Card>
  );
}

function FilterGroup({
  title,
  options,
  active,
  queryKey
}: {
  title: string;
  options: readonly string[];
  active?: string;
  queryKey: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <a
            key={option}
            href={`/search?${queryKey}=${encodeURIComponent(option)}`}
            className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition ${
              active === option
                ? "border-primary/40 bg-primary/12 text-primary"
                : "border-white/10 bg-white/6 text-muted-foreground hover:text-foreground"
            }`}
          >
            {option}
          </a>
        ))}
      </div>
    </div>
  );
}
