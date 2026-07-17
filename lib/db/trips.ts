import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  date,
  timestamp,
  index,
  uniqueIndex,
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("trips_ownerId_idx").on(table.ownerId)],
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

export const tripsRelations = relations(trips, ({ one, many }) => ({
  owner: one(user, {
    fields: [trips.ownerId],
    references: [user.id],
  }),
  members: many(tripMembers),
  dateOptions: many(tripDateOptions),
  suggestions: many(tripSuggestions),
}));

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
