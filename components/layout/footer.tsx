import Link from "next/link";
import { footerNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="border-t border-white/6 bg-black/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_repeat(2,minmax(0,1fr))] lg:px-8">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-md text-sm leading-7 text-muted-foreground">{siteConfig.description}</p>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Curated for premium visual novel discovery.</p>
        </div>
        {footerNavigation.map((group) => (
          <div key={group.title}>
            <p className="mb-4 font-display text-xl text-foreground">{group.title}</p>
            <div className="space-y-3">
              {group.links.map((link) => (
                <Link key={link.href} href={link.href} className="block text-sm text-muted-foreground transition hover:text-foreground">
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
