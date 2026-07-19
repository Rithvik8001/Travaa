import { cn } from "@/lib/utils";

/** Near-black ink that reads on every shade in the crew palette. */
const AVATAR_INK = "oklch(0.24 0 0)";

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

/** A squircle identity chip with a mono initial and a hairline border. */
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
        "border-hairline relative flex shrink-0 items-center justify-center rounded-[6px] border font-mono font-medium",
        dimmed && "opacity-40",
        className,
      )}
      style={{ background: color, color: AVATAR_INK }}
    >
      {initial}
      {status ? (
        <span
          className="border-background absolute -right-px -bottom-px size-2.75 rounded-[2px] border-2"
          style={{ background: status }}
        />
      ) : null}
    </span>
  );
}
