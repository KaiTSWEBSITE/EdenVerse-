import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { verifyCaptcha } from "@/lib/captcha";
import { applyRateLimit } from "@/middleware/rate-limit";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

function validateImages(files: File[]) {
  for (const file of files) {
    if (!file.size) {
      continue;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return "Ảnh upload phải nhỏ hơn 5MB.";
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return "Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF.";
    }
  }

  return null;
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
  const captcha = await verifyCaptcha(
    {
      captchaAnswer: getText(formData, "captchaAnswer"),
      captchaToken: getText(formData, "captchaToken")
    },
    request
  );

  if (!captcha.ok) {
    return NextResponse.json({ message: captcha.message }, { status: 403 });
  }

  const files = ["cover", "background", "gallery"].flatMap((key) =>
    formData.getAll(key).filter((value): value is File => value instanceof File)
  );
  const imageError = validateImages(files);
  if (imageError) {
    return NextResponse.json({ message: imageError }, { status: 400 });
  }

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

  return NextResponse.json({
    message: `Đã nhận bản nháp "${parsed.data.title}" ${parsed.data.version}. Có thể nối Prisma để lưu production.`,
    game: parsed.data,
    mediaCount: files.filter((file) => file.size > 0).length
  });
}
