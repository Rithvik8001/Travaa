"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/trips";
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
  await db.insert(trips).values({ id, ownerId: user.id, ...parsed.fields });

  revalidatePath("/dashboard");
  redirect(`/trips/${id}`);
}

export async function updateTrip(
  tripId: string,
  input: TripInput,
): Promise<{ error: string } | void> {
  const { user } = await requireSession();

  const existing = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
  });
  if (!existing || existing.ownerId !== user.id) return { error: "Trip not found." };

  const parsed = parseTrip(input);
  if ("error" in parsed) return parsed;

  await db.update(trips).set(parsed.fields).where(eq(trips.id, tripId));

  revalidatePath("/dashboard");
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}
