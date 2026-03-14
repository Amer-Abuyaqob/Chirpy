import type { Request, Response } from "express";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
import {
  createChirp,
  deleteChirpById,
  getChirpById,
  getAllChirps,
} from "../db/queries/chirps.js";
import { getUserById } from "../db/queries/users.js";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
} from "./errors.js";
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

/** Valid sort directions for chirps list. */
type SortDirection = "asc" | "desc";

/**
 * Parses the optional sort query parameter for GET /api/chirps.
 * Accepts "asc" or "desc"; defaults to "asc" when missing or invalid.
 *
 * @param value - Raw value from req.query.sort.
 * @returns Sort direction ("asc" | "desc").
 */
function parseSortParam(value: unknown): SortDirection {
  const raw =
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value[0]
        : undefined;
  const trimmed = (typeof raw === "string" ? raw : String(raw ?? ""))
    .trim()
    .toLowerCase();
  if (trimmed === "desc") return "desc";
  return "asc";
}

/**
 * Parses the optional authorId query parameter for GET /api/chirps.
 * Returns undefined when not provided or empty; otherwise returns trimmed string.
 *
 * @param value - Raw value from req.query.authorId.
 * @returns Trimmed authorId string, or undefined if not provided/empty.
 * @throws {BadRequestError} When value is present but not a valid non-empty string.
 */
function parseOptionalAuthorId(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const raw =
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value[0]
        : undefined;
  if (raw === undefined) return undefined;
  const trimmed = (typeof raw === "string" ? raw : String(raw)).trim();
  if (trimmed === "") return undefined;
  return trimmed;
}

/**
 * Validates an ID value (e.g. userId, chirpId) and ensures it's a non-empty string.
 * Handles Express params that may be string or string[].
 *
 * @param id - Raw ID from request (body, params, etc).
 * @param label - Human-readable label for error messages (e.g. "UserId", "Chirp ID").
 * @returns Trimmed non-empty ID string.
 * @throws {BadRequestError} When id is missing or not a valid non-empty string.
 */
function validateId(id: unknown, label: string): string {
  const raw =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : undefined;
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new BadRequestError(
      `${label} is required and must be a non-empty string`,
    );
  }
  return raw.trim();
}

/**
 * Sorts chirps in-place by createdAt in the given direction.
 * ISO strings sort correctly for date comparison.
 *
 * @param chirps - Array of chirp response objects.
 * @param direction - "asc" for oldest first, "desc" for newest first.
 */
function sortChirpsByCreatedAt<T extends { createdAt: string }>(
  chirps: T[],
  direction: SortDirection,
): void {
  chirps.sort((a, b) => {
    const cmp = a.createdAt.localeCompare(b.createdAt);
    return direction === "asc" ? cmp : -cmp;
  });
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
 * Requires a valid JWT in the Authorization header. The user ID is extracted
 * from the JWT. Expects { body: string }. Validates body (max 140 chars,
 * profanity cleaned), verifies user exists, then inserts chirp.
 * Returns 201 Created with the created chirp.
 *
 * @param req - Express request (expects JSON body with body, Authorization: Bearer TOKEN).
 * @param res - Express response.
 * @returns Promise that resolves when the response is sent.
 * @throws {UserNotAuthenticatedError} When JWT is missing or invalid.
 * @throws {BadRequestError} When body is missing/invalid.
 * @throws {NotFoundError} When the user does not exist.
 */
export async function handlerChirpsCreate(
  req: Request,
  res: Response,
): Promise<void> {
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.api.jwtSecret);

  const parsed = req.body as { body?: unknown } | undefined;
  const body = validateAndCleanChirpBody(parsed?.body);

  const user = await getUserById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const chirp = await createChirp({ body, userId });
  const payload = toChirpResponse(chirp);
  respondWithJSON(res, 201, payload);
}

/**
 * Handles GET /api/chirps/:chirpId: returns a single chirp by ID.
 *
 * @param req - Express request (chirpId from path params).
 * @param res - Express response.
 * @returns Promise that resolves when the response is sent.
 * @throws {NotFoundError} When the chirp does not exist.
 */
export async function handlerChirpsGet(
  req: Request,
  res: Response,
): Promise<void> {
  const chirpId = validateId(req.params.chirpId, "Chirp ID");
  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  const payload = toChirpResponse(chirp);
  respondWithJSON(res, 200, payload);
}

/**
 * Handles DELETE /api/chirps/:chirpId: deletes a chirp by ID.
 *
 * Requires a valid JWT in the Authorization header. Only the chirp author may
 * delete. Returns 404 if chirp not found, 403 if the user is not the author.
 *
 * @param req - Express request (chirpId from path params, Authorization: Bearer TOKEN).
 * @param res - Express response.
 * @returns Promise that resolves when the response is sent.
 * @throws {UserNotAuthenticatedError} When JWT is missing or invalid.
 * @throws {NotFoundError} When the chirp does not exist.
 * @throws {UserForbiddenError} When the user is not the author of the chirp.
 */
export async function handlerChirpsDelete(
  req: Request,
  res: Response,
): Promise<void> {
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.api.jwtSecret);

  const chirpId = validateId(req.params.chirpId, "Chirp ID");
  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }
  if (chirp.userId !== userId) {
    throw new UserForbiddenError("You may only delete your own chirps");
  }

  await deleteChirpById(chirpId);
  res.status(204).send();
}

/**
 * Handles GET /api/chirps: returns chirps sorted by createdAt.
 * Accepts optional query params: authorId (filter by author), sort (asc|desc, default asc).
 *
 * @param req - Express request (optional authorId, sort in query).
 * @param res - Express response.
 * @returns Promise that resolves when the response is sent.
 */
export async function handlerChirpsList(
  req: Request,
  res: Response,
): Promise<void> {
  const authorId = parseOptionalAuthorId(req.query.authorId);
  const sort = parseSortParam(req.query.sort);
  const rows = await getAllChirps(authorId);
  const payload = rows.map(toChirpResponse);
  sortChirpsByCreatedAt(payload, sort);
  respondWithJSON(res, 200, payload);
}
