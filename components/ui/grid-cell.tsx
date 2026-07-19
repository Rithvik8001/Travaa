import { cn } from "@/lib/utils";

/**
 * A collapsed-hairline grid. `GridFrame` clips the group in a single outer
 * border; each `GridCell` pulls its top/left edge under its neighbour so shared
 * edges render as one crisp 1px hairline. The structural backbone of the
 * bordered layout — landing feature grids, the dashboard, product mocks.
 */
export function GridFrame({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  return <div className={cn("grid-frame bg-surface", className)} {...props} />;
}

export function GridCell({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  return <div className={cn("grid-cell", className)} {...props} />;
}
