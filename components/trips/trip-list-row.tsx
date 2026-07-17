import Link from "next/link";
import type { Trip } from "@/lib/db/trips";
import { tripCover } from "@/lib/trips/cover";
import { formatWindow, relativeToNow } from "@/lib/trips/format";

/** One dashboard trip card. Server-rendered — no client JS. */
export function TripListRow({ trip }: { readonly trip: Trip }) {
  const meta = [formatWindow(trip.startDate, trip.endDate), trip.destination]
    .filter(Boolean)
    .join(" · ");
  const relative = relativeToNow(trip.startDate);

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group bg-surface shadow-card hover:shadow-border-hover flex flex-col overflow-hidden rounded-[16px] transition-[box-shadow,transform] duration-200 active:scale-[0.99]"
    >
      <span
        aria-hidden
        className="relative h-[104px] w-full shadow-[inset_0_0_0_1px_oklch(0_0_0/0.06)]"
        style={{ background: tripCover(trip.id) }}
      >
        <span className="text-brand-ink absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-[3.5px] text-[10px] font-semibold tracking-[0.04em] uppercase backdrop-blur-sm">
          Planning
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 p-4">
        <span className="text-ink truncate text-[16px] font-semibold tracking-[-0.015em]">
          {trip.name}
        </span>
        <span className="text-subtle-foreground truncate text-[13px]">
          {meta || "No dates yet"}
        </span>
        {relative ? (
          <span className="text-brand-ink mt-1.5 text-[12.5px] font-medium">
            {relative}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
