import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { sendJson } from "./headers.js";

/**
 * Extracts a safe error message from an unknown value.
 *
 * @param err - Caught error (may be Error or any value).
 * @returns Human-readable message string.
 */
function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Express error-handling middleware. Logs errors and sends a 500 JSON response.
 *
 * @param err - Caught error passed by Express.
 * @param _req - Express request (unused).
 * @param res - HTTP response.
 * @param _next - Required by Express error middleware signature (unused).
 * @returns void
 */
export function middlewareError(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const message = getErrorMessage(err);
  console.error("Error:", message);
  sendJson(res, 500, { error: "Something went wrong on our end" });
}

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
