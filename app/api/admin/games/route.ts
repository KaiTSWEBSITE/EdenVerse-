import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const MAX_GALLERY_IMAGES = 6;
const DEFAULT_COVER_IMAGE = "/games/cathedral-01.svg";
const DEFAULT_BANNER_IMAGE = "/backgrounds/eden-cathedral.png";

const gameDraftSchema = z.object({
  title: z.string().trim().min(2).max(120),
  version: z.string().trim().min(1).max(40),
  developer: z.string().trim().min(2).max(120),
  engine: z.string().trim().min(2).max(60),
  platforms: z.string().trim().min(2).max(160),
  languages: z.string().trim().max(160).optional(),
  shortDescription: z.string().trim().min(10).max(420),
  description: z.string().trim().min(20).max(4000),
  downloadUrl: z.string().trim().url().optional().or(z.literal("")),
  coverImageUrl: z.string().trim().url("Link ảnh cover chưa hợp lệ.").max(2048),
  backgroundImageUrl: z.string().trim().url("Link background chưa hợp lệ.").max(2048).optional().or(z.literal("")),
  galleryImageUrls: z.string().trim().max(6000).optional(),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(220).optional(),
  genres: z.array(z.string()).min(1, "Chọn ít nhất một thể loại."),
  tags: z.array(z.string()).optional()
});

const deleteGameSchema = z.object({
  slug: z.string().trim().min(2).max(140)
});

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `admin-game:${forwardedFor || request.headers.get("x-real-ip") || "local"}`;
}

function canManageGames(role: string) {
  return ["ADMIN", "SUPER_ADMIN"].includes(role);
}

function revalidateGameShelves(slug?: string) {
  revalidatePath("/");
  revalidatePath("/games/hot");
  revalidatePath("/games/new");
  revalidatePath("/games/quality");
  revalidatePath("/search");

  if (slug) {
    revalidatePath(`/games/${slug}`);
  }
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function toList(value: string | undefined, fallback: string[]) {
  const entries = (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries.length ? entries : fallback;
}

function normalizeExternalImageUrl(value: string, label: string) {
  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:") {
      throw new Error();
    }

    return url.toString();
  } catch {
    throw new Error(`${label} cần là link ảnh HTTPS hợp lệ.`);
  }
}

function parseGalleryImageUrls(value: string | undefined, fallbackImage: string) {
  const urls = (value ?? "")
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, MAX_GALLERY_IMAGES)
    .map((entry, index) => normalizeExternalImageUrl(entry, `Ảnh giới thiệu ${index + 1}`));

  return urls.length ? urls : [fallbackImage];
}

async function createUniqueGameSlug(title: string) {
  if (!prisma) {
    return slugify(title) || "game";
  }

  const baseSlug = slugify(title) || "game";
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.game.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function GET() {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!canManageGames(role)) {
    return NextResponse.json({ message: "Bạn không có quyền xem danh sách game." }, { status: 403 });
  }

  if (!prisma) {
    return NextResponse.json({
      games: [],
      message: "Chưa cấu hình database nên hiện chưa có game thật để quản lý."
    });
  }

  const games = await prisma.game.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      version: true,
      developer: true,
      downloadsCount: true,
      coverImage: true,
      updatedAt: true,
      createdAt: true,
      _count: {
        select: {
          comments: true,
          reviews: true
        }
      }
    },
    take: 50
  });

  return NextResponse.json({ games });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!canManageGames(role)) {
    return NextResponse.json({ message: "Bạn không có quyền xóa game." }, { status: 403 });
  }

  const limited = applyRateLimit(`${getClientKey(request)}:delete`, {
    max: 12,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const parsed = deleteGameSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Yêu cầu xóa game chưa hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  }

  if (!prisma) {
    return NextResponse.json({
      deletedCount: 0,
      message: `Đã nhận yêu cầu xóa "${parsed.data.slug}", nhưng website chưa kết nối database.`
    });
  }

  const result = await prisma.game.deleteMany({
    where: {
      slug: parsed.data.slug
    }
  });

  revalidateGameShelves(parsed.data.slug);

  return NextResponse.json({
    deletedCount: result.count,
    message: result.count ? `Đã xóa game "${parsed.data.slug}".` : `Không tìm thấy game "${parsed.data.slug}".`
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";
  if (!canManageGames(role)) {
    return NextResponse.json({ message: "Bạn không có quyền đăng game." }, { status: 403 });
  }

  const limited = applyRateLimit(getClientKey(request), {
    max: 10,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const formData = await request.formData();
  const parsed = gameDraftSchema.safeParse({
    title: getText(formData, "title"),
    version: getText(formData, "version"),
    developer: getText(formData, "developer"),
    engine: getText(formData, "engine"),
    platforms: getText(formData, "platforms"),
    languages: getText(formData, "languages"),
    shortDescription: getText(formData, "shortDescription"),
    description: getText(formData, "description"),
    downloadUrl: getText(formData, "downloadUrl"),
    coverImageUrl: getText(formData, "coverImageUrl"),
    backgroundImageUrl: getText(formData, "backgroundImageUrl"),
    galleryImageUrls: getText(formData, "galleryImageUrls"),
    seoTitle: getText(formData, "seoTitle"),
    seoDescription: getText(formData, "seoDescription"),
    genres: formData.getAll("genres").filter((value): value is string => typeof value === "string"),
    tags: formData.getAll("tags").filter((value): value is string => typeof value === "string")
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dữ liệu game chưa hợp lệ, kiểm tra lại các trường bắt buộc.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const client = prisma;

  if (!client) {
    return NextResponse.json(
      { message: "DATABASE_URL chưa hoạt động nên chưa thể lưu game thật vào PostgreSQL." },
      { status: 503 }
    );
  }

  try {
    const coverImage = normalizeExternalImageUrl(parsed.data.coverImageUrl, "Ảnh cover");
    const bannerImage = parsed.data.backgroundImageUrl
      ? normalizeExternalImageUrl(parsed.data.backgroundImageUrl, "Background")
      : coverImage || DEFAULT_BANNER_IMAGE;
    const gallery = parseGalleryImageUrls(parsed.data.galleryImageUrls, bannerImage || DEFAULT_COVER_IMAGE);
    const tags = parsed.data.tags ?? [];
    const slug = await createUniqueGameSlug(parsed.data.title);
    const hasExistingGames = (await client.game.count()) > 0;
    const tagRecords = await Promise.all(
      tags.map((tag) =>
        client.tag.upsert({
          where: { name: tag },
          create: { name: tag, slug: slugify(tag) || tag.toLowerCase() },
          update: {}
        })
      )
    );
    const categoryRecords = await Promise.all(
      parsed.data.genres.map((genre) =>
        client.category.upsert({
          where: { slug: slugify(genre) || genre.toLowerCase() },
          create: { name: genre, slug: slugify(genre) || genre.toLowerCase() },
          update: { name: genre }
        })
      )
    );

    const game = await client.game.create({
      data: {
        slug,
        title: parsed.data.title,
        tagline: parsed.data.shortDescription.slice(0, 140),
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        story: parsed.data.description,
        version: parsed.data.version,
        developer: parsed.data.developer,
        engine: parsed.data.engine,
        releaseDate: new Date(),
        downloadUrl: parsed.data.downloadUrl || null,
        mature: tags.includes("18+") || parsed.data.genres.includes("Adult"),
        featured: true,
        hero: !hasExistingGames,
        coverImage,
        bannerImage,
        gallery,
        platforms: toList(parsed.data.platforms, ["Windows"]),
        languages: toList(parsed.data.languages, ["Tiếng Việt"]),
        genres: {
          create: parsed.data.genres.map((genre) => ({ genre }))
        },
        tags: {
          create: tagRecords.map((tag) => ({
            tag: {
              connect: { id: tag.id }
            }
          }))
        },
        categories: {
          create: categoryRecords.map((category) => ({
            category: {
              connect: { id: category.id }
            }
          }))
        }
      },
      select: {
        slug: true,
        title: true,
        version: true
      }
    });

    revalidateGameShelves(game.slug);

    return NextResponse.json({
      message: `Đã đăng game "${game.title}" ${game.version} thành công.`,
      game: {
        ...game,
        url: `/games/${game.slug}`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể lưu game lúc này.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
