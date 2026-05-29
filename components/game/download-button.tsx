"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCompactNumber } from "@/lib/utils";

type DownloadMirror = "primary" | "backup";

export function DownloadButton({
  slug,
  initialDownloads,
  hasBackup
}: {
  slug: string;
  initialDownloads: number;
  hasBackup?: boolean;
}) {
  const [downloads, setDownloads] = useState(initialDownloads);
  const [pendingMirror, setPendingMirror] = useState<DownloadMirror | null>(null);
  const [message, setMessage] = useState("");

  async function openDownload(mirror: DownloadMirror) {
    if (pendingMirror) {
      return;
    }

    setPendingMirror(mirror);
    setMessage("");

    try {
      const response = await fetch(`/api/games/${slug}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mirror })
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setDownloads((currentDownloads) => data.downloads ?? currentDownloads + 1);
        window.open(data.downloadUrl ?? `/games/${slug}#download`, "_blank", "noopener,noreferrer");
      } else {
        setMessage(data.message ?? "Chưa mở được link tải, thử lại sau một chút.");
      }
    } catch {
      setMessage("Không kết nối được tới hệ thống tải. Kiểm tra mạng rồi thử lại.");
    } finally {
      setPendingMirror(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => openDownload("primary")} disabled={Boolean(pendingMirror)}>
          <Download className="h-4 w-4" />
          {pendingMirror === "primary" ? "Đang mở link..." : `Tải link chính (${formatCompactNumber(downloads)})`}
        </Button>
        {hasBackup ? (
          <Button variant="secondary" onClick={() => openDownload("backup")} disabled={Boolean(pendingMirror)}>
            <Download className="h-4 w-4" />
            {pendingMirror === "backup" ? "Đang mở dự phòng..." : "Link tải phụ"}
          </Button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-primary">{message}</p> : null}
    </div>
  );
}
