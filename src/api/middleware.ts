import type { NextFunction, Request, Response } from "express";

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
    // TODO: Add logging logic.
  });
  next();
}
