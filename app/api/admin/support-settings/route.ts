import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { applyRateLimit } from "@/middleware/rate-limit";
import { setTranslatorSupportSettings } from "@/services/support-settings-service";

export const runtime = "nodejs";

const optionalUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => !value || /^https:\/\//i.test(value), "Link cần bắt đầu bằng https://")
  .optional()
  .or(z.literal(""));

const supportSettingsSchema = z.object({
  translatorName: z.string().trim().min(2, "Tên dịch giả quá ngắn.").max(80, "Tên dịch giả quá dài."),
  intro: z.string().trim().min(20, "Câu giới thiệu quá ngắn.").max(520, "Câu giới thiệu quá dài."),
  donationNote: z.string().trim().min(4, "Nội dung chuyển khoản quá ngắn.").max(160, "Nội dung chuyển khoản quá dài."),
  bankName: z.string().trim().max(80, "Tên ngân hàng quá dài.").optional().or(z.literal("")),
  bankAccount: z.string().trim().max(80, "Số tài khoản quá dài.").optional().or(z.literal("")),
  bankOwner: z.string().trim().max(120, "Tên chủ tài khoản quá dài.").optional().or(z.literal("")),
  bankQrUrl: optionalUrlSchema,
  thankYouMessage: z.string().trim().min(20, "Lời cảm ơn quá ngắn.").max(700, "Lời cảm ơn quá dài."),
  momoUrl: optionalUrlSchema,
  paypalUrl: optionalUrlSchema,
  koFiUrl: optionalUrlSchema
});

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `admin-support-settings:${forwardedFor || request.headers.get("x-real-ip") || "local"}`;
}

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role ?? "USER";

  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.json({ message: "Bạn không có quyền chỉnh thông tin ủng hộ." }, { status: 403 });
  }

  const limited = applyRateLimit(getClientKey(request), {
    max: 8,
    windowMs: 10 * 60_000
  });

  if (!limited.success) {
    return NextResponse.json({ message: "Bạn lưu cấu hình quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const parsed = supportSettingsSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Thông tin ủng hộ chưa hợp lệ.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const supportSettings = {
    translatorName: parsed.data.translatorName,
    intro: parsed.data.intro,
    donationNote: parsed.data.donationNote,
    bankName: parsed.data.bankName ?? "",
    bankAccount: parsed.data.bankAccount ?? "",
    bankOwner: parsed.data.bankOwner ?? "",
    bankQrUrl: parsed.data.bankQrUrl ?? "",
    thankYouMessage: parsed.data.thankYouMessage,
    momoUrl: parsed.data.momoUrl ?? "",
    paypalUrl: parsed.data.paypalUrl ?? "",
    koFiUrl: parsed.data.koFiUrl ?? ""
  };

  await setTranslatorSupportSettings(supportSettings);
  revalidatePath("/ung-ho-dich-gia");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({
    supportSettings,
    message: "Đã cập nhật trang ủng hộ dịch giả."
  });
}
