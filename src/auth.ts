import * as argon2 from "argon2";

/**
 * Hashes a plain-text password using Argon2id.
 *
 * @param password - Plain-text password to hash
 * @returns Promise resolving to the argon2-encoded hash string
 * @throws {Error} When hashing fails (e.g. out of memory)
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

/**
 * Verifies a plain-text password against a stored argon2 hash.
 *
 * @param password - Plain-text password from the request
 * @param hash - Stored argon2 hash from the database
 * @returns Promise resolving to true if the password matches, false otherwise
 */
export async function checkPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}
