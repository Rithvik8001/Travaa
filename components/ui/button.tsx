import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Shared by Button and CtaLink so the nav CTA and a form's submit button
 * stay the same object rendered as <a> or <button>.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
  {
    variants: {
      variant: {
        solid:
          "bg-primary text-primary-foreground hover:bg-ink rounded-[13px] px-[26px] py-[14px] text-base",
        quiet: "text-[15.5px] text-muted-foreground hover:text-ink",
      },
      size: {
        md: "",
        sm: "",
      },
    },
    compoundVariants: [
      {
        variant: "solid",
        size: "sm",
        class: "rounded-[11px] px-[17px] py-[9px] text-sm",
      },
      { variant: "quiet", size: "sm", class: "text-[14.5px]" },
    ],
    defaultVariants: { variant: "solid", size: "md" },
  },
);

type ButtonProps = Readonly<
  React.ComponentPropsWithoutRef<"button"> & VariantProps<typeof buttonVariants>
>;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        buttonVariants({ variant, size }),
        "disabled:pointer-events-none disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
