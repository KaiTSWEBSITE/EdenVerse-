"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppStore = {
  themeVariant: "midnight" | "cathedral";
  bookmarks: string[];
  recentlyViewed: string[];
  setThemeVariant: (variant: "midnight" | "cathedral") => void;
  toggleBookmark: (slug: string) => void;
  addRecentlyViewed: (slug: string) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      themeVariant: "cathedral",
      bookmarks: [],
      recentlyViewed: [],
      setThemeVariant: (themeVariant) => set({ themeVariant }),
      toggleBookmark: (slug) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(slug)
            ? state.bookmarks.filter((value) => value !== slug)
            : [...state.bookmarks, slug]
        })),
      addRecentlyViewed: (slug) =>
        set((state) => ({
          recentlyViewed: [slug, ...state.recentlyViewed.filter((value) => value !== slug)].slice(0, 12)
        }))
    }),
    {
      name: "edenverse-store"
    }
  )
);
