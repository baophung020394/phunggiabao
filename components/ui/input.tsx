import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-card/50 px-3 py-2 text-sm backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
