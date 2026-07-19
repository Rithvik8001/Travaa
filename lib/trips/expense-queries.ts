import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { tripExpenseSettlements, tripExpenseSplits, tripExpenses, tripMembers, trips } from "@/lib/db/trips";
import { calculateBalances, currencyDigits, formatAmount, isSupportedCurrency, simplifyRepayments, type SupportedCurrency } from "@/lib/trips/expenses";

export interface ExpensePersonView {
  id: string;
  name: string;
  active: boolean;
  joinedAt: string | null;
}

export interface ExpenseView {
  id: string;
  description: string;
  amountMinor: number;
  amountInput: string;
  amountLabel: string;
  paidBy: string;
  paidByName: string;
  incurredOn: string;
  note: string | null;
  createdBy: string | null;
  canManage: boolean;
  splitKind: "equal" | "custom";
  shares: Array<{ userId: string; name: string; amountMinor: number; amountInput: string; amountLabel: string }>;
}

export interface SettlementView {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amountMinor: number;
  amountInput: string;
  amountLabel: string;
  paidOn: string;
  note: string | null;
  canManage: boolean;
}

export interface ExpenseWorkspaceView {
  currency: SupportedCurrency;
  currencyLocked: boolean;
  readOnly: boolean;
  isOrganizer: boolean;
  people: ExpensePersonView[];
  expenses: ExpenseView[];
  settlements: SettlementView[];
  balances: Array<{ userId: string; name: string; amountMinor: number; amountLabel: string }>;
  suggestions: Array<{ fromUserId: string; fromName: string; toUserId: string; toName: string; amountMinor: number; amountInput: string; amountLabel: string }>;
  totalMinor: number;
  totalLabel: string;
  openBalanceCount: number;
}

function amountInput(amountMinor: number, currency: SupportedCurrency) {
  const digits = currencyDigits(currency);
  return digits === 0 ? String(amountMinor) : `${Math.floor(amountMinor / 100)}.${String(amountMinor % 100).padStart(2, "0")}`;
}

export async function getExpenseWorkspace(tripId: string, userId: string): Promise<ExpenseWorkspaceView | null> {
  const [trip] = await db.select().from(trips).innerJoin(
    tripMembers, and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, userId)),
  ).where(eq(trips.id, tripId)).limit(1);
  if (!trip || !isSupportedCurrency(trip.trips.currency)) return null;
  const currency = trip.trips.currency;
  const [memberRows, expenseRows, splitRows, settlementRows] = await Promise.all([
    db.select({ id: user.id, name: user.name, joinedAt: tripMembers.joinedAt }).from(tripMembers)
      .innerJoin(user, eq(user.id, tripMembers.userId)).where(eq(tripMembers.tripId, tripId))
      .orderBy(asc(tripMembers.joinedAt), asc(user.id)),
    db.select().from(tripExpenses).where(eq(tripExpenses.tripId, tripId))
      .orderBy(desc(tripExpenses.incurredOn), desc(tripExpenses.createdAt), desc(tripExpenses.id)),
    db.select({ expenseId: tripExpenseSplits.expenseId, userId: tripExpenseSplits.userId, amountMinor: tripExpenseSplits.amountMinor })
      .from(tripExpenseSplits).innerJoin(tripExpenses, eq(tripExpenses.id, tripExpenseSplits.expenseId))
      .where(eq(tripExpenses.tripId, tripId)),
    db.select().from(tripExpenseSettlements).where(eq(tripExpenseSettlements.tripId, tripId))
      .orderBy(desc(tripExpenseSettlements.paidOn), desc(tripExpenseSettlements.createdAt), desc(tripExpenseSettlements.id)),
  ]);
  const referenced = new Set<string>();
  for (const expense of expenseRows) referenced.add(expense.paidBy);
  for (const split of splitRows) referenced.add(split.userId);
  for (const settlement of settlementRows) { referenced.add(settlement.fromUserId); referenced.add(settlement.toUserId); }
  for (const member of memberRows) referenced.add(member.id);
  const peopleRows = referenced.size
    ? await db.select({ id: user.id, name: user.name }).from(user).where(inArray(user.id, [...referenced]))
    : [];
  const names = new Map(peopleRows.map((person) => [person.id, person.name]));
  const active = new Map(memberRows.map((member) => [member.id, member]));
  const people = [...referenced].map((id) => ({
    id, name: names.get(id) ?? "Deleted member", active: active.has(id), joinedAt: active.get(id)?.joinedAt.toISOString() ?? null,
  })).sort((a, b) => Number(b.active) - Number(a.active) || (a.joinedAt ?? "").localeCompare(b.joinedAt ?? "") || a.id.localeCompare(b.id));
  const splitMap = new Map<string, typeof splitRows>();
  for (const split of splitRows) splitMap.set(split.expenseId, [...(splitMap.get(split.expenseId) ?? []), split]);
  const expenseInputs = expenseRows.map((expense) => ({ ...expense, shares: splitMap.get(expense.id) ?? [] }));
  const balanceMap = calculateBalances(expenseInputs, settlementRows);
  const balances = people.map((person) => ({
    userId: person.id, name: person.name, amountMinor: balanceMap.get(person.id) ?? 0,
    amountLabel: formatAmount(Math.abs(balanceMap.get(person.id) ?? 0), currency),
  }));
  const suggestions = simplifyRepayments(balanceMap).map((suggestion) => ({
    ...suggestion,
    fromName: names.get(suggestion.fromUserId) ?? "Deleted member",
    toName: names.get(suggestion.toUserId) ?? "Deleted member",
    amountInput: amountInput(suggestion.amountMinor, currency),
    amountLabel: formatAmount(suggestion.amountMinor, currency),
  }));
  const ownerId = trip.trips.ownerId;
  return {
    currency,
    currencyLocked: expenseRows.length > 0 || settlementRows.length > 0,
    readOnly: Boolean(trip.trips.archivedAt),
    isOrganizer: ownerId === userId,
    people,
    expenses: expenseRows.map((expense) => ({
      id: expense.id, description: expense.description, amountMinor: expense.amountMinor,
      amountInput: amountInput(expense.amountMinor, currency), amountLabel: formatAmount(expense.amountMinor, currency),
      paidBy: expense.paidBy, paidByName: names.get(expense.paidBy) ?? "Deleted member", incurredOn: expense.incurredOn,
      note: expense.note, createdBy: expense.createdBy, canManage: expense.createdBy === userId || ownerId === userId,
      splitKind: (() => {
        const amounts = (splitMap.get(expense.id) ?? []).map((share) => share.amountMinor);
        return amounts.length > 0 && Math.max(...amounts) - Math.min(...amounts) <= 1 ? "equal" as const : "custom" as const;
      })(),
      shares: (splitMap.get(expense.id) ?? []).map((share) => ({
        ...share, name: names.get(share.userId) ?? "Deleted member", amountInput: amountInput(share.amountMinor, currency), amountLabel: formatAmount(share.amountMinor, currency),
      })),
    })),
    settlements: settlementRows.map((settlement) => ({
      id: settlement.id, fromUserId: settlement.fromUserId, fromName: names.get(settlement.fromUserId) ?? "Deleted member",
      toUserId: settlement.toUserId, toName: names.get(settlement.toUserId) ?? "Deleted member", amountMinor: settlement.amountMinor,
      amountInput: amountInput(settlement.amountMinor, currency), amountLabel: formatAmount(settlement.amountMinor, currency),
      paidOn: settlement.paidOn, note: settlement.note, canManage: settlement.createdBy === userId || ownerId === userId,
    })),
    balances,
    suggestions,
    totalMinor: expenseRows.reduce((sum, expense) => sum + expense.amountMinor, 0),
    totalLabel: formatAmount(expenseRows.reduce((sum, expense) => sum + expense.amountMinor, 0), currency),
    openBalanceCount: balances.filter((balance) => balance.amountMinor !== 0).length,
  };
}
