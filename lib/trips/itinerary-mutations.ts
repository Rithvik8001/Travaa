import "server-only";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { tripItineraryItems, tripMembers, trips } from "@/lib/db/trips";
import { moveItem } from "@/lib/trips/itinerary";

function groupWhere(tripId: string, date: string | null) {
  return and(
    eq(tripItineraryItems.tripId, tripId),
    date === null ? isNull(tripItineraryItems.date) : eq(tripItineraryItems.date, date),
  );
}

export async function itineraryItemAccess(database: Database, actorId: string, itemId: string) {
  const item = await database.query.tripItineraryItems.findFirst({ where: eq(tripItineraryItems.id, itemId) });
  if (!item) return { ok: false, error: "That itinerary item no longer exists." } as const;
  const member = await database.query.tripMembers.findFirst({
    where: and(eq(tripMembers.tripId, item.tripId), eq(tripMembers.userId, actorId)),
    columns: { id: true },
  });
  if (!member) return { ok: false, error: "You're not a member of this trip." } as const;
  const trip = await database.query.trips.findFirst({
    where: eq(trips.id, item.tripId),
    columns: { ownerId: true, archivedAt: true, datesLockedAt: true, startDate: true, endDate: true },
  });
  if (!trip) return { ok: false, error: "Trip not found." } as const;
  if (trip.archivedAt) return { ok: false, error: "This trip is archived." } as const;
  if (item.createdBy !== actorId && trip.ownerId !== actorId)
    return { ok: false, error: "You can't edit this itinerary item." } as const;
  return { ok: true, item, trip } as const;
}

export async function moveItineraryItemAs(
  database: Database,
  actorId: string,
  itemId: string,
  direction: "up" | "down",
): Promise<{ error: string } | { ok: true; tripId: string }> {
  if (direction !== "up" && direction !== "down") return { error: "Unknown move." } as const;
  const access = await itineraryItemAccess(database, actorId, itemId);
  if (!access.ok) return { error: access.error } as const;
  await database.transaction(async (tx) => {
    await tx.execute(sql`select ${trips.id} from ${trips} where ${trips.id} = ${access.item.tripId} for update`);
    const rows = await tx.select({ id: tripItineraryItems.id }).from(tripItineraryItems)
      .where(groupWhere(access.item.tripId, access.item.date))
      .orderBy(asc(tripItineraryItems.sortOrder), asc(tripItineraryItems.createdAt), asc(tripItineraryItems.id));
    const moved = moveItem(rows, rows.findIndex((row) => row.id === itemId), direction);
    for (const [sortOrder, row] of moved.entries()) {
      await tx.update(tripItineraryItems).set({ sortOrder }).where(eq(tripItineraryItems.id, row.id));
    }
  });
  return { ok: true, tripId: access.item.tripId } as const;
}
