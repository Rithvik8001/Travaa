import { cn } from "@/lib/utils";

/** Cool ink that reads on every tint in the crew palette. */
const AVATAR_INK = "oklch(0.35 0.02 277)";

interface AvatarProps {
  readonly initial: string;
  /** CSS color for the chip background. */
  readonly color: string;
  /** CSS color for the availability pip; omitted renders no pip. */
  readonly status?: string;
  readonly dimmed?: boolean;
  /** Sizing and type scale are set by the caller. */
  readonly className?: string;
}

export function Avatar({
  initial,
  color,
  status,
  dimmed = false,
  className,
}: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full font-semibold shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)]",
        dimmed && "opacity-40",
        className,
      )}
      style={{ background: color, color: AVATAR_INK }}
    >
      {initial}
      {status ? (
        <span
          className="absolute -right-px -bottom-px size-2.75 rounded-full border-2 border-white"
          style={{ background: status }}
        />
      ) : null}
    </span>
  );
}
