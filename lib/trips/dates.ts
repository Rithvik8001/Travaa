/**
 * Pure date-poll helpers — no `server-only`, so the client island, the server
 * query, and the marketing landing can all share the vocabulary. Availability
 * mirrors the DB enum in lib/db/trips.ts and the landing's three states.
 */

export type Availability = "yes" | "maybe" | "no";

/** "available" carries the blue accent; maybe/no stay quiet warm gray. */
export const AVAILABILITY_COLOR: Readonly<Record<Availability, string>> = {
  yes: "oklch(0.585 0.19 266)",
  maybe: "oklch(0.74 0.015 80)",
  no: "oklch(0.83 0.01 80)",
};

export interface DateOptionCounts {
  readonly yes: number;
  readonly maybe: number;
  readonly no: number;
  /** yes + maybe — the "5/6 available" figure on the poll rows. */
  readonly available: number;
  /** Crew size, the denominator. */
  readonly total: number;
}

export interface DateOptionView {
  readonly id: string;
  /** Plain "YYYY-MM-DD" strings, as stored. */
  readonly startDate: string;
  readonly endDate: string;
  readonly createdBy: string;
  readonly counts: DateOptionCounts;
  /** The caller's own stance, or null if they haven't responded. */
  readonly myValue: Availability | null;
  /** Every member's stance, keyed by userId (for the avatar stack). */
  readonly responses: Readonly<Record<string, Availability>>;
}

export interface RankedDateOption extends DateOptionView {
  /** The leading window once there's a signal and something to beat. */
  readonly bestFit: boolean;
}

/** Nights between two date-only strings (end − start), floored at 0. */
export function nights(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

/**
 * Rank windows: most `yes`, then most `available`, then earliest start. The top
 * window is flagged `bestFit` once it has a positive signal and there's more
 * than one option to choose between.
 */
export function rankOptions(
  options: readonly DateOptionView[],
): RankedDateOption[] {
  const sorted = [...options].sort((a, b) => {
    if (b.counts.yes !== a.counts.yes) return b.counts.yes - a.counts.yes;
    if (b.counts.available !== a.counts.available)
      return b.counts.available - a.counts.available;
    return a.startDate.localeCompare(b.startDate);
  });

  return sorted.map((option, i) => ({
    ...option,
    bestFit: i === 0 && sorted.length > 1 && option.counts.available > 0,
  }));
}
