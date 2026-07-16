import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { DecisionCard } from "@/components/ui/decision-card";
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
    <DecisionCard
      title="Welcome back"
      subtitle="Pick up where your crew left off."
      footer={
        <>
          New here?{" "}
          <Link
            href={`/sign-up${suffix}`}
            className="text-brand-ink font-medium hover:underline"
          >
            Start a trip
          </Link>
        </>
      }
    >
      <SignInForm redirect={redirect} />
    </DecisionCard>
  );
}
