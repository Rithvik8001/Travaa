import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { ExpenseWorkspaceView } from "@/lib/trips/expense-queries";

export function ExpensesEntryCard({ tripId, workspace }: { tripId: string; workspace: ExpenseWorkspaceView }) {
  return <section aria-labelledby="expenses-entry-title"><Card className="p-5 min-[560px]:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><Eyebrow className="mb-2">Expenses</Eyebrow><h2 id="expenses-entry-title" className="text-ink text-[19px] font-semibold">Keep the tab clear</h2><p className="text-muted-foreground mt-1 text-[13.5px]">Shared costs, clean balances, fewer awkward calculations.</p>{workspace.expenses.length ? <p className="text-subtle-foreground mt-2 font-mono text-[12px]">{workspace.totalLabel} spent · {workspace.openBalanceCount} open {workspace.openBalanceCount === 1 ? "balance" : "balances"}</p> : null}</div><Link href={`/trips/${tripId}/expenses`} className="text-ink hover:bg-surface-2 rounded-[6px] px-3 py-1.5 text-[13.5px] font-medium">Open expenses →</Link></div></Card></section>;
}
