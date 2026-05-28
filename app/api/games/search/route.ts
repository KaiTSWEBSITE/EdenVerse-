import { NextResponse } from "next/server";
import { getSearchSuggestions } from "@/services/search-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const suggestions = await getSearchSuggestions(searchParams.get("q") ?? "");
  return NextResponse.json({ suggestions });
}
