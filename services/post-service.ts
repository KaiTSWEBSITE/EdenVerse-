import { demoNewsPosts } from "@/database/demo-data";

export async function getAllPosts() {
  return demoNewsPosts;
}

export async function getPostBySlug(slug: string) {
  return demoNewsPosts.find((post) => post.slug === slug) ?? null;
}

export async function getLatestPosts(limit = 4) {
  return [...demoNewsPosts]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, limit);
}
