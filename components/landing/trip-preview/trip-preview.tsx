import { CREW } from "@/components/landing/content";
import { Avatar } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { BrowserChrome } from "./browser-chrome";

interface Stat {
  readonly label: string;
  readonly value: string;
  readonly note: string;
  readonly noteClassName: string;
}

const STATS: readonly Stat[] = [
  {
    label: "Dates",
    value: "Oct 12–16",
    note: "✓ Locked",
    noteClassName: "text-positive",
  },
  {
    label: "Ideas",
    value: "6 ideas",
    note: "3 to vote",
    noteClassName: "text-brand-ink",
  },
  {
    label: "Itinerary",
    value: "11 items",
    note: "5 days",
    noteClassName: "text-subtle-foreground",
  },
  {
    label: "Budget",
    value: "€2,378",
    note: "+€64 you",
    noteClassName: "text-positive",
  },
];

/** The calm counterpart to the hero's chaos: one trip, all of it in one frame. */
export function TripPreview() {
  return (
    <section id="story" className="scroll-mt-[66px]">
      <Container className="pt-20 pb-5">
        <div className="mb-11 max-w-[640px]">
          <Eyebrow className="mb-4 text-[13px]">One place instead of seven</Eyebrow>
          <h2 className="text-ink font-serif text-[38px] leading-[1.18] font-medium tracking-[-0.015em] text-balance">
            So we built the calm room where the trip actually gets decided.
          </h2>
        </div>

        <div className="border-border bg-surface shadow-panel overflow-hidden rounded-[22px] border">
          <BrowserChrome url="travaa.app/lisbon" />

          <div className="bg-surface-sunken px-[22px] pt-8 pb-9 min-[560px]:px-9">
            <div className="mb-6 flex flex-col gap-4 min-[560px]:flex-row min-[560px]:items-start min-[560px]:justify-between min-[560px]:gap-0">
              <div>
                <div className="text-subtle-foreground mb-[5px] text-[13px]">
                  Planning · locked for Oct 12–16
                </div>
                <div className="text-ink text-[27px] font-semibold tracking-[-0.025em]">
                  Lisbon with the crew
                </div>
              </div>
              <div className="flex pl-[9px] min-[560px]:pl-0">
                {CREW.map((member) => (
                  <Avatar
                    key={member.initial}
                    initial={member.initial}
                    color={member.avatar}
                    className="border-surface-sunken -ml-[9px] size-8 border-[2.5px] text-xs"
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-[560px]:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="border-hairline bg-surface rounded-[14px] border p-[15px]"
                >
                  <div className="text-subtle-foreground mb-2 text-[11px] font-semibold tracking-[0.04em] uppercase">
                    {stat.label}
                  </div>
                  <div className="text-ink text-[17px] font-semibold">
                    {stat.value}
                  </div>
                  <div className={`mt-0.5 text-xs ${stat.noteClassName}`}>
                    {stat.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
