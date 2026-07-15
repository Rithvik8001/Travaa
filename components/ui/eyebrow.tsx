import { cn } from "@/lib/utils";

/** Small uppercase section label in the brand ink. */
export function Eyebrow({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div
      className={cn(
        "text-brand-ink text-[12.5px] font-semibold tracking-[0.06em] uppercase",
        className,
      )}
    >
      {children}
    </div>
  );
}
