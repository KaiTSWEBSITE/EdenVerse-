import { NextResponse } from "next/server";
import { getAllPosts } from "@/services/post-service";

export async function GET() {
  const posts = await getAllPosts();
  return NextResponse.json({ posts });
}
