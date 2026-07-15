import Link from "next/link";
import { FOOTER_COLUMNS } from "@/components/landing/content";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/ui/wordmark";

export function SiteFooter() {
  return (
    <footer className="border-hairline border-t">
      <Container className="flex flex-wrap justify-between gap-12 py-[52px]">
        <div className="max-w-[260px]">
          <Wordmark
            className="mb-3.5"
            markClassName="size-[22px]"
            labelClassName="text-[18px]"
          />
          <p className="text-sm leading-[1.55] text-muted-foreground">
            Plan together, decide faster, travel better.
          </p>
        </div>

        <div className="flex flex-wrap gap-16">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.head} aria-label={column.head}>
              <h2 className="text-subtle-foreground mb-3.5 text-[12.5px] font-semibold tracking-[0.05em] uppercase">
                {column.head}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="hover:text-ink text-sm text-muted-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <div className="border-t border-[oklch(0.94_0.004_90)]">
        <Container className="text-subtle-foreground flex flex-wrap justify-between gap-3 py-[22px] text-[13px]">
          <span>© {new Date().getFullYear()} Travaa, Inc.</span>
          <span>
            Made with{" "}
            <span role="img" aria-label="love">
              ❤️
            </span>{" "}
            by Rithvik
          </span>
        </Container>
      </div>
    </footer>
  );
}
