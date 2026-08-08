"use client";

import { AlertTriangle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const issueTypes = [
  { label: "Link tải lỗi", value: "download" },
  { label: "Game bị crash", value: "crash" },
  { label: "Sai phiên bản", value: "wrong_version" },
  { label: "Thiếu file", value: "missing_file" },
  { label: "Link hỏng / die", value: "bad_link" },
  { label: "Lỗi khác", value: "other" }
];

export function GameReportForm({ gameSlug, gameTitle }: { gameSlug: string; gameTitle: string }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("Đang gửi báo cáo lỗi...");

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/games/${gameSlug}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactEmail: formData.get("contactEmail"),
        description: formData.get("description"),
        issueType: formData.get("issueType"),
        title: formData.get("title")
      })
    });
    const data = await response.json();

    setSubmitting(false);
    setMessage(data.message ?? "Không thể gửi báo cáo lúc này.");

    if (response.ok) {
      event.currentTarget.reset();
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <AlertTriangle className="h-4 w-4" />
              Báo lỗi game
            </div>
            <h2 className="mt-3 font-display text-4xl text-foreground">Gặp lỗi với {gameTitle}?</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Gửi nhanh lỗi link tải, phiên bản, file thiếu hoặc lỗi chạy game để quản trị viên kiểm tra.
            </p>
          </div>

          <form onSubmit={submitReport} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <select
                name="issueType"
                required
                className="h-12 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-foreground focus:border-primary/50"
                defaultValue="download"
              >
                {issueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <Input name="contactEmail" placeholder="Email liên hệ nếu cần, không bắt buộc" type="email" />
            </div>
            <Input name="title" placeholder="Tóm tắt lỗi, ví dụ: Link Android bị hỏng" required />
            <Textarea
              className="min-h-[130px]"
              name="description"
              placeholder="Mô tả lỗi rõ hơn: thiết bị, phiên bản, bước xảy ra lỗi..."
              required
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled={submitting} type="submit">
                <Send className="h-4 w-4" />
                {submitting ? "Đang gửi..." : "Gửi báo lỗi"}
              </Button>
              {message ? <p className="text-sm text-primary">{message}</p> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
