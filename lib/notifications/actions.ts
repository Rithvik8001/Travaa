"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notificationHref } from "@/lib/notifications/format";
import { markAllNotificationsReadAs, markNotificationReadAs, readNotificationAs } from "@/lib/notifications/mutations";
import { requireSession } from "@/lib/session";

function revalidateInbox() {
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

export async function openNotification(notificationId: string): Promise<void> {
  const { user } = await requireSession();
  const row = await readNotificationAs(db, user.id, notificationId);
  if (!row) redirect("/notifications");
  await markNotificationReadAs(db, user.id, row.id);
  revalidateInbox();
  redirect(notificationHref(row.type, row.tripId, row.entityId));
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const { user } = await requireSession();
  await markNotificationReadAs(db, user.id, notificationId);
  revalidateInbox();
}

export async function markAllNotificationsRead(): Promise<void> {
  const { user } = await requireSession();
  await markAllNotificationsReadAs(db, user.id);
  revalidateInbox();
}
