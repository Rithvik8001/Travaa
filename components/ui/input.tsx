import { cn } from "@/lib/utils";

type InputProps = Readonly<React.ComponentPropsWithoutRef<"input">>;

/** Recessed field: sits a shade below the white card it lives on. */
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "border-hairline bg-background text-ink placeholder:text-subtle-foreground w-full rounded-[11px] border px-[14px] py-[11px] text-[15px] transition-colors",
        "focus-visible:border-ring focus-visible:bg-surface focus-visible:ring-ring/25 focus-visible:ring-2 focus-visible:outline-none",
        "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/25",
        "disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
