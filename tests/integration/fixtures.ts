import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { DatabaseExecutor } from "../../lib/db/client";
import { user } from "../../lib/db/schema";
import {
  notifications,
  tripItineraryItems,
  tripMembers,
  tripPackingItems,
  tripPackingLists,
  tripSuggestions,
  trips,
  type NotificationType,
} from "../../lib/db/trips";

export function fixtureId(label: string) {
  return `${label}-${randomUUID()}`;
}

export async function createUser(executor: DatabaseExecutor, label = "user") {
  const id = fixtureId(label);
  const [row] = await executor.insert(user).values({
    id,
    name: label,
    email: `${id}@example.test`,
    emailVerified: true,
    username: id.toLowerCase(),
    displayUsername: label,
  }).returning();
  return row;
}

export async function createTrip(executor: DatabaseExecutor, ownerId: string, values: Partial<typeof trips.$inferInsert> = {}) {
  const id = values.id ?? fixtureId("trip");
  const [trip] = await executor.insert(trips).values({ id, ownerId, name: values.name ?? "Fixture trip", ...values }).returning();
  await addMember(executor, id, ownerId);
  return trip;
}

export async function addMember(executor: DatabaseExecutor, tripId: string, userId: string) {
  const [member] = await executor.insert(tripMembers).values({ id: fixtureId("member"), tripId, userId }).returning();
  return member;
}

export async function createSuggestion(executor: DatabaseExecutor, tripId: string, createdBy: string) {
  const [row] = await executor.insert(tripSuggestions).values({
    id: fixtureId("suggestion"), tripId, createdBy, title: "Fixture idea",
  }).returning();
  return row;
}

export async function createItineraryItem(
  executor: DatabaseExecutor,
  tripId: string,
  createdBy: string,
  sortOrder: number,
  date: string | null = null,
) {
  const [row] = await executor.insert(tripItineraryItems).values({
    id: fixtureId("item"), tripId, createdBy, title: `Item ${sortOrder}`, sortOrder, date,
  }).returning();
  return row;
}

export async function createPackingList(
  executor: DatabaseExecutor,
  tripId: string,
  createdBy: string,
  visibility: "shared" | "private",
) {
  const [row] = await executor.insert(tripPackingLists).values({
    id: fixtureId("list"), tripId, createdBy, name: `${visibility} list`, visibility,
  }).returning();
  return row;
}

export async function createPackingItem(
  executor: DatabaseExecutor,
  listId: string,
  createdBy: string,
  assignedTo?: string,
) {
  const [row] = await executor.insert(tripPackingItems).values({
    id: fixtureId("packing"), listId, createdBy, name: "Passport", assignedTo,
    completedAt: assignedTo ? new Date() : null, completedBy: assignedTo ?? null,
  }).returning();
  return row;
}

export async function createNotification(
  executor: DatabaseExecutor,
  tripId: string,
  recipientId: string,
  actorId: string,
  type: NotificationType = "member_joined",
) {
  const [row] = await executor.insert(notifications).values({
    id: fixtureId("notification"), tripId, recipientId, actorId, type, eventKey: fixtureId("event"),
  }).returning();
  return row;
}

export async function itineraryOrder(executor: DatabaseExecutor, tripId: string) {
  return executor.select({ id: tripItineraryItems.id, sortOrder: tripItineraryItems.sortOrder })
    .from(tripItineraryItems).where(eq(tripItineraryItems.tripId, tripId))
    .orderBy(tripItineraryItems.sortOrder);
}

export function expectContiguous(rows: readonly { sortOrder: number }[]) {
  if (!rows.every((row, index) => row.sortOrder === index)) {
    throw new Error(`Expected contiguous ordering, received ${rows.map((row) => row.sortOrder).join(", ")}`);
  }
}
