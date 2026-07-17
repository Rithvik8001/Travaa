"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { proposeDateOption } from "@/lib/trips/actions";

/** Add a candidate window to the poll. Any member; clears on success. */
export function ProposeWindowForm({ tripId }: { readonly tripId: string }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await proposeDateOption(tripId, { startDate, endDate });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setStartDate("");
      setEndDate("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[130px]">
          <span className="text-foreground mb-[6px] block text-[13px] font-medium tracking-[-0.01em]">
            Start
          </span>
          <Input
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>
        <label className="flex-1 min-w-[130px]">
          <span className="text-foreground mb-[6px] block text-[13px] font-medium tracking-[-0.01em]">
            End
          </span>
          <Input
            name="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </label>
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add window"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-danger mt-2 text-[13px]">
          {error}
        </p>
      ) : null}
    </form>
  );
}
