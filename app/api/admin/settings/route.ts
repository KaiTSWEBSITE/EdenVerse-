import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { applyRateLimit } from "@/middleware/rate-limit";
import { setHeroIntro } from "@/services/site-settings-service";

const settingsSchema = z.object({
  heroIntro: z.string().trim().min(40).max(320)
});

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `admin-settings:${forwardedFor || request.headers.get("x-real-ip") || "local"}`;
}

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.json({ message: "Bạn không có quyền chỉnh cấu hình website." }, { status: 403 });
  }

  const limited = applyRateLimit(getClientKey(request), {
    max: 8,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn lưu cấu hình quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const json = await request.json();
  const parsed = settingsSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Câu giới thiệu cần dài 40-320 ký tự.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await setHeroIntro(parsed.data.heroIntro);
  revalidatePath("/");

  const response = NextResponse.json({
    heroIntro: parsed.data.heroIntro,
    message: "Đã cập nhật câu giới thiệu trang chủ."
  });
  response.cookies.set("edenverse_hero_intro", encodeURIComponent(parsed.data.heroIntro), {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
