import { NextResponse } from "next/server";
import { searchEverything, getSearchSuggestions } from "@/services/search-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const mode = searchParams.get("mode") ?? "full";

  if (mode === "suggestions") {
    const suggestions = await getSearchSuggestions(q);
    const response = NextResponse.json({ suggestions });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  const results = await searchEverything({
    q,
    genre: searchParams.get("genre") ?? undefined,
    engine: searchParams.get("engine") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    mature: (searchParams.get("mature") as "all" | "adult" | null) ?? "all",
    sort: (searchParams.get("sort") as "trending" | "rating" | "updated" | "popular" | null) ?? "trending"
  });

  const response = NextResponse.json(results);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
