import type { Response } from "express";
import { setJsonUtf8Header } from "./headers";

/**
 * Sends a JSON response with the proper Content-Type.
 *
 * @param res - Express response.
 * @param status - HTTP status code.
 * @param payload - Object to serialize as JSON.
 * @returns void
 */
export function sendJson(res: Response, status: number, payload: object): void {
    setJsonUtf8Header(res);
    res.status(status).send(JSON.stringify(payload));
  }
  