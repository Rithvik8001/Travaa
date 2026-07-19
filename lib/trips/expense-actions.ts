"use server";

import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { DatabaseTransaction } from "@/lib/db/client";
import {
  tripExpenseSettlements,
  tripExpenseSplits,
  tripExpenses,
  tripMembers,
  trips,
} from "@/lib/db/trips";
import {
  calculateBalances,
  equalShares,
  isSupportedCurrency,
  parseAmount,
  type ExpenseShare,
  type SupportedCurrency,
} from "@/lib/trips/expenses";
import { requireSession } from "@/lib/session";

export type ExpenseSplitInput =
  | { kind: "equal"; participantIds: string[] }
  | { kind: "custom"; shares: Array<{ userId: string; amount: string }> };

export interface ExpenseInput {
  description: string;
  amount: string;
  paidBy: string;
  incurredOn: string;
  note: string;
  split: ExpenseSplitInput;
}

export interface SettlementInput {
  fromUserId: string;
  toUserId: string;
  amount: string;
  paidOn: string;
  note: string;
}

class ExpenseMutationError extends Error {}
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

function revalidateExpenses(tripId: string) {
  revalidatePath(`/trips/${tripId}/expenses`);
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/dashboard");
}

async function lockTrip(tx: DatabaseTransaction, tripId: string, actorId: string) {
  await tx.execute(sql`select ${trips.id} from ${trips} where ${trips.id} = ${tripId} for update`);
  const trip = await tx.query.trips.findFirst({ where: eq(trips.id, tripId) });
  if (!trip) throw new ExpenseMutationError("Trip not found.");
  if (trip.archivedAt) throw new ExpenseMutationError("This trip is archived.");
  const member = await tx.query.tripMembers.findFirst({
    where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, actorId)), columns: { id: true },
  });
  if (!member) throw new ExpenseMutationError("You're not a member of this trip.");
  if (!isSupportedCurrency(trip.currency)) throw new ExpenseMutationError("This trip has an unsupported currency.");
  return { ...trip, currency: trip.currency as SupportedCurrency };
}

async function balancesInTrip(tx: DatabaseTransaction, tripId: string, excludeSettlementId?: string) {
  const [expenseRows, splitRows, settlementRows] = await Promise.all([
    tx.select({ id: tripExpenses.id, paidBy: tripExpenses.paidBy, amountMinor: tripExpenses.amountMinor }).from(tripExpenses).where(eq(tripExpenses.tripId, tripId)),
    tx.select({ expenseId: tripExpenseSplits.expenseId, userId: tripExpenseSplits.userId, amountMinor: tripExpenseSplits.amountMinor })
      .from(tripExpenseSplits).innerJoin(tripExpenses, eq(tripExpenses.id, tripExpenseSplits.expenseId)).where(eq(tripExpenses.tripId, tripId)),
    tx.select({ id: tripExpenseSettlements.id, fromUserId: tripExpenseSettlements.fromUserId, toUserId: tripExpenseSettlements.toUserId, amountMinor: tripExpenseSettlements.amountMinor })
      .from(tripExpenseSettlements).where(excludeSettlementId
        ? and(eq(tripExpenseSettlements.tripId, tripId), ne(tripExpenseSettlements.id, excludeSettlementId))
        : eq(tripExpenseSettlements.tripId, tripId)),
  ]);
  const byExpense = new Map<string, ExpenseShare[]>();
  for (const row of splitRows) byExpense.set(row.expenseId, [...(byExpense.get(row.expenseId) ?? []), row]);
  return calculateBalances(
    expenseRows.map((row) => ({ ...row, shares: byExpense.get(row.id) ?? [] })), settlementRows,
  );
}

async function assertFormerMembersSettled(tx: DatabaseTransaction, tripId: string) {
  const [balances, members] = await Promise.all([
    balancesInTrip(tx, tripId),
    tx.select({ userId: tripMembers.userId }).from(tripMembers).where(eq(tripMembers.tripId, tripId)),
  ]);
  const active = new Set(members.map((member) => member.userId));
  if ([...balances].some(([userId, amount]) => !active.has(userId) && amount !== 0)) {
    throw new ExpenseMutationError("This change would recreate a balance for someone who left the trip.");
  }
}

async function parseExpense(
  tx: DatabaseTransaction,
  tripId: string,
  currency: SupportedCurrency,
  input: ExpenseInput,
  allowedFormerIds: readonly string[] = [],
) {
  const description = input.description.trim();
  if (!description) throw new ExpenseMutationError("Give the expense a description.");
  if (description.length > 120) throw new ExpenseMutationError("Keep the description under 120 characters.");
  const note = input.note.trim();
  if (note.length > 500) throw new ExpenseMutationError("Keep the note under 500 characters.");
  if (!validDate(input.incurredOn)) throw new ExpenseMutationError("Choose a valid expense date.");
  const amountMinor = parseAmount(input.amount, currency);
  if (!amountMinor) throw new ExpenseMutationError("Enter a valid positive amount.");
  const memberRows = await tx.select({ userId: tripMembers.userId, joinedAt: tripMembers.joinedAt })
    .from(tripMembers).where(eq(tripMembers.tripId, tripId)).orderBy(asc(tripMembers.joinedAt), asc(tripMembers.userId));
  const active = new Set(memberRows.map((row) => row.userId));
  const formerIds = [...new Set(allowedFormerIds)].filter((id) => !active.has(id));
  const allowed = new Set([...active, ...formerIds]);
  if (!allowed.has(input.paidBy)) throw new ExpenseMutationError("Choose a current trip member as payer.");
  let shares: ExpenseShare[];
  if (input.split.kind === "equal") {
    if (new Set(input.split.participantIds).size !== input.split.participantIds.length || input.split.participantIds.some((id) => !allowed.has(id)))
      throw new ExpenseMutationError("Choose valid, unique split members.");
    const selected = new Set(input.split.participantIds);
    const ordered = [...memberRows.map((row) => row.userId).filter((id) => selected.has(id)), ...formerIds.filter((id) => selected.has(id)).sort()];
    const result = equalShares(amountMinor, ordered);
    if (!result) throw new ExpenseMutationError("The amount is too small for that equal split.");
    shares = result;
  } else {
    const ids = input.split.shares.map((share) => share.userId);
    if (ids.length === 0 || new Set(ids).size !== ids.length || ids.some((id) => !allowed.has(id)))
      throw new ExpenseMutationError("Choose valid, unique split members.");
    shares = input.split.shares.map((share) => {
      const parsed = parseAmount(share.amount, currency);
      if (!parsed) throw new ExpenseMutationError("Every custom share must be a positive amount.");
      return { userId: share.userId, amountMinor: parsed };
    });
    if (shares.reduce((sum, share) => sum + share.amountMinor, 0) !== amountMinor)
      throw new ExpenseMutationError("Custom shares must add up to the expense total.");
  }
  return { fields: { description, note: note || null, amountMinor, paidBy: input.paidBy, incurredOn: input.incurredOn }, shares };
}

async function runMutation<T>(work: () => Promise<T>): Promise<T | { error: string }> {
  try { return await work(); }
  catch (error) {
    if (error instanceof ExpenseMutationError) return { error: error.message };
    throw error;
  }
}

export async function setTripCurrency(tripId: string, currency: SupportedCurrency): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const result = await runMutation(() => db.transaction(async (tx) => {
    const trip = await lockTrip(tx, tripId, user.id);
    if (trip.ownerId !== user.id) throw new ExpenseMutationError("Only the organizer can change the currency.");
    if (!isSupportedCurrency(currency)) throw new ExpenseMutationError("Choose a supported currency.");
    const [expense, settlement] = await Promise.all([
      tx.query.tripExpenses.findFirst({ where: eq(tripExpenses.tripId, tripId), columns: { id: true } }),
      tx.query.tripExpenseSettlements.findFirst({ where: eq(tripExpenseSettlements.tripId, tripId), columns: { id: true } }),
    ]);
    if (expense || settlement) throw new ExpenseMutationError("Currency is fixed after the first financial record.");
    await tx.update(trips).set({ currency }).where(eq(trips.id, tripId));
  }));
  if (result && "error" in result) return result;
  revalidateExpenses(tripId);
}

export async function addExpense(tripId: string, input: ExpenseInput): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const result = await runMutation(() => db.transaction(async (tx) => {
    const trip = await lockTrip(tx, tripId, user.id);
    const parsed = await parseExpense(tx, tripId, trip.currency, input);
    const expenseId = randomUUID();
    await tx.insert(tripExpenses).values({ id: expenseId, tripId, createdBy: user.id, ...parsed.fields });
    await tx.insert(tripExpenseSplits).values(parsed.shares.map((share) => ({ id: randomUUID(), expenseId, ...share })));
  }));
  if (result && "error" in result) return result;
  revalidateExpenses(tripId);
}

export async function updateExpense(expenseId: string, input: ExpenseInput): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  let tripId = "";
  const result = await runMutation(() => db.transaction(async (tx) => {
    const expense = await tx.query.tripExpenses.findFirst({ where: eq(tripExpenses.id, expenseId) });
    if (!expense) throw new ExpenseMutationError("That expense no longer exists.");
    tripId = expense.tripId;
    const trip = await lockTrip(tx, tripId, user.id);
    if (expense.createdBy !== user.id && trip.ownerId !== user.id) throw new ExpenseMutationError("You can't edit this expense.");
    const oldSplits = await tx.select({ userId: tripExpenseSplits.userId }).from(tripExpenseSplits).where(eq(tripExpenseSplits.expenseId, expenseId));
    const parsed = await parseExpense(tx, tripId, trip.currency, input, [expense.paidBy, ...oldSplits.map((row) => row.userId)]);
    await tx.update(tripExpenses).set(parsed.fields).where(eq(tripExpenses.id, expenseId));
    await tx.delete(tripExpenseSplits).where(eq(tripExpenseSplits.expenseId, expenseId));
    await tx.insert(tripExpenseSplits).values(parsed.shares.map((share) => ({ id: randomUUID(), expenseId, ...share })));
    await assertFormerMembersSettled(tx, tripId);
  }));
  if (result && "error" in result) return result;
  revalidateExpenses(tripId);
}

export async function removeExpense(expenseId: string): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  let tripId = "";
  const result = await runMutation(() => db.transaction(async (tx) => {
    const expense = await tx.query.tripExpenses.findFirst({ where: eq(tripExpenses.id, expenseId) });
    if (!expense) return;
    tripId = expense.tripId;
    const trip = await lockTrip(tx, tripId, user.id);
    if (expense.createdBy !== user.id && trip.ownerId !== user.id) throw new ExpenseMutationError("You can't remove this expense.");
    await tx.delete(tripExpenses).where(eq(tripExpenses.id, expenseId));
    await assertFormerMembersSettled(tx, tripId);
  }));
  if (result && "error" in result) return result;
  if (tripId) revalidateExpenses(tripId);
}

async function parseSettlement(input: SettlementInput, currency: SupportedCurrency) {
  if (input.fromUserId === input.toUserId) throw new ExpenseMutationError("Choose two different people.");
  if (!validDate(input.paidOn)) throw new ExpenseMutationError("Choose a valid repayment date.");
  const note = input.note.trim();
  if (note.length > 500) throw new ExpenseMutationError("Keep the note under 500 characters.");
  const amountMinor = parseAmount(input.amount, currency);
  if (!amountMinor) throw new ExpenseMutationError("Enter a valid positive amount.");
  return { fromUserId: input.fromUserId, toUserId: input.toUserId, amountMinor, paidOn: input.paidOn, note: note || null };
}

async function assertSettlementMembers(tx: DatabaseTransaction, tripId: string, ids: readonly string[], allowedFormerIds: readonly string[] = []) {
  const rows = await tx.select({ userId: tripMembers.userId }).from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), inArray(tripMembers.userId, [...ids])));
  const allowed = new Set([...rows.map((row) => row.userId), ...allowedFormerIds]);
  if (ids.some((id) => !allowed.has(id))) throw new ExpenseMutationError("Repayments can only involve current trip members.");
}

async function validateSettlementBalance(tx: DatabaseTransaction, tripId: string, fields: Awaited<ReturnType<typeof parseSettlement>>, excludeId?: string) {
  const balances = await balancesInTrip(tx, tripId, excludeId);
  const debt = -(balances.get(fields.fromUserId) ?? 0);
  const credit = balances.get(fields.toUserId) ?? 0;
  if (debt <= 0 || credit <= 0) throw new ExpenseMutationError("Choose someone who owes and someone who gets money back.");
  if (fields.amountMinor > Math.min(debt, credit)) throw new ExpenseMutationError("That repayment is larger than the open balance.");
}

export async function addSettlement(tripId: string, input: SettlementInput): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const result = await runMutation(() => db.transaction(async (tx) => {
    const trip = await lockTrip(tx, tripId, user.id);
    const fields = await parseSettlement(input, trip.currency);
    await assertSettlementMembers(tx, tripId, [fields.fromUserId, fields.toUserId]);
    await validateSettlementBalance(tx, tripId, fields);
    await tx.insert(tripExpenseSettlements).values({ id: randomUUID(), tripId, createdBy: user.id, ...fields });
  }));
  if (result && "error" in result) return result;
  revalidateExpenses(tripId);
}

export async function updateSettlement(settlementId: string, input: SettlementInput): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  let tripId = "";
  const result = await runMutation(() => db.transaction(async (tx) => {
    const settlement = await tx.query.tripExpenseSettlements.findFirst({ where: eq(tripExpenseSettlements.id, settlementId) });
    if (!settlement) throw new ExpenseMutationError("That repayment no longer exists.");
    tripId = settlement.tripId;
    const trip = await lockTrip(tx, tripId, user.id);
    if (settlement.createdBy !== user.id && trip.ownerId !== user.id) throw new ExpenseMutationError("You can't edit this repayment.");
    const fields = await parseSettlement(input, trip.currency);
    await assertSettlementMembers(tx, tripId, [fields.fromUserId, fields.toUserId], [settlement.fromUserId, settlement.toUserId]);
    await validateSettlementBalance(tx, tripId, fields, settlementId);
    await tx.update(tripExpenseSettlements).set(fields).where(eq(tripExpenseSettlements.id, settlementId));
    await assertFormerMembersSettled(tx, tripId);
  }));
  if (result && "error" in result) return result;
  revalidateExpenses(tripId);
}

export async function removeSettlement(settlementId: string): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  let tripId = "";
  const result = await runMutation(() => db.transaction(async (tx) => {
    const settlement = await tx.query.tripExpenseSettlements.findFirst({ where: eq(tripExpenseSettlements.id, settlementId) });
    if (!settlement) return;
    tripId = settlement.tripId;
    const trip = await lockTrip(tx, tripId, user.id);
    if (settlement.createdBy !== user.id && trip.ownerId !== user.id) throw new ExpenseMutationError("You can't remove this repayment.");
    await tx.delete(tripExpenseSettlements).where(eq(tripExpenseSettlements.id, settlementId));
    await assertFormerMembersSettled(tx, tripId);
  }));
  if (result && "error" in result) return result;
  if (tripId) revalidateExpenses(tripId);
}
