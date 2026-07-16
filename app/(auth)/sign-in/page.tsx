import type { Metadata } from "next";
import Link from "next/link";
import { redirectIfSignedIn } from "@/lib/session";
import { AuthCard } from "../auth-card";
import { SignInForm } from "./sign-in-form";

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
