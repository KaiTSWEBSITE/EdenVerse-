import { NextResponse } from "next/server";
import { searchSchema } from "@/lib/validators";
import { getAllGames } from "@/services/game-service";

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
  return NextResponse.json({ games });
}
