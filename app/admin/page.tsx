import { AdminPanel } from "@/components/admin/admin-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDashboardMetrics } from "@/services/analytics-service";

export default async function AdminPage() {
  const metrics = await getDashboardMetrics();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Bảng quản trị"
        title="Điều phối kiểm duyệt, xuất bản, upload và SEO trong một trung tâm"
        description="Khu admin được tổ chức như CMS thật: có số liệu tổng quan, trạng thái kiểm duyệt, soạn nháp, lịch đăng, metadata SEO và các thao tác vận hành nội dung."
      />
      <AdminPanel metrics={metrics} />
    </section>
  );
}
