import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { redirectIfSignedIn } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  await redirectIfSignedIn();
  const { redirect } = await searchParams;
  const suffix = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";

  return (
    <>
      <h1 className="text-ink text-[30px] leading-[1.08] font-semibold tracking-[-0.035em]">
        Welcome back
      </h1>
      <p className="text-muted-foreground mt-2.5 mb-8 text-[15px] leading-[1.55]">
        Pick up where your crew left off.
      </p>

      <SignInForm redirect={redirect} />

      <p className="text-muted-foreground mt-7 text-[14px]">
        New here?{" "}
        <Link
          href={`/sign-up${suffix}`}
          className="text-ink font-medium underline decoration-[oklch(0_0_0/0.25)] decoration-1 underline-offset-[3px] transition-colors hover:decoration-ink"
        >
          Start a trip
        </Link>
      </p>
    </>
  );
}
