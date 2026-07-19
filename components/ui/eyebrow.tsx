import { cn } from "@/lib/utils";

/** A small mono uppercase section label with a lime tick — the quietest signal
 *  and the only place a splash of accent appears in running content. */
export function Eyebrow({
  className,
  children,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  return (
    <div
      className={cn(
        "text-muted-foreground inline-flex items-center gap-2 font-mono text-[12px] font-medium tracking-[0.12em] uppercase",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="bg-accent size-[6px] rounded-[1px]" />
      {children}
    </div>
  );
}
