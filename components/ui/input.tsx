import { cn } from "@/lib/utils";

type InputProps = Readonly<React.ComponentPropsWithoutRef<"input">>;

/** Bordered field on a white surface; focus lifts the border and adds the lime
 *  ring. 16px text so iOS never zooms on focus, 14px from the sm breakpoint. */
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "border-border bg-surface text-ink placeholder:text-subtle-foreground w-full rounded-[6px] border px-3 py-2.5 text-[16px] transition-[border-color,box-shadow] duration-150 sm:text-[14px]",
        "hover:border-border-strong",
        "focus-visible:border-border-strong focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
        "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/40",
        "disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
