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

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username: parsed.data.username }]
    },
    select: { id: true }
  });

  if (existingUser) {
    return NextResponse.json({ message: "Email hoặc username đã tồn tại." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      username: parsed.data.username,
      name: parsed.data.username,
      passwordHash
    }
  });

  return NextResponse.json({ message: "User registered successfully.", userId: user.id }, { status: 201 });
}
