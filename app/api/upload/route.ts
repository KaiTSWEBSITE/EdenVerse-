import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { applyRateLimit } from "@/middleware/rate-limit";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `upload:${forwardedFor || request.headers.get("x-real-ip") || "local"}`;
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

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_LOCAL_UPLOADS !== "true") {
    return NextResponse.json(
      { message: "Upload local đang tắt trên production. Hãy dùng link ảnh HTTPS ngoài để giảm rủi ro bảo mật." },
      { status: 403 }
    );
  }

  const session = await auth();
  const role = session?.user?.role ?? "USER";
  if (!["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role)) {
    return NextResponse.json({ message: "Bạn không có quyền upload tệp." }, { status: 403 });
  }

  const limited = applyRateLimit(getClientKey(request), {
    max: 8,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json(
      { message: "Bạn upload quá nhanh, vui lòng thử lại sau.", retryAfter: limited.retryAfter },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter ?? 60) } }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Không nhận được tệp upload." }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ message: "Tệp phải nhỏ hơn 5MB và không được rỗng." }, { status: 413 });
  }

  const safeExtension = ALLOWED_IMAGE_TYPES.get(file.type);
  if (!safeExtension) {
    return NextResponse.json({ message: "Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF." }, { status: 415 });
  }

  const originalExtension = path.extname(file.name).toLowerCase();
  if (originalExtension && originalExtension !== ".jpeg" && originalExtension !== safeExtension) {
    return NextResponse.json({ message: "Phần mở rộng tệp không khớp với loại ảnh." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "public/uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasTrustedImageSignature(buffer, file.type)) {
    return NextResponse.json({ message: "Tệp không vượt qua kiểm tra chữ ký ảnh." }, { status: 400 });
  }

  const baseName = path
    .basename(file.name, originalExtension || safeExtension)
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48)
    .replace(/^-|-$/g, "");
  const safeName = `${Date.now()}-${randomUUID()}-${baseName || "edenverse-image"}${safeExtension}`;

  await writeFile(path.join(uploadDir, safeName), buffer);

  return NextResponse.json({
    message: "Đã lưu ảnh upload thành công.",
    url: `/${path.posix.join((process.env.UPLOAD_DIR ?? "public/uploads").replace(/^public\//, ""), safeName)}`,
    extension: safeExtension,
    size: file.size
  });
}
