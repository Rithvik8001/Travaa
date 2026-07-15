import { DETAILS } from "@/components/landing/content";
import { Container } from "@/components/ui/container";

export function DetailsGrid() {
  return (
    <section>
      <Container className="py-[92px]">
        <div className="grid gap-[30px] min-[900px]:grid-cols-[0.7fr_1.3fr] min-[900px]:gap-[60px]">
          <h2 className="text-ink text-[30px] leading-[1.18] font-semibold tracking-[-0.025em]">
            The quiet details that hold a trip together.
          </h2>

          <ul className="grid min-[900px]:grid-cols-2">
            {DETAILS.map((detail) => (
              <li
                key={detail.title}
                className="border-hairline flex gap-3.5 border-t py-5 pr-6"
              >
                <span
                  aria-hidden
                  className="mt-1.5 size-[9px] shrink-0 rounded-[3px]"
                  style={{ background: detail.mark }}
                />
                <div>
                  <h3 className="text-ink mb-1 text-base font-semibold tracking-[-0.01em]">
                    {detail.title}
                  </h3>
                  <p className="text-sm leading-[1.5] text-muted-foreground">
                    {detail.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
