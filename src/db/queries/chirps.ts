import { asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

/**
 * Fetches a single chirp by its ID.
 *
 * @param id - Chirp UUID.
 * @returns The chirp row if found, otherwise undefined.
 */
export async function getChirpById(id: string) {
  const [row] = await db.select().from(chirps).where(eq(chirps.id, id)).limit(1);
  return row;
}

/**
 * Retrieves all chirps from the database in ascending order by createdAt.
 *
 * @returns Array of all chirp rows, oldest first.
 */
export async function getAllChirps() {
  return db.select().from(chirps).orderBy(asc(chirps.createdAt));
}

/**
 * Deletes all chirps from the database. Does not modify schema or tables.
 *
 * @returns Promise that resolves when deletion completes.
 */
export async function deleteAllChirps(): Promise<void> {
  await db.delete(chirps);
}

/**
 * Inserts a new chirp into the database.
 *
 * @param chirp - Chirp data to insert (body and userId required).
 * @returns The inserted chirp row.
 */
export async function createChirp(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();
  return result;
}
