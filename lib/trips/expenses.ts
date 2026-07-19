export const SUPPORTED_CURRENCIES = ["USD", "CAD", "EUR", "GBP", "AUD", "NZD", "JPY", "INR", "CHF"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export const MAX_AMOUNT_MINOR = 2_000_000_000;

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function currencyDigits(currency: SupportedCurrency): number {
  return currency === "JPY" ? 0 : 2;
}

export function parseAmount(value: string, currency: SupportedCurrency): number | null {
  const digits = currencyDigits(currency);
  const pattern = digits === 0 ? /^\d+$/ : new RegExp(`^\\d+(?:\\.\\d{1,${digits}})?$`);
  const input = value.trim();
  if (!pattern.test(input)) return null;
  const [whole, fraction = ""] = input.split(".");
  const amount = Number(whole) * 10 ** digits + Number(fraction.padEnd(digits, "0"));
  return Number.isSafeInteger(amount) && amount >= 1 && amount <= MAX_AMOUNT_MINOR ? amount : null;
}

export function formatAmount(amountMinor: number, currency: SupportedCurrency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currencyDigits(currency),
    maximumFractionDigits: currencyDigits(currency),
  }).format(amountMinor / 10 ** currencyDigits(currency));
}

export interface ExpenseShare {
  readonly userId: string;
  readonly amountMinor: number;
}

export function equalShares(amountMinor: number, orderedUserIds: readonly string[]): ExpenseShare[] | null {
  if (orderedUserIds.length === 0 || new Set(orderedUserIds).size !== orderedUserIds.length) return null;
  if (amountMinor < orderedUserIds.length) return null;
  const base = Math.floor(amountMinor / orderedUserIds.length);
  const remainder = amountMinor % orderedUserIds.length;
  return orderedUserIds.map((userId, index) => ({ userId, amountMinor: base + (index < remainder ? 1 : 0) }));
}

export interface BalanceExpense {
  readonly paidBy: string;
  readonly amountMinor: number;
  readonly shares: readonly ExpenseShare[];
}

export interface BalanceSettlement {
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly amountMinor: number;
}

export function calculateBalances(expenses: readonly BalanceExpense[], settlements: readonly BalanceSettlement[]) {
  const balances = new Map<string, number>();
  const add = (userId: string, amount: number) => balances.set(userId, (balances.get(userId) ?? 0) + amount);
  for (const expense of expenses) {
    add(expense.paidBy, expense.amountMinor);
    for (const share of expense.shares) add(share.userId, -share.amountMinor);
  }
  for (const settlement of settlements) {
    add(settlement.fromUserId, settlement.amountMinor);
    add(settlement.toUserId, -settlement.amountMinor);
  }
  return balances;
}

export interface RepaymentSuggestion {
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly amountMinor: number;
}

export function simplifyRepayments(balances: ReadonlyMap<string, number>): RepaymentSuggestion[] {
  const debtors = [...balances].filter(([, amount]) => amount < 0).map(([id, amount]) => ({ id, amount: -amount }));
  const creditors = [...balances].filter(([, amount]) => amount > 0).map(([id, amount]) => ({ id, amount }));
  const sort = (a: { id: string; amount: number }, b: { id: string; amount: number }) => b.amount - a.amount || a.id.localeCompare(b.id);
  const suggestions: RepaymentSuggestion[] = [];
  while (debtors.length && creditors.length) {
    debtors.sort(sort);
    creditors.sort(sort);
    const debtor = debtors[0]!;
    const creditor = creditors[0]!;
    const amountMinor = Math.min(debtor.amount, creditor.amount);
    suggestions.push({ fromUserId: debtor.id, toUserId: creditor.id, amountMinor });
    debtor.amount -= amountMinor;
    creditor.amount -= amountMinor;
    if (debtor.amount === 0) debtors.shift();
    if (creditor.amount === 0) creditors.shift();
  }
  return suggestions;
}
