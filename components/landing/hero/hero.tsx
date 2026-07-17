import { Container } from "@/components/ui/container";
import { CtaLink } from "@/components/ui/cta-link";
import { Eyebrow } from "@/components/ui/eyebrow";

const PROOF = [
  "Invite by link",
  "Vote before signing up",
  "Fewest transfers, always",
] as const;

/** Left-aligned, asymmetric hero — the copy leads, a hairline proof strip closes it. */
export function Hero() {
  return (
    <section className="border-hairline relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[720px] max-w-[110vw] rounded-full opacity-40 blur-[140px]"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.84 0.08 280 / 0.5), transparent)",
        }}
      />

      <Container
        data-rise-group
        className="relative pt-[76px] pb-[84px] min-[900px]:pt-[112px] min-[900px]:pb-[104px]"
      >
        <Eyebrow data-rise className="mb-7">
          Group trips, minus the chaos
        </Eyebrow>

        <h1
          data-rise
          className="text-ink max-w-[17ch] text-[46px] leading-[0.98] font-semibold tracking-[-0.042em] text-balance min-[560px]:text-[64px] min-[900px]:text-[80px]"
        >
          The trip everyone wants keeps dying in the group chat.
        </h1>

        <p
          data-rise
          className="text-muted-foreground mt-7 max-w-[54ch] text-[17.5px] leading-[1.6] text-pretty min-[560px]:text-[19px]"
        >
          Travaa is the calm room where dates, ideas, the itinerary, and
          who-paid-for-what get decided — and “we should totally do this” turns
          into actual boarding passes.
        </p>

        <div
          data-rise
          className="mt-9 flex flex-col items-start gap-3.5 min-[560px]:flex-row min-[560px]:items-center"
        >
          <CtaLink href="/sign-up">Start a trip — it&apos;s free</CtaLink>
          <CtaLink href="#story" variant="outline">
            See how it works
          </CtaLink>
        </div>

        <ul
          data-rise
          className="text-subtle-foreground mt-12 flex flex-col gap-x-8 gap-y-2 text-[13.5px] font-medium min-[560px]:flex-row min-[560px]:items-center"
        >
          {PROOF.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span aria-hidden className="bg-brand size-[5px] rounded-full" />
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
