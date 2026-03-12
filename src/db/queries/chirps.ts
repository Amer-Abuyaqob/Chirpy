import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

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
