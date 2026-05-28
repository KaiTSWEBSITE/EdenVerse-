import { NextResponse } from "next/server";
import { getGameBySlug, getSimilarGames } from "@/services/game-service";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) {
    return NextResponse.json({ message: "Game not found" }, { status: 404 });
  }

  const similar = await getSimilarGames(slug);
  return NextResponse.json({ game, similar });
}
