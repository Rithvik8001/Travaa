import { STEPS } from "@/components/landing/content";
import { Container } from "@/components/ui/container";

export function HowItWorks() {
  return (
    <section
      id="how"
      className="border-hairline bg-muted scroll-mt-[66px] border-y"
    >
      <Container className="py-[92px]">
        <h2 className="text-ink mb-14 text-[32px] font-semibold tracking-[-0.03em]">
          Three steps from group chat to gate.
        </h2>

        <ol className="border-border grid border-t min-[900px]:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.n}
              className={[
                "pt-6 pb-6 min-[900px]:py-[34px] min-[900px]:pr-[30px]",
                // Columns after the first sit against a divider and need room to breathe.
                index > 0 &&
                  "border-hairline border-t min-[900px]:border-t-0 min-[900px]:pl-[30px]",
                index < STEPS.length - 1 && "min-[900px]:border-r",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div
                aria-hidden
                className="bg-brand/10 text-brand-ink mb-5 flex size-8 items-center justify-center rounded-full text-[14px] font-semibold tabular-nums"
              >
                {step.n}
              </div>
              <h3 className="text-ink mb-[9px] text-[19px] font-semibold tracking-[-0.02em]">
                {step.title}
              </h3>
              <p className="max-w-[280px] text-[14.5px] leading-[1.6] text-muted-foreground">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
