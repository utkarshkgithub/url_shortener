import { logger } from "../lib/logger.js";
import { redisClient } from "./db.redis.js";

export async function addToRedis(key: string, val: string) {
  const redisTTL = 6 * 60 * 60;
  try {
    await redisClient.setEx(`urls:${key}`, redisTTL, val);
  } catch (err) {
    logger.error(err, "store url failed:redis");
    throw err;
  }
}

export async function removeFromRedis(key: string) {
  try {
    await redisClient.del(`urls:${key}`);
  } catch (err) {
    logger.error(err, "delete url failed:redis");
    throw err;
  }
}

export async function fetchFromRedis(key: string) {
  try {
    const val = await redisClient.get(`urls:${key}`);
    return val;
  } catch (err) {
    logger.error(err, "fetch url failed:redis");
    throw err;
  }
}
