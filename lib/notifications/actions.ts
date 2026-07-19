"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notifications, tripMembers } from "@/lib/db/trips";
import { notificationHref } from "@/lib/notifications/format";
import { requireSession } from "@/lib/session";

function revalidateInbox() {
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

function memberTripIds(userId: string) {
  return db
    .select({ tripId: tripMembers.tripId })
    .from(tripMembers)
    .where(eq(tripMembers.userId, userId));
}

export async function openNotification(notificationId: string): Promise<void> {
  const { user } = await requireSession();
  const [row] = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      tripId: notifications.tripId,
      entityId: notifications.entityId,
    })
    .from(notifications)
    .innerJoin(
      tripMembers,
      and(
        eq(tripMembers.tripId, notifications.tripId),
        eq(tripMembers.userId, user.id),
      ),
    )
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientId, user.id),
      ),
    )
    .limit(1);
  if (!row) redirect("/notifications");

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, row.id),
        eq(notifications.recipientId, user.id),
        inArray(notifications.tripId, memberTripIds(user.id)),
        isNull(notifications.readAt),
      ),
    );
  revalidateInbox();
  redirect(notificationHref(row.type, row.tripId, row.entityId));
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const { user } = await requireSession();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientId, user.id),
        inArray(notifications.tripId, memberTripIds(user.id)),
        isNull(notifications.readAt),
      ),
    );
  revalidateInbox();
}

export async function markAllNotificationsRead(): Promise<void> {
  const { user } = await requireSession();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.recipientId, user.id),
        inArray(notifications.tripId, memberTripIds(user.id)),
        isNull(notifications.readAt),
      ),
    );
  revalidateInbox();
}
