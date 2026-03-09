import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { setPlainTextUtf8Header } from "./headers.js";

/**
 * Resets the file server hit counter, then passes to next handler.
 *
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @param next - Callback to pass control to the next middleware/handler
 * @returns void
 */
export function handlerReset(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  config.fileserverHits = 0;
  setPlainTextUtf8Header(res);
  res.send("OK: File server hits been reset successfully");
}
