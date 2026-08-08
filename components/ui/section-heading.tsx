import { Badge } from "@/components/ui/badge";

export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 space-y-3">
      {/* Eyebrow badge with glow */}
      <div className="flex items-center gap-3">
        <Badge className="glow-badge">{eyebrow}</Badge>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/28 to-transparent" />
      </div>

      {/* Title with gradient left accent border */}
      <div className="space-y-2">
        <h2 className="heading-accent font-display text-3xl text-foreground sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-3xl pl-4 text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
        {/* Gradient divider */}
        <div className="section-divider ml-4" />
      </div>
    </div>
  );
}
