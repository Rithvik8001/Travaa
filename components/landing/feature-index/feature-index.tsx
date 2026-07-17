import { FEATURES } from "@/components/landing/content";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

/** An editorial, numbered index of what Travaa does — copy only, hairline-ruled. */
export function FeatureIndex() {
  return (
    <section id="features" className="border-hairline scroll-mt-[66px] border-t">
      <Container className="py-[100px]">
        <div className="mb-14 max-w-[640px]">
          <Eyebrow className="mb-5">The whole job, handled</Eyebrow>
          <h2 className="text-ink text-[32px] leading-[1.1] font-semibold tracking-[-0.035em] text-balance min-[560px]:text-[40px]">
            Four decisions stand between a group chat and a gate. Travaa closes
            each one.
          </h2>
        </div>

        <ol className="border-border border-t">
          {FEATURES.map((feature) => (
            <li
              key={feature.n}
              className="border-hairline grid items-baseline gap-x-8 gap-y-2 border-b py-8 min-[900px]:grid-cols-[64px_minmax(0,0.85fr)_1.15fr]"
            >
              <span className="text-subtle-foreground text-[14px] font-medium tabular-nums">
                {feature.n}
              </span>
              <h3 className="text-ink text-[21px] leading-[1.2] font-semibold tracking-[-0.02em] text-balance">
                {feature.title}
              </h3>
              <p className="text-muted-foreground max-w-[52ch] text-[16px] leading-[1.6] text-pretty">
                {feature.desc}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
