import type { Request, Response } from "express";
import { getBearerToken, makeJWT } from "../auth.js";
import { config } from "../config.js";
import {
  getUserFromRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refresh-tokens.js";
import { UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";

/** Access token expiration in seconds (1 hour). */
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600;

/**
 * Response shape for POST /api/refresh.
 *
 * @property token - New JWT access token for the user.
 */
type RefreshResponse = { token: string };

/**
 * Handles POST /api/refresh: issues a new access token given a valid refresh token.
 *
 * Expects refresh token in Authorization: Bearer <refresh-token> header.
 * Returns 200 OK with a new access token if the refresh token is valid.
 * Returns 401 if the refresh token is missing, invalid, expired, or revoked.
 *
 * @param req - Express request (expects Authorization header with refresh token).
 * @param res - Express response.
 * @returns Promise that resolves when the response is sent.
 */
export async function handlerRefresh(
  req: Request,
  res: Response,
): Promise<void> {
  const refreshToken = getBearerToken(req);
  const user = await getUserFromRefreshToken(refreshToken);
  if (!user) {
    throw new UserNotAuthenticatedError("Invalid or expired refresh token");
  }

  const accessToken = makeJWT(
    user.id,
    ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    config.api.jwtSecret,
  );
  const payload: RefreshResponse = { token: accessToken };
  respondWithJSON(res, 200, payload);
}

/**
 * Handles POST /api/revoke: revokes a refresh token.
 *
 * Expects refresh token in Authorization: Bearer <refresh-token> header.
 * Sets revoked_at and updated_at on the matching token record.
 * Returns 204 No Content on success.
 *
 * @param req - Express request (expects Authorization header with refresh token).
 * @param res - Express response.
 * @returns Promise that resolves when the response is sent.
 */
export async function handlerRevoke(
  req: Request,
  res: Response,
): Promise<void> {
  const refreshToken = getBearerToken(req);
  await revokeRefreshToken(refreshToken);
  res.status(204).send();
}
