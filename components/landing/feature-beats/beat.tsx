import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/eyebrow";

interface BeatProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly visual: React.ReactNode;
  /** Places the visual on the left at desktop widths. Copy still leads in the DOM. */
  readonly reverse?: boolean;
  readonly className?: string;
}

/** One editorial feature beat: copy on one side, a product fragment on the other. */
export function Beat({
  eyebrow,
  title,
  body,
  visual,
  reverse = false,
  className,
}: BeatProps) {
  return (
    <div
      className={cn(
        "grid items-center gap-[34px] min-[900px]:gap-[70px]",
        reverse
          ? "min-[900px]:grid-cols-[1.15fr_0.85fr]"
          : "min-[900px]:grid-cols-[0.85fr_1.15fr]",
        className,
      )}
    >
      <div className={cn(reverse && "min-[900px]:order-2")}>
        <Eyebrow className="mb-[18px]">{eyebrow}</Eyebrow>
        <h3 className="text-ink mb-[18px] text-[32px] leading-[1.12] font-semibold tracking-[-0.03em]">
          {title}
        </h3>
        <p className="text-[17.5px] leading-[1.62] text-muted-foreground">{body}</p>
      </div>

      <div className={cn(reverse && "min-[900px]:order-1")}>{visual}</div>
    </div>
  );
}
