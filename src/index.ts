import app from "./app.js";
import { checkDatabaseHealth } from "./db/database.js";
import env from "./lib/env.js";
import { logger } from "./lib/logger.js";

async function startServer() {
  const isDbReady = await checkDatabaseHealth();
  if(!isDbReady){
    logger.warn("Server startup failed.")
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    logger.info("Server has started");
  });
}

startServer();