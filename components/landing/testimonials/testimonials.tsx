import { QUOTES } from "@/components/landing/content";
import { Avatar } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";

/** One oversized pull quote, the marquee human moment on the page. */
export function Testimonials() {
  const [lead] = QUOTES;

  return (
    <section className="border-hairline border-t">
      <Container className="py-[104px]">
        <figure className="mx-auto max-w-[900px]">
          <blockquote className="text-ink text-[30px] leading-[1.28] font-semibold tracking-[-0.03em] text-balance min-[560px]:text-[42px] min-[560px]:leading-[1.2]">
            “{lead.text}”
          </blockquote>
          <figcaption className="mt-9 flex items-center gap-3.5">
            <Avatar
              initial={lead.initial}
              color={lead.avatar}
              className="size-11 text-base"
            />
            <div className="leading-tight">
              <div className="text-ink text-[15px] font-semibold">
                {lead.name}
              </div>
              <div className="text-subtle-foreground text-[13.5px]">
                {lead.sub}
              </div>
            </div>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
