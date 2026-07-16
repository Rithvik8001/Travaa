import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { redirectIfSignedIn } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  await redirectIfSignedIn();

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Pick up where your crew left off."
      footer={
        <>
          New here?{" "}
          <Link
            href="/sign-up"
            className="text-brand-ink font-medium hover:underline"
          >
            Start a trip
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthCard>
  );
}
