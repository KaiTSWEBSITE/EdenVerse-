import Link from "next/link";
import { Heart, Sword, Sparkles, Flame, Shield, Ghost, Coffee, Compass } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const CATEGORIES = [
  { name: "Romance", icon: Heart, color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20", query: "Romance" },
  { name: "Fantasy", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", query: "Fantasy" },
  { name: "Action", icon: Sword, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", query: "Action" },
  { name: "18+", icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", query: "18+" },
  { name: "RPG", icon: Shield, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", query: "RPG" },
  { name: "Horror", icon: Ghost, color: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/20", query: "Horror" },
  { name: "Slice of Life", icon: Coffee, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", query: "Slice of Life" },
  { name: "Adventure", icon: Compass, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", query: "Adventure" },
];

export function CategorySection() {
  return (
    <Reveal>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading 
          eyebrow="Khám phá" 
          title="Thể loại phổ biến" 
          description="Tìm kiếm nhanh các tựa game theo thể loại yêu thích của bạn."
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={`/search?q=${encodeURIComponent(category.query)}`}
                className={`flex items-center gap-3 rounded-xl border ${category.border} ${category.bg} p-4 transition-all hover:scale-105 hover:bg-white/10`}
              >
                <div className={`rounded-full bg-black/40 p-2.5 ${category.color} backdrop-blur-md`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-display font-medium text-foreground text-sm sm:text-base">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </Reveal>
  );
}
