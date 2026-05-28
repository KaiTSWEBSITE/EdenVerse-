import { NextResponse } from "next/server";
import { searchEverything, getSearchSuggestions } from "@/services/search-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const mode = searchParams.get("mode") ?? "full";

  if (mode === "suggestions") {
    const suggestions = await getSearchSuggestions(q);
    return NextResponse.json({ suggestions });
  }

  const results = await searchEverything({
    q,
    genre: searchParams.get("genre") ?? undefined,
    engine: searchParams.get("engine") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    mature: (searchParams.get("mature") as "all" | "adult" | null) ?? "all",
    sort: (searchParams.get("sort") as "trending" | "rating" | "updated" | "popular" | null) ?? "trending"
  });

  return NextResponse.json(results);
}
