import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    message: "Email verification confirmed in demo mode.",
    token: body.token ?? null
  });
}
