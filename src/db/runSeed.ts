import { seedCounters } from "./seed.js";
import { pool } from "./database.js";
import { logger } from "../lib/logger.js";

async function main() {
    try {
        await seedCounters();
        logger.info("Database Seeded");
    } catch(err) {
        // logger.error(err,"Database Seeding Failed")
        throw err;
    } finally {
        await pool.end();
    }
}

main();