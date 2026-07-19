"use server";

import { randomUUID } from "node:crypto";
import {
  and,
  asc,
  eq,
  gt,
  inArray,
  isNull,
  lt,
  max,
  or,
  sql,
} from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  trips,
  tripMembers,
  tripDateOptions,
  tripDateVotes,
  tripSuggestions,
  tripSuggestionVotes,
  tripSuggestionComments,
  tripItineraryItems,
  tripPackingLists,
  tripPackingItems,
} from "@/lib/db/trips";
import { assertMember } from "@/lib/trips/queries";
import { nights, type Availability } from "@/lib/trips/dates";
import { isDateInWindow, moveItem } from "@/lib/trips/itinerary";
import { requireSession } from "@/lib/session";

/** Raw form values; dates arrive as "" or "YYYY-MM-DD". */
export interface TripInput {
  readonly name: string;
  readonly destination: string;
  readonly startDate: string;
  readonly endDate: string;
}

interface TripFields {
  name: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
}

/**
 * Manual validation — no Zod (see AGENTS.md). Returns a normalized record, or a
 * message to surface on the form in the same `{ error }` shape the auth forms use.
 */
function parseTrip(input: TripInput): { fields: TripFields } | { error: string } {
  const name = input.name.trim();
  if (name.length < 1) return { error: "Give your trip a name." };
  if (name.length > 80) return { error: "Keep the name under 80 characters." };

  const destination = input.destination.trim();
  if (destination.length > 80)
    return { error: "Keep the destination under 80 characters." };

  const startDate = input.startDate || null;
  const endDate = input.endDate || null;
  if (startDate && endDate && endDate < startDate)
    return { error: "The end date can't be before the start date." };

  return {
    fields: {
      name,
      destination: destination || null,
      startDate,
      endDate,
    },
  };
}

export async function createTrip(input: TripInput): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const parsed = parseTrip(input);
  if ("error" in parsed) return parsed;

  const id = randomUUID();
  // Trip + the creator's membership land together — the owner is always a member.
  await db.transaction(async (tx) => {
    await tx.insert(trips).values({ id, ownerId: user.id, ...parsed.fields });
    await tx
      .insert(tripMembers)
      .values({ id: randomUUID(), tripId: id, userId: user.id });
  });

  revalidatePath("/dashboard");
  redirect(`/trips/${id}`);
}

export async function updateTrip(
  tripId: string,
  input: TripInput,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const existing = await ownedTrip(tripId, user.id);
  if (!existing) return { error: "Trip not found." };
  if (existing.archivedAt) return { error: "Unarchive this trip to edit it." };

  const parsed = parseTrip(input);
  if ("error" in parsed) return parsed;

  await db.update(trips).set(parsed.fields).where(eq(trips.id, tripId));

  revalidatePath("/dashboard");
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

/** The trip if it exists and belongs to the user, else null. */
async function ownedTrip(tripId: string, userId: string) {
  const trip = await db.query.trips.findFirst({ where: eq(trips.id, tripId) });
  return trip && trip.ownerId === userId ? trip : null;
}

/**
 * Archive/unarchive/delete are invoked from forms (no `{ error }` surface), so on a
 * missing/foreign trip they just bounce to the dashboard rather than reporting.
 */
export async function archiveTrip(tripId: string): Promise<void> {
  const { user } = await requireSession();
  if (!(await ownedTrip(tripId, user.id))) redirect("/dashboard");

  await db.update(trips).set({ archivedAt: new Date() }).where(eq(trips.id, tripId));

  revalidatePath("/dashboard");
  revalidatePath(`/trips/${tripId}`);
  redirect("/dashboard");
}

export async function unarchiveTrip(tripId: string): Promise<void> {
  const { user } = await requireSession();
  if (!(await ownedTrip(tripId, user.id))) redirect("/dashboard");

  await db.update(trips).set({ archivedAt: null }).where(eq(trips.id, tripId));

  revalidatePath("/dashboard");
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function deleteTrip(tripId: string): Promise<void> {
  const { user } = await requireSession();

  const existing = await ownedTrip(tripId, user.id);
  if (!existing) redirect("/dashboard");
  // Delete is archived-only — the affordance only appears on an archived trip.
  if (!existing.archivedAt) redirect(`/trips/${tripId}`);

  await db.delete(trips).where(eq(trips.id, tripId));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * Join a trip by its invite code. Idempotent — re-accepting an invite you already
 * hold is a no-op. Invoked from the /j/<code> card's Accept form.
 */
export async function joinTrip(code: string): Promise<void> {
  const { user } = await requireSession();

  const trip = await db.query.trips.findFirst({
    where: eq(trips.inviteCode, code),
    columns: { id: true },
  });
  if (!trip) redirect("/dashboard");

  await db
    .insert(tripMembers)
    .values({ id: randomUUID(), tripId: trip.id, userId: user.id })
    .onConflictDoNothing();

  revalidatePath("/dashboard");
  revalidatePath(`/trips/${trip.id}`);
  redirect(`/trips/${trip.id}`);
}

/** Organizer removes a member. The organizer (owner) can never be removed. */
export async function removeMember(tripId: string, userId: string): Promise<void> {
  const { user } = await requireSession();

  const trip = await ownedTrip(tripId, user.id);
  if (!trip) redirect("/dashboard");
  if (userId === trip.ownerId) return;

  await db.transaction(async (tx) => {
    const memberLists = tx
      .select({ id: tripPackingLists.id })
      .from(tripPackingLists)
      .where(eq(tripPackingLists.tripId, tripId));
    await tx
      .update(tripPackingItems)
      .set({ assignedTo: null })
      .where(
        and(
          eq(tripPackingItems.assignedTo, userId),
          inArray(tripPackingItems.listId, memberLists),
        ),
      );
    await tx
      .update(tripPackingItems)
      .set({ completedBy: null })
      .where(
        and(
          eq(tripPackingItems.completedBy, userId),
          inArray(tripPackingItems.listId, memberLists),
        ),
      );
    await tx
      .delete(tripPackingLists)
      .where(
        and(
          eq(tripPackingLists.tripId, tripId),
          eq(tripPackingLists.createdBy, userId),
          eq(tripPackingLists.visibility, "private"),
        ),
      );
    await tx
      .delete(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)));
  });

  revalidatePath("/dashboard");
  revalidatePath(`/trips/${tripId}`);
}

/** A member leaves a trip. The organizer can't leave — they delete the trip instead. */
export async function leaveTrip(tripId: string): Promise<void> {
  const { user } = await requireSession();

  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    columns: { ownerId: true },
  });
  if (!trip) redirect("/dashboard");
  if (trip.ownerId === user.id) redirect(`/trips/${tripId}`);

  await db.transaction(async (tx) => {
    const memberLists = tx
      .select({ id: tripPackingLists.id })
      .from(tripPackingLists)
      .where(eq(tripPackingLists.tripId, tripId));
    await tx
      .update(tripPackingItems)
      .set({ assignedTo: null })
      .where(
        and(
          eq(tripPackingItems.assignedTo, user.id),
          inArray(tripPackingItems.listId, memberLists),
        ),
      );
    await tx
      .update(tripPackingItems)
      .set({ completedBy: null })
      .where(
        and(
          eq(tripPackingItems.completedBy, user.id),
          inArray(tripPackingItems.listId, memberLists),
        ),
      );
    await tx
      .delete(tripPackingLists)
      .where(
        and(
          eq(tripPackingLists.tripId, tripId),
          eq(tripPackingLists.createdBy, user.id),
          eq(tripPackingLists.visibility, "private"),
        ),
      );
    await tx
      .delete(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, user.id)));
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/** No-look-alike alphabet (no 0/O/1/I/L) for codes that get read aloud / retyped. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function makeCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/** A code not already used by another trip. Collisions are astronomically rare; retry anyway. */
async function uniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    const clash = await db.query.trips.findFirst({
      where: eq(trips.inviteCode, code),
      columns: { id: true },
    });
    if (!clash) return code;
  }
  // Extremely unlikely; widen the space rather than fail.
  return makeCode(9);
}

/** Returns the trip's join code, generating one on first request. Organizer-only. */
export async function ensureInviteCode(
  tripId: string,
): Promise<{ code: string } | { error: string }> {
  const { user } = await requireSession();

  const trip = await ownedTrip(tripId, user.id);
  if (!trip) return { error: "Only the organizer can invite." };
  if (trip.inviteCode) return { code: trip.inviteCode };

  const code = await uniqueInviteCode();
  await db.update(trips).set({ inviteCode: code }).where(eq(trips.id, tripId));

  revalidatePath(`/trips/${tripId}`);
  return { code };
}

/** Replaces the join code (old links stop working). Organizer-only. */
export async function rotateInviteCode(
  tripId: string,
): Promise<{ code: string } | { error: string }> {
  const { user } = await requireSession();

  if (!(await ownedTrip(tripId, user.id)))
    return { error: "Only the organizer can invite." };

  const code = await uniqueInviteCode();
  await db.update(trips).set({ inviteCode: code }).where(eq(trips.id, tripId));

  revalidatePath(`/trips/${tripId}`);
  return { code };
}

/* ── Date polling ─────────────────────────────────────────────────────────── */

/** An active trip the user belongs to, or a message to surface. Gate for poll edits. */
async function activeMemberTrip(
  tripId: string,
  userId: string,
): Promise<{ ownerId: string } | { error: string }> {
  if (!(await assertMember(tripId, userId)))
    return { error: "You're not a member of this trip." };

  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    columns: { ownerId: true, archivedAt: true },
  });
  if (!trip) return { error: "Trip not found." };
  if (trip.archivedAt) return { error: "This trip is archived." };

  return { ownerId: trip.ownerId };
}

/** Propose a candidate window. Any member; duplicate windows are silently ignored. */
export async function proposeDateOption(
  tripId: string,
  input: { startDate: string; endDate: string },
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const trip = await activeMemberTrip(tripId, user.id);
  if ("error" in trip) return trip;

  const startDate = input.startDate || "";
  const endDate = input.endDate || "";
  if (!startDate || !endDate) return { error: "Pick a start and end date." };
  if (endDate < startDate)
    return { error: "The end date can't be before the start date." };
  if (nights(startDate, endDate) > 60)
    return { error: "Keep the window under two months." };

  await db
    .insert(tripDateOptions)
    .values({ id: randomUUID(), tripId, startDate, endDate, createdBy: user.id })
    .onConflictDoNothing();

  revalidatePath(`/trips/${tripId}`);
}

/** Remove a proposed window. The proposer or the organizer only. */
export async function removeDateOption(
  optionId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const option = await db.query.tripDateOptions.findFirst({
    where: eq(tripDateOptions.id, optionId),
    columns: { tripId: true, createdBy: true },
  });
  if (!option) return;

  const trip = await activeMemberTrip(option.tripId, user.id);
  if ("error" in trip) return trip;

  const canRemove = option.createdBy === user.id || trip.ownerId === user.id;
  if (!canRemove) return { error: "You can't remove this window." };

  await db.delete(tripDateOptions).where(eq(tripDateOptions.id, optionId));

  revalidatePath(`/trips/${option.tripId}`);
}

/** Set the caller's yes/maybe/no on a window. Any member; upserts their vote. */
export async function setAvailability(
  optionId: string,
  value: Availability,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  if (value !== "yes" && value !== "maybe" && value !== "no")
    return { error: "Unknown response." };

  const option = await db.query.tripDateOptions.findFirst({
    where: eq(tripDateOptions.id, optionId),
    columns: { tripId: true },
  });
  if (!option) return { error: "That window no longer exists." };

  const trip = await activeMemberTrip(option.tripId, user.id);
  if ("error" in trip) return trip;

  await db
    .insert(tripDateVotes)
    .values({ id: randomUUID(), optionId, userId: user.id, value })
    .onConflictDoUpdate({
      target: [tripDateVotes.optionId, tripDateVotes.userId],
      set: { value },
    });

  revalidatePath(`/trips/${option.tripId}`);
}

/** Commit a window as the trip's dates. Organizer-only, active trips only. */
export async function lockDates(
  tripId: string,
  optionId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const existing = await ownedTrip(tripId, user.id);
  if (!existing) return { error: "Only the organizer can lock the dates." };
  if (existing.archivedAt) return { error: "This trip is archived." };

  const option = await db.query.tripDateOptions.findFirst({
    where: and(
      eq(tripDateOptions.id, optionId),
      eq(tripDateOptions.tripId, tripId),
    ),
    columns: { startDate: true, endDate: true },
  });
  if (!option) return { error: "That window no longer exists." };

  await db.transaction(async (tx) => {
    await tx.execute(sql`select ${trips.id} from ${trips} where ${trips.id} = ${tripId} for update`);
    await tx
      .update(trips)
      .set({
        startDate: option.startDate,
        endDate: option.endDate,
        datesLockedAt: new Date(),
      })
      .where(eq(trips.id, tripId));

    await tx
      .update(tripItineraryItems)
      .set({ date: null })
      .where(
        and(
          eq(tripItineraryItems.tripId, tripId),
          or(
            lt(tripItineraryItems.date, option.startDate),
            gt(tripItineraryItems.date, option.endDate),
          ),
        ),
      );
    await normalizeItineraryGroup(tx, tripId, null);
  });

  revalidatePath("/dashboard");
  revalidatePath(`/trips/${tripId}`);
}

/** Reopen the poll. Keeps the locked-in dates; organizer can lock again. */
export async function unlockDates(
  tripId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const existing = await ownedTrip(tripId, user.id);
  if (!existing) return { error: "Only the organizer can reopen the poll." };

  await db.update(trips).set({ datesLockedAt: null }).where(eq(trips.id, tripId));

  revalidatePath(`/trips/${tripId}`);
}

/* ── Ideas board ──────────────────────────────────────────────────────────── */

/** Raw form values for a new idea; note/url arrive as "" when omitted. */
export interface SuggestionInput {
  readonly title: string;
  readonly note: string;
  readonly url: string;
}

/** Add an idea. Any active member. */
export async function proposeSuggestion(
  tripId: string,
  input: SuggestionInput,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const trip = await activeMemberTrip(tripId, user.id);
  if ("error" in trip) return trip;

  const title = input.title.trim();
  if (title.length < 1) return { error: "Give your idea a name." };
  if (title.length > 120) return { error: "Keep the title under 120 characters." };

  const note = input.note.trim();
  if (note.length > 500) return { error: "Keep the note under 500 characters." };

  const url = input.url.trim();
  if (url && !/^https?:\/\/\S+$/i.test(url))
    return { error: "Links must start with http:// or https://." };

  await db.insert(tripSuggestions).values({
    id: randomUUID(),
    tripId,
    createdBy: user.id,
    title,
    note: note || null,
    url: url || null,
  });

  revalidatePath(`/trips/${tripId}`);
}

/** Remove an idea. The author or the organizer only. */
export async function removeSuggestion(
  suggestionId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const suggestion = await db.query.tripSuggestions.findFirst({
    where: eq(tripSuggestions.id, suggestionId),
    columns: { tripId: true, createdBy: true },
  });
  if (!suggestion) return;

  const trip = await activeMemberTrip(suggestion.tripId, user.id);
  if ("error" in trip) return trip;

  const canRemove =
    suggestion.createdBy === user.id || trip.ownerId === user.id;
  if (!canRemove) return { error: "You can't remove this idea." };

  await db.delete(tripSuggestions).where(eq(tripSuggestions.id, suggestionId));

  revalidatePath(`/trips/${suggestion.tripId}`);
}

/** Toggle the caller's upvote on an idea. Any active member. */
export async function toggleSuggestionVote(
  suggestionId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const suggestion = await db.query.tripSuggestions.findFirst({
    where: eq(tripSuggestions.id, suggestionId),
    columns: { tripId: true },
  });
  if (!suggestion) return { error: "That idea no longer exists." };

  const trip = await activeMemberTrip(suggestion.tripId, user.id);
  if ("error" in trip) return trip;

  const existing = await db.query.tripSuggestionVotes.findFirst({
    where: and(
      eq(tripSuggestionVotes.suggestionId, suggestionId),
      eq(tripSuggestionVotes.userId, user.id),
    ),
    columns: { id: true },
  });

  if (existing) {
    await db
      .delete(tripSuggestionVotes)
      .where(eq(tripSuggestionVotes.id, existing.id));
  } else {
    await db
      .insert(tripSuggestionVotes)
      .values({ id: randomUUID(), suggestionId, userId: user.id })
      .onConflictDoNothing();
  }

  revalidatePath(`/trips/${suggestion.tripId}`);
}

/* ── Idea comments ────────────────────────────────────────────────────────── */

/**
 * Comment on an idea, or reply to a top-level comment. Any active member. Replies
 * are single-level: replying to a reply is rejected.
 */
export async function addComment(
  suggestionId: string,
  body: string,
  parentId?: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const suggestion = await db.query.tripSuggestions.findFirst({
    where: eq(tripSuggestions.id, suggestionId),
    columns: { tripId: true },
  });
  if (!suggestion) return { error: "That idea no longer exists." };

  const trip = await activeMemberTrip(suggestion.tripId, user.id);
  if ("error" in trip) return trip;

  const text = body.trim();
  if (text.length < 1) return { error: "Write something first." };
  if (text.length > 1000)
    return { error: "Keep comments under 1000 characters." };

  if (parentId) {
    const parent = await db.query.tripSuggestionComments.findFirst({
      where: eq(tripSuggestionComments.id, parentId),
      columns: { suggestionId: true, parentId: true },
    });
    if (!parent || parent.suggestionId !== suggestionId)
      return { error: "That comment no longer exists." };
    if (parent.parentId) return { error: "You can only reply once deep." };
  }

  await db.insert(tripSuggestionComments).values({
    id: randomUUID(),
    suggestionId,
    parentId: parentId ?? null,
    userId: user.id,
    body: text,
  });

  revalidatePath(`/trips/${suggestion.tripId}`);
}

/** Remove a comment (and any replies, via cascade). The author or the organizer only. */
export async function removeComment(
  commentId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const comment = await db.query.tripSuggestionComments.findFirst({
    where: eq(tripSuggestionComments.id, commentId),
    columns: { suggestionId: true, userId: true },
  });
  if (!comment) return;

  const suggestion = await db.query.tripSuggestions.findFirst({
    where: eq(tripSuggestions.id, comment.suggestionId),
    columns: { tripId: true },
  });
  if (!suggestion) return;

  const trip = await activeMemberTrip(suggestion.tripId, user.id);
  if ("error" in trip) return trip;

  const canRemove = comment.userId === user.id || trip.ownerId === user.id;
  if (!canRemove) return { error: "You can't remove this comment." };

  await db
    .delete(tripSuggestionComments)
    .where(eq(tripSuggestionComments.id, commentId));

  revalidatePath(`/trips/${suggestion.tripId}`);
}

/* ── Itinerary ────────────────────────────────────────────────────────────── */

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function itineraryGroupWhere(tripId: string, date: string | null) {
  return and(
    eq(tripItineraryItems.tripId, tripId),
    date === null
      ? isNull(tripItineraryItems.date)
      : eq(tripItineraryItems.date, date),
  );
}

async function nextItinerarySort(
  tx: Transaction,
  tripId: string,
  date: string | null,
): Promise<number> {
  const [row] = await tx
    .select({ max: max(tripItineraryItems.sortOrder) })
    .from(tripItineraryItems)
    .where(itineraryGroupWhere(tripId, date));
  return (row?.max ?? -1) + 1;
}

async function normalizeItineraryGroup(
  tx: Transaction,
  tripId: string,
  date: string | null,
): Promise<void> {
  const rows = await tx
    .select({ id: tripItineraryItems.id })
    .from(tripItineraryItems)
    .where(itineraryGroupWhere(tripId, date))
    .orderBy(
      asc(tripItineraryItems.sortOrder),
      asc(tripItineraryItems.createdAt),
      asc(tripItineraryItems.id),
    );
  for (const [sortOrder, row] of rows.entries()) {
    await tx
      .update(tripItineraryItems)
      .set({ sortOrder })
      .where(eq(tripItineraryItems.id, row.id));
  }
}

async function itineraryAccess(itemId: string, userId: string) {
  const item = await db.query.tripItineraryItems.findFirst({
    where: eq(tripItineraryItems.id, itemId),
  });
  if (!item) return { ok: false, error: "That itinerary item no longer exists." } as const;
  if (!(await assertMember(item.tripId, userId)))
    return { ok: false, error: "You're not a member of this trip." } as const;
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, item.tripId),
    columns: {
      ownerId: true,
      archivedAt: true,
      datesLockedAt: true,
      startDate: true,
      endDate: true,
    },
  });
  if (!trip) return { ok: false, error: "Trip not found." } as const;
  if (trip.archivedAt) return { ok: false, error: "This trip is archived." } as const;
  if (item.createdBy !== userId && trip.ownerId !== userId)
    return { ok: false, error: "You can't edit this itinerary item." } as const;
  return { ok: true, item, trip } as const;
}

/**
 * Promote an idea to the itinerary. Organizer-only. Idempotent — the unique
 * `sourceSuggestionId` means a second convert is a no-op and the idea stays on the
 * board (now flagged "Added to itinerary").
 */
export async function convertSuggestion(
  suggestionId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const suggestion = await db.query.tripSuggestions.findFirst({
    where: eq(tripSuggestions.id, suggestionId),
    columns: { tripId: true, title: true, note: true, url: true, createdBy: true },
  });
  if (!suggestion) return { error: "That idea no longer exists." };

  const trip = await ownedTrip(suggestion.tripId, user.id);
  if (!trip) return { error: "Only the organizer can add to the itinerary." };
  if (trip.archivedAt) return { error: "This trip is archived." };

  await db.transaction(async (tx) => {
    await tx.execute(sql`select ${trips.id} from ${trips} where ${trips.id} = ${suggestion.tripId} for update`);
    await tx
      .insert(tripItineraryItems)
      .values({
        id: randomUUID(),
        tripId: suggestion.tripId,
        createdBy: suggestion.createdBy,
        title: suggestion.title,
        note: suggestion.note,
        url: suggestion.url,
        sortOrder: await nextItinerarySort(tx, suggestion.tripId, null),
        sourceSuggestionId: suggestionId,
      })
      .onConflictDoNothing();
  });

  revalidatePath(`/trips/${suggestion.tripId}`);
}

/** Raw form values for a manual itinerary item; note/url/date arrive as "" when omitted. */
export interface ItineraryInput {
  readonly title: string;
  readonly note: string;
  readonly url: string;
  readonly date: string;
}

function parseItineraryInput(
  input: ItineraryInput,
  trip: { datesLockedAt: Date | null; startDate: string | null; endDate: string | null },
):
  | { fields: { title: string; note: string | null; url: string | null; date: string | null } }
  | { error: string } {
  const title = input.title.trim();
  if (!title) return { error: "Give the item a name." } as const;
  if (title.length > 120) return { error: "Keep the title under 120 characters." } as const;
  const note = input.note.trim();
  if (note.length > 500) return { error: "Keep the note under 500 characters." } as const;
  const url = input.url.trim();
  if (url && !/^https?:\/\/\S+$/i.test(url))
    return { error: "Links must start with http:// or https://." } as const;
  const date = input.date || null;
  if (date && (!trip.datesLockedAt || !trip.startDate || !trip.endDate))
    return { error: "Lock the trip dates before assigning a day." } as const;
  if (date && !isDateInWindow(date, trip.startDate!, trip.endDate!))
    return { error: "Choose a day within the locked trip dates." } as const;
  return { fields: { title, note: note || null, url: url || null, date } } as const;
}

/** Add an itinerary item directly. Any active member. */
export async function addItineraryItem(
  tripId: string,
  input: ItineraryInput,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const trip = await activeMemberTrip(tripId, user.id);
  if ("error" in trip) return trip;
  const fullTrip = await db.query.trips.findFirst({ where: eq(trips.id, tripId) });
  if (!fullTrip) return { error: "Trip not found." };
  const parsed = parseItineraryInput(input, fullTrip);
  if (!("fields" in parsed)) return { error: parsed.error };
  const fields = parsed.fields;

  await db.transaction(async (tx) => {
    await tx.execute(sql`select ${trips.id} from ${trips} where ${trips.id} = ${tripId} for update`);
    await tx.insert(tripItineraryItems).values({
      id: randomUUID(),
      tripId,
      createdBy: user.id,
      ...fields,
      sortOrder: await nextItinerarySort(tx, tripId, fields.date),
    });
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function updateItineraryItem(
  itemId: string,
  input: ItineraryInput,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const access = await itineraryAccess(itemId, user.id);
  if (!access.ok) return { error: access.error };
  const parsed = parseItineraryInput(input, access.trip);
  if (!("fields" in parsed)) return { error: parsed.error };
  // Reopening the date poll hides day assignment without erasing it. Editing
  // copy during that period must not silently unschedule the item.
  const fields = access.trip.datesLockedAt
    ? parsed.fields
    : { ...parsed.fields, date: access.item.date };

  await db.transaction(async (tx) => {
    await tx.execute(sql`select ${trips.id} from ${trips} where ${trips.id} = ${access.item.tripId} for update`);
    const dateChanged = access.item.date !== fields.date;
    const sortOrder = dateChanged
      ? await nextItinerarySort(tx, access.item.tripId, fields.date)
      : access.item.sortOrder;
    await tx
      .update(tripItineraryItems)
      .set({ ...fields, sortOrder })
      .where(eq(tripItineraryItems.id, itemId));
    if (dateChanged)
      await normalizeItineraryGroup(tx, access.item.tripId, access.item.date);
  });
  revalidatePath(`/trips/${access.item.tripId}`);
}

export async function moveItineraryItem(
  itemId: string,
  direction: "up" | "down",
): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  if (direction !== "up" && direction !== "down") return { error: "Unknown move." };
  const access = await itineraryAccess(itemId, user.id);
  if (!access.ok) return { error: access.error };

  await db.transaction(async (tx) => {
    await tx.execute(sql`select ${trips.id} from ${trips} where ${trips.id} = ${access.item.tripId} for update`);
    const rows = await tx
      .select({ id: tripItineraryItems.id })
      .from(tripItineraryItems)
      .where(itineraryGroupWhere(access.item.tripId, access.item.date))
      .orderBy(asc(tripItineraryItems.sortOrder), asc(tripItineraryItems.createdAt), asc(tripItineraryItems.id));
    const index = rows.findIndex((row) => row.id === itemId);
    const moved = moveItem(rows, index, direction);
    for (const [sortOrder, row] of moved.entries()) {
      await tx.update(tripItineraryItems).set({ sortOrder }).where(eq(tripItineraryItems.id, row.id));
    }
  });
  revalidatePath(`/trips/${access.item.tripId}`);
}

/** Remove an itinerary item. Author or organizer. */
export async function removeItineraryItem(
  itemId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const access = await itineraryAccess(itemId, user.id);
  if (!access.ok) return { error: access.error };
  await db.transaction(async (tx) => {
    await tx.execute(sql`select ${trips.id} from ${trips} where ${trips.id} = ${access.item.tripId} for update`);
    await tx.delete(tripItineraryItems).where(eq(tripItineraryItems.id, itemId));
    await normalizeItineraryGroup(tx, access.item.tripId, access.item.date);
  });
  revalidatePath(`/trips/${access.item.tripId}`);
}

/* ── Packing lists ───────────────────────────────────────────────────────── */

type PackingVisibility = "shared" | "private";

function packingPath(tripId: string) {
  return `/trips/${tripId}/packing`;
}

function parsePackingName(value: string, kind: "list" | "item") {
  const name = value.trim();
  const maxLength = kind === "list" ? 80 : 120;
  if (!name) return { ok: false, error: `Give your ${kind} a name.` } as const;
  if (name.length > maxLength)
    return { ok: false, error: `Keep the ${kind} name under ${maxLength} characters.` } as const;
  return { ok: true, name } as const;
}

function parseQuantity(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 999)
    return { ok: false, error: "Quantity must be a whole number from 1 to 999." } as const;
  return { ok: true, quantity: value } as const;
}

async function accessiblePackingList(listId: string, userId: string) {
  const list = await db.query.tripPackingLists.findFirst({
    where: eq(tripPackingLists.id, listId),
  });
  if (!list) return { ok: false, error: "That packing list no longer exists." } as const;

  const trip = await activeMemberTrip(list.tripId, userId);
  if ("error" in trip) return { ok: false, error: trip.error } as const;
  if (list.visibility === "private" && list.createdBy !== userId)
    return { ok: false, error: "That packing list is private." } as const;
  return { ok: true, list, ownerId: trip.ownerId } as const;
}

async function accessiblePackingItem(itemId: string, userId: string) {
  const item = await db.query.tripPackingItems.findFirst({
    where: eq(tripPackingItems.id, itemId),
  });
  if (!item) return { ok: false, error: "That packing item no longer exists." } as const;
  const access = await accessiblePackingList(item.listId, userId);
  if (!access.ok) return access;
  return { ok: true, item, list: access.list, ownerId: access.ownerId } as const;
}

export async function createPackingList(
  tripId: string,
  input: { name: string; visibility: PackingVisibility },
): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const trip = await activeMemberTrip(tripId, user.id);
  if ("error" in trip) return trip;
  if (input.visibility !== "shared" && input.visibility !== "private")
    return { error: "Choose shared or private." };
  const parsed = parsePackingName(input.name, "list");
  if (!parsed.ok) return { error: parsed.error };

  await db.insert(tripPackingLists).values({
    id: randomUUID(),
    tripId,
    createdBy: user.id,
    name: parsed.name,
    visibility: input.visibility,
  });
  revalidatePath(packingPath(tripId));
  revalidatePath(`/trips/${tripId}`);
}

export async function renamePackingList(
  listId: string,
  name: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const access = await accessiblePackingList(listId, user.id);
  if (!access.ok) return { error: access.error };
  if (access.list.createdBy !== user.id && access.ownerId !== user.id)
    return { error: "Only the list creator or organizer can rename it." };
  const parsed = parsePackingName(name, "list");
  if (!parsed.ok) return { error: parsed.error };

  await db.update(tripPackingLists).set({ name: parsed.name }).where(eq(tripPackingLists.id, listId));
  revalidatePath(packingPath(access.list.tripId));
}

export async function deletePackingList(
  listId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const access = await accessiblePackingList(listId, user.id);
  if (!access.ok) return { error: access.error };
  if (access.list.createdBy !== user.id && access.ownerId !== user.id)
    return { error: "Only the list creator or organizer can delete it." };

  await db.delete(tripPackingLists).where(eq(tripPackingLists.id, listId));
  revalidatePath(packingPath(access.list.tripId));
  revalidatePath(`/trips/${access.list.tripId}`);
}

export async function addPackingItem(
  listId: string,
  input: { name: string; quantity: number },
): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const access = await accessiblePackingList(listId, user.id);
  if (!access.ok) return { error: access.error };
  const parsedName = parsePackingName(input.name, "item");
  if (!parsedName.ok) return { error: parsedName.error };
  const parsedQuantity = parseQuantity(input.quantity);
  if (!parsedQuantity.ok) return { error: parsedQuantity.error };

  await db.insert(tripPackingItems).values({
    id: randomUUID(),
    listId,
    createdBy: user.id,
    name: parsedName.name,
    quantity: parsedQuantity.quantity,
  });
  revalidatePath(packingPath(access.list.tripId));
  revalidatePath(`/trips/${access.list.tripId}`);
}

export async function updatePackingItem(
  itemId: string,
  input: { name: string; quantity: number },
): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const access = await accessiblePackingItem(itemId, user.id);
  if (!access.ok) return { error: access.error };
  const parsedName = parsePackingName(input.name, "item");
  if (!parsedName.ok) return { error: parsedName.error };
  const parsedQuantity = parseQuantity(input.quantity);
  if (!parsedQuantity.ok) return { error: parsedQuantity.error };

  await db
    .update(tripPackingItems)
    .set({ name: parsedName.name, quantity: parsedQuantity.quantity })
    .where(eq(tripPackingItems.id, itemId));
  revalidatePath(packingPath(access.list.tripId));
}

export async function removePackingItem(
  itemId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const access = await accessiblePackingItem(itemId, user.id);
  if (!access.ok) return { error: access.error };
  await db.delete(tripPackingItems).where(eq(tripPackingItems.id, itemId));
  revalidatePath(packingPath(access.list.tripId));
  revalidatePath(`/trips/${access.list.tripId}`);
}

export async function assignPackingItem(
  itemId: string,
  assignedTo: string | null,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const access = await accessiblePackingItem(itemId, user.id);
  if (!access.ok) return { error: access.error };
  if (access.list.visibility === "private")
    return { error: "Private items can't be assigned." };
  if (assignedTo && !(await assertMember(access.list.tripId, assignedTo)))
    return { error: "Choose a current trip member." };

  await db
    .update(tripPackingItems)
    .set({ assignedTo })
    .where(eq(tripPackingItems.id, itemId));
  revalidatePath(packingPath(access.list.tripId));
}

export async function togglePackingItem(
  itemId: string,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();
  const access = await accessiblePackingItem(itemId, user.id);
  if (!access.ok) return { error: access.error };
  const completing = !access.item.completedAt;
  await db
    .update(tripPackingItems)
    .set({
      completedAt: completing ? new Date() : null,
      completedBy: completing ? user.id : null,
    })
    .where(eq(tripPackingItems.id, itemId));
  revalidatePath(packingPath(access.list.tripId));
  revalidatePath(`/trips/${access.list.tripId}`);
}
