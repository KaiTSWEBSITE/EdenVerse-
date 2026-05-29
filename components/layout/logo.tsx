import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label="EdenVerse về trang chủ">
      <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-accent/45 bg-black/45 shadow-[0_0_24px_rgba(54,197,255,0.18)] transition duration-300 group-hover:border-primary/55 group-hover:shadow-[0_0_34px_rgba(54,197,255,0.28)]">
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_28%,rgba(112,232,255,0.26),transparent_36%)] opacity-70" />
        <div className="pointer-events-none absolute -inset-y-8 -left-8 z-20 w-5 rotate-12 bg-white/28 blur-md transition duration-700 group-hover:translate-x-24" />
        <Image src="/logos/edenverse-mark.svg" alt="EdenVerse logo" fill sizes="48px" className="object-cover" priority />
      </div>
      <div>
        <p className="font-display text-2xl leading-none text-foreground transition group-hover:text-primary">EdenVerse</p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">VN Vault</p>
      </div>
    </Link>
  );
}
