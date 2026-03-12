import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

/**
 * Reads an environment variable and throws if it is missing or empty.
 *
 * @param key - Name of the environment variable (e.g. "DB_URL").
 * @returns The variable's value.
 * @throws {Error} When the variable is not set or is an empty string.
 */
function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Database configuration.
 *
 * @property url - PostgreSQL connection string.
 * @property migrationConfig - Drizzle migration settings (folder, table, schema).
 */
export type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

/**
 * API configuration and in-memory metrics state.
 *
 * @property fileServerHits - Number of hits to the file server endpoint.
 * @property port - HTTP server port.
 */
export type APIConfig = {
  fileServerHits: number;
  port: number;
};

/**
 * Top-level application configuration.
 *
 * @property api - API config and runtime metrics.
 * @property db - Database connection and migration config.
 */
export type Config = {
  api: APIConfig;
  db: DBConfig;
};

/**
 * In-memory API metrics state and loaded env config used while the server is running.
 */
export const config: Config = {
  api: {
    fileServerHits: 0,
    port: Number(envOrThrow("PORT")),
  },
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: {
      migrationsFolder: "./drizzle",
    },
  },
};
