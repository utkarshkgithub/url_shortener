//pg postgres
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import env from "../lib/env.js";
import { logger } from "../lib/logger.js";

export const pool = new Pool({
  connectionString: env.DB_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: env.DB_SSL
    ? {
        rejectUnauthorized: true,
      }
    : false,
});

export const db = drizzle(pool, { schema });

export async function closeDatabase() {
  await pool.end();
}

export async function checkDatabaseHealth() {
  try {
    await pool.query("SELECT 1");
    logger.info("Database health check success");
    return true;
  } catch (err) {
    logger.error(err, "Database health check Failed");
    return false;
  }
}
