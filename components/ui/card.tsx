import { cn } from "@/lib/utils";

/**
 * The one card surface. A pure-white panel lifted a half-step off the paper
 * canvas by a layered shadow-as-border (1px ring + soft ambient), never a hard
 * border. Radius, padding, and any extra depth (`shadow-dialog` for a centered
 * card) are set by the caller.
 */
export function Card({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  return (
    <div
      className={cn("bg-surface shadow-card rounded-[18px]", className)}
      {...props}
    />
  );
}
