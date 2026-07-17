import { cn } from "@/lib/utils";

type InputProps = Readonly<React.ComponentPropsWithoutRef<"input">>;

/** Softly recessed field: a sunken fill inside a white card that lifts to surface
 *  on focus with a blue ring. 16px text so iOS never zooms on focus. */
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "border-hairline bg-surface-sunken text-ink placeholder:text-subtle-foreground w-full rounded-[12px] border px-[14px] py-[11px] text-[16px] transition-[border-color,background-color,box-shadow] duration-150 sm:text-[15px]",
        "hover:border-border",
        "focus-visible:border-ring focus-visible:bg-surface focus-visible:ring-ring/18 focus-visible:ring-[3px] focus-visible:outline-none",
        "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/18",
        "disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
