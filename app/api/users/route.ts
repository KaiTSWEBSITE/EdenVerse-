import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllUsers } from "@/services/user-service";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Bạn không có quyền xem danh sách user." }, { status: 403 });
  }

  const users = await getAllUsers();
  return NextResponse.json({ users });
}
