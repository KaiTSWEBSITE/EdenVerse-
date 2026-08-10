import Link from "next/link";
import { ENGINES, GENRES, TAGS } from "@/constants/filters";
import { Filter, X } from "lucide-react";

type ParsedParams = {
  q?: string;
  genre?: string;
  engine?: string;
  tag?: string;
  mature?: string;
  sort?: string;
};

export function SearchFilters({
  currentParams,
  genreOptions = GENRES,
  engineOptions = ENGINES,
  tagOptions = TAGS
}: {
  currentParams: ParsedParams;
  genreOptions?: readonly string[];
  engineOptions?: readonly string[];
  tagOptions?: readonly string[];
}) {
  return (
    <aside className="sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto hide-scrollbar rounded-2xl bg-black/40 border border-white/5 p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-foreground">Bộ Lọc</h2>
      </div>

      <div className="space-y-8">
        <FilterGroup 
          title="Thể loại" 
          options={genreOptions} 
          active={currentParams.genre} 
          queryKey="genre" 
          currentParams={currentParams} 
        />
        <FilterGroup 
          title="Engine" 
          options={engineOptions} 
          active={currentParams.engine} 
          queryKey="engine" 
          currentParams={currentParams} 
        />
        <FilterGroup 
          title="Tags" 
          options={tagOptions.slice(0, 18)} 
          active={currentParams.tag} 
          queryKey="tag" 
          currentParams={currentParams} 
        />
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  options,
  active,
  queryKey,
  currentParams,
}: {
  title: string;
  options: readonly string[];
  active?: string;
  queryKey: keyof ParsedParams;
  currentParams: ParsedParams;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = active === option;
          
          // Build the new URL search params
          const searchParams = new URLSearchParams();
          
          // Copy existing params
          if (currentParams.q) searchParams.set("q", currentParams.q);
          if (currentParams.genre) searchParams.set("genre", currentParams.genre);
          if (currentParams.engine) searchParams.set("engine", currentParams.engine);
          if (currentParams.tag) searchParams.set("tag", currentParams.tag);
          if (currentParams.mature !== "all") searchParams.set("mature", currentParams.mature || "");
          if (currentParams.sort !== "trending") searchParams.set("sort", currentParams.sort || "");

          // Toggle the current key
          if (isActive) {
            searchParams.delete(queryKey);
          } else {
            searchParams.set(queryKey, option);
          }

          const href = `/search?${searchParams.toString()}`;

          return (
            <Link
              key={option}
              href={href as any}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition-all duration-200 ${
                isActive
                  ? "border-primary/50 bg-primary/20 text-primary shadow-glow-sm"
                  : "border-white/10 bg-black/40 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/20"
              }`}
            >
              {option}
              {isActive && <X className="h-3 w-3 ml-1" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
