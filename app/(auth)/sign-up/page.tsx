import type { Metadata } from "next";
import Link from "next/link";
import { redirectIfSignedIn } from "@/lib/session";
import { AuthCard } from "../auth-card";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Start a trip" };

export default async function SignUpPage() {
  await redirectIfSignedIn();

  return (
    <AuthCard
      title="Start a trip"
      subtitle="Free, no card. Your crew joins in a tap."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-brand-ink font-medium hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
