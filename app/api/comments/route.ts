import { NextResponse } from "next/server";
import { demoComments } from "@/database/demo-data";
import { applyRateLimit } from "@/middleware/rate-limit";
import { commentSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json({ comments: demoComments });
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request.headers.get("x-forwarded-for") ?? "local:comments", {
    max: 10,
    windowMs: 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = commentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "Comment received. Connect this handler to Prisma for persistence.",
      comment: parsed.data
    },
    { status: 201 }
  );
}
