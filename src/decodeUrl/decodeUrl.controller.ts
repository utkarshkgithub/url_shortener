import type { Request, Response } from "express";
import { decodeHash } from "./decodeUrl.service.js";
import { logger } from "../lib/logger.js";
import { addToRedis, fetchFromRedis } from "../redis/session.redis.js";

export async function decodeUrl(
  req: Request<{ shortCode: string }>,
  res: Response,
) {
  const url: string = req.params.shortCode;

  //TODO: put the request header in the kafka

  let decodeUrl: string | null | undefined = await fetchFromRedis(url);
  if (!decodeUrl) {
    decodeUrl = await decodeHash(url);
    if (typeof decodeUrl === "string") await addToRedis(url, decodeUrl);
  }

  if (!decodeUrl) {
    return res.json({
      error: "requested url does not exist",
    });
  }
  logger.info({ url, decodeUrl });
  return res.redirect(301, decodeUrl);
}
