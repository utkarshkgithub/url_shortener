import env from "../lib/env.js";
import { db } from "../db/database.js";
import { randomInt } from "crypto";
import { ticketCounter, urls } from "../db/schema.js";
import { and, eq, lt, sql } from "drizzle-orm";
import { AppError } from "../middleware/error.middleware.js";
import { logger } from "../lib/logger.js";

// export const urls: Map<number, string> = new Map();

const ALPHABETS = env.ALPHABETS;
const BASE = ALPHABETS.length;

let numRows = 10_000;

export async function createHash(url: string): Promise<string> {
  let numTries = 3;
  let index: undefined | number;
  while (index===undefined && numTries>0) {
    numTries--;
    index = await fetchIndex();
  }
  if (index===undefined) {
    logger.error("Range Intervals Exhausted");
    throw new AppError(500, "Range Intervals Exhausted");
  }

  let num = index;
  let encodedHash = "";
  while (num > 0) {
    encodedHash = ALPHABETS.charAt(num % BASE) + encodedHash;
    num = Math.floor(num / BASE);
  }

  encodedHash = encodedHash.padStart(3,ALPHABETS.charAt(0))

  await db
    .insert(urls)
    .values({codeId:index,originalUrl:url})
    
  return encodedHash;
}

async function fetchIndex(): Promise<number | undefined> {
  const rowId = randomInt(1,numRows+1);
  let [result] = await db
    .update(ticketCounter)
    .set({
      current: sql`${ticketCounter.current}+1`,
    })
    .where(
      and(
        eq(ticketCounter.ticketCounterId, rowId),
        lt(ticketCounter.current, ticketCounter.end),
      ),
    )
    .returning({
      current: ticketCounter.current,
    });

  return result?.current;
}

