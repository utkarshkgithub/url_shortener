import { urls } from "../createUrl/createUrl.service.js";
import env from "../lib/env.js";

// This is the custom encoding Scheme to '000011' -> 3rd index -> 'c'
const mpDecode: Map<string, number> = new Map();

const ALPHABETS = env.ALPHABETS;
const BASE = ALPHABETS.length;

for (let i = 0; i < BASE; i++) {
  mpDecode.set(ALPHABETS.charAt(i), i);
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
