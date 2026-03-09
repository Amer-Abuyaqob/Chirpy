import type { Request, Response } from "express";
import { config } from "../config.js";
import { setPlainTextUtf8Header } from "./headers.js";

/**
 * Responds with the current file server hit count as plain text.
 *
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @returns void
 */
export function handlerMetrics(_req: Request, res: Response): void {
  setPlainTextUtf8Header(res);
  res.send(`Hits: ${config.fileserverHits}`);
}
