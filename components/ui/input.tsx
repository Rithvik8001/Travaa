import { cn } from "@/lib/utils";

type InputProps = Readonly<React.ComponentPropsWithoutRef<"input">>;

/** Softly recessed field: warm sunken fill inside a card, blue focus ring. */
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "border-hairline bg-surface-sunken text-ink placeholder:text-subtle-foreground w-full rounded-[12px] border px-[14px] py-[11px] text-[15px] transition-[border-color,background,box-shadow] duration-150",
        "hover:border-[oklch(0.87_0.008_80)]",
        "focus-visible:border-ring focus-visible:bg-surface focus-visible:ring-ring/20 focus-visible:ring-[3px] focus-visible:outline-none",
        "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/20",
        "disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
