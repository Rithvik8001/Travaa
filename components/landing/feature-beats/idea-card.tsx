import { Avatar } from "@/components/ui/avatar";

const IDEA_COMMENTS = [
  {
    initial: "P",
    color: "oklch(0.8 0.07 150)",
    name: "Priya",
    text: "terrace or nothing, honestly",
  },
  {
    initial: "D",
    color: "oklch(0.78 0.06 255)",
    name: "Diego",
    text: "already booked it in my head",
  },
] as const;

/** Beat 02 visual: a suggestion carrying its votes and its argument. */
export function IdeaCard() {
  return (
    <div className="border-border bg-surface shadow-lift rounded-[18px] border p-5">
      <div className="border-hairline flex items-center gap-[13px] border-b pb-[15px]">
        <div className="size-12 shrink-0 rounded-xl bg-linear-[135deg,oklch(0.8_0.06_40),oklch(0.68_0.08_28)]" />
        <div className="flex-1">
          <div className="text-ink text-[15px] font-semibold">
            Alfama villa with terrace
          </div>
          <div className="text-subtle-foreground mt-px text-[12.5px]">
            €1,200 · sleeps 6
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-[11px] border border-[oklch(0.82_0.06_255)] bg-[oklch(0.94_0.02_255)] px-3 py-[7px] text-[13px] font-semibold text-[oklch(0.45_0.1_255)]">
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
    </div>
  );
}
