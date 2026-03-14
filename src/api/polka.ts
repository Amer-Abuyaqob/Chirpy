import type { Request, Response } from "express";
import { upgradeUserToChirpyRed } from "../db/queries/users.js";
import { config } from "../config.js";
import { getAPIKey } from "../auth.js";
import { BadRequestError, NotFoundError } from "./errors.js";

/** Polka webhook event for user upgrade. */
const EVENT_USER_UPGRADED = "user.upgraded";

/**
 * Request body shape for Polka webhooks.
 *
 * @property event - Event type (e.g. "user.upgraded").
 * @property data - Event payload; for user.upgraded, contains userId.
 */
type PolkaWebhookBody = {
  event?: unknown;
  data?: { userId?: unknown };
};

/**
 * Extracts and validates userId from a user.upgraded webhook body.
 *
 * @param body - Raw request body (must have event user.upgraded and data.userId).
 * @returns Valid userId string.
 * @throws {BadRequestError} When data.userId is missing or invalid.
 */
function parseUserIdFromUpgradedBody(body: PolkaWebhookBody): string {
  const userId = body?.data?.userId;
  if (typeof userId !== "string" || userId.trim() === "") {
    throw new BadRequestError(
      "data.userId is required and must be a non-empty string",
    );
  }
  return userId.trim();
}

/**
 * Handles POST /api/polka/webhooks: processes Polka payment webhooks.
 *
 * For "user.upgraded" events, upgrades the user to Chirpy Red.
 * Other events are acknowledged with 204 and ignored.
 * Returns 204 on success; 404 if the user cannot be found.
 *
 * @param req - Express request (expects JSON body with event and optional data).
 * @param res - Express response.
 * @returns Promise that resolves when the response is sent.
 * @throws {NotFoundError} When the user does not exist.
 */
export async function handlerPolkaWebhooks(
  req: Request,
  res: Response,
): Promise<void> {
  const apiKey = getAPIKey(req);
  if (!apiKey || apiKey !== config.api.polkaKey) {
    res.status(401).send();
    return;
  }

  const body = req.body as PolkaWebhookBody | undefined;
  const event = body?.event;

  if (event !== EVENT_USER_UPGRADED) {
    res.status(204).send();
    return;
  }

  const userId = parseUserIdFromUpgradedBody(body ?? {});
  const user = await upgradeUserToChirpyRed(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(204).send();
}
