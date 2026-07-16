import "server-only";
import { and, asc, desc, eq, getTableColumns, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { trips, tripMembers } from "@/lib/db/trips";
import { user } from "@/lib/db/schema";

/** Active trips the user belongs to, newest first. "Your trips" for the dashboard. */
export async function listTripsForUser(userId: string) {
  return db
    .select(getTableColumns(trips))
    .from(trips)
    .innerJoin(tripMembers, eq(tripMembers.tripId, trips.id))
    .where(and(eq(tripMembers.userId, userId), isNull(trips.archivedAt)))
    .orderBy(desc(trips.createdAt));
}

/** Archived trips the user belongs to, most-recently-archived first. */
export async function listArchivedTripsForUser(userId: string) {
  return db
    .select(getTableColumns(trips))
    .from(trips)
    .innerJoin(tripMembers, eq(tripMembers.tripId, trips.id))
    .where(and(eq(tripMembers.userId, userId), isNotNull(trips.archivedAt)))
    .orderBy(desc(trips.archivedAt));
}

/** A single trip the user is a member of, active or archived. `null` when they aren't. */
export async function getTripForUser(tripId: string, userId: string) {
  const [trip] = await db
    .select(getTableColumns(trips))
    .from(trips)
    .innerJoin(tripMembers, eq(tripMembers.tripId, trips.id))
    .where(and(eq(trips.id, tripId), eq(tripMembers.userId, userId)))
    .limit(1);
  return trip ?? null;
}

/** A trip by its shareable join code (for the /j/<code> deep link). `null` if unknown. */
export async function getTripByInviteCode(code: string) {
  return (
    (await db.query.trips.findFirst({
      where: eq(trips.inviteCode, code),
    })) ?? null
  );
}

export interface TripMemberView {
  readonly id: string;
  readonly name: string;
  readonly isOwner: boolean;
}

/** The trip's crew for the header stack / roster, owner first (joined earliest). */
export async function listTripMembers(tripId: string): Promise<TripMemberView[]> {
  const rows = await db
    .select({ id: user.id, name: user.name, joinedAt: tripMembers.joinedAt, ownerId: trips.ownerId })
    .from(tripMembers)
    .innerJoin(user, eq(user.id, tripMembers.userId))
    .innerJoin(trips, eq(trips.id, tripMembers.tripId))
    .where(eq(tripMembers.tripId, tripId))
    .orderBy(asc(tripMembers.joinedAt));

  return rows.map((r) => ({ id: r.id, name: r.name, isOwner: r.id === r.ownerId }));
}
