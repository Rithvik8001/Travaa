import type { NotificationType } from "@/lib/db/trips";

export type InboxActionKind = "date_response" | "packing_assignment";

export interface InboxAction {
  readonly id: string;
  readonly kind: InboxActionKind;
  readonly tripId: string;
  readonly tripName: string;
  readonly count: number;
  readonly href: string;
}

export interface NotificationView {
  readonly id: string;
  readonly type: NotificationType;
  readonly actorName: string | null;
  readonly tripName: string;
  readonly message: string;
  readonly href: string;
  readonly read: boolean;
  readonly createdAt: string;
}

export interface InboxView {
  readonly actions: readonly InboxAction[];
  readonly updates: readonly NotificationView[];
  readonly actionCount: number;
  readonly unreadCount: number;
}

export function notificationEventKey(
  type: NotificationType,
  values: readonly string[],
): string {
  return `${type}:${values.join(":")}`;
}

export function notificationMessage(
  type: NotificationType,
  actorName: string | null,
  tripName: string,
): string {
  const actor = actorName ?? "Someone";
  switch (type) {
    case "member_joined":
      return `${actor} joined ${tripName}.`;
    case "dates_locked":
      return `${actor} locked the dates for ${tripName}.`;
    case "idea_commented":
      return `${actor} commented on your idea in ${tripName}.`;
    case "comment_replied":
      return `${actor} replied to your comment in ${tripName}.`;
    case "idea_converted":
      return `${actor} added your idea to the itinerary for ${tripName}.`;
  }
}

export function notificationHref(
  type: NotificationType,
  tripId: string,
  entityId: string | null,
): string {
  switch (type) {
    case "dates_locked":
      return `/trips/${tripId}#dates`;
    case "idea_commented":
    case "comment_replied":
      return entityId
        ? `/trips/${tripId}?idea=${encodeURIComponent(entityId)}#idea-${encodeURIComponent(entityId)}`
        : `/trips/${tripId}#ideas`;
    case "idea_converted":
      return `/trips/${tripId}#itinerary`;
    case "member_joined":
      return `/trips/${tripId}`;
  }
}

export function badgeLabel(count: number): string {
  return count > 99 ? "99+" : String(Math.max(0, count));
}

export function shouldNotify(actorId: string, recipientId: string): boolean {
  return actorId !== recipientId;
}
