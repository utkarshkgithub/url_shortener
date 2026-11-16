import app from "./app.js";
import { checkDatabaseHealth } from "./db/database.js";
import env from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { checkRedisHealth, initRedis } from "./redis/db.redis.js";

async function startServer() {
  const isDbReady = await checkDatabaseHealth();
  await initRedis();
  const isRedisReady = await checkRedisHealth();
  if(!isDbReady || !isRedisReady){
    logger.warn("Server startup failed.")
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    logger.info("Server has started");
  });
}

startServer();