import type { Request, Response } from "express";

/**
 * Express handler that reports the readiness status of the service.
 *
 * @param _req - Incoming HTTP request (unused for readiness checks).
 * @param res - HTTP response used to send readiness status.
 * @returns void
 */
export function handlerReadiness(_req: Request, res: Response): void {
  // #region agent log
  fetch("http://127.0.0.1:7249/ingest/b8ac420f-e1c6-4e93-8de6-ed12c7acddb8", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "4c5375",
    },
    body: JSON.stringify({
      sessionId: "4c5375",
      runId: "initial",
      hypothesisId: "H4",
      location: "src/app/api/readiness.ts:10",
      message: "handlerReadiness invoked",
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
