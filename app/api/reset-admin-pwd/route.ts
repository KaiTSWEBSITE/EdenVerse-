import { NextResponse } from "next/server";
import { prisma } from "@/database/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (token !== "eden123456") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prisma) {
      return new NextResponse("Database not connected", { status: 500 });
    }

    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN"] }
      }
    });

    if (admins.length === 0) {
      return NextResponse.json({ message: "No admins found" });
    }

    const newPassword = "adminpassword123";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    const updated = [];
    for (const admin of admins) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash: hash }
      });
      updated.push(admin.email);
    }

    return NextResponse.json({
      message: "Password reset successful",
      admins: updated,
      newPassword: newPassword
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
