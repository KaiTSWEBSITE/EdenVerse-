import Link from "next/link";
import { Sparkles, Flame, Clock, Heart, Gamepad2, Swords, Ghost, Laugh, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "hot", label: "Đang thịnh hành", icon: Flame, href: "/search?sort=hot", color: "text-orange-500" },
  { id: "new", label: "Mới cập nhật", icon: Clock, href: "/search?sort=new", color: "text-blue-400" },
  { id: "rpg", label: "Nhập vai", icon: Swords, href: "/search?q=RPG", color: "text-purple-400" },
  { id: "action", label: "Hành động", icon: Gamepad2, href: "/search?q=Action", color: "text-red-400" },
  { id: "horror", label: "Kinh dị", icon: Ghost, href: "/search?q=Horror", color: "text-gray-400" },
  { id: "comedy", label: "Hài hước", icon: Laugh, href: "/search?q=Comedy", color: "text-yellow-400" },
  { id: "vn", label: "Visual Novel", icon: BookOpen, href: "/search?q=Visual%20Novel", color: "text-pink-400" },
  { id: "favorites", label: "Được yêu thích", icon: Heart, href: "/search?sort=rating", color: "text-rose-500" },
  { id: "quality", label: "Đáng chơi", icon: Sparkles, href: "/search?q=Quality", color: "text-cyan-400" },
];

export function QuickDiscovery() {
  return (
    <section className="w-full border-y border-white/5 bg-noir-surface/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-4 py-4 sm:px-6 lg:px-8 hide-scrollbar">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap mr-2">Khám phá nhanh:</span>
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={category.href as any}
                className={cn(
                  "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2",
                  "text-sm font-medium text-foreground transition-all duration-300",
                  "hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                )}
              >
                <Icon className={cn("h-4 w-4", category.color)} />
                <span className="whitespace-nowrap">{category.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
