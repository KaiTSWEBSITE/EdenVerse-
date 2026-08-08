import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Game } from "@/types";
import { formatDate } from "@/lib/utils";

const ADMIN_NOTE_FALLBACK_COLOR = "#d1a058";
const ADMIN_NOTE_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function getSafeAdminNoteColor(color: string | undefined) {
  return color && ADMIN_NOTE_COLOR_PATTERN.test(color) ? color : ADMIN_NOTE_FALLBACK_COLOR;
}

export function GameOverview({ game }: { game: Game }) {
  const adminNoteColor = getSafeAdminNoteColor(game.adminNoteColor);

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 xl:grid-cols-[1.15fr_0.85fr] lg:px-8">
      <Card>
        <CardContent className="space-y-8 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Cốt truyện</p>
            <p className="mt-3 whitespace-pre-line text-base leading-8 text-muted-foreground">{game.story}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Giới thiệu</p>
            <p className="mt-3 whitespace-pre-line text-base leading-8 text-muted-foreground">{game.description}</p>
          </div>
          <Separator />
          <div id="download">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">Khu tải game</p>
            <p className="mt-3 text-base leading-8 text-muted-foreground">
              Mỗi lần người dùng bấm nút tải, EdenVerse sẽ ghi nhận một lượt click. Bảng Game Hot dùng số liệu này để tự sắp xếp game nổi bật hơn.
              {game.downloadUrlAlt ? " Game này có thêm link dự phòng để đổi mirror khi link chính quá tải hoặc lỗi." : ""}
              {game.downloadUrlJoyplay ? " Có thêm link JoyPlay riêng cho người chơi trên Android/JoyPlay." : ""}
              {game.downloadUrlSeason2 ? " Game này có thêm link Season 2 riêng cho bản/chương tiếp theo." : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-8">
          {[
            ["Developer", game.developer],
            ["Engine", game.engine],
            ["Ngày ra mắt", formatDate(game.releaseDate)],
            ["Thiết bị", game.platforms.join(", ")],
            ["Ngôn ngữ", game.languages.join(", ")],
            ["Thể loại", game.genres.join(", ")],
            ["Tags", game.tags.join(", ")]
          ].map(([label, value]) => (
            <div key={label} className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
              <p className="text-base text-foreground">{value}</p>
            </div>
          ))}
          {game.adminNote ? (
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 shadow-[0_0_28px_rgba(209,160,88,0.06)]">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Ghi chú admin</p>
              <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7" style={{ color: adminNoteColor }}>
                {game.adminNote}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
