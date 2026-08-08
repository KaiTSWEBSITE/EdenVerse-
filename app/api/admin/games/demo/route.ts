import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { demoGames } from "@/database/demo-data";
import { prisma } from "@/database/prisma";
import {
  HIDE_DEMO_CATALOG_COOKIE,
  HIDE_DEMO_CATALOG_SETTING_KEY
} from "@/services/demo-catalog-service";
import { applyRateLimit } from "@/middleware/rate-limit";

export const runtime = "nodejs";

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `admin-demo-games:${forwardedFor || request.headers.get("x-real-ip") || "local"}`;
}

function canManageGames(role: string) {
  return ["ADMIN", "SUPER_ADMIN"].includes(role);
}

function withHiddenDemoCookie(response: NextResponse) {
  response.cookies.set(HIDE_DEMO_CATALOG_COOKIE, "1", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}

function revalidateDemoShelves() {
  revalidatePath("/");
  revalidatePath("/games/hot");
  revalidatePath("/games/new");
  revalidatePath("/games/quality");
  revalidatePath("/search");
}

export async function DELETE(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!canManageGames(role)) {
    return NextResponse.json({ message: "Bạn không có quyền xóa game demo." }, { status: 403 });
  }

  const limited = applyRateLimit(getClientKey(request), {
    max: 5,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  if (!prisma) {
    revalidateDemoShelves();
    return withHiddenDemoCookie(
      NextResponse.json({
        deletedCount: 0,
        hiddenCount: demoGames.length,
        message: "Đã ẩn toàn bộ game demo trên trình duyệt này. Cần database để xóa dữ liệu demo vĩnh viễn cho mọi người."
      })
    );
  }

  const demoSlugs = demoGames.map((game) => game.slug);
  const result = await prisma.game.deleteMany({
    where: {
      slug: {
        in: demoSlugs
      }
    }
  });

  await prisma.$executeRaw`
    INSERT INTO "SiteSetting" ("key", "value", "updatedAt")
    VALUES (${HIDE_DEMO_CATALOG_SETTING_KEY}, 'true', NOW())
    ON CONFLICT ("key")
    DO UPDATE SET "value" = 'true', "updatedAt" = NOW()
  `;

  revalidateDemoShelves();

  return withHiddenDemoCookie(
    NextResponse.json({
      deletedCount: result.count,
      hiddenCount: demoGames.length,
      message: result.count
        ? `Đã xóa ${result.count} game demo và tắt fallback dữ liệu mẫu.`
        : "Không còn game demo trong database. Fallback dữ liệu mẫu cũng đã được tắt."
    })
  );
}
