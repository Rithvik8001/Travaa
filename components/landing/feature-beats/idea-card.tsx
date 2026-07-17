import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const IDEA_COMMENTS = [
  {
    initial: "P",
    color: "oklch(0.88 0.03 205)",
    name: "Priya",
    text: "terrace or nothing, honestly",
  },
  {
    initial: "D",
    color: "oklch(0.88 0.035 240)",
    name: "Diego",
    text: "already booked it in my head",
  },
] as const;

/** Beat 02 visual: a suggestion carrying its votes and its argument. */
export function IdeaCard() {
  return (
    <Card className="shadow-lift p-5">
      <div className="border-hairline flex items-center gap-[13px] border-b pb-[15px]">
        <div className="size-12 shrink-0 rounded-[12px] bg-linear-[145deg,oklch(0.62_0.15_264),oklch(0.52_0.17_268)]" />
        <div className="flex-1">
          <div className="text-ink text-[15px] font-semibold">
            Alfama villa with terrace
          </div>
          <div className="text-subtle-foreground mt-px text-[12.5px]">
            €1,200 · sleeps 6
          </div>
        </div>
        <div className="bg-brand/10 text-brand-ink flex items-center gap-1.5 rounded-[8px] px-3 py-[7px] text-[13px] font-semibold tabular-nums">
          <span className="text-[11px]">▲</span> 5
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-[15px]">
        {IDEA_COMMENTS.map((comment) => (
          <div key={comment.name} className="flex items-start gap-2.5">
            <Avatar
              initial={comment.initial}
              color={comment.color}
              className="size-[26px] text-[11px]"
            />
            <p className="text-[13.5px]">
              <span className="text-ink font-semibold">{comment.name}</span>{" "}
              <span className="text-muted-foreground">{comment.text}</span>
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
