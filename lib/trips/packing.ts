export type PackingVisibility = "shared" | "private";

export interface PackingItemView {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly createdBy: string;
  readonly assignedTo: string | null;
  readonly assigneeName: string | null;
  readonly completedAt: Date | null;
  readonly completedBy: string | null;
  readonly completerName: string | null;
  readonly createdAt: Date;
}

export interface PackingListView {
  readonly id: string;
  readonly name: string;
  readonly visibility: PackingVisibility;
  readonly createdBy: string;
  readonly items: readonly PackingItemView[];
  readonly totalCount: number;
  readonly completedCount: number;
}

export function sortPackingItems<T extends { createdAt: Date; completedAt: Date | null }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) => {
    const completionOrder = Number(Boolean(a.completedAt)) - Number(Boolean(b.completedAt));
    if (completionOrder !== 0) return completionOrder;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export function packingProgress(
  items: readonly { completedAt: Date | null }[],
): { total: number; completed: number } {
  return {
    total: items.length,
    completed: items.filter((item) => item.completedAt).length,
  };
}
