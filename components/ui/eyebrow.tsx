import { cn } from "@/lib/utils";

/** A small uppercase section label with a blue dot — the system's quietest signal. */
export function Eyebrow({
  className,
  children,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  return (
    <div
      className={cn(
        "text-muted-foreground inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] uppercase",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="bg-brand size-[6px] rounded-full" />
      {children}
    </div>
  );
}
