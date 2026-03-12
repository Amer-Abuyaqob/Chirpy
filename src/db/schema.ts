import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
});

/**
 * Chirps table: short messages posted by users.
 * Chirps are deleted when the owning user is deleted (ON DELETE CASCADE).
 *
 * @property id - UUID; auto-generated if omitted.
 * @property createdAt - Timestamp; defaults to now if omitted.
 * @property updatedAt - Timestamp; defaults to now, auto-updates on row change.
 * @property body - Chirp content; required.
 * @property userId - Reference to the user who created the chirp.
 */
export const chirps = pgTable("chirps", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  body: text("body").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

/**
 * Inferred type for inserting a new user row.
 * Use for type safety when calling insert() on the users table.
 *
 * @property id - Optional; UUID auto-generated if omitted.
 * @property createdAt - Optional; defaults to now if omitted.
 * @property updatedAt - Optional; defaults to now, auto-updates on row change.
 * @property email - Required; unique email address.
 */
export type NewUser = typeof users.$inferInsert;

/**
 * Inferred type for inserting a new chirp row.
 * Use for type safety when calling insert() on the chirps table.
 *
 * @property id - Optional; UUID auto-generated if omitted.
 * @property createdAt - Optional; defaults to now if omitted.
 * @property updatedAt - Optional; defaults to now, auto-updates on row change.
 * @property body - Required; chirp content.
 * @property userId - Required; ID of the user who created the chirp.
 */
export type NewChirp = typeof chirps.$inferInsert;
