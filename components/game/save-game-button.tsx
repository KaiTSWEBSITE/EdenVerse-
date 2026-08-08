"use client";

import { Bookmark, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "@/context/app-store";
import { Button } from "@/components/ui/button";

export function SaveGameButton({
  slug,
  initialSaved = false,
  initialBookmarks = 0
}: {
  slug: string;
  initialSaved?: boolean;
  initialBookmarks?: number;
}) {
  const bookmarks = useAppStore((state) => state.bookmarks);
  const setBookmark = useAppStore((state) => state.setBookmark);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const saved = bookmarks.includes(slug);

  useEffect(() => {
    setBookmark(slug, initialSaved, initialBookmarks);
  }, [initialBookmarks, initialSaved, setBookmark, slug]);

  async function toggleSave() {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.message ?? "Chưa thể lưu game lúc này.");
        return;
      }

      setBookmark(slug, Boolean(data.saved), Number(data.bookmarks ?? initialBookmarks));
      setMessage(data.message ?? (data.saved ? "Đã lưu game." : "Đã bỏ lưu game."));
    } catch {
      setMessage("Không kết nối được tới hệ thống lưu game.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="secondary" onClick={toggleSave} aria-pressed={saved} disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        {saved ? "Đã lưu game" : "Lưu vào danh sách"}
      </Button>
      {message ? <p className="max-w-xs text-sm text-primary">{message}</p> : null}
    </div>
  );
}
