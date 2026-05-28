import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    message: "Run `npm run db:seed` after setting DATABASE_URL to populate PostgreSQL with the included demo catalog."
  });
}
