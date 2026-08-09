"use client";

import Link from "next/link";
import Image from "next/image";
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
import type { DashboardMetric, UserProfile } from "@/types";
import type { TranslatorSupportSettings } from "@/services/support-settings-service";
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
  fileSize: string;
  description: string;
  version: string;
  developer: string;
  engine: string;
  downloadUrl: string | null;
  downloadUrlAlt: string | null;
  downloadUrlJoyplay: string | null;
  downloadUrlSeason2: string | null;
  downloadUrlVip: string | null;
  downloadUrlAltVip: string | null;
  downloadUrlJoyplayVip: string | null;
  downloadUrlSeason2Vip: string | null;
  adminNote: string | null;
  adminNoteColor: string | null;
  downloadsCount: number;
  reviewCount: number;
  coverImage: string;
  coverZoom: number;
  coverPositionX: number;
  coverPositionY: number;
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
    starRatings: number;
  };
};

type AdminGameReportSummary = {
  id: string;
  gameSlug: string;
  issueType: string;
  title: string;
  description: string;
  contactEmail?: string | null;
  reporterId?: string | null;
  reporter?: {
    id: string;
    email: string;
    level: number;
    name: string;
    reputation: number;
    username: string;
  } | null;
  adminNote?: string | null;
  penalizedPoints: number;
  reviewedAt?: string | null;
  status: "OPEN" | "RESOLVED" | "REJECTED";
  createdAt: string;
};

type GameFormState = {
  title: string;
  version: string;
  developer: string;
  engine: string;
  platforms: string;
  languages: string;
  shortDescription: string;
  fileSize: string;
  description: string;
  coverImageUrl: string;
  coverZoom: string;
  coverPositionX: string;
  coverPositionY: string;
  backgroundImageUrl: string;
  galleryImageUrls: string;
  downloadUrl: string;
  downloadUrlAlt: string;
  downloadUrlJoyplay: string;
  downloadUrlSeason2: string;
  downloadUrlVip: string;
  downloadUrlAltVip: string;
  downloadUrlJoyplayVip: string;
  downloadUrlSeason2Vip: string;
  adminNote: string;
  adminNoteColor: string;
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
  fileSize: "",
  shortDescription: "",
  description: "",
  coverImageUrl: "",
  coverZoom: "1",
  coverPositionX: "50",
  coverPositionY: "50",
  backgroundImageUrl: "",
  galleryImageUrls: "",
  downloadUrl: "",
  downloadUrlAlt: "",
  downloadUrlJoyplay: "",
  downloadUrlSeason2: "",
  downloadUrlVip: "",
  downloadUrlAltVip: "",
  downloadUrlJoyplayVip: "",
  downloadUrlSeason2Vip: "",
  adminNote: "",
  adminNoteColor: "#d1a058",
  seoTitle: "",
  seoDescription: ""
};

const ADMIN_NOTE_FALLBACK_COLOR = "#d1a058";
const ADMIN_NOTE_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function getSafeAdminNoteColor(color: string | null | undefined) {
  return color && ADMIN_NOTE_COLOR_PATTERN.test(color) ? color : ADMIN_NOTE_FALLBACK_COLOR;
}

function getAdminApiMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const response = data as { message?: unknown; details?: unknown };
  const message = typeof response.message === "string" ? response.message : fallback;
  const details = Array.isArray(response.details)
    ? response.details.filter((detail): detail is string => typeof detail === "string" && Boolean(detail.trim()))
    : [];

  return details.length ? `${message}\n- ${details.join("\n- ")}` : message;
}

export function AdminPanel({
  heroIntro,
  metrics,
  supportSettings
}: {
  heroIntro: string;
  metrics: DashboardMetric[];
  supportSettings: TranslatorSupportSettings;
}) {
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
  const [reports, setReports] = useState<AdminGameReportSummary[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [penaltyIdentifier, setPenaltyIdentifier] = useState("");
  const [penaltyPoints, setPenaltyPoints] = useState("10");
  const [penaltyReason, setPenaltyReason] = useState("");
  const [penaltyMessage, setPenaltyMessage] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [supportForm, setSupportForm] = useState<TranslatorSupportSettings>(supportSettings);
  const [supportMessage, setSupportMessage] = useState("");
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
        return data.games as AdminGameSummary[];
      }

      setGameListMessage(data.message ?? "");
    } catch {
      setGameListMessage("Không thể tải danh sách game lúc này.");
    } finally {
      setGamesLoading(false);
    }

    return [];
  }

  async function loadGame(slug: string) {
    try {
      const response = await fetch(`/api/admin/games?slug=${encodeURIComponent(slug)}&ts=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-store"
        }
      });
      const data = await response.json();

      return data.game && typeof data.game === "object" ? (data.game as AdminGameSummary) : null;
    } catch {
      return null;
    }
  }

  async function loadReports() {
    setReportsLoading(true);

    try {
      const response = await fetch(`/api/admin/reports?ts=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-store"
        }
      });
      const data = await response.json();

      if (Array.isArray(data.reports)) {
        setReports(data.reports);
      }
      if (data.message) {
        setReportMessage(data.message);
      }
    } catch {
      setReportMessage("Có lỗi xảy ra, không thể kết nối server.");
    } finally {
      setReportsLoading(false);
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn báo cáo này không?")) return;
    try {
      const res = await fetch(`/api/admin/reports?id=${reportId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      }
      if (data.message) {
        setReportMessage(data.message);
      }
    } catch {
      setReportMessage("Có lỗi xảy ra khi xóa báo cáo.");
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setUserMessage("");
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch {
      setUserMessage("Không thể tải danh sách thành viên.");
    } finally {
      setUsersLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string, newVipTier: number) => {
    setUserMessage("Đang cập nhật...");
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole, vipTier: newVipTier })
      });
      const data = await response.json();
      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as any, vipTier: newVipTier } : u))
        );
      }
      setUserMessage(data.message || "Đã cập nhật.");
    } catch {
      setUserMessage("Lỗi khi cập nhật thành viên.");
    }
  };

  useEffect(() => {
    void loadPosts();
    void loadGames();
    void loadReports();
    void loadUsers();
  }, []);

  const genreOptions = Array.from(new Set([...GENRES, ...selectedGenres])).sort((first, second) =>
    first.localeCompare(second)
  );
  const engineOptions = Array.from(new Set([...ENGINES, gameForm.engine].filter(Boolean)));
  const filteredGenres = genreOptions
    .filter((genre) => genre.toLowerCase().includes(genreSearch.trim().toLowerCase()))
    .slice(0, 36);
  const supportQrPreviewUrl = supportForm.bankQrUrl.trim().startsWith("https://")
    ? supportForm.bankQrUrl.trim()
    : "";

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

  function updateSupportForm<K extends keyof TranslatorSupportSettings>(
    field: K,
    value: TranslatorSupportSettings[K]
  ) {
    setSupportForm((currentForm) => ({
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
      fileSize: game.fileSize || "",
      shortDescription: game.shortDescription,
      description: game.description,
      coverImageUrl: game.coverImage,
      coverZoom: String(game.coverZoom ?? 1),
      coverPositionX: String(game.coverPositionX ?? 50),
      coverPositionY: String(game.coverPositionY ?? 50),
      backgroundImageUrl: game.bannerImage,
      galleryImageUrls: game.gallery.join("\n"),
      downloadUrl: game.downloadUrl ?? "",
      downloadUrlAlt: game.downloadUrlAlt ?? "",
      downloadUrlJoyplay: game.downloadUrlJoyplay ?? "",
      downloadUrlSeason2: game.downloadUrlSeason2 ?? "",
      downloadUrlVip: game.downloadUrlVip ?? "",
      downloadUrlAltVip: game.downloadUrlAltVip ?? "",
      downloadUrlJoyplayVip: game.downloadUrlJoyplayVip ?? "",
      downloadUrlSeason2Vip: game.downloadUrlSeason2Vip ?? "",
      adminNote: game.adminNote ?? "",
      adminNoteColor: getSafeAdminNoteColor(game.adminNoteColor),
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
      downloadUrlAlt: gameForm.downloadUrlAlt || null,
      downloadUrlJoyplay: gameForm.downloadUrlJoyplay || null,
      downloadUrlSeason2: gameForm.downloadUrlSeason2 || null,
      downloadUrlVip: gameForm.downloadUrlVip || null,
      downloadUrlAltVip: gameForm.downloadUrlAltVip || null,
      downloadUrlJoyplayVip: gameForm.downloadUrlJoyplayVip || null,
      downloadUrlSeason2Vip: gameForm.downloadUrlSeason2Vip || null,
      adminNote: gameForm.adminNote || null,
      adminNoteColor: getSafeAdminNoteColor(gameForm.adminNoteColor),
      fileSize: gameForm.fileSize || "",
      shortDescription: gameForm.shortDescription,
      tagline: gameForm.shortDescription,
      coverImage: gameForm.coverImageUrl,
      coverZoom: Number(gameForm.coverZoom) || 1,
      coverPositionX: Number(gameForm.coverPositionX) || 50,
      coverPositionY: Number(gameForm.coverPositionY) || 50,
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

  async function submitSupportSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSupportMessage("Đang lưu trang ủng hộ...");

    const response = await fetch("/api/admin/support-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supportForm)
    });
    const data = await response.json();

    if (response.ok && data.supportSettings) {
      setSupportForm(data.supportSettings);
    }

    setSupportMessage(getAdminApiMessage(data, "Đã gửi yêu cầu cập nhật trang ủng hộ."));
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

  async function updateReportStatus(reportId: string, status: AdminGameReportSummary["status"], penalty = 0) {
    const note =
      penalty > 0
        ? window.prompt("Ghi lý do trừ điểm cho báo cáo sai/spam:", "Báo cáo sai hoặc gửi với mục đích giải trí.") ?? ""
        : "";

    if (penalty > 0 && !window.confirm(`Trừ ${penalty} danh tiếng của người gửi báo cáo này?`)) {
      return;
    }

    setReportMessage("Đang cập nhật báo cáo lỗi...");

    const response = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminNote: note,
        penaltyPoints: penalty,
        reportId,
        status
      })
    });
    const data = await response.json();
    setReportMessage(data.message ?? "Đã gửi yêu cầu xử lý báo cáo.");

    if (response.ok && data.report) {
      setReports((currentReports) =>
        currentReports.map((report) => (report.id === data.report.id ? data.report : report))
      );
    }
  }

  async function submitManualPenalty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPenaltyMessage("Đang trừ danh tiếng thành viên...");

    const response = await fetch("/api/admin/reputation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: penaltyIdentifier,
        points: penaltyPoints,
        reason: penaltyReason
      })
    });
    const data = await response.json();
    setPenaltyMessage(data.message ?? "Đã gửi yêu cầu trừ danh tiếng.");

    if (response.ok) {
      setPenaltyIdentifier("");
      setPenaltyReason("");
      await loadReports();
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

      setMessage(getAdminApiMessage(data, fallbackMessage));

      if (response.ok) {
        if (editingGame) {
          const savedGame = (data.game ?? getEditedGameSnapshot(editingGame)) as AdminGameSummary;
          const latestGame = await loadGame(savedGame.slug);
          const nextGame = latestGame ?? savedGame;
          setEditingGame(nextGame);
          setGameForm(gameToFormState(nextGame));
          setSelectedGenres(nextGame.genres);
          setSelectedTags(nextGame.tags);
          setGames((currentGames) =>
            currentGames.map((game) => (game.slug === nextGame.slug ? nextGame : game))
          );
        } else {
          resetGameForm();
        }
        const freshGames = await loadGames();

        if (editingGame) {
          const updatedGame = freshGames.find((game) => game.slug === editingGame.slug);

          if (updatedGame) {
            setEditingGame(updatedGame);
            setGameForm(gameToFormState(updatedGame));
            setSelectedGenres(updatedGame.genres);
            setSelectedTags(updatedGame.tags);
          }
        }
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
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Ủng hộ dịch giả</p>
              <h2 className="mt-2 font-display text-4xl text-foreground">Chỉnh QR, ngân hàng và lời cảm ơn</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Dán link ảnh QR HTTPS, nhập tên ngân hàng, số tài khoản, chủ tài khoản và lời cảm ơn. Trang ủng hộ sẽ tự cập nhật sau khi lưu.
              </p>
            </div>
            <Button type="submit" form="admin-support-settings-form" variant="accent">
              Lưu trang ủng hộ
            </Button>
          </div>

          <form id="admin-support-settings-form" onSubmit={submitSupportSettings} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                value={supportForm.translatorName}
                onChange={(event) => updateSupportForm("translatorName", event.target.value)}
                placeholder="Tên dịch giả / team dịch"
                required
              />
              <Input
                value={supportForm.bankQrUrl}
                onChange={(event) => updateSupportForm("bankQrUrl", event.target.value)}
                placeholder="Link ảnh QR ủng hộ, ví dụ https://i.imgur.com/qr.png"
              />
              <Input
                value={supportForm.bankName}
                onChange={(event) => updateSupportForm("bankName", event.target.value)}
                placeholder="Tên ngân hàng, ví dụ MBBank, Vietcombank..."
              />
              <Input
                value={supportForm.bankAccount}
                onChange={(event) => updateSupportForm("bankAccount", event.target.value)}
                placeholder="Số tài khoản"
              />
              <Input
                value={supportForm.bankOwner}
                onChange={(event) => updateSupportForm("bankOwner", event.target.value)}
                placeholder="Tên chủ tài khoản"
              />
              <Input
                value={supportForm.donationNote}
                onChange={(event) => updateSupportForm("donationNote", event.target.value)}
                placeholder="Nội dung chuyển khoản"
                required
              />
              <Input
                value={supportForm.momoUrl}
                onChange={(event) => updateSupportForm("momoUrl", event.target.value)}
                placeholder="Link MoMo nếu có"
              />
              <Input
                value={supportForm.paypalUrl}
                onChange={(event) => updateSupportForm("paypalUrl", event.target.value)}
                placeholder="Link PayPal nếu có"
              />
            </div>
            <Textarea
              value={supportForm.intro}
              onChange={(event) => updateSupportForm("intro", event.target.value)}
              placeholder="Câu giới thiệu trên trang ủng hộ..."
              className="min-h-[120px]"
              required
            />
            <Textarea
              value={supportForm.thankYouMessage}
              onChange={(event) => updateSupportForm("thankYouMessage", event.target.value)}
              placeholder="Lời cảm ơn gửi tới người ủng hộ..."
              className="min-h-[120px]"
              required
            />
            {supportForm.bankQrUrl ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Preview QR</p>
                {supportQrPreviewUrl ? (
                  <Image
                    src={supportQrPreviewUrl}
                    alt="Preview QR ủng hộ"
                    width={160}
                    height={160}
                    className="mt-3 h-40 w-40 rounded-xl bg-white object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Dán link bắt đầu bằng https:// để xem preview.</p>
                )}
              </div>
            ) : null}
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{supportForm.thankYouMessage.length}/700 ký tự lời cảm ơn</span>
            {supportMessage ? <span className="text-primary">{supportMessage}</span> : null}
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
                        <p className="break-words font-semibold text-foreground">{game.title}</p>
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-primary">
                          {game.version}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Slug: {game.slug}</span>
                        <span>Studio: {game.developer}</span>
                        <span>Lượt tải: {game.downloadsCount}</span>
                        <span>{game.downloadUrlAlt ? "Có link tải phụ" : "1 link tải"}</span>
                        {game.downloadUrlJoyplay ? <span>Có JoyPlay</span> : null}
                        {game.downloadUrlSeason2 ? <span>Có Season 2</span> : null}
                        <span>Bình luận: {game._count?.comments ?? 0}</span>
                        <span>Đánh giá sao: {game._count?.starRatings ?? game.reviewCount}</span>
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
                        <p className="break-words font-semibold text-foreground">{post.title}</p>
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
                <Input
                  name="fileSize"
                  value={gameForm.fileSize}
                  onChange={(event) => updateGameForm("fileSize", event.target.value)}
                  placeholder="Dung lượng game, ví dụ: 2.5 GB"
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
                    value={gameForm.coverImageUrl}
                    onChange={(event) => updateGameForm("coverImageUrl", event.target.value)}
                    placeholder="Link ảnh cover, ví dụ: https://i.imgur.com/cover.jpg"
                    required
                  />
                  <Input
                    name="backgroundImageUrl"
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
                <div className="space-y-4 rounded-xl border border-white/10 bg-black/18 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Cắt ảnh cover riêng cho game này</p>
                      <p className="mt-1 text-xs leading-6 text-muted-foreground">
                        Mặc định để Zoom 1.00, ngang 50, dọc 50. Chỉ tăng zoom khi ảnh gốc có viền đen/thừa như bị dư canvas.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        updateGameForm("coverZoom", "1");
                        updateGameForm("coverPositionX", "50");
                        updateGameForm("coverPositionY", "50");
                      }}
                    >
                      Reset crop
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="space-y-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Zoom {gameForm.coverZoom}
                      <Input
                        name="coverZoom"
                        type="range"
                        min="1"
                        max="1.6"
                        step="0.05"
                        value={gameForm.coverZoom}
                        onChange={(event) => updateGameForm("coverZoom", event.target.value)}
                      />
                    </label>
                    <label className="space-y-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Ngang {gameForm.coverPositionX}%
                      <Input
                        name="coverPositionX"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={gameForm.coverPositionX}
                        onChange={(event) => updateGameForm("coverPositionX", event.target.value)}
                      />
                    </label>
                    <label className="space-y-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Dọc {gameForm.coverPositionY}%
                      <Input
                        name="coverPositionY"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={gameForm.coverPositionY}
                        onChange={(event) => updateGameForm("coverPositionY", event.target.value)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ghi chú admin trên trang game</p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">
                      Dòng này sẽ nằm ở khoảng trống bên phải phần thông tin game. Chỉ lưu text thuần và màu hex để tránh mã độc.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Màu chữ</span>
                    <Input
                      aria-label="Chọn màu ghi chú admin"
                      type="color"
                      value={getSafeAdminNoteColor(gameForm.adminNoteColor)}
                      onChange={(event) => updateGameForm("adminNoteColor", event.target.value)}
                      className="h-8 w-12 cursor-pointer rounded-md border-white/10 p-1"
                    />
                  </div>
                </div>
                <Textarea
                  name="adminNote"
                  value={gameForm.adminNote}
                  onChange={(event) => updateGameForm("adminNote", event.target.value)}
                  placeholder="Ví dụ: Bản Việt hóa đã kiểm tra link tải, nên tải link chính trước. Nếu link lỗi hãy báo qua Discord."
                  className="min-h-[120px]"
                  maxLength={1200}
                />
                <div className="grid gap-3 md:grid-cols-[180px_1fr] md:items-center">
                  <Input
                    name="adminNoteColor"
                    value={gameForm.adminNoteColor}
                    onChange={(event) => updateGameForm("adminNoteColor", event.target.value.trim())}
                    placeholder="#d1a058"
                    maxLength={16}
                  />
                  <div className="rounded-xl border border-white/10 bg-black/24 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Preview</p>
                    <p
                      className="mt-2 whitespace-pre-line text-sm font-semibold leading-7"
                      style={{ color: getSafeAdminNoteColor(gameForm.adminNoteColor) }}
                    >
                      {gameForm.adminNote || "Ghi chú admin sẽ hiện ở đây với màu bạn chọn."}
                    </p>
                  </div>
                </div>
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
                  placeholder="Link tải chính / download hub"
                />
                <Input
                  name="downloadUrlAlt"
                  value={gameForm.downloadUrlAlt}
                  onChange={(event) => updateGameForm("downloadUrlAlt", event.target.value)}
                  placeholder="Link tải phụ / mirror dự phòng"
                />
                <Input
                  name="downloadUrlJoyplay"
                  value={gameForm.downloadUrlJoyplay}
                  onChange={(event) => updateGameForm("downloadUrlJoyplay", event.target.value)}
                  placeholder="Link tải JoyPlay / Android JoyPlay"
                />
                <Input
                  name="downloadUrlSeason2"
                  value={gameForm.downloadUrlSeason2}
                  onChange={(event) => updateGameForm("downloadUrlSeason2", event.target.value)}
                  placeholder="Link tải Season 2 / season tiếp theo"
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Link tải VIP (Tải trực tiếp, bỏ qua shortlink)</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    name="downloadUrlVip"
                    value={gameForm.downloadUrlVip}
                    onChange={(event) => updateGameForm("downloadUrlVip", event.target.value)}
                    placeholder="Link VIP chính"
                  />
                  <Input
                    name="downloadUrlAltVip"
                    value={gameForm.downloadUrlAltVip}
                    onChange={(event) => updateGameForm("downloadUrlAltVip", event.target.value)}
                    placeholder="Link VIP phụ"
                  />
                  <Input
                    name="downloadUrlJoyplayVip"
                    value={gameForm.downloadUrlJoyplayVip}
                    onChange={(event) => updateGameForm("downloadUrlJoyplayVip", event.target.value)}
                    placeholder="Link VIP JoyPlay"
                  />
                  <Input
                    name="downloadUrlSeason2Vip"
                    value={gameForm.downloadUrlSeason2Vip}
                    onChange={(event) => updateGameForm("downloadUrlSeason2Vip", event.target.value)}
                    placeholder="Link VIP Season 2"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
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
                <div className="whitespace-pre-line rounded-lg border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-primary">
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

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-3xl text-foreground">Báo cáo lỗi game</h3>
                <p className="mt-1 text-sm text-muted-foreground">Report người dùng gửi sẽ nằm ở đây để admin kiểm tra.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={loadReports} disabled={reportsLoading}>
                {reportsLoading ? "Đang tải..." : "Tải lại"}
              </Button>
            </div>
            <div className="max-h-[540px] space-y-3 overflow-y-auto pr-1">
              {reportsLoading ? (
                <div className="rounded-lg border border-white/8 bg-black/18 p-4 text-sm text-muted-foreground">
                  Đang tải báo cáo lỗi...
                </div>
              ) : reports.length ? (
                reports.map((report) => (
                  <div key={report.id} className="rounded-lg border border-white/8 bg-black/18 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{report.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-primary">
                          {report.gameSlug} • {report.issueType} • {report.status}
                        </p>
                      </div>
                      <span className="rounded-md border border-white/10 bg-white/6 px-2 py-1 text-xs text-muted-foreground">
                        {formatAdminDate(report.createdAt)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{report.description}</p>
                    <div className="mt-3 rounded-lg border border-white/8 bg-black/20 p-3 text-xs leading-6 text-muted-foreground">
                      Người gửi:{" "}
                      {report.reporter ? (
                        <span className="text-foreground">
                          @{report.reporter.username} • {report.reporter.reputation} danh tiếng • Lv {report.reporter.level}
                        </span>
                      ) : (
                        <span>Khách / {report.contactEmail ?? "không email"}</span>
                      )}
                      {report.penalizedPoints ? <span className="ml-2 text-accent">Đã trừ {report.penalizedPoints} điểm</span> : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => updateReportStatus(report.id, "RESOLVED")}>
                        Đã xử lý
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => updateReportStatus(report.id, "OPEN")}>
                        Mở lại
                      </Button>
                      <Button
                        type="button"
                        variant="accent"
                        size="sm"
                        onClick={() => updateReportStatus(report.id, "REJECTED", 10)}
                        disabled={!report.reporterId || Boolean(report.penalizedPoints)}
                      >
                        Trừ 10 điểm
                      </Button>
                      <Button
                        type="button"
                        variant="accent"
                        size="sm"
                        onClick={() => deleteReport(report.id)}
                        className="bg-red-600/20 text-red-500 hover:bg-red-600/40 hover:text-white"
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
                  <p className="font-semibold text-foreground">Chưa có báo cáo lỗi nào</p>
                  <p className="mt-1 text-sm text-muted-foreground">Khi người dùng gửi báo lỗi game, danh sách sẽ tự hiện ở đây.</p>
                </div>
              )}
            </div>
            {reportMessage ? <p className="text-sm text-primary">{reportMessage}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <ShieldBan className="h-5 w-5 text-accent" />
              <h3 className="font-display text-3xl text-foreground">Trừ danh tiếng</h3>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              Dùng khi member báo cáo sai, spam hoặc phá hệ thống. Nhập username hoặc email để trừ điểm thủ công.
            </p>
            <form onSubmit={submitManualPenalty} className="space-y-3">
              <Input
                value={penaltyIdentifier}
                onChange={(event) => setPenaltyIdentifier(event.target.value)}
                placeholder="username hoặc email"
                required
              />
              <Input
                value={penaltyPoints}
                onChange={(event) => setPenaltyPoints(event.target.value)}
                min="1"
                max="1000"
                type="number"
                placeholder="Số điểm cần trừ"
                required
              />
              <Textarea
                value={penaltyReason}
                onChange={(event) => setPenaltyReason(event.target.value)}
                placeholder="Lý do trừ điểm"
                required
              />
              <Button type="submit" variant="accent">
                Trừ điểm member
              </Button>
            </form>
            {penaltyMessage ? <p className="text-sm text-primary">{penaltyMessage}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-3xl text-foreground">Quản lý Thành viên</h3>
                <p className="mt-1 text-sm text-muted-foreground">Theo dõi và phân quyền (VIP, Chức vụ) cho các tài khoản.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={loadUsers} disabled={usersLoading}>
                {usersLoading ? "Đang tải..." : "Tải lại"}
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-muted-foreground">
                <thead className="border-b border-white/10 text-xs uppercase text-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Thành viên</th>
                    <th className="px-4 py-3 font-semibold">Cấp độ & Danh tiếng</th>
                    <th className="px-4 py-3 font-semibold">Chức vụ</th>
                    <th className="px-4 py-3 font-semibold">VIP Tier</th>
                    <th className="px-4 py-3 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.length ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Image
                              src={user.avatar}
                              alt={user.username}
                              width={32}
                              height={32}
                              className="rounded-full bg-black/40 object-cover"
                            />
                            <div>
                              <p className="font-semibold text-foreground">{user.name}</p>
                              <p className="text-xs">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p>Lv {user.level}</p>
                          <p className="text-xs text-primary">{user.reputation} điểm</p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-foreground focus:border-primary/50"
                            defaultValue={user.role}
                            id={`role-${user.id}`}
                          >
                            <option value="USER">USER</option>
                            <option value="MODERATOR">MODERATOR</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-foreground focus:border-primary/50"
                            defaultValue={user.vipTier ?? 0}
                            id={`vip-${user.id}`}
                          >
                            <option value="0">VIP 0 (Thường)</option>
                            <option value="1">VIP 1</option>
                            <option value="2">VIP 2</option>
                            <option value="3">VIP 3</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const roleEl = document.getElementById(`role-${user.id}`) as HTMLSelectElement;
                              const vipEl = document.getElementById(`vip-${user.id}`) as HTMLSelectElement;
                              updateUserRole(user.id, roleEl.value, parseInt(vipEl.value, 10));
                            }}
                          >
                            Lưu
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                        Chưa tải danh sách hoặc không có thành viên nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {userMessage ? <p className="text-sm text-primary">{userMessage}</p> : null}
          </CardContent>
        </Card>
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
