"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MotionItem, PresenceList } from "@/components/ui/motion";
import { ItineraryForm } from "@/components/trips/itinerary-form";
import { formatWindow } from "@/lib/trips/format";
import type { ItineraryItemView } from "@/lib/trips/itinerary";
import { removeItineraryItem } from "@/lib/trips/actions";

interface ItineraryListProps {
  readonly tripId: string;
  readonly items: readonly ItineraryItemView[];
  readonly isOrganizer: boolean;
  /** Archived trip — the itinerary is read-only. */
  readonly readOnly: boolean;
}

export function ItineraryList({
  tripId,
  items,
  isOrganizer,
  readOnly,
}: ItineraryListProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const canManage = isOrganizer && !readOnly;

  function run(action: () => Promise<{ error: string } | void>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section>
      <div className="mb-4">
        <Eyebrow className="mb-2">Itinerary</Eyebrow>
        <h2 className="text-ink text-[19px] font-semibold tracking-[-0.02em]">
          The day-by-day
        </h2>
        <p className="text-subtle-foreground mt-0.5 text-[13.5px]">
          {readOnly
            ? "What the crew committed to."
            : "The plan taking shape — promote ideas or add items directly."}
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="text-subtle-foreground mx-auto max-w-[42ch] px-5 py-10 text-center text-[14px] leading-[1.55]">
            No plans set in stone yet.{" "}
            {canManage
              ? "Promote a favourite idea from above, or add an item below."
              : readOnly
                ? "Nothing was planned."
                : "The organizer builds this from the ideas above."}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <PresenceList>
            {items.map((item) => (
              <MotionItem key={item.id}>
                <Card className="px-5 py-[16px]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink text-[15.5px] font-semibold tracking-[-0.01em] break-words underline-offset-2 hover:underline"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <span className="text-ink text-[15.5px] font-semibold tracking-[-0.01em] break-words">
                        {item.title}
                      </span>
                    )}
                    {item.sourceSuggestionId ? (
                      <Badge tone="soft" size="sm">
                        From ideas
                      </Badge>
                    ) : null}
                  </div>
                  {item.note ? (
                    <p className="text-muted-foreground mt-1 text-[14px] leading-[1.5] break-words">
                      {item.note}
                    </p>
                  ) : null}
                  <div className="text-subtle-foreground mt-1.5 font-mono text-[11.5px]">
                    {item.date
                      ? formatWindow(item.date, null)
                      : "Unscheduled"}{" "}
                    · Added by {item.createdByName}
                  </div>
                </div>
                {canManage ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => removeItineraryItem(item.id))}
                    className="text-subtle-foreground hover:text-danger shrink-0 text-[12.5px] transition-colors disabled:opacity-55"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
                </Card>
              </MotionItem>
            ))}
          </PresenceList>
        </div>
      )}

      {canManage ? <ItineraryForm tripId={tripId} /> : null}

      {error ? (
        <p role="alert" className="text-danger mt-3 text-[13px]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
