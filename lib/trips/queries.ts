import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/trips";

/** Trips owned by a user, newest first. "Your trips" for the dashboard. */
export async function listTripsForUser(userId: string) {
  return db.query.trips.findMany({
    where: eq(trips.ownerId, userId),
    orderBy: desc(trips.createdAt),
  });
}

/** A single trip scoped to its owner. `null` when it doesn't exist or isn't theirs. */
export async function getTripForUser(tripId: string, userId: string) {
  return (
    (await db.query.trips.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.ownerId, userId)),
    })) ?? null
  );
}
