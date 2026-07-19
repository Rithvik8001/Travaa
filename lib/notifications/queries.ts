import "server-only";
import {
  and,
  asc,
  count,
  desc,
  eq,
  isNull,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import {
  notifications,
  packingVisibility,
  trips,
  tripDateOptions,
  tripDateVotes,
  tripMembers,
  tripPackingItems,
  tripPackingLists,
} from "@/lib/db/trips";
import {
  notificationHref,
  notificationMessage,
  type InboxAction,
  type InboxView,
  type NotificationView,
} from "@/lib/notifications/format";
import { buildInboxActions, inboxBadgeCount } from "@/lib/notifications/derive";

const actor = alias(user, "notification_actor");

async function getDerivedActions(userId: string): Promise<InboxAction[]> {
  const [dateRows, packingRows] = await Promise.all([
    db
      .select({
        tripId: trips.id,
        tripName: trips.name,
        optionId: tripDateOptions.id,
        voteId: tripDateVotes.id,
      })
      .from(trips)
      .innerJoin(
        tripMembers,
        and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, userId)),
      )
      .innerJoin(tripDateOptions, eq(tripDateOptions.tripId, trips.id))
      .leftJoin(
        tripDateVotes,
        and(
          eq(tripDateVotes.optionId, tripDateOptions.id),
          eq(tripDateVotes.userId, userId),
        ),
      )
      .where(and(isNull(trips.archivedAt), isNull(trips.datesLockedAt))),
    db
      .select({
        tripId: trips.id,
        tripName: trips.name,
        itemId: tripPackingItems.id,
      })
      .from(tripPackingItems)
      .innerJoin(
        tripPackingLists,
        eq(tripPackingLists.id, tripPackingItems.listId),
      )
      .innerJoin(trips, eq(trips.id, tripPackingLists.tripId))
      .innerJoin(
        tripMembers,
        and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, userId)),
      )
      .where(
        and(
          isNull(trips.archivedAt),
          eq(tripPackingLists.visibility, packingVisibility.enumValues[0]),
          eq(tripPackingItems.assignedTo, userId),
          isNull(tripPackingItems.completedAt),
        ),
      ),
  ]);

  return buildInboxActions(dateRows, packingRows);
}

async function getUpdates(userId: string): Promise<NotificationView[]> {
  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      actorName: actor.name,
      tripId: notifications.tripId,
      tripName: trips.name,
      entityId: notifications.entityId,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .innerJoin(trips, eq(trips.id, notifications.tripId))
    .innerJoin(
      tripMembers,
      and(
        eq(tripMembers.tripId, notifications.tripId),
        eq(tripMembers.userId, userId),
      ),
    )
    .leftJoin(actor, eq(actor.id, notifications.actorId))
    .where(eq(notifications.recipientId, userId))
    .orderBy(
      asc(sql<boolean>`${notifications.readAt} is not null`),
      desc(notifications.createdAt),
    )
    .limit(50);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    actorName: row.actorName,
    tripName: row.tripName,
    message: notificationMessage(row.type, row.actorName, row.tripName),
    href: notificationHref(row.type, row.tripId, row.entityId),
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  }));
}

async function getUnreadCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(notifications)
    .innerJoin(
      tripMembers,
      and(
        eq(tripMembers.tripId, notifications.tripId),
        eq(tripMembers.userId, userId),
      ),
    )
    .where(
      and(eq(notifications.recipientId, userId), isNull(notifications.readAt)),
    );
  return row?.total ?? 0;
}

export async function getInbox(userId: string): Promise<InboxView> {
  const [actions, updates, unreadCount] = await Promise.all([
    getDerivedActions(userId),
    getUpdates(userId),
    getUnreadCount(userId),
  ]);
  return { actions, updates, actionCount: actions.length, unreadCount };
}

export async function getInboxBadgeCount(userId: string): Promise<number> {
  const [actions, unreadCount] = await Promise.all([
    getDerivedActions(userId),
    getUnreadCount(userId),
  ]);
  return inboxBadgeCount(actions.length, unreadCount);
}
