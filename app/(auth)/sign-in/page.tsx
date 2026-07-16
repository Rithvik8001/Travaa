import type { Metadata } from "next";
import Link from "next/link";
import { redirectIfSignedIn } from "@/lib/session";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  await redirectIfSignedIn();

  return (
    <>
      <h1 className="text-ink mb-1.5 text-[26px] font-semibold tracking-[-0.025em]">
        Welcome back
      </h1>
      <p className="text-muted-foreground mb-7 text-[15px]">
        Sign in to pick up where your crew left off.
      </p>

      <SignInForm />

      <p className="text-muted-foreground mt-6 text-center text-[14.5px]">
        New here?{" "}
        <Link href="/sign-up" className="text-brand-ink font-medium hover:underline">
          Start a trip
        </Link>
      </p>
    </>
  );
}
