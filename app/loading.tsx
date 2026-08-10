import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Cinematic Header Skeleton */}
      <div className="mb-12 animate-pulse space-y-4">
        <Skeleton className="h-6 w-32 rounded-full bg-primary/20" />
        <Skeleton className="h-14 w-3/4 max-w-2xl rounded-2xl bg-white/10" />
        <Skeleton className="h-4 w-1/2 max-w-xl rounded-full bg-white/5" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="glass-panel rounded-[28px] p-4 border-white/5 bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <Skeleton className="aspect-[4/5] w-full rounded-[24px] bg-white/5" />
            <div className="mt-5 space-y-3 px-2">
              <Skeleton className="h-6 w-2/3 rounded-lg bg-white/10" />
              <Skeleton className="h-4 w-full rounded-md bg-white/5" />
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="h-8 w-8 rounded-full bg-primary/20" />
                <Skeleton className="h-4 w-1/3 rounded-md bg-white/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
