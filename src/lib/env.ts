import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development","production"]),
  PORT: z.coerce.number().int(),
  ALPHABETS: z.string(),
  DB_URL: z.string(),
});

const env = envSchema.parse(process.env);
export default env;
