import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * A small mono label — statuses, counts, visibility, and the single accent
 * highlight ("Best fit" / "Top pick"). Geist Mono uppercase is the signature
 * texture; emphasis comes from weight and fill.
 */
export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[4px] font-mono font-medium whitespace-nowrap tabular-nums uppercase",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        ink: "bg-ink text-background",
        accent: "bg-accent text-accent-foreground",
        outline: "text-muted-foreground border border-hairline",
        soft: "bg-surface-2 text-foreground border border-hairline",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px] tracking-[0.08em]",
        md: "px-2 py-[3px] text-[11px] tracking-[0.06em]",
        lg: "px-2.5 py-1 text-[12px] tracking-[0.04em]",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm" },
  },
);

type BadgeProps = Readonly<
  React.ComponentPropsWithoutRef<"span"> & VariantProps<typeof badgeVariants>
>;

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
