import { demoComments, demoReviews } from "@/database/demo-data";

export async function getCommentsForGame(slug: string) {
  return demoComments.filter((comment) => comment.gameSlug === slug && !comment.parentId);
}

export async function getCommentsForPost(slug: string) {
  return demoComments.filter((comment) => comment.postSlug === slug && !comment.parentId);
}

export async function getReviewsForGame(slug: string) {
  return demoReviews.filter((review) => review.gameSlug === slug);
}
