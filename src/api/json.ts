import type { Request, Response } from "express";
import { setJsonUtf8Header } from "./headers.js";

/** Maximum allowed chirp length (in characters). */
const MAX_CHIRP_LENGTH = 140;

/**
 * Sends a JSON response with the proper Content-Type.
 *
 * @param res - Express response.
 * @param status - HTTP status code.
 * @param payload - Object to serialize as JSON.
 * @returns void
 */
function sendJson(res: Response, status: number, payload: object): void {
  setJsonUtf8Header(res);
  res.status(status).send(JSON.stringify(payload));
}

/**
 * Handles POST /api/validate_chirp: validates a chirp from the JSON body.
 *
 * @param req - Express request (expects JSON body with a "body" field).
 * @param res - Express response.
 * @returns void
 */
export function handlerValidateChirp(req: Request, res: Response): void {
  // Express JSON middleware has already parsed req.body
  const parsed = req.body as { body?: unknown } | undefined;

  // Ensure chirp body exists and is a string
  const chirpBody = parsed?.body;
  if (typeof chirpBody !== "string") {
    sendJson(res, 400, { error: "Something went wrong" });
    return;
  }

  // Enforce 140-character limit
  if (chirpBody.length > MAX_CHIRP_LENGTH) {
    sendJson(res, 400, { error: "Chirp is too long" });
    return;
  }

  // Chirp passes validation
  sendJson(res, 200, { valid: true });
}
