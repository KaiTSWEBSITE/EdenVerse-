"use client";

import {
  BarChart3,
  FileCheck2,
  Gamepad2,
  Gauge,
  ImageUp,
  LockKeyhole,
  MessageSquareWarning,
  SearchCheck,
  ShieldBan,
  ShieldCheck,
  Tag,
  UploadCloud,
  UsersRound
} from "lucide-react";
import type { ComponentType, FormEvent } from "react";
import { useState } from "react";
import type { DashboardMetric } from "@/types";
import { ENGINES, GENRES, TAGS } from "@/constants/filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const controlItems = [
  { label: "Quản lý game", icon: Gamepad2, status: "Tạo, sửa, ẩn" },
  { label: "Upload ảnh", icon: ImageUp, status: "Cover + gallery" },
  { label: "Duyệt bình luận", icon: MessageSquareWarning, status: "3 đang chờ" },
  { label: "Khóa người dùng", icon: ShieldBan, status: "Theo role" },
  { label: "Quản lý tag", icon: Tag, status: "Tự gợi ý" },
  { label: "Quản lý SEO", icon: BarChart3, status: "Có checklist" }
];

const moderationQueue = [
  { user: "aria", reason: "Báo cáo spoiler", risk: "Trung bình" },
  { user: "guest-204", reason: "Spam link ngoài", risk: "Cao" },
  { user: "riven", reason: "Review cần duyệt 18+", risk: "Thấp" }
];

const securityChecks = [
  { label: "CSP + frame guard", value: "Đang bật", icon: ShieldCheck },
  { label: "Rate limit API", value: "Login, upload, comment", icon: Gauge },
  { label: "Upload filter", value: "Chỉ nhận JPG, PNG, WEBP hoặc GIF", icon: LockKeyhole },
  { label: "Audit log", value: "Ghi sự kiện quản trị", icon: FileCheck2 }
];

const auditEvents = [
  { time: "09:45", actor: "admin", action: "Tạo bản nháp game Seraph Code" },
  { time: "10:20", actor: "sol", action: "Ẩn bình luận chứa link spam" },
  { time: "11:05", actor: "riven", action: "Cập nhật meta SEO cho Glass Eclipse" }
];

export function AdminPanel({ metrics }: { metrics: DashboardMetric[] }) {
  const [message, setMessage] = useState("");

  async function submitGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Đang kiểm tra dữ liệu game...");

    const response = await fetch("/api/admin/games", {
      method: "POST",
      body: new FormData(event.currentTarget)
    });
    const data = await response.json();
    setMessage(data.message ?? "Đã nhận dữ liệu game.");
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="space-y-2 p-6">
              <p className="text-xs uppercase text-muted-foreground">{metric.label}</p>
              <p className="font-display text-4xl text-foreground">{metric.value}</p>
              <p className="text-sm text-primary">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase text-primary">Đăng game mới</p>
                <h2 className="mt-2 font-display text-4xl text-foreground">Nhập thông tin game để xuất bản</h2>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary">
                  Lưu nháp
                </Button>
                <Button type="submit" form="admin-game-form">
                  <FileCheck2 className="h-4 w-4" />
                  Đăng game
                </Button>
              </div>
            </div>

            <form id="admin-game-form" onSubmit={submitGame} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="title" placeholder="Tên game" required />
                <Input name="version" placeholder="Phiên bản, ví dụ v1.2.0" required />
                <Input name="developer" placeholder="Nhà phát triển / studio" required />
                <select
                  name="engine"
                  defaultValue=""
                  required
                  className="h-12 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-foreground focus:border-primary/50"
                >
                  <option value="" disabled>
                    Chọn engine
                  </option>
                  {ENGINES.map((engine) => (
                    <option key={engine} value={engine}>
                      {engine}
                    </option>
                  ))}
                </select>
                <Input name="platforms" placeholder="Thiết bị: Windows, Android, macOS..." required />
                <Input name="languages" placeholder="Ngôn ngữ: English, Vietnamese..." />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Textarea name="shortDescription" placeholder="Giới thiệu ngắn hiển thị trên card game..." className="min-h-[150px]" required />
                <Textarea name="description" placeholder="Mô tả chi tiết, story, gameplay, điểm nổi bật..." className="min-h-[150px]" required />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <UploadBox label="Ảnh cover" name="cover" />
                <UploadBox label="Background / banner" name="background" />
                <UploadBox label="Ảnh giới thiệu" name="gallery" multiple />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Thể loại game</p>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <label key={genre} className="cursor-pointer rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs uppercase tracking-[0.14em] text-muted-foreground transition hover:border-primary/35 hover:text-foreground">
                      <input name="genres" value={genre} type="checkbox" className="sr-only peer" />
                      <span className="peer-checked:text-primary">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Tag gợi ý</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.slice(0, 12).map((tag) => (
                    <label key={tag} className="cursor-pointer rounded-full border border-white/10 bg-black/22 px-3 py-2 text-xs uppercase tracking-[0.14em] text-muted-foreground transition hover:border-accent/35 hover:text-foreground">
                      <input name="tags" value={tag} type="checkbox" className="sr-only peer" />
                      <span className="peer-checked:text-accent">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input name="downloadUrl" placeholder="Link tải / download hub" />
                <Input name="seoTitle" placeholder="SEO title" />
              </div>
              <Textarea name="seoDescription" placeholder="SEO description..." />

              {message ? (
                <div className="rounded-lg border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-primary">
                  {message}
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="font-display text-3xl text-foreground">Trung tâm điều khiển</h3>
              {controlItems.map(({ label, icon: Component, status }) => {
                const Icon = Component as ComponentType<{ className?: string }>;
                return (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-white/8 bg-black/18 px-4 py-3">
                    <div className="inline-flex items-center gap-3 text-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{label}</span>
                    </div>
                    <span className="text-xs uppercase text-muted-foreground">{status}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="font-display text-3xl text-foreground">Game chờ duyệt</h3>
              {["Moonlit Oblivion v1.4", "Velvet Hollow v0.9", "Noctis Archive v2.0"].map((item) => (
                <div key={item} className="rounded-lg border border-white/8 bg-black/18 p-4">
                  <p className="font-semibold text-foreground">{item}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Đang chờ kiểm tra ảnh, tag và mô tả.</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-3xl text-foreground">Duyệt cộng đồng</h3>
              <MessageSquareWarning className="h-5 w-5 text-accent" />
            </div>
            {moderationQueue.map((item) => (
              <div key={`${item.user}-${item.reason}`} className="rounded-lg border border-white/8 bg-black/18 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">@{item.user}</p>
                  <span className="rounded-md border border-accent/20 bg-accent/10 px-2 py-1 text-xs text-accent">
                    {item.risk}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-3xl text-foreground">SEO & index</h3>
              <SearchCheck className="h-5 w-5 text-primary" />
            </div>
            {["Kiểm tra slug trùng", "Tạo meta title/description", "Open Graph cho game detail", "Sitemap tự động theo game"].map((task) => (
              <div key={task} className="flex items-center gap-3 rounded-lg border border-white/8 bg-black/18 p-4">
                <FileCheck2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{task}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-3xl text-foreground">Bảo mật admin</h3>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            {securityChecks.map(({ label, value, icon: Component }) => {
              const Icon = Component as ComponentType<{ className?: string }>;
              return (
                <div key={label} className="rounded-lg border border-white/8 bg-black/18 p-4">
                  <div className="flex items-center gap-3 text-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{label}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{value}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <UploadCloud className="h-5 w-5 text-primary" />
              <h3 className="font-display text-3xl text-foreground">Upload nhanh</h3>
            </div>
            <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-6 text-sm leading-7 text-muted-foreground">
              Kéo thả cover, background hoặc ảnh giới thiệu vào form đăng game. API upload kiểm tra loại file, kích thước và tên file trước khi lưu.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <UsersRound className="h-5 w-5 text-primary" />
              <h3 className="font-display text-3xl text-foreground">Vai trò & quyền hạn</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["User", "Moderator", "Admin", "Super Admin"].map((role) => (
                <div key={role} className="rounded-lg border border-white/8 bg-black/18 p-4">
                  <p className="font-semibold text-foreground">{role}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Phân quyền theo route và hành động quản trị.</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-primary" />
              <h3 className="font-display text-3xl text-foreground">Nhật ký quản trị</h3>
            </div>
            <div className="space-y-3">
              {auditEvents.map((event) => (
                <div key={`${event.time}-${event.action}`} className="rounded-lg border border-white/8 bg-black/18 p-4">
                  <div className="flex items-center justify-between gap-3 text-xs uppercase text-muted-foreground">
                    <span>{event.time}</span>
                    <span>@{event.actor}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground">{event.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UploadBox({ label, name, multiple = false }: { label: string; name: string; multiple?: boolean }) {
  return (
    <label className="block rounded-lg border border-dashed border-white/14 bg-black/22 p-4 transition hover:border-primary/35">
      <span className="mb-3 block text-sm font-semibold text-foreground">{label}</span>
      <Input name={name} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple={multiple} className="h-auto cursor-pointer py-3" />
      <span className="mt-3 block text-xs text-muted-foreground">JPG, PNG, WEBP hoặc GIF, tối đa 5MB.</span>
    </label>
  );
}
