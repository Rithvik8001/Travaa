import Link from "next/link";
import type { Trip } from "@/lib/db/trips";
import { tripCover } from "@/lib/trips/cover";
import { formatWindow } from "@/lib/trips/format";

/** One dashboard trip row (Travaa.dc.html trip list). Server-rendered — no client JS. */
export function TripListRow({ trip }: { readonly trip: Trip }) {
  const meta = [formatWindow(trip.startDate, trip.endDate), trip.destination]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="border-hairline hover:bg-surface-sunken flex items-center gap-4 border-b px-5 py-4 transition-colors last:border-b-0"
    >
      <span
        aria-hidden
        className="size-[52px] shrink-0 rounded-[10px]"
        style={{ background: tripCover(trip.id) }}
      />
      <span className="min-w-0 flex-1">
        <span className="text-ink block truncate text-[15.5px] font-semibold tracking-[-0.015em]">
          {trip.name}
        </span>
        {meta ? (
          <span className="text-subtle-foreground mt-px block truncate text-[13px]">
            {meta}
          </span>
        ) : null}
      </span>
      <span className="text-brand-ink bg-brand/10 shrink-0 rounded-full px-2.5 py-[3.5px] text-[10.5px] font-semibold tracking-[0.02em] whitespace-nowrap uppercase">
        Planning
      </span>
    </Link>
  );
}
