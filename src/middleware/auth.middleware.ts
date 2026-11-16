import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";
import { fetchFromRedis } from "../redis/session.redis.js";
import { userDataSchema, type UserDataType } from "../auth/auth.types.js";
import { logger } from "../lib/logger.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sessionId: string | undefined = req.cookies?.sessionId;
    if (sessionId === undefined) {
      throw new AppError(401, "Unauthenticated");
    }
    const result = await fetchFromRedis(sessionId);
    if (result === null) {
      throw new AppError(401, "session expired");
    }
    const user = userDataSchema.parse(JSON.parse(result));
    req.user = user;
    next();
  } catch (err) {
    logger.error("Auth Middleware Failed;");
    throw err;
  }
}
