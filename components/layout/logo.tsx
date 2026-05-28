import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-accent/35 bg-black/40 shadow-glow">
        <Image src="/logos/edenverse-mark.svg" alt="EdenVerse logo" fill sizes="48px" className="object-cover" priority />
      </div>
      <div>
        <p className="font-display text-2xl leading-none text-foreground">EdenVerse</p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">VN Vault</p>
      </div>
    </Link>
  );
}
