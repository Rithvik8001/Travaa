"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { safeRedirect } from "@/lib/redirect";

export function SignUpForm({ redirect }: { readonly redirect?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const username = String(form.get("username"));

    const { error } = await signUp.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
      username,
      // Better Auth requires a name at registration; users get a real display name later.
      name: username,
    });

    if (error) {
      setFormError(error.message ?? "Could not create your account. Try again.");
      setPending(false);
      return;
    }

    router.push(safeRedirect(redirect));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
      <Field label="Username">
        {(props) => (
          <Input
            {...props}
            name="username"
            autoComplete="username"
            placeholder="maya"
            minLength={3}
            maxLength={24}
            required
          />
        )}
      </Field>

      <Field label="Email">
        {(props) => (
          <Input
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        )}
      </Field>

      <Field label="Password">
        {(props) => (
          <Input
            {...props}
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        )}
      </Field>

      {formError ? (
        <p role="alert" className="text-danger text-[13.5px]">
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="block" disabled={pending} className="mt-1.5">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
