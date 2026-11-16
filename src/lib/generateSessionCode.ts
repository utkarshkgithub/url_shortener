import crypto, { randomBytes } from "crypto"

export function generateSessionCode(): string {
    const sessionCode = randomBytes(24).toString("base64url");
    return sessionCode; 
}