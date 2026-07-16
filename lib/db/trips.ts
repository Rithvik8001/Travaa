import { relations } from "drizzle-orm";
import {
  pgTable,
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

export const tripsRelations = relations(trips, ({ one, many }) => ({
  owner: one(user, {
    fields: [trips.ownerId],
    references: [user.id],
  }),
  members: many(tripMembers),
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

export type Trip = typeof trips.$inferSelect;
export type TripMember = typeof tripMembers.$inferSelect;
