"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addItineraryItem } from "@/lib/trips/actions";

/** Add an item to the itinerary directly. Organizer-only; clears on success. */
export function ItineraryForm({ tripId }: { readonly tripId: string }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addItineraryItem(tripId, {
        title,
        note: "",
        url,
        date,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setTitle("");
      setUrl("");
      setDate("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[180px] flex-[2]">
          <span className="text-muted-foreground mb-[6px] block font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
            Item
          </span>
          <Input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Check-in, dinner, a tour…"
            maxLength={120}
            required
          />
        </label>
        <label className="min-w-[150px] flex-1">
          <span className="text-muted-foreground mb-[6px] block font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
            Link{" "}
            <span className="text-subtle-foreground normal-case tracking-normal">
              (optional)
            </span>
          </span>
          <Input
            name="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>
        <label className="min-w-[140px]">
          <span className="text-muted-foreground mb-[6px] block font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
            Day{" "}
            <span className="text-subtle-foreground normal-case tracking-normal">
              (optional)
            </span>
          </span>
          <Input
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add item"}
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
