"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GridFrame } from "@/components/ui/grid-cell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addExpense, addSettlement, removeExpense, removeSettlement, setTripCurrency, updateExpense, updateSettlement, type ExpenseInput, type SettlementInput } from "@/lib/trips/expense-actions";
import type { ExpenseView, ExpenseWorkspaceView, SettlementView } from "@/lib/trips/expense-queries";
import { equalShares, formatAmount, parseAmount, SUPPORTED_CURRENCIES } from "@/lib/trips/expenses";

const selectClass = "border-border bg-surface text-foreground focus:border-border-strong focus:ring-ring/60 h-[42px] w-full rounded-[6px] border px-3 text-[14px] outline-none focus:ring-2 disabled:opacity-55";
const labelClass = "text-muted-foreground mb-[6px] block font-mono text-[11px] font-medium tracking-[0.08em] uppercase";
const today = () => new Date().toISOString().slice(0, 10);

export function ExpensesWorkspace({ tripId, workspace }: { tripId: string; workspace: ExpenseWorkspaceView }) {
  const [editingExpense, setEditingExpense] = useState<ExpenseView | null>(null);
  const [editingSettlement, setEditingSettlement] = useState<SettlementView | null>(null);
  const [settlementSeed, setSettlementSeed] = useState<Partial<SettlementInput> | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const activePeople = workspace.people.filter((person) => person.active);

  function run(action: () => Promise<{ error: string } | void>, success?: () => void) {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (result?.error) { setError(result.error); return; }
      success?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="balances-title">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div><h2 id="balances-title" className="text-ink text-[19px] font-semibold">Balances</h2><p className="text-subtle-foreground text-[13.5px]">What the shared ledger says right now.</p></div>
          {workspace.isOrganizer ? (
            <select aria-label="Trip currency" value={workspace.currency} disabled={workspace.currencyLocked || workspace.readOnly || pending}
              onChange={(event) => run(() => setTripCurrency(tripId, event.target.value as typeof workspace.currency))}
              className={`${selectClass} w-auto font-mono text-[12px]`}>
              {SUPPORTED_CURRENCIES.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          ) : <span className="text-subtle-foreground font-mono text-[12px]">{workspace.currency}</span>}
        </div>
        <GridFrame className="grid min-[560px]:grid-cols-2">
          {workspace.balances.map((balance) => (
            <div key={balance.userId} className="grid-cell flex items-center justify-between gap-4 px-5 py-4">
              <span className="text-foreground text-[14px]">{balance.name}</span>
              <span className="text-ink font-mono text-[12px] tabular-nums">
                {balance.amountMinor > 0 ? `gets back ${balance.amountLabel}` : balance.amountMinor < 0 ? `owes ${balance.amountLabel}` : "settled"}
              </span>
            </div>
          ))}
          {workspace.balances.length === 0 ? <div className="grid-cell text-subtle-foreground px-5 py-5 text-[13.5px]">No balances yet.</div> : null}
        </GridFrame>
      </section>

      <section aria-labelledby="repay-title">
        <h2 id="repay-title" className="text-ink text-[19px] font-semibold">Simplified repayments</h2>
        <p className="text-subtle-foreground mb-3 text-[13.5px]">A short path back to even.</p>
        <GridFrame>
          {workspace.suggestions.map((suggestion) => (
            <div key={`${suggestion.fromUserId}-${suggestion.toUserId}`} className="grid-cell flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <p className="text-foreground text-[14px]"><strong>{suggestion.fromName}</strong> pays <strong>{suggestion.toName}</strong> <span className="font-mono">{suggestion.amountLabel}</span></p>
              {!workspace.readOnly && workspace.people.find((p) => p.id === suggestion.fromUserId)?.active && workspace.people.find((p) => p.id === suggestion.toUserId)?.active ? (
                <button type="button" onClick={() => setSettlementSeed({ fromUserId: suggestion.fromUserId, toUserId: suggestion.toUserId, amount: suggestion.amountInput })} className="text-muted-foreground hover:text-ink text-[12.5px]">Record payment</button>
              ) : null}
            </div>
          ))}
          {workspace.suggestions.length === 0 ? <div className="grid-cell text-subtle-foreground px-5 py-5 text-[13.5px]">Everyone is settled.</div> : null}
        </GridFrame>
        {!workspace.readOnly && (settlementSeed || editingSettlement) ? (
          <SettlementForm people={activePeople} initial={editingSettlement} seed={settlementSeed} pending={pending} error={error}
            onCancel={() => { setSettlementSeed(null); setEditingSettlement(null); setError(""); }}
            onSubmit={(input) => run(() => editingSettlement ? updateSettlement(editingSettlement.id, input) : addSettlement(tripId, input), () => { setSettlementSeed(null); setEditingSettlement(null); })} />
        ) : !workspace.readOnly && activePeople.length > 1 ? <Button className="mt-3" variant="outline" size="sm" onClick={() => setSettlementSeed({})}>Record repayment</Button> : null}
      </section>

      <section aria-labelledby="expenses-title">
        <div className="mb-3"><h2 id="expenses-title" className="text-ink text-[19px] font-semibold">Expenses</h2><p className="text-subtle-foreground text-[13.5px]">{workspace.totalLabel} recorded across {workspace.expenses.length} {workspace.expenses.length === 1 ? "expense" : "expenses"}.</p></div>
        <GridFrame>
          {workspace.expenses.map((expense) => editingExpense?.id === expense.id ? (
            <div key={expense.id} className="grid-cell p-5"><ExpenseForm currency={workspace.currency} people={workspace.people} initial={expense} pending={pending} error={error} onCancel={() => { setEditingExpense(null); setError(""); }} onSubmit={(input) => run(() => updateExpense(expense.id, input), () => setEditingExpense(null))} /></div>
          ) : (
            <ExpenseRow key={expense.id} expense={expense} readOnly={workspace.readOnly} pending={pending} onEdit={() => setEditingExpense(expense)} onRemove={() => run(() => removeExpense(expense.id))} />
          ))}
          {workspace.expenses.length === 0 ? <div className="grid-cell text-subtle-foreground px-5 py-5 text-[13.5px]">No expenses yet. The first coffee run counts.</div> : null}
        </GridFrame>
        {!workspace.readOnly && !editingExpense ? <div className="mt-4 rounded-[8px] border border-border bg-surface p-5"><ExpenseForm key={workspace.expenses.length} currency={workspace.currency} people={activePeople} pending={pending} error={error} onSubmit={(input) => run(() => addExpense(tripId, input))} /></div> : null}
      </section>

      {workspace.settlements.length > 0 ? (
        <section aria-labelledby="history-title"><h2 id="history-title" className="text-ink mb-3 text-[19px] font-semibold">Repayment history</h2><GridFrame>
          {workspace.settlements.map((item) => <SettlementRow key={item.id} item={item} readOnly={workspace.readOnly} pending={pending} onEdit={() => { setEditingSettlement(item); setSettlementSeed({}); }} onRemove={() => run(() => removeSettlement(item.id))} />)}
        </GridFrame></section>
      ) : null}
      {error && !editingExpense && !editingSettlement && !settlementSeed ? <p role="alert" className="text-danger text-[13px]">{error}</p> : null}
    </div>
  );
}

function ExpenseForm({ currency, people, initial, pending, error, onCancel, onSubmit }: { currency: ExpenseWorkspaceView["currency"]; people: ExpenseWorkspaceView["people"]; initial?: ExpenseView; pending: boolean; error: string; onCancel?: () => void; onSubmit: (input: ExpenseInput) => void }) {
  const initialIds = initial?.shares.map((share) => share.userId) ?? people.filter((person) => person.active).map((person) => person.id);
  const [kind, setKind] = useState<"equal" | "custom">(initial?.splitKind ?? "equal");
  const [selected, setSelected] = useState(() => new Set(initialIds));
  const initialAmounts = useMemo(() => new Map(initial?.shares.map((share) => [share.userId, share.amountInput]) ?? []), [initial]);
  const [amount, setAmount] = useState(initial?.amountInput ?? "");
  const [customAmounts, setCustomAmounts] = useState(() => new Map(initialAmounts));
  const parsedTotal = parseAmount(amount, currency);
  const customAllocated = [...selected].reduce((sum, id) => sum + (parseAmount(customAmounts.get(id) ?? "", currency) ?? 0), 0);
  const equalPreview = parsedTotal ? equalShares(parsedTotal, people.filter((person) => selected.has(person.id)).map((person) => person.id)) : null;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const ids = [...selected];
    onSubmit({ description: String(data.get("description") ?? ""), amount: String(data.get("amount") ?? ""), paidBy: String(data.get("paidBy") ?? ""), incurredOn: String(data.get("incurredOn") ?? ""), note: String(data.get("note") ?? ""), split: kind === "equal" ? { kind, participantIds: ids } : { kind, shares: ids.map((userId) => ({ userId, amount: String(data.get(`share-${userId}`) ?? "") })) } });
  }
  return <form onSubmit={submit} className="grid gap-3 min-[560px]:grid-cols-2">
    <label className="min-[560px]:col-span-2"><span className={labelClass}>Description</span><Input name="description" defaultValue={initial?.description} maxLength={120} required disabled={pending} placeholder="Dinner, hotel, train tickets…" /></label>
    <label><span className={labelClass}>Amount</span><Input name="amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} required disabled={pending} placeholder="0.00" /></label>
    <label><span className={labelClass}>Paid by</span><select name="paidBy" defaultValue={initial?.paidBy ?? people.find((p) => p.active)?.id} className={selectClass} disabled={pending}>{people.map((person) => <option key={person.id} value={person.id}>{person.name}{person.active ? "" : " · left"}</option>)}</select></label>
    <label><span className={labelClass}>Date</span><Input name="incurredOn" type="date" defaultValue={initial?.incurredOn ?? today()} required disabled={pending} /></label>
    <label><span className={labelClass}>Note (optional)</span><Input name="note" defaultValue={initial?.note ?? ""} maxLength={500} disabled={pending} /></label>
    <div className="min-[560px]:col-span-2"><span className={labelClass}>Split</span><div className="mb-3 flex gap-2"><Button type="button" size="sm" variant={kind === "equal" ? "outline" : "quiet"} onClick={() => setKind("equal")}>Equally</Button><Button type="button" size="sm" variant={kind === "custom" ? "outline" : "quiet"} onClick={() => setKind("custom")}>Custom amounts</Button></div>
      <div className="grid gap-2 min-[560px]:grid-cols-2">{people.map((person) => <label key={person.id} className="border-border flex items-center gap-2 rounded-[6px] border px-3 py-2 text-[13.5px]"><input type="checkbox" checked={selected.has(person.id)} disabled={pending || (!person.active && !initialIds.includes(person.id))} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(person.id)) next.delete(person.id); else next.add(person.id); return next; })} /><span className="min-w-0 flex-1 truncate">{person.name}{person.active ? "" : " · left"}</span>{kind === "custom" && selected.has(person.id) ? <Input name={`share-${person.id}`} value={customAmounts.get(person.id) ?? ""} onChange={(event) => setCustomAmounts((current) => new Map(current).set(person.id, event.target.value))} inputMode="decimal" required className="w-24 py-1.5" /> : null}</label>)}</div>
      {kind === "equal" && equalPreview ? <p className="text-subtle-foreground mt-2 font-mono text-[11px]">{equalPreview.map((share) => `${people.find((person) => person.id === share.userId)?.name}: ${formatAmount(share.amountMinor, currency)}`).join(" · ")}</p> : null}
      {kind === "custom" && parsedTotal ? <p className={`mt-2 font-mono text-[11px] ${customAllocated === parsedTotal ? "text-subtle-foreground" : "text-danger"}`}>{customAllocated === parsedTotal ? "Fully allocated" : `${formatAmount(Math.abs(parsedTotal - customAllocated), currency)} ${customAllocated < parsedTotal ? "remaining" : "over"}`}</p> : null}
    </div>
    <div className="flex items-center gap-2 min-[560px]:col-span-2"><Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : initial ? "Save expense" : "Add expense"}</Button>{onCancel ? <Button type="button" size="sm" variant="quiet" onClick={onCancel}>Cancel</Button> : null}{error ? <p role="alert" className="text-danger text-[12.5px]">{error}</p> : null}</div>
  </form>;
}

function ExpenseRow({ expense, readOnly, pending, onEdit, onRemove }: { expense: ExpenseView; readOnly: boolean; pending: boolean; onEdit: () => void; onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false);
  return <div className="grid-cell px-5 py-4"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-baseline gap-2"><strong className="text-ink text-[15px]">{expense.description}</strong><span className="font-mono text-[13px]">{expense.amountLabel}</span></div><p className="text-subtle-foreground mt-1 text-[12.5px]">Paid by {expense.paidByName} · {expense.incurredOn}</p>{expense.note ? <p className="text-muted-foreground mt-1 text-[13.5px]">{expense.note}</p> : null}<p className="text-subtle-foreground mt-1 font-mono text-[11px]">{expense.shares.map((share) => `${share.name} ${share.amountLabel}`).join(" · ")}</p></div>{expense.canManage && !readOnly ? <div className="flex gap-3 text-[12.5px]"><button onClick={onEdit} disabled={pending} className="text-muted-foreground hover:text-ink">Edit</button>{confirming ? <><button onClick={onRemove} className="text-danger">Remove</button><button onClick={() => setConfirming(false)} className="text-muted-foreground">Cancel</button></> : <button onClick={() => setConfirming(true)} className="text-subtle-foreground hover:text-danger">Remove</button>}</div> : null}</div></div>;
}

function SettlementForm({ people, initial, seed, pending, error, onCancel, onSubmit }: { people: ExpenseWorkspaceView["people"]; initial: SettlementView | null; seed: Partial<SettlementInput> | null; pending: boolean; error: string; onCancel: () => void; onSubmit: (input: SettlementInput) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ fromUserId: String(data.get("from") ?? ""), toUserId: String(data.get("to") ?? ""), amount: String(data.get("amount") ?? ""), paidOn: String(data.get("date") ?? ""), note: String(data.get("note") ?? "") }); }
  return <form onSubmit={submit} className="border-border bg-surface mt-4 grid gap-3 rounded-[8px] border p-5 min-[560px]:grid-cols-2"><label><span className={labelClass}>From</span><select name="from" defaultValue={initial?.fromUserId ?? seed?.fromUserId} className={selectClass}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label><span className={labelClass}>To</span><select name="to" defaultValue={initial?.toUserId ?? seed?.toUserId} className={selectClass}>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label><span className={labelClass}>Amount</span><Input name="amount" inputMode="decimal" defaultValue={initial?.amountInput ?? seed?.amount} required /></label><label><span className={labelClass}>Date</span><Input name="date" type="date" defaultValue={initial?.paidOn ?? today()} required /></label><label className="min-[560px]:col-span-2"><span className={labelClass}>Note (optional)</span><Textarea name="note" defaultValue={initial?.note ?? ""} maxLength={500} /></label><div className="flex items-center gap-2 min-[560px]:col-span-2"><Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Save repayment"}</Button><Button type="button" variant="quiet" size="sm" onClick={onCancel}>Cancel</Button>{error ? <p role="alert" className="text-danger text-[12.5px]">{error}</p> : null}</div></form>;
}

function SettlementRow({ item, readOnly, pending, onEdit, onRemove }: { item: SettlementView; readOnly: boolean; pending: boolean; onEdit: () => void; onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false);
  return <div className="grid-cell flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="text-foreground text-[14px]"><strong>{item.fromName}</strong> paid <strong>{item.toName}</strong> <span className="font-mono">{item.amountLabel}</span></p><p className="text-subtle-foreground mt-1 text-[12px]">{item.paidOn}{item.note ? ` · ${item.note}` : ""}</p></div>{item.canManage && !readOnly ? <div className="flex gap-3 text-[12.5px]"><button disabled={pending} onClick={onEdit} className="text-muted-foreground">Edit</button>{confirming ? <><button onClick={onRemove} className="text-danger">Remove</button><button onClick={() => setConfirming(false)} className="text-muted-foreground">Cancel</button></> : <button onClick={() => setConfirming(true)} className="text-subtle-foreground hover:text-danger">Remove</button>}</div> : null}</div>;
}
