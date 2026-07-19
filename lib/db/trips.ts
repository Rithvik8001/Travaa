import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  date,
  integer,
  timestamp,
  index,
  check,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { user } from "./schema";

/**
 * App schema — hand-authored, kept OUT of schema.ts because `auth:generate`
 * overwrites that file wholesale. drizzle.config.ts and lib/db/index.ts pull in
 * both modules. Mirror the generated style: text PKs, timestamp defaults, a
 * userId FK index.
 *
 * archivedAt: null = active, a timestamp = archived (soft-hidden). Deferred until
 * their features land: coverImageUrl (Cloudinary), a status column (status is derived).
 *
 * datesLockedAt: null = the date poll is still open. A timestamp means the organizer
 * committed a window — startDate/endDate then mirror the winning date option.
 */
export const trips = pgTable(
  "trips",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    destination: text("destination"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    /** Shareable join code (unique); null until an organizer generates one. */
    inviteCode: text("invite_code").unique(),
    archivedAt: timestamp("archived_at"),
    datesLockedAt: timestamp("dates_locked_at"),
    currency: text("currency").default("USD").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("trips_ownerId_idx").on(table.ownerId),
    check("trips_currency_check", sql`${table.currency} in ('USD','CAD','EUR','GBP','AUD','NZD','JPY','INR','CHF')`),
  ],
);

/**
 * Trip membership — the crew. One row per (trip, user); the owner gets a row too.
 * Role isn't stored: it's derived (userId === trip.ownerId → organizer, else member),
 * so there's no column to keep in sync. Add one only if co-organizer ever lands.
 */
export const tripMembers = pgTable(
  "trip_members",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("trip_members_trip_user_idx").on(table.tripId, table.userId),
    index("trip_members_userId_idx").on(table.userId),
    index("trip_members_tripId_idx").on(table.tripId),
  ],
);

/** A member's stance on a proposed window — mirrors the landing's Availability. */
export const availability = pgEnum("availability", ["yes", "maybe", "no"]);
export const packingVisibility = pgEnum("packing_visibility", [
  "shared",
  "private",
]);
export const notificationType = pgEnum("notification_type", [
  "member_joined",
  "dates_locked",
  "idea_commented",
  "comment_replied",
  "idea_converted",
]);

/**
 * Date poll — the candidate windows a crew is choosing between. Anyone in the
 * trip can propose one; the window is unique per trip so the same span can't be
 * added twice. Cascades away with the trip.
 */
export const tripDateOptions = pgTable(
  "trip_date_options",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("trip_date_options_window_idx").on(
      table.tripId,
      table.startDate,
      table.endDate,
    ),
    index("trip_date_options_tripId_idx").on(table.tripId),
  ],
);

/**
 * One row per (option, member) — a member's yes/maybe/no on a window. Upserted
 * on the unique index, so re-voting overwrites rather than stacks. Cascades away
 * with either the option or the user.
 */
export const tripDateVotes = pgTable(
  "trip_date_votes",
  {
    id: text("id").primaryKey(),
    optionId: text("option_id")
      .notNull()
      .references(() => tripDateOptions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    value: availability("value").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("trip_date_votes_option_user_idx").on(
      table.optionId,
      table.userId,
    ),
    index("trip_date_votes_optionId_idx").on(table.optionId),
  ],
);

/**
 * Ideas board — the loose suggestions a crew tosses around (places, stays, links)
 * before anything's decided. Anyone in the trip can add one. Ordered by upvotes at
 * read time; cascades away with the trip. Deferred: comments, "convert to itinerary".
 */
export const tripSuggestions = pgTable(
  "trip_suggestions",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    note: text("note"),
    /** Optional link (a listing, map pin, article). Null when it's just a note. */
    url: text("url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("trip_suggestions_tripId_idx").on(table.tripId)],
);

/**
 * One row per (suggestion, member) — a simple upvote. Toggled on the client, so a
 * repeat vote removes the row. Cascades away with the suggestion or the user.
 */
export const tripSuggestionVotes = pgTable(
  "trip_suggestion_votes",
  {
    id: text("id").primaryKey(),
    suggestionId: text("suggestion_id")
      .notNull()
      .references(() => tripSuggestions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("trip_suggestion_votes_suggestion_user_idx").on(
      table.suggestionId,
      table.userId,
    ),
    index("trip_suggestion_votes_suggestionId_idx").on(table.suggestionId),
  ],
);

/**
 * Comments on an idea — one shallow thread. A top-level comment has `parentId`
 * null; a reply points at a top-level comment (single-level only, enforced in the
 * action). Cascades away with the suggestion, the parent comment, or the user.
 */
export const tripSuggestionComments = pgTable(
  "trip_suggestion_comments",
  {
    id: text("id").primaryKey(),
    suggestionId: text("suggestion_id")
      .notNull()
      .references(() => tripSuggestions.id, { onDelete: "cascade" }),
    /** Null for a top-level comment; a top-level comment's id for a reply. */
    parentId: text("parent_id").references(
      (): AnyPgColumn => tripSuggestionComments.id,
      { onDelete: "cascade" },
    ),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("trip_suggestion_comments_suggestionId_idx").on(table.suggestionId),
    index("trip_suggestion_comments_parentId_idx").on(table.parentId),
  ],
);

/**
 * The committed plan — items promoted from ideas or added directly by members.
 * `sourceSuggestionId` links back to the idea it came from and is
 * unique so an idea converts at most once; it's set null (not cascaded) if the
 * idea is later removed, so the plan survives. `date` groups the day-by-day
 * view; `sortOrder` is the position within that date (or Unscheduled) group.
 * Cascades away with the trip.
 */
export const tripItineraryItems = pgTable(
  "trip_itinerary_items",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    note: text("note"),
    url: text("url"),
    /** Optional day within the trip window; null until scheduled. */
    date: date("date"),
    sortOrder: integer("sort_order").default(0).notNull(),
    sourceSuggestionId: text("source_suggestion_id")
      .unique()
      .references(() => tripSuggestions.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("trip_itinerary_items_tripId_idx").on(table.tripId)],
);

/** Named packing lists. Private lists are visible only to their creator. */
export const tripPackingLists = pgTable(
  "trip_packing_lists",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    visibility: packingVisibility("visibility").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("trip_packing_lists_tripId_idx").on(table.tripId),
    index("trip_packing_lists_private_owner_idx").on(
      table.tripId,
      table.createdBy,
      table.visibility,
    ),
  ],
);

/** Checklist rows. Assignment is available only on shared lists. */
export const tripPackingItems = pgTable(
  "trip_packing_items",
  {
    id: text("id").primaryKey(),
    listId: text("list_id")
      .notNull()
      .references(() => tripPackingLists.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    assignedTo: text("assigned_to").references(() => user.id, {
      onDelete: "set null",
    }),
    completedAt: timestamp("completed_at"),
    completedBy: text("completed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("trip_packing_items_listId_idx").on(table.listId),
    index("trip_packing_items_assignedTo_idx").on(table.assignedTo),
    check(
      "trip_packing_items_quantity_check",
      sql`${table.quantity} between 1 and 999`,
    ),
  ],
);

/** Recipient-specific, durable high-signal trip updates. */
export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    type: notificationType("type").notNull(),
    entityId: text("entity_id"),
    eventKey: text("event_key").notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("notifications_recipient_event_idx").on(
      table.recipientId,
      table.eventKey,
    ),
    index("notifications_recipient_created_idx").on(
      table.recipientId,
      table.createdAt,
    ),
    index("notifications_recipient_read_idx").on(
      table.recipientId,
      table.readAt,
    ),
    index("notifications_trip_recipient_idx").on(
      table.tripId,
      table.recipientId,
    ),
  ],
);

export const tripExpenses = pgTable(
  "trip_expenses",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    paidBy: text("paid_by").notNull().references(() => user.id, { onDelete: "restrict" }),
    description: text("description").notNull(),
    amountMinor: integer("amount_minor").notNull(),
    incurredOn: date("incurred_on").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("trip_expenses_trip_date_idx").on(table.tripId, table.incurredOn),
    index("trip_expenses_paidBy_idx").on(table.paidBy),
    index("trip_expenses_createdBy_idx").on(table.createdBy),
    check("trip_expenses_amount_check", sql`${table.amountMinor} between 1 and 2000000000`),
  ],
);

export const tripExpenseSplits = pgTable(
  "trip_expense_splits",
  {
    id: text("id").primaryKey(),
    expenseId: text("expense_id").notNull().references(() => tripExpenses.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
    amountMinor: integer("amount_minor").notNull(),
  },
  (table) => [
    uniqueIndex("trip_expense_splits_expense_user_idx").on(table.expenseId, table.userId),
    index("trip_expense_splits_userId_idx").on(table.userId),
    check("trip_expense_splits_amount_check", sql`${table.amountMinor} between 1 and 2000000000`),
  ],
);

export const tripExpenseSettlements = pgTable(
  "trip_expense_settlements",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    fromUserId: text("from_user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
    toUserId: text("to_user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
    amountMinor: integer("amount_minor").notNull(),
    paidOn: date("paid_on").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("trip_expense_settlements_trip_date_idx").on(table.tripId, table.paidOn),
    index("trip_expense_settlements_from_idx").on(table.fromUserId),
    index("trip_expense_settlements_to_idx").on(table.toUserId),
    index("trip_expense_settlements_createdBy_idx").on(table.createdBy),
    check("trip_expense_settlements_amount_check", sql`${table.amountMinor} between 1 and 2000000000`),
    check("trip_expense_settlements_people_check", sql`${table.fromUserId} <> ${table.toUserId}`),
  ],
);

export const tripsRelations = relations(trips, ({ one, many }) => ({
  owner: one(user, {
    fields: [trips.ownerId],
    references: [user.id],
  }),
  members: many(tripMembers),
  dateOptions: many(tripDateOptions),
  suggestions: many(tripSuggestions),
  itineraryItems: many(tripItineraryItems),
  packingLists: many(tripPackingLists),
  notifications: many(notifications),
  expenses: many(tripExpenses),
  settlements: many(tripExpenseSettlements),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  trip: one(trips, {
    fields: [notifications.tripId],
    references: [trips.id],
  }),
  recipient: one(user, {
    fields: [notifications.recipientId],
    references: [user.id],
    relationName: "notificationRecipient",
  }),
  actor: one(user, {
    fields: [notifications.actorId],
    references: [user.id],
    relationName: "notificationActor",
  }),
}));

export const tripPackingListsRelations = relations(
  tripPackingLists,
  ({ one, many }) => ({
    trip: one(trips, {
      fields: [tripPackingLists.tripId],
      references: [trips.id],
    }),
    creator: one(user, {
      fields: [tripPackingLists.createdBy],
      references: [user.id],
    }),
    items: many(tripPackingItems),
  }),
);

export const tripPackingItemsRelations = relations(
  tripPackingItems,
  ({ one }) => ({
    list: one(tripPackingLists, {
      fields: [tripPackingItems.listId],
      references: [tripPackingLists.id],
    }),
    creator: one(user, {
      fields: [tripPackingItems.createdBy],
      references: [user.id],
      relationName: "packingItemCreator",
    }),
    assignee: one(user, {
      fields: [tripPackingItems.assignedTo],
      references: [user.id],
      relationName: "packingItemAssignee",
    }),
    completer: one(user, {
      fields: [tripPackingItems.completedBy],
      references: [user.id],
      relationName: "packingItemCompleter",
    }),
  }),
);

export const tripMembersRelations = relations(tripMembers, ({ one }) => ({
  trip: one(trips, {
    fields: [tripMembers.tripId],
    references: [trips.id],
  }),
  user: one(user, {
    fields: [tripMembers.userId],
    references: [user.id],
  }),
}));

export const tripDateOptionsRelations = relations(
  tripDateOptions,
  ({ one, many }) => ({
    trip: one(trips, {
      fields: [tripDateOptions.tripId],
      references: [trips.id],
    }),
    creator: one(user, {
      fields: [tripDateOptions.createdBy],
      references: [user.id],
    }),
    votes: many(tripDateVotes),
  }),
);

export const tripDateVotesRelations = relations(tripDateVotes, ({ one }) => ({
  option: one(tripDateOptions, {
    fields: [tripDateVotes.optionId],
    references: [tripDateOptions.id],
  }),
  user: one(user, {
    fields: [tripDateVotes.userId],
    references: [user.id],
  }),
}));

export const tripSuggestionsRelations = relations(
  tripSuggestions,
  ({ one, many }) => ({
    trip: one(trips, {
      fields: [tripSuggestions.tripId],
      references: [trips.id],
    }),
    creator: one(user, {
      fields: [tripSuggestions.createdBy],
      references: [user.id],
    }),
    votes: many(tripSuggestionVotes),
    comments: many(tripSuggestionComments),
  }),
);

export const tripSuggestionCommentsRelations = relations(
  tripSuggestionComments,
  ({ one, many }) => ({
    suggestion: one(tripSuggestions, {
      fields: [tripSuggestionComments.suggestionId],
      references: [tripSuggestions.id],
    }),
    parent: one(tripSuggestionComments, {
      fields: [tripSuggestionComments.parentId],
      references: [tripSuggestionComments.id],
      relationName: "commentReplies",
    }),
    replies: many(tripSuggestionComments, { relationName: "commentReplies" }),
    user: one(user, {
      fields: [tripSuggestionComments.userId],
      references: [user.id],
    }),
  }),
);

export const tripItineraryItemsRelations = relations(
  tripItineraryItems,
  ({ one }) => ({
    trip: one(trips, {
      fields: [tripItineraryItems.tripId],
      references: [trips.id],
    }),
    creator: one(user, {
      fields: [tripItineraryItems.createdBy],
      references: [user.id],
    }),
    source: one(tripSuggestions, {
      fields: [tripItineraryItems.sourceSuggestionId],
      references: [tripSuggestions.id],
    }),
  }),
);

export const tripSuggestionVotesRelations = relations(
  tripSuggestionVotes,
  ({ one }) => ({
    suggestion: one(tripSuggestions, {
      fields: [tripSuggestionVotes.suggestionId],
      references: [tripSuggestions.id],
    }),
    user: one(user, {
      fields: [tripSuggestionVotes.userId],
      references: [user.id],
    }),
  }),
);

export type Trip = typeof trips.$inferSelect;
export type TripMember = typeof tripMembers.$inferSelect;
export type TripDateOption = typeof tripDateOptions.$inferSelect;
export type TripDateVote = typeof tripDateVotes.$inferSelect;
export type TripSuggestion = typeof tripSuggestions.$inferSelect;
export type TripSuggestionVote = typeof tripSuggestionVotes.$inferSelect;
export type TripSuggestionComment = typeof tripSuggestionComments.$inferSelect;
export type TripItineraryItem = typeof tripItineraryItems.$inferSelect;
export type TripPackingList = typeof tripPackingLists.$inferSelect;
export type TripPackingItem = typeof tripPackingItems.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type NotificationType = (typeof notificationType.enumValues)[number];
export type TripExpense = typeof tripExpenses.$inferSelect;
export type TripExpenseSplit = typeof tripExpenseSplits.$inferSelect;
export type TripExpenseSettlement = typeof tripExpenseSettlements.$inferSelect;
