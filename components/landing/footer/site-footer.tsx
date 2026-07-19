import Link from "next/link";
import { FOOTER_COLUMNS } from "@/components/landing/content";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/ui/wordmark";

export function SiteFooter() {
  return (
    <footer className="border-hairline border-t">
      <Container className="flex flex-wrap justify-between gap-12 py-14">
        <div className="max-w-[260px]">
          <Wordmark className="mb-4" />
          <p className="text-muted-foreground text-[13.5px] leading-[1.6]">
            Plan together, decide faster, travel better.
          </p>
        </div>

        <div className="flex flex-wrap gap-16">
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.head} aria-label={column.head}>
              <h2 className="text-subtle-foreground mb-4 font-mono text-[11px] tracking-[0.1em] uppercase">
                {column.head}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-ink text-[13.5px] transition-colors"
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

      <div className="border-hairline border-t">
        <Container className="text-subtle-foreground flex flex-wrap justify-between gap-3 py-6 font-mono text-[12px]">
          <span>© {new Date().getFullYear()} Travaa, Inc.</span>
          <span>Made by Rithvik</span>
        </Container>
      </div>
    </footer>
  );
}
