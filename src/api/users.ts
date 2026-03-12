import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { BadRequestError, ConflictError } from "./errors.js";
import { respondWithJSON } from "./json.js";

/**
 * User row returned from the database (with Date objects for timestamps).
 */
type UserRow = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * API response shape for a created user.
 *
 * @property id - User UUID
 * @property email - User email address
 * @property createdAt - ISO 8601 timestamp
 * @property updatedAt - ISO 8601 timestamp
 */
type UserResponse = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Maps a database user row to the API response format.
 *
 * @param row - User row from the database
 * @returns User object formatted for API response
 */
function toUserResponse(row: UserRow): UserResponse {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Handles POST /api/users: creates a user from the JSON body.
 *
 * Expects { email: string }. Returns 201 Created with user id, email, and timestamps.
 * Throws BadRequestError if email is missing or invalid.
 * Throws ConflictError if email already exists.
 *
 * @param req - Express request (expects JSON body with an "email" field)
 * @param res - Express response
 * @returns void
 * @throws {BadRequestError} When email is missing or not a valid non-empty string
 * @throws {ConflictError} When email is already registered
 */
export async function handlerUsersCreate(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = req.body as { email?: unknown } | undefined;
  const email = parsed?.email;

  if (typeof email !== "string" || email.trim() === "") {
    throw new BadRequestError("Email is required");
  }

  const user = await createUser({ email: email.trim() });
  if (!user) {
    throw new ConflictError("Email already in use");
  }

  const payload = toUserResponse(user as UserRow);
  respondWithJSON(res, 201, payload);
}
