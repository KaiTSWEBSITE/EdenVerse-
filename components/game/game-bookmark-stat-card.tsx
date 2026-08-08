"use client";

import { Heart } from "lucide-react";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/context/app-store";
import { formatCompactNumber } from "@/lib/utils";

export function GameBookmarkStatCard({
  slug,
  initialBookmarks
}: {
  slug: string;
  initialBookmarks: number;
}) {
  const bookmarksCount = useAppStore((state) => state.bookmarkCounts[slug] ?? initialBookmarks);
  const setBookmarkCount = useAppStore((state) => state.setBookmarkCount);

  useEffect(() => {
    setBookmarkCount(slug, initialBookmarks);
  }, [initialBookmarks, setBookmarkCount, slug]);

  return (
    <Card className="bg-black/18">
      <CardContent className="space-y-2">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Heart className="h-4 w-4 text-primary" />
          Lượt lưu
        </span>
        <p className="font-display text-4xl text-foreground">{formatCompactNumber(bookmarksCount)}</p>
        <p className="text-sm text-muted-foreground">người dùng lưu</p>
      </CardContent>
    </Card>
  );
}
