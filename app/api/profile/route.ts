import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import { getUserByUsername } from "@/services/user-service";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(360).optional(),
  avatarUrl: z.string().trim().max(2048).optional(),
  bannerUrl: z.string().trim().max(2048).optional(),
  allowMatureContent: z.boolean().optional()
});

function normalizeProfileImageUrl(value: string | undefined, label: string) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "https:") {
      throw new Error();
    }

    return url.toString();
  } catch {
    throw new Error(`${label} cần là link ảnh HTTPS hợp lệ.`);
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ user: null, authenticated: false });
  }

  const user = await getUserByUsername(session.user.username);
  return NextResponse.json({ user, authenticated: true });
}

export async function PATCH(request: Request) {
  const session = await auth();
  const username = session?.user?.username;

  if (!username) {
    return NextResponse.json({ message: "Bạn cần đăng nhập để chỉnh sửa hồ sơ." }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ message: "Database chưa hoạt động nên chưa thể lưu hồ sơ." }, { status: 503 });
  }

  const parsed = profileSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Thông tin hồ sơ chưa hợp lệ.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const avatar = normalizeProfileImageUrl(parsed.data.avatarUrl, "Avatar");
    const banner = normalizeProfileImageUrl(parsed.data.bannerUrl, "Hình nền hồ sơ");

    await prisma.user.update({
      where: { username },
      data: {
        name: parsed.data.name,
        bio: parsed.data.bio?.trim() || null,
        image: avatar,
        banner,
        allowMatureContent: parsed.data.allowMatureContent ?? false
      }
    });

    revalidatePath("/profile");
    revalidatePath(`/profile/${username}`);

    const user = await getUserByUsername(username);
    return NextResponse.json({ message: "Đã cập nhật hồ sơ.", user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật hồ sơ lúc này.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
