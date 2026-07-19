import { describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { trips } from "../../lib/db/trips";
import { itineraryItemAccess, moveItineraryItemAs } from "../../lib/trips/itinerary-mutations";
import { getItineraryForUser } from "../../lib/trips/queries";
import { testDb } from "./database";
import { addMember, createItineraryItem, createTrip, createUser, expectContiguous, itineraryOrder } from "./fixtures";

describe("itinerary authorization and ordering", () => {
  test("author and organizer can manage; another member and outsider cannot", async () => {
    const owner = await createUser(testDb, "item-owner");
    const author = await createUser(testDb, "item-author");
    const member = await createUser(testDb, "item-member");
    const outsider = await createUser(testDb, "item-outsider");
    const trip = await createTrip(testDb, owner.id);
    await addMember(testDb, trip.id, author.id);
    await addMember(testDb, trip.id, member.id);
    const item = await createItineraryItem(testDb, trip.id, author.id, 0);
    expect(await getItineraryForUser(testDb, trip.id, outsider.id)).toEqual([]);
    expect(await getItineraryForUser(testDb, trip.id, member.id)).toHaveLength(1);
    expect((await itineraryItemAccess(testDb, author.id, item.id)).ok).toBeTrue();
    expect((await itineraryItemAccess(testDb, owner.id, item.id)).ok).toBeTrue();
    expect((await itineraryItemAccess(testDb, member.id, item.id)).ok).toBeFalse();
    expect((await itineraryItemAccess(testDb, outsider.id, item.id)).ok).toBeFalse();
    await testDb.update(trips).set({ archivedAt: new Date() }).where(eq(trips.id, trip.id));
    expect((await itineraryItemAccess(testDb, author.id, item.id)).ok).toBeFalse();
  });

  test("moves only adjacent rows and normalizes stale positions", async () => {
    const owner = await createUser(testDb, "order-owner");
    const trip = await createTrip(testDb, owner.id);
    const first = await createItineraryItem(testDb, trip.id, owner.id, 0);
    const second = await createItineraryItem(testDb, trip.id, owner.id, 4);
    const third = await createItineraryItem(testDb, trip.id, owner.id, 9);
    expect(await moveItineraryItemAs(testDb, owner.id, second.id, "down")).toHaveProperty("ok", true);
    const rows = await itineraryOrder(testDb, trip.id);
    expectContiguous(rows);
    expect(rows.map((row) => row.id)).toEqual([first.id, third.id, second.id]);
    await moveItineraryItemAs(testDb, owner.id, first.id, "up");
    expect((await itineraryOrder(testDb, trip.id)).map((row) => row.id)).toEqual([first.id, third.id, second.id]);
  });

  test("serializes stale concurrent moves without duplicate positions", async () => {
    const owner = await createUser(testDb, "concurrent-owner");
    const trip = await createTrip(testDb, owner.id);
    const items = await Promise.all([0, 1, 2, 3].map((order) => createItineraryItem(testDb, trip.id, owner.id, order)));
    await Promise.all([
      moveItineraryItemAs(testDb, owner.id, items[1]!.id, "down"),
      moveItineraryItemAs(testDb, owner.id, items[2]!.id, "up"),
    ]);
    const rows = await itineraryOrder(testDb, trip.id);
    expect(rows).toHaveLength(items.length);
    expect(new Set(rows.map((row) => row.id)).size).toBe(items.length);
    expectContiguous(rows);
  });
});
