import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
  hashedPassword: varchar("hashed_password", { length: 512 })
    .notNull()
    .default("unset"),
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
 * Inferred type for a selected user row from the database.
 * Use for type safety when reading users (e.g. createUser return value).
*
* @property id - User UUID
* @property createdAt - Creation timestamp
* @property updatedAt - Last update timestamp
* @property email - User email
* @property hashedPassword - Argon2 hash (never expose in API responses)
*/
export type User = typeof users.$inferSelect;

/**
 * Inferred type for inserting a new user row.
 * Use for type safety when calling insert() on the users table.
 *
 * @property id - Optional; UUID auto-generated if omitted.
 * @property createdAt - Optional; defaults to now if omitted.
 * @property updatedAt - Optional; defaults to now, auto-updates on row change.
 * @property email - Required; unique email address.
 * @property hashedPassword - Optional; defaults to "unset" for existing users.
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
