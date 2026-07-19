import { QUOTES } from "@/components/landing/content";
import { Avatar } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";

/** One oversized pull quote in a bordered band — the marquee human moment. */
export function Testimonials() {
  const [lead] = QUOTES;

  return (
    <section className="border-hairline border-b">
      <Container className="py-24 min-[900px]:py-28">
        <figure className="max-w-[920px]">
          <span
            aria-hidden
            className="text-subtle-foreground font-mono text-[12px] tracking-[0.12em] uppercase"
          >
            Field notes
          </span>
          <blockquote className="text-ink mt-6 text-[28px] leading-[1.24] font-semibold tracking-[-0.03em] text-balance min-[560px]:text-[40px] min-[560px]:leading-[1.18]">
            &ldquo;{lead.text}&rdquo;
          </blockquote>
          <figcaption className="mt-9 flex items-center gap-3.5">
            <Avatar
              initial={lead.initial}
              color={lead.avatar}
              className="size-10 text-[15px]"
            />
            <div className="leading-tight">
              <div className="text-ink text-[14px] font-medium">
                {lead.name}
              </div>
              <div className="text-subtle-foreground font-mono text-[12px]">
                {lead.sub}
              </div>
            </div>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
