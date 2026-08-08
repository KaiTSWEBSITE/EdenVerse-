"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { formatCompactNumber, formatRating } from "@/lib/utils";

function getRatingTier(rating: number) {
  if (rating >= 9.2) {
    return "S-tier";
  }

  if (rating >= 8.5) {
    return "A-tier";
  }

  if (rating >= 7) {
    return "B-tier";
  }

  if (rating > 0) {
    return "Đang lên";
  }

  return "Chưa xếp loại";
}

export function GameStarRating({
  slug,
  initialRating,
  initialReviewCount
}: {
  slug: string;
  initialRating: number;
  initialReviewCount: number;
}) {
  const [rating, setRating] = useState(initialRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const activeStars = hovered || selected || Math.round(rating / 2);

  async function submitRating(nextRating: number) {
    if (pending) {
      return;
    }

    setPending(true);
    setSelected(nextRating);
    setMessage("Đang lưu đánh giá...");

    try {
      const response = await fetch(`/api/games/${slug}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: nextRating })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.message ?? "Chưa lưu được đánh giá, thử lại sau nhé.");
        return;
      }

      setRating(typeof data.rating === "number" ? data.rating : nextRating * 2);
      setReviewCount(typeof data.reviewCount === "number" ? data.reviewCount : reviewCount + 1);
      setMessage(data.message ?? "Đã lưu đánh giá của bạn.");
    } catch {
      setMessage("Không kết nối được hệ thống đánh giá, kiểm tra mạng rồi thử lại.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Đánh sao & xếp loại</p>
          <p className="mt-2 font-display text-3xl text-foreground">
            {formatRating(rating)} <span className="text-lg text-primary">/ {getRatingTier(rating)}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{formatCompactNumber(reviewCount)} lượt đánh giá</p>
        </div>
        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`Chấm ${star} sao`}
              disabled={pending}
              onMouseEnter={() => setHovered(star)}
              onFocus={() => setHovered(star)}
              onClick={() => submitRating(star)}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:-translate-y-0.5 hover:text-accent disabled:pointer-events-none disabled:opacity-60"
            >
              <Star
                className={`h-7 w-7 ${
                  star <= activeStars ? "fill-accent text-accent drop-shadow-[0_0_10px_rgba(255,199,91,0.35)]" : ""
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
    </div>
  );
}
