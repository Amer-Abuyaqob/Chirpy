import express from "express";
import { handlerMetrics } from "./api/metrics.js";
import { middlewareMetricsInc } from "./api/middleware.js";
import { handlerReadiness } from "./api/readiness.js";

const PORT = 8080;
const APP_STATIC_DIR = "./src/app";

/**
 * Creates and configures an Express application instance.
 *
 * @returns Configured Express application instance.
 */
export function createApp(): express.Express {
  const app = express();
  registerStaticAssets(app);
  registerReadinessEndpoint(app);
  registerMetricsEndpoint(app);
  return app;
}

/**
 * Registers the static assets route for the application UI.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerStaticAssets(app: express.Express): void {
  app.use("/app", middlewareMetricsInc);
  app.use("/app", express.static(APP_STATIC_DIR));
}

/**
 * Registers the readiness/health check endpoint.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerReadinessEndpoint(app: express.Express): void {
  app.get("/healthz", handlerReadiness);
}

/**
 * Registers the metrics endpoint.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerMetricsEndpoint(app: express.Express): void {
  app.get("/metrics", handlerMetrics);
}

/**
 * Application entry point that starts the HTTP server.
 *
 * @returns void
 */
export function main(): void {
  const app = createApp();

  app.listen(PORT, () => {
    // TODO: Replace console.log with a structured logger when logging is centralized.
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

main();
