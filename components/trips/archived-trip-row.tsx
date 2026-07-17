import Link from "next/link";
import type { Trip } from "@/lib/db/trips";
import { tripCover } from "@/lib/trips/cover";
import { formatWindow } from "@/lib/trips/format";

/** A quiet archived trip row — a compact, muted list cell rather than a card. */
export function ArchivedTripRow({ trip }: { readonly trip: Trip }) {
  const meta = [formatWindow(trip.startDate, trip.endDate), trip.destination]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group hover:bg-surface flex items-center gap-3.5 rounded-[12px] px-3 py-3 transition-colors"
    >
      <span
        aria-hidden
        className="size-9 shrink-0 rounded-[8px] opacity-70 shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)]"
        style={{ background: tripCover(trip.id) }}
      />
      <span className="min-w-0 flex-1">
        <span className="text-foreground group-hover:text-ink block truncate text-[14.5px] font-medium transition-colors">
          {trip.name}
        </span>
        {meta ? (
          <span className="text-subtle-foreground block truncate text-[12.5px]">
            {meta}
          </span>
        ) : null}
      </span>
      <span className="text-subtle-foreground shrink-0 text-[12px] tracking-[0.04em] uppercase">
        Archived
      </span>
    </Link>
  );
}
