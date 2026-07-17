import Link from "next/link";
import { CtaLink } from "@/components/ui/cta-link";

export function ClosingCta() {
  return (
    <section className="border-hairline border-t">
      <div className="mx-auto w-full max-w-[760px] px-[22px] pt-[104px] pb-[112px] text-center min-[560px]:px-10">
        <h2 className="text-ink mx-auto mb-[22px] max-w-[620px] text-[32px] leading-[1.05] font-semibold tracking-[-0.04em] text-balance min-[560px]:text-[46px]">
          Right now, somebody&apos;s group chat is stalling.
          <span className="text-subtle-foreground mt-2 block font-normal">
            Go be the one who starts the trip.
          </span>
        </h2>

        <div className="mt-1.5 flex flex-col items-center justify-center gap-3.5 min-[560px]:flex-row min-[560px]:gap-5">
          <CtaLink href="/sign-up" className="px-7 py-[15px]">
            Start a trip — it&apos;s free
          </CtaLink>
          <Link
            href="/demo"
            className="text-[15.5px] font-medium text-muted-foreground hover:text-ink transition-colors"
          >
            Book a demo →
          </Link>
        </div>

        <p className="text-subtle-foreground mt-[22px] text-[13.5px]">
          Free for your whole crew. No card, no catch.
        </p>
      </div>
    </section>
  );
}
