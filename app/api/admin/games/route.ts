import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_GALLERY_IMAGES = 6;
const DEFAULT_COVER_IMAGE = "/games/cathedral-01.svg";
const DEFAULT_BANNER_IMAGE = "/backgrounds/eden-cathedral.png";

const adminGameSelect = {
  id: true,
  slug: true,
  title: true,
  tagline: true,
  shortDescription: true,
  description: true,
  version: true,
  developer: true,
  engine: true,
  fileSize: true,
  downloadUrl: true,
  downloadUrlAlt: true,
  downloadUrlJoyplay: true,
  downloadUrlSeason2: true,
  downloadUrlVip: true,
  downloadUrlAltVip: true,
  downloadUrlJoyplayVip: true,
  downloadUrlSeason2Vip: true,
  adminNote: true,
  adminNoteColor: true,
  downloadsCount: true,
  reviewCount: true,
  coverImage: true,
  coverZoom: true,
  coverPositionX: true,
  coverPositionY: true,
  bannerImage: true,
  gallery: true,
  platforms: true,
  languages: true,
  updatedAt: true,
  createdAt: true,
  genres: {
    select: {
      genre: true
    }
  },
  tags: {
    select: {
      tag: {
        select: {
          name: true
        }
      }
    }
  },
  _count: {
    select: {
      comments: true,
      reviews: true,
      starRatings: true
    }
  }
} satisfies Prisma.GameSelect;

type AdminGameRecord = Prisma.GameGetPayload<{ select: typeof adminGameSelect }>;

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function isInternalAssetPath(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//");
}

const externalImageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => !value || isHttpsUrl(value), "Link ảnh cover cần là HTTPS hợp lệ, ví dụ https://...");
const optionalExternalImageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => !value || isHttpsUrl(value), "Link background cần là HTTPS hợp lệ hoặc để trống.")
  .optional()
  .or(z.literal(""));
const editableImageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => isHttpsUrl(value) || isInternalAssetPath(value), "Link ảnh cần là HTTPS hoặc đường dẫn ảnh nội bộ hiện có.");
const optionalEditableImageUrlSchema = editableImageUrlSchema.optional().or(z.literal(""));
const adminNoteColorSchema = z
  .string()
  .trim()
  .max(16)
  .refine(
    (value) => !value || /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value),
    "Màu ghi chú cần là mã hex, ví dụ #d1a058."
  )
  .optional()
  .or(z.literal(""));
const coverZoomSchema = z.coerce.number().min(1, "Zoom cover tối thiểu 1.00.").max(1.6, "Zoom cover tối đa 1.60.");
const coverPositionSchema = z.coerce.number().int().min(0, "Vị trí cover tối thiểu 0.").max(100, "Vị trí cover tối đa 100.");

const gameDraftSchema = z.object({
  title: z.string().trim().min(2, "Tên game cần ít nhất 2 ký tự.").max(120, "Tên game quá dài."),
  version: z.string().trim().min(1, "Nhập phiên bản game.").max(40, "Phiên bản quá dài."),
  developer: z.string().trim().min(2, "Nhập tên developer/studio.").max(120, "Tên developer quá dài."),
  engine: z.string().trim().min(2, "Chọn hoặc nhập engine.").max(60, "Tên engine quá dài."),
  platforms: z.string().trim().min(2, "Nhập thiết bị hỗ trợ, ví dụ Windows, Android.").max(160, "Danh sách thiết bị quá dài."),
  languages: z.string().trim().max(160).optional(),
  shortDescription: z.string().trim().min(10, "Giới thiệu ngắn cần ít nhất 10 ký tự.").max(420, "Giới thiệu ngắn quá dài."),
  description: z.string().trim().min(20, "Mô tả chi tiết cần ít nhất 20 ký tự.").max(4000, "Mô tả chi tiết quá dài."),
  fileSize: z.string().trim().max(40, "Dung lượng quá dài.").optional().or(z.literal("")),
  adminNote: z.string().trim().max(1200, "Ghi chú admin tối đa 1200 ký tự.").optional(),
  adminNoteColor: adminNoteColorSchema,
  downloadUrl: z.string().trim().url("Link tải chính chưa hợp lệ. Dán URL đầy đủ, ví dụ https://...").optional().or(z.literal("")),
  downloadUrlAlt: z.string().trim().url("Link tải phụ chưa hợp lệ. Dán URL đầy đủ, ví dụ https://...").optional().or(z.literal("")),
  downloadUrlJoyplay: z.string().trim().url("Link JoyPlay chưa hợp lệ. Dán URL đầy đủ, ví dụ https://...").optional().or(z.literal("")),
  downloadUrlSeason2: z.string().trim().url("Link Season 2 chưa hợp lệ. Dán URL đầy đủ, ví dụ https://...").optional().or(z.literal("")),
  downloadUrlVip: z.string().trim().url("Link tải VIP chính chưa hợp lệ. Dán URL đầy đủ, ví dụ https://...").optional().or(z.literal("")),
  downloadUrlAltVip: z.string().trim().url("Link tải VIP phụ chưa hợp lệ. Dán URL đầy đủ, ví dụ https://...").optional().or(z.literal("")),
  downloadUrlJoyplayVip: z.string().trim().url("Link tải VIP JoyPlay chưa hợp lệ. Dán URL đầy đủ, ví dụ https://...").optional().or(z.literal("")),
  downloadUrlSeason2Vip: z.string().trim().url("Link tải VIP Season 2 chưa hợp lệ. Dán URL đầy đủ, ví dụ https://...").optional().or(z.literal("")),
  coverImageUrl: externalImageUrlSchema,
  coverZoom: coverZoomSchema.default(1),
  coverPositionX: coverPositionSchema.default(50),
  coverPositionY: coverPositionSchema.default(50),
  backgroundImageUrl: optionalExternalImageUrlSchema,
  galleryImageUrls: z.string().trim().max(6000).optional(),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(220).optional(),
  genres: z.array(z.string()).min(1, "Chọn ít nhất một thể loại."),
  tags: z.array(z.string()).optional()
});

const deleteGameSchema = z.object({
  slug: z.string().trim().min(2).max(140)
});

const updateGameSchema = gameDraftSchema.extend({
  slug: z.string().trim().min(2).max(140),
  coverImageUrl: editableImageUrlSchema,
  backgroundImageUrl: optionalEditableImageUrlSchema
});

const gameFieldLabels: Record<string, string> = {
  title: "Tên game",
  version: "Phiên bản",
  developer: "Developer/studio",
  engine: "Engine",
  platforms: "Thiết bị",
  languages: "Ngôn ngữ",
  shortDescription: "Giới thiệu ngắn",
  description: "Mô tả chi tiết",
  fileSize: "Dung lượng",
  adminNote: "Ghi chú admin",
  adminNoteColor: "Màu ghi chú",
  downloadUrl: "Link tải chính",
  downloadUrlAlt: "Link tải phụ",
  downloadUrlJoyplay: "Link tải JoyPlay",
  downloadUrlSeason2: "Link tải Season 2",
  downloadUrlVip: "Link tải VIP chính",
  downloadUrlAltVip: "Link tải VIP phụ",
  downloadUrlJoyplayVip: "Link tải VIP JoyPlay",
  downloadUrlSeason2Vip: "Link tải VIP Season 2",
  coverImageUrl: "Ảnh cover",
  coverZoom: "Zoom cover",
  coverPositionX: "Vị trí ngang cover",
  coverPositionY: "Vị trí dọc cover",
  backgroundImageUrl: "Ảnh background/banner",
  galleryImageUrls: "Ảnh giới thiệu",
  seoTitle: "SEO title",
  seoDescription: "SEO description",
  genres: "Thể loại",
  tags: "Tags",
  slug: "Slug"
};

function getGameValidationResponse(error: z.ZodError, message: string) {
  const issues = error.flatten();
  const details = Object.entries(issues.fieldErrors)
    .flatMap(([field, errors]) =>
      (errors ?? []).map((fieldMessage) => `${gameFieldLabels[field] ?? field}: ${fieldMessage}`)
    )
    .concat(issues.formErrors);

  return NextResponse.json(
    {
      message,
      details,
      issues
    },
    { status: 400 }
  );
}

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

function getTextList(formData: FormData, key: string) {
  return Array.from(
    new Set(
      formData
        .getAll(key)
        .filter((value): value is string => typeof value === "string")
        .flatMap((value) => value.split(/\r?\n|,/))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
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

function normalizeEditableImageUrl(value: string, label: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  return normalizeExternalImageUrl(trimmed, label);
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

function parseEditableGalleryImageUrls(value: string | undefined, fallbackImage: string) {
  const urls = (value ?? "")
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, MAX_GALLERY_IMAGES)
    .map((entry, index) =>
      isInternalAssetPath(entry) ? entry : normalizeExternalImageUrl(entry, `Ảnh giới thiệu ${index + 1}`)
    );

  return urls.length ? urls : [fallbackImage];
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function serializeAdminGame(game: AdminGameRecord) {
  return {
    ...game,
    gallery: normalizeStringArray(game.gallery),
    platforms: normalizeStringArray(game.platforms),
    languages: normalizeStringArray(game.languages),
    genres: game.genres.map((genre) => genre.genre),
    tags: game.tags.map((gameTag) => gameTag.tag.name)
  };
}

function getGameFormPayload(formData: FormData) {
  return {
    slug: getText(formData, "slug"),
    title: getText(formData, "title"),
    version: getText(formData, "version"),
    developer: getText(formData, "developer"),
    engine: getText(formData, "engine"),
    platforms: getText(formData, "platforms"),
    languages: getText(formData, "languages"),
    shortDescription: getText(formData, "shortDescription"),
    description: getText(formData, "description"),
    fileSize: getText(formData, "fileSize"),
    adminNote: getText(formData, "adminNote"),
    adminNoteColor: getText(formData, "adminNoteColor"),
    downloadUrl: getText(formData, "downloadUrl"),
    downloadUrlAlt: getText(formData, "downloadUrlAlt"),
    downloadUrlJoyplay: getText(formData, "downloadUrlJoyplay"),
    downloadUrlSeason2: getText(formData, "downloadUrlSeason2"),
    downloadUrlVip: getText(formData, "downloadUrlVip"),
    downloadUrlAltVip: getText(formData, "downloadUrlAltVip"),
    downloadUrlJoyplayVip: getText(formData, "downloadUrlJoyplayVip"),
    downloadUrlSeason2Vip: getText(formData, "downloadUrlSeason2Vip"),
    coverImageUrl: getText(formData, "coverImageUrl"),
    coverZoom: getText(formData, "coverZoom") || "1",
    coverPositionX: getText(formData, "coverPositionX") || "50",
    coverPositionY: getText(formData, "coverPositionY") || "50",
    backgroundImageUrl: getText(formData, "backgroundImageUrl"),
    galleryImageUrls: getText(formData, "galleryImageUrls"),
    seoTitle: getText(formData, "seoTitle"),
    seoDescription: getText(formData, "seoDescription"),
    genres: getTextList(formData, "genres"),
    tags: getTextList(formData, "tags")
  };
}

function parseGameFormData(formData: FormData) {
  const payload = getGameFormPayload(formData);
  return gameDraftSchema.safeParse(payload);
}

function parseGameUpdateFormData(formData: FormData) {
  const payload = getGameFormPayload(formData);
  return updateGameSchema.safeParse(payload);
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

export async function GET(request: Request) {
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

  const slug = new URL(request.url).searchParams.get("slug")?.trim();

  if (slug) {
    const game = await prisma.game.findUnique({
      where: { slug },
      select: adminGameSelect
    });
    const response = NextResponse.json({
      game: game ? serializeAdminGame(game) : null
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  const games = await prisma.game.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: adminGameSelect,
    take: 50
  });

  const response = NextResponse.json({
    games: games.map(serializeAdminGame)
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
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

export async function PATCH(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";
  if (!canManageGames(role)) {
    return NextResponse.json({ message: "Bạn không có quyền chỉnh sửa game." }, { status: 403 });
  }

  const limited = applyRateLimit(`${getClientKey(request)}:update`, {
    max: 12,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const formData = await request.formData();
  const parsed = parseGameUpdateFormData(formData);

  if (!parsed.success) {
    return getGameValidationResponse(parsed.error, "Dữ liệu cập nhật chưa hợp lệ, kiểm tra các lỗi bên dưới.");
  }

  const client = prisma;

  if (!client) {
    return NextResponse.json(
      { message: "DATABASE_URL chưa hoạt động nên chưa thể cập nhật game trong PostgreSQL." },
      { status: 503 }
    );
  }

  try {
    const existingGame = await client.game.findUnique({
      where: { slug: parsed.data.slug },
      select: {
        id: true,
        coverImage: true,
        coverZoom: true,
        coverPositionX: true,
        coverPositionY: true,
        bannerImage: true,
        gallery: true,
        platforms: true,
        languages: true,
        downloadUrl: true,
        downloadUrlAlt: true,
        downloadUrlJoyplay: true,
        downloadUrlSeason2: true
      }
    });

    if (!existingGame) {
      return NextResponse.json({ message: `Không tìm thấy game "${parsed.data.slug}" để chỉnh sửa.` }, { status: 404 });
    }

    const coverImage = parsed.data.coverImageUrl
      ? normalizeEditableImageUrl(parsed.data.coverImageUrl, "Ảnh cover")
      : existingGame.coverImage;
    const bannerImage = parsed.data.backgroundImageUrl
      ? normalizeEditableImageUrl(parsed.data.backgroundImageUrl, "Background")
      : existingGame.bannerImage || coverImage || DEFAULT_BANNER_IMAGE;
    const gallery = parsed.data.galleryImageUrls?.trim()
      ? parseEditableGalleryImageUrls(parsed.data.galleryImageUrls, bannerImage || DEFAULT_COVER_IMAGE)
      : normalizeStringArray(existingGame.gallery);
    const tags = parsed.data.tags ?? [];
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

    const game = await client.game.update({
      where: { slug: parsed.data.slug },
      data: {
        title: parsed.data.title,
        tagline: parsed.data.shortDescription.slice(0, 140),
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        story: parsed.data.description,
        fileSize: parsed.data.fileSize?.trim() || null,
        adminNote: parsed.data.adminNote?.trim() || null,
        adminNoteColor: parsed.data.adminNoteColor?.trim() || null,
        version: parsed.data.version,
        developer: parsed.data.developer,
        engine: parsed.data.engine,
        downloadUrl: (parsed.data.downloadUrl ?? "").trim() || null,
        downloadUrlAlt: (parsed.data.downloadUrlAlt ?? "").trim() || null,
        downloadUrlJoyplay: (parsed.data.downloadUrlJoyplay ?? "").trim() || null,
        downloadUrlSeason2: (parsed.data.downloadUrlSeason2 ?? "").trim() || null,
        downloadUrlVip: (parsed.data.downloadUrlVip ?? "").trim() || null,
        downloadUrlAltVip: (parsed.data.downloadUrlAltVip ?? "").trim() || null,
        downloadUrlJoyplayVip: (parsed.data.downloadUrlJoyplayVip ?? "").trim() || null,
        downloadUrlSeason2Vip: (parsed.data.downloadUrlSeason2Vip ?? "").trim() || null,
        mature: tags.includes("18+") || parsed.data.genres.includes("Adult") || parsed.data.genres.includes("Adult VN"),
        coverImage,
        coverZoom: parsed.data.coverZoom,
        coverPositionX: parsed.data.coverPositionX,
        coverPositionY: parsed.data.coverPositionY,
        bannerImage,
        gallery,
        platforms: toList(parsed.data.platforms, normalizeStringArray(existingGame.platforms).length ? normalizeStringArray(existingGame.platforms) : ["Windows"]),
        languages: toList(parsed.data.languages, normalizeStringArray(existingGame.languages).length ? normalizeStringArray(existingGame.languages) : ["Tiếng Việt"]),
        genres: {
          deleteMany: {},
          create: parsed.data.genres.map((genre) => ({ genre }))
        },
        tags: {
          deleteMany: {},
          create: tagRecords.map((tag) => ({
            tag: {
              connect: { id: tag.id }
            }
          }))
        },
        categories: {
          deleteMany: {},
          create: categoryRecords.map((category) => ({
            category: {
              connect: { id: category.id }
            }
          }))
        }
      },
      select: adminGameSelect
    });

    const freshGame = await client.game.findUniqueOrThrow({
      where: { slug: game.slug },
      select: adminGameSelect
    });

    revalidateGameShelves(freshGame.slug);

    return NextResponse.json({
      message: `Đã cập nhật game "${game.title}" ${game.version}.`,
      game: {
        ...serializeAdminGame(freshGame),
        url: `/games/${freshGame.slug}`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật game lúc này.";
    return NextResponse.json({ message }, { status: 400 });
  }
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
  const parsed = parseGameFormData(formData);

  if (!parsed.success) {
    return getGameValidationResponse(parsed.error, "Dữ liệu game chưa hợp lệ, kiểm tra các lỗi bên dưới.");
  }

  const client = prisma;

  if (!client) {
    return NextResponse.json(
      { message: "DATABASE_URL chưa hoạt động nên chưa thể lưu game thật vào PostgreSQL." },
      { status: 503 }
    );
  }

  try {
    const coverImage = parsed.data.coverImageUrl
      ? normalizeExternalImageUrl(parsed.data.coverImageUrl, "Ảnh cover")
      : DEFAULT_COVER_IMAGE;
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
        fileSize: parsed.data.fileSize?.trim() || null,
        adminNote: parsed.data.adminNote?.trim() || null,
        adminNoteColor: parsed.data.adminNoteColor?.trim() || null,
        version: parsed.data.version,
        developer: parsed.data.developer,
        engine: parsed.data.engine,
        releaseDate: new Date(),
        downloadUrl: parsed.data.downloadUrl || null,
        downloadUrlAlt: parsed.data.downloadUrlAlt || null,
        downloadUrlJoyplay: parsed.data.downloadUrlJoyplay || null,
        downloadUrlSeason2: parsed.data.downloadUrlSeason2 || null,
        downloadUrlVip: parsed.data.downloadUrlVip || null,
        downloadUrlAltVip: parsed.data.downloadUrlAltVip || null,
        downloadUrlJoyplayVip: parsed.data.downloadUrlJoyplayVip || null,
        downloadUrlSeason2Vip: parsed.data.downloadUrlSeason2Vip || null,
        mature: tags.includes("18+") || parsed.data.genres.includes("Adult") || parsed.data.genres.includes("Adult VN"),
        featured: true,
        hero: !hasExistingGames,
        coverImage,
        coverZoom: parsed.data.coverZoom,
        coverPositionX: parsed.data.coverPositionX,
        coverPositionY: parsed.data.coverPositionY,
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
      select: adminGameSelect
    });

    revalidateGameShelves(game.slug);

    return NextResponse.json({
      message: `Đã đăng game "${game.title}" ${game.version} thành công.`,
      game: {
        ...serializeAdminGame(game),
        url: `/games/${game.slug}`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể lưu game lúc này.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
