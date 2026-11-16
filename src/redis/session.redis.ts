import { logger } from "../lib/logger.js";
import { redisClient } from "./db.redis.js";

export async function addToRedis(key: string, val: string) {
  const redisTTL = 7 * 24 * 60 * 60;
  try {
    await redisClient.setEx(`session:${key}`, redisTTL, val);
  } catch (err) {
    logger.error(err, "store session failed:redis");
    throw err;
  }
}

export async function removeFromRedis(key: string) {
  try {
    await redisClient.del(`session:${key}`);
  } catch (err) {
    logger.error(err, "delete session failed:redis");
    throw err;
  }
}

export async function fetchFromRedis(key: string) {
  try {
    const val = await redisClient.get(`session:${key}`);
    return val;
  } catch (err) {
    logger.error(err, "fetch session failed:redis");
    throw err;
  }
}
