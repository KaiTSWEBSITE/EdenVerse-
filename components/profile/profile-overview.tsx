"use client";

import Link from "next/link";
import { Bookmark, Clock3, Heart, ImagePlus, Save, ShieldCheck, Trophy, UserPen, X } from "lucide-react";
import { useSession } from "next-auth/react";
import type { ComponentType, FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Game, UserProfile } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormState = {
  name: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  allowMatureContent: boolean;
};

function toProfileFormState(user: UserProfile): ProfileFormState {
  return {
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatar.startsWith("/") ? "" : user.avatar,
    bannerUrl: user.banner.startsWith("/") ? "" : user.banner,
    allowMatureContent: user.allowMatureContent
  };
}

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
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(() => toProfileFormState(user));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const isOwnProfile = session?.user?.username === profile.username;

  useEffect(() => {
    setProfile(user);
    setForm(toProfileFormState(user));
  }, [user]);

  function updateForm<K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  }

  function cancelEdit() {
    setForm(toProfileFormState(profile));
    setEditing(false);
    setMessage("");
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("Đang lưu hồ sơ...");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      setMessage(data.message ?? "Đã gửi yêu cầu cập nhật hồ sơ.");

      if (response.ok && data.user) {
        setProfile(data.user);
        setForm(toProfileFormState(data.user));
        setEditing(false);
        await update?.({
          name: data.user.name,
          image: data.user.avatar
        });
      }
    } catch {
      setMessage("Không thể lưu hồ sơ lúc này. Hãy kiểm tra link ảnh và thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${profile.banner})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          {isOwnProfile ? (
            <div className="absolute right-4 top-4 z-10">
              <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(true)}>
                <UserPen className="h-4 w-4" />
                Chỉnh sửa hồ sơ
              </Button>
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end gap-5 p-6">
            <Avatar src={profile.avatar} fallback={profile.name.slice(0, 2)} className="h-24 w-24 ring-4 ring-black/40" />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-primary">{profile.role}</p>
              <h1 className="font-display text-5xl text-white">{profile.name}</h1>
              <p className="text-sm text-white/80">
                @{profile.username} • Level {profile.level} • {profile.reputation} danh tiếng
              </p>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <p className="text-sm leading-7 text-muted-foreground">{profile.bio}</p>
          <Card className="bg-black/18">
            <CardContent className="space-y-4 p-4">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
                <ShieldCheck className="h-4 w-4" />
                Hồ sơ cộng đồng
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <ProfileStat label="Level" value={String(profile.level)} />
                <ProfileStat label="Danh tiếng" value={String(profile.reputation)} />
                <ProfileStat label="Đã lưu" value={String(saved.length)} />
                <ProfileStat label="Theo dõi" value={String(watchlist.length)} />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {isOwnProfile && editing ? (
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-primary">Hồ sơ cá nhân</p>
                <h2 className="mt-2 font-display text-3xl text-foreground">Đổi avatar và hình nền</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Dán link ảnh HTTPS. EdenVerse chỉ lưu đường dẫn ảnh, không upload file lên máy chủ.
                </p>
              </div>
              <Button type="button" variant="ghost" onClick={cancelEdit}>
                <X className="h-4 w-4" />
                Hủy
              </Button>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="Tên hiển thị"
                  required
                />
                <label className="flex h-12 items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.allowMatureContent}
                    onChange={(event) => updateForm("allowMatureContent", event.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Hiện nội dung 18+ cho tài khoản này
                </label>
              </div>
              <Textarea
                value={form.bio}
                onChange={(event) => updateForm("bio", event.target.value)}
                maxLength={360}
                placeholder="Giới thiệu ngắn về bạn..."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={form.avatarUrl}
                  onChange={(event) => updateForm("avatarUrl", event.target.value)}
                  type="url"
                  placeholder="Link avatar HTTPS"
                />
                <Input
                  value={form.bannerUrl}
                  onChange={(event) => updateForm("bannerUrl", event.target.value)}
                  type="url"
                  placeholder="Link hình nền/banner HTTPS"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <ImagePlus className="h-4 w-4 text-primary" />
                  Avatar và hình nền sẽ hiện trên hồ sơ công khai.
                </div>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? "Đang lưu..." : "Lưu hồ sơ"}
                </Button>
              </div>
              {message ? <p className="text-sm text-primary">{message}</p> : null}
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <MiniShelf icon={Heart} title="Game yêu thích" items={favorites} />
        <MiniShelf icon={Bookmark} title="Game đã lưu" items={saved} />
        <MiniShelf icon={Clock3} title="Vừa xem gần đây" items={recent} />
        <MiniShelf icon={Clock3} title="Danh sách theo dõi" items={watchlist} />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Danh tiếng</p>
            <h2 className="mt-2 font-display text-3xl text-foreground">Uy tín trong cộng đồng</h2>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-accent/20 bg-accent/10 px-5 py-3 text-accent">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">{profile.reputation} điểm</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl text-foreground">{value}</p>
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
          {items.length ? (
            items.map((game) => (
              <Link key={game.slug} href={`/games/${game.slug}`} className="block rounded-[20px] border border-white/8 bg-black/18 p-4 transition hover:bg-white/6">
                <p className="font-semibold text-foreground">{game.title}</p>
                <p className="text-sm text-muted-foreground">{game.developer}</p>
              </Link>
            ))
          ) : (
            <div className="rounded-[20px] border border-white/8 bg-black/18 p-4 text-sm text-muted-foreground">
              Chưa có game nào trong mục này.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
