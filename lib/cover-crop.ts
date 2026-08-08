import type { CSSProperties } from "react";
import type { Game } from "@/types";

function clampNumber(value: number | undefined, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

export function getCoverCropStyle(game: Pick<Game, "coverZoom" | "coverPositionX" | "coverPositionY">): CSSProperties {
  const positionX = clampNumber(game.coverPositionX, 0, 100, 50);
  const positionY = clampNumber(game.coverPositionY, 0, 100, 50);

  return {
    objectPosition: `${positionX}% ${positionY}%`
  };
}
