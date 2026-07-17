import { Card } from "./card";

/**
 * The app's centered "one-decision" card (auth, create/edit trip, join): the
 * shared Card surface with a title, subtitle, body, and an optional quiet line
 * beneath it. Area-agnostic.
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
      <Card className="shadow-dialog px-7 pt-7 pb-7">
        <h1 className="text-ink text-[23px] font-semibold tracking-[-0.03em]">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1.5 mb-6 text-[14.5px] leading-[1.5]">
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
