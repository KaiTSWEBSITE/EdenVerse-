import {
  BarChart3,
  CalendarClock,
  FileCheck2,
  FileText,
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
import type { ComponentType } from "react";
import type { DashboardMetric, Post } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const controlItems = [
  { label: "Quản lý game", icon: BarChart3, status: "Sẵn sàng" },
  { label: "Upload ảnh game", icon: ImageUp, status: "Giới hạn 5MB" },
  { label: "Duyệt bình luận", icon: MessageSquareWarning, status: "3 đang chờ" },
  { label: "Khóa người dùng", icon: ShieldBan, status: "Theo role" },
  { label: "Quản lý tag", icon: Tag, status: "Tự gợi ý" },
  { label: "Quản lý SEO", icon: FileText, status: "Có checklist" }
];

const moderationQueue = [
  { user: "aria", reason: "Báo cáo spoiler", risk: "Trung bình" },
  { user: "guest-204", reason: "Spam link ngoài", risk: "Cao" },
  { user: "riven", reason: "Review cần duyệt 18+", risk: "Thấp" }
];

const securityChecks = [
  { label: "CSP + frame guard", value: "Đang bật", icon: ShieldCheck },
  { label: "Rate limit API", value: "Login, upload, comment", icon: Gauge },
  { label: "Upload filter", value: "Chỉ ảnh an toàn", icon: LockKeyhole },
  { label: "Audit log", value: "Ghi sự kiện quản trị", icon: FileCheck2 }
];

const auditEvents = [
  { time: "09:45", actor: "admin", action: "Duyệt review 18+ cho Seraph Code" },
  { time: "10:20", actor: "sol", action: "Ẩn bình luận chứa link spam" },
  { time: "11:05", actor: "riven", action: "Cập nhật meta SEO cho Glass Eclipse" }
];

export function AdminPanel({
  metrics,
  posts
}: {
  metrics: DashboardMetric[];
  posts: Post[];
}) {
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

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase text-primary">CMS bài viết</p>
                <h2 className="mt-2 font-display text-4xl text-foreground">Viết bài, lên lịch, tối ưu SEO</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">
                  <CalendarClock className="h-4 w-4" />
                  Lên lịch
                </Button>
                <Button>
                  <FileCheck2 className="h-4 w-4" />
                  Xuất bản
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Tiêu đề bài viết" />
              <Input placeholder="SEO title" />
              <Input placeholder="Thumbnail URL" />
              <Input placeholder="Ngày đăng dự kiến" />
            </div>
            <Textarea placeholder="Nội dung Markdown / rich text..." className="min-h-[260px]" />
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="SEO description" />
              <Input placeholder="Tag, phân tách bằng dấu phẩy" />
            </div>
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
              <h3 className="font-display text-3xl text-foreground">Bài viết gần đây</h3>
              <div className="space-y-3">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.slug} className="rounded-lg border border-white/8 bg-black/18 p-4">
                    <p className="font-semibold text-foreground">{post.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {post.category} • {post.status}
                    </p>
                  </div>
                ))}
              </div>
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
            {[
              "Kiểm tra slug trùng",
              "Tạo meta title/description",
              "Open Graph cho game detail",
              "Sitemap tự động theo game và bài viết"
            ].map((task) => (
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
              Kéo thả ảnh cover, screenshot hoặc avatar vào đây. API upload hiện kiểm tra loại file, kích thước và tên file an toàn trước khi lưu.
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
              <CalendarClock className="h-5 w-5 text-primary" />
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
