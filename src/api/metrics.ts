import type { Request, Response } from "express";
import { config } from "../config.js";
import { setHTMLTextUtf8Header } from "./headers.js";

/**
 * Responds with the current file server hit count as HTML text.
 *
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @returns void
 */
export function handlerMetrics(_req: Request, res: Response): void {
  setHTMLTextUtf8Header(res);
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`);
}
