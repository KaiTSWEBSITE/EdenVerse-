import type { RoleOption } from "@/constants/roles";

export type Role = RoleOption;

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: Role;
  level: number;
  reputation: number;
}

export interface UserProfile extends UserSummary {
  email: string;
  banner: string;
  bio: string;
  favoriteGames: string[];
  savedGames: string[];
  recentlyViewed: string[];
  watchlist: string[];
  allowMatureContent: boolean;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  description: string;
  story: string;
  version: string;
  developer: string;
  engine: string;
  releaseDate: string;
  updatedAt: string;
  rating: number;
  reviewCount: number;
  popularityScore: number;
  bookmarks: number;
  downloads: number;
  mature: boolean;
  featured: boolean;
  hero: boolean;
  coverImage: string;
  bannerImage: string;
  gallery: string[];
  trailerUrl: string;
  downloadUrl?: string;
  genres: string[];
  tags: string[];
  platforms: string[];
  languages: string[];
}

export interface Comment {
  id: string;
  body: string;
  gameSlug?: string;
  postSlug?: string;
  parentId?: string;
  createdAt: string;
  likes: number;
  reports: number;
  author: UserSummary;
  replies?: Comment[];
}

export interface Review {
  id: string;
  gameSlug: string;
  rating: number;
  title: string;
  body: string;
  helpful: number;
  createdAt: string;
  author: UserSummary;
}

export interface SearchFilters {
  q?: string;
  genre?: string;
  engine?: string;
  tag?: string;
  mature?: "all" | "adult";
  sort?: "trending" | "rating" | "updated" | "popular";
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
}
