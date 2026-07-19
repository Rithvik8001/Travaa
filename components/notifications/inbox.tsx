import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridFrame } from "@/components/ui/grid-cell";
import {
  markAllNotificationsRead,
  markNotificationRead,
  openNotification,
} from "@/lib/notifications/actions";
import type { InboxView } from "@/lib/notifications/format";
import { timeAgo } from "@/lib/trips/format";
import { cn } from "@/lib/utils";

export function NotificationInbox({ inbox }: { readonly inbox: InboxView }) {
  const total = inbox.actionCount + inbox.unreadCount;
  return (
    <main className="mx-auto w-full max-w-[920px] px-6 py-10 min-[900px]:px-10 min-[900px]:py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Inbox</Eyebrow>
          <h1 className="text-ink mt-3 text-[32px] leading-[1.05] font-semibold tracking-[-0.03em]">What needs you</h1>
          <p className="text-muted-foreground mt-2 text-[14px]">
            {total === 0
              ? "Nothing waiting on you."
              : `${total} ${total === 1 ? "thing" : "things"} to look at`}
          </p>
        </div>
        {inbox.unreadCount > 0 ? (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="outline" size="sm">Mark all read</Button>
          </form>
        ) : null}
      </div>

      <section aria-labelledby="inbox-actions">
        <div className="mb-4">
          <h2 id="inbox-actions" className="text-ink text-[19px] font-semibold tracking-[-0.02em]">Actions</h2>
          <p className="text-subtle-foreground mt-0.5 text-[13.5px]">Live work that disappears when it is done.</p>
        </div>
        {inbox.actions.length === 0 ? (
          <div className="border-border rounded-[8px] border px-6 py-10 text-center">
            <p className="text-ink text-[15px] font-semibold">You&apos;re all caught up.</p>
            <p className="text-subtle-foreground mt-1 text-[13.5px]">No votes or packing assignments need you right now.</p>
          </div>
        ) : (
          <GridFrame>
            {inbox.actions.map((action) => (
              <Link key={action.id} href={action.href} className="grid-cell hover:bg-surface-2 group flex items-center justify-between gap-4 px-5 py-4 transition-colors">
                <span className="min-w-0">
                  <span className="text-ink block text-[14.5px] font-semibold">
                    {action.kind === "date_response"
                      ? `Respond to ${action.count} date ${action.count === 1 ? "window" : "windows"}`
                      : `${action.count} packing ${action.count === 1 ? "item is" : "items are"} yours`}
                  </span>
                  <span className="text-subtle-foreground mt-0.5 block font-mono text-[11.5px]">{action.tripName}</span>
                </span>
                <span aria-hidden className="text-subtle-foreground group-hover:text-ink transition-colors">→</span>
              </Link>
            ))}
          </GridFrame>
        )}
      </section>

      <section aria-labelledby="inbox-updates" className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="inbox-updates" className="text-ink text-[19px] font-semibold tracking-[-0.02em]">Recent updates</h2>
            <p className="text-subtle-foreground mt-0.5 text-[13.5px]">The high-signal changes from your trips.</p>
          </div>
          {inbox.unreadCount > 0 ? <span className="text-subtle-foreground font-mono text-[11px] tabular-nums">{inbox.unreadCount} unread</span> : null}
        </div>
        {inbox.updates.length === 0 ? (
          <div className="border-border rounded-[8px] border px-6 py-10 text-center">
            <p className="text-ink text-[15px] font-semibold">No updates yet.</p>
            <p className="text-subtle-foreground mt-1 text-[13.5px]">When the crew makes a meaningful move, it will land here.</p>
          </div>
        ) : (
          <GridFrame>
            {inbox.updates.map((update) => (
              <div key={update.id} className={cn("grid-cell flex items-center gap-3 px-4 py-3", !update.read && "bg-surface-2")}>
                <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", update.read ? "bg-transparent" : "bg-ink")} />
                <form action={openNotification.bind(null, update.id)} className="min-w-0 flex-1">
                  <button type="submit" className="group w-full py-1 text-left">
                    <span className={cn("block text-[14px] leading-[1.45]", update.read ? "text-muted-foreground" : "text-ink font-medium")}>{update.message}</span>
                    <span className="text-subtle-foreground mt-1 block font-mono text-[11px]">{timeAgo(update.createdAt)}</span>
                  </button>
                </form>
                {!update.read ? (
                  <form action={markNotificationRead.bind(null, update.id)}>
                    <button type="submit" className="text-subtle-foreground hover:text-ink shrink-0 px-2 py-1 text-[12px] transition-colors">Mark read</button>
                  </form>
                ) : null}
              </div>
            ))}
          </GridFrame>
        )}
      </section>
    </main>
  );
}
