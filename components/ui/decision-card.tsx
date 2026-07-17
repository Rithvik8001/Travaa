import { Card } from "./card";

/**
 * The app's centered "one-decision" card (auth, create/edit trip, join): the
 * shared Card surface, elevated, with a tight display title, a quiet subhead,
 * the body, and an optional line beneath the surface. Area-agnostic.
 */
interface DecisionCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly children: React.ReactNode;
  /** Quiet line rendered under the card, outside its surface. */
  readonly footer?: React.ReactNode;
}

export function DecisionCard({
  title,
  subtitle,
  children,
  footer,
}: DecisionCardProps) {
  return (
    <>
      <Card className="shadow-dialog rounded-[24px] px-8 pt-8 pb-8">
        <h1 className="text-ink text-[26px] leading-[1.1] font-semibold tracking-[-0.035em]">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 mb-7 max-w-[42ch] text-[14.5px] leading-[1.55]">
          {subtitle}
        </p>
        {children}
      </Card>
      {footer ? (
        <p className="text-muted-foreground mt-5 text-center text-[13.5px]">
          {footer}
        </p>
      ) : null}
    </>
  );
}
