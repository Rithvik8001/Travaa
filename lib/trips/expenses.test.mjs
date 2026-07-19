import { describe, expect, test } from "bun:test";
import { calculateBalances, equalShares, formatAmount, parseAmount, simplifyRepayments, SUPPORTED_CURRENCIES } from "./expenses.ts";

describe("expense amounts", () => {
  test("parses supported precision", () => {
    expect(parseAmount("12.34", "USD")).toBe(1234);
    expect(parseAmount("12", "JPY")).toBe(12);
    expect(parseAmount("12.3", "JPY")).toBeNull();
    expect(parseAmount("-1", "USD")).toBeNull();
    expect(parseAmount("1e2", "USD")).toBeNull();
    expect(formatAmount(1234, "USD")).toBe("$12.34");
    for (const currency of SUPPORTED_CURRENCIES) {
      expect(parseAmount(currency === "JPY" ? "1" : "1.00", currency)).toBe(currency === "JPY" ? 1 : 100);
    }
  });
});

describe("expense accounting", () => {
  test("splits remainder deterministically", () => {
    expect(equalShares(100, ["a", "b", "c"])).toEqual([
      { userId: "a", amountMinor: 34 }, { userId: "b", amountMinor: 33 }, { userId: "c", amountMinor: 33 },
    ]);
    expect(equalShares(2, ["a", "b", "c"])).toBeNull();
  });

  test("balances expenses and partial repayments", () => {
    const balances = calculateBalances(
      [{ paidBy: "a", amountMinor: 100, shares: [{ userId: "a", amountMinor: 50 }, { userId: "b", amountMinor: 50 }] }],
      [{ fromUserId: "b", toUserId: "a", amountMinor: 20 }],
    );
    expect(balances.get("a")).toBe(30);
    expect(balances.get("b")).toBe(-30);
    expect([...balances.values()].reduce((sum, value) => sum + value, 0)).toBe(0);
    expect(simplifyRepayments(balances)).toEqual([{ fromUserId: "b", toUserId: "a", amountMinor: 30 }]);
  });
});
