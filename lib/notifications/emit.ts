import "server-only";
import { randomUUID } from "node:crypto";
import { notifications, type NotificationType } from "@/lib/db/trips";
import type { DatabaseTransaction } from "@/lib/db/client";
import { shouldNotify } from "@/lib/notifications/format";

export type DbTransaction = DatabaseTransaction;

export interface NotificationEvent {
  readonly recipientId: string;
  readonly actorId: string;
  readonly tripId: string;
  readonly type: NotificationType;
  readonly entityId?: string | null;
  readonly eventKey: string;
}

export async function emitNotifications(
  tx: DbTransaction,
  events: readonly NotificationEvent[],
): Promise<void> {
  const values = events
    .filter((event) => shouldNotify(event.actorId, event.recipientId))
    .map((event) => ({
      id: randomUUID(),
      recipientId: event.recipientId,
      actorId: event.actorId,
      tripId: event.tripId,
      type: event.type,
      entityId: event.entityId ?? null,
      eventKey: event.eventKey,
    }));
  if (values.length === 0) return;
  await tx
    .insert(notifications)
    .values(values)
    .onConflictDoNothing({
      target: [notifications.recipientId, notifications.eventKey],
    });
}
