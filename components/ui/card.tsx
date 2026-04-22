import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)]",
        className,
      )}
      {...props}
    />
  );
}
