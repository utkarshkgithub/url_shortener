import type { Request, Response } from "express";
import { decodeHash } from "./decodeUrl.service.js";

export async function decodeUrl(
  req: Request<{shortCode:string}>, 
  res: Response
) {
  const url: string = req.params.shortCode;

  //TODO: put the request header in the kafka

  const decodeUrl = await decodeHash(url);

  if(!decodeUrl){
    return res.json({
        error:"requested url does not exist"
    });
  }
  
  return res.redirect(301,decodeUrl);
}

