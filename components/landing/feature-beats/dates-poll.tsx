import { AVAILABILITY_COLOR, CREW } from "@/components/landing/content";
import { Avatar } from "@/components/ui/avatar";

/** Beat 01 visual: the availability poll pointing at the winning window. */
export function DatesPoll() {
  return (
    <div className="relative">
      <div className="bg-surface rounded-[18px] border border-[oklch(0.82_0.06_150)] px-6 py-[22px] shadow-[0_30px_60px_-40px_oklch(0.4_0.04_150/0.3)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-[9px]">
              <span className="text-ink text-[17px] font-semibold">Oct 12–16</span>
              <span className="rounded-md bg-[oklch(0.93_0.03_150)] px-2 py-[3px] text-[10px] font-semibold tracking-[0.04em] text-[oklch(0.42_0.09_150)] uppercase">
                Best fit
              </span>
            </div>
            <div className="text-subtle-foreground mt-[3px] text-[13px]">
              Thu–Mon · 4 nights
            </div>
          </div>
          <div className="text-right">
            <div className="text-positive text-lg font-semibold">5/6</div>
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
      </div>

      <div className="absolute -right-2 -bottom-[30px] -rotate-[2deg] rounded-[11px] bg-[oklch(0.22_0.006_90)] px-3.5 py-[9px] text-[13px] text-[oklch(0.92_0.006_90)] shadow-[0_14px_30px_-16px_oklch(0.3_0.02_90/0.5)]">
        Noah&apos;s a maybe. Noah&apos;s always a maybe.
      </div>
    </div>
  );
}
