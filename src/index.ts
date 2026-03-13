import express from "express";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { handlerRefresh, handlerRevoke } from "./api/auth.js";
import {
  handlerChirpsCreate,
  handlerChirpsGet,
  handlerChirpsList,
} from "./api/chirps.js";
import {
  handlerLogin,
  handlerUsersCreate,
  handlerUsersUpdate,
} from "./api/users.js";
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

/**
 * Runs pending database migrations before the application starts.
 *
 * @returns Promise that resolves when migrations complete.
 * @throws Propagates any error from the migration process.
 */
async function runMigrations(): Promise<void> {
  const migrationClient = postgres(config.db.url, { max: 1 });
  await migrate(drizzle(migrationClient), config.db.migrationConfig);
}

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
  registerChirpsEndpoint(app);
  registerUsersEndpoint(app);
  registerLoginEndpoint(app);
  registerAuthEndpoints(app);
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
  app.post(`${ADMIN_PREFIX}/reset`, (req, res, next) => {
    Promise.resolve()
      .then(() => handlerReset(req, res))
      .catch(next);
  });
}

/**
 * Registers the chirps endpoint.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerChirpsEndpoint(app: express.Express): void {
  app.get(`${API_PREFIX}/chirps/:chirpId`, (req, res, next) => {
    Promise.resolve()
      .then(() => handlerChirpsGet(req, res))
      .catch(next);
  });
  app.get(`${API_PREFIX}/chirps`, (req, res, next) => {
    Promise.resolve()
      .then(() => handlerChirpsList(req, res))
      .catch(next);
  });
  app.post(`${API_PREFIX}/chirps`, (req, res, next) => {
    Promise.resolve()
      .then(() => handlerChirpsCreate(req, res))
      .catch(next);
  });
}

/**
 * Registers the users endpoint.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerUsersEndpoint(app: express.Express): void {
  app.post(`${API_PREFIX}/users`, (req, res, next) => {
    Promise.resolve()
      .then(() => handlerUsersCreate(req, res))
      .catch(next);
  });
  app.put(`${API_PREFIX}/users`, (req, res, next) => {
    Promise.resolve()
      .then(() => handlerUsersUpdate(req, res))
      .catch(next);
  });
}

/**
 * Registers the login endpoint.
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerLoginEndpoint(app: express.Express): void {
  app.post(`${API_PREFIX}/login`, (req, res, next) => {
    Promise.resolve()
      .then(() => handlerLogin(req, res))
      .catch(next);
  });
}

/**
 * Registers the auth endpoints (refresh and revoke).
 *
 * @param app - Express application instance.
 * @returns void
 */
function registerAuthEndpoints(app: express.Express): void {
  app.post(`${API_PREFIX}/refresh`, (req, res, next) => {
    Promise.resolve()
      .then(() => handlerRefresh(req, res))
      .catch(next);
  });
  app.post(`${API_PREFIX}/revoke`, (req, res, next) => {
    Promise.resolve()
      .then(() => handlerRevoke(req, res))
      .catch(next);
  });
}

/**
 * Application entry point. Runs migrations, then starts the HTTP server.
 *
 * @returns Promise that resolves when the server is listening.
 */
export async function main(): Promise<void> {
  await runMigrations();
  const app = createApp();

  app.listen(config.api.port, () => {
    // TODO: Replace console.log with a structured logger when logging is centralized.
    console.log(`Server is running at http://localhost:${config.api.port}/app`);
  });
}

main().catch((e: unknown) => {
  const message = e instanceof Error ? e.message : String(e);
  console.error("Error:", message);
  process.exit(1);
});
