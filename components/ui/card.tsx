import { cn } from "@/lib/utils";

/**
 * The one card surface, used everywhere a card is: a warm-white panel with a
 * generous radius, a warm hairline, and a soft ambient shadow. Padding and any
 * extra depth (e.g. `shadow-dialog` for a centered card) are set by the caller.
 */
export function Card({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  return (
    <div
      className={cn(
        "bg-surface border-hairline shadow-card rounded-[20px] border",
        className,
      )}
      {...props}
    />
  );
}
