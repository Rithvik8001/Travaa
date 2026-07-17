import Link from "next/link";
import type { Trip } from "@/lib/db/trips";
import { tripCover } from "@/lib/trips/cover";
import { formatWindow } from "@/lib/trips/format";

/**
 * A standalone, muted archived row (Travaa.dc.html "Archived" section) — smaller
 * and quieter than an active row, its own rounded surface rather than a list cell.
 */
export function ArchivedTripRow({ trip }: { readonly trip: Trip }) {
  const meta = [formatWindow(trip.startDate, trip.endDate), trip.destination]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="border-hairline bg-surface-sunken hover:bg-muted flex items-center gap-4 rounded-[10px] border px-5 py-[14px] transition-colors"
    >
      <span
        aria-hidden
        className="size-10 shrink-0 rounded-[8px] opacity-60"
        style={{ background: tripCover(trip.id) }}
      />
      <span className="min-w-0 flex-1">
        <span className="text-muted-foreground block truncate text-[15px] font-semibold">
          {trip.name}
        </span>
        {meta ? (
          <span className="text-subtle-foreground block truncate text-[13px]">
            {meta}
          </span>
        ) : null}
      </span>
      <span className="text-subtle-foreground shrink-0 text-[13px]">Archived</span>
    </Link>
  );
}
