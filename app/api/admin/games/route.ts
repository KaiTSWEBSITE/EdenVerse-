import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/database/prisma";
import { applyRateLimit } from "@/middleware/rate-limit";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 6;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
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
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(220).optional(),
  genres: z.array(z.string()).min(1, "Chọn ít nhất một thể loại."),
  tags: z.array(z.string()).optional()
});

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `admin-game:${forwardedFor || request.headers.get("x-real-ip") || "local"}`;
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is File => value instanceof File && value.size > 0);
}

function toList(value: string | undefined, fallback: string[]) {
  const entries = (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries.length ? entries : fallback;
}

function hasTrustedImageSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimeType === "image/webp") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }

  if (mimeType === "image/gif") {
    const header = buffer.subarray(0, 6).toString("ascii");
    return header === "GIF87a" || header === "GIF89a";
  }

  return false;
}

async function imageFileToDataUrl(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ảnh upload phải nhỏ hơn 5MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasTrustedImageSignature(buffer, file.type)) {
    throw new Error("Ảnh upload không vượt qua kiểm tra chữ ký file.");
  }

  return `data:${file.type};base64,${buffer.toString("base64")}`;
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

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";
  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
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
    const [coverFile] = getFiles(formData, "cover");
    const [backgroundFile] = getFiles(formData, "background");
    const galleryFiles = getFiles(formData, "gallery").slice(0, MAX_GALLERY_IMAGES);
    const coverImage = coverFile ? await imageFileToDataUrl(coverFile) : DEFAULT_COVER_IMAGE;
    const bannerImage = backgroundFile ? await imageFileToDataUrl(backgroundFile) : DEFAULT_BANNER_IMAGE;
    const uploadedGallery = (await Promise.all(galleryFiles.map((file) => imageFileToDataUrl(file)))).filter(Boolean);
    const gallery = uploadedGallery.length ? uploadedGallery : [bannerImage];
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

    return NextResponse.json({
      message: `Đã đăng game "${game.title}" ${game.version} thành công.`,
      game
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể lưu game lúc này.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
