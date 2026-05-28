import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validators";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";

export async function POST(request: Request) {
  const limited = applyRateLimit(request.headers.get("x-forwarded-for") ?? "local:register", {
    max: 5,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Too many registration attempts" }, { status: 429 });
  }

  const json = await request.json();
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid registration payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!prisma) {
    return NextResponse.json({
      message: "Demo registration passed validation. Add DATABASE_URL to persist new users via Prisma/PostgreSQL."
    });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: {
      username: parsed.data.username,
      passwordHash
    },
    create: {
      email: parsed.data.email,
      username: parsed.data.username,
      name: parsed.data.username,
      passwordHash
    }
  });

  return NextResponse.json({ message: "User registered successfully.", userId: user.id }, { status: 201 });
}
