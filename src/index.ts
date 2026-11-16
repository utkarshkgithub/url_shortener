import app from "./app.js";
import { checkDatabaseHealth, closeDatabase } from "./db/database.js";
import env from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { checkRedisHealth, initRedis, closeRedis } from "./redis/db.redis.js";

async function startServer() {
  const isDbReady = await checkDatabaseHealth();
  await initRedis();
  const isRedisReady = await checkRedisHealth();
  if (!isDbReady || !isRedisReady) {
    logger.warn("Server startup failed");
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info("Server has started");
  });

  let closing = false;
  const shutdown = async () => {
    if (closing) return;
    closing = true;
    server.close();
    await Promise.allSettled([closeRedis(), closeDatabase()]);
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();
