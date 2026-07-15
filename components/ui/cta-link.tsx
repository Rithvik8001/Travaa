import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ctaLink = cva(
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

type CtaLinkProps = Readonly<
  React.ComponentPropsWithoutRef<typeof Link> & VariantProps<typeof ctaLink>
>;

export function CtaLink({ variant, size, className, ...props }: CtaLinkProps) {
  return <Link className={cn(ctaLink({ variant, size }), className)} {...props} />;
}
