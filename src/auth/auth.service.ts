import { db } from "../db/database.js";
import * as bcrypt from "bcrypt";
import type { LoginUserType, NewUserType, UserDataType } from "./auth.types.js";
import { users, type UserRecord } from "../db/schema.js";
import { logger } from "../lib/logger.js";
import { eq } from "drizzle-orm";
import { AppError } from "../middleware/error.middleware.js";

export async function login(rawUser: LoginUserType) : Promise<UserDataType> {
  const [userRow] = await db
    .select()
    .from(users)
    .where(eq(users.email, rawUser.email));
  if (userRow === undefined) {
    throw new AppError(401, "Email not found");
  }
  const {passwordHash,...userRecord }= userRow;
  const valid = await verifyPassword(rawUser.password, passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }
  return userRecord;
}

export async function signup(user: NewUserType): Promise<UserDataType> {
  try {
    const passwordHash = await hashPassword(user.password);
    const newUserRecord = {
      name: user.name,
      email: user.email,
      passwordHash,
    };
    const [inserted] = await db
      .insert(users)
      .values(newUserRecord)
      .returning();

    if (!inserted) {
      throw new AppError(500, "Insert returned no row");
    }
    return inserted;
  } catch (err: any) {
    logger.error(err);
    throw err;
  }
}

function verifyPassword(
  password: string,
  storedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, storedPassword);
}

function hashPassword(password: string): Promise<string> {
  const SALT_ROUNDS = 12;
  return bcrypt.hash(password, SALT_ROUNDS);
}
