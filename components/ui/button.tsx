import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Shared by Button and CtaLink so the nav CTA and a form's submit button
 * stay the same object rendered as <a> or <button>.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap transition-[transform,box-shadow,background] duration-150 focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        /** The tactile layered primary — gloss, inner ring, halo, drop shadow. */
        solid:
          "text-primary-foreground font-semibold tracking-[-0.01em] rounded-full bg-[image:var(--gradient-button)] shadow-button hover:bg-[image:var(--gradient-button-hover)] hover:shadow-button-hover hover:-translate-y-px active:translate-y-0 active:shadow-button-active px-[26px] py-[13px] text-[15px]",
        /** Quiet outline button on a card surface. */
        outline:
          "text-foreground font-medium rounded-full border border-border bg-surface hover:bg-surface-sunken hover:border-[oklch(0.85_0.008_80)] active:scale-[0.99] px-[22px] py-[12px] text-[15px]",
        quiet: "text-[15px] font-medium text-muted-foreground hover:text-ink",
      },
      size: {
        md: "",
        sm: "",
        /** Full-width form button on the app surface — see Travaa.dc.html. */
        block: "",
      },
    },
    compoundVariants: [
      { variant: "solid", size: "sm", class: "px-[18px] py-[9px] text-[13.5px]" },
      { variant: "solid", size: "block", class: "w-full px-5 py-[13px] text-[15px]" },
      { variant: "outline", size: "sm", class: "px-[16px] py-[8px] text-[13.5px]" },
      { variant: "outline", size: "block", class: "w-full px-5 py-[12px] text-[15px]" },
      { variant: "quiet", size: "sm", class: "text-[13.5px]" },
      { variant: "quiet", size: "block", class: "w-full py-[9px] text-[14px]" },
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
