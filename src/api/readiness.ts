import type { Request, Response } from "express";
import { setPlainTextUtf8Header } from "./headers.js";

/**
 * Express handler that reports the readiness status of the service.
 *
 * @param _req - Incoming HTTP request (unused for readiness checks).
 * @param res - HTTP response used to send readiness status.
 * @returns void
 */
export function handlerReadiness(_req: Request, res: Response): void {
  setPlainTextUtf8Header(res);
  res.send("OK");
}
