import type { Metadata } from "next";
import Link from "next/link";
import { redirectIfSignedIn } from "@/lib/session";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Start a trip" };

export default async function SignUpPage() {
  await redirectIfSignedIn();

  return (
    <>
      <h1 className="text-ink mb-1.5 text-[26px] font-semibold tracking-[-0.025em]">
        Start a trip
      </h1>
      <p className="text-muted-foreground mb-7 text-[15px]">
        Free, no card. Your crew joins in a tap.
      </p>

      <SignUpForm />

      <p className="text-muted-foreground mt-6 text-center text-[14.5px]">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-brand-ink font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
