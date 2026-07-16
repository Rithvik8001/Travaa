import "server-only";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/trips";

/** Active trips owned by a user, newest first. "Your trips" for the dashboard. */
export async function listTripsForUser(userId: string) {
  return db.query.trips.findMany({
    where: and(eq(trips.ownerId, userId), isNull(trips.archivedAt)),
    orderBy: desc(trips.createdAt),
  });
}

/** Archived trips owned by a user, most-recently-archived first. */
export async function listArchivedTripsForUser(userId: string) {
  return db.query.trips.findMany({
    where: and(eq(trips.ownerId, userId), isNotNull(trips.archivedAt)),
    orderBy: desc(trips.archivedAt),
  });
}

/** A single trip scoped to its owner, active or archived. `null` when it isn't theirs. */
export async function getTripForUser(tripId: string, userId: string) {
  return (
    (await db.query.trips.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.ownerId, userId)),
    })) ?? null
  );
}
