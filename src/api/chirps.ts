import type { Request, Response } from "express";
import { createChirp } from "../db/queries/chirps.js";
import { getUserById } from "../db/queries/users.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { respondWithJSON } from "./json.js";

/** Maximum allowed chirp length (in characters). */
const MAX_CHIRP_LENGTH = 140;

/** List of profane words that must be masked in chirps. */
const PROFANE_WORDS = ["kerfuffle", "sharbert", "fornax"];

/**
 * Replaces any profane words in a chirp with asterisks.
 *
 * @param chirpBody - Original chirp body text.
 * @returns Cleaned chirp body with profane words replaced by "****".
 */
function cleanProfanity(chirpBody: string): string {
  return chirpBody
    .split(" ")
    .map((word) => {
      const lowerWord = word.toLowerCase();
      if (PROFANE_WORDS.includes(lowerWord)) {
        return "****";
      }
      return word;
    })
    .join(" ");
}

/**
 * Validates chirp body and returns a cleaned version.
 *
 * @param body - Raw chirp body from request.
 * @returns Cleaned chirp body (profanity masked).
 * @throws {BadRequestError} When body is missing, not a string, or exceeds max length.
 */
function validateAndCleanChirpBody(body: unknown): string {
  if (typeof body !== "string") {
    throw new BadRequestError("Body is required and must be a string");
  }
  if (body.length > MAX_CHIRP_LENGTH) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }
  return cleanProfanity(body);
}

/**
 * Validates userId from the request and ensures it's a non-empty string.
 *
 * @param userId - Raw userId from request.
 * @returns Trimmed userId.
 * @throws {BadRequestError} When userId is missing or not a valid string.
 */
function validateUserId(userId: unknown): string {
  if (typeof userId !== "string" || userId.trim() === "") {
    throw new BadRequestError(
      "UserId is required and must be a non-empty string",
    );
  }
  return userId.trim();
}

/**
 * Maps a chirp row to the API response format.
 *
 * @param row - Chirp row from the database.
 * @returns Chirp object formatted for API response.
 */
function toChirpResponse(row: {
  id: string;
  body: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    body: row.body,
    userId: row.userId,
  };
}

/**
 * Handles POST /api/chirps: creates a chirp from the JSON body.
 *
 * Expects { body: string, userId: string }. Validates body (max 140 chars,
 * profanity cleaned), verifies user exists, then inserts chirp.
 * Returns 201 Created with the created chirp.
 *
 * @param req - Express request (expects JSON body with body and userId).
 * @param res - Express response.
 * @returns Promise that resolves when the response is sent.
 * @throws {BadRequestError} When body or userId are missing/invalid.
 * @throws {NotFoundError} When the user does not exist.
 */
export async function handlerChirpsCreate(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = req.body as { body?: unknown; userId?: unknown } | undefined;

  const body = validateAndCleanChirpBody(parsed?.body);
  const userId = validateUserId(parsed?.userId);

  const user = await getUserById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const chirp = await createChirp({ body, userId });
  const payload = toChirpResponse(chirp);
  respondWithJSON(res, 201, payload);
}
