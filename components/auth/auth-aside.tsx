import { Avatar } from "@/components/ui/avatar";
import { AVAILABILITY_COLOR } from "@/lib/trips/dates";

/** The crew shown on the auth aside's floating poll card. */
const CREW = [
  { initial: "M", color: "oklch(0.88 0.035 277)", availability: "yes" },
  { initial: "D", color: "oklch(0.88 0.035 230)", availability: "yes" },
  { initial: "P", color: "oklch(0.88 0.035 195)", availability: "yes" },
  { initial: "S", color: "oklch(0.88 0.035 320)", availability: "yes" },
  { initial: "N", color: "oklch(0.88 0.035 155)", availability: "maybe" },
  { initial: "L", color: "oklch(0.88 0.03 255)", availability: "no" },
] as const;

/**
 * The branded half of the split-screen auth: a deep cool identity gradient with a
 * floating live poll fragment and a single crew quote. Decorative — hidden below
 * the two-column breakpoint, so the form stands alone on small screens.
 */
export function AuthAside() {
  return (
    <aside
      aria-hidden
      className="relative hidden overflow-hidden min-[900px]:block"
      style={{
        background:
          "linear-gradient(158deg, oklch(0.52 0.17 283), oklch(0.34 0.14 279))",
      }}
    >
      <div
        className="pointer-events-none absolute -top-28 -right-20 h-[460px] w-[460px] rounded-full opacity-45 blur-[130px]"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.82 0.13 305 / 0.85), transparent)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-12 min-[1200px]:p-16">
        <span className="text-[12px] font-semibold tracking-[0.14em] text-white/60 uppercase">
          Plan together · decide faster
        </span>

        <div className="w-full max-w-[340px] rounded-[20px] bg-white/95 p-5 shadow-[0_40px_80px_-40px_oklch(0.2_0.12_282/0.8)] backdrop-blur-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-ink text-[16px] font-semibold tracking-[-0.01em]">
                  Oct 12–16
                </span>
                <span className="bg-brand/12 text-brand-ink rounded-full px-2 py-[2px] text-[10px] font-semibold tracking-[0.03em] uppercase">
                  Best fit
                </span>
              </div>
              <div className="text-subtle-foreground mt-[3px] text-[12.5px]">
                Thu–Mon · 4 nights
              </div>
            </div>
            <div className="text-right">
              <div className="text-ink text-[17px] font-semibold tabular-nums">
                5/6
              </div>
              <div className="text-subtle-foreground text-[11px]">available</div>
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

        <figure>
          <blockquote className="max-w-[16ch] text-[30px] leading-[1.22] font-semibold tracking-[-0.03em] text-balance text-white">
            The trip actually happened this time.
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <Avatar
              initial="M"
              color="oklch(0.88 0.04 266)"
              className="size-9 text-sm"
            />
            <div className="leading-tight">
              <div className="text-[14px] font-semibold text-white">
                Maya Chen
              </div>
              <div className="text-[13px] text-white/60">
                Planned 3 trips on Travaa
              </div>
            </div>
          </figcaption>
        </figure>
      </div>
    </aside>
  );
}
