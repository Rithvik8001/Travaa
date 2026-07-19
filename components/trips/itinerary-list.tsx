"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridFrame } from "@/components/ui/grid-cell";
import { Input } from "@/components/ui/input";
import { MotionItem, PresenceList } from "@/components/ui/motion";
import { Textarea } from "@/components/ui/textarea";
import { ItineraryForm } from "@/components/trips/itinerary-form";
import {
  moveItineraryItem,
  removeItineraryItem,
  updateItineraryItem,
} from "@/lib/trips/actions";
import {
  enumerateDates,
  groupItinerary,
  type ItineraryItemView,
  type LockedWindow,
} from "@/lib/trips/itinerary";

interface ItineraryListProps {
  readonly tripId: string;
  readonly items: readonly ItineraryItemView[];
  readonly currentUserId: string;
  readonly readOnly: boolean;
  readonly lockedWindow: LockedWindow | null;
}

type RunAction = (
  action: () => Promise<{ error: string } | void>,
  onSuccess?: () => void,
) => void;

export function ItineraryList({
  tripId,
  items,
  currentUserId,
  readOnly,
  lockedWindow,
}: ItineraryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const groups = groupItinerary(items, lockedWindow);

  function run(action: () => Promise<{ error: string } | void>, onSuccess?: () => void) {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <section id="itinerary" className="scroll-mt-24">
      <div className="mb-4">
        <Eyebrow className="mb-2">Itinerary</Eyebrow>
        <h2 className="text-ink text-[19px] font-semibold tracking-[-0.02em]">The day-by-day</h2>
        <p className="text-subtle-foreground mt-0.5 text-[13.5px]">
          {readOnly
            ? "What the crew committed to."
            : lockedWindow
              ? "Shape the plan together, one day at a time."
              : "Add plans now — assign them to days once the dates are locked."}
        </p>
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.key} aria-labelledby={`itinerary-${group.key}`}>
            <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
              <h3 id={`itinerary-${group.key}`} className="text-ink text-[15px] font-semibold">
                {group.dayNumber ? `Day ${group.dayNumber}` : "Unscheduled"}
              </h3>
              {group.date ? (
                <span className="text-subtle-foreground font-mono text-[11px] tracking-[0.04em] uppercase">
                  {group.weekday} · {group.label}
                </span>
              ) : null}
            </div>
            <GridFrame>
              {group.items.length === 0 ? (
                <div className="grid-cell text-subtle-foreground px-5 py-5 text-[13.5px]">Nothing planned yet.</div>
              ) : (
                <PresenceList>
                  {group.items.map((item, index) => (
                    <MotionItem key={item.id} className="grid-cell px-5 py-4">
                      <div>
                        {editingId === item.id ? (
                          <ItineraryEditor
                            item={item}
                            lockedWindow={lockedWindow}
                            pending={pending}
                            error={error}
                            onCancel={() => { setEditingId(null); setError(""); }}
                            run={run}
                          />
                        ) : (
                          <ItineraryRow
                            item={item}
                            isCurrentUser={item.createdBy === currentUserId}
                            readOnly={readOnly}
                            canMoveUp={lockedWindow !== null && index > 0}
                            canMoveDown={lockedWindow !== null && index < group.items.length - 1}
                            pending={pending}
                            onEdit={() => { setEditingId(item.id); setError(""); }}
                            run={run}
                          />
                        )}
                      </div>
                    </MotionItem>
                  ))}
                </PresenceList>
              )}
            </GridFrame>
          </section>
        ))}
      </div>

      {!readOnly ? <ItineraryForm tripId={tripId} lockedWindow={lockedWindow} /> : null}
      {error && !editingId ? <p role="alert" className="text-danger mt-3 text-[13px]">{error}</p> : null}
    </section>
  );
}

function ItineraryRow({
  item,
  isCurrentUser,
  readOnly,
  canMoveUp,
  canMoveDown,
  pending,
  onEdit,
  run,
}: {
  readonly item: ItineraryItemView;
  readonly isCurrentUser: boolean;
  readonly readOnly: boolean;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
  readonly pending: boolean;
  readonly onEdit: () => void;
  readonly run: RunAction;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const manageable = item.canManage && !readOnly;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-ink text-[15.5px] font-semibold tracking-[-0.01em] break-words underline-offset-2 hover:underline">{item.title}</a>
          ) : <span className="text-ink text-[15.5px] font-semibold tracking-[-0.01em] break-words">{item.title}</span>}
          {item.sourceSuggestionId ? <Badge tone="soft" size="sm">From ideas</Badge> : null}
        </div>
        {item.note ? <p className="text-muted-foreground mt-1 text-[14px] leading-[1.5] break-words">{item.note}</p> : null}
        <p className="text-subtle-foreground mt-1.5 font-mono text-[11.5px]">Added by {isCurrentUser ? "you" : item.createdByName}</p>
      </div>
      {manageable ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-2">
          <button type="button" aria-label={`Move ${item.title} up`} disabled={pending || !canMoveUp} onClick={() => run(() => moveItineraryItem(item.id, "up"))} className="text-muted-foreground hover:text-ink text-[12px] disabled:opacity-30">↑</button>
          <button type="button" aria-label={`Move ${item.title} down`} disabled={pending || !canMoveDown} onClick={() => run(() => moveItineraryItem(item.id, "down"))} className="text-muted-foreground hover:text-ink text-[12px] disabled:opacity-30">↓</button>
          <button type="button" disabled={pending} onClick={onEdit} className="text-muted-foreground hover:text-ink text-[12.5px] disabled:opacity-55">Edit</button>
          {confirmRemove ? (
            <span className="flex items-center gap-2">
              <button type="button" disabled={pending} onClick={() => run(() => removeItineraryItem(item.id))} className="text-danger text-[12.5px] font-medium disabled:opacity-55">Remove</button>
              <button type="button" onClick={() => setConfirmRemove(false)} className="text-muted-foreground text-[12.5px]">Cancel</button>
            </span>
          ) : <button type="button" onClick={() => setConfirmRemove(true)} className="text-subtle-foreground hover:text-danger text-[12.5px]">Remove</button>}
        </div>
      ) : null}
    </div>
  );
}

function ItineraryEditor({ item, lockedWindow, pending, error, onCancel, run }: {
  readonly item: ItineraryItemView;
  readonly lockedWindow: LockedWindow | null;
  readonly pending: boolean;
  readonly error: string;
  readonly onCancel: () => void;
  readonly run: RunAction;
}) {
  const days = lockedWindow ? enumerateDates(lockedWindow.startDate, lockedWindow.endDate) : [];
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    run(() => updateItineraryItem(item.id, {
      title: String(data.get("title") ?? ""),
      note: String(data.get("note") ?? ""),
      url: String(data.get("url") ?? ""),
      date: lockedWindow ? String(data.get("date") ?? "") : "",
    }), onCancel);
  }
  return (
    <form onSubmit={submit} className="grid gap-3 min-[560px]:grid-cols-2">
      <Input name="title" defaultValue={item.title} maxLength={120} required autoFocus disabled={pending} className="min-[560px]:col-span-2" />
      <Textarea name="note" defaultValue={item.note ?? ""} maxLength={500} disabled={pending} placeholder="Add a note…" className="min-[560px]:col-span-2" />
      <Input name="url" type="url" defaultValue={item.url ?? ""} disabled={pending} placeholder="https://…" />
      <select name="date" defaultValue={lockedWindow ? item.date ?? "" : ""} disabled={pending || !lockedWindow} className="border-border bg-surface text-foreground focus:border-border-strong focus:ring-ring/60 h-[42px] w-full rounded-[6px] border px-3 text-[14px] outline-none focus:ring-2 disabled:opacity-55">
        <option value="">Unscheduled</option>
        {days.map((date, index) => <option key={date} value={date}>Day {index + 1} · {date}</option>)}
      </select>
      <div className="flex items-center gap-2 min-[560px]:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        <Button type="button" size="sm" variant="quiet" onClick={onCancel}>Cancel</Button>
        {error ? <p role="alert" className="text-danger text-[13px]">{error}</p> : null}
      </div>
    </form>
  );
}
