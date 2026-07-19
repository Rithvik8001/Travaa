import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CtaLink } from "@/components/ui/cta-link";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-50"
        style={{
          maskImage:
            "radial-gradient(100% 90% at 85% 100%, black, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(100% 90% at 85% 100%, black, transparent 72%)",
        }}
      />

      <Container className="relative py-28 min-[900px]:py-36">
        <h2 className="text-ink max-w-[16ch] text-[38px] leading-[1.0] font-semibold tracking-[-0.04em] text-balance min-[560px]:text-[60px]">
          Somebody&apos;s group chat is stalling right now.
        </h2>
        <p className="text-muted-foreground mt-6 max-w-[46ch] text-[17px] leading-[1.55] text-pretty">
          Be the one who opens the trip. Free for the whole crew — no card, no
          catch.
        </p>

        <div className="mt-9 flex flex-col items-start gap-3 min-[560px]:flex-row min-[560px]:items-center min-[560px]:gap-5">
          <CtaLink href="/sign-up">Start a trip — it&apos;s free</CtaLink>
          <Link
            href="/demo"
            className="text-muted-foreground hover:text-ink font-mono text-[13px] tracking-[0.04em] uppercase transition-colors"
          >
            Book a demo →
          </Link>
        </div>
      </Container>
    </section>
  );
}
