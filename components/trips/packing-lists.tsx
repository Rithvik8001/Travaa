"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addPackingItem,
  assignPackingItem,
  createPackingList,
  deletePackingList,
  removePackingItem,
  renamePackingList,
  togglePackingItem,
  updatePackingItem,
} from "@/lib/trips/actions";
import type { PackingItemView, PackingListView } from "@/lib/trips/packing";
import type { TripMemberView } from "@/lib/trips/queries";

interface PackingListsProps {
  readonly tripId: string;
  readonly lists: readonly PackingListView[];
  readonly members: readonly TripMemberView[];
  readonly currentUserId: string;
  readonly isOrganizer: boolean;
  readonly readOnly: boolean;
}

export function PackingLists({
  tripId,
  lists,
  members,
  currentUserId,
  isOrganizer,
  readOnly,
}: PackingListsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const shared = lists.filter((list) => list.visibility === "shared");
  const privateLists = lists.filter((list) => list.visibility === "private");

  function run(action: () => Promise<{ error: string } | void>, reset?: () => void) {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (result && "error" in result) {
        setError(result.error);
        return;
      }
      reset?.();
      router.refresh();
    });
  }

  function createList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    run(
      () =>
        createPackingList(tripId, {
          name: String(data.get("name") ?? ""),
          visibility: data.get("visibility") === "private" ? "private" : "shared",
        }),
      () => form.reset(),
    );
  }

  return (
    <div>
      {!readOnly ? (
        <Card className="mb-8 p-5 min-[560px]:p-6">
          <form onSubmit={createList} className="grid gap-3 min-[560px]:grid-cols-[1fr_150px_auto]">
            <div>
              <label htmlFor="packing-list-name" className="sr-only">List name</label>
              <Input id="packing-list-name" name="name" placeholder="New list name" maxLength={80} disabled={pending} />
            </div>
            <div>
              <label htmlFor="packing-list-visibility" className="sr-only">Visibility</label>
              <select
                id="packing-list-visibility"
                name="visibility"
                disabled={pending}
                defaultValue="shared"
                className="bg-surface-sunken text-foreground focus:bg-surface focus:ring-ring h-[46px] w-full rounded-[12px] px-3 text-[14px] outline-none transition-[background-color,box-shadow] focus:ring-2 disabled:opacity-55"
              >
                <option value="shared">Shared</option>
                <option value="private">Private</option>
              </select>
            </div>
            <Button type="submit" disabled={pending}>Create list</Button>
          </form>
          <p className="text-subtle-foreground mt-3 text-[12.5px] leading-[1.45]">
            Visibility is permanent. Private lists stay visible only to you.
          </p>
        </Card>
      ) : null}

      {lists.length === 0 ? (
        <Card className="px-6 py-14 text-center">
          <p className="text-ink text-[16px] font-semibold">Nothing to pack yet</p>
          <p className="text-muted-foreground mx-auto mt-2 max-w-[44ch] text-[14px] leading-[1.55]">
            {readOnly
              ? "No packing lists were created before this trip was archived."
              : "Create a shared list for the crew or a private one for your own bag."}
          </p>
        </Card>
      ) : (
        <div className="space-y-12">
          <PackingGroup
            title="Shared with everyone"
            subtitle="The whole crew can add, assign, and check off items."
            empty="No shared lists yet."
            lists={shared}
            members={members}
            currentUserId={currentUserId}
            isOrganizer={isOrganizer}
            readOnly={readOnly}
            pending={pending}
            run={run}
          />
          <PackingGroup
            title="Private to you"
            subtitle="Only you can see these lists. Items are implicitly yours."
            empty="No private lists yet."
            lists={privateLists}
            members={members}
            currentUserId={currentUserId}
            isOrganizer={isOrganizer}
            readOnly={readOnly}
            pending={pending}
            run={run}
          />
        </div>
      )}

      {error ? <p role="alert" className="text-danger mt-5 text-[13px]">{error}</p> : null}
    </div>
  );
}

type RunAction = (
  action: () => Promise<{ error: string } | void>,
  reset?: () => void,
) => void;

function PackingGroup({
  title,
  subtitle,
  empty,
  lists,
  members,
  currentUserId,
  isOrganizer,
  readOnly,
  pending,
  run,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly empty: string;
  readonly lists: readonly PackingListView[];
  readonly members: readonly TripMemberView[];
  readonly currentUserId: string;
  readonly isOrganizer: boolean;
  readonly readOnly: boolean;
  readonly pending: boolean;
  readonly run: RunAction;
}) {
  return (
    <section aria-labelledby={`packing-${title.replaceAll(" ", "-").toLowerCase()}`}>
      <div className="mb-4">
        <h2 id={`packing-${title.replaceAll(" ", "-").toLowerCase()}`} className="text-ink text-[20px] font-semibold tracking-[-0.02em]">{title}</h2>
        <p className="text-muted-foreground mt-1 text-[13.5px]">{subtitle}</p>
      </div>
      {lists.length === 0 ? (
        <div className="border-hairline text-subtle-foreground rounded-[16px] border border-dashed px-5 py-8 text-center text-[13.5px]">{empty}</div>
      ) : (
        <div className="space-y-4">
          {lists.map((list) => (
            <PackingListCard
              key={list.id}
              list={list}
              members={members}
              canManageList={list.createdBy === currentUserId || isOrganizer}
              readOnly={readOnly}
              pending={pending}
              run={run}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PackingListCard({ list, members, canManageList, readOnly, pending, run }: {
  readonly list: PackingListView;
  readonly members: readonly TripMemberView[];
  readonly canManageList: boolean;
  readonly readOnly: boolean;
  readonly pending: boolean;
  readonly run: RunAction;
}) {
  const [editingName, setEditingName] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const incomplete = list.items.filter((item) => !item.completedAt);
  const completed = list.items.filter((item) => item.completedAt);

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    run(
      () => addPackingItem(list.id, { name: String(data.get("name") ?? ""), quantity: Number(data.get("quantity") ?? 1) }),
      () => form.reset(),
    );
  }

  function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    run(() => renamePackingList(list.id, String(data.get("name") ?? "")), () => setEditingName(false));
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-hairline flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 min-[560px]:px-6">
        <div className="min-w-0 flex-1">
          {editingName ? (
            <form onSubmit={rename} className="flex max-w-[420px] gap-2">
              <Input name="name" defaultValue={list.name} maxLength={80} autoFocus disabled={pending} />
              <Button type="submit" size="sm" disabled={pending}>Save</Button>
              <Button type="button" size="sm" variant="quiet" onClick={() => setEditingName(false)}>Cancel</Button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-ink truncate text-[16px] font-semibold">{list.name}</h3>
              <span className="bg-muted text-subtle-foreground rounded-full px-2 py-0.5 text-[10.5px] font-semibold tracking-[0.05em] uppercase">{list.visibility}</span>
            </div>
          )}
          <p className="text-subtle-foreground mt-1 text-[12.5px] tabular-nums">{list.completedCount} of {list.totalCount} packed</p>
        </div>
        {!readOnly && canManageList && !editingName ? (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setEditingName(true)} className="text-muted-foreground hover:text-ink text-[12.5px]">Rename</button>
            {confirmDelete ? (
              <span className="flex items-center gap-2">
                <span className="text-danger text-[12px]">Delete “{list.name}”?</span>
                <button type="button" disabled={pending} onClick={() => run(() => deletePackingList(list.id))} className="text-danger text-[12.5px] font-medium disabled:opacity-55">Delete</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-muted-foreground text-[12.5px]">Cancel</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-muted-foreground hover:text-danger text-[12.5px]">Delete</button>
            )}
          </div>
        ) : null}
      </div>

      <div className="px-5 py-4 min-[560px]:px-6">
        {incomplete.length === 0 ? (
          <p className="text-subtle-foreground py-3 text-center text-[13.5px]">{completed.length ? "Everything is packed." : "This list is empty."}</p>
        ) : (
          <ul className="divide-hairline divide-y">
            {incomplete.map((item) => <PackingItemRow key={item.id} item={item} list={list} members={members} readOnly={readOnly} pending={pending} run={run} />)}
          </ul>
        )}

        {completed.length > 0 ? (
          <details className="border-hairline mt-3 border-t pt-3">
            <summary className="text-muted-foreground hover:text-ink cursor-pointer text-[13px] font-medium">Completed ({completed.length})</summary>
            <ul className="divide-hairline mt-2 divide-y">
              {completed.map((item) => <PackingItemRow key={item.id} item={item} list={list} members={members} readOnly={readOnly} pending={pending} run={run} />)}
            </ul>
          </details>
        ) : null}

        {!readOnly ? (
          <form onSubmit={addItem} className="border-hairline mt-4 grid gap-2 border-t pt-4 min-[560px]:grid-cols-[1fr_92px_auto]">
            <div><label htmlFor={`item-${list.id}`} className="sr-only">Item name for {list.name}</label><Input id={`item-${list.id}`} name="name" placeholder="Add an item" maxLength={120} disabled={pending} /></div>
            <div><label htmlFor={`quantity-${list.id}`} className="sr-only">Quantity</label><Input id={`quantity-${list.id}`} name="quantity" type="number" min={1} max={999} defaultValue={1} disabled={pending} /></div>
            <Button type="submit" size="sm" disabled={pending}>Add item</Button>
          </form>
        ) : null}
      </div>
    </Card>
  );
}

function PackingItemRow({ item, list, members, readOnly, pending, run }: {
  readonly item: PackingItemView;
  readonly list: PackingListView;
  readonly members: readonly TripMemberView[];
  readonly readOnly: boolean;
  readonly pending: boolean;
  readonly run: RunAction;
}) {
  const [editing, setEditing] = useState(false);

  function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    run(() => updatePackingItem(item.id, { name: String(data.get("name") ?? ""), quantity: Number(data.get("quantity") ?? 1) }), () => setEditing(false));
  }

  if (editing) {
    return (
      <li className="py-3">
        <form onSubmit={update} className="grid gap-2 min-[560px]:grid-cols-[1fr_82px_auto]">
          <Input name="name" defaultValue={item.name} maxLength={120} autoFocus disabled={pending} aria-label="Item name" />
          <Input name="quantity" type="number" min={1} max={999} defaultValue={item.quantity} disabled={pending} aria-label="Quantity" />
          <span className="flex items-center gap-2"><Button type="submit" size="sm" disabled={pending}>Save</Button><Button type="button" size="sm" variant="quiet" onClick={() => setEditing(false)}>Cancel</Button></span>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
      <input
        type="checkbox"
        checked={Boolean(item.completedAt)}
        disabled={readOnly || pending}
        onChange={() => run(() => togglePackingItem(item.id))}
        aria-label={`${item.completedAt ? "Mark unpacked" : "Mark packed"}: ${item.name}`}
        className="accent-brand size-4 shrink-0 disabled:opacity-55"
      />
      <div className="min-w-[150px] flex-1">
        <span className={item.completedAt ? "text-subtle-foreground text-[14px] line-through" : "text-foreground text-[14px]"}>{item.name}</span>
        {item.quantity > 1 ? <span className="text-subtle-foreground ml-2 text-[12.5px] tabular-nums">×{item.quantity}</span> : null}
        {item.completedAt && item.completerName ? <span className="text-subtle-foreground ml-2 text-[11.5px]">by {item.completerName}</span> : null}
      </div>
      {list.visibility === "shared" ? (
        <div>
          <label htmlFor={`assignee-${item.id}`} className="sr-only">Assign {item.name}</label>
          <select
            id={`assignee-${item.id}`}
            value={item.assignedTo ?? ""}
            disabled={readOnly || pending}
            onChange={(event) => run(() => assignPackingItem(item.id, event.target.value || null))}
            className="bg-surface-sunken text-muted-foreground focus:ring-ring h-8 max-w-[150px] rounded-[10px] px-2 text-[12.5px] outline-none focus:ring-2 disabled:opacity-70"
          >
            <option value="">Unassigned</option>
            {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
        </div>
      ) : null}
      {!readOnly ? (
        <span className="flex items-center gap-2">
          <button type="button" onClick={() => setEditing(true)} className="text-subtle-foreground hover:text-ink text-[12px]">Edit</button>
          <button type="button" disabled={pending} onClick={() => run(() => removePackingItem(item.id))} className="text-subtle-foreground hover:text-danger text-[12px] disabled:opacity-55">Remove</button>
        </span>
      ) : null}
    </li>
  );
}
