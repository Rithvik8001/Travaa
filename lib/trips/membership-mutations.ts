import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import {
  notifications,
  tripMembers,
  tripPackingItems,
  tripPackingLists,
  trips,
} from "@/lib/db/trips";

async function cleanupMember(tx: Parameters<Parameters<Database["transaction"]>[0]>[0], tripId: string, userId: string) {
  const memberLists = tx
    .select({ id: tripPackingLists.id })
    .from(tripPackingLists)
    .where(eq(tripPackingLists.tripId, tripId));
  await tx.update(tripPackingItems).set({ assignedTo: null }).where(
    and(eq(tripPackingItems.assignedTo, userId), inArray(tripPackingItems.listId, memberLists)),
  );
  await tx.update(tripPackingItems).set({ completedBy: null }).where(
    and(eq(tripPackingItems.completedBy, userId), inArray(tripPackingItems.listId, memberLists)),
  );
  await tx.delete(tripPackingLists).where(
    and(
      eq(tripPackingLists.tripId, tripId),
      eq(tripPackingLists.createdBy, userId),
      eq(tripPackingLists.visibility, "private"),
    ),
  );
  await tx.delete(tripMembers).where(
    and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)),
  );
  await tx.delete(notifications).where(
    and(eq(notifications.tripId, tripId), eq(notifications.recipientId, userId)),
  );
}

export async function removeMemberAs(database: Database, actorId: string, tripId: string, targetId: string) {
  const trip = await database.query.trips.findFirst({
    where: eq(trips.id, tripId),
    columns: { ownerId: true },
  });
  if (!trip || trip.ownerId !== actorId) return { error: "Only the organizer can remove members." } as const;
  if (targetId === trip.ownerId) return { error: "The organizer can't be removed." } as const;
  await database.transaction((tx) => cleanupMember(tx, tripId, targetId));
  return { ok: true } as const;
}

export async function leaveTripAs(database: Database, actorId: string, tripId: string) {
  const trip = await database.query.trips.findFirst({
    where: eq(trips.id, tripId),
    columns: { ownerId: true },
  });
  if (!trip) return { error: "Trip not found." } as const;
  if (trip.ownerId === actorId) return { error: "The organizer can't leave their trip." } as const;
  const member = await database.query.tripMembers.findFirst({
    where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, actorId)),
    columns: { id: true },
  });
  if (!member) return { error: "You're not a member of this trip." } as const;
  await database.transaction((tx) => cleanupMember(tx, tripId, actorId));
  return { ok: true } as const;
}
