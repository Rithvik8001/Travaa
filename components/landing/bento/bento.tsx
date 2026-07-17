import { AVAILABILITY_COLOR, CREW } from "@/components/landing/content";
import { Avatar } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

const CANDIDATES = [
  { window: "Oct 19–23", available: 3, total: 6 },
  { window: "Nov 2–6", available: 4, total: 6 },
] as const;

function TileLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="text-subtle-foreground mb-5 text-[11.5px] font-semibold tracking-[0.09em] uppercase">
      {children}
    </div>
  );
}

/** The calm counterpart to the hero's chaos: one trip, laid out as a product bento. */
export function Bento() {
  return (
    <section id="story" className="scroll-mt-[66px]">
      <Container className="py-[100px]">
        <div className="mb-12 max-w-[640px]">
          <Eyebrow className="mb-5">One place instead of seven</Eyebrow>
          <h2 className="text-ink text-[32px] leading-[1.08] font-semibold tracking-[-0.035em] text-balance min-[560px]:text-[42px]">
            Everything the trip needs, in one quiet frame.
          </h2>
        </div>

        <div className="grid gap-4 min-[900px]:grid-cols-3 min-[900px]:grid-rows-2">
          {/* Dates — the hero tile */}
          <div className="bg-surface shadow-border flex flex-col rounded-[20px] p-6 min-[900px]:col-span-2 min-[900px]:row-span-2">
            <TileLabel>Dates · locked</TileLabel>

            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-ink text-[24px] font-semibold tracking-[-0.02em]">
                    Oct 12–16
                  </span>
                  <span className="bg-brand/12 text-brand-ink rounded-full px-2.5 py-[3px] text-[10.5px] font-semibold tracking-[0.03em] uppercase">
                    Best fit
                  </span>
                </div>
                <div className="text-subtle-foreground mt-1 text-[13.5px]">
                  Thu–Mon · 4 nights
                </div>
              </div>
              <div className="text-right">
                <div className="text-ink text-[22px] font-semibold tabular-nums">
                  5/6
                </div>
                <div className="text-subtle-foreground text-[12px]">available</div>
              </div>
            </div>

            <div className="mb-6 flex gap-2">
              {CREW.map((member) => (
                <Avatar
                  key={member.initial}
                  initial={member.initial}
                  color={member.avatar}
                  status={AVAILABILITY_COLOR[member.availability]}
                  dimmed={member.availability === "no"}
                  className="size-[34px] text-[13px]"
                />
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-2.5">
              {CANDIDATES.map((option) => (
                <div
                  key={option.window}
                  className="border-hairline flex items-center gap-4 rounded-[12px] border px-4 py-3"
                >
                  <span className="text-foreground w-[92px] shrink-0 text-[14px] font-medium">
                    {option.window}
                  </span>
                  <span className="bg-muted relative h-[6px] flex-1 overflow-hidden rounded-full">
                    <span
                      className="bg-brand/45 absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${(option.available / option.total) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="text-subtle-foreground shrink-0 text-[12.5px] tabular-nums">
                    {option.available}/{option.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ideas */}
          <div className="bg-surface shadow-border flex flex-col rounded-[20px] p-6">
            <TileLabel>Ideas</TileLabel>
            <div className="flex items-start gap-3">
              <div className="size-11 shrink-0 rounded-[12px] bg-linear-[145deg,oklch(0.62_0.15_264),oklch(0.52_0.17_268)] shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)]" />
              <div className="min-w-0 flex-1">
                <div className="text-ink text-[14.5px] font-semibold">
                  Alfama villa, terrace
                </div>
                <div className="text-subtle-foreground mt-px text-[12.5px]">
                  €1,200 · sleeps 6
                </div>
              </div>
              <div className="bg-brand/10 text-brand-ink flex shrink-0 items-center gap-1 rounded-[9px] px-2.5 py-[6px] text-[12.5px] font-semibold tabular-nums">
                <span className="text-[10px]">▲</span> 5
              </div>
            </div>
            <p className="text-muted-foreground mt-4 text-[13.5px] leading-[1.5]">
              <span className="text-ink font-semibold">Priya</span> terrace or
              nothing, honestly
            </p>
          </div>

          {/* Split */}
          <div className="bg-surface shadow-border flex flex-col rounded-[20px] p-6">
            <TileLabel>Split</TileLabel>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-ink rounded-[12px] p-3.5 text-white">
                <div className="text-[9.5px] font-semibold tracking-[0.05em] uppercase opacity-60">
                  Total
                </div>
                <div className="mt-1 text-[19px] font-semibold tracking-[-0.02em] tabular-nums">
                  €2,378
                </div>
              </div>
              <div className="border-hairline bg-surface-sunken rounded-[12px] border p-3.5">
                <div className="text-subtle-foreground text-[9.5px] font-semibold tracking-[0.05em] uppercase">
                  You
                </div>
                <div className="text-brand-ink mt-1 text-[19px] font-semibold tracking-[-0.02em] tabular-nums">
                  +€64
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mt-auto pt-4 text-[13px] leading-[1.5]">
              <span className="text-ink font-semibold">Sam sends you €148</span>{" "}
              and everyone stops keeping score.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
