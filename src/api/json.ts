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
 * Handles POST /api/validate_chirp: accumulates body, parses JSON, validates chirp.
 *
 * @param req - Express request (expects JSON body with a "body" field).
 * @param res - Express response.
 * @returns void
 */
export function handlerValidateChirp(req: Request, res: Response): void {
  let body = "";

  // Append each chunk to the body buffer until stream finishes
  req.on("data", (chunk: Buffer | string) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    // Parse accumulated body as JSON; reject malformed input
    let parsed: { body?: unknown };
    try {
      parsed = JSON.parse(body) as { body?: unknown };
    } catch {
      sendJson(res, 400, { error: "Something went wrong" });
      return;
    }

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
  });
}
