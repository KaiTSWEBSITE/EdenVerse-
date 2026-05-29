import { NextResponse } from "next/server";
import { getSearchSuggestions } from "@/services/search-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const suggestions = await getSearchSuggestions(searchParams.get("q") ?? "");
  const response = NextResponse.json({ suggestions });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
