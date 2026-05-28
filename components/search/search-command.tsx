"use client";

import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Suggestion = {
  slug: string;
  title: string;
  subtitle: string;
  mature: boolean;
};

export function SearchCommand({
  className,
  large = false
}: {
  className?: string;
  large?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const debounced = useDebouncedValue(query, 180);

  useEffect(() => {
    let cancelled = false;

    async function loadSuggestions() {
      if (!debounced.trim()) {
        setSuggestions([]);
        return;
      }

      const response = await fetch(`/api/search?q=${encodeURIComponent(debounced)}&mode=suggestions`);
      const data = await response.json();
      if (!cancelled) {
        setSuggestions(data.suggestions ?? []);
      }
    }

    loadSuggestions().catch(() => {
      if (!cancelled) {
        setSuggestions([]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/80" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm theo tên game, tag, developer hoặc engine..."
          className={large ? "h-14 rounded-lg pl-12 text-base" : "pl-11"}
        />
        <Sparkles className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-accent/80" />
      </div>

      {suggestions.length ? (
        <div className="glass-panel absolute z-30 mt-3 w-full rounded-lg p-2">
          {suggestions.map((suggestion) => (
            <Link
              key={suggestion.slug}
              href={`/games/${suggestion.slug}`}
              className="flex items-center justify-between rounded-md px-4 py-3 transition hover:bg-white/6"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground">{suggestion.subtitle}</p>
              </div>
              {suggestion.mature ? (
                <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-accent">
                  18+
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
