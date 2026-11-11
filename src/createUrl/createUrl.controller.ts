import type { Request, Response } from "express";
import { createHash } from "./createUrl.service.js";
import { createUrlSchema } from "./url.type.js";

export async function createUrl(req: Request, res: Response) {
  const rawUrl: string | undefined = req.body?.url;
  // console.log("url in createUrlBody is:",url)
  
  const {url}= createUrlSchema.parse(rawUrl);

  const encodedUrl = await createHash(url);
  // console.log(encodedUrl);
  return res.json({ url: encodedUrl });
}