import { eq } from "drizzle-orm";
import { db } from "../db/database.js";
import { urls } from "../db/schema.js";
import env from "../lib/env.js";
import { AppError } from "../middleware/error.middleware.js";
import { logger } from "../lib/logger.js";

// This is the custom encoding Scheme to '000011' -> 3rd index -> 'c'
const mpDecode: Map<string, number> = new Map();

const ALPHABETS = env.ALPHABETS;
const BASE = ALPHABETS.length;

for (let i = 0; i < BASE; i++) {
  mpDecode.set(ALPHABETS.charAt(i), i);
}

export async function decodeHash(url: string): Promise<string | undefined> {
  let decodedIndex = 0;
  console.log(url);
  for (let i = 0; i < url.length; i++) {
    // console.log(url.charAt(i));
    const val = mpDecode.get(url.charAt(i));
    // console.log(val);
    if (val === undefined) {
      return;
    }
    decodedIndex *= BASE;
    decodedIndex += val;
  }

  const [result] = await db
    .select()
    .from(urls)
    .where(
      eq(urls.codeId,decodedIndex)
    ).limit(1);
  
  if(result===undefined){
    logger.warn({url,decodedIndex},"Requested short url does not exist");
    throw new AppError(404,"Bad request");
  }
  return result.originalUrl;
}
