import { AdminPanel } from "@/components/admin/admin-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDashboardMetrics } from "@/services/analytics-service";
import { getAllPosts } from "@/services/post-service";

export default async function AdminPage() {
  const [metrics, posts] = await Promise.all([getDashboardMetrics(), getAllPosts()]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Admin Panel"
        title="Moderation, publishing, uploads, and SEO from one command room"
        description="The admin surface is structured like a real CMS: analytics, moderation state, draft publishing, metadata controls, and content operations are already mapped into the architecture."
      />
      <AdminPanel metrics={metrics} posts={posts} />
    </section>
  );
}
