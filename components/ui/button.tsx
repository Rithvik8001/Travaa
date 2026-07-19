import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Shared by Button and CtaLink so the nav CTA and a form's submit button stay
 * the same object rendered as <a> or <button>. Rectangular, small-radius
 * controls — no pills. `solid` is the one accent moment (lime fill, ink text);
 * everything else is bordered or ghost. Depth is a border, never a shadow.
 */
export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[6px] font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        /** The one accent moment — lime fill, ink text. */
        solid:
          "bg-accent text-accent-foreground border border-transparent font-semibold hover:bg-accent-hover",
        /** Bordered neutral control on any surface. */
        outline:
          "border border-border bg-surface text-ink hover:bg-surface-2 hover:border-border-strong",
        /** Text/ghost control. */
        quiet:
          "text-muted-foreground hover:text-ink hover:bg-surface-2",
        /** Destructive — the only other colour in the system. */
        danger:
          "bg-danger text-danger-foreground border border-transparent font-semibold hover:brightness-110",
      },
      size: {
        md: "px-4 py-2.5 text-[14px]",
        sm: "px-3 py-1.5 text-[13px]",
        block: "w-full px-4 py-2.5 text-[14px]",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

type ButtonProps = Readonly<
  React.ComponentPropsWithoutRef<"button"> & VariantProps<typeof buttonVariants>
>;

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
