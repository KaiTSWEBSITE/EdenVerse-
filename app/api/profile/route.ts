import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserByUsername } from "@/services/user-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ user: null, authenticated: false });
  }

  const user = await getUserByUsername(session.user.username);
  return NextResponse.json({ user, authenticated: true });
}
