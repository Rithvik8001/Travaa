import { describe, expect, test } from "bun:test";
import {
  badgeLabel,
  notificationEventKey,
  notificationHref,
  notificationMessage,
  shouldNotify,
} from "./format.ts";

describe("notification copy and destinations", () => {
  test("formats every durable update", () => {
    expect(notificationMessage("member_joined", "Maya", "Lisbon")).toBe("Maya joined Lisbon.");
    expect(notificationMessage("dates_locked", "Maya", "Lisbon")).toBe("Maya locked the dates for Lisbon.");
    expect(notificationMessage("idea_commented", "Maya", "Lisbon")).toBe("Maya commented on your idea in Lisbon.");
    expect(notificationMessage("comment_replied", "Maya", "Lisbon")).toBe("Maya replied to your comment in Lisbon.");
    expect(notificationMessage("idea_converted", "Maya", "Lisbon")).toBe("Maya added your idea to the itinerary for Lisbon.");
  });

  test("uses a deleted-actor fallback and focused links", () => {
    expect(notificationMessage("member_joined", null, "Lisbon")).toBe("Someone joined Lisbon.");
    expect(notificationHref("dates_locked", "trip", null)).toBe("/trips/trip#dates");
    expect(notificationHref("idea_commented", "trip", "idea id")).toBe("/trips/trip?idea=idea%20id#idea-idea%20id");
    expect(notificationHref("idea_converted", "trip", "idea")).toBe("/trips/trip#itinerary");
  });
});

describe("notification identity", () => {
  test("builds deterministic event keys and suppresses self notifications", () => {
    expect(notificationEventKey("member_joined", ["member-id"])).toBe("member_joined:member-id");
    expect(shouldNotify("a", "a")).toBe(false);
    expect(shouldNotify("a", "b")).toBe(true);
  });

  test("caps visual badge values", () => {
    expect(badgeLabel(0)).toBe("0");
    expect(badgeLabel(99)).toBe("99");
    expect(badgeLabel(100)).toBe("99+");
  });
});
