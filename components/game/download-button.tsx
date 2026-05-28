"use client";

import { Download } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { formatCompactNumber } from "@/lib/utils";

export function DownloadButton({ slug, initialDownloads }: { slug: string; initialDownloads: number }) {
  const [downloads, setDownloads] = useState(initialDownloads);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      onClick={() => {
        startTransition(async () => {
          const response = await fetch(`/api/games/${slug}/download`, { method: "POST" });
          const data = await response.json();
          if (response.ok) {
            setDownloads(data.downloads ?? downloads + 1);
            window.open(data.downloadUrl ?? `/games/${slug}#download`, "_blank", "noopener,noreferrer");
          }
        });
      }}
      disabled={isPending}
    >
      <Download className="h-4 w-4" />
      {isPending ? "Đang mở link..." : `Tải game (${formatCompactNumber(downloads)})`}
    </Button>
  );
}
