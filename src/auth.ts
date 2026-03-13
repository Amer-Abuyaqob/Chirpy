import * as argon2 from "argon2";
import type { Request } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import { UserNotAuthenticatedError } from "./api/errors.js";

/**
 * Extracts the Bearer token from the Authorization header.
 *
 * @param req - Express request (expects "Authorization: Bearer TOKEN_STRING").
 * @returns The token string (without the "Bearer " prefix).
 * @throws {UserNotAuthenticatedError} When the Authorization header is missing or malformed.
 */
export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");
  if (!authHeader || typeof authHeader !== "string") {
    throw new UserNotAuthenticatedError("Authorization header is required");
  }
  const trimmed = authHeader.trim();
  const prefix = "Bearer ";
  if (!trimmed.toLowerCase().startsWith("bearer ")) {
    throw new UserNotAuthenticatedError(
      "Authorization header must be Bearer token",
    );
  }
  const token = trimmed.slice(prefix.length).trim();
  if (!token) {
    throw new UserNotAuthenticatedError("Authorization token is empty");
  }
  return token;
}

/**
 * JWT issuer identifier for Chirpy tokens.
 */
const JWT_ISSUER = "chirpy";

/**
 * Payload shape for Chirpy JWT tokens.
 *
 * @property iss - Issuer of the token.
 * @property sub - Subject (user ID).
 * @property iat - Issued-at time (seconds since epoch).
 * @property exp - Expiration time (seconds since epoch).
 */
type JwtPayloadShape = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

/**
 * Creates a signed JWT for the given user.
 *
 * @param userID - The user's unique identifier (stored in sub).
 * @param expiresIn - Seconds until the token expires.
 * @param secret - Signing secret.
 * @returns The signed JWT string.
 */
export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string,
): string {
  const iat = Math.floor(Date.now() / 1000);
  const payload: JwtPayloadShape = {
    iss: JWT_ISSUER,
    sub: userID,
    iat,
    exp: iat + expiresIn,
  };
  return jwt.sign(payload, secret);
}

/**
 * Validates a JWT and returns the user ID from its subject (sub).
 *
 * @param tokenString - The raw JWT string.
 * @param secret - Signing secret used to verify the token.
 * @returns The user ID (sub claim) if the token is valid.
 * @throws {UserNotAuthenticatedError} When the token is invalid or expired.
 */
export function validateJWT(tokenString: string, secret: string): string {
  try {
    const decoded = jwt.verify(tokenString, secret) as JwtPayloadShape;
    const sub = decoded.sub;
    if (typeof sub !== "string" || !sub) {
      throw new UserNotAuthenticatedError("Invalid token: missing user ID");
    }
    return sub;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid or expired token";
    throw new UserNotAuthenticatedError(message);
  }
}

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
