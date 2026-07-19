import { cn } from "@/lib/utils";

/** A mono keycap — used for shortcuts and small inline metadata chips. */
export function Kbd({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"kbd">>) {
  return (
    <kbd
      className={cn(
        "border-border bg-surface-2 text-muted-foreground inline-flex items-center rounded-[4px] border px-1.5 py-0.5 font-mono text-[11px] leading-none",
        className,
      )}
      {...props}
    />
  );
}
