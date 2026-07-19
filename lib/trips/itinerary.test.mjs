import { describe, expect, test } from "bun:test";
import {
  enumerateDates,
  groupItinerary,
  isDateInWindow,
  moveItem,
  sortItinerary,
} from "./itinerary.ts";

function item(id, date, sortOrder, createdAt = "2026-01-01T00:00:00.000Z") {
  return {
    id,
    title: id,
    note: null,
    url: null,
    date,
    sortOrder,
    createdBy: "user",
    createdByName: "User",
    createdAt,
    sourceSuggestionId: null,
    canManage: true,
  };
}

describe("itinerary dates", () => {
  test("enumerates inclusive dates across month and year boundaries", () => {
    expect(enumerateDates("2026-12-30", "2027-01-02")).toEqual([
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
    ]);
  });

  test("validates inclusive window boundaries", () => {
    expect(isDateInWindow("2026-07-10", "2026-07-10", "2026-07-12")).toBe(true);
    expect(isDateInWindow("2026-07-12", "2026-07-10", "2026-07-12")).toBe(true);
    expect(isDateInWindow("2026-07-13", "2026-07-10", "2026-07-12")).toBe(false);
  });
});

describe("groupItinerary", () => {
  test("renders every locked day and unscheduled last", () => {
    const groups = groupItinerary(
      [item("later", "2026-07-12", 0), item("loose", null, 0)],
      { startDate: "2026-07-10", endDate: "2026-07-12" },
    );
    expect(groups.map((group) => group.key)).toEqual([
      "2026-07-10",
      "2026-07-11",
      "2026-07-12",
      "unscheduled",
    ]);
    expect(groups[0].items).toEqual([]);
  });

  test("shows only unscheduled while dates are unlocked", () => {
    const groups = groupItinerary(
      [item("previously-scheduled", "2026-07-10", 0), item("loose", null, 1)],
      null,
    );
    expect(groups.map((g) => g.key)).toEqual(["unscheduled"]);
    expect(groups[0].items.map((entry) => entry.id)).toEqual([
      "previously-scheduled",
      "loose",
    ]);
  });
});

describe("itinerary ordering", () => {
  test("uses sort order then creation time and id deterministically", () => {
    const sorted = sortItinerary([
      item("b", "2026-07-10", 0, "2026-01-02T00:00:00.000Z"),
      item("c", null, 0),
      item("a", "2026-07-10", 0, "2026-01-01T00:00:00.000Z"),
      item("d", "2026-07-10", 2),
    ]);
    expect(sorted.map((entry) => entry.id)).toEqual(["a", "b", "d", "c"]);
  });

  test("moves only to an adjacent valid position", () => {
    expect(moveItem(["a", "b", "c"], 1, "up")).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b", "c"], 1, "down")).toEqual(["a", "c", "b"]);
    expect(moveItem(["a", "b"], 0, "up")).toEqual(["a", "b"]);
  });
});
