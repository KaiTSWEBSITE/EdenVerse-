import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  src,
  fallback
}: {
  className?: string;
  src: string;
  fallback: string;
}) {
  return (
    <AvatarPrimitive.Root className={cn("relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full", className)}>
      <AvatarPrimitive.Image className="aspect-square h-full w-full object-cover" src={src} alt={fallback} />
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center bg-primary/20 text-xs font-semibold text-primary">
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
