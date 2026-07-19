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
  or,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import type { Database } from "@/lib/db/client";
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
import { user } from "@/lib/db/schema";
import type { Availability, DateOptionView } from "@/lib/trips/dates";
import type { CommentView, SuggestionView } from "@/lib/trips/suggestions";
import { sortItinerary, type ItineraryItemView } from "@/lib/trips/itinerary";
import {
  packingProgress,
  sortPackingItems,
  type PackingItemView,
  type PackingListView,
} from "@/lib/trips/packing";

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

/**
 * The trip's ideas board: every suggestion with its author, upvote tally, the
 * voters (for the avatar stack) and whether the caller has voted. Ordered newest
 * first; the client applies rankSuggestions() for display / "Top pick".
 */
export async function getSuggestions(
  tripId: string,
  userId: string,
): Promise<SuggestionView[]> {
  const rows = await db
    .select({
      id: tripSuggestions.id,
      title: tripSuggestions.title,
      note: tripSuggestions.note,
      url: tripSuggestions.url,
      createdBy: tripSuggestions.createdBy,
      createdByName: user.name,
    })
    .from(tripSuggestions)
    .innerJoin(user, eq(user.id, tripSuggestions.createdBy))
    .where(eq(tripSuggestions.tripId, tripId))
    .orderBy(desc(tripSuggestions.createdAt));

  if (rows.length === 0) return [];

  const suggestionIds = rows.map((r) => r.id);

  const [votes, comments, converted] = await Promise.all([
    db
      .select({
        suggestionId: tripSuggestionVotes.suggestionId,
        userId: tripSuggestionVotes.userId,
      })
      .from(tripSuggestionVotes)
      .where(inArray(tripSuggestionVotes.suggestionId, suggestionIds)),
    db
      .select({
        id: tripSuggestionComments.id,
        suggestionId: tripSuggestionComments.suggestionId,
        parentId: tripSuggestionComments.parentId,
        body: tripSuggestionComments.body,
        createdBy: tripSuggestionComments.userId,
        createdByName: user.name,
        createdAt: tripSuggestionComments.createdAt,
      })
      .from(tripSuggestionComments)
      .innerJoin(user, eq(user.id, tripSuggestionComments.userId))
      .where(inArray(tripSuggestionComments.suggestionId, suggestionIds))
      .orderBy(asc(tripSuggestionComments.createdAt)),
    db
      .select({ sourceSuggestionId: tripItineraryItems.sourceSuggestionId })
      .from(tripItineraryItems)
      .where(inArray(tripItineraryItems.sourceSuggestionId, suggestionIds)),
  ]);

  const votesBySuggestion = new Map<string, string[]>();
  for (const vote of votes) {
    const list = votesBySuggestion.get(vote.suggestionId);
    if (list) list.push(vote.userId);
    else votesBySuggestion.set(vote.suggestionId, [vote.userId]);
  }

  const convertedIds = new Set(
    converted
      .map((c) => c.sourceSuggestionId)
      .filter((id): id is string => id !== null),
  );

  // Build the shallow comment tree per suggestion: top-level newest first, each
  // with its replies oldest first (both derived from the createdAt-asc query).
  const commentsBySuggestion = new Map<string, CommentView[]>();
  const commentCountBySuggestion = new Map<string, number>();
  const repliesByParent = new Map<string, CommentView[]>();

  for (const c of comments) {
    commentCountBySuggestion.set(
      c.suggestionId,
      (commentCountBySuggestion.get(c.suggestionId) ?? 0) + 1,
    );
    const node: CommentView & { replies: CommentView[] } = {
      id: c.id,
      body: c.body,
      createdBy: c.createdBy,
      createdByName: c.createdByName,
      createdAt: c.createdAt.toISOString(),
      replies: [],
    };
    if (c.parentId) {
      const siblings = repliesByParent.get(c.parentId);
      if (siblings) siblings.push(node);
      else repliesByParent.set(c.parentId, [node]);
    } else {
      const list = commentsBySuggestion.get(c.suggestionId);
      if (list) list.unshift(node);
      else commentsBySuggestion.set(c.suggestionId, [node]);
    }
  }

  for (const [parentId, replies] of repliesByParent) {
    for (const list of commentsBySuggestion.values()) {
      const parent = list.find((c) => c.id === parentId) as
        | (CommentView & { replies: CommentView[] })
        | undefined;
      if (parent) {
        parent.replies = replies;
        break;
      }
    }
  }

  return rows.map((row) => {
    const voters = votesBySuggestion.get(row.id) ?? [];
    return {
      id: row.id,
      title: row.title,
      note: row.note,
      url: row.url,
      createdBy: row.createdBy,
      createdByName: row.createdByName,
      votes: voters.length,
      voters,
      myVote: voters.includes(userId),
      comments: commentsBySuggestion.get(row.id) ?? [],
      commentCount: commentCountBySuggestion.get(row.id) ?? 0,
      converted: convertedIds.has(row.id),
    };
  });
}

/**
 * The trip's itinerary: committed items (converted ideas + organizer additions)
 * with their author, ordered by day then explicit order. Newest-created breaks
 * ties (the query's createdAt ascending feeds the stable sortItinerary).
 */
export async function getItinerary(
  tripId: string,
  userId: string,
): Promise<ItineraryItemView[]> {
  return getItineraryForUser(db, tripId, userId);
}

/** Executor-aware form used by the integration suite; caller identity remains server-trusted. */
export async function getItineraryForUser(
  database: Database,
  tripId: string,
  userId: string,
): Promise<ItineraryItemView[]> {
  const membership = await database.query.tripMembers.findFirst({
    where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)),
    columns: { id: true },
  });
  if (!membership) return [];
  const trip = await database.query.trips.findFirst({
    where: eq(trips.id, tripId),
    columns: { ownerId: true },
  });
  if (!trip) return [];

  const rows = await database
    .select({
      id: tripItineraryItems.id,
      title: tripItineraryItems.title,
      note: tripItineraryItems.note,
      url: tripItineraryItems.url,
      date: tripItineraryItems.date,
      sortOrder: tripItineraryItems.sortOrder,
      createdBy: tripItineraryItems.createdBy,
      createdByName: user.name,
      createdAt: tripItineraryItems.createdAt,
      sourceSuggestionId: tripItineraryItems.sourceSuggestionId,
    })
    .from(tripItineraryItems)
    .innerJoin(user, eq(user.id, tripItineraryItems.createdBy))
    .where(eq(tripItineraryItems.tripId, tripId))
    .orderBy(asc(tripItineraryItems.createdAt));

  return sortItinerary(
    rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      canManage: row.createdBy === userId || trip.ownerId === userId,
    })),
  );
}

/** Shared lists plus only the caller's private lists. Privacy is enforced in SQL. */
export async function getPackingLists(
  tripId: string,
  userId: string,
): Promise<PackingListView[]> {
  if (!(await assertMember(tripId, userId))) return [];

  const lists = await db
    .select({
      id: tripPackingLists.id,
      name: tripPackingLists.name,
      visibility: tripPackingLists.visibility,
      createdBy: tripPackingLists.createdBy,
      createdAt: tripPackingLists.createdAt,
    })
    .from(tripPackingLists)
    .where(
      and(
        eq(tripPackingLists.tripId, tripId),
        or(
          eq(tripPackingLists.visibility, "shared"),
          and(
            eq(tripPackingLists.visibility, "private"),
            eq(tripPackingLists.createdBy, userId),
          ),
        ),
      ),
    )
    .orderBy(asc(tripPackingLists.createdAt));

  if (lists.length === 0) return [];

  const assignee = alias(user, "packing_assignee");
  const completer = alias(user, "packing_completer");
  const rows = await db
    .select({
      id: tripPackingItems.id,
      listId: tripPackingItems.listId,
      name: tripPackingItems.name,
      quantity: tripPackingItems.quantity,
      createdBy: tripPackingItems.createdBy,
      assignedTo: tripPackingItems.assignedTo,
      assigneeName: assignee.name,
      completedAt: tripPackingItems.completedAt,
      completedBy: tripPackingItems.completedBy,
      completerName: completer.name,
      createdAt: tripPackingItems.createdAt,
    })
    .from(tripPackingItems)
    .leftJoin(assignee, eq(assignee.id, tripPackingItems.assignedTo))
    .leftJoin(completer, eq(completer.id, tripPackingItems.completedBy))
    .where(inArray(tripPackingItems.listId, lists.map((list) => list.id)))
    .orderBy(asc(tripPackingItems.createdAt));

  const itemsByList = new Map<string, PackingItemView[]>();
  for (const row of rows) {
    const items = itemsByList.get(row.listId) ?? [];
    items.push(row);
    itemsByList.set(row.listId, items);
  }

  return lists.map((list) => {
    const items = sortPackingItems(itemsByList.get(list.id) ?? []);
    const progress = packingProgress(items);
    return {
      id: list.id,
      name: list.name,
      visibility: list.visibility,
      createdBy: list.createdBy,
      items,
      totalCount: progress.total,
      completedCount: progress.completed,
    };
  });
}
