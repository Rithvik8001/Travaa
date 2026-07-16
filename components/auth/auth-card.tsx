interface AuthCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly children: React.ReactNode;
  /** Quiet line rendered under the card, outside its surface. */
  readonly footer: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <>
      <div className="bg-surface border-hairline shadow-dialog rounded-[22px] border px-6 pt-[26px] pb-6">
        <h1 className="text-ink text-[22px] font-semibold tracking-[-0.02em]">
          {title}
        </h1>
        <p className="text-subtle-foreground mt-[3px] mb-6 text-[14px]">{subtitle}</p>
        {children}
      </div>
      <p className="text-subtle-foreground mt-5 text-center text-[14px]">{footer}</p>
    </>
  );
}
