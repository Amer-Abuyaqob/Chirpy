import express from "express";
import { handlerChirpsValidate } from "./api/chirps.js";
import { config } from "./config.js";
import { handlerMetrics } from "./api/metrics.js";
import {
  errorMiddleWare,
  middlewareLogResponse,
  middlewareMetricsInc,
} from "./api/middleware.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerReset } from "./api/reset.js";

const APP_STATIC_DIR = "./src/app";
const APP_ROUTE = "/app";
const API_PREFIX = "/api";
const ADMIN_PREFIX = "/admin";

/**
 * Creates and configures an Express application instance.
 *
 * @returns Configured Express application instance.
 */
export function createApp(): express.Express {
  const app = express();
  app.use(middlewareLogResponse);
  app.use(express.json());
  registerStaticAssets(app);
  registerReadinessEndpoint(app);
  registerMetricsEndpoint(app);
  registerResetEndpoint(app);
  registerValidateChirpEndpoint(app);
  app.use(errorMiddleWare);
  return app;
}

/**
 * Registers the static assets route for the application UI.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerStaticAssets(app: express.Express): void {
  app.use(APP_ROUTE, middlewareMetricsInc);
  app.use(APP_ROUTE, express.static(APP_STATIC_DIR));
}

/**
 * Registers the readiness/health check endpoint.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerReadinessEndpoint(app: express.Express): void {
  app.get(`${API_PREFIX}/healthz`, handlerReadiness);
}

/**
 * Registers the metrics endpoint.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerMetricsEndpoint(app: express.Express): void {
  app.get(`${ADMIN_PREFIX}/metrics`, handlerMetrics);
}

/**
 * Registers the reset endpoint.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerResetEndpoint(app: express.Express): void {
  app.post(`${ADMIN_PREFIX}/reset`, handlerReset);
}

/**
 * Registers the chirp validation endpoint.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerValidateChirpEndpoint(app: express.Express): void {
  app.post(`${API_PREFIX}/validate_chirp`, (req, res, next) => {
    Promise.resolve()
      .then(() => handlerChirpsValidate(req, res))
      .catch(next);
  });
}

/**
 * Application entry point that starts the HTTP server.
 *
 * @returns void
 */
export function main(): void {
  const app = createApp();

  app.listen(config.api.port, () => {
    // TODO: Replace console.log with a structured logger when logging is centralized.
    console.log(`Server is running at http://localhost:${config.api.port}/app`);
  });
}

main();
