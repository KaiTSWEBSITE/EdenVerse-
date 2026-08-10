"use client";

import Link from "next/link";
import { Bookmark, Clock3, Heart, ImagePlus, Save, ShieldCheck, Trophy, UserPen, X, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import type { ComponentType, FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Game, UserProfile } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GameCarousel } from "@/components/game/game-carousel";
import { SectionHeading } from "@/components/ui/section-heading";

type ProfileFormState = {
  name: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  allowMatureContent: boolean;
};

const reputationGuide = [
  { label: "Lưu game mới", points: "+5" },
  { label: "Đánh sao game", points: "+4" },
  { label: "Báo lỗi game", points: "+8" },
  { label: "Tải game", points: "+2" }
];

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
    <div className="space-y-16 mt-[-56px] pb-20">
      {/* Cinematic Header */}
      <section className="relative w-full h-[50vh] sm:h-[60vh] max-h-[600px] min-h-[400px]">
        {/* Banner Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.banner || '/images/default-banner.jpg'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] via-[#0a0f18]/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(10,15,24,0.6)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 flex flex-col md:flex-row md:items-end gap-8">
          {/* Avatar with Glow */}
          <div className="relative group shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
            <Avatar 
              src={profile.avatar} 
              fallback={profile.name.slice(0, 2)} 
              className="relative h-32 w-32 sm:h-40 sm:w-40 ring-4 ring-[#0a0f18] shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-black" 
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                  {profile.role}
                </p>
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-bold tracking-tight drop-shadow-lg">
                  {profile.name}
                </h1>
                <p className="text-lg text-white/80 font-medium flex items-center gap-2">
                  @{profile.username}
                </p>
              </div>

              {isOwnProfile && !editing && (
                <Button 
                  type="button" 
                  onClick={() => setEditing(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all"
                >
                  <UserPen className="h-4 w-4 mr-2" />
                  Chỉnh sửa hồ sơ
                </Button>
              )}
            </div>
            <p className="text-sm md:text-base text-white/70 max-w-2xl leading-relaxed">
              {profile.bio || "Người dùng này chưa cập nhật tiểu sử."}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Editor Form */}
        {isOwnProfile && editing && (
          <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-primary/20 shadow-[0_8px_32px_rgba(87,188,255,0.1)] bg-[#0a0f18]/80 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-white/10 pb-6">
              <div>
                <h2 className="font-display text-3xl text-foreground font-bold flex items-center gap-3">
                  <Settings className="h-7 w-7 text-primary" />
                  Thiết lập hồ sơ
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cá nhân hóa góc nhỏ của bạn trong EdenVerse. Sử dụng link ảnh HTTPS cho Avatar và Banner.
                </p>
              </div>
              <Button type="button" variant="ghost" onClick={cancelEdit} className="rounded-full hover:bg-white/10">
                <X className="h-4 w-4 mr-2" />
                Hủy bỏ
              </Button>
            </div>

            <form onSubmit={saveProfile} className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground ml-1">Tên hiển thị</label>
                    <Input
                      value={form.name}
                      onChange={(event) => updateForm("name", event.target.value)}
                      placeholder="Nhập tên hiển thị..."
                      required
                      className="bg-black/40 border-white/10 focus-visible:ring-primary rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground ml-1">Tiểu sử</label>
                    <Textarea
                      value={form.bio}
                      onChange={(event) => updateForm("bio", event.target.value)}
                      maxLength={360}
                      placeholder="Vài dòng giới thiệu ngắn về bạn..."
                      className="bg-black/40 border-white/10 focus-visible:ring-primary rounded-xl h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-1.5"><ImagePlus className="h-3 w-3 text-primary" /> Avatar URL</label>
                    <Input
                      value={form.avatarUrl}
                      onChange={(event) => updateForm("avatarUrl", event.target.value)}
                      type="url"
                      placeholder="https://..."
                      className="bg-black/40 border-white/10 focus-visible:ring-primary rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-1.5"><ImagePlus className="h-3 w-3 text-primary" /> Banner URL</label>
                    <Input
                      value={form.bannerUrl}
                      onChange={(event) => updateForm("bannerUrl", event.target.value)}
                      type="url"
                      placeholder="https://..."
                      className="bg-black/40 border-white/10 focus-visible:ring-primary rounded-xl"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-muted-foreground hover:border-white/20 transition cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={form.allowMatureContent}
                      onChange={(event) => updateForm("allowMatureContent", event.target.checked)}
                      className="h-5 w-5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                    />
                    Cho phép hiển thị nội dung 18+ (Game người lớn)
                  </label>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
                {message ? (
                  <p className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">{message}</p>
                ) : <div />}
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-[0_0_20px_rgba(87,188,255,0.3)] transition-all px-8 h-11"
                >
                  {saving ? "Đang xử lý..." : "Lưu thay đổi"}
                  {!saving && <Save className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Reputation & Stats */}
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/10 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
              <ShieldCheck className="h-96 w-96" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl text-white font-bold">Uy tín & Thành tựu</h2>
            </div>
            
            {/* Level Bar UX */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-1">Cấp độ hiện tại</p>
                  <p className="text-4xl font-display font-bold text-white">Level {profile.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary font-bold">{profile.reputation} Điểm Uy Tín</p>
                </div>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full shadow-[0_0_10px_rgba(87,188,255,0.5)] transition-all duration-1000"
                  style={{ width: `${Math.min(100, (profile.reputation % 100))}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right mt-2">
                Còn {100 - (profile.reputation % 100)} điểm nữa để lên cấp {profile.level + 1}
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-[28px] border border-white/10 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-semibold text-center">Hướng dẫn nhận điểm</p>
            <div className="space-y-2">
              {reputationGuide.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-black/30 hover:bg-black/50 transition-colors px-4 py-2.5 text-sm border border-white/5">
                  <span className="text-white/80">{item.label}</span>
                  <span className="font-bold text-primary">{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collections */}
        <div className="space-y-16">
          <section>
            <SectionHeading eyebrow="Tủ Game" title="Game yêu thích" description="Những tựa game bạn đã thả tim." />
            <div className="mt-8">
              <GameCarousel games={favorites} emptyText="Bạn chưa có game yêu thích nào. Hãy thả tim các game bạn thấy hay nhé!" />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Lưu trữ" title="Game đã lưu" description="Danh sách tải xuống hoặc lưu trữ để chơi sau." />
            <div className="mt-8">
              <GameCarousel games={saved} emptyText="Chưa có game nào được lưu vào kho của bạn." />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Lịch sử" title="Vừa xem gần đây" description="Các game bạn vừa lướt qua." />
            <div className="mt-8">
              <GameCarousel games={recent} emptyText="Lịch sử xem đang trống." />
            </div>
          </section>
          
          <section>
            <SectionHeading eyebrow="Theo dõi" title="Danh sách theo dõi" description="Game đang hóng phiên bản mới." />
            <div className="mt-8">
              <GameCarousel games={watchlist} emptyText="Danh sách theo dõi đang trống." />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
