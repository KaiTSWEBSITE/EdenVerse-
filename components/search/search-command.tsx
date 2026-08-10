"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles, X } from "lucide-react";
import { type FormEvent, useEffect, useState, useRef } from "react";
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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounced = useDebouncedValue(query, 180);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;

    setSuggestions([]);
    setIsFocused(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  // Handle clicking outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const showSuggestions = isFocused && (suggestions.length > 0 || debounced.trim().length > 0);

  return (
    <div ref={wrapperRef} className={cn("relative z-50", className)}>
      <form 
        className="relative group" 
        onSubmit={submitSearch}
      >
        <Search className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-200 ${isFocused ? "text-primary" : "text-muted-foreground"}`} />
        <Input
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm theo tên game, tag, developer hoặc engine..."
          className={cn(
            "bg-black/40 border-white/10 text-white placeholder:text-white/40 transition-all duration-300",
            "focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 focus-visible:bg-black/60",
            large ? "h-14 rounded-xl pl-12 text-base shadow-[0_4px_24px_rgba(0,0,0,0.2)]" : "pl-11 rounded-lg"
          )}
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsFocused(true);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Sparkles className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-accent/50 group-hover:text-accent/80 transition-colors" />
        )}
      </form>

      {showSuggestions && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-xl bg-[#0a0f18]/95 border border-white/10 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.length > 0 ? (
            <div className="flex flex-col gap-1">
              {suggestions.map((suggestion) => (
                <Link
                  key={suggestion.slug}
                  href={`/games/${suggestion.slug}`}
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                    setIsFocused(false);
                  }}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-white/10 group"
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.subtitle}</p>
                  </div>
                  {suggestion.mature && (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-accent font-bold">
                      18+
                    </span>
                  )}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-1 mx-2" />
              <button 
                onClick={() => {
                  setSuggestions([]);
                  setIsFocused(false);
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }}
                className="w-full text-center text-xs text-primary hover:text-primary/80 py-2 transition-colors font-medium"
              >
                Xem tất cả kết quả cho "{query}"
              </button>
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">Không tìm thấy tựa game nào phù hợp.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
