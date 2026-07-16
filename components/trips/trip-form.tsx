"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { TripInput } from "@/lib/trips/actions";

export interface TripDefaults {
  readonly name: string;
  readonly destination: string;
  readonly startDate: string;
  readonly endDate: string;
}

interface TripFormProps {
  /** Bound server action. Redirects on success; returns `{ error }` on failure. */
  readonly action: (input: TripInput) => Promise<{ error: string } | void>;
  readonly submitLabel: string;
  readonly pendingLabel: string;
  readonly defaultValues?: TripDefaults;
}

export function TripForm({
  action,
  submitLabel,
  pendingLabel,
  defaultValues,
}: TripFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const result = await action({
      name: String(form.get("name") ?? ""),
      destination: String(form.get("destination") ?? ""),
      startDate: String(form.get("startDate") ?? ""),
      endDate: String(form.get("endDate") ?? ""),
    });

    // Success redirects, so we only get here on a validation/save error.
    if (result?.error) {
      setFormError(result.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
      <Field label="Trip name">
        {(props) => (
          <Input
            {...props}
            name="name"
            placeholder="Lisbon with the crew"
            defaultValue={defaultValues?.name}
            maxLength={80}
            autoFocus
            required
          />
        )}
      </Field>

      <Field label="Where to">
        {(props) => (
          <Input
            {...props}
            name="destination"
            placeholder="Alfama, Lisbon"
            defaultValue={defaultValues?.destination}
            maxLength={80}
          />
        )}
      </Field>

      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Start">
            {(props) => (
              <Input
                {...props}
                name="startDate"
                type="date"
                defaultValue={defaultValues?.startDate}
              />
            )}
          </Field>
        </div>
        <div className="flex-1">
          <Field label="End">
            {(props) => (
              <Input
                {...props}
                name="endDate"
                type="date"
                defaultValue={defaultValues?.endDate}
              />
            )}
          </Field>
        </div>
      </div>

      {formError ? (
        <p role="alert" className="text-danger text-[13.5px]">
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="block" disabled={pending} className="mt-1.5">
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
