import { AVAILABILITY_COLOR, CREW } from "@/components/landing/content";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

/** Beat 01 visual: the availability poll pointing at the winning window. */
export function DatesPoll() {
  return (
    <div className="relative">
      <Card className="shadow-lift px-6 py-[22px]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-[9px]">
              <span className="text-ink text-[17px] font-semibold tracking-[-0.01em]">
                Oct 12–16
              </span>
              <span className="bg-brand/12 text-brand-ink rounded-full px-2.5 py-[3px] text-[10.5px] font-semibold tracking-[0.02em] uppercase">
                Best fit
              </span>
            </div>
            <div className="text-subtle-foreground mt-[3px] text-[13px]">
              Thu–Mon · 4 nights
            </div>
          </div>
          <div className="text-right">
            <div className="text-ink text-lg font-semibold tabular-nums">5/6</div>
            <div className="text-subtle-foreground text-[11.5px]">available</div>
          </div>
        </div>

        <div className="flex gap-[7px]">
          {CREW.map((member) => (
            <Avatar
              key={member.initial}
              initial={member.initial}
              color={member.avatar}
              status={AVAILABILITY_COLOR[member.availability]}
              dimmed={member.availability === "no"}
              className="size-[30px] text-xs"
            />
          ))}
        </div>
      </Card>

      <div className="bg-ink absolute -right-2 -bottom-[30px] -rotate-[2deg] rounded-[10px] px-3.5 py-[9px] text-[13px] text-[oklch(0.94_0.008_80)] shadow-float">
        Noah&apos;s a maybe. Noah&apos;s always a maybe.
      </div>
    </div>
  );
}
