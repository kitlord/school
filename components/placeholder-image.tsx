import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stand-in for a real photo. Drop an <Image> in its place once photos are
 * available — every gallery/hero/about image on the site renders through
 * this one component, so swapping the visual language later is a
 * single-file change.
 */
export function PlaceholderImage({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label ?? "Placeholder photo"}
      className={cn(
        "flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      <ImageIcon className="size-6 opacity-60" strokeWidth={1.5} />
      {label ? (
        <span className="px-2 text-center text-xs uppercase tracking-wide opacity-70">
          {label}
        </span>
      ) : null}
    </div>
  );
}
