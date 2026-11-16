import type { Request, Response } from "express";
import { createHash } from "./createUrl.service.js";
import { createUrlSchema } from "./url.type.js";
import type { UserDataType } from "../auth/auth.types.js";

export async function createUrl(req: Request, res: Response) {
  const url: string | undefined = req.body?.url;
  const user: UserDataType = req.user;
  const { url: parsedUrl } = createUrlSchema.parse({ url });

  const encodedUrl = await createHash(parsedUrl,user);
  return res.json({ url: encodedUrl });
}
