import { Container } from "@/components/ui/container";
import { CtaLink } from "@/components/ui/cta-link";
import { Eyebrow } from "@/components/ui/eyebrow";

const PROOF = [
  "Invite by link",
  "Vote before signing up",
  "Free for the whole crew",
] as const;

/** Left-aligned editorial hero on a faint graph-paper field, hairline-closed. */
export function Hero() {
  return (
    <section className="border-hairline relative overflow-hidden border-b">
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-60"
        style={{
          maskImage:
            "radial-gradient(120% 90% at 15% 0%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 15% 0%, black, transparent 75%)",
        }}
      />

      <Container
        data-rise-group
        className="relative pt-20 pb-24 min-[900px]:pt-28 min-[900px]:pb-28"
      >
        <Eyebrow data-rise className="mb-7">
          Group trips, on one grid
        </Eyebrow>

        <h1
          data-rise
          className="text-ink max-w-[16ch] text-[44px] leading-[0.98] font-semibold tracking-[-0.04em] text-balance min-[560px]:text-[62px] min-[900px]:text-[78px]"
        >
          The group trip, finally on one grid.
        </h1>

        <p
          data-rise
          className="text-muted-foreground mt-7 max-w-[56ch] text-[17px] leading-[1.6] text-pretty min-[560px]:text-[18.5px]"
        >
          Dates, ideas, the itinerary, and who paid for what — decided together
          on one calm, shared board. Travaa turns &ldquo;we should totally do
          this&rdquo; into an actual trip.
        </p>

        <div
          data-rise
          className="mt-9 flex flex-col items-start gap-3 min-[560px]:flex-row min-[560px]:items-center"
        >
          <CtaLink href="/sign-up">Start a trip — it&apos;s free</CtaLink>
          <CtaLink href="#how" variant="outline">
            See how it works
          </CtaLink>
        </div>

        <ul
          data-rise
          className="text-subtle-foreground mt-12 flex flex-col gap-x-6 gap-y-2 font-mono text-[12px] tracking-[0.04em] uppercase min-[560px]:flex-row min-[560px]:items-center"
        >
          {PROOF.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span aria-hidden className="bg-accent size-[6px] rounded-[1px]" />
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
