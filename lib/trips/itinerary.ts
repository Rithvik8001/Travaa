/** Shared, date-only itinerary vocabulary and deterministic grouping helpers. */

export interface ItineraryItemView {
  readonly id: string;
  readonly title: string;
  readonly note: string | null;
  readonly url: string | null;
  readonly date: string | null;
  /** Position within the item's current date (or unscheduled) group. */
  readonly sortOrder: number;
  readonly createdBy: string;
  readonly createdByName: string;
  readonly createdAt: string;
  readonly sourceSuggestionId: string | null;
  /** Calculated on the server from authorship/ownership. */
  readonly canManage: boolean;
}

export interface LockedWindow {
  readonly startDate: string;
  readonly endDate: string;
}

export interface ItineraryGroup {
  readonly key: string;
  readonly date: string | null;
  readonly dayNumber: number | null;
  readonly weekday: string | null;
  readonly label: string;
  readonly items: readonly ItineraryItemView[];
}

const DAY_MS = 86_400_000;

function utcDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function enumerateDates(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate || endDate < startDate) return [];
  const dates: string[] = [];
  for (
    let time = utcDate(startDate).getTime();
    time <= utcDate(endDate).getTime();
    time += DAY_MS
  ) {
    dates.push(dateOnly(new Date(time)));
  }
  return dates;
}

export function isDateInWindow(
  date: string,
  startDate: string,
  endDate: string,
): boolean {
  return date >= startDate && date <= endDate;
}

function compareItems(a: ItineraryItemView, b: ItineraryItemView): number {
  return (
    a.sortOrder - b.sortOrder ||
    a.createdAt.localeCompare(b.createdAt) ||
    a.id.localeCompare(b.id)
  );
}

export function sortItinerary(
  items: readonly ItineraryItemView[],
): ItineraryItemView[] {
  return [...items].sort((a, b) => {
    if (a.date !== b.date) {
      if (a.date === null) return 1;
      if (b.date === null) return -1;
      return a.date.localeCompare(b.date);
    }
    return compareItems(a, b);
  });
}

export function groupItinerary(
  items: readonly ItineraryItemView[],
  lockedWindow: LockedWindow | null,
): ItineraryGroup[] {
  const ordered = sortItinerary(items);
  const groups: ItineraryGroup[] = [];

  if (lockedWindow) {
    for (const [index, date] of enumerateDates(
      lockedWindow.startDate,
      lockedWindow.endDate,
    ).entries()) {
      const parsed = utcDate(date);
      groups.push({
        key: date,
        date,
        dayNumber: index + 1,
        weekday: parsed.toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: "UTC",
        }),
        label: parsed.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        items: ordered.filter((item) => item.date === date),
      });
    }
  }

  // While the poll is open, keep previously scheduled rows visible in the one
  // planning bucket without rewriting their stored dates.
  const unscheduled = lockedWindow
    ? ordered.filter((item) => item.date === null)
    : ordered;
  if (!lockedWindow || unscheduled.length > 0) {
    groups.push({
      key: "unscheduled",
      date: null,
      dayNumber: null,
      weekday: null,
      label: "Unscheduled",
      items: unscheduled,
    });
  }

  return groups;
}

export function moveItem<T>(
  items: readonly T[],
  index: number,
  direction: "up" | "down",
): T[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length)
    return [...items];
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
