import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CtaLink } from "@/components/ui/cta-link";
import { Wordmark } from "@/components/ui/wordmark";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#story", label: "Why Travaa" },
] as const;

export function SiteNav() {
  return (
    <header className="border-hairline bg-background/80 sticky top-0 z-50 border-b backdrop-blur-[18px]">
      <Container className="flex h-[66px] items-center justify-between">
        <Wordmark markClassName="size-[26px]" />

        <nav
          aria-label="Primary"
          className="hidden items-center gap-9 min-[900px]:flex"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[14.5px] text-muted-foreground hover:text-ink transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/sign-in"
            className="text-[14.5px] font-medium text-muted-foreground hover:text-ink transition-colors"
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
