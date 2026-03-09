import type { Response } from "express";

/**
 * Sets the response headers for plain UTF-8 encoded text.
 *
 * @param res - HTTP response whose headers will be modified.
 * @returns void
 */
export function setPlainTextUtf8Header(res: Response): void {
  res.set("Content-Type", "text/plain; charset=utf-8");
}
