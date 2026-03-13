import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens, users, type User } from "../schema.js";

/**
 * Inserts a new refresh token for a user.
 *
 * @param token - Refresh token row to insert.
 * @returns Promise that resolves when insert completes.
 */
export async function createRefreshToken(
  token: NewRefreshToken,
): Promise<void> {
  await db.insert(refreshTokens).values(token);
}

/**
 * Fetches the user associated with a valid (non-expired, non-revoked) refresh token.
 *
 * @param token - The refresh token string.
 * @returns The user if the token exists and is valid; undefined otherwise.
 */
export async function getUserFromRefreshToken(
  token: string,
): Promise<User | undefined> {
  const now = new Date();
  const rows = await db
    .select({
      id: users.id,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      email: users.email,
      hashedPassword: users.hashedPassword,
    })
    .from(refreshTokens)
    .innerJoin(users, eq(refreshTokens.userId, users.id))
    .where(
      and(
        eq(refreshTokens.token, token),
        gt(refreshTokens.expiresAt, now),
        isNull(refreshTokens.revokedAt),
      ),
    );
  return rows[0] as User | undefined;
}

/**
 * Revokes a refresh token by setting revoked_at and updating updated_at.
 *
 * @param token - The refresh token string to revoke.
 * @returns Promise that resolves when the update completes.
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  const now = new Date();
  await db
    .update(refreshTokens)
    .set({ revokedAt: now, updatedAt: now })
    .where(eq(refreshTokens.token, token));
}
