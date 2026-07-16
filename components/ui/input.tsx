import { cn } from "@/lib/utils";

type InputProps = Readonly<React.ComponentPropsWithoutRef<"input">>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "border-border bg-surface text-ink placeholder:text-subtle-foreground w-full rounded-[11px] border px-[13px] py-[10px] text-[15.5px] transition-colors",
        "focus-visible:border-ring focus-visible:ring-ring/35 focus-visible:ring-2 focus-visible:outline-none",
        "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/30",
        "disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
