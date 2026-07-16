"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateUser } from "@/lib/auth-client";

interface ProfileFormProps {
  readonly defaultValues: {
    readonly name: string;
    readonly username: string;
  };
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setSaved(false);

    const form = new FormData(event.currentTarget);
    const username = String(form.get("username"));

    const { error } = await updateUser({
      name: String(form.get("name")),
      // Send both so the typed casing lands in displayUsername; username is lowercased server-side.
      username,
      displayUsername: username,
    });

    if (error) {
      setFormError(error.message ?? "Could not save your profile. Try again.");
      setPending(false);
      return;
    }

    setSaved(true);
    setPending(false);
    // Re-render server components (header avatar/name) with the new values.
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => setSaved(false)}
      className="flex flex-col gap-[14px]"
    >
      <Field label="Display name">
        {(props) => (
          <Input
            {...props}
            name="name"
            autoComplete="name"
            placeholder="Maya Chen"
            defaultValue={defaultValues.name}
            maxLength={60}
            required
          />
        )}
      </Field>

      <Field label="Username">
        {(props) => (
          <Input
            {...props}
            name="username"
            autoComplete="username"
            placeholder="maya"
            defaultValue={defaultValues.username}
            minLength={3}
            maxLength={24}
            required
          />
        )}
      </Field>

      {formError ? (
        <p role="alert" className="text-danger text-[13.5px]">
          {formError}
        </p>
      ) : null}

      <div className="mt-1.5 flex items-center gap-3">
        <Button type="submit" size="block" disabled={pending} className="flex-1">
          {pending ? "Saving…" : "Save profile"}
        </Button>
        {saved ? (
          <span role="status" className="text-positive text-[13.5px] font-medium">
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
