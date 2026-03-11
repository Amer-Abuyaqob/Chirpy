import type { Request, Response } from "express";
import { setPlainTextUtf8Header } from "./headers.js";

/**
 * Handles POST /api/validate_chirp: validates chirp payload and responds.
 *
 * @param req - Express request (expects JSON body).
 * @param res - Express response.
 * @returns void
 */
export function handlerValidateChirp(req: Request, res: Response): void {
  setPlainTextUtf8Header(res);
  // TODO: Parse and validate chirp from req.body, return appropriate response.
  res.status(200).send("OK");
}
