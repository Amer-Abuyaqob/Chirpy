import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

/**
 * Increments the file server hit counter for each request, then passes to next handler.
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
  config.fileserverHits += 1;
  next();
}

/**
 * Express middleware that logs HTTP response information.
 *
 * @param req - Incoming HTTP request.
 * @param res - HTTP response object.
 * @param next - Function to pass control to the next middleware.
 * @returns void
 */
export function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.on("finish", () => {
    const status = res.statusCode;
    if (status >= 400) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${status}`);
    }
  });
  next();
}
