import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CtaLink } from "@/components/ui/cta-link";

export function ClosingCta() {
  return (
    <section className="border-hairline relative overflow-hidden border-t">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 left-1/2 h-[520px] w-[820px] max-w-[120vw] -translate-x-1/2 rounded-full opacity-40 blur-[150px]"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.84 0.08 280 / 0.55), transparent)",
        }}
      />

      <Container className="relative py-[124px]">
        <h2 className="text-ink max-w-[18ch] text-[40px] leading-[1.0] font-semibold tracking-[-0.045em] text-balance min-[560px]:text-[64px]">
          Right now, somebody&apos;s group chat is stalling.
        </h2>
        <p className="text-muted-foreground mt-6 max-w-[46ch] text-[18px] leading-[1.5] text-pretty">
          Be the one who starts the trip. Free for your whole crew — no card, no
          catch.
        </p>

        <div className="mt-9 flex flex-col items-start gap-3.5 min-[560px]:flex-row min-[560px]:items-center min-[560px]:gap-5">
          <CtaLink href="/sign-up">Start a trip — it&apos;s free</CtaLink>
          <Link
            href="/demo"
            className="text-muted-foreground hover:text-ink text-[15.5px] font-medium transition-colors"
          >
            Book a demo →
          </Link>
        </div>
      </Container>
    </section>
  );
}
