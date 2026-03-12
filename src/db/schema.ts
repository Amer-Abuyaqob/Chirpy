import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
 * Inferred type for inserting a new user row.
 * Use for type safety when calling insert() on the users table.
 *
 * @property id - Optional; UUID auto-generated if omitted.
 * @property createdAt - Optional; defaults to now if omitted.
 * @property updatedAt - Optional; defaults to now, auto-updates on row change.
 * @property email - Required; unique email address.
 */
export type NewUser = typeof users.$inferInsert;
