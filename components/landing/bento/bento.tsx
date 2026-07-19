import { AVAILABILITY_COLOR, CREW } from "@/components/landing/content";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridFrame } from "@/components/ui/grid-cell";

const CANDIDATES = [
  { window: "Oct 12–16", available: 5, total: 6, best: true },
  { window: "Oct 19–23", available: 3, total: 6, best: false },
  { window: "Nov 2–6", available: 4, total: 6, best: false },
] as const;

/** A bordered mock of the real product — the dates poll, rendered in the grid UI. */
export function Bento() {
  return (
    <section id="product" className="border-hairline scroll-mt-14 border-b">
      <Container className="py-24 min-[900px]:py-28">
        <div className="mb-12 max-w-[620px]">
          <Eyebrow className="mb-5">The product</Eyebrow>
          <h2 className="text-ink text-[30px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance min-[560px]:text-[40px]">
            The whole trip, at a glance.
          </h2>
          <p className="text-muted-foreground mt-4 text-[16px] leading-[1.6] text-pretty">
            No feeds, no threads to scroll. Just the decisions, laid out on a
            board the whole crew can read in a second.
          </p>
        </div>

        <GridFrame className="mx-auto max-w-[780px]">
          {/* Window chrome */}
          <div className="border-hairline text-subtle-foreground flex items-center justify-between border-b px-5 py-3 font-mono text-[11px] tracking-[0.06em] uppercase">
            <span className="flex items-center gap-2">
              <span aria-hidden className="bg-accent size-2.5 rounded-[2px]" />
              travaa / lisbon-oct
            </span>
            <span>6 members</span>
          </div>

          {/* Locked date */}
          <div className="flex items-start justify-between gap-4 px-5 py-6">
            <div>
              <div className="text-subtle-foreground mb-3 font-mono text-[11px] tracking-[0.08em] uppercase">
                Dates · locked
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-ink text-[26px] font-semibold tracking-[-0.02em]">
                  Oct 12–16
                </span>
                <Badge tone="accent" size="md">
                  Best fit
                </Badge>
              </div>
              <div className="text-subtle-foreground mt-1.5 font-mono text-[12px]">
                Thu–Mon · 4 nights
              </div>
            </div>
            <div className="text-right">
              <div className="text-ink text-[24px] font-semibold tabular-nums">
                5/6
              </div>
              <div className="text-subtle-foreground font-mono text-[11px] tracking-[0.06em] uppercase">
                available
              </div>
            </div>
          </div>

          {/* Crew */}
          <div className="border-hairline flex items-center gap-1.5 border-t px-5 py-4">
            {CREW.map((member) => (
              <Avatar
                key={member.initial}
                initial={member.initial}
                color={member.avatar}
                status={AVAILABILITY_COLOR[member.availability]}
                dimmed={member.availability === "no"}
                className="size-8 text-[12px]"
              />
            ))}
          </div>

          {/* Candidate windows */}
          <div className="border-hairline flex flex-col gap-2.5 border-t p-5">
            {CANDIDATES.map((option) => (
              <div key={option.window} className="flex items-center gap-4">
                <span className="text-foreground w-[92px] shrink-0 font-mono text-[12.5px]">
                  {option.window}
                </span>
                <span className="bg-muted relative h-[6px] flex-1 overflow-hidden rounded-[3px]">
                  <span
                    className={
                      option.best
                        ? "bg-accent absolute inset-y-0 left-0 rounded-[3px]"
                        : "bg-ink/60 absolute inset-y-0 left-0 rounded-[3px]"
                    }
                    style={{
                      width: `${(option.available / option.total) * 100}%`,
                    }}
                  />
                </span>
                <span className="text-subtle-foreground w-8 shrink-0 text-right font-mono text-[12px] tabular-nums">
                  {option.available}/{option.total}
                </span>
              </div>
            ))}
          </div>
        </GridFrame>
      </Container>
    </section>
  );
}
