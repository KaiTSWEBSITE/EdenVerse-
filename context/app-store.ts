"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppStore = {
  bookmarks: string[];
  bookmarkCounts: Record<string, number>;
  recentlyViewed: string[];
  addRecentlyViewed: (slug: string) => void;
  setBookmark: (slug: string, saved: boolean, count?: number) => void;
  setBookmarkCount: (slug: string, count: number) => void;
  toggleBookmark: (slug: string) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      bookmarks: [],
      bookmarkCounts: {},
      recentlyViewed: [],
      addRecentlyViewed: (slug) =>
        set((state) => ({
          recentlyViewed: [slug, ...state.recentlyViewed.filter((value) => value !== slug)].slice(0, 12)
        })),
      setBookmark: (slug, saved, count) =>
        set((state) => ({
          bookmarks: saved
            ? Array.from(new Set([...state.bookmarks, slug]))
            : state.bookmarks.filter((value) => value !== slug),
          bookmarkCounts:
            typeof count === "number"
              ? {
                  ...state.bookmarkCounts,
                  [slug]: Math.max(0, count)
                }
              : state.bookmarkCounts
        })),
      setBookmarkCount: (slug, count) =>
        set((state) => ({
          bookmarkCounts: {
            ...state.bookmarkCounts,
            [slug]: Math.max(0, count)
          }
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
