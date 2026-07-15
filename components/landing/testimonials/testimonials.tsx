import { QUOTES } from "@/components/landing/content";
import { Avatar } from "@/components/ui/avatar";
import { Container } from "@/components/ui/container";

export function Testimonials() {
  return (
    <section className="border-hairline bg-muted border-t">
      <Container className="grid gap-11 py-[92px] min-[900px]:grid-cols-2 min-[900px]:gap-12">
        {QUOTES.map((quote) => (
          <figure key={quote.name}>
            <blockquote className="font-serif text-[25px] leading-[1.4] tracking-[-0.01em] text-[oklch(0.26_0.006_90)] text-pretty">
              “{quote.text}”
            </blockquote>
            <figcaption className="mt-[22px] flex items-center gap-[11px]">
              <Avatar
                initial={quote.initial}
                color={quote.avatar}
                className="size-[38px] text-sm"
              />
              <div>
                <div className="text-ink text-[14.5px] font-semibold">
                  {quote.name}
                </div>
                <div className="text-subtle-foreground text-[13px]">{quote.sub}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </Container>
    </section>
  );
}
