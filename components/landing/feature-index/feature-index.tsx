import { FEATURES } from "@/components/landing/content";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridFrame } from "@/components/ui/grid-cell";

/** The signature move — a collapsed-hairline grid of feature cells, mono-labelled. */
export function FeatureIndex() {
  return (
    <section id="features" className="border-hairline scroll-mt-14 border-b">
      <Container className="py-24 min-[900px]:py-28">
        <div className="mb-12 max-w-[640px]">
          <Eyebrow className="mb-5">Everything on the board</Eyebrow>
          <h2 className="text-ink text-[30px] leading-[1.1] font-semibold tracking-[-0.03em] text-balance min-[560px]:text-[40px]">
            Six decisions stand between a group chat and a gate.
          </h2>
        </div>

        <GridFrame className="grid grid-cols-1 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.n}
              className="grid-cell flex flex-col gap-3 p-6 min-[900px]:p-8"
            >
              <div className="text-subtle-foreground flex items-center justify-between font-mono text-[11px] tracking-[0.08em] uppercase">
                <span>{feature.label}</span>
                <span className="tabular-nums">{feature.n}</span>
              </div>
              <h3 className="text-ink mt-1 text-[19px] leading-[1.2] font-semibold tracking-[-0.02em]">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-[14.5px] leading-[1.6] text-pretty">
                {feature.desc}
              </p>
            </article>
          ))}
        </GridFrame>
      </Container>
    </section>
  );
}
