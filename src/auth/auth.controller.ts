import type { Request, Response } from "express";
import { loginUserSchema, newUserSchema } from "./auth.types.js";
import * as authService from "./auth.service.js";

export async function signup(req: Request, res: Response) {
  const rawUser = req.body;
  const parsedUser = newUserSchema.parse(rawUser);
  const user= await authService.signup(parsedUser);
  return res.status(201).json(user);
}

export async function login(req: Request, res: Response) {
  const rawUser = req.body;
  const parsedUser = loginUserSchema.parse(rawUser);
  const user = await authService.login(parsedUser);
  return res.status(201).json(user);
}
