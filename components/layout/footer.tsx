import Link from "next/link";
import type { Route } from "next";
import { ExternalLink, MessageCircle } from "lucide-react";
import { footerNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="relative mt-8">
      {/* Ambient glow blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="nebula-blob absolute animate-glow-breathe"
          style={{
            width: 320,
            height: 220,
            left: "70%",
            top: "10%",
            background: "rgba(229,57,53,0.06)",
            filter: "blur(80px)"
          }}
        />
        <div
          className="nebula-blob absolute animate-glow-breathe"
          style={{
            width: 260,
            height: 180,
            left: "4%",
            top: "50%",
            background: "rgba(189,189,189,0.04)",
            filter: "blur(70px)",
            animationDelay: "2s"
          }}
        />
        {/* Top gradient fade */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/18 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 bg-black/38 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_repeat(2,minmax(0,1fr))] lg:px-8">
        {/* Brand column */}
        <div className="space-y-5">
          <Logo />
          <p className="max-w-md text-sm leading-7 text-muted-foreground">{siteConfig.description}</p>

          {/* Discord button with shimmer */}
          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-[#5865F2]/32 bg-[#5865F2]/12 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-[#5865F2]/48 hover:bg-[#5865F2]/18"
          >
            {/* Shimmer sweep */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="card-shimmer-inner" />
            </div>
            <MessageCircle className="h-4 w-4 text-primary" />
            Vào Discord server
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>

          {/* Copyright info */}
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p className="uppercase tracking-[0.18em]">
              Thuộc sở hữu và vận hành bởi {siteConfig.owner}
            </p>
            <p>{siteConfig.copyright}</p>
            <p>
              Nội dung game, tên thương hiệu và hình ảnh minh họa thuộc về chủ sở hữu tương ứng.
              EdenVerse là trang tổng hợp, giới thiệu và đánh giá.
            </p>
          </div>
        </div>

        {/* Nav groups */}
        {footerNavigation.map((group) => (
          <div key={group.title}>
            <p className="mb-4 font-display text-xl text-foreground">{group.title}</p>
            <div className="mb-4" />
            <div className="space-y-3">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as Route}
                  className="block text-sm text-muted-foreground transition duration-200 hover:translate-x-0.5 hover:text-foreground"
                >
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
