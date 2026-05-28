import { MessageSquare, ShieldAlert, ThumbsUp } from "lucide-react";
import type { Comment } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function CommentThread({ comments }: { comments: Comment[] }) {
  return (
    <Card>
      <CardContent className="space-y-6 p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-primary">Community</p>
          <h2 className="mt-2 font-display text-4xl text-foreground">Comments, replies, reports</h2>
        </div>
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-[24px] border border-white/8 bg-black/18 p-5">
              <div className="flex items-center gap-3">
                <Avatar src={comment.author.avatar} fallback={comment.author.name.slice(0, 2)} />
                <div>
                  <p className="font-semibold text-foreground">{comment.author.name}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{formatDate(comment.createdAt)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{comment.body}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-primary" />
                  {comment.likes} likes
                </span>
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-accent" />
                  {(comment.replies ?? []).length} replies
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  {comment.reports} reports
                </span>
              </div>
              {comment.replies?.length ? (
                <div className="mt-5 space-y-4 border-l border-white/8 pl-5">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="rounded-[20px] bg-white/4 p-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={reply.author.avatar} fallback={reply.author.name.slice(0, 2)} className="h-10 w-10" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{reply.author.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{reply.body}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
