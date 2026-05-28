"use client";

import Link from "next/link";
import { Menu, UserRound } from "lucide-react";
import { useState } from "react";
import { primaryNavigation } from "@/config/navigation";
import { Logo } from "@/components/layout/logo";
import { SearchCommand } from "@/components/search/search-command";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(5,7,12,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Logo className="shrink-0" />

        <nav className="hidden items-center gap-1 xl:flex">
          {primaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
          <Link href="/auth/login">
            <Button variant="default">
              <UserRound className="h-4 w-4" />
              Đăng nhập
            </Button>
          </Link>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild className="lg:hidden">
            <button className="ml-auto rounded-lg border border-white/10 bg-white/6 p-3 text-foreground">
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
                {primaryNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-white/8 px-4 py-3 text-sm text-foreground transition hover:bg-white/6"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
