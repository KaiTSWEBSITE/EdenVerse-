import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:bg-black/40",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
