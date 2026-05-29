import Link from "next/link";
import type { Route } from "next";
import { ExternalLink, MessageCircle } from "lucide-react";
import { footerNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-black/42">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_repeat(2,minmax(0,1fr))] lg:px-8">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-md text-sm leading-7 text-muted-foreground">{siteConfig.description}</p>
          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#5865F2]/30 bg-[#5865F2]/12 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-[#5865F2]/18"
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            Vào Discord server
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="uppercase tracking-[0.18em]">Thuộc sở hữu và vận hành bởi {siteConfig.owner}</p>
            <p>{siteConfig.copyright}</p>
            <p>
              Nội dung game, tên thương hiệu và hình ảnh minh họa thuộc về chủ sở hữu tương ứng. EdenVerse là trang tổng hợp,
              giới thiệu và đánh giá.
            </p>
          </div>
        </div>
        {footerNavigation.map((group) => (
          <div key={group.title}>
            <p className="mb-4 font-display text-xl text-foreground">{group.title}</p>
            <div className="space-y-3">
              {group.links.map((link) => (
                <Link key={link.href} href={link.href as Route} className="block text-sm text-muted-foreground transition hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
