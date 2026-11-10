import type { Request, Response } from "express";
import { createHash } from "./createUrl.service.js";

export async function createUrl(req: Request, res: Response) {
  const url: string | undefined = req.body?.url;
  // console.log("url in createUrlBody is:",url)
  if(!url){
    return res.json({
        error:"Url is missing/empty in the body"
    });
  }
  const encodedUrl = await createHash(url);
  // console.log(encodedUrl);
  return res.json({ url: encodedUrl });
}