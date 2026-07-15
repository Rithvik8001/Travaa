import Link from "next/link";
import Logo from "./logo";
import { cn } from "@/lib/utils";

export function Wordmark({
  showLabel = true,
  className,
  markClassName,
  labelClassName,
}: Readonly<{
  /** Hide the "Travaa" text and let the mark stand on its own. */
  showLabel?: boolean;
  className?: string;
  markClassName?: string;
  labelClassName?: string;
}>) {
  return (
    <Link
      href="/"
      aria-label="Travaa home"
      className={cn("flex items-center gap-2.25", className)}
    >
      <Logo className={cn("text-brand size-5.75", markClassName)} />
      {showLabel ? (
        <span
          className={cn(
            "text-ink text-[19px] font-semibold tracking-[-0.02em]",
            labelClassName,
          )}
        >
          Travaa
        </span>
      ) : null}
    </Link>
  );
}
