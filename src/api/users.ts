import type { Request, Response } from "express";
import { checkPasswordHash, hashPassword } from "../auth.js";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import type { User } from "../db/schema.js";
import {
  BadRequestError,
  ConflictError,
  UserNotAuthenticatedError,
} from "./errors.js";
import { respondWithJSON } from "./json.js";

/**
 * API response shape for a created user.
 * Omits hashedPassword to avoid exposing it in responses.
 *
 * @property id - User UUID
 * @property email - User email address
 * @property createdAt - ISO 8601 timestamp
 * @property updatedAt - ISO 8601 timestamp
 */
type UserResponse = Omit<User, "hashedPassword" | "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

/**
 * Maps a database user row to the API response format.
 * Excludes hashedPassword for security.
 *
 * @param row - User row from the database
 * @returns User object formatted for API response (no hashed password)
 */
function toUserResponse(row: User): UserResponse {
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
 * Expects { email: string, password: string }. Hashes password before storing.
 * Returns 201 Created with user id, email, and timestamps (never returns hashed password).
 * Throws BadRequestError if email or password is missing or invalid.
 * Throws ConflictError if email already exists.
 *
 * @param req - Express request (expects JSON body with "email" and "password")
 * @param res - Express response
 * @returns void
 * @throws {BadRequestError} When email or password is missing or invalid
 * @throws {ConflictError} When email is already registered
 */
export async function handlerUsersCreate(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = req.body as
    | { email?: unknown; password?: unknown }
    | undefined;
  const email = parsed?.email;
  const password = parsed?.password;

  if (typeof email !== "string" || email.trim() === "") {
    throw new BadRequestError("Email is required");
  }
  if (typeof password !== "string" || password.trim() === "") {
    throw new BadRequestError("Password is required");
  }

  const hashedPassword = await hashPassword(password);
  const user = await createUser({
    email: email.trim(),
    hashedPassword,
  });
  if (!user) {
    throw new ConflictError("Email already in use");
  }

  const payload = toUserResponse(user as User);
  respondWithJSON(res, 201, payload);
}

const LOGIN_UNAUTHORIZED_MESSAGE = "incorrect email or password";

/**
 * Validates login body and returns normalized email and password.
 *
 * @param body - Raw request body (expects { email, password }).
 * @returns Object with trimmed email and password.
 * @throws {BadRequestError} When email or password is missing or invalid.
 */
function validateLoginBody(body: unknown): { email: string; password: string } {
  const parsed = body as { email?: unknown; password?: unknown } | undefined;
  const email = parsed?.email;
  const password = parsed?.password;

  if (typeof email !== "string" || email.trim() === "") {
    throw new BadRequestError("Email is required");
  }
  if (typeof password !== "string") {
    throw new BadRequestError("Password is required");
  }
  return { email: email.trim(), password };
}

/**
 * Authenticates a user by email and password.
 * Returns the user if credentials are valid.
 *
 * @param email - User email address.
 * @param password - Plain-text password.
 * @returns The authenticated user.
 * @throws {UserNotAuthenticatedError} When user not found or password does not match.
 */
async function authenticateUser(
  email: string,
  password: string,
): Promise<User> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new UserNotAuthenticatedError(LOGIN_UNAUTHORIZED_MESSAGE);
  }

  let passwordMatch: boolean;
  try {
    passwordMatch = await checkPasswordHash(password, user.hashedPassword);
  } catch {
    throw new UserNotAuthenticatedError(LOGIN_UNAUTHORIZED_MESSAGE);
  }
  if (!passwordMatch) {
    throw new UserNotAuthenticatedError(LOGIN_UNAUTHORIZED_MESSAGE);
  }
  return user as User;
}

/**
 * Handles POST /api/login: authenticates a user by email and password.
 *
 * Expects { email: string, password: string }. Returns 200 OK with user
 * resource (without hashedPassword) on success; 401 with "incorrect email or
 * password" on failure.
 *
 * @param req - Express request (expects JSON body with "email" and "password").
 * @param res - Express response.
 * @returns Promise that resolves when the response is sent.
 */
export async function handlerLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = validateLoginBody(req.body);
  const user = await authenticateUser(email, password);
  const payload = toUserResponse(user);
  respondWithJSON(res, 200, payload);
}
