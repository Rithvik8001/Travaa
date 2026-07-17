/**
 * Pure itinerary helpers — no `server-only`, so the client island and the server
 * query share the vocabulary. Mirrors lib/trips/suggestions.ts: a read view plus a
 * deterministic ordering used at read time.
 */

export interface ItineraryItemView {
  readonly id: string;
  readonly title: string;
  readonly note: string | null;
  readonly url: string | null;
  /** Optional day within the trip window ("YYYY-MM-DD"), null until scheduled. */
  readonly date: string | null;
  readonly sortOrder: number;
  readonly createdBy: string;
  readonly createdByName: string;
  /** The idea it was promoted from, if any. */
  readonly sourceSuggestionId: string | null;
}

/**
 * Scheduled items first (by day), unscheduled last; then by explicit sortOrder.
 * Stable, so callers pass items already tie-broken by createdAt.
 */
export function sortItinerary(
  items: readonly ItineraryItemView[],
): ItineraryItemView[] {
  return [...items].sort((a, b) => {
    if (a.date !== b.date) {
      if (a.date === null) return 1;
      if (b.date === null) return -1;
      return a.date.localeCompare(b.date);
    }
    return a.sortOrder - b.sortOrder;
  });
}
