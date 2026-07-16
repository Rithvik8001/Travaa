/**
 * The app's centered "one-decision" card (Travaa.dc.html join/deep-link): a white
 * surface with a title, subtitle, body, and an optional quiet line beneath it.
 * Area-agnostic — auth, create-a-trip, and the join screen all wear this shape.
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
      <div className="bg-surface border-hairline shadow-dialog rounded-[22px] border px-6 pt-[26px] pb-6">
        <h1 className="text-ink text-[22px] font-semibold tracking-[-0.02em]">
          {title}
        </h1>
        <p className="text-subtle-foreground mt-[3px] mb-6 text-[14px]">
          {subtitle}
        </p>
        {children}
      </div>
      {footer ? (
        <p className="text-subtle-foreground mt-5 text-center text-[14px]">
          {footer}
        </p>
      ) : null}
    </>
  );
}
