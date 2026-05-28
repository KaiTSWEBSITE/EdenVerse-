import { AdminPanel } from "@/components/admin/admin-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDashboardMetrics } from "@/services/analytics-service";
import { getHeroIntro } from "@/services/site-settings-service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [heroIntro, metrics] = await Promise.all([getHeroIntro(), getDashboardMetrics()]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Bảng quản trị"
        title="Điều phối kiểm duyệt, xuất bản, upload và SEO trong một trung tâm"
        description="Khu admin được tổ chức như CMS thật: có số liệu tổng quan, trạng thái kiểm duyệt, soạn nháp, lịch đăng, metadata SEO và các thao tác vận hành nội dung."
      />
      <AdminPanel heroIntro={heroIntro} metrics={metrics} />
    </section>
  );
}
