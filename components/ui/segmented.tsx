import { cn } from "@/lib/utils";

/** The bordered track that holds a set of mutually-exclusive segments. */
export function SegmentedGroup({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  return (
    <div
      role="group"
      className={cn(
        "bg-surface-2 border-border inline-flex items-center gap-0.5 rounded-[8px] border p-[3px]",
        className,
      )}
      {...props}
    />
  );
}

/** Class for a single segment. The active one lifts onto a bordered white chip. */
export function segmentedItemClass(active: boolean, className?: string) {
  return cn(
    "relative rounded-[6px] border px-3 py-[6px] text-[13px] font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    active
      ? "bg-surface text-ink border-border"
      : "text-muted-foreground hover:text-ink border-transparent",
    className,
  );
}
