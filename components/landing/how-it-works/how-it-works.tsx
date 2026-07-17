import { STEPS } from "@/components/landing/content";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export function HowItWorks() {
  return (
    <section id="how" className="bg-muted border-hairline scroll-mt-[66px] border-t">
      <Container className="py-[100px]">
        <div className="mb-16 max-w-[560px]">
          <Eyebrow className="mb-5">How it works</Eyebrow>
          <h2 className="text-ink text-[32px] leading-[1.1] font-semibold tracking-[-0.035em] text-balance min-[560px]:text-[40px]">
            Three steps from group chat to gate.
          </h2>
        </div>

        <ol className="grid gap-x-10 gap-y-12 min-[900px]:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="flex flex-col">
              <span
                aria-hidden
                className="text-[64px] leading-none font-semibold tracking-[-0.04em] tabular-nums text-transparent"
                style={{
                  WebkitTextStroke: "1.25px oklch(0.585 0.19 266 / 0.4)",
                }}
              >
                {step.n}
              </span>
              <h3 className="text-ink mt-6 text-[20px] font-semibold tracking-[-0.02em]">
                {step.title}
              </h3>
              <p className="text-muted-foreground mt-2.5 max-w-[320px] text-[15px] leading-[1.6] text-pretty">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
