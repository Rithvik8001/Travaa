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
        className="size-[54px] shrink-0 rounded-[13px]"
        style={{ background: tripCover(trip.id) }}
      />
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[16px] font-semibold tracking-[-0.01em]">
          {trip.name}
        </span>
        {meta ? (
          <span className="text-subtle-foreground mt-px block truncate text-[13.5px]">
            {meta}
          </span>
        ) : null}
      </span>
      <span className="text-brand-ink bg-brand/12 shrink-0 rounded-[7px] px-[9px] py-1 text-[11px] font-semibold tracking-[0.03em] whitespace-nowrap uppercase">
        Planning
      </span>
    </Link>
  );
}
