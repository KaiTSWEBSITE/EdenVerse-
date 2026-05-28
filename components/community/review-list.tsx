import { Star } from "lucide-react";
import type { Review } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <Card>
      <CardContent className="space-y-5 p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary">Community Reviews</p>
          <h2 className="mt-2 font-display text-4xl text-foreground">Ratings with reputation weight</h2>
        </div>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-[24px] border border-white/8 bg-black/18 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={review.author.avatar} fallback={review.author.name.slice(0, 2)} />
                  <div>
                    <p className="font-semibold text-foreground">{review.author.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Lv.{review.author.level} • {review.author.reputation} rep
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-accent">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold">{review.rating}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              <h3 className="mt-4 font-display text-2xl text-foreground">{review.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{review.body}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-primary">{review.helpful} helpful votes</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
