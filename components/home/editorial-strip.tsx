import Link from "next/link";
import type { Post } from "@/types";
import { SectionHeading } from "@/components/ui/section-heading";

export function EditorialStrip({ posts }: { posts: Post[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Tin tức"
        title="Bản tin, cập nhật và góc nhìn cộng đồng"
        description="Theo dõi bản vá, game mới, bài đánh giá và các ghi chú tuyển chọn dành cho người chơi Visual Novel."
      />
      <div className="grid gap-6 lg:grid-cols-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/news/${post.slug}`}
            className="glass-panel group rounded-lg p-6 transition hover:-translate-y-1 hover:border-primary/20"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-primary">{post.category}</p>
            <h3 className="mt-4 font-display text-3xl text-foreground">{post.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-accent">Đọc bài viết</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
