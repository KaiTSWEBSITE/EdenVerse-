export const translatorSupportConfig = {
  title: "Ủng hộ dịch giả",
  translatorName: process.env.NEXT_PUBLIC_TRANSLATOR_NAME ?? "Kaii Translation",
  intro:
    process.env.NEXT_PUBLIC_TRANSLATOR_SUPPORT_INTRO ??
    "Nếu bản dịch giúp bạn có trải nghiệm tốt hơn, một lời cảm ơn hoặc một khoản ủng hộ nhỏ sẽ giúp dịch giả có thêm động lực giữ link, cập nhật bản mới và chỉnh lỗi Việt hóa.",
  donationNote:
    process.env.NEXT_PUBLIC_TRANSLATOR_DONATION_NOTE ??
    "Ủng hộ dịch giả EdenVerse - cảm ơn bạn",
  bankName: process.env.NEXT_PUBLIC_SUPPORT_BANK_NAME ?? "",
  bankAccount: process.env.NEXT_PUBLIC_SUPPORT_BANK_ACCOUNT ?? "",
  bankOwner: process.env.NEXT_PUBLIC_SUPPORT_BANK_OWNER ?? "",
  bankQrUrl: process.env.NEXT_PUBLIC_SUPPORT_BANK_QR_URL ?? "",
  momoUrl: process.env.NEXT_PUBLIC_SUPPORT_MOMO_URL ?? "",
  paypalUrl: process.env.NEXT_PUBLIC_SUPPORT_PAYPAL_URL ?? "",
  koFiUrl: process.env.NEXT_PUBLIC_SUPPORT_KOFI_URL ?? ""
} as const;
