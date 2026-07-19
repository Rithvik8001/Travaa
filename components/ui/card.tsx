import { cn } from "@/lib/utils";

/**
 * The one card surface. A white panel defined by a hairline border, never a
 * shadow — borders do the structural work in this system. Radius and padding
 * are set by the caller (default is the 8px card radius).
 */
export function Card({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  return (
    <div
      className={cn(
        "bg-surface border-border rounded-[8px] border",
        className,
      )}
      {...props}
    />
  );
}
