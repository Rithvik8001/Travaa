import { cn } from "@/lib/utils";

/**
 * A collapsed-hairline grid. `GridFrame` clips the group in a single outer
 * border; each `GridCell` pulls its top/left edge under its neighbour so shared
 * edges render as one crisp 1px hairline. The structural backbone of the
 * bordered layout — landing feature grids, the dashboard, product mocks.
 *
 * Prefer `GridFrame` for wrappers. On semantic children that can't be a `div`
 * (links, articles, list items), apply the `grid-cell` class directly.
 */
export function GridFrame({
  as = "div",
  className,
  children,
  ...props
}: Readonly<
  {
    readonly as?: "div" | "ol" | "ul";
    readonly className?: string;
    readonly children?: React.ReactNode;
  } & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">
>) {
  const Tag = as;
  return (
    <Tag className={cn("grid-frame bg-surface", className)} {...props}>
      {children}
    </Tag>
  );
}

export function GridCell({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  return <div className={cn("grid-cell", className)} {...props} />;
}
