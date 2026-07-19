import { STEPS } from "@/components/landing/content";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridFrame } from "@/components/ui/grid-cell";

/** Three steps as bordered columns with big mono numerals. */
export function HowItWorks() {
  return (
    <section id="how" className="border-hairline scroll-mt-14 border-b">
      <Container className="py-24 min-[900px]:py-28">
        <div className="mb-12 max-w-[560px]">
          <Eyebrow className="mb-5">How it works</Eyebrow>
          <h2 className="text-ink text-[30px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance min-[560px]:text-[40px]">
            Group chat to gate, in three moves.
          </h2>
        </div>

        <GridFrame
          as="ol"
          className="grid grid-cols-1 min-[900px]:grid-cols-3"
        >
          {STEPS.map((step) => (
            <li key={step.n} className="grid-cell flex flex-col p-6 min-[900px]:p-8">
              <span
                aria-hidden
                className="text-ink/15 font-mono text-[56px] leading-none font-semibold tabular-nums"
              >
                {step.n}
              </span>
              <h3 className="text-ink mt-6 text-[19px] font-semibold tracking-[-0.02em]">
                {step.title}
              </h3>
              <p className="text-muted-foreground mt-2.5 text-[14.5px] leading-[1.6] text-pretty">
                {step.desc}
              </p>
            </li>
          ))}
        </GridFrame>
      </Container>
    </section>
  );
}
