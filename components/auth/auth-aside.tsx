import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AVAILABILITY_COLOR } from "@/lib/trips/dates";

/** The crew shown on the auth aside's poll card. */
const CREW = [
  { initial: "M", color: "oklch(0.9 0 0)", availability: "yes" },
  { initial: "D", color: "oklch(0.86 0 0)", availability: "yes" },
  { initial: "P", color: "oklch(0.82 0 0)", availability: "yes" },
  { initial: "S", color: "oklch(0.78 0 0)", availability: "yes" },
  { initial: "N", color: "oklch(0.74 0 0)", availability: "maybe" },
  { initial: "L", color: "oklch(0.7 0 0)", availability: "no" },
] as const;

/**
 * The branded half of the split-screen auth: a bordered panel on a faint
 * graph-paper field with the real dates-poll UI and a single crew quote.
 * Decorative — hidden below the two-column breakpoint.
 */
export function AuthAside() {
  return (
    <aside
      aria-hidden
      className="border-hairline bg-surface-2 relative hidden overflow-hidden border-l min-[900px]:block"
    >
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative flex h-full flex-col justify-between p-12 min-[1200px]:p-16">
        <span className="text-subtle-foreground font-mono text-[11px] tracking-[0.14em] uppercase">
          Plan together · decide faster
        </span>

        <div className="bg-surface border-border w-full max-w-[340px] rounded-[8px] border">
          <div className="border-hairline text-subtle-foreground flex items-center justify-between border-b px-4 py-2.5 font-mono text-[10px] tracking-[0.08em] uppercase">
            <span>travaa / lisbon-oct</span>
            <span>6</span>
          </div>
          <div className="p-4">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-ink text-[16px] font-semibold tracking-[-0.01em]">
                    Oct 12–16
                  </span>
                  <Badge tone="accent" size="sm">
                    Best fit
                  </Badge>
                </div>
                <div className="text-subtle-foreground mt-[3px] font-mono text-[11px]">
                  Thu–Mon · 4 nights
                </div>
              </div>
              <div className="text-right">
                <div className="text-ink text-[17px] font-semibold tabular-nums">
                  5/6
                </div>
                <div className="text-subtle-foreground font-mono text-[10px] tracking-[0.06em] uppercase">
                  available
                </div>
              </div>
            </div>
            <div className="flex gap-[7px]">
              {CREW.map((member) => (
                <Avatar
                  key={member.initial}
                  initial={member.initial}
                  color={member.color}
                  status={AVAILABILITY_COLOR[member.availability]}
                  dimmed={member.availability === "no"}
                  className="size-[30px] text-xs"
                />
              ))}
            </div>
          </div>
        </div>

        <figure>
          <blockquote className="text-ink max-w-[16ch] text-[28px] leading-[1.2] font-semibold tracking-[-0.03em] text-balance">
            The trip actually happened this time.
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <Avatar
              initial="M"
              color="oklch(0.88 0 0)"
              className="size-9 text-sm"
            />
            <div className="leading-tight">
              <div className="text-ink text-[14px] font-medium">Maya Chen</div>
              <div className="text-subtle-foreground font-mono text-[12px]">
                Planned 3 trips on Travaa
              </div>
            </div>
          </figcaption>
        </figure>
      </div>
    </aside>
  );
}
