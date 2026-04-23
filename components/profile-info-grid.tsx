import { Github, Linkedin, Mail, MapPin, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileInfoGridProps = {
  className?: string;
  /** Compact padding for popover */
  compact?: boolean;
  singleColumn?: boolean;
};

export function ProfileInfoGrid({ className, compact, singleColumn }: ProfileInfoGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2 text-sm text-foreground/90",
        singleColumn ? "grid-cols-1" : "sm:grid-cols-2",
        compact && "text-xs sm:text-sm",
        className,
      )}
    >
      <p className="inline-flex items-center gap-2">
        <UserRound className="h-4 w-4 shrink-0 text-primary" />
        Age: 32
      </p>
      <p className="inline-flex items-center gap-2">
        <Mail className="h-4 w-4 shrink-0 text-primary" />
        <a href="mailto:bao.future94@gmail.com" className="truncate hover:text-primary">
          bao.future94@gmail.com
        </a>
      </p>
      <p className="inline-flex items-center gap-2">
        <Github className="h-4 w-4 shrink-0 text-primary" />
        <a
          href="https://github.com/baophung020394"
          target="_blank"
          rel="noopener noreferrer"
          className="truncate hover:text-primary"
        >
          github.com/baophung020394
        </a>
      </p>
      <p className="inline-flex items-center gap-2">
        <Linkedin className="h-4 w-4 shrink-0 text-primary" />
        <a
          href="https://linkedin.com/in/phunggiabao"
          target="_blank"
          rel="noopener noreferrer"
          className="truncate hover:text-primary"
        >
          linkedin.com/in/phunggiabao
        </a>
      </p>
      <p className={cn("inline-flex items-center gap-2", !singleColumn && "sm:col-span-2")}>
        <MapPin className="h-4 w-4 shrink-0 text-primary" />
        Ho Chi Minh City, Viet Nam
      </p>
    </div>
  );
}
