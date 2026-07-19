import { describe, expect, test } from "bun:test";
import { and, eq } from "drizzle-orm";
import { notifications, tripMembers, tripPackingItems, tripPackingLists } from "../../lib/db/trips";
import { leaveTripAs, removeMemberAs } from "../../lib/trips/membership-mutations";
import { testDb } from "./database";
import { addMember, createNotification, createPackingItem, createPackingList, createTrip, createUser } from "./fixtures";

describe("membership cleanup", () => {
  test("organizer removal clears private state and preserves shared content", async () => {
    const owner = await createUser(testDb, "owner");
    const member = await createUser(testDb, "member");
    const trip = await createTrip(testDb, owner.id);
    await addMember(testDb, trip.id, member.id);
    const shared = await createPackingList(testDb, trip.id, owner.id, "shared");
    const privateList = await createPackingList(testDb, trip.id, member.id, "private");
    const sharedItem = await createPackingItem(testDb, shared.id, owner.id, member.id);
    await createPackingItem(testDb, privateList.id, member.id);
    await createNotification(testDb, trip.id, member.id, owner.id);

    expect(await removeMemberAs(testDb, member.id, trip.id, owner.id)).toHaveProperty("error");
    expect(await removeMemberAs(testDb, owner.id, trip.id, member.id)).toEqual({ ok: true });

    expect(await testDb.query.tripMembers.findFirst({ where: and(eq(tripMembers.tripId, trip.id), eq(tripMembers.userId, member.id)) })).toBeUndefined();
    expect(await testDb.query.tripPackingLists.findFirst({ where: eq(tripPackingLists.id, privateList.id) })).toBeUndefined();
    const retained = await testDb.query.tripPackingItems.findFirst({ where: eq(tripPackingItems.id, sharedItem.id) });
    expect(retained?.assignedTo).toBeNull();
    expect(retained?.completedBy).toBeNull();
    expect(await testDb.query.notifications.findFirst({ where: and(eq(notifications.tripId, trip.id), eq(notifications.recipientId, member.id)) })).toBeUndefined();
  });

  test("leaving requires active membership and the organizer cannot leave", async () => {
    const owner = await createUser(testDb, "leave-owner");
    const member = await createUser(testDb, "leaver");
    const outsider = await createUser(testDb, "outsider");
    const trip = await createTrip(testDb, owner.id);
    await addMember(testDb, trip.id, member.id);
    expect(await leaveTripAs(testDb, owner.id, trip.id)).toHaveProperty("error");
    expect(await leaveTripAs(testDb, outsider.id, trip.id)).toHaveProperty("error");
    expect(await leaveTripAs(testDb, member.id, trip.id)).toEqual({ ok: true });
  });
});
