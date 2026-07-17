import { Container } from "@/components/ui/container";
import { CtaLink } from "@/components/ui/cta-link";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* A whisper of warmth behind the headline — barely there. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[440px] w-[720px] max-w-[110vw] -translate-x-1/2 rounded-full opacity-40 blur-[130px]"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.88 0.05 264 / 0.35), transparent)",
        }}
      />

      <Container className="relative flex flex-col items-center pt-[84px] pb-[72px] text-center min-[900px]:pt-[104px]">
        <Eyebrow className="mb-7">Group trips, minus the chaos</Eyebrow>

        <h1 className="text-ink mx-auto max-w-[14ch] text-[40px] leading-[1.03] font-semibold tracking-[-0.038em] text-balance min-[560px]:text-[54px] min-[900px]:text-[64px]">
          The trip everyone wants to take keeps dying in the group chat.
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-[500px] text-[17.5px] leading-[1.6] text-balance min-[560px]:text-[18.5px]">
          Dates, ideas, the itinerary, and who-paid-for-what — all in one calm
          place. Travaa turns “we should totally do this” into actual boarding
          passes.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3.5 min-[560px]:flex-row">
          <CtaLink href="/sign-up">Start a trip — it&apos;s free</CtaLink>
          <CtaLink href="#story" variant="outline">
            See how it works
          </CtaLink>
        </div>

        <p className="text-subtle-foreground mt-7 text-[13.5px]">
          No card. Invite by link. Your crew joins in a tap.
        </p>
      </Container>
    </section>
  );
}
