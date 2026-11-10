import { db } from "./database.js";
import { sql } from "drizzle-orm";

export async function seedCounters() {
  console.log("Checking ticket counter rows...");
  await db.execute(sql`
    DO $$
    DECLARE
        total_rows INT := 10000;
        step_size INT := 214748;
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM ticket_counters LIMIT 1) THEN
            INSERT INTO ticket_counters (id, min_val, max_val, current_val)
            SELECT 
                s.i AS id,
                ((s.i - 1) * step_size + 1) AS min_val,
                CASE WHEN s.i = total_rows THEN 2147483647 ELSE (s.i * step_size) END AS max_val,
                ((s.i - 1) * step_size) AS current_val
            FROM generate_series(1, total_rows) AS s(i);
        END IF;
    END $$;
  `);
  console.log("Ticket counter rows ready.");
}
