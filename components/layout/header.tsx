"use client";

import Link from "next/link";
import type { Route } from "next";
import { ExternalLink, Menu, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { primaryNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { SearchCommand } from "@/components/search/search-command";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function Header() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const username = session?.user?.username;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role ?? "");
  const canOpenAdmin = isAdmin;
  const visibleNavigation = primaryNavigation.filter((item) => item.href !== "/admin" || canOpenAdmin);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function isActiveLink(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function logout() {
    setOpen(false);
    window.location.assign("/api/auth/logout?callbackUrl=/");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300 border-b",
        isScrolled
          ? "bg-[rgba(7,11,20,0.85)] backdrop-blur-xl border-white/5 shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Logo className="shrink-0" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 xl:flex">
          {visibleNavigation.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-white/6",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0.5 h-px rounded-full bg-gradient-to-r from-primary/80 via-primary to-accent/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search bar */}
        <div className="relative hidden flex-1 lg:block">
          <SearchCommand />
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <a href={siteConfig.discordUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="hidden xl:inline-flex">
              <MessageCircle className="h-4 w-4" />
              Discord
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
          {status === "authenticated" ? (
            <>
              {canOpenAdmin ? (
                <Link href="/admin">
                  <Button variant="accent">
                    <ShieldCheck className="h-4 w-4" />
                    Vào admin
                  </Button>
                </Link>
              ) : null}
              <Link href={(username ? `/profile/${username}` : "/profile") as Route}>
                <Button variant="secondary">
                  <UserRound className="h-4 w-4" />
                  Hồ sơ
                </Button>
              </Link>
              <Button variant="ghost" onClick={logout}>
                Thoát
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="default">
                <UserRound className="h-4 w-4" />
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Mở menu EdenVerse"
              className="ml-auto rounded-lg border border-white/10 bg-white/6 p-3 text-foreground transition hover:bg-white/10 xl:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="p-0">
            <div className="space-y-6 p-6">
              <Logo />
              <div className="relative">
                <SearchCommand />
              </div>
              <div className="space-y-2">
                {visibleNavigation.map((item) => {
                  const active = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href as Route}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-lg border px-4 py-3 text-sm transition",
                        active
                          ? "border-primary/28 bg-primary/8 text-primary"
                          : "border-white/8 text-foreground hover:bg-white/6"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <a
                  href={siteConfig.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg border border-[#5865F2]/30 bg-[#5865F2]/12 px-4 py-3 text-sm text-foreground transition hover:bg-[#5865F2]/18"
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Discord server
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                {status === "authenticated" && username ? (
                  <>
                    <Link
                      href={`/profile/${username}` as Route}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary"
                    >
                      Hồ sơ của tôi
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="block w-full rounded-lg border border-white/8 px-4 py-3 text-left text-sm text-muted-foreground transition hover:bg-white/6 hover:text-foreground"
                    >
                      Thoát
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
