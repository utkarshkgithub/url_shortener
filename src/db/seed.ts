import { logger } from "../lib/logger.js";
import { db } from "./database.js";
import { sql } from "drizzle-orm";

export async function seedCounters() {
  logger.info("Checking ticket counter rows");
  await db.execute(sql`
    DO $$
    DECLARE
        total_rows INT := 10000;
        step_size INT := 214748;
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM ticket_counter LIMIT 1) THEN
            INSERT INTO ticket_counter (id, "end", current)
            SELECT 
                s.i,
                (s.i * step_size),
                ((s.i - 1) * step_size)
            FROM generate_series(1, total_rows) AS s(i);
        END IF;
    END $$;
  `);
  logger.info("Ticket counter rows ready");
}
