import { cn } from "@/lib/utils";

type TextareaProps = Readonly<React.ComponentPropsWithoutRef<"textarea">>;

/** The Input treatment for multi-line entry (comments, notes). 16px text so iOS
 *  never zooms on focus, 14px from the sm breakpoint. */
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "border-border bg-surface text-ink placeholder:text-subtle-foreground w-full resize-none rounded-[6px] border px-3 py-2.5 text-[16px] leading-[1.55] transition-[border-color,box-shadow] duration-150 sm:text-[14px]",
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
