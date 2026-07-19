import type { InboxAction } from "@/lib/notifications/format";

interface DateActionRow {
  readonly tripId: string;
  readonly tripName: string;
  readonly voteId: string | null;
}

interface PackingActionRow {
  readonly tripId: string;
  readonly tripName: string;
}

function aggregate(
  rows: readonly { tripId: string; tripName: string }[],
): Map<string, { tripName: string; count: number }> {
  const result = new Map<string, { tripName: string; count: number }>();
  for (const row of rows) {
    const current = result.get(row.tripId);
    result.set(row.tripId, {
      tripName: row.tripName,
      count: (current?.count ?? 0) + 1,
    });
  }
  return result;
}

export function buildInboxActions(
  dateRows: readonly DateActionRow[],
  packingRows: readonly PackingActionRow[],
): InboxAction[] {
  const dates = aggregate(dateRows.filter((row) => row.voteId === null));
  const packing = aggregate(packingRows);
  return [
    ...[...dates.entries()].map(([tripId, value]) => ({
      id: `date_response:${tripId}`,
      kind: "date_response" as const,
      tripId,
      tripName: value.tripName,
      count: value.count,
      href: `/trips/${tripId}#dates`,
    })),
    ...[...packing.entries()].map(([tripId, value]) => ({
      id: `packing_assignment:${tripId}`,
      kind: "packing_assignment" as const,
      tripId,
      tripName: value.tripName,
      count: value.count,
      href: `/trips/${tripId}/packing#packing-lists`,
    })),
  ].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "date_response" ? -1 : 1;
    return a.tripName.localeCompare(b.tripName);
  });
}

export function inboxBadgeCount(actionCount: number, unreadCount: number): number {
  return Math.max(0, actionCount) + Math.max(0, unreadCount);
}
