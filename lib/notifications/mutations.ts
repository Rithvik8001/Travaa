import "server-only";
import { and, eq, inArray, isNull } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { notifications, tripMembers } from "@/lib/db/trips";

function memberTripIds(database: Database, userId: string) {
  return database.select({ tripId: tripMembers.tripId }).from(tripMembers).where(eq(tripMembers.userId, userId));
}

export async function readNotificationAs(database: Database, actorId: string, notificationId: string) {
  const [row] = await database
    .select({ id: notifications.id, type: notifications.type, tripId: notifications.tripId, entityId: notifications.entityId })
    .from(notifications)
    .innerJoin(tripMembers, and(eq(tripMembers.tripId, notifications.tripId), eq(tripMembers.userId, actorId)))
    .where(and(eq(notifications.id, notificationId), eq(notifications.recipientId, actorId)))
    .limit(1);
  return row ?? null;
}

export async function markNotificationReadAs(database: Database, actorId: string, notificationId: string) {
  const rows = await database.update(notifications).set({ readAt: new Date() }).where(
    and(
      eq(notifications.id, notificationId),
      eq(notifications.recipientId, actorId),
      inArray(notifications.tripId, memberTripIds(database, actorId)),
      isNull(notifications.readAt),
    ),
  ).returning({ id: notifications.id });
  return rows.length > 0;
}

export async function markAllNotificationsReadAs(database: Database, actorId: string) {
  return database.update(notifications).set({ readAt: new Date() }).where(
    and(
      eq(notifications.recipientId, actorId),
      inArray(notifications.tripId, memberTripIds(database, actorId)),
      isNull(notifications.readAt),
    ),
  ).returning({ id: notifications.id });
}
