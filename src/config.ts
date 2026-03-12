process.loadEnvFile();

/**
 * Configuration blueprint for API metrics state and environment.
 *
 * @property fileserverHits - Number of hits to the file server endpoint.
 * @property dbURL - PostgreSQL connection string from DB_URL env var.
 */
export type APIConfig = {
  fileserverHits: number;
  dbURL: string | undefined;
};

/**
 * In-memory API metrics state and loaded env config used while the server is running.
 */
export const config: APIConfig = {
  fileserverHits: 0,
  dbURL: process.env.DB_URL,
};
