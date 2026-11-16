import type { Request, Response } from "express";
import { loginUserSchema, newUserSchema } from "./auth.types.js";
import * as authService from "./auth.service.js";
import { generateSessionCode } from "../lib/generateSessionCode.js";
import { addToRedis, removeFromRedis } from "../redis/session.redis.js";

export async function signup(req: Request, res: Response) {
  const rawUser = req.body;
  const parsedUser = newUserSchema.parse(rawUser);
  const user = await authService.signup(parsedUser);
  const sessionCode = generateSessionCode();
  await addToRedis(sessionCode, JSON.stringify(user));
  return res.cookie("sessionId", sessionCode).status(201).json(user);
}

export async function login(req: Request, res: Response) {
  const rawUser = req.body;
  const parsedUser = loginUserSchema.parse(rawUser);
  const user = await authService.login(parsedUser);
  const sessionCode = generateSessionCode();
  await addToRedis(sessionCode, JSON.stringify(user));
  return res.cookie("sessionId", sessionCode).status(200).json(user);
}

export async function logout(req: Request, res: Response) {
  if (req.cookies?.sessionId) await removeFromRedis(req.cookies.sessionId);
  return res.clearCookie("sessionId").status(200).json({ success: true });
}
