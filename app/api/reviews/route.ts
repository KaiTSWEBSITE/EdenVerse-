import { NextResponse } from "next/server";
import { demoReviews } from "@/database/demo-data";
import { reviewSchema } from "@/lib/validators";
import { applyRateLimit } from "@/middleware/rate-limit";

export async function GET() {
  return NextResponse.json({ reviews: demoReviews });
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request.headers.get("x-forwarded-for") ?? "local:reviews", {
    max: 8,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Too many review submissions" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = reviewSchema.safeParse({
    ...json,
    rating: typeof json.rating === "number" ? json.rating : Number(json.rating)
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({ message: "Review accepted in demo mode.", review: parsed.data }, { status: 201 });
}
