import { Request, Response } from "express";
import { config } from "../config.js";
import { deleteAllUsers } from "../db/queries/users.js";
import { UserForbiddenError } from "./errors.js";
import { setPlainTextUtf8Header } from "./headers.js";

/**
 * Resets the database and file server metrics. Only allowed when PLATFORM=dev.
 * Deletes all users and resets the file server hit counter.
 *
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @returns Promise that resolves when reset completes.
 * @throws {UserForbiddenError} When PLATFORM is not "dev".
 */
export async function handlerReset(
  _req: Request,
  res: Response,
): Promise<void> {
  if (config.api.platform !== "dev") {
    throw new UserForbiddenError(
      "Reset endpoint is only available in development",
    );
  }
  await deleteAllUsers();
  config.api.fileServerHits = 0;
  setPlainTextUtf8Header(res);
  res.send("OK: File server hits been reset successfully");
}
