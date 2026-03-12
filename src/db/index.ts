import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config.js";
import * as schema from "./schema.js";

if (!config.dbURL) {
  throw new Error("DB_URL environment variable is required");
}

const conn = postgres(config.dbURL);

/**
 * Drizzle ORM database instance for running queries against PostgreSQL.
 */
export const db = drizzle(conn, { schema });
