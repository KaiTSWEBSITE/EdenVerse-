import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import { getCommentsForPost } from "@/services/community-service";
import { getPostBySlug } from "@/services/post-service";
import { CommentThread } from "@/components/community/comment-thread";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return post
    ? {
        title: post.seoTitle,
        description: post.seoDescription
      }
    : {};
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const [html, comments] = await Promise.all([renderMarkdown(post.content), getCommentsForPost(post.slug)]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-primary">{post.category}</p>
          <h1 className="mt-4 font-display text-5xl text-foreground sm:text-6xl">{post.title}</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
          <div className="edenverse-prose mt-10" dangerouslySetInnerHTML={{ __html: html }} />
        </CardContent>
      </Card>
      <div className="mt-8">
        <CommentThread comments={comments} />
      </div>
    </section>
  );
}
