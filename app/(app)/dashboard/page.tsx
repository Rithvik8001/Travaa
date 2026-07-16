import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/ui/wordmark";
import { requireSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user } = await requireSession();

  return (
    <>
      <header className="border-hairline bg-background/80 sticky top-0 z-50 border-b backdrop-blur-[18px]">
        <Container className="flex h-[66px] items-center justify-between">
          <Wordmark showLabel={false} markClassName="size-7" />
          <SignOutButton />
        </Container>
      </header>

      <main className="flex-1">
        <Container className="pt-[88px] pb-[30px]">
          <h1 className="text-ink mb-[26px] text-[33px] leading-[1.03] font-semibold tracking-[-0.035em] min-[560px]:text-[42px]">
            Hey {user.displayUsername ?? user.name}
            <span className="text-brand-quiet mt-1 block font-serif font-medium tracking-[-0.015em] italic">
              no trips yet.
            </span>
          </h1>
          <p className="text-muted-foreground max-w-[480px] text-[18.5px] leading-[1.58]">
            You&apos;re signed in as {user.email}. Creating trips lands next — this
            screen is the shell it hangs off.
          </p>
        </Container>
      </main>
    </>
  );
}
