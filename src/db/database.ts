//pg postgres
import { Pool } from "pg"
import {drizzle} from "drizzle-orm/node-postgres"
import * as schema from "./schema.js"
import env from "../lib/env.js"

const pool = new Pool({
    connectionString: env.DB_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: env.NODE_ENV=="production" ? {
        rejectUnauthorized: true
    }: false,
})

export const db = drizzle(pool, {schema})

export async function closeDatabase() {
    await pool.end();
}