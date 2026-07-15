import { cn } from "@/lib/utils";

/** Warm ink that reads on every avatar tint in the crew palette. */
const AVATAR_INK = "oklch(0.32 0.04 60)";

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
        "relative flex shrink-0 items-center justify-center rounded-full font-semibold",
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
