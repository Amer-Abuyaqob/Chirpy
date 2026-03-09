/**
 * Configuration blueprint for API metrics state.
 *
 * @property fileserverHits - Number of hits to the file server endpoint.
 */
export type APIConfig = {
  fileserverHits: number;
};

/**
 * In-memory API metrics state used while the server is running.
 */
export const config: APIConfig = {
  fileserverHits: 0,
};
