import type { Request, Response } from "express";

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

/**
 * Sets the response headers for plain UTF-8 encoded text.
 *
 * @param res - HTTP response whose headers will be modified.
 * @returns void
 */
function setPlainTextUtf8Header(res: Response): void {
  res.set("Content-Type", "text/plain; charset=utf-8");
}
