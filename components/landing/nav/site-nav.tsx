import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CtaLink } from "@/components/ui/cta-link";
import { Wordmark } from "@/components/ui/wordmark";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
] as const;

export function SiteNav() {
  return (
    <header className="border-hairline bg-background/85 sticky top-0 z-50 border-b backdrop-blur-[18px]">
      <Container className="flex h-14 items-center justify-between">
        <Wordmark />

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 min-[900px]:flex"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-ink font-mono text-[12px] tracking-[0.04em] uppercase transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="text-muted-foreground hover:text-ink hover:bg-surface-2 rounded-[6px] px-3 py-2 text-[13.5px] font-medium transition-[color,background-color]"
          >
            Sign in
          </Link>
          <CtaLink href="/sign-up" size="sm">
            Start a trip
          </CtaLink>
        </div>
      </Container>
    </header>
  );
}
