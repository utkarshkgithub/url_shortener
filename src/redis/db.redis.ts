import { createClient } from "redis";
import env from "../lib/env.js";
import { logger } from "../lib/logger.js";

export const redisClient = createClient({
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
  socket: {
    host: env.REDIS_HOST,
    port: 13839,
  },
});

redisClient.on("error", (err) => logger.error(err, "Redis Client Error"));
redisClient.on("connect", () => logger.info("Redis socket connected"))
redisClient.on("ready", () => logger.info("Redis is connected"))

export async function initRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export async function closeRedis() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}

export async function checkRedisHealth() {
  try {
    const reply = await redisClient.ping();
    return reply==="PONG";
  } catch(err){
    logger.error(err,"Redis health check Failed");
    return false;
  }
}