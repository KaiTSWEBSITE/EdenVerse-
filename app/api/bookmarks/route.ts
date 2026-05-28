import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    message: "Bookmark endpoint is ready for database persistence.",
    slug: body.slug ?? null
  });
}
