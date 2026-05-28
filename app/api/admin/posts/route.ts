import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";

const deletePostSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("demo")
  }),
  z.object({
    mode: z.literal("slug"),
    slug: z.string().trim().min(2).max(140)
  })
]);

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `admin-posts:${forwardedFor || request.headers.get("x-real-ip") || "local"}`;
}

function canManagePosts(role: string) {
  return ["ADMIN", "SUPER_ADMIN"].includes(role);
}

export async function GET() {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!canManagePosts(role)) {
    return NextResponse.json({ message: "Bạn không có quyền xem danh sách bài viết." }, { status: 403 });
  }

  if (!prisma) {
    return NextResponse.json({
      message: "Chưa cấu hình database nên hiện chưa có bài viết để quản lý.",
      posts: []
    });
  }

  const posts = await prisma.post.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      createdAt: true,
      author: {
        select: {
          name: true,
          username: true
        }
      },
      category: {
        select: {
          name: true,
          slug: true
        }
      },
      _count: {
        select: {
          comments: true,
          tags: true
        }
      }
    },
    take: 30
  });

  return NextResponse.json({ posts });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!canManagePosts(role)) {
    return NextResponse.json({ message: "Bạn không có quyền xóa bài viết." }, { status: 403 });
  }

  const limited = applyRateLimit(getClientKey(request), {
    max: 10,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const parsed = deletePostSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Yêu cầu xóa bài chưa hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!prisma) {
    return NextResponse.json({
      deletedCount: 0,
      message:
        parsed.data.mode === "demo"
          ? "Đã dọn bài demo trong chế độ không database. Hiện không còn bài demo mặc định."
          : `Đã nhận yêu cầu xóa bài "${parsed.data.slug}" trong chế độ không database.`
    });
  }

  const result =
    parsed.data.mode === "demo"
      ? await prisma.post.deleteMany({
          where: {
            OR: [
              { status: "DEMO" },
              { slug: { startsWith: "demo-" } },
              { slug: { startsWith: "edenverse-weekly" } },
              { title: { contains: "demo", mode: "insensitive" } }
            ]
          }
        })
      : await prisma.post.deleteMany({
          where: {
            slug: parsed.data.slug
          }
        });

  return NextResponse.json({
    deletedCount: result.count,
    message:
      parsed.data.mode === "demo"
        ? `Đã xóa ${result.count} bài demo.`
        : result.count
          ? `Đã xóa bài "${parsed.data.slug}".`
          : `Không tìm thấy bài "${parsed.data.slug}".`
  });
}
