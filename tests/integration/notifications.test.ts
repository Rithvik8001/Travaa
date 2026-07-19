import { describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { notifications } from "../../lib/db/trips";
import { emitNotifications } from "../../lib/notifications/emit";
import { markAllNotificationsReadAs, markNotificationReadAs, readNotificationAs } from "../../lib/notifications/mutations";
import { testDb } from "./database";
import { addMember, createNotification, createTrip, createUser, fixtureId } from "./fixtures";

describe("notification delivery and ownership", () => {
  test("persists every supported high-signal notification type", async () => {
    const owner = await createUser(testDb, "types-owner");
    const member = await createUser(testDb, "types-member");
    const trip = await createTrip(testDb, owner.id);
    await addMember(testDb, trip.id, member.id);
    const types = ["member_joined", "dates_locked", "idea_commented", "comment_replied", "idea_converted"] as const;
    await testDb.transaction((tx) => emitNotifications(tx, types.map((type) => ({
      recipientId: owner.id,
      actorId: member.id,
      tripId: trip.id,
      type,
      eventKey: fixtureId(type),
    }))));
    const rows = await testDb.select({ type: notifications.type }).from(notifications)
      .where(eq(notifications.recipientId, owner.id));
    expect(new Set(rows.map((row) => row.type))).toEqual(new Set(types));
  });

  test("suppresses self delivery and deduplicates event keys", async () => {
    const owner = await createUser(testDb, "notify-owner");
    const member = await createUser(testDb, "notify-member");
    const trip = await createTrip(testDb, owner.id);
    await addMember(testDb, trip.id, member.id);
    const eventKey = fixtureId("joined");
    await testDb.transaction(async (tx) => {
      const events = [
        { recipientId: owner.id, actorId: member.id, tripId: trip.id, type: "member_joined" as const, eventKey },
        { recipientId: member.id, actorId: member.id, tripId: trip.id, type: "member_joined" as const, eventKey: `${eventKey}-self` },
      ];
      await emitNotifications(tx, events);
      await emitNotifications(tx, events);
    });
    const rows = await testDb.select().from(notifications).where(eq(notifications.eventKey, eventKey));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.recipientId).toBe(owner.id);
  });

  test("read operations are recipient and membership scoped", async () => {
    const owner = await createUser(testDb, "read-owner");
    const member = await createUser(testDb, "read-member");
    const outsider = await createUser(testDb, "read-outsider");
    const trip = await createTrip(testDb, owner.id);
    await addMember(testDb, trip.id, member.id);
    const notification = await createNotification(testDb, trip.id, member.id, owner.id);
    expect(await readNotificationAs(testDb, outsider.id, notification.id)).toBeNull();
    expect(await markNotificationReadAs(testDb, outsider.id, notification.id)).toBeFalse();
    expect(await markNotificationReadAs(testDb, member.id, notification.id)).toBeTrue();
    const second = await createNotification(testDb, trip.id, member.id, owner.id);
    expect(await markAllNotificationsReadAs(testDb, member.id)).toHaveLength(1);
    expect((await testDb.query.notifications.findFirst({ where: eq(notifications.id, second.id) }))?.readAt).not.toBeNull();
  });
});
