import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import {
  notifications,
  tripExpenseSettlements,
  tripExpenseSplits,
  tripExpenses,
  tripMembers,
  tripPackingItems,
  tripPackingLists,
  trips,
} from "@/lib/db/trips";
import { calculateBalances, formatAmount, isSupportedCurrency } from "@/lib/trips/expenses";

async function cleanupMember(tx: Parameters<Parameters<Database["transaction"]>[0]>[0], tripId: string, userId: string) {
  const memberLists = tx
    .select({ id: tripPackingLists.id })
    .from(tripPackingLists)
    .where(eq(tripPackingLists.tripId, tripId));
  await tx.update(tripPackingItems).set({ assignedTo: null }).where(
    and(eq(tripPackingItems.assignedTo, userId), inArray(tripPackingItems.listId, memberLists)),
  );
  await tx.update(tripPackingItems).set({ completedBy: null }).where(
    and(eq(tripPackingItems.completedBy, userId), inArray(tripPackingItems.listId, memberLists)),
  );
  await tx.delete(tripPackingLists).where(
    and(
      eq(tripPackingLists.tripId, tripId),
      eq(tripPackingLists.createdBy, userId),
      eq(tripPackingLists.visibility, "private"),
    ),
  );
  await tx.delete(tripMembers).where(
    and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)),
  );
  await tx.delete(notifications).where(
    and(eq(notifications.tripId, tripId), eq(notifications.recipientId, userId)),
  );
}

async function balanceFor(tx: Parameters<Parameters<Database["transaction"]>[0]>[0], tripId: string, userId: string) {
  const [expenses, splits, settlements] = await Promise.all([
    tx.select({ id: tripExpenses.id, paidBy: tripExpenses.paidBy, amountMinor: tripExpenses.amountMinor }).from(tripExpenses).where(eq(tripExpenses.tripId, tripId)),
    tx.select({ expenseId: tripExpenseSplits.expenseId, userId: tripExpenseSplits.userId, amountMinor: tripExpenseSplits.amountMinor })
      .from(tripExpenseSplits).innerJoin(tripExpenses, eq(tripExpenses.id, tripExpenseSplits.expenseId)).where(eq(tripExpenses.tripId, tripId)),
    tx.select({ fromUserId: tripExpenseSettlements.fromUserId, toUserId: tripExpenseSettlements.toUserId, amountMinor: tripExpenseSettlements.amountMinor })
      .from(tripExpenseSettlements).where(eq(tripExpenseSettlements.tripId, tripId)),
  ]);
  const byExpense = new Map<string, Array<{ userId: string; amountMinor: number }>>();
  for (const split of splits) byExpense.set(split.expenseId, [...(byExpense.get(split.expenseId) ?? []), split]);
  return calculateBalances(expenses.map((expense) => ({ ...expense, shares: byExpense.get(expense.id) ?? [] })), settlements).get(userId) ?? 0;
}

export async function removeMemberAs(database: Database, actorId: string, tripId: string, targetId: string) {
  return database.transaction(async (tx) => {
    await tx.execute(sql`select ${trips.id} from ${trips} where ${trips.id} = ${tripId} for update`);
    const trip = await tx.query.trips.findFirst({ where: eq(trips.id, tripId) });
    if (!trip || trip.ownerId !== actorId) return { error: "Only the organizer can remove members." } as const;
    if (trip.archivedAt) return { error: "This trip is archived." } as const;
    if (targetId === trip.ownerId) return { error: "The organizer can't be removed." } as const;
    const balance = await balanceFor(tx, tripId, targetId);
    if (balance !== 0 && isSupportedCurrency(trip.currency))
      return { error: `This member ${balance < 0 ? "still owes" : "is still owed"} ${formatAmount(Math.abs(balance), trip.currency)}. Record repayments first.` } as const;
    await cleanupMember(tx, tripId, targetId);
    return { ok: true } as const;
  });
}

export async function leaveTripAs(database: Database, actorId: string, tripId: string) {
  return database.transaction(async (tx) => {
    await tx.execute(sql`select ${trips.id} from ${trips} where ${trips.id} = ${tripId} for update`);
    const trip = await tx.query.trips.findFirst({ where: eq(trips.id, tripId) });
    if (!trip) return { error: "Trip not found." } as const;
    if (trip.archivedAt) return { error: "This trip is archived." } as const;
    if (trip.ownerId === actorId) return { error: "The organizer can't leave their trip." } as const;
    const member = await tx.query.tripMembers.findFirst({
      where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, actorId)), columns: { id: true },
    });
    if (!member) return { error: "You're not a member of this trip." } as const;
    const balance = await balanceFor(tx, tripId, actorId);
    if (balance !== 0 && isSupportedCurrency(trip.currency))
      return { error: `You ${balance < 0 ? "still owe" : "are still owed"} ${formatAmount(Math.abs(balance), trip.currency)}. Record repayments before leaving.` } as const;
    await cleanupMember(tx, tripId, actorId);
    return { ok: true } as const;
  });
}
