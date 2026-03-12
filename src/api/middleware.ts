import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";
import {
  BadRequestError,
  ConflictError,
  UserNotAuthenticatedError,
  UserForbiddenError,
  NotFoundError,
} from "./errors.js";

/**
 * Determines the appropriate HTTP status code for a given error.
 *
 * @param err - Error instance thrown by route handlers or middleware.
 * @returns HTTP status code corresponding to the error type.
 */
function getStatusOfError(err: unknown): number {
  if (err instanceof BadRequestError) {
    return 400;
  }
  if (err instanceof ConflictError) {
    return 409;
  }
  if (err instanceof UserNotAuthenticatedError) {
    return 401;
  }
  if (err instanceof UserForbiddenError) {
    return 403;
  }
  if (err instanceof NotFoundError) {
    return 404;
  }
  return 500;
}

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
 * Extracts the client-facing error message based on error type.
 *
 * For known custom errors, the original message is returned. For all other
 * errors, a generic message is used so that internal details are not exposed.
 *
 * @param err - Error instance thrown by route handlers or middleware.
 * @returns Message string that is safe to send to clients.
 */
function getClientErrorMessage(err: unknown): string {
  if (
    err instanceof BadRequestError ||
    err instanceof ConflictError ||
    err instanceof UserNotAuthenticatedError ||
    err instanceof UserForbiddenError ||
    err instanceof NotFoundError
  ) {
    return err.message;
  }

  return "Something went wrong on our end";
}

/**
 * Express error-handling middleware. Maps custom errors to appropriate status
 * codes, logs 5xx errors, and sends a JSON error response.
 *
 * Custom errors: BadRequestError→400, ConflictError→409,
 * UserNotAuthenticatedError→401, UserForbiddenError→403, NotFoundError→404.
 * Unknown errors→500.
 * Client message is the error's message for custom errors; otherwise generic.
 *
 * @param err - Caught error passed by Express.
 * @param _req - Express request (unused).
 * @param res - HTTP response.
 * @param _next - Required by Express error middleware signature (unused).
 * @returns void
 */
export function errorMiddleWare(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = getStatusOfError(err);
  const clientMessage = getClientErrorMessage(err);
  const logMessage = getErrorMessage(err);
  if (status >= 500) {
    console.error("Error:", logMessage);
  }
  respondWithError(res, status, clientMessage);
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
  config.api.fileServerHits += 1;
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
export function middlewareLogResponse(
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
