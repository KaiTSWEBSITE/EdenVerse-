"use client";

import Link from "next/link";
import type { Route } from "next";
import { ExternalLink, Menu, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { primaryNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { SearchCommand } from "@/components/search/search-command";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const username = session?.user?.username;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role ?? "");
  const canOpenAdmin = isAdmin && session?.user?.adminVaultPassed === true;
  const visibleNavigation = primaryNavigation.filter((item) => item.href !== "/admin" || canOpenAdmin);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(5,7,12,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Logo className="shrink-0" />

        <nav className="hidden items-center gap-1 xl:flex">
          {visibleNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/6 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative hidden flex-1 lg:block">
          <SearchCommand />
        </div>

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
                    V?o admin
                  </Button>
                </Link>
              ) : null}
              <Link href={(username ? `/profile/${username}` : "/profile") as Route}>
                <Button variant="secondary">
                  <UserRound className="h-4 w-4" />
                  H? s?
                </Button>
              </Link>
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                Tho?t
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="default">
                <UserRound className="h-4 w-4" />
                ??ng nh?p
              </Button>
            </Link>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="M? menu EdenVerse"
              className="ml-auto rounded-lg border border-white/10 bg-white/6 p-3 text-foreground xl:hidden"
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
                {visibleNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-white/8 px-4 py-3 text-sm text-foreground transition hover:bg-white/6"
                  >
                    {item.label}
                  </Link>
                ))}
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
                  <Link
                    href={`/profile/${username}` as Route}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary"
                  >
                    H? s? c?a t?i
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-primary"
                  >
                    ??ng nh?p
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
