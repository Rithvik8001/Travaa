import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Trip } from "@/lib/db/trips";
import { tripCover } from "@/lib/trips/cover";
import { formatWindow } from "@/lib/trips/format";
import { cn } from "@/lib/utils";

/** A quiet archived trip cell — a compact, muted row inside the archived grid. */
export function ArchivedTripRow({
  trip,
  className,
}: {
  readonly trip: Trip;
  readonly className?: string;
}) {
  const meta = [formatWindow(trip.startDate, trip.endDate), trip.destination]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/trips/${trip.id}`}
      className={cn(
        "group hover:bg-surface-2 flex items-center gap-3.5 p-4 transition-colors duration-150",
        className,
      )}
    >
      <span
        aria-hidden
        className="border-hairline size-8 shrink-0 rounded-[6px] border opacity-70"
        style={{ background: tripCover(trip.id) }}
      />
      <span className="min-w-0 flex-1">
        <span className="text-foreground group-hover:text-ink block truncate text-[14px] font-medium transition-colors">
          {trip.name}
        </span>
        {meta ? (
          <span className="text-subtle-foreground block truncate font-mono text-[11.5px]">
            {meta}
          </span>
        ) : null}
      </span>
      <Badge tone="outline" size="sm">
        Archived
      </Badge>
    </Link>
  );
}
