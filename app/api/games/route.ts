import { NextResponse } from "next/server";
import { searchSchema } from "@/lib/validators";
import { getAllGames } from "@/services/game-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.parse({
    q: searchParams.get("q") ?? undefined,
    genre: searchParams.get("genre") ?? undefined,
    engine: searchParams.get("engine") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    mature: searchParams.get("mature") ?? "all",
    sort: searchParams.get("sort") ?? "trending"
  });

  const games = await getAllGames(parsed);
  const response = NextResponse.json({ games });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
