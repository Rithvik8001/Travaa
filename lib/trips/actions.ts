"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
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
} from "@/lib/db/trips";
import { assertMember } from "@/lib/trips/queries";
import { nights, type Availability } from "@/lib/trips/dates";
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

  await db
    .delete(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)));

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

  await db
    .delete(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, user.id)));

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

  await db
    .update(trips)
    .set({
      startDate: option.startDate,
      endDate: option.endDate,
      datesLockedAt: new Date(),
    })
    .where(eq(trips.id, tripId));

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
