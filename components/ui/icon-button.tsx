import { cn } from "@/lib/utils";

type IconButtonProps = Readonly<
  React.ComponentPropsWithoutRef<"button"> & { "aria-label": string }
>;

/** A square, icon-only control with a generous 40px hit area and a scale press. */
export function IconButton({
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "text-muted-foreground hover:text-ink hover:bg-surface-2 inline-flex size-10 items-center justify-center rounded-[6px] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
