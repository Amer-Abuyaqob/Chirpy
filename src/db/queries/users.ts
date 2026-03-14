import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

/**
 * Fetches a user by email address.
 *
 * @param email - User email address
 * @returns The user row, or undefined if not found
 */
export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}

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
 * Upgrades a user to Chirpy Red membership by ID.
 *
 * @param id - User UUID
 * @returns The updated user row, or undefined if not found
 */
export async function upgradeUserToChirpyRed(id: string) {
  const [result] = await db
    .update(users)
    .set({ isChirpyRed: true })
    .where(eq(users.id, id))
    .returning();
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

/**
 * Updates a user's email and hashed password by ID.
 *
 * @param id - User UUID to update.
 * @param data - Object with email and hashedPassword.
 * @returns The updated user row, or undefined if user not found.
 */
export async function updateUserById(
  id: string,
  data: { email: string; hashedPassword: string },
) {
  const [result] = await db
    .update(users)
    .set({ email: data.email, hashedPassword: data.hashedPassword })
    .where(eq(users.id, id))
    .returning();
  return result;
}
