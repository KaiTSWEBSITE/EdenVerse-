import { Card, CardContent } from "@/components/ui/card";
import type { Game } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Info, DownloadCloud, AlertTriangle } from "lucide-react";

const ADMIN_NOTE_FALLBACK_COLOR = "text-accent";

export function GameOverview({ game }: { game: Game }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        
        {/* Left Column: Description & Download Info */}
        <div className="space-y-8">
          {/* About Game */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
              <Info className="h-5 w-5 text-primary" />
              Về trò chơi này
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
              {game.description}
            </div>
          </div>
          
          <div className="h-px bg-white/10" />

          {game.adminNote && (
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-6 mt-6 shadow-[0_0_20px_rgba(255,105,180,0.1)]">
              <h3 className="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-accent font-bold mb-3">
                <AlertTriangle className="h-5 w-5" />
                Ghi chú từ Quản trị viên
              </h3>
              <p className={`whitespace-pre-line text-sm leading-relaxed ${ADMIN_NOTE_FALLBACK_COLOR}`}>
                {game.adminNote}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Sidebar (Specs & Download) */}
        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          <Card className="bg-noir-surfaceElevated border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <CardContent className="p-6 space-y-5">
              <h3 className="flex items-center gap-2 font-display font-semibold text-lg border-b border-white/10 pb-3">
                <DownloadCloud className="h-5 w-5 text-primary" />
                Thông tin tải xuống
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>Mỗi lần bấm nút tải, EdenVerse sẽ ghi nhận một lượt click để xếp hạng Game Hot.</p>
                <ul className="list-disc pl-5 space-y-2">
                  {game.downloadUrlAlt && (
                    <li><strong className="text-white">Link dự phòng:</strong> Đổi mirror khi quá tải.</li>
                  )}
                  {game.downloadUrlJoyplay && (
                    <li><strong className="text-white">JoyPlay:</strong> Hỗ trợ Android qua app JoyPlay.</li>
                  )}
                  {game.downloadUrlSeason2 && (
                    <li><strong className="text-white">Season 2:</strong> Link riêng cho chương tiếp theo.</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/5 shadow-none">
            <CardContent className="p-6 space-y-5">
              <h3 className="font-display font-semibold text-lg border-b border-white/10 pb-3">Chi Tiết Kỹ Thuật</h3>
              
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <dt className="text-muted-foreground">Nhà phát triển</dt>
                  <dd className="text-right text-foreground font-medium">{game.developer || "Đang cập nhật"}</dd>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <dt className="text-muted-foreground">Engine</dt>
                  <dd className="text-right text-foreground font-medium">{game.engine || "Không rõ"}</dd>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <dt className="text-muted-foreground">Dung lượng</dt>
                  <dd className="text-right text-foreground font-medium">{game.fileSize || "Đang cập nhật"}</dd>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <dt className="text-muted-foreground">Ngày phát hành</dt>
                  <dd className="text-right text-foreground font-medium">{formatDate(game.releaseDate)}</dd>
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <dt className="text-muted-foreground">Thiết bị hỗ trợ</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {game.platforms.length ? game.platforms.map(p => (
                      <Badge key={p} className="bg-white/5 hover:bg-white/10 font-normal">{p}</Badge>
                    )) : "Không rõ"}
                  </dd>
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <dt className="text-muted-foreground">Ngôn ngữ</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {game.languages.length ? game.languages.map(l => (
                      <Badge key={l} className="bg-white/5 hover:bg-white/10 font-normal">{l}</Badge>
                    )) : "Không rõ"}
                  </dd>
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <dt className="text-muted-foreground">Tags</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {game.tags.map(t => (
                      <Badge key={t} className="border border-white/10 text-muted-foreground hover:text-white bg-transparent">{t}</Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

        </aside>
        
      </div>
    </section>
  );
}
