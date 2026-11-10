import env from "../lib/env.js";
import { db } from "../db/database.js";
import { randomInt } from "crypto";
import { ticketCounter } from "../db/schema.js";
import { and, eq, lt, sql } from "drizzle-orm";
import { AppError } from "../middleware/error.middleware.js";
import { logger } from "../lib/logger.js";

const urls: Map<number, string> = new Map();
const ALPHABETS = env.ALPHABETS;
// This is the custom encoding Scheme to '000011' -> 3rd index -> 'c'
const mpDecode: Map<string, number> = new Map();
let numRows = 10_000;

const BASE = ALPHABETS.length;

for (let i = 0; i < BASE; i++) {
  mpDecode.set(ALPHABETS.charAt(i), i);
}

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

  urls.set(index, url);
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
        eq(ticketCounter.id, rowId),
        lt(ticketCounter.current, ticketCounter.end),
      ),
    )
    .returning({
      current: ticketCounter.current,
    });

  return result?.current;
}

export function decodeHash(url: string): string | undefined {
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

  return urls.get(decodedIndex);
}
