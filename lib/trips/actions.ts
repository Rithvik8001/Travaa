"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { trips, tripMembers } from "@/lib/db/trips";
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
