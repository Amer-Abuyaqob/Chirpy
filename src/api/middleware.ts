import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

/**
 * Increments the file server hit counter for each request, then passes to next handler.
 *
 * @param req - Express request object (unused)
 * @param res - Express response object (unused)
 * @param next - Callback to pass control to the next middleware/handler
 * @returns void
 */
export function middlewareMetricsInc(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  config.fileserverHits += 1;
  next();
}
