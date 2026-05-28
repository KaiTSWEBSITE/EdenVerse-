"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppStore = {
  safeMode: boolean;
  ageVerified: boolean;
  themeVariant: "midnight" | "cathedral";
  bookmarks: string[];
  recentlyViewed: string[];
  toggleSafeMode: () => void;
  verifyAge: () => void;
  setThemeVariant: (variant: "midnight" | "cathedral") => void;
  toggleBookmark: (slug: string) => void;
  addRecentlyViewed: (slug: string) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      safeMode: true,
      ageVerified: false,
      themeVariant: "cathedral",
      bookmarks: [],
      recentlyViewed: [],
      toggleSafeMode: () => set((state) => ({ safeMode: !state.safeMode })),
      verifyAge: () => set({ ageVerified: true }),
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
