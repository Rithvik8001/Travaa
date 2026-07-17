/** Date-window formatting for trips. Inputs are plain "YYYY-MM-DD" strings or null. */

const EN_DASH = "–";

/** Parse a date-only string without dragging the local timezone into it. */
function parseDay(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function monthDay(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function monthDayYear(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * "Oct 12–16, 2026" (same month) · "Oct 12 – Nov 2, 2026" (same year) ·
 * "Dec 30, 2026 – Jan 2, 2027" (cross-year) · single date when only one is set ·
 * "" when neither is.
 */
export function formatWindow(
  startDate: string | null,
  endDate: string | null,
): string {
  if (!startDate && !endDate) return "";
  if (startDate && !endDate) return monthDayYear(parseDay(startDate));
  if (!startDate && endDate) return monthDayYear(parseDay(endDate));

  const start = parseDay(startDate!);
  const end = parseDay(endDate!);

  if (start.getFullYear() !== end.getFullYear()) {
    return `${monthDayYear(start)} ${EN_DASH} ${monthDayYear(end)}`;
  }
  if (start.getMonth() === end.getMonth()) {
    return `${monthDay(start)}${EN_DASH}${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${monthDay(start)} ${EN_DASH} ${monthDayYear(end)}`;
}

/** "in 3 months" / "in 5 days" / "today" for an upcoming start; "" once it's past or unset. */
export function relativeToNow(startDate: string | null): string {
  if (!startDate) return "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDay(startDate);
  const days = Math.round((start.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) return "";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days} days`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `in ${weeks} week${weeks === 1 ? "" : "s"}`;
  }
  const months = Math.round(days / 30);
  return `in ${months} month${months === 1 ? "" : "s"}`;
}

/** Compact "time since" for comment timestamps: "just now" / "5m" / "3h" / "2d" / "Oct 12". */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 45) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return monthDay(new Date(then));
}
