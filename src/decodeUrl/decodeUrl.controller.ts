import type { Request, Response } from "express";
import { decodeHash } from "./decodeUrl.service.js";


export async function decodeUrl(req: Request, res: Response) {
  const url: string | undefined = req.body?.url;
  if(!url){
    return res.json({
        error:"url is missing in body"
    });
  }
  const decodeUrl = await decodeHash(url);
  // console.log("\n-------")
  // console.log(url,decodeUrl);
  // console.log("-------\n")
  if(!decodeUrl){
    return res.json({
        error:"requested url does not exist"
    });
  }
  // console.log(decodeUrl);
  return res.json({ url: decodeUrl });
}

