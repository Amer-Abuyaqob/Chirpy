import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

/**
 * Resets the file server hit counter, then passes to next handler.
 *
 * @param _req - Express request object (unused)
 * @param _res - Express response object (unused)
 * @param next - Callback to pass control to the next middleware/handler
 * @returns void
 */
export function middlewareMetricsInc(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  config.fileserverHits = 0;
  next();
}
