import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <div className="relative h-11 w-11 rounded-2xl border border-primary/25 bg-primary/10 shadow-glow">
        <div className="absolute inset-[7px] rounded-xl border border-primary/30 bg-gradient-to-br from-primary/30 via-white/10 to-transparent" />
      </div>
      <div>
        <p className="font-display text-2xl leading-none tracking-[0.18em] text-foreground">EdenVerse</p>
        <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">Premium VN Archive</p>
      </div>
    </Link>
  );
}
