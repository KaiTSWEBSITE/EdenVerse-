"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppStore = {
  bookmarks: string[];
  recentlyViewed: string[];
  addRecentlyViewed: (slug: string) => void;
  toggleBookmark: (slug: string) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      bookmarks: [],
      recentlyViewed: [],
      addRecentlyViewed: (slug) =>
        set((state) => ({
          recentlyViewed: [slug, ...state.recentlyViewed.filter((value) => value !== slug)].slice(0, 12)
        })),
      toggleBookmark: (slug) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(slug)
            ? state.bookmarks.filter((value) => value !== slug)
            : [...state.bookmarks, slug]
        }))
    }),
    {
      name: "edenverse-store"
    }
  )
);
