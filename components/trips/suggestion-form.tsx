"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { proposeSuggestion } from "@/lib/trips/actions";

/** Add an idea to the board. Any member; clears on success. */
export function SuggestionForm({ tripId }: { readonly tripId: string }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await proposeSuggestion(tripId, { title, note: "", url });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setTitle("");
      setUrl("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[200px] flex-[2]">
          <span className="text-muted-foreground mb-[6px] block font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
            Idea
          </span>
          <Input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A place to stay, a spot to eat…"
            maxLength={120}
            required
          />
        </label>
        <label className="min-w-[160px] flex-1">
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
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add idea"}
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
