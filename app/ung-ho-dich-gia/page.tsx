import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Gift, HeartHandshake, Landmark, MessageCircle, ShieldCheck, Sparkles, ArrowDownToLine } from "lucide-react";
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
    <div className="relative mt-[-76px] pb-20">
      {/* Cinematic Header */}
      <section className="relative w-full min-h-[60vh] max-h-[800px] flex items-end">
        <div className="absolute inset-0 z-0">
          <Image
            src="/backgrounds/eden-cathedral.png"
            alt="Support Background"
            fill
            className="object-cover opacity-30 object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full bg-accent/10 blur-[150px] mix-blend-screen opacity-50 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm shadow-[0_0_15px_rgba(87,188,255,0.2)]">
                <HeartHandshake className="h-3.5 w-3.5" />
                <span>Dịch giả tự do</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent backdrop-blur-sm shadow-[0_0_15px_rgba(255,105,180,0.2)]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ủng hộ tự nguyện</span>
              </div>
            </div>
            
            <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-7xl drop-shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-700">
              Chung tay cùng <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Dịch Giả EdenVerse</span>
            </h1>
            
            <p className="text-lg leading-relaxed text-white/80 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {supportSettings.intro}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 space-y-12">
        
        {/* Support Note & Contact */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          
          <div className="glass-panel p-8 sm:p-10 rounded-[32px] border border-white/10 flex flex-col justify-center relative overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="absolute -right-20 -top-20 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
              <Gift className="h-96 w-96" />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-[0_0_34px_rgba(87,188,255,0.2)]">
                <Gift className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Gửi lời cảm ơn</p>
                <h2 className="font-display text-3xl font-bold text-white">Cách thức ủng hộ</h2>
              </div>
            </div>

            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 backdrop-blur-md mb-8">
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3 font-semibold">Lời nhắn khuyên dùng</p>
              <CopySupportNote value={supportSettings.donationNote} />
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-white/80">Hoặc liên hệ trực tiếp qua Discord:</p>
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-6 text-sm font-semibold text-white transition-all hover:bg-[#4752C4] shadow-[0_0_20px_rgba(88,101,242,0.3)]"
              >
                <MessageCircle className="h-5 w-5" />
                Nhắn tin qua Discord
                <ExternalLink className="h-4 w-4 opacity-70" />
              </a>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[32px] border border-accent/20 bg-accent/5 backdrop-blur-2xl shadow-[0_8px_40px_rgba(255,105,180,0.1)] flex flex-col">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.22em] text-accent font-semibold mb-2 drop-shadow-md">Dịch giả phụ trách</p>
              <h3 className="font-display text-4xl font-bold text-white mb-6">{supportSettings.translatorName}</h3>
              
              <div className="relative">
                <span className="absolute -left-3 -top-3 text-4xl text-accent/20 font-serif">"</span>
                <p className="whitespace-pre-line text-base leading-loose text-white/80 italic relative z-10 pl-2 border-l-2 border-accent/30">
                  {supportSettings.thankYouMessage}
                </p>
                <span className="absolute -right-3 -bottom-3 text-4xl text-accent/20 font-serif">"</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Banking Details */}
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="glass-panel p-8 rounded-[32px] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="font-display text-2xl font-bold text-white">Cổng khác</h2>
              </div>
              <div className="space-y-4">
                {supportMethods.length ? (
                  supportMethods.map((method) => (
                    <a
                      key={method.label}
                      href={method.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 font-semibold text-white transition hover:border-primary/50 hover:bg-primary/10"
                    >
                      {method.label}
                      <ExternalLink className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                    </a>
                  ))
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">Hiện chưa có cổng phụ trợ nào.</p>
                )}
              </div>
            </div>
            
            <div className="mt-8 rounded-xl bg-black/40 p-5 border border-white/5 flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Tất cả các khoản ủng hộ đều đi trực tiếp đến tài khoản của người dịch. EdenVerse không thu bất kỳ khoản phí trung gian nào.
              </p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-[32px] border border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <Landmark className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-white">Chuyển khoản Ngân hàng</h2>
            </div>

            {hasBankInfo ? (
              <div className="grid gap-8 md:grid-cols-[240px_1fr] items-center">
                {supportSettings.bankQrUrl ? (
                  <div className="mx-auto shrink-0 w-full max-w-[240px]">
                    <div className="relative aspect-square overflow-hidden rounded-3xl bg-white p-4 shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/20">
                      <Image
                        src={supportSettings.bankQrUrl}
                        alt="QR Code Ngân hàng"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>
                    <p className="mt-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-2">
                      <ArrowDownToLine className="h-3 w-3" /> Quét mã để chuyển
                    </p>
                  </div>
                ) : (
                  <div className="flex aspect-square max-w-[240px] items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-white/5 mx-auto w-full text-sm text-muted-foreground">
                    Chưa cập nhật QR
                  </div>
                )}

                <div className="space-y-4">
                  <InfoRow label="Ngân hàng" value={supportSettings.bankName || "Chưa cập nhật"} />
                  <InfoRow label="Chủ tài khoản" value={supportSettings.bankOwner || "Chưa cập nhật"} />
                  <InfoRow label="Số tài khoản" value={supportSettings.bankAccount || "Chưa cập nhật"} highlight />
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">Hiện chưa có thông tin ngân hàng.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/40 p-4 backdrop-blur-sm transition-colors hover:bg-white/5">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1.5">{label}</p>
      <p className={cn("font-display text-2xl", highlight ? "font-bold text-primary" : "font-medium text-white")}>
        {value}
      </p>
    </div>
  );
}
