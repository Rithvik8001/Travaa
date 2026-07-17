import { cn } from "@/lib/utils";

/** A small pill-style section label with a dot and the accent — warm, quiet. */
export function Eyebrow({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div
      className={cn(
        "border-hairline bg-surface text-muted-foreground inline-flex items-center gap-2 rounded-full border py-[5px] pr-3.5 pl-2.5 text-[12.5px] font-medium",
        className,
      )}
    >
      <span aria-hidden className="bg-brand size-[6px] rounded-full" />
      {children}
    </div>
  );
}
