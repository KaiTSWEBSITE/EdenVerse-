import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAllPosts } from "@/services/post-service";

export default async function NewsPage() {
  const posts = await getAllPosts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Newsroom"
        title="Editorial, release radar, and premium patch coverage"
        description="A production-ready content surface for platform announcements, patch notes, curated releases, and opinion pieces."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/news/${post.slug}`} className="glass-panel rounded-[28px] p-6 transition hover:-translate-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">{post.category}</p>
            <h2 className="mt-4 font-display text-4xl text-foreground">{post.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
            <p className="mt-6 text-xs uppercase tracking-[0.22em] text-accent">Open article</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
