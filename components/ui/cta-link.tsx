import Link from "next/link";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

type CtaLinkProps = Readonly<
  React.ComponentPropsWithoutRef<typeof Link> & VariantProps<typeof buttonVariants>
>;

export function CtaLink({ variant, size, className, ...props }: CtaLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
