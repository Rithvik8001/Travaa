import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { DecisionCard } from "@/components/ui/decision-card";
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
    <DecisionCard
      title="Start a trip"
      subtitle="Free, no card. Your crew joins in a tap."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/sign-in${suffix}`}
            className="text-brand-ink font-medium hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm redirect={redirect} />
    </DecisionCard>
  );
}
