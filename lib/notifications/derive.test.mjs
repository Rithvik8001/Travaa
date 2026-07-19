import { describe, expect, test } from "bun:test";
import { buildInboxActions, inboxBadgeCount } from "./derive.ts";

describe("derived inbox actions", () => {
  test("aggregates only unanswered date options per trip", () => {
    const actions = buildInboxActions(
      [
        { tripId: "b", tripName: "Zurich", voteId: null },
        { tripId: "a", tripName: "Athens", voteId: null },
        { tripId: "a", tripName: "Athens", voteId: null },
        { tripId: "a", tripName: "Athens", voteId: "answered" },
      ],
      [],
    );
    expect(actions.map((action) => [action.tripName, action.count])).toEqual([
      ["Athens", 2],
      ["Zurich", 1],
    ]);
  });

  test("groups packing rows and sorts them after date actions", () => {
    const actions = buildInboxActions(
      [{ tripId: "dates", tripName: "Dates", voteId: null }],
      [
        { tripId: "pack", tripName: "Packing" },
        { tripId: "pack", tripName: "Packing" },
      ],
    );
    expect(actions.map((action) => [action.kind, action.count])).toEqual([
      ["date_response", 1],
      ["packing_assignment", 2],
    ]);
  });

  test("adds unresolved actions and unread updates for the badge", () => {
    expect(inboxBadgeCount(2, 3)).toBe(5);
  });
});
