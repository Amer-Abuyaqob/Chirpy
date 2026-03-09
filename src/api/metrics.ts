import { Request, Response } from "express";
import { config } from "../config.js";

/**
 * Responds with the current file server hit count as plain text.
 *
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @returns void
 */
export function handlerMetrics(_req: Request, res: Response): void {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(`Hits: ${config.fileserverHits}`);
}
