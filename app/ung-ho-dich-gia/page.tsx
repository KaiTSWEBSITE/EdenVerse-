import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Gift, HeartHandshake, Landmark, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopySupportNote } from "@/components/support/copy-support-note";
import { siteConfig } from "@/config/site";
import { getTranslatorSupportSettings } from "@/services/support-settings-service";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ủng hộ dịch giả",
  description: "Ủng hộ dịch giả và đội ngũ giữ link, cập nhật bản dịch, sửa lỗi Việt hóa cho EdenVerse.",
  openGraph: {
    title: "Ủng hộ dịch giả | EdenVerse",
    description: "Một góc riêng để cảm ơn và ủng hộ dịch giả EdenVerse.",
    url: `${siteConfig.url}/ung-ho-dich-gia`,
    images: [{ url: "/backgrounds/eden-cathedral.png", width: 2048, height: 819 }]
  }
};

export default async function TranslatorSupportPage() {
  const supportSettings = await getTranslatorSupportSettings();
  const hasBankInfo = Boolean(
    supportSettings.bankName || supportSettings.bankAccount || supportSettings.bankOwner || supportSettings.bankQrUrl
  );
  const supportMethods = [
    supportSettings.momoUrl ? { label: "Ủng hộ qua MoMo", href: supportSettings.momoUrl } : null,
    supportSettings.paypalUrl ? { label: "Ủng hộ qua PayPal", href: supportSettings.paypalUrl } : null,
    supportSettings.koFiUrl ? { label: "Ủng hộ qua Ko-fi", href: supportSettings.koFiUrl } : null
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  return (
    <section className="relative overflow-hidden px-4 py-14 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/14 blur-3xl" />
      <div className="mx-auto max-w-7xl space-y-8">
        <Card className="overflow-hidden">
          <CardContent className="relative grid gap-8 p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="border-primary/30 bg-primary/10 text-primary">Dịch giả</Badge>
                <Badge className="border-accent/30 bg-accent/10 text-accent">Ủng hộ tự nguyện</Badge>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-primary">EdenVerse Support</p>
                <h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight text-foreground sm:text-7xl">
                  Ủng hộ dịch giả
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">{supportSettings.intro}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Thao tác nhanh</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href={siteConfig.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "default", size: "lg" }))}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Nhắn Discord
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <CopySupportNote value={supportSettings.donationNote} />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-[radial-gradient(circle_at_top,rgba(71,197,255,0.12),rgba(0,0,0,0.24)_48%,rgba(0,0,0,0.35))] p-6 shadow-[0_0_50px_rgba(71,197,255,0.08)]">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-primary/25 bg-primary/10 p-3 text-primary">
                  <HeartHandshake className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Dịch giả phụ trách</p>
                  <h2 className="mt-2 font-display text-4xl text-foreground">{supportSettings.translatorName}</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {supportSettings.thankYouMessage}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardContent className="space-y-5 p-7">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-accent" />
                <h2 className="font-display text-3xl text-foreground">Thông tin ủng hộ</h2>
              </div>

              {hasBankInfo ? (
                <div className="grid gap-5 md:grid-cols-[220px_1fr] lg:grid-cols-1 xl:grid-cols-[220px_1fr]">
                  <div className="rounded-3xl border border-white/10 bg-white p-3">
                    {supportSettings.bankQrUrl ? (
                      <Image
                        src={supportSettings.bankQrUrl}
                        alt="QR ủng hộ dịch giả"
                        width={420}
                        height={420}
                        className="aspect-square w-full rounded-2xl object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-2xl bg-black/90 p-6 text-center text-sm leading-7 text-muted-foreground">
                        QR sẽ hiện ở đây khi admin dán link ảnh.
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 rounded-3xl border border-white/8 bg-black/22 p-5 text-sm">
                    <SupportRow label="Ngân hàng" value={supportSettings.bankName} />
                    <SupportRow label="Số tài khoản" value={supportSettings.bankAccount} />
                    <SupportRow label="Chủ tài khoản" value={supportSettings.bankOwner} />
                    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nội dung chuyển khoản</p>
                      <p className="mt-2 break-words font-semibold text-primary">{supportSettings.donationNote}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-accent/20 bg-accent/8 p-5">
                  <p className="font-semibold text-foreground">Thông tin ủng hộ đang được cập nhật.</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Admin có thể vào khu quản trị để dán ảnh QR, nhập tên ngân hàng, số tài khoản và tên chủ tài khoản.
                  </p>
                </div>
              )}

              {supportMethods.length ? (
                <div className="flex flex-wrap gap-3">
                  {supportMethods.map((method) => (
                    <a
                      key={method.href}
                      href={method.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "secondary" }))}
                    >
                      {method.label}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-5 p-7">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-3xl text-foreground">Lời cảm ơn</h2>
                </div>
                <p className="whitespace-pre-line text-base leading-8 text-muted-foreground">
                  {supportSettings.thankYouMessage}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: "Giữ link sạch",
                  body: "Có thêm thời gian kiểm tra link lỗi, mirror hỏng và phản hồi báo cáo game."
                },
                {
                  icon: Landmark,
                  title: "Cập nhật đều hơn",
                  body: "Các bản Việt hóa có thêm động lực để theo phiên bản mới và sửa lỗi kỹ hơn."
                }
              ].map(({ icon: Icon, title, body }) => (
                <Card key={title}>
                  <CardContent className="space-y-3 p-5">
                    <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/8 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground">{title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SupportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value || "Chưa nhập"}</span>
    </div>
  );
}
