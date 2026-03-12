import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

/**
 * Fetches a user by UUID.
 *
 * @param id - User UUID
 * @returns The user row, or undefined if not found
 */
export async function getUserById(id: string) {
  const [result] = await db.select().from(users).where(eq(users.id, id));
  return result;
}

/**
 * Deletes all users from the database. Does not modify schema or tables.
 *
 * @returns Promise that resolves when deletion completes.
 */
export async function deleteAllUsers(): Promise<void> {
  await db.delete(users);
}

/**
 * Inserts a new user into the database. Skips insert on email conflict.
 *
 * @param user - User data to insert (email required; id, createdAt, updatedAt optional).
 * @returns The inserted user row, or undefined if email already exists.
 */
export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}
