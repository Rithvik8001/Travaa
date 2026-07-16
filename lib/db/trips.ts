import { relations } from "drizzle-orm";
import { pgTable, text, date, timestamp, index } from "drizzle-orm/pg-core";
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
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("trips_ownerId_idx").on(table.ownerId)],
);

export const tripsRelations = relations(trips, ({ one }) => ({
  owner: one(user, {
    fields: [trips.ownerId],
    references: [user.id],
  }),
}));

export type Trip = typeof trips.$inferSelect;
