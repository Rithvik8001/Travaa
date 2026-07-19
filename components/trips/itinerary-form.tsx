"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addItineraryItem } from "@/lib/trips/actions";
import { enumerateDates, type LockedWindow } from "@/lib/trips/itinerary";

export function ItineraryForm({
  tripId,
  lockedWindow,
}: {
  readonly tripId: string;
  readonly lockedWindow: LockedWindow | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const days = lockedWindow
    ? enumerateDates(lockedWindow.startDate, lockedWindow.endDate)
    : [];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    startTransition(async () => {
      const result = await addItineraryItem(tripId, {
        title: String(data.get("title") ?? ""),
        note: String(data.get("note") ?? ""),
        url: String(data.get("url") ?? ""),
        date: lockedWindow ? String(data.get("date") ?? "") : "",
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="border-border bg-surface mt-5 rounded-[8px] border p-5">
      <div className="grid gap-3 min-[560px]:grid-cols-2">
        <label className="min-[560px]:col-span-2">
          <span className="text-muted-foreground mb-[6px] block font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
            Item
          </span>
          <Input name="title" placeholder="Check-in, dinner, a tour…" maxLength={120} required disabled={pending} />
        </label>
        <label className="min-[560px]:col-span-2">
          <span className="text-muted-foreground mb-[6px] block font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
            Note <span className="text-subtle-foreground normal-case tracking-normal">(optional)</span>
          </span>
          <Textarea name="note" placeholder="Reservation details, meeting point…" maxLength={500} disabled={pending} />
        </label>
        <label>
          <span className="text-muted-foreground mb-[6px] block font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
            Link <span className="text-subtle-foreground normal-case tracking-normal">(optional)</span>
          </span>
          <Input name="url" type="url" placeholder="https://…" disabled={pending} />
        </label>
        <label>
          <span className="text-muted-foreground mb-[6px] block font-mono text-[11px] font-medium tracking-[0.08em] uppercase">Day</span>
          <select name="date" defaultValue="" disabled={pending || !lockedWindow} className="border-border bg-surface text-foreground focus:border-border-strong focus:ring-ring/60 h-[42px] w-full rounded-[6px] border px-3 text-[14px] outline-none transition-[border-color,box-shadow] focus:ring-2 disabled:opacity-55">
            <option value="">Unscheduled</option>
            {days.map((date, index) => <option key={date} value={date}>Day {index + 1} · {date}</option>)}
          </select>
        </label>
      </div>
      {!lockedWindow ? <p className="text-subtle-foreground mt-2 text-[12.5px]">Lock the trip dates before assigning a day.</p> : null}
      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" variant="outline" size="sm" disabled={pending}>{pending ? "Adding…" : "Add item"}</Button>
        {error ? <p role="alert" className="text-danger text-[13px]">{error}</p> : null}
      </div>
    </form>
  );
}
