import { BarChart3, FileText, ImageUp, MessageSquareWarning, ShieldBan, Tag } from "lucide-react";
import type { ComponentType } from "react";
import type { DashboardMetric, Post } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export function AdminPanel({
  metrics,
  posts
}: {
  metrics: DashboardMetric[];
  posts: Post[];
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="space-y-2 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{metric.label}</p>
              <p className="font-display text-4xl text-foreground">{metric.value}</p>
              <p className="text-sm text-primary">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-primary">CMS Post System</p>
                <h2 className="mt-2 font-display text-4xl text-foreground">Write, schedule, optimize</h2>
              </div>
              <Button>Publish draft</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Post title" />
              <Input placeholder="SEO title" />
              <Input placeholder="Thumbnail URL" />
              <Input placeholder="Schedule date" />
            </div>
            <Textarea placeholder="Markdown editor / rich text content..." className="min-h-[280px]" />
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="SEO description" />
              <Input placeholder="Tags, comma separated" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="font-display text-3xl text-foreground">Control Center</h3>
              {[
                { label: "Manage games", icon: BarChart3 },
                { label: "Upload artwork", icon: ImageUp },
                { label: "Moderate comments", icon: MessageSquareWarning },
                { label: "Ban users", icon: ShieldBan },
                { label: "Tag manager", icon: Tag },
                { label: "SEO manager", icon: FileText }
              ].map(({ label, icon: Component }) => {
                const Icon = Component as ComponentType<{ className?: string }>;
                return (
                  <div key={label} className="flex items-center justify-between rounded-[20px] border border-white/8 bg-black/18 px-4 py-3">
                    <div className="inline-flex items-center gap-3 text-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{label}</span>
                    </div>
                    <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Ready</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="font-display text-3xl text-foreground">Recent Posts</h3>
              <div className="space-y-3">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.slug} className="rounded-[20px] border border-white/8 bg-black/18 p-4">
                    <p className="font-semibold text-foreground">{post.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{post.category} • {post.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
