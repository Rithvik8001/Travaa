import { describe, expect, test } from "bun:test";
import { packingProgress, sortPackingItems } from "./packing.ts";

describe("sortPackingItems", () => {
  test("puts incomplete items first and keeps creation order within each group", () => {
    const items = [
      { id: "done-late", createdAt: new Date("2026-01-04"), completedAt: new Date() },
      { id: "open-late", createdAt: new Date("2026-01-03"), completedAt: null },
      { id: "done-early", createdAt: new Date("2026-01-01"), completedAt: new Date() },
      { id: "open-early", createdAt: new Date("2026-01-02"), completedAt: null },
    ];

    expect(sortPackingItems(items).map((item) => item.id)).toEqual([
      "open-early",
      "open-late",
      "done-early",
      "done-late",
    ]);
  });
});

describe("packingProgress", () => {
  test("handles empty, partial, and completed lists", () => {
    expect(packingProgress([])).toEqual({ total: 0, completed: 0 });
    expect(packingProgress([{ completedAt: null }, { completedAt: new Date() }])).toEqual({ total: 2, completed: 1 });
    expect(packingProgress([{ completedAt: new Date() }, { completedAt: new Date() }])).toEqual({ total: 2, completed: 2 });
  });
});
