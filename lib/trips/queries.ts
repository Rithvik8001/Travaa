import "server-only";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { trips, tripMembers, tripDateOptions, tripDateVotes } from "@/lib/db/trips";
import { user } from "@/lib/db/schema";
import type { Availability, DateOptionView } from "@/lib/trips/dates";

/** Active trips the user belongs to, newest first. "Your trips" for the dashboard. */
export async function listTripsForUser(userId: string) {
  return db
    .select(getTableColumns(trips))
    .from(trips)
    .innerJoin(tripMembers, eq(tripMembers.tripId, trips.id))
    .where(and(eq(tripMembers.userId, userId), isNull(trips.archivedAt)))
    .orderBy(desc(trips.createdAt));
}

/** Archived trips the user belongs to, most-recently-archived first. */
export async function listArchivedTripsForUser(userId: string) {
  return db
    .select(getTableColumns(trips))
    .from(trips)
    .innerJoin(tripMembers, eq(tripMembers.tripId, trips.id))
    .where(and(eq(tripMembers.userId, userId), isNotNull(trips.archivedAt)))
    .orderBy(desc(trips.archivedAt));
}

/** A single trip the user is a member of, active or archived. `null` when they aren't. */
export async function getTripForUser(tripId: string, userId: string) {
  const [trip] = await db
    .select(getTableColumns(trips))
    .from(trips)
    .innerJoin(tripMembers, eq(tripMembers.tripId, trips.id))
    .where(and(eq(trips.id, tripId), eq(tripMembers.userId, userId)))
    .limit(1);
  return trip ?? null;
}

/** A trip by its shareable join code (for the /j/<code> deep link). `null` if unknown. */
export async function getTripByInviteCode(code: string) {
  return (
    (await db.query.trips.findFirst({
      where: eq(trips.inviteCode, code),
    })) ?? null
  );
}

export interface TripMemberView {
  readonly id: string;
  readonly name: string;
  readonly isOwner: boolean;
}

/** The trip's crew for the header stack / roster, owner first (joined earliest). */
export async function listTripMembers(tripId: string): Promise<TripMemberView[]> {
  const rows = await db
    .select({ id: user.id, name: user.name, joinedAt: tripMembers.joinedAt, ownerId: trips.ownerId })
    .from(tripMembers)
    .innerJoin(user, eq(user.id, tripMembers.userId))
    .innerJoin(trips, eq(trips.id, tripMembers.tripId))
    .where(eq(tripMembers.tripId, tripId))
    .orderBy(asc(tripMembers.joinedAt));

  return rows.map((r) => ({ id: r.id, name: r.name, isOwner: r.id === r.ownerId }));
}

/** Whether the user belongs to the trip. Gate for member-scoped mutations. */
export async function assertMember(
  tripId: string,
  userId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: tripMembers.id })
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)))
    .limit(1);
  return Boolean(row);
}

/**
 * The trip's date poll: every proposed window with its vote tally, the caller's
 * own stance, and each member's response for the avatar stack. Ordered oldest
 * first; the client applies rankOptions() for display / "Best fit".
 */
export async function getDatePoll(
  tripId: string,
  userId: string,
): Promise<DateOptionView[]> {
  const options = await db
    .select()
    .from(tripDateOptions)
    .where(eq(tripDateOptions.tripId, tripId))
    .orderBy(asc(tripDateOptions.createdAt));

  if (options.length === 0) return [];

  const [votes, [memberCount]] = await Promise.all([
    db
      .select({
        optionId: tripDateVotes.optionId,
        userId: tripDateVotes.userId,
        value: tripDateVotes.value,
      })
      .from(tripDateVotes)
      .where(
        inArray(
          tripDateVotes.optionId,
          options.map((o) => o.id),
        ),
      ),
    db
      .select({ total: count() })
      .from(tripMembers)
      .where(eq(tripMembers.tripId, tripId)),
  ]);

  const total = memberCount?.total ?? 0;

  const byOption = new Map<string, { userId: string; value: Availability }[]>();
  for (const vote of votes) {
    const list = byOption.get(vote.optionId);
    if (list) list.push({ userId: vote.userId, value: vote.value });
    else byOption.set(vote.optionId, [{ userId: vote.userId, value: vote.value }]);
  }

  return options.map((option) => {
    const rows = byOption.get(option.id) ?? [];
    const responses: Record<string, Availability> = {};
    let yes = 0;
    let maybe = 0;
    let no = 0;
    let myValue: Availability | null = null;

    for (const { userId: voter, value } of rows) {
      responses[voter] = value;
      if (value === "yes") yes += 1;
      else if (value === "maybe") maybe += 1;
      else no += 1;
      if (voter === userId) myValue = value;
    }

    return {
      id: option.id,
      startDate: option.startDate,
      endDate: option.endDate,
      createdBy: option.createdBy,
      counts: { yes, maybe, no, available: yes + maybe, total },
      myValue,
      responses,
    };
  });
}
