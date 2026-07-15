import Link from "next/link";
import { ChaosCluster } from "./chaos-cluster";
import { Container } from "@/components/ui/container";
import { CtaLink } from "@/components/ui/cta-link";

export function Hero() {
  return (
    <section>
      <Container className="pt-[88px] pb-[30px]">
        <div className="grid items-center gap-11 min-[900px]:grid-cols-[1.05fr_0.95fr] min-[900px]:gap-14">
          <div>
            <h1 className="text-ink mb-[26px] text-[33px] leading-[1.03] font-semibold tracking-[-0.035em] min-[560px]:text-[42px] min-[900px]:text-[60px]">
              The trip everyone wants to take
              <span className="text-brand-quiet mt-1 block font-serif font-medium tracking-[-0.015em] italic">
                keeps dying in the group chat.
              </span>
            </h1>

            <p className="mb-8 max-w-[480px] text-[18.5px] leading-[1.58] text-muted-foreground">
              Dates, ideas, the itinerary, and who-paid-for-what — all in one quiet
              place. Travaa turns “we should totally do this” into actual boarding
              passes.
            </p>

            <div className="flex flex-col items-start gap-4 min-[560px]:flex-row min-[560px]:items-center min-[560px]:gap-[22px]">
              <CtaLink href="/sign-up">Start a trip — it&apos;s free</CtaLink>
              <Link
                href="#story"
                className="text-[15.5px] font-medium text-muted-foreground hover:text-ink transition-colors"
              >
                See how it plays out ↓
              </Link>
            </div>

            <p className="text-subtle-foreground mt-7 text-[13.5px]">
              No card. Invite by link. Your crew joins in a tap.
            </p>
          </div>

          <ChaosCluster />
        </div>
      </Container>
    </section>
  );
}
