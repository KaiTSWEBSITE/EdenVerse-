"use client";

import { Bookmark, Check } from "lucide-react";
import { useAppStore } from "@/context/app-store";
import { Button } from "@/components/ui/button";

export function SaveGameButton({ slug }: { slug: string }) {
  const bookmarks = useAppStore((state) => state.bookmarks);
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);
  const saved = bookmarks.includes(slug);

  return (
    <Button type="button" variant="secondary" onClick={() => toggleBookmark(slug)} aria-pressed={saved}>
      {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Đã lưu game" : "Lưu vào danh sách"}
    </Button>
  );
}
