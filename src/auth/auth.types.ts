import { z } from "zod";

export const loginUserSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string(),
});

export const newUserSchema = loginUserSchema.extend({
  name: z.string(),
});

export const userDataSchema = z.object({
  userId: z.int(),
  name: z.string(),
  email: z.email().toLowerCase(),
})

export type NewUserType = z.infer<typeof newUserSchema>;
export type LoginUserType = z.infer<typeof loginUserSchema>;
export type UserDataType = z.infer<typeof userDataSchema>;
