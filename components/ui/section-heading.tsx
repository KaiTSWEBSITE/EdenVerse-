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
      <Badge>{eyebrow}</Badge>
      <div className="space-y-2">
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">{title}</h2>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
      </div>
    </div>
  );
}
