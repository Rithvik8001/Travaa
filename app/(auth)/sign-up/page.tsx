import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { redirectIfSignedIn } from "@/lib/session";

export const metadata: Metadata = { title: "Start a trip" };

export default async function SignUpPage({
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
        Start a trip
      </h1>
      <p className="text-muted-foreground mt-2.5 mb-8 text-[15px] leading-[1.55]">
        Free, no card. Your crew joins in a tap.
      </p>

      <SignUpForm redirect={redirect} />

      <p className="text-muted-foreground mt-7 text-[14px]">
        Already have an account?{" "}
        <Link
          href={`/sign-in${suffix}`}
          className="text-ink font-medium underline decoration-[oklch(0_0_0/0.25)] decoration-1 underline-offset-[3px] transition-colors hover:decoration-ink"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
