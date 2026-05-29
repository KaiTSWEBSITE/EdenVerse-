"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  BarChart3,
  FileCheck2,
  Gamepad2,
  Gauge,
  ImageUp,
  Link2,
  Loader2,
  LockKeyhole,
  MessageSquareWarning,
  Pencil,
  SearchCheck,
  ShieldBan,
  ShieldCheck,
  Tag,
  Trash2,
  UsersRound
} from "lucide-react";
import type { ComponentType, FormEvent } from "react";
import { useEffect, useState } from "react";
import type { DashboardMetric } from "@/types";
import { ENGINES, GENRES, TAGS } from "@/constants/filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const controlItems = [
  { label: "Quản lý game", icon: Gamepad2, status: "Tạo, sửa, ẩn" },
  { label: "Link ảnh", icon: ImageUp, status: "URL ngoài" },
  { label: "Duyệt bình luận", icon: MessageSquareWarning, status: "0 đang chờ" },
  { label: "Khóa người dùng", icon: ShieldBan, status: "Theo role" },
  { label: "Quản lý tag", icon: Tag, status: "Tự gợi ý" },
  { label: "Quản lý SEO", icon: BarChart3, status: "Có checklist" }
];

type ModerationQueueItem = {
  user: string;
  reason: string;
  risk: string;
};

type AuditEvent = {
  time: string;
  actor: string;
  action: string;
};

const pendingGames: string[] = [];
const moderationQueue: ModerationQueueItem[] = [];

const securityChecks = [
  { label: "CSP + frame guard", value: "Frame bị chặn, CSP siết chặt", icon: ShieldCheck },
  { label: "Rate limit API", value: "Login, register, upload, admin", icon: Gauge },
  { label: "Upload filter", value: "Production ưu tiên link HTTPS ngoài", icon: LockKeyhole },
  { label: "Audit log", value: "Đã reset log hiển thị demo", icon: FileCheck2 }
];

const auditEvents: AuditEvent[] = [];

type AdminPostSummary = {
  id: string;
  slug: string;
  title: string;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  author?: {
    name: string;
    username: string;
  } | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  _count?: {
    comments: number;
    tags: number;
  };
};

type AdminGameSummary = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  description: string;
  version: string;
  developer: string;
  engine: string;
  downloadUrl: string | null;
  downloadsCount: number;
  coverImage: string;
  bannerImage: string;
  gallery: string[];
  platforms: string[];
  languages: string[];
  genres: string[];
  tags: string[];
  updatedAt: string;
  createdAt: string;
  _count?: {
    comments: number;
    reviews: number;
  };
};

type GameFormState = {
  title: string;
  version: string;
  developer: string;
  engine: string;
  platforms: string;
  languages: string;
  shortDescription: string;
  description: string;
  coverImageUrl: string;
  backgroundImageUrl: string;
  galleryImageUrls: string;
  downloadUrl: string;
  seoTitle: string;
  seoDescription: string;
};

const emptyGameFormState: GameFormState = {
  title: "",
  version: "",
  developer: "",
  engine: "",
  platforms: "",
  languages: "",
  shortDescription: "",
  description: "",
  coverImageUrl: "",
  backgroundImageUrl: "",
  galleryImageUrls: "",
  downloadUrl: "",
  seoTitle: "",
  seoDescription: ""
};

export function AdminPanel({ heroIntro, metrics }: { heroIntro: string; metrics: DashboardMetric[] }) {
  const [intro, setIntro] = useState(heroIntro);
  const [message, setMessage] = useState("");
  const [postDeleteMessage, setPostDeleteMessage] = useState("");
  const [gameDemoMessage, setGameDemoMessage] = useState("");
  const [postListMessage, setPostListMessage] = useState("");
  const [posts, setPosts] = useState<AdminPostSummary[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [games, setGames] = useState<AdminGameSummary[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gameListMessage, setGameListMessage] = useState("");
  const [gameDeleteMessage, setGameDeleteMessage] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isSubmittingGame, setIsSubmittingGame] = useState(false);
  const [editingGame, setEditingGame] = useState<AdminGameSummary | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [genreSearch, setGenreSearch] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [gameForm, setGameForm] = useState<GameFormState>(emptyGameFormState);

  async function loadPosts() {
    setPostsLoading(true);

    try {
      const response = await fetch("/api/admin/posts", { cache: "no-store" });
      const data = await response.json();

      if (Array.isArray(data.posts)) {
        setPosts(data.posts);
      }

      setPostListMessage(data.message ?? "");
    } catch {
      setPostListMessage("Không thể tải danh sách bài viết lúc này.");
    } finally {
      setPostsLoading(false);
    }
  }

  async function loadGames() {
    setGamesLoading(true);

    try {
      const response = await fetch(`/api/admin/games?ts=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-store"
        }
      });
      const data = await response.json();

      if (Array.isArray(data.games)) {
        setGames(data.games);
      }

      setGameListMessage(data.message ?? "");
    } catch {
      setGameListMessage("Không thể tải danh sách game lúc này.");
    } finally {
      setGamesLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
    void loadGames();
  }, []);

  const genreOptions = Array.from(new Set([...GENRES, ...selectedGenres])).sort((first, second) =>
    first.localeCompare(second)
  );
  const engineOptions = Array.from(new Set([...ENGINES, gameForm.engine].filter(Boolean)));
  const filteredGenres = genreOptions
    .filter((genre) => genre.toLowerCase().includes(genreSearch.trim().toLowerCase()))
    .slice(0, 36);

  function toggleGenre(genre: string) {
    setSelectedGenres((currentGenres) =>
      currentGenres.includes(genre)
        ? currentGenres.filter((currentGenre) => currentGenre !== genre)
        : [...currentGenres, genre]
    );
  }

  function toggleTag(tag: string) {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag) ? currentTags.filter((currentTag) => currentTag !== tag) : [...currentTags, tag]
    );
  }

  function addCustomGenre() {
    const genre = customGenre.trim();

    if (!genre) {
      return;
    }

    setSelectedGenres((currentGenres) => (currentGenres.includes(genre) ? currentGenres : [...currentGenres, genre]));
    setCustomGenre("");
    setGenreSearch("");
  }

  function updateGameForm<K extends keyof GameFormState>(field: K, value: GameFormState[K]) {
    setGameForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  }

  function gameToFormState(game: AdminGameSummary): GameFormState {
    return {
      title: game.title,
      version: game.version,
      developer: game.developer,
      engine: game.engine,
      platforms: game.platforms.join(", "),
      languages: game.languages.join(", "),
      shortDescription: game.shortDescription,
      description: game.description,
      coverImageUrl: game.coverImage,
      backgroundImageUrl: game.bannerImage,
      galleryImageUrls: game.gallery.join("\n"),
      downloadUrl: game.downloadUrl ?? "",
      seoTitle: game.title,
      seoDescription: game.shortDescription
    };
  }

  function buildGameFormData() {
    const formData = new FormData();

    if (editingGame) {
      formData.set("slug", editingGame.slug);
    }

    Object.entries(gameForm).forEach(([key, value]) => {
      formData.set(key, value);
    });
    selectedGenres.forEach((genre) => formData.append("genres", genre));
    selectedTags.forEach((tag) => formData.append("tags", tag));

    return formData;
  }

  function splitAdminList(value: string) {
    return value
      .split(/\r?\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function getEditedGameSnapshot(game: AdminGameSummary): AdminGameSummary {
    return {
      ...game,
      title: gameForm.title,
      version: gameForm.version,
      developer: gameForm.developer,
      engine: gameForm.engine,
      downloadUrl: gameForm.downloadUrl || null,
      shortDescription: gameForm.shortDescription,
      description: gameForm.description,
      tagline: gameForm.shortDescription.slice(0, 140),
      coverImage: gameForm.coverImageUrl,
      bannerImage: gameForm.backgroundImageUrl || gameForm.coverImageUrl,
      gallery: splitAdminList(gameForm.galleryImageUrls).length
        ? splitAdminList(gameForm.galleryImageUrls)
        : [gameForm.backgroundImageUrl || gameForm.coverImageUrl],
      platforms: splitAdminList(gameForm.platforms),
      languages: splitAdminList(gameForm.languages),
      genres: selectedGenres,
      tags: selectedTags,
      updatedAt: new Date().toISOString()
    };
  }

  function resetGameForm() {
    setGameForm(emptyGameFormState);
    setEditingGame(null);
    setSelectedGenres([]);
    setSelectedTags([]);
    setGenreSearch("");
    setCustomGenre("");
    setMessage("");
  }

  function startEditingGame(game: AdminGameSummary) {
    setEditingGame(game);
    setGameForm(gameToFormState(game));
    setSelectedGenres(game.genres);
    setSelectedTags(game.tags);
    setGenreSearch("");
    setCustomGenre("");
    setMessage(`Đang chỉnh sửa "${game.title}". Cập nhật xong bấm "Lưu chỉnh sửa".`);

    window.requestAnimationFrame(() => {
      const form = document.getElementById("admin-game-form") as HTMLFormElement | null;
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsMessage("Đang lưu câu giới thiệu...");

    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heroIntro: intro
      })
    });
    const data = await response.json();
    if (response.ok && typeof data.heroIntro === "string") {
      localStorage.setItem("edenverse.heroIntro", data.heroIntro);
      window.dispatchEvent(new CustomEvent("edenverse:hero-intro-updated", { detail: data.heroIntro }));
    }
    setSettingsMessage(data.message ?? "Đã gửi yêu cầu cập nhật.");
  }

  async function deletePosts(mode: "demo" | "slug", slugOverride?: string) {
    const slugToDelete = slugOverride ?? postSlug.trim();

    if (mode === "slug" && !slugToDelete) {
      setPostDeleteMessage("Vui lòng nhập slug bài cần xóa.");
      return;
    }

    const confirmed =
      mode === "demo"
        ? window.confirm("Xóa toàn bộ bài demo? Hành động này không thể hoàn tác.")
        : window.confirm(`Xóa bài "${slugToDelete}"? Hành động này không thể hoàn tác.`);

    if (!confirmed) {
      return;
    }

    setPostDeleteMessage("Đang xử lý yêu cầu xóa bài...");

    const response = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "demo" ? { mode } : { mode, slug: slugToDelete })
    });
    const data = await response.json();
    setPostDeleteMessage(data.message ?? "Đã gửi yêu cầu xóa bài.");

    if (response.ok && mode === "slug") {
      setPostSlug("");
      setPosts((currentPosts) => currentPosts.filter((post) => post.slug !== slugToDelete));
    }

    if (response.ok && mode === "demo") {
      await loadPosts();
    }
  }

  async function deleteDemoGames() {
    const confirmed = window.confirm(
      "Xóa hoặc ẩn toàn bộ game demo/mẫu? Hành động này sẽ làm các game mẫu biến mất khỏi trang chủ."
    );

    if (!confirmed) {
      return;
    }

    setGameDemoMessage("Đang dọn game demo/mẫu...");

    const response = await fetch("/api/admin/games/demo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    setGameDemoMessage(data.message ?? "Đã gửi yêu cầu dọn game demo.");

    if (response.ok) {
      await loadGames();
    }
  }

  async function deleteGame(slug: string, title: string) {
    const confirmed = window.confirm(`Xóa game "${title}"? Hành động này không thể hoàn tác.`);

    if (!confirmed) {
      return;
    }

    setGameDeleteMessage(`Đang xóa game "${title}"...`);

    const response = await fetch("/api/admin/games", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });
    const data = await response.json();
    setGameDeleteMessage(data.message ?? "Đã gửi yêu cầu xóa game.");

    if (response.ok) {
      await loadGames();
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Mật khẩu mới và xác nhận chưa khớp.");
      return;
    }

    setPasswordMessage("Đang đổi mật khẩu quản trị...");

    const response = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
    const data = await response.json();

    if (response.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setPasswordMessage(data.message ?? "Đã gửi yêu cầu đổi mật khẩu.");
  }

  async function submitGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmittingGame) {
      return;
    }

    if (!selectedGenres.length) {
      setMessage("Chọn ít nhất một thể loại game. Bạn có thể tìm hoặc tự thêm thể loại mới.");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30_000);

    setIsSubmittingGame(true);
    setMessage(
      editingGame
        ? `Đang cập nhật "${editingGame.title}"...`
        : "Đang lưu game... Ảnh sẽ được lưu bằng link nên không upload file nặng."
    );

    try {
      const response = await fetch("/api/admin/games", {
        method: editingGame ? "PATCH" : "POST",
        body: buildGameFormData(),
        signal: controller.signal
      });
      const data = await response.json();
      const fallbackMessage =
        response.status === 401 || response.status === 403
          ? "Phiên đăng nhập admin đã hết hạn hoặc chưa đủ quyền. Vui lòng đăng nhập lại."
          : "Đã nhận dữ liệu game.";

      setMessage(data.message ?? fallbackMessage);

      if (response.ok) {
        if (editingGame) {
          const savedGame = (data.game ?? getEditedGameSnapshot(editingGame)) as AdminGameSummary;
          setEditingGame(savedGame);
          setGameForm(gameToFormState(savedGame));
          setSelectedGenres(savedGame.genres);
          setSelectedTags(savedGame.tags);
          setGames((currentGames) =>
            currentGames.map((game) => (game.slug === savedGame.slug ? savedGame : game))
          );
        } else {
          resetGameForm();
        }
        await loadGames();
      }
    } catch (error) {
      const timeoutMessage =
        error instanceof DOMException && error.name === "AbortError"
          ? "Kết nối quá lâu nên đã dừng. Hãy kiểm tra mạng, link ảnh và thử lại."
          : "Không gửi được form lúc này. Hãy thử lại hoặc đăng nhập lại admin.";
      setMessage(timeoutMessage);
    } finally {
      window.clearTimeout(timeout);
      setIsSubmittingGame(false);
    }
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

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Bảo mật tài khoản</p>
              <h2 className="mt-2 font-display text-4xl text-foreground">Đổi mật khẩu quản trị</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Mật khẩu mới cần tối thiểu 14 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt. Hãy đổi ngay sau khi nhận mật khẩu tạm.
              </p>
            </div>
            <Button type="submit" form="admin-password-form">
              <LockKeyhole className="h-4 w-4" />
              Cập nhật mật khẩu
            </Button>
          </div>
          <form id="admin-password-form" onSubmit={submitPassword} className="grid gap-3 md:grid-cols-3">
            <Input
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              type="password"
              placeholder="Mật khẩu hiện tại"
              required
            />
            <Input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              placeholder="Mật khẩu mới mạnh"
              required
            />
            <Input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </form>
          {passwordMessage ? <p className="text-sm text-primary">{passwordMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Giới thiệu trang chủ</p>
              <h2 className="mt-2 font-display text-4xl text-foreground">Tự chỉnh câu giới thiệu EdenVerse</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Nội dung này hiển thị ngay dưới logo lớn ở hero. Nếu đã cấu hình PostgreSQL, thay đổi sẽ được lưu bền vững.
              </p>
            </div>
            <Button type="submit" form="admin-site-settings-form">
              Lưu giới thiệu
            </Button>
          </div>
          <form id="admin-site-settings-form" onSubmit={submitSettings} className="space-y-4">
            <Textarea
              maxLength={320}
              minLength={40}
              onChange={(event) => setIntro(event.target.value)}
              placeholder="Nhập câu giới thiệu mới..."
              required
              value={intro}
            />
          </form>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{intro.length}/320 ký tự</span>
            {settingsMessage ? <span className="text-primary">{settingsMessage}</span> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Dữ liệu demo</p>
              <h2 className="mt-2 font-display text-4xl text-foreground">Xóa game demo/mẫu khỏi trang web</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Nút này dọn các game mẫu đang hiện ở trang chủ. Nếu chưa có database, hệ thống sẽ ẩn demo bằng cookie trên trình duyệt hiện tại; nếu có database, game demo sẽ bị xóa và fallback mẫu sẽ tắt.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={deleteDemoGames}>
              <Trash2 className="h-4 w-4" />
              Xóa game demo/mẫu
            </Button>
          </div>
          {gameDemoMessage ? <p className="text-sm text-primary">{gameDemoMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Game đã đăng</p>
              <h2 className="mt-2 font-display text-4xl text-foreground">Quản lý game thật trên website</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Sau khi bấm đăng game, game sẽ xuất hiện ngay ở đây để bạn mở trang chi tiết hoặc xóa nếu nhập sai.
              </p>
            </div>
            <Button type="button" variant="ghost" onClick={loadGames} disabled={gamesLoading}>
              {gamesLoading ? "Đang tải..." : "Tải lại danh sách"}
            </Button>
          </div>

          <div className="rounded-lg border border-white/8 bg-black/18">
            <div className="divide-y divide-white/8">
              {gamesLoading ? (
                <PostListNotice text="Đang tải danh sách game..." />
              ) : games.length ? (
                games.map((game) => (
                  <div key={game.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{game.title}</p>
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-primary">
                          {game.version}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Slug: {game.slug}</span>
                        <span>Studio: {game.developer}</span>
                        <span>Lượt tải: {game.downloadsCount}</span>
                        <span>Bình luận: {game._count?.comments ?? 0}</span>
                        <span>Đánh giá: {game._count?.reviews ?? 0}</span>
                        <span>Cập nhật: {formatAdminDate(game.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Link
                        href={`/games/${game.slug}` as Route}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-white/8 px-4 text-xs font-semibold text-foreground ring-1 ring-white/10 transition hover:bg-white/12 hover:ring-primary/30"
                      >
                        Xem game
                      </Link>
                      <Button type="button" variant="ghost" size="sm" onClick={() => startEditingGame(game)}>
                        <Pencil className="h-4 w-4" />
                        Sửa
                      </Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => deleteGame(game.slug, game.title)}>
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <PostListNotice text={gameListMessage || "Chưa có game thật nào trong database. Hãy đăng game đầu tiên ở form bên dưới."} />
              )}
            </div>
          </div>
          {gameDeleteMessage ? <p className="text-sm text-primary">{gameDeleteMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Quản lý bài viết</p>
              <h2 className="mt-2 font-display text-4xl text-foreground">Xóa bài và dọn bài demo</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Xóa bài viết theo slug hoặc dọn sạch các bài viết demo cũ như `demo-*`, `edenverse-weekly*` và bài có trạng thái `DEMO`.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={() => deletePosts("demo")}>
              <Trash2 className="h-4 w-4" />
              Xóa toàn bộ bài viết demo
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input value={postSlug} onChange={(event) => setPostSlug(event.target.value)} placeholder="Nhập slug bài cần xóa, ví dụ: edenverse-weekly-1" />
            <Button type="button" disabled={!postSlug.trim()} onClick={() => deletePosts("slug")}>
              Xóa bài này
            </Button>
          </div>
          <div className="rounded-lg border border-white/8 bg-black/18">
            <div className="flex flex-col gap-3 border-b border-white/8 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Danh sách bài viết gần đây</p>
                <p className="mt-1 text-xs text-muted-foreground">Bấm xóa ngay trên từng bài, không cần nhập slug thủ công.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={loadPosts} disabled={postsLoading}>
                {postsLoading ? "Đang tải..." : "Tải lại"}
              </Button>
            </div>
            <div className="divide-y divide-white/8">
              {postsLoading ? (
                <PostListNotice text="Đang tải danh sách bài viết..." />
              ) : posts.length ? (
                posts.map((post) => (
                  <div key={post.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{post.title}</p>
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-primary">
                          {post.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Slug: {post.slug}</span>
                        <span>Tác giả: {post.author?.name ?? post.author?.username ?? "Không rõ"}</span>
                        <span>Danh mục: {post.category?.name ?? "Chưa gắn"}</span>
                        <span>Bình luận: {post._count?.comments ?? 0}</span>
                        <span>Cập nhật: {formatAdminDate(post.updatedAt)}</span>
                      </div>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={() => deletePosts("slug", post.slug)}>
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </Button>
                  </div>
                ))
              ) : (
                <PostListNotice text={postListMessage || "Chưa có bài viết nào để xóa."} />
              )}
            </div>
          </div>
          {postDeleteMessage ? <p className="text-sm text-primary">{postDeleteMessage}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase text-primary">{editingGame ? "Chỉnh sửa game" : "Đăng game mới"}</p>
                <h2 className="mt-2 font-display text-4xl text-foreground">
                  {editingGame ? `Cập nhật ${editingGame.title}` : "Nhập thông tin game để xuất bản"}
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetGameForm}
                >
                  {editingGame ? "Hủy sửa" : "Xóa form"}
                </Button>
                <Button type="submit" form="admin-game-form" disabled={isSubmittingGame}>
                  {isSubmittingGame ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                  {isSubmittingGame ? "Đang lưu..." : editingGame ? "Lưu chỉnh sửa" : "Đăng game"}
                </Button>
              </div>
            </div>

            <form id="admin-game-form" onSubmit={submitGame} className="space-y-5">
              {editingGame ? <input type="hidden" name="slug" value={editingGame.slug} /> : null}
              {selectedGenres.map((genre) => (
                <input key={genre} type="hidden" name="genres" value={genre} />
              ))}
              {selectedTags.map((tag) => (
                <input key={tag} type="hidden" name="tags" value={tag} />
              ))}
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="title"
                  value={gameForm.title}
                  onChange={(event) => updateGameForm("title", event.target.value)}
                  placeholder="Tên game"
                  required
                />
                <Input
                  name="version"
                  value={gameForm.version}
                  onChange={(event) => updateGameForm("version", event.target.value)}
                  placeholder="Phiên bản, ví dụ v1.2.0"
                  required
                />
                <Input
                  name="developer"
                  value={gameForm.developer}
                  onChange={(event) => updateGameForm("developer", event.target.value)}
                  placeholder="Nhà phát triển / studio"
                  required
                />
                <select
                  name="engine"
                  value={gameForm.engine}
                  onChange={(event) => updateGameForm("engine", event.target.value)}
                  required
                  className="h-12 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-foreground focus:border-primary/50"
                >
                  <option value="" disabled>
                    Chọn engine
                  </option>
                  {engineOptions.map((engine) => (
                    <option key={engine} value={engine}>
                      {engine}
                    </option>
                  ))}
                </select>
                <Input
                  name="platforms"
                  value={gameForm.platforms}
                  onChange={(event) => updateGameForm("platforms", event.target.value)}
                  placeholder="Thiết bị: Windows, Android, macOS..."
                  required
                />
                <Input
                  name="languages"
                  value={gameForm.languages}
                  onChange={(event) => updateGameForm("languages", event.target.value)}
                  placeholder="Ngôn ngữ: English, Vietnamese..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Textarea
                  name="shortDescription"
                  value={gameForm.shortDescription}
                  onChange={(event) => updateGameForm("shortDescription", event.target.value)}
                  placeholder="Giới thiệu ngắn hiển thị trên card game..."
                  className="min-h-[150px]"
                  required
                />
                <Textarea
                  name="description"
                  value={gameForm.description}
                  onChange={(event) => updateGameForm("description", event.target.value)}
                  placeholder="Mô tả chi tiết, story, gameplay, điểm nổi bật..."
                  className="min-h-[150px]"
                  required
                />
              </div>

              <div className="space-y-4 rounded-xl border border-primary/15 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Link2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Ảnh dùng bằng link ngoài, không upload lên máy chủ</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Dán link ảnh HTTPS từ Imgur, Catbox, Discord CDN, Google Drive direct image hoặc host ảnh khác. EdenVerse chỉ lưu đường dẫn, không lưu file ảnh vào database.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    name="coverImageUrl"
                    type="url"
                    value={gameForm.coverImageUrl}
                    onChange={(event) => updateGameForm("coverImageUrl", event.target.value)}
                    placeholder="Link ảnh cover, ví dụ: https://i.imgur.com/cover.jpg"
                    required
                  />
                  <Input
                    name="backgroundImageUrl"
                    type="url"
                    value={gameForm.backgroundImageUrl}
                    onChange={(event) => updateGameForm("backgroundImageUrl", event.target.value)}
                    placeholder="Link background/banner, có thể để trống"
                  />
                </div>
                <Textarea
                  name="galleryImageUrls"
                  value={gameForm.galleryImageUrls}
                  onChange={(event) => updateGameForm("galleryImageUrls", event.target.value)}
                  placeholder={"Link ảnh giới thiệu, mỗi dòng một ảnh:\nhttps://i.imgur.com/screen-1.jpg\nhttps://i.imgur.com/screen-2.jpg"}
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Thể loại game</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tìm nhanh hoặc tự thêm thể loại mới nếu danh sách chưa có.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:min-w-[420px]">
                    <Input
                      value={genreSearch}
                      onChange={(event) => setGenreSearch(event.target.value)}
                      placeholder="Tìm thể loại: RPG, Gothic, Adult VN..."
                    />
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Input
                        value={customGenre}
                        onChange={(event) => setCustomGenre(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCustomGenre();
                          }
                        }}
                        placeholder="Thêm thể loại"
                      />
                      <Button type="button" variant="secondary" onClick={addCustomGenre}>
                        Thêm
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedGenres.length ? (
                  <div className="flex flex-wrap gap-2 rounded-lg border border-primary/15 bg-primary/5 p-3">
                    {selectedGenres.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className="rounded-full border border-primary/25 bg-primary/12 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-primary/18"
                      >
                        {genre} ×
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto rounded-lg border border-white/8 bg-black/16 p-3">
                  {filteredGenres.length ? (
                    filteredGenres.map((genre) => {
                      const selected = selectedGenres.includes(genre);

                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenre(genre)}
                          className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.14em] transition ${
                            selected
                              ? "border-primary/40 bg-primary/15 text-primary"
                              : "border-white/10 bg-white/6 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">Không thấy thể loại phù hợp. Gõ tên ở ô “Thêm thể loại” rồi bấm Thêm.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Tag gợi ý</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.slice(0, 12).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.14em] transition ${
                        selectedTags.includes(tag)
                          ? "border-accent/40 bg-accent/12 text-accent"
                          : "border-white/10 bg-black/22 text-muted-foreground hover:border-accent/35 hover:text-foreground"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="downloadUrl"
                  value={gameForm.downloadUrl}
                  onChange={(event) => updateGameForm("downloadUrl", event.target.value)}
                  placeholder="Link tải / download hub"
                />
                <Input
                  name="seoTitle"
                  value={gameForm.seoTitle}
                  onChange={(event) => updateGameForm("seoTitle", event.target.value)}
                  placeholder="SEO title"
                />
              </div>
              <Textarea
                name="seoDescription"
                value={gameForm.seoDescription}
                onChange={(event) => updateGameForm("seoDescription", event.target.value)}
                placeholder="SEO description..."
              />

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
              {pendingGames.length ? (
                pendingGames.map((item) => (
                  <div key={item} className="rounded-lg border border-white/8 bg-black/18 p-4">
                    <p className="font-semibold text-foreground">{item}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Đang chờ kiểm tra ảnh, tag và mô tả.</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
                  <p className="font-semibold text-foreground">Không có game chờ duyệt</p>
                  <p className="mt-1 text-sm text-muted-foreground">Danh sách demo đã được reset, bài viết và game thật không bị xóa.</p>
                </div>
              )}
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
            {moderationQueue.length ? (
              moderationQueue.map((item) => (
                <div key={`${item.user}-${item.reason}`} className="rounded-lg border border-white/8 bg-black/18 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">@{item.user}</p>
                    <span className="rounded-md border border-accent/20 bg-accent/10 px-2 py-1 text-xs text-accent">
                      {item.risk}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
                <p className="font-semibold text-foreground">Không có báo cáo cộng đồng đang chờ</p>
                <p className="mt-1 text-sm text-muted-foreground">Các mục chờ duyệt demo đã được dọn sạch khỏi bảng quản trị.</p>
              </div>
            )}
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
              <Link2 className="h-5 w-5 text-primary" />
              <h3 className="font-display text-3xl text-foreground">Link ảnh nhanh</h3>
            </div>
            <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-6 text-sm leading-7 text-muted-foreground">
              Dùng link ảnh trực tiếp để đăng game nhanh hơn. Website chỉ lưu URL ảnh, không upload file lên server và không nhét ảnh nặng vào database.
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
              {auditEvents.length ? (
                auditEvents.map((event) => (
                  <div key={`${event.time}-${event.action}`} className="rounded-lg border border-white/8 bg-black/18 p-4">
                    <div className="flex items-center justify-between gap-3 text-xs uppercase text-muted-foreground">
                      <span>{event.time}</span>
                      <span>@{event.actor}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-foreground">{event.action}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
                  <p className="font-semibold text-foreground">Nhật ký demo đã reset</p>
                  <p className="mt-1 text-sm text-muted-foreground">Chưa có sự kiện quản trị mới trong phiên hiển thị này.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function PostListNotice({ text }: { text: string }) {
  return <p className="p-4 text-sm text-muted-foreground">{text}</p>;
}
