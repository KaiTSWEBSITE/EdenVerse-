"use client";

import Link from "next/link";
import { Bookmark, Clock3, Heart, ShieldHalf, Trophy } from "lucide-react";
import type { ComponentType } from "react";
import type { Game, UserProfile } from "@/types";
import { useAppStore } from "@/context/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function ProfileOverview({
  user,
  favorites,
  saved,
  recent,
  watchlist
}: {
  user: UserProfile;
  favorites: Game[];
  saved: Game[];
  recent: Game[];
  watchlist: Game[];
}) {
  const safeMode = useAppStore((state) => state.safeMode);
  const toggleSafeMode = useAppStore((state) => state.toggleSafeMode);
  const themeVariant = useAppStore((state) => state.themeVariant);
  const setThemeVariant = useAppStore((state) => state.setThemeVariant);

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${user.banner})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end gap-5 p-6">
            <Avatar src={user.avatar} fallback={user.name.slice(0, 2)} className="h-24 w-24 ring-4 ring-black/40" />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-primary">{user.role}</p>
              <h1 className="font-display text-5xl text-white">{user.name}</h1>
              <p className="text-sm text-white/80">@{user.username} • Level {user.level} • {user.reputation} reputation</p>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <p className="text-sm leading-7 text-muted-foreground">{user.bio}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-black/18">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Safe Mode</p>
                  <p className="mt-1 text-sm text-foreground">{safeMode ? "Blur adult games until revealed" : "Adult cards visible"}</p>
                </div>
                <Switch checked={safeMode} onCheckedChange={toggleSafeMode} />
              </CardContent>
            </Card>
            <Card className="bg-black/18">
              <CardContent className="space-y-3 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Theme Variant</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setThemeVariant("cathedral")}
                    className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] ${
                      themeVariant === "cathedral" ? "bg-primary/15 text-primary" : "bg-white/6 text-muted-foreground"
                    }`}
                  >
                    Cathedral
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeVariant("midnight")}
                    className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] ${
                      themeVariant === "midnight" ? "bg-primary/15 text-primary" : "bg-white/6 text-muted-foreground"
                    }`}
                  >
                    Midnight
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <MiniShelf icon={Heart} title="Favorite games" items={favorites} />
        <MiniShelf icon={Bookmark} title="Saved games" items={saved} />
        <MiniShelf icon={Clock3} title="Recently viewed" items={recent} />
        <MiniShelf icon={ShieldHalf} title="Watchlist" items={watchlist} />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Reputation System</p>
            <h2 className="mt-2 font-display text-3xl text-foreground">Community standing</h2>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-accent/20 bg-accent/10 px-5 py-3 text-accent">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">{user.reputation} rep</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniShelf({
  icon: Icon,
  title,
  items
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  items: Game[];
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="font-display text-3xl text-foreground">{title}</h2>
        </div>
        <div className="space-y-3">
          {items.map((game) => (
            <Link key={game.slug} href={`/games/${game.slug}`} className="block rounded-[20px] border border-white/8 bg-black/18 p-4 transition hover:bg-white/6">
              <p className="font-semibold text-foreground">{game.title}</p>
              <p className="text-sm text-muted-foreground">{game.developer}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
