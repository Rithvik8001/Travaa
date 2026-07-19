import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ExpensesWorkspace } from "@/components/trips/expenses-workspace";
import { getExpenseWorkspace } from "@/lib/trips/expense-queries";
import { getTripForUser } from "@/lib/trips/queries";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Expenses" };

export default async function ExpensesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { user } = await requireSession();
  const [trip, workspace] = await Promise.all([getTripForUser(tripId, user.id), getExpenseWorkspace(tripId, user.id)]);
  if (!trip || !workspace) notFound();
  return <div className="min-h-full">
    <div className="border-hairline bg-background/85 sticky top-14 z-20 border-b backdrop-blur-md min-[900px]:top-0"><div className="mx-auto flex h-14 w-full max-w-[920px] items-center justify-between px-6 min-[900px]:px-10"><Link href={`/trips/${tripId}`} className="text-muted-foreground hover:text-ink group flex items-center gap-1.5 text-[14px]"><span aria-hidden className="text-[17px]">‹</span>{trip.name}</Link>{workspace.readOnly ? <Badge tone="outline" size="sm">Archived · read only</Badge> : null}</div></div>
    <main className="mx-auto w-full max-w-[920px] px-6 py-10 min-[900px]:px-10"><div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><Eyebrow className="mb-3">Expenses</Eyebrow><h1 className="text-ink text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">Spend together, settle simply.</h1><p className="text-muted-foreground mt-2 max-w-[54ch] text-[14px] leading-[1.55]">Record the shared costs and let the ledger work out who owes what.</p></div><p className="text-subtle-foreground font-mono text-[12px]">{workspace.totalLabel} total</p></div><ExpensesWorkspace tripId={tripId} workspace={workspace} /></main>
  </div>;
}
