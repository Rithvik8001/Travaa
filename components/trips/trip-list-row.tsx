import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Trip } from "@/lib/db/trips";
import { tripCover } from "@/lib/trips/cover";
import { formatWindow, relativeToNow } from "@/lib/trips/format";
import { cn } from "@/lib/utils";

/** One dashboard trip cell — lives inside the collapsed-hairline grid. */
export function TripListRow({
  trip,
  className,
}: {
  readonly trip: Trip;
  readonly className?: string;
}) {
  const meta = [formatWindow(trip.startDate, trip.endDate), trip.destination]
    .filter(Boolean)
    .join(" · ");
  const relative = relativeToNow(trip.startDate);
  const monogram = trip.name.trim().slice(0, 2).toUpperCase() || "??";

  return (
    <Link
      href={`/trips/${trip.id}`}
      className={cn(
        "group hover:bg-surface-2 relative flex h-full min-h-[136px] flex-col justify-between gap-5 p-5 transition-colors duration-150",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className="border-hairline flex size-9 shrink-0 items-center justify-center rounded-[6px] border font-mono text-[12px] font-medium text-white"
          style={{ background: tripCover(trip.id) }}
        >
          {monogram}
        </span>
        <Badge tone="soft" size="sm">
          Planning
        </Badge>
      </div>
      <div className="min-w-0">
        <span className="text-ink block truncate text-[15px] font-semibold tracking-[-0.01em]">
          {trip.name}
        </span>
        <span className="text-subtle-foreground mt-1 block truncate font-mono text-[12px]">
          {meta || "No dates yet"}
        </span>
        {relative ? (
          <span className="text-muted-foreground mt-2 block text-[12.5px]">
            {relative}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
